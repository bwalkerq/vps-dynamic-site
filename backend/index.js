const express = require('express')
const mongoose = require("mongoose");
require('dotenv').config()
const app = express()


const url = process.env.MONGODB_URI
if (!url) {
  console.log('MONGODB_URI not set')
  process.exit(1)
}

mongoose.set('strictQuery',false)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

app.use(express.json())

const neighborSchema = new mongoose.Schema({
  neighbor: { type: String, required: true },
  specialPower: { type: String, default: '' },
})
const Neighbor = mongoose.model('Neighbor', neighborSchema)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// GET /api/neighbors - return all neighbors
app.get('/api/neighbors', async (req, res) => {
  try {
    const neighbors = await Neighbor.find().lean()
    res.json(neighbors)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/neighbors - create a new neighbor (whitelist fields + validation)
app.post('/api/neighbors', async (req, res) => {
  try {
    const payload = req.body
    const newNeighbor = new Neighbor(payload)
    const saved = await newNeighbor.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate entry' })
    }
    res.status(500).json({ error: 'Server error' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log('Server running on port 3001'))

// let neighbors = [
//   {
//     // id: '1',
//     neighbor: 'Harrison',
//     specialPower: 'Lightspeed Warp',
//   },
//   {
//     // id: '2',
//     neighbor: 'Olie',
//     specialPower: 'Smile Factory',
//   },
//   {
//     // id: '3',
//     neighbor: 'Edna',
//     specialPower: 'Hydrant Speak',
//   },
//   {
//     // id: '4',
//     neighbor: 'Jessica',
//     specialPower: 'Baby Speak',
//   }
// ]
// neighbors = neighbors.map(neighbor => new Neighbor(neighbor))
//
// neighbors.forEach(neighbor => neighbor.save())

// assumes: express.json() is enabled, mongoose connected, and required modules imported
