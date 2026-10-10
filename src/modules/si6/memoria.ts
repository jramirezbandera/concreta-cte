// =============================================================================
// DB-SI, SI 6 — La memoria redactada (feature-19): la R de cada planta con su
// porqué, los locales de riesgo especial y, si es de hormigón, las dimensiones
// del Anejo C. Se redacta solo a partir de la justificación. PURA.
//
// Dos tablas (feature-31): la R exigida y la de proyecto por planta y local de
// riesgo especial, y las dimensiones mínimas del Anejo C por clase R. El texto
// se queda con de dónde salen (tablas 3.1 y 3.2, la nota 1 del forjado, el
// material y las reglas del Anejo C).
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { cumpleTexto } from "../../lib/cte/tablaNorma";
import { USOS } from "../../lib/edificio/usos";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi6, JustificacionSi6, RZona } from "./justificacion";
import { R_TABLA_3_2 } from "./tablas";
import { NOMBRE_FORJADO, porQueR, textoForjado, textoSoporte } from "./textos";

type PlantaSi6 = Extract<DetalleSi6, { clase: "planta" }>;

function plantas(j: JustificacionSi6): { d: PlantaSi6; veredicto: string }[] {
  return j.elementos.flatMap((el) => (el.detalle.clase === "planta" ? [{ d: el.detalle, veredicto: el.veredicto }] : []));
}

/** Los locales de riesgo especial de una planta que no son ya la fila de la planta. */
function localesDe(p: PlantaSi6): RZona[] {
  return p.zonas.filter((z) => z.motivo === "riesgo" && z !== p.manda);
}

function hayRiesgo(j: JustificacionSi6): boolean {
  return plantas(j).some(({ d }) => d.zonas.some((z) => z.motivo === "riesgo"));
}

function parrafoR(j: JustificacionSi6): Trozo[] {
  // La R de cada planta y de cada local va en la tabla (feature-31): aquí, de dónde sale.
  return [
    `La resistencia al fuego de los elementos estructurales principales es la de la tabla 3.1 de SI 6, por el uso del sector de cada planta y la altura de evacuación del edificio, de ${fmt(j.comp.h_m, "m", 2)}${hayRiesgo(j) ? ", y la de la tabla 3.2 en los locales de riesgo especial" : ""}. La resistencia de cada forjado es la del sector que tiene debajo (tabla 3.1, nota 1).`,
  ];
}

function parrafoHormigon(j: JustificacionSi6): Trozo[] {
  const el = j.elementos.find((x) => x.id === "hormigon");
  if (!el) return [];
  const d = el.detalle;
  if (d.clase === "otro_material") {
    return [`La estructura es de ${d.material}; su resistencia al fuego se justifica conforme al ${d.material === "acero" ? "Anejo SI D" : "Anejo SI E"}, con la protección que se defina o mediante ensayo.`];
  }
  if (d.clase !== "hormigon") return [];
  // Las dimensiones de cada R van en la segunda tabla: aquí, el forjado y las reglas que la tabla no dice.
  return [
    `La estructura es de hormigón armado, con forjado ${NOMBRE_FORJADO[j.decisiones.forjado]}, y se justifica con las dimensiones mínimas de las tablas del Anejo C. Las distancias a son distancias mínimas equivalentes al eje de las armaduras; los revestimientos de yeso cuentan 1,8 veces su espesor. Desde R 90, la armadura de negativos de los forjados continuos se prolonga hasta el 33 % del tramo con al menos el 25 % de la cuantía de los extremos.`,
  ];
}

function parrafoEscaleras(): Trozo[] {
  return [
    "Los elementos estructurales contenidos en una escalera protegida o en un pasillo protegido son como mínimo R 30; a los de una escalera especialmente protegida no se les exige resistencia (SI 6, ap. 3 pto 3).",
  ];
}

/** «R 60 (Anejo C)»: la R que se declara y con qué se justifica. */
function rProyecto(j: JustificacionSi6, r: number): string {
  const anejo = j.decisiones.material === "hormigon" ? "Anejo C" : j.decisiones.material === "acero" ? "Anejo D" : "Anejo E";
  return `R ${r} (${anejo})`;
}

/**
 * La R por planta y por local de riesgo especial (feature-31): la exigida y la
 * de proyecto, que es la que se declara con el anejo que la justifica.
 */
function tablaR(j: JustificacionSi6, tras: number): TablaMemoria | undefined {
  const filas: string[][] = [];
  let subePorPlanta = false;
  for (const { d, veredicto } of plantas(j)) {
    const ok = cumpleTexto(veredicto === "fail" ? "fail" : "ok");
    const m = d.manda;
    // Si manda un local de riesgo especial, la fila de la planta lo nombra y no se repite debajo.
    const uso = m.motivo === "riesgo" ? `${USOS[m.zona.uso].etiqueta.toLowerCase()}, riesgo especial ${m.local?.clase ?? ""} (tabla 3.2)` : porQueR(m, j.comp.h_m);
    filas.push([d.plantas, uso, `R ${d.R}`, rProyecto(j, d.R), ok]);
    for (const z of localesDe(d)) {
      const clase = z.local?.clase;
      // Nunca menos que la estructura de su planta (tabla 3.2, nota 1): la llamada (1).
      const sube = clase !== undefined && z.R > R_TABLA_3_2.datos[clase];
      subePorPlanta ||= sube;
      filas.push([`${USOS[z.zona.uso].etiqueta} (${z.zona.plantas})`, `riesgo especial ${clase ?? ""} (tabla 3.2)`, `R ${z.R}${sube ? " (1)" : ""}`, rProyecto(j, z.R), ok]);
    }
  }
  if (filas.length === 0) return undefined;
  return {
    cabecera: ["Planta o elemento", "Uso que manda", "R exigida", "R de proyecto", "Cumple"],
    columnas: ["texto", "texto", "norma", "proyecto", "cumple"],
    filas,
    ...(subePorPlanta ? { notas: ["No inferior a la de la estructura portante de su planta (tabla 3.2, nota 1)."] } : {}),
    tras,
  };
}

/**
 * Las dimensiones mínimas del Anejo C por clase R (feature-31): en tabla y no en
 * prosa, porque son dos cifras por R y por elemento y en una frase se pierden.
 * Son lo exigido; la obra las cumple al declarar la R de proyecto con el Anejo C.
 */
function tablaAnejoC(j: JustificacionSi6, tras: number): TablaMemoria | undefined {
  const el = j.elementos.find((x) => x.id === "hormigon");
  if (!el || el.detalle.clase !== "hormigon") return undefined;
  const d = el.detalle;
  const dec = j.decisiones;
  let notaGaraje = false;
  const filas = d.Rs.map((r) => {
    const enGaraje = d.garaje && j.plantas.some((p) => p.R === r && p.zonas.some((z) => z.zona.uso === "garaje"));
    const sinRevestir = enGaraje && dec.techoGaraje === "sin_revestir";
    // El techo del garaje sin revestir cambia la tabla del forjado unidireccional: la llamada (1).
    const nota = sinRevestir && dec.forjado === "unidireccional";
    notaGaraje ||= nota;
    return [`R ${r}`, textoSoporte(r).replace("soportes ", ""), `${textoForjado(dec.forjado, r, sinRevestir)}${nota ? " (1)" : ""}`];
  });
  if (filas.length === 0) return undefined;
  return {
    rotulo: "Dimensiones mínimas del hormigón armado (Anejo C)",
    cabecera: ["Clase", "Soportes (tabla C.2)", "Forjado"],
    columnas: ["texto", "norma", "norma"],
    filas,
    ...(notaGaraje ? { notas: ["Techo del garaje sin revestir: los nervios se dimensionan como vigas (tabla C.3)."] } : {}),
    tras,
  };
}

export function memoriaSi6(j: JustificacionSi6): MemoriaDoc {
  // La tabla de la R tras su criterio; la del Anejo C tras el párrafo del hormigón.
  const parrafos = [parrafoR(j), parrafoEscaleras(), parrafoHormigon(j)].filter((p) => p.length > 0);
  return {
    titulo: "Resistencia al fuego de la estructura",
    norma: "DB-SI 6",
    parrafos,
    tablas: soloTablas(tablaR(j, 1), tablaAnejoC(j, parrafos.length)),
    fuente: ["DB-SI · SI 6 (consolidado 4-mar-2025)", "tablas 3.1 y 3.2", j.decisiones.material === "hormigon" ? "Anejo C" : "", "datos de El edificio", `motor ${ENGINE_VERSION}`]
      .filter((x) => x)
      .join(" · "),
  };
}
