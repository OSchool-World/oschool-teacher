'use strict';
module.exports = (sequelize, DataTypes) => {
  let Attendance = sequelize.define('Attendance', {
    status: DataTypes.ENUM('PRESENT', 'ABSENT', 'DELAYED'),
    delay_time: DataTypes.INTEGER,
  }, {
    underscored: true
  });
  Attendance.associate = function(models) {
    models.Attendance.belongsTo(models.Student);
    models.Attendance.belongsTo(models.Session);
  };
  Attendance.removeAttribute('id');
  return Attendance;
};