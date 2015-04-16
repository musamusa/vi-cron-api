var express = require('express')();

'use strict';
var utility = require('../../../utility');
var Appointments = require('./model');
var Q = require('q');


var attr = [
  'id',
  'uuid',
  'representing',
  'purpose',
  'appointment_date',
  'visit_start_time',
  'visit_end_time',
  'escort_required',
  'is_approved',
  'is_expired',
  'checked_in',
  'checked_out',
  'label_code',
  'created_by',
  'entrance_id',
  'host_id',
  'visitor_id',
  'modified_by',
  'appointment_end_date',
  'teams',
  'created',
  'modified'
];

var attrParams = {attributes: attr};

exports.all = function(req, res) {
  Appointments.findAll(attrParams)
    .complete(function(err, appointments) {
      if (err) return res.json(err);
      return res.json(appointments);
    });
};

exports.get = function(req, res) {
  var where = {};
  if (Object.keys(req.query).length !== 0) {
    Appointments.find({where: req.query, attributes: attr})
      .complete(function(err, appointment) {
        res.json(appointment);
      });
  } else {
    res.statusCode(400);
    res.json('Nothing to see here');
  }
};

exports.getAppointment = function(req, res) {

  Appointments.find({where: {uuid: req.params.uuid}, attributes: attr})
    .complete(function(err, user) {
      res.json(user);
    });
};

exports.create = function(req, res) {
  req.body.uuid = utility.uuidGenerator();
  var Instance = Appointments.build(req.body);


  var promises = [
    Instance.validate()
  ];
  Q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[2]);

      otherValidation = utility.appendMultipleErrors(otherValidation);
      if (Object.keys(otherValidation).length) {
        res.status(400);
        res.json(otherValidation);
      } else {
        Instance.save()
          .complete(function(err, user) {
            if (err) {
              res.status(400);
              res.json({systemError: err});
            } else {
              res.json(user);
            }
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
  var userID = parseInt(req.params.uuid);
  Appointments.find({where: {uuid: userID}, attributes: attr})
    .complete(function(err, user) {

      if (!err && user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (req.body[key]) {
              existing[key] = req.body[key];
            }
          });

        var Instance = Appointments.build(existing);
        var promises = [
          Instance.validate()
        ];
        Q.all(promises)
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
                    res.json({systemError: err});
                  } else {
                    res.json(user);
                  }
                });
            }

          })
          .fail(function(reason) {
            res.status(500);
            res.json({q_error: reason});
          })
          .done();

      } else {
        res.status(500);
        res.json({no_visitor: err});
      }

    });
};