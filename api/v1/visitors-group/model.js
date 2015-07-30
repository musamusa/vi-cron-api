var Sequelize = require('sequelize');
var connection = require('app/db');
var attr = [
  '_id',
  '_rev',
  'name',
  'black_listed',
  'modified_by',
  'created_by',
  'created',
  'modified'
];

var Model = connection.define('visitors_group', {
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
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  black_listed: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: false
  },
  modified_by: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {

    }
  },
  created_by: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {

    }
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = {
  model: Model,
  attr: attr
};