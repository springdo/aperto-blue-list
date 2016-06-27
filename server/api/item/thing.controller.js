'use strict';

var config = require('./../../config/environment/index');
var dbName =  config.name + '-thing';
var cloudant, db;

if (config && config.cloudant
  && config.cloudant.cloudantNoSQLDB[0]
  && config.cloudant.cloudantNoSQLDB[0].credentials
  && config.cloudant.cloudantNoSQLDB[0].credentials.url) {
  cloudant = require('cloudant')(config.cloudant.cloudantNoSQLDB[0].credentials.url);
  cloudant.db.create(dbName); // just incase :)
  db = cloudant.use(dbName);

} else {
  throw new Error('ERROR: No Cloudant Creds found! VCAP_SERVICES.json stored in the project root is used as a fallback in testing');
}


exports.index = function(req, res) {
  console.log('INFO - ' +'GET /api/things/'+req.params.id);
  db.get(req.params.id, function(err, doc) {
    //if (err) { return handleError(res, err); }
    if(!doc || err) { return res.send(404, err); }
    return res.status(201).send(doc)
  });
};

exports.getAll = function(req, res) {
  console.log('INFO - ' +'GET /api/things');
  db.list({include_docs: true },function(err, body) {
    var dbLog = [];
    if (!err) {
      body.rows.forEach(function(item) {
        dbLog.push(item.doc);
      });
    }
    return res.status(200).send(dbLog)
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  console.log('INFO - ' +'POST /api/things/');
  db.insert(req.body, function(err, thing) {
    console.log('INFO - ' +'POST /api/things','Added to DB');
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};


exports.update = function(req, res) {
  console.log('INFO - ' +'PUT /api/things/:id');
  if(!req.params.id) {
    console.log('WARN - ' +'PUT /api/things/:id no req params');
    return res.send(404);
  }
  db.insert(req.body, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).send(doc)

  });
};


exports.destroy = function(req, res) {
  var id = req.params.id;
  db.get(id, {revs_info: true}, function (err, doc) {
    if (err) { return handleError(res, err); }
    if(!req.params.id) { return res.send(404); }
    if (!err) {
      db.destroy(doc._id, doc._rev, function (err) {
        // Handle response
        if (err) {
          return handleError(res, err);
        } else {
          return res.status(205).send({ok: true})
        }
      });
    }
  });
};

function handleError(res, err) {
  console.log('ERROR - ' + 'handleError /api/things', err);
  if (!err.statusCode){
    err.statusCode = 500;
  }
  if (err.statusCode === 404) {
    var error404 = {
      "code": 404,
      "errorType": "Technical",
      "message": "Record not found",
      "messageType": "Error"
    };
    if (err.message){
      error404.message = err.message;
    }
    res.send(error404.code, error404);
  } else if (err.statusCode === 400) {
    var error400 = {
      "code": 400,
      "errorType": "Technical",
      "message": "Bad Request",
      "messageType": "Error"
    };
    if (err.message){
      error400.message = err.message;
    }
    res.send(error400.code, error400);
  } else {
    var error500 = {
      "code": 500,
      "errorType": "Technical",
      "message": "Unknown error",
      "messageType": "Error"
    };
    if (err.message){
      error500.message = err.message;
    }
    res.send(error500.code, error500);

  }
}
