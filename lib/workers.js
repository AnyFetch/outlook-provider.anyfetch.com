'use strict';

var upload = require('./helpers/upload.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  upload(job.task.ConversationId, job.serviceData.access_token, job.anyfetchClient, cb);
};
