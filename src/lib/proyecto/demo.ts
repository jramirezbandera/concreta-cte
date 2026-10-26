// =============================================================================
// crearProyectoDemo — feature-6 T2.6: el proyecto Demo precargado que enseña el
// producto sin pedir nada (plurifamiliar con locales en Cáceres).
//
// Determinista por contrato: cero Date.now/Math.random — `nowIso` llega como
// parámetro. Coherencia POR CONSTRUCCIÓN: los `inputs` sembrados de cada
// justificación materializan a mano los campos heredados del contexto (zona
// térmica HS3, zona climática HE1, presión de acometida…). El estado de cada
// justificación no se guarda: se calcula (feature-16, `lib/obra/evaluar.ts`).
//
// Dos capas: `crearProyectoDemoConSupuestos` deja lo habitual y lo supuesto (los
// tests lo usan para ver cómo salen los avisos) y `crearProyectoDemo`, el que
// siembra la app, lo completa para que el ejemplo salga entero.
// =============================================================================

import { hs3EstadoDefaults, type Hs3Estado } from "../../modules/hs3/estado";
import { hs4EstadoDefaults, type Hs4Estado } from "../../modules/hs4/estado";
import { hs5EstadoDefaults, type Hs5Estado } from "../../modules/hs5/estado";
import { hs6EstadoDefaults, type Hs6Estado } from "../../modules/hs6/estado";
import { hs1EstadoDefaults, type Hs1Estado } from "../../modules/hs1/estado";
import { he1EstadoDefaults, type He1Estado } from "../../modules/he1/estado";
import { habEstadoDefaults, type EstanciaHab, type HabEstado } from "../../modules/hab/estado";
import { he3EstadoDefaults, type He3Estado } from "../../modules/he3/estado";
import { ictEstadoDefaults } from "../../modules/ict/estado";
import { riteEstadoDefaults, type RiteEstado } from "../../modules/rite/estado";
import { hs2EstadoDefaults, type Hs2Estado } from "../../modules/hs2/estado";
import { si3EstadoDefaults, type Si3Estado } from "../../modules/si3/estado";
import { sua2EstadoDefaults, type Sua2Estado } from "../../modules/sua2/estado";
import { hrEstadoDefaults, type HrEstado } from "../../modules/hr/estado";
import { he4EstadoDefaults, type He4Estado } from "../../modules/he4/estado";
import { rebtEstadoDefaults, type RebtEstado } from "../../modules/rebt/estado";
import type { Edificio } from "../edificio/tipos";
import type { AccEstado } from "../../modules/acc/estado";
import type { EstudioSeguridadSalud } from "../ebss/tipos";
import { COMPUTAN_HABITUAL, type TipoEstancia } from "../habitabilidad/norma";
import type { ZonaClimatica } from "../../modules/he1/tablas";
import {
  LETRAS_INVIERNO,
  zonaClimaticaDe,
  zonaTermicaHS3De,
} from "../../data/zonasClimaticasHE";
import { edificioDeCaso } from "../edificio/casos";
import { resumenEdificio } from "../edificio/derivar";
import type {
  DatosGenerales,
  JustificacionEnProyecto,
  JustificacionKey,
  Proyecto,
} from "./tipos";

/** Id FIJO del proyecto Demo (clave estable en el índice de proyectos). */
export const DEMO_ID = "demo";

/** Nombre visible del proyecto Demo. */
export const DEMO_NOMBRE = "Demo — Vivienda C/ Mayor 12";

/**
 * Versión de la Demo: al cambiar lo que siembra, se sube y el arranque cambia la
 * Demo guardada por la nueva (`inicializarStorage`). Lo que se haya tocado en
 * ella se pierde: es el ejemplo, no un proyecto.
 */
export const DEMO_VERSION = "2";

// -----------------------------------------------------------------------------
// DATOS DE LA OBRA DEL DEMO — obra nueva en Cáceres (459 m), Zona de radón II
// (Apéndice B del DB-HS6) y 250 kPa de acometida. El edificio es el caso
// «Plurifamiliar con locales» (feature-12): PB con local sin uso y portal,
// P1–P3 con dos viviendas por planta, sótano de garaje, trasteros e
// instalaciones, cubierta plana no transitable.
//
// HS5 (feature-14) y HS4, HS3, HS6 y HE1 (feature-15) salen del edificio, con
// las decisiones habituales.
// -----------------------------------------------------------------------------

const DATOS_GENERALES_DEMO: DatosGenerales = {
  municipio: "Cáceres",
  municipioIne: "10037", // código INE (feature-9)
  provincia: "Cáceres",
  altitud_m: 459,
  intervencion: "obra_nueva",
  tienePiscina: false,
  // Zona de radón: DATO DEL PROYECTISTA, pendiente de comprobar en el Apéndice
  // B. No está verificada y hay indicio de que Cáceres no figura en él
  // (research/verificacion-hs6-v4.md, nota 10.2); el Demo la conserva para
  // enseñar la protección completa de una zona II.
  zonaRadon: "II",
  presionAcometida_kPa: 250,
  // Cota del alcantarillado en la acometida (feature-14): dato de la obra del
  // Demo, como la presión. La zona pluviométrica NO se rellena: Cáceres cae
  // junto a los límites de zona e isoyeta de la Figura B.1 y no hay relación
  // oficial por municipio (research/verificacion-hs5-pluviales.md, A6e). El
  // Demo enseña el aviso de la intensidad supuesta.
  cotaAlcantarillado_m: -1.2,
  // HS1 (feature-17). Entorno urbano: Cáceres capital es «zona urbana» (terreno
  // tipo IV, por la definición literal de HS 1 · 2.3.1 b). El estudio
  // geotécnico es de DEMOSTRACIÓN, como la cota del alcantarillado: freático no
  // detectado en un reconocimiento de 10 m y Ks entre 10⁻⁵ y 10⁻² cm/s. Las zonas
  // pluviométrica y eólica NO se rellenan: Cáceres cae junto a los límites de las
  // figuras 2.4 y 2.5 y no hay relación oficial por municipio
  // (research/verificacion-hs1.md, 6.3 y 6.4). El Demo enseña el aviso del clima
  // supuesto; con 13 m de altura la zona eólica no influye y no se pide.
  terrenoTipo: "IV",
  nivelFreatico: { tipo: "no_detectado", reconocimiento_m: 10 },
  permeabilidadTerreno: "medio",
  // Los planos de las instalaciones (feature-33 y 34): la memoria remite a ellos.
  planos: { hs4: "I05", hs5: "I06 e I07", rebt: "I08–I11" },
  // Régimen de la promoción (feature-36): el plurifamiliar del Demo, en
  // propiedad horizontal; lo demás, sin contestar.
  promocion: { propiedadHorizontal: true },
  // Habitabilidad (feature-32): NORMA DE DEMOSTRACIÓN, como el estudio
  // geotécnico. No es la de Cáceres: la herramienta no trae normas municipales
  // sin cotejar, y el rótulo lo dice para que no pase a una memoria real.
  habitabilidad: {
    normas: [
      {
        id: "demo",
        referencia: "Norma de demostración (sustituir por la del municipio)",
        ambito: "municipal",
        iluminacion: { fraccion: 0.1, mide: "hueco" },
        ventilacion: "conjunta",
        computan: [...COMPUTAN_HABITUAL],
      },
    ],
  },
};

/**
 * HE 3 (feature-36): potencias e iluminancias de DEMOSTRACIÓN, como las estancias,
 * por planta: portal, garaje, trasteros y cuarto de instalaciones.
 */
const HE3_DEMO: He3Estado = {
  ...he3EstadoDefaults,
  zonas: {
    z3: { potencia_W: 175, iluminancia_lx: 150 },
    z4: { potencia_W: 840, iluminancia_lx: 75 },
    z5: { potencia_W: 108, iluminancia_lx: 100 },
    z6: { potencia_W: 50, iluminancia_lx: 150 },
  },
};

/**
 * HE 2 · RITE (feature-36): potencias de DEMOSTRACIÓN, como las de HE 3. La bomba
 * de calor aire-aire reversible de cada vivienda y la de ACS de HE 4.
 */
const RITE_DEMO: RiteEstado = {
  ...riteEstadoDefaults,
  potenciaCalor_kW: 3.6,
  potenciaFrio_kW: 3.4,
  scop: 4.1,
  seer: 6.5,
  potenciaAcs_kW: 1.8,
  acumulacion_l: 200,
};

/**
 * Accesibilidad autonómica (feature-36): Cáceres está en Extremadura, sin
 * plantilla en la herramienta. NORMA DE DEMOSTRACIÓN, como la de habitabilidad:
 * el rótulo lo dice para que no pase a una memoria real.
 */
const ACC_DEMO: AccEstado = { normaOtra: "Norma de accesibilidad de demostración (sustituir por la de la comunidad)" };

// -----------------------------------------------------------------------------
// LO QUE COMPLETA EL DEMO — todo DE DEMOSTRACIÓN, como el estudio geotécnico:
// con ello el ejemplo que siembra la app sale entero (`crearProyectoDemo`).
// -----------------------------------------------------------------------------

/**
 * Los datos de la obra que el Demo con supuestos deja sin dar. El clima, el rayo
 * y el ruido son SUPUESTOS DE DEMOSTRACIÓN, pendientes de lectura en las
 * figuras; ninguno es «el valor del DB para Cáceres»: HS 1, la envolvente III/B
 * de las notas 6.3 y 6.4 de research/verificacion-hs1.md; HS 5, la envolvente
 * A-40 (125 mm/h) de la A6e de research/verificacion-hs5-pluviales.md; Ng y Ld,
 * valores tipo. Los firmantes del documento no van: son del estudio de quien usa
 * la app (Inicio, «Tu estudio»).
 */
const DATOS_COMPLETOS_DEMO: Partial<DatosGenerales> = {
  zonaPluviometricaHs1: "III",
  zonaEolica: "B",
  pluviometria: { zona: "A", isoyeta: 40 },
  densidadImpactosNg: 2,
  ldZona: 60,
  documento: {
    titulo: "Proyecto de ejecución de edificio de 6 viviendas, local y garaje",
    fase: "basico_ejecucion",
    emplazamiento: "Calle Mayor nº 12, Cáceres",
    promotor: "Promotora de demostración, S. L.",
  },
};

/**
 * Lo que El edificio del caso no dice: la superficie construida de cada zona,
 * qué es el cuarto de instalaciones, el uso previsto del local y el ascensor.
 */
const CONSTRUIDA_DEMO: Record<string, number> = { z1: 186, z2: 178, z3: 42, z4: 468, z5: 44, z6: 17 };

function completarEdificioDemo(e: Edificio): Edificio {
  const edificio = structuredClone(e);
  for (const g of edificio.grupos) {
    for (const z of g.zonas) {
      const construida = CONSTRUIDA_DEMO[z.id];
      if (construida !== undefined) z.superficieConstruida_m2 = construida;
      if (z.uso === "local_sin_uso") z.usoPrevisto = "comercial";
      if (z.uso === "instalaciones") z.cuarto = "contadores_electricidad";
    }
  }
  edificio.ascensor = true;
  return edificio;
}

/** Las decisiones y los datos de cada módulo que el Demo con supuestos deja en lo habitual. */
const DECISIONES_DEMO: Partial<Record<JustificacionKey, object>> = {
  hs2: { ...hs2EstadoDefaults, recogida: "calle", dobles: { A: 1, B: 1 } } satisfies Hs2Estado,
  si3: { ...si3EstadoDefaults, recorrido_m: 22, recorridoGaraje_m: 31 } satisfies Si3Estado,
  sua2: { ...sua2EstadoDefaults, alturaGaraje_m: 2.3 } satisfies Sua2Estado,
  hr: {
    ...hrEstadoDefaults,
    // Qué linda con qué: las dos viviendas de cada planta, y el portal y el local bajo la P1.
    colindancias: { "entre:g1": true, "debajo:z3": true, "debajo:z2": true },
    huecosDormitorio: 20,
    huecosEstancia: 30,
  } satisfies HrEstado,
  he4: { ...he4EstadoDefaults, scop: 2.9, perdidas_pct: 10 } satisfies He4Estado,
  rebt: {
    ...rebtEstadoDefaults,
    ascensor_kW: 11.5,
    otrosServicios_kW: 1.5,
    garaje_kW: 14,
    longitudLga_m: 12,
    longitudDi_m: 22,
    resistividad_ohm_m: 300,
  } satisfies RebtEstado,
};

/**
 * El estudio básico de seguridad y salud (feature-35), DE DEMOSTRACIÓN. El
 * presupuesto y las jornadas NO son realistas para este edificio: se quedan por
 * debajo de los umbrales del art. 4 del RD 1627/1997 para que el ejemplo
 * enseñe el estudio básico (con cifras realistas haría falta el estudio
 * completo, que la app no redacta). El centro asistencial lleva rótulo para que
 * no pase a un estudio real.
 */
const SEGURIDAD_SALUD_DEMO: EstudioSeguridadSalud = {
  presupuesto: { pem: 300_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 },
  manoDeObra: { plazoDias: 100, maxTrabajadores: 8, jornadas: 480 },
  subterraneas: false,
  coordinacion: { variosProyectistas: false, variasEmpresas: true },
  entorno: {
    centroAsistencial: { nombre: "Centro asistencial de demostración (sustituir por el más próximo)", distancia_km: 3, tiempo_min: 10 },
    viaPublica: true,
    edificioEnUso: false,
    servicios: { linea_aerea: false, linea_enterrada: true, transformador: false, gas: false, agua: true, saneamiento: true, telecomunicaciones: true },
  },
  medios: { gruaTorre: true, gruaMovil: false },
  planos: "SS01–SS02",
};

/**
 * Los avisos que el Demo da por revisados, por módulo: los que solo piden
 * confirmar algo (la presión de la compañía, las longitudes tipo, los casos
 * especiales que resuelve un criterio).
 */
const REVISADOS_DEMO: Partial<Record<JustificacionKey, string[]>> = {
  hs4: ["presion-red-supuesta", "longitudes-estimadas"],
  hs5: ["garaje-s1-bombeo"],
  hs6: ["nucleo-garaje"],
  si6: ["sector-sotano"],
  sua3: ["cierrapuertas"],
  sua9: ["viviendas-accesibles"],
  hr: ["local"],
  he5: ["mixto"],
  he6: ["mixto"],
};

/** Una estancia del Demo: [id, nombre, tipo, Su, hueco]. */
type FilaEstancia = [string, string, TipoEstancia, number, number | null];

function estancias(filas: FilaEstancia[]): EstanciaHab[] {
  return filas.map(([id, nombre, tipo, util_m2, hueco_m2]) => ({ id, nombre, tipo, util_m2, hueco_m2, acristalada_m2: null, practicable_m2: null }));
}

/** Las estancias de las viviendas tipo A y B del Demo (planos de demostración). */
const ESTANCIAS_DEMO: HabEstado["estancias"] = {
  A: estancias([
    ["e1", "Estar-comedor", "estar_comedor", 26, 4.2],
    ["e2", "Cocina", "cocina", 10, 1.6],
    ["d1", "Dormitorio principal", "dormitorio", 14, 2.1],
    ["d2", "Dormitorio 2", "dormitorio", 11, 1.8],
    ["d3", "Dormitorio 3", "dormitorio", 9, 1.5],
    ["b1", "Baño 1", "bano", 5, null],
    ["b2", "Baño 2", "bano", 4, null],
  ]),
  B: estancias([
    ["e1", "Estar-comedor", "estar_comedor", 22, 3.6],
    ["e2", "Cocina", "cocina", 8, 1.2],
    ["d1", "Dormitorio principal", "dormitorio", 13, 2],
    ["d2", "Dormitorio 2", "dormitorio", 9, 1.5],
    ["b1", "Baño", "bano", 5, null],
    ["a1", "Aseo", "aseo", 2.5, null],
  ]),
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/**
 * Empaqueta unos inputs de módulo como estado persistido de la justificación.
 * Los inputs viajan como copia superficial tipada `Record<string, unknown>` (la
 * forma opaca que persiste el proyecto); las estructuras internas ya son
 * copias frescas (structuredClone en el caller).
 */
function justificacionDemo(inputs: object, revisados?: string[]): JustificacionEnProyecto {
  return {
    inputs: { ...inputs } as Record<string, unknown>,
    schemaVersion: "1",
    ...(revisados ? { revisados: [...revisados] } : {}),
  };
}

/**
 * Letra de invierno HE1 (α/A/B/C/D/E) de una zona del Anejo B (p.ej. "C4" → "C").
 * HE1 trabaja con la LETRA, no con la zona completa provincia+altitud.
 */
function letraInviernoDe(zonaAnejoB: string): ZonaClimatica {
  const letra = zonaAnejoB.charAt(0);
  if (!(LETRAS_INVIERNO as readonly string[]).includes(letra)) {
    throw new Error(`Zona del Anejo B sin letra de invierno reconocible: "${zonaAnejoB}"`);
  }
  return letra as ZonaClimatica;
}

// -----------------------------------------------------------------------------
// CONSTRUCTORES DEL DEMO
// -----------------------------------------------------------------------------

/**
 * El Demo con las decisiones habituales y lo que no se sabe SUPUESTO: cada
 * módulo enseña sus avisos. Lo usan los tests para ver cómo sale lo supuesto; la
 * app siembra `crearProyectoDemo`, que lo completa. Pura y determinista: mismo
 * `nowIso` → mismo proyecto (deep-equal). Cada llamada devuelve objetos FRESCOS
 * (sin referencias compartidas con los defaults de los módulos).
 */
export function crearProyectoDemoConSupuestos(nowIso: string): Proyecto {
  const dg = DATOS_GENERALES_DEMO;
  const edificio = edificioDeCaso("plurifamiliar_locales");
  const resumen = resumenEdificio(edificio);

  // Contexto heredado, calculado de las TABLAS (nunca de memoria):
  //   - Zona térmica HS3 de Cáceres a 459 m (Tabla 4.4 del DB-HS3) → "Z".
  //   - Zona climática del Anejo B ("C4") → letra de invierno HE1 ("C").
  // Ambas funciones solo devuelven null con provincia desconocida o altitud no
  // finita; con los datos fijos del Demo eso es imposible (fail-fast honesto).
  const zt = zonaTermicaHS3De(dg.provincia, dg.altitud_m);
  const zc = zonaClimaticaDe(dg.provincia, dg.altitud_m);
  if (zt === null || zc === null) {
    throw new Error(`Contexto no derivable para ${dg.provincia} a ${dg.altitud_m} m`);
  }

  // Inputs sembrados = defaults del módulo con los campos heredados
  // MATERIALIZADOS de forma coherente con los datos generales del Demo.
  // structuredClone ⇒ arrays/objetos anidados frescos (no se comparten los de
  // los defaults, que deben permanecer inmutables).
  // HS1 sale de El edificio y de los datos de la obra (feature-17), con las
  // decisiones habituales.
  const hs1Inputs: Hs1Estado = structuredClone({ ...hs1EstadoDefaults });
  // HS3 sale de El edificio (feature-15), con la zona térmica heredada.
  const hs3Inputs: Hs3Estado = structuredClone({ ...hs3EstadoDefaults, zonaTermica: zt.zona });
  // HS4 sale de El edificio (feature-15); la presión es el dato de la obra.
  const hs4Inputs: Hs4Estado = structuredClone({ ...hs4EstadoDefaults });
  // HS5 sale de El edificio (feature-14) con las decisiones habituales.
  const hs5Inputs: Hs5Estado = structuredClone({
    ...hs5EstadoDefaults,
    uso: "privado",
    numPlantas: resumen.plantasSobreRasante,
    cubiertaTransitable: resumen.cubiertaTransitable,
  });
  // HS6 sale de El edificio (feature-15); la zona y el municipio, de la obra.
  const hs6Inputs: Hs6Estado = structuredClone({
    ...hs6EstadoDefaults,
    municipio: dg.municipio,
    zona: dg.zonaRadon,
  });
  // HE1 sale de El edificio (feature-15); la zona, de la obra, y el clima de
  // enero, de la tabla C.1 del DA DB-HE/2 por la provincia y la altitud.
  const he1Inputs: He1Estado = structuredClone({
    ...he1EstadoDefaults,
    zonaClimatica: letraInviernoDe(zc.zona),
  });

  return {
    id: DEMO_ID,
    nombre: DEMO_NOMBRE,
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: { ...dg },
    edificio,
    justificaciones: {
      hs1: justificacionDemo(hs1Inputs),
      hs3: justificacionDemo(hs3Inputs),
      hs4: justificacionDemo(hs4Inputs),
      hs5: justificacionDemo(hs5Inputs),
      hs6: justificacionDemo(hs6Inputs),
      he1: justificacionDemo(he1Inputs),
      hab: justificacionDemo(structuredClone({ ...habEstadoDefaults, estancias: ESTANCIAS_DEMO })),
      he3: justificacionDemo(structuredClone(HE3_DEMO)),
      ict: justificacionDemo(structuredClone(ictEstadoDefaults)),
      rite: justificacionDemo(structuredClone(RITE_DEMO)),
      acc: justificacionDemo(structuredClone(ACC_DEMO)),
    },
  };
}

/**
 * El Demo que siembra la app: el de los supuestos con todo rellenado, para que
 * el ejemplo salga entero, sin avisos ni nada por decidir. Los datos que añade
 * son DE DEMOSTRACIÓN, como los demás del Demo. HE 0 y HE 1 los verifica HULC:
 * lleva el programa y la referencia del documento, no resultados (serían
 * inventados; los da el informe que se lee en La obra).
 */
export function crearProyectoDemo(nowIso: string): Proyecto {
  const p = crearProyectoDemoConSupuestos(nowIso);
  const justificaciones = { ...p.justificaciones };
  for (const key of new Set([...Object.keys(DECISIONES_DEMO), ...Object.keys(REVISADOS_DEMO)]) as Set<JustificacionKey>) {
    const inputs = DECISIONES_DEMO[key] ?? justificaciones[key]?.inputs ?? {};
    justificaciones[key] = justificacionDemo(structuredClone(inputs), REVISADOS_DEMO[key]);
  }
  justificaciones.he0he1_global = { inputs: {}, schemaVersion: "1", programa: "HULC", refExterna: "Anejo de eficiencia energética, HULC (documento de demostración)" };
  return {
    ...p,
    datosGenerales: { ...p.datosGenerales, ...structuredClone(DATOS_COMPLETOS_DEMO) },
    edificio: completarEdificioDemo(p.edificio),
    justificaciones,
    seguridadSalud: structuredClone(SEGURIDAD_SALUD_DEMO),
  };
}
