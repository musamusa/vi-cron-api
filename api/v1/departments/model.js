var Sequelize = require('sequelize');
var connection = require('../../../db');

var Department = connection.define('Departments', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  department_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z]{3,20}$/,
        msg: 'Department name must contain only alphabetical characters'
      },
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  modified_by_id: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      notEmpty: true
    }
  },
  created_by_id: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      notEmpty: true
    }
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = Department;