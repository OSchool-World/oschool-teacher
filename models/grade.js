'use strict';
module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    grade_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    grade: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  Grade.associate = function(models) {
    models.Grade.belongsTo(models.GradeItem);
    models.Grade.belongsTo(models.Student);
  };
  return Grade;
};