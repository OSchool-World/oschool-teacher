'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    class_id: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
    place: DataTypes.STRING,
    notes: DataTypes.STRING(1024)
  }, {
    underscored: true
  });
  Session.associate = function(models) {
    models.Session.belongsTo(models.Class);
    models.Session.hasMany(models.Attendance);
    models.Session.belongsToMany(models.Student, { through: models.Attendance });
    models.Session.hasMany(models.Score);
    models.Session.hasOne(models.LessonPlan);
  };
  return Session;
};