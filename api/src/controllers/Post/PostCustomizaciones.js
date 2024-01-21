const express = require('express');
const { Customizaciones, Cliente } = require('../../db');

const router = express.Router();

// Ruta para crear una customización
router.post('/', async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { clienteId, nombreEmpresa, colorPrincipal, colorSecundario, tipoLetra, logoImg } = req.body;

    // Verificar si existe el cliente con el clienteId proporcionado
    const clienteExistente = await Cliente.findByPk(clienteId);

    if (!clienteExistente) {
      return res.status(400).json({ mensaje: 'No se encontró el cliente con el clienteId proporcionado.' });
    }

    // Crear la customización en la base de datos, vinculada al cliente
    const nuevaCustomizacion = await Customizaciones.create({
      nombreEmpresa,
      colorPrincipal,
      colorSecundario,
      tipoLetra,
      logoImg,
      clienteId,
    });

    // Enviar respuesta con la nueva customización creada
    res.status(201).json({ mensaje: 'Customización creada con éxito', customizacion: nuevaCustomizacion });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al crear customización:', error);
    res.status(500).json({ mensaje: 'Error al crear customización', error: error.message });
  }
});

module.exports = router;
