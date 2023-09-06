module.exports = function (sequelize, DataTypes) {
  const customfieldValue = sequelize.define(
    'customfieldValue',
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      coustamfiledId: {
        type: DataTypes.UUID,
        references: {
          model: 'customfield',
          key: 'id',
        },
      },
      value: {
        type: DataTypes.STRING,
      },
      model444DataId: {
        type: DataTypes.UUID,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: 'customfieldValue',
    },
  );
  customfieldValue.associate = function (models) {
    customfieldValue.belongsTo(models.customfield, {
      foreignKey: 'coustamfiledId',
    });
    customfieldValue.belongsTo(models.User, {
      foreignKey: 'modelDataId',
    });
  };
  return customfieldValue;
};
