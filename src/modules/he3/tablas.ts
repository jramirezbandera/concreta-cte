// =============================================================================
// DB-HE 3 — Condiciones de las instalaciones de iluminación (feature-36, paso 2).
// Valores normativos como DATOS versionados con procedencia. Aquí SOLO datos y la
// fórmula del VEEI; la justificación vive en `justificacion.ts`.
//
// EDICIÓN: DB-HE consolidado de 14-06-2022 (sin versión posterior, K-MEM.20).
// VERIFICACIÓN (research/verificacion-memoria.md, K-MEM.6): cotejado en el texto
// de DBHE.pdf, pp. 23–27 y 44.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HE3 = {
  db: "DB-HE3",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHE.pdf, Sección HE 3 (cotejado en texto, K-MEM.6)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HE3 = "DB-HE (consolidado 14-jun-2022)";

/**
 * Tabla 3.1 (p. 25): VEEI límite [W/m² por cada 100 lux]. «Zonas comunes» (nota 4:
 * recibidor, vestíbulos, pasillos, escaleras, espacios de tránsito…) y
 * «Aparcamientos». La fila «Zonas comunes en edificios no residenciales» (6,0) no
 * es la de un residencial.
 */
export const VEEI_LIMITE_HE3 = tablaCTE(
  { ...PROC_HE3, tabla: "HE 3 tabla 3.1" },
  {
    zonasComunes: 4.0,
    aparcamiento: 4.0,
    zonasComunesNoResidencial: 6.0,
  } as const,
);

/**
 * Tabla 3.2 (p. 25): potencia máxima de iluminación PTOT/STOT [W/m²]. Aparcamiento,
 * 5; otros usos, 10 con Em ≤ 600 lux y 25 con más.
 */
export const POTENCIA_MAXIMA_HE3 = tablaCTE(
  { ...PROC_HE3, tabla: "HE 3 tabla 3.2" },
  {
    aparcamiento_W_m2: 5,
    otrosUsos: { hasta600lx_W_m2: 10, mas600lx_W_m2: 25, umbral_lx: 600 },
  } as const,
);

/**
 * 3.3 (p. 26): control. Encendido y apagado manual (no solo desde el cuadro) y
 * encendido por horario centralizado en cada cuadro; en zonas de uso esporádico
 * (aseos, pasillos, escaleras, zonas de tránsito, aparcamientos), lo segundo se
 * puede sustituir por detección de presencia temporizada o por pulsador
 * temporizado (pto 2). 3.4 pto 2: las zonas comunes de los residenciales no
 * tienen que aprovechar la luz natural.
 */
export const CONTROL_HE3 = tablaCTE(
  { ...PROC_HE3, articulo: "HE 3 ap. 3.3 y 3.4" },
  {
    manual: "sistema de encendido y apagado manual, externo al cuadro eléctrico",
    horario: "sistema de encendidos por horario centralizado en cada cuadro eléctrico",
    presencia: "sistema de detección de presencia temporizado",
    pulsador: "sistema de pulsador temporizado",
    luzNaturalExentaResidencial: true,
  } as const,
);

/** Anejo A (p. 44): VEEI = 100 · P / (S · Em), en W/m² por cada 100 lux. */
export function veei(potencia_W: number, superficie_m2: number, iluminancia_lx: number): number {
  return (100 * potencia_W) / (superficie_m2 * iluminancia_lx);
}
