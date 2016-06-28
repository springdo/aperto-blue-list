/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

'use strict';

var config = require('./environment/index');
var dbName =  config.name + '-thing';
var cloudant, db;

if (config && config.cloudant.cloudantNoSQLDB[0] && config.cloudant.cloudantNoSQLDB[0].credentials && config.cloudant.cloudantNoSQLDB[0].credentials.url) {
  cloudant = require('cloudant')(config.cloudant.cloudantNoSQLDB[0].credentials.url);
  cloudant.db.create(dbName);
  db = cloudant.use(dbName);

} else {
  throw new Error('ERROR: No Cloudant Creds found! VCAP_SERVICES.json stored in the project root is used as a fallback in testing');
}

//[{id, rev, item, details,status},{id, rev, item, details,status}]?
var seedData = [{ title: 'Buy milk', completed :true},
  { title: "Have a poop", completed :false}];

if (config.seedDB){
  console.log("INFO - destroying db");
  cloudant.db.destroy(dbName, function(err) {
    console.log("INFO - creating db");
    cloudant.db.create(dbName, function(err){
      console.log("INFO - seeding db");
      db.bulk({docs : seedData}, function(err, body) {
        if (err) {
          return console.log("ERROR - "+ err.message);
        }
        console.log('INFO - db seed complete');
        console.log(body);
      });
    });
  });

}
