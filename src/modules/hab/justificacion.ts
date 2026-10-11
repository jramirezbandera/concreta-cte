// =============================================================================
// Habitabilidad — La justificación (feature-32, PLAN-MEMORIA §5.5): con la norma
// que declara el proyectista, la iluminación, la ventilación y la superficie
// mínima de cada estancia que computa, y la densidad de viviendas. PURA y
// DETERMINISTA; no redacta.
//
// Lecturas:
//   - las viviendas son las del edificio que calcula el módulo: en obra
//     existente, las intervenidas (las que se crean o se reforman); por vivienda
//     tipo, o la vivienda en la unifamiliar;
//   - la exigencia de cada estancia es Su · f, con lo que mide la norma (hueco,
//     superficie acristalada o practicable); «conjunta»: el mismo hueco ilumina
//     y ventila con la fracción de la iluminación;
//   - sin dato no se cumple: una estancia sin su superficie o su hueco sale en
//     «Antes de entregar» con lo que falta;
//   - la densidad compara las viviendas del edificio entero con el máximo de la
//     norma; la superficie, la que declare el proyectista o la de las zonas de
//     vivienda de El edificio (la construida, o la útil si falta: menor, del lado
//     de la seguridad). En obra existente, también antes de la obra.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { resumenEdificio, viviendasEnZona } from "../../lib/edificio/derivar";
import type { Edificio, ViviendaTipo } from "../../lib/edificio/tipos";
import {
  MAX_NORMAS_OBRA,
  NOMBRE_AMBITO,
  viviendasMaximas,
  type MedidaIluminacion,
  type MedidaVentilacion,
  type NormaHabitabilidad,
  type TipoEstancia,
} from "../../lib/habitabilidad/norma";
import { edificioAntes } from "../../lib/proyecto/alcance";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { estanciasDe, medida, VIVIENDA_UNIFAMILIAR, type EstanciaHab, type HabEstado } from "./estado";

/** Una vivienda que se justifica: un tipo de la plurifamiliar o la unifamiliar. */
export interface ViviendaHab {
  id: string;
  /** «Vivienda tipo A», «Vivienda». */
  nombre: string;
  /** Para las etiquetas del dibujo: «A», «Vivienda». */
  corto: string;
  /** Cuántas hay de este tipo en lo que se calcula. */
  cantidad: number;
  dormitorios: number;
  banos: number;
  aseos: number;
  /** Superficie útil del tipo [m²], si El edificio la da. */
  util_m2: number | null;
  estancias: EstanciaHab[];
}

/** Una comprobación de hueco: lo exigido (Su · f) frente a lo medido. */
export interface ComprobacionHueco {
  fraccion: number;
  mide: MedidaIluminacion | MedidaVentilacion;
  exigido_m2: number | null;
  proyecto_m2: number | null;
  cumple: boolean;
}

/** Lo que le falta a una estancia para justificarse. */
export type FaltaEstancia = "util" | "hueco" | "acristalada" | "practicable";

export interface DensidadHab {
  m2PorVivienda: number;
  superficie: "construida" | "util";
  /** Superficie residencial [m²] y si la declaró el proyectista. */
  superficie_m2: number;
  declarada: boolean;
  /** Se tomó la útil de alguna zona por faltar la construida. */
  conUtil: boolean;
  viviendas: number;
  maximo: number;
  cumple: boolean;
  /** En obra existente, antes de la obra. */
  antes?: { superficie_m2: number; viviendas: number; maximo: number; declarada: boolean };
}

export type DetalleHab =
  | { clase: "sin_norma" }
  | { clase: "norma"; norma: NormaHabitabilidad; otroMunicipio: boolean }
  | { clase: "sin_estancias"; vivienda: ViviendaHab }
  | {
      clase: "estancia";
      norma: NormaHabitabilidad;
      vivienda: ViviendaHab;
      estancia: EstanciaHab;
      iluminacion: ComprobacionHueco;
      /** null si la ventilación es conjunta. */
      ventilacion: ComprobacionHueco | null;
      minima: { exigida_m2: number; cumple: boolean } | null;
      faltan: FaltaEstancia[];
    }
  | ({ clase: "densidad"; norma: NormaHabitabilidad } & DensidadHab);

export type ElementoHab = ElementoSi<DetalleHab>;

export interface JustificacionHab extends JustificacionSiBase {
  elementos: ElementoHab[];
  normas: NormaHabitabilidad[];
  viviendas: ViviendaHab[];
  /** Hay alguna vivienda que justificar. */
  aplica: boolean;
}

/** Las viviendas del edificio que se calcula: los tipos de sus zonas «viviendas» o la unifamiliar. */
export function viviendasDe(edificio: Edificio, estado: Partial<HabEstado>): ViviendaHab[] {
  const r = resumenEdificio(edificio);
  if (r.esUnifamiliar) {
    // La unifamiliar: los cuartos de todas sus zonas.
    let banos = 0;
    let aseos = 0;
    let util = 0;
    for (const g of edificio.grupos) {
      for (const z of g.zonas) {
        if (z.uso !== "vivienda_unifamiliar") continue;
        banos += (z.cuartos?.banos ?? 0) * g.repeticiones;
        aseos += (z.cuartos?.aseos ?? 0) * g.repeticiones;
        util += z.superficieUtil_m2 * g.repeticiones;
      }
    }
    const tipo = edificio.unidades.find((u): u is ViviendaTipo => u.clase === "vivienda");
    return [
      {
        id: VIVIENDA_UNIFAMILIAR,
        nombre: "Vivienda",
        corto: "Vivienda",
        cantidad: 1,
        dormitorios: tipo?.dormitorios ?? 0,
        banos: tipo?.banos ?? banos,
        aseos: tipo?.aseos ?? aseos,
        util_m2: util > 0 ? util : null,
        estancias: estanciasDe(estado, VIVIENDA_UNIFAMILIAR),
      },
    ];
  }
  const cantidades = new Map<string, number>();
  for (const g of edificio.grupos) {
    for (const z of g.zonas) {
      if (z.uso !== "viviendas") continue;
      for (const u of z.unidades ?? []) cantidades.set(u.tipoId, (cantidades.get(u.tipoId) ?? 0) + Math.max(0, Math.trunc(u.cantidad)) * g.repeticiones);
    }
  }
  return edificio.unidades
    .filter((u): u is ViviendaTipo => u.clase === "vivienda" && (cantidades.get(u.id) ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      nombre: `Vivienda tipo ${t.nombre}`,
      corto: `Tipo ${t.nombre}`,
      cantidad: cantidades.get(t.id) ?? 0,
      dormitorios: t.dormitorios,
      banos: t.banos,
      aseos: t.aseos,
      util_m2: t.superficieUtil_m2 > 0 ? t.superficieUtil_m2 : null,
      estancias: estanciasDe(estado, t.id),
    }));
}

/** Lo que mide la estancia para una comprobación. */
function medido(e: EstanciaHab, mide: MedidaIluminacion | MedidaVentilacion): number | null {
  if (mide === "acristalada") return medida(e.acristalada_m2);
  if (mide === "practicable") return medida(e.practicable_m2);
  return medida(e.hueco_m2);
}

const redondear = (v: number): number => Math.round(v * 100) / 100;

function comprobar(e: EstanciaHab, fraccion: number, mide: MedidaIluminacion | MedidaVentilacion): ComprobacionHueco {
  const su = medida(e.util_m2);
  const exigido_m2 = su === null ? null : redondear(su * fraccion);
  const proyecto_m2 = medido(e, mide);
  return { fraccion, mide, exigido_m2, proyecto_m2, cumple: exigido_m2 !== null && proyecto_m2 !== null && proyecto_m2 >= exigido_m2 - 1e-9 };
}

/** Superficie residencial y viviendas de un edificio entero (densidad). */
function residencial(e: Edificio, superficie: "construida" | "util"): { superficie_m2: number; viviendas: number; conUtil: boolean } {
  let s = 0;
  let conUtil = false;
  for (const g of e.grupos) {
    for (const z of g.zonas) {
      if (z.uso !== "viviendas" && z.uso !== "vivienda_unifamiliar") continue;
      let v = z.superficieUtil_m2;
      if (superficie === "construida") {
        if (z.superficieConstruida_m2 !== undefined && z.superficieConstruida_m2 > 0) v = z.superficieConstruida_m2;
        else conUtil = true;
      }
      s += v * g.repeticiones;
    }
  }
  const r = resumenEdificio(e);
  const viviendas = r.esUnifamiliar ? 1 : e.grupos.reduce((a, g) => a + g.zonas.reduce((b, z) => b + viviendasEnZona(e, z), 0) * g.repeticiones, 0);
  return { superficie_m2: redondear(s), viviendas: r.tieneViviendas ? viviendas : 0, conUtil };
}

function densidadDe(n: NormaHabitabilidad, estado: Partial<HabEstado>, p: ProyectoSi): DensidadHab | null {
  const d = n.densidad;
  if (!d) return null;
  const entero = p.existente?.edificio ?? p.edificio;
  const ahora = residencial(entero, d.superficie);
  const declarada = medida(estado.superficieResidencial_m2) ?? null;
  const superficie_m2 = declarada ?? ahora.superficie_m2;
  const maximo = viviendasMaximas(d, superficie_m2);
  const r: DensidadHab = {
    m2PorVivienda: d.m2PorVivienda,
    superficie: d.superficie,
    superficie_m2,
    declarada: declarada !== null,
    conUtil: declarada === null && ahora.conUtil,
    viviendas: ahora.viviendas,
    maximo,
    cumple: ahora.viviendas <= maximo,
  };
  if (p.existente) {
    const antes = residencial(edificioAntes(p.existente), d.superficie);
    const declaradaAntes = medida(estado.superficieResidencialAntes_m2) ?? null;
    const sAntes = declaradaAntes ?? antes.superficie_m2;
    r.antes = { superficie_m2: sAntes, viviendas: antes.viviendas, maximo: viviendasMaximas(d, sAntes), declarada: declaradaAntes !== null };
  }
  return r;
}

const CITA = (n: NormaHabitabilidad): string[] => [n.referencia];

export function justificarHab(estado: HabEstado, p: ProyectoSi): JustificacionHab {
  const elementos: ElementoHab[] = [];
  const avisos: Aviso[] = [];
  const normas = (p.datosGenerales.habitabilidad?.normas ?? []).slice(0, MAX_NORMAS_OBRA);
  const viviendas = viviendasDe(p.edificio, estado);
  const aplica = viviendas.length > 0;

  // ── La norma ──────────────────────────────────────────────────────────────
  if (normas.length === 0) {
    elementos.push({
      id: "norma",
      nombre: "Norma de habitabilidad",
      tipo: "norma",
      veredicto: "fail",
      valor: { texto: "sin declarar" },
      manda: { tipo: "dato_de_partida", fuente: "la norma de habitabilidad del municipio, que declara el proyectista" },
      cita: ["Los datos de la obra"],
      detalle: { clase: "sin_norma" },
    });
  }
  const ine = p.datosGenerales.municipioIne;
  for (const n of normas) {
    const otroMunicipio = n.municipioIne !== undefined && ine !== undefined && n.municipioIne !== ine;
    elementos.push({
      id: `norma-${n.id}`,
      nombre: NOMBRE_AMBITO[n.ambito],
      tipo: "norma",
      veredicto: "dato",
      valor: { texto: n.referencia },
      manda: { tipo: "dato_de_partida", fuente: "la declara el proyectista" },
      cita: CITA(n),
      detalle: { clase: "norma", norma: n, otroMunicipio },
    });
    if (otroMunicipio) avisos.push({ id: `municipio-${n.id}`, tipo: "caso_especial", elementoId: `norma-${n.id}`, datos: { referencia: n.referencia, municipio: n.municipio ?? "", obra: p.datosGenerales.municipio } });
  }

  // ── Las estancias de cada vivienda ────────────────────────────────────────
  for (const v of viviendas) {
    if (v.estancias.length === 0) {
      elementos.push({
        id: `viv-${v.id}`,
        nombre: v.nombre,
        tipo: "vivienda",
        veredicto: "fail",
        valor: { texto: "sin estancias" },
        manda: { tipo: "dato_de_partida", fuente: "las estancias de la vivienda, con su superficie y sus huecos" },
        cita: normas.flatMap(CITA),
        detalle: { clase: "sin_estancias", vivienda: v },
      });
      continue;
    }
    // Coherencia con El edificio (un dato, una fuente).
    const dormitorios = v.estancias.filter((e) => e.tipo === "dormitorio").length;
    if (v.dormitorios > 0 && dormitorios !== v.dormitorios) {
      avisos.push({ id: `dormitorios-${v.id}`, tipo: "caso_especial", datos: { vivienda: v.nombre, estancias: dormitorios, edificio: v.dormitorios } });
    }
    const suma = v.estancias.reduce((a, e) => a + (medida(e.util_m2) ?? 0), 0);
    if (v.util_m2 !== null && suma > v.util_m2 + 0.5) {
      avisos.push({ id: `util-${v.id}`, tipo: "caso_especial", datos: { vivienda: v.nombre, suma: redondear(suma), edificio: v.util_m2 } });
    }
    for (const n of normas) {
      for (const e of v.estancias) {
        if (!n.computan.includes(e.tipo)) continue;
        const iluminacion = comprobar(e, n.iluminacion.fraccion, n.iluminacion.mide);
        const ventilacion = n.ventilacion === "conjunta" ? null : comprobar(e, n.ventilacion.fraccion, n.ventilacion.mide);
        const min = n.superficieMinima?.[e.tipo as TipoEstancia];
        const su = medida(e.util_m2);
        const minima = min !== undefined ? { exigida_m2: min, cumple: su !== null && su >= min - 1e-9 } : null;
        const faltan: FaltaEstancia[] = [];
        if (su === null) faltan.push("util");
        if (iluminacion.proyecto_m2 === null) faltan.push(n.iluminacion.mide);
        if (ventilacion && ventilacion.proyecto_m2 === null && !faltan.includes(ventilacion.mide as FaltaEstancia)) faltan.push(ventilacion.mide as FaltaEstancia);
        const cumple = iluminacion.cumple && (ventilacion?.cumple ?? true) && (minima?.cumple ?? true);
        elementos.push({
          id: `${n.id}|${v.id}|${e.id}`,
          nombre: `${e.nombre} · ${v.nombre}`,
          tipo: "estancia",
          veredicto: cumple ? "ok" : "fail",
          valor: iluminacion.proyecto_m2 !== null ? { valor: iluminacion.proyecto_m2, unidad: "m²" } : { texto: "sin dato" },
          ...(iluminacion.exigido_m2 !== null ? { limite: { valor: iluminacion.exigido_m2, unidad: "m²" } } : {}),
          manda: {
            tipo: "formula",
            formula: `Su · ${n.iluminacion.fraccion}`,
            resultado: { valor: iluminacion.exigido_m2 ?? 0, unidad: "m²" },
          },
          ...(iluminacion.exigido_m2 !== null && iluminacion.proyecto_m2 ? { uso: Math.min(9.99, iluminacion.exigido_m2 / iluminacion.proyecto_m2) } : {}),
          cita: CITA(n),
          detalle: { clase: "estancia", norma: n, vivienda: v, estancia: e, iluminacion, ventilacion, minima, faltan },
        });
      }
    }
  }

  // ── La densidad ───────────────────────────────────────────────────────────
  for (const n of normas) {
    const d = densidadDe(n, estado, p);
    if (!d) continue;
    elementos.push({
      id: `${n.id}|densidad`,
      nombre: "Densidad de viviendas",
      tipo: "densidad",
      veredicto: d.cumple ? "ok" : "fail",
      valor: { valor: d.viviendas, unidad: "viviendas" },
      limite: { valor: d.maximo, unidad: "viviendas" },
      manda: { tipo: "formula", formula: `S / ${d.m2PorVivienda} m²`, resultado: { valor: d.maximo, unidad: "viviendas" } },
      cita: [n.densidad?.referencia ? `${n.referencia}, ${n.densidad.referencia}` : n.referencia],
      detalle: { clase: "densidad", norma: n, ...d },
    });
    if (!d.declarada) avisos.push({ id: `superficie-${n.id}`, tipo: "supuesto", elementoId: `${n.id}|densidad`, datos: { conUtil: d.conUtil, superficie: d.superficie } });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, normas, viviendas, aplica };
}
