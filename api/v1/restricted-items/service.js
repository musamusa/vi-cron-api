'use strict';
var utility = require('../../../components/utility/index');
var ModelObject = require('./model');
var Model = ModelObject.model;
var attr = ModelObject.attr;
var $q = require('q');

var attrParams = {attributes: attr};

function all(req, res) {
  var deferred = $q.defer();

  Model.findAll(attrParams)
    .then(function(response) {
      deferred.resolve(response);
    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function getByField(req) {
  var deferred = $q.defer();
  if (Object.keys(req.query).length !== 0) {
    Model.find({where: req.query, attributes: attr})
      .then(function(response) {
        deferred.resolve(response);
      })
      .catch(function(reason) {
        deferred.reject({status: 500, reason: reason});
      });
  } else {
    deferred.reject('Nothing to see here');
  }

  return deferred.promise;
}

function get(req) {
  var deferred = $q.defer();
  Model.find({where: {_id: req.params._id}, attributes: attr})
    .then(function(response) {
      response = response || {};
      deferred.resolve(response);
    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function create(req) {
  var deferred = $q.defer();
  req.body['_id'] = utility.getUUID(req.body._id, req.params._id);
  req.body['_rev'] = utility.getRev( req.query._rev);
  var Instance = Model.build(req.body);
  var promises = [
    Instance.validate()
  ];
  $q.all(promises)
    .then(function(response) {
      var otherValidation = utility.formatErrors(response[0]);
      otherValidation = utility.appendMultipleErrors(otherValidation, []);

      if (Object.keys(otherValidation).length) {
        deferred.reject({status: 500, reason: otherValidation});
      } else {
        Instance.save()
          .then(function(response) {
            deferred.resolve(response);
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
  var id = req.params._id;
  Model.find({where: {_id: id}, attributes: attr})
    .then(function(response) {
      if (response) {
        var existing = response.dataValues;
        Object.keys(existing)
          .forEach(function(key) {
            if (req.body.hasOwnProperty(key)) {
              existing[key] = req.body[key];
            }
            if (key === '_rev') {
              existing[key] = utility.getRev(existing[key]);
            }
          });

        var Instance = Model.build(existing);
        var promises = [
          Instance.validate()
        ];
        $q.all(promises)
          .then(function(validationResponse) {
            var otherValidation = utility.formatErrors(validationResponse[0]);
            otherValidation = utility.appendMultipleErrors(otherValidation, []);
            if (Object.keys(otherValidation).length > 0) {
              deferred.reject({status: 400, reason: otherValidation});
            } else {
              response.updateAttributes(existing)
                .then(function(response) {
                  deferred.resolve(response);
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
        deferred.reject({status: 404, reason: 'no data'});
      }
    })
    .catch(function(reason) {
      deferred.reject({status: 500, reason: reason});
    });

  return deferred.promise;
}

function remove(req) {
  var deferred = $q.defer();
  var id = req.params._id;
  Model.find({where: {_id: id}})
    .then(function(response) {
      response.destroy()
        .then(function() {
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

module.exports = (function(){
  return {
    all: all,
    get: get,
    getByField: getByField,
    create: create,
    update: update,
    remove: remove
  }
})();