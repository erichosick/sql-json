"use strict"

require('require-sql');

let express = require('express');
let sqljson = require('./../../dist/sqljson.js').sqljson;
let sqljsonLib = require('./../../dist/sqljson.js');
let dbLib = require('./database/db-lib.js');

let app = express();
let sj = null;

function sendResult(res, err, data) {
  if (err) {
    console.log(err);
    res.send(err);
  } else {
    res.send(data);
  }
}

// Individuals

app.get('/', function (req, res) {
  res.send('Empty');
});

app.get('/individuals', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM individual;`,
        dataPath: 'individuals'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

app.get('/individuals/:individualId', function (req, res) {

  sj.run( {
      sqlJson: {
        sql: `SELECT individual_id AS individualId, first_name AS firstName, family_name AS familyName
              FROM individual WHERE individual_id = '${req.params.individualId}';`,
        type: 'object'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

// countries and addresses

app.get('/countries', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM country;`,
        dataPath: 'countries'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});


app.get('/addressTypes', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM address_type;`,
        dataPath: 'addressTypes'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

app.get('/addressTypes/:addressTypeId', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM address_type WHERE address_type_id = ${req.params.addressTypeId};`,
        dataPath: '',
        type: 'object'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

// sql lite info

app.get('/sqlite/tables', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM sqlite_master WHERE type='table';`,
        dataPath: 'tables'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

app.get('/sqlite/indexes', function (req, res) {
  sj.run( {
      sqlJson: {
        sql: `SELECT * FROM sqlite_master WHERE type='index';`,
        dataPath: 'tables'
      }
    }, (err, result) => {
      sendResult(res, err, result);
  });
});

app.listen(3000, function () {

  // Create database and load data for examples
  const repoSqlite3 = sqljsonLib.repoSqlite3({
    afterOpen: () => {
      sj = sqljson(repoSqlite3);
      sj.run(dbLib.databaseCreate, (err, res) => {
        if (err) {
          console.log(err);
        }
        sj.run(dbLib.loadDbSqlJson, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Done creating and loading database.');
          }
        });
      });
    }
  });

  repoSqlite3.open;

  console.log('Listening on port 3000.');
});