// =============================================================================
// Lo que la memoria y el anejo de instalaciones comparten (feature-33, paso 4):
// qué instalaciones van al anejo, con qué número, cómo se numeran sus tablas y
// la frase con que la memoria remite al anejo y a los planos. PURO.
//
// Vive aparte para que la memoria (`memoria.ts`) y el anejo
// (`anejoInstalaciones.ts`) lo lean sin importarse el uno al otro.
// =============================================================================

import type { AnejoDoc } from "../cte/presentacion";
import type { JustificacionKey } from "../proyecto/tipos";

export interface InstalacionAnejo {
  key: JustificacionKey;
  /** «5.3.1». */
  numero: string;
  /** «Fontanería». */
  titulo: string;
  /** «DB-HS 4», «REBT»: la del encabezado, no la ITC que cita el módulo. */
  norma: string;
}

/** Las instalaciones del anejo, en su orden y con su número fijo. */
export const INSTALACIONES_ANEJO: readonly InstalacionAnejo[] = [
  { key: "hs4", numero: "5.3.1", titulo: "Fontanería", norma: "DB-HS 4" },
  { key: "hs5", numero: "5.3.2", titulo: "Saneamiento", norma: "DB-HS 5" },
  { key: "rebt", numero: "5.3.3", titulo: "Electricidad", norma: "REBT" },
];

/** «Tabla 5.3.1-2»: las tablas de cada instalación, numeradas en orden. */
export function numeroTabla(numero: string, i: number): string {
  return `Tabla ${numero}-${i + 1}`;
}

/** Cuántas tablas pone una instalación en el anejo. */
export function tablasDeAnejo(doc: AnejoDoc): number {
  return doc.partes.reduce((s, p) => s + (p.tablas?.length ?? 0), 0);
}

/** «I05–I07» lleva «planos»; «I05», «plano». */
function rotuloPlanos(planos: string): string {
  return /[,;–—-]|\s[ye]\s/.test(planos) ? "planos" : "plano";
}

/**
 * La frase con que la memoria remite al anejo y a los planos: «El cálculo
 * extenso se desarrolla en el anejo 5.3.1 (tablas 5.3.1-1 a 5.3.1-5). Ver
 * planos I05–I07.» `null` si no hay ni anejo ni planos.
 */
export function remisionAnejo(key: JustificacionKey, doc: AnejoDoc | undefined, planos: string | undefined): string | null {
  const ins = INSTALACIONES_ANEJO.find((i) => i.key === key);
  if (!ins) return null;
  const p = planos?.trim();
  const frases: string[] = [];
  if (doc) {
    const n = tablasDeAnejo(doc);
    const tablas =
      n === 0 ? "" : n === 1 ? ` (${numeroTabla(ins.numero, 0).toLowerCase()})` : ` (tablas ${ins.numero}-1 a ${ins.numero}-${n})`;
    frases.push(`El cálculo extenso se desarrolla en el anejo ${ins.numero}${tablas}.`);
  }
  if (p) frases.push(`Ver ${rotuloPlanos(p)} ${p}.`);
  return frases.length > 0 ? frases.join(" ") : null;
}

/** Los planos de las instalaciones con los de una cambiados; vacío, se quita. */
export function conPlanos(
  planos: Partial<Record<JustificacionKey, string>> | undefined,
  key: JustificacionKey,
  valor: string | undefined,
): Partial<Record<JustificacionKey, string>> {
  const { [key]: _quitado, ...resto } = planos ?? {};
  return valor?.trim() ? { ...resto, [key]: valor.trim() } : resto;
}
