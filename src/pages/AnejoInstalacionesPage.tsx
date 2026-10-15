import type { JSX } from "react";
import { Link } from "react-router";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { useExportarAnejoInstalaciones } from "../components/obra/useExportarMemoria";
import { TablaMemoriaVista } from "../components/justificacion/TablaMemoriaVista";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import { entregables } from "../lib/obra/entrega";
import { anejoInstalaciones, bloquesAnejoInstalaciones, type ApartadoAnejo } from "../lib/obra/anejoInstalaciones";
import type { BloqueMemoria } from "../lib/obra/memoria";
import { getJustificacion } from "../data/justificacionRegistry";

// =============================================================================
// El anejo de instalaciones del edificio (feature-33): el cálculo extenso de
// fontanería, saneamiento y electricidad, como sale en el Word y el PDF, para
// leerlo antes de entregar. Como la memoria, se revisa, no se edita.
// =============================================================================

function Bloque({ b }: { b: BloqueMemoria }): JSX.Element {
  switch (b.tipo) {
    case "titulo":
      return b.nivel === 3 ? <h4 className="mt-4 mb-1.5 text-[13px] font-semibold">{b.texto}</h4> : <></>;
    case "parrafo":
      return <p className="mb-3">{b.texto}</p>;
    case "nota":
      return <p className="text-text-disabled mb-1 font-mono text-[10.5px] leading-relaxed">{b.texto}</p>;
    case "pendiente":
      return <p className="text-state-warn mb-2 text-[12.5px] font-medium">{b.texto}</p>;
    case "tabla":
      return <TablaMemoriaVista tabla={b} />;
  }
}

function Apartado({ a, base }: { a: ApartadoAnejo; base: string }): JSX.Element {
  const ruta = getJustificacion(a.key)?.route;
  // Los bloques del apartado, sin el H2, que ya pinta la sección.
  const todos = bloquesAnejoInstalaciones({ titulo: "", proyecto: "", apartados: [a] });
  const propios = todos.slice(todos.findIndex((b) => b.tipo === "titulo" && b.nivel === 2) + 1);
  return (
    <section aria-label={a.encabezado} className="border-border-sub border-t pt-4 pb-2 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-[14px] font-semibold">{a.encabezado}</h3>
        {ruta && (
          <Link to={`${base}/${ruta}`} className="text-accent hover:text-accent-hover text-[11.5px] hover:underline">
            Abrir {a.codigo}
          </Link>
        )}
      </div>
      {a.tipo === "calculado" && a.porRevisar > 0 && (
        <p className="text-state-warn mb-2 text-[12px]">
          {a.porRevisar === 1 ? "Queda 1 cosa por revisar" : `Quedan ${a.porRevisar} cosas por revisar`} en {a.codigo}.
        </p>
      )}
      {propios.map((b, i) => (
        <Bloque key={i} b={b} />
      ))}
    </section>
  );
}

export function AnejoInstalacionesPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  const { proyecto } = useProyecto();
  const a = anejoInstalaciones(proyecto);
  const r = entregables(proyecto).instalaciones;
  const exportar = useExportarAnejoInstalaciones();
  const intro = bloquesAnejoInstalaciones(a).find((b): b is Extract<BloqueMemoria, { tipo: "parrafo" }> => b.tipo === "parrafo");

  const BOTON =
    "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[12.5px] disabled:cursor-wait disabled:opacity-60";

  return (
    <>
      <Topbar moduleLabel="Anejo de instalaciones" moduleGroup="Proyecto" onMenuOpen={openDrawer} />
      <div className="bg-bg-surface scroll-hide flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[860px] px-4 pt-6 pb-16 sm:px-6">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-text-primary text-[20px] leading-tight font-semibold">{a.titulo}</h1>
              <p className="text-text-secondary text-[12.5px]">
                <span className={r.listos === r.total ? "text-state-ok" : ""}>
                  {r.listos} de {r.total} instalaciones listas
                </span>
                {r.noCumplen.length > 0 && <span className="text-state-fail"> · {r.noCumplen.join(" · ")} no cumple</span>}
                {" · "}sale del mismo cálculo que la memoria.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={exportar.word} disabled={exportar.ocupado !== null} className={BOTON}>
                {exportar.ocupado === "word" ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <FileText size={13} aria-hidden="true" />}
                Word
              </button>
              <button
                type="button"
                onClick={exportar.pdf}
                disabled={exportar.ocupado !== null}
                className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg inline-flex h-8 items-center gap-1.5 rounded px-3 text-[12.5px] font-medium disabled:cursor-wait disabled:opacity-60"
              >
                {exportar.ocupado === "pdf" ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <FileDown size={13} aria-hidden="true" />}
                PDF
              </button>
            </div>
          </header>

          <article className="border-border-main bg-bg-primary text-text-primary rounded-md border px-5 pt-6 pb-5 text-[13.5px] leading-[1.65] sm:px-8">
            {intro && <p className="mb-6">{intro.texto}</p>}
            {a.apartados.map((ap) => (
              <Apartado key={ap.key} a={ap} base={`/p/${proyecto.id}`} />
            ))}
          </article>
        </div>
      </div>
      {exportar.modal}
    </>
  );
}
