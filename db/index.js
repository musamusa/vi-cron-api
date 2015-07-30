var Sequelize = require('sequelize');
var utility = require('app/utility');
var $q = require('q');

var config = require(utility.ROOT_DIR+'/system.json').databaseSettings ||
  {"host":"localhost","dbName":"viLogged","user":"root","dbType":"sqlite"};
var user = config.user;
var password = config.password;
var dbType = config.dbType;
var dbName = config.dbName;
var dbPort = config.port;
var params = {};
params.logging = false;
params.dialect = dbType;
if (dbType === 'sqlite') {
  params.storage = utility.ROOT_DIR+'/'+dbName+'.db';
} else {
  params.port = dbPort;
}
var sequelize = new Sequelize(dbName, user, password, params);

sequelize
  .authenticate()
  .then(function() {
    module.export = sequelize;
    console.log('Connection has been established successfully.');
  })
  .catch(function(err) {
    module.export = sequelize;
    console.log('Unable to connect to the database:', err)
  });

module.exports = sequelize;