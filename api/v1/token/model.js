var Sequelize = require('sequelize');
var connection = require('app/db');
var attr = [
  '_id',
  '_rev',
  'user_id',
  'created',
  'modified'
];

var Model = connection.define('token', {
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
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
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