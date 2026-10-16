import type { JSX } from "react";
import type { ResumenProyecto } from "../../lib/proyecto/progreso";

// =============================================================================
// Barra de progreso del expediente, por tramos: cumplen · no cumplen · en curso
// sobre las justificaciones aplicables; lo que falta queda en el fondo.
// =============================================================================

export function BarraJustificaciones({
  resumen: r,
  ancho = "w-full",
}: {
  resumen: ResumenProyecto;
  ancho?: string;
}): JSX.Element {
  const total = Math.max(1, r.aplicables);
  const tramos = [
    { n: r.cumplen, cls: "bg-state-ok" },
    { n: r.noCumplen, cls: "bg-state-fail" },
    { n: r.enCurso, cls: "bg-state-warn" },
  ].filter((t) => t.n > 0);
  const partes = [
    `${r.cumplen} de ${r.aplicables} justificaciones cumplen`,
    r.noCumplen > 0 ? `${r.noCumplen} no cumplen` : null,
    r.enCurso > 0 ? `${r.enCurso} en curso` : null,
  ].filter(Boolean);

  return (
    <div
      className={`bg-bg-elevated flex h-1.5 ${ancho} gap-px overflow-hidden rounded-full`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={r.aplicables}
      aria-valuenow={r.cumplen}
      aria-label={partes.join(", ")}
    >
      {tramos.map((t) => (
        <div
          key={t.cls}
          className={`${t.cls} h-full first:rounded-l-full last:rounded-r-full`}
          style={{ width: `${(t.n / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

/** «25/25 justificadas · 1 no cumple · 2 en curso», con color en lo que pide atención. */
export function LeyendaJustificaciones({ resumen: r }: { resumen: ResumenProyecto }): JSX.Element {
  return (
    <span className="text-text-secondary text-[12px] whitespace-nowrap tabular-nums">
      <span className="text-text-primary font-medium">
        {r.cumplen}/{r.aplicables}
      </span>{" "}
      justificadas
      {r.noCumplen > 0 && (
        <span className="text-state-fail">
          {" "}
          · {r.noCumplen} no cumple{r.noCumplen === 1 ? "" : "n"}
        </span>
      )}
      {r.enCurso > 0 && <span className="text-state-warn"> · {r.enCurso} en curso</span>}
    </span>
  );
}
