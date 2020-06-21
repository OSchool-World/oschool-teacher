'use strict';

const moment = require('moment');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let d = new Date();
    return queryInterface.bulkInsert('Sessions', [
      {
        class_id: 1,
        date: moment().format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().subtract(1, 'days').format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().subtract(2, 'days').format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().subtract(3, 'days').format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().add(1, 'days').format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().add(2, 'days').format(),
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        date: moment().add(3, 'days').format(),
        created_at: d,
        updated_at: d
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Sessions', null, {});
  }
};
