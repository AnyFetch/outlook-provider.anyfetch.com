'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var uuid = require('node-uuid');
var request = require('supertest');
var querystring = require('querystring');
var CancelError = require('anyfetch-provider').CancelError;

var config = require('../config/configuration.js');

var redirectToService = function(callbackUrl, cb) {
  var csrf = uuid.v4();
  cb(null, "https://login.windows.net/common/oauth2/authorize?response_type=code&client_id=" + config.office365ClientId + "&redirect_uri=" + encodeURIComponent(callbackUrl) + "&resource=https:%2f%2foutlook.office365.com%2f&state=" + csrf, {csrf: csrf, callbackUrl: callbackUrl});
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  if(reqParams.error === "access_denied") {
    return cb(new CancelError(reqParams.error_description));
  }

  if(reqParams.state !== storedParams.csrf) {
    return cb(new Error("Bad state"));
  }

  request('https://login.windows.net')
    .post('/common/oauth2/token')
    .send(querystring.stringify({
      grant_type: 'authorization_code',
      code: reqParams.code,
      redirect_uri: storedParams.callbackUrl,
      client_id: config.office365ClientId,
      client_secret: config.office365ClientSecret
    }))
    .end(function(err, res) {
      if(err) {
        return cb(err);
      }

      if(res.statusCode !== 200) {
        return cb(new Error("Can't retrieve access token"));
      }

      var jwt = JSON.parse(new Buffer(res.body.id_token.split('.')[1], 'base64').toString());
      cb(null, jwt.unique_name, res.body);
    });
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },

  config: config
};
