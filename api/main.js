var router = require('express').Router();

module.exports = function(app) {
  router.route('/users').get(function(req, res) {
    res.json('this is a test');
  });
};