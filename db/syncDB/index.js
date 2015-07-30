'use strict';
(function() {

  var connection = require('app/db');
  var Users = require('../../api/v1/users/model').model;
  var Visitors = require('../../api/v1/visitors/model').model;
  var appointment = require('../../api/v1/appointments/model').model;
  var department = require('../../api/v1/departments/model').model;
  var Entrance = require('../../api/v1/entrance/model').model;
  var RestrictedItems = require('../../api/v1/restricted-items/model').model;
  var Token = require('../../api/v1/token/model').model;
  var utility = require('app/utility');
  var visitorsGroup = require('../../api/v1/visitors-group/model').model;
  var company = require('../../api/v1/company/model').model;

  var args = process.argv.slice(2), force = false;
  if (args.length > 0) {
    force = args[0] === 'force';
  }
  connection
    .sync({force: force})
    .then(function() {
      try {
        var fixture = require('../fixtures/initial-data');
        var $q = require('q');
        var promises = [
          //Users.create(fixture.users),
          //department.create(fixture.departments),
          //Token.create(fixture.token)
        ];
        for (var i = 0; i < fixture.visitorsGroup.length; i++) {
          promises.push(visitorsGroup.create(fixture.visitorsGroup[i]));
        }

        $q.all(promises)
          .catch(function(reason) {
            console.log('failed', reason);
          });

      } catch (e) {
        console.log(e);
      }
      console.log('Tables created successfully ');
    })
    .catch(function(err) {
      console.log('An error occurred while creating the table:', err)
    });
})();
