const express = require("express")
const bodyParser = require("body-parser")
const sortArray = require('sort-array')
var crypto = require("crypto");
const Pool = require("pg").Pool

const env = 'prod'
var pool
var maps

if (env == 'local') {
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "sdfs",
    password: "",
    port: 5432,
  })

  maps = 'satellitemaps'
} else {
  pool = new Pool({
    user: "sdfs",
    host: "localhost",
    database: "sdfs",
    password: "123456",
    port: 5432,
  })

  maps = 'cartanatura'
}

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
  pool.query("SELECT swx, swy FROM "+maps+" WHERE (swx >= "+coords[0]+" AND swx <= "+coords[1]+") "+
    "AND (swy >= "+coords[2]+" AND swy <= "+coords[3]+")", (error, result) => {
      if (error) {
        console.error(error)
        return res.status(500).json(error)
      }
      data = result.rows
      if (data.length > 0) {
        grid = toGeoJson(data, false)
        return res.status(200).json(grid)
      } else {
        pool.query("SELECT swx, swy FROM "+maps+" WHERE (swx >= "+coords[1]+" AND swx <= "+coords[0]+") "+
          "AND (swy >= "+coords[3]+" AND swy <= "+coords[2]+")", (error, result) => {
            if (error) {
              console.error(error)
              return res.status(500).json(error)
            }
            data = result.rows
            grid = toGeoJson(data, false)
            return res.status(200).json(grid)
          })
      }
    })
}

const getSnapshot = async (req, res) => {
  var simulationId = req.params.id
  var elapsedminutes = req.params.elapsedminutes
  var query = "SELECT swx, swy, fire, elapsedminutes FROM simulatorsnapshots WHERE (simulationid = "+simulationId+") AND "
            + "(elapsedminutes <= "+elapsedminutes+") AND (elapsedminutes > "+(elapsedminutes-10)+");"

  pool.query(query, (error, result) => {
    if (error) {
      console.error(error)
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
  var initialtime = [d.getFullYear(),
             d.getMonth()+1,
             d.getDate()].join("-")+" "+
            [d.getHours(),
             d.getMinutes(),
             d.getSeconds()].join(":");
  console.log(initialtime)
  // xsize = xcoord_of_north-east_cell - xcoord_of_south-west_cell
  var xsize = Math.floor((jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][0] - swx) / 10) + 1
  var ysize = Math.floor((jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][1] - swy) / 10) + 1
  var placename = crypto.randomBytes(10).toString("hex")
  var horizon = jsonInitState.horizon

  console.log(xsize)
  console.log(ysize)
  
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

    var simulations_values = "("+simulationId+", "+swx+", "+swy+", '"+initialtime+"', '"+placename+"', "+xsize+", "+ysize+", "+10+", "+0.1+", "+horizon+", "+10+")"
    var simulations_sql = "INSERT INTO simulations (simulationid, swx, swy, initialtime, placename, xsize, ysize, cellsize, timestep, horizon, snapshottime) VALUES "
      +simulations_values+";"
    
    console.log(simulations_sql)

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
    console.log(initialstate_sql)

    // Begin transaction
    client.query("BEGIN", error => {
      if (shouldAbort(error)) {
        console.log(error)
        return res.status(500).send(error)
      }

      client.query("DELETE FROM requests", (error, result) => {
        if (shouldAbort(error)) {
          console.log(error)
          return res.status(500).send(error)
        }

        client.query("DELETE FROM initialstate", (error, result) => {
          if (shouldAbort(error)) {
            console.log(error)
            return res.status(500).send(error)
          }

          client.query(simulations_sql, (error, result) => {
            if (shouldAbort(error)) {
              console.log(error)
              return res.status(500).send(error)
            }

            client.query(initialstate_sql, (error, result) => {
              if (shouldAbort(error)) {
                console.log(error)
                return res.status(500).send(error)
              }

              client.query(putRequest(simulationId, "start"), (error, result) => {
                if (shouldAbort(error)) {
                  console.log(error)
                  return res.status(500).send(error)
                }

                client.query("COMMIT", error => {
                  if (shouldAbort(error)) {
                    console.log(error)
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
      "properties": {"id": i, "fire": (isSnapshot ? rows[i].fire : 0), "elapsedminutes": rows[i].elapsedminutes},
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