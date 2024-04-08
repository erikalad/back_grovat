const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

router.post('/', (req, res) => {
    const { mensajes, nombre } = req.body;

    // Agrupa los mensajes por CONVERSATION ID
    const conversaciones = mensajes.reduce((acc, mensaje) => {
        const convId = mensaje['CONVERSATION ID'];
        if (!acc[convId]) acc[convId] = [];
        acc[convId].push(mensaje);
        return acc;
    }, {});

    // Procesa cada conversación
    const resultados = Object.keys(conversaciones).map(convId => {
        const mensajesConv = conversaciones[convId];

        // Ordena los mensajes por fecha y hora
        mensajesConv.sort((a, b) => dayjs(a.DATE.DATE + ' ' + a.DATE.HORA, 'DD/MM/YYYY HH:mm:ss').unix() - dayjs(b.DATE.DATE + ' ' + b.DATE.HORA, 'DD/MM/YYYY HH:mm:ss').unix());

        const seguimiento = {
            key: convId,
            link: '',
            contacto: '',
            mensajeApertura: { enviado: false, contesto: false },
            followUp1: { enviado: false, contesto: false },
            followUp2: { enviado: false, contesto: false },
            followUp3: { enviado: false, contesto: false },
            followUp4: { enviado: false, contesto: false },
            contactar: '',
            calendlyEnviado: false
        };

        let fechaUltimoMensajeErika = dayjs('1900-01-01');
        let ultimoTipoSeguimiento = '';
        let seguimientoIniciado = false;

        mensajesConv.forEach((mensaje, index) => {
            const fechaMensaje = dayjs(mensaje.DATE.DATE + ' ' + mensaje.DATE.HORA, 'DD/MM/YYYY HH:mm:ss');
            const esMensajeDeErika = mensaje.FROM === nombre;

            if (esMensajeDeErika) {
                if (!seguimientoIniciado) {
                    seguimientoIniciado = true;
                    seguimiento.mensajeApertura.enviado = true;
                    ultimoTipoSeguimiento = 'mensajeApertura';
                } else if (fechaUltimoMensajeErika.format('DD/MM/YYYY') !== fechaMensaje.format('DD/MM/YYYY')) {
                    const followUpNumber = ultimoTipoSeguimiento === 'mensajeApertura' ? 1 : parseInt(ultimoTipoSeguimiento.replace('followUp', '')) + 1;
                    if (followUpNumber <= 4) {
                        ultimoTipoSeguimiento = 'followUp' + followUpNumber;
                        seguimiento[ultimoTipoSeguimiento].enviado = true;
                    }
                }

                seguimiento.link = mensaje['RECIPIENT PROFILE URLS'];
                seguimiento.contacto = mensaje.TO;
                fechaUltimoMensajeErika = fechaMensaje;

                if (mensaje.CONTENT && mensaje.CONTENT.toLowerCase().includes("calendly")) {
                    seguimiento.calendlyEnviado = true;
                }
            } else if (fechaUltimoMensajeErika.format('DD/MM/YYYY') === fechaMensaje.format('DD/MM/YYYY') && seguimientoIniciado) {
                seguimiento[ultimoTipoSeguimiento].contesto = true;
            }
        });

        const hoy = dayjs();
        const diasDesdeUltimoMensaje = hoy.diff(fechaUltimoMensajeErika, 'day');
        seguimiento.contactar = diasDesdeUltimoMensaje === 0 ? '2' :
                                diasDesdeUltimoMensaje === 1 ? '1' :
                                diasDesdeUltimoMensaje > 2 ? 'atrasado' : 'hoy';

        return {
            conversacion: mensajesConv,
            seguimiento
        };
    });

    res.json(resultados);
});

module.exports = router;
