// =============================================================================
// DB-HE 3 — Iluminación (feature-36, paso 2): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION } from "../si/ficha";
import { dibujoHe3 } from "./dibujo";
import { he3EstadoDefaults, type He3Estado } from "./estado";
import { justificarHe3, type ElementoHe3, type JustificacionHe3 } from "./justificacion";
import { memoriaHe3 } from "./memoria";
import { CONTROL_HE3, EDICION_HE3, POTENCIA_MAXIMA_HE3, VEEI_LIMITE_HE3 } from "./tablas";
import {
  describirDibujoHe3,
  franjaHe3,
  fraseHe3,
  metricasHe3,
  NOMBRE_CONTROL,
  num,
  piezasHe3,
  queEntraHe3,
  resultadoListaHe3,
  textoAvisoHe3,
  textoEtiquetaHe3,
  textoIncumplimientoHe3,
} from "./textos";

export const HE3_PDF_SVG_ID = "he3-svg-pdf";

function limite(el: ElementoHe3): string {
  const d = el.detalle;
  switch (d.clase) {
    case "zona":
      return `VEEI ≤ ${num(d.limite, 1)}`;
    case "potencia":
      return `≤ ${num(d.limite, 0)} W/m²`;
    case "control":
      return "ap. 3.3";
    case "luz_natural":
      return "ap. 3.4";
    case "otros":
      return "—";
  }
}

export const he3: DefinicionSi<He3Estado, JustificacionHe3> = {
  key: "he3",
  db: "DB-HE",
  defaults: he3EstadoDefaults,
  sujeto: "Iluminación",
  justificar: justificarHe3,
  frase: fraseHe3,
  metricas: metricasHe3,
  queEntra: queEntraHe3,
  piezas: piezasHe3,
  franja: franjaHe3,
  etiqueta: textoEtiquetaHe3,
  resultadoLista: resultadoListaHe3,
  textoAviso: textoAvisoHe3,
  textoIncumplimiento: textoIncumplimientoHe3,
  tituloDibujo: "Zonas comunes y aparcamiento",
  pistaDibujo: "Pulsa una zona para ver su potencia, su iluminancia y su VEEI.",
  dibujo: dibujoHe3,
  describirDibujo: describirDibujoHe3,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos[0]?.id ?? null,
  memoria: memoriaHe3,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [];
    for (const e of j.elementos) {
      const d = e.detalle;
      if (d.clase !== "zona") continue;
      datosPartida.push({
        concepto: e.nombre,
        valor: d.potencia_W !== null && d.iluminancia_lx !== null ? `${num(d.potencia_W, 0)} W · ${num(d.iluminancia_lx, 0)} lx` : "sin declarar",
        origen: ORIGEN_DECISION,
      });
    }
    if (j.zonas.length > 0) datosPartida.push({ concepto: "Control", valor: NOMBRE_CONTROL[j.control], origen: j.control === j.controlHabitual ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    return fichaSi(j, {
      titulo: "HE 3 — Condiciones de las instalaciones de iluminación",
      slug: "he3-iluminacion",
      normativa: [citaDe(VEEI_LIMITE_HE3.procedencia), citaDe(POTENCIA_MAXIMA_HE3.procedencia), citaDe(CONTROL_HE3.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHe3),
      valor: textoEtiquetaHe3,
      textoAviso: textoAvisoHe3,
      observaciones: [
        "Las instalaciones interiores de las viviendas y el alumbrado de emergencia quedan fuera del ámbito (HE 3 ap. 1 pto 2 a y b).",
        "La potencia instalada y la iluminancia media son las del proyecto de iluminación, que declara el proyectista: el CTE no fija la iluminancia y la herramienta no calcula luminarias.",
      ],
      edicionDB: EDICION_HE3,
      db: "DB-HE",
      memoria: memoriaHe3(j),
      caption: "Sección del edificio con las zonas comunes y el aparcamiento que se justifican.",
      pdfSvgId: HE3_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HE3_PDF_SVG_ID,
};
