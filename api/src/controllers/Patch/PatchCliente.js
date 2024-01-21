const express = require('express');
const { Cliente, Funcionalidades } = require('../../db');
const { Op } = require('sequelize');

const router = express.Router();

// Ruta para actualizar un cliente (PATCH)
router.patch('/:idCliente', async (req, res) => {
  try {
    console.log('Entrando en la ruta PATCH de clientes');
    // Obtener el ID del cliente desde los parámetros de la ruta
    const { idCliente } = req.params;

    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, email, fechaVencimiento, plan, activo } = req.body;

    // Verificar si el cliente con el ID proporcionado existe
    const clienteExistente = await Cliente.findByPk(idCliente);

    if (!clienteExistente) {
      return res.status(404).json({ mensaje: 'No se encontró el cliente con el ID proporcionado.' });
    }

    // Verificar si el nuevo email ya existe en otro cliente
    const clientesConNuevoEmail = await Cliente.findAll({
      where: {
        [Op.and]: [
          { id_cliente: { [Op.not]: idCliente } }, // Excluir el cliente actual
          { email }, // Verificar nuevo email
        ],
      },
    });

    if (clientesConNuevoEmail.length > 0) {
      return res.status(400).json({ mensaje: 'El nuevo email ya está registrado en otro cliente.' });
    }

    // Actualizar los campos específicos del cliente
    await clienteExistente.update({
      nombre,
      apellido,
      email,
      fechaVencimiento,
      plan,
      activo,
    });

    // Verificar si el cliente bajó de plan empresarial
    if (clienteExistente.plan === 'empresarial' && plan !== 'empresarial') {
      console.log('Cliente bajó de plan empresarial');
      // Buscar la funcionalidad asociada al cliente con gratis en true y sin fechaFin
      const funcionalidadEmpresarial = await Funcionalidades.findOne({
        where: {
          clienteId: idCliente,
          gratis: true,
          fechaFin: null,
        },
      });
    
      console.log('Funcionalidad Empresarial encontrada:', funcionalidadEmpresarial);
    
      // Si se encuentra la funcionalidad, actualizarla
      if (funcionalidadEmpresarial) {
        console.log('Actualizando funcionalidad empresarial');
        await funcionalidadEmpresarial.update({ gratis: false });
      }
    }

    // Si el plan es "empresarial" y el cliente no tenía ese plan previamente, crea una nueva funcionalidad asociada al cliente
    if (plan === 'empresarial') {
      await Funcionalidades.create({
        clienteId: idCliente,
        gratis: true,
        fechaSolicitud: null,
        fechaInicio: null,
        fechaFin: null,
      });
    }

    // Enviar respuesta con el cliente actualizado
    res.status(200).json({ mensaje: 'Cliente actualizado con éxito', cliente: clienteExistente });
  } catch (error) {
    // Manejar errores y enviar respuesta al cliente
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ mensaje: 'Error al actualizar cliente', error: error.message });
  }
});

module.exports = router;
