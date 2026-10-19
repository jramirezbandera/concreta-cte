// =============================================================================
// Accesibilidad autonómica — Lo que guarda el módulo (feature-36, paso 5). La
// comunidad no va aquí (sale del municipio) ni el régimen de la promoción
// (La obra). En Andalucía, solo lo que la app no sabe: la declaración de
// circunstancias de la DA 1.ª en un edificio existente. En otra comunidad, la
// norma que declara el proyectista con su referencia. Solo tipos.
// =============================================================================

export type AccEstado = {
  /** Fuera de Andalucía: la norma autonómica de accesibilidad, con su referencia. */
  normaOtra?: string;
  /** Edificio existente: los artículos imposibles de cumplir y el motivo (DA 1.ª). */
  imposibilidad?: string;
};

export const accEstadoDefaults: AccEstado = {};

/** Un texto con algo, o undefined. */
export function texto(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}
