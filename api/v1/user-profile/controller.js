var Sequelize = require('sequelize');
var express = require('express')();

'use strict';
var utility = require('../../../utility');
var UserProfile = require('./model');
var Q = require('q');

var attr = [
  'id',
  'phone',
  'work_phone',
  'home_phone',
  'department',
  'gender',
  'image',
  'designation',
  'department_floor'
];

var nonSearchFields = [
  'id'
];

var attrParams = {attributes: attr};
exports.attr = attr;

exports.all = function(req, res) {
  if (Object.keys(req.query).length !== 0) {
    attrParams.where = req.query;
  }
  UserProfile.findAll(attrParams)
    .complete(function(err, users) {
      return res.json(users);
    });
};

exports.search = function(req, res) {
  if (Object.keys(req.query).length !== 0) {
    var query = {};
    var urlQuery = req.query;
    if (req.query.q) {
      attr.forEach(function(key) {
        if (nonSearchFields.indexOf(key) === -1)
        query[key] = {like: req.query.q }
      });
      //query =  Sequelize.or(query);
    } else {
      Object.keys(req.query)
        .forEach(function(key) {
          query[key] = {like: urlQuery[key]}
        });
    }

    attrParams.where = query;
    UserProfile.findAll(attrParams)
      .complete(function(err, users) {
        return res.json({u:users, q: query});
      });
  } else {
    res.status(400);
    res.json('please enter search queries');
  }

};

exports.get = function(req, res) {
  var where = {};
  if (Object.keys(req.query).length !== 0) {
    UserProfile.find({where: req.query, attributes: attr})
      .complete(function(err, appointment) {
        res.json(appointment);
      });
  } else {
    res.status(400);
    res.json('Nothing to see here');
  }
};

exports.getUserProfile = function(req, res) {

  UserProfile.find({where: {id: req.params.id}, attributes: attr})
    .complete(function(err, user) {
      res.json(user);
    });
};

exports.create = function(req, res) {
  var userInstance = UserProfile.build(req.body);

  if (req.body.user_profile) {
    var userProfile = req.body['user_profile'];
    delete req.body['user_profile'];
    Object.keys(userProfile).forEach(function(key) {
      req.body[key] = userProfile[key];
    });

    if (Object.prototype.toString.call(userProfile.department) === '[object Object]') {
      delete req.body.department;
      req.body.department = userProfile.department.uuid;
    }
  }

  var promises = [
    UserProfile.count({where: {email: req.body.email}}),
    UserProfile.count({where: {username: req.body.username}}),
    UserProfile.count({where: {phone: req.body.phone}}),
    UserProfile.count({where: {work_phone: req.body.work_phone}}),
    UserProfile.count({where: {home_phone: req.body.home_phone}}),
    userInstance.validate()
  ];
  Q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[5]);
      var uniqueChecks = [
        {key: 'email', message: utility.uniqueCheck(response[0], 'Email')},
        {key: 'username', message: utility.uniqueCheck(response[1], 'Username')},
        {key: 'phone', message: utility.uniqueCheck(response[2], 'Phone')}
      ];

      if (req.body['work_phone'] !== null && req.body['work_phone'] !== '') {
        uniqueChecks.push(
          {key: 'work_phone', message: utility.uniqueCheck(response[3], 'Work Phone')}
        );
      }

      if (req.body['home_phone']) {
        uniqueChecks.push(
          {key: 'home_phone', message: utility.uniqueCheck(response[4], 'Home Phone')}
        );
      }


      otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
      if (Object.keys(otherValidation).length) {
        res.status(400);
        res.json(otherValidation);
      } else {
        userInstance.save()
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
  var userID = parseInt(req.params.id);
  attr.push('password');
  UserProfile.find({where: {id: userID}, attributes: attr})
    .complete(function(err, user) {

      if (!err && user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {

            if (req.body[key]) {
              existing[key] = req.body[key];
              if (key === 'is_superuser') {
                console.log(toString.call(existing[key]));
                console.log(toString.call(req.body[key]));
              }
            }
          });



        if (req.body.user_profile) {
          var userProfile = req.body['user_profile'];
          delete req.body['user_profile'];
          Object.keys(userProfile).forEach(function(key) {
            existing[key] = userProfile[key];
          });

          if (Object.prototype.toString.call(userProfile.department) === '[object Object]') {
            delete req.body.department;
            existing.department = userProfile.department.uuid;
          }
        }

        var userInstance = UserProfile.build(existing);
        var promises = [
          UserProfile.count({where: {email: existing.email, id: {ne: userID}}}),
          UserProfile.count({where: {username: existing.username, id: {ne: userID}}}),
          UserProfile.count({where: {phone: existing.phone, id: {ne: userID}}}),
          UserProfile.count({where: {work_phone: existing.work_phone, id: {ne: userID}}}),
          UserProfile.count({where: {home_phone: existing.home_phone, id: {ne: userID}}}),
          userInstance.validate()
        ];
        Q.all(promises)
          .then(function(response) {

            var otherValidation = utility.formatErrors(response[5]);
            var uniqueChecks = [
              {key: 'email', message: utility.uniqueCheck(response[0], 'Email')},
              {key: 'username', message: utility.uniqueCheck(response[1], 'Username')},
              {key: 'phone', message: utility.uniqueCheck(response[2], 'Phone')}
            ];

            if (req.body['work_phone'] !== null && req.body['work_phone'] !== '' && req.body['work_phone'] !== 'null') {
              uniqueChecks.push(
                {key: 'work_phone', message: utility.uniqueCheck(response[3], 'Work Phone')}
              );
            }

            if (req.body['home_phone'] && req.body['home_phone'] !== '' && req.body['home_phone'] !== 'null') {
              uniqueChecks.push(
                {key: 'home_phone', message: utility.uniqueCheck(response[4], 'Home Phone')}
              );
            }


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

        /*User.create(existing)
         .complete(function(err, user) {
         if (!err) {
         res.json(user);
         }
         });*/
      } else {
        res.status(500);
        res.json({no_user: err});
      }

    });
};