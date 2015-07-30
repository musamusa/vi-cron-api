'use strict';

var service = require('app/service');
var utility = require('app/utility');
var memoryCache = require('app/cache');
var ModelObject = require('./model');
var departmentsModel = require('../departments/model');
var Model = ModelObject.model;
var attr = ModelObject.attr;
var $q = require('q');
var cache = require('memory-cache');
var DB_NAME = 'users';

function all(req) {
  var deferred = $q.defer();

  var img = attr.indexOf('image');
  if (img !== -1) {
    attr.splice(img, 1);
  }
  var obj = utility.extendObj(req.params, req.query);
  var where = service.computeWhere(attr, obj);
  where.attributes = attr;
  var cached = memoryCache.get(DB_NAME, obj);
  if (!utility.isEmptyObject(cached)) {
    deferred.resolve(cached);
  } else {
    return Model.findAll(where)
      .then(nestUser)
      .catch(function(reason) {
        return {status: 500, reason: reason};
      });
  }

  return deferred.promise;
}

function get(req) {
  var deferred = $q.defer(), cached = cache.get(DB_NAME);
  var obj = utility.extendObj(req.params, req.query);
  var where = service.computeWhere(attr, obj);
  where.attributes = attr;
  cached = cached || {};
  var cachedData = cached[req.params._id];
  if (cachedData) {
    deferred.resolve(cachedData);
  } else {
    return Model.find(where)
      .then(nestUser)
      .catch(function(reason) {
        //deferred.reject({status: 500, reason: reason});
        return {status: 500, reason: reason};
      });
  }
  return deferred.promise;
}

function create(req) {
  var deferred = $q.defer();
  req.body['_id'] = utility.getUUID(req.body._id, req.params._id);
  req.body['_rev'] = utility.getRev(req.query._rev);
  if (req.body.hasOwnProperty('password')) {
    req.body.password = utility.generatePassword(req.body.password);
  }
  var userInstance = Model.build(req.body);

  var promises = [
    Model.count({where: {email: req.body.email}}),
    Model.count({where: {username: req.body.username}}),
    Model.count({where: {$or: {phone: req.body.phone, work_phone: req.body.phone, home_phone: req.body.phone}}}),
    Model.count({where: {$or: {phone: req.body.work_phone, work_phone: req.body.work_phone, home_phone: req.body.work_phone}}}),
    Model.count({where: {$or: {phone: req.body.home_phone, work_phone: req.body.home_phone, home_phone: req.body.home_phone}}}),

    Model.count({where: {$or: {work_phone: req.body.phone, home_phone: req.body.phone}}}),
    Model.count({where: {$or: {phone: req.body.work_phone, home_phone: req.body.work_phone}}}),
    Model.count({where: {$or: {phone: req.body.home_phone, work_phone: req.body.home_phone}}}),
    userInstance.validate()
  ];

  return $q.all(promises)
    .then(function(response) {
      var uniqueChecks = [
        {key: 'email', message: utility.uniqueCheck(response[0], 'Email')},
        {key: 'username', message: utility.uniqueCheck(response[1], 'Username')},
        {key: 'phone', message: utility.uniqueCheck(response[2], 'Phone')},
        {key: 'phone', message: utility.uniqueCheck(response[5], 'Phone')}
      ];

      if ((req.body.phone === req.body.work_phone || req.body.phone === req.body.home_phone) && req.body.phone) {
        uniqueChecks.push(
          {key: 'phone', message: utility.uniqueCheck(1, 'Phone')}
        );
      }

      if (req.body['work_phone'] !== null && req.body['work_phone'] !== '' && req.body['work_phone'] !== 'null') {
        uniqueChecks.push(
          {key: 'work_phone', message: utility.uniqueCheck(response[3], 'Work Phone')}
        );
        uniqueChecks.push(
          {key: 'work_phone', message: utility.uniqueCheck(response[6], 'Work Phone')}
        );

        if ((req.body.phone === req.body.work_phone || req.body.work_phone === req.body.home_phone) && req.body.work_phone) {
          uniqueChecks.push(
            {key: 'work_phone', message: utility.uniqueCheck(1, 'Work Phone')}
          );
        }
      }

      if (req.body['home_phone'] && req.body['home_phone'] !== '' && req.body['home_phone'] !== 'null') {
        uniqueChecks.push(
          {key: 'home_phone', message: utility.uniqueCheck(response[4], 'Home Phone')}
        );
        uniqueChecks.push(
          {key: 'home_phone', message: utility.uniqueCheck(response[7], 'Home Phone')}
        );

        if ((req.body.phone === req.body.home_phone || req.body.work_phone === req.body.home_phone) && req.body.home_phone) {
          uniqueChecks.push(
            {key: 'home_phone', message: utility.uniqueCheck(1, 'Home Phone')}
          );
        }
      }
      var otherValidation = utility.formatErrors(response[8]);
      otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
      if (Object.keys(otherValidation).length) {
        //deferred.reject();
        return {status: 400, reason: otherValidation};
      } else {
        return userInstance.save()
          .then(nestUser)
          .catch(function(err) {
            return {status: 500, reason: err};
          });
      }

    })
    .catch(function(reason) {
      return {status: 500, reason: reason};
    });

}

function update(req) {
  var deferred = $q.defer();
  var userID = req.params._id;
  attr.push('password');
  return Model.find({where: {_id: userID}, attributes: attr})
    .then(function(user) {

      if (user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (key === 'password' && req.body.hasOwnProperty(key) && req.body.password !== '' && req.body.password !== undefined) {
              existing[key] = utility.generatePassword(req.body[key]);
            }
            if (req.body.hasOwnProperty(key) && key !== 'password') {
              existing[key] = req.body[key];
            }
            if (key === '_rev') {
              existing[key] = utility.getRev(existing[key]);
            }
          });

        var userInstance = Model.build(existing);
        var promises = [
          Model.count({where: {email: existing.email, _id: {ne: userID}}}),
          Model.count({where: {username: existing.username, _id: {ne: userID}}}),
          Model.count({where: {$or: {phone: existing.phone, work_phone: existing.phone, home_phone: existing.phone}, _id: {ne: userID}}}), //phone
          Model.count({where: {$or: {phone: existing.work_phone, work_phone: existing.work_phone, home_phone: existing.work_phone}, _id: {ne: userID}}}), //work_phone
          Model.count({where: {$or: {phone: existing.home_phone, work_phone: existing.home_phone, home_phone: existing.home_phone}, _id: {ne: userID}}}), //home_phone
          Model.count({where: {$or: {work_phone: existing.phone, home_phone: existing.phone}}}),
          Model.count({where: {$or: {phone: existing.work_phone, home_phone: existing.work_phone}}}),
          Model.count({where: {$or: {phone: existing.home_phone, work_phone: existing.home_phone}}}),
          userInstance.validate()
        ];
        return $q.all(promises)
          .then(function(response) {

            var otherValidation = utility.formatErrors(response[8]);
            var uniqueChecks = [
              {key: 'email', message: utility.uniqueCheck(response[0], 'Email')},
              {key: 'username', message: utility.uniqueCheck(response[1], 'Username')},
              {key: 'phone', message: utility.uniqueCheck(response[2], 'Phone')},
              {key: 'phone', message: utility.uniqueCheck(response[5], 'Phone')}
            ];

            if ((req.body.phone === req.body.work_phone || req.body.phone === req.body.home_phone) && req.body.phone) {
              uniqueChecks.push(
                {key: 'phone', message: utility.uniqueCheck(1, 'Phone')}
              );
            }

            if (req.body.work_phone !== null && req.body.work_phone !== '' && req.body.work_phone !== null && req.body.hasOwnProperty('work_phone')) {

              uniqueChecks.push(
                {key: 'work_phone', message: utility.uniqueCheck(response[3], 'Work Phone')}
              );
              uniqueChecks.push(
                {key: 'work_phone', message: utility.uniqueCheck(response[6], 'Work Phone')}
              );

              if ((req.body.phone === req.body.work_phone || req.body.work_phone === req.body.home_phone) && req.body.work_phone ) {
                uniqueChecks.push(
                  {key: 'work_phone', message: utility.uniqueCheck(1, 'Work Phone')}
                );
              }
            }

            if (req.body['home_phone'] && req.body['home_phone'] !== '' && req.body['home_phone'] !== null && req.body.hasOwnProperty('home_phone')) {
              uniqueChecks.push(
                {key: 'home_phone', message: utility.uniqueCheck(response[4], 'Home Phone')}
              );
              uniqueChecks.push(
                {key: 'home_phone', message: utility.uniqueCheck(response[7], 'Home Phone')}
              );

              if ((req.body.phone === req.body.home_phone || req.body.work_phone === req.body.home_phone) && req.body.home_phone) {
                uniqueChecks.push(
                  {key: 'home_phone', message: utility.uniqueCheck(1, 'Home Phone')}
                );
              }
            }


            otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
            if (Object.keys(otherValidation).length) {
              //deferred.reject({status: 400, reason: otherValidation});
              return {status: 400, reason: otherValidation};
            } else {
              return user.updateAttributes(existing)
                .then(nestUser)
                .catch(function(err) {
                  return {status: 500, reason: err};
                });
            }

          })
          .catch(function(reason) {
            //deferred.reject({status: 500, reason: reason});
            return {status: 500, reason: reason};
          });

      } else {
        //deferred.reject({status: 404, reason: 'user not found'});
        return {status: 404, reason: 'user not found'};
      }

    })
    .catch(function(reason) {
      //deferred.reject({status: 500, reason: reason});
      return {status: 500, reason: reason};
    });

  //return deferred.promise;
}

function remove(req) {
  var deferred = $q.defer();
  var userID = req.params._id;
  var cached = cache.get(DB_NAME) || {};
  Model.find({where: {_id: userID}})
    .then(function(user) {
      user.destroy()
        .then(function() {
          delete cached[userID];
          cache.put(DB_NAME, cached);
          deferred.resolve({_id: userID});
        })
        .catch(function(reason) {
          deferred.reject({status: 500, reason: reason});
        });
    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function nestUser(user) {
  var fromArray = utility.isArray(user);
  user = user || {};
  if (!utility.isEmptyObject(user) && user.department !== undefined && user.department !== '' && user.department !== null && !fromArray) {
    return departmentsModel.model.find({where: {_id: user.department}})
      .then(function(department) {
        department = department || {};
        user.department = department;
        cacheData(user, fromArray);
        return user
      })
      .catch(function() {
        return user;
      });
  }else if (fromArray) {
    var promises = [];
    (function () {
      for (var i = 0; i < user.length; i++) {
        promises.push(departmentsModel.model.find({where: {_id: user[i]._id}}))
      }
      return $q.all(promises)
        .then(function (departments) {
          (function () {
            for (var i = 0; i < departments.length; i++) {
              user[i].department = departments[i] || {};
            }
          })();
          cacheData(user, fromArray);
          return user;
        })
        .catch(function () {
          cacheData(user, fromArray);
          return user;
        })
    })();
  }
  cacheData(user, fromArray);
  return user;
}

function cacheData(user, fromArray) {
  try {
    var cache = require('memory-cache');
    if (!fromArray) {
      var cached = cache.get(DB_NAME) || {};
      cached[user._id] = user;
      cache.put(DB_NAME, cached);
    } else if (fromArray) {
      cache.put(DB_NAME, user);
    }

  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  nest: nestUser,
  all: all,
  get: get,
  create: create,
  update: update,
  remove: remove
};