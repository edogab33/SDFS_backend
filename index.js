const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./queries')
const path = require('path')

const app = express()
const port = 4000

//var corsOptions = {
//    origin: 'http://localhost:3000',
//    optionsSuccessStatus: 200
//}

//app.use(cors(corsOptions))
app.use(cors());
app.use(bodyParser.json({limit: '180mb'}))
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '180mb'
  })
)

app.use(express.static(path.join(__dirname, "dist")))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

app.get('/', (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/requests', db.getRequests)
app.get('/grid/:x0/:y0/:xn/:yn', db.getGrid)
app.get('/coords', db.getCoords)
app.get('/snapshot/:id/:elapsedminutes/:snapshottime', db.getSnapshot)
app.post('/start', db.startSimulation)
app.post('/stop', db.stopSimulation)

app.listen(port, () => {
    console.log('App running on port '+port)
})