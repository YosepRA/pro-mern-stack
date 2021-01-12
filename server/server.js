const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const fs = require('fs');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const app = express();

let aboutMessage = 'Issue Tracker API v1.0';

// Database setup.
let db;
const url = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2bfif.mongodb.net/issue-tracker?retryWrites=true&w=majority`;

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
    let dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      let dateValue = new Date(ast.value);
      return isNaN(dateValue) ? undefined : dateValue;
    }
  },
});

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

function setAboutMessage(_, { message }) {
  return (aboutMessage = message);
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
  if (issue.status == 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

function issueAdd(_, { issue }) {
  validateIssue(issue);
  issue.id = issuesDB.length + 1;
  issue.created = new Date();
  if (issue.status == undefined) issue.status = 'New';

  issuesDB.push(issue);

  return issue;
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});
server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static('./public'));

(async function () {
  try {
    await connectToDB();
    app.listen(3000, console.log('App is listening on port 3000...'));
  } catch (err) {
    console.log('Error: ', err);
  }
})();
