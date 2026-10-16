import type { JSX, KeyboardEvent, ReactNode } from "react";

// =============================================================================
// «Para el anejo» (feature-33, paso 4): lo que solo usa el anejo de
// instalaciones y la frase con que la memoria remite a él. Los planos de la
// instalación («I05–I07») y, en HS 4, el Ø del contador de la compañía y la
// ida del ACS. Todo opcional: vacío, el anejo dice de dónde sale la cifra.
// Se escribe a mano y se confirma al salir o con Enter; Escape lo deshace.
// =============================================================================

const INPUT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-8 rounded border px-2 text-[13px] focus:outline-none";

function confirmarConTeclas(e: KeyboardEvent<HTMLInputElement>, original: string): void {
  if (e.key === "Enter") e.currentTarget.blur();
  if (e.key === "Escape") {
    e.currentTarget.value = original;
    e.currentTarget.blur();
  }
}

/** Una fila: etiqueta y control, y debajo lo que pasa si se deja vacío. */
function Fila({ id, etiqueta, control, ayuda }: { id: string; etiqueta: string; control: ReactNode; ayuda: string }): JSX.Element {
  return (
    <div className="border-border-sub border-t pt-3 pb-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-text-primary text-[13px] font-medium">
          {etiqueta}
        </label>
        {control}
      </div>
      <p className="text-text-secondary mt-1.5 text-[12px] leading-normal">{ayuda}</p>
    </div>
  );
}

/** Texto libre; vacío es `undefined`. */
export function CampoPlanos({ id, valor, onChange, ayuda }: { id: string; valor: string | undefined; onChange: (v: string | undefined) => void; ayuda: string }): JSX.Element {
  const original = valor ?? "";
  return (
    <Fila
      id={id}
      etiqueta="Planos"
      ayuda={ayuda}
      control={
        <input
          key={original}
          id={id}
          type="text"
          defaultValue={original}
          placeholder="I05–I07"
          onBlur={(e) => {
            const v = e.currentTarget.value.trim();
            if (v !== original) onChange(v === "" ? undefined : v);
          }}
          onKeyDown={(e) => confirmarConTeclas(e, original)}
          className={`${INPUT} w-[132px]`}
        />
      }
    />
  );
}

function formato(v: number | undefined): string {
  return v === undefined ? "" : String(v).replace(".", ",");
}

/** Un número opcional con su unidad; vacío es `undefined`. */
export function CampoNumeroOpcional(props: {
  id: string;
  etiqueta: string;
  valor: number | undefined;
  unidad: string;
  onChange: (v: number | undefined) => void;
  ayuda: string;
}): JSX.Element {
  const { id, etiqueta, valor, unidad, onChange, ayuda } = props;
  const original = formato(valor);
  return (
    <Fila
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      control={
        <span className="inline-flex h-8 items-stretch">
          <input
            key={original}
            id={id}
            type="text"
            inputMode="decimal"
            defaultValue={original}
            placeholder="—"
            onBlur={(e) => {
              const t = e.currentTarget.value.trim().replace(",", ".");
              if (t === "") {
                if (valor !== undefined) onChange(undefined);
                return;
              }
              const n = Number(t);
              if (!Number.isFinite(n) || n <= 0) e.currentTarget.value = original;
              else if (n !== valor) onChange(n);
            }}
            onKeyDown={(e) => confirmarConTeclas(e, original)}
            className={`${INPUT} w-[76px] rounded-r-none text-right font-mono tabular-nums`}
          />
          <span className="border-border-main bg-bg-elevated text-text-secondary flex items-center rounded-r border border-l-0 px-2 font-mono text-[11px]">
            {unidad}
          </span>
        </span>
      }
    />
  );
}

/** Una elección entre pocas opciones (feature-34: la climatización, la DI enterrada…). */
export function CampoOpciones<T extends string>(props: {
  id: string;
  etiqueta: string;
  valor: T;
  opciones: { valor: T; label: string }[];
  onChange: (v: T) => void;
  ayuda: string;
}): JSX.Element {
  const { id, etiqueta, valor, opciones, onChange, ayuda } = props;
  return (
    <Fila
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      control={
        <select id={id} value={valor} onChange={(e) => onChange(e.currentTarget.value as T)} className={`${INPUT} max-w-[200px]`}>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.label}
            </option>
          ))}
        </select>
      }
    />
  );
}

/** La sección, con su rótulo, debajo de las decisiones. */
export function ParaElAnejo({ children }: { children: ReactNode }): JSX.Element {
  return (
    <section aria-label="Para el anejo" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Para el anejo</div>
      {children}
    </section>
  );
}
