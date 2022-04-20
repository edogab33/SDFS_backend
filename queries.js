const express = require('express')
const bodyParser = require('body-parser')
const { json } = require('body-parser')
const { response } = require('express')
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdfs',
  password: '',
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

function toGeoJson(rows) {
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
      "properties": {"id": i, "fire": 0},
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

const getGrid = async (req, res, next) => {
  var coords = [parseInt(req.params.x0), parseInt(req.params.xn), parseInt(req.params.y0), parseInt(req.params.yn)]
  pool.query('SELECT swx, swy FROM satellitemaps WHERE (swx >= '+coords[0]+' AND swx <= '+coords[1]+') '+
    'AND (swy >= '+coords[2]+' AND swy <= '+coords[3]+')', (error, result) => {
      data = result.rows
      grid = toGeoJson(data)
      res.header("Access-Control-Allow-Origin", "*");
      res.status(200).json(grid)
    })
    .catch(e => {
      res.status(500).send(e)
    })
}

const startSimulation = async (req, res) => {
  var jsonInitState = req.body
  console.log(jsonInitState)
  var simulationId = Math.floor(Math.random() * 100000000)
  var swx = jsonInitState.features[Math.ceil(jsonInitState.features.length / 2)].geometry.coordinates[0][0][0]
  var swy = jsonInitState.features[Math.ceil(jsonInitState.features.length / 2)].geometry.coordinates[0][0][1]
  var initialtime = Date.now()

  // TODO: parametrize xsize and ysize
  var simulations_values = '('+simulationId+','+swx+','+swy+','+initialtime+',Test'+','+5+','+5+','+10+','+0.1+','+200+','+10+')'
  simulations_sql = 'INSERT INTO simulations (simulationid, swx, swy, initialtime, placename, xsize, ysize, cellsize, timestep, horizon, snapshottime) '+
    +simulations_values+';'

  pool.query(simulations_sql).then((error, result) => {
    console.log(result)
  })
  .catch(e => {
    res.status(500).send(e)
  })

  var initialstate_values = '('
  for (let i = 0; i < jsonInitState.features.length; i++) {
    if (i != 0) {
      values += ', ('
    }
    initialstate_values += simulationId+','
    initialstate_values += jsonInitState.features[i].geometry.coordinates[0][0][0]+','
    initialstate_values += jsonInitState.features[i].geometry.coordinates[0][0][1]+','
    initialstate_values += jsonInitState.features[i].properties.fire+')'
  }
  initialstate_sql= 'INSERT INTO initialstate (simulationid, swx, swy, fire) VALUES '+initialstate_values+';'

  pool.query(initialstate_sql).then((error, result) => {
    console.log(result)
  })
  .catch(e => {
    res.status(500).send(e)
  })

  pool.query(putRequest(simulationId, "start")).then((error, result) => {
    console.log(result)
    res.status(200).data(simulationId)
  })
  .catch(e => {
    res.status(500).send(e)
  })
}

const getCoords = (request, response) => {
  pool.query('SELECT swx, swy FROM satellitemaps', (error, result) => {
    console.log(result)
    response.status(200).json(result.rows)
  })
  .catch(e => {
    res.status(500).send(e)
  })
}

const getRequests = (request, response) => {
  pool.query('SELECT * FROM requests', (error, result) => {
    response.status(200).json(result.rows)
  })
  .catch(e => {
    res.status(500).send(e)
  })
}

function putRequest(simulationId, simcmd) {
  // simcmd should be either "start" or "stop"
  // returns a Pool.query object
  sql_query = 'INSER INTO requests (simulationid, simcmd) VALUES '+simulationId+','+simcmd+';'
  return sql_query
}

function getSimulatorSnapshot(simulationId) {}

module.exports = {
  getRequests,
  getGrid,
  getCoords,
  startSimulation
}