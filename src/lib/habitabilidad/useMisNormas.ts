// =============================================================================
// Mis normas en la UI (feature-32): la misma lectura del navegador para Los
// datos de la obra y la pantalla de habitabilidad. Al guardar se avisa a todos;
// otra pestaña avisa con el evento `storage`. Como `useEstudio`.
// =============================================================================

import { useCallback, useSyncExternalStore } from "react";
import { CLAVE_MIS_NORMAS, guardarMisNormas, parseNormas, type NormaHabitabilidad } from "./norma";

const oyentes = new Set<() => void>();
const NINGUNA: NormaHabitabilidad[] = [];
let ultima: { raw: string | null; normas: NormaHabitabilidad[] } | null = null;

/** La misma referencia mientras no cambie lo guardado (lo exige `useSyncExternalStore`). */
function leer(): NormaHabitabilidad[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CLAVE_MIS_NORMAS);
  } catch {
    raw = null;
  }
  if (ultima?.raw === raw) return ultima.normas;
  let normas = NINGUNA;
  try {
    normas = raw ? parseNormas(JSON.parse(raw)) : NINGUNA;
  } catch {
    normas = NINGUNA;
  }
  ultima = { raw, normas };
  return normas;
}

function suscribir(avisar: () => void): () => void {
  oyentes.add(avisar);
  const deOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE_MIS_NORMAS) avisar();
  };
  window.addEventListener("storage", deOtraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", deOtraPestana);
  };
}

export function useMisNormas(): [NormaHabitabilidad[], (n: NormaHabitabilidad[]) => void] {
  const normas = useSyncExternalStore(suscribir, leer, () => NINGUNA);
  const guardar = useCallback((n: NormaHabitabilidad[]) => {
    guardarMisNormas(n);
    for (const avisar of oyentes) avisar();
  }, []);
  return [normas, guardar];
}
