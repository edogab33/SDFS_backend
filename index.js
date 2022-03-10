const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./queries')

const app = express()
const port = 3000

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
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/requests', db.getRequests)
app.get('/grid/:num', db.getGrid)

app.listen(port, () => {
    console.log('App running on port '+port)
})