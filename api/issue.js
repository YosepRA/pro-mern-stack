const { UserInputError } = require('apollo-server-express');

const { getDB, getNextSequence } = require('./db');

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

async function list(_, { status, effortMin, effortMax }) {
  const db = getDB();
  // Fill up the filter along the way.
  const filter = {};
  // Status filter.
  if (status) filter.status = status;
  // Effort filter.
  if (effortMin !== undefined || effortMax !== undefined) {
    // Undefined effort field will always get returned.
    filter.$or = [{ effort: undefined }];
    const rangeFilter = { effort: {} };
    // Range filters.
    if (effortMin !== undefined) rangeFilter.effort.$gte = effortMin;
    if (effortMax !== undefined) rangeFilter.effort.$lte = effortMax;
    filter.$or.push(rangeFilter);
  }
  const issues = await db.collection('issues').find(filter).toArray();
  return issues;
}

async function get(_, { id }) {
  const db = getDB();
  const issue = await db.collection('issues').findOne({ id });
  return issue;
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

async function update(_, { id, changes }) {
  const db = getDB();

  /* Changes in title, status, or owner may lead to invalid data, therefore it's necessary
  to revalidate the incoming issue object again. */
  if (changes.title || changes.status || changes.owner) {
    const issue = await db.collection('issues').findOne({ id });
    Object.assign(issue, changes);
    validate(issue);
  }

  await db.collection('issues').updateOne({ id }, { $set: changes });
  const savedIssue = await db.collection('issues').findOne({ id });

  return savedIssue;
}

module.exports = { list, get, add, update };
