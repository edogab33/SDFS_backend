const { execFile } = require('child_process')
var async = require("async");
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdfs',
  password: '',
  port: 5432,
})

// too slow, a converted coords table in the DB might be needed in the future

// TODO: this method has to return {(x1,y1), x2,y2} where x2,y2 = x1+m, y1+m
const getGrid = async (req, res, next) => {
  const num = parseInt(req.params.num)
  var x, y, dataToSend = []
  pool.query('SELECT swx, swy FROM satellitemaps LIMIT '+num, (error, result) => {
    if (error) {
      res.status(500).send(error)
    }
    data = result.rows
    async.each(data, function (coords, callback) {
      const py = execFile('python3.8', ['coords_converter.py', coords.swx, coords.swy, 'T'], (error, stdout, stderr) => {
        if (error) {
          res.status(500).send(error)
        }
        stdout = stdout.replace(",", "")
        x = stdout.substring(0, stdout.indexOf(" "))
        y = stdout.substring(stdout.indexOf(" ")+1, stdout.length)
        dataToSend.push({lat: y, lng: x}) // output of py script is reverted
        callback(error) // ??
      })
    }, (err) => {
      if (err) {
          res.status(500).send(error)
      }
      //console.log(dataToSend)
      res.status(200).json(dataToSend)
    })
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
  getGrid
}