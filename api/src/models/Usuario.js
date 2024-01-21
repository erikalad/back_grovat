const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
 const Usuario= sequelize.define('usuario', {
    id_usuario:{
        type: DataTypes.UUID,      
        defaultValue: DataTypes.UUIDV4,    
        allowNull: false,
        primaryKey : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    logueado:{
        type: DataTypes.BOOLEAN,
        allowNull: false ,
    },
    usuario:{
        type: DataTypes.STRING,
        allowNull: false ,
        unique: true,
    },
    contraseña:{
        type: DataTypes.STRING,
        allowNull: false ,
    },
    type:{
        type: DataTypes.ENUM('admin', 'cliente', 'usuario'),
        allowNull: false 
    },
    activo:{
        type: DataTypes.BOOLEAN,
        allowNull: false ,
        defaultValue: true,
    }
  });

return Usuario
};
