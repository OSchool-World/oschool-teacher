'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Scores', {
      session_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      student_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      score: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Scores');
  }
};