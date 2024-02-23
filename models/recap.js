'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class recap extends Model {
    static associate(models) {
      recap.belongsTo(models.customers, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      recap.belongsTo(models.fish, {
        foreignKey: 'fishId',
        as: 'fish'
      });
      recap.belongsTo(models.users,{
        foreignKey: 'usersId',
        as: 'users'
      });
      recap.belongsTo(models.PriceByCustomer,{
        foreignKey: 'priceByCustomersId'
      });
    }
  }
  recap.init({
    customerId: DataTypes.INTEGER,
    fishId: DataTypes.INTEGER,
    usersId: DataTypes.INTEGER,
    priceByCustomersId: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    total_product: DataTypes.INTEGER,
    total_price: DataTypes.INTEGER,
    status: DataTypes.ENUM('Paid', 'Unpaid', 'Halfpaid', 'Installments'),
    notes: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'recap',
  });
  return recap;
};