'use strict';
module.exports = (function() {
  var fs = require('fs');
  var http = require('http');
  var path = require('path');
  var ROOT_DIR = path.resolve( '../../../'+__dirname+'/../../');
  var HOST_ADDRESS = 'http://localhost';
  var DOC_DIR = path.join(ROOT_DIR, 'docs');
  var JSON_DIR = path.join(ROOT_DIR, 'json');
  var mkdirp = require('mkdirp');
  var Q = require('q');

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
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // jshint bitwise: false
      var r = (now + Math.random() * 16) % 16 | 0;
      now = Math.floor(now / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
  };

  var fileExists = function(fileName) {
    return fs.existsSync(fileName);
  };

  function dirExistsSync(d) {
    try {
      return fs.statSync(d).isDirectory();
    } catch (er) {
      return false
    }
  }

  function mkdir(dir) {
    return mkdirp.sync(dir);
  }

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
    var deferred = Q.defer();
    params = params !== undefined ? params : {};
    params.headers = params.headers || {};
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
        agent: false,
        headers: {}
      };
      (Object.keys(params.headers))
        .forEach(function(key) {
          options.headers[key] = params.headers[key];
        });
      if (postData !== '') {
        options.headers['Content-Type'] = params.headers['Content-Type'] || 'application/json';
        options.headers['Content-Length'] = params.headers['Content-Length'] || postData.length;
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
            var jsonResp = str;
            if (jsonResp.error !== undefined) {
              responseData.status = false;
              responseData.reason = jsonResp.reason;
              responseData.response = str;

            } else {
              responseData.status = true;
              responseData.response = str;

            }

            callback(responseData);
          }
          var status = parseInt(response.statusCode.toString().charAt(0));
          if ([4, 5].indexOf(status) !== -1) {
            deferred.reject({
              status: false,
              statusCode: response.statusCode,
              data: str,
              reason: http.STATUS_CODES[response.statusCode],
              response: response

            });
          } else {
            deferred.resolve({
              status: true,
              statusCode: response.statusCode,
              data: str,
              response: response
            });
          }

        });

        response.on('error', function(error) {
          deferred.reject({
            status: false,
            statusCode: null,
            data: null,
            reason: http.STATUS_CODES[response.statusCode],
            response: response
          });
        });

        response.on('complete', function(msg) {
          console.log(msg);
        });
      });
//This is the data we are posting, it needs to be a string or a buffer
      if (postData) {
        req.write(postData);
      }
      req.end();
    } else {
      callback('Please enter a valid path');
      deferred.reject({
        status: false,
        statusCode: null,
        data: null,
        reason: 'Please enter a valid path',
        response: {}
      });
    }
    return deferred.promise;
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
    params = params !== undefined ? params : {};
    params.method = 'POST';
    return _http(params, callback);
  }

  function put(params, callback) {
    params = params !== undefined ? params : {};
    params.method = 'PUT';
    return _http(params, callback);
  }

  function remove(params, callback) {
    params = params !== undefined ? params : {};
    params.method = 'DELETE';
    return _http(params, callback);
  }

  function get(params, callback) {
    params = params !== undefined ? params : {};
    params.method = 'GET';
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
    var config = require('./../../config/config.js');
    var crypto = require('crypto');
    var salt = config.SALT;
    return crypto.pbkdf2Sync(password, salt, 10000, 32).toString('hex');
  }

  function compileTemplate(_replacements, template, _delimiter) {

    function pregQuote(str) {
      return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    }

    var objectTest = Object.prototype.toString.call(_replacements) === '[object Object]';
    var replacements = objectTest ? _replacements : {};
    var delimiter = _delimiter === undefined ? '&&' : _delimiter;

    (Object.keys(replacements))
      .forEach(function(key) {
        var patternString = pregQuote(delimiter+key+delimiter);
        template = template.replace(new RegExp(patternString, 'g'), replacements[key]);
      });
    return template;
  }

  function getUUID(bodyUUID, paramsID) {
    var uuid = uuidGenerator();

    if (bodyUUID !== undefined && bodyUUID !== '' && bodyUUID !== null) {
      uuid = bodyUUID;
    } else if (paramsID !== null && paramsID !== '' && paramsID !== undefined) {
      uuid = paramsID;
    }
    return uuid;
  }

  function getRev(rev) {
    var num = 0;

    if (rev) {
      num = parseInt(rev.split('-').shift());
      if (isNaN(num)) {
        num = 1;
      } else {
        num =  num + 1;
      }
    } else {
      num =  num + 1;
    }

    return [num, uuidGenerator()].join('-');
  }

  function extendObj(dest, src, replaceDuplicate) {
    replaceDuplicate = replaceDuplicate || false;
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        if (dest.hasOwnProperty(key) && replaceDuplicate) {
          dest[key] = src[key];
        } else if (!dest.hasOwnProperty(key)){
          dest[key] = src[key];
        }
      }
    }

    return dest;
  }

  function isEmptyObject(object) {
    if (toString.call(object) !== '[object Object]') {
      return true;
    }
    return (Object.keys(object)).length === 0;
  }

  function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  function nestList(list, callback) {
    if (checkType.isArray(list)) {
      var obj = {};
      (function() {
        for (var i = 0; i < list.length; i++) {
          var row = callback(list[i], true);

          obj[row._id] = row;
        }

      })();
      list = obj;
    } else if (checkType.isObject(list)) {
      (function() {
        for (var i in list) {
          if (list.hasOwnProperty(i)) {
            list[i] = callback(list[i], true);
          }
        }
      })();
    }

    return list;
  }

  function objectToFilter(data, filterObject) {
    var conditions = true, count = 0;
    data = data.dataValues || data;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (filterObject.hasOwnProperty(key)) {
          console.log(key);
          if (count === 0) {
            conditions = data[key] === filterObject[key];
          } else {
            conditions = conditions && (data[key] === filterObject[key]);
          }

        }
      }
      count++;
    }
    return conditions;
  }

var checkType = (function() {
  function typeCheck(object) {
    return Object.prototype.toString.call(object);
  }
  return {
    isObject: function(object) {
      return typeCheck(object) === '[object Object]';
    },
    isArray: function(array) {
      return typeCheck(array) === '[object Array]';
    },
    isNull: function(test) {
      return typeCheck(test) === '[object Null]';
    },
    isString: function(test) {
      return typeCheck(test) === '[object String]';
    },
    isDate: function(test) {
      return typeCheck(test) === '[object Date]';
    },
    isUndefined: function(test) {
      return typeCheck(test) === '[object Undefined]';
    }
  }
})();

  var moduleHelper = {
    createUUID: uuidGenerator,
    arrayToObject: castArrayToObject,
    csvToJSON: csvToJSON,
    fileExists: fileExists,
    storeData: storeData,
    readAllInDir: readAllInDir,
    loadFile: loadFile,
    http: http,
    post: post,
    put: put,
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
    toCamelCase: toCamelCase,
    mkDir: mkdir,
    dirExists: dirExistsSync,
    compileTemplate: compileTemplate,
    uuidGenerator: uuidGenerator,
    getUUID: getUUID,
    getRev: getRev,
    extendObj: extendObj,
    isEmptyObject: isEmptyObject,
    clone: clone,
    nestList: nestList,
    objectToFilter: objectToFilter
  };

  return extendObj(checkType, moduleHelper);
})();

