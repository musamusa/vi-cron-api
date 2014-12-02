'use strict';

var utility = require('./utility');
var CONFIG_DIR = utility.JSON_DIR+'/viLogged-Client/config';
var CONFIG_JSON = '/production.json';
function getConfig() {
  if (!utility.fileExists(CONFIG_DIR)) {
    utility.mkDir(CONFIG_DIR);
  }
  if (utility.fileExists(CONFIG_DIR+CONFIG_JSON)) {
    return require(CONFIG_DIR+CONFIG_JSON);
  } else {
    return {};
  }
}