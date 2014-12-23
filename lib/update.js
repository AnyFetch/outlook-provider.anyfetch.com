'use strict';

var async = require('async');
var rarity = require('rarity');
var querystring = require('querystring');
var request = require('supertest');

var config = require('../config/configuration');
var retrieveThreads = require('./helpers/retrieve.js');

module.exports = function updateAccount(serviceData, cursor, queues, cb) {
  // Retrieve all mails since last call
  async.waterfall([
    function refreshTokens(cb) {
      request('https://login.windows.net')
        .post('/common/oauth2/token')
        .send(querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: serviceData.refresh_token,
          client_id: config.office365ClientId,
          client_secret: config.office365ClientSecret
        }))
        .end(function(err, req) {
          if(err) {
            return cb(err);
          }

          serviceData.access_token = req.body.access_token;
          return cb();
        });
    },
    function getThreads(cb) {
      if(!cursor) {
        cursor = new Date(1970);
      }

      retrieveThreads(serviceData.access_token, 0, cursor, [], {}, rarity.carry([new Date()], cb));
    },
    function addThreadsToQueue(newCursor, threads, cb) {
      threads.forEach(function(thread) {
        thread.identifier = thread.ConversationId;
        thread.id = thread.ConversationId;
        queues.addition.push(thread);
      });

      cb(null, newCursor, serviceData);
    }
  ], cb);
};
