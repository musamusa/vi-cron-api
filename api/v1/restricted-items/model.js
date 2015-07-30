var Sequelize = require('sequelize');
var connection = require('app/db');

var attr = [
  '_id',
  '_rev',
  'name',
  'code',
  'type',
  'modified_by',
  'created_by',
  'created',
  'modified'
];

var RestrictedItems = connection.define('restricted_items', {
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
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  code: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
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
  model: RestrictedItems,
  attr: attr
};