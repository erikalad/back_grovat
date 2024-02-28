const express = require('express');
const { Cliente,Funcionalidades } = require('../../db'); 

const router = express.Router();

// Ruta para obtener todos los clientes con sus funcionalidades
router.get('/', async (req, res) => {
    try {
        // Obtener todos los clientes desde la base de datos con sus relaciones
        const clientes = await Cliente.findAll({
            include: [
                { model: Funcionalidades } // Incluir solo las funcionalidades asociadas al cliente
            ],
        });

        // Mapear la información para obtener solo el ID del cliente y sus funcionalidades
        const clientesConFuncionalidades = clientes.map(cliente => {
            return {
                clienteId: cliente.id_cliente,
                funcionalidades: cliente.funcionalidades
            };
        });

        // Enviar respuesta con la lista de clientes y sus funcionalidades
        res.status(200).json(clientesConFuncionalidades);
    } catch (error) {
        // Manejar errores y enviar respuesta al cliente
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
    }
});

module.exports = router;
