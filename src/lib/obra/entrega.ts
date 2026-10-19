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
import { estudioBasico, pendientesEstudioBasico, SIN_FIRMANTES } from "./estudioBasico";
import { UMBRAL_PEC, type ResultadoArt4 } from "../ebss/art4";
import { CLAVE_COHERENCIA, coherenciaPendiente, type EnlaceCoherencia } from "./coherencia";

/**
 * El estudio básico de seguridad y salud en «Antes de entregar» (feature-35,
 * paso 6): no es una justificación del CTE, pero sus pendientes van a la misma
 * lista, hacia su pantalla.
 */
export const CLAVE_SEGURIDAD_SALUD = "seguridadSalud";
export const RUTA_SEGURIDAD_SALUD = "seguridad-salud";
export const RUTA_ESTUDIO_BASICO = "estudio-basico";

export interface PendienteEntrega {
  /** Estable: `<clave>:<id>`. */
  id: string;
  /** La justificación, el estudio básico de seguridad y salud o la coherencia entre apartados. */
  key: JustificacionKey | typeof CLAVE_SEGURIDAD_SALUD | typeof CLAVE_COHERENCIA;
  codigo: string;
  /** Subruta del módulo, para ir a verlo. */
  ruta?: string;
  /** `no_cumple` va en rojo; `revisar`, en ámbar. */
  tipo: "no_cumple" | "revisar";
  titulo: string;
  detalle: string;
  elementoId?: string;
  /**
   * La coherencia entre apartados (feature-36, paso 6): los apartados que no
   * coinciden, para ir a cada uno; el aviso se marca como revisado aquí.
   */
  enlaces?: EnlaceCoherencia[];
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
  return [...fallos, ...avisos, ...pendientesCoherencia(p), ...sinPlanos(p, evs), ...pendientesSeguridadSaludEntrega(p)];
}

/** Los avisos de coherencia sin revisar, tras los de los módulos. */
function pendientesCoherencia(p: Proyecto): PendienteEntrega[] {
  return coherenciaPendiente(p).map((a) => ({
    id: `${CLAVE_COHERENCIA}:${a.id}`,
    key: CLAVE_COHERENCIA,
    codigo: "Coherencia",
    tipo: "revisar",
    titulo: a.titulo,
    detalle: a.detalle,
    enlaces: a.enlaces,
  }));
}

const euros = (v: number): string => `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** Los datos que «Antes de entregar» nombra uno a uno; el resto se cuenta en una línea. */
const DATOS_NOMBRADOS = new Set(["pem", "plazo", "trabajadores", "amianto", "centro"]);

/**
 * El estudio básico (feature-35, paso 6), solo si se ha empezado: sin
 * `seguridadSalud`, el proyecto no lo hace aquí y no se llena la lista. En
 * rojo, si se supera un supuesto del art. 4.1; en ámbar, el PEC cerca del
 * umbral, el PEM, el plazo, los trabajadores, el amianto, el centro
 * asistencial y las fichas redactadas por la app sin revisar, uno a uno, y lo
 * demás en una línea. Los firmantes no: son del estudio y ya tienen su aviso.
 */
function pendientesSeguridadSaludEntrega(p: Proyecto): PendienteEntrega[] {
  if (!p.seguridadSalud) return [];
  const base = { key: CLAVE_SEGURIDAD_SALUD, codigo: "Seguridad y salud", ruta: RUTA_SEGURIDAD_SALUD } as const;
  const e = estudioBasico(p);
  if (e.art4.resultado === "completo") {
    return [
      {
        id: `${CLAVE_SEGURIDAD_SALUD}:completo`,
        ...base,
        tipo: "no_cumple",
        titulo: "Hace falta el estudio de seguridad y salud completo.",
        detalle: e.pendientes[0] ?? "",
      },
    ];
  }
  const out: PendienteEntrega[] = [];
  const aviso = e.art4.avisoPec;
  if (aviso) {
    out.push({
      id: `${CLAVE_SEGURIDAD_SALUD}:pec-cerca`,
      ...base,
      tipo: "revisar",
      titulo: "El presupuesto de ejecución por contrata está cerca del umbral del art. 4.1 a).",
      detalle: `Le faltan ${euros(aviso.diferencia)} (un ${aviso.pct.toLocaleString("es-ES")} %) para ${euros(UMBRAL_PEC)}: si el presupuesto sube, hace falta el estudio completo.`,
    });
  }
  const pendientes = pendientesEstudioBasico(p).filter((d) => d.id !== "firmantes");
  for (const d of pendientes) {
    if (DATOS_NOMBRADOS.has(d.id)) {
      out.push({ id: `${CLAVE_SEGURIDAD_SALUD}:${d.id}`, ...base, tipo: "revisar", titulo: d.texto, detalle: "Se declara en la pantalla de seguridad y salud." });
    } else if (d.id.startsWith("ficha:")) {
      out.push({
        id: `${CLAVE_SEGURIDAD_SALUD}:${d.id}`,
        ...base,
        tipo: "revisar",
        titulo: d.texto,
        detalle: "La redacta la app para un hueco de los ejemplos: léela, ajústala y márcala como revisada.",
      });
    }
  }
  const resto = pendientes.filter((d) => !DATOS_NOMBRADOS.has(d.id) && !d.id.startsWith("ficha:"));
  if (resto.length > 0) {
    out.push({
      id: `${CLAVE_SEGURIDAD_SALUD}:resto`,
      ...base,
      tipo: "revisar",
      titulo: resto.length === 1 ? "Queda 1 cosa más por completar en el estudio básico." : `Quedan ${resto.length} cosas más por completar en el estudio básico.`,
      detalle: resto.map((d) => d.texto).join(" "),
    });
  }
  return out;
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
  /**
   * Estudio básico de seguridad y salud (feature-35): sus apartados, listos si
   * no les falta nada. Con `completo`, el básico no vale.
   */
  seguridadSalud: RecuentoEntregable & { resultado: ResultadoArt4; empezado: boolean };
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

function recuentoSeguridadSalud(p: Proyecto): Entregables["seguridadSalud"] {
  const e = estudioBasico(p);
  const sinPendientes = e.apartados.filter((a) => a.bloques.every((b) => b.tipo !== "pendiente" || b.texto === `Pendiente: ${SIN_FIRMANTES}`));
  return {
    listos: e.art4.resultado === "completo" ? 0 : sinPendientes.length,
    total: e.apartados.length,
    noCumplen: [],
    resultado: e.art4.resultado,
    empezado: p.seguridadSalud !== undefined,
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
    seguridadSalud: recuentoSeguridadSalud(p),
  };
}
