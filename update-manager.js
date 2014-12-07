'use strict';

var utility = require('./utility');
var setting = require('./system-manager');
var Q = require('q');
var path = require('path');
var url = require('url');

function updatePollParams(systemSetting) {

  var params = {
    _address: 'dev.musamusa.com',
    path: '/vilogged-updates/versions.json',
    port: 1979
  };

  if (systemSetting.system === 'client') {
    var pollUrl = url.parse(systemSetting.client.backend);
    params._address = pollUrl.hostname;
    params.path = '/api/versions';
    params.port = 8088;
  }

  return params;
}

function updateDownloadParams(systemSetting) {

  var params = {
    _address: 'dev.musamusa.com',
    path: '/vilogged-updates/versions.json',
    port: 1979
  };

  if (systemSetting.system === 'client') {
    var pollUrl = url.parse(systemSetting.client.backend);
    params._address = pollUrl.hostname;
    params.path = '/api/versions';
    params.port = 8088;
  }

  return params;
}

function checkUpdate() {
  var deferred = Q.defer();
  var systemSetting = setting.getSetting();
  var version = systemSetting.version;

  var params = updatePollParams(systemSetting);

  utility.get(params)
    .then(function(response) {
      var returnData = Object.prototype.toString.call(response.data) === '[object String]' ? JSON.parse(response.data) : response.data;
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

  var systemSetting = setting.getSetting();


  var version = _version.replace(/\./g, '-');
  var fileName = 'vilogged-'+version+'.zip';
  var file = utility.fs.createWriteStream(utility.ROOT_DIR+'/'+fileName);

  var downloadUrl = 'http://dev.musamusa.com:1979/vilogged-updates/'+fileName;
  if (systemSetting.system === 'client') {
    var pollUrl = url.parse(systemSetting.client.backend);
    downloadUrl = pollUrl.protocol + '//' + pollUrl.hostname + ':8088/api/get-update-file?version='+_version;
  }
  console.log('download started for version '+version);
  utility.http.get(downloadUrl, function(response) {
    var status = parseInt(response.statusCode.toString().charAt(0));
    if ([4, 5].indexOf(status) !== -1) {
      console.log('download failed for version '+version);
      deferred.reject(response.statusCode);
    } else {
      console.log('download completed for version '+version);
      response.pipe(file);
      deferred.resolve(fileName);
    }
  });
  return deferred.promise;
}

function loadUpdate(_version) {
  var deferred = Q.defer();
  var version = _version.replace(/\./g, '-');
  var fileName = utility.ROOT_DIR+'/vilogged-'+version+'.zip';
  if (!utility.fileExists(fileName)) {
    console.log('File '+ fileName + ' not found');
    deferred.reject('File '+ fileName + ' not found');
  } else {
    var DecompressZip = require('decompress-zip');
    var unzipper = new DecompressZip(fileName);

    unzipper.on('error', function (err) {
      deferred.reject(err);
      console.log( err, version);
    });

    unzipper.on('extract', function (log) {
      deferred.resolve(log);
      console.log('Finished extracting', log);
    });

    unzipper.extract({
      path: utility.ROOT_DIR,
      filter: function (file) {
        return file.type !== "SymbolicLink";
      }
    });
  }
  return deferred.promise;
}

function updateSystemVersion(_version) {
  var settings = setting.getSetting();
  if (_version !== undefined && _version !== settings.version) {
    settings.version = _version;
    utility.storeData(JSON.stringify(settings), setting.SETTINGS_FILE);
  }
}

 function manageUpdates() {
   var busy = false;
   var DELAY = 60000 * 60; //1hr

   setInterval(function() {
     if (!busy) {
       busy = true;
       checkUpdate()
         .then(function(response) {
           if (response.updateRequired) {
             var version = response.current;
             getUpdate(version)
               .then(function(response) {
                 loadUpdate(version)
                   .then(function(response) {
                     var sys = require('sys');
                     var exec = require('child_process').exec;
                     var child;

                      // executes `pwd`
                     child = exec("cmd.exe make-update.bat", function (error, stdout, stderr) {
                       sys.print('stdout: ' + stdout);
                       sys.print('stderr: ' + stderr);
                       if (error !== null) {
                         console.log('exec error: ' + error);
                       }
                     });

                   })
                   .catch(function(reason) {
                     busy = false;
                   });
               })
               .catch(function(reason) {
                 console.log(reason);
                 busy = false;
               });
           } else {
             console.log('no update');
             busy = false;
           }
         })
         .catch(function(reason) {
           console.log(reason);
           busy = false;
         });
     } else {
       console.log('busy');
     }


   }, DELAY);

 }

module.exports = manageUpdates;
