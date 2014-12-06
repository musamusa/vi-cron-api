'use strict';

var utility = require('./utility');
var SETTINGS_FILE = utility.DOC_DIR+'/system.json';
function getSetting() {
  var settings = {};
  if (utility.fileExists(SETTINGS_FILE)) {
    settings = JSON.parse(utility.loadFile(SETTINGS_FILE));
  }
  return settings;
}

module.exports = {
  getSetting: getSetting,
  SETTINGS_FILE: SETTINGS_FILE
};