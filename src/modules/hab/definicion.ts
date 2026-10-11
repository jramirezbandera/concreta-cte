// =============================================================================
// Habitabilidad (feature-32): lo que el módulo aporta a la pantalla común (la de
// SI, SUA, HS 2, HE 4 a HE 6 y REBT), a La obra y al anejo. PURA.
// =============================================================================

import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import { NOMBRE_AMBITO, NOMBRE_MEDIDA, textoFraccion } from "../../lib/habitabilidad/norma";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi } from "../si/ficha";
import { dibujoHab, elementoDeVivienda } from "./dibujo";
import { habEstadoDefaults, type HabEstado } from "./estado";
import { justificarHab, type ElementoHab, type JustificacionHab } from "./justificacion";
import { memoriaHab } from "./memoria";
import {
  describirDibujoHab,
  exigido,
  franjaHab,
  fraseHab,
  m2,
  metricasHab,
  piezasHab,
  queEntraHab,
  resultadoListaHab,
  textoAvisoHab,
  textoEtiquetaHab,
  textoIncumplimientoHab,
} from "./textos";

export const HAB_PDF_SVG_ID = "hab-svg-pdf";

/** El origen de los parámetros de la norma en la ficha (§5.5, punto 6). */
export const ORIGEN_PROYECTISTA = "Dato del proyectista";

function limite(el: ElementoHab): string {
  const d = el.detalle;
  switch (d.clase) {
    case "sin_norma":
      return "declararla";
    case "norma":
      return "se declara";
    case "sin_estancias":
      return "describirlas";
    case "estancia":
      return d.ventilacion ? `${exigido(d.iluminacion)} · ${exigido(d.ventilacion)}` : exigido(d.iluminacion);
    case "densidad":
      return `≤ ${d.maximo}`;
  }
}

export const hab: DefinicionSi<HabEstado, JustificacionHab> = {
  key: "hab",
  db: "Habitabilidad",
  defaults: habEstadoDefaults,
  sujeto: "Habitabilidad",
  justificar: justificarHab,
  frase: fraseHab,
  metricas: metricasHab,
  queEntra: queEntraHab,
  piezas: piezasHab,
  franja: franjaHab,
  etiqueta: textoEtiquetaHab,
  resultadoLista: resultadoListaHab,
  textoAviso: textoAvisoHab,
  textoIncumplimiento: textoIncumplimientoHab,
  avisosADatos: new Set<string>(),
  tituloDibujo: "Viviendas que se justifican",
  pistaDibujo: "Pulsa una vivienda o las cifras para ver sus estancias.",
  dibujo: dibujoHab,
  describirDibujo: describirDibujoHab,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.viviendas[0] ? (elementoDeVivienda(j, j.viviendas[0].id)?.id ?? null) : null),
  memoria: memoriaHab,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [];
    for (const n of j.normas) {
      datosPartida.push({ concepto: NOMBRE_AMBITO[n.ambito], valor: n.referencia, origen: ORIGEN_PROYECTISTA });
      datosPartida.push({ concepto: "Iluminación", valor: `${textoFraccion(n.iluminacion.fraccion)} de Su (${NOMBRE_MEDIDA[n.iluminacion.mide]})`, origen: ORIGEN_PROYECTISTA });
      datosPartida.push({
        concepto: "Ventilación",
        valor: n.ventilacion === "conjunta" ? "por el mismo hueco" : `${textoFraccion(n.ventilacion.fraccion)} de Su (${NOMBRE_MEDIDA[n.ventilacion.mide]})`,
        origen: ORIGEN_PROYECTISTA,
      });
      if (n.densidad) datosPartida.push({ concepto: "Densidad", valor: `1 vivienda / ${n.densidad.m2PorVivienda} m² (${n.densidad.superficie})`, origen: ORIGEN_PROYECTISTA });
    }
    for (const v of j.viviendas) {
      const su = v.estancias.reduce((a, e) => a + (e.util_m2 ?? 0), 0);
      datosPartida.push({ concepto: v.nombre, valor: `${v.estancias.length} estancias · ${m2(su)}`, origen: ORIGEN_PROYECTISTA });
    }
    return fichaSi(j, {
      titulo: "Habitabilidad — Iluminación, ventilación y densidad",
      slug: "habitabilidad",
      normativa:
        j.normas.length > 0
          ? j.normas.map((n) => ({ db: n.referencia, exigencia: "Habitabilidad", edicion: "la declarada por el proyectista" }))
          : [{ db: "Norma de habitabilidad del municipio", exigencia: "Habitabilidad", edicion: "sin declarar" }],
      datosPartida,
      limite: (el) => limite(el as ElementoHab),
      valor: textoEtiquetaHab,
      textoAviso: textoAvisoHab,
      observaciones: ["La norma de habitabilidad y sus parámetros los declara el proyectista: la herramienta no supone fracciones de hueco ni densidades."],
      edicionDB: j.normas.map((n) => n.referencia).join(" · ") || "Sin norma declarada",
      db: "Habitabilidad",
      memoria: memoriaHab(j),
      caption: "Sección del edificio con las viviendas cuyas estancias se justifican.",
      pdfSvgId: HAB_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HAB_PDF_SVG_ID,
};
