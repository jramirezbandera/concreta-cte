// =============================================================================
// DB-HE 3 — Textos (feature-36, paso 2): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista. PURAS.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista } from "../sua/colocar";
import type { ControlHe3 } from "./estado";
import type { DetalleHe3, ElementoHe3, JustificacionHe3 } from "./justificacion";
import { CONTROL_HE3, POTENCIA_MAXIMA_HE3 } from "./tablas";

const C = CONTROL_HE3.datos;
const PM = POTENCIA_MAXIMA_HE3.datos;

/** «2,35» */
export function num(v: number, decimales = 2): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: decimales });
}
export const wm2 = (v: number) => `${num(v)} W/m²`;

export const NOMBRE_CONTROL: Record<ControlHe3, string> = {
  presencia: "detección de presencia temporizada",
  pulsador: "pulsador temporizado",
  manual_horario: "encendido manual y por horario centralizado",
};

function det(el: ElementoSi<unknown>): DetalleHe3 {
  return (el as ElementoHe3).detalle;
}

const zonasDe = (j: JustificacionHe3) => j.elementos.filter((e) => e.detalle.clase === "zona");

export function fraseHe3(j: JustificacionHe3): string {
  const zonas = zonasDe(j);
  if (zonas.length === 0) return "Sin zonas comunes ni aparcamiento: las oficinas y los locales se justifican con el proyecto de iluminación de su actividad.";
  if (j.sinDatos > 0) {
    return `Faltan la potencia o la iluminancia de ${j.sinDatos === 1 ? "una zona" : `${j.sinDatos} zonas`}: sin ellas no hay VEEI que comparar.`;
  }
  const fallan = zonas.filter((e) => e.veredicto === "fail").length;
  const pot = j.elementos.filter((e) => e.detalle.clase === "potencia" && e.veredicto === "fail").length;
  if (fallan > 0 || pot > 0) {
    return `${fallan > 0 ? `${fallan === 1 ? "Una zona supera" : `${fallan} zonas superan`} el VEEI límite` : "La potencia instalada supera la máxima"}: hay que bajar la potencia o revisar la iluminancia.`;
  }
  const garaje = zonas.some((e) => e.detalle.clase === "zona" && e.detalle.aparcamiento);
  const comunes = zonas.some((e) => e.detalle.clase === "zona" && !e.detalle.aparcamiento);
  const sujeto = garaje && comunes ? "Las zonas comunes y el aparcamiento cumplen" : garaje ? "El aparcamiento cumple" : "Las zonas comunes cumplen";
  return `${sujeto} el VEEI límite y la potencia máxima, con ${NOMBRE_CONTROL[j.control]}.`;
}

export function metricasHe3(j: JustificacionHe3): string {
  const valores = zonasDe(j).flatMap((e) => (e.detalle.clase === "zona" && e.detalle.veei !== null ? [e.detalle.veei] : []));
  const partes: string[] = [];
  if (valores.length > 0) partes.push(`VEEI máx. ${num(Math.max(...valores))}`);
  for (const e of j.elementos) if (e.detalle.clase === "potencia" && e.detalle.ratio !== null) partes.push(`${e.detalle.aparcamiento ? "garaje " : ""}${wm2(e.detalle.ratio)}`);
  if (j.sinDatos > 0) partes.push(`${j.sinDatos} sin declarar`);
  return partes.join(" · ") || "sin zonas comunes";
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraHe3(j: JustificacionHe3, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const fila = (titulo: string, detalle: string, t: string) => filas.push({ id: el.id, titulo, detalle, trato: t, estado: trato(estados[el.id]), elementoId: el.id });
    if (d.clase === "zona") fila(el.nombre, `${num(d.superficie_m2)} m²${d.zona.repeticiones > 1 ? ` × ${d.zona.repeticiones}` : ""}`, d.veei === null ? "sin declarar" : `VEEI ${num(d.veei)}`);
    else if (d.clase === "otros") fila(el.nombre, lista([...new Set(d.zonas.map((z) => z.plantas))]), "con su actividad");
  }
  return filas;
}

export function textoEtiquetaHe3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "zona":
      return d.veei === null ? "sin declarar" : `VEEI ${num(d.veei)}`;
    case "potencia":
      return d.ratio === null ? "sin declarar" : wm2(d.ratio);
    case "control":
      return d.control === "presencia" ? "presencia" : d.control === "pulsador" ? "pulsador" : "manual + horario";
    case "luz_natural":
      return "luz natural: no se exige";
    case "otros":
      return "con su actividad";
  }
}

export function resultadoListaHe3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "zona":
      return d.veei === null
        ? "declara la potencia instalada y la iluminancia media"
        : `${num(d.potencia_W ?? 0, 0)} W · ${num(d.iluminancia_lx ?? 0, 0)} lx · VEEI ${num(d.veei)} ≤ ${num(d.limite, 1)}`;
    case "potencia":
      return d.ratio === null ? `faltan ${d.faltan === 1 ? "una zona" : `${d.faltan} zonas`}` : `${num(d.ptot_W, 0)} W / ${num(d.stot_m2)} m² = ${wm2(d.ratio)} ≤ ${wm2(d.limite)}`;
    case "control":
      return NOMBRE_CONTROL[d.control];
    case "luz_natural":
      return "zonas comunes de un edificio residencial (ap. 3.4 pto 2)";
    case "otros":
      return "se justifican con el proyecto de iluminación de su actividad";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaHe3(el: ElementoSi<unknown>, _j: JustificacionHe3, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "zona":
      return {
        clase: "VEEI · tabla 3.1",
        titulo: el.nombre,
        valor: d.veei === null ? "—" : num(d.veei),
        unidad: `W/m² · límite ${num(d.limite, 1)}`,
        estado,
        manda: `El valor de eficiencia energética de la instalación, VEEI = 100·P / (S·Em), no supera ${num(d.limite, 1)} W/m² por cada 100 lux en ${d.aparcamiento ? "un aparcamiento" : "las zonas comunes"}.`,
        nota:
          d.veei === null
            ? "Declara la potencia instalada (lámparas y equipos auxiliares) y la iluminancia media de proyecto: el CTE no fija la iluminancia y la herramienta no la supone."
            : "La iluminancia es la de proyecto, que declara el proyectista; SUA 4 pide al menos 100 lux en las zonas interiores de circulación y 50 en el aparcamiento.",
        filas: [
          { k: "Superficie (por planta)", v: `${num(d.superficie_m2)} m²` },
          { k: "Potencia instalada (por planta)", v: d.potencia_W === null ? "sin declarar" : `${num(d.potencia_W, 0)} W` },
          { k: "Iluminancia media", v: d.iluminancia_lx === null ? "sin declarar" : `${num(d.iluminancia_lx, 0)} lx` },
          { k: "Plantas", v: d.zona.plantas },
        ],
        cita: "DB-HE · HE 3 tabla 3.1 · Anejo A",
      };
    case "potencia":
      return {
        clase: "Potencia máxima · tabla 3.2",
        titulo: el.nombre,
        valor: d.ratio === null ? "—" : num(d.ratio),
        unidad: `W/m² · máx. ${num(d.limite, 0)}`,
        estado,
        manda: d.aparcamiento
          ? `La potencia instalada en iluminación del aparcamiento, por superficie iluminada, no supera ${PM.aparcamiento_W_m2} W/m².`
          : `La potencia instalada en iluminación de las zonas comunes, por superficie iluminada, no supera ${PM.otrosUsos.hasta600lx_W_m2} W/m² con iluminancias de hasta ${PM.otrosUsos.umbral_lx} lux (${PM.otrosUsos.mas600lx_W_m2} W/m² con más).`,
        nota: d.ratio === null ? "Falta la potencia de alguna zona." : undefined,
        filas: [
          { k: "PTOT (todas las plantas)", v: `${num(d.ptot_W, 0)} W` },
          { k: "STOT (todas las plantas)", v: `${num(d.stot_m2)} m²` },
        ],
        cita: "DB-HE · HE 3 tabla 3.2",
      };
    case "control":
      return {
        clase: "Control · ap. 3.3",
        titulo: el.nombre,
        valor: d.control === "presencia" ? "Presencia" : d.control === "pulsador" ? "Pulsador" : "Manual + horario",
        estado,
        manda: `Cada zona dispone de ${C.manual} y de ${C.horario}; en las de uso esporádico (escaleras, pasillos, zonas de tránsito, aparcamientos), este último puede sustituirse por un ${C.presencia} o por un ${C.pulsador}.`,
        filas: [{ k: "Sistema", v: NOMBRE_CONTROL[d.control] }],
        cita: "DB-HE · HE 3 ap. 3.3",
      };
    case "luz_natural":
      return {
        clase: "Luz natural · ap. 3.4",
        titulo: el.nombre,
        valor: "No se exige",
        estado,
        manda: "Las zonas comunes de los edificios residenciales están excluidas de la exigencia de aprovechar la luz natural.",
        filas: [],
        cita: "DB-HE · HE 3 ap. 3.4 pto 2",
      };
    case "otros":
      return {
        clase: "Otros usos",
        titulo: el.nombre,
        valor: "Previsto",
        estado,
        manda: "Las oficinas y los locales justificarán HE 3 con el proyecto de iluminación de su actividad.",
        filas: [{ k: "Plantas", v: lista([...new Set(d.zonas.map((z) => z.plantas))]) }],
        cita: "DB-HE · HE 3",
      };
  }
}

export function textoAvisoHe3(_a: Aviso): TextoSi {
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function textoIncumplimientoHe3(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "zona") {
    return d.veei === null
      ? { titulo: `Falta la potencia o la iluminancia de ${el.nombre.toLowerCase()}.`, detalle: "Declara la potencia instalada en iluminación (lámparas y equipos) y la iluminancia media de proyecto de la zona." }
      : { titulo: `El VEEI de ${el.nombre.toLowerCase()} supera el límite.`, detalle: `Da ${num(d.veei)} W/m² por cada 100 lux, con un límite de ${num(d.limite, 1)}. Baja la potencia instalada o usa luminarias más eficaces.` };
  }
  if (d.clase === "potencia") {
    return d.ratio === null
      ? null
      : { titulo: `${el.nombre} supera la máxima.`, detalle: `Da ${wm2(d.ratio)}, con un máximo de ${wm2(d.limite)} (HE 3, tabla 3.2).` };
  }
  return null;
}

export function describirDibujoHe3(j: JustificacionHe3): string {
  return zonasDe(j).length > 0
    ? "Sección del edificio con las zonas comunes y el aparcamiento que se justifican, cada una con su VEEI."
    : "Sección del edificio: sin zonas comunes ni aparcamiento.";
}

export function piezasHe3(j: JustificacionHe3): { texto: string; acento: boolean }[] {
  if (j.sinDatos > 0) return [{ texto: `${j.sinDatos} sin declarar`, acento: true }];
  const fallan = j.elementos.some((e) => e.veredicto === "fail");
  const valores = zonasDe(j).flatMap((e) => (e.detalle.clase === "zona" && e.detalle.veei !== null ? [e.detalle.veei] : []));
  return valores.length > 0 ? [{ texto: `VEEI ≤ ${num(Math.max(...valores))}`, acento: fallan }] : [{ texto: "con su actividad", acento: false }];
}
