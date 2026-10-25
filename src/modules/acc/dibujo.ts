// =============================================================================
// Accesibilidad autonómica — El dibujo (feature-36, paso 5): la sección con las
// zonas comunes resaltadas (el ámbito del Decreto 293/2009) y, en una columna a
// la derecha, la norma, la comunicación vertical y la reserva (como la ICT).
// PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionAcc } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = S.W + 150;

export function dibujoAcc(j: JustificacionAcc, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const itinerarios = j.elementos.some((e) => e.id === "itinerarios");
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) =>
    m.tipo === "zona" && itinerarios && (m.zona.uso === "zona_comun" || m.zona.uso === "vestibulo") ? { ...m, tono: "acento", elementoId: "itinerarios" } : m,
  );
  /** La columna de cifras, alineada a la izquierda junto a la fachada. */
  const xCol = S.X1 + 24;
  const PASO = 30;
  let y = base.yRasante - 46;
  const etiquetas: EtiquetaSi[] = [];
  for (const id of ["existente", "reserva", "ascensor", "unifamiliar", "otros-usos", "norma"].filter((x) => j.elementos.some((e) => e.id === x))) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y, alinear: "inicio" });
    y -= PASO;
  }
  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
