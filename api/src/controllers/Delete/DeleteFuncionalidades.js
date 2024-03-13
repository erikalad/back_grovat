const express = require('express');
const { Funcionalidades } = require('../../db');

const router = express.Router();

// Ruta para borrar una customización por su ID
router.delete('/:id', async (req, res) => {
  try {
    const funcionalidadId = req.params.id;

    // Verificar si la customización existe
    const funcionalidad = await Funcionalidades.findByPk(funcionalidadId);
    if (!funcionalidad) {
      return res.status(404).json({ mensaje: 'No se encontró la funcionalidad con el ID proporcionado.' });
    }

    // Borrar la customización
    await funcionalidad.destroy();

    res.status(200).json({ mensaje: 'Funcionalidad eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar funcionalidad:', error);
    res.status(500).json({ mensaje: 'Error al eliminar funcionalidad', error: error.message });
  }
});

module.exports = router;
