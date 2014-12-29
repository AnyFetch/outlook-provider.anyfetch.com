'use strict';

var request = require('supertest');

var threadsPerRequest = 50;

function retrieveThreads(folder, queues, documentsPerUpdate, token, cursor, hashedThreads, cb, link) {
  if(!link) {
    link = '/api/v1.0/me/folders/' + folder + '/messages?$filter=DateTimeReceived ge ' + cursor.toISOString() + '&$select=ConversationId&$orderby=DateTimeReceived desc&$top=' + threadsPerRequest;
  }
  else {
    link = link.replace('https://outlook.office365.com', '');
  }

  request('https://outlook.office365.com')
    .get(link)
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .end(function(err, res) {
      if(err) {
        return cb(err);
      }

      if(res.body.value) {
        res.body.value.forEach(function(thread) {
          if(hashedThreads[thread.ConversationId] || queues.addition.totalCount > documentsPerUpdate) {
            return;
          }
          hashedThreads[thread.ConversationId] = true;

          thread.identifier = thread.ConversationId;
          thread.id = thread.ConversationId;

          queues.addition.push(thread);
        });
      }

      if(res.body['@odata.nextLink'] && res.body.value && res.body.value.length > 0 && queues.addition.totalCount < documentsPerUpdate) {
        return retrieveThreads(folder, queues, documentsPerUpdate, token, cursor, hashedThreads, cb, res.body['@odata.nextLink']);
      }
      else {
        return cb(null, hashedThreads);
      }
    });
}

module.exports = retrieveThreads;
