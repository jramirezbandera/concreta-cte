// =============================================================================
// HE 2 · RITE — Condiciones de las instalaciones térmicas (feature-36, paso 4).
// Valores normativos como DATOS versionados con procedencia. Aquí SOLO datos y
// la lectura del documento exigible; la justificación vive en `justificacion.ts`.
//
// EDICIÓN: RITE (RD 1027/2007), consolidado de 02-08-2022, sin cambios de 2023 a
// 2026 (K-MEM.19); DB-HE consolidado de 14-06-2022 (K-MEM.20).
// VERIFICACIÓN (research/verificacion-memoria.md, K-MEM.4, 5 y 19): art. 15, 16.2
// y 17.2, tabla 1.4.1.1, IT 1.1.4.2.1, IT 1.1.4.3, IT 1.2.3, IT 1.2.4.4 e
// IT 1.2.4.5.2 cotejados en la imagen del BOE consolidado. No se codifican: el
// aislamiento de las redes de ACS (tabla sin transcribir), la IT 1.2.4.1 (sin
// rendimientos mínimos: diseño ecológico) ni temperaturas de ACS (el RITE remite
// a la norma de legionela, sin confirmar).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_RITE = {
  db: "RITE",
  edicion: "RD 1027/2007, consolidado 02-08-2022",
  fecha: "2022-08-02",
  fuente: "BOE-A-2007-15820 (cotejado en imagen, K-MEM.19)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_RITE = "RITE (RD 1027/2007, consolidado 02-ago-2022) · DB-HE (consolidado 14-jun-2022)";

/** DB-HE, HE 2 (p. 22): la exigencia se desarrolla en el RITE. */
export const HE2 = tablaCTE(
  { db: "DB-HE2", edicion: "Consolidado 14-06-2022", fecha: "2022-06-14", articulo: "HE 2", fuente: "codigotecnico.org · DBHE.pdf (cotejado en texto, K-MEM.4)" },
  {
    literal:
      "Esta exigencia se desarrolla actualmente en el vigente Reglamento de Instalaciones Térmicas en los Edificios (RITE), y su aplicación quedará definida en el proyecto del edificio.",
  } as const,
);

/**
 * Art. 15.1 y 15.2: documento por la potencia térmica nominal en generación de
 * calor o frío. Más de 70 kW, proyecto (específico o integrado, art. 16.2); de 5 a
 * 70 kW, memoria técnica (de instalador habilitado o técnico titulado competente,
 * art. 17.2); menos de 5 kW, no es preceptiva. Con varios generadores, la suma de
 * los necesarios para cubrir el servicio, sin la solar térmica.
 */
export const DOCUMENTO_RITE = tablaCTE(
  { ...PROC_RITE, articulo: "art. 15.1 y 15.2" },
  {
    memoriaDesde_kW: 5,
    proyectoMasDe_kW: 70,
  } as const,
);

/** IT 1.1.4.1.2, tabla 1.4.1.1: condiciones interiores de diseño. */
export const CONDICIONES_INTERIORES = tablaCTE(
  { ...PROC_RITE, articulo: "IT 1.1.4.1.2", tabla: "tabla 1.4.1.1" },
  {
    verano: { temperatura_C: "23…25", humedad_pct: "45…60" },
    invierno: { temperatura_C: "21…23", humedad_pct: "40…50" },
  } as const,
);

/**
 * IT 1.2.4.4: reparto de gastos cuando la instalación da servicio a más de un
 * usuario; IT 1.2.4.5.2: recuperación de calor del aire expulsado por medios
 * mecánicos por encima de 0,28 m³/s.
 */
export const EFICIENCIA_RITE = tablaCTE(
  { ...PROC_RITE, articulo: "IT 1.2.4.4 y IT 1.2.4.5.2" },
  {
    recuperacionMasDe_m3_s: 0.28,
  } as const,
);

export type Documento = "ninguno" | "memoria" | "proyecto";

/** El documento exigible por la potencia (art. 15.1). */
export function documentoExigible(potencia_kW: number): Documento {
  const D = DOCUMENTO_RITE.datos;
  if (potencia_kW > D.proyectoMasDe_kW) return "proyecto";
  if (potencia_kW >= D.memoriaDesde_kW) return "memoria";
  return "ninguno";
}
