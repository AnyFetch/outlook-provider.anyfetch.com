'use strict';

var request = require('supertest');

var threadsPerRequest = 100;

function retrieveThreads(token, skip, cursor, threads, hashedThreads, cb) {
  request('https://outlook.office365.com')
    .get('/api/v1.0/me/messages?$filter=DateTimeReceived ge ' + cursor.toISOString() + '&$select=ConversationId&$orderby=DateTimeReceived desc&$top=' + threadsPerRequest + '&$skip=' + skip)
    .set('Authorization', "Bearer " + token)
    .expect(200)
    .end(function(err, res) {
      if(err) {
        return cb(err);
      }

      if(res.body.value) {
        threads = res.body.value.reduce(function(threads, thread) {
          if(!hashedThreads[thread.ConversationId]) {
            hashedThreads[thread.ConversationId] = true;
            threads.push(thread);
          }
          return threads;
        }, threads);
      }

      if(res.body['@odata.nextLink'] && res.body.value && res.body.value.length > 0) {
        return retrieveThreads(token, skip + threadsPerRequest, cursor, threads, hashedThreads, cb);
      }
      else {
        return cb(null, threads);
      }
    });
}

module.exports = retrieveThreads;
