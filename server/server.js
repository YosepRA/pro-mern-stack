const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');

const app = express();

let aboutMessage = 'Issue Tracker API v1.0';

// Apollo server setup.
const resolvers = {
  Query: {
    about: () => aboutMessage,
  },
  Mutation: {
    setAboutMessage: (_, { message }) => (aboutMessage = message),
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
});
server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static('./public'));

app.listen(3000, () => console.log('App is listening on port 3000...'));
