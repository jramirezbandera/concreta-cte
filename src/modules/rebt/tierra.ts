// =============================================================================
// REBT — La puesta a tierra del edificio (feature-34): el anillo de cobre
// desnudo bajo la cimentación y las picas que hagan falta (ITC-BT-26 ap. 3), con
// la resistencia del conductor enterrado R = 2ρ/L y de la pica R = ρ/L
// (ITC-BT-18 tabla 5), frente a la que exige el diferencial: RA·Ia ≤ 50 V
// (ITC-BT-24). PURA.
//
// - El anillo mide el perímetro del edificio: el del proyecto o el de la planta
//   de SUA 8 (largo y ancho, o un cuadrado con la superficie de la cubierta).
// - Sin resistividad declarada, la peor de la tabla 4 (3 000 Ω·m), y las picas
//   solo para el límite del reglamento. Con el terreno declarado, además, para
//   la resistencia orientativa de la Guía BT-26: 37 Ω sin pararrayos y 15 Ω con
//   él (K-REBT.30 a 33).
// - Las picas en paralelo con el anillo, como si no se influyeran (separadas
//   al menos el doble de su longitud): es optimista, se dice y se pide medir.
// - En un edificio existente, la instalación se conecta a la tierra que hay.
// =============================================================================

import { CRITERIOS_INSTALACION, TIERRA_GUIA_BT26, TIERRA_REBT } from "./tablasInstalacion";

export interface TierraRebt {
  /** Edificio existente: se conecta a su puesta a tierra. */
  existente: boolean;
  anillo_m: number;
  /** De dónde sale la longitud del anillo. */
  origenAnillo: "proyecto" | "sua8" | "estimado";
  resistividad_ohm_m: number;
  terrenoSupuesto: boolean;
  /** La descripción de la tabla 4 si la resistividad coincide con una de sus medias. */
  terreno: string | null;
  pararrayos: boolean;
  /** Diferencial de referencia [A]. */
  ia_A: number;
  /** U/Ia [Ω]. */
  rMaxReglamento_ohm: number;
  /** 37 o 15 Ω (Guía BT-26). */
  rGuia_ohm: number;
  /** La que se persigue: el reglamento o, con terreno declarado, la menor de las dos. */
  objetivo_ohm: number;
  rAnillo_ohm: number;
  picas: number;
  r_ohm: number;
  /** Harían falta más picas de las razonables: hay que medir o mejorar el terreno. */
  excesivo: boolean;
  cumple: boolean;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

export interface DatosTierra {
  existente: boolean;
  unifamiliar: boolean;
  /** Perímetro del proyecto [m] o null. */
  perimetro_m: number | null;
  /** Largo y ancho de la planta de SUA 8 y si los dio el proyectista. */
  planta: { largo_m: number; ancho_m: number; dadas: boolean };
  resistividad_ohm_m: number | null;
  pararrayos: boolean;
}

export function tierraRebt(q: DatosTierra): TierraRebt {
  const T = TIERRA_REBT.datos;
  const G = TIERRA_GUIA_BT26.datos;
  const C = CRITERIOS_INSTALACION.datos;
  const anillo_m = r1(q.perimetro_m ?? 2 * (q.planta.largo_m + q.planta.ancho_m));
  const origenAnillo = q.perimetro_m !== null ? "proyecto" : q.planta.dadas ? "sua8" : "estimado";
  const terrenoSupuesto = q.resistividad_ohm_m === null;
  const rho = q.resistividad_ohm_m ?? C.resistividadSupuesta_ohm_m;
  const terreno = T.resistividad.find((x) => x.ohm_m === rho)?.terreno ?? null;
  const ia_A = q.unifamiliar ? C.iaUnifamiliar_A : C.iaEdificio_A;
  const rMaxReglamento_ohm = r1(T.contacto_V / ia_A);
  const rGuia_ohm = q.pararrayos ? G.conPararrayos_ohm : G.sinPararrayos_ohm;
  const objetivo_ohm = terrenoSupuesto ? rMaxReglamento_ohm : Math.min(rMaxReglamento_ohm, rGuia_ohm);
  const rAnillo = anillo_m > 0 ? (2 * rho) / anillo_m : Infinity;
  const rPica = rho / G.pica_m;
  // 1/R = 1/Ranillo + n/Rpica ≤ 1/objetivo.
  const faltan = 1 / objetivo_ohm - 1 / rAnillo;
  const necesarias = faltan > 1e-12 ? Math.ceil(faltan * rPica - 1e-9) : 0;
  const excesivo = necesarias > C.picasMax;
  const picas = Math.min(necesarias, C.picasMax);
  const r = 1 / (1 / rAnillo + picas / rPica);
  return {
    existente: q.existente,
    anillo_m,
    origenAnillo,
    resistividad_ohm_m: rho,
    terrenoSupuesto,
    terreno,
    pararrayos: q.pararrayos,
    ia_A,
    rMaxReglamento_ohm,
    rGuia_ohm,
    objetivo_ohm,
    rAnillo_ohm: r1(rAnillo),
    picas,
    r_ohm: r1(r),
    excesivo,
    cumple: r <= rMaxReglamento_ohm + 1e-9,
  };
}
