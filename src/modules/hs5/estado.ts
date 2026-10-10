// =============================================================================
// DB-HS5 — Lo que guarda el módulo en el expediente (feature-14 §J).
//
// La red de residuales de siempre (`HS5Inputs`: uso, plantas, cubierta, tramos y
// aparatos) más las decisiones de la v4 y el modo:
//   - `red: "edificio"`: la red se deduce de El edificio cada vez (los tramos y
//     aparatos guardados no se usan);
//   - `red: "manual"`: «Ajustar a mano»; manda la tabla de tramos guardada.
// Solo tipos y valores por defecto.
// =============================================================================

import { hs5Defaults, type HS5Inputs } from "./calc";
import { DECISIONES_POR_DEFECTO, type DecisionesHs5 } from "./red";

export type ModoRed = "edificio" | "manual";

export interface Hs5Estado extends HS5Inputs, DecisionesHs5 {
  red: ModoRed;
  /** Bajantes de pluviales; 0 = las que se proponen según la cubierta. */
  bajantesPluviales: number;
  /**
   * En un edificio existente (feature-30): el colector o la bajante existente al
   * que acomete lo intervenido. Ø 0 = sin el dato (se dice el mínimo que necesita).
   */
  redExistente_mm: number;
  redExistentePendiente_pct: number;
}

export const hs5EstadoDefaults: Hs5Estado = {
  ...hs5Defaults,
  ...DECISIONES_POR_DEFECTO,
  red: "edificio",
  bajantesPluviales: 0,
  redExistente_mm: 0,
  redExistentePendiente_pct: 2,
};
