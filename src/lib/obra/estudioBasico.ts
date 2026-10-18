// =============================================================================
// El estudio básico de seguridad y salud (feature-35, paso 5). PURO.
//
// El cuarto entregable: el documento del art. 6 del RD 1627/1997, con los
// apartados de research/analisis-ejemplos-ebss.md §3. Abre con la
// justificación del art. 4 (paso 2), solo lleva las fichas que el proyectista
// deja marcadas (paso 4) y trae lo que la norma exige y los ejemplos no traen:
// amianto, anexo II, servicios higiénicos del convenio, otras actividades y
// trabajos posteriores. Lo que depende de la obra no se supone: sin el dato,
// el apartado sale con su «Pendiente» y la lista de pendientes lo recoge para
// «Antes de entregar». Si se supera un supuesto del art. 4.1, el estudio
// básico no se redacta: el documento solo dice que hace falta el completo.
//
// `bloquesEstudioBasico` lo pasa a los mismos bloques que la memoria: el Word
// y el PDF se pintan con `memoriaDocx` y `renderMemoriaPdf`.
// =============================================================================

import type { MetaDocumento } from "../docx/render";
import type { Firmante } from "../estudio/estudio";
import { NOMBRE_FASE } from "../estudio/estudio";
import type { Proyecto } from "../proyecto/tipos";
import { resumenEdificio, type ResumenEdificio } from "../edificio/derivar";
import { cuantos, listaY, mayuscula } from "../cte/redaccion";
import { textoTabla } from "../cte/memoria";
import type { TipoColumna } from "../cte/presentacion";
import { art4, coordinadores, dotacionHigienica, type Art4, type Coordinador, type LetraSupuesto } from "../ebss/art4";
import { amiantoObligatorio, pendientesSeguridadSalud, preguntaCabezaFamilia, type PendienteDato } from "../ebss/datos";
import { fichasDelEstudio, fichasSinRevisar } from "../ebss/propuesta";
import { ANEXO_II, nombreRiesgo, riesgosDeFicha } from "../ebss/catalogo";
import { distanciasLineas } from "../ebss/cifras";
import {
  AMIANTO_BASE,
  AMIANTO_MEDIDAS,
  AMIANTO_NORMA,
  BOTIQUIN_GUIA,
  CABEZA_FAMILIA,
  LOCAL_PRIMEROS_AUXILIOS,
  NORMAS_EBSS,
  OBJETO_EBSS,
  OBLIGACIONES_EBSS,
  POSTERIORES_DESTINO,
  POSTERIORES_INTRO,
  PRIMEROS_AUXILIOS_CONVENIO,
  PRIMEROS_AUXILIOS_RD1627,
} from "../ebss/textos";
import {
  NOMBRE_ESTADO_AMIANTO,
  NOMBRE_FRECUENCIA,
  NOMBRE_SERVICIO,
  SERVICIOS_AFECTADOS,
  type ApartadoAnexoII,
  type ClaveRiesgo,
  type EstudioSeguridadSalud,
  type FichaCatalogo,
  type ItemFicha,
  type RiesgoFicha,
} from "../ebss/tipos";
import { nombreArchivo, obraDe, type BloqueMemoria } from "./memoria";

export const TITULO_ESTUDIO_BASICO = "Estudio básico de seguridad y salud";

/** Lo que dice el Word de sí mismo en sus propiedades. */
export const META_ESTUDIO_BASICO: MetaDocumento = {
  asunto: TITULO_ESTUDIO_BASICO,
  descripcion: "Estudio básico de seguridad y salud (RD 1627/1997) redactado con Concreta Memorias",
};

/**
 * El «Pendiente» de la firma sin firmantes. Los firmantes son del estudio (del
 * navegador), no del proyecto: el recuento de Lo que se entrega no lo cuenta.
 */
export const SIN_FIRMANTES = "falta quién firma (los datos del estudio).";

/** Un apartado del documento, ya con su contenido. */
export interface ApartadoEstudio {
  /** 1 a 14 (decisión 8); los datos generales van delante, sin número (0). */
  numero: number;
  titulo: string;
  bloques: BloqueMemoria[];
}

export interface EstudioBasico {
  titulo: string;
  proyecto: string;
  art4: Art4;
  apartados: ApartadoEstudio[];
  /** Lo que falta para entregarlo, en el orden del documento (va a «Antes de entregar», paso 6). */
  pendientes: string[];
}

export interface OpcionesEstudioBasico {
  /** Quién firma: los del estudio que elige el proyecto (`firmantesDe`). */
  firmantes?: readonly Firmante[];
  /** Fecha de la firma (ISO). Sin ella, «en la fecha de la firma». */
  fecha?: string;
}

// ── Formatos ─────────────────────────────────────────────────────────────────

const euros = (v: number): string => `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const entero = (v: number): string => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });
const decimal = (v: number): string => v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
const pct = (v: number): string => `${decimal(v)} %`;
const metros = (cm: number): string => `${(cm / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
/** Con punto final, sin repetirlo. */
function frase(t: string): string {
  const s = t.trim();
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function fechaLarga(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

const TEXTO: TipoColumna = "texto";
const parrafo = (texto: string): BloqueMemoria => ({ tipo: "parrafo", texto });
const pendiente = (texto: string): BloqueMemoria => ({ tipo: "pendiente", texto: texto.startsWith("Pendiente") ? texto : `Pendiente: ${texto}` });
const vineta = (texto: string): BloqueMemoria => parrafo(`– ${texto}`);

// ── Lo que el documento sabe de la obra ──────────────────────────────────────

interface Contexto {
  p: Proyecto;
  ss: EstudioSeguridadSalud;
  a4: Art4;
  resumen: ResumenEdificio;
  nueva: boolean;
  /** Las fichas del estudio, ya editadas, en el orden del catálogo. */
  fichas: FichaCatalogo[];
  marcadas: Set<string>;
  /** Lo que falta, por id de `pendientesSeguridadSalud`. */
  faltan: Map<string, string>;
  firmantes: readonly Firmante[];
  fecha?: string;
}

/** Los «Pendiente» de un apartado: los datos que le tocan y faltan. */
function pendientesDe(c: Contexto, ids: readonly string[]): BloqueMemoria[] {
  return ids.flatMap((id) => {
    const t = c.faltan.get(id);
    return t ? [pendiente(t)] : [];
  });
}

const deGrupo = (c: Contexto, g: FichaCatalogo["grupo"]): FichaCatalogo[] => c.fichas.filter((f) => f.grupo === g);

/** Las unidades de obra en el orden de ejecución; los huecos redactados por la app, en su sitio. */
const ORDEN_FASES = [
  "F1", "F2", "F3", "F40", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F41",
  "F15", "F16", "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24", "F25", "F42", "F26", "F27", "F28",
  "F29", "F30", "F31", "F32", "F33", "F34", "F35", "F39",
];
/** Trabajos que se dan en varias fases: van detrás de las unidades. */
const TRANSVERSALES = new Set(["F36", "F37", "F38"]);

function fasesEnOrden(c: Contexto): { unidades: FichaCatalogo[]; transversales: FichaCatalogo[] } {
  const f = deGrupo(c, "F").filter((x) => x.id !== "F0");
  const pos = (id: string): number => {
    const i = ORDEN_FASES.indexOf(id);
    return i < 0 ? ORDEN_FASES.length : i;
  };
  return {
    unidades: f.filter((x) => !TRANSVERSALES.has(x.id)).sort((a, b) => pos(a.id) - pos(b.id)),
    transversales: f.filter((x) => TRANSVERSALES.has(x.id)),
  };
}

const lineaAerea = (c: Contexto): boolean | undefined => c.ss.entorno?.servicios?.linea_aerea;
/** Alta tensión: más de 1 kV (la primera fila de la tabla 1 del RD 614/2001). Sin tensión declarada, no se sabe. */
function altaTension(c: Contexto): boolean | undefined {
  if (lineaAerea(c) !== true) return lineaAerea(c) === false ? false : undefined;
  const kV = c.ss.entorno?.tensionLineas_kV;
  return kV === undefined ? undefined : kV > 1;
}
const hayAmianto = (c: Contexto): boolean => c.ss.amianto?.estado === "posible" || c.ss.amianto?.estado === "identificado";

// ── Las fichas impresas ──────────────────────────────────────────────────────

/** «(ver MA10)», «(ver F4 y F5)», «(F14)»: las remisiones del catálogo, que nombran fichas por su id. */
const REMISION = /\s?\((ver )?((?:IP|MA|TP|F|M)\d+(?:(?:, | y )(?:IP|MA|TP|F|M)\d+)*)\)/g;

/**
 * Los ids no se imprimen: la remisión pasa a nombrar la ficha por su título, y
 * desaparece si la ficha no está en este estudio.
 */
function conTitulos(t: string, titulos: ReadonlyMap<string, string>): string {
  return t.replace(REMISION, (_m, ver: string | undefined, ids: string) => {
    const de = ids.split(/, | y /).flatMap((id) => (titulos.has(id) ? [`«${titulos.get(id)}»`] : []));
    return de.length === 0 ? "" : ` (${ver ?? ""}${listaY(de)})`;
  });
}

function fichaConTitulos(f: FichaCatalogo, titulos: ReadonlyMap<string, string>): FichaCatalogo {
  const t = (x: string) => conTitulos(x, titulos);
  const item = (i: ItemFicha): ItemFicha => (typeof i === "string" ? t(i) : { ...i, texto: t(i.texto) });
  return {
    ...f,
    descripcion: t(f.descripcion),
    medidas: f.medidas.map(item),
    protecciones: f.protecciones.map(item),
    epi: f.epi.map(item),
    eficacia: t(f.eficacia),
    ...(f.notas ? { notas: f.notas.map(t) } : {}),
    ...(f.previsiones ? { previsiones: f.previsiones.map(t) } : {}),
    ...(f.informaciones ? { informaciones: f.informaciones.map(t) } : {}),
  };
}

const textoRiesgo = (r: RiesgoFicha): string => (r.causa ? `${nombreRiesgo(r.clave)} (${r.causa})` : nombreRiesgo(r.clave));

function celdaItem(i: ItemFicha): string {
  if (typeof i === "string") return i;
  return i.frecuencia ? `${i.texto} (${NOMBRE_FRECUENCIA[i.frecuencia].toLowerCase()})` : i.texto;
}

/** Los evitables van al apartado 7, no a la ficha (decisión 1). */
const noEvitable = (i: ItemFicha): boolean => typeof i === "string" || i.evitable === undefined;

/**
 * La ficha a cuatro columnas (decisión 1). Las columnas son listas
 * independientes, una entrada por fila, como en los ejemplos del estudio: así
 * ninguna fila crece más que una línea larga y la tabla se parte entre hojas.
 */
function tablaFicha(f: FichaCatalogo, rotulo: string = f.titulo): BloqueMemoria {
  const cols = [
    riesgosDeFicha(f).map(textoRiesgo),
    f.medidas.filter(noEvitable).map(celdaItem),
    f.protecciones.filter(noEvitable).map(celdaItem),
    f.epi.filter(noEvitable).map(celdaItem),
  ];
  const n = Math.max(1, ...cols.map((x) => x.length));
  return {
    tipo: "tabla",
    rotulo,
    cabecera: ["Riesgo", "Medidas preventivas", "Protecciones colectivas", "EPI"],
    filas: Array.from({ length: n }, (_, i) => cols.map((x) => x[i] ?? (i === 0 ? "—" : ""))),
    columnas: [TEXTO, TEXTO, TEXTO, TEXTO],
  };
}

function bloquesFicha(f: FichaCatalogo): BloqueMemoria[] {
  return [
    tablaFicha(f),
    parrafo(`Eficacia: ${frase(f.eficacia)}`),
    ...(f.notas ?? []).map((n): BloqueMemoria => ({ tipo: "nota", texto: frase(n) })),
  ];
}

/** «8.2. Fases de obra»: numera los subapartados según los que hay. */
function numerador(n: number): (t: string) => BloqueMemoria {
  let k = 0;
  return (t) => ({ tipo: "titulo", nivel: 3, texto: `${n}.${++k}. ${t}` });
}

// ── Datos generales ──────────────────────────────────────────────────────────

function descripcionEdificio(r: ResumenEdificio): string {
  const que = r.esUnifamiliar
    ? "vivienda unifamiliar"
    : r.tieneViviendas
      ? `edificio de ${cuantos(r.numViviendas, "vivienda", "viviendas", "f")}${r.tieneLocales ? " y locales" : ""}`
      : r.tipo === "oficinas"
        ? "edificio de oficinas"
        : "edificio";
  const bajo = r.plantasBajoRasante > 0 ? ` y ${cuantos(r.plantasBajoRasante, "planta", "plantas", "f")} bajo rasante` : "";
  const plantas = `${cuantos(r.plantasSobreRasante, "planta", "plantas", "f")} sobre rasante${bajo}`;
  const cubierta = r.tipoCubierta === "inclinada" ? "cubierta inclinada" : "cubierta plana";
  return `${que}, de ${plantas}, con ${cubierta}${r.tieneGaraje ? " y garaje" : ""}`;
}

function emplazamiento(c: Contexto): string {
  const dg = c.p.datosGenerales;
  const lugar = [dg.municipio, dg.provincia && dg.provincia !== dg.municipio ? `(${dg.provincia})` : ""].filter((x) => x).join(" ");
  const em = dg.documento?.emplazamiento?.trim();
  return em ? (lugar && !em.includes(dg.municipio) ? `${em}, ${lugar}` : em) : lugar || "Sin declarar";
}

const nombreFirmante = (f: Firmante): string => (f.titulacion ? `${f.nombre}, ${f.titulacion}` : f.nombre);

const ESTADO_COORDINADOR: Record<Coordinador["estado"], string> = { procede: "Procede", no_procede: "No procede", sin_datos: "Sin declarar" };

function datosGenerales(c: Contexto, anexoII: CasoAnexoII[]): ApartadoEstudio {
  const dg = c.p.datosGenerales;
  const doc = dg.documento;
  const obra = obraDe(c.p);
  const m = c.ss.manoDeObra;
  const co = coordinadores(c.ss.coordinacion);
  const autores = c.firmantes.map(nombreFirmante);
  const filas: string[][] = [
    ["Proyecto", doc?.titulo?.trim() || c.p.nombre],
    ...(doc?.fase ? [["Fase", NOMBRE_FASE[doc.fase]]] : []),
    ["Tipo de obra", obra.tipoObras],
    ["Edificio", mayuscula(descripcionEdificio(c.resumen))],
    ["Emplazamiento", emplazamiento(c)],
    ...(doc?.refCatastral ? [["Referencia catastral", doc.refCatastral]] : []),
    ["Duración prevista", m?.plazoDias !== undefined ? `${entero(m.plazoDias)} días laborables` : "Sin declarar"],
    ["Máximo de trabajadores a la vez", m?.maxTrabajadores !== undefined ? entero(m.maxTrabajadores) : "Sin declarar"],
    [
      "Trabajos del anexo II",
      anexoII.length > 0 ? `Apartados ${listaY(anexoII.map((x) => String(x.apartado)))} (ver apartado 10)` : "No se prevén (ver apartado 10)",
    ],
    ["Promotor", doc?.promotor?.trim() || "Sin declarar"],
    ["Autor del proyecto", autores.length > 0 ? listaY(autores) : "Sin declarar"],
    [
      "Autor del estudio básico",
      co.proyecto.estado === "procede"
        ? "El coordinador en materia de seguridad y salud durante la elaboración del proyecto (art. 6.1)"
        : autores.length > 0
          ? `${listaY(autores)}, técnico competente designado por el promotor (art. 6.1)`
          : "Sin declarar",
    ],
    ["Coordinador durante la elaboración del proyecto", ESTADO_COORDINADOR[co.proyecto.estado]],
    ["Coordinador durante la ejecución de la obra", ESTADO_COORDINADOR[co.ejecucion.estado]],
    ["Presupuesto de ejecución material", c.a4.pec ? euros(c.a4.pec.pem) : c.ss.presupuesto?.pem !== undefined ? euros(c.ss.presupuesto.pem) : "Sin declarar"],
    ["Presupuesto de ejecución por contrata", c.a4.pec ? euros(c.a4.pec.pec) : "Sin calcular"],
  ];
  const bloques: BloqueMemoria[] = [
    parrafo(
      "Los datos de la obra, en el orden de los que el promotor facilita a los contratistas para la comunicación de apertura del centro de trabajo (Orden TIN/1071/2010, art. 2.2):",
    ),
    { tipo: "tabla", cabecera: ["Dato", "Obra"], filas, columnas: [TEXTO, TEXTO] },
  ];
  for (const x of [co.proyecto, co.ejecucion]) if (x.estado !== "sin_datos") bloques.push(parrafo(x.motivo));
  bloques.push(...pendientesDe(c, ["varios-proyectistas", "varias-empresas"]));
  if (!doc?.promotor?.trim()) bloques.push(pendiente("Falta el promotor (datos del documento)."));
  return { numero: 0, titulo: "Datos generales", bloques };
}

// ── 1. Justificación del estudio básico ──────────────────────────────────────

const SUPUESTO_CORTO: Record<LetraSupuesto, string> = {
  a: "a) Presupuesto de ejecución por contrata",
  b: "b) Duración y trabajadores a la vez",
  c: "c) Volumen de mano de obra",
  d: "d) Túneles, galerías, conducciones subterráneas o presas",
};

const SE_SUPERA = { supera: "Sí", no_supera: "No", sin_datos: "Sin datos" } as const;

const COMPROMISO =
  "El promotor se compromete a que se elabore el estudio de seguridad y salud si, al contratar la obra o durante su ejecución, se diera alguno de los supuestos del art. 4.1.";

function justificacion(c: Contexto): ApartadoEstudio {
  const a = c.a4;
  const b: BloqueMemoria[] = [
    parrafo(
      "El RD 1627/1997 obliga al promotor a que se elabore un estudio de seguridad y salud cuando se da alguno de los cuatro supuestos de su art. 4.1, y un estudio básico en los demás casos (art. 4.2). Con los datos del proyecto:",
    ),
  ];
  if (a.pec) {
    const x = a.pec;
    b.push({
      tipo: "tabla",
      rotulo: "Presupuesto de ejecución por contrata",
      cabecera: ["Concepto", "Importe"],
      filas: [
        ["Presupuesto de ejecución material (PEM)", euros(x.pem)],
        [`Gastos generales (${pct(x.gg_pct)} del PEM)`, euros(x.gg)],
        [`Beneficio industrial (${pct(x.bi_pct)} del PEM)`, euros(x.bi)],
        ["Total", euros(x.base)],
        [`IVA (${pct(x.iva_pct)})`, euros(x.iva)],
        ["Presupuesto de ejecución por contrata (PEC)", euros(x.pec)],
      ],
      columnas: [TEXTO, "dato"],
    });
  }
  const notas: string[] = [];
  b.push({
    tipo: "tabla",
    rotulo: "Supuestos del art. 4.1 del RD 1627/1997",
    cabecera: ["Supuesto", "Umbral", "Proyecto", "¿Se supera?"],
    filas: a.supuestos.map((s) => {
      const llamada = s.nota ? ` (${notas.push(s.nota)})` : "";
      return [SUPUESTO_CORTO[s.letra], s.umbral, `${s.proyecto}${llamada}`, SE_SUPERA[s.estado]];
    }),
    columnas: [TEXTO, TEXTO, TEXTO, "proyecto"],
    ...(notas.length > 0 ? { notas } : {}),
  });
  const letras = (ls: readonly LetraSupuesto[]): string => listaY(ls.map((l) => `${l})`));
  switch (a.resultado) {
    case "completo":
      b.push(
        parrafo(
          `Se da ${a.superados.length > 1 ? "los supuestos" : "el supuesto"} ${letras(a.superados)} del art. 4.1: el promotor está obligado a que se elabore un estudio de seguridad y salud (arts. 4.1 y 5), que este estudio básico no sustituye.`,
        ),
        pendiente("hace falta el estudio de seguridad y salud del art. 5 del RD 1627/1997; este documento no lo redacta."),
      );
      return { numero: 1, titulo: "Justificación del estudio básico", bloques: b };
    case "basico":
      b.push(
        parrafo(
          "No se da ninguno de los cuatro supuestos del art. 4.1: el promotor está obligado a que se elabore un estudio básico de seguridad y salud (art. 4.2), que es este documento.",
        ),
      );
      break;
    case "pendiente":
      b.push(
        parrafo(
          `Con los datos declarados no se supera ningún supuesto, pero faltan datos para decidir ${a.sinDatos.length > 1 ? "los supuestos" : "el supuesto"} ${letras(a.sinDatos)}.`,
        ),
        ...pendientesDe(c, ["pem", "porcentajes", "plazo", "trabajadores", "jornadas", "subterraneas"]),
      );
      break;
  }
  if (a.avisoPec) {
    b.push(
      parrafo(
        `El presupuesto de ejecución por contrata queda a ${euros(a.avisoPec.diferencia)} del umbral del supuesto a), un ${pct(a.avisoPec.pct)}: un aumento en la contratación puede superarlo.`,
      ),
    );
  }
  b.push(parrafo(COMPROMISO));
  return { numero: 1, titulo: "Justificación del estudio básico", bloques: b };
}

// ── 3. Emplazamiento, entorno y servicios afectados ──────────────────────────

const SI_NO = (v: boolean | undefined): string => (v === undefined ? "Sin declarar" : v ? "Existe" : "No existe");

function entorno(c: Contexto): ApartadoEstudio {
  const en = c.ss.entorno;
  const dg = c.p.datosGenerales;
  const b: BloqueMemoria[] = [parrafo(`La obra está en ${emplazamiento(c)}${dg.documento?.refCatastral ? `, con referencia catastral ${dg.documento.refCatastral}` : ""}.`)];
  if (en?.viaPublica === true) {
    b.push(parrafo("La obra ocupa la vía pública (vallado, acopios o andamio sobre la acera): se delimita la zona y se protege el paso de peatones y vehículos, como dice la ficha de trabajos junto a la vía pública (apartado 6)."));
  } else if (en?.viaPublica === false) {
    b.push(parrafo("La obra no ocupa la vía pública: la carga y descarga se hace dentro de la parcela o con la autorización municipal que corresponda."));
  }
  if (!c.nueva && en?.edificioEnUso !== undefined) {
    b.push(parrafo(en.edificioEnUso ? "El edificio o el local sigue en uso durante la obra (apartado 9)." : "El edificio o el local no está en uso durante la obra."));
  }
  b.push({
    tipo: "tabla",
    rotulo: "Servicios afectados",
    cabecera: ["Servicio", "En la zona de la obra"],
    filas: SERVICIOS_AFECTADOS.map((s) => [NOMBRE_SERVICIO[s], SI_NO(en?.servicios?.[s])]),
    columnas: [TEXTO, "proyecto"],
  });
  if (en?.servicios?.linea_aerea === true && en.tensionLineas_kV !== undefined) {
    const d = distanciasLineas(en.tensionLineas_kV);
    b.push(
      parrafo(
        d
          ? `La línea aérea próxima es de ${decimal(en.tensionLineas_kV)} kV. Por la tabla 1 del anexo I del RD 614/2001, la zona de peligro llega a ${metros(d.dpel1_cm)} de los conductores con riesgo de sobretensión por rayo (${metros(d.dpel2_cm)} sin él), y la de proximidad, a ${metros(d.dprox2_cm)} donde no se puede delimitar con precisión la zona de trabajo, que es lo habitual en la obra. Nadie invade la zona de peligro, ni con herramientas, materiales o máquinas.`
          : `La línea aérea próxima es de ${decimal(en.tensionLineas_kV)} kV, más de lo que recoge la tabla 1 del anexo I del RD 614/2001: las distancias las fija la compañía.`,
      ),
    );
  }
  b.push(parrafo("Antes de empezar se piden a las compañías los planos de sus servicios y se confirma el trazado de los enterrados; las acometidas provisionales de obra se piden a las compañías suministradoras."));
  const ca = en?.centroAsistencial;
  if (ca) {
    b.push({
      tipo: "tabla",
      rotulo: "Centro asistencial más próximo",
      cabecera: ["Dato", "Centro"],
      filas: [
        ["Nombre", ca.nombre],
        ...(ca.direccion ? [["Dirección", ca.direccion]] : []),
        ...(ca.distancia_km !== undefined ? [["Distancia", `${decimal(ca.distancia_km)} km`]] : []),
        ...(ca.tiempo_min !== undefined ? [["Tiempo de llegada", `${entero(ca.tiempo_min)} min`]] : []),
      ],
      columnas: [TEXTO, TEXTO],
    });
    b.push(parrafo("Esta información, el recorrido más recomendable y los teléfonos de urgencia se exponen en un lugar visible de la obra (VII Convenio, art. 234.7)."));
  }
  // La vía pública y el edificio en uso, pendientes en el apartado 9, que es donde cuentan.
  b.push(...pendientesDe(c, ["centro", "servicios", "tension"]));
  return { numero: 3, titulo: "Emplazamiento, entorno y servicios afectados", bloques: b };
}

// ── 4. Descripción de la obra y organización ─────────────────────────────────

function tablaDeFichas(rotulo: string, cabecera: string, fichas: readonly FichaCatalogo[]): BloqueMemoria {
  return { tipo: "tabla", rotulo, cabecera: [cabecera, "Descripción"], filas: fichas.map((f) => [f.titulo, frase(f.descripcion)]), columnas: [TEXTO, TEXTO] };
}

function descripcion(c: Contexto): ApartadoEstudio {
  const obra = obraDe(c.p);
  const m = c.ss.manoDeObra;
  const b: BloqueMemoria[] = [parrafo(`${obra.tipoObras}: ${descripcionEdificio(c.resumen)}.`)];
  if (m?.plazoDias !== undefined && m.maxTrabajadores !== undefined) {
    b.push(parrafo(`El plazo previsto es de ${entero(m.plazoDias)} días laborables, con ${cuantos(m.maxTrabajadores, "trabajador", "trabajadores")} a la vez como máximo.`));
  }
  const { unidades, transversales } = fasesEnOrden(c);
  if (unidades.length > 0) {
    b.push(parrafo("La obra tiene las unidades siguientes, en el orden en que se ejecutan:"), tablaDeFichas("Unidades de obra", "Unidad de obra", unidades));
  } else {
    b.push(pendiente("no hay ninguna unidad de obra marcada en la selección de fichas."));
  }
  if (transversales.length > 0) b.push(tablaDeFichas("Trabajos que se dan en varias fases", "Trabajo", transversales));
  const ma = deGrupo(c, "MA");
  if (ma.length > 0) b.push(tablaDeFichas("Medios auxiliares y protecciones colectivas previstos", "Medio", ma));
  const maq = deGrupo(c, "M");
  if (maq.length > 0) b.push(tablaDeFichas("Maquinaria prevista", "Máquina", maq));
  b.push(
    parrafo(
      c.ss.planos?.trim()
        ? `La documentación gráfica de este estudio (planos ${c.ss.planos.trim()}) completa esta descripción.`
        : "Este estudio no lleva documentación gráfica propia: la obra se describe en los planos del proyecto.",
    ),
  );
  return { numero: 4, titulo: "Descripción de la obra y organización", bloques: b };
}

// ── 5. Normas aplicables ─────────────────────────────────────────────────────

function normas(c: Contexto): ApartadoEstudio {
  const torre = c.ss.medios?.gruaTorre === true || c.marcadas.has("M7");
  const movil = c.ss.medios?.gruaMovil === true || c.marcadas.has("M6");
  const lista = NORMAS_EBSS.datos.filter((n) => (n.solo === "grua_torre" ? torre : n.solo === "grua_movil" ? movil : true));
  return {
    numero: 5,
    titulo: "Normas de seguridad y salud aplicables",
    bloques: [parrafo("Se aplican a la obra, en su redacción vigente:"), ...lista.map((n) => vineta(`${n.titulo}.`))],
  };
}

// ── 6. Implantación, instalaciones provisionales y servicios higiénicos ──────

function implantacion(c: Contexto): ApartadoEstudio {
  const sub = numerador(6);
  const b: BloqueMemoria[] = [];
  const ip = deGrupo(c, "IP").filter((f) => f.id !== "IP6");
  if (ip.length > 0) {
    b.push(sub("Implantación e instalaciones provisionales"));
    for (const f of ip) b.push(...bloquesFicha(f));
  }
  b.push(sub("Servicios higiénicos y primeros auxilios"));
  const sh = c.ss.serviciosHigienicos;
  const d = dotacionHigienica(c.ss.manoDeObra?.maxTrabajadores, sh);
  if (d) {
    b.push(
      parrafo(`La dotación se calcula con ${cuantos(d.trabajadores, "trabajador", "trabajadores")} a la vez, contando las subcontratas y los autónomos, y se adapta a medida que se incorporan (VII Convenio, art. 231.1):`),
      {
        tipo: "tabla",
        rotulo: "Dotación mínima del VII Convenio, art. 232.2",
        cabecera: ["Elemento", "Por cada", "Dotación"],
        filas: [
          ["Lavabos", "10 trabajadores o fracción", entero(d.convenio.lavabos)],
          ["Duchas (1)", "10 trabajadores o fracción", entero(d.convenio.duchas)],
          ["Retretes", "25 trabajadores o fracción", entero(d.convenio.retretes)],
        ],
        columnas: [TEXTO, TEXTO, "dato"],
        notas: ["Cuando el tipo de actividad o la salubridad lo requieran; la Guía técnica del INSST las recomienda en todas las obras."],
      },
      parrafo(
        "Vestuario climatizado, con taquilla de doble compartimento, si hay ropa especial de trabajo o trabajos sucios, y en todo caso un espacio con llave para la ropa y los objetos de cada trabajador (VII Convenio, art. 232.1); la Guía técnica del INSST recomienda vestuarios en todas las obras.",
      ),
    );
    if (d.guia) {
      b.push(
        parrafo(
          `Con ${cuantos(d.guia.hombres, "hombre", "hombres")} y ${cuantos(d.guia.mujeres, "mujer", "mujeres", "f")}, la Guía técnica del INSST recomienda ${cuantos(d.guia.retretes, "retrete", "retretes")} (uno por cada 25 hombres y uno por cada 15 mujeres, o fracción) y ${cuantos(d.guia.urinarios, "urinario", "urinarios")} (uno por cada 25 hombres o fracción).`,
        ),
      );
    }
    if (d.admiteAlternativa) {
      b.push(
        d.alternativa
          ? parrafo(`Es una obra de corta duración o de escasa importancia, que admite una solución alternativa (VII Convenio, art. 231.4): ${frase(d.alternativa)}`)
          : pendiente("la obra se declara de corta duración, pero falta describir la solución alternativa."),
      );
    }
  } else {
    b.push(pendiente("la dotación de servicios higiénicos sale con el máximo de trabajadores a la vez."));
  }
  b.push(
    parrafo("Los trabajadores disponen de agua potable y de instalaciones para comer y, en su caso, para preparar sus comidas (anexo IV, parte A, apartado 19 del RD 1627/1997)."),
    parrafo(PRIMEROS_AUXILIOS_RD1627),
    parrafo(PRIMEROS_AUXILIOS_CONVENIO),
  );
  if (d?.localPrimerosAuxilios) b.push(parrafo(LOCAL_PRIMEROS_AUXILIOS));
  b.push(parrafo(BOTIQUIN_GUIA));
  if (c.ss.entorno?.centroAsistencial) b.push(parrafo("El centro asistencial más próximo es el del apartado 3."));
  const ip6 = c.fichas.find((f) => f.id === "IP6");
  if (ip6) b.push(...bloquesFicha(ip6));
  return { numero: 6, titulo: "Implantación, instalaciones provisionales y servicios higiénicos", bloques: b };
}

// ── 7. Riesgos evitables ─────────────────────────────────────────────────────

function evitables(c: Contexto): ApartadoEstudio {
  const filas: string[][] = [];
  const fila = (clave: ClaveRiesgo, medida: string, donde: string) => filas.push([nombreRiesgo(clave), medida, donde]);
  for (const f of c.fichas) {
    if (f.grupo === "TP") continue;
    for (const i of [...f.medidas, ...f.protecciones, ...f.epi]) {
      if (typeof i === "object" && i.evitable) fila(i.evitable, i.texto, f.titulo);
    }
  }
  if (lineaAerea(c) === true) {
    fila("electrico", "Desviar la línea aérea fuera de la zona de la obra o dejarla sin tensión, de acuerdo con la compañía (RD 1627/1997, anexo IV, parte C, apartado 10 c)", "Servicios afectados");
  }
  if (hayAmianto(c)) fila("amianto", "Retirar los materiales con amianto antes de demoler, con el plan de trabajo aprobado (apartado 11)", "Demolición");
  const b: BloqueMemoria[] =
    filas.length > 0
      ? [
          parrafo("Los riesgos que esta obra evita con una decisión concreta, y la medida técnica para ello (art. 6.2):"),
          { tipo: "tabla", cabecera: ["Riesgo que se evita", "Medida que lo evita", "Unidad de obra"], filas, columnas: [TEXTO, TEXTO, TEXTO] },
          parrafo("No se relacionan los riesgos que el proyecto ya ha evitado en su concepción, ni los que solo pueden reducirse, que van en el apartado 8."),
        ]
      : [parrafo("No se identifican riesgos que esta obra pueda evitar del todo con una decisión concreta: los de cada unidad se controlan y reducen con las medidas del apartado 8.")];
  return { numero: 7, titulo: "Riesgos evitables y medidas para evitarlos", bloques: b };
}

// ── 8. Riesgos no eliminables ────────────────────────────────────────────────

function noEliminables(c: Contexto): ApartadoEstudio {
  const sub = numerador(8);
  const b: BloqueMemoria[] = [
    parrafo(
      "Para cada unidad de obra, medio auxiliar y máquina que tiene esta obra, los riesgos que no pueden eliminarse, con las medidas preventivas, las protecciones colectivas y los equipos de protección individual (EPI) que los controlan y reducen, y la valoración de su eficacia (art. 6.2). Las columnas son listas independientes: las medidas de una ficha se aplican a todos sus riesgos.",
    ),
  ];
  const f0 = c.fichas.find((f) => f.id === "F0");
  if (f0) {
    b.push(sub("Riesgos comunes a toda la obra"), parrafo("Rigen en todos los tajos durante toda la obra. Entre paréntesis, la frecuencia de uso de cada medida y equipo."));
    b.push(...bloquesFicha(f0));
  }
  const { unidades, transversales } = fasesEnOrden(c);
  if (unidades.length + transversales.length > 0) {
    b.push(sub("Fases de obra"));
    for (const f of [...unidades, ...transversales]) b.push(...bloquesFicha(f));
  }
  for (const [g, t] of [
    ["MA", "Medios auxiliares y protecciones colectivas"],
    ["M", "Maquinaria"],
  ] as const) {
    const fs = deGrupo(c, g);
    if (fs.length === 0) continue;
    b.push(sub(t));
    for (const f of fs) b.push(...bloquesFicha(f));
  }
  if (b.length === 1) b.push(pendiente("no hay ninguna ficha de fases, medios o maquinaria marcada."));
  return { numero: 8, titulo: "Riesgos no eliminables: medidas, protecciones y eficacia", bloques: b };
}

// ── 9. Otras actividades en el lugar ─────────────────────────────────────────

function otrasActividades(c: Contexto): ApartadoEstudio {
  const en = c.ss.entorno;
  const b: BloqueMemoria[] = [];
  if (en?.edificioEnUso === true && !c.nueva) {
    b.push(
      parrafo(
        `El edificio o el local sigue en uso durante la obra. La zona de obra se separa físicamente de la zona en uso, con un acceso distinto siempre que sea posible; los horarios de los trabajos ruidosos y los cortes de servicios se pactan con los ocupantes y se avisan con antelación, y ningún hueco ni material queda a su alcance${c.marcadas.has("IP9") ? " (ficha «Obra con el edificio habitado o el local en uso», apartado 6)" : ""}.`,
      ),
    );
  }
  if (en?.viaPublica === true) {
    b.push(parrafo("La obra ocupa la vía pública: el tránsito de peatones y vehículos sigue junto a ella. Se mantiene un paso protegido y señalizado, las maniobras de carga y descarga se dirigen y nada se iza sobre los viandantes."));
  }
  if (c.ss.coordinacion?.variasEmpresas === true) {
    b.push(parrafo("En la obra concurren varias empresas, o empresas y trabajadores autónomos: el coordinador durante la ejecución organiza la coordinación de sus actividades, para que no coincidan tajos incompatibles en la misma zona ni en la misma vertical (RD 171/2004)."));
  }
  if (b.length === 0) {
    const sabido = en?.viaPublica === false && (c.nueva || en?.edificioEnUso === false);
    if (sabido) {
      b.push(
        parrafo(
          `No se prevén otras actividades en el lugar: ${c.nueva ? "es una obra nueva" : "el edificio no está en uso durante la obra"} y no se ocupa la vía pública. Si apareciera alguna, el plan de seguridad y salud la tendrá en cuenta.`,
        ),
      );
    }
  }
  b.push(...pendientesDe(c, ["en-uso", "via-publica"]));
  return { numero: 9, titulo: "Otras actividades en el lugar", bloques: b };
}

// ── 10. Anexo II y recurso preventivo ────────────────────────────────────────

interface CasoAnexoII {
  apartado: ApartadoAnexoII;
  /** Dónde se da: la unidad de obra, con la condición si la hay. */
  donde: string[];
}

const MEDIDA_ANEXO_II: Partial<Record<ApartadoAnexoII, string>> = {
  1: "Protección colectiva en todo borde o hueco con caída de más de 2 m (RD 1627/1997, anexo IV, parte C, apartado 3); taludes o entibación en las excavaciones y apeos antes de demoler o de abrir huecos, según la ficha de cada unidad",
  2: "Plan de trabajo aprobado por la autoridad laboral antes de empezar y empresa inscrita en el RERA (apartado 11)",
  4: "Desvío o corte de la línea; si no es posible, nadie invade la zona de peligro, con barreras, avisos y gálibos y las distancias de la tabla 1 del anexo I del RD 614/2001 (apartado 3)",
  6: "Entibación, ventilación forzada y control de la atmósfera antes de entrar y durante el trabajo, según la ficha",
  10: "Izado y montaje según un procedimiento previo, con la zona de maniobra acotada, las piezas guiadas con cabos y la recepción desde plataforma con barandilla",
};

/** Los apartados del anexo II que se dan en esta obra, con las condiciones que los datos no deciden. */
function casosAnexoII(c: Contexto): CasoAnexoII[] {
  const porApartado = new Map<ApartadoAnexoII, string[]>();
  const anota = (ap: ApartadoAnexoII, donde: string) => {
    const l = porApartado.get(ap) ?? [];
    if (!l.includes(donde)) l.push(donde);
    porApartado.set(ap, l);
  };
  for (const f of c.fichas) {
    if (f.grupo === "TP") continue;
    for (const x of f.anexoII ?? []) {
      let cuando = x.cuando;
      if (x.apartado === 4) {
        const at = altaTension(c);
        if (at === false) continue;
        if (at === true) cuando = undefined;
      }
      if (x.apartado === 2) {
        if (c.ss.amianto?.estado === "no_identificado") continue;
        if (hayAmianto(c)) cuando = undefined;
      }
      anota(x.apartado, cuando ? `${f.titulo} (${cuando})` : f.titulo);
    }
  }
  if (hayAmianto(c)) anota(2, "Materiales con amianto (apartado 11)");
  if (altaTension(c) === true) anota(4, `Línea eléctrica aérea de ${decimal(c.ss.entorno!.tensionLineas_kV!)} kV próxima a la obra`);
  return [...porApartado.entries()].sort(([a], [b]) => a - b).map(([apartado, donde]) => ({ apartado, donde }));
}

function anexoII(casos: CasoAnexoII[]): ApartadoEstudio {
  const b: BloqueMemoria[] = [];
  if (casos.length > 0) {
    b.push(
      parrafo("Los trabajos de esta obra que figuran en el anexo II del RD 1627/1997, y su medida específica (art. 6.2):"),
      {
        tipo: "tabla",
        cabecera: ["Apartado del anexo II", "Dónde se da", "Medida específica"],
        filas: casos.map((x) => [
          `${x.apartado}. ${ANEXO_II.datos[x.apartado]}`,
          frase(x.donde.join("; ")),
          frase(MEDIDA_ANEXO_II[x.apartado] ?? "Las medidas de la ficha de la unidad"),
        ]),
        columnas: [TEXTO, TEXTO, TEXTO],
      },
      parrafo(
        "En estos trabajos es preceptiva la presencia de un recurso preventivo (Guía técnica del INSST); el plan de seguridad y salud fija la forma de esa presencia (RD 1627/1997, disposición adicional única).",
      ),
    );
  } else {
    b.push(
      parrafo(
        "No se prevén trabajos del anexo II del RD 1627/1997: ninguna de las unidades de esta obra implica los riesgos especiales que relaciona. Si durante la obra se diera alguno, el plan de seguridad y salud recogerá sus medidas específicas y la presencia del recurso preventivo.",
      ),
    );
  }
  return { numero: 10, titulo: "Trabajos con riesgos especiales (anexo II) y recurso preventivo", bloques: b };
}

// ── 11. Amianto ──────────────────────────────────────────────────────────────

function amianto(c: Contexto): ApartadoEstudio {
  const am = c.ss.amianto;
  const b: BloqueMemoria[] = [];
  if (!am) {
    if (amiantoObligatorio(c.p)) {
      b.push(parrafo(AMIANTO_BASE), ...pendientesDe(c, ["amianto"]));
    } else {
      b.push(parrafo(`Es una obra nueva en la que no se derriba ni se interviene ninguna construcción existente: no procede la identificación de materiales con amianto (${AMIANTO_NORMA}, art. 10.2).`));
    }
    return { numero: 11, titulo: "Identificación de materiales con amianto", bloques: b };
  }
  b.push(parrafo(AMIANTO_BASE));
  const tipo = am.friable === undefined ? "" : am.friable ? ", de tipo friable" : ", de tipo no friable";
  b.push(parrafo(`${NOMBRE_ESTADO_AMIANTO[am.estado]}${am.ubicacion?.trim() ? `: ${am.ubicacion.trim()}` : ""}${am.estado !== "no_identificado" ? tipo : ""}.`));
  if (am.estado === "no_identificado") {
    b.push(parrafo("Si durante la obra apareciera algún material sospechoso de contener amianto, se paran los trabajos en esa zona y no se reanudan hasta identificarlo y, si lo contiene, actuar como dice el real decreto."));
  } else {
    if (am.estado === "posible") b.push(parrafo("Mientras no se descarte con la identificación del material, se trata como si contuviera amianto."));
    for (const m of AMIANTO_MEDIDAS) b.push(vineta(m));
    b.push({ tipo: "nota", texto: `Artículos del ${AMIANTO_NORMA}.` });
  }
  return { numero: 11, titulo: "Identificación de materiales con amianto", bloques: b };
}

// ── 12. Trabajos posteriores ─────────────────────────────────────────────────

function posteriores(c: Contexto): ApartadoEstudio {
  const sub = numerador(12);
  const tp = deGrupo(c, "TP");
  const b: BloqueMemoria[] = [parrafo(POSTERIORES_INTRO)];
  if (tp.length === 0) {
    b.push(pendiente("no hay ninguna ficha de trabajos posteriores marcada (art. 6.3)."));
    return { numero: 12, titulo: "Trabajos posteriores: previsiones e informaciones útiles", bloques: b };
  }
  for (const f of tp) {
    b.push(sub(f.titulo));
    const prev = f.previsiones ?? [];
    const info = f.informaciones ?? [];
    const n = Math.max(1, prev.length, info.length);
    b.push({
      tipo: "tabla",
      rotulo: "Previsiones e informaciones útiles",
      cabecera: ["Previsiones", "Informaciones útiles"],
      filas: Array.from({ length: n }, (_, i) => [prev[i] ?? (i === 0 ? "—" : ""), info[i] ?? (i === 0 ? "—" : "")]),
      columnas: [TEXTO, TEXTO],
    });
    b.push(tablaFicha(f, "Riesgos y medidas"), parrafo(`Eficacia: ${frase(f.eficacia)}`));
  }
  b.push(parrafo(POSTERIORES_DESTINO));
  return { numero: 12, titulo: "Trabajos posteriores: previsiones e informaciones útiles", bloques: b };
}

// ── 13. Obligaciones y 14. Firma ─────────────────────────────────────────────

function obligaciones(c: Contexto): ApartadoEstudio {
  const b = OBLIGACIONES_EBSS.map(parrafo);
  if (preguntaCabezaFamilia(c.p) && c.ss.coordinacion?.cabezaFamilia === true) b.push(parrafo(CABEZA_FAMILIA));
  return { numero: 13, titulo: "Obligaciones durante la obra", bloques: b };
}

function firma(c: Contexto): ApartadoEstudio {
  const lugar = c.p.datosGenerales.municipio || "—";
  const fecha = fechaLarga(c.fecha);
  const b: BloqueMemoria[] = [parrafo(fecha ? `En ${lugar}, a ${fecha}.` : `En ${lugar}, en la fecha de la firma.`)];
  if (c.firmantes.length === 0) b.push(pendiente(SIN_FIRMANTES));
  for (const f of c.firmantes) {
    b.push(parrafo(nombreFirmante(f)));
    if (f.colegiacion) b.push({ tipo: "nota", texto: f.colegiacion });
  }
  const promotor = c.p.datosGenerales.documento?.promotor?.trim();
  b.push(parrafo(`Conforme con el compromiso del apartado 1, el promotor${promotor ? `: ${promotor}` : "."}`));
  return { numero: 14, titulo: "Firma", bloques: b };
}

// ── El documento ─────────────────────────────────────────────────────────────

/**
 * El estudio básico del expediente, apartado a apartado. Con `completo` en el
 * art. 4, solo la justificación: el estudio básico no se redacta.
 */
function contextoDe(p: Proyecto, op: OpcionesEstudioBasico): Contexto {
  const ss = p.seguridadSalud ?? {};
  const editadas = fichasDelEstudio(p);
  const titulos = new Map(editadas.map((f) => [f.id, f.titulo]));
  const fichas = editadas.map((f) => fichaConTitulos(f, titulos));
  return {
    p,
    ss,
    a4: art4(ss),
    resumen: resumenEdificio(p.edificio),
    nueva: p.datosGenerales.intervencion === "obra_nueva",
    fichas,
    marcadas: new Set(fichas.map((f) => f.id)),
    faltan: new Map(pendientesSeguridadSalud(p).map((d) => [d.id, d.texto])),
    firmantes: op.firmantes ?? [],
    ...(op.fecha ? { fecha: op.fecha } : {}),
  };
}

/** Con `completo`, lo único pendiente: el estudio básico no vale. */
function pendienteCompleto(a4: Art4): PendienteDato {
  return {
    id: "completo",
    texto: `Se da el supuesto ${listaY(a4.superados.map((l) => `${l})`))} del art. 4.1 del RD 1627/1997: hace falta el estudio de seguridad y salud, que la app no redacta.`,
  };
}

function pendientesDeContexto(c: Contexto): PendienteDato[] {
  if (c.a4.resultado === "completo") return [pendienteCompleto(c.a4)];
  const out: PendienteDato[] = [...pendientesSeguridadSalud(c.p)];
  for (const f of fichasSinRevisar(c.p)) out.push({ id: `ficha:${f.id}`, texto: `La ficha «${f.titulo}», redactada por la app, está sin revisar.` });
  if (!c.p.datosGenerales.documento?.promotor?.trim()) out.push({ id: "promotor", texto: "Falta el promotor (datos del documento)." });
  if (c.firmantes.length === 0) out.push({ id: "firmantes", texto: "Falta quién firma (los datos del estudio)." });
  if (fasesEnOrden(c).unidades.length === 0) out.push({ id: "unidades", texto: "No hay ninguna unidad de obra marcada en la selección de fichas." });
  if (deGrupo(c, "TP").length === 0) out.push({ id: "posteriores", texto: "No hay ninguna ficha de trabajos posteriores marcada (art. 6.3)." });
  return out;
}

/**
 * Lo que falta para entregar el estudio, con su id (para «Antes de entregar»,
 * paso 6), en el orden del documento. Es la lista `pendientes` de
 * `estudioBasico`, sin componer el documento.
 */
export function pendientesEstudioBasico(p: Proyecto, op: OpcionesEstudioBasico = {}): PendienteDato[] {
  return pendientesDeContexto(contextoDe(p, op));
}

/**
 * El estudio básico del expediente, apartado a apartado. Con `completo` en el
 * art. 4, solo la justificación: el estudio básico no se redacta.
 */
export function estudioBasico(p: Proyecto, op: OpcionesEstudioBasico = {}): EstudioBasico {
  const c = contextoDe(p, op);
  const a4 = c.a4;
  const base = { titulo: TITULO_ESTUDIO_BASICO, proyecto: p.nombre, art4: a4 };
  const pendientes = pendientesDeContexto(c).map((d) => d.texto);
  if (a4.resultado === "completo") return { ...base, apartados: [justificacion(c)], pendientes };
  const casos = casosAnexoII(c);
  const apartados: ApartadoEstudio[] = [
    datosGenerales(c, casos),
    justificacion(c),
    { numero: 2, titulo: "Objeto", bloques: OBJETO_EBSS.map(parrafo) },
    entorno(c),
    descripcion(c),
    normas(c),
    implantacion(c),
    evitables(c),
    noEliminables(c),
    otrasActividades(c),
    anexoII(casos),
    amianto(c),
    posteriores(c),
    obligaciones(c),
    firma(c),
  ];
  return { ...base, apartados, pendientes };
}

/** El documento como bloques: el título (H1), los apartados (H2) y sus subapartados (H3). */
export function bloquesEstudioBasico(e: EstudioBasico): BloqueMemoria[] {
  const b: BloqueMemoria[] = [{ tipo: "titulo", nivel: 1, texto: e.titulo }];
  for (const a of e.apartados) {
    b.push({ tipo: "titulo", nivel: 2, texto: a.numero === 0 ? a.titulo : `${a.numero}. ${a.titulo}` });
    b.push(...a.bloques);
  }
  return b;
}

/** El documento entero en texto plano (para la foto del expediente y el test de prohibidos). */
export function textoPlanoEstudioBasico(e: EstudioBasico): string {
  return bloquesEstudioBasico(e)
    .map((bl) => (bl.tipo === "tabla" ? textoTabla(bl) : bl.texto))
    .join("\n\n");
}

/** «estudio-basico-ss-<proyecto>.docx». */
export function nombreArchivoEstudioBasico(proyecto: string, ext: "pdf" | "docx"): string {
  return nombreArchivo("estudio-basico-ss", proyecto, ext);
}
