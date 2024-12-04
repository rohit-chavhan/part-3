if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

if (process.argv.length === 3) {
  Contact.find({}).then((res) => {
    console.log('phonebook:');
    res.forEach((obj) => console.log(`${obj.name} ${obj.number}`));
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  let value = process.argv;
  const contact = new Contact({
    name: value[3],
    number: value[4],
  });
  contact.save().then((res) => {
    console.log(`added ${res.name} number ${res.number} to phonebook`);
    mongoose.connection.close();
  });
}
