'use strict';


module.exports = function(app) {

  var morgan = require('morgan');             // log requests to the console (express4)
  var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
  var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

  var utility = require('./components/utility/index');
  var setting = require('./components/config-manager/system-manager');
  var email = require('./components/email/email');
  var sms = require('./components/sms/beta-sms');
  var cors = require('cors');
  var express  = require('express');
  var path = require('path');
  var relativeAppPath = path.resolve(utility.ROOT_DIR + '/viLogged-Client/dist');

  //app.use(express.static(relativeAppPath));                 // set the static files location /public/img will be /img for users
  app.use(morgan('dev'));                                         // log every request to the console
  app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());                                     // parse application/json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
  app.use(methodOverride());
  app.use(cors());

// listen (start app with node server.js) ======================================

  app.get('/', function(req, res) {
    res.json('api server online');
  });

  app.get('/api/versions', function(req, res) {

    res.json({current: setting.getSetting().version});
  });

  app.get('/api/get-update-file', function(req, res) {
    var version = req.query.version.replace(/\./, '-');
    var fileName = 'vilogged-'+version+'.zip';


    if (utility.fileExists(utility.ROOT_DIR+'/'+fileName)) {
      var options = {
        root: utility.ROOT_DIR,
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      };

      res.sendFile(fileName, options);
    } else {
      res.statusCode = 404;
      res.json({message: 'can not find file', error: 404});
    }
  });

  app.post('/api/send-mail', function(req, res) {
    var option ={
      to: req.body.to,
      subject: req.body.subject,
      message: req.body.message
    };
    email.sendMail(option)
      .then(function() {
        res.json({message: 'mail was sent successfully'});
      })
      .catch(function(reason) {
        res.statusCode(500);
        res.json(reason);
      });
  });

  app.post('/api/send-sms', function(req, res) {
    var option ={
      mobiles: req.body.mobiles,
      message: req.body.message
    };

    sms.sendSMS(option)
      .then(function() {
        res.json({message: 'sms was sent successfully'});
      })
      .catch(function(reason) {
        res.statusCode(500);
        res.json(reason);
      });
  });

  app.post('/api/app-config', function(req, res) {

    var settingFile = utility.ROOT_DIR+'/viLogged-Client/app/scripts/config.js';
    var settingFile2 = utility.ROOT_DIR+'/viLogged-Client/dist/scripts/config.js';

    if (!utility.fileExists(settingFile)) {
      settingFile = settingFile2;
    }


    var appConfig = req.body;
    var api = {api: appConfig};

    var configTemplate = '' +
      'angular.module(\'config\', [])\n' +
      ' .constant(\'config\', {\n' +
      '   api: {\n' +
      '     backend: \' '  + appConfig.backend + '\',\n' +
      '     remoteBackend: \'' + appConfig.remoteBackend + '\',\n' +
      '     localBrowserPort: \'' + appConfig.localBrowserPort + '\',\n' +
      '     backendCommon: \''  + appConfig.backendCommon + '\',\n' +
      '     couchDB: \''  + appConfig.couchDB + '\',\n' +
      '     localDB: \''  + appConfig.localDB + '\'\n' +
      '   }\n' +
      ' });\n';


    if (utility.storeData(configTemplate, settingFile)) {
      var systemSetting = setting.getSetting();
      systemSetting.client = appConfig;
      utility.storeData(JSON.stringify(systemSetting), setting.SETTINGS_FILE);
      res.json(api);
    } else {
      res.statusCode(500);
      res.json({reason: 'cannot save data'});
    }
  });

  app.get('/api/ldap-settings', function(req, res) {

    var systemSetting = setting.getSetting();
    var ldapSettings = {};

    if (systemSetting.ldapSettings) {
      ldapSettings = systemSetting.ldapSettings;
    }

    res.json(ldapSettings);
  });

  app.post('/api/ldap-settings', function(req, res) {

    var ldapSettings = req.body;
    var systemSetting = setting.getSetting();
    systemSetting.ldapSettings = ldapSettings;

    if (utility.storeData(JSON.stringify(systemSetting), setting.SETTINGS_FILE)) {
      res.json(ldapSettings);
    } else {
      res.statusCode(500);
      res.json({reason: 'cannot save data'});
    }
  });

  app.get('/api/database-settings', function(req, res) {

    var systemSetting = setting.getSetting();
    var databaseSettings = {"host":"localhost","dbName":"viLogged","user":"root","dbType":"sqlite"};

    if (systemSetting.databaseSettings) {
      databaseSettings = systemSetting.databaseSettings;
    }

    res.json(databaseSettings);
  });

  app.post('/api/database-settings', function(req, res) {

    var databaseSettings = req.body;
    var systemSetting = setting.getSetting();
    systemSetting.databaseSettings = databaseSettings;

    if (utility.storeData(JSON.stringify(systemSetting), setting.SETTINGS_FILE)) {
      res.json(databaseSettings);
    } else {
      res.statusCode(500);
      res.json({reason: 'cannot save data'});
    }
  });

  app.get('/api/email-settings', function(req, res) {
    var systemSetting = setting.getSetting();
    var emailSetting = {};

    if (systemSetting.emailSetting) {
      emailSetting = systemSetting.emailSetting;
    }

    res.json(emailSetting);
  });

  app.post('/api/email-settings', function(req, res) {
    var emailSetting = req.body;
    var systemSetting = setting.getSetting();
    systemSetting.emailSetting = emailSetting;

    if (utility.storeData(JSON.stringify(systemSetting), setting.SETTINGS_FILE)) {
      res.json(emailSetting);
    } else {
      res.statusCode(500);
      res.json({reason: 'cannot save data'});
    }
  });

  app.get('/api/sms-settings', function(req, res) {
    var systemSetting = setting.getSetting();
    var smsSetting = {};

    if (systemSetting.smsSetting) {
      smsSetting = systemSetting.smsSetting;
    }

    res.json(smsSetting);
  });

  app.post('/api/sms-settings', function(req, res) {
    var smsSetting = req.body;
    var systemSetting = setting.getSetting();
    systemSetting.smsSetting = smsSetting;

    if (utility.storeData(JSON.stringify(systemSetting), setting.SETTINGS_FILE)) {
      res.json(smsSetting);
    } else {
      res.statusCode(500);
      res.json({reason: 'cannot save data'});
    }
  });
};