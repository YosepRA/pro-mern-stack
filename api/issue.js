const { UserInputError } = require('apollo-server-express');

const { getDB, getNextSequence } = require('./db');

async function list() {
  const db = getDB();
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

function validate(issue) {
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

async function add(_, { issue }) {
  validate(issue);

  const db = getDB();

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

module.exports = { list, add };
