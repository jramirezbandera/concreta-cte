// =============================================================================
// ICT — Lo que guarda el módulo (feature-36, paso 3): el recinto que elige el
// proyectista (con lo habitual por el número de PAU y las alturas), los PAU que
// El edificio no sabe contar (locales, oficinas y estancias comunes) y la
// referencia del proyecto técnico de ICT, que es de otro técnico. El régimen de
// propiedad horizontal no va aquí: es un dato de la obra
// (`DatosGenerales.promocion`). Solo tipos y lo mínimo para leerlos.
// =============================================================================

import type { RecintoIct } from "./tablas";

export type IctEstado = {
  recinto: RecintoIct | "habitual";
  /** PAU de locales y oficinas; null = uno por zona y planta de El edificio. */
  pauLocales: number | null;
  /** Estancias comunes con PAU, si el proyecto técnico las prevé. */
  pauComunes: number | null;
  /** Autor del proyecto técnico de ICT. */
  proyectoAutor?: string;
  /** Su fecha, como se escriba («marzo de 2026»). */
  proyectoFecha?: string;
};

export const ictEstadoDefaults: IctEstado = { recinto: "habitual", pauLocales: null, pauComunes: null };

export function resolverRecinto(e: Partial<IctEstado>, habitual: RecintoIct): RecintoIct {
  const r = e.recinto;
  return r === "riti_rits" || r === "ritu" || r === "ritu_a" ? r : habitual;
}

/** Un entero ≥ 0, o null. */
export function cuenta(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.trunc(v) : null;
}

/** Un texto con algo, o undefined. */
export function texto(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}
