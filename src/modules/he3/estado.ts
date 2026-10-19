// =============================================================================
// DB-HE 3 — Lo que guarda el módulo (feature-36, paso 2): por zona común, la
// potencia instalada de iluminación y la iluminancia media de proyecto, que el
// CTE no fija y la herramienta no supone (decisión 5); y el sistema de control,
// una decisión con lo habitual. Solo tipos y lo mínimo para leerlos.
// =============================================================================

/** El control de las zonas comunes (ap. 3.3): las tres valen en uso esporádico. */
export type ControlHe3 = "presencia" | "pulsador" | "manual_horario";

/** Lo declarado de una zona, por planta. Lo que no se sabe, null. */
export interface ZonaHe3 {
  /** Potencia total instalada en iluminación de la zona, lámparas y equipos auxiliares [W]. */
  potencia_W: number | null;
  /** Iluminancia media horizontal mantenida de proyecto [lx]. */
  iluminancia_lx: number | null;
}

export type He3Estado = {
  /** Por id de zona de El edificio. */
  zonas: Record<string, ZonaHe3>;
  control: ControlHe3 | "habitual";
};

export const he3EstadoDefaults: He3Estado = { zonas: {}, control: "habitual" };

/** Lo habitual: detección de presencia temporizada, que vale en todas las zonas comunes de un residencial. */
export const CONTROL_HABITUAL: ControlHe3 = "presencia";

export function resolverControl(e: Partial<He3Estado>): ControlHe3 {
  const c = e.control;
  return c === "presencia" || c === "pulsador" || c === "manual_horario" ? c : CONTROL_HABITUAL;
}

/** Un número válido y positivo, o null. */
export function positivo(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

/** Lo declarado de una zona, saneado. */
export function zonaDe(e: Partial<He3Estado> | undefined, zonaId: string): ZonaHe3 {
  const z = e?.zonas?.[zonaId];
  return { potencia_W: positivo(z?.potencia_W), iluminancia_lx: positivo(z?.iluminancia_lx) };
}

/** Las zonas con un cambio; una zona sin nada declarado desaparece. */
export function conZona(zonas: He3Estado["zonas"] | undefined, zonaId: string, cambio: Partial<ZonaHe3>): He3Estado["zonas"] {
  const actual = { ...(zonas?.[zonaId] ?? { potencia_W: null, iluminancia_lx: null }), ...cambio };
  const { [zonaId]: _fuera, ...resto } = zonas ?? {};
  return positivo(actual.potencia_W) === null && positivo(actual.iluminancia_lx) === null ? resto : { ...resto, [zonaId]: actual };
}
