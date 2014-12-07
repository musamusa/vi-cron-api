// call the packages we need
// server.js
// set up ========================
var utility = require('./utility');
var setting = require('./system-manager');
var email = require('./email');
var sms = require('./beta-sms');
var cors = require('cors');
var express  = require('express');
var app      = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var path = require('path');
var updateManager = require('./update-manager');
var relativeAppPath = path.resolve(utility.ROOT_DIR + 'viLogged-Client/dist');
var PORT = 8088;
var cronJob = require('./crone');

// configuration =================

app.use(express.static(relativeAppPath));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.use(cors());

// listen (start app with node server.js) ======================================

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


  var appConfig = req.body.localSetting;
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


app.post('/api/ldap-config', function(req, res) {

  var settingFile = utility.ROOT_DIR+'/viLogged/ldap.json';

  var appConfig = req.body;

  if (utility.storeData(JSON.stringify(appConfig), settingFile)) {
    res.json(appConfig);
  } else {
    res.statusCode(500);
    res.json({reason: 'cannot save data'});
  }
});


app.get('/api/settings', function(req, res) {
  var settings_file = utility.JSON_DIR+'/settings.json';
  var settings = {};
  if (utility.fileExists(settings_file)) {
    settings = JSON.parse(utility.loadFile(settings_file));
  }
  res.json(settings);
});

app.post('/api/settings', function(req, res) {
  var settings_file = utility.JSON_DIR+'/settings.json';
  var settings = req.body;

  if (utility.storeData(JSON.stringify(settings), settings_file)) {
    res.json({message: 'settings saved'});
  } else {
    res.statusCode(500);
    res.json({message: 'unable to save settings'});
  }
});



app.listen(PORT);
updateManager();
if (setting.getSetting().system === 'server') {
  cronJob();
}

