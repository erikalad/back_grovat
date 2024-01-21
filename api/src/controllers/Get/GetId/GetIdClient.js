const express = require('express');
const { Cliente, Usuario, Customizaciones, Funcionalidades } = require('./../../../db'); 

const router = express.Router();

// Ruta para obtener un cliente y sus relaciones
router.get('/:idCliente', async (req, res) => {
    try {
      const { idCliente } = req.params;

      // Obtener un cliente específico desde la base de datos con sus relaciones
      const cliente = await Cliente.findByPk(idCliente, {
        include: [
          { model: Usuario },
          { model: Customizaciones },
          { model: Funcionalidades },
        ],
      });  

      // Verificar si el cliente existe
      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }

      // Enviar respuesta con el cliente y sus relaciones
      res.status(200).json(cliente);
    } catch (error) {
      // Manejar errores y enviar respuesta al cliente
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ mensaje: 'Error al obtener cliente', error: error.message });
    }
  });
  module.exports = router;