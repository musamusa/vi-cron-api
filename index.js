// call the packages we need
// server.js
// set up ========================
var utility = require('./utility');
var email = require('./email');
var sms = require('./beta-sms');
var cors = require('cors');
var express  = require('express');
var app      = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var path = require('path');
var relativeAppPath = path.resolve('viLogged-Client/dist');
var PORT = 8088;

// configuration =================

app.use(express.static(relativeAppPath));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.use(cors());

// listen (start app with node server.js) ======================================

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
  var settingFile = utility.ROOT_DIR+'/viLogged-Client/app/scripts/config.json';
  var appConfig = req.body.localSetting;
  var api = {api: appConfig};
  if (utility.storeData(JSON.stringify(api), settingFile)) {
    res.json(api);
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
  /*if (utility.fileExists(settings)) {
    settings = JSON.parse(utility.loadFile());
  }
  var settings_type = req.body.settings_type;

  if (settings[settings_type]) {
    Object.keys(settings[settings_type])
      .forEach(function(key) {
        settings[settings_type][key] = req.body[key];
      });
  } else {
    settings[settings_type] = {};
    Object.keys(req.body)
      .forEach(function(key) {
        if (key !== settings_type) {
          settings[settings_type][key] = req.body[key];
        }
      });
  }*/

  if (utility.storeData(JSON.stringify(settings), settings_file)) {
    res.json({message: 'settings saved'});
  } else {
    res.statusCode(500);
    res.json({message: 'unable to save settings'});
  }
});

app.listen(PORT);
console.log("App listening on port "+PORT);

