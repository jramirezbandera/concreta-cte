// =============================================================================
// REBT — La línea general de alimentación y las derivaciones individuales
// (feature-34): sección por la mínima reglamentaria, por la intensidad admisible
// y por la caída de tensión; tubo y protección. PURA.
//
// - LGA (ITC-BT-14): trifásica a 400 V, cables RZ1-K (AS) de 0,6/1 kV (XLPE,
//   γ = 44), con la intensidad de la previsión (cos φ 0,9) y sitio para un
//   fusible gG entre esa intensidad y 0,906·Iz (Guía BT-22). Caída ≤ 0,5 % con
//   los contadores totalmente centralizados.
// - DI de una vivienda (ITC-BT-15): monofásica, con la intensidad del IGA
//   (ITC-BT-25 ap. 1), cables ES07Z1-K (AS) de 450/750 V (como PVC, γ = 48).
//   Caída ≤ 1 % (totalmente centralizados) o ≤ 1,5 % (unifamiliar sin LGA).
// - DI de los servicios generales y de los locales: trifásica (monofásica el
//   local hasta 14 490 W), con el calibre normalizado igual o mayor que su
//   intensidad (criterio).
// Neutro igual a la fase (K-REBT.26); conductor de protección por la ITC-BT-18
// tabla 2. Las longitudes, las del proyecto o estimadas (K-REBT.29).
// =============================================================================

import { GRADO_REBT, igaDe } from "./tablas";
import {
  CAIDAS_REBT,
  CRITERIOS_INSTALACION,
  DI_ITC_BT_15,
  FORMULAS_ANEXO2,
  IZ_ENTERRADO,
  IZ_GUIA_BT19,
  IZ_ITC_BT_19,
  LGA_ITC_BT_14,
  PROTECCION_GUIA_BT22,
  SECCIONES_MM2,
  seccionProteccion,
  TUBOS_DI_GUIA_BT15,
} from "./tablasInstalacion";

export type Aislamiento = "PVC" | "XLPE";
export type Manda = "minimo" | "intensidad" | "caida";

export interface LineaRebt {
  id: string;
  /** «Línea general de alimentación», «DI vivienda A (P3)». */
  que: string;
  clase: "lga" | "di";
  trifasica: boolean;
  /** Potencia con que se calcula la caída [W]. */
  p_W: number;
  /** Intensidad de cálculo [A]. */
  ib_A: number;
  /** Intensidad de la protección que manda sobre el cable [A] (IGA, calibre) o, en la LGA, el máximo del fusible. */
  in_A: number;
  l_m: number;
  estimada: boolean;
  cable: string;
  enterrada: boolean;
  s_mm2: number;
  neutro_mm2: number;
  cp_mm2: number;
  iz_A: number;
  /** Caída de tensión [%]. */
  caida_pct: number;
  caidaMax_pct: number;
  manda: Manda;
  tubo_mm: number;
  proteccion: string;
  /** No cumple ni con la mayor sección de la tabla. */
  sinSeccion: boolean;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Iz [A] de una sección: la menor de la ITC-BT-19 y de la Guía (K-REBT.19); enterrada, de la ITC-BT-07 y la Guía. */
export function intensidadAdmisible(s_mm2: number, aislamiento: Aislamiento, cargados: 2 | 3, enterrada: boolean): number {
  if (enterrada) {
    const E = IZ_ENTERRADO.datos;
    const i = E.secciones.indexOf(s_mm2 as (typeof E.secciones)[number]);
    if (i < 0) return 0;
    const bt07 = E.bt07Terna[i] * E.factorTubo * (cargados === 2 ? E.factorDosUnipolares : 1);
    return r1(Math.min(bt07, (cargados === 2 ? E.guiaXLPE2 : E.guiaXLPE3)[i]));
  }
  const i = SECCIONES_MM2.indexOf(s_mm2 as (typeof SECCIONES_MM2)[number]);
  if (i < 0) return 0;
  const col = `${aislamiento}${cargados}` as const;
  return Math.min(IZ_ITC_BT_19.datos[col][i], IZ_GUIA_BT19.datos[col][i]);
}

/** Caída de tensión [%]: monofásica 2·P·L/(γ·S·U²), trifásica P·L/(γ·S·U²). */
export function caidaTension(p_W: number, l_m: number, s_mm2: number, gamma: number, trifasica: boolean): number {
  const U = trifasica ? 400 : GRADO_REBT.datos.tension_V;
  return ((trifasica ? 1 : 2) * p_W * l_m * 100) / (gamma * s_mm2 * U * U);
}

interface Requisitos {
  p_W: number;
  l_m: number;
  trifasica: boolean;
  /** Iz mínima que se pide [A]. */
  izMin_A: number;
  caidaMax_pct: number;
  sMin_mm2: number;
  aislamiento: Aislamiento;
  enterrada: boolean;
}

/** La menor sección que cumple el mínimo, la intensidad y la caída, y lo que manda. */
export function dimensionar(q: Requisitos): { s_mm2: number; iz_A: number; caida_pct: number; manda: Manda; sinSeccion: boolean } {
  const gamma = q.aislamiento === "XLPE" ? FORMULAS_ANEXO2.datos.gammaCu90 : FORMULAS_ANEXO2.datos.gammaCu70;
  const cargados = q.trifasica ? 3 : 2;
  const candidatas = (q.enterrada ? IZ_ENTERRADO.datos.secciones : SECCIONES_MM2).filter((s) => s >= q.sMin_mm2);
  const iz = (s: number) => intensidadAdmisible(s, q.aislamiento, cargados, q.enterrada);
  const caida = (s: number) => caidaTension(q.p_W, q.l_m, s, gamma, q.trifasica);
  const sI = candidatas.find((s) => iz(s) >= q.izMin_A - 1e-9);
  const sE = candidatas.find((s) => caida(s) <= q.caidaMax_pct + 1e-9);
  const ultima = candidatas[candidatas.length - 1];
  const s = sI === undefined || sE === undefined ? ultima : Math.max(sI, sE);
  const manda: Manda = s === candidatas[0] ? "minimo" : sE !== undefined && sI !== undefined && sE >= sI ? "caida" : "intensidad";
  return { s_mm2: s, iz_A: iz(s), caida_pct: caida(s), manda, sinSeccion: sI === undefined || sE === undefined };
}

/** El calibre normalizado igual o mayor que una intensidad (criterio). */
export function calibre(i_A: number): number {
  const C = CRITERIOS_INSTALACION.datos.calibres_A;
  return C.find((c) => c >= i_A - 1e-9) ?? C[C.length - 1];
}

/** Ø del tubo de una DI por su sección (Guía BT-15; ≥ 32 mm, ITC-BT-15). */
function tuboDi(s_mm2: number, trifasica: boolean, enterrada: boolean): number {
  const T = TUBOS_DI_GUIA_BT15.datos;
  const t = trifasica ? (enterrada ? T.triEnterrada : T.triEmpotrada) : enterrada ? T.monoEnterrada : T.monoEmpotrada;
  const claves = Object.keys(t).map(Number).sort((a, b) => a - b);
  const k = claves.find((c) => c >= s_mm2) ?? claves[claves.length - 1];
  return Math.max(DI_ITC_BT_15.datos.tuboMin_mm, t[k]);
}

/** Ø del tubo de la LGA por la sección de fase (ITC-BT-14 tabla 1). */
function tuboLga(s_mm2: number): number {
  const t = LGA_ITC_BT_14.datos.tubo_mm;
  const claves = Object.keys(t).map(Number).sort((a, b) => a - b);
  return t[claves.find((c) => c >= s_mm2) ?? claves[claves.length - 1]];
}

const CABLE_PVC = "ES07Z1-K (AS) 450/750 V";
const CABLE_XLPE = "RZ1-K (AS) 0,6/1 kV";

/** La línea general de alimentación. */
export function lineaGeneral(total_W: number, l_m: number, estimada: boolean): LineaRebt {
  const cos = CRITERIOS_INSTALACION.datos.cosPhiLga;
  const ib = total_W / (Math.sqrt(3) * 400 * cos);
  const fusible = PROTECCION_GUIA_BT22.datos.i2Limite / PROTECCION_GUIA_BT22.datos.i2FusibleGG;
  const caidaMax_pct = CAIDAS_REBT.datos.lgaCentralizados * 100;
  const d = dimensionar({ p_W: total_W, l_m, trifasica: true, izMin_A: ib / fusible, caidaMax_pct, sMin_mm2: LGA_ITC_BT_14.datos.sMin_mm2, aislamiento: "XLPE", enterrada: false });
  const inMax = Math.floor(fusible * d.iz_A);
  return {
    id: "lga",
    que: "Línea general de alimentación",
    clase: "lga",
    trifasica: true,
    p_W: total_W,
    ib_A: r1(ib),
    in_A: inMax,
    l_m,
    estimada,
    cable: CABLE_XLPE,
    enterrada: false,
    ...d,
    neutro_mm2: d.s_mm2,
    cp_mm2: seccionProteccion(d.s_mm2),
    caidaMax_pct,
    tubo_mm: tuboLga(d.s_mm2),
    proteccion: `Fusibles gG en la CGP, de ${Math.ceil(ib)} A a ${inMax} A`,
  };
}

export interface DatosDi {
  id: string;
  que: string;
  l_m: number;
  estimada: boolean;
  /** Potencia de la derivación [W]. */
  p_W: number;
  /** IGA de la vivienda [A]; null en servicios y locales (calibre de su intensidad). */
  iga_A: number | null;
  trifasica: boolean;
  /** Unifamiliar: sin LGA (1,5 %). */
  usuarioUnico: boolean;
  enterrada: boolean;
  /** Para las que no son de vivienda: cos φ de la carga. */
  cosPhi?: number;
}

/** Una derivación individual. */
export function derivacionIndividual(q: DatosDi): LineaRebt {
  const U = q.trifasica ? 400 : GRADO_REBT.datos.tension_V;
  const k = q.trifasica ? Math.sqrt(3) : 1;
  // Monofásica, cos φ 1, como los escalones del IGA (Guía BT-10, tabla C).
  const ib = q.iga_A ?? q.p_W / (k * U * (q.trifasica ? (q.cosPhi ?? 1) : 1));
  const inA = q.iga_A ?? (q.trifasica ? calibre(ib) : igaDe(q.p_W));
  // La caída de la DI de una vivienda, con la capacidad de su IGA (cos φ 1).
  const pCaida = q.iga_A !== null ? k * U * q.iga_A : q.p_W;
  const caidaMax_pct = (q.usuarioUnico ? CAIDAS_REBT.datos.diUsuarioUnico : CAIDAS_REBT.datos.diCentralizados) * 100;
  const aislamiento: Aislamiento = q.enterrada ? "XLPE" : "PVC";
  const d = dimensionar({ p_W: pCaida, l_m: q.l_m, trifasica: q.trifasica, izMin_A: inA, caidaMax_pct, sMin_mm2: DI_ITC_BT_15.datos.sMin_mm2, aislamiento, enterrada: q.enterrada });
  return {
    id: q.id,
    que: q.que,
    clase: "di",
    trifasica: q.trifasica,
    p_W: pCaida,
    ib_A: r1(ib),
    in_A: inA,
    l_m: q.l_m,
    estimada: q.estimada,
    cable: q.enterrada ? CABLE_XLPE : CABLE_PVC,
    enterrada: q.enterrada,
    ...d,
    neutro_mm2: d.s_mm2,
    cp_mm2: seccionProteccion(d.s_mm2),
    caidaMax_pct,
    tubo_mm: tuboDi(d.s_mm2, q.trifasica, q.enterrada),
    proteccion: q.iga_A !== null ? `IGA ${q.iga_A} A` : `${q.trifasica ? "IA 4P" : "IA 2P"} ${inA} A`,
  };
}
