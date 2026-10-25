// =============================================================================
// HE 2 · RITE — El dibujo (feature-36, paso 4): la sección del edificio con las
// viviendas (o los locales) que sirven las instalaciones térmicas resaltadas y,
// en una columna a la derecha, los servicios y el documento que exige el RITE
// (como la ICT). PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionRite } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = S.W + 150;

const SIRVE = new Set(["viviendas", "vivienda_unifamiliar", "oficinas", "local_sin_uso"]);

export function dibujoRite(j: JustificacionRite, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const principal = j.elementos.find((e) => e.id.startsWith("documento-"))?.id;
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => (m.tipo === "zona" && SIRVE.has(m.zona.uso) && principal ? { ...m, tono: "acento", elementoId: principal } : m));

  // ── La columna de la derecha, de abajo arriba ─────────────────────────────
  /** La columna de cifras, alineada a la izquierda junto a la fachada. */
  const xCol = S.X1 + 24;
  const PASO = 30;
  let y = base.yRasante - 46;
  const etiquetas: EtiquetaSi[] = [];
  const orden = ["higiene", "condiciones", "acs", "refrigeracion", "calefaccion", ...j.elementos.filter((e) => e.id.startsWith("documento-")).map((e) => e.id)];
  for (const id of orden.filter((x) => j.elementos.some((e) => e.id === x))) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y, alinear: "inicio" });
    y -= PASO;
  }
  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
