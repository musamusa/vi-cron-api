// call the packages we need
// server.js
// set up ========================

var utility = require('app/utility');
var setting = require('./components/config-manager/system-manager');
var express  = require('express');
var app      = express();                               // create our app w/ express
var updateManager = require('./components/config-manager/update-manager');
var PORT = process.env.PORT || 8088;
var cronJob = require('./components/cron/cron');
// configuration =================
require('./app')(app);
require('./routes')(app);
require('./api/components/load-to-cache')();

process.on('uncaughtException', function (err) {
  console.log(err);
});

app.listen(PORT);
//updateManager.manageUpdates();
if (setting.getSetting().system === 'server') {
  //cronJob();
}

