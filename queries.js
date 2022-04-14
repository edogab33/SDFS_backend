const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdfs',
  password: '',
  port: 5432,
})

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
      "properties": {"region": i},
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
      if (error) {
        res.status(500).send(error)
      }
      data = result.rows
      grid = toGeoJson(data)
      res.header("Access-Control-Allow-Origin", "*");
      res.status(200).json(grid)
    })
}

const startSimulation = async (req, res) => {
  initialState = req.body.initialState
  console.log(initialState)
  res.status(200)
}

const getCoords = (request, response) => {
  pool.query('SELECT swx, swy FROM satellitemaps', (error, result) => {
    if (error) {
      response.status(500).send(error)
    }
    console.log(result)
    response.status(200).json(result.rows)
  })
}

const getRequests = (request, response) => {
  pool.query('SELECT * FROM requests', (error, result) => {
    if (error) {
      res.status(500).send(error)
    }
    response.status(200).json(result.rows)
  })
}

module.exports = {
  getRequests,
  getGrid,
  getCoords,
  startSimulation
}