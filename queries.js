const express = require('express')
const bodyParser = require('body-parser')
const { json } = require('body-parser')
const { response } = require('express')
var crypto = require("crypto");
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
  console.log(jsonInitState.features)
  var simulationId = crypto.randomInt(1000000)
  var swx = jsonInitState.features[0].geometry.coordinates[0][0][0]   // south-west point of Area of Interest
  var swy = jsonInitState.features[0].geometry.coordinates[0][0][1]
  var initialtime = Date.now()

  // xsize = xcoord_of_north-east_cell - xcoord_of_south-west_cell
  var xsize = jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][0] - swx
  var ysize = jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0][0][1] - swy
  console.log(jsonInitState.features[0].geometry.coordinates[0])
  console.log(jsonInitState.features[jsonInitState.features.length - 1].geometry.coordinates[0])
  console.log(xsize)
  console.log(ysize)

  // Randomize placename
  var placename = crypto.randomBytes(10).toString('hex')

  // TODO: compute xsize and ysize
  var simulations_values = '('+simulationId+','+swx+','+swy+','+initialtime+','+placename+','+5+','+5+','+10+','+0.1+','+200+','+10+')'
  simulations_sql = 'INSERT INTO simulations (simulationid, swx, swy, initialtime, placename, xsize, ysize, cellsize, timestep, horizon, snapshottime) '+
    +simulations_values+';'

  pool.query(simulations_sql).then((error, result) => {
    console.log(result)
  })
  .catch(e => {
    res.status(500).send(e)
    return
  })

  var initialstate_values = '('
  for (let i = 0; i < jsonInitState.features.length; i++) {
    if (i != 0) {
      initialstate_values += ', ('
    }
    initialstate_values += simulationId+','
    initialstate_values += jsonInitState.features[i].geometry.coordinates[0][0][0]+','    // south-west coordinate of cell
    initialstate_values += jsonInitState.features[i].geometry.coordinates[0][0][1]+','
    initialstate_values += jsonInitState.features[i].properties.fire+')'
  }
  initialstate_sql= 'INSERT INTO initialstate (simulationid, swx, swy, fire) VALUES '+initialstate_values+';'

  pool.query(initialstate_sql).then((error, result) => {
    console.log(result)
  })
  .catch(e => {
    res.status(500).send(e)
    return
  })

  pool.query(putRequest(simulationId, "start")).then((error, result) => {
    console.log(result)
    res.status(200).data(simulationId)
    return
  })
  .catch(e => {
    res.status(500).send(e)
    return
  })
}

const getCoords = (request, response) => {
  pool.query('SELECT swx, swy FROM satellitemaps', (error, result) => {
    console.log(result)
    response.status(200).json(result.rows)
  })
  .catch(e => {
    res.status(500).send(e)
    return
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