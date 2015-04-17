var Sequelize = require('sequelize');
var connection = require('../../../db');

var UserProfile = connection.define('Users', {
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  phone: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  work_phone: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: '',
    validate: {
      //isNumeric: {
      //msg: 'Only numbers allowed'
      //}
    }
  },
  home_phone: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: '',
    validate: {
      //isNumeric: {
      //msg: 'Only numbers allowed'
      //}
    }
  },
  image: {
    type: Sequelize.TEXT,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  gender: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  designation: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  department_floor: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  department: Sequelize.STRING
});

module.exports = UserProfile;