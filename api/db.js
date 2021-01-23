require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;

async function connectToDB() {
  const url = process.env.MONGODB_URL;
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log('Connected to MongoDB...');
  db = client.db();
}

async function getNextSequence(name) {
  const result = await db
    .collection('counters')
    .findOneAndUpdate(
      { _id: name },
      { $inc: { current: 1 } },
      { returnOriginal: false }
    );

  return result.value.current;
}

function getDB() {
  return db;
}

module.exports = { connectToDB, getNextSequence, getDB };
