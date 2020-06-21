'use strict';
module.exports = (sequelize, DataTypes) => {
  const GradeItem = sequelize.define('GradeItem', {
    name: DataTypes.STRING,
    type: DataTypes.ENUM('STATIC', 'EXPRESSION'),
    symbol: DataTypes.STRING,
    expression: DataTypes.STRING,
    expression: DataTypes.STRING,
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false 
    },
  }, {
    underscored: true,
    tableName: 'GradeItems'
  });
  GradeItem.associate = function(models) {
    models.GradeItem.belongsTo(models.Class);
    models.GradeItem.hasMany(models.Grade);
    models.GradeItem.belongsToMany(models.Student, { through: models.Grade });
  };
  return GradeItem;
};