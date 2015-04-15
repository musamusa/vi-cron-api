var Sequelize = require('sequelize');
var connection = require('../../../db');

var Entrance = connection.define('Entrance', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: {
      msg: 'This field is required'
    }
  },
  item_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z0-9_]{3,20}$/,
        msg: 'Entrance name must contain only alphabetical and numeric characters'
      },
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  item_code: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z0-9_]{3,20}$/,
        msg: 'Item code can contain only alphabetical and numeric characters'
      },
      notEmpty: {
        msg: 'This field is required'
      }
    }
  },
  item_type: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z0-9_]{3,20}$/,
        msg: 'Item type can contain only alphabetical and numeric characters'
      },
      notEmpty: {
        msg: 'This field is required'
      }
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

module.exports = Entrance;