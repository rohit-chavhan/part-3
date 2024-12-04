import { set, connect, Schema, model } from 'mongoose';

set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

connect(url)
  .then((result) => {
    console.log('connected to Mongodb');
  })
  .catch((err) => console.log(`error connecting to Mongodb:`, err.message));

const contactSchema = new Schema({
  name: String,
  number: Number,
});

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default model('Contact', contactSchema);
