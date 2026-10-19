// =============================================================================
// Accesibilidad autonómica — La justificación (feature-36, paso 5). PURA y
// DETERMINISTA; no redacta.
//
// Solo Andalucía trae plantilla (decisión 7). Con el Decreto 293/2009 (K-MEM.14,
// 15 y 22):
//   - se aplica a los elementos de uso comunitario de las edificaciones de
//     vivienda que se construyen, reforman o cambian de uso (art. 2.1 j); el
//     interior de la vivienda libre no reservada no tiene exigencias;
//   - itinerarios accesibles del art. 104, que se justifican en la Ficha III
//     (sus medidas no están transcritas: la app no las imprime);
//   - comunicación vertical (art. 106.2): reserva de hueco o ascensor por plantas
//     sobre rasante y viviendas, frente a SUA 9 1.1.2; manda la más exigente
//     (INTERPRETACIÓN) y se avisa si no coinciden. Solo en plurifamiliares: la
//     unifamiliar no tiene elementos comunitarios ni le alcanza el art. 106
//     (validado por el usuario el 2026-10-19);
//   - reserva de viviendas en promoción protegida o pública (Ley 4/2017 art. 58.1;
//     Ficha IV), frente a las viviendas accesibles de SUA 9, que son las que la
//     cuentan (SUA 9 1.2.1 remite a la reglamentación aplicable);
//   - en un edificio existente, solo lo modificado (art. 2.1 j y 2.2), las ayudas
//     técnicas (106.6) y la imposibilidad motivada (DA 1.ª).
// En otra comunidad, la norma que declara el proyectista, sin comprobaciones.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { resumenEdificio } from "../../lib/edificio/derivar";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ComunidadAutonoma } from "../../data/comunidades";
import { comunidadDeObra, promocionDe } from "../../lib/proyecto/promocion";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { sua9EstadoDefaults, type Sua9Estado } from "../sua9/estado";
import { justificarSua9 } from "../sua9/justificacion";
import { texto, type AccEstado } from "./estado";
import { exigenciaVertical, viviendasReservadas, type ExigenciaVertical } from "./tablas";

export type DetalleAcc =
  | { clase: "norma"; comunidad: ComunidadAutonoma | undefined; andalucia: boolean; otra: string | undefined }
  | { clase: "itinerarios"; existente: boolean }
  | {
      clase: "ascensor";
      exigencia: ExigenciaVertical;
      plantas: number;
      viviendas: number;
      /** Ascensor en El edificio (o supuesto, si no se dice). */
      hay: boolean;
      supuesto: boolean;
      /** Lo que exige SUA 9 1.1.2. */
      sua9: "ascensor" | "prevision" | null;
      existente: boolean;
      garajeSotano: boolean;
    }
  | { clase: "reserva"; protegida: boolean | undefined; viviendas: number; reservadas: number; sr: number }
  | { clase: "existente"; imposibilidad: string | undefined }
  | { clase: "otros_usos" }
  | { clase: "unifamiliar" };

export type ElementoAcc = ElementoSi<DetalleAcc>;

export interface JustificacionAcc extends JustificacionSiBase {
  elementos: ElementoAcc[];
  comunidad: ComunidadAutonoma | undefined;
  andalucia: boolean;
  residencial: boolean;
  unifamiliar: boolean;
  existente: boolean;
}

export function justificarAcc(estado: Partial<AccEstado>, p: ProyectoSi): JustificacionAcc {
  const comunidad = comunidadDeObra(p.datosGenerales);
  const andalucia = comunidad === "andalucia";
  const r = resumenEdificio(p.edificio);
  const residencial = r.tieneViviendas;
  const unifamiliar = r.esUnifamiliar;
  const existente = p.datosGenerales.intervencion !== "obra_nueva";
  const otra = texto(estado.normaOtra);
  const elementos: ElementoAcc[] = [];
  const avisos: Aviso[] = [];
  const base = { comunidad, andalucia, residencial, unifamiliar, existente };

  // ── La norma ──────────────────────────────────────────────────────────────
  const declarada = andalucia || otra !== undefined;
  elementos.push({
    id: "norma",
    nombre: "Norma autonómica de accesibilidad",
    tipo: "norma",
    veredicto: declarada ? "dato" : "fail",
    valor: { texto: andalucia ? "Decreto 293/2009" : otra ?? (comunidad ? "sin declarar" : "sin municipio") },
    manda: { tipo: "dato_de_partida", fuente: andalucia ? "la comunidad autónoma, por el municipio de la obra" : "la norma que declara el proyectista" },
    cita: [andalucia ? "Decreto 293/2009 · art. 2" : "norma autonómica"],
    detalle: { clase: "norma", comunidad, andalucia, otra },
  });
  if (!andalucia) {
    const veredicto: Veredicto = declarada ? "ok" : "fail";
    return { ...base, elementos, avisos, veredicto };
  }

  if (!residencial) {
    elementos.push({
      id: "otros-usos",
      nombre: "Edificio de otros usos",
      tipo: "ambito",
      veredicto: "fuera",
      valor: { texto: "Ficha II" },
      manda: { tipo: "dato_de_partida", fuente: "Orden de 9-01-2012, Ficha II" },
      cita: ["Orden de 9-01-2012 · Ficha II"],
      detalle: { clase: "otros_usos" },
    });
    return { ...base, elementos, avisos, veredicto: "ok" };
  }

  // ── La unifamiliar: sin elementos comunitarios (art. 2.1 j) ───────────────
  if (unifamiliar) {
    elementos.push({
      id: "unifamiliar",
      nombre: "Vivienda unifamiliar",
      tipo: "ambito",
      veredicto: "dato",
      valor: { texto: "sin exigencias" },
      manda: { tipo: "dato_de_partida", fuente: "Decreto 293/2009, art. 2.1 j" },
      cita: ["Decreto 293/2009 · art. 2.1 j"],
      detalle: { clase: "unifamiliar" },
    });
    return { ...base, elementos, avisos, veredicto: "ok" };
  }

  // ── Los itinerarios (art. 104) ────────────────────────────────────────────
  elementos.push({
    id: "itinerarios",
    nombre: "Itinerarios accesibles comunitarios",
    tipo: "itinerario",
    veredicto: "dato",
    valor: { texto: "art. 104" },
    manda: { tipo: "dato_de_partida", fuente: "Decreto 293/2009, art. 104; Orden de 9-01-2012, Ficha III" },
    cita: ["Decreto 293/2009 · art. 104"],
    detalle: { clase: "itinerarios", existente },
  });

  // ── La comunicación vertical (art. 106) ───────────────────────────────────
  const promo = promocionDe(p.datosGenerales);
  const viviendas = r.numViviendas;
  const plantas = r.plantasSobreRasante;
  const exigencia = exigenciaVertical(plantas, viviendas);
  const sua9 = justificarSua9({ ...sua9EstadoDefaults, ...((p.justificaciones?.sua9?.inputs ?? {}) as Partial<Sua9Estado>) }, p);
  const sua9Exige = sua9.ascensor ? (sua9.ascensor.exigido ? "ascensor" : "prevision") : null;
  const supuesto = p.edificio.ascensor === undefined;
  const hay = supuesto ? exigencia === "ascensor" || sua9Exige === "ascensor" : p.edificio.ascensor === true;
  const garajeSotano = edificioSua(p.edificio).zonas.some((z) => z.clase === "garaje" && z.bajoRasante);
  const falla = !existente && exigencia === "ascensor" && !hay;
  elementos.push({
    id: "ascensor",
    nombre: "Comunicación vertical",
    tipo: "ascensor",
    veredicto: falla ? "fail" : existente ? "dato" : "ok",
    valor: { texto: exigencia === "ninguna" ? "no se exige" : hay ? "ascensor" : exigencia === "reserva" ? "reserva de hueco" : "falta el ascensor" },
    manda: { tipo: "altura_edificio", plantas, limite: 2 },
    cita: ["Decreto 293/2009 · art. 106"],
    detalle: { clase: "ascensor", exigencia, plantas, viviendas, hay, supuesto, sua9: sua9Exige, existente, garajeSotano },
  });
  if (sua9Exige !== null && exigencia !== "ninguna" && (exigencia === "ascensor") !== (sua9Exige === "ascensor")) {
    avisos.push({ id: exigencia === "ascensor" ? "manda-decreto" : "manda-sua9", tipo: "caso_especial", elementoId: "ascensor", datos: { exigencia, sua9: sua9Exige } });
  }

  // ── La reserva de viviendas (Ley 4/2017 art. 58.1; Ficha IV) ──────────────
  {
    const reservadas = promo.protegida === true ? viviendasReservadas(viviendas) : 0;
    const sr = sua9.viviendas.sr;
    elementos.push({
      id: "reserva",
      nombre: "Viviendas reservadas",
      tipo: "reserva",
      veredicto: promo.protegida === undefined || sr < reservadas ? "fail" : "ok",
      valor: promo.protegida === undefined ? { texto: "promoción sin declarar" } : { valor: reservadas, unidad: "viviendas" },
      limite: { valor: reservadas, unidad: "viviendas" },
      manda: { tipo: "dato_de_partida", fuente: "el régimen de la promoción (La obra) y las viviendas accesibles de SUA 9" },
      cita: ["Ley 4/2017 · art. 58.1", "Orden de 9-01-2012 · Ficha IV"],
      detalle: { clase: "reserva", protegida: promo.protegida, viviendas, reservadas, sr },
    });
    if (promo.protegida === true && viviendas < 17) avisos.push({ id: "reserva-menos-17", tipo: "supuesto", elementoId: "reserva", datos: { viviendas } });
  }

  // ── Edificio existente (art. 2.1 j, 2.2, 106.6 y DA 1.ª) ──────────────────
  if (existente) {
    elementos.push({
      id: "existente",
      nombre: "Edificio existente",
      tipo: "existente",
      veredicto: "dato",
      valor: { texto: texto(estado.imposibilidad) ? "con imposibilidad (DA 1.ª)" : "lo modificado" },
      manda: { tipo: "dato_de_partida", fuente: "Decreto 293/2009, arts. 2.1 j y 2.2, y DA 1.ª" },
      cita: ["Decreto 293/2009 · art. 2.1 j y 2.2", "DA 1.ª"],
      detalle: { clase: "existente", imposibilidad: texto(estado.imposibilidad) },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { ...base, elementos, avisos, veredicto };
}
