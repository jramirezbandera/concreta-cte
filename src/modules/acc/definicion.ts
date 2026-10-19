// =============================================================================
// Accesibilidad autonómica (feature-36, paso 5): lo que el módulo aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { NOMBRE_COMUNIDAD } from "../../data/comunidades";
import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { dibujoAcc } from "./dibujo";
import { accEstadoDefaults, type AccEstado } from "./estado";
import { justificarAcc, type ElementoAcc, type JustificacionAcc } from "./justificacion";
import { memoriaAcc } from "./memoria";
import { ASCENSOR_D293, EDICION_D293, ITINERARIOS_D293, RESERVA_D293 } from "./tablas";
import {
  describirDibujoAcc,
  franjaAcc,
  fraseAcc,
  metricasAcc,
  piezasAcc,
  queEntraAcc,
  resultadoListaAcc,
  textoAvisoAcc,
  textoEtiquetaAcc,
  textoIncumplimientoAcc,
} from "./textos";

export const ACC_PDF_SVG_ID = "acc-svg-pdf";

function limite(el: ElementoAcc): string {
  const d = el.detalle;
  switch (d.clase) {
    case "ascensor":
      return "art. 106";
    case "itinerarios":
      return "art. 104";
    case "reserva":
      return `≥ ${d.reservadas}`;
    case "existente":
      return "DA 1.ª";
    default:
      return "—";
  }
}

export const acc: DefinicionSi<AccEstado, JustificacionAcc> = {
  key: "acc",
  db: "Accesibilidad",
  defaults: accEstadoDefaults,
  sujeto: "Accesibilidad",
  justificar: justificarAcc,
  frase: fraseAcc,
  metricas: metricasAcc,
  queEntra: queEntraAcc,
  piezas: piezasAcc,
  franja: franjaAcc,
  etiqueta: textoEtiquetaAcc,
  resultadoLista: resultadoListaAcc,
  textoAviso: textoAvisoAcc,
  textoIncumplimiento: textoIncumplimientoAcc,
  tituloDibujo: "Accesibilidad autonómica",
  pistaDibujo: "Pulsa las zonas comunes o una exigencia para ver lo que pide la norma.",
  dibujo: dibujoAcc,
  describirDibujo: describirDibujoAcc,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos.find((e) => e.id === "ascensor")?.id ?? "norma",
  memoria: memoriaAcc,
  ficha: (j, o): FichaData => {
    const norma = j.elementos.find((e) => e.detalle.clase === "norma")!.detalle;
    const otra = norma.clase === "norma" ? norma.otra : undefined;
    const datosPartida: FilaDato[] = [
      { concepto: "Comunidad autónoma", valor: j.comunidad ? NOMBRE_COMUNIDAD[j.comunidad] : "sin municipio", origen: ORIGEN_EDIFICIO },
      { concepto: "Norma", valor: j.andalucia ? "Decreto 293/2009" : (otra ?? "sin declarar"), origen: j.andalucia ? ORIGEN_EDIFICIO : ORIGEN_DECISION },
    ];
    return fichaSi(j, {
      titulo: "Accesibilidad autonómica",
      slug: "accesibilidad",
      normativa: j.andalucia
        ? [citaDe(ITINERARIOS_D293.procedencia), citaDe(ASCENSOR_D293.procedencia), citaDe(RESERVA_D293.procedencia)]
        : [{ db: otra ?? "Norma autonómica", exigencia: "Accesibilidad", edicion: "la declarada por el proyectista" }],
      datosPartida,
      limite: (el) => limite(el as ElementoAcc),
      valor: textoEtiquetaAcc,
      textoAviso: textoAvisoAcc,
      observaciones: j.andalucia
        ? ["Las medidas de los itinerarios, escaleras, rampas y mecanismos se justifican en la Ficha III de la Orden de 9-01-2012; las viviendas reservadas, en la Ficha IV. La herramienta da su contenido verificado, no el formulario oficial."]
        : ["Solo Andalucía tiene plantilla en la herramienta: en otra comunidad, la norma la declara el proyectista y se justifica con sus fichas."],
      edicionDB: j.andalucia ? EDICION_D293 : "La declarada por el proyectista",
      db: "Accesibilidad",
      memoria: memoriaAcc(j),
      caption: "Sección del edificio con las zonas comunes del ámbito de la norma autonómica.",
      pdfSvgId: ACC_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: ACC_PDF_SVG_ID,
};
