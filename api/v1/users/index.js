var router = require('express').Router();
var express = require('express')();

'use strict';
var utility = require('../../../utility');
var User = require('./model');
var Q = require('q');

var attr = [
  'id',
  'username',
  'first_name',
  'last_name',
  'email',
  'is_superuser',
  'is_staff',
  'is_active',
  'phone',
  'work_phone',
  'home_phone',
  'department',
  'created',
  'modified'
];

var attrParams = {attributes: attr};

router.get('/all', function(req, res) {
  console.log(express.path());
  User.findAll(attrParams)
    .complete(function(err, users) {
      return res.json(users);
    });
});

router.get('/:id', function(req, res) {

  User.find({where: {id: req.params.id}, attributes: attr})
    .complete(function(err, user) {
      res.json(user);
    });
});

router.post('/', function(req, res) {
  var userInstance = User.build(req.body);

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
    User.count({where: {email: req.body.email}}),
    User.count({where: {username: req.body.username}}),
    User.count({where: {phone: req.body.phone}}),
    User.count({where: {work_phone: req.body.work_phone}}),
    User.count({where: {home_phone: req.body.home_phone}}),
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
});

router.put('/:id', function(req, res) {
  var userID = parseInt(req.params.id);
  attr.push('password');
  User.find({where: {id: userID}, attributes: attr})
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

        var userInstance = User.build(existing);
        var promises = [
          User.count({where: {email: existing.email, id: {ne: userID}}}),
          User.count({where: {username: existing.username, id: {ne: userID}}}),
          User.count({where: {phone: existing.phone, id: {ne: userID}}}),
          User.count({where: {work_phone: existing.work_phone, id: {ne: userID}}}),
          User.count({where: {home_phone: existing.home_phone, id: {ne: userID}}}),
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
});

module.exports = router;