const server = require('./src/app.js');
const { conn } = require('./src/db.js');


conn.sync({ force: false })
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`listening at ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error('Error syncing database:', error);
  });