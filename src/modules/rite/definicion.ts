// =============================================================================
// HE 2 · RITE — Condiciones de las instalaciones térmicas (feature-36, paso 4):
// lo que el módulo aporta a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION } from "../si/ficha";
import { dibujoRite } from "./dibujo";
import { riteEstadoDefaults, type RiteEstado } from "./estado";
import { justificarRite, type ElementoRite, type JustificacionRite } from "./justificacion";
import { memoriaRite } from "./memoria";
import { CONDICIONES_INTERIORES, DOCUMENTO_RITE, EDICION_RITE, EFICIENCIA_RITE, HE2 } from "./tablas";
import {
  describirDibujoRite,
  franjaRite,
  fraseRite,
  kw,
  metricasRite,
  NOMBRE_CALEFACCION,
  NOMBRE_EMISORES,
  NOMBRE_REFRIGERACION,
  piezasRite,
  queEntraRite,
  resultadoListaRite,
  textoAcs,
  textoAvisoRite,
  textoEtiquetaRite,
  textoIncumplimientoRite,
} from "./textos";

export const RITE_PDF_SVG_ID = "rite-svg-pdf";

function limite(el: ElementoRite): string {
  const d = el.detalle;
  switch (d.clase) {
    case "documento":
      return "art. 15.1";
    case "condiciones":
      return "tabla 1.4.1.1";
    case "aire":
      return d.residencial ? "IT 1.1.4.2.1" : "IT 1.1.4.2";
    case "higiene":
      return "IT 1.1.4.3";
    case "contabilizacion":
      return "IT 1.2.4.4";
    case "recuperacion":
      return "IT 1.2.4.5.2";
    case "cambio_uso":
      return "art. 15.6";
    default:
      return "—";
  }
}

export const rite: DefinicionSi<RiteEstado, JustificacionRite> = {
  key: "rite",
  db: "RITE",
  defaults: riteEstadoDefaults,
  sujeto: "Instalaciones térmicas",
  justificar: justificarRite,
  frase: fraseRite,
  metricas: metricasRite,
  queEntra: queEntraRite,
  piezas: piezasRite,
  franja: franjaRite,
  etiqueta: textoEtiquetaRite,
  resultadoLista: resultadoListaRite,
  textoAviso: textoAvisoRite,
  textoIncumplimiento: textoIncumplimientoRite,
  tituloDibujo: "Instalaciones térmicas",
  pistaDibujo: "Pulsa un servicio o el documento para ver su potencia y lo que pide el RITE.",
  dibujo: dibujoRite,
  describirDibujo: describirDibujoRite,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos.find((e) => e.id.startsWith("documento-"))?.id ?? null,
  memoria: memoriaRite,
  ficha: (j, o): FichaData => {
    const d = j.decisiones;
    const h = j.habituales;
    const origen = (igual: boolean) => (igual ? ORIGEN_CRITERIO : ORIGEN_DECISION);
    const datosPartida: FilaDato[] = [
      { concepto: "Calefacción", valor: NOMBRE_CALEFACCION[d.calefaccion], origen: origen(d.calefaccion === h.calefaccion) },
      ...(d.calefaccion === "ninguna" ? [] : [{ concepto: "Emisores", valor: NOMBRE_EMISORES[d.emisores], origen: origen(d.emisores === h.emisores) }]),
      { concepto: "Refrigeración", valor: NOMBRE_REFRIGERACION[d.refrigeracion], origen: origen(d.refrigeracion === h.refrigeracion) },
      { concepto: "ACS (HE 4)", valor: textoAcs(j.acs), origen: ORIGEN_DECISION },
      ...j.instalaciones.map((i) => ({ concepto: `Potencia (${i.id === "acs" ? "ACS" : i.id === "clima" ? "climatización" : "instalación"})`, valor: i.potencia_kW === null ? "sin declarar" : kw(i.potencia_kW), origen: ORIGEN_DECISION })),
    ];
    return fichaSi(j, {
      titulo: "HE 2 — Condiciones de las instalaciones térmicas (RITE)",
      slug: "he2-rite",
      normativa: [citaDe(HE2.procedencia), citaDe(DOCUMENTO_RITE.procedencia), citaDe(CONDICIONES_INTERIORES.procedencia), citaDe(EFICIENCIA_RITE.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoRite),
      valor: textoEtiquetaRite,
      textoAviso: textoAvisoRite,
      observaciones: [
        "La herramienta no calcula cargas térmicas ni dimensiona la instalación: lo hacen la memoria técnica o el proyecto que exige el RITE (art. 15).",
        "Las potencias nominales y los rendimientos son los del fabricante, que declara el proyectista; el RITE no fija rendimientos mínimos (IT 1.2.4.1).",
      ],
      edicionDB: EDICION_RITE,
      db: "RITE",
      memoria: memoriaRite(j),
      caption: "Sección del edificio con las viviendas que sirven las instalaciones térmicas.",
      pdfSvgId: RITE_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: RITE_PDF_SVG_ID,
};
