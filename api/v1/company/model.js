var Sequelize = require('sequelize');
var connection = require('app/db');
var attr = [
  '_id',
  '_rev',
  'name',
  'address',
  'branch',
  'modified_by',
  'created_by',
  'created',
  'modified'
];

var Model = connection.define('company', {
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
  address: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {

    }
  },
  branch: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {

    }
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