const fs = require('fs');

var coordinates = [4559505, 2121005]           // south-west coordinates
var fire_coords = [[4559505, 2121005]]         // coordinates of the cells where the fire should be
var xsize = 10
var ysize = 10
var cellsize = 10

var rows = []
for (let i = 0; i < xsize; i++) {
  for (let j = 0; j < ysize; j++) {
    rows.push({swx: coordinates[0]+cellsize*i, swy: coordinates[1]+cellsize*j})
  }
}

var grid = toGeoJson(rows)

fs.writeFile("./grid.json", JSON.stringify(grid), err => {
  if (err) {
    console.error(err)
    return
  }
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
      "properties": {"id": i, "fire": isIn([rows[i].swx, rows[i].swy], fire_coords) ? 1 : 0, "elapsedminutes": 0},
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

function isIn(tocheck_coords, fire_coords) {
  for (let x of fire_coords) {
    if (JSON.stringify(x) === JSON.stringify(tocheck_coords)) {
      return true
    }
  }
  return false
}