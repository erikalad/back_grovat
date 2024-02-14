const express = require('express');
const { Funcionalidades, Cliente } = require('../../db'); // Ajusta la ruta según tu estructura de archivos

const router = express.Router();

// Ruta para crear una funcionalidad
router.post('/', async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { clienteId, fechaSolicitud, descripcion, nombre, prioridad } = req.body;

    // Verificar si el clienteId existe y el plan del cliente es "startup" o "empresarial"
    const cliente = await Cliente.findOne({
      where: {
        id_cliente: clienteId,
        plan: ['startup', 'empresarial'],
      },
    });

    // Si no se encuentra el cliente o el plan no es válido, enviar un mensaje de error
    if (!cliente) {
      return res.status(400).json({ mensaje: 'Cliente no encontrado o plan no válido' });
    }

    // Crear la funcionalidad en la base de datos
    const nuevaFuncionalidad = await Funcionalidades.create({
      clienteId,
      gratis: false,
      fechaSolicitud,
      fechaInicio: null,
      fechaFin: null,
      descripcion,
      nombre, 
      prioridad
    });

    // Enviar respuesta con la nueva funcionalidad creada
    res.status(201).json({ mensaje: 'Funcionalidad creada con éxito', funcionalidad: nuevaFuncionalidad });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al crear funcionalidad:', error);
    res.status(500).json({ mensaje: 'Error al crear funcionalidad', error: error.message });
  }
});

module.exports = router;
