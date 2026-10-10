// =============================================================================
// DB-SUA, SUA 2 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Lo declarativo (vuelos,
// salientes, vaivén, mamparas, atrapamiento) va aquí aunque no tenga decisión.
// Se redacta solo a partir de la justificación. PURA.
//
// Las tablas «Norma | Proyecto» (feature-31): la altura libre por zona con los
// umbrales, los salientes y el barrido de las puertas; los vidrios por planta
// (fila de la tabla 1.1); la señalización y las correderas. El texto se queda
// con el criterio y las condiciones sin cifra.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { COLUMNAS_NORMA, cumpleTexto, tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { ENGINE_VERSION } from "../../lib/version";
import { lista, metros } from "../sua/colocar";
import type { DetalleSua2, JustificacionSua2 } from "./justificacion";
import { ALTURAS_SUA2_1_1, ATRAPAMIENTO_SUA2_2, PUERTAS_SUA2_1_2, SENALIZACION_VIDRIOS_SUA2_1_4, VIDRIOS_SUA2_TABLA_1_1, type FilaVidrioSua2 } from "./tablas";
import { literalFila, plantasVidrio } from "./textos";

/** La diferencia de cota de cada fila de la tabla 1.1, corta para la celda. */
const COTA_CORTA: Record<FilaVidrioSua2, string> = {
  menor055: "< 0,55 m",
  entre055y12: "de 0,55 a 12 m",
  mayor12: "> 12 m",
};

const A = ALTURAS_SUA2_1_1.datos;
const V = VIDRIOS_SUA2_TABLA_1_1.datos;
const SEN = SENALIZACION_VIDRIOS_SUA2_1_4.datos;
const P = PUERTAS_SUA2_1_2.datos;

function detalles<C extends DetalleSua2["clase"]>(j: JustificacionSua2, clase: C): Extract<DetalleSua2, { clase: C }>[] {
  return j.elementos.flatMap((x) => (x.detalle.clase === clase ? [x.detalle as Extract<DetalleSua2, { clase: C }>] : []));
}

const EN: Record<string, string> = {
  vivienda: "el interior de las viviendas",
  comun: "las zonas comunes",
  garaje: "el garaje",
  oficinas: "las oficinas",
};

function parrafoAltura(j: JustificacionSua2): Trozo[] {
  const ds = detalles(j, "altura");
  if (ds.length === 0) return [];
  // La altura de cada zona, el mínimo y los umbrales van en la tabla (feature-31): aquí, por qué el mínimo cambia.
  const restringido = j.unifamiliar ? "el interior de la vivienda y su garaje" : "el interior de las viviendas";
  const p: Trozo[] = [
    `La altura libre de paso en las zonas de circulación y en los umbrales de las puertas se comprueba conforme a SUA 2, ap. 1.1 pto 1${ds.some((d) => d.grupo === "vivienda") ? `; el mínimo es menor en las zonas de uso restringido (${restringido})` : ""}.`,
  ];
  const fallos = ds.filter((d) => d.valor_m < d.limite_m);
  if (fallos.length > 0) p.push(" La altura libre en ", { v: fallos.map((d) => EN[d.grupo]).join(" y en ") }, " no alcanza el mínimo y debe aumentarse.");
  return p;
}

function parrafoSalientes(): Trozo[] {
  // La altura de los vuelos y el vuelo de los salientes, en la tabla (feature-31).
  return [
    `Los elementos fijos que sobresalen de las fachadas sobre zonas de circulación y los salientes de las paredes que no arrancan del suelo respetan la altura y el vuelo de SUA 2, ap. 1.1 ptos 2 y 3. Los elementos volados de altura menor que ${metros(A.voladosAProteger_alturaMenorQue_m)}, como mesetas o tramos de escalera, se protegen con elementos fijos que restringen el acceso hasta ellos y que son detectables con bastón (SUA 2, ap. 1.1 pto 4).`,
  ];
}

function parrafoPuertas(j: JustificacionSua2): Trozo[] {
  const d = detalles(j, "puertas")[0];
  const a = detalles(j, "automaticas")[0];
  const vaiven = `Las puertas de vaivén situadas entre zonas de circulación, si las hay, tienen partes transparentes o translúcidas que cubren como mínimo la altura comprendida entre ${metros(P.vaivenTransparente.desde_m)} y ${metros(P.vaivenTransparente.hasta_m)} (ap. 1.2 pto 2).`;
  const auto = a
    ? ` ${a.garajeVivienda ? "La puerta del garaje cumple las condiciones de seguridad de utilización de su reglamentación específica y tiene" : "La puerta del garaje y las puertas peatonales automáticas cumplen las condiciones de seguridad de utilización de su reglamentación específica y tienen"} marcado CE (ap. 1.2 ptos 3 y 4).`
    : "";
  if (!d) {
    return [`Por tratarse del interior de una vivienda, de uso restringido, no se aplica la condición sobre el barrido de las puertas en el lateral de los pasillos (SUA 2, ap. 1.2 pto 1). ${vaiven}${auto}`];
  }
  // El barrido de las puertas (lo exigido y lo proyectado), en la tabla (feature-31): aquí, a qué puertas se aplica.
  const sitio = lista(d.donde);
  const cuales = `La condición del barrido de las hojas se aplica a las puertas de los recintos que no son de ocupación nula situadas en el lateral ${sitio.startsWith("el ") ? `del ${sitio.slice(3)}` : `de ${sitio}`}`;
  if (d.barrido === "invaden") {
    return [`${cuales}; las que `, { v: "invaden el pasillo" }, ` deben disponerse de forma que no lo invadan (SUA 2, ap. 1.2 pto 1 y figura 1.1). ${vaiven}${auto}`];
  }
  if (d.barrido === "pasillo_ancho") {
    return [`${cuales}; en pasillos anchos, frente a la anchura exigida por las condiciones de evacuación (SI 3, ap. 4) (SUA 2, ap. 1.2 pto 1). ${vaiven}${auto}`];
  }
  return [`${cuales} (SUA 2, ap. 1.2 pto 1 y figura 1.1). ${vaiven}${auto}`];
}

/**
 * Impacto con elementos fijos y practicables: la altura libre de cada zona
 * (decisión del módulo), los umbrales, los vuelos y salientes (se declaran) y
 * el barrido de las puertas (decisión del módulo).
 */
function tablaImpacto(j: JustificacionSua2, tras: number): TablaMemoria | undefined {
  const filas: FilaNorma[] = [];
  for (const x of j.elementos) {
    const d = x.detalle;
    if (d.clase !== "altura") continue;
    const zona = d.grupo === "vivienda" && j.unifamiliar ? "el interior de la vivienda y su garaje" : EN[d.grupo];
    filas.push([`Altura libre en ${zona}`, `≥ ${metros(d.limite_m)}`, metros(d.valor_m), x.veredicto !== "fail"]);
  }
  if (filas.length > 0) filas.push(["Altura libre en los umbrales de las puertas", `≥ ${metros(A.alturaLibreUmbralPuertas_m)}`, `≥ ${metros(A.alturaLibreUmbralPuertas_m)}`, true]);
  filas.push(
    ["Altura de los vuelos de fachada sobre zonas de circulación", `≥ ${metros(A.alturaVuelosFachada_m)}`, `≥ ${metros(A.alturaVuelosFachada_m)}`, true],
    [
      `Vuelo de los salientes de las paredes, entre ${metros(A.salientesParedes.desde_m).replace(" m", "")} y ${metros(A.salientesParedes.hasta_m)}`,
      `≤ ${A.salientesParedes.vueloMax_cm} cm`,
      `≤ ${A.salientesParedes.vueloMax_cm} cm`,
      true,
    ],
  );
  const pu = j.elementos.find((x) => x.detalle.clase === "puertas");
  const d = detalles(j, "puertas")[0];
  if (pu && d) {
    const ancho = d.barrido === "pasillo_ancho";
    filas.push([
      `Barrido de las puertas en pasillos ${ancho ? "≥" : "<"} ${metros(P.pasilloBarrido_anchuraMenorQue_m)}`,
      ancho ? "no invade la anchura de evacuación" : "no invade el pasillo",
      d.barrido === "invaden" ? "invade el pasillo" : ancho ? "no la invade" : "no lo invade",
      pu.veredicto !== "fail",
    ]);
  }
  return tablaNorma(filas, { rotulo: "Impacto con elementos fijos y practicables", tras });
}

function parrafoVidrios(): Trozo[] {
  // La fila de la tabla 1.1 de cada planta va en la tabla (feature-31).
  return [
    `Los vidrios de las áreas con riesgo de impacto que no disponen de una barrera de protección conforme a SUA 1 ap. 3.2 (en puertas, del suelo hasta ${metros(V.areasRiesgo.puertas.hasta_m)} de altura en el ancho de la puerta más ${metros(V.areasRiesgo.puertas.margenLateralCadaLado_m)} a cada lado; en paños fijos, del suelo hasta ${metros(V.areasRiesgo.panosFijos.hasta_m)}) tienen la clasificación de prestaciones X(Y)Z según ${V.norma} de la tabla 1.1, en función de la diferencia de cota a ambos lados; la de fachada es la cota del suelo de cada planta sobre la rasante, y los vidrios interiores no tienen desnivel. Se excluyen los vidrios cuya mayor dimensión no excede de ${metros(V.excluidosMayorDimensionHasta_m)} (SUA 2, ap. 1.3 ptos 1 y 2). Las partes vidriadas de las puertas y de los cerramientos de duchas y bañeras son de vidrio laminado o templado que resiste sin rotura un impacto de nivel ${V.puertasDuchasBaneras.nivelImpactoSinRotura} (ap. 1.3 pto 3).`,
  ];
}

/** Los vidrios por planta: la fila de la tabla 1.1 que se exige y la que se declara. */
function tablaVidrios(j: JustificacionSua2, tras: number): TablaMemoria | undefined {
  const filas = detalles(j, "vidrios").map((d) => {
    const donde = d.plantas.length > 0 ? `${plantasVidrio(d.plantas)}${d.interiores ? " y vidrios interiores" : ""}` : "Vidrios interiores";
    const xyz = literalFila(d.fila);
    return [donde, COTA_CORTA[d.fila], xyz, xyz, cumpleTexto(true)];
  });
  if (filas.length === 0) return undefined;
  return {
    rotulo: "Vidrios en áreas con riesgo de impacto",
    cabecera: ["Vidrios", "Diferencia de cota", "Norma", "Proyecto", "Cumple"],
    columnas: ["texto", ...COLUMNAS_NORMA],
    filas,
    tras,
  };
}

function parrafoSenalizacion(j: JustificacionSua2): Trozo[] {
  const d = detalles(j, "senalizacion")[0];
  if (!d) return ["La condición de señalización de las grandes superficies acristaladas no se aplica al interior de las viviendas (SUA 2, ap. 1.4 pto 1)."];
  // La altura de las dos franjas, en la tabla (feature-31).
  return [
    `Las grandes superficies acristaladas situadas en ${lista(d.donde)} que se pueden confundir con puertas o aberturas, y las puertas de vidrio sin cercos ni tiradores que las identifiquen, están provistas en toda su longitud de `,
    { v: "señalización visualmente contrastada" },
    ` en dos franjas, salvo que tengan montantes separados ${metros(SEN.exentoMontantesSeparacionMax_m)} como máximo o un travesaño a la altura de la franja inferior (SUA 2, ap. 1.4). Esta condición no se aplica al interior de las viviendas.`,
  ];
}

function parrafoAtrapamiento(j: JustificacionSua2): Trozo[] {
  const a = detalles(j, "automaticas")[0];
  // La holgura de las correderas, en la tabla (feature-31).
  return [
    `Las puertas correderas de accionamiento manual, incluidos sus mecanismos de apertura y cierre, dejan hasta el objeto fijo más próximo la distancia de SUA 2, ap. 2 pto 1 y figura 2.1. ${a ? "Los elementos de apertura y cierre automáticos, como los de la puerta del garaje," : "Los elementos de apertura y cierre automáticos, si los hay,"} disponen de dispositivos de protección adecuados al tipo de accionamiento y cumplen sus especificaciones técnicas propias (ap. 2 pto 2).`,
  ];
}

/** La señalización de los acristalamientos (si se aplica) y la holgura de las correderas: se declaran. */
function tablaSenalizacion(j: JustificacionSua2, tras: number): TablaMemoria | undefined {
  const filas: FilaNorma[] = [];
  const senal = detalles(j, "senalizacion").length > 0;
  const franja = (f: { desde_m: number; hasta_m: number }) => `de ${metros(f.desde_m).replace(" m", "")} a ${metros(f.hasta_m)}`;
  if (senal) {
    filas.push(
      ["Señalización, franja inferior", franja(SEN.franjaInferior), franja(SEN.franjaInferior), true],
      ["Señalización, franja superior", franja(SEN.franjaSuperior), franja(SEN.franjaSuperior), true],
    );
  }
  const h = `≥ ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm`;
  filas.push(["Holgura de las correderas manuales", h, h, true]);
  return tablaNorma(filas, { rotulo: senal ? "Señalización y atrapamiento" : "Atrapamiento", tras });
}

function parrafoLocal(j: JustificacionSua2): Trozo[] {
  return detalles(j, "local").length > 0 ? ["El local sin uso justificará las condiciones de SUA 2 con el proyecto de su actividad."] : [];
}

export function memoriaSua2(j: JustificacionSua2): MemoriaDoc {
  // Cada tabla, tras el párrafo que la presenta (feature-31).
  const parrafos: Trozo[][] = [];
  const tablas: (TablaMemoria | undefined)[] = [];
  const poner = (p: Trozo[], tabla?: (tras: number) => TablaMemoria | undefined) => {
    if (p.length > 0) parrafos.push(p);
    if (tabla) tablas.push(tabla(parrafos.length));
  };
  poner(parrafoAltura(j));
  poner(parrafoSalientes());
  poner(parrafoPuertas(j), (n) => tablaImpacto(j, n));
  poner(parrafoVidrios(), (n) => tablaVidrios(j, n));
  poner(parrafoSenalizacion(j));
  poner(parrafoAtrapamiento(j), (n) => tablaSenalizacion(j, n));
  poner(parrafoLocal(j));
  return {
    titulo: "Seguridad frente al riesgo de impacto o de atrapamiento",
    norma: "DB-SUA 2",
    parrafos,
    tablas: soloTablas(...tablas),
    fuente: ["DB-SUA · SUA 2 (consolidado 14-jun-2022)", "ap. 1 y ap. 2, tabla 1.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
