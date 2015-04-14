/**
 * Main application routes
 */

'use strict';

//var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v1/user', require('./api/v1/users'));
  app.use('/api/v1/visitor', require('./api/v1/visitors'));

  //app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404]);

  // All other routes should redirect to the index.html

};