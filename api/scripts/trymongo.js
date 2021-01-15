const { MongoClient } = require('mongodb');

require('dotenv').config();

const url = process.env.MONGODB_URL;

function testWithCallback(callback) {
  console.log('=== testWithCallback ===');

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err, client) => {
    if (err) {
      callback(err);
      return;
    }

    const db = client.db();
    const collection = db.collection('employees');

    const employee = { id: 1, name: 'A. Callback', age: 23 };
    collection.insertOne(employee, (err, result) => {
      if (err) {
        client.close();
        callback(err);
        return;
      }

      console.log('Result of insert: ', result.insertedId);
      collection.find({ _id: result.insertedId }).toArray((err, docs) => {
        if (err) {
          client.close();
          callback(err);
          return;
        }

        console.log('Result of find: ', docs);
        client.close();
        callback(err);
      });
    });
  });
}

async function testWithAsync() {
  console.log('=== testWithAsync ===');
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('employees');

    const employee = { id: 2, name: 'B. Async', age: 16 };
    const result = await collection.insertOne(employee);
    console.log('Result of insert: ', result.insertedId);

    const docs = await collection.find({ _id: result.insertedId }).toArray();
    console.log('Result of find: ', docs);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallback(err => {
  if (err) {
    console.log(err);
  }

  testWithAsync();
});
