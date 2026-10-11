import type { Alcance, DatosGenerales, Intervencion, JustificacionKey, Proyecto, TipoObraExistente } from "./tipos";
import type { Edificio, ObraZona, UsoZona, Zona } from "../edificio/tipos";
import type { CasoEdificio } from "../edificio/casos";
import type { He4Estado } from "../../modules/he4/estado";
import { demandaReferencia } from "../../modules/he4/justificacion";
import { edificioSi, superficies } from "../../modules/si/edificio";

// Alcance de una obra en un edificio existente (feature-27, UX-RECONCEPT §5).
// Lib PURA. El asistente de alcance pregunta lo que El edificio no sabe; aquí se
// deduce lo que sí sabe por la marca de cada zona: qué se amplía, qué cambia de
// uso y a qué, qué se reforma. Verificación: research/verificacion-reformas.md.

/**
 * Tipos de obra de la intervención (K-REF.1): los del asistente o, si no se ha
 * respondido, el de «Tipo de intervención». Vacío en obra nueva.
 */
export function tiposDeObra(dg: DatosGenerales): TipoObraExistente[] {
  if (dg.intervencion === "obra_nueva") return [];
  const marcados = dg.alcance?.tipos?.filter((t, i, a) => a.indexOf(t) === i) ?? [];
  return marcados.length > 0 ? marcados : [dg.intervencion];
}

/**
 * Qué se hace con una zona. En obra nueva todo es nuevo (la marca no cuenta);
 * en un edificio existente, sin marca, la zona cuenta como reformada.
 */
export function obraDeZona(z: Zona, intervencion: Intervencion): ObraZona {
  if (intervencion === "obra_nueva") return "nueva";
  return z.obra ?? "reformada";
}

/** El edificio con solo las zonas que cumplen `pred` (los grupos se quedan, aunque vacíos). */
export function soloZonas(e: Edificio, pred: (z: Zona) => boolean): Edificio {
  return { ...e, grupos: e.grupos.map((g) => ({ ...g, zonas: g.zonas.filter(pred) })) };
}

const VIVIENDA: ReadonlySet<UsoZona> = new Set(["viviendas", "vivienda_unifamiliar"]);
/** Locales del ámbito de HS 3 (ap. 1.1): interior de las viviendas, trasteros, garajes. */
const LOCALES_HS3: ReadonlySet<UsoZona> = new Set([
  "viviendas",
  "vivienda_unifamiliar",
  "trasteros",
  "garaje",
  "garaje_privado",
]);
/**
 * Usos que en un edificio con viviendas son recinto de actividad para el DB-HR
 * (el local, las oficinas y el garaje, como en feature-25).
 */
const ACTIVIDAD: ReadonlySet<UsoZona> = new Set(["local_sin_uso", "oficinas", "garaje"]);

/** Una zona que cambia de uso. */
export interface CambioUsoZona {
  zonaId: string;
  uso: UsoZona;
  usoAnterior?: UsoZona;
  /** Superficie útil de la zona en todas las plantas de su grupo [m²]. */
  util_m2: number;
}

/** Lo que El edificio dice del alcance de la obra. */
export interface AlcanceEdificio {
  /** Alguna zona tiene marca (sin ninguna, todo cuenta como reformado). */
  marcado: boolean;
  /** Las zonas nuevas: la ampliación [m²]. */
  ampliada: { util_m2: number; construida_m2: number };
  /** Lo que había antes de la obra: todo menos lo nuevo [m²]. */
  existente: { util_m2: number; construida_m2: number };
  cambiosUso: CambioUsoZona[];
  /** Superficie útil que cambia de uso [m²] (HE 0: más de 50 m²). */
  utilCambioUso_m2: number;
  /** Alguna zona pasa a vivienda desde otro uso. */
  pasaAVivienda: boolean;
  /**
   * …y lo hace en un edificio que ya tenía viviendas (DB-SI, Introducción III,
   * criterio 8: no es preciso aplicar el DB a los elementos comunes de evacuación).
   */
  viviendaEnEdificioDeViviendas: boolean;
  /** Alguna zona pasa a recinto de actividad en un edificio con viviendas (DB-HR). */
  pasaARecintoActividad: boolean;
  /** Se interviene en viviendas, trasteros o garaje: locales del ámbito de HS 3. */
  intervieneLocalesHs3: boolean;
  /** Demanda de ACS de referencia antes y después de la ampliación [l/d] (HE 4 c). */
  demandaAcs: { inicial_l_d: number; final_l_d: number };
}

/** Deduce de El edificio el alcance de una obra en un edificio existente. */
export function alcanceDeEdificio(
  dg: DatosGenerales,
  edificio: Edificio,
  estadoHe4?: Partial<He4Estado>,
): AlcanceEdificio {
  const obra = (z: Zona): ObraZona => obraDeZona(z, dg.intervencion);
  const todas = edificio.grupos.flatMap((g) => g.zonas);
  const zonasSi = edificioSi(edificio).zonas;
  const ampliada = superficies(zonasSi.filter((z) => obra(z.zona) === "nueva"));
  const existente = superficies(zonasSi.filter((z) => obra(z.zona) !== "nueva"));

  const cambiosUso: CambioUsoZona[] = zonasSi
    .filter((z) => obra(z.zona) === "cambia_uso")
    .map((z) => ({
      zonaId: z.id,
      uso: z.uso,
      usoAnterior: z.zona.usoAnterior,
      util_m2: Math.round(z.util_m2 * z.repeticiones),
    }));
  const deVivienda = (c: CambioUsoZona): boolean =>
    VIVIENDA.has(c.uso) && (c.usoAnterior === undefined || !VIVIENDA.has(c.usoAnterior));
  const pasaAVivienda = cambiosUso.some(deVivienda);
  const viviendasPrevias = todas.some((z) => VIVIENDA.has(z.uso) && obra(z) !== "cambia_uso" && obra(z) !== "nueva");
  const conViviendas = todas.some((z) => VIVIENDA.has(z.uso));

  const sinNuevas = soloZonas(edificio, (z) => obra(z) !== "nueva");
  return {
    marcado: dg.intervencion !== "obra_nueva" && todas.some((z) => z.obra !== undefined),
    ampliada: { util_m2: ampliada.util_m2, construida_m2: ampliada.construida_m2 },
    existente: { util_m2: existente.util_m2, construida_m2: existente.construida_m2 },
    cambiosUso,
    utilCambioUso_m2: cambiosUso.reduce((a, c) => a + c.util_m2, 0),
    pasaAVivienda,
    viviendaEnEdificioDeViviendas: pasaAVivienda && viviendasPrevias,
    pasaARecintoActividad: conViviendas && cambiosUso.some((c) => ACTIVIDAD.has(c.uso)),
    intervieneLocalesHs3: todas.some((z) => obra(z) !== "existente" && LOCALES_HS3.has(z.uso)),
    demandaAcs: {
      inicial_l_d: demandaReferencia(sinNuevas, estadoHe4),
      final_l_d: demandaReferencia(edificio, estadoHe4),
    },
  };
}

// ─── Lo que calcula cada módulo (feature-27, paso 6) ─────────────────────────

/**
 * Qué parte del edificio lee cada justificación en una obra existente:
 *  - «intervenido»: solo las zonas que se tocan (lo existente sin tocar fuera);
 *  - «con_comunes»: lo intervenido más las zonas comunes y vestíbulos, que son
 *    los medios de evacuación que sirven a la zona (DB-SI criterio 8) y el
 *    itinerario accesible hasta la vía pública (DB-SUA criterio 2);
 *  - «edificio»: todo, porque la exigencia es del conjunto (dotación del
 *    edificio ampliado de SI 4, rayo de SUA 8, HE 4, HE 5, HE 6, previsión de
 *    cargas de REBT…).
 * Lo que no figura lee el edificio entero.
 */
export const ALCANCE_MODULO: Partial<Record<JustificacionKey, "intervenido" | "con_comunes">> = {
  hs1: "intervenido",
  hs3: "intervenido",
  hs4: "intervenido",
  hs5: "intervenido",
  hs6: "intervenido",
  he1: "intervenido",
  hr: "intervenido",
  si1: "intervenido",
  si2: "intervenido",
  si6: "intervenido",
  sua1: "intervenido",
  sua2: "intervenido",
  sua3: "intervenido",
  sua4: "intervenido",
  sua7: "intervenido",
  hab: "intervenido",
  si3: "con_comunes",
  sua9: "con_comunes",
};

const COMUNES: ReadonlySet<UsoZona> = new Set(["zona_comun", "vestibulo"]);

/**
 * El edificio que calcula una justificación: sin las zonas existentes que no se
 * tocan, si su exigencia es de lo intervenido. Devuelve el MISMO objeto cuando no
 * hay nada que quitar (obra nueva, ninguna zona sin tocar o exigencia del
 * conjunto), para que obra nueva siga exactamente igual.
 */
export function edificioParaModulo(dg: DatosGenerales, edificio: Edificio, key: JustificacionKey): Edificio {
  const modo = ALCANCE_MODULO[key];
  if (!modo || dg.intervencion === "obra_nueva") return edificio;
  const queda = (z: Zona): boolean =>
    obraDeZona(z, dg.intervencion) !== "existente" || (modo === "con_comunes" && COMUNES.has(z.uso));
  if (edificio.grupos.every((g) => g.zonas.every(queda))) return edificio;
  return soloZonas(edificio, queda);
}

// ─── Lo existente, a la vista de los módulos (feature-30) ────────────────────

/**
 * Lo que un módulo necesita para redactar una obra en un edificio existente
 * como intervención: qué se proyecta y qué existe y no se modifica. Solo con el
 * asistente de alcance respondido (sin él, la reforma se redacta como hasta
 * feature-29, y obra nueva nunca la tiene).
 */
export interface ObraExistente {
  /** El edificio entero, con lo que no se toca (el módulo calcula sobre lo intervenido). */
  edificio: Edificio;
  /** Lo que El edificio dice del alcance (cambios de uso, ampliación…). */
  deduccion: AlcanceEdificio;
  /** Las respuestas del asistente. */
  respuestas: Alcance;
  intervencion: Intervencion;
}

/** El contexto de lo existente, si lo hay (ver `ObraExistente`). */
export function obraExistenteDe(dg: DatosGenerales, edificio: Edificio): ObraExistente | undefined {
  if (dg.intervencion === "obra_nueva" || !dg.alcance) return undefined;
  return { edificio, deduccion: alcanceDeEdificio(dg, edificio), respuestas: dg.alcance, intervencion: dg.intervencion };
}

/**
 * El edificio antes de la obra: sin lo nuevo y con lo que cambia de uso en su
 * uso anterior (sin uso anterior, el de ahora). La parte de un local que pasa a
 * vivienda vuelve al local del que se segrega: si en el mismo grupo de plantas
 * queda una zona existente con el uso anterior, se le suma (era un local, no
 * dos). Para comparar lo de antes con lo de después (REBT, SUA 8).
 */
export function edificioAntes(ex: ObraExistente): Edificio {
  const obra = (z: Zona) => obraDeZona(z, ex.intervencion);
  const cambia = (z: Zona): z is Zona & { usoAnterior: UsoZona } =>
    obra(z) === "cambia_uso" && z.usoAnterior !== undefined && z.usoAnterior !== z.uso;
  return {
    ...ex.edificio,
    grupos: ex.edificio.grupos.map((g) => {
      const madreDe = (uso: UsoZona) => g.zonas.find((x) => x.uso === uso && obra(x) === "existente");
      const zonas: Zona[] = [];
      for (const z of g.zonas) {
        if (obra(z) === "nueva") continue;
        if (cambia(z)) {
          if (madreDe(z.usoAnterior)) continue; // se suma a la zona de la que se segrega
          const { unidades: _sinUnidades, ...resto } = z;
          zonas.push({ ...resto, uso: z.usoAnterior });
          continue;
        }
        const segregadas = g.zonas.filter((y) => cambia(y) && madreDe(y.usoAnterior) === z);
        zonas.push(segregadas.length === 0 ? z : { ...z, superficieUtil_m2: z.superficieUtil_m2 + segregadas.reduce((acc, y) => acc + y.superficieUtil_m2, 0) });
      }
      return { ...g, zonas };
    }),
  };
}

/** Si una zona no se toca en la obra. */
export function esExistente(z: Zona, ex: ObraExistente): boolean {
  return obraDeZona(z, ex.intervencion) === "existente";
}

/** El proyecto tal como lo ve una justificación, con lo existente si lo hay. */
export type ProyectoModulo = Proyecto & { existente?: ObraExistente };

/** El proyecto tal como lo ve una justificación (ver `edificioParaModulo` y `ObraExistente`). */
export function proyectoParaModulo(p: Proyecto, key: JustificacionKey): ProyectoModulo {
  const edificio = edificioParaModulo(p.datosGenerales, p.edificio, key);
  const existente = obraExistenteDe(p.datosGenerales, p.edificio);
  if (existente) return { ...p, edificio, existente };
  return edificio === p.edificio ? p : { ...p, edificio };
}

// ─── El ejemplo de reforma (feature-27) ──────────────────────────────────────

/**
 * Los datos de la obra que acompañan a un caso de partida: solo el ejemplo de
 * reforma los tiene (cambio de uso de parte del local a vivienda, con la
 * reforma del portal y el asistente de alcance respondido).
 */
export function obraDeCaso(caso: CasoEdificio): Pick<DatosGenerales, "intervencion" | "alcance"> | null {
  if (caso !== "reforma_local_vivienda") return null;
  return {
    intervencion: "cambio_uso",
    alcance: {
      tipos: ["cambio_uso", "reforma"],
      integral: false,
      cambioUsoCaracteristico: false,
      envolvente: ["huecos", "particiones"],
      envolventeMas25: false,
      pasaAcondicionado: true,
      interior: ["distribucion", "aseos", "vidrios_puertas"],
      generacionTermica: "parcial",
      aparatos: "aumentan",
      pluviales: false,
      electrica: "modifica",
      estructura: false,
      aparcamiento: false,
      electrica50: false,
    },
  };
}
