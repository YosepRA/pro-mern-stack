require('dotenv').config();
const express = require('express');

const { installHandler } = require('./api_handler');
const { connectToDB } = require('./db');
const auth = require('./auth');

const app = express();

app.use('/auth', auth.routes);

const port = process.env.API_SERVER_PORT || 3000;

// GraphQL init.
installHandler(app);

// Server init.
// prettier-ignore
(async function init() {
  try {
    await connectToDB();
    app.listen(port, console.log(`API server is listening on port ${port}...`));
  } catch (err) {
    console.log('Error: ', err);
  }
}());
