// call the packages we need
// server.js
// set up ========================

var utility = require('./utility');
var setting = require('./system-manager');
var express  = require('express');
var app      = express();                               // create our app w/ express
var updateManager = require('./update-manager');
var PORT = 8088;
var cronJob = require('./cron');
// configuration =================
require('./app')(app);
require('./routes')(app);

process.on('uncaughtException', function (err) {
  console.log(err);
});

app.listen(PORT);updateManager.manageUpdates();
if (setting.getSetting().system === 'server') {
  cronJob();
}

