'use strict';

var utility = require('./../utility/index');
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
  var configFIle = utility.ROOT_DIR+'/viLogged-Client/app/scripts/config.js';
  if (!utility.fileExists(configFIle)) {
    configFIle = utility.ROOT_DIR+'/viLogged-Client/dist/scripts/config.js';
  }
  var config = utility.loadFile(configFIle);

  config = config.replace('angular.module(\'config\', []) .constant(\'config\', {', '').replace('});', '');
  config = config.replace('api:', '');
  config = config.replace(/[{|}]/g, '');
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

module.exports = {
  getSetting: getSetting,
  SETTINGS_FILE: SETTINGS_FILE
};
