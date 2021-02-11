/* global db print */
/* eslint no-restricted-globals: ["error", "event"] */

db.issues.remove({});
db.deleted_issues.remove({});

const issuesDB = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2019-01-15'),
    due: undefined,
    title: 'Error in console when clicking Add',
    description:
      'Steps to recreate the problem:' +
      '\n1. Refresh the browser.' +
      '\n2. Select "New" in the filter' +
      '\n3. Refresh the browser again. Note the warning in the console:' +
      '\n Warning: Hash history cannot PUSH the same path; a new entry' +
      '\n will not be added to the history stack' +
      '\n4. Click on Add.' +
      "\n5. There is an error in console, and add doesn't work.",
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2019-01-16'),
    due: new Date('2019-02-01'),
    title: 'Missing bottom border on panel',
    description:
      'There needs to be a border in the bottom in the panel' +
      ' that appears when clicking on Add',
  },
];

db.issues.insertMany(issuesDB);

const count = db.issues.count();
print('Inserted', count, 'issues.');

// Counter initialization.
db.counters.remove({ _id: 'issues' });
db.counters.insertOne({ _id: 'issues', current: count });

// Indexes.
db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ owner: 1 });
db.issues.createIndex({ created: 1 });

db.deleted_issues.createIndex({ id: 1 }, { unique: true });
