var Sequelize = require('sequelize');
var connection = require('app/db');

var attr = [
  '_id',
  '_rev',
  'name',
  'modified_by',
  'created_by',
  'created',
  'modified'
];

var Entrance = connection.define('entrance', {
  _id: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  _rev: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  modified_by: {
    allowNull: true,
    type: Sequelize.STRING
  },
  created_by: {
    allowNull: true,
    type: Sequelize.STRING
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = {
  model: Entrance,
  attr: attr
};