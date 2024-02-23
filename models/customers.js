'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    static associate(models) {
      customers.hasMany(models.PriceByCustomer, {
        foreignKey: 'customerId', 
        as: 'customer'
      });
      customers.hasMany(models.recap, {
        foreignKey: 'customerId', 
        as: 'customerRecap'
      });
    }
  }
  customers.init({
    name: DataTypes.STRING,
    contact: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'customers',
  });
  return customers;
};