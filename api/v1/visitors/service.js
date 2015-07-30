'use strict';

var service = require('app/service');
var utility = require('app/utility');
var ModelObject = require('./model');
var Model = ModelObject.model;
var attr = ModelObject.attr;
var $q = require('q');
var cache = require('memory-cache');
var DB_NAME = 'visitors';
var memoryCache = require('app/cache');
var nest = {
  visitorsGroup: {
    service: require('../visitors-group/service'),
    model: require('../visitors-group/model')
  },
  company: {
    service: require('../company/service'),
    model: require('../company/model')
  }
};

function all(req) {
  var deferred = $q.defer();
  var obj = utility.extendObj(req.params, req.query);
  var where = service.computeWhere(attr, obj);
  where.attributes = attr;
  var cached = memoryCache.get(DB_NAME, obj);

  if (!utility.isEmptyObject(cached)) {
    deferred.resolve(cached);
  } else {
    return Model.findAll(where)
      .then(nestVisitor)
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
      .then(nestVisitor)
      .catch(function(reason) {
        return {status: 500, reason: reason};
      });
  }

  return deferred.promise;
}

function create(req) {
  var deferred = $q.defer();
  req.body['_id'] = utility.getUUID(req.body._id, req.params._id);
  req.body['_rev'] = utility.getRev(req.query._rev);
  var Instance = Model.build(req.body);


  var promises = [
    Model.count({where: {visitors_email: req.body.visitors_email}}),
    Model.count({where: {visitors_phone: req.body.visitors_phone}}),
    Instance.validate()
  ];
  $q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[2]);
      var uniqueChecks = [
        {key: 'visitors_email', message: utility.uniqueCheck(response[0], 'Visitors Email')},
        {key: 'visitors_phone', message: utility.uniqueCheck(response[1], 'Visitors Phone')}
      ];

      otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
      if (Object.keys(otherValidation).length) {
        deferred.reject({status: 400, reason: otherValidation});
      } else {
        Instance.save()
          .then(function(user) {
            deferred.resolve(user);
          })
          .catch(function(reason) {
            deferred.reject({status: 500, reason: reason});
          });
      }

    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });


  return deferred.promise;
}

function update(req) {
  var deferred = $q.defer();
  var userID = req.params._id;
  Model.find({where: {_id: userID}, attributes: attr})
    .then(function(user) {
      if (user) {
        var existing = user.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (req.body[key]) {
              existing[key] = req.body[key];
            }
          });

        var Instance = Model.build(existing);
        var promises = [
          Model.count({where: {visitors_email: req.body.visitors_email}, _id: {ne: userID}}),
          Model.count({where: {visitors_phone: req.body.visitors_phone}, _id: {ne: userID}}),
          Instance.validate()
        ];
        $q.all(promises)
          .then(function(response) {

            var otherValidation = utility.formatErrors(response[5]);
            var uniqueChecks = [
              {key: 'visitors_email', message: utility.uniqueCheck(response[0], 'Visitors Email')},
              {key: 'visitors_phone', message: utility.uniqueCheck(response[1], 'Visitors Phone')}
            ];

            otherValidation = utility.appendMultipleErrors(otherValidation, uniqueChecks);
            if (Object.keys(otherValidation).length) {
              deferred.reject({status: 400, reason: otherValidation});
            } else {
              user.updateAttributes(existing)
                .then(function(user) {
                  deferred.resolve(user);
                })
                .catch(function(reason) {
                  deferred.reject({status: 500, reason: reason});
                });
            }

          })
          .catch(function(reason) {
            deferred.reject({status: 500, reason: reason});
          });

      } else {
        deferred.reject({status: 404, reason: 'no visitor'});
      }

    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function remove(req, res) {
  var deferred = $q.defer();
  var userID = req.params._id;
  Model.find({where: {_id: userID}})
    .then(function(user) {
      user.destroy()
        .then(function() {
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

function nestVisitor(visitor) {
  var fromArray = utility.isArray(visitor);
  visitor = visitor || {};
  if (!utility.isEmptyObject(visitor) && !fromArray) {
    var promises = [
      nest.visitorsGroup.model.model.find({where: {_id: visitor.group}}),
      nest.company.model.model.find({where: {_id: visitor.company}})
    ];
    return $q.all(promises)
      .then(function(respponse) {
        visitor.group = respponse[0] || {};
        visitor.company = respponse[1] || {};
        cacheData(visitor, fromArray);
        return visitor;
      })
      .catch(function() {
        return visitor;
      });
  } else if (fromArray) {
    (function () {
      var promises = {};
      for (var i = 0; i < visitor.length; i++) {
        promises[['group', i].join('')] = nest.visitorsGroup.model.model.find({where: {_id: visitor[i].group}});
        promises[['company', i].join('')] = nest.company.model.model.find({where: {_id: visitor[i].company}});

      }
      return $q.all(promises)
        .then(function (response) {
          (function () {
            for (var i = 0; i < visitor.length; i++) {
              visitor[i].group = response[['group', i].join('')] || {};
              visitor[i].company = response[['company', i].join('')] || {};
            }
          })();
          cacheData(visitor, fromArray);
          return visitor;
        })
        .catch(function () {
          cacheData(visitor, fromArray);
          return visitor;
        });
    })();
  }

  cacheData(visitor, fromArray);
  return visitor;
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
  nest: nestVisitor,
  all: all,
  get: get,
  create: create,
  update: update,
  remove: remove
};