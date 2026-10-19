// =============================================================================
// DB-HE 3 — La memoria redactada (feature-36, paso 2). PURA.
//
// Un párrafo de ámbito y criterio, la tabla por zona («Zona | S | P | Em | VEEI |
// Límite | Cumple»), la de la potencia máxima y el control. Las cifras van en
// las tablas; el texto dice qué se justifica y cómo.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { DetalleHe3, JustificacionHe3 } from "./justificacion";
import { CONTROL_HE3 } from "./tablas";
import { NOMBRE_CONTROL, num } from "./textos";

const C = CONTROL_HE3.datos;
const cumple = (v: number | null, limite: number) => (v === null ? "sin declarar" : v <= limite ? "sí" : "no");

function zonas(j: JustificacionHe3): Extract<DetalleHe3, { clase: "zona" }>[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === "zona" ? [e.detalle] : []));
}

function tablaZonas(j: JustificacionHe3, tras: number): TablaMemoria | undefined {
  const zs = zonas(j);
  if (zs.length === 0) return undefined;
  return {
    rotulo: "Valor de eficiencia energética de la instalación",
    cabecera: ["Zona", "S (m²)", "P (W)", "Em (lx)", "VEEI (1)", "Límite", "Cumple"],
    columnas: ["texto", "dato", "dato", "dato", "dato", "norma", "dato"],
    filas: zs.map((d) => [
      `${d.aparcamiento ? "Aparcamiento" : d.zona.uso === "trasteros" ? "Trasteros" : d.zona.uso === "instalaciones" ? "Cuarto de instalaciones" : "Zona común"} (${d.zona.plantas})`,
      num(d.superficie_m2),
      d.potencia_W === null ? "—" : num(d.potencia_W, 0),
      d.iluminancia_lx === null ? "—" : num(d.iluminancia_lx, 0),
      d.veei === null ? "—" : num(d.veei),
      `≤ ${num(d.limite, 1)}`,
      cumple(d.veei === null ? null : Math.round(d.veei * 100) / 100, d.limite),
    ]),
    notas: ["VEEI = 100·P / (S·Em), en W/m² por cada 100 lux (Anejo A). S, P y Em por planta."],
    tras,
  };
}

function tablaPotencia(j: JustificacionHe3, tras: number): TablaMemoria | undefined {
  const filas: string[][] = [];
  for (const e of j.elementos) {
    const d = e.detalle;
    if (d.clase !== "potencia") continue;
    filas.push([
      d.aparcamiento ? "Aparcamiento" : "Zonas comunes",
      num(d.ptot_W, 0),
      num(d.stot_m2),
      d.ratio === null ? "—" : num(d.ratio),
      `≤ ${num(d.limite, 0)}`,
      cumple(d.ratio === null ? null : Math.round(d.ratio * 100) / 100, d.limite),
    ]);
  }
  if (filas.length === 0) return undefined;
  return {
    rotulo: "Potencia máxima de iluminación",
    cabecera: ["", "PTOT (W)", "STOT (m²)", "PTOT/STOT (W/m²)", "Máxima", "Cumple"],
    columnas: ["texto", "dato", "dato", "dato", "norma", "dato"],
    filas,
    tras,
  };
}

export function memoriaHe3(j: JustificacionHe3): MemoriaDoc {
  const zs = zonas(j);
  const parrafos: Trozo[][] = [];
  const otros = j.elementos.find((e) => e.detalle.clase === "otros");
  if (zs.length > 0) {
    const nombres = [
      zs.some((d) => !d.aparcamiento && d.zona.uso !== "trasteros" && d.zona.uso !== "instalaciones") ? "las zonas comunes de circulación" : null,
      zs.some((d) => d.zona.uso === "trasteros") ? "los trasteros" : null,
      zs.some((d) => d.zona.uso === "instalaciones") ? "los cuartos de instalaciones" : null,
      zs.some((d) => d.aparcamiento) ? "el aparcamiento" : null,
    ].filter((x): x is string => x !== null);
    parrafos.push([
      `Se justifican las instalaciones de iluminación de ${lista(nombres)}${j.residencial ? "; las instalaciones interiores de las viviendas están excluidas del ámbito de la Sección (HE 3 ap. 1 pto 2 a)" : ""}. La potencia instalada y la iluminancia media de cada zona son las del proyecto de iluminación; con ellas, el valor de eficiencia energética de la instalación no supera el límite de la tabla 3.1 y la potencia instalada no supera la máxima de la tabla 3.2.`,
    ]);
  }
  const trasZonas = parrafos.length;
  if (zs.length > 0) {
    parrafos.push([
      "El control se realiza con ",
      { v: NOMBRE_CONTROL[j.control] },
      `${j.control === "manual_horario" ? "" : `, que sustituye al ${C.horario} en zonas de uso esporádico`}, además de un ${C.manual} (HE 3 ap. 3.3).${j.residencial ? " Las zonas comunes de los edificios residenciales están excluidas de la exigencia de aprovechar la luz natural (ap. 3.4 pto 2)." : ""} El alumbrado de emergencia queda fuera del ámbito (ap. 1 pto 2 b) y se justifica en SUA 4.`,
    ]);
  }
  if (otros) {
    const quien = otros.nombre === "Locales" ? "Los locales justificarán" : otros.nombre === "Oficinas" ? "Las oficinas justificarán" : "Las oficinas y los locales justificarán";
    parrafos.push([`${quien} las condiciones de HE 3 con el proyecto de iluminación de su actividad.`]);
  }
  return {
    titulo: "Condiciones de las instalaciones de iluminación",
    norma: "DB-HE 3",
    parrafos,
    tablas: soloTablas(tablaZonas(j, trasZonas), tablaPotencia(j, trasZonas)),
    fuente: ["DB-HE · HE 3 (consolidado 14-jun-2022)", "tablas 3.1 y 3.2", "potencias e iluminancias del proyectista", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
