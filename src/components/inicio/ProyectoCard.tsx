import type { JSX } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Copy,
  FileDown,
  FolderOpen,
  MapPin,
  Trash2,
} from "lucide-react";
import { etiquetaEdificio } from "../../lib/edificio/derivar";
import { BarraJustificaciones, LeyendaJustificaciones } from "./BarraJustificaciones";
import { EdificioMini } from "./EdificioMini";
import { MenuProyecto, type AccionMenu } from "./MenuProyecto";
import {
  cifrasEdificio,
  estadoExpediente,
  etiquetaEstado,
  fechaRelativa,
  formatearFecha,
  INTERVENCION_LABEL,
  porcentaje,
  type EstadoExpediente,
  type FilaProyecto,
} from "./inicio";

// =============================================================================
// Un proyecto en Inicio, en tarjeta (vista por defecto) o en fila (vista de
// lista). Toda la tarjeta abre el proyecto (enlace estirado); el menú «⋯» queda
// por encima con las acciones.
// =============================================================================

export interface AccionesProyecto {
  /** Marca el proyecto como activo (al seguir el enlace). */
  onAbrir: () => void;
  /** Abre el proyecto desde el menú. */
  onIr: () => void;
  onDuplicar: () => void;
  onExportar: () => void;
  onEliminar: () => void;
}

const ESTADO_UI: Record<EstadoExpediente, { cls: string; icono: JSX.Element }> = {
  todo_justificado: {
    cls: "bg-tint-ok text-state-ok",
    icono: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  incumple: {
    cls: "bg-tint-fail text-state-fail",
    icono: <AlertTriangle size={12} aria-hidden="true" />,
  },
  en_curso: {
    cls: "bg-tint-warn text-state-warn",
    icono: <Clock size={12} aria-hidden="true" />,
  },
  sin_empezar: {
    cls: "bg-tint-neutral text-state-neutral",
    icono: <CircleDashed size={12} aria-hidden="true" />,
  },
};

function EstadoChip({ fila }: { fila: FilaProyecto }): JSX.Element {
  const e = estadoExpediente(fila.resumen);
  const ui = ESTADO_UI[e];
  return (
    <span
      className={`${ui.cls} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap`}
    >
      {ui.icono}
      {etiquetaEstado(e, fila.resumen)}
    </span>
  );
}

function acciones(a: AccionesProyecto): AccionMenu[] {
  return [
    {
      label: "Abrir",
      icono: <FolderOpen size={14} aria-hidden="true" />,
      onSelect: a.onIr,
    },
    {
      label: "Duplicar",
      icono: <Copy size={14} aria-hidden="true" />,
      onSelect: a.onDuplicar,
    },
    {
      label: "Exportar como .json",
      icono: <FileDown size={14} aria-hidden="true" />,
      onSelect: a.onExportar,
    },
    {
      label: "Eliminar",
      icono: <Trash2 size={14} aria-hidden="true" />,
      onSelect: a.onEliminar,
      peligro: true,
    },
  ];
}

function lugar(f: FilaProyecto): string {
  const { municipio, provincia } = f.proyecto.datosGenerales;
  if (!municipio) return "Sin emplazamiento";
  return provincia && provincia !== municipio ? `${municipio}, ${provincia}` : municipio;
}

interface Props extends AccionesProyecto {
  fila: FilaProyecto;
  ahora: Date;
}

export function ProyectoCard({ fila, ahora, ...a }: Props): JSX.Element {
  const p = fila.proyecto;
  const cifras = cifrasEdificio(fila.edificio);
  return (
    <article
      className={[
        "group border-border-sub bg-bg-primary relative flex flex-col rounded-xl border transition-all",
        "hover:border-border-main hover:shadow-lg hover:shadow-black/5 motion-safe:hover:-translate-y-0.5",
        "has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-2",
      ].join(" ")}
    >
      <div
        className="border-border-sub bg-bg-surface relative h-28 rounded-t-xl border-b"
        style={{
          backgroundImage: "radial-gradient(var(--color-dot-grid) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      >
        <div className="absolute inset-x-0 top-3 bottom-0 overflow-hidden rounded-t-xl">
          <EdificioMini edificio={fila.edificio} />
        </div>
        <div className="absolute top-2.5 left-3">
          <EstadoChip fila={fila} />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <MenuProyecto nombre={p.nombre} acciones={acciones(a)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="text-text-primary text-[15px] leading-snug font-semibold">
            <Link
              to={`/p/${p.id}`}
              onClick={a.onAbrir}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {p.nombre}
            </Link>
          </h3>
          <p className="text-text-secondary mt-1 flex items-center gap-1 text-[12.5px]">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{lugar(fila)}</span>
          </p>
        </div>

        <p className="text-text-secondary text-[12.5px] leading-snug">
          {etiquetaEdificio(fila.edificio)} · {INTERVENCION_LABEL[p.datosGenerales.intervencion]}
        </p>

        {cifras.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="El edificio en cifras">
            {cifras.map((c) => (
              <li
                key={c}
                className="bg-bg-elevated text-text-secondary rounded px-1.5 py-0.5 text-[11.5px] tabular-nums"
              >
                {c}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <LeyendaJustificaciones resumen={fila.resumen} />
            <span className="text-text-primary text-[12px] font-medium tabular-nums">{porcentaje(fila.resumen)} %</span>
          </div>
          <BarraJustificaciones resumen={fila.resumen} />
        </div>
      </div>

      <footer className="border-border-sub text-text-disabled flex items-center gap-1.5 border-t px-4 py-2 text-[11.5px]">
        <Clock size={11} aria-hidden="true" />
        <time dateTime={p.modificado} title={formatearFecha(p.modificado)}>
          Editado {fechaRelativa(p.modificado, ahora)}
        </time>
      </footer>
    </article>
  );
}

export function ProyectoFila({ fila, ahora, ...a }: Props): JSX.Element {
  const p = fila.proyecto;
  return (
    <li className="group border-border-sub hover:bg-bg-surface has-[a:focus-visible]:ring-accent relative flex items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-inset">
      <div className="border-border-sub bg-bg-surface hidden h-11 w-16 shrink-0 overflow-hidden rounded-md border sm:block">
        <EdificioMini edificio={fila.edificio} lienzo={150} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-text-primary truncate text-[13.5px] font-semibold">
          <Link
            to={`/p/${p.id}`}
            onClick={a.onAbrir}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {p.nombre}
          </Link>
        </h3>
        <p className="text-text-secondary truncate text-[12px]">
          {lugar(fila)} · {etiquetaEdificio(fila.edificio)} · {INTERVENCION_LABEL[p.datosGenerales.intervencion]}
        </p>
      </div>
      <div className="hidden w-52 shrink-0 flex-col gap-1.5 md:flex">
        <LeyendaJustificaciones resumen={fila.resumen} />
        <BarraJustificaciones resumen={fila.resumen} />
      </div>
      <div className="hidden w-40 shrink-0 lg:block">
        <EstadoChip fila={fila} />
      </div>
      <time
        dateTime={p.modificado}
        title={formatearFecha(p.modificado)}
        className="text-text-disabled hidden w-24 shrink-0 text-right text-[12px] sm:block"
      >
        {fechaRelativa(p.modificado, ahora)}
      </time>
      <div className="relative z-10 shrink-0">
        <MenuProyecto nombre={p.nombre} acciones={acciones(a)} />
      </div>
    </li>
  );
}
