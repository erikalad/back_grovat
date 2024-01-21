const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  const Funcionalidades = sequelize.define('funcionalidades', {
    id_funcionalidades:{
        type: DataTypes.UUID,      
        defaultValue: DataTypes.UUIDV4,    
        allowNull: false,
        primaryKey : true
    },
    fechaSolicitud: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fechaInicio:{
        type: DataTypes.DATE,
        allowNull: true
    },
    fechaFin:{
        type: DataTypes.DATE,
        allowNull: true 
    },
    gratis:{
        type: DataTypes.BOOLEAN,
        allowNull: false 
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
  });

return Funcionalidades;
};
