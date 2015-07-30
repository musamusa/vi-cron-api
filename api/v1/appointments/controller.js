var express = require('express')();

'use strict';
var utility = require('../../../components/utility/index');
var Appointments = require('./model');
var Model = Appointments.model;
var attr = Appointments.attr;
var $q = require('q');

var attrParams = {attributes: attr};

exports.all = function(req, res) {
  Model.findAll(attrParams)
    .then(function(response) {
      return res.json(response);
    })
    .catch(function(reason) {
      res.status(500);
      res.json(reason);
    });
};

exports.get = function(req, res) {
  var where = {};
  if (Object.keys(req.query).length !== 0) {
    Model.find({where: req.query, attributes: attr})
      .then(function(response) {
        res.json(response);
      })
      .catch(function(reason) {
        res.status(500);
        res.json(reason);
      });
  } else {
    res.statusCode(400);
    res.json('Nothing to see here');
  }
};

exports.getAppointment = function(req, res) {

  Model.find({where: {_id: req.params.id}, attributes: attr})
    .then(function(response) {
      res.json(response);
    })
    .catch(function(reason) {
      res.json(reason);
    });
};

exports.create = function(req, res) {
  req.body._id = utility.uuidGenerator();
  var Instance = Model.build(req.body);
  var promises = [
    Instance.validate()
  ];
  $q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[0]);

      otherValidation = utility.appendMultipleErrors(otherValidation);
      if (Object.keys(otherValidation).length) {
        res.status(400);
        res.json(otherValidation);
      } else {
        Instance.save()
          .then(function(response) {
            res.json(response);
          })
          .catch(function() {
            res.status(400);
            res.json({systemError: err});
          });
      }

    })
    .catch(function(reason) {
      res.status(400);
      res.json(reason);
    });


  //return res.json({});
};

exports.update = function(req, res) {
  var userID = req.params.id;
  Model.find({where: {_id: userID}, attributes: attr})
    .complete(function(err, user) {

      if (!err && user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (req.body[key]) {
              existing[key] = req.body[key];
            }
          });

        var Instance = Model.build(existing);
        var promises = [
          Instance.validate()
        ];
        $q.all(promises)
          .then(function(response) {

            var otherValidation = utility.formatErrors(response[5]);

            otherValidation = utility.appendMultipleErrors(otherValidation);
            if (Object.keys(otherValidation).length) {
              res.status(400);
              res.json(otherValidation);
            } else {
              user.updateAttributes(existing)
                .complete(function(err, user) {
                  if (err) {
                    res.status(500);
                    res.json({detail: err});
                  } else {
                    res.json(user);
                  }
                });
            }

          })
          .fail(function(reason) {
            res.status(500);
            res.json({detail: reason});
          })
          .done();

      } else {
        res.status(500);
        res.json({detail: err});
      }

    });
};

exports.remove = function(req, res) {
  var userID = req.params.id;
  Model.find({where: {_id: userID}})
    .then(function(user) {
      user.destroy()
        .then(function() {
          res.json({_id: userID});
        })
        .catch(function(reason) {
          res.status(500);
          res.json(reason);
        });
    })
    .catch(function(reason) {
      res.status(500);
      res.json(reason);
    });
};