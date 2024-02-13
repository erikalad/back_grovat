const express = require('express');
const { Usuario, sequelize, Op, Cliente } = require('../../db');

const router = express.Router();

// Ruta para actualizar un usuario (PATCH)
router.patch('/:idUsuario', async (req, res) => {
  try {
    // Obtener el ID del usuario desde los parámetros de la ruta
    const { idUsuario } = req.params;

    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, email, usuario, contraseña, activo, type, loguado } = req.body;

    // Verificar si el usuario con el ID proporcionado existe
    const usuarioExistente = await Usuario.findByPk(idUsuario);

    if (!usuarioExistente) {
      return res.status(404).json({ mensaje: 'No se encontró el usuario proporcionado.' });
    }

    // Verificar si el nuevo email y nuevo usuario no existen en otros usuarios
    const usuariosConNuevoEmailUsuario = await Usuario.findAll({
      where: {
        [Op.and]: [
          { id_usuario: { [Op.not]: idUsuario } }, // Excluir el usuario actual
          { [Op.or]: [{ email }, { usuario }] }, // Verificar nuevo email o usuario
        ],
      },
    });

    if (usuariosConNuevoEmailUsuario.length > 0) {
      return res.status(400).json({ mensaje: 'El nuevo email o usuario ya están registrados en otro usuario.' });
    }

    // Actualizar los campos específicos del usuario
    await usuarioExistente.update({
      nombre,
      apellido,
      email,
      usuario,
      contraseña,
      activo,
      type,
      loguado
    });

    // Enviar respuesta con el usuario actualizado
    res.status(200).json({ mensaje: 'Usuario actualizado con éxito', usuario: usuarioExistente });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

module.exports = router;
