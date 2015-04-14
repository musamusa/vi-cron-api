var Sequelize = require('sequelize');
var connection = require('../../../db');

var Visitors = connection.define('Visitors', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  first_name: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      notEmpty: true
    }
  },
  last_name: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      notEmpty: true
    }
  },
  visitors_email: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      isEmail: {
        msg: 'Please, provide a valid email format'
      },
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  visitors_phone: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  occupation: {
    allowNull: true,
    type: Sequelize.STRING,
    validate: {
      notEmpty: false
    }
  },
  company_name: {
    allowNull: true,
    type: Sequelize.STRING,
    defaultValue: ''
  },
  company_address: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  date_of_birth: Sequelize.STRING
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = Visitors;