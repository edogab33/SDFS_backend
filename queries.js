const express = require("express")
const bodyParser = require("body-parser")
const sortArray = require('sort-array')
const crypto = require("crypto");
const Pool = require("pg").Pool
const compression = require('compression')

const env = 'dev'
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

app.use(compression())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())

const getGrid = async (req, res, next) => {
  console.log("getGrid()")
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
  var snapshottime = req.params.snapshottime
  var query = "SELECT swx, swy, fire, elapsedminutes FROM simulatorsnapshots WHERE (simulationid = "+simulationId+") AND "
            + "(elapsedminutes <= "+elapsedminutes+") AND (elapsedminutes > "+(elapsedminutes-snapshottime)+");"

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
  var horizon = req.body.horizon
  var snapshottime = req.body.snapshottime
  var simulationId = Math.floor(100000000 + Math.random() * 900000000);   // 9 digits random id
  var d = new Date
  var initialtime = [d.getFullYear(),
             d.getMonth()+1,
             d.getDate()].join("-")+" "+
            [d.getHours(),
             d.getMinutes(),
             d.getSeconds()].join(":");
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

    var maxcoords_sql = "SELECT swx, swy FROM initialstate WHERE swx = (SELECT MAX(swx) FROM initialstate) "
                                                          +"AND swy = (SELECT MAX(swy) FROM initialstate)"
    var mincoords_sql = "SELECT swx, swy FROM initialstate WHERE swx = (SELECT MIN(swx) FROM initialstate) "
                                                          +"AND swy = (SELECT MIN(swy) FROM initialstate)"

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

    // Begin transaction
    client.query("BEGIN", error => {
      if (shouldAbort(error)) {
        console.log(error)
        return res.status(500).send(error)
      }

      client.query("SELECT * FROM initialstate", (error, result) => {
        if (shouldAbort(error)) {
          console.log(error)
          return res.status(500).send(error)
        }
        if (result.rows.length > 0) {
          let e = "Table initialstate is still full."
          console.log(e)
          return res.status(500).send(e)
        }

        client.query(initialstate_sql, (error, result) => {
          if (shouldAbort(error)) {
            console.log(error)
            return res.status(500).send(error)
          }

          client.query(maxcoords_sql, (error, result) => {
            if (shouldAbort(error)) {
              console.log(error)
              return res.status(500).send(error)
            }
            let maxswx = result.rows[0].swx
            let maxswy = result.rows[0].swy

            client.query(mincoords_sql, (error, result) => {
              if (shouldAbort(error)) {
                  console.log(error)
                return res.status(500).send(error)
              }

              var minswx = result.rows[0].swx
              var minswy = result.rows[0].swy
              var xsize = 1 + ((maxswx - minswx) / 10)
              var ysize = 1 + ((maxswy - minswy) / 10)
              
              console.log(xsize)
              console.log(ysize)

              console.log(minswx)
              console.log(maxswx)
              console.log(minswy)
              console.log(maxswy)

              if (xsize < 0 || ysize < 0) {
                let err = "Size of the grid is less then 0."
                console.error(err)
                return res.status(500).send(err)
              }

              client.query("SELECT * FROM requests", (error, result) => {
                if (shouldAbort(error)) {
                  console.log(error)
                  return res.status(500).send(error)
                }
                if (result.rows.length > 0) {
                  let e = "Table Requests is still full."
                  console.log(e)
                  return res.status(500).send(e)
                } else {
                  var simulations_values = "("+simulationId+", "+minswx+", "+minswy+", '"+initialtime+"', '"+placename+"', "+xsize+", "+ysize+", "+10+", "+0.1+", "+horizon+", "+snapshottime+")"
                  var simulations_sql = "INSERT INTO simulations (simulationid, swx, swy, initialtime, placename, xsize, ysize, cellsize, timestep, horizon, snapshottime) VALUES "
                    +simulations_values+";"
                  console.log(simulations_sql)

                  client.query(simulations_sql, (error, result) => {
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
                }
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