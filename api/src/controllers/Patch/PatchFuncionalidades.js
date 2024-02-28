const express = require('express');
const { Funcionalidades } = require('../../db');

const router = express.Router();

// Ruta PATCH para actualizar fecha de inicio y fecha de fin
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { fechaInicio, fechaFin } = req.body;

  try {
    const funcionalidad = await Funcionalidades.findByPk(id);

    if (!funcionalidad) {
      return res.status(404).json({ error: 'Funcionalidad no encontrada' });
    }

    // Verifica que solo se estén actualizando fechaInicio y fechaFin
    if (fechaInicio !== undefined) {
      funcionalidad.fechaInicio = fechaInicio;
    }

    if (fechaFin !== undefined) {
      funcionalidad.fechaFin = fechaFin;
    }

    await funcionalidad.save();

    return res.status(200).json(funcionalidad);
  } catch (error) {
    console.error('Error al actualizar funcionalidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
