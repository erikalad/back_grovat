// En tu controlador de autenticación
const express = require('express');
const { Cliente, Usuario, Customizaciones, Funcionalidades } = require('../../db'); 

const router = express.Router();

// Método para autenticar un usuario
router.post('/', async (req, res) => {
  const { usuario, contraseña } = req.body;
  try {
    // Buscar el usuario en la base de datos
    const user = await Usuario.findOne({
      where: { usuario },
    });
    // Verificar si el usuario existe y si la contraseña es correcta
    if (!user || user.contraseña !== contraseña) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    // Actualizar la propiedad logueado a true
    await Usuario.update({ logueado: true }, { where: { id_usuario: user.id_usuario } });

    // Obtener el id_cliente asociado al usuario
    const { clienteId } = user;
    // Buscar el cliente en la base de datos utilizando el id_cliente
    const cliente = await Cliente.findByPk(clienteId, {
      include: [
        { model: Usuario },
        { model: Customizaciones },
        { model: Funcionalidades },
      ],
    });
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
