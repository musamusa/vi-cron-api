var Sequelize = require('sequelize');
var connection = require('../../../db');

var Appointments = connection.define('Appointments', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  representing: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
    }
  },
  purpose: {
    allowNull: false,
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
    type: Sequelize.STRING,
    defaultValue: ''
  },
  is_approved: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  is_expired: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
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
    defaultValue: ''
  },
  appointment_end_date: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: ''
  },
  teams: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  host_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: ''
  },
  visitor_id: {
    type: Sequelize.STRING,
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

module.exports = Appointments;