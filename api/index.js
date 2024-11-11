const server = require('./src/app.js');
//const { conn } = require('./src/db.js'); // código relevante de conexión a base de datos

const PORT = process.env.PORT || 5000;

// Comentado el bloque de sincronización de la base de datos
// conn.sync({ force: false })
//   .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`listening at ${process.env.PORT}`);
    });
//   })
//   .catch(error => {
//     console.error('Error syncing database:', error); // código relevante de manejo de error en conexión
//   });
