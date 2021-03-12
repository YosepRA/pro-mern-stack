const { UserInputError } = require('apollo-server-express');

const { getDB, getNextSequence } = require('./db');
const { mustSignedIn } = require('./auth');

const PAGE_SIZE = 10;

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

async function list(_, { status, effortMin, effortMax, page, search }) {
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
  // Search filter.
  if (search) filter.$text = { $search: search };

  const cursor = await db
    .collection('issues')
    .find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE);

  const totalCount = await cursor.count(false);
  const issues = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);

  return { issues, pages };
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

/* The function will not delete the data right away, but put it in a recycle bin first for
later necessary data recovery. */
async function remove(_, { id }) {
  const db = getDB();
  const issue = await db.collection('issues').findOne({ id });
  if (!issue) return false;
  // Set today's time stamp for permanent deletion parameter.
  issue.deleted = new Date();
  // Insert to specific collection that acts as a recycle bin.
  let result = await db.collection('deleted_issues').insertOne(issue);
  if (result.insertedId) {
    // Remove from issues collection.
    result = await db.collection('issues').removeOne({ id });
    return result.deletedCount === 1;
  }

  return false;
}

async function counts(_, { status, effortMin, effortMax }) {
  const db = getDB();

  const filter = {};
  if (status) filter.status = status;
  if (effortMin !== undefined || effortMax !== undefined) {
    filter.$or = [{ effort: undefined }];
    const rangeFilter = { effort: {} };
    if (effortMin !== undefined) rangeFilter.effort.$gte = effortMin;
    if (effortMax !== undefined) rangeFilter.effort.$lte = effortMax;
    filter.$or.push(rangeFilter);
  }

  const results = await db
    .collection('issues')
    .aggregate([
      { $match: filter },
      {
        $group: {
          _id: { owner: '$owner', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const stats = {};
  results.forEach(result => {
    // eslint-disable-next-line no-underscore-dangle
    const { owner, status: statusKey } = result._id;
    if (!stats[owner]) stats[owner] = { owner };
    stats[owner][statusKey] = result.count;
  });

  return Object.values(stats);
}

// Basically a reverse of "remove" resolver function.
async function restore(_, { id }) {
  const db = getDB();
  const issue = await db.collection('deleted_issues').findOne({ id });
  if (!issue) return false;

  issue.deleted = new Date();

  let result = await db.collection('issues').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('deleted_issues').removeOne({ id });
    return result.deletedCount === 1;
  }

  return false;
}

module.exports = {
  list,
  get,
  add: mustSignedIn(add),
  update: mustSignedIn(update),
  remove: mustSignedIn(remove),
  counts,
  restore: mustSignedIn(restore),
};
