'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10); // Replace 'password123' with the desired password

    return queryInterface.bulkInsert('User', [
      {
        email: 'example@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the user you inserted in the 'up' function (if needed)
    return queryInterface.bulkDelete('User', { email: 'example@example.com' });
  },
};
