import type { JSX } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { antesDeEntregar, type PendienteEntrega } from "../../lib/obra/entrega";
import { CLAVE_COHERENCIA, coherencia } from "../../lib/obra/coherencia";
import { useEstudio } from "../../lib/estudio/useEstudio";
import { RotuloSeccion } from "./LoQueSeJustifica";

// =============================================================================
// «Antes de entregar» (feature-16 §C): lo que no cumple, en rojo, y los avisos
// sin revisar, en ámbar, con el código de su módulo y el texto que redacta el
// módulo. Cada uno lleva al módulo, que es donde se ve en el dibujo y se marca
// como revisado o se arregla. Sin datos del estudio, un aviso más: la memoria
// sale sin cabecera (feature-29). Los de coherencia entre apartados
// (feature-36, paso 6) no son de un módulo: llevan a cada apartado que no
// coincide y se marcan como revisados aquí.
// =============================================================================

const CAJA =
  "hover:brightness-[0.98] focus-visible:outline-accent flex items-start gap-2 rounded border px-3 py-[9px] text-[12.5px] leading-[1.45] transition focus-visible:outline-2";
const ROJO =
  "border-state-fail/40 bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))]";
const AMBAR =
  "border-state-warn/40 bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]";

export function AntesDeEntregar(): JSX.Element {
  const { proyecto, actualizarDatosGenerales } = useProyecto();
  const pendientes = antesDeEntregar(proyecto);
  const [estudio] = useEstudio();
  const sinEstudio = estudio.firmantes.length === 0;
  const dg = proyecto.datosGenerales;
  const vigentes = new Set(coherencia(proyecto).map((a) => a.id));
  const revisadas = (dg.coherenciaRevisada ?? []).filter((id) => vigentes.has(id));
  const revisar = (ids: string[]) => {
    const { coherenciaRevisada: _r, ...resto } = dg;
    actualizarDatosGenerales(ids.length > 0 ? { ...resto, coherenciaRevisada: ids } : resto, new Date().toISOString());
  };

  return (
    <section aria-label="Antes de entregar">
      <RotuloSeccion>Antes de entregar</RotuloSeccion>
      {sinEstudio && (
        <Link to="/" className={`${CAJA} ${AMBAR} text-text-primary mb-2`}>
          <AlertTriangle size={14} className="text-state-warn mt-0.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="sr-only">Por revisar: </span>
            <b className="font-semibold">Documento</b> · Sin datos del estudio.{" "}
            <span className="text-text-secondary">La memoria sale sin cabecera: añade en Inicio, en «Tu estudio», quién firma.</span>
          </span>
        </Link>
      )}
      {pendientes.length === 0 ? (
        <p className="border-border-main bg-bg-primary text-text-secondary flex items-start gap-2 rounded border px-3 py-[9px] text-[12.5px]">
          <CheckCircle2 size={14} className="text-state-ok mt-0.5 shrink-0" aria-hidden="true" />
          Nada pendiente: todo lo justificado cumple y está revisado.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pendientes.map((x) => {
            if (x.key === CLAVE_COHERENCIA) {
              return (
                <li key={x.id}>
                  <AvisoCoherencia x={x} onRevisar={() => revisar([...revisadas, x.id.slice(CLAVE_COHERENCIA.length + 1)])} />
                </li>
              );
            }
            const fallo = x.tipo === "no_cumple";
            const contenido = (
              <>
                {fallo ? (
                  <XCircle size={14} className="text-state-fail mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={14} className="text-state-warn mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="sr-only">{fallo ? "No cumple: " : "Por revisar: "}</span>
                  <b className="font-semibold">{x.codigo}</b> · {x.titulo}{" "}
                  <span className="text-text-secondary">{x.detalle}</span>
                </span>
              </>
            );
            return (
              <li key={x.id}>
                {x.ruta ? (
                  <Link to={x.ruta} className={`${CAJA} ${fallo ? ROJO : AMBAR} text-text-primary`}>
                    {contenido}
                  </Link>
                ) : (
                  <div className={`${CAJA} ${fallo ? ROJO : AMBAR} text-text-primary`}>{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {revisadas.length > 0 && (
        <p className="text-text-secondary mt-2 text-[12px]">
          {revisadas.length === 1 ? "1 aviso de coherencia revisado." : `${revisadas.length} avisos de coherencia revisados.`}{" "}
          <button type="button" onClick={() => revisar([])} className="text-accent hover:text-accent-hover">
            Volver a mostrar{revisadas.length === 1 ? "lo" : "los"}
          </button>
        </p>
      )}
    </section>
  );
}

/**
 * Dos apartados que no dicen lo mismo: en ámbar, con un enlace a cada uno y el
 * botón de revisado (como los avisos de los módulos).
 */
function AvisoCoherencia({ x, onRevisar }: { x: PendienteEntrega; onRevisar: () => void }): JSX.Element {
  return (
    <div className={`${CAJA} ${AMBAR} text-text-primary hover:brightness-100`}>
      <AlertTriangle size={14} className="text-state-warn mt-0.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="sr-only">Por revisar: </span>
        <b className="font-semibold">{x.codigo}</b> · {x.titulo} <span className="text-text-secondary">{x.detalle}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {(x.enlaces ?? []).map((e) =>
            e.ruta ? (
              <Link
                key={e.key}
                to={e.ruta}
                className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary focus-visible:outline-accent inline-flex h-7 items-center rounded border px-2.5 text-[12px] focus-visible:outline-2"
              >
                Ir a {e.codigo}
              </Link>
            ) : null,
          )}
          <button
            type="button"
            onClick={onRevisar}
            className="border-accent/50 bg-tint-accent text-accent h-7 rounded border px-2.5 text-[12px] font-medium"
          >
            Marcar como revisado
          </button>
        </span>
      </span>
    </div>
  );
}
