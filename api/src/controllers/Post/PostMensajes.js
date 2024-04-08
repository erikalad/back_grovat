const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

router.post('/', (req, res) => {
    const { mensajes, nombre } = req.body;

    const conversaciones = mensajes.reduce((acc, mensaje) => {
        const convId = mensaje['CONVERSATION ID'];
        const esMensajeDeErika = mensaje.FROM === nombre;
    
        if (!acc[convId]) acc[convId] = [];
        acc[convId].push(mensaje);
    
        return acc;
    }, {});
    
    // Filtrar conversaciones que no tienen ningún mensaje de nombre
    const conversacionesFiltradas = Object.keys(conversaciones)
        .filter(convId => conversaciones[convId].some(mensaje => mensaje.FROM === nombre))
        .reduce((acc, convId) => {
            acc[convId] = conversaciones[convId];
            return acc;
        }, {});

    const resultados = Object.keys(conversacionesFiltradas).map(convId => {
        const mensajesConv = conversacionesFiltradas[convId];
        mensajesConv.sort((a, b) => dayjs(a.DATE.DATE + ' ' + a.DATE.HORA, 'DD/MM/YYYY HH:mm:ss').unix() - dayjs(b.DATE.DATE + ' ' + b.DATE.HORA, 'DD/MM/YYYY HH:mm:ss').unix());

        const seguimiento = {
            key: convId,
            link: '',
            contacto: '',
            mensajeApertura: { enviado: false, contesto: false, calendly: false },
            followUp1: { enviado: false, contesto: false, calendly: false },
            followUp2: { enviado: false, contesto: false, calendly: false },
            followUp3: { enviado: false, contesto: false, calendly: false },
            followUp4: { enviado: false, contesto: false, calendly: false },
            contactar: '',
            calendlyEnviado: false
        };

        let fechaUltimoMensajeErika = dayjs('1900-01-01');
        let ultimoTipoSeguimiento = '';
        let seguimientoIniciado = false;

        // Función para verificar si un mensaje contiene "https://calendly"
        const contieneCalendly = (mensaje) => {
            return typeof mensaje.CONTENT === 'string' && mensaje.CONTENT.toLowerCase().includes("https://calendly");
        };
        

        mensajesConv.forEach((mensaje, index) => {
            const fechaMensaje = dayjs(mensaje.DATE.DATE + ' ' + mensaje.DATE.HORA, 'DD/MM/YYYY HH:mm:ss');
            const esMensajeDeErika = mensaje.FROM === nombre;

            if (esMensajeDeErika && !seguimientoIniciado) {
                seguimientoIniciado = true;
                seguimiento.contacto = mensaje.TO;
                seguimiento.link = mensaje['RECIPIENT PROFILE URLS'];
                seguimiento.mensajeApertura.enviado = true;
                ultimoTipoSeguimiento = 'mensajeApertura';
                fechaUltimoMensajeErika = fechaMensaje;
            } else if (esMensajeDeErika && seguimientoIniciado) {
                // Verificar si el mensaje contiene "https://calendly" y establecer la propiedad correspondiente
                if (contieneCalendly(mensaje)) {
                    seguimiento[ultimoTipoSeguimiento].calendly = true;
                    seguimiento.calendlyEnviado = true; // Establecer calendlyEnviado como true si se encuentra "https://calendly"
                }
                if (fechaUltimoMensajeErika.isBefore(fechaMensaje, 'day')) {
                    const followUpNumber = ultimoTipoSeguimiento === 'mensajeApertura' ? 1 : parseInt(ultimoTipoSeguimiento.replace('followUp', '')) + 1;
                    if (followUpNumber <= 4) {
                        ultimoTipoSeguimiento = 'followUp' + followUpNumber;
                        seguimiento[ultimoTipoSeguimiento].enviado = true;
                        fechaUltimoMensajeErika = fechaMensaje;
                    }
                }
            } else if (!esMensajeDeErika && seguimientoIniciado) {
                if (fechaUltimoMensajeErika.isSame(fechaMensaje, 'day') || fechaUltimoMensajeErika.isBefore(fechaMensaje, 'day')) {
                    seguimiento[ultimoTipoSeguimiento].contesto = true;
                }
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
