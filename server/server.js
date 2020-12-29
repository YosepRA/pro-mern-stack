const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const app = express();

let aboutMessage = 'Issue Tracker API v1.0';

// Apollo server setup.
const typeDefs = `
  type Query {
    about: String!
  }

  type Mutation {
    setAboutMessage(message: String!): String
  }
`;
const resolvers = {
  Query: {
    about: () => aboutMessage,
  },
  Mutation: {
    setAboutMessage: (_, { message }) => (aboutMessage = message),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static('./public'));

app.listen(3000, () => console.log('App is listening on port 3000...'));
