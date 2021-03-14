require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');

const GraphQLDate = require('./graphql_date');
const { getMessage, setMessage } = require('./about');
const { list, add, get, update, remove, counts, restore } = require('./issue');
const auth = require('./auth');

const resolvers = {
  Query: {
    about: getMessage,
    issueList: list,
    issue: get,
    issueCounts: counts,
  },
  Mutation: {
    setAboutMessage: setMessage,
    issueAdd: add,
    issueUpdate: update,
    issueDelete: remove,
    issueRestore: restore,
  },
  GraphQLDate,
};

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers,
  context: getContext,
  formatError: error => {
    console.log(error);
    return error;
  },
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  let cors;
  if (enableCors) {
    const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
    const methods = 'POST';
    cors = { origin, methods, credentials: true };
  } else {
    cors = false;
  }

  server.applyMiddleware({
    app,
    path: '/graphql',
    cors,
  });
}

module.exports = { installHandler };
