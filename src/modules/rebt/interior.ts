// =============================================================================
// REBT — La instalación interior de la vivienda (feature-34): los puntos de
// utilización de cada estancia (ITC-BT-25 tabla 2) y los circuitos que salen de
// ellos (tabla 1), con su interruptor, sección, tubo y la longitud máxima con la
// que la sección cumple la caída de tensión. PURA.
//
// Las estancias son las de Habitabilidad (feature-32) o, sin ellas, las que se
// deducen de dormitorios, baños y aseos. Se añaden el acceso y el vestíbulo, que
// toda vivienda tiene (criterio), y el garaje de la unifamiliar con recarga. Una
// estancia sin superficie lleva el mínimo de «hasta 10 m²» (K-REBT.36).
//
// La app no sabe cuánto mide cada circuito: en vez de inventarlo, da hasta qué
// longitud cumple su sección mínima (K-REBT.24): Lmáx = e·U·γ·S / (2·In).
// =============================================================================

import type { TipoEstancia } from "../../lib/habitabilidad/norma";
import { estanciasPropuestas, type EstanciaHab } from "../hab/estado";
import type { EquiposVivienda } from "./estado";
import {
  CIRCUITOS_ITC_BT_25,
  FORMULAS_ANEXO2,
  PUNTOS_ITC_BT_25,
  REGLAS_ITC_BT_25,
  type CodigoCircuito,
} from "./tablasInstalacion";

/** Los circuitos con fila propia en la tabla 1 (los adicionales llevan la de su tipo). */
type CodigoBase = keyof typeof CIRCUITOS_ITC_BT_25.datos;

/** Los puntos de una estancia por circuito: «C1» → 2. */
export type PuntosPorCircuito = Partial<Record<CodigoBase, number>>;

export interface EstanciaRebt {
  nombre: string;
  /** La fila de la tabla 2 que se le aplica: «Sala de estar o salón». */
  fila: string;
  /** Superficie útil [m²]; null si no se conoce. */
  util_m2: number | null;
  /** Le faltaba la superficie y se ha tomado el mínimo. */
  sinSuperficie: boolean;
  puntos: PuntosPorCircuito;
  /** Mecanismos que no son puntos de utilización (el pulsador del timbre). */
  extra?: string;
}

export interface CircuitoRebt {
  codigo: CodigoCircuito;
  /** Para C6, C7 y C12: el circuito del que es adicional. */
  adicionalDe?: CodigoBase;
  uso: string;
  /** Puntos o tomas; null en los circuitos sin puntos (C8, C9 con un equipo, C11). */
  puntos: number | null;
  ia_A: number;
  s_mm2: number;
  tubo_mm: number;
  /** Longitud máxima con la que la sección cumple la caída de tensión [m]. */
  lmax_m: number;
  /** Caída de tensión que se admite en el circuito (0,03 o 0,05). */
  caida: number;
}

export interface InteriorVivienda {
  estancias: EstanciaRebt[];
  /** Las estancias salen de Habitabilidad (si no, deducidas del tipo). */
  deHabitabilidad: boolean;
  circuitos: CircuitoRebt[];
  /** Diferenciales de 30 mA por cada cinco circuitos (sin el C13). */
  diferenciales: number;
  /** Lleva C13, con su diferencial exclusivo. */
  recarga: boolean;
  /** Lo que la hace elevada por sus circuitos (C6, C7, C8…): vacío si nada. */
  piden: string[];
}

/** Datos de la vivienda que usa el cálculo. */
export interface ViviendaInterior {
  dormitorios: number;
  banos: number;
  aseos: number;
  superficie_m2: number;
  /** Unifamiliar con garaje o plaza: C13 y la fila del garaje. */
  recarga: boolean;
}

const P = PUNTOS_ITC_BT_25.datos;

const luz10 = (s: number | null) => (s !== null && s > P.luzHasta_m2 ? 2 : 1);
const tomas6 = (s: number | null) => Math.max(P.tomasMinSalonDormitorio, s !== null ? Math.ceil(s / P.tomaCadaM2 - 1e-9) : 0);

/** La fila de la tabla 2 de cada tipo de estancia. */
const FILA: Record<TipoEstancia, string> = {
  estar: "Sala de estar o salón",
  comedor: "Sala de estar o salón",
  estar_comedor: "Sala de estar o salón",
  estar_cocina: "Salón y cocina",
  cocina: "Cocina",
  dormitorio: "Dormitorios",
  bano: "Baños",
  aseo: "Baños",
  pasillo: "Pasillos o distribuidores",
  otro: "Terrazas y vestidores",
};

function puntosSalon(s: number | null, eq: EquiposVivienda): PuntosPorCircuito {
  return { C1: luz10(s), C2: tomas6(s), ...(eq.climatizacion === "emisores" ? { C8: luz10(s) } : {}) };
}

function puntosCocina(s: number | null, eq: EquiposVivienda): PuntosPorCircuito {
  return {
    C1: luz10(s),
    ...P.cocina,
    ...(eq.climatizacion === "emisores" ? { C8: 1 } : {}),
    ...(eq.secadora ? { C10: 1 } : {}),
  };
}

function sumar(a: PuntosPorCircuito, b: PuntosPorCircuito): PuntosPorCircuito {
  const r: PuntosPorCircuito = { ...a };
  for (const [k, v] of Object.entries(b) as [CodigoBase, number][]) r[k] = (r[k] ?? 0) + v;
  return r;
}

/**
 * Los puntos de una estancia por la tabla 2. El pasillo se mide por longitud, que
 * no se tiene: un punto de luz y una toma (los de hasta 5 m).
 */
function puntosEstancia(e: EstanciaHab, eq: EquiposVivienda): EstanciaRebt {
  const s = e.util_m2 !== null && Number.isFinite(e.util_m2) && e.util_m2 > 0 ? e.util_m2 : null;
  const emisores = eq.climatizacion === "emisores";
  let puntos: PuntosPorCircuito;
  let mide = true;
  switch (e.tipo) {
    case "estar":
    case "comedor":
    case "estar_comedor":
      puntos = puntosSalon(s, eq);
      break;
    case "estar_cocina":
      puntos = sumar(puntosSalon(s, eq), puntosCocina(s, eq));
      break;
    case "cocina":
      puntos = puntosCocina(s, eq);
      break;
    case "dormitorio":
      puntos = { C1: luz10(s), C2: tomas6(s), ...(emisores ? { C8: 1 } : {}) };
      break;
    case "bano":
    case "aseo":
      puntos = { C1: 1, C5: 1, ...(emisores ? { C8: 1 } : {}) };
      mide = false;
      break;
    case "pasillo":
      puntos = { C1: 1, C2: 1, ...(emisores ? { C8: 1 } : {}) };
      mide = false;
      break;
    default:
      puntos = { C1: luz10(s) };
  }
  return { nombre: e.nombre, fila: FILA[e.tipo], util_m2: s, sinSuperficie: mide && s === null, puntos };
}

/** Las estancias de la vivienda: las de Habitabilidad o las deducidas, más acceso, vestíbulo y garaje. */
export function estanciasVivienda(v: ViviendaInterior, deHab: EstanciaHab[], eq: EquiposVivienda): { estancias: EstanciaRebt[]; deHabitabilidad: boolean } {
  const deHabitabilidad = deHab.length > 0;
  const base = deHabitabilidad ? deHab : estanciasPropuestas(v);
  const estancias: EstanciaRebt[] = [
    { nombre: "Acceso", fila: "Acceso", util_m2: null, sinSuperficie: false, puntos: {}, extra: "pulsador de timbre" },
    { nombre: "Vestíbulo", fila: "Vestíbulo", util_m2: null, sinSuperficie: false, puntos: { C1: 1, C2: 1 } },
    ...base.map((e) => puntosEstancia(e, eq)),
  ];
  if (v.recarga) estancias.push({ nombre: "Garaje o plaza", fila: "Garajes unifamiliares y otros", util_m2: null, sinSuperficie: false, puntos: { C1: 1, C2: 1, C13: 1 } });
  return { estancias, deHabitabilidad };
}

/** Longitud máxima de un circuito con su sección: e·U·γ·S / (2·In), redondeada a la baja a 0,1 m. */
export function longitudMaxima(s_mm2: number, ia_A: number, caida: number): number {
  const R = REGLAS_ITC_BT_25.datos;
  return Math.floor(((caida * R.tension_V * FORMULAS_ANEXO2.datos.gammaCu70 * s_mm2) / (2 * ia_A)) * 10) / 10;
}

function circuito(codigo: CodigoCircuito, base: CodigoBase, puntos: number | null): CircuitoRebt {
  const f = CIRCUITOS_ITC_BT_25.datos[base];
  const caida = base === "C13" ? REGLAS_ITC_BT_25.datos.caidaRecarga : REGLAS_ITC_BT_25.datos.caidaInterior;
  return {
    codigo,
    ...(codigo !== base ? { adicionalDe: base } : {}),
    uso: codigo !== base ? `${f.uso} (adicional del ${base})` : f.uso,
    puntos,
    ia_A: f.ia_A,
    s_mm2: f.s_mm2,
    tubo_mm: f.tubo_mm,
    lmax_m: longitudMaxima(f.s_mm2, f.ia_A, caida),
    caida,
  };
}

/** Reparte n puntos en k circuitos lo más igual posible: 25 en 2 → [13, 12]. */
function repartir(n: number, k: number): number[] {
  return Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i < n % k ? 1 : 0));
}

/**
 * Los circuitos de la vivienda: C1–C5 siempre; adicionales (C6, C7, C12) cuando
 * los puntos pasan del máximo de la tabla 1 o la superficie de 160 m²; C8–C11 por
 * los equipos; C13 en la unifamiliar con recarga.
 */
export function interiorVivienda(v: ViviendaInterior, deHab: EstanciaHab[], eq: EquiposVivienda): InteriorVivienda {
  const T = CIRCUITOS_ITC_BT_25.datos;
  const R = REGLAS_ITC_BT_25.datos;
  const { estancias, deHabitabilidad } = estanciasVivienda(v, deHab, eq);
  const total = estancias.reduce<PuntosPorCircuito>((a, e) => sumar(a, e.puntos), {});
  const circuitos: CircuitoRebt[] = [];
  const piden: string[] = [];

  const conAdicionales = (base: "C1" | "C2" | "C5", adicional: CodigoCircuito, minimo = 1) => {
    const n = total[base] ?? 0;
    const k = Math.max(minimo, Math.ceil(n / T[base].maxPuntos - 1e-9), 1);
    repartir(n, k).forEach((p, i) => circuitos.push(i === 0 ? circuito(base, base, p) : circuito(adicional, base, p)));
    return k - 1;
  };

  if (conAdicionales("C1", "C6") > 0) piden.push(`más de ${T.C1.maxPuntos} puntos de luz (C6)`);
  const masDe160 = v.superficie_m2 > R.c7SiSuperficieMasDe_m2;
  const extraC2 = conAdicionales("C2", "C7", masDe160 ? 2 : 1);
  if (extraC2 > 0) piden.push(masDe160 ? `más de ${R.c7SiSuperficieMasDe_m2} m² útiles (C7)` : `más de ${T.C2.maxPuntos} tomas de uso general (C7)`);
  circuitos.push(circuito("C3", "C3", total.C3 ?? 1));
  // C4: nota (8) de la tabla 1: desdoblarlo por aparato no lleva a la elevada.
  circuitos.push(circuito("C4", "C4", Math.min(total.C4 ?? T.C4.maxPuntos, T.C4.maxPuntos)));
  if (conAdicionales("C5", "C12") > 0) piden.push(`más de ${T.C5.maxPuntos} tomas de baño y cocina (C12)`);

  if (eq.climatizacion === "aire_aire") {
    circuitos.push(circuito("C9", "C9", null));
    piden.push("aire acondicionado (C9)");
  } else if (eq.climatizacion === "aire_agua") {
    circuitos.push(circuito("C8", "C8", null));
    piden.push("calefacción eléctrica (C8)");
  } else if (eq.climatizacion === "emisores") {
    circuitos.push(circuito("C8", "C8", total.C8 ?? null));
    piden.push("calefacción eléctrica (C8)");
  }
  if (eq.secadora) {
    circuitos.push(circuito("C10", "C10", 1));
    piden.push("secadora (C10)");
  }
  if (eq.automatizacion) {
    circuitos.push(circuito("C11", "C11", null));
    piden.push("automatización (C11)");
  }
  if (v.recarga) {
    circuitos.push(circuito("C13", "C13", total.C13 ?? 1));
    piden.push("recarga del vehículo eléctrico (C13)");
  }

  const sinRecarga = circuitos.filter((c) => c.codigo !== "C13").length;
  return {
    estancias,
    deHabitabilidad,
    circuitos,
    diferenciales: Math.ceil(sinRecarga / R.circuitosPorDiferencial),
    recarga: v.recarga,
    piden,
  };
}
