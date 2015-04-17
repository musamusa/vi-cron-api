var Sequelize = require('sequelize');
var connection = require('../../../db');

var User = connection.define('Users', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: {
        args:/^[a-z0-9_]{3,20}$/,
        msg: 'Username must have lower case alphabet characters and underscores only'
      },
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  password: {
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
  email: {
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
  is_superuser: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    set: function(value) {
      if (toString.call(value) === '[object String]') {
        return value === 'true';
      }
    }
  },
  is_staff: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    set: function(value) {
      if (toString.call(value) === '[object String]') {
        return value === 'true';
      }
    }
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    set: function(value) {
      if (toString.call(value) === '[object String]') {
        return value === 'true';
      }
    }
  },
  last_login: {
    allowNull: true,
    type: Sequelize.DATE,
    defaultValue: ''
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = User;