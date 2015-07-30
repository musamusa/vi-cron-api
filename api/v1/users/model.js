var Sequelize = require('sequelize');
var connection = require('app/db');

var attr = [
  '_id',
  '_rev',
  'username',
  'first_name',
  'last_name',
  'email',
  'is_superuser',
  'is_staff',
  'is_active',
  'last_login',
  'created',
  'modified',
  'phone',
  'work_phone',
  'home_phone',
  'department',
  'gender',
  'image',
  'designation'
];

var User = connection.define('users', {
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
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
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
    unique: true,
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
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  is_staff: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    allowNull: true,
    type: Sequelize.DATE,
    defaultValue: '00-00-00'
  },
  phone: {
    allowNull: false,
    unique: true,
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
    type: Sequelize.TEXT
  },
  gender: {
    type: Sequelize.STRING
  },
  designation: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  department: Sequelize.STRING
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = {
  model: User,
  attr: attr
};