import type { JSX } from "react";
import { columnasDe, esNoCumple, notasNumeradas } from "../../lib/cte/memoria";
import type { TablaMemoria, TipoColumna } from "../../lib/cte/presentacion";

// =============================================================================
// Una tabla de la memoria en pantalla (feature-31), la misma en la pestaña
// Memoria del módulo y en la página de la memoria: rótulo, columnas alineadas
// por su tipo («Norma | Proyecto» centradas, cifras a la derecha), «No cumple»
// resaltado y las notas numeradas debajo.
// =============================================================================

const ALINEA: Record<TipoColumna, string> = {
  texto: "text-left",
  dato: "text-right",
  norma: "text-center",
  proyecto: "text-center",
  cumple: "text-center",
};

interface Props {
  tabla: TablaMemoria;
  /** Lo que se aplica a cada celda y nota antes de pintarla (la página quita los «supuestos»). */
  limpiar?: (t: string) => string;
}

export function TablaMemoriaVista({ tabla, limpiar = (t) => t }: Props): JSX.Element {
  const tipos = columnasDe(tabla);
  return (
    <div className="mt-1.5 mb-3">
      {tabla.rotulo && <p className="mb-1 text-[12.5px] font-semibold">{tabla.rotulo}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {tabla.cabecera.map((c, i) => (
              <th
                key={i}
                scope="col"
                className={`border-border-main text-text-secondary border-b p-1.5 text-[10px] font-semibold tracking-[0.05em] uppercase ${ALINEA[tipos[i]]}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((f, k) => (
            <tr key={k}>
              {f.map((c, i) => (
                <td
                  key={i}
                  className={`border-border-sub border-b p-1.5 ${ALINEA[tipos[i]]} ${tipos[i] === "texto" ? "text-[12.5px]" : "font-mono text-[11.5px]"} ${tipos[i] === "cumple" && esNoCumple(c) ? "text-state-fail font-semibold" : ""}`}
                >
                  {limpiar(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {tabla.notas?.length ? (
        <ol className="text-text-secondary mt-1 list-none text-[11px] leading-snug">
          {notasNumeradas(tabla.notas).map((n, i) => (
            <li key={i}>{limpiar(n)}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
