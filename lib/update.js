'use strict';

var async = require('async');
var rarity = require('rarity');
var querystring = require('querystring');
var request = require('supertest');
var TokenError = require('anyfetch-provider').TokenError;

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
        .end(function(err, res) {
          if(err) {
            return cb(err);
          }

          if(res.statusCode !== 200) {
            return cb(new TokenError());
          }

          serviceData.access_token = res.body.access_token;
          return cb();
        });
    },
    function getInboxThreads(cb) {
      if(!cursor) {
        cursor = new Date(1970);
      }

      retrieveThreads('inbox', queues, serviceData.documentsPerUpdate, serviceData.access_token, cursor, {}, rarity.carry([new Date()], cb));
    },
    function getSentThreads(newCursor, hashedThreads, cb) {
      retrieveThreads('sentitems', queues, serviceData.documentsPerUpdate, serviceData.access_token, cursor, hashedThreads, rarity.carryAndSlice([newCursor, serviceData], 3, cb));
    }
  ], cb);
};
