// =============================================================================
// «Antes de entregar» y el recuento de los entregables (feature-16 §C y §D).
// PURO.
//
// Antes de entregar: lo que no cumple primero y después los avisos sin
// revisar, cada uno con el código de su módulo y su texto, tal como los
// redacta el módulo. Los entregables cuentan lo que está listo: lo que no
// cumple no se da por bueno.
// =============================================================================

import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, type EvaluacionJustificacion } from "./evaluar";
import { anejoInstalaciones } from "./anejoInstalaciones";
import { INSTALACIONES_ANEJO } from "./remision";

export interface PendienteEntrega {
  /** Estable: `<clave>:<id>`. */
  id: string;
  key: JustificacionKey;
  codigo: string;
  /** Subruta del módulo, para ir a verlo. */
  ruta?: string;
  /** `no_cumple` va en rojo; `revisar`, en ámbar. */
  tipo: "no_cumple" | "revisar";
  titulo: string;
  detalle: string;
  elementoId?: string;
}

/** Lo que queda por mirar antes de entregar: lo que no cumple y luego los avisos. */
export function antesDeEntregar(p: Proyecto): PendienteEntrega[] {
  const evs = evaluarExpediente(p).justificaciones;
  const base = (ev: EvaluacionJustificacion) => ({
    key: ev.key,
    codigo: ev.entrada.codigo,
    ...(ev.entrada.route ? { ruta: ev.entrada.route } : {}),
  });
  const fallos = evs.flatMap((ev) =>
    ev.incumplimientos.map(
      (i): PendienteEntrega => ({ id: `${ev.key}:${i.id}`, ...base(ev), tipo: "no_cumple", titulo: i.titulo, detalle: i.detalle, ...(i.elementoId ? { elementoId: i.elementoId } : {}) }),
    ),
  );
  const avisos = evs.flatMap((ev) =>
    ev.avisos.map(
      (a): PendienteEntrega => ({ id: `${ev.key}:${a.id}`, ...base(ev), tipo: "revisar", titulo: a.titulo, detalle: a.detalle, ...(a.elementoId ? { elementoId: a.elementoId } : {}) }),
    ),
  );
  return [...fallos, ...avisos, ...sinPlanos(p, evs)];
}

/**
 * Las instalaciones del anejo sin planos declarados (feature-33): la memoria
 * remite al anejo, pero no a los planos. Se resuelve indicándolos en la
 * pantalla del módulo, en «Para el anejo».
 */
function sinPlanos(p: Proyecto, evs: readonly EvaluacionJustificacion[]): PendienteEntrega[] {
  const out: PendienteEntrega[] = [];
  for (const ins of INSTALACIONES_ANEJO) {
    const ev = evs.find((x) => x.key === ins.key);
    if (!ev || !LISTA.has(ev.estado) || !ev.calculado?.anejo || p.datosGenerales.planos?.[ins.key]?.trim()) continue;
    out.push({
      id: `${ins.key}:planos`,
      key: ins.key,
      codigo: ev.entrada.codigo,
      ...(ev.entrada.route ? { ruta: ev.entrada.route } : {}),
      tipo: "revisar",
      titulo: `Indica los planos de ${ins.titulo.toLowerCase()}.`,
      detalle: `La memoria remite al anejo ${ins.numero}; con los planos, remite también a ellos («Ver planos I05–I07»). Se indican en la pantalla de ${ev.entrada.codigo}, en «Para el anejo».`,
    });
  }
  return out;
}

/** Recuento de un entregable: cuántas piezas están listas y cuáles no cumplen. */
export interface RecuentoEntregable {
  listos: number;
  total: number;
  /** Códigos de lo que no cumple (o no calcula): «HE1». */
  noCumplen: string[];
}

export interface Entregables {
  /** Memoria CTE: los módulos que aplican más los «no aplica» con su párrafo. */
  memoria: RecuentoEntregable;
  /** Fichas del anejo: una por módulo calculado. */
  fichas: RecuentoEntregable;
  /** Esquemas para el plano (DXF): saneamiento (HS5) y fontanería (HS4). */
  esquemas: RecuentoEntregable & { claves: JustificacionKey[] };
  /**
   * Anejo de instalaciones (feature-33): fontanería, saneamiento y
   * electricidad. Listas, las desarrolladas y las que no aplican; la que aún
   * no se desarrolla no cuenta.
   */
  instalaciones: RecuentoEntregable;
}

/** Los módulos con esquema para el plano, en el orden en que se entregan. */
export const CLAVES_ESQUEMA: readonly JustificacionKey[] = ["hs5", "hs4"];

const CALCULADA = new Set(["cumple", "revisar", "no_cumple", "error"]);
const LISTA = new Set(["cumple", "revisar"]);

function recuento(evs: EvaluacionJustificacion[]): RecuentoEntregable {
  return {
    listos: evs.filter((ev) => LISTA.has(ev.estado) || ev.estado === "no_aplica").length,
    total: evs.length,
    noCumplen: evs.filter((ev) => ev.estado === "no_cumple" || ev.estado === "error").map((ev) => ev.entrada.codigo),
  };
}

function recuentoInstalaciones(p: Proyecto, evs: readonly EvaluacionJustificacion[]): RecuentoEntregable {
  const aps = anejoInstalaciones(p, evs).apartados;
  return {
    listos: aps.filter((a) => a.tipo === "calculado" || a.tipo === "no_aplica").length,
    total: aps.length,
    noCumplen: aps.filter((a) => a.tipo === "no_cumple").map((a) => a.codigo),
  };
}

export function entregables(p: Proyecto): Entregables {
  const evs = evaluarExpediente(p).justificaciones;
  const calculadas = evs.filter((ev) => CALCULADA.has(ev.estado));
  const esquemas = CLAVES_ESQUEMA.flatMap((k) => calculadas.filter((ev) => ev.key === k));
  return {
    memoria: recuento(evs.filter((ev) => CALCULADA.has(ev.estado) || ev.estado === "no_aplica")),
    fichas: recuento(calculadas),
    esquemas: { ...recuento(esquemas), claves: esquemas.filter((ev) => LISTA.has(ev.estado)).map((ev) => ev.key) },
    instalaciones: recuentoInstalaciones(p, evs),
  };
}
