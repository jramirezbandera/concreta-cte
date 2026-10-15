import { useState, type JSX } from "react";
import { Link } from "react-router";
import { Check, Copy, FileDown, FileText, Loader2 } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { useExportarMemoria } from "../components/obra/useExportarMemoria";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import { entregables } from "../lib/obra/entrega";
import {
  CAPITULOS,
  cuadroInicial,
  fuenteCorta,
  memoriaCte,
  sinSupuestos,
  textoPlanoMemoriaCte,
  type ApartadoMemoria,
  type BloqueMemoria,
  type Capitulo,
  type MemoriaCte,
} from "../lib/obra/memoria";
import type { MemoriaDoc } from "../lib/cte/presentacion";
import { piezasMemoria } from "../lib/cte/memoria";
import { TablaMemoriaVista } from "../components/justificacion/TablaMemoriaVista";
import { getJustificacion } from "../data/justificacionRegistry";

// =============================================================================
// La memoria CTE (feature-16 §E): todos los apartados del expediente, como
// salen en el Word y el PDF, para leerlos antes de entregar. Se revisa, no se
// edita: cada apartado lo redacta su módulo a partir del cálculo. Lo que no
// cumple se enseña con su motivo y no entra en lo que se descarga.
// =============================================================================

function Parrafos({ doc, remision }: { doc: MemoriaDoc; remision?: string }): JSX.Element {
  return (
    <>
      {piezasMemoria(doc).map((x, i) =>
        x.tipo === "tabla" ? (
          <TablaMemoriaVista key={i} tabla={x.t} limpiar={sinSupuestos} />
        ) : (
          <p key={i} className="mb-3">
            {x.p.map((t, j) =>
              typeof t === "string" ? (
                <span key={j}>{sinSupuestos(t)}</span>
              ) : (
                <span key={j} className="text-accent font-mono text-[12.5px]">
                  {sinSupuestos(t.v)}
                </span>
              ),
            )}
          </p>
        ),
      )}
      {remision && <p className="mb-3">{remision}</p>}
      {doc.fuente && <p className="text-text-disabled mb-1 font-mono text-[10.5px] leading-relaxed">{fuenteCorta(doc.fuente)}</p>}
    </>
  );
}

/** El tipo de obra y dónde se justifica cada exigencia, como abren el capítulo 3 el Word y el PDF (feature-29). */
function CuadroInicial({ m }: { m: MemoriaCte }): JSX.Element {
  return (
    <div className="mb-6">
      {cuadroInicial(m).map((b: BloqueMemoria, k) =>
        b.tipo === "tabla" ? (
          <table key={k} className="mt-1.5 mb-3 w-full border-collapse">
            <thead>
              <tr>
                {b.cabecera.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="border-border-main text-text-secondary border-b p-1.5 text-left text-[10px] font-semibold tracking-[0.05em] uppercase"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.filas.map((f, i) => (
                <tr key={i}>
                  {f.map((c, j) => (
                    <td key={j} className="border-border-sub border-b p-1.5 text-left text-[12px]">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : b.tipo === "parrafo" ? (
          <p key={k} className="mb-1">
            {b.texto}
          </p>
        ) : null,
      )}
    </div>
  );
}

function Apartado({ a, base }: { a: ApartadoMemoria; base: string }): JSX.Element {
  const ruta = getJustificacion(a.key)?.route;
  return (
    <section aria-label={a.encabezado} className="border-border-sub border-t pt-4 pb-2 first-of-type:border-t-0 first-of-type:pt-0">
      <div className={`mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${a.sinTitulo ? "justify-end" : "justify-between"}`}>
        {!a.sinTitulo && <h3 className="text-[14px] font-semibold">{a.encabezado}</h3>}
        {ruta && (
          <Link to={`${base}/${ruta}`} className="text-accent hover:text-accent-hover text-[11.5px] hover:underline">
            Abrir {a.codigo}
          </Link>
        )}
      </div>
      {(a.tipo === "redactado" || a.tipo === "no_cumple" || a.tipo === "externo") && a.alcance && (
        <div className="border-accent/40 mb-2 border-l-2 pl-2.5">
          <p className="text-[12.5px]">{a.alcance.parrafo}</p>
          {a.alcance.cita && <p className="text-text-disabled mt-0.5 font-mono text-[10.5px]">{a.alcance.cita}</p>}
        </div>
      )}
      {a.tipo === "redactado" && (
        <>
          {a.porRevisar > 0 && (
            <p className="text-state-warn mb-2 text-[12px]">
              {a.porRevisar === 1 ? "Queda 1 cosa por revisar" : `Quedan ${a.porRevisar} cosas por revisar`} en {a.codigo}: el texto ya entra en la
              memoria.
            </p>
          )}
          <Parrafos doc={a.doc} {...(a.remision ? { remision: a.remision } : {})} />
        </>
      )}
      {a.tipo === "no_cumple" && (
        <div className="border-state-fail/40 rounded border bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))] px-3 py-2 text-[12.5px]">
          <p className="text-state-fail font-medium">No cumple: no entra en el Word ni en el PDF hasta que se resuelva.</p>
          <ul className="text-text-secondary mt-1 list-disc pl-4">
            {a.motivos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {a.tipo === "no_aplica" && (
        <>
          <p className="mb-1.5">{a.parrafo}</p>
          {a.cita && <p className="text-text-disabled font-mono text-[10.5px]">{a.cita}</p>}
        </>
      )}
      {a.tipo === "externo" && (
        <p>
          Se justifica con {a.destino}.{" "}
          {a.referencia ? (
            <>
              Documento de referencia: <span className="font-mono text-[12.5px]">{a.referencia}</span>.
            </>
          ) : (
            <span className="text-state-warn">Pendiente de adjuntar el documento (desde La obra).</span>
          )}
        </p>
      )}
    </section>
  );
}

export function MemoriaPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  const { proyecto } = useProyecto();
  const m = memoriaCte(proyecto);
  const r = entregables(proyecto).memoria;
  const exportar = useExportarMemoria();
  const [copiado, setCopiado] = useState<"no" | "si" | "error">("no");

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoPlanoMemoriaCte(m));
      setCopiado("si");
    } catch {
      setCopiado("error");
    }
  };

  // Los apartados, agrupados por capítulo y por DB como en el documento.
  const grupos: { capitulo: Capitulo; grupo: string; apartados: ApartadoMemoria[] }[] = [];
  for (const a of m.apartados) {
    const g = grupos.at(-1);
    if (g?.grupo === a.grupo) g.apartados.push(a);
    else grupos.push({ capitulo: a.capitulo, grupo: a.grupo, apartados: [a] });
  }

  const BOTON =
    "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[12.5px] disabled:cursor-wait disabled:opacity-60";

  return (
    <>
      <Topbar moduleLabel="Memoria CTE" moduleGroup="Proyecto" onMenuOpen={openDrawer} />
      <div className="bg-bg-surface scroll-hide flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[780px] px-4 pt-6 pb-16 sm:px-6">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-text-primary text-[20px] leading-tight font-semibold">{m.titulo}</h1>
              <p className="text-text-secondary text-[12.5px]">
                <span className={r.listos === r.total ? "text-state-ok" : ""}>
                  {r.listos} de {r.total} apartados listos
                </span>
                {r.noCumplen.length > 0 && <span className="text-state-fail"> · {r.noCumplen.join(" · ")} no cumple</span>}
                {" · "}se redacta sola a partir del cálculo: se revisa, no se edita.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => void copiar()} className={BOTON}>
                {copiado === "si" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copiado === "si" ? "Copiado" : "Copiar todo"}
              </button>
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
              <span role="status" className="sr-only">
                {copiado === "si" ? "Memoria copiada" : copiado === "error" ? "No se pudo copiar la memoria" : ""}
              </span>
            </div>
          </header>

          <article className="border-border-main bg-bg-primary text-text-primary rounded-md border px-5 pt-6 pb-5 text-[13.5px] leading-[1.65] sm:px-8">
            {grupos.map((g, i) => (
              <div key={g.grupo} className="mb-6 last:mb-2">
                {g.capitulo !== grupos[i - 1]?.capitulo && (
                  <>
                    <p className="text-text-primary mb-4 text-[15px] font-semibold">
                      {g.capitulo}. {CAPITULOS[g.capitulo]}
                    </p>
                    {g.capitulo === 3 && <CuadroInicial m={m} />}
                  </>
                )}
                <h2 className="text-text-disabled border-border-main mb-4 border-b pb-1.5 text-[10.5px] font-semibold tracking-[0.09em] uppercase">
                  {g.grupo}
                </h2>
                {g.apartados.map((a) => (
                  <Apartado key={a.key} a={a} base={`/p/${proyecto.id}`} />
                ))}
              </div>
            ))}
            {m.pendientes.length > 0 && (
              <div className="border-border-main mt-2 border-t pt-4">
                <h2 className="text-text-disabled mb-2 text-[10.5px] font-semibold tracking-[0.09em] uppercase">
                  Apartados pendientes
                </h2>
                <p className="text-text-secondary text-[12.5px]">
                  Aún sin redactar: {m.pendientes.map((x) => `${x.codigo} ${x.label}`).join(" · ")}.
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
      {exportar.modal}
    </>
  );
}
