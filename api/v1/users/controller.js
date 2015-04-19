'use strict';
var UserProfileController = require('../user-profile/controller');
var UserProfile = require('../user-profile/model');
var connection = require('../../../db');
var service = require('./service');
var express = require('express')();
var utility = require('../../../utility');
var User = require('./model');
var $q = require('q');

var attr = [
  'id',
  'username',
  'first_name',
  'last_name',
  'email',
  'is_superuser',
  'is_staff',
  'is_active',
  'last_login',
  'created',
  'modified'
];

var nonSearchFields = [
  'id',
  'is_superuser',
  'is_staff',
  'is_active',
  'created',
  'modified'
];

var attrParams = {attributes: attr};

function _rawQuery(_params) {

  var deferred = $q.defer();
  var params = _params || {};
  var where = '', whereList = [], orderBy = '', _limit = '', offset = '', limit = params.limit;
  var query = params.query || {};

  if (Object.keys(query).length !== 0) {
    (Object.keys(query)).forEach(function(key) {
      //make sure fields exists in tables
      if (attr.indexOf(key) !== -1 ) {
        whereList.push('a.'+key+' LIKE \''+query[key]+'\'');
      }

      if (UserProfileController.attr.indexOf(key) !== -1 ) {
        whereList.push('b.'+key+' LIKE \''+query[key]+'\'');
      }
    });

    _limit = query.limit ? query.limit : limit;
    _limit = _limit ? ' LIMIT '+_limit : '';

    if (whereList.length > 0) {
      where = 'WHERE ('+ whereList.join(') AND (') + ')';
    }
  }

  var userQueryAttr = [];
  var profileQueryAttr = [];
  attr.forEach(function(key) {
    userQueryAttr.push('a.'+key);
  });

  UserProfileController.attr.forEach(function(key) {
    userQueryAttr.push('b.'+key);
  });

  connection.query("SELECT "+userQueryAttr.concat(profileQueryAttr).join(',')+" FROM " +
  "Users as a LEFT JOIN UserProfiles as b ON (a.id = b.user_id) " + where + _limit)
    .spread(function(nestedUsers){
      nestedUsers = service.nestList(nestedUsers, {key: 'user_profile', fields: UserProfileController.attr});
      deferred.resolve(nestedUsers);
    });
  return deferred.promise;
}

exports.query = _rawQuery;

exports.all = function(req, res) {
  var params = {
    query: req.query
  };
  _rawQuery(params)
    .then(function(users) {
      res.json(users);
    });
};

exports.get = function(req, res) {
  var where = {};
  if (Object.keys(req.query).length !== 0) {
    var params = {
      limit: 1,
      query: req.query
    };
    _rawQuery(params)
      .then(function(result) {
        result = result.length ? result[0] : {};
        res.json(result);
      });
  } else {
    res.status(400);
    res.json('Nothing to see here');
  }
};

exports.getUser = function(req, res) {

  var params = {
    limit: 1,
    query: req.query
  };
  _rawQuery(params)
    .then(function(result) {
      result = result.length ? result[0] : {};
      res.json(result);
    });
};

exports.create = function(req, res) {
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
    UserProfile.count({where: {phone: req.body.phone}}),
    UserProfile.count({where: {work_phone: req.body.work_phone}}),
    UserProfile.count({where: {home_phone: req.body.home_phone}}),
    userInstance.validate()
  ];
  $q.all(promises)
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
        $q.all(promises)
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