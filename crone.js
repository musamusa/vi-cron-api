'use strict';
var utility = require('./utility');
var setting = require('./system-manager');
var email = require('./email');
var sms = require('./beta-sms');
var url = require('url');
var Q = require('q');

var systemSetting = setting.getSetting();
var backendDomain = url.parse(systemSetting.client.backend);

function getAppointments() {
  var deferred = Q.defer();
  var params = {
    _address: backendDomain.hostname,
    path: '/api/v1/appointments/nested?is_expired=false',
    port: backendDomain.port
  };
  utility.get(params)
    .then(function(response) {
      var returnData = Object.prototype.toString.call(response.data) === '[object String]' ? JSON.parse(response.data) : response.data;
      deferred.resolve(returnData);

    })
    .catch(function(reason) {
      deferred.reject(reason);
    });
  return deferred.promise;
}

function setExpired(appointment) {
  var deferred = Q.defer();
  appointment.is_expired = true;
  var params = {
    _address: backendDomain.hostname,
    path: '/api/v1/appointments/'+appointment.uuid,
    port: backendDomain.port,
    data: JSON.stringify(appointment)
  };
  utility.put(params)
    .then(function(response) {
      var returnData = Object.prototype.toString.call(response.data) === '[object String]' ? JSON.parse(response.data) : response.data;
      deferred.resolve(returnData);

    })
    .catch(function(reason) {
      deferred.reject(reason);
    });
  return deferred.promise;
}

function updateExpired(appointment) {
  var now = new Date();
  var appointmentDate = new Date(appointment.appointment_date);
  if (now.getTime() > appointmentDate.getTime()) {
    setExpired(appointment);
  }
}

function setNotificationLog(id, notificationLog, type) {
  notificationLog = toString.call(notificationLog) !== '[object Object]' ? {} : notificationLog;

  if (notificationLog[id] !== undefined) {
    if (notificationLog[id][type] !== undefined) {
      notificationLog[id][type] = {
        time: new Date().toJSON(),
        sent: true
      };
    } else {
      notificationLog[id] = {};
      notificationLog[id][type] = {
        time: new Date().toJSON(),
        sent: true
      };
    }
  } else {
    notificationLog[id] = {};
    notificationLog[id][type] = {
      time: new Date().toJSON(),
        sent: true
    };
  }
}

function sendStartNotification(appointment, time, notificationLog) {
  var smsTemplate = 'Hi &&last_name&& &&first_name&&, your appointment with &&last_name1&& &&first_name1&& starts' +
    ' in about &&time&& mins';

  var emailTemaplate = 'Hi &&last_name&& &&first_name&&, your appointment with &&last_name1&& &&first_name1&& starts' +
    ' in about &&time&& mins';

  var visitorEmail = appointment.visitor_id.visitors_email,
    visitorPhone = appointment.visitor_id.visitors_phone,
    visitorFirstName = appointment.visitor_id.first_name,
    visitorLastName = appointment.visitor_id.last_name,

    hostEmail = appointment.host_id.email,
    hostPhone = appointment.host_id.user_profile.phone,
    hostFirstName = appointment.host_id.first_name,
    hostLastName = appointment.host_id.last_name;

  var visitorsParam = {
    last_name: visitorLastName,
    first_name: visitorFirstName,
    last_name1: hostLastName,
    first_name1: hostFirstName,
    time: time
  };

  var hostParams = {
    last_name1: visitorLastName,
    first_name1: visitorFirstName,
    last_name: hostLastName,
    first_name: hostFirstName,
    time: time
  };

  var visitorsSMSOptions = {
    mobiles: visitorPhone,
    message: utility.compileTemplate(visitorsParam, smsTemplate)
  };

  var hostSMSOptions = {
    mobiles: hostPhone,
    message: utility.compileTemplate(hostParams, smsTemplate)
  };

  var visitorsEmailOptions = {
    to: visitorEmail,
    subject: 'Appointment Reminder',
    message: utility.compileTemplate(visitorsParam, smsTemplate)
  };

  var hostEmailOptions = {
    to: hostEmail,
    subject: 'Appointment Reminder',
    message: utility.compileTemplate(hostParams, smsTemplate)
  };

  sms.sendSMS(visitorsSMSOptions);
  sms.sendSMS(hostSMSOptions);
  email.sendMail(visitorsEmailOptions);
  email.sendMail(hostEmailOptions);
  setNotificationLog(appointment.uuid, notificationLog, 'start');
}

function sendEndNotification(appointment, time, notificationLog) {
  var smsTemplate = 'Hi &&last_name&& &&first_name&&, your appointment with &&last_name1&& &&first_name1&& ends' +
    'in about &&time&& mins';

  var emailTemaplate = 'Hi &&last_name&& &&first_name&&, your appointment with &&last_name1&& &&first_name1&& ends' +
    'in about &&time&& mins';

  var visitorEmail = appointment.visitor_id.visitors_email,
    visitorPhone = appointment.visitor_id.visitors_phone,
    visitorFirstName = appointment.visitor_id.first_name,
    visitorLastName = appointment.visitor_id.last_name,

    hostEmail = appointment.host_id.email,
    hostPhone = appointment.host_id.user_profile.phone,
    hostFirstName = appointment.host_id.first_name,
    hostLastName = appointment.host_id.last_name;

  var visitorsParam = {
    last_name: visitorLastName,
    first_name: visitorFirstName,
    last_name1: hostLastName,
    first_name1: hostFirstName,
    time: time
  };

  var hostParams = {
    last_name1: visitorLastName,
    first_name1: visitorFirstName,
    last_name: hostLastName,
    first_name: hostFirstName,
    time: time
  };

  var visitorsSMSOptions = {
    mobiles: visitorPhone,
    message: utility.compileTemplate(visitorsParam, smsTemplate)
  };

  var hostSMSOptions = {
    mobiles: hostPhone,
    message: utility.compileTemplate(hostParams, smsTemplate)
  };

  var visitorsEmailOptions = {
    to: visitorEmail,
    subject: 'Appointment Reminder',
    message: utility.compileTemplate(visitorsParam, smsTemplate)
  };

  var hostEmailOptions = {
    to: hostEmail,
    subject: 'Appointment Reminder',
    message: utility.compileTemplate(hostParams, smsTemplate)
  };

  sms.sendSMS(visitorsSMSOptions);
  sms.sendSMS(hostSMSOptions);
  email.sendMail(visitorsEmailOptions);
  email.sendMail(hostEmailOptions);
  setNotificationLog(appointment.uuid, notificationLog, 'end');
}


function logExist(id, logObject, type) {

  if (logObject[id] === undefined) {
    return false;
  } else if (logObject[id][type] === undefined) {
    return false;
  } else if (((new Date(logObject[id][type]['time']).getTime() - new Date().getTime())/(1000*60)) > (60 * 24)) {
    return false;
  }

  return true;
}

function notifyUpcoming(appointment, notificationLog) {


  var now = new Date();
  var appointmentDate = new Date(appointment.appointment_date);
  var startDateTime = new Date(appointment.appointment_date+' '+appointment.visit_start_time);
  var endDateTime = new Date(appointment.appointment_date+' '+appointment.visit_end_time);
  var startTimeDiff = startDateTime.getTime() - new now.getTime();
  startTimeDiff = Math.ceil(startTimeDiff/(1000*60));

  var endTimeDiff = new now.getTime() - endDateTime.getTime();
  endTimeDiff = Math.ceil(endTimeDiff/(1000*60));
  if (now.getTime() > appointmentDate.getTime()) {
    setExpired(appointment);
  } else {
    if (now.getTime() > startDateTime.getTime()) {
      setExpired(appointment);
    } else if (startTimeDiff <= 30 && appointment.checked_in === null && !logExist(appointment.uuid, notificationLog, 'start')) {
      sendStartNotification(appointment, startTimeDiff, notificationLog);
    } else if (endTimeDiff <= 30 && appointment.checked_in !== null && logExist(appointment.uuid, notificationLog, 'end')) {
      sendEndNotification(appointment, endDateTime, notificationLog);
    }
  }
}

function updateAppointmentState() {
  var deferred = Q.defer();

  var notificationLogFile = utility.ROOT_DIR+'/notification-log.json';
  var notificationLog = {};
  if (utility.fileExists(notificationLogFile)) {
    notificationLog = JSON.parse(utility.loadFile(utility.ROOT_DIR+'/notification-log.json'));
  }

  var appointments = [];
  getAppointments()
    .then(function(response) {
      response.forEach(function(appointment) {
        if (!appointment.is_approved) {
          updateExpired(appointment);
        }
        if (appointment.is_approved) {
          notifyUpcoming(appointment, notificationLog);
        }

      });
      utility.storeData(JSON.stringify(notificationLog), notificationLogFile);
      deferred.resolve(true);
    })
    .catch(function(reason) {
      deferred.reject(reason);
    });

  return deferred.promise;
}

function runCron() {
  var busy = false;
  setInterval(function() {
    if (!busy) {
      busy = true;
      updateAppointmentState()
        .then(function(response) {
          busy = false;
        })
        .catch(function(reason) {
          busy = false;
        });
    }
  }, 300000);
}


module.exports = runCron;