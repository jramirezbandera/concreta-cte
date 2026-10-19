// =============================================================================
// HE 2 · RITE — Textos (feature-36, paso 4): la frase de la cabecera, «Qué
// entra», la franja de cada elemento, las etiquetas del dibujo y de la lista y lo
// que no cumple. PURAS.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { NOMBRE_APOYO, NOMBRE_SISTEMA } from "../he4/textos";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista } from "../sua/colocar";
import type { Calefaccion, Emisores, ProduccionClima, Refrigeracion } from "./estado";
import type { AcsRite, DetalleRite, ElementoRite, InstalacionRite, JustificacionRite, Servicio } from "./justificacion";
import { CONDICIONES_INTERIORES, DOCUMENTO_RITE, EFICIENCIA_RITE, type Documento } from "./tablas";

const D = DOCUMENTO_RITE.datos;
const CI = CONDICIONES_INTERIORES.datos;

/** «5,5» */
export function num(v: number, decimales = 2): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: decimales });
}
export const kw = (v: number) => `${num(v)} kW`;

export const NOMBRE_CALEFACCION: Record<Calefaccion, string> = {
  aire_aire: "bomba de calor aire-aire",
  aire_agua: "bomba de calor aire-agua",
  caldera: "caldera",
  biomasa: "caldera de biomasa",
  red: "red urbana de calor",
  electrica: "emisores eléctricos",
  ninguna: "sin calefacción",
};

export const NOMBRE_REFRIGERACION: Record<Refrigeracion, string> = {
  misma: "la misma bomba de calor, reversible",
  aire_aire: "bomba de calor aire-aire",
  ninguna: "sin refrigeración",
};

export const NOMBRE_EMISORES: Record<Emisores, string> = {
  splits: "unidades interiores (split)",
  conductos: "distribución por conductos",
  suelo_radiante: "suelo radiante",
  radiadores: "radiadores",
  fancoils: "fancoils",
};

export const NOMBRE_SERVICIO: Record<Servicio, string> = { calefaccion: "calefacción", refrigeracion: "refrigeración", acs: "ACS" };

export const NOMBRE_DOCUMENTO: Record<Documento, string> = {
  ninguno: "no es preceptiva la documentación",
  memoria: "memoria técnica",
  proyecto: "proyecto",
};

/** «individual en cada vivienda», «centralizada». */
export function textoProduccion(p: ProduccionClima, unifamiliar: boolean, residencial: boolean): string {
  if (unifamiliar) return "de la vivienda";
  return p === "centralizada" ? "centralizada" : residencial ? "individual en cada vivienda" : "individual en cada local";
}

/** El ACS de HE 4, en una línea: «bomba de calor, individual». */
export function textoAcs(a: AcsRite): string {
  const s = a.he4.sistema === "solar" ? `solar térmica con apoyo de ${NOMBRE_APOYO[a.he4.apoyo]}` : NOMBRE_SISTEMA[a.he4.sistema];
  return s;
}

/** De qué es la potencia de una instalación: «por vivienda», «total». */
function dePotencia(i: InstalacionRite, unifamiliar: boolean): string {
  return unifamiliar ? "" : i.produccion === "centralizada" ? " en total" : " por vivienda";
}

/** «la calefacción, la refrigeración y el ACS». */
export function serviciosTexto(s: readonly Servicio[]): string {
  return lista(s.map((x) => (x === "acs" ? "el ACS" : `la ${NOMBRE_SERVICIO[x]}`)));
}

function det(el: ElementoSi<unknown>): DetalleRite {
  return (el as ElementoRite).detalle;
}

const documentos = (j: JustificacionRite) => j.instalaciones;

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseRite(j: JustificacionRite): string {
  const faltan = [...new Set(j.instalaciones.flatMap((i) => i.faltan))];
  if (faltan.length > 0) return `Falta la potencia nominal de ${lista(faltan.map((s) => NOMBRE_SERVICIO[s]))}: sin ella no se sabe qué documento exige el RITE.`;
  const docs = documentos(j).map((i) => `${NOMBRE_DOCUMENTO[i.documento!]} (${kw(i.potencia_kW!)}${dePotencia(i, j.unifamiliar)})`);
  const clima = j.decisiones.calefaccion === "ninguna" ? "Sin calefacción" : `${NOMBRE_CALEFACCION[j.decisiones.calefaccion][0].toUpperCase()}${NOMBRE_CALEFACCION[j.decisiones.calefaccion].slice(1)}`;
  return `${clima} y ACS con ${textoAcs(j.acs)}: ${lista(docs)}, según el art. 15 del RITE.`;
}

export function metricasRite(j: JustificacionRite): string {
  return j.instalaciones.map((i) => (i.potencia_kW === null ? "sin potencia" : `${kw(i.potencia_kW)} · ${NOMBRE_DOCUMENTO[i.documento!]}`)).join(" · ");
}

export function piezasRite(j: JustificacionRite): { texto: string; acento: boolean }[] {
  return j.instalaciones.map((i) => (i.documento === null ? { texto: "sin potencia", acento: true } : { texto: i.documento === "ninguno" ? "< 5 kW" : NOMBRE_DOCUMENTO[i.documento], acento: false }));
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraRite(j: JustificacionRite, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const fila = (titulo: string, detalle: string, t: string) => filas.push({ id: el.id, titulo, detalle, trato: t, estado: trato(estados[el.id]), elementoId: el.id });
    if (d.clase === "calefaccion" && d.d.calefaccion !== "ninguna") fila("Calefacción", NOMBRE_CALEFACCION[d.d.calefaccion], d.potencia_kW === null ? "sin potencia" : kw(d.potencia_kW));
    else if (d.clase === "refrigeracion" && d.d.refrigeracion !== "ninguna") fila("Refrigeración", d.d.refrigeracion === "misma" ? "la misma máquina" : NOMBRE_REFRIGERACION[d.d.refrigeracion], d.potencia_kW === null ? "sin potencia" : kw(d.potencia_kW));
    else if (d.clase === "acs") fila("ACS", `${textoAcs(d.acs)} (de HE 4)`, d.acs.mismaMaquina ? "con la calefacción" : d.acs.potencia_kW === null ? "sin potencia" : kw(d.acs.potencia_kW));
  }
  return filas;
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaRite(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "calefaccion":
      return d.d.calefaccion === "ninguna" ? "sin calefacción" : `calor ${d.potencia_kW === null ? "—" : kw(d.potencia_kW)}`;
    case "refrigeracion":
      return d.d.refrigeracion === "ninguna" ? "sin refrigeración" : `frío ${d.potencia_kW === null ? "—" : kw(d.potencia_kW)}`;
    case "acs":
      return d.acs.mismaMaquina ? "ACS con la calefacción" : `ACS ${d.acs.potencia_kW === null ? "—" : kw(d.acs.potencia_kW)}`;
    case "documento":
      return d.instalacion.documento === null ? "sin potencia" : d.instalacion.documento === "ninguno" ? "< 5 kW" : NOMBRE_DOCUMENTO[d.instalacion.documento];
    case "condiciones":
      return "tabla 1.4.1.1";
    case "aire":
      return d.residencial ? "aire: HS 3" : "aire: IT 1.1.4.2";
    case "higiene":
      return "legionelosis";
    case "contabilizacion":
      return d.reparto ? "reparto de gastos" : "un usuario";
    case "recuperacion":
      return "recuperación: no";
    case "cambio_uso":
      return "art. 15.6";
  }
}

export function resultadoListaRite(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "calefaccion":
      if (d.d.calefaccion === "ninguna") return "no se proyecta";
      return `${NOMBRE_CALEFACCION[d.d.calefaccion]}, con ${NOMBRE_EMISORES[d.d.emisores]}${d.potencia_kW === null ? "; declara la potencia nominal" : ` · ${kw(d.potencia_kW)}`}${d.scop === null ? "" : ` · SCOP ${num(d.scop)}`}`;
    case "refrigeracion":
      if (d.d.refrigeracion === "ninguna") return "no se proyecta";
      return `${NOMBRE_REFRIGERACION[d.d.refrigeracion]}${d.potencia_kW === null ? "; declara la potencia nominal" : ` · ${kw(d.potencia_kW)}`}${d.seer === null ? "" : ` · SEER ${num(d.seer)}`}`;
    case "acs":
      return `${textoAcs(d.acs)} (HE 4)${d.acs.mismaMaquina ? ", con el generador de la calefacción" : d.acs.potencia_kW === null ? "; declara la potencia nominal" : ` · ${kw(d.acs.potencia_kW)}`}${d.acs.acumulacion_l === null ? "" : ` · ${num(d.acs.acumulacion_l, 0)} l`}`;
    case "documento": {
      const i = d.instalacion;
      if (i.potencia_kW === null) return `falta la potencia de ${lista(i.faltan.map((s) => NOMBRE_SERVICIO[s]))}`;
      return `${kw(i.potencia_kW)}${dePotencia(i, d.unifamiliar)} → ${NOMBRE_DOCUMENTO[i.documento!]} (art. 15.1)`;
    }
    case "condiciones":
      return `verano ${CI.verano.temperatura_C} °C y ${CI.verano.humedad_pct} %; invierno ${CI.invierno.temperatura_C} °C y ${CI.invierno.humedad_pct} %`;
    case "aire":
      return d.residencial ? "en las viviendas, la de la Sección HS 3 (IT 1.1.4.2.1)" : "la del documento RITE (IT 1.1.4.2)";
    case "higiene":
      return "la de la normativa de prevención y control de la legionelosis (IT 1.1.4.3)";
    case "contabilizacion":
      return d.reparto ? "la instalación centralizada da servicio a más de un usuario: reparto de gastos (IT 1.2.4.4)" : "cada instalación sirve a un solo usuario (interpretación)";
    case "recuperacion":
      return `el aire expulsado de una vivienda no llega a ${num(EFICIENCIA_RITE.datos.recuperacionMasDe_m3_s)} m³/s (interpretación)`;
    case "cambio_uso":
      return "el documento analiza la idoneidad de las instalaciones existentes para el nuevo uso";
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

const MANDA_DOCUMENTO = `Con más de ${D.proyectoMasDe_kW} kW en generación de calor o frío, proyecto; de ${D.memoriaDesde_kW} a ${D.proyectoMasDe_kW} kW, el proyecto puede sustituirse por una memoria técnica, de instalador habilitado o técnico titulado competente; con menos de ${D.memoriaDesde_kW} kW no es preceptiva la documentación. Con varios generadores se suman los necesarios para el servicio, sin la solar térmica.`;

export function franjaRite(el: ElementoSi<unknown>, _j: JustificacionRite, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "calefaccion":
      return {
        clase: "Calefacción",
        titulo: el.nombre,
        valor: d.d.calefaccion === "ninguna" ? "Ninguna" : d.potencia_kW === null ? "—" : num(d.potencia_kW),
        unidad: d.d.calefaccion === "ninguna" ? undefined : "kW",
        estado,
        manda: "La potencia térmica nominal del generador, del fabricante, decide el documento del RITE. La herramienta no calcula cargas: las dimensiona la memoria técnica o el proyecto.",
        nota: d.d.calefaccion !== "ninguna" && d.potencia_kW === null ? "Declara la potencia nominal de calefacción: por vivienda si es individual, la total si es centralizada." : undefined,
        filas:
          d.d.calefaccion === "ninguna"
            ? []
            : [
                { k: "Generador", v: NOMBRE_CALEFACCION[d.d.calefaccion] },
                { k: "Emisores", v: NOMBRE_EMISORES[d.d.emisores] },
                { k: "Producción", v: d.d.produccion === "centralizada" ? "centralizada" : "individual" },
                { k: "SCOP (fabricante)", v: d.scop === null ? "sin declarar" : num(d.scop) },
              ],
        cita: "RITE · IT 1.2.3",
      };
    case "refrigeracion":
      return {
        clase: "Refrigeración",
        titulo: el.nombre,
        valor: d.d.refrigeracion === "ninguna" ? "Ninguna" : d.potencia_kW === null ? "—" : num(d.potencia_kW),
        unidad: d.d.refrigeracion === "ninguna" ? undefined : "kW",
        estado,
        manda: "En una bomba de calor reversible se compara la mayor de las potencias de calor y de frío (art. 15.1, «en generación de calor o frío»; interpretación).",
        nota: d.d.refrigeracion !== "ninguna" && d.potencia_kW === null ? "Declara la potencia frigorífica nominal." : undefined,
        filas: d.d.refrigeracion === "ninguna" ? [] : [{ k: "Generador", v: NOMBRE_REFRIGERACION[d.d.refrigeracion] }, { k: "SEER (fabricante)", v: d.seer === null ? "sin declarar" : num(d.seer) }],
        cita: "RITE · art. 15.1",
      };
    case "acs":
      return {
        clase: "ACS · de HE 4",
        titulo: el.nombre,
        valor: d.acs.mismaMaquina ? "Con la calefacción" : d.acs.potencia_kW === null ? "—" : num(d.acs.potencia_kW),
        unidad: d.acs.mismaMaquina ? undefined : "kW",
        estado,
        manda: "El sistema, la producción y el apoyo del ACS se declaran en HE 4; aquí, la potencia del generador y la acumulación. La solar térmica no suma potencia (art. 15.2).",
        nota: !d.acs.mismaMaquina && d.acs.potencia_kW === null ? "Declara la potencia nominal del generador de ACS (el apoyo, si es solar térmica)." : undefined,
        filas: [
          { k: "Sistema (HE 4)", v: textoAcs(d.acs) },
          { k: "Producción (HE 4)", v: d.acs.he4.produccion },
          ...(d.acs.scop === null ? [] : [{ k: "SCOPdhw (HE 4)", v: num(d.acs.scop) }]),
          { k: "Acumulación", v: d.acs.acumulacion_l === null ? "sin declarar" : `${num(d.acs.acumulacion_l, 0)} l` },
        ],
        cita: "DB-HE · HE 4 · RITE · art. 15.2",
      };
    case "documento": {
      const i = d.instalacion;
      return {
        clase: "Documento · art. 15",
        titulo: el.nombre,
        valor: i.documento === null ? "—" : i.documento === "ninguno" ? "No preceptivo" : i.documento === "memoria" ? "Memoria técnica" : "Proyecto",
        unidad: i.potencia_kW === null ? undefined : `${kw(i.potencia_kW)}${dePotencia(i, d.unifamiliar)}`,
        estado,
        manda: MANDA_DOCUMENTO,
        nota: i.potencia_kW === null ? `Falta la potencia de ${lista(i.faltan.map((s) => NOMBRE_SERVICIO[s]))}.` : undefined,
        filas: [
          { k: "Servicios", v: serviciosTexto(i.servicios) },
          { k: "Calor (suma)", v: i.calor_kW === null ? "—" : kw(i.calor_kW) },
          { k: "Frío", v: i.frio_kW === null ? "—" : kw(i.frio_kW) },
        ],
        cita: "RITE · art. 15.1, 15.2, 16.2 y 17.2",
      };
    }
    case "condiciones":
      return {
        clase: "Bienestar térmico · IT 1.1.4.1",
        titulo: el.nombre,
        valor: "Tabla 1.4.1.1",
        estado,
        manda: "Las condiciones interiores de diseño de la temperatura operativa y la humedad relativa, por estación.",
        filas: [
          { k: "Verano", v: `${CI.verano.temperatura_C} °C · HR ${CI.verano.humedad_pct} %` },
          { k: "Invierno", v: `${CI.invierno.temperatura_C} °C · HR ${CI.invierno.humedad_pct} %` },
        ],
        cita: "RITE · IT 1.1.4.1.2 · tabla 1.4.1.1",
      };
    case "aire":
      return {
        clase: "Calidad del aire · IT 1.1.4.2",
        titulo: el.nombre,
        valor: d.residencial ? "HS 3" : "IT 1.1.4.2",
        estado,
        manda: d.residencial
          ? "En los locales habitables de las viviendas se consideran válidos los requisitos de calidad del aire interior de la Sección HS 3 del CTE."
          : "La calidad del aire interior de los locales no residenciales la justifica el documento RITE.",
        filas: [],
        cita: d.residencial ? "RITE · IT 1.1.4.2.1" : "RITE · IT 1.1.4.2",
      };
    case "higiene":
      return {
        clase: "Higiene · IT 1.1.4.3",
        titulo: el.nombre,
        valor: "Legionelosis",
        estado,
        manda: "El RITE no fija temperaturas de preparación ni de distribución del ACS: remite a la normativa de prevención y control de la legionelosis.",
        filas: [],
        cita: "RITE · IT 1.1.4.3",
      };
    case "contabilizacion":
      return {
        clase: "Contabilización · IT 1.2.4.4",
        titulo: el.nombre,
        valor: d.reparto ? "Reparto de gastos" : "Un usuario",
        estado,
        manda: "Las instalaciones que dan servicio a más de un usuario llevan un sistema de reparto de gastos.",
        nota: d.reparto ? undefined : "Cada instalación sirve a una sola vivienda o local: no hay gastos que repartir (interpretación).",
        filas: [{ k: "Usuarios del edificio", v: String(d.usuarios) }],
        cita: "RITE · IT 1.2.4.4",
      };
    case "recuperacion":
      return {
        clase: "Recuperación de calor · IT 1.2.4.5.2",
        titulo: el.nombre,
        valor: "No se exige",
        estado,
        manda: `Se recupera el calor del aire expulsado por medios mecánicos cuando su caudal supera ${num(EFICIENCIA_RITE.datos.recuperacionMasDe_m3_s)} m³/s.`,
        nota: "Los caudales de ventilación de una vivienda (HS 3) quedan muy por debajo (interpretación).",
        filas: [],
        cita: "RITE · IT 1.2.4.5.2",
      };
    case "cambio_uso":
      return {
        clase: "Cambio de uso · art. 15.6",
        titulo: el.nombre,
        valor: "Art. 15.6",
        estado,
        manda: "En el cambio de uso, el proyecto o la memoria técnica analizan y justifican la explotación energética y la idoneidad de las instalaciones existentes para el nuevo uso.",
        filas: [],
        cita: "RITE · art. 15.6",
      };
  }
}

// ── Avisos y lo que no cumple ───────────────────────────────────────────────

export function textoAvisoRite(_a: Aviso): TextoSi {
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function textoIncumplimientoRite(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "documento" && d.instalacion.potencia_kW === null) {
    return {
      titulo: `Falta la potencia nominal de ${lista(d.instalacion.faltan.map((s) => NOMBRE_SERVICIO[s]))}.`,
      detalle: "Declara la potencia de cada generador, del fabricante: decide si el RITE pide proyecto, memoria técnica o nada (art. 15.1).",
    };
  }
  return null;
}

export function describirDibujoRite(j: JustificacionRite): string {
  return `Sección del edificio con las viviendas y las instalaciones térmicas: ${j.instalaciones.map((i) => (i.documento === null ? "sin potencia" : NOMBRE_DOCUMENTO[i.documento])).join(" y ")}.`;
}
