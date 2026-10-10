// =============================================================================
// DB-SUA, SUA 4 — La memoria redactada (feature-20): el alumbrado normal, la
// dotación de alumbrado de emergencia con las zonas deducidas de El edificio, la
// posición de las luminarias, la instalación y las señales. PURA.
//
// Las cifras van en tablas (feature-31), cada una tras su párrafo: el alumbrado
// normal por zona, la dotación de emergencia («Zona | Exige | Por qué»), la
// instalación de emergencia y las señales. El texto se queda con el criterio:
// dónde se mide, qué es origen de evacuación, dónde van las luminarias y cómo es
// la instalación.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { ENGINE_VERSION } from "../../lib/version";
import { nombreLocal } from "../si1/justificacion";
import { lista, metros } from "../sua/colocar";
import type { DetalleSua4, ElementoSua4, JustificacionSua4 } from "./justificacion";
import { ALUMBRADO_NORMAL_SUA4_1, INSTALACION_EMERGENCIA_SUA4_2_3, LUMINARIAS_EMERGENCIA_SUA4_2_2, SENALES_SUA4_2_4 } from "./tablas";
import { zonasRecorrido } from "./textos";

const N = ALUMBRADO_NORMAL_SUA4_1.datos;
const I = INSTALACION_EMERGENCIA_SUA4_2_3.datos;
const LU = LUMINARIAS_EMERGENCIA_SUA4_2_2.datos;
const SE = SENALES_SUA4_2_4.datos;
const num = (v: number) => v.toLocaleString("es-ES");
const pc = (f: number) => `${Math.round(f * 100)} %`;
const mayus = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

function elemento<C extends DetalleSua4["clase"]>(j: JustificacionSua4, clase: C): (ElementoSua4 & { detalle: Extract<DetalleSua4, { clase: C }> }) | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el as ElementoSua4 & { detalle: Extract<DetalleSua4, { clase: C }> }) : null;
}

function detalle<C extends DetalleSua4["clase"]>(j: JustificacionSua4, clase: C): Extract<DetalleSua4, { clase: C }> | null {
  return elemento(j, clase)?.detalle ?? null;
}

/** El veredicto del elemento, para la columna «Cumple». */
const ok = (el: ElementoSua4 | null | undefined) => (el?.veredicto === "fail" ? "fail" : "ok");

/** Una fila en que el proyecto declara lo que exige la norma: las dos columnas iguales. */
const declara = (parametro: string, valor: string, el: ElementoSua4 | null | undefined): FilaNorma => [parametro, valor, valor, ok(el)];

function parrafoNormal(j: JustificacionSua4): Trozo[] {
  const interior = j.elementos.some((x) => x.id === "normal-interior");
  const garaje = j.elementos.some((x) => x.id === "normal-garaje");
  const p: Trozo[] = [];
  // Las iluminancias y la uniformidad, en la tabla (feature-31): aquí, dónde se miden.
  if (interior || garaje) {
    p.push(
      `Las zonas de circulación, incluidas las exteriores que forman parte del proyecto, disponen de una instalación de alumbrado capaz de proporcionar la iluminancia mínima de SUA 4, medida a nivel del suelo${garaje ? " y, en el aparcamiento, en toda su superficie" : ""} (ap. 1 pto 1).`,
    );
  }
  if (j.residencial) {
    const g = detalle(j, "garaje");
    // El DB no excluye el interior de las viviendas (criterio S10).
    p.push(
      `${p.length > 0 ? " " : ""}En el interior de ${j.unifamiliar ? "la vivienda" : "las viviendas"}, los puntos de luz de pasillos y distribuidores permiten alcanzar la iluminancia de las zonas interiores de circulación${j.unifamiliar && g ? ", y la de un aparcamiento en su garaje" : ""} (SUA 4, ap. 1 pto 1).`,
    );
  }
  return p;
}

function parrafoDotacion(j: JustificacionSua4): Trozo[] {
  const g = detalle(j, "garaje");
  if (!j.conEmergencia) {
    return [
      `No se dispone alumbrado de emergencia: el interior de ${j.unifamiliar ? "la vivienda" : "las viviendas"}${g ? ", incluido su garaje," : ""} no es origen de evacuación (DB-SI, Anejo SI A) y no hay zonas ni elementos de los enumerados en SUA 4 ap. 2.1.`,
    ];
  }
  if (j.unifamiliar) {
    const p: Trozo[] = [];
    if (g?.dispone) {
      p.push(
        "El garaje de la vivienda, local de riesgo especial bajo según la tabla 2.1 de SI 1, dispone de ",
        { v: "alumbrado de emergencia" },
        " con una luminaria junto a su puerta de salida, que ilumina también la señal de su extintor (SUA 4, ap. 2.1 d) y g)).",
      );
    }
    const l = detalle(j, "locales");
    if (l) p.push(`${p.length > 0 ? " " : ""}Disponen de alumbrado de emergencia los locales de riesgo especial: ${lista(l.locales.map((x) => `${nombreLocal(x).toLowerCase()} (${x.zona.plantas})`))} (SUA 4, ap. 2.1 d)).`);
    p.push(" El resto de la vivienda no lo requiere: su interior no es origen de evacuación (DB-SI, Anejo SI A).");
    return p;
  }
  // Qué zonas y por qué, en la tabla de la dotación (feature-31).
  return ["Disponen de ", { v: "alumbrado de emergencia" }, " las zonas y los elementos del edificio que enumera SUA 4, ap. 2.1, con los orígenes de evacuación del Anejo SI A del DB-SI."];
}

function parrafoInstalacion(j: JustificacionSua4): Trozo[] {
  if (!j.conEmergencia) return [];
  const tipo = detalle(j, "instalacion")?.tipo ?? "autonomas";
  // La altura, los niveles, la autonomía y los tiempos, en la tabla (feature-31).
  return [
    `Las luminarias se sitúan una en cada puerta de salida y en las posiciones en que es necesario destacar un peligro potencial o el emplazamiento de un equipo de seguridad, y como mínimo ${lista(LU.puntosMinimos)} (SUA 4, ap. 2.2). La instalación, `,
    { v: tipo === "autonomas" ? "con luminarias autónomas" : "con sistema centralizado" },
    ", es fija, está provista de fuente propia de energía y entra en funcionamiento automáticamente al producirse un fallo de alimentación en la instalación de alumbrado normal. Los niveles se obtienen considerando nulo el factor de reflexión de paredes y techos y con el factor de mantenimiento del fabricante (SUA 4, ap. 2.3).",
  ];
}

function parrafoSenales(j: JustificacionSua4): Trozo[] {
  if (!j.conEmergencia) return [];
  // La luminancia, sus relaciones y los tiempos, en la tabla (feature-31).
  return [
    "Las señales de evacuación indicativas de las salidas y las de los medios manuales de protección contra incendios y de primeros auxilios cumplen, en cualquier área de color de seguridad, las condiciones de luminancia y de respuesta de SUA 4, ap. 2.4.",
  ];
}

/** Iluminancia por zona y uniformidad (ap. 1). El proyecto declara la exigida. */
function tablaNormal(j: JustificacionSua4, tras: number): TablaMemoria | undefined {
  const interior = j.elementos.find((x) => x.id === "normal-interior");
  const garaje = j.elementos.find((x) => x.id === "normal-garaje");
  const lux = (v: number) => `≥ ${v} lux`;
  const filas: FilaNorma[] = [];
  if (interior) filas.push(declara("Iluminancia en zonas interiores", lux(N.interior_lx), interior));
  if (garaje) filas.push(declara("Iluminancia en el aparcamiento", lux(N.aparcamientoInterior_lx), garaje));
  if (interior || garaje) filas.push(declara("Iluminancia en zonas exteriores", lux(N.exterior_lx), interior ?? garaje));
  if (j.residencial) {
    filas.push(declara(`Iluminancia en pasillos de ${j.unifamiliar ? "la vivienda" : "las viviendas"}`, lux(N.interior_lx), null));
    if (j.unifamiliar && detalle(j, "garaje")) filas.push(declara("Iluminancia en el garaje de la vivienda", lux(N.aparcamientoInterior_lx), null));
  }
  if (interior || garaje) filas.push(declara("Uniformidad media", `≥ ${pc(N.uniformidadMediaMin)}`, interior ?? garaje));
  return tablaNorma(filas, { rotulo: "Alumbrado normal", tras });
}

/**
 * Dónde se exige alumbrado de emergencia y por qué (ap. 2.1), con la letra de
 * la lista. Solo en el edificio con zonas comunes: en la unifamiliar, el
 * párrafo ya es corto. Sin «Cumple»: no compara, enumera.
 */
function tablaDotacion(j: JustificacionSua4, tras: number): TablaMemoria | undefined {
  if (!j.conEmergencia || j.unifamiliar) return undefined;
  const filas: string[][] = [];
  const r = detalle(j, "recorridos");
  if (r) {
    for (const x of r.recintosMas100) filas.push([`Recinto de ${num(x.personas)} personas (${x.zona.plantas})`, "sí", "ocupación mayor que 100 personas (a)"]);
    // El pasillo de los trasteros de 50 m² o menos no es recorrido en lectura
    // literal: va aparte, por criterio (S12).
    const criterio = r.trasterosCriterio.length > 0 && !r.zonas.some((z) => z.uso === "trasteros");
    filas.push([mayus(lista(zonasRecorrido(criterio ? { ...r, trasterosCriterio: [] } : r))), "sí", "recorrido desde un origen de evacuación (b)"]);
    if (criterio) filas.push(["El pasillo de los trasteros", "por criterio", "recorrido hasta la salida de planta (b)"]);
  }
  const g = detalle(j, "garaje");
  if (g) {
    filas.push(
      g.letra === "c"
        ? ["Aparcamiento, con sus pasillos y escaleras", "sí", `${num(g.construida_m2)} m² construidos, más de 100 m² (c)`]
        : ["Garaje", "sí", "local de riesgo especial bajo (d)"],
    );
  }
  const l = detalle(j, "locales");
  if (l) for (const x of l.locales) filas.push([`${nombreLocal(x)} (${x.zona.plantas})`, "sí", `local de riesgo especial ${x.clase} (d)`]);
  if (r?.aseosOficinas) filas.push(["Aseos de las oficinas", "sí", "aseos generales de planta (e)"]);
  filas.push(["Cuadros de distribución o de accionamiento del alumbrado", "sí", "alumbran las zonas anteriores (f)"], ["Señales de seguridad", "sí", "toda señal de seguridad (g)"]);
  if (r) filas.push([mayus(r.accesible), "sí", "itinerario accesible (h)"]);
  // Lo que no lleva emergencia y por qué: el interior de las viviendas (Anejo SI A).
  if (j.residencial) filas.push(["Interior de las viviendas", "no", "no es origen de evacuación (Anejo SI A)"]);
  return {
    rotulo: "Dotación de alumbrado de emergencia",
    cabecera: ["Zona o elemento", "Exige", "Por qué (ap. 2.1)"],
    columnas: ["texto", "dato", "texto"],
    filas,
    tras,
  };
}

/** Posición de las luminarias y características de la instalación (ap. 2.2 y 2.3). */
function tablaInstalacion(j: JustificacionSua4, tras: number): TablaMemoria | undefined {
  if (!j.conEmergencia) return undefined;
  const lu = j.elementos.find((x) => x.id === "emergencia-luminarias");
  const ins = j.elementos.find((x) => x.id === "emergencia-instalacion");
  const lux = (v: number) => `≥ ${num(v)} lux`;
  return tablaNorma(
    [
      declara("Altura de las luminarias sobre el suelo", `≥ ${metros(LU.alturaMinimaSobreSuelo_m)}`, lu),
      declara("Entrada en funcionamiento", `tensión < ${pc(I.falloTensionPorDebajoDe)} de la nominal`, ins),
      declara("Nivel alcanzado a los 5 s", `≥ ${pc(I.respuesta.a5s)}`, ins),
      declara("Nivel alcanzado a los 60 s", pc(I.respuesta.a60s), ins),
      declara("Autonomía", `≥ ${I.autonomiaMin_h} h`, ins),
      declara("Iluminancia en el eje central (1)", lux(I.viaEvacuacion.ejeCentralMin_lx), ins),
      declara("Iluminancia en la banda central (1)", lux(I.viaEvacuacion.bandaCentralMin_lx), ins),
      declara("Iluminancia en equipos de seguridad y cuadros (2)", lux(I.equiposYCuadrosMin_lx), ins),
      declara("Relación máx./mín. en el eje", `≤ ${I.relacionMaxMinEjeMax}:1`, ins),
      declara("Rendimiento cromático", `Ra ≥ ${I.raMin}`, ins),
    ],
    {
      rotulo: "Alumbrado de emergencia",
      notas: [
        `En el suelo de las vías de evacuación de hasta ${metros(I.viaEvacuacion.anchuraMax_m)} de anchura; las más anchas se tratan como varias bandas de ${metros(I.viaEvacuacion.anchuraMax_m)} como máximo.`,
        "Equipos de seguridad, instalaciones de protección contra incendios de uso manual y cuadros de distribución del alumbrado.",
      ],
      tras,
    },
  );
}

/** Luminancia de las señales, sus relaciones y su respuesta (ap. 2.4). */
function tablaSenales(j: JustificacionSua4, tras: number): TablaMemoria | undefined {
  if (!j.conEmergencia) return undefined;
  const s = j.elementos.find((x) => x.id === "emergencia-senales");
  return tablaNorma(
    [
      declara("Luminancia del color de seguridad", `≥ ${SE.luminanciaColorSeguridadMin_cd_m2} cd/m²`, s),
      declara("Relación máx./mín. de luminancia", `≤ ${SE.relacionMaxMinMax}:1`, s),
      declara("Relación blanco / color de seguridad", `${SE.relacionBlancoColor.min}:1 a ${SE.relacionBlancoColor.max}:1`, s),
      declara("Nivel alcanzado a los 5 s", `≥ ${pc(SE.respuesta.a5s)}`, s),
      declara("Nivel alcanzado a los 60 s", pc(SE.respuesta.a60s), s),
    ],
    { rotulo: "Señales de seguridad", tras },
  );
}

export function memoriaSua4(j: JustificacionSua4): MemoriaDoc {
  // Cada tabla tras su párrafo: `tras` es cuántos párrafos van antes de ella.
  const parrafos: Trozo[][] = [];
  const poner = (p: Trozo[]) => {
    if (p.length > 0) parrafos.push(p);
    return parrafos.length;
  };
  const trasNormal = poner(parrafoNormal(j));
  const trasDotacion = poner(parrafoDotacion(j));
  const trasInstalacion = poner(parrafoInstalacion(j));
  const trasSenales = poner(parrafoSenales(j));
  if (j.elementos.some((x) => x.detalle.clase === "local")) {
    parrafos.push(["El local sin uso justificará las condiciones de SUA 4 con el proyecto de su actividad; se deja previsto el alumbrado de emergencia del recorrido de su salida."]);
  }
  return {
    titulo: "Seguridad frente al riesgo causado por iluminación inadecuada",
    norma: "DB-SUA 4",
    parrafos,
    tablas: soloTablas(tablaNormal(j, trasNormal), tablaDotacion(j, trasDotacion), tablaInstalacion(j, trasInstalacion), tablaSenales(j, trasSenales)),
    fuente: ["DB-SUA · SUA 4 (consolidado 14-jun-2022)", "ap. 1 y ap. 2", "locales de riesgo especial de SI 1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
