'use strict';
var service = require('./service');

exports.all = function(req, res) {
  service.all(req, res)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json(reason.reason);
    });
};

exports.get = function(req, res) {
  service.get(req, res)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json(reason.reason);
    });
};

exports.create = function(req, res) {
  service.create(req, res)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json(reason.reason);
    });
};

exports.update = function(req, res) {
  service.update(req, res)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      if (status === 404) {
        service.create(req, res)
          .then(function(response) {
            res.json(response);
          })
          .catch(function(reason) {
            var status = reason.status || 500;
            res.status(status);
            res.json(reason.reason);
          });
      } else {
        res.status(status);
        res.json(reason.reason);
      }
    });
};

exports.remove = function(req, res) {
  service.remove(req, res)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json(reason.reason);
    });
};