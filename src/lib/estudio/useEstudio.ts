// =============================================================================
// El estudio en la UI (feature-29): una lectura del navegador compartida por
// Inicio, Los datos de la obra y la exportación de la memoria. Al guardar se
// avisa a todos; otra pestaña avisa con el evento `storage`.
// =============================================================================

import { useCallback, useSyncExternalStore } from "react";
import { CLAVE_ESTUDIO, ESTUDIO_VACIO, guardarEstudio, parseEstudio, type Estudio } from "./estudio";

const oyentes = new Set<() => void>();
let ultima: { raw: string | null; estudio: Estudio } | null = null;

/** La misma referencia mientras no cambie lo guardado (lo exige `useSyncExternalStore`). */
function leer(): Estudio {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CLAVE_ESTUDIO);
  } catch {
    raw = null;
  }
  if (ultima?.raw === raw) return ultima.estudio;
  let estudio = ESTUDIO_VACIO;
  try {
    estudio = raw ? parseEstudio(JSON.parse(raw)) : ESTUDIO_VACIO;
  } catch {
    estudio = ESTUDIO_VACIO;
  }
  ultima = { raw, estudio };
  return estudio;
}

function suscribir(avisar: () => void): () => void {
  oyentes.add(avisar);
  const deOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE_ESTUDIO) avisar();
  };
  window.addEventListener("storage", deOtraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", deOtraPestana);
  };
}

export function useEstudio(): [Estudio, (e: Estudio) => void] {
  const estudio = useSyncExternalStore(suscribir, leer, () => ESTUDIO_VACIO);
  const guardar = useCallback((e: Estudio) => {
    guardarEstudio(e);
    for (const avisar of oyentes) avisar();
  }, []);
  return [estudio, guardar];
}
