const express = require('express');
const { Usuario, Cliente, sequelize, Op } = require('../../db');

const router = express.Router();

// Ruta para crear un usuario
router.post('/', async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, email, logueado, usuario, contraseña, type, activo, clienteId } = req.body;

    // Verificar si el clienteId proporcionado existe
    const clienteExistente = await Cliente.findByPk(clienteId);

    if (!clienteExistente) {
      return res.status(400).json({ mensaje: 'No existe el cliente proporcionado.' });
    }

    // Verificar si ya existe un usuario con el mismo email o usuario
    const usuarioExistente = await Usuario.findOne({
      where: {
        // Verificar tanto el email como el usuario
        [Op.or]: [{ email }, { usuario }],
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un usuario con este email o nombre de usuario.' });
    }

    // Verificar límite de usuarios según el plan del cliente
    const limiteUsuarios = getLimiteUsuariosPorPlan(clienteExistente.plan);

    const cantidadUsuarios = await Usuario.count({
      where: {
        clienteId,
        activo: true,
      },
    });

    if (cantidadUsuarios >= limiteUsuarios) {
      let mensaje = '';

      if (clienteExistente.plan === 'empresarial') {
        mensaje = 'No se puede crear el usuario. Límite de usuarios alcanzado. Comunícate con nuestra área de ventas para obtener más usuarios.';
      } else {
        mensaje = `No se puede crear el usuario. Límite de usuarios alcanzado. Sube de plan para obtener más cupos de usuarios.`;
      }

      return res.status(400).json({ mensaje });
    }

    // Crear el usuario en la base de datos con clienteId
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      logueado,
      usuario,
      contraseña,
      type,
      activo,
      clienteId, // Asignar clienteId
    });

    // Enviar respuesta con el nuevo usuario creado
    res.status(201).json({ mensaje: 'Usuario creado con éxito', usuario: nuevoUsuario });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// Función para obtener el límite de usuarios según el plan del cliente
function getLimiteUsuariosPorPlan(plan) {
  switch (plan) {
    case 'emprendedor':
      return 5;
    case 'startup':
      return 10;
    case 'empresarial':
      return 30;
    default:
      return 0;
  }
}

module.exports = router;


