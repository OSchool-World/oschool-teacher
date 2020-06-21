'use strict';
module.exports = (sequelize, DataTypes) => {
  const Score = sequelize.define('Score', {
    session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    score: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  Score.associate = function(models) {
    models.Score.belongsTo(models.Session);
    models.Score.belongsTo(models.Student);
  };
  return Score;
};