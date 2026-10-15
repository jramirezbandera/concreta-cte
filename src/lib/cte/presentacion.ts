// =============================================================================
// Presentación del contrato de resultado (feature-14 §H): lo que la cáscara
// común (franja, etiquetas, lista, memoria) necesita para pintar un elemento,
// ya redactado por la capa de textos de cada módulo. Solo tipos y constantes.
// =============================================================================

/**
 * ok · rv (por revisar) · ko (no cumple) · pv (previsto) · in (criterio) ·
 * dt (dato de partida) · fu (fuera de alcance). Los tres últimos se pintan igual.
 */
export type EstadoPresentacion = "ok" | "rv" | "ko" | "pv" | "in" | "dt" | "fu";

export const TEXTO_ESTADO: Record<EstadoPresentacion, string> = {
  ok: "cumple",
  rv: "por revisar",
  ko: "no cumple",
  pv: "previsto",
  in: "criterio",
  dt: "dato",
  fu: "fuera",
};

/** Lo seleccionado, para la franja bajo el dibujo. */
export interface DetalleElemento {
  /** Rótulo pequeño: «Colector · residuales». */
  clase: string;
  titulo: string;
  /** La cifra grande: «Ø110». */
  valor: string;
  /** Lo que acompaña a la cifra: «al 2 %», «3 plantas». */
  unidad?: string;
  estado: EstadoPresentacion;
  /** Lo que decide el valor, en una o dos frases. */
  manda: string;
  nota?: string;
  /** Las cuentas: «Recibe · 135 UD». */
  filas: { k: string; v: string }[];
  /** Capacidad usada, de 0 a 1. */
  uso?: number;
  /** «HS 5 · tabla 4.5». */
  cita: string;
}

/** Un trozo de párrafo de la memoria: texto, o una cifra que se resalta. */
export type Trozo = string | { v: string };

/**
 * Cómo se pinta cada columna de una tabla de la memoria (feature-31): `texto`
 * a la izquierda; `dato`, una cifra, a la derecha; `norma` (lo exigido),
 * `proyecto` (lo proyectado) y `cumple`, centradas, con «No cumple» resaltado.
 */
export type TipoColumna = "texto" | "dato" | "norma" | "proyecto" | "cumple";

/** Una tabla de la memoria: las «Norma | Proyecto» de las memorias del estudio (feature-31). */
export interface TablaMemoria {
  /** Encima, en negrita: «Evacuación». */
  rotulo?: string;
  cabecera: string[];
  /** Una por columna; sin decir, la primera es `texto` y el resto `dato`. */
  columnas?: TipoColumna[];
  filas: string[][];
  /** Debajo, numeradas «(1) …», en el orden de las llamadas de las celdas. */
  notas?: string[];
  /** Cuántos párrafos van antes; sin decir, todos. */
  tras?: number;
  /**
   * Hasta 12 columnas en letra más pequeña, sin partir: una tabla de tramos
   * partida por la columna 0 no se lee (feature-33).
   */
  ancha?: boolean;
}

/** La memoria redactada de una justificación. */
export interface MemoriaDoc {
  titulo: string;
  /** «DB-HS 5». */
  norma: string;
  parrafos: Trozo[][];
  tablas?: TablaMemoria[];
  /** La línea de fuentes del pie. */
  fuente: string;
}

/**
 * Una parte del cálculo extenso de una instalación («Caudales por aparato»,
 * «Camino crítico»): párrafos y tablas, como un apartado de la memoria.
 */
export interface ParteAnejo {
  titulo: string;
  parrafos: Trozo[][];
  /** El anejo numera sus tablas («Tabla 5.3.1-1. …») delante del rótulo. */
  tablas?: TablaMemoria[];
}

/** El cálculo extenso de una instalación, para el anejo de instalaciones (feature-33). */
export interface AnejoDoc {
  /** Las abreviaturas de sus tablas, una vez, al principio: [«Qb», «caudal bruto [l/s]»]. */
  abreviaturas?: [string, string][];
  partes: ParteAnejo[];
  /** La línea de fuentes del pie. */
  fuente: string;
}
