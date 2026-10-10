// =============================================================================
// La memoria redactada como texto plano (feature-15 §A): lo que copia «Copiar
// texto». Común a todos los módulos. PURA.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, TipoColumna, Trozo } from "./presentacion";

/** El párrafo como texto plano. */
export function textoParrafo(p: Trozo[]): string {
  return p
    .map((t) => (typeof t === "string" ? t : t.v))
    .join("")
    .trim();
}

/** El tipo de cada columna, con el de siempre si la tabla no lo dice (feature-31). */
export function columnasDe(t: Pick<TablaMemoria, "cabecera" | "columnas">): TipoColumna[] {
  return t.cabecera.map((_, j) => t.columnas?.[j] ?? (j === 0 ? "texto" : "dato"));
}

/** «(1) …»: las notas de una tabla, numeradas. */
export function notasNumeradas(notas: readonly string[] | undefined): string[] {
  return (notas ?? []).map((n, i) => `(${i + 1}) ${n}`);
}

/** Lo que sale como «No cumple» en una columna `cumple`: se resalta. */
export function esNoCumple(celda: string): boolean {
  return /^no cumple/i.test(celda.trim());
}

/** Las tablas que hay: `tablas: soloTablas(tablaA(j), tablaB(j))`. */
export function soloTablas(...ts: (TablaMemoria | undefined)[]): TablaMemoria[] {
  return ts.filter((t): t is TablaMemoria => t !== undefined);
}

/** Párrafos y tablas en el orden del documento: cada tabla tras sus `tras` párrafos (feature-31). */
export type PiezaMemoria = { tipo: "parrafo"; p: Trozo[] } | { tipo: "tabla"; t: TablaMemoria };

export function piezasMemoria(m: Pick<MemoriaDoc, "parrafos" | "tablas">): PiezaMemoria[] {
  const n = m.parrafos.length;
  const tablas = (m.tablas ?? []).map((t, i) => ({ t, i, tras: Math.min(n, Math.max(0, t.tras ?? n)) }));
  const out: PiezaMemoria[] = [];
  for (let k = 0; k <= n; k++) {
    for (const x of tablas.filter((x) => x.tras === k).sort((a, b) => a.i - b.i)) out.push({ tipo: "tabla", t: x.t });
    if (k < n) out.push({ tipo: "parrafo", p: m.parrafos[k] });
  }
  return out;
}

/** Una tabla como texto plano: el rótulo, las filas separadas por tabuladores y las notas. */
export function textoTabla(t: Pick<TablaMemoria, "rotulo" | "cabecera" | "filas" | "notas">): string {
  return [...(t.rotulo ? [t.rotulo] : []), [t.cabecera, ...t.filas].map((f) => f.join("\t")).join("\n"), ...notasNumeradas(t.notas)].join("\n");
}

/** La memoria entera como texto plano, lista para pegar. */
export function textoPlanoMemoria(m: MemoriaDoc): string {
  const partes = [m.titulo, ...piezasMemoria(m).map((x) => (x.tipo === "parrafo" ? textoParrafo(x.p) : textoTabla(x.t)))];
  partes.push(m.fuente);
  return partes.join("\n\n");
}
