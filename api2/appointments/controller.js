'use strict';

var $q = require('q');
var utility = require('../../utility');
var basePath = '/api/v1/';
function baseParams() {
  return {
    _address: 'localhost',
    path: basePath + 'appointments',
    port: '8000'
  };
}

exports.all = function(req, res) {
  utility.get(baseParams())
    .then(function(response){
      res.json(JSON.parse(response.data));
    })
    .fail(function(reason) {
      res.status(reason.statusCode);
      res.json({detail: reason.reason});
    });
};

exports.get = function(req, res) {
  var params = baseParams();
  params.path = basePath + 'appointment/'+req.params.id+'/';
  utility.get(params)
    .then(function(response){
      res.json(JSON.parse(response.data));
    })
    .fail(function(reason) {
      res.status(reason.statusCode);
      res.json({detail: reason.reason});
    });
};

exports.getUser = function(req, res) {
  var params = baseParams();
  params.path = basePath + 'appointment/'+req.params.id+'/';
  utility.get(params)
    .then(function(response){
      res.json(JSON.parse(response.data));
    })
    .fail(function(reason) {
      res.status(reason.statusCode);
      res.json({detail: reason.reason});
    });
};

exports.create = function(req, res) {
  var params = baseParams();
  params.data = JSON.stringify(req.body);
  params.headers = {};
  Object.keys(req.headers)
    .forEach(function(key) {
      params.headers[key] = req.headers[key];
    });
  utility.post(params)
    .then(function(response){
      var successData = {};
      try{
        successData = JSON.parse(response.data);
      } catch(e) {
        successData = response.data;
      }
      res.json(successData);
    })
    .fail(function(reason) {
      var errorMsg = {};
      try {
        errorMsg = JSON.parse(reason.data);
      } catch (e) {
        errorMsg = reason.data;
      }

      res.status(reason.statusCode);
      res.json({detail: reason.reason, error: errorMsg});
    });
};

exports.update = function(req, res) {
  var params = baseParams();
  params.data = JSON.stringify(req.body);
  params.headers = {};
  Object.keys(req.headers)
    .forEach(function(key) {
      params.headers[key] = req.headers[key];
    });
  params.path = basePath + 'appointment/'+req.params.id+'/';
  utility.put(params)
    .then(function(response){
      var successData = {};
      try{
        successData = JSON.parse(response.data);
      } catch(e) {
        successData = response.data;
      }
      res.json(successData);
    })
    .fail(function(reason) {
      var errorMsg = {};
      try {
        errorMsg = JSON.parse(reason.data);
      } catch (e) {
        errorMsg = reason.data;
      }

      res.status(reason.statusCode);
      res.json({detail: reason.reason, error: errorMsg});
    });
};