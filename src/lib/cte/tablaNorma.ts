// =============================================================================
// Las tablas «Norma | Proyecto» de la memoria (feature-31): lo común a los
// módulos que las redactan, para que todas digan lo mismo igual. PURA.
//
//   - «Norma» es lo exigido, con su signo («≤ 25 m», «EI 120»); «Proyecto», lo
//     proyectado. Si el proyecto solo declara que cumple (una EI, una fuerza de
//     apertura), «Proyecto» dice el valor que se declara.
//   - Donde un parámetro no se exige en ese caso, «no se exige»; nunca «—».
//   - Cada fila con comparación termina en «Cumple» o «No cumple».
// =============================================================================

import type { TablaMemoria, TipoColumna } from "./presentacion";

export const NO_SE_EXIGE = "no se exige";

/** Las columnas de una tabla «Parámetro | Norma | Proyecto | Cumple». */
export const COLUMNAS_NORMA: TipoColumna[] = ["texto", "norma", "proyecto", "cumple"];

/** «Cumple» / «No cumple» (un veredicto del módulo o una comparación). */
export function cumpleTexto(cumple: boolean | "ok" | "fail" | "warn" | "neutral"): string {
  return cumple === false || cumple === "fail" ? "No cumple" : "Cumple";
}

/** Una fila «Parámetro | Norma | Proyecto | Cumple». */
export type FilaNorma = [parametro: string, norma: string, proyecto: string, cumple: boolean | "ok" | "fail"];

/** La tabla «Parámetro | Norma | Proyecto | Cumple», sin filas vacías. */
export function tablaNorma(
  filas: FilaNorma[],
  o: { rotulo?: string; parametro?: string; notas?: string[]; tras?: number } = {},
): TablaMemoria | undefined {
  if (filas.length === 0) return undefined;
  return {
    ...(o.rotulo ? { rotulo: o.rotulo } : {}),
    cabecera: [o.parametro ?? "Parámetro", "Norma", "Proyecto", "Cumple"],
    columnas: COLUMNAS_NORMA,
    filas: filas.map(([p, n, pr, c]) => [p, n, pr, cumpleTexto(c)]),
    ...(o.notas && o.notas.length > 0 ? { notas: o.notas } : {}),
    ...(o.tras !== undefined ? { tras: o.tras } : {}),
  };
}
