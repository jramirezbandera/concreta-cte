// =============================================================================
// REBT — Lo que va del contador hacia dentro y de la caja general de protección
// al contador (feature-34): circuitos y puntos de utilización de la vivienda
// (ITC-BT-25), línea general de alimentación (ITC-BT-14), derivación individual
// (ITC-BT-15), intensidades admisibles (ITC-BT-19 e ITC-BT-07), caídas de
// tensión y puesta a tierra (ITC-BT-18, 24 y 26). Valores como DATOS
// versionados con procedencia. Aquí SOLO datos; el cálculo vive en
// `interior.ts`, `lineas.ts` y `tierra.ts`.
//
// VERIFICACIÓN (research/verificacion-rebt.md, bloque N y K-REBT.19–36): las
// tablas del reglamento, cotejadas en la imagen del consolidado del BOE; las de
// las guías del Ministerio, en la imagen de cada guía, con su edición. Lo que
// hay que saber:
//   - la tabla 1 de la ITC-BT-19 es la de la UNE 20460-5-523 de 1994; la Guía
//     BT-19 recomienda la de 2004, que da hasta un 10 % menos con XLPE. Se toma
//     la menor de las dos (K-REBT.19);
//   - C6, C7 y C12 no tienen fila en la tabla 1: son «adicionales del tipo» C1,
//     C2 y C3/C4/C5 y llevan sus características (ITC-BT-25 ap. 2.3.2);
//   - la fila C13 sí está en la tabla 1 del consolidado (la Guía BT-25, de 2012,
//     no la tiene); su potencia y su interruptor, en la ITC-BT-52;
//   - erratas del BOE: «0 65» y «0 50» en la tabla 1 de la ITC-BT-15.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_REBT } from "./tablas";

const guia = (n: string, edicion: string, fecha: string, archivo: string) =>
  ({ db: `Guía técnica de aplicación ${n}`, edicion, fecha, fuente: `industria.gob.es · ${archivo} (cotejado en imagen)` }) as const;

const PROC_GUIA_BT15 = guia("ITC-BT-15", "sep-03, rev. 1", "2003-09", "guia_bt_15_sep03R1.pdf");
const PROC_GUIA_BT19 = guia("ITC-BT-19", "feb-09, rev. 2", "2009-02", "guia_bt_19_feb09R2.pdf");
const PROC_GUIA_BT22 = guia("ITC-BT-22", "oct-05, rev. 1", "2005-10", "guia_bt_22_oct05R1.pdf");
const PROC_GUIA_BT26 = guia("ITC-BT-26", "sep-03, rev. 1", "2003-09", "guia_bt_26_sep03R1.pdf");
const PROC_GUIA_ANEXO2 = guia("Anexo 2 (caídas de tensión)", "feb-2026, rev. 2", "2026-02", "guia_bt_anexo_2_sep03R1.pdf");

// -----------------------------------------------------------------------------
// Circuitos de la vivienda (ITC-BT-25)
// -----------------------------------------------------------------------------

export type CodigoCircuito = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" | "C10" | "C11" | "C12" | "C13";

export interface FilaCircuito {
  uso: string;
  /** Interruptor automático [A]; el del C13 lo da la ITC-BT-52. */
  ia_A: number;
  /** Máximo de puntos o tomas por circuito; null = sin máximo («–»). */
  maxPuntos: number | null;
  s_mm2: number;
  tubo_mm: number;
}

/**
 * ITC-BT-25 tabla 1 (p. 169): interruptor, máximo de puntos, sección mínima
 * (dos conductores y tierra, PVC bajo tubo empotrado, nota 5) y Ø exterior del
 * tubo. C8 y C9, hasta 5 750 W por circuito (nota 2); C11, 2 300 W (nota 4).
 * C13: 2,5 mm² y tubo de 20; su interruptor, el de una estación de 3 680 W de
 * la ITC-BT-52 tabla 1 (16 A, criterio para la toma habitual).
 */
export const CIRCUITOS_ITC_BT_25 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-25 ap. 2.3 y 3; ITC-BT-52 tabla 1", tabla: "Tabla 1" },
  {
    C1: { uso: "Iluminación", ia_A: 10, maxPuntos: 30, s_mm2: 1.5, tubo_mm: 16 },
    C2: { uso: "Tomas de uso general", ia_A: 16, maxPuntos: 20, s_mm2: 2.5, tubo_mm: 20 },
    C3: { uso: "Cocina y horno", ia_A: 25, maxPuntos: 2, s_mm2: 6, tubo_mm: 25 },
    C4: { uso: "Lavadora, lavavajillas y termo", ia_A: 20, maxPuntos: 3, s_mm2: 4, tubo_mm: 20 },
    C5: { uso: "Baño y cuarto de cocina", ia_A: 16, maxPuntos: 6, s_mm2: 2.5, tubo_mm: 20 },
    C8: { uso: "Calefacción", ia_A: 25, maxPuntos: null, s_mm2: 6, tubo_mm: 25 },
    C9: { uso: "Aire acondicionado", ia_A: 25, maxPuntos: null, s_mm2: 6, tubo_mm: 25 },
    C10: { uso: "Secadora", ia_A: 16, maxPuntos: 1, s_mm2: 2.5, tubo_mm: 20 },
    C11: { uso: "Automatización", ia_A: 10, maxPuntos: null, s_mm2: 1.5, tubo_mm: 16 },
    C13: { uso: "Recarga del vehículo eléctrico", ia_A: 16, maxPuntos: 3, s_mm2: 2.5, tubo_mm: 20 },
  } satisfies Partial<Record<CodigoCircuito, FilaCircuito>>,
);

/**
 * ITC-BT-25 ap. 2.3.2: C6 por cada 30 puntos de luz (adicional del C1); C7 por
 * cada 20 tomas de uso general o con más de 160 m² útiles (del C2); C12, C3 o C4
 * adicionales, o C5 adicional con más de 6 tomas. Al menos un diferencial de
 * 30 mA por cada cinco circuitos, con intensidad asignada igual o mayor que la
 * del IGA (ap. 2.1 y 2.3); el C13, con el suyo exclusivo, de clase A (ITC-BT-52
 * ap. 6.1). Caída de tensión de la instalación interior: 3 % con la intensidad
 * del interruptor del circuito, hasta el punto más alejado (ap. 3; ITC-BT-19
 * ap. 2.2.2); la del C13, 5 % (ITC-BT-52).
 */
export const REGLAS_ITC_BT_25 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-25 ap. 2.1, 2.3 y 3; ITC-BT-19 ap. 2.2.2; ITC-BT-52 ap. 5 y 6.1" },
  {
    adicional: { C6: "C1", C7: "C2", C12: "C5" } as const,
    c7SiSuperficieMasDe_m2: 160,
    diferencial_mA: 30,
    circuitosPorDiferencial: 5,
    caidaInterior: 0.03,
    caidaRecarga: 0.05,
    potenciaMaxC8C9_W: 5750,
    tension_V: 230,
    igaPoderCorte_A: 4500,
  } as const,
);

/**
 * ITC-BT-25 tabla 2 (p. 170): puntos de utilización mínimos por estancia. Los
 * puntos de luz (y las tomas de calefacción y de aire del salón) son 1 hasta
 * 10 m² y 2 con más; las tomas de uso general del salón y los dormitorios, una
 * por cada 6 m² y al menos 3; en el pasillo, un punto de luz cada 5 m y una
 * toma hasta 5 m (dos con más).
 */
export const PUNTOS_ITC_BT_25 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-25 ap. 4", tabla: "Tabla 2" },
  {
    luzHasta_m2: 10,
    tomaCadaM2: 6,
    tomasMinSalonDormitorio: 3,
    pasilloLuzCada_m: 5,
    pasilloTomaHasta_m: 5,
    cocina: { C2: 2, C3: 1, C4: 3, C5: 3 },
  } as const,
);

// -----------------------------------------------------------------------------
// Caídas de tensión, LGA y DI (ITC-BT-14, 15 y 16)
// -----------------------------------------------------------------------------

/**
 * Caídas de tensión máximas: LGA 0,5 % (contadores totalmente centralizados) o
 * 1 % (centralizaciones parciales); DI 1 % (totalmente concentrados), 0,5 % (en
 * más de un lugar) o 1,5 % (un único usuario sin LGA). La de la DI y la de la
 * instalación interior se pueden compensar entre sí; la de la LGA, no.
 */
export const CAIDAS_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-14 ap. 3; ITC-BT-15 ap. 3; ITC-BT-19 ap. 2.2.2" },
  { lgaCentralizados: 0.005, diCentralizados: 0.01, diUsuarioUnico: 0.015 } as const,
);

/**
 * ITC-BT-14: LGA de cobre o aluminio, unipolares de 0,6/1 kV, no propagadores
 * del incendio, sección mínima 10 mm² de cobre. Tabla 1: Ø exterior del tubo
 * según la sección de fase. ITC-BT-16 ap. 3: interruptor general de maniobra de
 * 160 A hasta 90 kW y de 250 A hasta 150 kW, con más de dos usuarios.
 */
export const LGA_ITC_BT_14 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-14 ap. 3; ITC-BT-16 ap. 3", tabla: "Tabla 1" },
  {
    sMin_mm2: 10,
    tubo_mm: { 10: 75, 16: 75, 25: 110, 35: 110, 50: 125, 70: 140, 95: 140, 120: 160, 150: 160, 185: 180, 240: 200 } as Record<number, number>,
    igm: { hasta_kW: 90, menor_A: 160, mayor_A: 250, masDeUsuarios: 2 },
  } as const,
);

/**
 * ITC-BT-15: DI de 6 mm² como mínimo (fases, neutro y protección), hilo de
 * mando de 1,5 mm² rojo (no hace falta con contadores con telegestión, ITC-BT-16
 * ap. 1), tubo con ampliación del 100 % y Ø exterior mínimo de 32 mm, uno de
 * reserva por cada diez derivaciones. Su capacidad, como mínimo la del IGA
 * (ITC-BT-25 ap. 1).
 */
export const DI_ITC_BT_15 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-15 ap. 2 y 3; ITC-BT-16 ap. 1; ITC-BT-25 ap. 1" },
  { sMin_mm2: 6, hiloMando_mm2: 1.5, tuboMin_mm: 32, reservaCada: 10 } as const,
);

/**
 * Guía BT-15, tablas F y G (y H): Ø exterior del tubo de la DI según la sección
 * [mm]. Monofásica con ES07Z1-K empotrada, el mayor de las tablas F y H;
 * enterrada con RZ1-K. Trifásica de 35 mm² empotrada: sin dato en la guía
 * (pendiente P11); se toma el de la ITC-BT-21 tabla 5 para cinco conductores
 * con el 100 % de ampliación (criterio).
 */
export const TUBOS_DI_GUIA_BT15 = tablaCTE(
  { ...PROC_GUIA_BT15, articulo: "ap. 2", tabla: "Tablas F, G y H" },
  {
    monoEmpotrada: { 6: 40, 10: 40, 16: 40, 25: 50, 35: 50 } as Record<number, number>,
    monoEnterrada: { 6: 40, 10: 50, 16: 50, 25: 63, 35: 63 } as Record<number, number>,
    triEmpotrada: { 6: 32, 10: 40, 16: 50, 25: 63, 35: 63 } as Record<number, number>,
    triEnterrada: { 6: 50, 10: 63, 16: 63, 25: 75, 35: 90, 50: 110 } as Record<number, number>,
  } as const,
);

// -----------------------------------------------------------------------------
// Intensidades admisibles (cobre)
// -----------------------------------------------------------------------------

export const SECCIONES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const;

/**
 * ITC-BT-19 tabla 1, método B (p. 129), aire a 40 °C [A], por sección de
 * `SECCIONES_MM2`: PVC (y Z1) o XLPE, con dos o tres conductores cargados.
 */
export const IZ_ITC_BT_19 = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-19 ap. 2.2.3", tabla: "Tabla 1 (método B)" },
  {
    PVC3: [13.5, 18.5, 24, 32, 44, 59, 77, 96, 117, 149, 180, 208, 236, 268, 315],
    PVC2: [15, 21, 27, 36, 50, 66, 84, 104, 125, 160, 194, 225, 260, 297, 350],
    XLPE3: [18, 25, 34, 44, 60, 80, 106, 131, 159, 202, 245, 284, 338, 386, 455],
    XLPE2: [21, 29, 38, 49, 68, 91, 116, 144, 175, 224, 271, 314, 363, 415, 490],
  } as const,
);

/** Guía BT-19, tabla A (UNE 20460-5-523:2004), método B1, 40 °C [A]. */
export const IZ_GUIA_BT19 = tablaCTE(
  { ...PROC_GUIA_BT19, articulo: "ap. 2.2.3", tabla: "Tabla A (método B1)" },
  {
    PVC3: [13.5, 18.5, 24, 32, 44, 59, 77, 96, 117, 149, 180, 208, 236, 268, 315],
    PVC2: [15, 21, 27, 36, 50, 66, 84, 104, 125, 160, 194, 225, 260, 297, 350],
    XLPE3: [16.5, 23, 31, 40, 54, 73, 95, 119, 145, 185, 224, 260, 299, 341, 401],
    XLPE2: [20, 26.5, 36, 46, 65, 87, 110, 137, 167, 214, 259, 301, 343, 391, 468],
  } as const,
);

/**
 * Enterrados en tubo (DI de la unifamiliar que va enterrada): ITC-BT-07 tabla 5,
 * terna de unipolares XLPE (25 °C, 0,70 m, 1 K·m/W), × 0,8 en tubo y × 1,225 con
 * dos unipolares; y Guía BT-19 tabla D (1,5 K·m/W). Por sección desde 6 mm².
 */
export const IZ_ENTERRADO = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-07 ap. 3.1.2 y 3.1.3; Guía BT-19 tabla D", tabla: "Tabla 5" },
  {
    secciones: [6, 10, 16, 25, 35, 50],
    bt07Terna: [72, 96, 125, 160, 190, 230],
    factorTubo: 0.8,
    factorDosUnipolares: 1.225,
    guiaXLPE3: [48, 64, 82, 105, 130, 155],
    guiaXLPE2: [58, 77, 100, 130, 155, 183],
  } as const,
);

// -----------------------------------------------------------------------------
// Protecciones y fórmulas (guías)
// -----------------------------------------------------------------------------

/**
 * Guía BT-22: Ib ≤ In ≤ Iz e I2 ≤ 1,45·Iz. Fusible gG de In ≥ 16 A: I2 = 1,60·In,
 * de donde In ≤ 1,45/1,60·Iz (INTERPRETACIÓN). Magnetotérmicos (UNE-EN 60898):
 * I2 = 1,45·In, basta In ≤ Iz.
 */
export const PROTECCION_GUIA_BT22 = tablaCTE(
  { ...PROC_GUIA_BT22, articulo: "ap. 1.1" },
  { i2Limite: 1.45, i2FusibleGG: 1.6 } as const,
);

/**
 * Guía, Anexo 2: conductividad del cobre a la temperatura máxima del aislamiento
 * [m/(Ω·mm²)]: 48 a 70 °C (PVC, Z1) y 44 a 90 °C (XLPE) (K-REBT.21). Caída
 * monofásica e = 2·P·L/(γ·S·U), trifásica e = P·L/(γ·S·U); reactancia
 * despreciable hasta 120 mm². cos φ = 1 en la DI y en los circuitos de la
 * vivienda.
 */
export const FORMULAS_ANEXO2 = tablaCTE(
  { ...PROC_GUIA_ANEXO2, articulo: "Anexo 2" },
  { gammaCu70: 48, gammaCu90: 44 } as const,
);

// -----------------------------------------------------------------------------
// Puesta a tierra (ITC-BT-18, 24 y 26)
// -----------------------------------------------------------------------------

/**
 * ITC-BT-26 ap. 3: anillo cerrado de cobre desnudo en el fondo de la zanja de
 * cimentación, por todo el perímetro, con picas si hace falta bajar la
 * resistencia. ITC-BT-18: cobre enterrado sin protección contra la corrosión de
 * 25 mm² como mínimo (tabla 1), a 0,50 m como mínimo; resistividad media del
 * terreno (tabla 4) y resistencia del conductor horizontal R = 2ρ/L y de la pica
 * R = ρ/L (tabla 5); tensión de contacto de 24 V en local conductor y 50 V en los
 * demás (ap. 9); ITC-BT-24: RA·Ia ≤ U. Línea principal de tierra de cobre, como
 * el conductor de protección y de 16 mm² como mínimo.
 */
export const TIERRA_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-18 ap. 3 y 9, tablas 1, 4 y 5; ITC-BT-24 ap. 4.1.2; ITC-BT-26 ap. 3" },
  {
    anilloMin_mm2: 25,
    profundidadMin_m: 0.5,
    resistividad: [
      { ohm_m: 50, terreno: "terrenos cultivables y fértiles, terraplenes compactos y húmedos" },
      { ohm_m: 500, terreno: "terraplenes cultivables poco fértiles y otros terraplenes" },
      { ohm_m: 3000, terreno: "suelos pedregosos desnudos, arenas secas permeables" },
    ],
    contacto_V: 50,
    lineaPrincipalMin_mm2: 16,
  } as const,
);

/**
 * Guía BT-26 (no reglamentaria): anillo de 35 mm² a 0,8 m, picas de 2 m
 * separadas al menos el doble de su longitud; resistencia que se obtiene en la
 * práctica con su tabla A: menos de 15 Ω con pararrayos y de 37 Ω sin él.
 */
export const TIERRA_GUIA_BT26 = tablaCTE(
  { ...PROC_GUIA_BT26, articulo: "ap. 3.1", tabla: "Tabla A" },
  { anillo_mm2: 35, profundidad_m: 0.8, pica_m: 2, conPararrayos_ohm: 15, sinPararrayos_ohm: 37 } as const,
);

/**
 * ITC-BT-18 tabla 2 (ITC-BT-19 tabla 2): sección del conductor de protección
 * según la de fase: S hasta 16 mm²; 16 hasta 35; S/2 por encima.
 */
export function seccionProteccion(s_mm2: number): number {
  return s_mm2 <= 16 ? s_mm2 : s_mm2 <= 35 ? 16 : s_mm2 / 2;
}

// -----------------------------------------------------------------------------
// Criterios de proyecto (no son exigencia del REBT; K-REBT.19–36)
// -----------------------------------------------------------------------------

/**
 * - Longitudes tipo cuando no se dan: DI de la unifamiliar 15 m; LGA 10 m; DI
 *   del edificio, 3 m en la centralización, el recorrido vertical hasta su planta
 *   y 10 m en planta (K-REBT.29).
 * - Método de instalación B (tubo empotrado o canaladura de obra) (K-REBT.20).
 * - Intensidad de cálculo de la LGA, la de la previsión con cos φ 0,9; de la DI
 *   de una vivienda, la del IGA (K-REBT.22 y 23). DI de servicios y locales
 *   trifásicas, con el calibre normalizado igual o mayor que su intensidad.
 * - Resistividad supuesta, la peor de la tabla 4 (K-REBT.30); diferencial de
 *   referencia para la tierra, 30 mA en la unifamiliar y 300 mA en el edificio
 *   con servicios generales (K-REBT.31).
 */
export const CRITERIOS_INSTALACION = tablaCTE(
  { db: "Criterio de proyecto", edicion: "Concreta Memorias" },
  {
    diUnifamiliar_m: 15,
    lga_m: 10,
    diCentralizacion_m: 3,
    diPlanta_m: 10,
    cosPhiLga: 0.9,
    calibres_A: [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250],
    resistividadSupuesta_ohm_m: 3000,
    iaUnifamiliar_A: 0.03,
    iaEdificio_A: 0.3,
    picasMax: 20,
  } as const,
);
