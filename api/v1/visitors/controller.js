var express = require('express')();

'use strict';
var utility = require('../../../utility');
var Visitor = require('./model');
var Q = require('q');

var attr = [
  'id',
  'uuid',
  'first_name',
  'last_name',
  'visitors_email',
  'visitors_phone',
  'occupation',
  'nationality',
  'company_name',
  'company_address',
  'gender',
  'state_of_origin',
  'lga_of_origin',
  'image',
  'fingerprint',
  'scanned_signature',
  'visitors_pass_code',
  'date_of_birth',
  'group_type',
  'created_by',
  'modified_by',
  'created',
  'modified'
];

var attrParams = {attributes: attr};

exports.all = function(req, res) {
  Visitor.findAll(attrParams)
    .complete(function(err, users) {
      return res.json(users);
    });
};

exports.getVisitor = function(req, res) {

  Visitor.find({where: {uuid: req.params.uuid}, attributes: attr})
    .complete(function(err, user) {
      res.json(user);
    });
};

exports.create = function(req, res) {
  req.body.uuid = utility.uuidGenerator();
  var Instance = Visitor.build(req.body);


  var promises = [
    Visitor.count({where: {visitors_email: req.body.visitors_email}}),
    Visitor.count({where: {visitors_phone: req.body.visitors_phone}}),
    Instance.validate()
  ];
  Q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[2]);
      var uniqueChecks = [
        {key: 'visitors_email', message: utility.uniqueCheck(response[0], 'Visitors Email')},
        {key: 'visitors_phone', message: utility.uniqueCheck(response[1], 'Visitors Phone')}
      ];

      otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
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
  Visitor.find({where: {uuid: userID}, attributes: attr})
    .complete(function(err, user) {

      if (!err && user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (req.body[key]) {
              existing[key] = req.body[key];
            }
          });

        var Instance = Visitor.build(existing);
        var promises = [
          Visitor.count({where: {email: existing.email, id: {ne: userID}}}),
          Visitor.count({where: {username: existing.username, id: {ne: userID}}}),
          Visitor.count({where: {phone: existing.phone, id: {ne: userID}}}),
          Visitor.count({where: {work_phone: existing.work_phone, id: {ne: userID}}}),
          Visitor.count({where: {home_phone: existing.home_phone, id: {ne: userID}}}),
          Instance.validate()
        ];
        Q.all(promises)
          .then(function(response) {

            var otherValidation = utility.formatErrors(response[5]);
            var uniqueChecks = [
              {key: 'visitors_email', message: utility.uniqueCheck(response[0], 'Visitors Email')},
              {key: 'visitors_phone', message: utility.uniqueCheck(response[1], 'Visitors Phone')}
            ];



            otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
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