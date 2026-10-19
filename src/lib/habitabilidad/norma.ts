// =============================================================================
// La norma de habitabilidad (feature-32, PLAN-MEMORIA §5.5). PURA.
//
// La fracción de hueco no es universal: la fija el planeamiento municipal y, en
// la vivienda protegida, la comunidad autónoma (K-MEM.9 y K-MEM.10). La app no
// la supone: el proyectista declara la norma de la obra, con su referencia, y
// cada fila de la memoria la cita. Las plantillas son solo las cotejadas en su
// boletín; lo que el proyectista define se guarda en «Mis normas», en el
// navegador, para las demás obras del mismo municipio.
// =============================================================================

import { provinciasDe } from "../../data/comunidades";

/** Las estancias de una vivienda, por lo que importa a las normas de habitabilidad. */
export type TipoEstancia =
  | "estar"
  | "comedor"
  | "estar_comedor"
  | "cocina"
  | "estar_cocina"
  | "dormitorio"
  | "bano"
  | "aseo"
  | "pasillo"
  | "otro";

export const TIPOS_ESTANCIA: readonly TipoEstancia[] = [
  "estar_comedor",
  "estar",
  "comedor",
  "cocina",
  "estar_cocina",
  "dormitorio",
  "bano",
  "aseo",
  "pasillo",
  "otro",
];

export const NOMBRE_TIPO_ESTANCIA: Record<TipoEstancia, string> = {
  estar: "Estar",
  comedor: "Comedor",
  estar_comedor: "Estar-comedor",
  cocina: "Cocina",
  estar_cocina: "Estar-comedor-cocina",
  dormitorio: "Dormitorio",
  bano: "Baño",
  aseo: "Aseo",
  pasillo: "Pasillo o distribuidor",
  otro: "Otra",
};

/** Las vivideras: lo que computa si la norma no dice otra cosa (§5.5, punto 2). */
export const COMPUTAN_HABITUAL: readonly TipoEstancia[] = ["estar", "comedor", "estar_comedor", "cocina", "estar_cocina", "dormitorio"];

/** Lo que se mide para la iluminación. */
export type MedidaIluminacion = "hueco" | "acristalada";
/** Lo que se mide para la ventilación. */
export type MedidaVentilacion = "practicable" | "hueco";

export const NOMBRE_MEDIDA: Record<MedidaIluminacion | MedidaVentilacion, string> = {
  hueco: "hueco de fachada",
  acristalada: "superficie acristalada",
  practicable: "superficie practicable",
};

/** Cómo se redondea el número máximo de viviendas. */
export type RedondeoDensidad = "por_defecto" | "al_mas_proximo";

export interface DensidadNorma {
  /** m² de superficie residencial por vivienda: el divisor. */
  m2PorVivienda: number;
  /** Qué superficie se divide. */
  superficie: "construida" | "util";
  /** Por defecto, el cociente entero; al más próximo, +1 si la parte decimal es ≥ 0,5. */
  redondeo: RedondeoDensidad;
  /** Su artículo, si no es el de la norma: «art. 12.2.34». */
  referencia?: string;
}

/** Quién la dicta: el municipio, la comunidad autónoma o el Estado (la Orden de 1944, supletoria). */
export type AmbitoNorma = "municipal" | "autonomica" | "estatal";

export const NOMBRE_AMBITO: Record<AmbitoNorma, string> = {
  municipal: "Norma municipal",
  autonomica: "Norma autonómica",
  estatal: "Norma estatal",
};

export interface NormaHabitabilidad {
  id: string;
  /** Como se cita: «PGOU de Málaga, art. …». Obligatoria. */
  referencia: string;
  ambito: AmbitoNorma;
  /** Municipio al que se liga (INE): se sugiere en sus obras y avisa en las de otro. */
  municipioIne?: string;
  municipio?: string;
  iluminacion: { fraccion: number; mide: MedidaIluminacion };
  /** «conjunta»: el mismo hueco ilumina y ventila, con la fracción de la iluminación. */
  ventilacion: { fraccion: number; mide: MedidaVentilacion } | "conjunta";
  computan: TipoEstancia[];
  /** Superficie útil mínima por tipo de estancia [m²], si la norma la fija. */
  superficieMinima?: Partial<Record<TipoEstancia, number>>;
  densidad?: DensidadNorma;
  /** Si viene de una plantilla de la app, su id. */
  plantilla?: string;
}

/** Lo que la obra declara (Los datos de la obra). */
export interface HabitabilidadObra {
  normas: NormaHabitabilidad[];
}

/** Se comprueban como mucho dos: la municipal y la autonómica (§5.5, punto 1). */
export const MAX_NORMAS_OBRA = 2;

// ── Plantillas cotejadas ─────────────────────────────────────────────────────

/** Una norma que trae la app, con el boletín en que se ha cotejado. */
export interface PlantillaNorma {
  norma: Omit<NormaHabitabilidad, "id">;
  /** Boletín y fecha del texto cotejado. */
  boletin: string;
  /** Cuándo se ofrece: la de vivienda protegida, solo si la vivienda lo es. */
  soloProtegida?: boolean;
  /** Comunidad autónoma, por los dos primeros dígitos del INE (provincias). */
  provinciasIne?: readonly string[];
  /** Lo que el proyectista debe saber antes de elegirla. */
  advertencia: string;
}

/** Provincias de Andalucía (código INE). */
const ANDALUCIA = provinciasDe("andalucia");

/**
 * Las plantillas, cotejadas en la imagen del boletín (K-MEM.17, 2026-10-11).
 * Ni el PGOU de Málaga ni el de Benalmádena: su texto no se ha leído en el
 * boletín.
 */
export const PLANTILLAS: readonly PlantillaNorma[] = [
  {
    // Art. 7: «…no será inferior al 10 por ciento de la superficie útil de su
    // planta, pudiendo reducirse la superficie real de ventilación de dichos
    // huecos hasta un 5 por ciento…». Art. 8: cocina independiente 7 m²,
    // dormitorios 8 m² (el de 12 m² y el estar por dormitorios no se modelan).
    norma: {
      referencia: "Orden de 21-07-2008 (vivienda protegida en Andalucía), texto integrado BOJA núm. 35 de 20-02-2020, arts. 7 y 8",
      ambito: "autonomica",
      iluminacion: { fraccion: 0.1, mide: "hueco" },
      ventilacion: { fraccion: 0.05, mide: "practicable" },
      computan: ["estar", "comedor", "estar_comedor", "cocina", "estar_cocina", "dormitorio", "otro"],
      superficieMinima: { cocina: 7, dormitorio: 8 },
      plantilla: "vpo-andalucia-2020",
    },
    boletin: "BOJA núm. 35, 20-02-2020",
    soloProtegida: true,
    provinciasIne: ANDALUCIA,
    advertencia:
      "Solo vivienda protegida. Cede ante el PGOU u ordenanzas que regulen el diseño de la vivienda libre: rige para lo que el municipio no regule (art. 2). Del art. 8 se comprueban la cocina (7 m²) y los dormitorios (8 m²); el dormitorio de 12 m² y el estar según dormitorios, no.",
  },
  {
    // Condición 3.ª: «Toda pieza habitable de día o de noche tendrá ventilación
    // directa al exterior por medio de un hueco con superficie no inferior a 1/6
    // de la superficie de la planta». Condición 6.ª: superficies mínimas.
    norma: {
      referencia: "Orden de 29-02-1944, condiciones higiénicas mínimas de las viviendas (BOE núm. 61 de 01-03-1944), condiciones 3.ª y 6.ª",
      ambito: "estatal",
      iluminacion: { fraccion: 1 / 6, mide: "hueco" },
      ventilacion: "conjunta",
      computan: ["estar", "comedor", "estar_comedor", "cocina", "estar_cocina", "dormitorio"],
      superficieMinima: { dormitorio: 6, estar: 10, estar_comedor: 10, cocina: 5, estar_cocina: 14 },
      plantilla: "orden-1944",
    },
    boletin: "BOE núm. 61, 01-03-1944",
    advertencia:
      "Supletoria: rige donde el planeamiento remite a ella o no fija el parámetro. Vigencia sin confirmar en fuente oficial (sin derogación expresa localizada). El dormitorio de dos camas pide 10 m²; aquí se comprueba el mínimo de una cama (6 m²).",
  },
];

// ── Lectura defensiva ────────────────────────────────────────────────────────

const texto = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
const fraccion = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1 ? v : undefined);
const positivo = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined);
const esTipo = (v: unknown): v is TipoEstancia => typeof v === "string" && (TIPOS_ESTANCIA as readonly string[]).includes(v);

/** Una norma bien formada, o null. Nunca lanza. */
export function parseNorma(raw: unknown): NormaHabitabilidad | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = texto(r.id);
  const referencia = texto(r.referencia);
  if (!id || !referencia) return null;
  const il = r.iluminacion as Record<string, unknown> | undefined;
  const fIl = fraccion(il?.fraccion);
  if (!il || fIl === undefined) return null;
  const iluminacion = { fraccion: fIl, mide: il.mide === "acristalada" ? ("acristalada" as const) : ("hueco" as const) };
  let ventilacion: NormaHabitabilidad["ventilacion"] = "conjunta";
  if (typeof r.ventilacion === "object" && r.ventilacion !== null) {
    const v = r.ventilacion as Record<string, unknown>;
    const fVe = fraccion(v.fraccion);
    if (fVe !== undefined) ventilacion = { fraccion: fVe, mide: v.mide === "hueco" ? "hueco" : "practicable" };
  }
  const computan = Array.isArray(r.computan) ? (r.computan as unknown[]).filter(esTipo) : [...COMPUTAN_HABITUAL];
  const norma: NormaHabitabilidad = {
    id,
    referencia,
    ambito: r.ambito === "autonomica" || r.ambito === "estatal" ? r.ambito : "municipal",
    iluminacion,
    ventilacion,
    computan: [...new Set(computan)],
  };
  const ine = texto(r.municipioIne);
  if (ine && /^\d{5}$/.test(ine)) norma.municipioIne = ine;
  const municipio = texto(r.municipio);
  if (municipio) norma.municipio = municipio;
  if (typeof r.superficieMinima === "object" && r.superficieMinima !== null) {
    const min: Partial<Record<TipoEstancia, number>> = {};
    for (const [k, v] of Object.entries(r.superficieMinima as Record<string, unknown>)) {
      const n = positivo(v);
      if (esTipo(k) && n !== undefined) min[k] = n;
    }
    if (Object.keys(min).length > 0) norma.superficieMinima = min;
  }
  if (typeof r.densidad === "object" && r.densidad !== null) {
    const d = r.densidad as Record<string, unknown>;
    const m2 = positivo(d.m2PorVivienda);
    if (m2 !== undefined) {
      const ref = texto(d.referencia);
      norma.densidad = {
        m2PorVivienda: m2,
        superficie: d.superficie === "util" ? "util" : "construida",
        redondeo: d.redondeo === "al_mas_proximo" ? "al_mas_proximo" : "por_defecto",
        ...(ref ? { referencia: ref } : {}),
      };
    }
  }
  const plantilla = texto(r.plantilla);
  if (plantilla) norma.plantilla = plantilla;
  return norma;
}

/** Las normas de una lista, sin las mal formadas ni los ids repetidos. */
export function parseNormas(raw: unknown): NormaHabitabilidad[] {
  if (!Array.isArray(raw)) return [];
  const vistas = new Set<string>();
  const normas: NormaHabitabilidad[] = [];
  for (const x of raw as unknown[]) {
    const n = parseNorma(x);
    if (!n || vistas.has(n.id)) continue;
    vistas.add(n.id);
    normas.push(n);
  }
  return normas;
}

// ── Mis normas, en el navegador ──────────────────────────────────────────────

export const CLAVE_MIS_NORMAS = "concreta-inst-normas-habitabilidad";

/** Lee Mis normas. Con el almacenamiento bloqueado (modo privado), ninguna. */
export function leerMisNormas(s?: Storage): NormaHabitabilidad[] {
  try {
    const raw = (s ?? window.localStorage).getItem(CLAVE_MIS_NORMAS);
    return raw ? parseNormas(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function guardarMisNormas(normas: NormaHabitabilidad[], s?: Storage): void {
  try {
    (s ?? window.localStorage).setItem(CLAVE_MIS_NORMAS, JSON.stringify(parseNormas(normas)));
  } catch {
    // Sin almacenamiento, Mis normas viven mientras la pestaña siga abierta.
  }
}

/** Guarda una norma en Mis normas: la sustituye si ya estaba (mismo id) o la añade. */
export function conNorma(lista: readonly NormaHabitabilidad[], n: NormaHabitabilidad): NormaHabitabilidad[] {
  return lista.some((x) => x.id === n.id) ? lista.map((x) => (x.id === n.id ? n : x)) : [...lista, n];
}

/** Las de Mis normas que valen para un municipio: las suyas primero, luego las que no se ligan a ninguno. */
export function sugeridasPara(lista: readonly NormaHabitabilidad[], municipioIne: string | undefined): NormaHabitabilidad[] {
  const suyas = municipioIne ? lista.filter((n) => n.municipioIne === municipioIne) : [];
  return [...suyas, ...lista.filter((n) => !suyas.includes(n))];
}

/** Las plantillas que se ofrecen en una obra: las de su comunidad; la de vivienda protegida, rotulada. */
export function plantillasPara(provinciaIne: string | undefined): readonly PlantillaNorma[] {
  return PLANTILLAS.filter((p) => !p.provinciasIne || (provinciaIne !== undefined && p.provinciasIne.includes(provinciaIne)));
}

// ── Textos comunes ───────────────────────────────────────────────────────────

/** 0,125 → «1/8»; 0,1 → «10 %»: como la escribe la norma. */
export function textoFraccion(f: number): string {
  const inv = 1 / f;
  if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) !== 10 && Math.round(inv) !== 20) return `1/${Math.round(inv)}`;
  const pct = Math.round(f * 1000) / 10;
  return `${String(pct).replace(".", ",")} %`;
}

/** El número máximo de viviendas que admite la densidad con una superficie. */
export function viviendasMaximas(d: DensidadNorma, superficie_m2: number): number {
  const c = superficie_m2 / d.m2PorVivienda;
  return d.redondeo === "al_mas_proximo" ? Math.floor(c) + (c - Math.floor(c) >= 0.5 ? 1 : 0) : Math.floor(c);
}

/** Un id nuevo para una norma: el proyectista no lo ve. */
export function idNorma(referencia: string, ahora: number): string {
  const slug = referencia
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "norma"}-${ahora.toString(36)}`;
}

/** «1/10», «10 %», «10%», «0,1» → 0,1. Lo que no es una fracción entre 0 y 1, null. */
export function leerFraccion(txt: string): number | null {
  const t = txt.trim().replace(/\s/g, "").replace(",", ".");
  let f: number;
  const barra = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (barra) f = Number(barra[1]) / Number(barra[2]);
  else if (t.endsWith("%")) f = Number(t.slice(0, -1)) / 100;
  else f = Number(t);
  return Number.isFinite(f) && f > 0 && f < 1 ? f : null;
}
