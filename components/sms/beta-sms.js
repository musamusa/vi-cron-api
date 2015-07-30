'use strict';

var Q = require('q');
var utility = require('./../utility/index');
var queryString = require('querystring');

var setting = require('./../config-manager/system-manager').getSetting();
var CONFIG = {
  SMS_USER: 'musakunte@gmail.com',
  SMS_PASS: 'nccSMStest20',
  SMS_SENDER: 'NCC NIGERIA',
  SMS_API_URL: 'login.betasms.com',
  SMS_API_PATH: '/customer/api/'
};

if (setting.smsSetting) {
  var configData = setting.smsSetting;
  Object.keys(CONFIG)
    .forEach(function(key) {
      if (configData[key]) {
        CONFIG[key] = configData[utility.toCamelCase(key)];
      }
    });
}

function sendSMS(options) {
  var deferred = Q.defer();
  var data = {
    username: CONFIG.SMS_USER,
    password: CONFIG.SMTP_PASS,
    sender: CONFIG.SMS_SENDER,
    mobiles: options.mobiles,
    message:options.message
  };

  var params = {
    _address: CONFIG.SMS_API_URL,
    path: CONFIG.SMS_API_PATH+'?username='+CONFIG.SMS_USER+'&password='+CONFIG.SMS_PASS,
    port: '80',
    data: queryString.stringify(data),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': queryString.stringify(data).length
    }
  };

  utility.post(params, function(response) {
    if (response.status) {
      if (response.response === '1702') {
        deferred.reject({error: 'INVALID USER PASSWORD'});
      } else if (response.response === '1705') {
        deferred.reject({error: 'INVALID URL'});
      } else if (response.response === '1025') {
        deferred.reject({error: 'INSUFFICIENT CREDIT'});
      } else if (response.response === '1701') {
        deferred.resolve({message: 'SUCCESS'});
      } else {
        deferred.reject(response);
      }

    } else {
      deferred.reject(response);
    }
  });
  return deferred.promise;
}

module.exports = {
  sendSMS: sendSMS
};