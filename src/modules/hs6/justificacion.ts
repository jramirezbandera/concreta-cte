// =============================================================================
// DB-HS6 — La justificación entera (feature-15, HS6): qué toca el terreno según
// El edificio y las medidas de cada parte, con el contrato de resultado de
// REDISENO-V4 §3.2. PURA y DETERMINISTA; no redacta.
//
// La herramienta PROPONE la protección: la barrera se especifica por lo que pide
// el DB a la lámina tipo (espesor ≥ 2 mm y difusión < 1e-11 m²/s), sin inventar
// un producto; el garaje es el espacio de contención si está debajo; lo que apoya
// en el terreno lleva cámara ventilada o despresurización.
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Edificio, UsoZona, Zona } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { obraDeZona, type ObraExistente } from "../../lib/proyecto/alcance";
import { plantasDe } from "../../lib/edificio/derivar";
import type { Hs6Estado } from "./estado";
import { proteccionDe, type ProteccionHs6, type SobreNoHabitable, type SobreTerreno } from "./proteccion";
import { nivelReferenciaRadon_Bq_m3, parametrosBarrera, parametrosEspacioContencion, type ZonaRadon } from "./tablas";

export type DetalleHs6 =
  | { clase: "zona"; zona: ZonaRadon; municipio: string; nivelReferencia_Bq_m3: number }
  | {
      clase: "barrera";
      /** Dónde va: bajo el sótano, en el forjado de la PB, sobre la cámara… */
      donde: ("solera_sotano" | "forjado_pb" | "terreno" | "sotano_habitable")[];
      via: "lamina_tipo" | "calculo";
      espesorMin_mm: number;
      coefLimite_m2_s: number;
      /** En un edificio existente, cómo se resuelve sobre lo que apoya en el terreno (feature-30). */
      existente?: "lamina" | "solera";
    }
  | { clase: "contencion_garaje"; parte: SobreNoHabitable; criterio: boolean }
  | {
      clase: "camara";
      partes: SobreTerreno[];
      aberturas_cm2: number;
      distanciaMax_m: number;
      /** En un edificio existente: cámara por el interior, de al menos 5 cm (ap. 3.2 pto 6). */
      existente?: boolean;
    }
  | {
      clase: "despresurizacion";
      partes: SobreTerreno[];
      /** En un edificio existente: accediendo desde la solera, con estudio específico (ap. 3.3 pto 3). */
      existente?: boolean;
    }
  | { clase: "nucleo" }
  | { clase: "no_tocan"; niveles: number[]; usos: UsoZona[] };

export interface ElementoHs6 extends ElementoResultado {
  nombre: string;
  detalle: DetalleHs6;
}

/** Datos de la obra que usa HS6. */
export interface ObraHs6 {
  /** En un edificio existente, lo que hay alrededor de lo intervenido (feature-30). */
  existente?: ObraExistente;
}

/** Altura mínima de la cámara por el interior en un edificio existente (HS 6 ap. 3.2 pto 6). */
export const CAMARA_EXISTENTE_MIN_cm = 5;

export interface JustificacionHs6 {
  /** En un edificio existente con el asistente respondido (feature-30). */
  existente: boolean;
  proteccion: ProteccionHs6;
  municipio: string;
  elementos: ElementoHs6[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

function proteccionExistente(estado: Hs6Estado, zona: ZonaRadon, ex: ObraExistente): ProteccionHs6 {
  const intervenida = (z: Zona) => obraDeZona(z, ex.intervencion) !== "existente";
  const sotanoSinTocar = plantasDe(ex.edificio).some((p) => p.nivel === -1 && p.zonas.length > 0 && p.zonas.every((z) => !intervenida(z)));
  return proteccionDe(ex.edificio, zona, sotanoSinTocar ? { ...estado, posicionBarrera: "forjado" } : estado, intervenida);
}

export function justificarHs6(estado: Hs6Estado, edificio: Edificio, obra: ObraHs6 = {}): JustificacionHs6 {
  const ex = obra.existente !== undefined;
  const zona = estado.zona;
  // En un edificio existente, la geometría es la del edificio entero (lo intervenido
  // puede estar sobre un sótano que no se toca) y solo se protege lo intervenido.
  // Si el sótano no se toca, la barrera va en el forjado de la planta baja (feature-30).
  const pr = obra.existente ? proteccionExistente(estado, zona, obra.existente) : proteccionDe(edificio, zona, estado);
  const d = pr.decisiones;
  const elementos: ElementoHs6[] = [];
  const avisos: Aviso[] = [];
  const municipio = estado.municipio?.trim() ?? "";

  elementos.push({
    id: "zona",
    nombre: "Zona de radón",
    tipo: "dato",
    veredicto: "dato",
    valor: { texto: zona === "sin_exigencia" ? "Sin exigencia" : zona },
    manda: { tipo: "dato_de_partida", fuente: "Apéndice B, consultado por el proyectista" },
    cita: ["HS 6 · ap. 2 y ap. 3 pto 1", "apéndice B"],
    detalle: { clase: "zona", zona, municipio, nivelReferencia_Bq_m3: nivelReferenciaRadon_Bq_m3() },
  });

  if (pr.aplica) {
    const zonaII = zona === "II";
    const conBarrera = zonaII || d.medidaTerreno === "barrera";
    const pb = parametrosBarrera();

    // ── Barrera ────────────────────────────────────────────────────────────
    if (conBarrera) {
      const donde: ("solera_sotano" | "forjado_pb" | "terreno" | "sotano_habitable")[] = [];
      if (pr.sobreNoHabitable) donde.push(d.posicionBarrera === "solera" ? "solera_sotano" : "forjado_pb");
      for (const t of pr.sobreTerreno) donde.push(t.nivel < 0 ? "sotano_habitable" : "terreno");
      elementos.push({
        id: "barrera",
        nombre: "Barrera de protección",
        tipo: "barrera",
        veredicto: d.viaBarrera === "calculo" ? "fuera" : "ok",
        valor: d.viaBarrera === "calculo" ? { texto: "Por cálculo" } : { valor: pb.espesorMin_mm, unidad: "mm" },
        limite: { valor: pb.espesorMin_mm, unidad: "mm" },
        manda:
          d.viaBarrera === "calculo"
            ? { tipo: "decision_proyectista", decision: "calculo" }
            : { tipo: "formula", formula: "lámina tipo", resultado: { valor: pb.coefDifusionLimite_m2_s, unidad: "m²/s" } },
        cita: d.viaBarrera === "calculo" ? ["HS 6 · ap. 3.1.2"] : ["HS 6 · ap. 3.1.1", "ap. 5.1.1"],
        detalle: {
          clase: "barrera",
          donde,
          via: d.viaBarrera,
          espesorMin_mm: pb.espesorMin_mm,
          coefLimite_m2_s: pb.coefDifusionLimite_m2_s,
          ...(ex && pr.sobreTerreno.length > 0 ? { existente: estado.barreraExistente === "solera" ? ("solera" as const) : ("lamina" as const) } : {}),
        },
      });
    }

    // ── El garaje (o el sótano no habitable), espacio de contención ────────
    if (pr.sobreNoHabitable && (zonaII || d.medidaTerreno === "camara")) {
      elementos.push({
        id: "contencion-garaje",
        nombre: pr.sobreNoHabitable.conGaraje ? "El garaje, espacio de contención" : "El sótano, espacio de contención",
        tipo: "espacio_contencion",
        veredicto: zonaII ? "ok" : "criterio",
        valor: { texto: pr.sobreNoHabitable.conGaraje ? "Garaje" : "Sótano" },
        manda: { tipo: "decision_proyectista", decision: "local_no_habitable" },
        cita: zonaII ? ["HS 6 · ap. 3.2 ptos 1 y 5"] : ["HS 6 · ap. 3 pto 1 (protección análoga)", "ap. 3.2 pto 5"],
        detalle: { clase: "contencion_garaje", parte: pr.sobreNoHabitable, criterio: !zonaII },
      });
    }

    // ── Lo que apoya en el terreno: cámara o despresurización ─────────────
    if (pr.sobreTerreno.length > 0 && d.medidaTerreno === "camara" && ex) {
      // En un edificio existente, la cámara se construye por el interior (feature-30; K-INT.4).
      elementos.push({
        id: "camara",
        nombre: "Cámara por el interior",
        tipo: "espacio_contencion",
        veredicto: "ok",
        valor: { valor: CAMARA_EXISTENTE_MIN_cm, unidad: "cm" },
        limite: { valor: CAMARA_EXISTENTE_MIN_cm, unidad: "cm" },
        manda: { tipo: "decision_proyectista", decision: "camara_interior" },
        cita: ["HS 6 · ap. 3.2 ptos 6 a 8"],
        detalle: { clase: "camara", partes: pr.sobreTerreno, aberturas_cm2: 0, distanciaMax_m: 0, existente: true },
      });
    } else if (pr.sobreTerreno.length > 0 && d.medidaTerreno === "camara") {
      const pe = parametrosEspacioContencion();
      elementos.push({
        id: "camara",
        nombre: "Cámara ventilada",
        tipo: "espacio_contencion",
        veredicto: "ok",
        valor: { valor: pr.aberturasCamara_cm2 ?? 0, unidad: "cm²" },
        manda: {
          tipo: "formula",
          formula: "10 cm² por metro de perímetro",
          resultado: { valor: pr.aberturasCamara_cm2 ?? 0, unidad: "cm²" },
        },
        cita: ["HS 6 · ap. 3.2 ptos 1 a 4"],
        detalle: {
          clase: "camara",
          partes: pr.sobreTerreno,
          aberturas_cm2: pr.aberturasCamara_cm2 ?? 0,
          distanciaMax_m: pe.distanciaMaxAAbertura_m,
        },
      });
    }
    if (pr.sobreTerreno.length > 0 && d.medidaTerreno === "despresurizacion") {
      elementos.push({
        id: "despresurizacion",
        nombre: "Despresurización del terreno",
        tipo: "despresurizacion",
        veredicto: "ok",
        valor: { texto: "Captación" },
        manda: { tipo: "decision_proyectista", decision: "despresurizacion" },
        cita: ex ? ["HS 6 · ap. 3.3 ptos 3 y 6"] : ["HS 6 · ap. 3.3", "ap. 5.1.4"],
        detalle: { clase: "despresurizacion", partes: pr.sobreTerreno, ...(ex ? { existente: true } : {}) },
      });
      if (ex) avisos.push({ id: "despresurizacion-estudio", tipo: "caso_especial", elementoId: "despresurizacion", datos: {} });
    }
    // Con cámara o despresurización en un edificio existente, la eficacia se mide después (ap. 3.2 pto 7 y 3.3 pto 6).
    if (ex && pr.sobreTerreno.length > 0 && (d.medidaTerreno === "camara" || d.medidaTerreno === "despresurizacion")) {
      avisos.push({ id: "medicion-posterior", tipo: "caso_especial", elementoId: d.medidaTerreno, datos: {} });
    }

    // ── El núcleo que comunica el garaje con lo habitable ─────────────────
    // Importa si el garaje es el espacio de contención (el cerramiento que lo
    // separa de lo habitable no puede tener discontinuidades) o si la barrera va
    // en el forjado de la planta baja (el núcleo la atraviesa).
    const garajeContencion = elementos.some((e) => e.id === "contencion-garaje");
    const barreraEnForjado = conBarrera && pr.sobreNoHabitable !== null && d.posicionBarrera === "forjado";
    if (pr.nucleo && (garajeContencion || barreraEnForjado)) {
      elementos.push({
        id: "nucleo",
        nombre: "Escalera y ascensor",
        tipo: "nucleo",
        veredicto: "ok",
        valor: { texto: "Núcleo" },
        manda: { tipo: "decision_proyectista", decision: "nucleo" },
        cita: ["HS 6 · ap. 3 pto 1 y ap. 3.1.1 pto 3 c"],
        detalle: { clase: "nucleo" },
      });
      avisos.push({ id: "nucleo-garaje", tipo: "caso_especial", elementoId: "nucleo", datos: { posicion: d.posicionBarrera } });
    }
  }

  // ── Lo que no toca el terreno ─────────────────────────────────────────────
  if (pr.noTocan.niveles.length > 0 && zona !== "sin_exigencia") {
    elementos.push({
      id: "no-tocan",
      nombre: "Plantas altas",
      tipo: "fuera",
      veredicto: "dato",
      valor: { texto: "Sin contacto" },
      manda: { tipo: "decision_proyectista", decision: "no_tocan" },
      cita: ["HS 6 · ap. 1 pto 2"],
      detalle: { clase: "no_tocan", niveles: pr.noTocan.niveles, usos: pr.noTocan.usos },
    });
  }

  let veredicto: Veredicto = "ok";
  if (elementos.some((e) => e.veredicto === "fail")) veredicto = "fail";

  return { existente: ex, proteccion: pr, municipio, elementos, avisos, veredicto };
}
