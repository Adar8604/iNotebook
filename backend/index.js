const connectToMongo=require('./db');
const { request } = require('express');
const express = require('express')
var cors = require('cors')

connectToMongo(); // connection of database

const app = express()
const port = 5000
app.use(cors())

app.use(express.json());
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
}) 