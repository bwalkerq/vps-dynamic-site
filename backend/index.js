const express = require('express')
const mongoose = require("mongoose");
require('dotenv').config()
const app = express()


const url = process.env.MONGODB_URI
if (!url) {
  console.log('MONGODB_URI not set')
  process.exit(1)
}

const db_password = process.argv[2]

const url =
  `mongodb+srv://benjaminqwalker:${db_password}@cluster0.dfi3fzy.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

let neighbors = [
  {
    id: '1',
    name: 'Harrison',
    specialPower: 'Lightspeed Warp',
  },
  {
    id: '2',
    name: 'Olie',
    specialPower: 'Smile Factory',
  },
  {
    id: '3',
    name: 'Edna',
    specialPower: 'Hydrant Speak',
  },
  {
    id: '4',
    name: 'Jessica',
    specialPower: 'Baby Speak',
  }
]

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/neighbors', (req, res) => {
  res.json(neighbors)
})

const neighborSchema = new mongoose.Schema({
  neighbor: String,
  specialPower: String,
})

const Neighbor = mongoose.model('Neighbor', neighborSchema)

const neighbor = new Neighbor({
  neighbor: 'other neighb',
  specialPower: 'Lightspeed Warp',
})

neighbor.save().then(result => {
  console.log('neighbor saved!')
  mongoose.connection.close()
})

app.post('/api/neighbors', (req, res) => {
  const neighbor = req.body
  neighbor.id = String(neighbors.length + 1)
  neighbors = neighbors.concat(neighbor)
  res.json(neighbors)
})


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)