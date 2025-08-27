const express = require('express')
const mongoose = require("mongoose");
const app = express()

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

app.post('/api/neighbors', (req, res) => {
  const neighbor = req.body
  neighbor.id = String(neighbors.length + 1)
  neighbors = neighbors.concat(neighbor)
  res.json(neighbors)
})


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)