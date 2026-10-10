import { useState, type JSX } from "react";
import { Plus, Trash2 } from "lucide-react";
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
    <section aria-labelledby="tu-estudio" className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="tu-estudio" className="text-text-primary text-[13px] font-semibold tracking-wide uppercase">
          Tu estudio
        </h2>
        {!editando && (
          <button type="button" onClick={abrir} className="text-accent hover:text-accent-hover text-[12.5px] hover:underline">
            {vacio ? "Añadir" : "Editar"}
          </button>
        )}
      </div>

      {!editando && vacio && (
        <p className="border-border-sub bg-bg-surface text-text-secondary rounded border px-3 py-2 text-[12.5px] leading-snug">
          Quién firma y cómo se le localiza: va a la cabecera de la memoria y a la portada del anejo. Se guarda en este navegador, para todos
          los proyectos.
        </p>
      )}

      {!editando && !vacio && (
        <div className="border-border-sub bg-bg-surface rounded border px-3 py-2 text-[12.5px] leading-relaxed">
          {estudio.firmantes.map((f) => (
            <p key={f.id} className="text-text-primary">
              {f.nombre}
              {f.titulacion && <span className="text-text-secondary">, {f.titulacion}</span>}
              {f.colegiacion && <span className="text-text-disabled"> · {f.colegiacion}</span>}
            </p>
          ))}
          {(estudio.direccion || estudio.telefonos || estudio.correo) && (
            <p className="text-text-secondary">{[estudio.direccion, estudio.telefonos, estudio.correo].filter(Boolean).join(" · ")}</p>
          )}
        </div>
      )}

      {editando && (
        <div className="border-border-sub bg-bg-surface flex flex-col gap-4 rounded border px-3 py-3">
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
