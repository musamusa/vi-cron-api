'use strict';

var utility = require('./utility');
var SETTINGS_FILE = 'system.json';
var Q = require('q');
//var runScript = require('./run-script');
var path = require('path');

function getSetting() {
  var settings = {};
  if (utility.fileExists(SETTINGS_FILE)) {
    settings = require('./'+SETTINGS_FILE);
  }
  return settings;
}

function checkUpdate() {
  var deferred = Q.defer();
  var version = getSetting().version;
  var params = {
    _address: 'dev.musamusa.com',
    path: '/vilogged-updates/versions.json',
    port: 1979
  };
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
  var deferred = Q.defer();
  var version = _version.replace(/\./, '-');
  var fileName = utility.ROOT_DIR+'/vilogged-'+version+'.zip';

  var DecompressZip = require('decompress-zip');
  var unzipper = new DecompressZip(fileName);

  unzipper.on('error', function (err) {
    deferred.reject(err);
    console.log( err);
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
 function manageUpdates() {
   var busy = false;

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


   }, 60000 * 60);

 }

module.exports = manageUpdates;