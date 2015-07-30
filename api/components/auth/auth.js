var jwt = require('jwt-simple');
var User = require('../../v1/users/model').model;
var Token = require('../../v1/token/model').model;
var cache = require('memory-cache');
var $q = require('q');
var utility = require('app/utility');

var auth = {

  login: function(req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';

    if (username == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "detail": "Invalid credentials"
      });
      return;
    }

    // Fire a query to your DB and check if the credentials are valid
    auth.validate(username, password)
      .then(function(user) {
        if (user === null) {
          res.status(401);
          res.json({
            "status": 401,
            "detail": "Invalid credentials"
          });
        } else {
          genToken(user, res);
        }
      })
      .catch(function(reason) {
        res.status(500);
        res.json({
          "status": 500,
          "detail": reason
        });
      });
  },

  validate: function(username, password) {
    var deferred = $q.defer();
    User.find({where: {username: username, password: utility.generatePassword(password)}})
      .then(function(user) {
        deferred.resolve(user);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  },

  ldap: function(username, password) {
    var ldap;
  },
  Authorise: function(req, res, next) {
    var token = req.headers.authorization;
    var errorMsg = {detail: {error: 'unauthorized', message: 'You are not an authorized user'}};

    if (token !== '' && token !== null && token !== undefined) {
      token = token.split(' ').pop();
      validateUser(token)
        .then(function(response) {
          if (!response) {
            res.status(401);
            res.json(errorMsg);
          } else {
            next();
          }
        })
        .catch(function(reason) {
          res.status(500);
          res.json(reason);
        });
    } else {
      res.status(401);
      res.json(errorMsg);
    }
  }
};

function validateUser(token) {
  var deferred = $q.defer();
  Token.findAll({where: {_id: token}})
    .then(function(response) {
      deferred.resolve(response.length > 0);
    })
    .catch(function(reason) {
      deferred.reject({detail: reason});
    });

  return deferred.promise;
}


// private method
function genToken(user, res) {
  Token.find({where: {user_id: user._id}})
    .then(function(response) {
      User.find({where: {_id: user._id}})
        .then(function(resp) {
          resp.updateAttributes({last_login:  new Date()})
            .then(function(u) {
              var cachedUsers = cache.get('users') || {};
              cachedUsers[u._id] = u;
              cache.put('users', cachedUsers);
            })
            .catch(function(reason) {
              console.log(reason);
            });
        })
        .catch(function(reason) {

        });

      if (response) {
        res.json({
          token: response._id,
          user: user
        });
      } else {
        Token.build({
          _id: utility.createUUID(),
          _rev: utility.getRev(),
          user_id: user._id
        })
          .save()
          .then(function(token) {
            res.json({
              token: token._id,
              user: user
            });
          })
          .catch(function(reason) {
            res.status(500);
            res.json({detail: reason});
          });
      }

    })
    .catch(function(reason) {
      res.status(500);
      res.json({detail: reason});
    });
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;