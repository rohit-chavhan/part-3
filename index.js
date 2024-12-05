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

app.get('/', (request, response) => response.send('<h1>Hello world </h1>'))

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

app.delete('/api/persons/:id', (request, response) => {
  console.log('deleted')

  Contact.findByIdAndDelete(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

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

  Contact.find({}).then((res) => {
    let value = res.filter((obj) => obj.name === body.name)
    console.log(value)

    if (value.length > 0) {
      const person = {
        name: value[0].name,
        number: body.number,
      }
      Contact.findByIdAndUpdate(value[0].id, person, { new: true })
        .then((updateContact) => response.json(updateContact))
        .catch((error) => next(error))
    } else {
      const person = new Contact({
        name: body.name,
        number: body.number,
      })

      person.save().then((saveContact) => {
        response.json(saveContact)
      })
    }
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown Endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message, error.name, 'ursrttd')

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`port listening on ${PORT} port`))
