// =============================================================================
// ICT — El dibujo (feature-36, paso 3): la sección del edificio con las zonas
// que tienen PAU (viviendas, locales y oficinas) resaltadas y, en una columna a
// la derecha, el recinto, la arqueta, las canalizaciones, el RTR y el proyecto
// técnico (como habitabilidad). PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import { VIVIENDA_UNIFAMILIAR } from "../hab/estado";
import type { JustificacionIct } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = S.W + 150;

export function dibujoIct(j: JustificacionIct, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const tomasDe = (viviendaId: string) => j.elementos.find((e) => e.detalle.clase === "tomas" && e.detalle.viviendaId === viviendaId)?.id;
  const deZona = (zonaId: string): string | undefined => {
    for (const g of edificio.grupos) {
      const z = g.zonas.find((x) => x.id === zonaId);
      if (!z) continue;
      if (z.uso === "vivienda_unifamiliar") return tomasDe(VIVIENDA_UNIFAMILIAR);
      if (z.uso === "viviendas") {
        for (const u of z.unidades ?? []) {
          const id = tomasDe(u.tipoId);
          if (id) return id;
        }
      }
      if (z.uso === "local_sin_uso" || z.uso === "oficinas") return "pau";
    }
    return undefined;
  };
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    const id = deZona(m.zona.zonaId);
    return id ? { ...m, tono: "acento", elementoId: id } : m;
  });

  // ── La columna de la derecha, de abajo arriba ─────────────────────────────
  /** La columna de cifras, alineada a la izquierda junto a la fachada. */
  const xCol = S.X1 + 24;
  const PASO = 30;
  let y = base.yRasante - 46;
  const etiquetas: EtiquetaSi[] = [];
  const orden = ["arqueta", "canalizacion-externa", "recinto", "canalizacion-principal", "rtr", "pau", "regimen", "proyecto"];
  for (const id of orden.filter((x) => j.elementos.some((e) => e.id === x))) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y, alinear: "inicio" });
    y -= PASO;
  }
  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
