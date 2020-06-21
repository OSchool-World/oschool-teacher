'use strict';
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: DataTypes.STRING,
  }, {
    underscored: true
  });
  Class.associate = function(models) {
    models.Class.hasMany(models.Session);
    models.Class.hasMany(models.Student);
    models.Class.hasMany(models.GradeItem);
    models.Class.hasMany(models.StudentNote);
    models.Class.hasMany(models.CalendarEvent);
  };

  Class.prototype.getAcronymName = function () {
    let name = this.name;

    if(name == '[درس بدون نام]')
      return '!!!'

    let exp_name = name.split(' ');

    let filtered = exp_name.filter((word) => {
      if(word.length <= 2)
        return false;

      return true;
    });

    if(filtered.length == 1) {
      return filtered[0][0] + "‌" + filtered[0][filtered[0].length - 1];
    } else {
      return filtered[0][0] + "‌" + filtered[filtered.length - 1][0];
    }
  }

  return Class;
};