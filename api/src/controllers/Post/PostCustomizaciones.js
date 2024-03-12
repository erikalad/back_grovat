const express = require('express');
const { Customizaciones, Cliente } = require('../../db');

const router = express.Router();

// Ruta para crear o actualizar una customización
router.post('/', async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { clienteId, nombreEmpresa, colorPrincipal, colorSecundario, tipoLetra, logoImg } = req.body;

    // Verificar si existe el cliente con el clienteId proporcionado
    const clienteExistente = await Cliente.findByPk(clienteId);
    if (!clienteExistente) {
      return res.status(400).json({ mensaje: 'No se encontró el cliente con el clienteId proporcionado.' });
    }

    // Verificar si ya existe una customización para el cliente
    const customizacionExistente = await Customizaciones.findOne({ where: { clienteId } });

    if (customizacionExistente) {
      // Actualizar la customización existente
      await customizacionExistente.update({
        nombreEmpresa,
        colorPrincipal,
        colorSecundario,
        tipoLetra,
        logoImg
      });
      res.status(200).json({ mensaje: 'Customización actualizada con éxito', customizacion: customizacionExistente });
    } else {
      // Crear una nueva customización
      const nuevaCustomizacion = await Customizaciones.create({
        nombreEmpresa,
        colorPrincipal,
        colorSecundario,
        tipoLetra,
        logoImg,
        clienteId,
      });
      res.status(201).json({ mensaje: 'Customización creada con éxito', customizacion: nuevaCustomizacion });
    }
  } catch (error) {
    console.error('Error al crear o actualizar customización:', error);
    res.status(500).json({ mensaje: 'Error al crear o actualizar customización', error: error.message });
  }
});

module.exports = router;
