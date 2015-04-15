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
  nationality: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  state_of_origin: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  lga_of_origin: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  image: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  fingerprint: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  visitors_pass_code: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  date_of_birth: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  group_type: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  scanned_signature: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  created_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: ''
  },
  modified_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: ''
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = Visitors;