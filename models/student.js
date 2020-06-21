'use strict';

const { app } = require('electron').remote;
const fs = require('fs');

module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    class_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    image_updated_at: DataTypes.DATE,
    hasImage: {
      type: DataTypes.VIRTUAL,
      get() {
        try {
          if (fs.existsSync(this.getImagePath()))
            return true;
          else
            return false;
        } catch(err) {
          console.error(err)
          return false;
        }
      }
    }
  }, {
    underscored: true,
  });
  Student.associate = function(models) {
      models.Student.belongsTo(models.Class);
      models.Student.hasMany(models.Attendance);
      models.Student.belongsToMany(models.Session, { through: models.Attendance });
      models.Student.hasMany(models.StudentNote);
      models.Student.hasMany(models.Grade);
      models.Student.belongsToMany(models.GradeItem, { through: models.Grade });
      models.Student.hasMany(models.Score);
  };

  Student.prototype.getImagePath = function () {
    return app.getAppPath() + '/data/student-images/st_' + this.id + '.png';
  };

  Student.prototype.getImagePathWithTime = function () {
    return app.getAppPath() + '/data/student-images/st_' + this.id + '.png' + (this.image_updated_at ? '?' + this.image_updated_at.getTime() : '');
  };

  return Student;
};