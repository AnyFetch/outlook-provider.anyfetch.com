'use strict';

var should = require('should');

var async = require('async');
var request = require('supertest');
var querystring = require('querystring');
var config = require('../config/configuration.js');
var retrieve = require('../lib/helpers/retrieve.js');

describe("Retrieve code", function() {
  var token = null;
  before(function refreshToken(done) {
    request('https://login.windows.net')
      .post('/common/oauth2/token')
      .send(querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: config.testRefreshToken,
        client_id: config.office365ClientId,
        client_secret: config.office365ClientSecret
      }))
      .end(function(err, req) {
        if(err) {
          return done(err);
        }

        token = req.body.access_token;
        return done();
      });
  });

  it("should get all threads", function(done) {
    this.timeout(50000);

    var queues = {
      addition: []
    };

    queues.addition.totalCount = 0;

    async.waterfall([
      function callRetrieve(cb) {
        retrieve('inbox', queues, 2500, token, new Date(1970), {}, cb);
      },
      function checkThreads(hashedThreads, cb) {
        var threads = queues.addition;

        should.exist(threads[0]);

        threads.length.should.be.greaterThan(2);
        threads[0].should.have.property('ConversationId');

        cb(null);
      }
    ], done);
  });

  it("should list threads modified after specified date", function(done) {
    this.timeout(50000);

    var queues = {
      addition: []
    };

    queues.addition.totalCount = 0;

    async.waterfall([
      function callRetrieve(cb) {
        retrieve('inbox', queues, 2500, token, new Date(2014, 11, 22), {}, cb);
      },
      function checkThreads(hashedThreads, cb) {
        var threads = queues.addition;

        should.exist(threads[0]);

        threads.length.should.be.eql(1);
        threads[0].should.have.property('ConversationId');

        cb(null);
      }
    ], done);
  });
});
