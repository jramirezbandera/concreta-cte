// =============================================================================
// ICT — Infraestructuras comunes de telecomunicaciones (feature-36, paso 3).
// Valores normativos como DATOS versionados con procedencia. Aquí SOLO datos y
// la lectura por número de PAU; la justificación vive en `justificacion.ts`.
//
// EDICIÓN: RD 346/2011, Reglamento de ICT, consolidado de 26-03-2025 (el
// RD 250/2025 solo toca el Anexo I, TDT); RD-ley 1/1998, consolidado de
// 10-05-2014.
// VERIFICACIÓN (research/verificacion-memoria.md, K-MEM.7, 8 y 21): ámbito, art. 9
// y cifras del Anexo III cotejados en la imagen del BOE consolidado. No se
// codifica la regla exacta de elección del recinto (ap. 4.5, sin transcribir),
// la arqueta de más de 100 PAU (el ap. 5.1 y el apéndice 3 no coinciden), los
// registros secundarios (umbrales sin transcribir) ni las tomas del Anexo II.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_ICT = {
  db: "RD 346/2011",
  edicion: "Consolidado 26-03-2025",
  fecha: "2025-03-26",
  fuente: "BOE-A-2011-5834 (cotejado en imagen, K-MEM.21)",
} as const;

export const PROC_RDL_ICT = {
  db: "RD-ley 1/1998",
  edicion: "Consolidado 10-05-2014",
  fecha: "2014-05-10",
  fuente: "BOE-A-1998-4769 (cotejado en imagen, K-MEM.21)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_ICT = "RD 346/2011 (consolidado 26-mar-2025) · RD-ley 1/1998 (consolidado 10-may-2014)";

/** Medidas de un recinto o registro [mm]. */
export interface Medidas {
  a: number;
  b: number;
  c: number;
}

/** Una fila de tabla por número de PAU: vale hasta `hasta` (null = sin límite). */
interface FilaPau<T> {
  hasta: number | null;
  valor: T;
}

function porPau<T>(filas: readonly FilaPau<T>[], pau: number): T | undefined {
  return filas.find((f) => f.hasta === null || pau <= f.hasta)?.valor;
}

/**
 * Ámbito (RD-ley 1/1998, arts. 2 y 3.1; Reglamento, art. 3): edificios en
 * propiedad horizontal, o arrendados más de un año salvo los de una sola
 * vivienda; proyecto técnico para la construcción o la rehabilitación integral;
 * en coordinación con el autor del proyecto de edificación (art. 9).
 */
export const AMBITO_ICT = tablaCTE(
  { ...PROC_RDL_ICT, articulo: "arts. 2 y 3.1" },
  {
    ambito: "edificios acogidos, o que deban acogerse, al régimen de propiedad horizontal, o arrendados por plazo superior a un año, salvo los que alberguen una sola vivienda",
    proyecto: "no se autoriza la construcción o rehabilitación integral sin el proyecto técnico de ICT unido al proyecto arquitectónico",
    coordinacion: "en coordinación con el autor del proyecto de edificación (Reglamento, art. 9)",
  } as const,
);

/**
 * Anexo III, 4.5.3 y 5.5: ámbito y medidas del RITU (alto × ancho × profundo).
 * RITU: hasta tres alturas y planta baja y 16 PAU como máximo (y conjuntos de
 * viviendas unifamiliares, que la app no distingue). RITU-A: más de tres alturas
 * con hasta 16 PAU, o de 17 a 30 PAU.
 */
export const RITU_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 4.5.3 y 5.5" },
  {
    ambito: { plantasSobreRasanteMax: 4, pauMax: 16 },
    hasta5SinComunes: { a: 1000, b: 500, c: 300 },
    hasta5ConComunes: { a: 1000, b: 1000, c: 500 },
    filas: [
      { hasta: 16, valor: { a: 2000, b: 1000, c: 500 } },
      { hasta: 30, valor: { a: 2000, b: 1500, c: 1000 } },
      { hasta: null, valor: { a: 2000, b: 2000, c: 1500 } },
    ] satisfies FilaPau<Medidas>[],
  } as const,
);

export const RITU_A_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 4.5.3 y 5.5" },
  {
    ambito: { pauConMasAlturasMax: 16, pauMax: 30 },
    filas: [
      { hasta: 20, valor: { a: 2000, b: 2000, c: 500 } },
      { hasta: 30, valor: { a: 2000, b: 3000, c: 500 } },
    ] satisfies FilaPau<Medidas>[],
  } as const,
);

/** Anexo III, 5.5: RITI y RITS (alto × ancho × profundo), los dos con la misma tabla. */
export const RITI_RITS_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.5" },
  {
    filas: [
      { hasta: 20, valor: { a: 2000, b: 1000, c: 500 } },
      { hasta: 45, valor: { a: 2000, b: 1500, c: 500 } },
      { hasta: 74, valor: { a: 2300, b: 2000, c: 1000 } },
      { hasta: null, valor: { a: 2300, b: 2000, c: 2000 } },
    ] satisfies FilaPau<Medidas>[],
  } as const,
);

/**
 * Anexo III, 5.1: arqueta de entrada (largo × ancho × profundo). La de más de
 * 100 PAU no se imprime: el apéndice 3 da otra cifra (K-MEM.21).
 */
export const ARQUETA_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.1" },
  {
    filas: [
      { hasta: 20, valor: { a: 400, b: 400, c: 600 } },
      { hasta: 100, valor: { a: 600, b: 600, c: 800 } },
    ] satisfies FilaPau<Medidas>[],
  } as const,
);

/** Anexo III, 5.2: canalización externa, tubos de 63 mm; arquetas de paso de 400 × 400 × 400 cada 50 m. */
export const CANALIZACION_EXTERNA_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.2" },
  {
    diametro_mm: 63,
    arquetaPaso: { a: 400, b: 400, c: 400 },
    arquetaPasoCada_m: 50,
    filas: [
      { hasta: 4, valor: 3 },
      { hasta: 20, valor: 4 },
      { hasta: 40, valor: 5 },
      { hasta: null, valor: 6 },
    ] satisfies FilaPau<number>[],
  } as const,
);

/** Anexo III, 5.7: canalización principal, tubos de 50 mm; con más de 30 PAU, cálculo específico. */
export const CANALIZACION_PRINCIPAL_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.7" },
  {
    diametro_mm: 50,
    filas: [
      { hasta: 10, valor: 5 },
      { hasta: 20, valor: 6 },
      { hasta: 30, valor: 7 },
    ] satisfies FilaPau<number>[],
  } as const,
);

/** Anexo III, 5.11: registro de terminación de red, empotrado, con 2 tomas de corriente, entre 200 y 2300 mm del suelo. */
export const RTR_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.11" },
  {
    medidas: { a: 500, b: 600, c: 80 },
    tomasCorriente: 2,
    alturaMin_mm: 200,
    alturaMax_mm: 2300,
  } as const,
);

/**
 * Anexo III, 5.13: registros de toma de la vivienda. En dos estancias
 * principales, 2 de pares trenzados, 1 coaxial y 1 de RTV en cada una, y fibra
 * óptica en una de ellas; en el resto (sin baños ni trasteros), 1 de pares
 * trenzados y 1 de RTV; y 1 configurable junto al PAU.
 */
export const TOMAS_ICT = tablaCTE(
  { ...PROC_ICT, articulo: "Anexo III, 5.13" },
  {
    principales: 2,
    porPrincipal: { paresTrenzados: 2, coaxial: 1, rtv: 1 },
    fibraEnPrincipales: 1,
    porResto: { paresTrenzados: 1, rtv: 1 },
    configurableJuntoPau: 1,
  } as const,
);

/** «400 × 400 × 600 mm» */
export function textoMedidas(m: Medidas): string {
  return `${m.a.toLocaleString("es-ES")} × ${m.b.toLocaleString("es-ES")} × ${m.c.toLocaleString("es-ES")} mm`;
}

export type RecintoIct = "riti_rits" | "ritu" | "ritu_a";

/** ¿Está el recinto dentro de su ámbito (4.5.3)? RITI + RITS, siempre. */
export function recintoAdmitido(r: RecintoIct, pau: number, plantasSobreRasante: number): boolean {
  if (r === "ritu") return pau <= RITU_ICT.datos.ambito.pauMax && plantasSobreRasante <= RITU_ICT.datos.ambito.plantasSobreRasanteMax;
  if (r === "ritu_a") {
    const masAlturas = plantasSobreRasante > RITU_ICT.datos.ambito.plantasSobreRasanteMax;
    return pau <= RITU_A_ICT.datos.ambito.pauMax && (masAlturas || pau > RITU_A_ICT.datos.ambito.pauConMasAlturasMax);
  }
  return true;
}

/** Las medidas mínimas del recinto (de cada uno, en RITI + RITS). */
export function medidasRecinto(r: RecintoIct, pau: number, conZonasComunes: boolean): Medidas | undefined {
  if (r === "ritu") {
    if (pau <= 5) return conZonasComunes ? RITU_ICT.datos.hasta5ConComunes : RITU_ICT.datos.hasta5SinComunes;
    return porPau(RITU_ICT.datos.filas, pau);
  }
  if (r === "ritu_a") return porPau(RITU_A_ICT.datos.filas, pau);
  return porPau(RITI_RITS_ICT.datos.filas, pau);
}

export function arquetaEntrada(pau: number): Medidas | undefined {
  return porPau(ARQUETA_ICT.datos.filas, pau);
}

export function tubosExternos(pau: number): number {
  return porPau(CANALIZACION_EXTERNA_ICT.datos.filas, pau) ?? 6;
}

/** Tubos de la canalización principal; undefined con más de 30 PAU (cálculo específico). */
export function tubosPrincipal(pau: number): number | undefined {
  return porPau(CANALIZACION_PRINCIPAL_ICT.datos.filas, pau);
}
