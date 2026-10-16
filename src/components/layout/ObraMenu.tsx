import { useEffect, useRef, useState, type ChangeEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronsUpDown,
  Copy,
  Download,
  FilePlus2,
  FolderOpen,
  MapPin,
  Save,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import {
  cargarProyecto,
  duplicarProyecto,
  eliminarProyecto,
  exportarProyecto,
  guardarProyecto,
  importarProyecto,
  listarProyectos,
  nombreArchivoExport,
} from "../../lib/proyecto/storage";
import type { Proyecto } from "../../lib/proyecto/tipos";
import { descargarBlob } from "../../lib/export/descargar";
import { showToast } from "../ui/Toast";

// =============================================================================
// El menú de obra, en la cabecera de la barra lateral. Port del `ObraMenu` de
// Concreta, con las funciones básicas a mano sin salir del expediente: Nueva,
// Datos de la obra, Duplicar, Guardar, Exportar e Importar, y las obras
// recientes para saltar de una a otra.
//
// Aquí cada obra tiene su ruta (`/p/:id`) y el ProyectoLayout remonta el
// provider al cambiar de id, así que cambiar de obra es navegar, no recargar.
// Antes de exportar, duplicar o salir se llama a `guardarAhora`: el autoguardado
// va con 300 ms de retardo y el archivo tiene que llevar lo último tecleado.
//
// Dos casos que no son navegar:
//   - Importar un archivo de la MISMA obra abierta: el provider y los módulos
//     leen el proyecto solo al montar, y navegar a la misma ruta no remonta.
//     Se escribe el archivo y se recarga la página.
//   - La obra abierta no se borra desde aquí (el provider la volvería a
//     escribir al salir): se borra desde la lista de proyectos.
// =============================================================================

/** Obras que se listan en «Recientes». */
const MAX_RECIENTES = 6;

/** «13 oct» — fecha corta es-ES. */
function fecha(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

/** Las obras guardadas, la última editada primero. */
function recientes(): Proyecto[] {
  return listarProyectos()
    .sort((a, b) => b.modificado.localeCompare(a.modificado))
    .slice(0, MAX_RECIENTES);
}

interface ItemProps {
  icon: LucideIcon;
  onClick: () => void;
  title?: string;
  children: string;
}

function Item({ icon: Icon, onClick, title, children }: ItemProps): JSX.Element {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      title={title}
      className="text-text-primary hover:bg-bg-elevated flex w-full items-center gap-2 px-3 py-2 text-[12.5px] transition-colors"
    >
      <Icon size={14} className="text-text-secondary shrink-0" aria-hidden="true" />
      {children}
    </button>
  );
}

const ROTULO =
  "text-text-disabled border-border-sub border-t px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.11em] uppercase";

export function ObraMenu({ onNavegar }: { onNavegar: () => void }): JSX.Element {
  const { proyecto, guardarAhora } = useProyecto();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState<Proyecto[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const ficheroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", onDocDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  const alternar = () => {
    // La lista se lee al abrir: lo guardado hasta este instante, sin suscripción.
    if (!abierto) {
      guardarAhora();
      setLista(recientes());
    }
    setAbierto((o) => !o);
  };

  const cerrar = () => setAbierto(false);

  const ir = (ruta: string) => {
    cerrar();
    onNavegar();
    navigate(ruta);
  };

  const avisarNoGuardada = () =>
    showToast("No se ha podido guardar la obra en el navegador (¿almacenamiento lleno?).", { autoDismiss: 6000 });

  const nueva = () => {
    guardarAhora();
    ir("/nuevo");
  };

  const datos = () => ir(`/p/${proyecto.id}/datos`);

  const duplicar = () => {
    if (!guardarAhora()) return avisarNoGuardada();
    const copia = duplicarProyecto(proyecto.id, new Date().toISOString());
    if (copia === null) {
      cerrar();
      showToast(`No se ha podido duplicar «${proyecto.nombre}».`, { autoDismiss: 5000 });
      return;
    }
    ir(`/p/${copia.id}`);
    showToast(`Duplicada como «${copia.nombre}». El nombre se cambia en Datos de la obra.`, { autoDismiss: 5000 });
  };

  const guardar = () => {
    cerrar();
    if (!guardarAhora()) return avisarNoGuardada();
    showToast(`Obra guardada en este navegador: ${proyecto.nombre}`, { autoDismiss: 3000 });
  };

  const exportar = () => {
    cerrar();
    if (!guardarAhora()) return avisarNoGuardada();
    const nombre = nombreArchivoExport(proyecto);
    descargarBlob(new Blob([exportarProyecto(proyecto)], { type: "application/json" }), nombre);
    showToast(`Exportada: ${nombre}`, { autoDismiss: 4000 });
  };

  const importar = () => {
    cerrar();
    ficheroRef.current?.click();
  };

  const alElegirFichero = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!f) return;
    const reader = new FileReader();
    reader.onerror = () => showToast("No se ha podido leer el archivo.", { autoDismiss: 5000 });
    reader.onload = () => {
      const res = importarProyecto(typeof reader.result === "string" ? reader.result : "");
      if (!res.ok) {
        showToast(res.error, { autoDismiss: 7000 });
        return;
      }
      const p = res.proyecto;
      if (p.id === proyecto.id) {
        if (!window.confirm(`El archivo es esta misma obra («${p.nombre}»). ¿Sustituir lo que hay ahora por el archivo?`)) {
          return;
        }
        // Nada pendiente que pise el archivo al salir, y recarga para remontar.
        guardarAhora();
        guardarProyecto(p);
        window.location.reload();
        return;
      }
      const existente = cargarProyecto(p.id);
      if (
        existente !== null &&
        !window.confirm(`Ya hay una obra guardada con el mismo identificador («${existente.nombre}»). ¿Sobrescribirla con el archivo?`)
      ) {
        return;
      }
      guardarProyecto(p);
      ir(`/p/${p.id}`);
      showToast(`Obra importada: ${p.nombre}`, { autoDismiss: 4000 });
    };
    reader.readAsText(f);
  };

  const abrir = (p: Proyecto) => {
    if (p.id === proyecto.id) return cerrar();
    ir(`/p/${p.id}`);
  };

  const borrar = (p: Proyecto) => {
    if (!window.confirm(`¿Borrar la obra «${p.nombre}» de este navegador? Si la exportaste, el archivo no se toca.`)) return;
    eliminarProyecto(p.id);
    setLista(recientes());
    showToast(`Obra borrada: ${p.nombre}`, { autoDismiss: 3500 });
  };

  return (
    <div ref={ref} className="relative mx-2.5 mt-2.5 mb-1">
      <button
        type="button"
        onClick={alternar}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Obra: ${proyecto.nombre}. Menú de obra`}
        title={proyecto.nombre}
        className="border-border-main bg-bg-primary text-text-primary hover:border-text-disabled flex h-[34px] w-full items-center gap-2 rounded border px-2.5 text-[12.5px] transition-colors"
      >
        <span className="min-w-0 flex-1 truncate text-left">{proyecto.nombre}</span>
        <ChevronsUpDown size={13} className="text-text-disabled shrink-0" aria-hidden="true" />
      </button>

      {abierto && (
        <div
          role="menu"
          aria-label="Obra"
          className="border-border-main bg-bg-surface absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md border"
          style={{ boxShadow: "0 12px 30px -12px rgba(0,0,0,0.45)" }}
        >
          <Item icon={FilePlus2} onClick={nueva}>
            Nueva obra…
          </Item>
          <Item icon={MapPin} onClick={datos}>
            Datos de la obra…
          </Item>
          <Item icon={Copy} onClick={duplicar} title="Partir de esta obra para la siguiente">
            Duplicar esta obra
          </Item>
          <Item icon={Save} onClick={guardar} title="Se guarda sola mientras trabajas; esto lo fuerza ya">
            Guardar
          </Item>
          <Item icon={Download} onClick={exportar} title="Descarga la obra como archivo .json">
            Exportar .json
          </Item>
          <Item icon={Upload} onClick={importar} title="Abre una obra exportada como archivo .json">
            Importar .json…
          </Item>

          <p className={ROTULO}>Recientes</p>
          <ul className="m-0 max-h-56 list-none overflow-y-auto p-0 pb-1">
            {lista.map((p) => {
              const actual = p.id === proyecto.id;
              return (
                <li key={p.id} className="flex items-center">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => abrir(p)}
                    aria-current={actual ? "true" : undefined}
                    title={p.nombre}
                    className={`hover:bg-bg-elevated flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors ${actual ? "text-accent" : "text-text-primary"}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                    <span className="text-text-disabled shrink-0 font-mono text-[10px]">{fecha(p.modificado)}</span>
                  </button>
                  {actual ? (
                    <span className="w-[28px] shrink-0" aria-hidden="true" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => borrar(p)}
                      aria-label={`Borrar ${p.nombre}`}
                      title="Borrar de este navegador"
                      className="text-text-disabled hover:text-state-fail shrink-0 p-2 transition-colors"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            to="/"
            role="menuitem"
            onClick={() => {
              cerrar();
              onNavegar();
            }}
            className="border-border-sub text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex items-center gap-2 border-t px-3 py-2 text-[12px] transition-colors"
          >
            <FolderOpen size={14} className="shrink-0" aria-hidden="true" />
            Todas las obras
          </Link>
        </div>
      )}

      <input
        ref={ficheroRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        tabIndex={-1}
        aria-label="Archivo de obra (.json)"
        onChange={alElegirFichero}
      />
    </div>
  );
}
