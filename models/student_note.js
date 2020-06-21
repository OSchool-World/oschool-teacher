'use strict';
module.exports = (sequelize, DataTypes) => {
  const StudentNote = sequelize.define('StudentNote', {
    date: DataTypes.DATE,
    note: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'StudentNotes'
  });
  StudentNote.associate = function(models) {
    models.StudentNote.belongsTo(models.Student);
    models.StudentNote.belongsTo(models.Class);
  };
  return StudentNote;
};