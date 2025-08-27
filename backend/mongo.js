const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const db_password = process.argv[2]

const url =
  `mongodb+srv://benjaminqwalker:${db_password}@cluster0.dfi3fzy.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'this is testing during capstone, go vps go',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})