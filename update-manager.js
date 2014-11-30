'use strict';

var utility = require('./utility');
var SETTINGS_FILE = 'system.json';
var Q = require('q');


function getSetting() {
  var settings = {};
  if (utility.fileExists(SETTINGS_FILE)) {
    settings = require('./'+SETTINGS_FILE);
  }
  return settings;
}

function checkUpdate() {
  var deferred = Q.defer();
  var version = getSetting().version;;

  var params = {
    _address: 'dev.musamusa.com',
    path: '/vilogged-updates/versions.json',
    port: 1979
  };
  utility.get(params)
    .then(function(response) {
      var returnData = Object.prototype.toString.call(response) === '[object String]' ? JSON.parse(response) : response;
      returnData.updateRequired = returnData.current > version;
      deferred.resolve(returnData);
    })
    .catch(function(reason) {
      deferred.reject(reason);
    });

  return deferred.promise;
}

function getUpdate(_version) {
  var deferred = Q.defer();

  var version = _version.replace(/\./, '-');
  var fileName = 'vilogged-'+version+'.zip';
  var file = utility.fs.createWriteStream(fileName);
  var params = {
    _address: 'dev.musamusa.com',
    path: '/vilogged-updates/'+fileName,
    port: 1979
  };
  utility.http.get('http://dev.musamusa.com:1979/vilogged-updates/'+fileName, function(response) {
    var status = parseInt(response.statusCode.toString().charAt(0));
    if ([4, 5].indexOf(status) !== -1) {
      deferred.reject(response);
    } else {
      response.pipe(file);
      deferred.resolve(fileName);
    }
  });
  return deferred.promise;
}

function loadUpdate(_version) {

  var version = _version.replace(/\./, '-');
  var fileName = utility.ROOT_DIR+'/vilogged-'+version+'.zip';

  var DecompressZip = require('decompress-zip');
  var unzipper = new DecompressZip(fileName);

  unzipper.on('error', function (err) {
    console.log('Caught an error', err);
  });

  unzipper.on('extract', function (log) {
    console.log('Finished extracting', log);
  });

  unzipper.extract({
    path: utility.ROOT_DIR,
    filter: function (file) {
      return file.type !== "SymbolicLink";
    }
  });

}
loadUpdate('1.0.2');