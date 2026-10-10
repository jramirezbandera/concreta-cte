// =============================================================================
// DB-SUA, SUA 8 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cuentas y su cita. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
//
// Las cuentas van en una tabla «Parámetro | Valor | Referencia» (feature-31):
// Ng, Ae, C1, Ne, C2 a C5, Na y, si hace falta instalación, E y el nivel. El
// texto se queda con la conclusión (Ne frente a Na) y el Anejo B.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSua8, JustificacionSua8 } from "./justificacion";
import { SUA8_ANEJO_B, SUA8_C4, SUA8_C5, SUA8_NIVELES, SUA8_SIEMPRE, type EntornoC1, type NivelProteccion } from "./tablas";
import { frecuencia, NOMBRE_MATERIAL, textoE } from "./textos";

const B = SUA8_ANEJO_B.datos;

/** El entorno de la tabla 1.1, corto para la celda. */
const ENTORNO_CORTO: Record<EntornoC1, string> = {
  proximo: "próximo a edificios o árboles de su altura",
  rodeado_bajos: "rodeado de edificios más bajos",
  aislado: "aislado",
  colina: "aislado sobre una colina",
};

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

function detalle<C extends DetalleSua8["clase"]>(j: JustificacionSua8, clase: C): Extract<DetalleSua8, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua8, { clase: C }>) : null;
}

/** Un límite de eficiencia con sus dos decimales, como la tabla 2.1: «0,80». */
function limiteE(e: number): string {
  return e.toFixed(2).replace(".", ",");
}

/** «tabla 2.1: 0,80 ≤ E < 0,95». */
function tramoE(nivel: NivelProteccion): string {
  const t = SUA8_NIVELES.datos;
  const i = t.findIndex((n) => n.nivel === nivel);
  // El nivel 1 no tiene tope: «E ≥ 0,98».
  if (i === 0) return `tabla 2.1: E ≥ ${limiteE(t[0].eMin)}`;
  const desde = t[i].eMin > 0 ? `${limiteE(t[i].eMin)} ≤ ` : "";
  return `tabla 2.1: ${desde}E < ${limiteE(t[i - 1].eMin)}`;
}

/**
 * Los parámetros de la evaluación (feature-31): Ng, Ae, C1 y Ne; C2 a C5 y Na;
 * y, si hace falta instalación, E y el nivel. Cada uno con su tabla o apartado
 * del DB y el porqué corto; la geometría de Ae, en la nota.
 */
function tablaParametros(j: JustificacionSua8): TablaMemoria {
  const a = detalle(j, "altura")!;
  const n = detalle(j, "ne")!;
  const k = detalle(j, "na")!;
  const d = detalle(j, "proteccion")!;
  const dec = j.decisiones;
  const c2 =
    dec.estructura === dec.cubierta
      ? `estructura y cubierta ${NOMBRE_MATERIAL[dec.estructura]}`
      : `estructura ${NOMBRE_MATERIAL[dec.estructura]}, cubierta ${NOMBRE_MATERIAL[dec.cubierta]}`;
  const c4 = k.c4Supuesto
    ? "local sin uso, como Comercial"
    : k.c4 === SUA8_C4.datos.publicaConcurrenciaSanitarioComercialDocente
      ? "uso Comercial"
      : "resto de edificios";
  const c5 = k.c5 === SUA8_C5.datos.servicioImprescindible ? "servicio imprescindible" : "resto de edificios";
  const filas: string[][] = [
    [
      "Ng, densidad de impactos sobre el terreno",
      `${fmt(n.ng, undefined, 2)} impactos/año·km²`,
      // La coletilla del supuesto la quita la memoria del expediente (feature-29).
      n.ngSupuesto ? "figura 1.1: el mayor valor del mapa, a falta del leído para el municipio" : "figura 1.1: municipio de la obra",
    ],
    ["Ae, superficie de captura equivalente", `${fmt(a.ae_m2, "m²", 0)} (1)`, "ap. 1 pto 3"],
    ["C1, entorno", fmt(n.c1, undefined, 2), `tabla 1.1: ${ENTORNO_CORTO[dec.entorno]}`],
    ["Ne, frecuencia esperada de impactos", `${frecuencia(n.ne)} impactos/año`, "ap. 1 pto 3: Ne = Ng · Ae · C1 · 10⁻⁶"],
    ["C2, tipo de construcción", fmt(k.c2, undefined, 2), `tabla 1.2: ${c2}`],
    ["C3, contenido", fmt(k.c3, undefined, 0), `tabla 1.3: ${dec.contenido === "inflamable" ? "contenido inflamable" : "otros contenidos"}`],
    ["C4, uso", fmt(k.c4, undefined, 1), `tabla 1.4: ${c4}`],
    ["C5, continuidad de la actividad", fmt(k.c5, undefined, 0), `tabla 1.5: ${c5}`],
    ["Na, riesgo admisible", `${frecuencia(k.na)} impactos/año`, "ap. 1 pto 4: Na = 5,5 / (C2 · C3 · C4 · C5) · 10⁻³"],
  ];
  if (d.siempre) {
    // Siempre nivel 1, sea cual sea Ne frente a Na (ap. 1 pto 2).
    const porque = d.siempre === "altura" ? `altura mayor que ${fmt(SUA8_SIEMPRE.datos.alturaMayorQue_m, "m", 0)}` : "sustancias peligrosas";
    filas.push(["E, eficiencia requerida", `≥ ${limiteE(SUA8_SIEMPRE.datos.eficienciaMin)}`, `ap. 1 pto 2: ${porque}`]);
    filas.push(["Nivel de protección", "1", tramoE(1)]);
  } else if (d.e !== null && d.nivel !== null) {
    // Con Ne ≤ Na la tabla acaba en Na: no hay eficiencia que pedir.
    filas.push(["E, eficiencia requerida", textoE(d.e), "ap. 2: E = 1 − Na/Ne"]);
    filas.push(["Nivel de protección", String(d.nivel), tramoE(d.nivel)]);
  }
  return {
    cabecera: ["Parámetro", "Valor", "Referencia"],
    columnas: ["texto", "dato", "texto"],
    filas,
    notas: [
      `Delimitada por una línea trazada a una distancia 3H del perímetro de una planta de ${m(a.largo_m, 1)} × ${m(a.ancho_m, 1)}${a.plantaSupuesta ? " (supuesta cuadrada, con la superficie de la cubierta)" : ""}, con una altura H = ${m(a.h_m)}.`,
    ],
    tras: 0,
  };
}

function parrafoConclusion(j: JustificacionSua8): Trozo[] {
  // Ne, Na, E y el nivel van en la tabla (feature-31): aquí, la conclusión y su porqué.
  const d = detalle(j, "proteccion")!;
  if (d.siempre === "peligrosas") {
    return [
      "En el edificio se manipulan sustancias tóxicas, radioactivas, altamente inflamables o explosivas: sea cual sea la frecuencia esperada de impactos, ",
      { v: "dispone de un sistema de protección contra el rayo" },
      " de nivel de protección 1 (SUA 8, ap. 1 pto 2 y tabla 2.1).",
    ];
  }
  if (d.siempre === "altura") {
    return [
      `La altura del edificio es superior a ${fmt(SUA8_SIEMPRE.datos.alturaMayorQue_m, "m", 0)}: sea cual sea la frecuencia esperada de impactos, `,
      { v: "dispone de un sistema de protección contra el rayo" },
      " de nivel de protección 1 (SUA 8, ap. 1 pto 2 y tabla 2.1).",
    ];
  }
  if (!d.necesaria) {
    return ["Al no ser la frecuencia esperada de impactos Ne mayor que el riesgo admisible Na, ", { v: "no es necesaria la instalación" }, " de un sistema de protección contra el rayo (SUA 8, ap. 1 pto 1)."];
  }
  if (!d.obligatoria) {
    const p: Trozo[] = [
      "Al ser la frecuencia esperada de impactos Ne mayor que el riesgo admisible Na, la eficiencia requerida E = 1 − Na/Ne es menor que 0,80, que corresponde al nivel de protección 4 (SUA 8, ap. 2, tabla 2.1). Dentro de estos límites de eficiencia requerida ",
      { v: "la instalación de protección contra el rayo no es obligatoria" },
      " (nota 1 de la tabla 2.1).",
    ];
    if (d.instalacion === "si") p.push(" No obstante, se proyecta una instalación de nivel de protección 4 conforme al Anejo B.");
    return p;
  }
  const p: Trozo[] = [
    "Al ser la frecuencia esperada de impactos Ne mayor que el riesgo admisible Na, ",
    { v: "es necesaria la instalación" },
    " de un sistema de protección contra el rayo, con el nivel de protección que corresponde a la eficiencia requerida E = 1 − Na/Ne (SUA 8, ap. 2, tabla 2.1).",
  ];
  if (d.instalacion === "no") p.push(" La instalación no está proyectada y debe proyectarse.");
  return p;
}

function parrafoSistema(j: JustificacionSua8): Trozo[] {
  const s = detalle(j, "sistema");
  if (!s) return [];
  return [
    `El sistema de protección cumple el Anejo SUA B para el nivel ${s.nivel}: sistema externo con captadores (puntas, malla conductora o pararrayos con dispositivo de cebado) y derivadores, con malla de dimensión mayor no superior a `,
    { v: fmt(B.reticula_m[s.nivel], "m", 0) },
    ` (tabla B.3), radio de la esfera rodante de ${fmt(B.radioEsfera_m[s.nivel], "m", 0)} (tabla B.2) y separación media de los conductores de bajada no mayor que ${fmt(B.bajantesMalla_m[s.nivel], "m", 0)} (tabla B.5)${s.h_m > B.dosBajantesSiAlturaMayorQue_m ? ", con dos derivadores como mínimo" : ""}; sistema interno que une a la estructura las instalaciones metálicas y los circuitos eléctricos y de telecomunicación mediante conductores de equipotencialidad o protectores de sobretensiones; y red de tierra adecuada para dispersar en el terreno la corriente de las descargas atmosféricas.`,
  ];
}

/**
 * Un edificio existente en el que la obra no cambia la evaluación (feature-30;
 * K-INT.9, tabla 1.4 cotejada en imagen): basta dejarlo escrito. Las cifras de
 * antes y después van en su tabla (feature-31).
 */
function parrafoSinVariacion(j: JustificacionSua8): Trozo[] {
  const ex = j.existente!;
  const c4 =
    ex.c4 === ex.c4Antes
      ? ex.c4 > 1
        ? "; como el edificio conserva un uso al que esa tabla asigna un coeficiente mayor que al resto de edificios, se mantiene ese coeficiente, el más desfavorable, y el riesgo admisible Na no varía"
        : ", que no cambia, por lo que el riesgo admisible Na no varía"
      : ", que baja con el nuevo uso, por lo que el riesgo admisible Na aumenta";
  return [
    `La intervención no modifica las dimensiones del edificio ni su entorno, por lo que la frecuencia esperada de impactos Ne no varía (SUA 8 ap. 1 pto 3). El coeficiente C4 depende del uso del edificio (ap. 1 pto 4, tabla 1.4)${c4}. La evaluación del ap. 1 es, por tanto, la del edificio preexistente, y el cambio de uso no aumenta la exigencia de protección. No se actúa sobre ninguna instalación de protección contra el rayo existente (DB-SUA, Introducción III, criterio 4).`,
  ];
}

/** Lo que la obra cambia y lo que no, antes y después (feature-31): Ne, C4 y Na. */
function tablaSinVariacion(j: JustificacionSua8): TablaMemoria {
  const ex = j.existente!;
  const r = j.resultado;
  return {
    cabecera: ["Parámetro", "Antes de la obra", "Después", "Referencia"],
    columnas: ["texto", "dato", "dato", "texto"],
    filas: [
      ["Ne, frecuencia esperada de impactos", `${frecuencia(ex.neAntes)} impactos/año`, `${frecuencia(r.ne)} impactos/año`, "ap. 1 pto 3"],
      ["C4, uso", fmt(ex.c4Antes, undefined, 1), fmt(ex.c4, undefined, 1), "tabla 1.4"],
      ["Na, riesgo admisible", `${frecuencia(ex.naAntes)} impactos/año`, `${frecuencia(r.na)} impactos/año`, "ap. 1 pto 4"],
    ],
  };
}

export function memoriaSua8(j: JustificacionSua8): MemoriaDoc {
  if (j.existente?.sinVariacion) {
    const mixto = j.existente.c4 === j.existente.c4Antes && j.existente.c4 > 1;
    return {
      titulo: "Seguridad frente al riesgo causado por la acción del rayo",
      norma: "DB-SUA 8",
      parrafos: [parrafoSinVariacion(j)],
      tablas: [tablaSinVariacion(j)],
      fuente: [
        "DB-SUA · SUA 8 (consolidado 14-jun-2022)",
        "ap. 1, tabla 1.4",
        "Introducción III, criterio 4",
        ...(mixto ? ["coeficiente más desfavorable: comentario del Ministerio (DccSUA 15-jul-2024), no reglamentario"] : []),
        "datos de El edificio",
        `motor ${ENGINE_VERSION}`,
      ].join(" · "),
    };
  }
  // La tabla abre el apartado; detrás, la conclusión y, si se proyecta, el sistema.
  const parrafos = [parrafoConclusion(j), parrafoSistema(j)].filter((p) => p.length > 0);
  return {
    titulo: "Seguridad frente al riesgo causado por la acción del rayo",
    norma: "DB-SUA 8",
    parrafos,
    tablas: soloTablas(tablaParametros(j)),
    fuente: ["DB-SUA · SUA 8 (consolidado 14-jun-2022)", j.decisiones.instalacion === "si" ? "ap. 1, ap. 2 y Anejo B" : "ap. 1 y ap. 2", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
