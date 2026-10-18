import type { JSX } from "react";
import { Link } from "react-router";
import { AlertTriangle, FileDown, FileText, Loader2, XCircle } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { useExportarEstudioBasico } from "../components/obra/useExportarMemoria";
import { TablaMemoriaVista } from "../components/justificacion/TablaMemoriaVista";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import { useEstudio } from "../lib/estudio/useEstudio";
import { firmantesDe } from "../lib/estudio/estudio";
import { entregables, RUTA_SEGURIDAD_SALUD } from "../lib/obra/entrega";
import { estudioBasico, type ApartadoEstudio } from "../lib/obra/estudioBasico";
import type { BloqueMemoria } from "../lib/obra/memoria";

// =============================================================================
// El estudio básico de seguridad y salud (feature-35, paso 6), como sale en el
// Word y el PDF, para leerlo antes de entregar. Como la memoria y el anejo, se
// revisa, no se edita: los datos y las fichas están en la pantalla «Seguridad
// y salud», a la que lleva cada pendiente.
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

function Apartado({ a }: { a: ApartadoEstudio }): JSX.Element {
  const titulo = a.numero === 0 ? a.titulo : `${a.numero}. ${a.titulo}`;
  return (
    <section aria-label={titulo} className="border-border-sub border-t pt-4 pb-2 first-of-type:border-t-0 first-of-type:pt-0">
      <h3 className="mb-2 text-[14px] font-semibold">{titulo}</h3>
      {a.bloques.map((b, i) => (
        <Bloque key={i} b={b} />
      ))}
    </section>
  );
}

export function EstudioBasicoPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  const { proyecto } = useProyecto();
  const [estudio] = useEstudio();
  const e = estudioBasico(proyecto, { firmantes: firmantesDe(estudio, proyecto) });
  const r = entregables(proyecto).seguridadSalud;
  const exportar = useExportarEstudioBasico();
  const completo = e.art4.resultado === "completo";

  const BOTON =
    "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[12.5px] disabled:cursor-wait disabled:opacity-60";

  return (
    <>
      <Topbar moduleLabel="Estudio básico de seguridad y salud" moduleGroup="Proyecto" onMenuOpen={openDrawer} />
      <div className="bg-bg-surface scroll-hide flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[860px] px-4 pt-6 pb-16 sm:px-6">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-text-primary text-[20px] leading-tight font-semibold">{e.titulo}</h1>
              <p className="text-text-secondary text-[12.5px]">
                {completo ? (
                  <span className="text-state-fail">Hace falta el estudio completo</span>
                ) : (
                  <span className={r.listos === r.total ? "text-state-ok" : ""}>
                    {r.listos} de {r.total} apartados listos
                  </span>
                )}
                {" · "}
                <Link to={`/p/${proyecto.id}/${RUTA_SEGURIDAD_SALUD}`} className="text-accent hover:text-accent-hover hover:underline">
                  Datos y fichas
                </Link>
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

          {e.pendientes.length > 0 && (
            <aside
              aria-label="Lo que falta"
              className={[
                "mb-4 rounded border px-3.5 py-3 text-[12.5px] leading-normal",
                completo
                  ? "border-state-fail/40 bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))]"
                  : "border-state-warn/40 bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]",
              ].join(" ")}
            >
              <h2 className="text-text-primary mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold">
                {completo ? (
                  <XCircle size={14} className="text-state-fail" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={14} className="text-state-warn" aria-hidden="true" />
                )}
                {completo ? "El estudio básico no vale" : e.pendientes.length === 1 ? "Falta 1 cosa" : `Faltan ${e.pendientes.length} cosas`}
              </h2>
              <ul className="text-text-secondary list-disc pl-5">
                {e.pendientes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </aside>
          )}

          <article className="border-border-main bg-bg-primary text-text-primary rounded-md border px-5 pt-6 pb-5 text-[13.5px] leading-[1.65] sm:px-8">
            {e.apartados.map((a) => (
              <Apartado key={a.numero} a={a} />
            ))}
          </article>
        </div>
      </div>
      {exportar.modal}
    </>
  );
}
