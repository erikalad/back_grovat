const express = require('express');
const router = express.Router();

// Ruta para mostrar el JSON recibido
router.post('/', (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const jsonData = req.body;

    // Mostrar el JSON en la consola del servidor
    console.log('JSON recibido:', jsonData);

    // Enviar respuesta al cliente con el JSON recibido
    res.status(200).json({ mensaje: 'JSON recibido correctamente', data: jsonData });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al procesar JSON:', error);
    res.status(500).json({ mensaje: 'Error al procesar JSON', error: error.message });
  }
});

module.exports = router;
