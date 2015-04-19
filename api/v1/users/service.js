'use strict';

var service = {
  nestList: function(listToBeNested, nestFields) {
    var nestedList = [];
    listToBeNested.forEach(function(row) {
      var mainRow = {}, topRow = {}, nestedRow = {}, fields = nestFields.fields;
      Object.keys(row).forEach(function(key) {
        if (fields.indexOf(key) !== -1) {
          nestedRow[key] = row[key];
        } else {
          topRow[key] = row[key];
        }
      });
      topRow[nestFields.key] = nestedRow;
      mainRow = topRow;
      nestedList.push(mainRow);
    });

    return nestedList;
  }
};

module.exports = service;