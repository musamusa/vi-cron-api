'use strict';

var utility = require('app/utility');
var filePath = [utility.ROOT_DIR, 'api', 'v1'].join('/');
var folders = utility.readAllInDir(filePath);

for (var i = 0; i < folders.length; i++) {
  var folder = folders[i], file = [filePath, folder, 'model'].join('/');
  if (utility.fileExists(file)) {
    folder = require(file).model;
  }
}
