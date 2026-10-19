// =============================================================================
// DB-HE 3 — El dibujo (feature-36, paso 2): la sección con las zonas que se
// justifican resaltadas (las comunes y el aparcamiento) y su VEEI; las viviendas,
// en blanco (fuera del ámbito). PURA; el render es el común.
// =============================================================================

import type { Edificio } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import { SECCION_BASE } from "../../lib/edificio/seccion";
import { componerDibujo, terrenoBajo, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import { cabeRotulo, huecosEtiquetas, zonaGeneral } from "../sua/colocar";
import type { JustificacionHe3 } from "./justificacion";
import { textoEtiquetaHe3 } from "./textos";

const S = SECCION_BASE;

export function dibujoHe3(j: JustificacionHe3, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [];
  const etiquetas: EtiquetaSi[] = [];
  const elementoDe = (zonaId: string): string | undefined => {
    if (j.elementos.some((e) => e.id === `zona-${zonaId}`)) return `zona-${zonaId}`;
    return j.elementos.find((e) => e.detalle.clase === "otros" && e.detalle.zonas.some((z) => z.id === zonaId))?.id;
  };

  for (const z of zonas) {
    const id = elementoDe(z.zonaId);
    const el = id ? j.elementos.find((e) => e.id === id) : undefined;
    const rotulo = el && el.detalle.clase === "zona" ? `${USOS[z.uso].etiqueta} · ${textoEtiquetaHe3(el)}` : USOS[z.uso].etiqueta;
    marcas.push({
      tipo: "zona",
      key: `zona-${z.zonaId}-${z.nivel}`,
      zona: z,
      tono: el?.detalle.clase === "zona" ? "acento" : el?.detalle.clase === "otros" ? "oficinas" : "vivienda",
      rayado: false,
      previsto: z.uso === "local_sin_uso",
      rotulo: cabeRotulo(z, rotulo) ? rotulo : USOS[z.uso].etiqueta,
      elementoId: id,
    });
  }

  // Las etiquetas de lo que no es una zona (potencia, control), donde quede sitio.
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  for (const el of j.elementos) {
    if (el.detalle.clase === "zona" || el.detalle.clase === "otros") continue;
    const h = huecos.tomar(zonaGeneral, textoEtiquetaHe3(el), true) ?? huecos.tomar(() => true, textoEtiquetaHe3(el), true);
    etiquetas.push(h ? { key: `et-${el.id}`, elementoId: el.id, x: h.x, y: h.y } : { key: `et-${el.id}`, elementoId: el.id, x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 22 * ++debajo });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
