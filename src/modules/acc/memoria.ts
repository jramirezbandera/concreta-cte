// =============================================================================
// Accesibilidad autonómica — La memoria redactada (feature-36, paso 5). PURA.
//
// En Andalucía, el ámbito del Decreto 293/2009 con su motivo, los itinerarios del
// art. 104 y la tabla «Parámetro | DB-SUA 9 | Decreto | Proyecto» (el contenido de
// la Ficha III y la IV en lo verificado), y en un edificio existente, lo
// modificado y la DA 1.ª. En otra comunidad, la remisión a la norma declarada.
// =============================================================================

import { NOMBRE_COMUNIDAD } from "../../data/comunidades";
import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { lista } from "../sua/colocar";
import type { DetalleAcc, JustificacionAcc } from "./justificacion";
import { CITA_D293, ITINERARIOS_D293 } from "./tablas";
import { NOMBRE_EXIGENCIA } from "./textos";

function detalle<C extends DetalleAcc["clase"]>(j: JustificacionAcc, c: C): Extract<DetalleAcc, { clase: C }> | undefined {
  return j.elementos.find((e) => e.detalle.clase === c)?.detalle as Extract<DetalleAcc, { clase: C }> | undefined;
}

function tabla(j: JustificacionAcc, tras: number): TablaMemoria | undefined {
  const asc = detalle(j, "ascensor");
  const res = detalle(j, "reserva");
  if (!asc) return undefined;
  const filas: string[][] = [];
  const decretoMas = asc.exigencia === "ascensor" && asc.sua9 !== "ascensor";
  const suaMas = asc.sua9 === "ascensor" && asc.exigencia !== "ascensor";
  filas.push([
    "Comunicación vertical",
    asc.sua9 === null ? "—" : `${asc.sua9 === "ascensor" ? "ascensor accesible" : "previsión de ascensor"}${suaMas ? " (1)" : ""}`,
    `${NOMBRE_EXIGENCIA[asc.exigencia]}${decretoMas ? " (1)" : ""}`,
    asc.hay ? "ascensor" : asc.exigencia === "reserva" || asc.sua9 === "prevision" ? "reserva de hueco" : "—",
  ]);
  if (res && res.protegida !== undefined) {
    filas.push(["Viviendas reservadas para personas con movilidad reducida", "las de la reglamentación aplicable (1.2.1)", res.protegida ? String(res.reservadas) : "no se exige (promoción libre)", String(res.sr)]);
  }
  return {
    rotulo: "Comunicación vertical y viviendas reservadas",
    cabecera: ["Parámetro", "DB-SUA 9", "Decreto 293/2009", "Proyecto"],
    columnas: ["texto", "norma", "norma", "proyecto"],
    filas,
    ...(decretoMas || suaMas ? { notas: ["La más exigente, que es la que se cumple: ninguna de las dos normas fija cuál prevalece (interpretación)."] } : {}),
    tras,
  };
}

export function memoriaAcc(j: JustificacionAcc): MemoriaDoc {
  const parrafos: Trozo[][] = [];
  const norma = detalle(j, "norma")!;
  if (!j.andalucia) {
    parrafos.push([
      norma.otra
        ? `La accesibilidad se justifica con ${norma.otra}${j.comunidad ? `, norma de ${NOMBRE_COMUNIDAD[j.comunidad]}` : ""}, en las fichas que esa norma exige, que acompañan al proyecto. Las condiciones del DB-SUA 9 se justifican en su apartado.`
        : "Falta declarar la norma autonómica de accesibilidad.",
    ]);
    return { titulo: "Accesibilidad", norma: "Accesibilidad", parrafos, fuente: norma.otra ?? "" };
  }

  if (!j.residencial) {
    parrafos.push([`El edificio no es de viviendas: la accesibilidad conforme al ${CITA_D293} se justifica con la Ficha II de la Orden de 9 de enero de 2012, que acompaña al proyecto.`]);
    return { titulo: "Accesibilidad", norma: "Accesibilidad", parrafos, fuente: "Decreto 293/2009 · Orden de 9-01-2012, Ficha II" };
  }

  const asc = detalle(j, "ascensor");
  if (j.unifamiliar) {
    parrafos.push([
      `El Reglamento de accesibilidad de Andalucía, aprobado por el ${CITA_D293}, se aplica a los elementos de uso comunitario de las edificaciones de vivienda (art. 2.1 j). La vivienda unifamiliar no los tiene y su interior, como vivienda libre no reservada para personas con movilidad reducida, no tiene exigencias.`,
    ]);
  } else {
    parrafos.push([
      `Es de aplicación el Reglamento de accesibilidad de Andalucía, aprobado por el ${CITA_D293}, a los espacios, instalaciones y elementos de uso comunitario del edificio${j.existente ? " que se construyen, reforman o cambian de uso" : ""} (art. 2.1 j). El interior de las viviendas libres no reservadas para personas con movilidad reducida no tiene exigencias.`,
    ]);
    parrafos.push([
      `Se disponen itinerarios accesibles ${lista([...ITINERARIOS_D293.datos.tramos])} (art. 104), con las condiciones que se justifican en la Ficha III de la Orden de 9 de enero de 2012.`,
      asc && asc.exigencia === "ascensor" && asc.garajeSotano ? " El ascensor llega a las plantas de aparcamiento bajo rasante (art. 106.4)." : "",
    ]);
  }
  const tras = parrafos.length;

  const ex = detalle(j, "existente");
  if (ex) {
    parrafos.push([
      "En la reforma de los espacios e instalaciones comunitarias, el Reglamento se aplica solo a los elementos o partes que se modifican (arts. 2.1 j y 2.2).",
      ex.imposibilidad
        ? ` Conforme a la disposición adicional primera, no es posible cumplir íntegramente lo siguiente: ${ex.imposibilidad.replace(/\.$/, "")}. Se mejoran las condiciones existentes con las ayudas técnicas que se describen (arts. 75 y 106.6).`
        : "",
    ]);
  }
  return {
    titulo: "Accesibilidad",
    norma: "Accesibilidad",
    parrafos,
    tablas: soloTablas(tabla(j, tras)),
    fuente: ["Decreto 293/2009 (BOJA 140/2009)", "Ley 4/2017, art. 58.1", "Orden de 9-01-2012, fichas III y IV", "datos de El edificio y de La obra"].join(" · "),
  };
}
