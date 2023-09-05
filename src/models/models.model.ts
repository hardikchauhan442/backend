import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define(
    'model',
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      modelName: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: 'model',
    },
  );
  model.associate = function (models) {
    model.hasMany(models.customfield, {
      foreignKey: 'modelId',
    });
  };
  return model;
};
