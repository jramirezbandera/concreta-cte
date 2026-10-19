// =============================================================================
// DB-HE 3 — La justificación (feature-36, paso 2). PURA y DETERMINISTA; no redacta.
//
// Lecturas (K-MEM.6, VERIFICADO en texto):
//   - las instalaciones interiores de las viviendas quedan fuera (ap. 1 pto 2 a):
//     se justifican las zonas comunes (portal, vestíbulos, escaleras, pasillos,
//     trasteros y cuartos de instalaciones) y el aparcamiento. El garaje de la
//     unifamiliar es interior de la vivienda;
//   - por zona, VEEI = 100·P/(S·Em) frente a 4,0 (zonas comunes y aparcamientos
//     de un residencial) o 6,0 (zonas comunes de un edificio no residencial);
//   - PTOT/STOT de las zonas comunes frente a 10 W/m² (25 con más de 600 lux) y
//     del aparcamiento frente a 5 W/m² (tabla 3.2), con P y S de todas las
//     plantas;
//   - el control: las tres opciones valen en uso esporádico (ap. 3.3 pto 2); la
//     luz natural no se exige en las zonas comunes de un residencial (3.4 pto 2);
//   - P y Em los declara el proyectista: el CTE no fija la iluminancia (remite a
//     SUA 4 y a la UNE-EN 12464-1, no verificada) y la app no calcula luminarias.
//     Sin ellos, la zona queda «sin declarar» (decisión 5);
//   - las oficinas y el local sin uso se justifican con el proyecto de iluminación
//     de su actividad: quedan previstos.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { USOS } from "../../lib/edificio/usos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type ZonaSua } from "../sua/edificio";
import { CONTROL_HABITUAL, resolverControl, zonaDe, type ControlHe3, type He3Estado } from "./estado";
import { POTENCIA_MAXIMA_HE3, VEEI_LIMITE_HE3, veei } from "./tablas";

export type DetalleHe3 =
  | {
      clase: "zona";
      zona: ZonaSua;
      aparcamiento: boolean;
      /** Por planta. */
      potencia_W: number | null;
      iluminancia_lx: number | null;
      /** Útil por planta [m²]. */
      superficie_m2: number;
      veei: number | null;
      limite: number;
    }
  | {
      clase: "potencia";
      aparcamiento: boolean;
      /** Suma de todas las plantas. */
      ptot_W: number;
      stot_m2: number;
      /** PTOT/STOT, o null si falta la potencia de alguna zona. */
      ratio: number | null;
      limite: number;
      /** Zonas sin potencia declarada. */
      faltan: number;
    }
  | { clase: "control"; control: ControlHe3 }
  | { clase: "luz_natural" }
  | { clase: "otros"; zonas: ZonaSua[] };

export type ElementoHe3 = ElementoSi<DetalleHe3>;

export interface JustificacionHe3 extends JustificacionSiBase {
  elementos: ElementoHe3[];
  residencial: boolean;
  /** Las zonas que se justifican, en el orden de El edificio. */
  zonas: ZonaSua[];
  control: ControlHe3;
  controlHabitual: ControlHe3;
  /** Zonas sin potencia o sin iluminancia. */
  sinDatos: number;
}

const V = VEEI_LIMITE_HE3.datos;
const PM = POTENCIA_MAXIMA_HE3.datos;

/** Zonas comunes del ámbito: las del DB-SUA de uso general y las de ocupación nula (trasteros, instalaciones). */
export function esZonaHe3(z: ZonaSua): boolean {
  return z.clase === "comun" || z.clase === "ocupacion_nula" || z.clase === "garaje";
}

const redondeo2 = (v: number) => Math.round(v * 100) / 100;

export function justificarHe3(estado: Partial<He3Estado>, p: ProyectoSi): JustificacionHe3 {
  const e = edificioSua(p.edificio);
  const zonas = e.zonas.filter(esZonaHe3);
  const elementos: ElementoHe3[] = [];
  const avisos: Aviso[] = [];
  const control = resolverControl(estado);
  let sinDatos = 0;

  // ── Cada zona: su VEEI ────────────────────────────────────────────────────
  const potencias: Record<"comunes" | "aparcamiento", { p: number; s: number; faltan: number; emMax: number; hay: boolean }> = {
    comunes: { p: 0, s: 0, faltan: 0, emMax: 0, hay: false },
    aparcamiento: { p: 0, s: 0, faltan: 0, emMax: 0, hay: false },
  };
  for (const z of zonas) {
    const aparcamiento = z.clase === "garaje";
    const d = zonaDe(estado, z.id);
    const limite = aparcamiento ? V.aparcamiento : e.residencial ? V.zonasComunes : V.zonasComunesNoResidencial;
    const v = d.potencia_W !== null && d.iluminancia_lx !== null && z.util_m2 > 0 ? veei(d.potencia_W, z.util_m2, d.iluminancia_lx) : null;
    if (v === null) sinDatos++;
    const grupo = potencias[aparcamiento ? "aparcamiento" : "comunes"];
    grupo.hay = true;
    grupo.s += z.util_m2 * z.repeticiones;
    if (d.potencia_W === null) grupo.faltan++;
    else grupo.p += d.potencia_W * z.repeticiones;
    if (d.iluminancia_lx !== null) grupo.emMax = Math.max(grupo.emMax, d.iluminancia_lx);
    elementos.push({
      id: `zona-${z.id}`,
      nombre: `${USOS[z.uso].etiqueta} (${z.plantas})`,
      tipo: "zona",
      veredicto: v === null ? "fail" : redondeo2(v) <= limite ? "ok" : "fail",
      valor: v === null ? { texto: "sin declarar" } : { valor: redondeo2(v), unidad: "W/m²" },
      limite: { valor: limite, unidad: "W/m²" },
      manda:
        v === null
          ? { tipo: "dato_de_partida", fuente: "la potencia instalada y la iluminancia media de la zona, que declara el proyectista" }
          : { tipo: "formula", formula: "VEEI = 100·P / (S·Em)", resultado: { valor: redondeo2(v), unidad: "W/m²" } },
      cita: ["HE 3 · tabla 3.1", "HE 3 · Anejo A"],
      detalle: { clase: "zona", zona: z, aparcamiento, potencia_W: d.potencia_W, iluminancia_lx: d.iluminancia_lx, superficie_m2: z.util_m2, veei: v, limite },
    });
  }

  // ── La potencia máxima, por grupo (tabla 3.2) ─────────────────────────────
  for (const clave of ["comunes", "aparcamiento"] as const) {
    const g = potencias[clave];
    if (!g.hay) continue;
    const aparcamiento = clave === "aparcamiento";
    const limite = aparcamiento ? PM.aparcamiento_W_m2 : g.emMax > PM.otrosUsos.umbral_lx ? PM.otrosUsos.mas600lx_W_m2 : PM.otrosUsos.hasta600lx_W_m2;
    const ratio = g.faltan === 0 && g.s > 0 ? g.p / g.s : null;
    elementos.push({
      id: `potencia-${clave}`,
      nombre: aparcamiento ? "Potencia instalada del aparcamiento" : "Potencia instalada de las zonas comunes",
      tipo: "potencia",
      veredicto: ratio === null ? "fail" : redondeo2(ratio) <= limite ? "ok" : "fail",
      valor: ratio === null ? { texto: "sin declarar" } : { valor: redondeo2(ratio), unidad: "W/m²" },
      limite: { valor: limite, unidad: "W/m²" },
      manda: ratio === null ? { tipo: "dato_de_partida", fuente: "la potencia instalada de cada zona" } : { tipo: "formula", formula: "PTOT / STOT", resultado: { valor: redondeo2(ratio), unidad: "W/m²" } },
      cita: ["HE 3 · tabla 3.2"],
      detalle: { clase: "potencia", aparcamiento, ptot_W: g.p, stot_m2: redondeo2(g.s), ratio, limite, faltan: g.faltan },
    });
  }

  // ── Control y luz natural ─────────────────────────────────────────────────
  if (zonas.length > 0) {
    elementos.push({
      id: "control",
      nombre: "Sistema de control",
      tipo: "control",
      veredicto: "ok",
      valor: { texto: control === "presencia" ? "detección de presencia" : control === "pulsador" ? "pulsador temporizado" : "manual y horario" },
      manda: { tipo: "decision_proyectista", decision: "control" },
      cita: ["HE 3 · ap. 3.3"],
      detalle: { clase: "control", control },
    });
    if (e.residencial) {
      elementos.push({
        id: "luz-natural",
        nombre: "Aprovechamiento de la luz natural",
        tipo: "control",
        veredicto: "dato",
        valor: { texto: "no se exige" },
        manda: { tipo: "dato_de_partida", fuente: "HE 3 ap. 3.4 pto 2" },
        cita: ["HE 3 · ap. 3.4 pto 2"],
        detalle: { clase: "luz_natural" },
      });
    }
  }

  // ── Oficinas y locales: con el proyecto de su actividad ───────────────────
  const otros = e.zonas.filter((z) => z.clase === "oficinas" || z.clase === "local");
  if (otros.length > 0) {
    elementos.push({
      id: "otros",
      nombre: otros.every((z) => z.clase === "local") ? "Locales" : otros.every((z) => z.clase === "oficinas") ? "Oficinas" : "Oficinas y locales",
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "con su actividad" },
      manda: { tipo: "decision_proyectista", decision: "previsión" },
      cita: ["HE 3"],
      detalle: { clase: "otros", zonas: otros },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, residencial: e.residencial, zonas, control, controlHabitual: CONTROL_HABITUAL, sinDatos };
}
