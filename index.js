const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

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

app.get('/api/persons', (request, response) => {
  response.json(phoneBook);
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
  const id = request.params.id;

  const person = phoneBook.find((contact) => contact.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const random =
    Math.floor(Math.random() * (phoneBook.length * 3)) + phoneBook.length;
  return random;
};

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = phoneBook.filter((contact) => contact.id !== id);
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

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  phoneBook = phoneBook.concat(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`port listening on ${PORT} port`);
});
