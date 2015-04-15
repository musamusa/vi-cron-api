'use strict';
var connection = require('./index.js');
var Users = require('../api/v1/users/model');
var Visitors = require('../api/v1/visitors/model');
require('../api/v1/appointments/model');
require('../api/v1/departments/model');
require('../api/v1/entrance/model');
require('../api/v1/restricted-items/model');
var utility = require('../utility');


connection
  .sync()
  .complete(function(err) {
    if (!!err) {
      console.log('An error occurred while creating the table:', err)
    } else {
      Users.create({
        "username": "admin",
        "password": utility.generatePassword('12345'),
        "email": "admin@gmail.com",
        "first_name": "System",
        "last_name": "Admin",
        "is_superuser": true,
        "is_staff": true,
        "is_active": true,
        "phone": "0809998888",
        "home_phone": null,
        "work_phone": null
      }).complete(function(err, user) {
        if (err) {
          console.log(err);
        } else {

        }
      });
    }
  });