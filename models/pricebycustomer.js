'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PriceByCustomer extends Model {
    static associate(models) {
      PriceByCustomer.belongsTo(models.customers, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      PriceByCustomer.belongsTo(models.fish, {
        foreignKey: 'fishId',
        as: 'fish'
      });
      PriceByCustomer.hasMany(models.recap, {
        foreignKey: 'priceByCustomersId'
      });
    }
  }
  PriceByCustomer.init({
    customerId: DataTypes.INTEGER,
    fishId: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PriceByCustomer',
  });
  return PriceByCustomer;
};