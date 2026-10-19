// =============================================================================
// ICT — Infraestructuras comunes de telecomunicaciones (feature-36, paso 3): lo
// que el módulo aporta a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { dibujoIct } from "./dibujo";
import { ictEstadoDefaults, type IctEstado } from "./estado";
import { justificarIct, type ElementoIct, type JustificacionIct } from "./justificacion";
import { memoriaIct } from "./memoria";
import { AMBITO_ICT, ARQUETA_ICT, EDICION_ICT, RITI_RITS_ICT, RITU_ICT, RTR_ICT, TOMAS_ICT } from "./tablas";
import {
  describirDibujoIct,
  franjaIct,
  fraseIct,
  metricasIct,
  NOMBRE_RECINTO,
  piezasIct,
  queEntraIct,
  resultadoListaIct,
  textoAvisoIct,
  textoEtiquetaIct,
  textoIncumplimientoIct,
} from "./textos";

export const ICT_PDF_SVG_ID = "ict-svg-pdf";

function limite(el: ElementoIct): string {
  const d = el.detalle;
  switch (d.clase) {
    case "regimen":
      return "art. 2";
    case "recinto":
      return "Anexo III 4.5.3";
    case "arqueta":
      return "Anexo III 5.1";
    case "canalizacion_externa":
      return "Anexo III 5.2";
    case "canalizacion_principal":
      return "Anexo III 5.7";
    case "rtr":
      return "Anexo III 5.11";
    case "tomas":
      return "Anexo III 5.13";
    case "pau":
    case "proyecto":
      return "—";
  }
}

export const ict: DefinicionSi<IctEstado, JustificacionIct> = {
  key: "ict",
  db: "ICT",
  defaults: ictEstadoDefaults,
  sujeto: "Telecomunicaciones",
  justificar: justificarIct,
  frase: fraseIct,
  metricas: metricasIct,
  queEntra: queEntraIct,
  piezas: piezasIct,
  franja: franjaIct,
  etiqueta: textoEtiquetaIct,
  resultadoLista: resultadoListaIct,
  textoAviso: textoAvisoIct,
  textoIncumplimiento: textoIncumplimientoIct,
  tituloDibujo: "Previsiones para la ICT",
  pistaDibujo: "Pulsa una vivienda o una previsión para ver sus registros y sus medidas mínimas.",
  dibujo: dibujoIct,
  describirDibujo: describirDibujoIct,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? "recinto",
  memoria: memoriaIct,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [
      {
        concepto: "Régimen de propiedad horizontal",
        valor: j.propiedadHorizontal === undefined ? "sin declarar" : j.propiedadHorizontal ? "sí" : "no",
        origen: ORIGEN_DECISION,
      },
      { concepto: "PAU", valor: String(j.pau), origen: ORIGEN_EDIFICIO },
      { concepto: "Plantas sobre rasante", valor: String(j.plantasSobreRasante), origen: ORIGEN_EDIFICIO },
      { concepto: "Recinto", valor: NOMBRE_RECINTO[j.recinto], origen: j.recinto === j.recintoHabitual ? ORIGEN_CRITERIO : ORIGEN_DECISION },
    ];
    return fichaSi(j, {
      titulo: "ICT — Previsiones del proyecto de arquitectura",
      slug: "ict-previsiones",
      normativa: [
        citaDe(AMBITO_ICT.procedencia),
        citaDe(RITU_ICT.procedencia),
        citaDe(RITI_RITS_ICT.procedencia),
        citaDe(ARQUETA_ICT.procedencia),
        citaDe(RTR_ICT.procedencia),
        citaDe(TOMAS_ICT.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoIct),
      valor: textoEtiquetaIct,
      textoAviso: textoAvisoIct,
      observaciones: [
        "El proyecto técnico de ICT, de técnico competente en telecomunicaciones, diseña y dimensiona la infraestructura; esta ficha recoge lo que reserva el proyecto de arquitectura, con las medidas mínimas del Anexo III.",
        "La elección del recinto la hace el proyectista: se comprueba solo que el RITU y el RITU-A no se salen de su ámbito (Anexo III, 4.5.3).",
      ],
      edicionDB: EDICION_ICT,
      db: "ICT",
      memoria: memoriaIct(j),
      caption: "Sección del edificio con los PAU y las previsiones para la ICT.",
      pdfSvgId: ICT_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: ICT_PDF_SVG_ID,
};
