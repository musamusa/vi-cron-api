var Sequelize = require('sequelize');
var utility = require('../utility');

var config = utility.loadFile(utility.ROOT_DIR+'/config/config.json');
config = JSON.parse(config);
var user = config.user;
var password = config.password;
var dbType = config.dbType;
var dbName = config.dbName;
var dbPort = config.port;
var params = {};

if (dbType === 'sqlite') {
  params.storage = utility.ROOT_DIR+'/'+dbName+'.db';
  params.dialect = dbType;
} else {
  params.port = dbPort;
  params.dialect = dbType;
}
var sequelize = new Sequelize(dbName, user, password, params);

sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      module.export = sequelize;
      console.log('Unable to connect to the database:', err)
    } else {
      module.export = sequelize;
      console.log('Connection has been established successfully.')
    }
  });

module.exports = sequelize;