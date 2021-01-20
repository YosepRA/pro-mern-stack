const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const fs = require('fs');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const app = express();

const port = process.env.API_SERVER_PORT || 3000;
let aboutMessage = 'Issue Tracker API v1.0';

// Database setup.
let db;
const url = process.env.MONGODB_URL;

async function connectToDB() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log('Connected to MongoDB...');
  db = client.db();
}

/* ====================================================================================== */

// Apollo server setup.
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date type in GraphQL scalar type.',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const dateValue = new Date(ast.value);
      return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
    }
    return undefined;
  },
});

function setAboutMessage(_, { message }) {
  aboutMessage = message;
  return aboutMessage;
}

async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

function validateIssue(issue) {
  const errors = [];
  if (issue.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
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

async function issueAdd(_, { issue }) {
  validateIssue(issue);

  const newIssue = Object.assign({}, issue);
  newIssue.id = await getNextSequence('issues');
  newIssue.created = new Date();
  // Create new issue.
  const result = await db.collection('issues').insertOne(newIssue);
  // Get the newly created issue.
  const savedIssue = await db
    .collection('issues')
    .findOne({ _id: result.insertedId });

  return savedIssue;
}

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers,
  formatError: (error) => {
    console.log(error);
    return error;
  },
});

const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
console.log('CORS setting:', enableCors);
server.applyMiddleware({ app, path: '/graphql', cors: enableCors });

/* ====================================================================================== */

// Initialization.
// prettier-ignore
(async function init() {
  try {
    await connectToDB();
    app.listen(port, console.log(`API server is listening on port ${port}...`));
  } catch (err) {
    console.log('Error: ', err);
  }
}());
