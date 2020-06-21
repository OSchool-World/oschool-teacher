'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Grades', {
      grade_item_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      student_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      grade: {
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
    return queryInterface.dropTable('Grades');
  }
};