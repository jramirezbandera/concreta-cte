// =============================================================================
// Accesibilidad autonómica (feature-36, paso 5). Valores normativos como DATOS
// versionados con procedencia. Solo Andalucía trae plantilla (decisión 7): el
// Decreto 293/2009; en otra comunidad, la norma la declara el proyectista.
//
// EDICIÓN: Decreto 293/2009, Reglamento de accesibilidad de Andalucía (BOJA
// núm. 140, 21-07-2009; corrección BOJA núm. 219, 10-11-2009), sin consolidado
// oficial; Ley 4/2017, art. 58.1 (BOE consolidado); Orden de 9-01-2012 (BOJA
// núm. 12), fichas III y IV.
// VERIFICACIÓN (research/verificacion-memoria.md, K-MEM.14, 15 y 22): arts. 2.1 j),
// 104, 106.2, 106.4, 106.5, 106.6 y DA 1.ª cotejados en la imagen del BOJA; la
// reserva de viviendas, en la Ley 4/2017 y la Ficha IV. No se codifican: las
// medidas de la Ficha III (anchos, rampas, escaleras: sin transcribir), el
// art. 111.2 ni la reserva con menos de 17 viviendas (sin confirmar).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_D293 = {
  db: "Decreto 293/2009",
  edicion: "BOJA núm. 140, 21-07-2009; corrección BOJA núm. 219, 10-11-2009",
  fecha: "2009-07-21",
  fuente: "BOJA (cotejado en imagen, K-MEM.22)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_D293 = "Decreto 293/2009 (BOJA 140/2009, corr. BOJA 219/2009) · Ley 4/2017, art. 58.1 · Orden de 9-01-2012";

/** La cita corta del Decreto en la memoria. */
export const CITA_D293 = "Decreto 293/2009, de 7 de julio (BOJA núm. 140, de 21-07-2009; corrección de errores en BOJA núm. 219, de 10-11-2009)";

/**
 * Art. 106.2 (Ficha III, «comunicación vertical»): con dos plantas sobre rasante
 * (PB+1) y 6 viviendas o menos, reserva del espacio estructural para un ascensor
 * futuro; con dos plantas y más de 6 viviendas, o con tres o más plantas,
 * ascensor. 106.4: llega a los sótanos de aparcamiento. 106.5: exentas las
 * viviendas de autopromoción individual para uso propio. 106.6: en reformas con
 * imposibilidad física, ayudas técnicas.
 */
export const ASCENSOR_D293 = tablaCTE(
  { ...PROC_D293, articulo: "art. 106" },
  {
    plantasReserva: 2,
    viviendasReservaMax: 6,
    plantasAscensor: 3,
  } as const,
);

/**
 * Reserva de viviendas para personas con movilidad reducida en promociones
 * protegidas o de las Administraciones públicas (Ley 4/2017 art. 58.1, que
 * supera el art. 111.1; Orden de 9-01-2012, Ficha IV): de 17 a 25 viviendas, 1;
 * con más de 25, el 4 % redondeado (0,5 al alza).
 */
export const RESERVA_D293 = tablaCTE(
  { db: "Ley 4/2017", edicion: "BOE consolidado", articulo: "art. 58.1; Orden de 9-01-2012, Ficha IV", fuente: "BOE y BOJA (cotejado en imagen, K-MEM.22)" },
  {
    desde: 17,
    unaHasta: 25,
    porcentaje: 4,
  } as const,
);

/** Art. 104: los itinerarios accesibles de las zonas comunitarias. */
export const ITINERARIOS_D293 = tablaCTE(
  { ...PROC_D293, articulo: "art. 104" },
  {
    tramos: [
      "en las áreas de uso comunitario",
      "desde el exterior hasta las zonas comunitarias",
      "en cada planta, hasta las viviendas",
      "entre los servicios comunitarios y las viviendas",
      "desde el acceso hasta el ascensor, la rampa o el espacio del ascensor futuro",
    ],
  } as const,
);

export type ExigenciaVertical = "ninguna" | "reserva" | "ascensor";

/** Lo que pide el art. 106.2 por plantas sobre rasante y viviendas. */
export function exigenciaVertical(plantasSobreRasante: number, viviendas: number): ExigenciaVertical {
  const A = ASCENSOR_D293.datos;
  if (plantasSobreRasante >= A.plantasAscensor) return "ascensor";
  if (plantasSobreRasante === A.plantasReserva) return viviendas > A.viviendasReservaMax ? "ascensor" : "reserva";
  return "ninguna";
}

/** Viviendas reservadas en una promoción protegida o pública (sin confirmar por debajo de 17: 0). */
export function viviendasReservadas(viviendas: number): number {
  const R = RESERVA_D293.datos;
  if (viviendas < R.desde) return 0;
  if (viviendas <= R.unaHasta) return 1;
  return Math.round((viviendas * R.porcentaje) / 100);
}
