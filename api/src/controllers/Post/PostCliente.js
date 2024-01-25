const express = require('express');
const { Cliente, Funcionalidades } = require('../../db'); // Ajusta la ruta según tu estructura de archivos

const router = express.Router();

// Ruta para crear un cliente
router.post('/', async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, email, fechaAlta, fechaVencimiento, plan, activo } = req.body;

    // Verificar si ya existe un cliente con el mismo correo electrónico
    const clienteExistente = await Cliente.findOne({
      where: {
        email: email,
      },
    });

    // Si el cliente ya existe, enviar un mensaje de error
    if (clienteExistente) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    // Crear el cliente en la base de datos
    const nuevoCliente = await Cliente.create({
      nombre,
      apellido,
      email,
      fechaAlta,
      fechaVencimiento,
      plan,
      activo,
    });

    // Si el plan es "empresarial", crea una nueva funcionalidad asociada al cliente
    if (plan === 'empresarial') {
      const nuevaFuncionalidad = await Funcionalidades.create({
        clienteId: nuevoCliente.id_cliente,
        gratis: true,
        // Agrega las fechas según tus necesidades
        fechaSolicitud: null,
        fechaInicio: null,
        fechaFin: null,
      });
    }

    // Enviar respuesta con el nuevo cliente creado
    res.status(201).json({ mensaje: 'Cliente creado con éxito', cliente: nuevoCliente });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al crear cliente:', error);
    res.status(500).json({ mensaje: 'Error al crear cliente', error: error.message });
  }
});

module.exports = router;

