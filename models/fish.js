'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fish extends Model {
    static associate(models) {
      fish.hasMany(models.PriceByCustomer, {
        foreignKey: 'fishId',
        as: 'fish'
      });
      fish.hasMany(models.recap, {
        foreignKey: 'fishId',
        as: 'fishRecap'
      });
    }
  }
  fish.init({
    name: DataTypes.STRING,
    min_price: DataTypes.INTEGER,
    max_price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'fish',
  });
  return fish;
};