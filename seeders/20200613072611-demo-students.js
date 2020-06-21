'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    let d = new Date();
    return queryInterface.bulkInsert('Students', [
      {
        class_id: 1,
        first_name: 'مارک',
        last_name: 'زاکربرگ',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'ایلان',
        last_name: 'ماسک',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'بیل',
        last_name: 'گیتس',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'استیو',
        last_name: 'جابز',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'پاول',
        last_name: 'دوروف',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'لری',
        last_name: 'پیج',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'سرگی',
        last_name: 'برین',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'دنیس',
        last_name: 'ریچی',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'لینوس',
        last_name: 'توروالدز',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'لری',
        last_name: 'الیسون',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'تیلور',
        last_name: 'اوتول',
        created_at: d,
        updated_at: d
      },
      {
        class_id: 1,
        first_name: 'تراویس',
        last_name: 'کلانیک',
        created_at: d,
        updated_at: d
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Students', null, {});
  }
};
