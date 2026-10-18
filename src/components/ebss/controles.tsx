import type { JSX, ReactNode } from "react";
import { Opciones } from "../justificacion/Decision";

// =============================================================================
// Controles de la pantalla «Seguridad y salud» (feature-35, paso 6). Todo dato
// del estudio es opcional y sin valor por defecto (principio 4): un sí/no sin
// contestar no está pulsado, y un número vacío es «sin declarar», no un cero.
// Los campos de texto y número se aplican al salir o con Enter, como los de El
// edificio; Escape deshace.
// =============================================================================

/** «7.200,5» o «7200,5» → 7200.5; vacío → null; no numérico → NaN. */
function leerNumero(txt: string): number | null {
  const limpio = txt.trim().replace(/\s/g, "");
  if (limpio === "") return null;
  // Con coma decimal, los puntos son de millar; sin coma, también si van de tres
  // en tres («450.759» es 450759, como se escribe en español).
  const millares = limpio.includes(",") || /^\d{1,3}(\.\d{3})+$/.test(limpio);
  const n = Number(millares ? limpio.replace(/\./g, "").replace(",", ".") : limpio);
  return Number.isFinite(n) ? n : Number.NaN;
}

function formato(v: number | undefined, decimales: number): string {
  if (v === undefined) return "";
  return v.toLocaleString("es-ES", { maximumFractionDigits: decimales, useGrouping: false });
}

/** Sí / No, o ninguno pulsado si no se ha contestado. */
export function SiNo(props: {
  etiqueta: string;
  valor: boolean | undefined;
  onChange: (v: boolean) => void;
  si?: string;
  no?: string;
}): JSX.Element {
  const { etiqueta, valor, onChange, si = "Sí", no = "No" } = props;
  return (
    <div className="w-[150px] shrink-0">
      <Opciones<"si" | "no" | "">
        etiqueta={etiqueta}
        opciones={[
          { valor: "si", label: si },
          { valor: "no", label: no },
        ]}
        valor={valor === undefined ? "" : valor ? "si" : "no"}
        onChange={(v) => onChange(v === "si")}
        pequenas
      />
    </div>
  );
}

/** Número opcional con su unidad: vacío es «sin declarar». */
export function NumeroOpcional(props: {
  id: string;
  valor: number | undefined;
  onChange: (v: number | undefined) => void;
  unidad: string;
  decimales?: number;
  /** Solo enteros (días, trabajadores). */
  entero?: boolean;
  /** Admite el 0 (un porcentaje del 0 % es un dato). */
  cero?: boolean;
  max?: number;
  etiqueta?: string;
  ancho?: string;
  disabled?: boolean;
}): JSX.Element {
  const { id, valor, onChange, unidad, decimales = 2, entero = false, cero = false, max, etiqueta, ancho = "w-[96px]", disabled } = props;
  const texto = formato(valor, entero ? 0 : decimales);
  const valido = (n: number): boolean =>
    Number.isFinite(n) && (cero ? n >= 0 : n > 0) && (!entero || Number.isInteger(n)) && (max === undefined || n <= max);
  return (
    <span className="inline-flex h-8 shrink-0 items-stretch">
      <input
        // La clave reinicia el borrador cuando el valor cambia desde fuera.
        key={texto}
        id={id}
        type="text"
        inputMode={entero ? "numeric" : "decimal"}
        defaultValue={texto}
        aria-label={etiqueta}
        disabled={disabled}
        placeholder="—"
        onBlur={(e) => {
          const n = leerNumero(e.currentTarget.value);
          if (n === null) {
            if (valor !== undefined) onChange(undefined);
          } else if (!valido(n)) e.currentTarget.value = texto;
          else if (n !== valor) onChange(n);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.currentTarget.value = texto;
            e.currentTarget.blur();
          }
        }}
        className={`border-border-main bg-bg-primary text-text-primary focus:border-accent placeholder:text-text-disabled ${ancho} rounded-l border px-2 text-right font-mono text-[13px] tabular-nums focus:outline-none disabled:opacity-50`}
      />
      <span className="border-border-main bg-bg-elevated text-text-secondary flex items-center rounded-r border border-l-0 px-2 font-mono text-[11px]">
        {unidad}
      </span>
    </span>
  );
}

/** Texto opcional, de una línea: vacío es «sin declarar». */
export function TextoOpcional(props: {
  id: string;
  valor: string | undefined;
  onChange: (v: string | undefined) => void;
  placeholder?: string;
  etiqueta?: string;
  disabled?: boolean;
}): JSX.Element {
  const { id, valor, onChange, placeholder, etiqueta, disabled } = props;
  const texto = valor ?? "";
  return (
    <input
      key={texto}
      id={id}
      type="text"
      defaultValue={texto}
      placeholder={placeholder}
      aria-label={etiqueta}
      disabled={disabled}
      onBlur={(e) => {
        const t = e.currentTarget.value.trim();
        if (t !== texto) onChange(t === "" ? undefined : t);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.currentTarget.value = texto;
          e.currentTarget.blur();
        }
      }}
      className="border-border-main bg-bg-primary text-text-primary focus:border-accent placeholder:text-text-disabled h-8 w-full min-w-0 rounded border px-2 text-[12.5px] focus:outline-none disabled:opacity-50"
    />
  );
}

/** Una tarjeta de la pantalla: rótulo, título y su contenido en filas. */
export function Tarjeta(props: { id?: string; rotulo: string; titulo: string; children: ReactNode; aside?: ReactNode }): JSX.Element {
  return (
    <section id={props.id} aria-label={props.titulo} className="border-border-main bg-bg-primary rounded border pb-1">
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3 pb-2.5">
        <div className="min-w-0">
          <div className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">{props.rotulo}</div>
          <h2 className="text-text-primary pt-[3px] text-[15px] leading-snug font-semibold">{props.titulo}</h2>
        </div>
        {props.aside}
      </div>
      {props.children}
    </section>
  );
}

/** La explicación de debajo de una fila, en pequeño. */
export function Ayuda({ children, aviso = false }: { children: ReactNode; aviso?: boolean }): JSX.Element {
  return (
    <p className={`px-3.5 pb-2 text-[11.5px] leading-snug ${aviso ? "text-state-warn" : "text-text-disabled"}`}>{children}</p>
  );
}
