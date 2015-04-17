/**
 * Main application routes
 */

'use strict';

//var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v1/user', require('./api/v1/users'));
  app.use('/api/v1/user-profile', require('./api/v1/user-profile'));
  app.use('/api/v1/visitor', require('./api/v1/visitors'));
  app.use('/api/v1/appointment', require('./api/v1/appointments'));
  app.use('/auth-user', require('./api/components/auth/login'));

  //app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404]);
};