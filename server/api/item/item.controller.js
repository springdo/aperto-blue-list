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
  if(!req.params.id) { return handleError(res, {statusCode : 400}); }
  console.log('INFO - ' +'GET /api/items/'+req.params.id);
  db.get(req.params.id, function(err, doc) {
    //if (err) { return handleError(res, err); }
    if(!doc || err) {
      return handleError(res, {statusCode : 404})
    };
    return res.status(200).send(doc)
  });
};

exports.getAll = function(req, res) {
  console.log('INFO - ' +'GET /api/items');
  db.list({include_docs: true },function(err, body) {
    var dbLog = [];
    if (err) {return handleError(res, err)}
    else {
      body.rows.forEach(function(item) {
        item.doc.id = item.doc._id;
        item.doc.rev = item.doc._rev;

        delete item.doc._id;
        delete item.doc._rev;
        console.log(item.doc)
        dbLog.push(item.doc);
      });
      return res.status(200).send(dbLog)
    }
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  console.log('INFO - ' +'POST /api/items/');
  db.insert(req.body, function(err, doc) {
    console.log('INFO - ' +'POST /api/items','Added to DB');
    if(err) { return handleError(res, err); }
    return res.status(201).send(doc)
  });
};


exports.update = function(req, res) {
  console.log('INFO - ' +'PUT /api/items/:id');
  if(!req.params.id) {
    console.log('WARN - ' +'PUT /api/items/:id no req params');
    return handleError(res, {statusCode : 400})
  }
  req.body._id = req.body.id;
  req.body._rev = req.body.rev;
  db.insert(req.body, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).send(doc)

  });
};


exports.destroy = function(req, res) {
  if(!req.params.id) { return handleError(res, {statusCode : 400}); }
  var id = req.params.id;
  db.get(id, {revs_info: true}, function (err, doc) {
    if (err) { return handleError(res, err); }
    if (!err) {
      db.destroy(doc._id, doc._rev, function (err) {
        // Handle response
        if (err) {
          return handleError(res, err);
        } else {
          return res.status(204).send({ok: true})
        }
      });
    }
  });
};

function handleError(res, err) {
  console.log('ERROR - ' + 'handleError /api/items', err);
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
    res.status( error404.code).send(error404)
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
    res.status( error400.code).send(error400)
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
    res.status( error500.code).send(error500)
  }
}
