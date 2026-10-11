// =============================================================================
// Habitabilidad — El dibujo (feature-32): la sección del edificio con las
// viviendas que se justifican resaltadas y, en una columna a la derecha, la
// norma, cada vivienda tipo y la densidad (como HE 6). PURA; el render es el
// común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import { VIVIENDA_UNIFAMILIAR } from "./estado";
import type { ElementoHab, JustificacionHab } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = S.W + 150;

/** El elemento que representa a una vivienda: lo que no cumple primero. */
export function elementoDeVivienda(j: JustificacionHab, viviendaId: string): ElementoHab | undefined {
  const suyos = j.elementos.filter(
    (e) => (e.detalle.clase === "estancia" && e.detalle.vivienda.id === viviendaId) || (e.detalle.clase === "sin_estancias" && e.detalle.vivienda.id === viviendaId),
  );
  return suyos.find((e) => e.veredicto === "fail") ?? suyos[0];
}

export function dibujoHab(j: JustificacionHab, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const deZona = (zonaId: string): string | undefined => {
    for (const g of edificio.grupos) {
      const z = g.zonas.find((x) => x.id === zonaId);
      if (!z) continue;
      if (z.uso === "vivienda_unifamiliar") return elementoDeVivienda(j, VIVIENDA_UNIFAMILIAR)?.id;
      if (z.uso === "viviendas") {
        for (const u of z.unidades ?? []) {
          const el = elementoDeVivienda(j, u.tipoId);
          if (el) return el.id;
        }
      }
    }
    return undefined;
  };
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    const id = deZona(m.zona.zonaId);
    return id ? { ...m, tono: "acento", elementoId: id } : m;
  });

  // ── La columna de la derecha, de abajo arriba ─────────────────────────────
  const xCol = (S.X1 + ANCHO) / 2 + 8;
  const PASO = 30;
  let y = base.yRasante - 46;
  const etiquetas: EtiquetaSi[] = [];
  const columna = [
    ...j.elementos.filter((e) => e.detalle.clase === "densidad").map((e) => e.id),
    ...j.viviendas.flatMap((v) => elementoDeVivienda(j, v.id)?.id ?? []),
    ...j.elementos.filter((e) => e.detalle.clase === "norma" || e.detalle.clase === "sin_norma").map((e) => e.id),
  ];
  for (const id of columna.slice(0, 6)) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y });
    y -= PASO;
  }
  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
