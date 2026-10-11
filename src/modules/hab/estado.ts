// =============================================================================
// Habitabilidad — Lo que guarda el módulo (feature-32): las estancias de cada
// vivienda, que El edificio no describe (por vivienda tipo; en la unifamiliar,
// la vivienda), y la superficie residencial para la densidad si el proyectista
// la declara. La norma no va aquí: es un dato de la obra
// (`DatosGenerales.habitabilidad`). Solo tipos y lo mínimo para leerlos.
// =============================================================================

import { COMPUTAN_HABITUAL, NOMBRE_TIPO_ESTANCIA, type TipoEstancia } from "../../lib/habitabilidad/norma";

/** Una estancia, con lo que se mide de su hueco [m²]. Lo que no se sabe, null. */
export interface EstanciaHab {
  id: string;
  nombre: string;
  tipo: TipoEstancia;
  util_m2: number | null;
  /** Hueco de fachada (el de la carpintería). */
  hueco_m2: number | null;
  /** Superficie acristalada, si la norma la mide. */
  acristalada_m2: number | null;
  /** Superficie practicable (de ventilación). */
  practicable_m2: number | null;
}

/** La clave de la vivienda de la unifamiliar en `estancias`. */
export const VIVIENDA_UNIFAMILIAR = "unifamiliar";

export type HabEstado = {
  /** Por vivienda: el id de la vivienda tipo o `VIVIENDA_UNIFAMILIAR`. */
  estancias: Record<string, EstanciaHab[]>;
  /** Superficie residencial que declara el proyectista para la densidad [m²]; null = la de El edificio. */
  superficieResidencial_m2: number | null;
  /** La misma, antes de la obra (obra existente). */
  superficieResidencialAntes_m2: number | null;
};

export const habEstadoDefaults: HabEstado = {
  estancias: {},
  superficieResidencial_m2: null,
  superficieResidencialAntes_m2: null,
};

/** Un número válido y positivo, o null. */
export function medida(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v > 0 ? v : null;
}

/** Las estancias guardadas de una vivienda, saneadas. */
export function estanciasDe(e: Partial<HabEstado> | undefined, viviendaId: string): EstanciaHab[] {
  const lista = e?.estancias?.[viviendaId];
  return Array.isArray(lista) ? lista.filter((x) => x && typeof x.id === "string") : [];
}

/**
 * Las estancias que se proponen para una vivienda: estar-comedor, cocina y un
 * dormitorio por cada uno del tipo, con los baños y aseos. Sin superficies: las
 * mete el proyectista (o las lee del cuadro de superficies).
 */
export function estanciasPropuestas(v: { dormitorios: number; banos: number; aseos: number }): EstanciaHab[] {
  const nueva = (id: string, tipo: TipoEstancia, nombre: string): EstanciaHab => ({
    id,
    nombre,
    tipo,
    util_m2: null,
    hueco_m2: null,
    acristalada_m2: null,
    practicable_m2: null,
  });
  const lista = [nueva("e1", "estar_comedor", NOMBRE_TIPO_ESTANCIA.estar_comedor), nueva("e2", "cocina", NOMBRE_TIPO_ESTANCIA.cocina)];
  const n = Math.max(0, Math.trunc(v.dormitorios));
  for (let i = 1; i <= n; i++) lista.push(nueva(`d${i}`, "dormitorio", n === 1 ? "Dormitorio" : i === 1 ? "Dormitorio principal" : `Dormitorio ${i}`));
  for (let i = 1; i <= Math.max(0, Math.trunc(v.banos)); i++) lista.push(nueva(`b${i}`, "bano", v.banos > 1 ? `Baño ${i}` : "Baño"));
  for (let i = 1; i <= Math.max(0, Math.trunc(v.aseos)); i++) lista.push(nueva(`a${i}`, "aseo", v.aseos > 1 ? `Aseo ${i}` : "Aseo"));
  return lista;
}

/** ¿Computa la estancia para alguna norma? Sin norma, las vivideras. */
export function computaHabitual(t: TipoEstancia): boolean {
  return COMPUTAN_HABITUAL.includes(t);
}
