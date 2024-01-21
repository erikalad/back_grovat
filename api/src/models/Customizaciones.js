const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customizaciones = sequelize.define('customizaciones', {
    id_customizaciones: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    nombreEmpresa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    colorPrincipal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    colorSecundario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipoLetra: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logoImg: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  return Customizaciones;
};
