const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const server = express();
// const mongoose = require('mongoose');
//mongoose.connect('mongodb://arc_hive_admin:arc hive 555@ds013475.mlab.com:13475/arc_hive_testdb', {useMongoClient: true});
//mongodb://<dbuser>:<dbpassword>@ds013475.mlab.com:13475/arc_hive_testdb
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb://arc_hive_admin:arc hive 555@ds013475.mlab.com:13475/arc_hive_testdb';

MongoClient.connect(MONGO_URL, (err, db) => {  
  if (err) {
    return console.log(err);
  }

  // Do something with db here, like inserting a record
  db.collection('notes').insertOne(
    {
      title: 'Hello MongoDB',
      text: 'Hopefully this works!'
    },
    function (err, res) {
      if (err) {
        db.close();
        return console.log(err);
      }
      // Success
      db.close();
    }
  )
});

server.get('/', (req, res) => {
  res.send({hello: 'world'});
})

server.listen(PORT, () => {
  console.log(`Server up on port ${PORT}`);
});
