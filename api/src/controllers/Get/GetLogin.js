// En tu controlador de autenticación

const { Usuario, Cliente } = require('../../db');
const bcrypt = require('bcrypt');

const router = express.Router();
// Método para autenticar un usuario
router.get('/', async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const user = await Usuario.findOne({
      where: { usuario },
    });

    // Verificar si el usuario existe y si la contraseña es correcta
    if (!user || !bcrypt.compareSync(contraseña, user.contraseña)) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Obtener el id_cliente asociado al usuario
    const { id_cliente } = user;

    // Buscar el cliente en la base de datos utilizando el id_cliente
    const cliente = await Cliente.findByPk(id_cliente);

    // Verificar si se encontró el cliente
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si se encuentra el cliente, devolverlo como respuesta
    return res.json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
