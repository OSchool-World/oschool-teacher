'use strict';
module.exports = (sequelize, DataTypes) => {
  const LessonPlan = sequelize.define('LessonPlan', {
    session_id: DataTypes.INTEGER,
    content: {
      type: DataTypes.STRING,
        get: function () {
            return JSON.parse(this.getDataValue('content'));
        },
        set: function (value) {
            this.setDataValue('content', JSON.stringify(value));
        },
    },
    brief: DataTypes.STRING,
  }, {
    underscored: true,
    tableName: 'LessonPlans'
  });
  LessonPlan.associate = function(models) {
    models.LessonPlan.belongsTo(models.Session);
  };
  LessonPlan.removeAttribute('id');
  return LessonPlan;
};