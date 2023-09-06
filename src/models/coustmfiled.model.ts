module.exports = function (sequelize, DataTypes) {
  const customfield = sequelize.define(
    'customfield',
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      modelId: {
        type: DataTypes.UUID,
        references: {
          model: 'model',
          key: 'id',
        },
      },
      notNull: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING,
      },
      inputType: {
        type: DataTypes.STRING,
      },
      labal: {
        type: DataTypes.STRING,
      },
      option: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.STRING,
      },
      defaultValue: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: 'customfield',
    },
  );
  customfield.associate = function (models) {
    customfield.belongsTo(models.model, {
      foreignKey: 'modelId',
    });
    customfield.hasMany(models.customfieldValue, {
      foreignKey: 'coustamfiledId',
    });
  };
  return customfield;
};
