// =============================================================================
// Los datos de la obra para el estudio básico de seguridad y salud (feature-35,
// paso 1). SOLO TIPOS Y CONSTANTES: las funciones puras viven en `datos.ts`.
//
// Lo que depende de la obra no se supone (PLAN-MEMORIA §2, principio 4): todo es
// opcional y sin valores por defecto. Lo que falta sale pendiente en «Antes de
// entregar» (`pendientesSeguridadSalud`). Base normativa: K-SYS en
// research/verificacion-seguridad-salud.md.
// =============================================================================

/**
 * Presupuesto del proyecto (K-SYS.1): PEC = (PEM + GG + BI) × (1 + IVA), Guía
 * folio 24. Sin valores por defecto (decisión 2): los porcentajes los declara el
 * proyectista. Más adelante pueden venir de concreta-mediciones.
 */
export interface PresupuestoObra {
  /** Presupuesto de ejecución material [€]. */
  pem?: number;
  /** Gastos generales [% del PEM]. */
  gg_pct?: number;
  /** Beneficio industrial [% del PEM]. */
  bi_pct?: number;
  /** IVA [%]. */
  iva_pct?: number;
}

/**
 * Ayuda para estimar los trabajadores desde el PEM (decisión 3; analisis §6.1):
 * la Guía no da método (K-SYS.2). El dato que cuenta es el que confirma el
 * proyectista en `ManoDeObra.maxTrabajadores`.
 */
export interface EstimacionTrabajadores {
  /** Parte del PEM que es mano de obra [%]. */
  manoObra_pct?: number;
  /** Coste medio de la hora de trabajo [€/h]. */
  costeHora?: number;
}

/** Un periodo en que el número de trabajadores es constante (Guía folio 25). */
export interface PeriodoObra {
  /** «Estructura», «Acabados»… Solo para leer la tabla. */
  descripcion?: string;
  /** Tᵢ: trabajadores en el periodo. */
  trabajadores: number;
  /** Dᵢ: días de trabajo del periodo (1 día = jornada de 8 h). */
  dias: number;
}

/** Duración y mano de obra (art. 4.1 b y c; K-SYS.2). */
export interface ManoDeObra {
  /** Duración estimada [días laborables]. */
  plazoDias?: number;
  /** Máximo de trabajadores a la vez, también autónomos y subcontratas. */
  maxTrabajadores?: number;
  estimacion?: EstimacionTrabajadores;
  /**
   * Volumen de mano de obra [jornadas], solo si plazo × trabajadores pasa de
   * 500 (si no, el supuesto c queda descartado sin pedirlo). Con `periodos`,
   * manda la suma de la tabla.
   */
  jornadas?: number;
  /** Tabla opcional para la suma Σ Tᵢ × Dᵢ. */
  periodos?: PeriodoObra[];
}

/** Lo que se declara del amianto (RD 396/2006 art. 10.2; K-SYS.9). */
export type EstadoAmianto = "no_identificado" | "posible" | "identificado";

export const ESTADOS_AMIANTO: readonly EstadoAmianto[] = ["no_identificado", "posible", "identificado"];

export const NOMBRE_ESTADO_AMIANTO: Record<EstadoAmianto, string> = {
  no_identificado: "No se han identificado materiales con amianto",
  posible: "Puede haber materiales con amianto",
  identificado: "Se han identificado materiales con amianto",
};

export interface Amianto {
  estado: EstadoAmianto;
  /** Dónde está o puede estar: «bajantes de fibrocemento del patio». */
  ubicacion?: string;
  /**
   * Friable (proyectado, calorifugados, paneles aislantes) o no friable
   * (fibrocemento, amianto-vinilo), RD 396/2006 art. 11.2. Sin dato, no se sabe.
   */
  friable?: boolean;
}

/** Quiénes intervienen: deciden los coordinadores (art. 3) y el art. 2.3. */
export interface Coordinacion {
  /** ¿Varios proyectistas durante la elaboración del proyecto? (art. 3.1; decisión 13). */
  variosProyectistas?: boolean;
  /** ¿Más de una empresa, o una empresa y autónomos, o varios autónomos? (art. 3.2). */
  variasEmpresas?: boolean;
  /**
   * Solo en vivienda: el promotor reforma o construye su propia vivienda y
   * contrata directamente a autónomos (art. 2.3; K-SYS.11).
   */
  cabezaFamilia?: boolean;
}

/** El centro asistencial más próximo (decisión 7): lo declara el proyectista. */
export interface CentroAsistencial {
  nombre: string;
  direccion?: string;
  /** Distancia por carretera [km]. */
  distancia_km?: number;
  /** Tiempo de llegada [min]. */
  tiempo_min?: number;
}

/** Los servicios de la tabla «existe / no existe» (analisis §3, apartado 3; ss07). */
export type ServicioAfectado =
  | "linea_aerea"
  | "linea_enterrada"
  | "transformador"
  | "gas"
  | "agua"
  | "saneamiento"
  | "telecomunicaciones";

export const SERVICIOS_AFECTADOS: readonly ServicioAfectado[] = [
  "linea_aerea",
  "linea_enterrada",
  "transformador",
  "gas",
  "agua",
  "saneamiento",
  "telecomunicaciones",
];

export const NOMBRE_SERVICIO: Record<ServicioAfectado, string> = {
  linea_aerea: "Líneas eléctricas aéreas",
  linea_enterrada: "Líneas eléctricas enterradas",
  transformador: "Centros de transformación",
  gas: "Conducciones de gas",
  agua: "Conducciones de agua",
  saneamiento: "Red de saneamiento",
  telecomunicaciones: "Líneas de telecomunicaciones",
};

/** El entorno de la obra (apartados 3 y 9 del estudio). */
export interface Entorno {
  centroAsistencial?: CentroAsistencial;
  /** Edificio o local en uso durante la obra (otras actividades, art. 6.2). */
  edificioEnUso?: boolean;
  /** Se ocupa la vía pública (vallado, acopios, andamio sobre la acera). */
  viaPublica?: boolean;
  /** `true` existe, `false` no existe; sin clave, sin declarar. */
  servicios?: Partial<Record<ServicioAfectado, boolean>>;
  /**
   * Tensión nominal de las líneas aéreas próximas [kV], para las distancias de la
   * tabla 1 del RD 614/2001 (K-SYS.16). Solo con líneas aéreas.
   */
  tensionLineas_kV?: number;
}

/** Medios que cambian lo que se imprime (K-SYS.16 y K-SYS.17). */
export interface MediosObra {
  /** Grúa torre: el viento de 72 km/h y el RD 836/2003. */
  gruaTorre?: boolean;
  /** Grúa móvil autopropulsada: el RD 837/2003. */
  gruaMovil?: boolean;
}

/**
 * Las 28 claves de riesgo (K-SYS.15): la lista del análisis §4.2, con los
 * nombres que fija la verificación. Los nombres van con el catálogo (paso 3).
 */
export type ClaveRiesgo =
  | "distinto"
  | "mismo"
  | "desplome"
  | "manipulacion"
  | "desprendidos"
  | "pisadas"
  | "choque-inmoviles"
  | "choque-moviles"
  | "golpes"
  | "proyeccion"
  | "atrapamiento"
  | "vuelco"
  | "sobreesfuerzos"
  | "temperaturas"
  | "termicos"
  | "electrico"
  | "nocivas"
  | "causticas"
  | "radiaciones"
  | "explosiones"
  | "incendios"
  | "seres-vivos"
  | "atropellos"
  | "quimicos"
  | "biologicos"
  | "ruido"
  | "vibraciones"
  | "amianto";

export const CLAVES_RIESGO: readonly ClaveRiesgo[] = [
  "distinto",
  "mismo",
  "desplome",
  "manipulacion",
  "desprendidos",
  "pisadas",
  "choque-inmoviles",
  "choque-moviles",
  "golpes",
  "proyeccion",
  "atrapamiento",
  "vuelco",
  "sobreesfuerzos",
  "temperaturas",
  "termicos",
  "electrico",
  "nocivas",
  "causticas",
  "radiaciones",
  "explosiones",
  "incendios",
  "seres-vivos",
  "atropellos",
  "quimicos",
  "biologicos",
  "ruido",
  "vibraciones",
  "amianto",
];

/** Un riesgo que el proyectista añade a una ficha. */
export interface RiesgoAnadido {
  clave: ClaveRiesgo;
  causa?: string;
}

/** Lo que se quita y se añade en una lista de textos de la ficha. */
export interface EdicionLista {
  /** Textos del catálogo que se quitan, tal cual. Si el catálogo cambia el texto, vuelve a salir. */
  quitados?: string[];
  anadidos?: string[];
}

/** Lo que el proyectista edita dentro de una ficha (paso 4). */
export interface EdicionFicha {
  riesgos?: { quitados?: ClaveRiesgo[]; anadidos?: RiesgoAnadido[] };
  medidas?: EdicionLista;
  protecciones?: EdicionLista;
  epi?: EdicionLista;
  /** Una ficha «redactada por la app» que el proyectista ha revisado. */
  revisada?: boolean;
}

/**
 * La selección de fichas, como DIFERENCIA con la propuesta de la app (paso 4):
 * un cambio en la obra se refleja sin perder lo que el proyectista decidió.
 * Las claves son los ids del catálogo («IP1», «F14», «MA1», «M6»…).
 */
export interface SeleccionFichas {
  anadidas?: string[];
  quitadas?: string[];
  ediciones?: Record<string, EdicionFicha>;
}

/**
 * Lo que el proyecto guarda para el estudio básico (`Proyecto.seguridadSalud`).
 * Opcional y sin schema nuevo: los expedientes guardados se siguen leyendo.
 */
export interface EstudioSeguridadSalud {
  presupuesto?: PresupuestoObra;
  manoDeObra?: ManoDeObra;
  /**
   * Túneles, galerías, conducciones subterráneas o presas (art. 4.1 d). Las
   * zanjas a cielo abierto no cuentan (Guía folio 25).
   */
  subterraneas?: boolean;
  /**
   * En obra nueva: se derriba una construcción existente en la parcela, y el
   * amianto pasa a ser obligatorio como en una obra sobre edificio existente.
   */
  demolicionPrevia?: boolean;
  amianto?: Amianto;
  coordinacion?: Coordinacion;
  entorno?: Entorno;
  medios?: MediosObra;
  seleccion?: SeleccionFichas;
  /** Los planos del estudio, como los numera el proyectista («SS01–SS02»; decisión 10). */
  planos?: string;
}
