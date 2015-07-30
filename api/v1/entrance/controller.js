'use strict';
var service = require('./service');

exports.all = function(req, res) {
  service.all(req)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json({detail:reason.reason});
    });
};

exports.getByField = function(req, res) {
  service.getByField(req)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json({detail:reason.reason});
    });
};

exports.get = function(req, res) {
  service.get(req)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json({detail:reason.reason});
    });
};

exports.create = function(req, res) {
  service.create(req)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json({detail:reason.reason});
    });
};

exports.update = function(req, res) {
  service.update(req)
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      if (status === 404) {
        service.create(req)
          .then(function(response) {
            res.json(response);
          })
          .catch(function(reason) {
            var status = reason.status || 500;
            res.status(status);
            res.json({detail:reason.reason});
          });
      } else {
        res.status(status);
        res.json({detail:reason.reason});
      }

    });
};

exports.remove = function(req, res) {
  service.remove(req)
    .then(function(response) {
      return res.json(response);
    })
    .catch(function(reason) {
      var status = reason.status || 500;
      res.status(status);
      res.json({detail:reason.reason});
    });
};