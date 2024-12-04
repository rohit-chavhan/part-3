require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

const Contact = require('./models/phone');

morgan.token('len', (req) => req.headers['content-length']);

morgan.token('body', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
);

morgan.token('status', (req, res) => res.statusCode);

app.use(morgan(':method :url :status :len :response-time ms :body'));

let phoneBook = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/', (request, response) => response.send('<h1>Hello world </h1>'));

app.get('/api/persons', (request, response) => {
  response.json(phoneBook);
  Contact.find({}).then((contacts) => {
    response.json(contacts);
  });
});

app.get('/info', (request, response) => {
  const totalNumber = phoneBook.length;
  const time = new Date();
  response.send(`
  <p>phoneBook has info for ${totalNumber} people</p>
  <br />
  <p>${time}</p>
    `);
});

app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id).then((personContact) =>
    response.json(personContact)
  );
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = phoneBook.filter((contact) => contact.id !== id);
  phoneBook = person;
  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  const same = phoneBook.filter((person) => person.name === body.name);

  if (same.length > 0) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = new Contact({
    name: body.name,
    number: body.number,
  });

  person.save().then((saveContact) => {
    console.log(typeof saveContact);
    response.json(saveContact);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`port listening on ${PORT} port`);
});
