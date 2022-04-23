const express = require("express")
const bodyParser = require("body-parser")
const sortArray = require('sort-array')
var crypto = require("crypto");
const Pool = require("pg").Pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sdfs",
  password: "",
  port: 5432,
})
const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())

const getGrid = async (req, res, next) => {
  var coords = [parseInt(req.params.x0), parseInt(req.params.xn), parseInt(req.params.y0), parseInt(req.params.yn)]
  pool.query("SELECT swx, swy FROM satellitemaps WHERE (swx >= "+coords[0]+" AND swx <= "+coords[1]+") "+
    "AND (swy >= "+coords[2]+" AND swy <= "+coords[3]+")", (error, result) => {
      if (error) {
        return res.status(500).send(error)
      }
      data = result.rows
      grid = toGeoJson(data, false)
      res.header("Access-Control-Allow-Origin", "*");
      return res.status(200).json(grid)
    })
}

const getSnapshot = async (req, res) => {
  var simulationId = req.params.id
  pool.query("SELECT swx, swy, fire, elapsedtime FROM simulatorsnapshots WHERE simulationid = 1", (error, result) => {
  //pool.query("SELECT swx, swy, fire, elapsedtime FROM simulatorsnapshots WHERE simulationid = "+simulationId, (error, result) => {
    if (error) {
      return res.status(500).send(error)
    }
    data = result.rows
    grid = toGeoJson(data, true)
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json(grid)
  })
}

const stopSimulation = async (req, res) => {
  var simulationId = req.body.simulationId
  pool.query(putRequest(simulationId, "stop"), (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).send(error)
    }
    return res.status(200).send("Simulation stopped")
  })
}

const startSimulation = async (req, res) => {
  var jsonInitState = req.body
  sortArray(jsonInitState.features, {
    by: 'id',
    computed: {
      id: row => row.properties.id
    }
  })

  var simulationId = crypto.randomInt(1000000)
  var swx = jsonInitState.features[0].geometry.coordinates[0][0][0]   // south-west point of Area of Interest
  var swy = jsonInitState.features[0].geometry.coordinates[0][0][1]
  var d = new Date
  var initialtime = [d.getMonth()+1,
             d.getDate(),
             d.getFullYear()].join("-")+" "+
            [d.getHours(),
             d.getMinutes(),
             d.getSeconds()].join(":");
  // xsize = xcoord_of_north-east_cell - xcoord_of_south-west_cell
  var xsize = jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][0] - swx
  var ysize = jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][1] - swy
  var placename = crypto.randomBytes(10).toString("hex")
  
  pool.connect((err, client, done) => {
    const shouldAbort = err => {
      if (err) {
        console.error('Error in transaction', err.stack)
        client.query('ROLLBACK', err => {
          if (err) {
            console.error('Error rolling back client', err.stack)
          }
          // release the client back to the pool
          done()
        })
      }
      return !!err
    }

    var simulations_values = "("+simulationId+", "+swx+", "+swy+", '"+initialtime+"', '"+placename+"', "+5+", "+5+", "+10+", "+0.1+", "+200+", "+10+")"
    simulations_sql = "INSERT INTO simulations (simulationid, swx, swy, initialtime, placename, xsize, ysize, cellsize, timestep, horizon, snapshottime) VALUES "
      +simulations_values+";"
    
    // Begin transaction
    client.query("BEGIN", error => {
      if (shouldAbort(error)) {
        return res.status(500).send(error)
      }

      client.query("DELETE * FROM requests", (error, result) => {
        if (shouldAbort(error)) {
          return res.status(500).send(error)
        }
        client.query("DELETE * FROM initialstate", (error, result) => {
          if (shouldAbort(error)) {
            return res.status(500).send(error)
          }
          client.query(simulations_sql, (error, result) => {
            if (shouldAbort(error)) {
              return res.status(500).send(error)
            }

            var initialstate_values = "("
            for (let i = 0; i < jsonInitState.features.length; i++) {
              if (i != 0) {
                initialstate_values += ", ("
              }
              initialstate_values += simulationId+","+
                                    jsonInitState.features[i].geometry.coordinates[0][0][0]+","+
                                    jsonInitState.features[i].geometry.coordinates[0][0][1]+","+
                                    jsonInitState.features[i].properties.fire+")"
            }
            initialstate_sql = "INSERT INTO initialstate (simulationid, swx, swy, fire) VALUES "+initialstate_values+";"
            client.query(initialstate_sql, (error, result) => {
              if (shouldAbort(error)) {
                return res.status(500).send(error)
              }

              client.query(putRequest(simulationId, "start"), (error, result) => {
                if (shouldAbort(error)) {
                  return res.status(500).send(error)
                }

                client.query("COMMIT", error => {
                  if (shouldAbort(error)) {
                    return res.status(500).send(error)
                  }
                  done()
                  return res.status(200).json(simulationId)
                })
              })
            })
          })
        })
      })
    })
  })
}

const getCoords = (request, response) => {
  pool.query("SELECT swx, swy FROM satellitemaps", (error, result) => {
    if (error) {
      return res.status(500).send(error)
    }
    console.log(result)
    return response.status(200).json(result.rows)
  })
}

const getRequests = (request, response) => {
  pool.query("SELECT * FROM requests", (error, result) => {
    if (error) {
      return res.status(500).send(error)
    }
    response.status(200).json(result.rows)
  })
}

function putRequest(simulationId, simcmd) {
  // simcmd should be either "start" or "stop"
  sql_query = "INSERT INTO requests (simulationid, simcmd) VALUES ("+simulationId+",'"+simcmd+"');"
  return sql_query
}

function toGeoJson(rows, isSnapshot) {
  var obj = {
    type: "FeatureCollection",
    "crs": { 
        "type": "name", 
        "properties": { "name": "EPSG:3035" }
      },
    features: []
  }
  for (i = 0; i < rows.length; i++) {
    var feature = {
      "type": "Feature",
      "properties": {"id": i, "fire": (isSnapshot ? rows[i].fire : 0), "elapsedtime": rows[i].elapsedtime},
      "geometry":{
        "type": "Polygon",
        "coordinates": []
      }
    }
    var x0 = parseInt(rows[i].swx)
    var y0 = parseInt(rows[i].swy)
    var coordinates = [[[x0,y0]]]
    coordinates[0].push([x0+10,y0])
    coordinates[0].push([x0+10,y0+10])
    coordinates[0].push([x0,y0+10])
    feature.geometry.coordinates = coordinates
    obj.features.push(feature)
  }
  return obj
} 

module.exports = {
  getRequests,
  getGrid,
  getCoords,
  getSnapshot,
  startSimulation,
  stopSimulation
}