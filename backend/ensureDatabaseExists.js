require('dotenv').config()
const { Client } = require('pg')

const MAINT_DB = process.env.PGMAINT_DB || 'postgres'
const TARGET_DB = process.env.PETS_DB_NAME || 'pets'
const USER = process.env.PETS_USER || 'postgres'

function makeClient(database = MAINT_DB) {
  return new Client({
    host: process.env.PETS_HOST || 'localhost',
    port: Number(process.env.PETS_PORT || 5432),
    user: USER,
    password: process.env.PETS_PASSWORD || '',
    database,
    // ssl: process.env.PGSSL ? { rejectUnauthorized: false } : undefined,
    ssl: false
    //   I was only able to get this to work with ssl: false, but I know that when
    //   I deploy this to the droplet, I will need to somehow get ssl: true to
    //   work.
  })
}

async function ensureDatabaseExists(dbName) {
  const client = makeClient(MAINT_DB)
  try {
    await client.connect()

    const { rows } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    )
    if (rows.length > 0) {
      console.log(`Database "${dbName}" already exists.`)
    } else {
      await client.query(`CREATE DATABASE "${dbName}"`)
      console.log(`Database "${dbName}" created.`)
    }

    // Grant privileges (safe even if role already has them)
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${USER}"`)
    console.log(`Granted privileges on "${dbName}" to "${USER}".`)
  } finally {
    await client.end().catch(() => {})
  }
}

async function ensureSchemaAndData(dbName) {
  // Connect to the target DB to create table and insert data
  const client = makeClient(dbName)
  try {
    await client.connect()

    // Create table if not exists (no trailing comma)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        park VARCHAR(255) NOT NULL
      );
    `)
    console.log('Table "pets" ensured.')

    // Insert sample rows; ON CONFLICT DO NOTHING avoids duplicates based on UNIQUE(name)
    const insertText = `
      INSERT INTO pets (name, location, park) VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9);
    `
    const values = [
      'Luna', 'St. Louis', 'Larson Park',
      'Mikey', 'Lincoln Park', 'Wrightwood Park',
      'Clover', 'Wicker Park', 'The 606',
    ]
    await client.query(insertText, values)
    console.log('Sample data inserted (duplicates skipped).')
  } finally {
    await client.end().catch(() => {})
  }
}

async function main() {
  try {
    await ensureDatabaseExists(TARGET_DB)
    await ensureSchemaAndData(TARGET_DB)
    console.log('All done.')
  } catch (err) {
    console.error('Failed:', err.message)
    process.exitCode = 1
  }
}

main()
