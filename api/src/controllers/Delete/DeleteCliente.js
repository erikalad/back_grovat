const express = require('express');
const { Cliente } = require('../../db'); 

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const cliente = await Cliente.findByPk(id);
      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
  
      await cliente.destroy();
  
      res.json({ mensaje: 'Cliente eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({ mensaje: 'Error al eliminar cliente', error: error.message });
    }
  });
  
  module.exports = router;