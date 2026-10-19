// =============================================================================
// HE 2 · RITE — Lo que guarda el módulo (feature-36, paso 4). La fuente se
// reparte por servicio (decisión 3): el ACS se declara en HE 4 (sistema,
// producción y apoyo) y aquí solo se añaden su potencia y su acumulación; la
// calefacción y la refrigeración, que no estaban en ningún sitio, se declaran
// aquí, con sus potencias y rendimientos del fabricante. El REBT lee de aquí la
// climatización eléctrica (`climatizacionParaRebt`). Solo tipos y lo mínimo
// para leerlos.
//
// Lo habitual (criterio): bomba de calor aire-aire reversible por vivienda, con
// unidades interiores (split), que es lo que el REBT suponía desde feature-34.
// =============================================================================

import type { Proyecto } from "../../lib/proyecto/tipos";
import type { Climatizacion, RebtEstado } from "../rebt/estado";

/** El generador de calefacción. */
export type Calefaccion = "aire_aire" | "aire_agua" | "caldera" | "biomasa" | "red" | "electrica" | "ninguna";
/** La refrigeración: la misma bomba de calor (reversible), una aire-aire aparte o ninguna. */
export type Refrigeracion = "misma" | "aire_aire" | "ninguna";
export type Emisores = "splits" | "conductos" | "suelo_radiante" | "radiadores" | "fancoils";
export type ProduccionClima = "individual" | "centralizada";

export type Opcion<T> = T | "habitual";

export type RiteEstado = {
  calefaccion: Opcion<Calefaccion>;
  refrigeracion: Opcion<Refrigeracion>;
  emisores: Opcion<Emisores>;
  /** Individual por vivienda (o local) o centralizada. En la unifamiliar no se pregunta. */
  produccion: Opcion<ProduccionClima>;
  /** Potencia térmica nominal de calefacción [kW]: por vivienda (la mayor) si es individual; la total si es centralizada. */
  potenciaCalor_kW: number | null;
  /** Potencia frigorífica nominal [kW], igual. */
  potenciaFrio_kW: number | null;
  /** Rendimientos del fabricante; el RITE no fija mínimos (IT 1.2.4.1, K-MEM.19). */
  scop: number | null;
  seer: number | null;
  /** El ACS lo produce el mismo generador que la calefacción: su potencia no se suma dos veces. */
  acsMismaMaquina: boolean;
  /** Potencia nominal del generador de ACS [kW] (el apoyo, con solar térmica). */
  potenciaAcs_kW: number | null;
  /** Volumen de acumulación de ACS [l]. */
  acumulacion_l: number | null;
};

export const riteEstadoDefaults: RiteEstado = {
  calefaccion: "habitual",
  refrigeracion: "habitual",
  emisores: "habitual",
  produccion: "habitual",
  potenciaCalor_kW: null,
  potenciaFrio_kW: null,
  scop: null,
  seer: null,
  acsMismaMaquina: false,
  potenciaAcs_kW: null,
  acumulacion_l: null,
};

export interface DecisionesRite {
  calefaccion: Calefaccion;
  refrigeracion: Refrigeracion;
  emisores: Emisores;
  produccion: ProduccionClima;
}

const CALEFACCIONES: readonly Calefaccion[] = ["aire_aire", "aire_agua", "caldera", "biomasa", "red", "electrica", "ninguna"];
const EMISORES: readonly Emisores[] = ["splits", "conductos", "suelo_radiante", "radiadores", "fancoils"];

/** Las bombas de calor, que pueden ser reversibles. */
export const esBombaDeCalor = (c: Calefaccion) => c === "aire_aire" || c === "aire_agua";

/** Los emisores habituales de cada generador. */
export function emisoresHabituales(c: Calefaccion): Emisores {
  if (c === "aire_aire") return "splits";
  if (c === "aire_agua") return "suelo_radiante";
  return "radiadores";
}

/**
 * Lo habitual de la calefacción: aire-aire; si el REBT guardaba otra
 * climatización antes de feature-36 (paso 4), la que guardaba, para no perderla.
 */
export function calefaccionHabitual(rebt: Partial<RebtEstado> | undefined): Calefaccion {
  const c = rebt?.climatizacion;
  if (c === "aire_agua") return "aire_agua";
  if (c === "emisores") return "electrica";
  // «Ninguna eléctrica»: lo más probable, una caldera.
  if (c === "ninguna") return "caldera";
  return "aire_aire";
}

function resolver<T>(v: unknown, validos: readonly T[], h: T): T {
  return validos.includes(v as T) ? (v as T) : h;
}

export function resolverRite(e: Partial<RiteEstado>, opciones: { unifamiliar: boolean; rebt?: Partial<RebtEstado> }): DecisionesRite & { habituales: DecisionesRite } {
  const calHab = calefaccionHabitual(opciones.rebt);
  const calefaccion = resolver<Calefaccion>(e.calefaccion, CALEFACCIONES, calHab);
  const refHab: Refrigeracion = calefaccion === "aire_aire" ? "misma" : "ninguna";
  const refValidas: Refrigeracion[] = esBombaDeCalor(calefaccion) ? ["misma", "aire_aire", "ninguna"] : ["aire_aire", "ninguna"];
  const refrigeracion = resolver<Refrigeracion>(e.refrigeracion, refValidas, refHab);
  const emHab = emisoresHabituales(calefaccion);
  const emisores = resolver<Emisores>(e.emisores, EMISORES, emHab);
  const prodHab: ProduccionClima = "individual";
  const produccion = opciones.unifamiliar ? "individual" : resolver<ProduccionClima>(e.produccion, ["individual", "centralizada"], prodHab);
  return { calefaccion, refrigeracion, emisores, produccion, habituales: { calefaccion: calHab, refrigeracion: refHab, emisores: emHab, produccion: prodHab } };
}

/** Un número válido y positivo, o null. */
export function positivo(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

/**
 * La climatización eléctrica que lee el REBT para los circuitos de la vivienda
 * (decisión 3 de feature-34 y de feature-36): la aire-agua de calefacción en un
 * C8, los emisores eléctricos en C8 y la aire-aire (de calor o de frío) en un C9.
 * Con caldera, biomasa o red y sin refrigeración, ninguna eléctrica.
 */
export function climatizacionDe(d: Pick<DecisionesRite, "calefaccion" | "refrigeracion">): Climatizacion {
  if (d.calefaccion === "aire_agua") return "aire_agua";
  if (d.calefaccion === "electrica") return "emisores";
  if (d.calefaccion === "aire_aire" || d.refrigeracion === "aire_aire") return "aire_aire";
  return "ninguna";
}

/** La climatización del RITE para el REBT, con lo guardado en el expediente. */
export function climatizacionParaRebt(justificaciones: Proyecto["justificaciones"] | undefined, unifamiliar: boolean): Climatizacion {
  const rite = (justificaciones?.rite?.inputs ?? {}) as Partial<RiteEstado>;
  const rebt = justificaciones?.rebt?.inputs as Partial<RebtEstado> | undefined;
  return climatizacionDe(resolverRite(rite, { unifamiliar, rebt }));
}
