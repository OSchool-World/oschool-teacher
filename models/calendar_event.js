'use strict';
module.exports = (sequelize, DataTypes) => {
  const CalendarEvent = sequelize.define('CalendarEvent', {
    date: DataTypes.DATEONLY,
    type: DataTypes.ENUM('CLASS_CUSTOM_EVENT', 'PUBLIC_CUSTOM_EVENT'),
    description: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'CalendarEvents'
  });
  CalendarEvent.associate = function(models) {
    models.CalendarEvent.belongsTo(models.Class);
  };
  return CalendarEvent;
};