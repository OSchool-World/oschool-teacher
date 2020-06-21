'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Classes', [{
      name: "ساختمان داده علم و فرهنگ",
      created_at: new Date(),
      updated_at: new Date()
    },{
      name: "روباتیک دبیرستان نیکان",
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Classes', null, {});
  }
};
