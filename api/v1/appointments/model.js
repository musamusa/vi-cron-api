var Sequelize = require('sequelize');
var connection = require('app/db');

var attr = [
  '_id',
  '_rev',
  'representing',
  'purpose',
  'appointment_date',
  'visit_start_time',
  'visit_end_time',
  'escort_required',
  'is_approved',
  'is_expired',
  'checked_in',
  'checked_out',
  'label_code',
  'created_by',
  'entrance_id',
  'host_id',
  'visitor_id',
  'modified_by',
  'appointment_end_date',
  'teams',
  'created',
  'modified'
];


var Appointments = connection.define('appointments', {
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
  representing: {
    allowNull: true,
    type: Sequelize.STRING,
    validate: {
    }
  },
  purpose: {
    allowNull: true,
    type: Sequelize.STRING,
    validate: {
    }
  },
  appointment_date: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  visit_start_time: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  visit_end_time: {
    allowNull: true,
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  escort_required: {
    allowNull: true,
    type: Sequelize.BOOLEAN
  },
  is_approved: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  is_expired: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  checked_in: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  checked_out: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  label_code: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  entrance_id: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 0
  },
  appointment_end_date: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 1
  },
  teams: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  host_id: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 1
  },
  visitor_id: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 1
  },
  created_by: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 1
  },
  modified_by: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 1
  }
}, {
  updatedAt: 'modified',
  createdAt: 'created'
});

module.exports = {
  model: Appointments,
  attr: attr
};