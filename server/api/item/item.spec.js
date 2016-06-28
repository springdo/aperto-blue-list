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
      return deferred.resolve(res.body);
    });
  return deferred.promise;
}

// helper fn();
function isCloudantId(id){
  if (!id) {
    return false;
  } else {
    return /^(?=.{32}$)[0-9A-Fa-f]+$/i.test(id);
  }
};


describe('thing api', function () {

  describe('POST /api/items', function () {
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
            expect(isCloudantId(res.body.id)).to.be.true
          }
          done();
        });
    });
    //SOME validator
    it('should respond with 400 with malformed JSON', function (done) {
      var malformed = '{json:""}';
      request(app)
        .post('/api/items').set('Content-Type', 'application/json')
        .send(malformed)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          // TODO
          done();
        });
    });

    it('should should 200  & and array of all items with no req params', function (done) {
      request(app)
        .get('/api/items/')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
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

  });

  describe('APIs operating on existing thing', function () {

    beforeEach(function (done) {
      setupDbWithAddItem(seedData[1]).then(function (body) {
        cloudantId = body.id;
        done();
      },done);
    });

    describe('GET /api/items/:id', function () {
      it('should respond with JSON thing object', function (done) {
        request(app)
          .get('/api/items/' + cloudantId)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.be.an('object');
            done();
          });
      });
      it('should respond with a valid CloudantID', function (done) {
        request(app)
          .get('/api/items/' + cloudantId)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body._id.length).to.equal(32);
            expect(isCloudantId(res.body._id)).to.be.true;
            done();
          });
      });
      it('should respond with rev | id | title | completed', function (done) {
        request(app)
          .get('/api/items/' + cloudantId)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.title).to.be.a('string');
            expect(res.body._rev).to.be.a('string');
            expect(res.body._id).to.be.a('string');
            expect(res.body.completed).to.be.false;
            done();
          });
      });

    });

    describe('PUT /api/items/:id', function () {
      var id, rev;
      beforeEach(function (done) {
        setupDbWithAddItem({title: 'Buy more milk', completed :false}).then(function (body) {
          id = body.id;
          rev = body.rev;
          done();
        },done);
      });

      it('Should return json type matching updated data', function (done) {
        var newData = { title: 'Buy even more milk', completed :false, _id : id, _rev:rev};
        request(app)
          .put('/api/items/' + id)
          .send(newData)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            expect(res.body.ok).to.be.true;
            if (err) return done(err);
            request(app)
              .get('/api/items/' + id)
              .expect(200)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.title).to.be.equal(newData.title);
                done();
              });
          });
      });

      it('should should 404 with no req params', function (done) {
        var newData = { title: 'Buy even more milk', completed :false, _id : id, _rev:rev};

        request(app)
          .put('/api/items/')
          .send(newData)
          .expect(404)
          .end(function (err, res) {
            if (err) return done(err);
            done();
          });
      });
    });

    describe('DELETE /api/items/:id', function () {
      var id, rev;
      beforeEach(function (done) {
        setupDbWithAddItem({title: 'Buy some milk', completed :false}).then(function (body) {
          id = body.id;
          rev = body.rev;
          done();
        },done);
      });

      it('Should return a 204 and no content. Next req will 404', function (done) {
        var newData = { title: 'Buy even more milk', completed :false, _id : id, _rev:rev};
        request(app)
          .delete('/api/items/' + id)
          .send(newData)
          .expect(204)
          .end(function (err, res) {
            expect(res.body).to.be.an('object');
            if (err) return done(err);
            request(app)
              .get('/api/items/' + id)
              .expect(404)
              .end(function (err, res) {
                done();
              });
          });
      });
    });
  });
});
