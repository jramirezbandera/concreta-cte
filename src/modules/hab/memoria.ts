// =============================================================================
// Habitabilidad — La memoria (feature-32): la norma tal como la declaró el
// proyectista, una tabla «Estancia | Su | Norma | Proyecto | Cumple» por
// vivienda tipo y norma, y la densidad con el estado actual y el resultante en
// obra existente. PURA.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, TipoColumna, Trozo } from "../../lib/cte/presentacion";
import { cumpleTexto } from "../../lib/cte/tablaNorma";
import { NOMBRE_AMBITO, NOMBRE_TIPO_ESTANCIA, textoFraccion, type NormaHabitabilidad, type TipoEstancia } from "../../lib/habitabilidad/norma";
import type { DetalleHab, JustificacionHab, ViviendaHab } from "./justificacion";
import { m2, resumenNorma, viviendas } from "./textos";

type DetalleEstancia = Extract<DetalleHab, { clase: "estancia" }>;
type DetalleDensidad = Extract<DetalleHab, { clase: "densidad" }>;

/** «12,50» (la unidad va en la cabecera). */
function num(v: number | null): string {
  return v === null ? "sin dato" : m2(v).replace(" m²", "");
}

/** «baños, aseos y pasillos»: lo que no computa. */
function listaTipos(tipos: TipoEstancia[]): string {
  const t = [...new Set(tipos)].map((x) => NOMBRE_TIPO_ESTANCIA[x].toLowerCase());
  return t.length <= 1 ? (t[0] ?? "") : `${t.slice(0, -1).join(", ")} y ${t.at(-1)}`;
}

function parrafoNorma(n: NormaHabitabilidad, dos: boolean): Trozo[] {
  const min = n.superficieMinima
    ? ` Fija además la superficie útil mínima de ${listaTipos(Object.keys(n.superficieMinima) as TipoEstancia[])}.`
    : "";
  const dens = n.densidad
    ? ` La densidad se limita a una vivienda por cada ${n.densidad.m2PorVivienda} m² de superficie ${n.densidad.superficie === "construida" ? "construida" : "útil"} residencial${n.densidad.referencia ? ` (${n.densidad.referencia})` : ""}.`
    : "";
  const quien = dos ? NOMBRE_AMBITO[n.ambito] : "Norma de aplicación";
  return [`${quien}: `, { v: n.referencia }, `. Exige ${resumenNorma(n)}, en ${listaTipos(n.computan)}.${min}${dens}`];
}

function tablaVivienda(n: NormaHabitabilidad, v: ViviendaHab, ds: DetalleEstancia[], dos: boolean): TablaMemoria {
  const conVe = n.ventilacion !== "conjunta";
  const conMin = ds.some((d) => d.minima !== null);
  const cabecera = ["Estancia", "Su (m²)", `Iluminación ${textoFraccion(n.iluminacion.fraccion)} · Norma`, "Proyecto (m²)"];
  const columnas: TipoColumna[] = ["texto", "dato", "norma", "proyecto"];
  if (n.ventilacion !== "conjunta") {
    cabecera.push(`Ventilación ${textoFraccion(n.ventilacion.fraccion)} · Norma`, "Proyecto (m²)");
    columnas.push("norma", "proyecto");
  }
  if (conMin) {
    cabecera.push("Su mínima (m²)");
    columnas.push("norma");
  }
  cabecera.push("Cumple");
  columnas.push("cumple");
  const filas = ds.map((d) => {
    const f = [d.estancia.nombre, num(d.estancia.util_m2), d.iluminacion.exigido_m2 === null ? "sin dato" : `≥ ${num(d.iluminacion.exigido_m2)}`, num(d.iluminacion.proyecto_m2)];
    if (conVe && d.ventilacion) f.push(d.ventilacion.exigido_m2 === null ? "sin dato" : `≥ ${num(d.ventilacion.exigido_m2)}`, num(d.ventilacion.proyecto_m2));
    if (conMin) f.push(d.minima ? `≥ ${num(d.minima.exigida_m2)}` : "no se exige");
    f.push(cumpleTexto(d.iluminacion.cumple && (d.ventilacion?.cumple ?? true) && (d.minima?.cumple ?? true)));
    return f;
  });
  const fuera = v.estancias.filter((e) => !n.computan.includes(e.tipo)).map((e) => e.tipo);
  const notas: string[] = [];
  if (n.iluminacion.mide !== "hueco" || (conVe && n.ventilacion !== "conjunta" && n.ventilacion.mide !== "practicable")) {
    notas.push(`Iluminación medida como ${n.iluminacion.mide === "hueco" ? "hueco de fachada" : "superficie acristalada"}${conVe && n.ventilacion !== "conjunta" ? `; ventilación, como ${n.ventilacion.mide === "practicable" ? "superficie practicable" : "hueco de fachada"}` : ""}.`);
  }
  if (fuera.length > 0) notas.push(`No computan: ${listaTipos(fuera)}.`);
  const rotulo = `${v.nombre}${v.cantidad > 1 ? ` (${viviendas(v.cantidad)})` : ""}${dos ? ` · ${n.referencia}` : ""}`;
  return { rotulo, cabecera, columnas, filas, ...(notas.length > 0 ? { notas } : {}) };
}

function tablaDensidad(d: DetalleDensidad, dos: boolean): TablaMemoria {
  const base = d.norma.densidad?.redondeo === "al_mas_proximo" ? "redondeado al más próximo" : "por defecto";
  const fila = (estado: string, s: number, max: number, n: number) => [estado, num(s), `≤ ${max}`, String(n), cumpleTexto(n <= max)];
  const filas = d.antes ? [fila("Estado actual", d.antes.superficie_m2, d.antes.maximo, d.antes.viviendas), fila("Estado reformado", d.superficie_m2, d.maximo, d.viviendas)] : [fila("Proyecto", d.superficie_m2, d.maximo, d.viviendas)];
  const notas = [`Viviendas máximas = S / ${d.m2PorVivienda} m², ${base}. S: superficie ${d.superficie === "construida" ? "construida" : "útil"} residencial.`];
  return {
    rotulo: `Densidad de viviendas${dos ? ` · ${d.norma.referencia}` : ""}`,
    cabecera: ["", "S (m²)", "Viviendas · Norma", "Proyecto", "Cumple"],
    columnas: ["texto", "dato", "norma", "proyecto", "cumple"],
    filas,
    notas,
  };
}

export function memoriaHab(j: JustificacionHab): MemoriaDoc {
  const dos = j.normas.length > 1;
  const parrafos: Trozo[][] = [];
  const tablas: TablaMemoria[] = [];
  const total = j.viviendas.reduce((a, v) => a + v.cantidad, 0);
  parrafos.push([
    j.viviendas.length === 1 && total === 1
      ? "Se justifican las condiciones de iluminación y ventilación de las estancias de la vivienda"
      : `Se justifican las condiciones de iluminación y ventilación de las estancias de ${viviendas(total)}, por vivienda tipo`,
    dos ? ", con las dos normas de habitabilidad de aplicación." : ", con la norma de habitabilidad de aplicación.",
  ]);
  for (const n of j.normas) parrafos.push(parrafoNorma(n, dos));
  for (const n of j.normas) {
    for (const v of j.viviendas) {
      const ds = j.elementos.flatMap((e) => (e.detalle.clase === "estancia" && e.detalle.norma.id === n.id && e.detalle.vivienda.id === v.id ? [e.detalle] : []));
      if (ds.length > 0) tablas.push(tablaVivienda(n, v, ds, dos));
    }
    const d = j.elementos.find((e) => e.detalle.clase === "densidad" && e.detalle.norma.id === n.id)?.detalle;
    if (d && d.clase === "densidad") tablas.push(tablaDensidad(d, dos));
  }
  return {
    titulo: "Condiciones de habitabilidad",
    norma: "Habitabilidad",
    parrafos,
    tablas,
    fuente: j.normas.map((n) => n.referencia).join(" · "),
  };
}
