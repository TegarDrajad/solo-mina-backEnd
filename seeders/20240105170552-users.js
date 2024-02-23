'use strict';
const bcrypt = require('bcrypt');

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

    // bcrypt password
    const salt = await bcrypt.genSaltSync(10)

    await queryInterface.bulkInsert('users', [{
      username: 'superadmin1',
      password: bcrypt.hashSync('superadmin1', salt),
      full_name: 'Tegar Drajad',
      role: 'superadmin'
      }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
