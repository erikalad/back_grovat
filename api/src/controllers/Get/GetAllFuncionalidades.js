const express = require('express');
const { Cliente,Funcionalidades } = require('../../db');

const router = express.Router();

// Ruta para obtener todas las funcionalidades con su cliente asociado
router.get('/', async (req, res) => {
  try {
    // Obtener todas las funcionalidades desde la base de datos incluyendo su cliente asociado
    const funcionalidadesConCliente = await Funcionalidades.findAll({
      include: [
        { model: Cliente },
        // Puedes incluir otros modelos relacionados si es necesario
      ],
    });

    // Enviar respuesta con la lista de funcionalidades que incluyen su cliente asociado
    res.status(200).json(funcionalidadesConCliente);
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al obtener funcionalidades:', error);
    res.status(500).json({ mensaje: 'Error al obtener funcionalidades', error: error.message });
  }
});

module.exports = router;
