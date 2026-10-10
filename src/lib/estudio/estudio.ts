// =============================================================================
// Los datos del estudio (feature-29): quién firma y cómo se le localiza. Son de
// la persona, no del proyecto: se guardan una vez en el navegador, como los
// ajustes de la IA, y cada proyecto elige quién firma (una persona o dos).
//
// `membreteDe` es PURO: con el estudio y el proyecto compone la cabecera y el
// pie del Word y del PDF de la memoria, como los de las memorias del estudio.
// =============================================================================

import type { FaseProyecto, Proyecto } from "../proyecto/tipos";

/** Una persona que firma. */
export interface Firmante {
  id: string;
  nombre: string;
  /** «Arquitecto», «Arquitecta técnica»… tal como la escribe. */
  titulacion: string;
  /** «Colegiado nº 1711 del COA Málaga», tal como debe salir en la cabecera. */
  colegiacion?: string;
}

export interface Estudio {
  firmantes: Firmante[];
  direccion?: string;
  telefonos?: string;
  correo?: string;
}

/** Firman como mucho dos en un proyecto (decisión del 2026-10-10). */
export const MAX_FIRMANTES_PROYECTO = 2;

export const ESTUDIO_VACIO: Estudio = { firmantes: [] };

export const CLAVE_ESTUDIO = "concreta-inst-estudio";

const texto = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);

/** Lectura defensiva: lo que no tenga forma de estudio se descarta, nunca lanza. */
export function parseEstudio(raw: unknown): Estudio {
  if (typeof raw !== "object" || raw === null) return ESTUDIO_VACIO;
  const r = raw as Record<string, unknown>;
  const firmantes: Firmante[] = [];
  if (Array.isArray(r.firmantes)) {
    for (const f of r.firmantes as unknown[]) {
      if (typeof f !== "object" || f === null) continue;
      const x = f as Record<string, unknown>;
      const id = texto(x.id);
      const nombre = texto(x.nombre);
      if (!id || !nombre) continue;
      const colegiacion = texto(x.colegiacion);
      firmantes.push({ id, nombre, titulacion: texto(x.titulacion) ?? "", ...(colegiacion ? { colegiacion } : {}) });
    }
  }
  const direccion = texto(r.direccion);
  const telefonos = texto(r.telefonos);
  const correo = texto(r.correo);
  return { firmantes, ...(direccion ? { direccion } : {}), ...(telefonos ? { telefonos } : {}), ...(correo ? { correo } : {}) };
}

/** Lee el estudio guardado. Con el almacenamiento bloqueado (modo privado), vacío. */
export function leerEstudio(s?: Storage): Estudio {
  try {
    const raw = (s ?? window.localStorage).getItem(CLAVE_ESTUDIO);
    return raw ? parseEstudio(JSON.parse(raw)) : ESTUDIO_VACIO;
  } catch {
    return ESTUDIO_VACIO;
  }
}

export function guardarEstudio(e: Estudio, s?: Storage): void {
  try {
    (s ?? window.localStorage).setItem(CLAVE_ESTUDIO, JSON.stringify(parseEstudio(e)));
  } catch {
    // Sin almacenamiento, el estudio vive mientras la pestaña siga abierta.
  }
}

/** Quién firma este proyecto: los elegidos que sigan en el estudio o, sin elección, la primera persona. */
export function firmantesDe(e: Estudio, p: Pick<Proyecto, "datosGenerales">): Firmante[] {
  const elegidos = p.datosGenerales.documento?.firmantes ?? [];
  const deElegidos = elegidos.flatMap((id) => e.firmantes.find((f) => f.id === id) ?? []);
  const lista = deElegidos.length > 0 ? deElegidos : e.firmantes.slice(0, 1);
  return lista.slice(0, MAX_FIRMANTES_PROYECTO);
}

export const NOMBRE_FASE: Record<FaseProyecto, string> = {
  basico: "Proyecto básico",
  ejecucion: "Proyecto de ejecución",
  basico_ejecucion: "Proyecto básico y de ejecución",
};

/** Cabecera y pie del documento (feature-29). */
export interface Membrete {
  /** Filas de la cabecera, [izquierda, derecha]. Vacía: el documento sale sin cabecera. */
  cabecera: [string, string][];
  /** Lo que va en el pie, a la izquierda de «Página N». */
  pie: string;
  /** Nombre del proyecto, para los metadatos y el nombre del archivo. */
  proyecto: string;
}

/** «Javier Ramírez Bandera, Arquitecto» | «Colegiado nº 1711 del COA Málaga». */
function filaFirmante(f: Firmante): [string, string] {
  return [f.titulacion ? `${f.nombre}, ${f.titulacion}` : f.nombre, f.colegiacion ?? ""];
}

/**
 * La cabecera como las del estudio: a la izquierda quien firma y la dirección;
 * a la derecha el colegiado y los teléfonos. El pie lleva el título del
 * documento o, sin él, el nombre del proyecto.
 */
export function membreteDe(e: Estudio, p: Pick<Proyecto, "nombre" | "datosGenerales">): Membrete {
  const cabecera = firmantesDe(e, p).map(filaFirmante);
  const contacto = [e.telefonos ? `Tlf: ${e.telefonos}` : "", e.correo ?? ""].filter((x) => x !== "").join(" · ");
  if (cabecera.length > 0 && (e.direccion || contacto)) cabecera.push([e.direccion ?? "", contacto]);
  const titulo = p.datosGenerales.documento?.titulo?.trim();
  return { cabecera, pie: titulo || p.nombre, proyecto: p.nombre };
}
