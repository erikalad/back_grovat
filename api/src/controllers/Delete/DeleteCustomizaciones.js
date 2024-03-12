const express = require('express');
const { Customizaciones } = require('../../db');

const router = express.Router();

// Ruta para borrar una customización por su ID
router.delete('/:id', async (req, res) => {
  try {
    const customizacionId = req.params.id;

    // Verificar si la customización existe
    const customizacion = await Customizaciones.findByPk(customizacionId);
    if (!customizacion) {
      return res.status(404).json({ mensaje: 'No se encontró la customización con el ID proporcionado.' });
    }

    // Borrar la customización
    await customizacion.destroy();

    res.status(200).json({ mensaje: 'Customización eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar customización:', error);
    res.status(500).json({ mensaje: 'Error al eliminar customización', error: error.message });
  }
});

module.exports = router;
