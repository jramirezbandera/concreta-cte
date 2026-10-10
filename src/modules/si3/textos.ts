// =============================================================================
// DB-SI, SI 3 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas, los avisos, lo que no cumple y la
// memoria. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion, MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { NO_SE_EXIGE, tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { USOS } from "../../lib/edificio/usos";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { TextoSi } from "../si/definicion";
import type { UsoSi } from "../si/edificio";
import { m2 } from "../si/textos";
import type { ElementoSi } from "../si/tipos";
import { proteccionSuficiente, type DetalleSi3, type ElementoSi3, type JustificacionSi3, type OcupacionZona } from "./justificacion";
import { DISCAPACIDAD_SI3, HUMO_SI3, PROTECCION_TABLA_5_1, SALIDAS_TABLA_3_1, type ProteccionEscalera } from "./tablas";

const H = HUMO_SI3.datos;

function det(el: ElementoSi<unknown>): DetalleSi3 {
  return (el as ElementoSi3).detalle;
}

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

export const NOMBRE_ESCALERA: Record<ProteccionEscalera, string> = {
  no_protegida: "no protegida",
  compartimentada: "compartimentada",
  protegida: "protegida",
  especialmente_protegida: "especialmente protegida",
};

function personas(n: number): string {
  return `${n} ${n === 1 ? "persona" : "personas"}`;
}

/** «desde la puerta de la vivienda más alejada hasta la salida del edificio». */
export function tramoRecorrido(d: Extract<DetalleSi3, { clase: "salidas" }>): string {
  return `desde la puerta ${d.residencial ? "de la vivienda" : "del recinto"} más alejada hasta ${d.hastaEdificio ? "la salida del edificio, bajando por la escalera" : "la escalera (salida de planta)"}`;
}

// -----------------------------------------------------------------------------
// La cabecera
// -----------------------------------------------------------------------------

export function fraseSi3(j: JustificacionSi3): string {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  if (oc.unifamiliar) return "Vivienda unifamiliar: su interior no es origen de evacuación, así que no hay recorridos que limitar ni escaleras que proteger.";
  const partes: string[] = [`${personas(oc.total)}`];
  const esc = j.elementos.find((e) => e.id === "escalera")?.detalle;
  if (esc && esc.clase === "escalera") partes.push(`escalera ${NOMBRE_ESCALERA[esc.proteccion]} de ${m(esc.anchura_m)}`);
  const sal = j.elementos.find((e) => e.id === "salidas")?.detalle;
  if (sal && sal.clase === "salidas") partes.push(`una salida por planta con recorridos ${sal.recorrido_m !== null ? `de ${m(sal.recorrido_m, 1)}` : `de hasta ${sal.limite_m} m`}`);
  if (j.conGaraje) partes.push("el garaje, por escalera especialmente protegida");
  const fallo = j.veredicto === "fail" ? " Hay algo que no cumple." : "";
  return `${partes.join("; ")}.${fallo}`;
}

export function metricasSi3(j: JustificacionSi3): string {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  return `${personas(oc.total)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraSi3(j: JustificacionSi3, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  for (const o of oc.zonas.filter((x) => x.total > 0)) {
    filas.push({
      id: `oc-${o.zona.id}`,
      titulo: USOS[o.zona.uso].etiqueta,
      detalle: `${o.zona.plantas} · ${fmt(o.zona.util_m2, "m²", 0)}${o.densidad_m2 ? ` · ${o.densidad_m2} m²/persona` : ""}`,
      trato: personas(o.total),
      estado: o.zona.uso === "local_sin_uso" ? "pv" : "normal",
      elementoId: "ocupacion",
    });
  }
  for (const el of j.elementos) {
    if (el.id === "salidas" || el.id === "garaje" || el.id === "escalera") {
      filas.push({ id: el.id, titulo: el.nombre, detalle: resultadoListaSi3(el).split(" · ")[0], trato: textoEtiquetaSi3(el), estado: trato(estados[el.id]), elementoId: el.id });
    }
  }
  return filas;
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function textoEtiquetaSi3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupacion":
      return d.unifamiliar ? "sin orígenes" : personas(d.total);
    case "salidas":
      return d.recorrido_m !== null ? `recorrido ${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `recorrido ≤ ${d.limite_m} m`;
    case "garaje":
      return d.recorrido_m !== null ? `garaje ${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `garaje ≤ ${d.limite_m} m`;
    case "escalera":
      return `${NOMBRE_ESCALERA[d.proteccion]} · ${m(d.anchura_m)}`;
    case "escalera_garaje":
      return "esp. protegida + vestíbulo";
    case "puertas":
      return `salida ≥ ${m(d.anchura_m)}`;
    case "senalizacion":
      return d.residencial ? "sin rótulo SALIDA" : "señales SALIDA";
    case "humo":
      return d.ventilacion === "mecanica" ? `extracción ${fmt(d.extraccion_l_s, "l/s", 0)}` : "ventilación natural";
    case "discapacidad":
      return d.exige ? "zona de refugio" : "salida accesible";
    case "unifamiliar":
      return "sin recorridos";
    case "local":
      return "salidas propias";
  }
}

export function resultadoListaSi3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupacion":
      return d.unifamiliar ? "interior de vivienda: no es origen de evacuación" : `${personas(d.total)} (sin el local)`;
    case "salidas":
      return `una salida de planta · ${d.plantaMayor}: ${personas(d.pPlanta)} ≤ 100 · ${d.residencial ? `edificio ${d.pSalida} ≤ 500 · ` : ""}h ${m(d.h_m)} ≤ 28 m · recorrido ${d.recorrido_m !== null ? m(d.recorrido_m, 1) : "sin medir"} ≤ ${d.limite_m} m`;
    case "garaje":
      return `una salida · ${personas(d.pPlanta)} ≤ 100 · recorrido ${d.recorrido_m !== null ? m(d.recorrido_m, 1) : "sin medir"} ≤ ${d.limite_m} m · ascendente ${m(d.hAsc_m)} ≤ 10 m`;
    case "escalera":
      return `${NOMBRE_ESCALERA[d.proteccion]} (la tabla 5.1 admite ${NOMBRE_ESCALERA[d.exigida]} con h ${m(d.h_m)}) · ${personas(d.p)} ≤ ${d.capacidad}`;
    case "escalera_garaje":
      return `especialmente protegida, con vestíbulo de independencia en cada acceso · ${personas(d.p)} ≤ ${d.capacidad}`;
    case "puertas":
      return `A ≥ P/200 ≥ 0,80 m → ${m(d.anchura_m)} · ${d.sentidoEvacuacion ? "abre hacia fuera" : "abatible de eje vertical"}`;
    case "senalizacion":
      return d.residencial ? `viviendas sin rótulo «SALIDA»; flechas y la escalera que baja al sótano${d.garaje ? "; el garaje, señalizado" : ""}` : "salidas y recorridos señalizados (UNE 23034)";
    case "humo":
      return d.ventilacion === "mecanica"
        ? `ventilación mecánica de HS 3 que extrae ${fmt(d.extraccion_l_s, "l/s", 0)} (150 l/plaza) con aportación ≤ ${fmt(d.aportacion_l_s, "l/s", 0)}, por detección`
        : "ventilación natural conforme a HS 3";
    case "discapacidad":
      return d.exige ? `zona de refugio o sector alternativo (${d.motivo})` : "no se exige zona de refugio; itinerario accesible en la planta de salida";
    case "unifamiliar":
      return d.garaje ? "sin recorridos; el garaje, ≤ 25 m hasta su salida" : "sin recorridos de evacuación";
    case "local":
      return `asimilado a Comercial (${personas(d.p)}): salidas independientes del portal`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSi3(el: ElementoSi<unknown>, _j: JustificacionSi3, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  const T = SALIDAS_TABLA_3_1.datos.unaSalida;
  switch (d.clase) {
    case "ocupacion":
      return {
        clase: "Ocupación · tabla 2.1",
        titulo: el.nombre,
        valor: d.unifamiliar ? "—" : String(d.total),
        unidad: d.unifamiliar ? "unifamiliar" : "personas",
        estado,
        manda: d.unifamiliar
          ? "El interior de una vivienda no es origen de evacuación: la ocupación de la unifamiliar es un dato, sin consecuencias en SI 3."
          : "Superficie útil de cada zona entre su densidad, por exceso. El portal y la escalera no añaden ocupación; los trasteros y los cuartos de instalaciones, nula. El local, asimilado a Comercial, sale por sus propias salidas.",
        filas: d.zonas
          .filter((o) => o.densidad_m2 !== null)
          .map((o) => ({ k: `${USOS[o.zona.uso].etiqueta} · ${o.zona.plantas}`, v: `${fmt(o.zona.util_m2, "m²", 0)} / ${o.densidad_m2} = ${o.porPlanta}${o.zona.repeticiones > 1 ? ` × ${o.zona.repeticiones}` : ""}` })),
        cita: "DB-SI · SI 3 ap. 2 · tabla 2.1",
      };
    case "salidas":
      return {
        clase: "Salidas y recorridos · tabla 3.1",
        titulo: el.nombre,
        valor: d.recorrido_m !== null ? fmt(d.recorrido_m, undefined, 1) : `≤ ${d.limite_m}`,
        unidad: d.recorrido_m !== null ? `m de ${d.limite_m} m` : "m (sin medir)",
        estado,
        manda: `Una sola salida de planta vale si se cumplen a la vez la ocupación, la altura y el recorrido. El recorrido se mide ${tramoRecorrido(d)}, sobre el eje.${d.hastaEdificio ? " Una escalera no protegida ni compartimentada no es salida de planta." : ""}`,
        filas: [
          { k: `Ocupación de la planta (${d.plantaMayor})`, v: `${d.pPlanta} ≤ ${T.ocupacionMax}` },
          ...(d.residencial ? [{ k: "Salida del edificio de viviendas", v: `${d.pSalida} ≤ ${T.ocupacionEdificioViviendasMax}` }] : []),
          { k: "Altura de evacuación", v: `${m(d.h_m)} ≤ ${T.alturaDescendenteMax_m} m` },
          { k: "Recorrido", v: d.recorrido_m !== null ? `${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `sin medir · límite ${d.limite_m} m` },
        ],
        uso: d.recorrido_m !== null ? d.recorrido_m / d.limite_m : undefined,
        cita: "DB-SI · SI 3 ap. 3 · tabla 3.1 · Anejo SI A",
      };
    case "garaje":
      return {
        clase: "Salidas y recorridos · uso Aparcamiento",
        titulo: el.nombre,
        valor: d.recorrido_m !== null ? fmt(d.recorrido_m, undefined, 1) : `≤ ${d.limite_m}`,
        unidad: d.recorrido_m !== null ? `m de ${d.limite_m} m` : "m (sin medir)",
        estado,
        manda: "En uso Aparcamiento una salida vale con 35 m de recorrido desde el punto más alejado hasta la puerta del vestíbulo de la escalera, medidos por las calles de circulación.",
        filas: [
          { k: "Ocupación (40 m²/persona)", v: `${d.pPlanta} ≤ ${T.ocupacionMax}` },
          { k: "Recorrido", v: d.recorrido_m !== null ? `${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `sin medir · límite ${d.limite_m} m` },
          { k: "Altura ascendente", v: `${m(d.hAsc_m)} ≤ ${T.alturaAscendenteMax_m} m` },
        ],
        uso: d.recorrido_m !== null ? d.recorrido_m / d.limite_m : undefined,
        cita: "DB-SI · SI 3 · tabla 3.1",
      };
    case "escalera":
      return {
        clase: "Escalera · tablas 5.1 y 4.2",
        titulo: el.nombre,
        valor: NOMBRE_ESCALERA[d.proteccion],
        unidad: `${m(d.anchura_m)} de anchura`,
        estado,
        manda: `Con una altura de evacuación de ${m(d.h_m)}, la tabla 5.1 admite una escalera ${NOMBRE_ESCALERA[d.exigida]}${d.exigida === "no_protegida" ? " (o con más protección)" : ""}. Su anchura da capacidad para ${d.capacidad} personas; la mínima la fija el DB SUA 1, tabla 4.1 (1,00 m, criterio a confirmar).`,
        filas: [
          { k: "Protección", v: `${NOMBRE_ESCALERA[d.proteccion]} (admite ${NOMBRE_ESCALERA[d.exigida]})` },
          { k: "Ocupantes que la usan", v: `${d.p} en ${d.plantas} plantas` },
          { k: "Capacidad", v: `${d.capacidad} personas` },
          ...(d.proteccion === "protegida" || d.proteccion === "especialmente_protegida"
            ? [{ k: "Recinto", v: "EI 120 · puertas EI2 60-C5 · ventilación 1 m² por planta" }]
            : d.proteccion === "compartimentada"
              ? [{ k: "Recinto", v: "compartimentado como los sectores" }]
              : []),
        ],
        uso: d.capacidad > 0 ? d.p / d.capacidad : undefined,
        cita: "DB-SI · SI 3 ap. 4 y 5 · tablas 4.1, 4.2 y 5.1",
      };
    case "escalera_garaje":
      return {
        clase: "Escalera · tabla 5.1, Aparcamiento",
        titulo: el.nombre,
        valor: "Esp. protegida",
        unidad: "con vestíbulo de independencia",
        estado,
        manda: "En uso Aparcamiento solo se admite la escalera especialmente protegida: un vestíbulo de independencia en cada acceso desde el garaje. Puede ser la escalera común: en la planta de salida no necesita vestíbulo.",
        filas: [
          { k: "Ocupantes del garaje", v: `${d.p} ≤ ${d.capacidad}` },
          { k: "Altura que salva", v: m(d.hAsc_m) },
          { k: "Vestíbulo", v: "paredes EI 120, dos puertas EI2 30-C5" },
        ],
        cita: "DB-SI · SI 3 tabla 5.1 · SI 1 tabla 1.1",
      };
    case "puertas":
      return {
        clase: "Puertas · tabla 4.1 y ap. 6",
        titulo: el.nombre,
        valor: fmt(d.anchura_m, undefined, 2),
        unidad: "m de paso",
        estado,
        manda: `A ≥ P/200 ≥ 0,80 m para las ${d.pSalida} personas que salen por ella; hojas de 0,60 a 1,23 m, abatibles de eje vertical y sin llave desde dentro.${d.sentidoEvacuacion ? " Abre en el sentido de la evacuación." : ""}`,
        filas: [
          { k: "Personas", v: String(d.pSalida) },
          { k: "Anchura", v: m(d.anchura_m) },
          { k: "Sentido de apertura", v: d.sentidoEvacuacion ? "hacia fuera" : "libre" },
          ...(d.garaje ? [{ k: "Puertas del garaje", v: "sin bloqueo; el portón no vale como salida" }] : []),
        ],
        cita: "DB-SI · SI 3 · tabla 4.1 · ap. 6",
      };
    case "senalizacion":
      return {
        clase: "Señalización · ap. 7",
        titulo: el.nombre,
        valor: d.residencial ? "Sin «SALIDA»" : "UNE 23034",
        estado,
        manda: d.residencial
          ? "En uso Residencial Vivienda no se exige el rótulo «SALIDA», pero sí las flechas donde la salida no se vea y la señal en la escalera que en la planta de salida sigue hacia el sótano."
          : "Salidas de recinto, planta y edificio con su rótulo, y flechas visibles desde todo origen de evacuación que no vea la salida.",
        filas: [
          { k: "Norma", v: "UNE 23034:1988" },
          { k: "Fotoluminiscentes", v: "UNE 23035-1, -2 y -4" },
          ...(d.garaje ? [{ k: "Garaje", v: "salidas y recorridos señalizados (criterio)" }] : []),
        ],
        cita: "DB-SI · SI 3 ap. 7",
      };
    case "humo":
      return {
        clase: "Control del humo · ap. 8",
        titulo: el.nombre,
        valor: d.ventilacion === "mecanica" ? fmt(d.extraccion_l_s, undefined, 0) : "Natural",
        unidad: d.ventilacion === "mecanica" ? "l/s de extracción" : "HS 3",
        estado,
        manda: "Un garaje bajo rasante no es aparcamiento abierto y necesita control del humo. Vale la ventilación de HS 3; si es mecánica, con estas condiciones adicionales.",
        filas:
          d.ventilacion === "mecanica"
            ? [
                { k: "Extracción", v: `${fmt(d.extraccion_l_s, "l/s", 0)} (${H.extraccion_l_s_plaza} l/s por plaza)` },
                { k: "Aportación máxima", v: `${fmt(d.aportacion_l_s, "l/s", 0)} (${H.aportacionMax_l_s_plaza} l/s por plaza)` },
                { k: "Activación", v: "automática, por detección de incendio" },
                { k: "Ventiladores", v: H.ventiladores },
                { k: "Conductos", v: `${H.conductos} (${H.conductosEntreSectores} entre sectores)` },
                { k: "Compuertas E300 60 junto al suelo", v: d.compuertas ? "sí: la planta pasa de 4 m" : "no: la planta no pasa de 4 m" },
              ]
            : [{ k: "Ventilación natural", v: "conforme a HS 3, sin condiciones adicionales" }],
        cita: "DB-SI · SI 3 ap. 8 · DB-HS 3",
      };
    case "discapacidad":
      return {
        clase: "Personas con discapacidad · ap. 9",
        titulo: el.nombre,
        valor: d.exige ? "Se exige" : "No",
        unidad: d.exige ? "zona de refugio" : "se exige zona de refugio",
        estado,
        manda: d.exige
          ? `Por ${d.motivo}, las plantas sin salida accesible del edificio tienen paso a un sector alternativo o una zona de refugio (una plaza de silla de ruedas por cada 100 ocupantes).`
          : "Con viviendas de hasta 28 m (14 m en oficinas) y plantas de garaje de hasta 1.500 m² no se exige. La planta de salida sí tiene un itinerario accesible hasta una salida accesible (DB SUA 9).",
        filas: [{ k: "Planta de salida", v: "itinerario accesible hasta una salida accesible" }],
        cita: "DB-SI · SI 3 ap. 9",
      };
    case "unifamiliar":
      return {
        clase: "Evacuación · Anejo SI A",
        titulo: el.nombre,
        valor: "No hay",
        estado,
        manda: "El interior de una vivienda no es origen de evacuación: no hay recorridos que limitar ni escaleras que proteger. La vivienda no puede salir solo a través de su garaje, que es local de riesgo especial.",
        filas: d.garaje
          ? [
              { k: "Recorrido dentro del garaje", v: "≤ 25 m hasta su salida" },
              { k: "Puerta a la vivienda", v: "EI2 45-C5, ≥ 0,80 m" },
              { k: "Portón", v: "con puerta peatonal abatible de ≥ 0,80 m" },
            ]
          : [],
        cita: "DB-SI · Anejo SI A · SI 1 tabla 2.2",
      };
    case "local":
      return {
        clase: "Previsto · ap. 1",
        titulo: `Local sin uso · ${d.zona.plantas}`,
        valor: "Salidas propias",
        estado,
        manda: "Asimilado a Comercial, sus salidas y recorridos hasta la calle son independientes de las zonas comunes del edificio. Se justificará con su actividad.",
        filas: [{ k: "Ocupación (2 m²/persona)", v: personas(d.p) }],
        cita: "DB-SI · SI 3 ap. 1",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSi3(a: Aviso): TextoSi {
  switch (a.id) {
    case "recorrido":
      return {
        titulo: "Falta medir el recorrido más largo.",
        detalle: `La herramienta no mide planos. Mídelo ${a.datos.hastaEdificio ? "desde la puerta de la vivienda más alejada hasta la salida del edificio (la escalera no protegida no es salida de planta)" : "desde la puerta más alejada hasta la escalera"} y anótalo en las decisiones: el límite es ${a.datos.limite_m} m.`,
      };
    case "recorrido-garaje":
      return {
        titulo: "Falta medir el recorrido del garaje.",
        detalle: `Desde el punto más alejado hasta la puerta del vestíbulo de la escalera, por las calles de circulación: el límite es ${a.datos.limite_m} m.`,
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSi3(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "salidas") {
    const que = d.fallos.map((f) =>
      f === "ocupacion" ? `${d.plantaMayor} tiene ${d.pPlanta} ocupantes (más de 100)` : f === "ocupacion_edificio" ? `salen ${d.pSalida} personas por el portal (más de 500)` : f === "altura" ? `la altura de evacuación pasa de 28 m` : `el recorrido mide ${m(d.recorrido_m ?? 0, 1)} (más de ${d.limite_m} m)`,
    );
    return {
      titulo: "Una sola salida de planta no basta.",
      detalle: `${listaY(que)}.${d.fallos.includes("recorrido") && d.hastaEdificio ? " Con la escalera compartimentada o protegida, el recorrido acaba en ella." : d.fallos.includes("altura") ? " Hacen falta dos salidas de planta a dos escaleras: fuera de lo que justifica la herramienta." : ""}`,
    };
  }
  if (d.clase === "garaje") {
    return { titulo: "Una sola salida del garaje no basta.", detalle: d.fallos.includes("recorrido") ? `El recorrido mide ${m(d.recorrido_m ?? 0, 1)}, más de 35 m: hace falta otra salida.` : "La ocupación o la altura ascendente exceden de lo que admite una salida." };
  }
  if (d.clase === "escalera") {
    return {
      titulo: `La escalera ${NOMBRE_ESCALERA[d.proteccion]} no vale.`,
      detalle: d.capacidad < d.p ? `Su anchura da para ${d.capacidad} personas y la usan ${d.p}.` : `Con ${m(d.h_m)} de altura de evacuación la tabla 5.1 pide, al menos, una escalera ${NOMBRE_ESCALERA[d.exigida]}.`,
    };
  }
  return null;
}

export function describirDibujoSi3(j: JustificacionSi3): string {
  return `Sección del edificio con la escalera y los recorridos de evacuación: ${fraseSi3(j).replace(/\.$/, "")}.`;
}

// -----------------------------------------------------------------------------
// La memoria
// -----------------------------------------------------------------------------

type Det<C extends DetalleSi3["clase"]> = Extract<DetalleSi3, { clase: C }>;

/** «0,80 m»: las anchuras de paso, con sus dos decimales, como las da la tabla 4.1. */
function anchura(v: number): string {
  return `${v.toFixed(2).replace(".", ",")} m`;
}

/** El uso de la tabla 2.1 de cada zona. El local sin uso, asimilado a Comercial, no entra en la tabla. */
const NOMBRE_USO_SI: Record<UsoSi, string> = {
  residencial_vivienda: "Residencial Vivienda",
  vivienda_unifamiliar: "Residencial Vivienda",
  administrativo: "Administrativo",
  aparcamiento: "Aparcamiento",
  sin_uso: "Comercial",
};

/** Las zonas que suman ocupación: las de densidad de la tabla 2.1, sin el local (sale por las suyas). */
function zonasConOcupacion(d: Det<"ocupacion">): OcupacionZona[] {
  return d.zonas.filter((o) => o.densidad_m2 !== null && o.zona.uso !== "local_sin_uso");
}

/**
 * La ocupación de cada zona (feature-31): superficie útil, densidad de la tabla
 * 2.1 y ocupación; con varias zonas, el total. Una zona que se repite en varias
 * plantas se cuenta por planta («8 × 3 = 24»), como la calcula el módulo.
 */
function tablaOcupacion(d: Det<"ocupacion">, tras: number): TablaMemoria | undefined {
  const zonas = zonasConOcupacion(d);
  if (zonas.length === 0) return undefined;
  const filas = zonas.map((o) => {
    const n = o.zona.repeticiones;
    return [
      `${USOS[o.zona.uso].etiqueta} (${o.zona.plantas})`,
      NOMBRE_USO_SI[o.zona.usoSi],
      `${m2(o.zona.util_m2)}${n > 1 ? ` × ${n}` : ""}`,
      `${o.densidad_m2} m²/persona`,
      n > 1 ? `${o.porPlanta} × ${n} = ${o.total}` : String(o.total),
    ];
  });
  if (zonas.length > 1) {
    const usos = [...new Set(zonas.map((o) => NOMBRE_USO_SI[o.zona.usoSi]))];
    const util = zonas.reduce((a, o) => a + o.zona.util_m2 * o.zona.repeticiones, 0);
    filas.push(["Total", listaY(usos), m2(util), "según zona", String(zonas.reduce((a, o) => a + o.total, 0))]);
  }
  return {
    rotulo: "Ocupación",
    cabecera: ["Zona", "Uso", "Superficie útil", "Densidad", "Ocupación (personas)"],
    columnas: ["texto", "texto", "dato", "dato", "dato"],
    filas,
    tras,
  };
}

/** Lo que la tabla 5.1 admite como mínimo, con la altura hasta la que lo admite. */
function normaProteccion(exigida: ProteccionEscalera): string {
  const t = PROTECCION_TABLA_5_1.datos.residencial;
  if (exigida === "no_protegida") return `no protegida (h ≤ ${t.noProtegida_m} m)`;
  if (exigida === "protegida") return `protegida (h ≤ ${t.protegida_m} m)`;
  return NOMBRE_ESCALERA[exigida];
}

/** Lo que el módulo comprueba de un elemento de la evacuación, en filas «Norma | Proyecto». */
function filasEvacuacion(el: ElementoSi3): FilaNorma[] {
  const d = el.detalle;
  const T = SALIDAS_TABLA_3_1.datos.unaSalida;
  const veredicto = el.veredicto === "fail" ? "fail" : "ok";
  // Un recorrido sin medir se declara: «≤ 25 m» (el texto lo declaraba «no excede de 25 m»).
  const recorrido = (r: number | null, limite: number): string => (r !== null ? m(r, 1) : `≤ ${limite} m`);
  switch (d.clase) {
    case "salidas": {
      const ok = (f: Det<"salidas">["fallos"][number]): boolean => !d.fallos.includes(f);
      return [
        [`Ocupación de la planta (${d.plantaMayor}, la mayor)`, `≤ ${T.ocupacionMax} personas`, personas(d.pPlanta), ok("ocupacion")],
        ...(d.residencial ? [["Ocupación de la salida del edificio", `≤ ${T.ocupacionEdificioViviendasMax} personas`, personas(d.pSalida), ok("ocupacion_edificio")] as FilaNorma] : []),
        ["Altura de evacuación", `≤ ${T.alturaDescendenteMax_m} m`, m(d.h_m), ok("altura")],
        ["Recorrido de evacuación", `≤ ${d.limite_m} m`, recorrido(d.recorrido_m, d.limite_m), ok("recorrido")],
      ];
    }
    case "escalera":
      return [
        ["Protección de la escalera", normaProteccion(d.exigida), NOMBRE_ESCALERA[d.proteccion], proteccionSuficiente(d.proteccion, d.exigida)],
        ["Capacidad de la escalera", d.p > 0 ? `≥ ${personas(d.p)}` : NO_SE_EXIGE, `${personas(d.capacidad)} (A = ${anchura(d.anchura_m)})`, d.capacidad >= d.p],
      ];
    case "puertas":
      // La anchura de proyecto es la que se declara: la mínima que resulta de la tabla 4.1.
      return [[`Anchura de la puerta de salida (${personas(d.pSalida)})`, "A ≥ P/200 ≥ 0,80 m", `≥ ${anchura(d.anchura_m)}`, veredicto]];
    case "garaje": {
      const ok = (f: Det<"garaje">["fallos"][number]): boolean => !d.fallos.includes(f);
      return [
        ["Ocupación del garaje", `≤ ${T.ocupacionMax} personas`, personas(d.pPlanta), ok("ocupacion")],
        ["Altura de evacuación ascendente del garaje", `≤ ${T.alturaAscendenteMax_m} m`, m(d.hAsc_m), ok("altura")],
        ["Recorrido del garaje", `≤ ${d.limite_m} m`, recorrido(d.recorrido_m, d.limite_m), ok("recorrido")],
      ];
    }
    case "escalera_garaje":
      return [["Protección de la escalera del garaje", NOMBRE_ESCALERA.especialmente_protegida, NOMBRE_ESCALERA.especialmente_protegida, veredicto]];
    default:
      return [];
  }
}

/** Las clases de la evacuación que van a la tabla, en el orden de los párrafos. */
const DE_LA_EVACUACION: ReadonlySet<DetalleSi3["clase"]> = new Set(["salidas", "escalera", "puertas", "garaje", "escalera_garaje"]);

export function memoriaSi3(j: JustificacionSi3): MemoriaDoc {
  const parrafos: Trozo[][] = [];
  const ex = j.existente;
  const sal = j.elementos.find((el) => el.detalle.clase === "salidas")?.detalle;
  const residencial = sal?.clase === "salidas" ? sal.residencial : true;
  const uso = residencial ? "Residencial Vivienda" : "Administrativo";
  const D = DISCAPACIDAD_SI3.datos;
  // Las tablas van tras su grupo de párrafos (feature-31): la ocupación, tras el
  // suyo; la evacuación, tras las salidas, la escalera, la puerta y el garaje.
  let ocupacion: TablaMemoria | undefined;
  const evacuacion: FilaNorma[] = [];
  let trasEvacuacion = 0;
  for (const el of j.elementos) {
    const d = el.detalle;
    switch (d.clase) {
      case "ocupacion":
        if (ex) {
          // Criterio 8 (feature-30): la ocupación de lo intervenido y su salida por los comunes existentes.
          parrafos.push([
            "La ocupación de la zona que se transforma en vivienda se calcula con la densidad de la tabla 2.1. Sus ocupantes evacúan desde la puerta de la vivienda por los elementos comunes de evacuación del edificio existente hasta su salida. Al tratarse de transformar en uso Residencial Vivienda una zona de otro uso en un edificio de ese uso, no es preciso aplicar este DB a los elementos comunes de evacuación (DB-SI, Introducción III, criterio 8).",
          ]);
          ocupacion = tablaOcupacion(d, parrafos.length);
          if (ex.comunesReformados) {
            // La ocupación del edificio entero va en la fila de la puerta.
            parrafos.push(["En las zonas comunes que se reforman, el DB se aplica a los elementos que modifica la reforma (criterio 9), con la ocupación del edificio entero."]);
          }
        } else if (d.unifamiliar) {
          parrafos.push(["El edificio es una vivienda unifamiliar. El interior de una vivienda no es origen de evacuación (Anejo SI A), por lo que no hay recorridos de evacuación que limitar ni escaleras que proteger conforme a SI 3."]);
        } else {
          // Las superficies, las densidades y las ocupaciones van en la tabla (feature-31).
          parrafos.push([
            "La ocupación se calcula con las densidades de la tabla 2.1 sobre la superficie útil de cada zona. Los trasteros de las viviendas y los cuartos de instalaciones son zonas de ocupación nula, y el portal y la escalera no aportan ocupación propia. Las ocupaciones y usos previstos son únicamente los característicos de la actividad (tabla 2.1, nota 1).",
          ]);
          ocupacion = tablaOcupacion(d, parrafos.length);
        }
        break;
      case "salidas":
        // Las ocupaciones, la altura y el recorrido van en la tabla: aquí, el criterio y cómo se mide.
        parrafos.push([
          `Cada planta dispone de una única salida de planta, que la tabla 3.1 admite si se cumplen a la vez las condiciones de ocupación, altura de evacuación y recorrido. El recorrido más desfavorable se mide ${tramoRecorrido(d)}${d.hastaEdificio ? ", ya que una escalera no protegida no es salida de planta" : ""}.`,
        ]);
        break;
      case "garaje":
        parrafos.push([
          "El garaje, de uso Aparcamiento, dispone de una salida de planta, que la tabla 3.1 admite si se cumplen a la vez las condiciones de ocupación, altura de evacuación ascendente y recorrido; el recorrido se mide desde el punto más alejado hasta la puerta del vestíbulo de la escalera.",
        ]);
        break;
      case "escalera":
        parrafos.push([
          `La protección exigida a la escalera es la de la tabla 5.1 para su altura de evacuación en uso ${uso}, y su capacidad, la de las tablas 4.1 y 4.2 para su anchura${d.p > 0 ? "" : "; ningún ocupante de la zona a la que se aplica la Sección evacua por ella"}. La anchura mínima es la del DB SUA 1, tabla 4.1.`,
        ]);
        break;
      case "escalera_garaje":
        parrafos.push([
          "En cada acceso desde el garaje, la escalera que le sirve tiene vestíbulo de independencia (paredes EI 120 y dos puertas EI2 30-C5), como exige la tabla 5.1 para el uso Aparcamiento.",
        ]);
        break;
      case "puertas":
        parrafos.push([
          `La puerta de salida del edificio tiene hojas de entre 0,60 y 1,23 m, es abatible de eje vertical, con apertura sin llave desde el lado de la evacuación${d.sentidoEvacuacion ? ", y abre en el sentido de la evacuación" : ""} (SI 3, tabla 4.1 y ap. 6).${d.garaje ? " Las puertas de salida del garaje no tienen bloqueo y el portón de vehículos no se considera salida." : ""}`,
        ]);
        break;
      case "senalizacion":
        parrafos.push([
          d.residencial
            ? `En uso Residencial Vivienda no se exige el rótulo «SALIDA»; se señalizan los recorridos donde la salida no es visible y la escalera que, en la planta de salida, continúa hacia el sótano${d.garaje ? ", y las salidas y recorridos del garaje" : ""}, con señales conformes a UNE 23034:1988 visibles aunque falle el alumbrado normal (SI 3, ap. 7).`
            : "Las salidas y los recorridos se señalizan con señales conformes a UNE 23034:1988, visibles aunque falle el alumbrado normal (SI 3, ap. 7).",
        ]);
        break;
      case "humo":
        parrafos.push(
          d.ventilacion === "mecanica"
            ? [
                "El garaje, que no tiene la consideración de aparcamiento abierto, dispone de control del humo mediante el sistema de ventilación mecánica de HS 3, capaz de extraer ",
                { v: fmt(d.extraccion_l_s, "l/s", 0) },
                ` (${H.extraccion_l_s_plaza} l/s por plaza) con una aportación máxima de ${fmt(d.aportacion_l_s, "l/s", 0)}, activado automáticamente por una instalación de detección de incendio, con ventiladores ${H.ventiladores} y conductos ${H.conductos} (${H.conductosEntreSectores} si atraviesan sectores)${d.compuertas ? " y compuertas automáticas E300 60 en las aberturas de extracción junto al suelo" : ""} (SI 3, ap. 8).`,
              ]
            : ["El garaje dispone de control del humo mediante ventilación natural conforme al DB HS 3 (SI 3, ap. 8)."],
        );
        break;
      case "discapacidad":
        parrafos.push([
          d.exige
            ? `Por ${d.motivo}, las plantas sin salida accesible disponen de paso a un sector alternativo o de zona de refugio (SI 3, ap. 9).`
            : `No se exigen zonas de refugio (altura de evacuación no mayor que ${residencial ? D.residencialH_m : D.administrativoH_m} m en uso ${uso}${j.conGaraje ? ` y plantas de garaje de no más de ${fmt(D.plantaAparcamiento_m2, "m²", 0)}` : ""}); la planta de salida dispone de un itinerario accesible hasta una salida del edificio accesible (SI 3, ap. 9).`,
        ]);
        break;
      case "local":
        parrafos.push(["El local sin actividad, asimilado a uso Comercial, tiene sus salidas y recorridos independientes de las zonas comunes del edificio; se justificará en el proyecto de su actividad (SI 3, ap. 1)."]);
        break;
      default:
        break;
    }
    if (DE_LA_EVACUACION.has(d.clase)) {
      evacuacion.push(...filasEvacuacion(el));
      trasEvacuacion = parrafos.length;
    }
  }
  return {
    titulo: "Evacuación de ocupantes",
    norma: "DB-SI 3",
    parrafos,
    tablas: soloTablas(ocupacion, tablaNorma(evacuacion, { rotulo: "Evacuación", tras: trasEvacuacion })),
    fuente: [
      "DB-SI · SI 3 (consolidado 4-mar-2025)",
      ex ? (ex.comunesReformados ? "tablas 2.1 y 4.1 · ap. 6 y 7" : "tabla 2.1") : "tablas 2.1, 3.1, 4.1, 4.2 y 5.1",
      ...(ex ? ["Introducción III, criterios 8 y 9"] : []),
      "datos de El edificio",
      `motor ${ENGINE_VERSION}`,
    ].join(" · "),
  };
}

/** Las piezas de la fila de La obra. */
export function piezasSi3(j: JustificacionSi3): { texto: string; acento: boolean }[] {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  if (oc.unifamiliar) return [{ texto: "sin recorridos", acento: false }];
  const out: { texto: string; acento: boolean }[] = [{ texto: personas(oc.total), acento: false }];
  const esc = j.elementos.find((e) => e.id === "escalera")?.detalle;
  if (esc && esc.clase === "escalera") out.push({ texto: `escalera ${NOMBRE_ESCALERA[esc.proteccion]}`, acento: false });
  if (j.conGaraje) out.push({ texto: "garaje · esp. protegida", acento: true });
  if (j.elementos.some((e) => e.detalle.clase === "local")) out.push({ texto: "local · salidas propias", acento: true });
  return out;
}
