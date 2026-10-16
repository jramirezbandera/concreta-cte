import { useState, type JSX } from "react";
import { Pencil, PenLine, Plus, Trash2 } from "lucide-react";
import { InputLabel } from "../ui/InputLabel";
import { showToast } from "../ui/Toast";
import { useEstudio } from "../../lib/estudio/useEstudio";
import type { Estudio, Firmante } from "../../lib/estudio/estudio";

// =============================================================================
// «Tu estudio» en Inicio (feature-29): quién firma y cómo se le localiza. Va a
// la cabecera del Word y del PDF de la memoria y a la portada del anejo. Se
// guarda en este navegador, para todos los proyectos.
// =============================================================================

const INPUT_CLS =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent " +
  "focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] " +
  "transition-colors focus:ring-1 focus:outline-none";

/** Personas que se pueden guardar en el estudio; en cada proyecto firman una o dos. */
const MAX_PERSONAS = 4;

function nuevaPersona(): Firmante {
  return { id: crypto.randomUUID(), nombre: "", titulacion: "", colegiacion: "" };
}

/** «Ana Pérez» → «AP», para el avatar del firmante. */
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "")).toUpperCase() || "·";
}

function Campo(props: { id: string; label: string; valor: string; placeholder?: string; onChange: (v: string) => void }): JSX.Element {
  return (
    <div className="min-w-0">
      <InputLabel htmlFor={props.id} label={props.label} />
      <input
        id={props.id}
        type="text"
        value={props.valor}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className={`${INPUT_CLS} mt-1`}
      />
    </div>
  );
}

export function TuEstudio(): JSX.Element {
  const [estudio, guardar] = useEstudio();
  const vacio = estudio.firmantes.length === 0;
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Estudio>(estudio);

  const abrir = () => {
    setBorrador(estudio.firmantes.length > 0 ? estudio : { ...estudio, firmantes: [nuevaPersona()] });
    setEditando(true);
  };

  const persona = (i: number, cambio: Partial<Firmante>) =>
    setBorrador((b) => ({ ...b, firmantes: b.firmantes.map((f, k) => (k === i ? { ...f, ...cambio } : f)) }));

  const onGuardar = () => {
    guardar(borrador);
    setEditando(false);
    showToast("Datos del estudio guardados.", { autoDismiss: 3000 });
  };

  return (
    <section aria-labelledby="tu-estudio" className="border-border-sub bg-bg-surface mt-10 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="bg-tint-accent text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <PenLine size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 basis-56">
          <h2 id="tu-estudio" className="text-text-primary text-[15px] leading-tight font-semibold">
            Tu estudio
          </h2>
          <p className="text-text-secondary mt-0.5 text-[12.5px] leading-snug">
            Quién firma y cómo se le localiza: va a la cabecera de la memoria y a la portada del anejo. Se guarda en este navegador, para
            todos los proyectos.
          </p>
        </div>
        {!editando && (
          <button
            type="button"
            onClick={abrir}
            className={
              vacio
                ? "bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium"
                : "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium"
            }
          >
            {vacio ? <Plus size={14} aria-hidden="true" /> : <Pencil size={13} aria-hidden="true" />}
            {vacio ? "Añadir" : "Editar"}
          </button>
        )}
      </div>

      {!editando && !vacio && (
        <div className="mt-4 flex flex-col gap-3 sm:pl-12">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {estudio.firmantes.map((f) => (
              <li key={f.id} className="flex min-w-0 items-center gap-2.5">
                <span
                  className="bg-bg-elevated text-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                  aria-hidden="true"
                >
                  {iniciales(f.nombre)}
                </span>
                <span className="min-w-0 text-[12.5px] leading-tight">
                  <span className="text-text-primary block font-medium">{f.nombre}</span>
                  {(f.titulacion || f.colegiacion) && (
                    <span className="text-text-secondary block">{[f.titulacion, f.colegiacion].filter(Boolean).join(" · ")}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {(estudio.direccion || estudio.telefonos || estudio.correo) && (
            <p className="text-text-secondary text-[12.5px]">{[estudio.direccion, estudio.telefonos, estudio.correo].filter(Boolean).join(" · ")}</p>
          )}
        </div>
      )}

      {editando && (
        <div className="border-border-sub mt-4 flex flex-col gap-4 border-t pt-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-text-secondary mb-1 text-[12px]">
              Quién firma. En cada proyecto se elige una persona o dos; por defecto, la primera.
            </legend>
            {borrador.firmantes.map((f, i) => (
              <div key={f.id} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1.2fr_1fr_1.4fr_auto]">
                <Campo id={`est-nombre-${i}`} label="Nombre" valor={f.nombre} onChange={(v) => persona(i, { nombre: v })} />
                <Campo
                  id={`est-titulacion-${i}`}
                  label="Titulación"
                  valor={f.titulacion}
                  placeholder="Arquitecto"
                  onChange={(v) => persona(i, { titulacion: v })}
                />
                <Campo
                  id={`est-colegiacion-${i}`}
                  label="Colegiación, como debe salir"
                  valor={f.colegiacion ?? ""}
                  placeholder="Colegiado nº 1234 del COA Málaga"
                  onChange={(v) => persona(i, { colegiacion: v })}
                />
                <button
                  type="button"
                  onClick={() => setBorrador((b) => ({ ...b, firmantes: b.firmantes.filter((_, k) => k !== i) }))}
                  className="text-text-secondary hover:bg-tint-fail hover:text-state-fail flex h-[30px] items-center justify-center rounded px-2"
                  aria-label={`Quitar a ${f.nombre || "esta persona"}`}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            ))}
            {borrador.firmantes.length < MAX_PERSONAS && (
              <button
                type="button"
                onClick={() => setBorrador((b) => ({ ...b, firmantes: [...b.firmantes, nuevaPersona()] }))}
                className="text-accent hover:text-accent-hover flex items-center gap-1 self-start text-[12.5px]"
              >
                <Plus size={13} aria-hidden="true" />
                Añadir persona
              </button>
            )}
          </fieldset>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Campo
              id="est-direccion"
              label="Dirección"
              valor={borrador.direccion ?? ""}
              placeholder="C/ Cuarteles nº 47, 1º A. 29002 Málaga"
              onChange={(v) => setBorrador((b) => ({ ...b, direccion: v }))}
            />
            <Campo id="est-telefonos" label="Teléfonos" valor={borrador.telefonos ?? ""} onChange={(v) => setBorrador((b) => ({ ...b, telefonos: v }))} />
            <Campo id="est-correo" label="Correo" valor={borrador.correo ?? ""} onChange={(v) => setBorrador((b) => ({ ...b, correo: v }))} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onGuardar}
              className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg rounded px-3 py-1.5 text-[13px] font-medium"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="border-border-main text-text-secondary hover:text-text-primary rounded border px-3 py-1.5 text-[13px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
