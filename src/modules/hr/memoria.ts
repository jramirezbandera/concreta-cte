// =============================================================================
// DB-HR — La memoria redactada (feature-25): el ámbito, lo que linda con las
// viviendas, el ruido exterior, las uniones e instalaciones, el tiempo de
// reverberación (que no se aplica a la vivienda) y la nota del Catálogo.
//
// Las cifras van en la ficha K.1 de la opción simplificada (feature-31, PLAN-
// MEMORIA §5.4.1): una tabla por bloque (tabiquería; separación vertical por
// recinto colindante; medianerías; separación horizontal por caso; fachadas y
// cubierta por recinto receptor; condicionantes), con una fila por parámetro,
// «Norma | Proyecto» y «Cumple». El texto se queda con lo que la tabla no dice.
// PURA.
// =============================================================================

import type { MemoriaDoc, Trozo, TablaMemoria, TipoColumna } from "../../lib/cte/presentacion";
import { cumpleTexto, NO_SE_EXIGE } from "../../lib/cte/tablaNorma";
import { listaY, mayuscula } from "../../lib/cte/redaccion";
import { ENGINE_VERSION } from "../../lib/version";
import type { ResultadoVertical } from "./comprobar";
import type { DetalleHr, ElementoHr, JustificacionHr, SolucionUsada } from "./justificacion";
import { EDICION_HR, LIMITES_HR, TRAMOS_HUECOS, tramoHuecos } from "./tablas";
import { COLUMNA_H, dB, dBA, kg, RELACION_HR, TABIQUERIA, textoSolucion } from "./textos";

const L = LIMITES_HR.datos;

type Detalle<C extends DetalleHr["clase"]> = Extract<DetalleHr, { clase: C }>;

function parrafoAmbito(j: JustificacionHr): Trozo[] {
  if (!j.aplica) {
    return ["La obra es una intervención en un edificio existente que no constituye rehabilitación integral, por lo que queda excluida del ámbito del DB-HR (Introducción II d)."];
  }
  // En un edificio existente, a qué se aplica lo dice la nota de alcance, que la
  // memoria pone delante: aquí solo el método (feature-28).
  if (j.existente) {
    return [
      j.tipologia === "plurifamiliar"
        ? "En la parte a la que se aplica, se justifica mediante la opción simplificada (ap. 3.1.2), con forjados de hormigón (ap. 3.1.2.1)."
        : "En la parte a la que se aplica, se justifica mediante la opción simplificada (ap. 3.1.2).",
    ];
  }
  switch (j.tipologia) {
    case "aislada":
      return [
        "La vivienda unifamiliar aislada, de nueva construcción, está dentro del ámbito del DB-HR (Introducción II). Al constituir una única unidad de uso, las exigencias con objeto son la tabiquería (RA ≥ 33 dBA, ap. 2.1.1 a.i), el aislamiento frente al ruido exterior de los recintos protegidos (ap. 2.1.1 a.iv, tablas 2.1 y 3.4) y el ruido y las vibraciones de las instalaciones (ap. 2.3 y 3.3).",
      ];
    case "adosada":
      return [
        "La vivienda unifamiliar adosada, de nueva construcción, está dentro del ámbito del DB-HR (Introducción II) y se justifica por la opción simplificada para vivienda unifamiliar adosada (Anejo I), con las fachadas y la cubierta por el ap. 3.1.2.5.",
      ];
    case "otros":
      return ["El edificio, de nueva construcción y sin viviendas, está dentro del ámbito del DB-HR (Introducción II). Este apartado justifica el aislamiento frente al ruido exterior; las separaciones entre las unidades de uso se justifican aparte."];
    default:
      return [
        "El edificio es de nueva construcción y de uso residencial privado, por lo que le es de aplicación el DB-HR (Introducción II), sin que concurra ninguna de las excepciones a) a d). Se justifica mediante la opción simplificada (ap. 3.1.2), con forjados de hormigón (ap. 3.1.2.1).",
      ];
  }
}

/** Qué linda con las viviendas: lo que se justifica y lo que el proyecto dice que no linda (K-HR.16). */
function parrafoColindancias(j: JustificacionHr): Trozo[] {
  const cs = j.separaciones.colindancias;
  if (cs.length === 0) return [];
  const lista = (xs: typeof cs) => xs.map((c) => `${c.nombre}, ${RELACION_HR[c.relacion]}`).join("; ");
  const si = cs.filter((c) => c.linda);
  const no = cs.filter((c) => !c.linda);
  const supuestas = si.filter((c) => c.supuesta).length;
  return [
    si.length > 0 ? `Recintos que lindan con las viviendas y cuyas separaciones se justifican: ${lista(si)}. ` : "Ningún otro recinto linda con las viviendas. ",
    no.length > 0 ? `Según el proyecto, no lindan con las viviendas: ${lista(no)}. ` : "",
    supuestas === 0
      ? "Las colindancias son las del proyecto."
      : supuestas === si.length
        ? "Sin la distribución en planta, se suponen todas del lado de la seguridad: lo que comparte planta con las viviendas, colindante, y lo de la planta de abajo, debajo."
        : "Las no indicadas se suponen del lado de la seguridad.",
  ];
}

/** Por qué el recinto del ascensor se separa como se separa (ap. 3.3.3.5); las cifras, en su tabla. */
function parrafoAscensor(j: JustificacionHr): Trozo[] {
  const d = detalle(j, "ascensor");
  if (!d) return [];
  return d.modo === "hueco"
    ? ["El ascensor tiene la maquinaria en el hueco, por lo que su recinto es un recinto de instalaciones y se separa de las viviendas con los valores entre paréntesis de la tabla 3.2 (ap. 3.3.3.5)."]
    : ["El ascensor tiene la maquinaria en un cuarto, por lo que a los elementos que separan su recinto de las viviendas se les pide RA mayor que 50 dBA (ap. 3.3.3.5)."];
}

/** El Ld, su origen y de dónde sale la exigencia; el D2m,nT,Atr de cada recinto va en el rótulo de su tabla. */
function parrafoExterior(j: JustificacionHr): Trozo[] {
  const d = j.elementos.map((e) => e.detalle).find((x): x is Detalle<"exterior"> => x.clase === "exterior" && x.recinto !== "cubierta");
  if (!d) return [];
  return [
    "Índice de ruido día de la zona ",
    { v: `Ld = ${dBA(j.ld.valor)}` },
    j.ld.supuesto ? " (valor por defecto del DB para áreas de predominio residencial, a falta de datos oficiales)" : " (mapa estratégico de ruido o administración competente)",
    j.ld.aeronaves ? ", con el ruido de aeronaves como ruido exterior dominante (+ 4 dBA)" : "",
    d.noExpuesta ? "; la fachada del recinto más desfavorable no está expuesta directamente, Ld − 10 dBA" : "",
    `. Con él se fija la exigencia de aislamiento acústico a ruido aéreo frente al exterior, D2m,nT,Atr, ${j.tipologia === "otros" ? "de los despachos" : "de los dormitorios y de las estancias"} (DB-HR ap. 2.1.1 a.iv y tabla 2.1), y con ella la fila de la tabla 3.4, que se comprueba en el recinto más desfavorable.`,
  ];
}

/** El forjado con la vivienda de arriba existente: la tabla comprueba el ruido aéreo; los impactos, por flexibilidad (feature-30; K-INT.11 y K-INT.13). */
function parrafoFlexibilidad(j: JustificacionHr): Trozo[] {
  const d = j.elementos.map((e) => e.detalle).find((x): x is Detalle<"horizontal"> => x.clase === "horizontal" && x.sueloExistente === true);
  if (!d) return [];
  return [
    "En el forjado con la vivienda superior existente, la tabla comprueba el ruido aéreo: el suelo de la vivienda superior no es objeto de la intervención y se toma sin mejora (ΔRA = 0). El aislamiento a ruido de impactos procedente de la vivienda superior depende de su suelo, que no es objeto de la intervención: la opción simplificada exige un suelo flotante en el recinto emisor (ap. 3.1.2.3.5 pto 2), que no puede disponerse desde la vivienda. Por inviabilidad técnica de intervenir fuera de la vivienda generada, se aplica el criterio de flexibilidad de la Parte I del CTE (art. 2.3): la solución adoptada mejora las prestaciones acústicas en la medida de lo posible, conforme a la recomendación de la Guía de aplicación del DB-HR (ap. 2.0.2, cambios de uso) para las intervenciones que solo pueden realizarse por el interior de la vivienda generada. En la documentación final de la obra quedará constancia del nivel de prestación alcanzado.",
  ];
}

// ── La ficha K.1 (feature-31) ───────────────────────────────────────────────

/** «Elemento | Solución | Parámetro | Norma | Proyecto | Cumple», igual en todos los bloques. */
const CABECERA_K1 = ["Elemento", "Solución", "Parámetro", "Norma", "Proyecto", "Cumple"];
const COLUMNAS_K1: TipoColumna[] = ["texto", "texto", "texto", "norma", "proyecto", "cumple"];

/** Una fila por parámetro: «m», lo exigido, lo de proyecto y si llega. */
type Parametro = [parametro: string, norma: string, proyecto: string, cumple: boolean];

/** Una parte del elemento (elemento base, trasdosado, suelo flotante…) con su solución y sus parámetros. */
interface ParteK1 {
  elemento: string;
  solucion: string;
  parametros: Parametro[];
}

/** Un bloque de la ficha: la parte y su solución solo en su primera fila, como la ficha K.1. */
function bloque(rotulo: string, partes: ParteK1[], notas: string[] = []): TablaMemoria | undefined {
  const filas = partes.flatMap((p) => p.parametros.map(([par, n, pr, ok], i) => [i === 0 ? p.elemento : "", i === 0 ? p.solucion : "", par, n, pr, cumpleTexto(ok)]));
  if (filas.length === 0) return undefined;
  return { rotulo, cabecera: CABECERA_K1, columnas: COLUMNAS_K1, filas, ...(notas.length > 0 ? { notas } : {}) };
}

function detalle<C extends DetalleHr["clase"]>(j: JustificacionHr, clase: C, id?: string): Detalle<C> | undefined {
  const el = j.elementos.find((e) => e.detalle.clase === clase && (id === undefined || e.id === id));
  return el?.detalle as Detalle<C> | undefined;
}

const ge = (x: number, u: (n: number) => string) => `≥ ${u(x)}`;
/** «LP ½ pie… (CEC P1.4, p. 101), por ambas caras». */
const conCaras = (t: SolucionUsada & { unaCara: boolean }) => `${textoSolucion(t)}, por ${t.unaCara ? "una cara" : "ambas caras"}`;

function tablaTabiqueria(j: JustificacionHr): TablaMemoria | undefined {
  const d = detalle(j, "tabiqueria");
  if (!d) return undefined;
  return bloque("Tabiquería", [
    {
      elemento: mayuscula(TABIQUERIA[d.tipo]),
      solucion: textoSolucion(d.sol),
      parametros: [
        ["m", d.exigeM === null ? NO_SE_EXIGE : ge(d.exigeM, kg), kg(d.m), d.exigeM === null || d.m >= d.exigeM],
        ["RA", ge(d.exigeRA, dBA), dBA(d.RA), d.RA >= d.exigeRA],
      ],
    },
  ]);
}

/** Elemento base y trasdosado frente a la fila de la tabla 3.2; la llamada (1) va en la primera norma. */
function partesVertical(b: Detalle<"ascensor">["cerramiento"], r: ResultadoVertical): ParteK1[] {
  const f = r.fila;
  const sin = "sin fila en la tabla 3.2";
  const tr = b.trasdosado;
  const exige = r.dRAExigido;
  return [
    {
      elemento: "Elemento base",
      solucion: textoSolucion(b.sol),
      parametros: [
        ["m", f ? `${ge(f.m, kg)} (1)` : `${sin} (1)`, kg(b.m), f !== null && b.m >= f.m],
        ["RA", f ? ge(f.RA, dBA) : sin, dBA(b.RA), f !== null && b.RA >= f.RA],
      ],
    },
    {
      elemento: "Trasdosado",
      solucion: tr ? conCaras(tr) : "sin trasdosado",
      parametros: [["ΔRA", !f ? sin : exige === null ? NO_SE_EXIGE : ge(exige, dBA), tr ? dBA(tr.dRA) : "no lleva", f !== null && (exige === null || (tr !== null && tr.dRA >= exige))]],
    },
  ];
}

/** «Tabla 3.2, elementos de tipo 2, columna de tabiquería de fábrica…». */
function notaVertical(r: ResultadoVertical, columna: "fabrica" | "entramado" | null, paren: string | null, unaCara: boolean): string {
  return [
    `Tabla 3.2${r.fila ? `, elementos de tipo ${r.fila.tipo}` : ""}`,
    columna ? `, columna de tabiquería de ${columna === "fabrica" ? "fábrica" : "entramado"}` : "",
    paren ? `; valores entre paréntesis, ${paren}` : "",
    unaCara && r.dRAExigido !== null ? `; trasdosado por una cara, + ${L.trasdosadoUnaCara} dBA` : "",
    ".",
  ].join("");
}

/** La puerta de entrada y el cerramiento en que se sitúa (ap. 3.1.2.3.4 pto 4). */
function partesPuerta(d: Detalle<"puerta">, cerramiento: string): ParteK1[] {
  return [
    {
      elemento: "Puerta de entrada",
      solucion: d.abre === "estancia" ? "abre a una estancia" : "abre a un vestíbulo",
      // Sin dato, el proyecto declara el valor y lo exige en el pliego.
      parametros: [["RA", ge(d.exige, dBA), d.RA === null ? `${ge(d.exige, dBA)}, en el pliego` : dBA(d.RA), d.RA === null || d.RA >= d.exige]],
    },
    {
      elemento: "Cerramiento con la puerta",
      solucion: cerramiento,
      parametros: [["RA", ge(L.cerramientoConPuertaRA, dBA), dBA(d.cerramientoRA), d.cerramientoRA >= L.cerramientoConPuertaRA]],
    },
  ];
}

/** Separación vertical: un bloque por recinto colindante (unidades de uso y zonas comunes; actividad e instalaciones; el ascensor; las adosadas). */
function tablasVerticales(j: JustificacionHr): (TablaMemoria | undefined)[] {
  const out: (TablaMemoria | undefined)[] = [];
  const puerta = detalle(j, "puerta");
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "vertical") {
      const actividad = d.caso === "actividad";
      const rotulo =
        j.tipologia === "adosada"
          ? "Elementos de separación verticales con las viviendas adosadas"
          : `Elementos de separación verticales ${actividad ? "con recintos de actividad o de instalaciones" : "con otras unidades de uso o zonas comunes"}: ${d.separa.join(", ")}`;
      const partes = partesVertical({ sol: d.sol, m: d.m, RA: d.RA, trasdosado: d.trasdosado }, d.r);
      // La puerta de entrada abre a la zona común: va con su elemento de separación.
      if (el.id === "separacion" && puerta) partes.push(...partesPuerta(puerta, d.trasdosado ? "elemento base con su trasdosado" : "elemento base"));
      out.push(bloque(rotulo, partes, [notaVertical(d.r, d.columna, actividad ? "por lindar con recintos de actividad o de instalaciones" : null, d.trasdosado?.unaCara === true)]));
    }
    if (d.clase === "adosada") {
      out.push(
        bloque("Elementos de separación verticales con las viviendas adosadas", [{ elemento: "Cada una de las dos hojas", solucion: textoSolucion(d.sol), parametros: [["RA", `${ge(d.exige, dBA)} (1)`, dBA(d.RA), d.RA >= d.exige]] }], [
          "Con estructura independiente, dos hojas (Anejo I.1.2 pto 1).",
        ]),
      );
    }
    if (d.clase === "ascensor") {
      const c = d.cerramiento;
      out.push(
        d.r
          ? bloque("Elementos de separación verticales con el recinto del ascensor", partesVertical(c, d.r), [notaVertical(d.r, null, "por ser recinto de instalaciones", c.trasdosado?.unaCara === true)])
          : bloque("Elementos de separación verticales con el recinto del ascensor", [
              {
                elemento: "Cerramiento del recinto",
                solucion: `${textoSolucion(c.sol)}${c.trasdosado ? `, con trasdosado ${conCaras(c.trasdosado)}` : ""}`,
                parametros: [["RA", `> ${dBA(L.ascensorRA)}`, dBA(d.RA), d.RA > L.ascensorRA]],
              },
            ]),
      );
    }
  }
  // Sin elemento de separación con la zona común, la puerta va sola.
  if (puerta && !j.elementos.some((e) => e.id === "separacion")) out.push(bloque("Puerta de entrada a la vivienda", partesPuerta(puerta, "elemento de separación")));
  return out;
}

function tablaMedianeria(j: JustificacionHr): TablaMemoria | undefined {
  const d = detalle(j, "medianeria");
  if (!d) return undefined;
  return bloque("Medianerías", [{ elemento: "Medianería", solucion: textoSolucion(d.sol), parametros: [["RA", `${ge(d.exige, dBA)} (1)`, dBA(d.RA), d.RA >= d.exige]] }], [
    "RA del conjunto de la medianería (ap. 3.1.2.4), con lo que se satisfacen las exigencias del ap. 2.1.1 c).",
  ]);
}

const CASO_H: Record<Detalle<"horizontal">["caso"], string> = {
  viviendas: "entre viviendas",
  comun: "sobre zonas comunes",
  actividad: "sobre recintos de actividad o de instalaciones",
  encima: "bajo recintos de actividad o de instalaciones",
};

/** Separación horizontal, un bloque por caso: forjado, suelo flotante y techo suspendido frente a la tabla 3.3. */
function tablaHorizontal(d: Detalle<"horizontal">): TablaMemoria | undefined {
  const f = d.r.fila;
  const c = d.r.comb;
  const sin = "sin fila en la tabla 3.3";
  // Lo que pide la combinación de la tabla a cada capa: (0) es que no se le pide nada.
  const pide = (x: number | undefined) => (!f ? sin : x === undefined ? "sin combinación" : x === 0 ? NO_SE_EXIGE : ge(x, dBA));
  const llega = (dRA: number, x: number | undefined) => f !== null && x !== undefined && dRA >= x;
  const partes: ParteK1[] = [
    {
      elemento: "Forjado",
      solucion: textoSolucion(d.forjado),
      parametros: [
        ["m", f ? `${ge(f.m, kg)} (1)` : `${sin} (1)`, kg(d.forjado.m), f !== null && d.forjado.m >= f.m],
        ["RA", f ? ge(f.RA, dBA) : sin, dBA(d.forjado.RA), f !== null && d.forjado.RA >= f.RA],
      ],
    },
    d.sueloExistente
      ? // Sin ΔLw: con el suelo de arriba existente, los impactos van por flexibilidad (párrafo de debajo).
        { elemento: "Suelo de la vivienda superior", solucion: "existente, no es objeto de la intervención", parametros: [["ΔRA", pide(c?.sf), `${dBA(0)}, sin mejora`, llega(0, c?.sf)]] }
      : {
          elemento: "Suelo flotante",
          solucion: textoSolucion(d.suelo),
          parametros: [
            ["ΔRA", pide(c?.sf), dBA(d.suelo.dRA), llega(d.suelo.dRA, c?.sf)],
            ["ΔLw", !f ? sin : d.r.dLwExigido === null ? NO_SE_EXIGE : ge(d.r.dLwExigido, dB), dB(d.suelo.dLw), f !== null && (d.r.dLwExigido === null || d.suelo.dLw >= d.r.dLwExigido)],
          ],
        },
    { elemento: "Techo suspendido", solucion: d.techo ? textoSolucion(d.techo) : "sin techo suspendido", parametros: [["ΔRA", pide(c?.ts), d.techo ? dBA(d.techo.dRA) : "no lleva", llega(d.techo?.dRA ?? 0, c?.ts)]] },
  ];
  const paren = d.caso === "actividad" || d.caso === "encima";
  const nota = [
    `Tabla 3.3, columna de ${COLUMNA_H[d.columna]}`,
    paren ? "; fila entre paréntesis, por ser recinto de actividad o de instalaciones" : "",
    c?.garaje ? "; solución para garaje" : "",
    f?.eps && d.forjado.eps && d.r.dLwExigido !== null ? "; el ΔLw sube 4 dB por el forjado con EPS" : "",
    ".",
  ].join("");
  const rotulo = d.sueloExistente
    ? `Elementos de separación horizontales bajo las viviendas existentes de ${listaY(d.separa.map((s) => s.replace(/^viviendas existentes de /, "")))}`
    : `Elementos de separación horizontales ${CASO_H[d.caso]}: ${d.separa.join(", ")}`;
  return bloque(rotulo, partes, [nota]);
}

/** Los forjados compartidos de la adosada (tabla I.1). */
function tablaForjadoAdosada(d: Detalle<"forjado-adosada">): TablaMemoria | undefined {
  const f = d.r.fila;
  const sin = "sin fila en la tabla I.1";
  return bloque(
    "Forjados compartidos con las viviendas adosadas",
    [
      { elemento: "Forjado", solucion: textoSolucion(d.forjado), parametros: [["m", f ? `${ge(f.m, kg)} (1)` : `${sin} (1)`, kg(d.forjado.m), f !== null && d.forjado.m >= f.m]] },
      {
        elemento: "Suelo flotante",
        solucion: textoSolucion(d.suelo),
        parametros: [
          ["ΔRA", d.r.dRAExigido === null ? sin : d.r.dRAExigido === 0 ? NO_SE_EXIGE : ge(d.r.dRAExigido, dBA), dBA(d.suelo.dRA), d.r.dRAExigido !== null && d.suelo.dRA >= d.r.dRAExigido],
          ["ΔLw", d.r.dLwExigido === null ? sin : ge(d.r.dLwExigido, dB), dB(d.suelo.dLw), d.r.dLwExigido !== null && d.suelo.dLw >= d.r.dLwExigido],
        ],
      },
    ],
    [`Tabla I.1 (Anejo I.1.3), con elemento de separación vertical de tipo ${d.tipo}.`],
  );
}

function tablasHorizontales(j: JustificacionHr): (TablaMemoria | undefined)[] {
  return j.elementos.map((el) => (el.detalle.clase === "horizontal" ? tablaHorizontal(el.detalle) : el.detalle.clase === "forjado-adosada" ? tablaForjadoAdosada(el.detalle) : undefined));
}

const RECINTO_EXT: Record<Detalle<"exterior">["recinto"], string> = {
  dormitorios: "dormitorios",
  estancias: "estancias",
  administrativo: "despachos",
  cubierta: "recintos bajo cubierta",
};

/** Parte ciega y huecos (o la cubierta) frente a la tabla 3.4; `n` es el número de la primera nota de esta parte. */
function partesExterior(d: Detalle<"exterior">, n: number): { partes: ParteK1[]; notas: string[] } {
  const fuera = "fuera de la tabla 3.4";
  const sinNivel = d.r.nivel === null;
  const ciega: Parametro = [
    "RA,tr",
    sinNivel ? fuera : d.r.ciegaExigida === null ? NO_SE_EXIGE : ge(d.r.ciegaExigida, dBA),
    dBA(d.ciega.RAtr),
    !sinNivel && (d.r.ciegaExigida === null || d.ciega.RAtr >= d.r.ciegaExigida),
  ];
  if (d.recinto === "cubierta") return { partes: [{ elemento: "Cubierta", solucion: textoSolucion(d.ciega), parametros: [ciega] }], notas: [] };
  const h = d.hueco;
  const notas = [`Tabla 3.4, huecos ${TRAMOS_HUECOS[tramoHuecos(d.pct)]}, con la parte ciega de proyecto.`];
  // La ventana y la caja de persiana, combinadas (Anejo G, G.1; K-CEC.8).
  if (h?.caja) notas.push(`Ventana de ${dBA(h.ventanaRAtr)} y caja de persiana ${h.caja.codigo} de ${dBA(h.caja.RAtr)}, combinadas (Anejo G, G.1).`);
  return {
    partes: [
      { elemento: "Parte ciega", solucion: textoSolucion(d.ciega), parametros: [ciega] },
      {
        elemento: `Huecos, ${d.pct} %${d.pctSupuesto ? " (supuesto)" : ""}`,
        solucion: h ? `${textoSolucion(h)}${h.caja ? `, con caja de persiana ${h.caja.codigo}` : ""}` : "sin huecos",
        parametros: [
          [
            "RA,tr",
            sinNivel ? fuera : d.r.huecoExigido === null ? `${NO_SE_EXIGE} (${n})` : `${ge(d.r.huecoExigido, dBA)} (${n})`,
            `${dBA(h?.RAtr ?? 0)}${h?.caja ? ` (${n + 1})` : ""}`,
            d.r.cumple,
          ],
        ],
      },
    ],
    notas,
  };
}

/**
 * Fachadas y cubierta frente al exterior, un bloque por recinto receptor, con el
 * Ld y el D2m,nT,Atr en el rótulo. La cubierta, que se comprueba como la de los
 * dormitorios (o los despachos), va en ese bloque si la exigencia es la misma.
 */
function tablasExterior(j: JustificacionHr): (TablaMemoria | undefined)[] {
  const ext = j.elementos.filter((e): e is ElementoHr & { detalle: Detalle<"exterior"> } => e.detalle.clase === "exterior");
  const fachadas = ext.filter((e) => e.detalle.recinto !== "cubierta");
  const cub = ext.find((e) => e.detalle.recinto === "cubierta");
  const conCubierta = cub ? fachadas.find((e) => !e.id.endsWith("-pb") && e.detalle.recinto !== "estancias" && e.detalle.D === cub.detalle.D) : undefined;
  const rotulo = (d: Detalle<"exterior">, que: string) => `${que}: Ld = ${dBA(d.ld)}, D2m,nT,Atr ≥ ${dBA(d.D)}`;
  const out: (TablaMemoria | undefined)[] = fachadas.map((el) => {
    const d = el.detalle;
    const { partes, notas } = partesExterior(d, 1);
    const pb = el.id.endsWith("-pb") ? " de la planta baja" : "";
    if (el === conCubierta && cub) partes.push(...partesExterior(cub.detalle, notas.length + 1).partes);
    return bloque(rotulo(d, `${el === conCubierta ? "Fachada y cubierta" : "Fachada"}${pb}, ${RECINTO_EXT[d.recinto]}`), partes, notas);
  });
  if (cub && !conCubierta) out.push(bloque(rotulo(cub.detalle, "Cubierta"), partesExterior(cub.detalle, 1).partes));
  return out;
}

/**
 * Los condicionantes de las soluciones que el motor conoce (notas y flancos de
 * la tabla 3.2, condiciones de fachada de la tabla 3.3): uno por fila, con los
 * elementos a los que afecta. Lo que ya es una fila de su bloque (el ΔRA del
 * trasdosado) no se repite. Sin condicionantes, no sale.
 */
function tablaCondicionantes(j: JustificacionHr): TablaMemoria | undefined {
  const porTexto = new Map<string, { elementos: string[]; cumple: boolean | null }>();
  const poner = (nombre: string, cs: readonly { texto: string; cumple: boolean | null }[]) => {
    for (const c of cs) {
      if (/^Trasdosado ΔRA/.test(c.texto)) continue;
      const x = porTexto.get(c.texto) ?? { elementos: [], cumple: c.cumple };
      if (!x.elementos.includes(nombre)) x.elementos.push(nombre);
      porTexto.set(c.texto, x);
    }
  };
  for (const el of j.elementos) {
    const d = el.detalle;
    // Sin fila en la tabla, su bloque ya dice que no cumple.
    if (d.clase === "vertical" && d.r.fila) poner(el.nombre, [...d.r.condiciones, ...d.r.flancos]);
    if (d.clase === "ascensor" && d.r?.fila) poner(el.nombre, [...d.r.condiciones, ...d.r.flancos]);
    if (d.clase === "horizontal") poner(el.nombre, d.flancos);
  }
  if (porTexto.size === 0) return undefined;
  return {
    rotulo: "Condicionantes de las soluciones",
    cabecera: ["Elemento", "Condición", "Cumple"],
    columnas: ["texto", "texto", "cumple"],
    // Las que solo se declaran (bandas en los encuentros, un criterio), «Se declara».
    filas: [...porTexto].map(([texto, x]) => [x.elementos.join("; "), texto, x.cumple === null ? "Se declara" : cumpleTexto(x.cumple)]),
  };
}

const REVERBERACION =
  "El edificio es de uso residencial privado: no le son de aplicación los valores límite de tiempo de reverberación ni de absorción acústica en zonas comunes (ap. 2.2, que se refiere a aulas, salas de conferencias, comedores y restaurantes, y a zonas comunes de edificios de uso residencial público, docente y hospitalario).";

const CATALOGO =
  "Los valores de los elementos son los mínimos del Catálogo de Elementos Constructivos del CTE (versión de marzo de 2010), que tienen garantía legal para las soluciones que se construyen en obra; los de productos industriales son orientativos y se exigirán con su ensayo en el pliego de condiciones.";

export function memoriaHr(j: JustificacionHr): MemoriaDoc {
  const fuente = [`${EDICION_HR}`, "opción simplificada, ap. 3.1.2", "Catálogo de Elementos Constructivos (CEC, marzo 2010)", `motor ${ENGINE_VERSION}`].join(" · ");
  const titulo = "Protección frente al ruido";
  if (!j.aplica) return { titulo, norma: "DB-HR", parrafos: [parrafoAmbito(j)], fuente };
  const parrafos: Trozo[][] = [];
  const tablas: TablaMemoria[] = [];
  const parrafo = (p: Trozo[]) => {
    if (p.length > 0) parrafos.push(p);
  };
  // Cada tabla, tras los párrafos que ya hay.
  const tabla = (...ts: (TablaMemoria | undefined)[]) => {
    for (const t of ts) if (t) tablas.push({ ...t, tras: parrafos.length });
  };
  parrafo(parrafoAmbito(j));
  parrafo(parrafoColindancias(j));
  parrafo(parrafoAscensor(j));
  // Tabiquería, separaciones verticales, medianerías y horizontales; después, lo que la tabla del forjado existente no dice.
  tabla(tablaTabiqueria(j), ...tablasVerticales(j), tablaMedianeria(j), ...tablasHorizontales(j));
  parrafo(parrafoFlexibilidad(j));
  // El ruido exterior: el Ld y su origen, y las fachadas.
  parrafo(parrafoExterior(j));
  tabla(...tablasExterior(j));
  tabla(tablaCondicionantes(j));
  const inst = detalle(j, "instalaciones");
  if (inst) {
    parrafo([`Se cumplen las condiciones de diseño de las uniones entre elementos constructivos (ap. 3.1.4) y las de ruido y vibraciones de las instalaciones (ap. 3.3): ${inst.condiciones.map((c) => c.charAt(0).toLowerCase() + c.slice(1)).join("; ")}.`]);
  }
  if (j.tipologia !== "otros") parrafo([REVERBERACION]);
  parrafo([j.medios ? CATALOGO.replace("los mínimos", "los medios") : CATALOGO]);
  return { titulo, norma: "DB-HR", parrafos, tablas, fuente };
}
