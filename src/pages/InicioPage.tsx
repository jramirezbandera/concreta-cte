import { useEffect, useMemo, useRef, useState, type DragEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router";
import { FileUp, LayoutGrid, List, Plus, Search, SearchX, Upload, X } from "lucide-react";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { ToastContainer, showToast } from "../components/ui/Toast";
import { TuEstudio } from "../components/estudio/TuEstudio";
import { ProyectoCard, ProyectoFila } from "../components/inicio/ProyectoCard";
import {
  coincideBusqueda,
  estadoExpediente,
  ordenar,
  pasaFiltro,
  type FilaProyecto,
  type Filtro,
  type Orden,
} from "../components/inicio/inicio";
import {
  cargarProyecto,
  duplicarProyecto,
  eliminarProyecto,
  exportarProyecto,
  guardarProyecto,
  importarProyecto,
  inicializarStorage,
  listarProyectos,
  contarProyectosV1,
  nombreArchivoExport,
  setProyectoActivo,
} from "../lib/proyecto/storage";
import { descargarBlob } from "../lib/export/descargar";
import { resumenEdificio } from "../lib/edificio/derivar";
import { resumenProyecto } from "../lib/proyecto/progreso";
import type { Proyecto } from "../lib/proyecto/tipos";

// =============================================================================
// Página de inicio (feature-6 T3.4): los expedientes del navegador, en tarjetas
// (con el alzado del edificio y el progreso por estados) o en lista. Busca,
// filtra por estado y ordena; importa con botón o arrastrando el .json; borrar
// se deshace desde el aviso. Standalone — sin sidebar ni ProyectoProvider;
// monta su propio ToastContainer porque no cuelga del AppShell. Toda fecha se
// inyecta desde aquí (la lib no llama a Date.now).
// =============================================================================

type Vista = "tarjetas" | "lista";
const CLAVE_VISTA = "concreta:inicio:vista";

function leerVista(): Vista {
  try {
    return localStorage.getItem(CLAVE_VISTA) === "lista" ? "lista" : "tarjetas";
  } catch {
    return "tarjetas";
  }
}

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "en_curso", label: "En curso" },
  { id: "incumple", label: "Con incumplimientos" },
  { id: "todo_justificado", label: "Todo justificado" },
];

const ORDENES: { id: Orden; label: string }[] = [
  { id: "reciente", label: "Última edición" },
  { id: "nombre", label: "Nombre" },
  { id: "progreso", label: "Progreso" },
];

const BTN_SECUNDARIO =
  "border-border-main bg-bg-primary text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2";
const BTN_PRIMARIO =
  "bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg focus-visible:outline-accent flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/** ¿Lleva archivos lo que se está arrastrando? (no texto ni enlaces) */
function llevaArchivos(ev: DragEvent): boolean {
  return Array.from(ev.dataTransfer?.types ?? []).includes("Files");
}

export function InicioPage(): JSX.Element {
  const navigate = useNavigate();
  // Initializer (no efecto): inicializarStorage es idempotente, así que el doble
  // render de StrictMode es inocuo — mismo patrón que RedirectLegacy.
  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    inicializarStorage(new Date().toISOString());
    return listarProyectos();
  });
  // Expedientes de la versión 1 que quedan en el navegador: no se abren (schema 2
  // sin migración), pero se avisa para que nadie crea que se han perdido.
  const [proyectosV1] = useState(() => contarProyectosV1());
  const [ahora] = useState(() => new Date());
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [orden, setOrden] = useState<Orden>("reciente");
  const [vista, setVista] = useState<Vista>(leerVista);
  const [arrastrando, setArrastrando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buscadorRef = useRef<HTMLInputElement>(null);

  const refrescar = () => setProyectos(listarProyectos());

  // El cálculo del progreso pasa por el motor de cada justificación: una vez por proyecto.
  const filas = useMemo<FilaProyecto[]>(
    () =>
      proyectos.map((p) => ({
        proyecto: p,
        resumen: resumenProyecto(p),
        edificio: resumenEdificio(p.edificio),
      })),
    [proyectos],
  );
  const encontradas = filas.filter((f) => coincideBusqueda(f.proyecto, busqueda));
  const cuenta = (f: Filtro) => encontradas.filter((x) => pasaFiltro(f, estadoExpediente(x.resumen))).length;
  const visibles = ordenar(
    encontradas.filter((f) => pasaFiltro(filtro, estadoExpediente(f.resumen))),
    orden,
  );

  // «/» lleva al buscador, como en la mayoría de herramientas de trabajo.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "/" || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      ev.preventDefault();
      buscadorRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cambiarVista = (v: Vista) => {
    setVista(v);
    try {
      localStorage.setItem(CLAVE_VISTA, v);
    } catch {
      // Sin almacenamiento: la vista vale para esta visita.
    }
  };

  const onAbrir = (p: Proyecto) => setProyectoActivo(p.id);

  const onDuplicar = (p: Proyecto) => {
    const copia = duplicarProyecto(p.id, new Date().toISOString());
    if (copia === null) {
      showToast(`No se pudo duplicar «${p.nombre}».`, { autoDismiss: 5000 });
      return;
    }
    refrescar();
    showToast(`Proyecto duplicado como «${copia.nombre}».`, {
      autoDismiss: 4000,
    });
  };

  const onExportar = (p: Proyecto) => {
    descargarBlob(new Blob([exportarProyecto(p)], { type: "application/json" }), nombreArchivoExport(p));
    showToast(`Proyecto «${p.nombre}» exportado.`, { autoDismiss: 4000 });
  };

  // Se borra al momento y el aviso permite deshacerlo: el proyecto entero sigue
  // en memoria y vuelve tal cual (mismo id, mismas fechas).
  const onEliminar = (p: Proyecto) => {
    eliminarProyecto(p.id);
    refrescar();
    showToast(`Proyecto «${p.nombre}» eliminado.`, {
      autoDismiss: 8000,
      action: {
        label: "Deshacer",
        onClick: () => {
          guardarProyecto(p);
          refrescar();
        },
      },
    });
  };

  const onArchivoImportado = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = importarProyecto(typeof reader.result === "string" ? reader.result : "");
      if (!res.ok) {
        showToast(res.error, { autoDismiss: 7000 });
        return;
      }
      const existente = cargarProyecto(res.proyecto.id);
      if (
        existente !== null &&
        !window.confirm(
          `Ya existe un proyecto con el mismo identificador («${existente.nombre}»). ¿Sobrescribirlo con el archivo importado?`,
        )
      ) {
        return;
      }
      guardarProyecto(res.proyecto);
      refrescar();
      showToast(`Proyecto «${res.proyecto.nombre}» importado.`, {
        autoDismiss: 4000,
      });
    };
    reader.onerror = () =>
      showToast("No se pudo leer el archivo seleccionado.", {
        autoDismiss: 5000,
      });
    reader.readAsText(file);
  };

  const accionesDe = (p: Proyecto) => ({
    onAbrir: () => onAbrir(p),
    onIr: () => {
      onAbrir(p);
      void navigate(`/p/${p.id}`);
    },
    onDuplicar: () => onDuplicar(p),
    onExportar: () => onExportar(p),
    onEliminar: () => onEliminar(p),
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todos");
  };

  return (
    <div
      className="bg-bg-primary text-text-primary relative min-h-dvh"
      onDragEnter={(ev) => {
        if (llevaArchivos(ev)) setArrastrando(true);
      }}
    >
      <header className="border-border-sub bg-bg-primary/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-text-primary text-[15px] leading-tight font-semibold">Concreta</span>
              <span className="text-text-disabled text-[12px] leading-tight max-sm:hidden">Memorias · CTE</span>
            </div>
            <p className="text-text-secondary text-[12px] leading-tight max-sm:hidden">Expedientes de justificación</p>
          </div>
          <ThemeToggle />
          <button type="button" onClick={() => fileInputRef.current?.click()} className={BTN_SECUNDARIO}>
            <Upload size={14} aria-hidden="true" />
            <span className="max-sm:sr-only">Importar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            aria-label="Importar proyecto desde archivo JSON"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onArchivoImportado(file);
              e.target.value = ""; // permite re-seleccionar el mismo archivo
            }}
          />
          <Link to="/nuevo" className={BTN_PRIMARIO}>
            <Plus size={14} aria-hidden="true" />
            Nuevo proyecto
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1 className="text-text-primary text-[22px] leading-tight font-semibold tracking-tight">Proyectos</h1>
            <p className="text-text-secondary mt-1 text-[13px]">
              {proyectos.length === 1
                ? "1 expediente guardado en este navegador."
                : `${proyectos.length} expedientes guardados en este navegador.`}
              <span className="max-md:hidden"> Arrastra un .json a esta página para importarlo.</span>
            </p>
          </div>
        </div>

        {proyectosV1 > 0 && (
          <p
            role="note"
            className="border-border-sub bg-bg-surface text-text-secondary mb-4 rounded-lg border px-3 py-2 text-[12.5px] leading-snug"
          >
            {proyectosV1 === 1
              ? "Hay 1 expediente de la versión anterior en este navegador."
              : `Hay ${proyectosV1} expedientes de la versión anterior en este navegador.`}{" "}
            Esta versión describe el edificio de otra forma y empieza de cero: no se abren aquí, pero siguen guardados y
            no se han borrado.
          </p>
        )}

        {proyectos.length === 0 ? (
          <div className="border-border-main bg-bg-surface flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
            <div className="bg-tint-accent text-accent flex h-12 w-12 items-center justify-center rounded-full">
              <FileUp size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-text-primary text-[15px] font-semibold">Todavía no hay ningún proyecto</p>
              <p className="text-text-secondary mt-1 max-w-md text-[13px]">
                Crea un expediente desde cero, o importa uno exportado como .json: también puedes arrastrar el archivo
                aquí.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/nuevo" className={BTN_PRIMARIO}>
                <Plus size={14} aria-hidden="true" />
                Crear el primero
              </Link>
              <button type="button" onClick={() => fileInputRef.current?.click()} className={BTN_SECUNDARIO}>
                <Upload size={14} aria-hidden="true" />
                Importar .json
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de herramientas: buscar · filtrar por estado · ordenar · vista */}
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative lg:w-72">
                <Search
                  size={14}
                  className="text-text-disabled pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  ref={buscadorRef}
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setBusqueda("");
                  }}
                  placeholder="Buscar por nombre o municipio"
                  aria-label="Buscar proyectos por nombre o municipio"
                  className="border-border-main bg-bg-primary text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-accent/30 w-full rounded-md border py-1.5 pr-8 pl-8 text-[13px] transition-colors focus:ring-2 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {busqueda ? (
                  <button
                    type="button"
                    onClick={() => setBusqueda("")}
                    aria-label="Borrar la búsqueda"
                    className="text-text-disabled hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                ) : (
                  <kbd
                    className="border-border-sub text-text-disabled pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 font-sans text-[10.5px] max-lg:hidden"
                    aria-hidden="true"
                  >
                    /
                  </kbd>
                )}
              </div>

              <div
                role="group"
                aria-label="Filtrar por estado"
                className="bg-bg-surface border-border-sub flex flex-wrap gap-0.5 rounded-lg border p-0.5 lg:flex-nowrap lg:self-start"
              >
                {FILTROS.map((f) => {
                  const activo = filtro === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => setFiltro(f.id)}
                      className={[
                        "focus-visible:outline-accent flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] whitespace-nowrap transition-colors focus-visible:outline-2",
                        activo
                          ? "bg-bg-primary text-text-primary font-medium shadow-sm"
                          : "text-text-secondary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {f.label}
                      <span
                        className={`rounded-full px-1.5 text-[11px] tabular-nums ${activo ? "bg-tint-accent text-accent" : "bg-bg-elevated text-text-disabled"}`}
                      >
                        {cuenta(f.id)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 lg:ml-auto">
                <label className="text-text-secondary flex items-center gap-1.5 text-[12.5px]">
                  <span className="whitespace-nowrap">Ordenar por</span>
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value as Orden)}
                    className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 rounded-md border px-2 py-1.5 text-[12.5px] focus:ring-2 focus:outline-none"
                  >
                    {ORDENES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div
                  role="group"
                  aria-label="Vista"
                  className="bg-bg-surface border-border-sub ml-auto flex gap-0.5 rounded-lg border p-0.5 lg:ml-0"
                >
                  {(
                    [
                      {
                        id: "tarjetas",
                        label: "Ver en tarjetas",
                        Icono: LayoutGrid,
                      },
                      { id: "lista", label: "Ver en lista", Icono: List },
                    ] as const
                  ).map(({ id, label, Icono }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={vista === id}
                      aria-label={label}
                      title={label}
                      onClick={() => cambiarVista(id)}
                      className={[
                        "focus-visible:outline-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-2",
                        vista === id
                          ? "bg-bg-primary text-text-primary shadow-sm"
                          : "text-text-disabled hover:text-text-primary",
                      ].join(" ")}
                    >
                      <Icono size={14} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="sr-only" aria-live="polite">
              {visibles.length === 1 ? "1 proyecto" : `${visibles.length} proyectos`}
            </h2>

            {visibles.length === 0 ? (
              <div className="border-border-sub flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
                <SearchX size={24} className="text-text-disabled" aria-hidden="true" />
                <p className="text-text-secondary text-[13px]">Ningún proyecto coincide con la búsqueda o el filtro.</p>
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="text-accent hover:text-accent-hover text-[13px] font-medium hover:underline"
                >
                  Ver todos los proyectos
                </button>
              </div>
            ) : vista === "tarjetas" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((f) => (
                  <ProyectoCard key={f.proyecto.id} fila={f} ahora={ahora} {...accionesDe(f.proyecto)} />
                ))}
                <Link
                  to="/nuevo"
                  className="border-border-main text-text-secondary hover:border-accent hover:text-accent hover:bg-tint-accent-soft focus-visible:outline-accent flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors focus-visible:outline-2 sm:min-h-56"
                >
                  <span className="bg-bg-elevated flex h-10 w-10 items-center justify-center rounded-full">
                    <Plus size={18} aria-hidden="true" />
                  </span>
                  <span className="text-[13.5px] font-medium">Empezar un expediente</span>
                  <span className="text-text-disabled text-[12px]">Desde cero, o duplicando uno parecido</span>
                </Link>
              </div>
            ) : (
              <ul className="border-border-sub bg-bg-primary rounded-xl border" aria-label="Lista de proyectos">
                {visibles.map((f) => (
                  <ProyectoFila key={f.proyecto.id} fila={f} ahora={ahora} {...accionesDe(f.proyecto)} />
                ))}
              </ul>
            )}
          </>
        )}

        <TuEstudio />
      </main>

      {/* Soltar un .json en cualquier parte de la página lo importa. */}
      {arrastrando && (
        <div
          className="bg-bg-primary/80 fixed inset-0 z-40 flex items-center justify-center p-6 backdrop-blur-sm"
          onDragOver={(ev) => {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(ev) => {
            if (ev.currentTarget === ev.target) setArrastrando(false);
          }}
          onDrop={(ev) => {
            ev.preventDefault();
            setArrastrando(false);
            const file = ev.dataTransfer.files[0];
            if (file) onArchivoImportado(file);
          }}
        >
          <div className="border-accent bg-tint-accent pointer-events-none flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-14 text-center">
            <FileUp size={32} className="text-accent" aria-hidden="true" />
            <p className="text-text-primary text-[15px] font-semibold">Suelta el archivo para importar el proyecto</p>
            <p className="text-text-secondary text-[13px]">Un .json exportado desde Concreta</p>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
