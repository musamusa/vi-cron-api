'use strict';
module.exports = function() {
  var $q = require('q');
  var cache = require('memory-cache');
  var User = require('../../v1/users/model');
  var Visitor = require('../../v1/visitors/model');
  var Appointment = require('../../v1/appointments/model');
  var Department = require('../../v1/departments/model');
  var Entrance = require('../../v1/entrance/model');
  var RestrictedItems = require('../../v1/restricted-items/model');
  var VisitorsGroup = require('../../v1/visitors-group/model');
  var Token = require('../../v1/token/model');
  var utility = require('app/utility');
  var company = require('../../v1/company/model');

  function loadNestedUsers() {
    var userAttr = utility.clone(User.attr);
    var img = userAttr.indexOf('image');
    if (img !== -1) {
      userAttr.splice(img, 1);
    }
    var deferred = $q.defer();
    var promises = [
      User.model.findAll(),
      Department.model.findAll()
    ];
    $q.all(promises)
      .then(function(response) {
        var users = utility.arrayToObject(response[0], '_id');
        var departments = utility.arrayToObject(response[1], '_id');
        for (var key in users) {
          if (users.hasOwnProperty(key)) {
            users[key].department = departments[users[key].department] || {};
          }
        }
        cache.put('users', users);
        deferred.resolve(users);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  }

  function loadNestedVisitors() {
    var attr = utility.clone(Visitor.attr),
      img = attr.indexOf('image'),
      fingerprint = attr.indexOf('fingerprint'),
      signature = attr.indexOf('signature');
    if (img !== -1) {
      attr.splice(img, 1);
      attr.splice(fingerprint, 1);
      attr.splice(signature, 1);
    }
    var deferred = $q.defer();
    var promises = [
      Visitor.model.findAll(),
      VisitorsGroup.model.findAll(),
      company.model.findAll()
    ];
    $q.all(promises)
      .then(function(response) {
        var visitors = utility.arrayToObject(response[0], '_id');
        var groups = utility.arrayToObject(response[1], '_id');
        var companies = utility.arrayToObject(response[2], '_id');
        for (var key in visitors) {
          if (visitors.hasOwnProperty(key)) {
            visitors[key].group = groups[visitors[key].group] || {};
            visitors[key].company = companies[visitors[key].company] || {};
          }
        }
        cache.put('visitors', visitors);
        deferred.resolve(visitors);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  }

  function loadNestedAppointments(inputResponse) {
    var users = inputResponse[0] || {}, visitors = inputResponse[1] || {} ;
    var attr = utility.clone(Appointment.attr),
      img = attr.indexOf('image'),
      fingerprint = attr.indexOf('fingerprint'),
      signature = attr.indexOf('signature');
    if (img !== -1) {
      attr.splice(img, 1);
      attr.splice(fingerprint, 1);
      attr.splice(signature, 1);
    }
    var deferred = $q.defer();
    var promises = [
      Appointment.model.findAll(),
      Entrance.model.findAll(),
      RestrictedItems.model.findAll()
    ];
    $q.all(promises)
      .then(function(response) {
        var appointments = utility.arrayToObject(response[0], '_id');
        var entrance = utility.arrayToObject(response[1], '_id');
        var restrictedItems = utility.arrayToObject(response[1], '_id');
        for (var key in appointments) {
          if (appointments.hasOwnProperty(key)) {
            appointments[key].entrance_id = entrance[appointments[key].entrance_id] || {};
            appointments[key].host_id = users[appointments[key].host_id] || {};
            appointments[key].visitor_id = visitors[appointments[key].visitor_id] || {};
          }
        }
        cache.put('appointments', appointments);
        deferred.resolve(appointments);
      })
      .catch(function(reason) {
        deferred.reject(reason);
      });

    return deferred.promise;
  }

  return $q.all([loadNestedUsers(), loadNestedVisitors()])
    .then(loadNestedAppointments);
};