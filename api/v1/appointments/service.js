'use strict';

var service = require('app/service');
var utility = require('app/utility');
var ModelObject = require('./model');
var Model = ModelObject.model;
var attr = ModelObject.attr;
var $q = require('q');
var cache = require('memory-cache');
var DB_NAME = 'appointments';
var memoryCache = require('app/cache');
var nest = {
  user: {
    service: require('../users/service'),
    model: require('../users/model')
  },
  visitor: {
    service: require('../visitors/service'),
    model: require('../visitors/model')
  },
  entrance: {
    service: require('../entrance/service'),
    model: require('../entrance/model')
  }
};


function all(req, res) {
  var deferred = $q.defer();
  var obj = utility.extendObj(req.params, req.query);
  var where = service.computeWhere(attr, obj);
  where.attributes = attr;
  var cached = memoryCache.get(DB_NAME, obj);

  if (!utility.isEmptyObject(cached)) {
    deferred.resolve(cached);
  } else {
    return Model.findAll(attrParams)
      .then(nestAppointment)
      .catch(function (reason) {
        //deferred.reject({status: 500, reason: reason});
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
  req.body['_rev'] = utility.getRev( req.params.rev);
  var Instance = Model.build(req.body);
  var promises = [
    Instance.validate()
  ];
  return $q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[0]);
      otherValidation = utility.appendMultipleErrors(otherValidation, []);

      if (Object.keys(otherValidation).length) {
        //deferred.reject({status: 500, reason: otherValidation});
        return {status: 400, reason: otherValidation};
      } else {
        return Instance.save()
          .then(nestAppointment)
          .catch(function(reason) {
            //deferred.reject({status: 500, reason: reason});
            return {status: 500, reason: reason};
          });
      }
    })
    .catch(function(reason) {
      //deferred.reject({status: 500, reason: reason});
      return {status: 500, reason: reason};
    });

  //return deferred.promise;
}

function update(req) {
  var deferred = $q.defer();
  var id = req.params._id;
  return Model.find({where: {_id: id}, attributes: attr})
    .then(function(response) {
      if (response) {
        var existing = response.dataValues;
        for(var key in existing) {
          if (existing.hasOwnProperty(key)) {
            if (req.body.hasOwnProperty(key)) {
              existing[key] = req.body[key];
            }
            if (key === '_rev') {
              existing[key] = utility.getRev(existing[key]);
            }
          }
        }

        var Instance = Model.build(existing);
        var promises = [
          Instance.validate()
        ];
        return $q.all(promises)
          .then(function(validationResponse) {
            var otherValidation = utility.formatErrors(validationResponse[0]);
            otherValidation = utility.appendMultipleErrors(otherValidation, []);
            if (Object.keys(otherValidation).length > 0) {
              //deferred.reject({status: 400, reason: otherValidation});
              return {status: 400, reason: otherValidation};
            } else {
              response.updateAttributes(existing)
                .then(nestAppointment)
                .catch(function(reason) {
                  //deferred.reject({status: 500, reason: reason});
                  return {status: 500, reason: reason};
                });
            }

          })
          .catch(function(reason) {
            //deferred.reject({status: 500, reason: reason});
            return {status: 500, reason: reason};
          });

      } else {
        //deferred.reject({status: 404, reason: 'no data'});
        return {status: 404, reason: 'no data'}
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
  var id = req.params._id;
  var cached = cache.get(DB_NAME) || {};
  Model.find({where: {_id: id}})
    .then(function(response) {
      response.destroy()
        .then(function() {
          delete cached[userID];
          cache.put(DB_NAME, cached);
          deferred.resolve({_id: id});
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function nestAppointment(appointment) {
  var fromArray = utility.isArray(appointment);
  appointment = appointment || {};
  if (!utility.isEmptyObject(appointment) && !fromArray) {
    var promises = [
      nest.users.model.model.find({where: {_id: appointment.host_id}}),
      nest.visitors.model.model.find({where: {_id: appointment.visitor_id}}),
      nest.entrance.model.model.find({where: {_id: appointment.entrance_id}})
    ];

    return $q.all(promises)
      .then(function(response) {
        var user = response[0];
        var visitor = response[1];
        var entrance = response[2];
        appointment.host_id = user || {};
        appointment.visitor_id = visitor || {};
        appointment.entrance_id = entrance || {};
        cacheData(appointment, fromArray);

        return appointment;
      })
      .catch(function() {
        return appointment;
      });
  } else if (fromArray) {
    (function () {
      var promises = {};
      for (var i = 0; i < appointment.length; i++) {
        promises[['host_id', i].join('')] = nest.users.model.model.find({where: {_id: appointment[i].host_id}});
        promises[['visitor_id', i].join('')] = nest.visitors.model.model.find({where: {_id: appointment[i].visitor_id}});
        promises[['entrance_id', i].join('')] = nest.entrance.model.model.find({where: {_id: appointment[i].entrance_id}});
      }
      return $q.all(promises)
        .then(function (response) {
          (function () {
            for (var i = 0; i < appointment.length; i++) {
              appointment[i].host_id = response[['host_id', i].join('')] || {};
              appointment[i].visitor_id = response[['visitor_id', i].join('')] || {};
              appointment[i].entrance_id = response[['entrance_id', i].join('')] || {};
            }
          })();
          cacheData(appointment, fromArray);
          return appointment;
        })
        .catch(function () {
          cacheData(appointment, fromArray);
          return appointment;
        });
    })();
  }

  cacheData(appointment, fromArray);
  return appointment;
}

function cacheData(appointment, fromArray) {
  try {
    var cache = require('memory-cache');
    if (!fromArray) {
      var cached = cache.get(DB_NAME) || {};
      cached[appointment._id] = appointment;
      cache.put(DB_NAME, cached);
    } else if (fromArray) {
      cache.put(DB_NAME, appointment);
    }

  } catch (e) {
    console.log(e);
  }
}

module.exports = (function(){
  return {
    all: all,
    get: get,
    create: create,
    update: update,
    remove: remove
  }
})();