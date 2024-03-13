const express = require('express');
const { Usuario } = require('../../db'); 

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
  
      await usuario.destroy();
  
      res.json({ mensaje: 'Usuario eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
    }
  });
  
  module.exports = router;