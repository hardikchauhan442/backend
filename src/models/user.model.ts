import { createJWToken } from '../config/auth';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: 'user',
    },
  );

  User.beforeSave((user) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    }
  });

  User.prototype.generateToken = function generateToken() {
    console.log('JWT:' + process.env.SECRET);
    return createJWToken({ email: this.email, id: this.id });
  };

  User.prototype.authenticate = function authenticate(value) {
    if (bcrypt.compareSync(value, this.password)) return this;
    else return false;
  };

  User.associate = function (models) {
    User.hasMany(models.customfieldValue, {
      foreignKey: 'modelDataId',
    });
  };
  return User;
};
