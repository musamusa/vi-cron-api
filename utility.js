'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var ROOT_DIR = __dirname;
var LOCAL_ADDRESS = 'http://localhost';
var HOST_ADDRESS = LOCAL_ADDRESS;
var DOC_DIR = path.join(ROOT_DIR, 'docs');
var JSON_DIR = path.join(ROOT_DIR, 'json');

function castArrayToObject(array, key, callback){
  var newObject = {};
  key = (key) === undefined ? 'key' : key;
  if(Object.prototype.toString.call(array) === '[object Array]') {
    for (var i = 0; i < array.length; i++) {
      if (callback !== undefined) {
        key = callback(array[i]);
        newObject[key] = array[i];
      } else {
        newObject[array[i][key]] = array[i];
      }
    }
  }
  return newObject;
}

function readAllInDir(dir) {
  var files = [];
  if(fileExists(dir)){
    files = fs.readdirSync(dir);
  }
  return files;
}

function loadFile(fileName) {
  return fs.readFileSync(fileName, 'utf8');
}

var uuidGenerator = function() {
  var now = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // jshint bitwise: false
    var r = (now + Math.random() * 16) % 16 | 0;
    now = Math.floor(now / 16);
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
};

var fileExists = function(fileName) {
  return fs.existsSync(fileName);
};

var storeData = function(data, fileName) {
  var saved = fs.writeFileSync(fileName, data);
  return saved === undefined;
};

var csvToJSON = function(csvString, useFirstRowAsHeader) {
  var csvArray = csvString.toString().split('\n');
  var header;
  var rows = [];
  if (useFirstRowAsHeader === undefined || useFirstRowAsHeader) {
    header = csvArray.shift().split(',');
  }

  csvArray.forEach(function(row) {
    var rowArray = row.split(',');
    var rowData = {};
    if (rowArray.length > 0) {
      rowArray.forEach(function(value, index) {
        if (header[index] !== undefined) {
          rowData[header[index].toLowerCase()] = value;
        }
      });
      rows.push(rowData);
    }
  });

  return rows;
};

var getAll = function(params, callback) {
  params = params !== undefined ? params : {};
  var postData = params.data != undefined ? params.data : '';
  var _ADDRESS = params._address !== undefined ? params._address : HOST_ADDRESS;
  var path = params.path !== undefined ? params.path : '';
  var port = params.port !== undefined ? params.port : '5984';

  var fullAddress = _ADDRESS+':'+port+path;
  http.get(fullAddress, function(res) {

    var str = '';

    res.on('data', function(chunk) {
      str += chunk;
    });

    res.on('end', function() {
      var responseData = {};
      var jsonResp = JSON.parse(str);
      if (jsonResp.error !== undefined) {
        responseData.status = false;
        responseData.reason = jsonResp.reason;
        responseData.response = str;
      } else {
        responseData.status = true;
        responseData.response = str;
      }

      callback(responseData);
    });

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

var removeExtension = function(fileName) {
  return fileName.replace(/\.+json+$/,"");
};


function _http(params, callback) {
  params = params !== undefined ? params : {};
  var postData = params.data != undefined ? params.data : '';
  var _ADDRESS = params._address !== undefined ? params._address : '127.0.0.1';
  var path = params.path !== undefined ? params.path : '';
  var method = params.method !== undefined ? params.method : 'POST';
  var port = params.port !== undefined ? params.port : '5984';

  if (path !== '') {
    var options = {
      host: _ADDRESS,
      path: path,
      port: port,
      method: method,
      agent: false
    };
    if (postData !== '') {
      options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      };
    }
    if (params.auth != undefined) {
      options.auth = params.auth;
    }

    var req = http.request(options, function(response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        if (callback !== undefined) {
          var responseData = {};
          var jsonResp = JSON.parse(str);
          if (jsonResp.error !== undefined) {
            responseData.status = false;
            responseData.reason = jsonResp.reason;
            responseData.response = str;
          } else {
            responseData.status = true;
            responseData.response = str;
          }

          callback(responseData);

        } else {
          console.log(str);
        }
      });

      response.on('error', function(error) {
        console.error('from error',error);
      });

      response.on('complete', function(msg) {
        console.log(msg);
      });
    });
//This is the data we are posting, it needs to be a string or a buffer
    req.write(postData);
    req.end();
  } else {
    callback('Please enter a valid path');
  }

}

function toTitleCase(str) {
  return (str||'').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function toCamelCase(str) {
  var separated = (str||'').split(/[\s|\-|_]/g);
  var first = '';
  if (separated.length > 1) {
    first = separated.shift();
  }

  separated = toTitleCase(separated.join(' '));
  return first.toLowerCase() + separated.replace(/\s/, '');
}

function post(params, callback) {
  return _http(params, callback);
}

function remove(params, callback) {
  params = params !== undefined ? params : {};
  params.method = params.method !== undefined ? params.method : 'DELETE';
  return _http(params, callback);
}

function get(params, callback) {
  params = params !== undefined ? params : {};
  params.method = params.method !== undefined ? params.method : 'GET';
  return _http(params, callback);
}

function formatErrors(errorsInstance) {
  var formatted = {};
  if (errorsInstance) {
    errorsInstance.errors.forEach(function(error) {
      if (!formatted[error.path]) {
        formatted[error.path] = [error.message];
      } else {
        formatted[error.path].push(error.message);
      }

    });
  }

  return formatted;
}

function uniqueCheck(count, type) {
  var message = '';
  if (count) {
    message = type+' already exists, please provide another '+type;
  }
  return message;
}

function appendErrors(errorObject, key, message) {
  if (message) {

    if (errorObject[key]) {
      errorObject[key].push(message);
    } else {
      errorObject[key] = [message];
    }
  }
  return errorObject;
}

function appendMultipleErrors(errorObject, array) {
  array.forEach(function(row) {
    errorObject = appendErrors(errorObject, row.key, row.message);
  });
  return errorObject;
}

function generatePassword(password){
  var config = require('./config/config.js');
  var crypto = require('crypto');
  var salt = config.SALT;
  return crypto.pbkdf2Sync(password, salt, 10000, 32).toString('hex');
}

var moduleHelper = {
  createUUID: uuidGenerator,
  arrayToObject: castArrayToObject,
  csvToJSON: csvToJSON,
  fileExists: fileExists,
  storeData: storeData,
  readAllInDir: readAllInDir,
  loadFile: loadFile,
  post: post,
  getAll: getAll,
  get: get,
  delete: remove,
  toTitleCase: toTitleCase,
  HOST_ADDRESS: HOST_ADDRESS,
  ROOT_DIR: ROOT_DIR,
  DOC_DIR: DOC_DIR,
  JSON_DIR: JSON_DIR,
  fs: fs,
  formatErrors: formatErrors,
  appendErrors: appendErrors,
  uniqueCheck: uniqueCheck,
  appendMultipleErrors: appendMultipleErrors,
  generatePassword: generatePassword,
  toCamelCase: toCamelCase
};

module.exports = moduleHelper;