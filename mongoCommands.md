### Mongo Commands

```
# C06.S01-mongodb-basics

show databases db show collections use issuetracker show collections

db.employees.insertOne({ name: { first: 'John', last: 'Doe' }, age: 44 }) db.employees.find() db.employees.find().pretty()

db.employees.insertOne({ name: { first: 'Jane', last: 'Doe' }, age: 54 })

let result = db.employees.find().toArray() result.forEach((e) => print('First Name:', e.name.first)) result.forEach((e) => printjson(e.name))

====================
```