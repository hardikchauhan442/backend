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
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      resetToken: {
        type: DataTypes.STRING,
      },
      resetTokenSentAt: {
        type: DataTypes.DATE,
        validate: {
          isDate: true,
        },
      },
      resetTokenExpireAt: {
        type: DataTypes.DATE,
        validate: {
          isDate: true,
        },
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['pending', 'accepted'],
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'accepted']],
            msg: 'Invalid status.',
          },
        },
      },
    },
    {
      indexes: [{ unique: true, fields: ['email'] }],
      timestamps: true,
      freezeTableName: true,
      tableName: 'users',
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
  return User;
};
