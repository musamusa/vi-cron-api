/**
 * Main application routes
 */
'use strict';
//var userController = require('./api2/users/controller');
//var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v1/user', require('./api/v1/users'));
  app.use('/api/v1/department', require('./api/v1/departments'));
  app.use('/api/v1/visitor', require('./api/v1/visitors'));
  app.use('/api/v1/appointment', require('./api/v1/appointments'));
  app.use('/api/v1/restricted-items', require('./api/v1/restricted-items'));
  app.use('/api/v1/entrance', require('./api/v1/entrance'));
  app.use('/api/v1/visitors-group', require('./api/v1/visitors-group'));
  app.use('/auth-user', require('./api/components/auth/login'));
};