const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const isBetween = require("dayjs/plugin/isBetween");
const duration = require("dayjs/plugin/duration");

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(duration);

const { propuesta_palabras_clave } = require("./propuestaEnviadaData");
const no_me_interesa_variantes = require("./noMeInteresaData").no_me_interesa_variantes;
const palabrasClaveReunion = require("./reunionSolicitadaData").palabrasClaveReunion;

router.post("/", (req, res) => {
  const { mensajes, nombre, fechaFrom, fechaTo } = req.body;

  const fechaInicio = dayjs(fechaFrom, "DD/MM/YYYY");
  const fechaFin = dayjs(fechaTo, "DD/MM/YYYY");

  const conversaciones = mensajes.reduce((acc, mensaje) => {
    const convId = mensaje["CONVERSATION ID"];
    const fechaMensaje = dayjs(mensaje.DATE, ["DD/MM/YYYY", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD"]);

    if (!fechaMensaje.isValid()) {
      console.warn(`Fecha inválida para mensaje: ${mensaje.DATE}`);
      return acc;
    }

    if (fechaMensaje.isBetween(fechaInicio, fechaFin, null, "[]")) {
      if (!acc[convId]) acc[convId] = [];
      acc[convId].push(mensaje);
    }
    return acc;
  }, {});

  const totalConversacionesGestionadas = Object.keys(conversaciones).length;

  let totalConversacionesAperturadas = 0;
  let totalPropuestasEnviadas = 0;
  let totalConversacionesSinPropuesta = 0;
  let totalCalendariosEnviados = { calendly: 0, calendariosPersonalizados: 0 };
  let totalWhatsAppEnviados = {};
  let totalSolicitudesDatosContacto = {};
  let totalNoInteresados = {};
  let totalRespuestasPropuesta = 0;

  let totalHorasAperturaCalendly = 0;
  let totalHorasAperturaPropuesta = 0;
  let totalHorasPropuestaCalendly = 0;
  let totalHorasSeguimiento = 0;
  let conteoSeguimiento = 0;

  let conteoCalendly = 0;
  let conteoPropuesta = 0;
  let conteoAperturaPropuesta = 0;

  let conversacionPrueba = null;

  const resultados = Object.keys(conversaciones).map((convId) => {
    const mensajesConv = conversaciones[convId];
    mensajesConv.sort((a, b) => dayjs(a.DATE).unix() - dayjs(b.DATE).unix());

    const seguimiento = {
      mensajeApertura: {
        mensajes: [],
        calendario: { enviado: false, fecha: null, tipo: null },
        propuesta: { enviado: false, fecha: null, contenido: null, respondida: false },
        contesto: false,
        noInteresado: false,
        fecha: null,
      },
      followUp1: {
        mensajes: [],
        calendario: { enviado: false, fecha: null, tipo: null },
        propuesta: { enviado: false, fecha: null, contenido: null, respondida: false },
        contesto: false,
        noInteresado: false,
        fecha: null,
      },
      followUp2: {
        mensajes: [],
        calendario: { enviado: false, fecha: null, tipo: null },
        propuesta: { enviado: false, fecha: null, contenido: null, respondida: false },
        contesto: false,
        noInteresado: false,
        fecha: null,
      },
      followUp3: {
        mensajes: [],
        calendario: { enviado: false, fecha: null, tipo: null },
        propuesta: { enviado: false, fecha: null, contenido: null, respondida: false },
        contesto: false,
        noInteresado: false,
        fecha: null,
      },
      followUp4: {
        mensajes: [],
        calendario: { enviado: false, fecha: null, tipo: null },
        propuesta: { enviado: false, fecha: null, contenido: null, respondida: false },
        contesto: false,
        noInteresado: false,
        fecha: null,
      },
    };

    let apertura = true;
    let followUpIndex = 0;
    let demoraAperturaCalendly = null;
    let demoraAperturaPropuesta = null;
    let demoraPropuestaCalendly = null;
    let noInteresadoRegistrado = false;
    let tiemposSeguimiento = [];
    let bloquesConFechas = [];

    mensajesConv.forEach((mensaje, index) => {
      const fechaMensaje = dayjs(mensaje.DATE, "YYYY-MM-DD HH:mm:ss");
      const esMensajeDeErika = mensaje.FROM === nombre;

      const interaction = apertura
        ? seguimiento.mensajeApertura
        : seguimiento[`followUp${followUpIndex}`];

      if (interaction && interaction.mensajes) {
        interaction.mensajes.push(mensaje);
      }

      if (esMensajeDeErika && apertura) {
        seguimiento.mensajeApertura.fecha = fechaMensaje.format("YYYY-MM-DD HH:mm:ss");
        bloquesConFechas.push(fechaMensaje);
        apertura = false;
        followUpIndex++;
        totalConversacionesAperturadas++;
      } else if (esMensajeDeErika && !apertura && !interaction.fecha) {
        // Solo asignamos la fecha de inicio del bloque una vez
        interaction.fecha = fechaMensaje.format("YYYY-MM-DD HH:mm:ss");
        bloquesConFechas.push(fechaMensaje);
      }

      if (
        esMensajeDeErika &&
        mensaje.CONTENT &&
        !mensaje.CONTENT.includes("https://") &&
        propuesta_palabras_clave.some((palabra) => mensaje.CONTENT.toLowerCase().includes(palabra))
      ) {
        interaction.propuesta = { 
          enviado: true, 
          fecha: fechaMensaje.format("YYYY-MM-DD HH:mm:ss"),
          contenido: mensaje.CONTENT
        };
        totalPropuestasEnviadas++;
        conteoPropuesta++;

        if (mensajesConv[index + 1] && mensajesConv[index + 1].FROM !== nombre) {
          interaction.propuesta.respondida = true;
          totalRespuestasPropuesta++;
        }

        if (seguimiento.mensajeApertura.fecha) {
          const fechaApertura = dayjs(seguimiento.mensajeApertura.fecha, "YYYY-MM-DD HH:mm:ss");
          const demoraAperturaPropuestaDiff = fechaMensaje.diff(fechaApertura);
          const duration = dayjs.duration(demoraAperturaPropuestaDiff);
          demoraAperturaPropuesta = {
            dias: duration.days(),
            horas: duration.hours(),
            minutos: duration.minutes(),
            segundos: duration.seconds(),
          };
          totalHorasAperturaPropuesta += duration.asHours();
        }
      }

      if (
        mensaje.CONTENT &&
        no_me_interesa_variantes.some((noInteresa) => mensaje.CONTENT.toLowerCase().includes(noInteresa))
      ) {
        interaction.noInteresado = true;

        if (!noInteresadoRegistrado) {
          totalNoInteresados[convId] = seguimiento;
          noInteresadoRegistrado = true;
        }
      }

      if (
        esMensajeDeErika &&
        mensaje.CONTENT &&
        (mensaje.CONTENT.includes("https://calendly") || mensaje.CONTENT.includes("https://api.leadconnectorhq.com/widget/bookings"))
      ) {
        const tipoCalendario = mensaje.CONTENT.includes("https://calendly") ? 'calendly' : 'calendariosPersonalizados';
        interaction.calendario = { enviado: true, fecha: fechaMensaje.format("YYYY-MM-DD HH:mm:ss"), tipo: tipoCalendario };
        totalCalendariosEnviados[tipoCalendario]++;

        if (seguimiento.mensajeApertura.fecha && interaction.calendario.fecha) {
          const fechaApertura = dayjs(seguimiento.mensajeApertura.fecha, "YYYY-MM-DD HH:mm:ss");
          const demoraAperturaCalendlyDiff = fechaMensaje.diff(fechaApertura);
          const duration = dayjs.duration(demoraAperturaCalendlyDiff);
          demoraAperturaCalendly = {
            dias: duration.days(),
            horas: duration.hours(),
            minutos: duration.minutes(),
            segundos: duration.seconds(),
          };
          totalHorasAperturaCalendly += duration.asHours();
          conteoCalendly++;
        }

        if (interaction.propuesta.enviado && interaction.propuesta.fecha) {
          const fechaPropuesta = dayjs(interaction.propuesta.fecha, "YYYY-MM-DD HH:mm:ss");
          const demoraPropuestaCalendlyDiff = fechaMensaje.diff(fechaPropuesta);
          const duration = dayjs.duration(demoraPropuestaCalendlyDiff);
          demoraPropuestaCalendly = {
            dias: duration.days(),
            horas: duration.hours(),
            minutos: duration.minutes(),
            segundos: duration.seconds(),
          };
          totalHorasPropuestaCalendly += duration.asHours();
          conteoAperturaPropuesta++;
        }

        if (!conversacionPrueba) {
          conversacionPrueba = {
            conversacionId: convId,
            mensajes: mensajesConv,
            seguimiento,
            demoraAperturaCalendly,
            demoraAperturaPropuesta,
            demoraPropuestaCalendly,
          };
        }
      }
    });

    // Cálculo de tiempos de seguimiento entre inicios de bloques
    for (let i = 1; i < bloquesConFechas.length; i++) {
      const diff = bloquesConFechas[i].diff(bloquesConFechas[i - 1], "hours", true);
      tiemposSeguimiento.push(diff);
    }

    if (tiemposSeguimiento.length > 0) {
      const promedioHorasSeguimiento = tiemposSeguimiento.reduce((acc, val) => acc + val, 0) / tiemposSeguimiento.length;
      if (conversacionPrueba) {
        conversacionPrueba.demoraSeguimiento = formatDuration(promedioHorasSeguimiento);
      }
      totalHorasSeguimiento += promedioHorasSeguimiento;
      conteoSeguimiento++;
    }

    return seguimiento;
  });

  const porcentajeNoInteresados = (Object.keys(totalNoInteresados).length / totalConversacionesGestionadas) * 100;
  const tasaRespuestaPropuesta = (totalRespuestasPropuesta / totalPropuestasEnviadas) * 100;

  totalConversacionesSinPropuesta = totalConversacionesAperturadas - conteoPropuesta;

  const promedioAperturaCalendly = conteoCalendly > 0 ? totalHorasAperturaCalendly / conteoCalendly : 0;
  const promedioAperturaPropuesta = conteoPropuesta > 0 ? totalHorasAperturaPropuesta / conteoPropuesta : 0;
  const promedioPropuestaCalendly = conteoAperturaPropuesta > 0 ? totalHorasPropuestaCalendly / conteoAperturaPropuesta : 0;
  const promedioHorasSeguimiento = conteoSeguimiento > 0 ? totalHorasSeguimiento / conteoSeguimiento : 0;

  res.json({
    totalConversacionesGestionadas,
    totalConversacionesAperturadas,
    totalPropuestasEnviadas,
    totalConversacionesSinPropuesta,
    totalCalendariosEnviados,
    totalWhatsAppEnviados,
    totalSolicitudesDatosContacto,
    totalNoInteresados,
    porcentajeNoInteresados,
    tasaRespuestaPropuesta,
    resultados,
    conversacionPrueba,
    promedioAperturaCalendly: formatDuration(promedioAperturaCalendly),
    promedioAperturaPropuesta: formatDuration(promedioAperturaPropuesta),
    promedioPropuestaCalendly: formatDuration(promedioPropuestaCalendly),
    promedioHorasSeguimiento: formatDuration(promedioHorasSeguimiento),
  });
});

// Helper function to format duration in days, hours, minutes, and seconds
function formatDuration(hours) {
  const duration = dayjs.duration(hours, "hours");
  return {
    dias: duration.days(),
    horas: duration.hours(),
    minutos: duration.minutes(),
    segundos: duration.seconds(),
  };
}

module.exports = router;
