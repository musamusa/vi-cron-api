'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var Q = require('q');
var utility = require('./utility');
var CONFIG_JSON = utility.JSON_DIR+'/settings.json';
var CONFIG = {
  SMTP_HOST: 'smtp.zoho.com',
  SMTP_PORT: 587,
  SMTP_USER: 'ncc@vilogged.com',
  SMTP_PASS: '*nccnaija#',
  SMTP_FROM_NAME: 'Nigerian Communications Commission'
};

if (utility.fileExists(CONFIG_JSON)) {
  var configData = JSON.parse(utility.loadFile(CONFIG_JSON));
  Object.keys(CONFIG)
    .forEach(function(key) {
      if (configData[utility.toCamelCase(key)]) {
        CONFIG[key] = configData[utility.toCamelCase(key)];
      }
    });
}
var transporter = nodemailer.createTransport(smtpTransport({
  host: CONFIG.SMTP_HOST,
  port: CONFIG.SMTP_PORT,
  auth: {
    user: CONFIG.SMTP_USER,
    pass: CONFIG.SMTP_PASS
  }
}));

function sendEmail(options) {
  var deferred = Q.defer();
  var from = CONFIG.SMTP_FROM_NAME ? CONFIG.SMTP_FROM_NAME + ' <'+CONFIG.SMTP_USER+'>' : CONFIG.SMTP_USER;
  transporter.sendMail({
    from: from,
    to: options.to,
    subject: options.subject,
    text: options.message
  }, function(err, info) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(info);
    }
  });
  return deferred.promise;
}

module.exports = {
  sendMail: sendEmail
};