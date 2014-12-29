'use strict';

var request = require('supertest');
var async = require('async');
var rarity = require('rarity');

var generateTitle = require('anyfetch-provider').util.generateTitle;
var log = require('anyfetch-provider').log;

function buildFromMessage(message) {
  var document = {
    data: {
      id: message.Id
    },
    metadata: {}
  };

  if(message.Body.ContentType.toLowerCase() === 'html') {
    document.data.html = message.Body.Content;
  }
  else {
    document.metadata.text = message.Body.Content;
  }

  document.metadata.from = [
    {
      address: message.From.EmailAddress.Address,
      name: message.From.EmailAddress.Name
    }
  ];

  document.metadata.to = (message.ToRecipients || []).reduce(function(prev, data) {
    return prev.concat({
      address: data.EmailAddress.Address,
      name: data.EmailAddress.Name
    });
  }, []);

  document.metadata.cc = (message.CcRecipients || []).reduce(function(prev, data) {
    return prev.concat({
      address: data.EmailAddress.Address,
      name: data.EmailAddress.Name
    });
  }, []);

  document.metadata.subject = message.Subject;
  document.metadata.date = message.DateTimeReceived;

  return document;
}

function mergeMessages(inbox, sent) {
  var messages = [];

  if(inbox.length === 0) {
    return sent;
  }

  if(sent.length === 0) {
    return inbox;
  }

  var i = 0;
  var j = 0;

  while(inbox[i] || sent[j]) {
    if(!inbox[i]) {
      messages.push(sent[j]);
      j += 1;
    }
    else if(!sent[j]) {
      messages.push(inbox[i]);
      i += 1;
    }
    else if(new Date(inbox[i].DateTimeReceived) > new Date(sent[j].DateTimeReceived)) {
      //console.log("DATES 1", new Date(inbox[i].DateTimeCreated), new Date(sent[j].DateTimeCreated));
      messages.push(inbox[i]);
      i += 1;
      continue;
    }
    else {
      //console.log("DATES 2", new Date(inbox[i].DateTimeCreated), new Date(sent[j].DateTimeCreated));
      messages.push(sent[j]);
      j += 1;
      continue;
    }
  }

  console.log("AFTER MERGE", JSON.stringify(messages, null, 4));

  return messages;
}

module.exports = function uploadThread(conversationId, token, anyfetchClient, cb) {
  var document = {
    identifier: conversationId,
    data: {
      id: conversationId,
      messages: []
    },
    metadata: {
      participants: [],
      messages: [],
      attachmentsCount: 0
    },
    actions: {},
    related: [],
    document_type: 'email-thread',
    creation_date: null,
    modification_date: null,
    user_access: [anyfetchClient.accessToken],
  };

  var attachments = [];

  async.waterfall([
    function retrieveMessages(cb) {
      var messages = {
        inbox: [],
        sentitems: []
      };

      async.each(['inbox', 'sentitems'], function(folder, cb) {
        request('https://outlook.office365.com')
          .get("/api/v1.0/me/folders/" + folder + "/messages?$filter=ConversationId eq '" + conversationId + "'")
          .set('Authorization', "Bearer " + token)
          .expect(200)
          .end(function(err, res) {
            if(err) {
              return cb(err);
            }

            messages[folder] = res.body.value.reverse() || [];
            return cb(null);
          });
      }, function(err) {
        if(err) {
          return cb(err);
        }

        cb(null, mergeMessages(messages.inbox, messages.sentitems));
      });
    },
    function manageMessages(messages, cb) {
      async.eachLimit(messages, 5, function(message, cb) {
        var attachmentsHashed = {};

        document.creation_date = message.DateTimeCreated;
        if(!document.modification_date) {
          document.modification_date = message.DateTimeLastModified;
        }

        var data = buildFromMessage(message);
        document.data.messages.push(data.data);
        document.metadata.messages.push(data.metadata);

        if(!message.HasAttachments) {
          return cb(null);
        }

        async.waterfall([
          function retrieveAttachments(cb) {
            request('https://outlook.office365.com')
              .get("/api/v1.0/me/messages/" + message.Id + "/attachments")
              .set('Authorization', "Bearer " + token)
              .expect(200)
              .end(function(err, res) {
                if(err) {
                  return cb(err);
                }

                return cb(null, res.body.value);
              });
          },
          function addAttachments(data, cb) {
            data.forEach(function(data) {
              if(data.IsContactPhoto || attachmentsHashed[data.Name] || !data.ContentBytes) {
                return;
              }
              attachmentsHashed[data.Name] = true;

              var attachment = {
                document: {
                  identifier: document.identifier + "-" + data.Name,
                  actions: {
                    show: document.actions.show
                  },
                  metadata: {
                    path: '/' + data.Name,
                    title: generateTitle(data.Name)
                  },
                  document_type: 'file',
                  creation_date: message.DateTimeCreated,
                  modification_date: data.DateTimeLastModified || message.DateTimeLastModified,
                  related: [document.identifier],
                  user_access: document.user_access
                },
                fileToSend: {
                  file: new Buffer(data.ContentBytes, 'base64'),
                  filename: data.Name
                }
              };

              attachments.push(attachment);
              document.metadata.attachmentsCount += 1;
              document.related.push(attachment.document.identifier);
            });

            cb();
          }
        ], cb);
      }, cb);
    },
    function buildMetadat(cb) {
      var buffer = {};
      document.metadata.messages.forEach(function walkMails(message) {
        if(!message) {
          return;
        }

        function walkAddresses(obj) {
          if(obj.name && obj.name.length > 0) {
            buffer[obj.address] = obj.name;
          }
          else if(!buffer[obj.address]) {
            buffer[obj.address] = "";
          }
        }

        (message.from || []).forEach(walkAddresses);
        (message.to || []).forEach(walkAddresses);
        (message.cc || []).forEach(walkAddresses);
      });

      document.metadata.participants = Object.keys(buffer).map(function walkBuffer(address) {
        var obj = {};

        if(address.length > 0) {
          obj.address = address;
        }

        if(buffer[address]) {
          obj.name = buffer[address];
        }

        return obj;
      });

      document.metadata.subject = document.metadata.messages[document.metadata.messages.length - 1].subject || "No subject";
      document.metadata.date = document.creation_date;

      cb();
    },
    function sendDocument(cb) {
      log.info({
        name: 'addition',
        identifier: document.identifier,
      }, "Uploading");

      anyfetchClient.postDocument(document, rarity.slice(1, cb));
    },
    function sendAttachments(cb) {
      async.each(attachments, function(attachment, cb) {
        log.info({
          name: 'addition',
          identifier: attachment.document.identifier
        }, "Uploading");

        anyfetchClient.sendDocumentAndFile(attachment.document, attachment.fileToSend, rarity.slice(1, cb));
      }, cb);
    }
  ], cb);
};
