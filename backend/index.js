const express = require('express')
const mongoose = require("mongoose");
const {Client} = require('pg')
require('dotenv').config()
const app = express()

const url = process.env.NEIGHBORS_DB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

app.use(express.json())
const cors = require('cors')
app.use(cors()) // allow all origins (use cautiously in production)

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

// POST /api/neighbors - create a new neighbor (allowlisted fields plus validation)
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

function makeClient(database = process.env.PETS_DB_NAME || 'pets') {
  console.log('connecting to db:')
  return new Client({
    host: process.env.PETS_HOST || 'localhost',
    port: Number(process.env.PETS_PORT || 5432),
    user: process.env.PETS_USER || 'postgres',
    password: process.env.PETS_PASSWORD || '',
    database,
    ssl: false
  })
}

app.get('/api/pets', async (req, res) => {
  const client = makeClient()
  console.log('connected to db')
  try {
    await client.connect()
    const result = await client.query('SELECT * FROM pets')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({error: 'Database error'})
  } finally {
    await client.end()
  }
})

app.post('/api/pets', async (req, res) => {
  const client = makeClient()
  const {name, location, park} = req.body
  try {
    await client.connect()
    const result = await client.query(
      'INSERT INTO pets (name, location, park) VALUES ($1, $2, $3) RETURNING *',
      [name, location, park]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({error: 'Pet name already exists'})
    }
    res.status(500).json({error: 'Database error'})
  } finally {
    await client.end()
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
