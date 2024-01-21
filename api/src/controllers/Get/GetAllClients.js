const express = require('express');
const { Cliente, Usuario, Customizaciones, Funcionalidades } = require('../../db'); 

const router = express.Router();

// Ruta para obtener todos los clientes
router.get('/', async (req, res) => {
    try {
      // Obtener todos los clientes desde la base de datos
      const clientes = await Cliente.findAll({
        include: [
          { model: Usuario },
          { model: Customizaciones },
          { model: Funcionalidades },
        ],
      });  
      // Enviar respuesta con la lista de clientes
      res.status(200).json(clientes);
    } catch (error) {
      // Manejar errores y enviar respuesta al cliente
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
    }
  });

  module.exports = router;