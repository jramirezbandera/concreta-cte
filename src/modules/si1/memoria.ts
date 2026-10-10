// =============================================================================
// DB-SI, SI 1 — La memoria redactada (feature-19): sectores, lo que los separa,
// los locales de riesgo especial, los espacios ocultos y la reacción al fuego,
// cada cosa con su cita. Se redacta solo a partir de la justificación. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo, TablaMemoria } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { cumpleTexto, NO_SE_EXIGE } from "../../lib/cte/tablaNorma";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { limiteDe } from "../si/sectores";
import { REACCION_TABLA_4_1, SECTORES_TABLA_1_1, VESTIBULO_INDEPENDENCIA } from "../si/tablas";
import { construida, m2, NOMBRE_USO_SECTOR } from "../si/textos";
import type { DetalleSi1, JustificacionSi1 } from "./justificacion";
import { porQueLocal } from "./textos";

const R41 = REACCION_TABLA_4_1.datos;

function de<C extends DetalleSi1["clase"]>(j: JustificacionSi1, clase: C): { nombre: string; d: Extract<DetalleSi1, { clase: C }> }[] {
  return j.elementos.flatMap((el) => (el.detalle.clase === clase ? [{ nombre: el.nombre, d: el.detalle as Extract<DetalleSi1, { clase: C }> }] : []));
}

function parrafoSectores(j: JustificacionSi1): Trozo[] {
  const c = j.comp;
  const p = de(j, "principal")[0].d;
  const s = p.sector;
  // Las superficies y sus límites van en la tabla (feature-31).
  if (p.unifamiliar) {
    return ["La vivienda unifamiliar constituye un único sector de incendio (SI 1, tabla 1.1); una vivienda unifamiliar no precisa sectores en su interior."];
  }
  const ex = j.existente;
  // En un edificio existente, en qué sector se integra lo intervenido (feature-30).
  const out: Trozo[] = ex
    ? [`${ex.pasaAVivienda ? "La zona que se transforma en vivienda" : "Lo intervenido"} se integra en el sector de incendio de uso ${s.uso === "administrativo" ? "Administrativo" : "Residencial Vivienda"} del edificio existente (SI 1, tabla 1.1).`]
    : [`El edificio se compartimenta en ${c.sectores.length === 1 ? "un único sector" : `${c.sectores.length} sectores`} de incendio (SI 1, tabla 1.1).`];
  const quien = s.uso === "administrativo" ? "Las oficinas" : "Las viviendas, con sus zonas comunes,";
  if (s.porPlantas && s.plantaMayor) out.push(` ${quien} se sectorizan por plantas.`);
  else if (!ex && c.sectores.length > 1) out.push(` ${quien} forman un sector.`);
  for (const { d } of de(j, "sector")) {
    const sec = d.sector;
    if (sec.uso === "aparcamiento") {
      out.push(" El garaje es uso Aparcamiento por exceder de 100 m² y constituye un sector diferenciado; toda comunicación con el resto del edificio se hace a través de vestíbulo de independencia.");
    } else if (sec.id.startsWith("local-")) {
      out.push(
        sec.usoSupuesto
          ? " El local de planta baja, sin actividad definida, constituye un sector propio al que se aplican las condiciones del uso Comercial, el más exigente; la obra de terminación para su uso justificará lo que le corresponda."
          : ` El local constituye un sector propio de uso ${NOMBRE_USO_SECTOR[sec.uso]}.`,
      );
    } else {
      out.push(` ${sec.id === "oficinas" ? "Las oficinas" : "Las viviendas"} constituyen un sector propio.`);
    }
  }
  for (const { d } of de(j, "exenta")) {
    out.push(` ${d.exenta.zona.uso === "oficinas" ? "Las oficinas" : "El local, de uso Administrativo,"} no precisan constituir sector propio.`);
  }
  return out;
}

function parrafoResistencia(j: JustificacionSi1): Trozo[] {
  const c = j.comp;
  const sectores = c.sectores.filter((s) => !s.principal);
  if (sectores.length === 0 && !c.principal.porPlantas) return [];
  // La EI de cada sector va en la tabla (feature-31): aquí, de dónde sale y lo que la tabla no dice.
  const out: Trozo[] = [
    `La resistencia al fuego de los elementos que separan cada sector del resto del edificio es la de la tabla 1.2, para una altura de evacuación del edificio de ${fmt(c.h_m, "m", 2)}${j.existente ? ", en lo que linda con lo intervenido" : ""}`,
  ];
  const extra: string[] = [];
  for (const s of sectores) {
    const l = limiteDe(c, s);
    const quien = s.uso === "aparcamiento" ? "del garaje" : s.id.startsWith("local-") ? "del local" : s.id === "oficinas" ? "de las oficinas" : "de las viviendas";
    extra.push(
      l.vestibulo
        ? `el vestíbulo de independencia ${quien} tiene paredes EI ${VESTIBULO_INDEPENDENCIA.datos.paredes_EI} y dos puertas EI2 ${l.puerta_EI2}-C5`
        : `las puertas de paso ${quien}, si las tiene, son EI2 ${l.puerta_EI2}-C5`,
    );
  }
  if (c.principal.porPlantas) extra.push("los forjados entre plantas mantienen la compartimentación de los sectores");
  if (extra.length > 0) out.push(`: ${listaY(extra)}`);
  out.push(".");
  if (sectores.some((s) => s.uso === "aparcamiento")) {
    out.push(" El ascensor que comunica el garaje con otras plantas lo hace a través de vestíbulo de independencia (SI 1, ap. 1 pto 4).");
  }
  return out;
}

function parrafosLocales(j: JustificacionSi1): Trozo[][] {
  const out: Trozo[][] = [];
  for (const { nombre, d } of de(j, "local")) {
    const k = d.condiciones;
    const l = d.local;
    // La R, la EI y la puerta van en la tabla (feature-31).
    out.push([
      `${nombre} (${l.zona.plantas}) es local de riesgo especial `,
      { v: l.clase },
      ` (SI 1, tabla 2.1: ${porQueLocal(l)}). Cumple la tabla 2.2${k.subePorNota2 ? ", con la resistencia de los sectores del uso al que sirve (nota 2)" : ""}${k.vestibulo ? `, con vestíbulo de independencia y dos puertas EI2 ${k.puerta_EI2}-C5` : ""}, y el recorrido hasta alguna de sus salidas no es mayor que ${fmt(k.recorrido_m, "m", 0)}.`,
    ]);
  }
  const no = de(j, "no_local");
  if (no.length > 0) {
    out.push([
      `${listaY(no.map(({ nombre, d }) => `${nombre.toLowerCase()} (${d.zona.plantas}${d.motivo === "trasteros" ? `, ${construida(d.zona.construida.valor, d.zona.construida.supuesto)}` : ""})`)).replace(/^./, (x) => x.toUpperCase())} no ${no.length > 1 ? "son locales" : "es local"} de riesgo especial conforme a la tabla 2.1.`,
    ]);
  }
  return out;
}

function parrafoOcultos(): Trozo[] {
  return [
    "La compartimentación se mantiene en los espacios ocultos (patinillos, cámaras, falsos techos, suelos elevados) y en los pasos de instalaciones, con compuertas o dispositivos EI t (i↔o) o elementos pasantes de la misma resistencia, salvo las penetraciones de sección de paso no mayor que 50 cm² (SI 1, ap. 3).",
  ];
}

function parrafoReaccion(j: JustificacionSi1): Trozo[] {
  const r = de(j, "reaccion")[0].d;
  const out: Trozo[] = [
    `Los revestimientos que superan el ${R41.umbral_pct} % de paredes, techos o suelos de cada recinto son de clase `,
    { v: `${R41.zonasOcupables.techosParedes} / ${R41.zonasOcupables.suelos}` },
    ` en las zonas ocupables, excluido el interior de las viviendas`,
  ];
  if (r.garaje || r.locales > 0) out.push(`; ${R41.aparcamientosRiesgo.techosParedes} / ${R41.aparcamientosRiesgo.suelos} en ${r.garaje ? "el garaje y " : ""}los locales de riesgo especial`);
  out.push(`; ${R41.protegidos.techosParedes} / ${R41.protegidos.suelos} en escaleras y pasillos protegidos, si los hay; y ${R41.espaciosOcultos.techosParedes} / ${R41.espaciosOcultos.suelos} en los espacios ocultos no estancos (SI 1, tabla 4.1).`);
  return out;
}

/** «EI 120 · techo REI 120 · vestíbulo». */
function resistenciaSector(l: ReturnType<typeof limiteDe>): string {
  return [`EI ${l.ei}`, ...(l.techo ? [`techo REI ${l.ei}`] : []), ...(l.vestibulo ? ["vestíbulo"] : [])].join(" · ");
}

/**
 * Sectores y locales de riesgo especial (feature-31): superficie y resistencia,
 * lo exigido y lo de proyecto. La resistencia de proyecto es la que se declara.
 */
function tabla(j: JustificacionSi1, tras: number): TablaMemoria | undefined {
  const filas: string[][] = [];
  const c = j.comp;
  const max = m2(SECTORES_TABLA_1_1.datos.sectorMax_m2);
  const otros = c.sectores.some((s) => !s.principal) || de(j, "exenta").length > 0;
  const entre = de(j, "entre_viviendas")[0]?.d;
  for (const el of j.elementos) {
    const d = el.detalle;
    const ok = cumpleTexto(el.veredicto === "fail" ? "fail" : "ok");
    if (d.clase === "principal") {
      const s = d.sector;
      const planta = s.porPlantas ? s.plantaMayor : null;
      const medida = planta ?? s.superficie;
      const res = entre ? `EI ${entre.ei} entre viviendas` : otros ? "la de cada colindante" : NO_SE_EXIGE;
      filas.push([
        el.nombre,
        d.unifamiliar ? "Residencial Vivienda" : NOMBRE_USO_SECTOR[s.uso],
        planta ? `≤ ${max} por planta` : `≤ ${max}`,
        `${construida(medida.construida_m2, medida.supuesta)}${planta ? ` (${planta.etiqueta})` : ""}`,
        res,
        res,
        ok,
      ]);
    }
    if (d.clase === "sector") {
      const s = d.sector;
      const r = resistenciaSector(limiteDe(c, s));
      filas.push([
        el.nombre,
        NOMBRE_USO_SECTOR[s.uso],
        s.limite_m2 === null ? "sector propio" : `≤ ${m2(s.limite_m2)}`,
        construida(s.superficie.construida_m2, s.superficie.supuesta),
        r,
        r,
        ok,
      ]);
    }
    if (d.clase === "exenta") {
      const z = d.exenta.zona;
      filas.push([
        el.nombre,
        "Administrativo",
        `≤ ${m2(SECTORES_TABLA_1_1.datos.establecimientoExento_m2)} sin ser sector`,
        construida(z.construida.valor * z.repeticiones, z.construida.supuesto),
        NO_SE_EXIGE,
        NO_SE_EXIGE,
        ok,
      ]);
    }
    if (d.clase === "local") {
      const k = d.condiciones;
      const r = `R ${k.R} · EI ${k.EI} · puerta EI2 ${k.puerta_EI2}-C5`;
      filas.push([`${el.nombre} (${d.local.zona.plantas})`, `riesgo ${d.local.clase}`, NO_SE_EXIGE, d.local.s_m2 !== undefined ? m2(d.local.s_m2) : "no interviene", r, r, ok]);
    }
  }
  if (filas.length === 0) return undefined;
  return {
    cabecera: ["Sector o local", "Uso o riesgo", "Superficie norma", "Superficie proyecto", "Resistencia norma", "Resistencia proyecto", "Cumple"],
    columnas: ["texto", "texto", "norma", "proyecto", "norma", "proyecto", "cumple"],
    filas,
    tras,
  };
}

export function memoriaSi1(j: JustificacionSi1): MemoriaDoc {
  // La tabla, tras los sectores y los locales: antes de los espacios ocultos y la reacción al fuego.
  const antes = [parrafoSectores(j), parrafoResistencia(j), ...parrafosLocales(j)].filter((p) => p.length > 0);
  const parrafos = [...antes, parrafoOcultos(), parrafoReaccion(j)].filter((p) => p.length > 0);
  return {
    titulo: "Propagación interior",
    norma: "DB-SI 1",
    parrafos,
    tablas: soloTablas(tabla(j, antes.length)),
    fuente: ["DB-SI · SI 1 (consolidado 4-mar-2025)", "tablas 1.1, 1.2, 2.1, 2.2 y 4.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
