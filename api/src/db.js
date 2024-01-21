// require('dotenv').config();
// const { Sequelize } = require('sequelize');
// const fs = require('fs');
// const path = require('path');
// const {
//   DB_USER, DB_PASSWORD, DB_HOST,
// } = process.env;

// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/meicanalitycs`, {
//   logging: false, // set to console.log to see the raw SQL queries
//   native: false, // lets Sequelize know we can use pg-native for ~30% more speed
// });
// const basename = path.basename(__filename);

// const modelDefiners = [];

// // Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
// fs.readdirSync(path.join(__dirname, '/models'))
//   .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
//   .forEach((file) => {
//     modelDefiners.push(require(path.join(__dirname, '/models', file)));
//   });

// // Injectamos la conexion (sequelize) a todos los modelos
// modelDefiners.forEach(model => model(sequelize));
// // Capitalizamos los nombres de los modelos ie: product => Product
// let entries = Object.entries(sequelize.models);
// let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
// sequelize.models = Object.fromEntries(capsEntries);

// // En sequelize.models están todos los modelos importados como propiedades
// // Para relacionarlos hacemos un destructuring
// const { Usuario, Cliente, Customizaciones, Funcionalidades } = sequelize.models;


// //ESTO SIGNIFICA DE UNO A MUCHOS
// Cliente.hasMany(Usuario, { foreignKey: 'usuarioId' })
// //UNO A UNO
// Cliente.belongsTo(Customizaciones, { foreignKey: 'customizacionsId' })
// //ESTO SIGNIFICA DE UNO A MUCHOS
// Cliente.hasMany(Funcionalidades, { foreignKey: 'funcionalidadesId' })


// // Aca vendrian las relaciones
// // Product.hasMany(Reviews);


// //ESTO SIGNIFICA DE MUCHOS A MUCHOS
// /* Usuario.belongsToMany(Carrito, {
//   through: "usuario_carrito"
// }) */
// module.exports = {
//   ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
//   conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
// };

const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const DB_USER= 'postgres'
const DB_PASSWORD= 'Prbm2244'
const DB_HOST = 'localhost';
const DB_PORT = 5432;
const DB_NAME = 'meicanalitycs';

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  logging: false,
  native: false,
});


const basename = path.basename(__filename);
const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));

// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// Sincroniza y recrea las tablas
// async function recreateTables() {
//   try {
//     await sequelize.sync({ force: true });
//     console.log('Tablas recreadas con éxito.');
//   } catch (error) {
//     console.error('Error al recrear las tablas:', error);
//   } finally {
//     // Cierra la conexión después de realizar las operaciones
//     await sequelize.close();
//   }
// }
// recreateTables()

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Usuario, Cliente, Customizaciones, Funcionalidades } = sequelize.models;

// Relaciones
Cliente.hasMany(Usuario, { foreignKey: 'clienteId' });
Cliente.hasMany(Funcionalidades, { foreignKey: 'clienteId' });
Cliente.hasMany(Customizaciones, { foreignKey: 'clienteId' });

// Ejemplo de cómo podrías agregar más relaciones:
// Usuario.belongsToMany(OtroModelo, { through: 'nombre_tabla_intermedia' });
// OtroModelo.hasMany(Algo, { foreignKey: 'algoId' });

module.exports = {
  ...sequelize.models,
  conn: sequelize, Op
};
