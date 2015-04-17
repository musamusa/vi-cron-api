'use strict';
var connection = require('./index.js');
var Users = require('../api/v1/users/model');
var UserProfile = require('../api/v1/user-profile/model');
var Visitors = require('../api/v1/visitors/model');
require('../api/v1/appointments/model');
require('../api/v1/departments/model');
require('../api/v1/entrance/model');
require('../api/v1/restricted-items/model');
var utility = require('../utility');


connection
  .sync({force: true})
  .complete(function(err) {
    if (!!err) {
      console.log('An error occurred while creating the table:', err)
    } else {
      Users.create({
        "username": "admin",
        "password": utility.generatePassword('12345'),
        "email": 'admin@gmail.com',
        "first_name": 'System',
        "last_name": 'Admin',
        "is_superuser": true,
        "is_staff": true,
        "is_active": true
      }).complete(function(err, user) {
        if (err) {
          console.log(err);
        } else {
          UserProfile.create({
            "user_id": user.id,
            "phone": '08067886565',
            "home_phone": ''
          }).complete(function(err, profile) {
            if (err) {
              console.log(err);
            } else {

            }
          });
        }
      });
    }
  });