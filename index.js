require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

const Contact = require('./models/phone')

morgan.token('len', (req) => req.headers['content-length'])

morgan.token('body', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
)

morgan.token('status', (req, res) => res.statusCode)

app.use(morgan(':method :url :status :len :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Contact.find({}).then((contacts) => {
    response.json(contacts)
  })
})

app.get('/info', (request, response) => {
  Contact.find({}).then((contacts) => {
    const time = new Date()
    response.send(`
      <p>phoneBook has info for ${contacts.length} people</p>
      <br />
      <p>${time}</p>
        `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then((personContact) => {
      if (personContact) {
        response.json(personContact)
      } else {
        response.status(400).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  })

  contact
    .save()
    .then((saveContact) => response.json(saveContact))
    .catch((err) => {
      next(err)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then((updateCont) => response.json(updateCont))
    .catch((err) => next(err))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown Endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: `${error}` })
  }
  return response.status(500).end()
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`port listening on ${PORT} port`))
