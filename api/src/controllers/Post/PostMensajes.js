const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Suponiendo que los mensajes y el nombre están en el cuerpo de la solicitud (req.body)
    const mensajes = req.body.mensajes;
    const nombre = req.body.nombre;

    // Función para convertir la fecha y hora de un mensaje en un objeto Date
    const parsearFechaHora = (fecha, hora) => {
      const [dia, mes, año] = fecha.split('/');
      const [horaStr, minutoStr, segundoStr] = hora.split(':');
      return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia), parseInt(horaStr), parseInt(minutoStr), parseInt(segundoStr));
    };

    // Primero, encuentra todas las IDs de conversaciones únicas en las que el usuario ha participado.
    const idsConversacionesUsuario = new Set(mensajes.filter(mensaje => mensaje.FROM === nombre || mensaje.TO === nombre).map(mensaje => mensaje['CONVERSATION ID']));

    // Luego, filtra los mensajes para incluir solo aquellos cuya ID de conversación está en el conjunto de IDs de conversaciones del usuario.
    const mensajesFiltrados = mensajes.filter(mensaje => idsConversacionesUsuario.has(mensaje['CONVERSATION ID']));

    // Agrupar mensajes filtrados por CONVERSATION ID
    const agrupadosPorConversacion = mensajesFiltrados.reduce((acc, mensaje) => {
      if (!acc[mensaje['CONVERSATION ID']]) {
        acc[mensaje['CONVERSATION ID']] = [];
      }
      acc[mensaje['CONVERSATION ID']].push(mensaje);
      return acc;
    }, {});

    // Filtrar las conversaciones para eliminar aquellas en las que todos los mensajes son de otros remitentes
    const conversacionesFiltradas = Object.values(agrupadosPorConversacion)
      .filter(conversacion => conversacion.some(mensaje => mensaje.FROM === nombre));

    // Convertir el objeto de grupos en un array de conversaciones y ordenarlas por fecha y hora
    const conversaciones = Object.values(conversacionesFiltradas)
      .map(conversacion => {
        // Ordenar los mensajes de la conversación por fecha y hora
        conversacion.sort((a, b) => {
          const fechaHoraA = parsearFechaHora(a.DATE.DATE, a.DATE.HORA);
          const fechaHoraB = parsearFechaHora(b.DATE.DATE, b.DATE.HORA);
          return fechaHoraA - fechaHoraB;
        });

        // Verificar el destinatario de la conversación
        const destinatario = conversacion[0].TO === nombre ? conversacion[0].FROM : conversacion[0].TO;

        // Verificar si el mensaje de apertura fue enviado
        const mensajeApertura = conversacion.find(mensaje => mensaje.FROM === nombre);
        const indiceApertura = conversacion.findIndex(mensaje => mensaje === mensajeApertura);

        // Verificar si el mensaje de apertura fue contestado
        let mensajeAperturaContestado = false;
        if (mensajeApertura) {
          const fechaApertura = parsearFechaHora(mensajeApertura.DATE.DATE, mensajeApertura.DATE.HORA);
          const dosDiasDespuesApertura = new Date(fechaApertura);
          dosDiasDespuesApertura.setDate(fechaApertura.getDate() + 2);
          mensajeAperturaContestado = conversacion.slice(indiceApertura + 1).some(mensaje => mensaje.FROM !== nombre && mensaje.FROM !== null && parsearFechaHora(mensaje.DATE.DATE, mensaje.DATE.HORA) <= dosDiasDespuesApertura);
          
          if (!mensajeAperturaContestado) {
            const siguienteMensajeDespuesDosDias = conversacion.slice(indiceApertura + 1).find(mensaje => parsearFechaHora(mensaje.DATE.DATE, mensaje.DATE.HORA) > dosDiasDespuesApertura);
            if (siguienteMensajeDespuesDosDias) {
              if (siguienteMensajeDespuesDosDias.FROM === nombre) {
                mensajeAperturaContestado = false;
              } else {
                mensajeAperturaContestado = true;
              }
            }
          }
        }

        // Verificar los follow-ups
        const followUps = [];
        for (let i = 1; i <= 4; i++) {
          const followUp = conversacion.find(mensaje => mensaje.CONTENT === `FollowUp${i}`);
          if (followUp) {
            followUps.push({
              enviado: true,
              contesto: !!conversacion.find(mensaje => mensaje.FROM !== nombre && mensaje.FROM !== null && mensaje.DATE > followUp.DATE)
            });
          } else {
            followUps.push({ enviado: false, contesto: false });
          }
        }

        // Obtener el link del perfil
        const linkPerfil = conversacion[0].FROM === nombre ? conversacion[0]['RECIPIENT PROFILE URLS'] : null;

        // Determinar el valor de contactar
        let contactar = '-';
        if (mensajeApertura) {
          const fechaApertura = parsearFechaHora(mensajeApertura.DATE.DATE, mensajeApertura.DATE.HORA);
          const hoy = new Date();
          const diferenciaDias = Math.floor((hoy - fechaApertura) / (1000 * 60 * 60 * 24));

          if (diferenciaDias === 0 && !mensajeAperturaContestado) {
            contactar = 2;
          } else if (diferenciaDias === 1) {
            contactar = 1;
          } else if (diferenciaDias === 2) {
            contactar = 'hoy';
          } else if (diferenciaDias > 2) {
            contactar = 'atrasado';
          }
        }

        return {
          conversacion,
          seguimiento: {
            key: Math.floor(Math.random() * 1000), // Generar una clave única temporal
            contacto: destinatario,
            link: linkPerfil,
            mensajeApertura: { enviado: !!mensajeApertura, contesto: mensajeAperturaContestado },
            followUp1: followUps[0],
            followUp2: followUps[1],
            followUp3: followUps[2],
            followUp4: followUps[3],
            contactar,
          }
        };
      })
      // Ordenar las conversaciones por fecha y hora del mensaje más antiguo al más reciente
      .sort((a, b) => {
        const fechaHoraA = parsearFechaHora(a.conversacion[0].DATE.DATE, a.conversacion[0].DATE.HORA);
        const fechaHoraB = parsearFechaHora(b.conversacion[0].DATE.DATE, b.conversacion[0].DATE.HORA);
        return fechaHoraA - fechaHoraB;
      });

    // Ordenar las conversaciones en orden contrario
    conversaciones.reverse();
    // Respondemos con las conversaciones y su seguimiento
    res.json(conversaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar los mensajes', error: error.message });
  }
});

module.exports = router;
