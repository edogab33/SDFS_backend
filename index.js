const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./queries')

const app = express()
const port = 4000

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/requests', db.getRequests)
app.get('/grid/:x0/:y0/:xn/:yn', db.getGrid)
app.get('/coords', db.getCoords)
app.get('/snapshot/:id', db.getSnapshot)
app.post('/start', db.startSimulation)

app.listen(port, () => {
    console.log('App running on port '+port)
})