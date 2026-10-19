// =============================================================================
// HE 2 · RITE — La justificación (feature-36, paso 4). PURA y DETERMINISTA; no
// redacta.
//
// La memoria de arquitectura no calcula cargas ni dimensiona: resume las
// instalaciones térmicas y remite al documento que exige el RITE por su potencia
// (K-MEM.4, 5 y 19). Aquí:
//   - la calefacción y la refrigeración que declara el proyectista, con sus
//     potencias nominales y los rendimientos del fabricante (sin mínimos: el RITE
//     remite al diseño ecológico);
//   - el ACS de HE 4 (sistema, producción, apoyo), con su potencia y acumulación;
//   - las instalaciones: una si la climatización y el ACS se producen igual
//     (individual o centralizada), dos si no. Su potencia es la mayor de la suma
//     de calor y la de frío (art. 15.1 «en generación de calor o frío»; 15.2, los
//     generadores necesarios para el servicio, sin la solar térmica); el ACS de la
//     misma máquina no se suma dos veces (INTERPRETACIÓN, K-MEM.4);
//   - el documento: menos de 5 kW, ninguno; de 5 a 70, memoria técnica; más de
//     70, proyecto. Sin alguna potencia, «sin declarar»;
//   - lo que se resume con cita: condiciones interiores (tabla 1.4.1.1), calidad
//     del aire por HS 3 en viviendas (IT 1.1.4.2.1), higiene con remisión a la
//     norma de legionela (IT 1.1.4.3), reparto de gastos (IT 1.2.4.4) y
//     recuperación de calor (IT 1.2.4.5.2, no alcanza a una vivienda:
//     INTERPRETACIÓN); en un cambio de uso, la idoneidad de lo existente (15.6).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { resumenEdificio } from "../../lib/edificio/derivar";
import { tiposDeObra } from "../../lib/proyecto/alcance";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { he4EstadoDefaults, resolverHe4, type DecisionesHe4, type He4Estado } from "../he4/estado";
import type { RebtEstado } from "../rebt/estado";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { positivo, resolverRite, type Calefaccion, type DecisionesRite, type ProduccionClima, type RiteEstado } from "./estado";
import { documentoExigible, type Documento } from "./tablas";

export type Servicio = "calefaccion" | "refrigeracion" | "acs";

export interface InstalacionRite {
  id: "unica" | "clima" | "acs";
  servicios: Servicio[];
  produccion: ProduccionClima;
  /** Suma de los generadores de calor [kW], sin la solar térmica. */
  calor_kW: number | null;
  frio_kW: number | null;
  /** La mayor de las dos; null si falta alguna potencia. */
  potencia_kW: number | null;
  documento: Documento | null;
  /** Las potencias que faltan. */
  faltan: Servicio[];
}

export interface AcsRite {
  he4: DecisionesHe4;
  scop: number | null;
  mismaMaquina: boolean;
  potencia_kW: number | null;
  acumulacion_l: number | null;
}

export type DetalleRite =
  | { clase: "calefaccion"; d: DecisionesRite; potencia_kW: number | null; scop: number | null }
  | { clase: "refrigeracion"; d: DecisionesRite; potencia_kW: number | null; seer: number | null }
  | { clase: "acs"; acs: AcsRite }
  | { clase: "documento"; instalacion: InstalacionRite; unifamiliar: boolean; residencial: boolean }
  | { clase: "condiciones" }
  | { clase: "aire"; residencial: boolean }
  | { clase: "higiene" }
  | { clase: "contabilizacion"; usuarios: number; reparto: boolean }
  | { clase: "recuperacion" }
  | { clase: "cambio_uso" };

export type ElementoRite = ElementoSi<DetalleRite>;

export interface JustificacionRite extends JustificacionSiBase {
  elementos: ElementoRite[];
  decisiones: DecisionesRite;
  habituales: DecisionesRite;
  acs: AcsRite;
  instalaciones: InstalacionRite[];
  unifamiliar: boolean;
  residencial: boolean;
  /** El ACS puede salir del generador de la calefacción (mismo tipo y misma producción). */
  puedeMismaMaquina: boolean;
}

/** ¿Puede el generador de calefacción producir también el ACS que declara HE 4? */
export function compatibleAcs(c: Calefaccion, h: DecisionesHe4): boolean {
  if (c === "aire_agua") return h.sistema === "bomba_calor" || (h.sistema === "solar" && h.apoyo === "bomba_calor");
  if (c === "biomasa") return h.sistema === "biomasa" || (h.sistema === "solar" && h.apoyo === "biomasa");
  if (c === "red") return h.sistema === "red";
  if (c === "caldera") return h.sistema === "solar" && h.apoyo === "convencional";
  return false;
}

/** Locales y oficinas: uno por zona y planta (usuarios de una instalación centralizada). */
function localesDe(p: ProyectoSi): number {
  let n = 0;
  for (const g of p.edificio.grupos) for (const z of g.zonas) if (z.uso === "local_sin_uso" || z.uso === "oficinas") n += g.repeticiones;
  return n;
}

function instalacion(id: InstalacionRite["id"], servicios: Servicio[], produccion: ProduccionClima, calor: (number | null)[], frio: (number | null)[], faltan: Servicio[]): InstalacionRite {
  const suma = (xs: (number | null)[]) => (xs.length === 0 ? 0 : xs.some((x) => x === null) ? null : xs.reduce<number>((a, x) => a + (x ?? 0), 0));
  const calor_kW = suma(calor);
  const frio_kW = suma(frio);
  const potencia_kW = faltan.length > 0 || calor_kW === null || frio_kW === null ? null : Math.round(Math.max(calor_kW, frio_kW) * 100) / 100;
  return { id, servicios, produccion, calor_kW, frio_kW, potencia_kW, documento: potencia_kW === null ? null : documentoExigible(potencia_kW), faltan };
}

export function justificarRite(estado: Partial<RiteEstado>, p: ProyectoSi): JustificacionRite {
  const r = resumenEdificio(p.edificio);
  const unifamiliar = r.esUnifamiliar;
  const residencial = r.tieneViviendas;
  const rebt = p.justificaciones?.rebt?.inputs as Partial<RebtEstado> | undefined;
  const { habituales, ...d } = resolverRite(estado, { unifamiliar, rebt });
  const he4Estado = { ...he4EstadoDefaults, ...((p.justificaciones?.he4?.inputs ?? {}) as Partial<He4Estado>) };
  const he4 = resolverHe4(he4Estado);
  const acsProduccion: ProduccionClima = unifamiliar ? "individual" : he4.produccion;
  const puedeMismaMaquina = compatibleAcs(d.calefaccion, he4) && acsProduccion === d.produccion;
  const acs: AcsRite = {
    he4,
    scop: positivo(he4Estado.scop),
    mismaMaquina: puedeMismaMaquina && estado.acsMismaMaquina === true,
    potencia_kW: positivo(estado.potenciaAcs_kW),
    acumulacion_l: positivo(estado.acumulacion_l),
  };
  const calor = d.calefaccion === "ninguna" ? null : positivo(estado.potenciaCalor_kW);
  const frio = d.refrigeracion === "ninguna" ? null : positivo(estado.potenciaFrio_kW);
  const avisos: Aviso[] = [];
  const elementos: ElementoRite[] = [];

  // ── Las instalaciones y su documento ──────────────────────────────────────
  const clima: { servicios: Servicio[]; calor: (number | null)[]; frio: (number | null)[]; faltan: Servicio[] } = { servicios: [], calor: [], frio: [], faltan: [] };
  if (d.calefaccion !== "ninguna") {
    clima.servicios.push("calefaccion");
    clima.calor.push(calor);
    if (calor === null) clima.faltan.push("calefaccion");
  }
  if (d.refrigeracion !== "ninguna") {
    clima.servicios.push("refrigeracion");
    clima.frio.push(frio);
    if (frio === null) clima.faltan.push("refrigeracion");
  }
  const acsCalor = acs.mismaMaquina ? [] : [acs.potencia_kW];
  const acsFalta: Servicio[] = !acs.mismaMaquina && acs.potencia_kW === null ? ["acs"] : [];
  const instalaciones: InstalacionRite[] =
    clima.servicios.length === 0
      ? [instalacion("acs", ["acs"], acsProduccion, acsCalor, [], acsFalta)]
      : acsProduccion === d.produccion
        ? [instalacion("unica", [...clima.servicios, "acs"], d.produccion, [...clima.calor, ...acsCalor], clima.frio, [...clima.faltan, ...acsFalta])]
        : [instalacion("clima", clima.servicios, d.produccion, clima.calor, clima.frio, clima.faltan), instalacion("acs", ["acs"], acsProduccion, acsCalor, [], acsFalta)];

  // ── Los servicios ─────────────────────────────────────────────────────────
  elementos.push({
    id: "calefaccion",
    nombre: "Calefacción",
    tipo: "servicio",
    veredicto: "dato",
    valor: d.calefaccion === "ninguna" ? { texto: "ninguna" } : calor === null ? { texto: "sin potencia" } : { valor: calor, unidad: "kW" },
    manda: { tipo: "decision_proyectista", decision: "calefacción" },
    cita: ["RITE · IT 1.2.3"],
    detalle: { clase: "calefaccion", d, potencia_kW: calor, scop: positivo(estado.scop) },
  });
  elementos.push({
    id: "refrigeracion",
    nombre: "Refrigeración",
    tipo: "servicio",
    veredicto: "dato",
    valor: d.refrigeracion === "ninguna" ? { texto: "ninguna" } : frio === null ? { texto: "sin potencia" } : { valor: frio, unidad: "kW" },
    manda: { tipo: "decision_proyectista", decision: "refrigeración" },
    cita: ["RITE · IT 1.2.3"],
    detalle: { clase: "refrigeracion", d, potencia_kW: frio, seer: positivo(estado.seer) },
  });
  elementos.push({
    id: "acs",
    nombre: "Agua caliente sanitaria",
    tipo: "servicio",
    veredicto: "dato",
    valor: acs.mismaMaquina ? { texto: "con la calefacción" } : acs.potencia_kW === null ? { texto: "sin potencia" } : { valor: acs.potencia_kW, unidad: "kW" },
    manda: { tipo: "dato_de_partida", fuente: "el sistema de ACS de HE 4" },
    cita: ["DB-HE · HE 4", "RITE · IT 1.2.3"],
    detalle: { clase: "acs", acs },
  });

  for (const inst of instalaciones) {
    elementos.push({
      id: `documento-${inst.id}`,
      nombre: instalaciones.length === 1 ? "Documento de la instalación" : inst.id === "acs" ? "Documento de la instalación de ACS" : "Documento de la climatización",
      tipo: "documento",
      veredicto: inst.potencia_kW === null ? "fail" : "dato",
      valor: inst.documento === null ? { texto: "falta la potencia" } : { texto: inst.documento === "proyecto" ? "proyecto" : inst.documento === "memoria" ? "memoria técnica" : "no preceptivo" },
      ...(inst.potencia_kW === null ? {} : { limite: { valor: inst.potencia_kW, unidad: "kW" } }),
      manda:
        inst.potencia_kW === null
          ? { tipo: "dato_de_partida", fuente: "las potencias nominales de los generadores, que declara el proyectista" }
          : { tipo: "decision_proyectista", decision: "documento" },
      cita: ["RITE · art. 15.1 y 15.2"],
      detalle: { clase: "documento", instalacion: inst, unifamiliar, residencial },
    });
  }

  // ── Lo que se resume con cita ─────────────────────────────────────────────
  elementos.push({
    id: "condiciones",
    nombre: "Condiciones interiores de diseño",
    tipo: "bienestar",
    veredicto: "dato",
    valor: { texto: "tabla 1.4.1.1" },
    manda: { tipo: "dato_de_partida", fuente: "RITE IT 1.1.4.1.2, tabla 1.4.1.1" },
    cita: ["RITE · IT 1.1.4.1.2 · tabla 1.4.1.1"],
    detalle: { clase: "condiciones" },
  });
  elementos.push({
    id: "aire",
    nombre: "Calidad del aire interior",
    tipo: "bienestar",
    veredicto: "dato",
    valor: { texto: residencial ? "por HS 3" : "documento RITE" },
    manda: { tipo: "dato_de_partida", fuente: residencial ? "RITE IT 1.1.4.2.1 y DB-HS 3" : "RITE IT 1.1.4.2" },
    cita: [residencial ? "RITE · IT 1.1.4.2.1" : "RITE · IT 1.1.4.2"],
    detalle: { clase: "aire", residencial },
  });
  elementos.push({
    id: "higiene",
    nombre: "Higiene",
    tipo: "bienestar",
    veredicto: "dato",
    valor: { texto: "legionelosis" },
    manda: { tipo: "dato_de_partida", fuente: "RITE IT 1.1.4.3" },
    cita: ["RITE · IT 1.1.4.3"],
    detalle: { clase: "higiene" },
  });
  const usuarios = unifamiliar ? 1 : r.numViviendas + localesDe(p);
  const reparto = instalaciones.some((i) => i.produccion === "centralizada") && usuarios > 1;
  elementos.push({
    id: "contabilizacion",
    nombre: "Contabilización de consumos",
    tipo: "eficiencia",
    veredicto: "dato",
    valor: { texto: reparto ? "reparto de gastos" : "un usuario por instalación" },
    manda: { tipo: "dato_de_partida", fuente: "RITE IT 1.2.4.4" },
    cita: ["RITE · IT 1.2.4.4"],
    detalle: { clase: "contabilizacion", usuarios, reparto },
  });
  if (residencial) {
    elementos.push({
      id: "recuperacion",
      nombre: "Recuperación de calor del aire expulsado",
      tipo: "eficiencia",
      veredicto: "dato",
      valor: { texto: "no se exige" },
      manda: { tipo: "dato_de_partida", fuente: "RITE IT 1.2.4.5.2" },
      cita: ["RITE · IT 1.2.4.5.2"],
      detalle: { clase: "recuperacion" },
    });
  }
  if (tiposDeObra(p.datosGenerales).includes("cambio_uso")) {
    elementos.push({
      id: "cambio-uso",
      nombre: "Cambio de uso",
      tipo: "existente",
      veredicto: "dato",
      valor: { texto: "idoneidad de lo existente" },
      manda: { tipo: "dato_de_partida", fuente: "RITE art. 15.6" },
      cita: ["RITE · art. 15.6"],
      detalle: { clase: "cambio_uso" },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales, acs, instalaciones, unifamiliar, residencial, puedeMismaMaquina };
}
