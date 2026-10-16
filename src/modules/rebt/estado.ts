// =============================================================================
// REBT — Lo que guarda el módulo (feature-23): lo que El edificio no describe
// y decide la previsión de cargas. El grado de electrificación de las viviendas
// (por superficie, o elevada en todas por la climatización eléctrica u otros
// equipos), la potencia del ascensor y de los demás servicios generales y, si
// hay garaje comunitario, la recarga del vehículo eléctrico (con o sin SPL, y
// cuántas plazas); en la unifamiliar sin garaje, si tiene plaza en la parcela, y
// en el garaje que controla el humo con ventiladores, su potencia. La ventilación
// del garaje es la de HS 3. Cada decisión se guarda como «habitual» mientras
// coincida con lo habitual. Solo tipos.
//
// Lo habitual (criterio, research/verificacion-rebt.md «Decisiones de
// producto»): las viviendas, elevadas (climatización eléctrica), y la recarga
// sin SPL (factor 1,0, lo del lado de la seguridad).
// =============================================================================

/**
 * El grado de las viviendas: `superficie`, básica salvo con más de 160 m² o con
 * recarga en la unifamiliar; `elevada`, todas, por la calefacción eléctrica o
 * el aire acondicionado (o la secadora o la automatización) que se prevén.
 */
export type Electrificacion = "superficie" | "elevada";
/**
 * Recarga del vehículo eléctrico en el garaje comunitario: esquema colectivo con
 * el sistema de protección de la línea general de alimentación (SPL, factor 0,3),
 * o sin él (1,0, válido para cualquier esquema de la ITC-BT-52).
 */
export type Spl = "con_spl" | "sin_spl";

export type Opcion<T> = T | "habitual";

/**
 * La climatización eléctrica de las viviendas elevadas, para sus circuitos
 * (feature-34, K-REBT.35): la bomba de calor aire-aire (split o multisplit) va
 * en un C9; la aire-agua de calefacción, en un C8; los emisores eléctricos por
 * estancia (radiadores, suelo radiante), en C8 con sus tomas de la tabla 2.
 */
export type Climatizacion = "ninguna" | "aire_aire" | "aire_agua" | "emisores";

export type RebtEstado = {
  electrificacion: Opcion<Electrificacion>;
  /** Potencia del ascensor [kW]; null = la de la Guía BT-10 para el tipo habitual (supuesta). */
  ascensor_kW: number | null;
  /** Otros servicios generales [kW]: grupo de presión, central térmica, telecomunicaciones…; null = sin indicar. */
  otrosServicios_kW: number | null;
  spl: Opcion<Spl>;
  /** Plazas con previsión de recarga; null = el 10 % de las plazas (el mínimo del ap. 5.2). */
  plazasRecarga: number | null;
  /** Unifamiliar sin garaje: tiene plaza o zona prevista para un vehículo en la parcela (ITC-BT-52 ap. 3.1). */
  plazaParcela: boolean;
  /** Potencia del garaje con control de humo mecánico [kW] (ventiladores, alumbrado…); null = sin estudiar. */
  garaje_kW: number | null;

  // ── Para el anejo (feature-34): no cambian la previsión ────────────────────
  /** La climatización de las viviendas elevadas; «habitual» = aire-aire. */
  climatizacion?: Opcion<Climatizacion>;
  /** Secadora independiente (C10) en las viviendas elevadas. */
  secadora?: boolean;
  /** Automatización, gestión de la energía o seguridad (C11) en las viviendas elevadas. */
  automatizacion?: boolean;
  /** Longitud de la línea general de alimentación [m]; null = la estimada. */
  longitudLga_m?: number | null;
  /** Longitud de la derivación individual más larga de las viviendas [m]; null = las estimadas. */
  longitudDi_m?: number | null;
  /** Unifamiliar: la derivación individual va enterrada (CPM en el límite de la parcela). */
  diEnterrada?: boolean;
  /** Longitud del anillo de puesta a tierra [m]; null = el perímetro estimado. */
  perimetroTierra_m?: number | null;
  /** Resistividad del terreno [Ω·m]; null = supuesta, la peor de la ITC-BT-18 tabla 4. */
  resistividad_ohm_m?: number | null;
};

export const rebtEstadoDefaults: RebtEstado = {
  electrificacion: "habitual",
  ascensor_kW: null,
  otrosServicios_kW: null,
  spl: "habitual",
  plazasRecarga: null,
  plazaParcela: false,
  garaje_kW: null,
  climatizacion: "habitual",
  secadora: false,
  automatizacion: false,
  longitudLga_m: null,
  longitudDi_m: null,
  diEnterrada: false,
  perimetroTierra_m: null,
  resistividad_ohm_m: null,
};

export interface DecisionesRebt {
  electrificacion: Electrificacion;
  spl: Spl;
}

export const HABITUALES_REBT: DecisionesRebt = { electrificacion: "elevada", spl: "sin_spl" };

/** La climatización habitual de una vivienda elevada (criterio, K-REBT.35). */
export const CLIMATIZACION_HABITUAL: Climatizacion = "aire_aire";

function resolver<T>(v: Opcion<T> | undefined, h: T): T {
  return v === "habitual" || v === undefined ? h : v;
}

/** Los equipos de la vivienda que deciden sus circuitos: solo en la elevada por equipos. */
export interface EquiposVivienda {
  climatizacion: Climatizacion;
  secadora: boolean;
  automatizacion: boolean;
}

export function equiposDe(e: Partial<RebtEstado>, d: DecisionesRebt): EquiposVivienda {
  if (d.electrificacion !== "elevada") return { climatizacion: "ninguna", secadora: false, automatizacion: false };
  return {
    climatizacion: resolver(e.climatizacion, CLIMATIZACION_HABITUAL),
    secadora: e.secadora === true,
    automatizacion: e.automatizacion === true,
  };
}

export function resolverRebt(e: RebtEstado): DecisionesRebt {
  return {
    electrificacion: resolver(e.electrificacion, HABITUALES_REBT.electrificacion),
    spl: resolver(e.spl, HABITUALES_REBT.spl),
  };
}

/** Un número válido y no negativo, o null. */
export function noNegativo(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v >= 0 ? v : null;
}
