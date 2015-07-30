var Sequelize = require('sequelize');
var connection = require('app/db');
var attr = [
  '_id',
  '_rev',
  'first_name',
  'last_name',
  'visitors_email',
  'visitors_phone',
  'occupation',
  'nationality',
  'company',
  'company_address',
  'gender',
  'state_of_origin',
  'lga_of_origin',
  'image',
  'fingerprint',
  'signature',
  'pass_code',
  'date_of_birth',
  'group',
  'created_by',
  'modified_by',
  'created',
  'modified'
];

var Visitors = connection.define('visitors', {
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
  company: {
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
  pass_code: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  date_of_birth: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  group: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  signature: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  created_by: {
    type: Sequelize.STRING,
    allowNull: true
  },
  modified_by: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = {
  model: Visitors,
  attr: attr
};