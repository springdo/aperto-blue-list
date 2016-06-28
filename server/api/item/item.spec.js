'use strict';

var app = require('../../app');
var request = require('supertest');
var q = require('q');
var config = require('./../../config/environment/index');

var dbName = config.name + '-thing';
var cloudant, thingDb;
var seedData = [{ title: 'Buy milk', completed :true},
  { title: "Have a poop", completed :false}];

if (config && config.cloudant
  && config.cloudant.cloudantNoSQLDB[0]
  && config.cloudant.cloudantNoSQLDB[0].credentials
  && config.cloudant.cloudantNoSQLDB[0].credentials.url) {
  cloudant = require('cloudant')(config.cloudant.cloudantNoSQLDB[0].credentials.url);
  cloudant.db.create(dbName); // just incase :)
  thingDb = cloudant.use(dbName);

} else {
  throw new Error('ERROR: No Cloudant Creds found! VCAP_SERVICES.json stored in the project root is used as a fallback in testing');
}

var cloudantId;

// These tests need to be written

function setupDbWithAddItem(payload) {
  var deferred = q.defer();
  request(app)
    .post('/api/items')
    .send(payload)
    .expect(201)
    .end(function (err, res) {
      if (err) return deferred.reject(err);
      return deferred.resolve(res.body.id);
    });
  return deferred.promise;
}

function isCloudantId(id){
    if (!id) {
      return false;
    } else {
      return /^(?=.{32}$)[0-9A-Fa-f]+$/i.test(id);
    }
};
describe('thing api', function () {

  describe('POST /api/items (addThing)', function () {
    // delete db once
    var dbSetup;
    beforeEach(function (done) {
      if (!dbSetup) {
        cloudant.db.destroy(dbName, function () {
          cloudant.db.create(dbName, function (err) {
            if (err) return done(err);
            dbSetup = true;
            done();
          });
        });
      } else {
        done()
      }
    });

    it('the database should start with no items', function (done) {
      // test only valid while there are no design docs
      // and not valid in production when data exists
      thingDb.list(function (err, body) {
        if (err) return done(err);
        expect(body.total_rows).to.equal(0);
        expect(body.offset).to.equal(0);
        expect(body.rows.length).to.equal(0);
        done();
      });

    });

    it('should respond with 201 Created', function (done) {
      request(app)
        .post('/api/items')
        .send(seedData[0])
        .expect(201)
        .end(function (err, res) {
          //console.log(res)
          if (err) return done(err);
          done();
        });
    });

    it('should respond with JSON array with valid JSON', function (done) {
      request(app)
        .post('/api/items')
        .send(seedData[0])
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          done();
        });
    });

    it('should respond with Content-Type JSON', function (done) {
      request(app)
        .post('/api/items')
        .send(seedData[0])
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });

    it('should respond with a valid CloudantID', function (done) {
      request(app)
        .post('/api/items')
        .send(seedData[0])
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          for (var index in res.body) {
            expect(res.body.id.length).to.equal(32);
          }
          done();
        });
    });
    //SOME validator
    it('should respond with 400 with malformed JSON', function (done) {
      var malformed = '{json:""}';
      request(app)
        .post('/api/items')
        .send(malformed)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          // TODO
          done();
        });
    });
    //TODO - enable test
    //it('should not allow script tags into the db', function (done) {
    //  request(app)
    //    .post('/api/items')
    //    .send(PayloadBuilder.scriptTagJSON())
    //    .expect(400)
    //    .end(function (err, res) {
    //      if (err) {
    //        console.log(err);
    //        return done(err);
    //      } else {
    //        done();
    //      }
    //    });
    //});


    //describe('add item to db', function () {
    //
    //  describe('should add item to the database', function () {
    //
    //    beforeEach(function (done) {
    //      validPayload = payloadBuilder.build();
    //      setupDbWithAddItem(validPayload).then(function (ids) {
    //        cloudantId = ids;
    //        done()
    //      },done);
    //    });
    //    it('valid thing', function (done) {
    //      thingDb.get(cloudantId, function (err, doc) {
    //        if (err) return done(err);
    //        expect(doc.someData).toEqual(validPayload.someData);
    //        done();
    //      });
    //    });
    //  });
    //
    //});
  });

  //describe('APIs operating on existing thing', function () {
  //
  //  beforeEach(function (done) {
  //    validPayload = payloadBuilder.build();
  //    setupDbWithAddItem(validPayload).then(function (id) {
  //      cloudantId = id;
  //      done();
  //    },done);
  //  });
  //
  //  describe('GET /api/items/:id (show)', function () {
  //    it('should respond with JSON thing object', function (done) {
  //      request(app)
  //        .get('/api/items/' + cloudantId)
  //        .expect(200)
  //        .end(function (err, res) {
  //          if (err) return done(err);
  //          expect(res.body.someData).toEqual('someValue');
  //          done();
  //        });
  //    });
  //  });
  //
  //  describe('UPDATE /api/steves/:id (delete)', function () {
  //    it('should update db when name changed', function (done) {
  //      var newData = payloadBuilder.withSomeData('newData').build();
  //      request(app)
  //        .put('/api/items/' + cloudantId)
  //        .send(newData)
  //        .expect(200)
  //        .expect('Content-Type', /json/)
  //        .end(function (err, res) {
  //          if (err) return done(err);
  //          request(app)
  //            .get('/api/items/' + cloudantId)
  //            .expect(200)
  //            .end(function (err, res) {
  //              if (err) return done(err);
  //              expect(res.body.someData).toBe('newData');
  //              done();
  //            });
  //        });
  //    });
  //  });
  //
  //  describe('DELETE /api/items/:id (delete)', function () {
  //    it('should remove thing obj associated to id from db', function (done) {
  //      request(app)
  //        .delete('/api/items/' + cloudantId)
  //        .expect(200)
  //        .expect('Content-Type', /json/)
  //        .end(function (err, res) {
  //          if (err) return done(err);
  //          request(app)
  //            .get('/api/items/' + cloudantId)
  //            .expect(404)
  //            .end(function (err, res) {
  //              if (err) return done(err);
  //              done();
  //            });
  //        });
  //    });
  //  });
  //});
});