const no_me_interesa_variantes = require("./noMeInteresaData").no_me_interesa_variantes;
const propuesta_palabras_clave = require("./propuestaEnviadaData").propuesta_palabras_clave;
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");

const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const palabrasClaveReunion = [
  "reunión",
  "agendar reunión",
  "reunión virtual",
  "reunión presencial",
  "llamada",
  "call",
  "videollamada",
  "videoconferencia",
  "demo",
  "demostración",
  "sesión",
  "agendar",
  "cita",
  "programar una reunión",
  "invitar a reunión",
  "organizar una llamada",
  "coordinamos una llamada",
  "agenda",
  "programemos una reunión",
  "charlar",
  "charlemos",
  "hablar",
  "hablemos",
  "platicar",
  "platiquemos",
  "15 minutos",
  "20 minutos",
  "media hora",
  "30 minutos",
  "una hora",
  "60 minutos"
];

router.post("/", (req, res) => {
  const { mensajes, nombre } = req.body;

  const conversaciones = mensajes.reduce((acc, mensaje) => {
    const convId = mensaje["CONVERSATION ID"];
    if (!acc[convId]) acc[convId] = [];
    acc[convId].push(mensaje);
    return acc;
  }, {});

  const conversacionesFiltradas = Object.keys(conversaciones)
    .filter((convId) =>
      conversaciones[convId].some((mensaje) => mensaje.FROM === nombre)
    )
    .reduce((acc, convId) => {
      acc[convId] = conversaciones[convId];
      return acc;
    }, {});

  const resultados = Object.keys(conversacionesFiltradas).map((convId) => {
    const mensajesConv = conversacionesFiltradas[convId];
    mensajesConv.sort(
      (a, b) =>
        dayjs(a.DATE.DATE + " " + a.DATE.HORA, "DD/MM/YYYY HH:mm:ss").unix() -
        dayjs(b.DATE.DATE + " " + b.DATE.HORA, "DD/MM/YYYY HH:mm:ss").unix()
    );

    const seguimiento = {
      key: convId,
      link: "",
      contacto: "",
      mensajeApertura: {
        enviado: false,
        contesto: false,
        calendly: false,
        noInteresado: false,
        propuesta: false,
      },
      followUp1: {
        enviado: false,
        contesto: false,
        calendly: false,
        noInteresado: false,
        propuesta: false,
      },
      followUp2: {
        enviado: false,
        contesto: false,
        calendly: false,
        noInteresado: false,
        propuesta: false,
      },
      followUp3: {
        enviado: false,
        contesto: false,
        calendly: false,
        noInteresado: false,
        propuesta: false,
      },
      followUp4: {
        enviado: false,
        contesto: false,
        calendly: false,
        noInteresado: false,
        propuesta: false,
      },
      contactar: "",
      calendlyEnviado: false,
    };

    let fechaUltimoMensajeErika = dayjs("1900-01-01");
    let ultimoTipoSeguimiento = "";
    let seguimientoIniciado = false;
    let followUp4EndDate = null;
    let esNoInteresado = false;
    let propuestaMarcada = false; // Variable para marcar la primera propuesta válida

    const contieneCalendly = (mensaje) => {
      return (
        typeof mensaje.CONTENT === "string" &&
        mensaje.CONTENT.toLowerCase().includes("https://calendly")
      );
    };

    const contieneNoInteresado = (mensaje) => {
      return (
        typeof mensaje.CONTENT === "string" &&
        no_me_interesa_variantes.some((variacion) =>
          mensaje.CONTENT.toLowerCase().includes(variacion)
        )
      );
    };

    const contieneReunion = (mensaje) => {
      return (
        typeof mensaje.CONTENT === "string" &&
        palabrasClaveReunion.some((palabra) =>
          mensaje.CONTENT.toLowerCase().includes(palabra.toLowerCase())
        )
      );
    };

    const contienePropuestaConInvitacion = (mensaje) => {
      return (
        typeof mensaje.CONTENT === "string" &&
        propuesta_palabras_clave.some((palabra) =>
          mensaje.CONTENT.toLowerCase().includes(palabra.toLowerCase())
        ) &&
        contieneReunion(mensaje) &&
        mensaje.CONTENT.length >= 270 &&
        mensaje.CONTENT.length <= 1200
      );
    };

    const marcarPropuestaSiNoEstaMarcada = (tipoSeguimiento) => {
      if (!seguimiento[tipoSeguimiento].propuesta && !propuestaMarcada) {
        seguimiento[tipoSeguimiento].propuesta = true;
        propuestaMarcada = true;
      }
    };

    mensajesConv.forEach((mensaje, index) => {
      const fechaMensaje = dayjs(
        mensaje.DATE.DATE + " " + mensaje.DATE.HORA,
        "DD/MM/YYYY HH:mm:ss"
      );
      const esMensajeDeErika = mensaje.FROM === nombre;

      if (esMensajeDeErika && !seguimientoIniciado) {
        seguimientoIniciado = true;
        seguimiento.contacto = mensaje.TO;
        seguimiento.link = mensaje["RECIPIENT PROFILE URLS"];
        seguimiento.mensajeApertura.enviado = true;
        ultimoTipoSeguimiento = "mensajeApertura";
        fechaUltimoMensajeErika = fechaMensaje;
        if (contienePropuestaConInvitacion(mensaje)) {
          marcarPropuestaSiNoEstaMarcada("mensajeApertura");
        }
      } else if (esMensajeDeErika && seguimientoIniciado) {
        if (fechaUltimoMensajeErika.isBefore(fechaMensaje, "day")) {
          const followUpNumber =
            ultimoTipoSeguimiento === "mensajeApertura"
              ? 1
              : parseInt(ultimoTipoSeguimiento.replace("followUp", "")) + 1;
          if (followUpNumber <= 4) {
            ultimoTipoSeguimiento = "followUp" + followUpNumber;
            seguimiento[ultimoTipoSeguimiento].enviado = true;
            fechaUltimoMensajeErika = fechaMensaje;
            if (followUpNumber === 4) {
              followUp4EndDate = fechaUltimoMensajeErika.add(7, "day");
            }
          }
        }
        if (contieneCalendly(mensaje)) {
          seguimiento[ultimoTipoSeguimiento].calendly = true;
          seguimiento.calendlyEnviado = true;
        }
        if (contienePropuestaConInvitacion(mensaje)) {
          marcarPropuestaSiNoEstaMarcada(ultimoTipoSeguimiento);
        }
      } else if (!esMensajeDeErika && seguimientoIniciado) {
        if (
          fechaUltimoMensajeErika.isSame(fechaMensaje, "day") ||
          fechaUltimoMensajeErika.isBefore(fechaMensaje, "day")
        ) {
          seguimiento[ultimoTipoSeguimiento].contesto = true;
        }
        if (contieneNoInteresado(mensaje)) {
          seguimiento[ultimoTipoSeguimiento].noInteresado = true;
          esNoInteresado = true;
        }
      }
    });

    // Asegurar que followUp4 no se marque como contestado, calendly enviado, o propuesta enviada después de su tiempo límite
    if (followUp4EndDate) {
      mensajesConv.forEach((mensaje) => {
        const fechaMensaje = dayjs(
          mensaje.DATE.DATE + " " + mensaje.DATE.HORA,
          "DD/MM/YYYY HH:mm:ss"
        );
        const esMensajeDeErika = mensaje.FROM === nombre;

        if (!esMensajeDeErika && fechaMensaje.isAfter(followUp4EndDate)) {
          seguimiento.followUp4.contesto = false;
        } else if (esMensajeDeErika && fechaMensaje.isAfter(followUp4EndDate)) {
          seguimiento.followUp4.calendly = false;
          seguimiento.followUp4.propuesta = false;
        }
      });
    }

    const hoy = dayjs();
    const diasDesdeUltimoMensaje = hoy.diff(fechaUltimoMensajeErika, "day");

    if (esNoInteresado) {
      seguimiento.contactar = "No interesado";
    } else if (followUp4EndDate && hoy.isAfter(followUp4EndDate)) {
      seguimiento.contactar = "Finalizado";
    } else {
      seguimiento.contactar =
        diasDesdeUltimoMensaje === 0
          ? "2"
          : diasDesdeUltimoMensaje === 1
          ? "1"
          : diasDesdeUltimoMensaje > 2
          ? "Atrasado"
          : "Hoy";
    }

    return {
      conversacion: mensajesConv,
      seguimiento,
    };
  });

  res.json(resultados);
});

module.exports = router;
