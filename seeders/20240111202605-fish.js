'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await queryInterface.bulkInsert('fishes', [
      {
        name: 'Ikan Nila',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ikan Mas',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        name: 'Ikan Gurame',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ikan Patin',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ikan Lele',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ikan Bawal',
        min_price: 28000,
        max_price: 35000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('fishes', null, {});
  }
};
