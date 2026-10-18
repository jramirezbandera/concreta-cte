// =============================================================================
// Qué fichas del catálogo propone la app y cuáles salen en el estudio
// (feature-35, paso 4). PURO.
//
// `fichasPropuestas(p)` lee lo que la obra ya sabe (intervención, alcance de la
// obra en edificio existente, El edificio, qué justificaciones aplican y los
// datos del estudio) y propone, con su motivo, las fichas de lo que esta obra
// tiene (K-SYS.12: nada de listados genéricos). La correspondencia es la del
// análisis (research/analisis-ejemplos-ebss.md §3, «Cómo se eligen las
// fichas»), INTERPRETACIÓN: la app propone y el proyectista marca o quita.
//
// La selección se guarda como diferencia con la propuesta (`SeleccionFichas`):
// un cambio en la obra se refleja sin perder lo que el proyectista decidió. Lo
// que edita dentro de una ficha se guarda por ficha: los riesgos por clave, las
// medidas, protecciones y EPI por texto (decisión 5 del paso 1).
// =============================================================================

import type { Alcance, JustificacionKey, Proyecto, TipoObraExistente } from "../proyecto/tipos";
import type { ResumenEdificio } from "../edificio/derivar";
import { resumenEdificio } from "../edificio/derivar";
import { aplicabilidadEfectiva } from "../proyecto/aplicabilidad";
import { tiposDeObra } from "../proyecto/alcance";
import { FICHAS_EBSS, textoItem } from "./catalogo";
import type { EdicionFicha, EdicionLista, EstudioSeguridadSalud, FichaCatalogo, ItemFicha, SeleccionFichas } from "./tipos";

/** Lo que lee la propuesta: no hace falta el proyecto entero. */
export type ProyectoPropuesta = Pick<Proyecto, "datosGenerales" | "edificio" | "justificaciones" | "seguridadSalud">;

/** Una ficha que propone la app, con los motivos («aplica HS 4», «cubierta inclinada»). */
export interface FichaPropuesta {
  id: string;
  motivos: string[];
}

// ── Lo que la obra sabe ──────────────────────────────────────────────────────

interface ContextoPropuesta {
  nueva: boolean;
  resumen: ResumenEdificio;
  alcance: Alcance;
  tipos: TipoObraExistente[];
  ss: EstudioSeguridadSalud;
  /** El edificio tiene ascensor (dato de El edificio; sin él, no se propone su montaje). */
  ascensor: boolean;
  /** La justificación se aplica a la obra (aplicabilidad efectiva distinta de «no aplica»). */
  aplica: (key: JustificacionKey) => boolean;
}

function contexto(p: ProyectoPropuesta): ContextoPropuesta {
  const dg = p.datosGenerales;
  const cache = new Map<JustificacionKey, boolean>();
  return {
    nueva: dg.intervencion === "obra_nueva",
    resumen: resumenEdificio(p.edificio),
    alcance: dg.intervencion === "obra_nueva" ? {} : (dg.alcance ?? {}),
    tipos: tiposDeObra(dg),
    ss: p.seguridadSalud ?? {},
    ascensor: p.edificio.ascensor === true,
    aplica: (key) => {
      let v = cache.get(key);
      if (v === undefined) {
        v = aplicabilidadEfectiva(p, key).aplicabilidad !== "no_aplica";
        cache.set(key, v);
      }
      return v;
    },
  };
}

const enEnvolvente = (c: ContextoPropuesta, e: NonNullable<Alcance["envolvente"]>[number]): boolean =>
  c.alcance.envolvente?.includes(e) === true;
const enInterior = (c: ContextoPropuesta, e: NonNullable<Alcance["interior"]>[number]): boolean =>
  c.alcance.interior?.includes(e) === true;

/** Se trabaja en la fachada: obra nueva, o se intervienen fachadas o medianerías. */
const trabajaFachada = (c: ContextoPropuesta): boolean =>
  c.nueva || enEnvolvente(c, "fachadas") || enEnvolvente(c, "medianerias");
/** Se hace o se interviene la cubierta. */
const trabajaCubierta = (c: ContextoPropuesta): boolean => c.nueva || enEnvolvente(c, "cubiertas");
const cubiertaPlana = (c: ContextoPropuesta): boolean => c.resumen.tipoCubierta !== "inclinada";

/** Equipos de ACS, climatización o generación eléctrica que acaban en cubierta. */
const equiposCubierta = (c: ContextoPropuesta): boolean => c.aplica("he4") || c.aplica("he5");

/**
 * Hay revestimientos que picar o fábricas que demoler: la estructura, una
 * reforma integral o algo de la envolvente o del interior que no sean solo
 * huecos, vidrios, alumbrado o protección contra incendios. Sin el alcance
 * contestado, sí: lo prudente es proponerlo.
 */
const PICADO_ENVOLVENTE: readonly NonNullable<Alcance["envolvente"]>[number][] = ["fachadas", "medianerias", "cubiertas", "terreno", "particiones"];
const PICADO_INTERIOR: readonly NonNullable<Alcance["interior"]>[number][] = [
  "distribucion", "evacuacion", "compartimentacion", "revestimientos", "suelos_escaleras", "aseos", "accesibilidad",
];
const hayPicado = (c: ContextoPropuesta): boolean => {
  const a = c.alcance;
  if (a.estructura === undefined && a.envolvente === undefined && a.interior === undefined) return true;
  return (
    a.estructura === true ||
    a.integral === true ||
    PICADO_ENVOLVENTE.some((e) => enEnvolvente(c, e)) ||
    PICADO_INTERIOR.some((e) => enInterior(c, e))
  );
};

const INSTALACIONES_FICHA = ["F22", "F23", "F24", "F25", "F26", "F27"];

// ── La tabla de correspondencias ─────────────────────────────────────────────

/**
 * Una regla: si se da, propone sus fichas con su motivo. `cuando` recibe las
 * fichas que ya han propuesto las reglas anteriores, para las que dependen de
 * otras (el almacén de inflamables, el mantenimiento de las instalaciones).
 */
interface ReglaPropuesta {
  motivo: string | ((c: ContextoPropuesta) => string);
  cuando: (c: ContextoPropuesta, ya: ReadonlySet<string>) => boolean;
  fichas: readonly string[] | ((c: ContextoPropuesta) => readonly string[]);
}

/** Por justificación: «aplica HS 4». */
const NOMBRE_JUST: Partial<Record<JustificacionKey, string>> = {
  hs4: "HS 4",
  hs5: "HS 5",
  he4: "HE 4",
  he5: "HE 5",
  he6: "HE 6",
  rebt: "el REBT",
};

const porJustificacion = (key: JustificacionKey, fichas: readonly string[]): ReglaPropuesta => ({
  motivo: `aplica ${NOMBRE_JUST[key] ?? key.toUpperCase()}`,
  cuando: (c) => c.aplica(key),
  fichas,
});

const nombreCubierta = (c: ContextoPropuesta): string =>
  c.resumen.tipoCubierta === "inclinada"
    ? "cubierta inclinada"
    : c.resumen.cubiertaTransitable
      ? "cubierta plana transitable"
      : "cubierta plana no transitable";

/**
 * La correspondencia del análisis (§3), ordenada de lo general a lo particular.
 * INTERPRETACIÓN: lo que no está en el análisis va en las decisiones del paso 4.
 */
export const REGLAS_PROPUESTA: readonly ReglaPropuesta[] = [
  // Lo que tiene toda obra: el bloque común, la implantación y los medios menores.
  {
    motivo: "común a toda obra",
    cuando: () => true,
    fichas: ["F0", "IP1", "IP3", "IP4", "IP5", "IP6", "IP7", "MA2", "MA5", "M13", "M22"],
  },
  {
    motivo: "obra nueva",
    cuando: (c) => c.nueva,
    fichas: [
      "F4", "F5", "F8", "F10", "F11", "F14", "F15", "F18", "F19", "F20", "F21",
      "F28", "F29", "F30", "F31", "F32", "F34", "F35", "F36",
      "MA7",
      "M1", "M2", "M3", "M4", "M6", "M10", "M11", "M12", "M16",
    ],
  },
  {
    motivo: "derribo de una construcción existente",
    cuando: (c) => c.nueva && c.ss.demolicionPrevia === true,
    fichas: ["F2", "MA10", "M1", "M2"],
  },
  // Obra en edificio existente: demoliciones y lo intervenido según el alcance.
  {
    motivo: "obra en edificio existente",
    cuando: (c) => !c.nueva,
    fichas: ["F1", "MA6", "MA10", "M2", "M12"],
  },
  {
    motivo: "se pican revestimientos o se demuelen fábricas",
    cuando: (c) => !c.nueva && hayPicado(c),
    fichas: ["F3", "M14"],
  },
  {
    motivo: "ampliación",
    cuando: (c) => c.tipos.includes("ampliacion"),
    fichas: ["F4", "F5", "F8", "F10", "F11", "F14", "F34", "MA7", "M1", "M3", "M4", "M10", "M16"],
  },
  {
    motivo: "se actúa en la estructura",
    cuando: (c) => !c.nueva && c.alcance.estructura === true,
    fichas: ["F40", "MA6", "MA7"],
  },
  {
    motivo: "se modifican los huecos de fachada",
    cuando: (c) => enEnvolvente(c, "huecos"),
    fichas: ["F19", "F20"],
  },
  {
    motivo: "se intervienen las fachadas",
    cuando: (c) => enEnvolvente(c, "fachadas"),
    fichas: ["F14", "F28", "F35"],
  },
  {
    motivo: "se intervienen las medianerías",
    cuando: (c) => enEnvolvente(c, "medianerias"),
    fichas: ["F14", "F28"],
  },
  // El andamio de fachada desde la planta primera; con una sola planta, la torre móvil.
  {
    motivo: (c) =>
      c.resumen.plantasSobreRasante >= 2
        ? `trabajos en fachada con ${c.resumen.plantasSobreRasante} plantas sobre rasante`
        : "trabajos en fachada con una sola planta sobre rasante",
    cuando: trabajaFachada,
    fichas: (c) => (c.resumen.plantasSobreRasante >= 2 ? ["MA1"] : ["MA3"]),
  },
  {
    motivo: (c) => (c.nueva ? nombreCubierta(c) : `se interviene la ${nombreCubierta(c)}`),
    cuando: trabajaCubierta,
    fichas: (c) => (cubiertaPlana(c) ? ["F16", "F18", "MA7", "TP1"] : ["F17", "MA7", "MA9", "TP1"]),
  },
  {
    motivo: "se intervienen los elementos en contacto con el terreno",
    cuando: (c) => enEnvolvente(c, "terreno"),
    fichas: ["F18", "F34", "M10"],
  },
  {
    motivo: "se modifican las particiones",
    cuando: (c) => enEnvolvente(c, "particiones"),
    fichas: ["F15", "F29"],
  },
  {
    motivo: "se modifica la distribución",
    cuando: (c) => enInterior(c, "distribucion"),
    fichas: ["F15", "F29", "F30", "F35"],
  },
  {
    motivo: "se renuevan los revestimientos",
    cuando: (c) => enInterior(c, "revestimientos"),
    fichas: ["F28", "F29", "F31", "F32", "F35", "M10"],
  },
  {
    motivo: "se modifican suelos o escaleras",
    cuando: (c) => enInterior(c, "suelos_escaleras"),
    fichas: ["F32"],
  },
  {
    motivo: "se cambian vidrios o puertas",
    cuando: (c) => enInterior(c, "vidrios_puertas"),
    fichas: ["F19", "F20"],
  },
  {
    motivo: "se reforman los aseos",
    cuando: (c) => enInterior(c, "aseos"),
    fichas: ["F31", "F32"],
  },
  {
    motivo: "reforma integral",
    cuando: (c) => !c.nueva && c.alcance.integral === true,
    fichas: ["F15", "F19", "F20", "F28", "F29", "F30", "F31", "F32", "F35", "MA7"],
  },
  // Las instalaciones, por las justificaciones que aplican.
  porJustificacion("hs4", ["F23"]),
  porJustificacion("hs5", ["F24"]),
  porJustificacion("he4", ["F25", "F36", "M6"]),
  porJustificacion("he5", ["F25", "F36"]),
  {
    motivo: "se renueva la generación térmica",
    cuando: (c) => !c.nueva && (c.alcance.generacionTermica === "general" || c.alcance.generacionTermica === "parcial"),
    fichas: ["F25"],
  },
  porJustificacion("rebt", ["F22"]),
  porJustificacion("he6", ["F22"]),
  {
    motivo: "edificio plurifamiliar: infraestructura común de telecomunicaciones",
    cuando: (c) => c.nueva && c.resumen.tipo === "plurifamiliar",
    fichas: ["F26"],
  },
  {
    motivo: "edificio con ascensor",
    cuando: (c) => c.nueva && c.ascensor,
    fichas: ["F27"],
  },
  {
    motivo: "se interviene la accesibilidad en un edificio con ascensor",
    cuando: (c) => !c.nueva && c.ascensor && enInterior(c, "accesibilidad"),
    fichas: ["F27", "MA7"],
  },
  // Medios que declara el estudio.
  { motivo: "hay grúa torre", cuando: (c) => c.ss.medios?.gruaTorre === true, fichas: ["M7", "F36"] },
  { motivo: "hay grúa móvil", cuando: (c) => c.ss.medios?.gruaMovil === true, fichas: ["M6", "F36"] },
  // El entorno.
  {
    motivo: "edificio o local en uso durante la obra",
    cuando: (c) => c.ss.entorno?.edificioEnUso === true,
    fichas: ["IP9"],
  },
  { motivo: "se ocupa la vía pública", cuando: (c) => c.ss.entorno?.viaPublica === true, fichas: ["IP2"] },
  {
    motivo: "trabajos en la fachada sobre la vía pública",
    cuando: (c) => !c.nueva && c.ss.entorno?.viaPublica === true && trabajaFachada(c),
    fichas: ["F41"],
  },
  {
    motivo: "equipos en cubierta, izados desde la vía pública",
    cuando: (c) => !c.nueva && c.ss.entorno?.viaPublica === true && equiposCubierta(c),
    fichas: ["F42"],
  },
  // Las que dependen de otras fichas.
  {
    motivo: "pinturas, impermeabilizaciones o productos inflamables en obra",
    cuando: (_c, ya) => ya.has("F35") || ya.has("F18"),
    fichas: ["IP8"],
  },
  {
    motivo: "trabajos en la fachada o en sus huecos",
    cuando: (c) => trabajaFachada(c) || enEnvolvente(c, "huecos"),
    fichas: ["TP2"],
  },
  {
    motivo: "se ejecutan instalaciones",
    cuando: (_c, ya) => INSTALACIONES_FICHA.some((id) => ya.has(id)),
    fichas: ["TP3"],
  },
];

/** Orden del catálogo, para que la propuesta salga como el estudio. */
const ORDEN = new Map(FICHAS_EBSS.map((f, i) => [f.id, i]));

/**
 * Las fichas que propone la app para esta obra, con sus motivos, en el orden
 * del catálogo. Un motivo aparece una vez por ficha aunque lo den dos reglas.
 */
export function fichasPropuestas(p: ProyectoPropuesta): FichaPropuesta[] {
  const c = contexto(p);
  const motivos = new Map<string, string[]>();
  for (const r of REGLAS_PROPUESTA) {
    if (!r.cuando(c, new Set(motivos.keys()))) continue;
    const motivo = typeof r.motivo === "function" ? r.motivo(c) : r.motivo;
    const fichas = typeof r.fichas === "function" ? r.fichas(c) : r.fichas;
    for (const id of fichas) {
      const m = motivos.get(id) ?? [];
      if (!m.includes(motivo)) m.push(motivo);
      motivos.set(id, m);
    }
  }
  return [...motivos.entries()]
    .filter(([id]) => ORDEN.has(id))
    .sort(([a], [b]) => (ORDEN.get(a) ?? 0) - (ORDEN.get(b) ?? 0))
    .map(([id, m]) => ({ id, motivos: m }));
}

// ── La selección: diferencia con la propuesta ────────────────────────────────

/** Una ficha del catálogo tal como la ve la pantalla: si la propone la app y si sale en el estudio. */
export interface FichaEnSeleccion {
  ficha: FichaCatalogo;
  propuesta: boolean;
  /** Los motivos de la propuesta; vacío si no la propone la app. */
  motivos: string[];
  /** Sale en el estudio: propuesta y no quitada, o añadida por el proyectista. */
  marcada: boolean;
}

/**
 * ¿Sale la ficha en el estudio? Una añadida sale siempre; una propuesta, salvo
 * que el proyectista la haya quitado. Lo quitado sigue quitado aunque cambie la
 * obra, y lo que la app pasa a proponer aparece solo.
 */
export function estaMarcada(id: string, propuesta: boolean, sel: SeleccionFichas | undefined): boolean {
  if (sel?.anadidas?.includes(id)) return true;
  return propuesta && !(sel?.quitadas?.includes(id) ?? false);
}

/** Todo el catálogo, en su orden, con la propuesta y la selección de esta obra. */
export function seleccionDeFichas(p: ProyectoPropuesta): FichaEnSeleccion[] {
  const propuestas = new Map(fichasPropuestas(p).map((f) => [f.id, f.motivos]));
  const sel = p.seguridadSalud?.seleccion;
  return FICHAS_EBSS.map((ficha) => {
    const motivos = propuestas.get(ficha.id);
    return {
      ficha,
      propuesta: motivos !== undefined,
      motivos: motivos ?? [],
      marcada: estaMarcada(ficha.id, motivos !== undefined, sel),
    };
  });
}

const sin = (xs: readonly string[] | undefined, id: string): string[] => (xs ?? []).filter((x) => x !== id);
const con = (xs: readonly string[] | undefined, id: string): string[] => [...sin(xs, id), id];

/** La selección sin listas vacías (como la deja `parseSeguridadSalud`). */
function limpia(s: SeleccionFichas): SeleccionFichas {
  const out: SeleccionFichas = {};
  if (s.anadidas && s.anadidas.length > 0) out.anadidas = s.anadidas;
  if (s.quitadas && s.quitadas.length > 0) out.quitadas = s.quitadas;
  if (s.ediciones && Object.keys(s.ediciones).length > 0) out.ediciones = s.ediciones;
  return out;
}

/**
 * Marca o quita una ficha. Marcar: deja de estar quitada y, si la app no la
 * propone, pasa a añadida. Quitar: deja de estar añadida y, si la app la
 * propone, pasa a quitada. Las ediciones de la ficha se conservan.
 */
export function marcarFicha(
  sel: SeleccionFichas | undefined,
  id: string,
  marcada: boolean,
  propuesta: boolean,
): SeleccionFichas {
  const s = sel ?? {};
  if (marcada) {
    return limpia({
      ...s,
      quitadas: sin(s.quitadas, id),
      anadidas: propuesta ? sin(s.anadidas, id) : con(s.anadidas, id),
    });
  }
  return limpia({
    ...s,
    anadidas: sin(s.anadidas, id),
    quitadas: propuesta ? con(s.quitadas, id) : sin(s.quitadas, id),
  });
}

/** Guarda la edición de una ficha; una edición vacía la borra. */
export function conEdicion(sel: SeleccionFichas | undefined, id: string, ed: EdicionFicha | undefined): SeleccionFichas {
  const ediciones = { ...(sel?.ediciones ?? {}) };
  if (ed && edicionNoVacia(ed)) ediciones[id] = ed;
  else delete ediciones[id];
  return limpia({ ...(sel ?? {}), ediciones });
}

const listaNoVacia = (l: EdicionLista | undefined): boolean =>
  (l?.quitados?.length ?? 0) > 0 || (l?.anadidos?.length ?? 0) > 0;

function edicionNoVacia(ed: EdicionFicha): boolean {
  return (
    (ed.riesgos?.quitados?.length ?? 0) > 0 ||
    (ed.riesgos?.anadidos?.length ?? 0) > 0 ||
    listaNoVacia(ed.medidas) ||
    listaNoVacia(ed.protecciones) ||
    listaNoVacia(ed.epi) ||
    ed.revisada === true
  );
}

// ── Las fichas del estudio, con lo que edita el proyectista ──────────────────

/** Una lista de la ficha sin los textos quitados y con los añadidos al final. */
function editarLista(items: readonly ItemFicha[], ed: EdicionLista | undefined): ItemFicha[] {
  if (!ed) return [...items];
  const quitados = new Set(ed.quitados ?? []);
  const anadidos = (ed.anadidos ?? []).filter((t) => !items.some((i) => textoItem(i) === t));
  return [...items.filter((i) => !quitados.has(textoItem(i))), ...anadidos];
}

/**
 * La ficha con lo que edita el proyectista. Los riesgos se quitan por clave
 * (también de los que evita una protección colectiva) y los añadidos van al
 * final; las medidas, protecciones y EPI se quitan por texto: si el catálogo
 * cambia el texto, la medida vuelve a salir.
 */
export function fichaEditada(f: FichaCatalogo, ed: EdicionFicha | undefined): FichaCatalogo {
  if (!ed) return f;
  const quitados = new Set(ed.riesgos?.quitados ?? []);
  const riesgos = f.riesgos.filter((r) => !quitados.has(r.clave));
  const anadidos = (ed.riesgos?.anadidos ?? []).filter((r) => !riesgos.some((x) => x.clave === r.clave));
  const out: FichaCatalogo = {
    ...f,
    riesgos: [...riesgos, ...anadidos],
    medidas: editarLista(f.medidas, ed.medidas),
    protecciones: editarLista(f.protecciones, ed.protecciones),
    epi: editarLista(f.epi, ed.epi),
  };
  if (f.evita) out.evita = f.evita.filter((r) => !quitados.has(r.clave));
  return out;
}

/** Las fichas que salen en el estudio, en el orden del catálogo y ya editadas. */
export function fichasDelEstudio(p: ProyectoPropuesta): FichaCatalogo[] {
  const ediciones = p.seguridadSalud?.seleccion?.ediciones ?? {};
  return seleccionDeFichas(p)
    .filter((f) => f.marcada)
    .map((f) => fichaEditada(f.ficha, ediciones[f.ficha.id]));
}

/**
 * Las fichas «redactadas por la app» que salen en el estudio sin que el
 * proyectista las haya revisado (van a «Antes de entregar», en ámbar).
 */
export function fichasSinRevisar(p: ProyectoPropuesta): FichaCatalogo[] {
  const ediciones = p.seguridadSalud?.seleccion?.ediciones ?? {};
  return seleccionDeFichas(p)
    .filter((f) => f.marcada && f.ficha.redactadaPorApp === true && ediciones[f.ficha.id]?.revisada !== true)
    .map((f) => f.ficha);
}

