var jwt = require('jwt-simple');
var User = require('../../v1/users/model');
var UserController = require('../../v1/users/controller');
var $q = require('q');
var utility = require('../../../utility');

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
          res.json(genToken(user));
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
    var params = {
      query: {
        username: username,
        password: utility.generatePassword(password)
      },
      limit: 1
    };
    UserController.query(params)
      .then(function(user) {
        if (!user.length) {
          deferred.reject('no user');
        } else {
          deferred.resolve(user[0]);
        }
      });

    return deferred.promise;
  },

  ldap: function(username, password) {
    var ldap;
  },

  validateUser: function(username) {
    var deferred = $q.defer();
    User.find({where: {username: username}})
      .complete(function(err, user) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(user);
        }
      });

    return deferred.promise;
  }
};

// private method
function genToken(user) {
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
    exp: expires
  }, require('../../../config/config').SECRET);

  return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;