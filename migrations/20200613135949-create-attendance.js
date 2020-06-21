'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attendances', {
      student_id: {
        allowNull: false,
        primaryKey:true,
        type: Sequelize.INTEGER
      },
      session_id: {
        allowNull: false,
        primaryKey:true,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('PRESENT', 'ABSENT', 'DELAYED')
      },
      delay_time: {
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Attendances');
  }
};