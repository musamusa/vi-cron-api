'use strict';

var utility = require('./utility');
var SETTINGS_FILE = utility.ROOT_DIR+'/system.json';
function getSetting() {
  var settings = {
    system: 'server',
    version: '1.0.1'
  };
  if (utility.fileExists(SETTINGS_FILE)) {
    settings = JSON.parse(utility.loadFile(SETTINGS_FILE));
    if (settings.client === undefined) {
      settings.client = getLiveConfig();
    }
  } else {
     settings.client = getLiveConfig();
  }
  return settings;
}

function getLiveConfig() {
  var config = utility.loadFile('viLogged-Client/app/scripts/config.js');
  config = config.replace('angular.module(\'config\', []) .constant(\'config\', {', '').replace('});', '');
  config = config.replace('api:', '');
  config = config.replace(/[{|}|\\n]/g, '');
  config = config.replace(/(\r\n|\n|\r)/gm,'');
  config = config.split(',');
  var mainConfig = {};
  config.forEach(function(conf) {
    var row = conf.split(':');
    var key = row.shift();
    mainConfig[key.trim()] = row.join(':').replace(/'/g, '').trim();
  });

  return mainConfig;
}

console.log(getSetting());

module.exports = {
  getSetting: getSetting,
  SETTINGS_FILE: SETTINGS_FILE
};