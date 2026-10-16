import { Fragment, useEffect, useId, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

// =============================================================================
// Menú de acciones de un proyecto (patrón menu button de WAI-ARIA): se abre
// con clic, Intro o ↓; ↑/↓/Inicio/Fin recorren; Escape cierra y devuelve el
// foco al botón; un clic fuera o Tab lo cierran.
// =============================================================================

export interface AccionMenu {
  label: string;
  icono: ReactNode;
  onSelect: () => void;
  peligro?: boolean;
}

export function MenuProyecto({ nombre, acciones }: { nombre: string; acciones: AccionMenu[] }): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    if (!abierto) return;
    items.current[0]?.focus();
    const fuera = (ev: PointerEvent) => {
      if (!raiz.current?.contains(ev.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  const cerrar = (devolverFoco: boolean) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  };

  const onKeyMenu = (ev: KeyboardEvent) => {
    const lista = items.current.filter((x): x is HTMLButtonElement => x !== null);
    const i = lista.indexOf(document.activeElement as HTMLButtonElement);
    const ir = (k: number) => lista[(k + lista.length) % lista.length]?.focus();
    switch (ev.key) {
      case "ArrowDown":
        ev.preventDefault();
        ir(i + 1);
        break;
      case "ArrowUp":
        ev.preventDefault();
        ir(i - 1);
        break;
      case "Home":
        ev.preventDefault();
        ir(0);
        break;
      case "End":
        ev.preventDefault();
        ir(lista.length - 1);
        break;
      case "Escape":
        ev.preventDefault();
        cerrar(true);
        break;
      case "Tab":
        cerrar(false);
        break;
    }
  };

  return (
    <div ref={raiz} className="relative">
      <button
        ref={boton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? menuId : undefined}
        aria-label={`Acciones del proyecto ${nombre}`}
        onClick={() => setAbierto((v) => !v)}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowDown") {
            ev.preventDefault();
            setAbierto(true);
          }
        }}
        className={[
          "text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent",
          "flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-2",
          abierto ? "bg-bg-elevated text-text-primary" : "",
        ].join(" ")}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>
      {abierto && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Acciones de ${nombre}`}
          onKeyDown={onKeyMenu}
          className="border-border-main bg-bg-primary absolute top-full right-0 z-30 mt-1 min-w-44 rounded-lg border p-1 shadow-lg shadow-black/10"
        >
          {acciones.map((a, k) => (
            <Fragment key={a.label}>
              {a.peligro && k > 0 && <div role="separator" className="bg-border-sub mx-1 my-1 h-px" />}
              <button
                ref={(el) => {
                  items.current[k] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  cerrar(true);
                  a.onSelect();
                }}
                className={[
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors focus:outline-none",
                  a.peligro
                    ? "text-state-fail hover:bg-tint-fail focus:bg-tint-fail"
                    : "text-text-primary hover:bg-bg-elevated focus:bg-bg-elevated",
                ].join(" ")}
              >
                {a.icono}
                {a.label}
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
