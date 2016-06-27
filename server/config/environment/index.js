'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}


console.log(process.env.VCAP_SERVICES);
// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'aperto-blue-list-secret'
  },

  name : 'aperto-blue-list',

  // Cloudant connection options
  cloudant: JSON.parse(process.env.VCAP_SERVICES) || {
    "cloudantNoSQLDB":[
      {
        "name":"dev-db",
        "credentials":{
          "username":"admin",
          "password":"admin",
          "host":"localhost",
          "port":8443,
          "url":"http://admin:admin@localhost:8443"
        }
      }]} || {}

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
