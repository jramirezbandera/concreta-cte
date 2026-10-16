import type { ResumenEdificio } from "../../lib/edificio/derivar";
import type { ResumenProyecto } from "../../lib/proyecto/progreso";
import type { Intervencion, Proyecto } from "../../lib/proyecto/tipos";

// =============================================================================
// Lógica pura de la página de Inicio: estado del expediente, fecha relativa,
// búsqueda y orden. Sin React ni Date.now: la fecha de referencia la inyecta
// la página.
// =============================================================================

export const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

/** Un proyecto con lo que la lista necesita ya derivado (se calcula una vez). */
export interface FilaProyecto {
  proyecto: Proyecto;
  resumen: ResumenProyecto;
  edificio: ResumenEdificio;
}

export type EstadoExpediente = "todo_justificado" | "incumple" | "en_curso" | "sin_empezar";

/**
 * Estado global del expediente, para la etiqueta de la tarjeta y los filtros.
 * Un incumplimiento manda sobre todo lo demás; «todo justificado» exige que
 * cumplan TODAS las aplicables (y que haya alguna).
 */
export function estadoExpediente(r: ResumenProyecto): EstadoExpediente {
  if (r.noCumplen > 0) return "incumple";
  if (r.aplicables > 0 && r.cumplen === r.aplicables) return "todo_justificado";
  if (r.cumplen + r.enCurso === 0) return "sin_empezar";
  return "en_curso";
}

export function etiquetaEstado(e: EstadoExpediente, r: ResumenProyecto): string {
  switch (e) {
    case "todo_justificado":
      return "Todo justificado";
    case "incumple":
      return r.noCumplen === 1 ? "1 incumplimiento" : `${r.noCumplen} incumplimientos`;
    case "en_curso":
      return "En curso";
    case "sin_empezar":
      return "Sin empezar";
  }
}

/** Porcentaje de aplicables que cumplen, entero 0–100. */
export function porcentaje(r: ResumenProyecto): number {
  return r.aplicables === 0 ? 0 : Math.round((r.cumplen / r.aplicables) * 100);
}

export type Filtro = "todos" | "en_curso" | "incumple" | "todo_justificado";

/** «En curso» agrupa también los que están sin empezar: son los que quedan por hacer. */
export function pasaFiltro(f: Filtro, e: EstadoExpediente): boolean {
  if (f === "todos") return true;
  if (f === "en_curso") return e === "en_curso" || e === "sin_empezar";
  return f === e;
}

export type Orden = "reciente" | "nombre" | "progreso";

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Busca en nombre, municipio y provincia, sin distinguir mayúsculas ni tildes. */
export function coincideBusqueda(p: Proyecto, q: string): boolean {
  const n = normalizar(q);
  if (n === "") return true;
  return [p.nombre, p.datosGenerales.municipio, p.datosGenerales.provincia].some((c) =>
    normalizar(c ?? "").includes(n),
  );
}

function tiempo(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function ordenar(filas: readonly FilaProyecto[], orden: Orden): FilaProyecto[] {
  const porReciente = (a: FilaProyecto, b: FilaProyecto) =>
    tiempo(b.proyecto.modificado) - tiempo(a.proyecto.modificado);
  const copia = [...filas];
  switch (orden) {
    case "reciente":
      return copia.sort(porReciente);
    case "nombre":
      return copia.sort((a, b) =>
        a.proyecto.nombre.localeCompare(b.proyecto.nombre, "es", {
          sensitivity: "base",
        }),
      );
    case "progreso":
      return copia.sort((a, b) => porcentaje(b.resumen) - porcentaje(a.resumen) || porReciente(a, b));
  }
}

/** «16 oct 2026» — fecha corta es-ES. */
export function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** «hoy», «ayer», «hace 3 días», «hace 2 semanas»; a partir de un mes, la fecha. */
export function fechaRelativa(iso: string, ahora: Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dia = (x: Date) => Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  const dias = Math.round((dia(ahora) - dia(d)) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? "hace 1 semana" : `hace ${semanas} semanas`;
  }
  return `el ${formatearFecha(iso)}`;
}

/** Datos del edificio en cifras cortas para la tarjeta: «12 viviendas», «5 plantas + 1 sótano», «1.240 m²». */
export function cifrasEdificio(e: ResumenEdificio): string[] {
  const out: string[] = [];
  if (e.numViviendas > 1) out.push(`${e.numViviendas} viviendas`);
  const sobre = e.plantasSobreRasante;
  const bajo = e.plantasBajoRasante;
  if (sobre > 0) {
    const pl = sobre === 1 ? "1 planta" : `${sobre} plantas`;
    out.push(bajo > 0 ? `${pl} + ${bajo === 1 ? "1 sótano" : `${bajo} sótanos`}` : pl);
  }
  if (e.superficieUtilTotal_m2 > 0) {
    out.push(`${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(e.superficieUtilTotal_m2)} m²`);
  }
  return out;
}
