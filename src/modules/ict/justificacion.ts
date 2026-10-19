// =============================================================================
// ICT — La justificación (feature-36, paso 3). PURA y DETERMINISTA; no redacta.
//
// El proyecto técnico de ICT es de otro técnico: diseña y dimensiona la
// infraestructura. Lo que da aquí la app es la ficha de previsiones del
// proyecto de arquitectura (K-MEM.8 y 21), con las cifras del Anexo III:
//   - el régimen de propiedad horizontal, que declara el proyectista en La obra
//     (no se deduce del número de viviendas); sin él, «sin declarar»;
//   - los PAU: las viviendas de El edificio, más los locales y oficinas (uno por
//     zona y planta, o los que diga el proyectista) y las estancias comunes;
//   - el recinto, que elige el proyectista: RITU en su ámbito, si no RITI + RITS
//     (lo habitual). La regla de elección del ap. 4.5 no está transcrita: solo se
//     comprueba que el RITU y el RITU-A no se salen de su ámbito (4.5.3);
//   - arqueta de entrada, canalización externa y principal, RTR, por PAU;
//   - los registros de toma de cada vivienda tipo (5.13), con las estancias de
//     habitabilidad o, sin ellas, las deducidas del tipo (aviso);
//   - la remisión al proyecto técnico (autor y fecha, si se declaran).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { resumenEdificio } from "../../lib/edificio/derivar";
import { promocionDe } from "../../lib/proyecto/promocion";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { estanciasPropuestas, type EstanciaHab, type HabEstado } from "../hab/estado";
import { viviendasDe } from "../hab/justificacion";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { cuenta, resolverRecinto, texto, type IctEstado } from "./estado";
import {
  arquetaEntrada,
  medidasRecinto,
  recintoAdmitido,
  TOMAS_ICT,
  tubosExternos,
  tubosPrincipal,
  type Medidas,
  type RecintoIct,
} from "./tablas";

/** Los registros de toma de una vivienda (5.13). */
export interface TomasVivienda {
  estancias: number;
  paresTrenzados: number;
  coaxial: number;
  rtv: number;
  fibra: number;
  configurable: number;
}

export type DetalleIct =
  | { clase: "regimen"; propiedadHorizontal: boolean | undefined }
  | { clase: "pau"; viviendas: number; locales: number; localesDeclarados: boolean; comunes: number; total: number }
  | { clase: "recinto"; recinto: RecintoIct; habitual: RecintoIct; admitido: boolean; medidas: Medidas | undefined; plantas: number; pau: number }
  | { clase: "arqueta"; medidas: Medidas | undefined; pau: number }
  | { clase: "canalizacion_externa"; tubos: number; pau: number }
  | { clase: "canalizacion_principal"; tubos: number | undefined; pau: number }
  | { clase: "rtr"; cuantos: number }
  | {
      clase: "tomas";
      viviendaId: string;
      nombre: string;
      cantidad: number;
      /** Las estancias salen de Habitabilidad; si no, del tipo de El edificio. */
      deHabitabilidad: boolean;
      tomas: TomasVivienda;
    }
  | { clase: "proyecto"; autor?: string; fecha?: string; integral: boolean };

export type ElementoIct = ElementoSi<DetalleIct>;

export interface JustificacionIct extends JustificacionSiBase {
  elementos: ElementoIct[];
  propiedadHorizontal: boolean | undefined;
  pau: number;
  recinto: RecintoIct;
  recintoHabitual: RecintoIct;
  plantasSobreRasante: number;
  unifamiliar: boolean;
}

const T = TOMAS_ICT.datos;

/** Las estancias que llevan registros de toma: todas menos baños, aseos y pasillos (5.13: «sin baños ni trasteros»). */
export function estanciaConTomas(e: EstanciaHab): boolean {
  return e.tipo !== "bano" && e.tipo !== "aseo" && e.tipo !== "pasillo";
}

/** Los registros de toma de una vivienda con n estancias (5.13). */
export function tomasVivienda(n: number): TomasVivienda {
  const principales = Math.min(n, T.principales);
  const resto = Math.max(0, n - principales);
  return {
    estancias: n,
    paresTrenzados: principales * T.porPrincipal.paresTrenzados + resto * T.porResto.paresTrenzados,
    coaxial: principales * T.porPrincipal.coaxial,
    rtv: principales * T.porPrincipal.rtv + resto * T.porResto.rtv,
    fibra: principales > 0 ? T.fibraEnPrincipales : 0,
    configurable: T.configurableJuntoPau,
  };
}

/** Locales y oficinas de El edificio: uno por zona y planta. */
function localesDe(p: ProyectoSi): number {
  let n = 0;
  for (const g of p.edificio.grupos) for (const z of g.zonas) if (z.uso === "local_sin_uso" || z.uso === "oficinas") n += g.repeticiones;
  return n;
}

/** Lo habitual: el RITU en su ámbito; si no, RITI + RITS. */
export function recintoHabitual(pau: number, plantas: number): RecintoIct {
  return recintoAdmitido("ritu", pau, plantas) ? "ritu" : "riti_rits";
}

export function justificarIct(estado: Partial<IctEstado>, p: ProyectoSi): JustificacionIct {
  const r = resumenEdificio(p.edificio);
  const ph = promocionDe(p.datosGenerales).propiedadHorizontal;
  const elementos: ElementoIct[] = [];
  const avisos: Aviso[] = [];

  // ── El régimen ────────────────────────────────────────────────────────────
  elementos.push({
    id: "regimen",
    nombre: "Régimen de propiedad horizontal",
    tipo: "regimen",
    veredicto: ph === undefined ? "fail" : "dato",
    valor: { texto: ph === undefined ? "sin declarar" : ph ? "propiedad horizontal" : "sin propiedad horizontal" },
    manda: { tipo: "dato_de_partida", fuente: "el régimen de la promoción, que declara el proyectista en La obra" },
    cita: ["RD-ley 1/1998 · art. 2"],
    detalle: { clase: "regimen", propiedadHorizontal: ph },
  });

  // ── Los PAU ───────────────────────────────────────────────────────────────
  const viviendas = r.esUnifamiliar ? (r.tieneViviendas ? 1 : 0) : r.numViviendas;
  const localesDeclarados = cuenta(estado.pauLocales);
  const locales = localesDeclarados ?? localesDe(p);
  const comunes = cuenta(estado.pauComunes) ?? 0;
  const pau = viviendas + locales + comunes;
  elementos.push({
    id: "pau",
    nombre: "Puntos de acceso al usuario (PAU)",
    tipo: "pau",
    veredicto: "dato",
    valor: { valor: pau, unidad: "PAU" },
    manda: { tipo: "dato_de_partida", fuente: "las viviendas de El edificio, los locales y oficinas y las estancias comunes" },
    cita: ["RD 346/2011 · Anexo III"],
    detalle: { clase: "pau", viviendas, locales, localesDeclarados: localesDeclarados !== null, comunes, total: pau },
  });

  // ── El recinto ────────────────────────────────────────────────────────────
  const plantas = r.plantasSobreRasante;
  const habitual = recintoHabitual(pau, plantas);
  const recinto = resolverRecinto(estado, habitual);
  const admitido = recintoAdmitido(recinto, pau, plantas);
  const conComunes = edificioSua(p.edificio).zonas.some((z) => z.clase === "comun");
  const medidas = medidasRecinto(recinto, pau, conComunes);
  elementos.push({
    id: "recinto",
    nombre: recinto === "riti_rits" ? "Recintos RITI y RITS" : recinto === "ritu" ? "Recinto RITU" : "Recinto RITU-A",
    tipo: "recinto",
    veredicto: admitido ? "ok" : "fail",
    valor: { texto: recinto === "riti_rits" ? "RITI + RITS" : recinto === "ritu" ? "RITU" : "RITU-A" },
    manda: { tipo: "decision_proyectista", decision: "recinto" },
    cita: ["RD 346/2011 · Anexo III 4.5.3", "Anexo III 5.5"],
    detalle: { clase: "recinto", recinto, habitual, admitido, medidas, plantas, pau },
  });

  // ── Arqueta y canalizaciones ──────────────────────────────────────────────
  elementos.push({
    id: "arqueta",
    nombre: "Arqueta de entrada",
    tipo: "arqueta",
    veredicto: "dato",
    valor: { texto: arquetaEntrada(pau) ? "mínima" : "proyecto técnico" },
    manda: { tipo: "dato_de_partida", fuente: "RD 346/2011, Anexo III, 5.1" },
    cita: ["RD 346/2011 · Anexo III 5.1"],
    detalle: { clase: "arqueta", medidas: arquetaEntrada(pau), pau },
  });
  elementos.push({
    id: "canalizacion-externa",
    nombre: "Canalización externa",
    tipo: "canalizacion",
    veredicto: "dato",
    valor: { valor: tubosExternos(pau), unidad: "tubos" },
    manda: { tipo: "dato_de_partida", fuente: "RD 346/2011, Anexo III, 5.2" },
    cita: ["RD 346/2011 · Anexo III 5.2"],
    detalle: { clase: "canalizacion_externa", tubos: tubosExternos(pau), pau },
  });
  if (!r.esUnifamiliar) {
    const tubos = tubosPrincipal(pau);
    elementos.push({
      id: "canalizacion-principal",
      nombre: "Canalización principal",
      tipo: "canalizacion",
      veredicto: "dato",
      valor: tubos === undefined ? { texto: "cálculo específico" } : { valor: tubos, unidad: "tubos" },
      manda: { tipo: "dato_de_partida", fuente: "RD 346/2011, Anexo III, 5.7" },
      cita: ["RD 346/2011 · Anexo III 5.7"],
      detalle: { clase: "canalizacion_principal", tubos, pau },
    });
  }

  // ── El RTR ────────────────────────────────────────────────────────────────
  elementos.push({
    id: "rtr",
    nombre: "Registro de terminación de red (RTR)",
    tipo: "rtr",
    veredicto: "dato",
    valor: { valor: pau, unidad: "RTR" },
    manda: { tipo: "dato_de_partida", fuente: "RD 346/2011, Anexo III, 5.11" },
    cita: ["RD 346/2011 · Anexo III 5.11"],
    detalle: { clase: "rtr", cuantos: pau },
  });

  // ── Los registros de toma, por vivienda tipo ──────────────────────────────
  const hab = p.justificaciones?.hab?.inputs as Partial<HabEstado> | undefined;
  for (const v of r.tieneViviendas ? viviendasDe(p.edificio, hab ?? {}) : []) {
    const deHabitabilidad = v.estancias.length > 0;
    const estancias = (deHabitabilidad ? v.estancias : estanciasPropuestas(v)).filter(estanciaConTomas);
    const tomas = tomasVivienda(estancias.length);
    const id = `tomas-${v.id}`;
    elementos.push({
      id,
      nombre: r.esUnifamiliar ? "Registros de toma de la vivienda" : `Registros de toma · ${v.corto}`,
      tipo: "tomas",
      veredicto: "dato",
      valor: { valor: tomas.paresTrenzados + tomas.coaxial + tomas.rtv + tomas.configurable, unidad: "registros" },
      manda: { tipo: "dato_de_partida", fuente: "RD 346/2011, Anexo III, 5.13" },
      cita: ["RD 346/2011 · Anexo III 5.13"],
      detalle: { clase: "tomas", viviendaId: v.id, nombre: v.nombre, cantidad: v.cantidad, deHabitabilidad, tomas },
    });
    if (!deHabitabilidad) avisos.push({ id: `estancias-${v.id}`, tipo: "supuesto", elementoId: id, datos: { vivienda: v.nombre } });
  }

  // ── El proyecto técnico ───────────────────────────────────────────────────
  const autor = texto(estado.proyectoAutor);
  const fecha = texto(estado.proyectoFecha);
  elementos.push({
    id: "proyecto",
    nombre: "Proyecto técnico de ICT",
    tipo: "proyecto",
    veredicto: "previsto",
    valor: { texto: autor ?? "se une al proyecto" },
    manda: { tipo: "decision_proyectista", decision: "remisión" },
    cita: ["RD-ley 1/1998 · art. 3.1", "RD 346/2011 · art. 9"],
    detalle: { clase: "proyecto", ...(autor ? { autor } : {}), ...(fecha ? { fecha } : {}), integral: p.datosGenerales.intervencion !== "obra_nueva" },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, propiedadHorizontal: ph, pau, recinto, recintoHabitual: habitual, plantasSobreRasante: plantas, unifamiliar: r.esUnifamiliar };
}
