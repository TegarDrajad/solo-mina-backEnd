  'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
// const { options } = require('../routes/authRouters');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      users.hasMany(models.recap, {
        foreignKey: 'usersId',
        as: 'usersId'
      });
    }
  }
  users.init({
    username:{
      type: DataTypes.STRING,
      allowNull: false,
      unique:{
        args: true, 
        msg: 'username telah di daftarkan, masukkan username lain'
      },
      validate: {
        notNull: {
          msg: 'username tidak boleh kosong'
        }
      }
    },
    password: DataTypes.STRING,
    full_name: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    hooks: {
      // before create password has bcrypt
      beforeCreate: async (users, options) => {
        if (users.password) {
          users.password = await bcrypt.hash(users.password, 10);
        }
      },
      afterValidate: (users, options) => {
        if (users.username) {
          users.username = users.username.toLowerCase();
        }
      }
    },
    sequelize,
    modelName: 'users',
  });

  users.prototype.CorrectPassword = async (reqPassword, passwordDB) => {
    return await bcrypt.compareSync(reqPassword, passwordDB)
  }

  return users;
};