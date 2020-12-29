const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');
const { GraphQLScalarType } = require('graphql');

const app = express();

let aboutMessage = 'Issue Tracker API v1.0';
const issuesDB = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2019-01-15'),
    due: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2019-01-16'),
    due: new Date('2019-02-01'),
    title: 'Missing bottom border on panel',
  },
];

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date type in GraphQL scalar type.',
  serialize(value) {
    return value.toISOString();
  },
});

// Apollo server setup.
const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return (aboutMessage = message);
}

function issueList() {
  return issuesDB;
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
});
server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static('./public'));

app.listen(3000, () => console.log('App is listening on port 3000...'));
