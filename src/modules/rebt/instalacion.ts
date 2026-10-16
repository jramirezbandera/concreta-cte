// =============================================================================
// REBT — Aguas abajo de la previsión (feature-34): con lo que ya sabe la
// justificación (las viviendas, la carga total, los servicios, los locales y
// los contadores), la instalación interior de cada vivienda tipo, la línea
// general de alimentación, las derivaciones individuales y la puesta a tierra.
// Es lo que desarrolla el anejo 5.3.3; no cambia ninguna cifra de la previsión.
// PURA.
//
// En un edificio existente (feature-30) solo se calcula lo de la obra: las
// viviendas y los locales nuevos y sus derivaciones. La LGA y la tierra son las
// que hay.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { plantasDe } from "../../lib/edificio/derivar";
import { obraDeZona } from "../../lib/proyecto/alcance";
import type { ViviendaTipo, Zona } from "../../lib/edificio/tipos";
import { estanciasDe, VIVIENDA_UNIFAMILIAR, type HabEstado } from "../hab/estado";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import { sua8EstadoDefaults, type Sua8Estado } from "../sua8/estado";
import { justificarSua8 } from "../sua8/justificacion";
import { equiposDe, type DecisionesRebt, type EquiposVivienda, type RebtEstado } from "./estado";
import { interiorVivienda, type InteriorVivienda } from "./interior";
import type { DetalleRebt, ExistenteRebt, Grado, ViviendaRebt } from "./justificacion";
import { derivacionIndividual, lineaGeneral, type LineaRebt } from "./lineas";
import { CRITERIOS_REBT, GRADO_REBT } from "./tablas";
import { CRITERIOS_INSTALACION, LGA_ITC_BT_14 } from "./tablasInstalacion";
import { tierraRebt, type TierraRebt } from "./tierra";

export interface InteriorTipo {
  tipoId: string;
  nombre: string;
  cantidad: number;
  grado: Grado;
  potencia_W: number;
  iga_A: number;
  superficie_m2: number;
  interior: InteriorVivienda;
}

export interface InstalacionRebt {
  equipos: EquiposVivienda;
  viviendas: InteriorTipo[];
  /** La LGA calculada; null en la unifamiliar o si es existente. */
  lga: LineaRebt | null;
  /** La LGA existente, con la carga después de la obra. */
  lgaExistente: { despues_W: number; despues_A: number } | null;
  derivaciones: LineaRebt[];
  /** Interruptor general de maniobra de la centralización [A] (más de dos usuarios). */
  igm_A: number | null;
  tierra: TierraRebt;
}

/** Lo que la instalación necesita de la previsión. */
export interface PrevisionParaInstalacion {
  elementos: { detalle: DetalleRebt }[];
  viviendas: ViviendaRebt[];
  unifamiliar: boolean;
  total_W: number;
  decisiones: DecisionesRebt;
  existente?: ExistenteRebt;
}

function detalle<K extends DetalleRebt["clase"]>(j: PrevisionParaInstalacion, clase: K): Extract<DetalleRebt, { clase: K }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleRebt, { clase: K }>) : null;
}

const positivo = (v: number | null | undefined): number | null => (v !== null && v !== undefined && Number.isFinite(v) && v > 0 ? v : null);
const r1 = (v: number) => Math.round(v * 10) / 10;

/** La planta de SUA 8: la que dio el proyectista o un cuadrado con la cubierta (o la mayor planta). */
function plantaEdificio(p: ProyectoSi, sua8: Partial<Sua8Estado>): { largo_m: number; ancho_m: number; dadas: boolean } {
  if ((sua8.largo_m ?? 0) > 0 && (sua8.ancho_m ?? 0) > 0) return { largo_m: sua8.largo_m!, ancho_m: sua8.ancho_m!, dadas: true };
  const e = edificioSi(p.edificio);
  const mayor = Math.max(0, ...e.zonas.filter((z) => !z.bajoRasante).map((z) => z.construida.valor));
  const sup = p.edificio.cubierta.superficie_m2 > 0 ? p.edificio.cubierta.superficie_m2 : mayor;
  const lado = Math.round(Math.sqrt(Math.max(sup, 1)) * 100) / 100;
  return { largo_m: lado, ancho_m: lado, dadas: false };
}

export function instalacionRebt(j: PrevisionParaInstalacion, estado: Partial<RebtEstado>, p: ProyectoSi): { instalacion: InstalacionRebt; avisos: Aviso[] } {
  const avisos: Aviso[] = [];
  const C = CRITERIOS_INSTALACION.datos;
  const equipos = equiposDe(estado, j.decisiones);
  const ex = j.existente;

  // ── La instalación interior de cada vivienda tipo ─────────────────────────
  const hab = p.justificaciones?.hab?.inputs as Partial<HabEstado> | undefined;
  const tipos = p.edificio.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda");
  const aCalcular = ex ? ex.viviendas : j.viviendas;
  const viviendas: InteriorTipo[] = aCalcular.flatMap((v) => {
    const tipo = tipos.find((t) => t.id === v.tipoId);
    if (!tipo) return [];
    const deHab = estanciasDe(hab, j.unifamiliar ? VIVIENDA_UNIFAMILIAR : v.tipoId);
    const interior = interiorVivienda(
      { dormitorios: tipo.dormitorios, banos: tipo.banos, aseos: tipo.aseos, superficie_m2: v.superficie_m2, recarga: v.motivos.includes("recarga") },
      deHab,
      equipos,
    );
    return [{ tipoId: v.tipoId, nombre: v.nombre, cantidad: v.cantidad, grado: v.grado, potencia_W: v.potencia_W, iga_A: v.iga_A, superficie_m2: v.superficie_m2, interior }];
  });
  const sinSuperficie = viviendas.filter((v) => v.interior.estancias.some((e) => e.sinSuperficie));
  if (sinSuperficie.length > 0) {
    avisos.push({
      id: "estancias-sin-superficie",
      tipo: "supuesto",
      datos: { viviendas: sinSuperficie.map((v) => v.nombre), unifamiliar: j.unifamiliar, deHab: sinSuperficie.some((v) => v.interior.deHabitabilidad) },
    });
  }
  for (const v of viviendas) {
    if (v.grado === "basica" && v.interior.piden.length > 0) {
      avisos.push({ id: `puntos-elevada-${v.tipoId}`, tipo: "caso_especial", elementoId: `vivienda-${v.tipoId}`, datos: { nombre: v.nombre, piden: v.interior.piden, unifamiliar: j.unifamiliar } });
    }
  }

  // ── Las líneas ────────────────────────────────────────────────────────────
  const derivaciones: LineaRebt[] = [];
  const lDiDada = positivo(estado.longitudDi_m);
  const lLgaDada = positivo(estado.longitudLga_m);
  let lga: LineaRebt | null = null;
  let lgaExistente: InstalacionRebt["lgaExistente"] = null;
  let estimadas = false;

  if (j.unifamiliar) {
    const v = j.viviendas[0];
    const total = detalle(j, "total");
    if (v && total) {
      const enterrada = estado.diEnterrada === true;
      derivaciones.push(
        derivacionIndividual({
          id: "di-vivienda",
          que: "Derivación individual",
          l_m: lDiDada ?? C.diUnifamiliar_m,
          estimada: lDiDada === null,
          p_W: total.p_W,
          iga_A: total.trifasica ? null : v.iga_A,
          trifasica: total.trifasica,
          usuarioUnico: true,
          enterrada,
        }),
      );
      estimadas = lDiDada === null;
    }
  } else {
    const e = edificioSi(p.edificio);
    const plantas = plantasDe(p.edificio);
    const cota = (nivel: number) => plantas.find((x) => x.nivel === nivel)?.cota_m ?? 0;
    const cont = detalle(j, "contadores");
    const nivelCont = cont?.cuarto ? [...cont.cuarto.niveles].sort((a, b) => Math.abs(a) - Math.abs(b))[0] : 0;
    // En obra existente, solo las zonas nuevas o que cambian de uso.
    const enObra = (z: Zona) => {
      if (!p.existente) return true;
      const o = obraDeZona(z, p.existente.intervencion);
      return o === "nueva" || o === "cambia_uso";
    };
    const recorrido = (niveles: number[]) => r1(C.diCentralizacion_m + Math.max(0, ...niveles.map((n) => Math.abs(cota(n) - cota(nivelCont)))) + C.diPlanta_m);

    if (ex) {
      lgaExistente = { despues_W: ex.despues_W, despues_A: ex.despues_A };
    } else {
      const total = detalle(j, "total");
      if (total && total.p_W > 0) {
        lga = lineaGeneral(total.p_W, lLgaDada ?? C.lga_m, lLgaDada === null);
        estimadas ||= lLgaDada === null;
      }
    }

    // Una DI por vivienda tipo, la de su planta más alejada de la centralización.
    for (const v of aCalcular) {
      const niveles = e.zonas
        .filter((z) => z.uso === "viviendas" && (z.zona.unidades ?? []).some((u) => u.tipoId === v.tipoId) && enObra(z.zona))
        .flatMap((z) => z.niveles);
      const lEst = recorrido(niveles.length > 0 ? niveles : [0]);
      const planta = niveles.length > 0 ? plantas.find((x) => x.nivel === niveles.reduce((a, n) => (Math.abs(cota(n) - cota(nivelCont)) > Math.abs(cota(a) - cota(nivelCont)) ? n : a), niveles[0]))?.etiqueta : undefined;
      derivaciones.push(
        derivacionIndividual({
          id: `di-${v.tipoId}`,
          que: `Vivienda ${v.nombre}${planta ? ` (${planta})` : ""}`,
          l_m: lDiDada ?? lEst,
          estimada: lDiDada === null,
          p_W: v.potencia_W,
          iga_A: v.iga_A,
          trifasica: false,
          usuarioUnico: false,
          enterrada: false,
        }),
      );
      estimadas ||= lDiDada === null;
    }

    // Los servicios generales, con el garaje (criterio de la previsión).
    const serv = detalle(j, "servicios");
    const garaje = detalle(j, "garaje");
    const pServ = (serv?.p_W ?? 0) + (garaje?.p_W ?? 0);
    if (!ex && pServ > 0) {
      derivaciones.push(
        derivacionIndividual({
          id: "di-servicios",
          que: garaje ? "Servicios generales y garaje" : "Servicios generales",
          l_m: recorrido([nivelCont]),
          estimada: true,
          p_W: pServ,
          iga_A: null,
          trifasica: true,
          usuarioUnico: false,
          enterrada: false,
          cosPhi: CRITERIOS_REBT.datos.cosPhi,
        }),
      );
    }

    // Cada local u oficina: su DI a la planta más alejada del grupo.
    const locales = ex ? ex.locales : j.elementos.flatMap((x) => (x.detalle.clase === "local" ? [x.detalle] : []));
    for (const l of locales) {
      const z = e.zonas.find((x) => x.id === l.zonaId);
      const trifasica = l.porLocal_W > GRADO_REBT.datos.monofasicoMax_W;
      derivaciones.push(
        derivacionIndividual({
          id: `di-${l.zonaId}`,
          que: `${l.uso === "oficinas" ? "Oficinas" : "Local"} (${l.plantas})${l.locales > 1 ? ` × ${l.locales}` : ""}`,
          l_m: recorrido(z?.niveles ?? [0]),
          estimada: true,
          p_W: l.porLocal_W,
          iga_A: null,
          trifasica,
          usuarioUnico: false,
          enterrada: false,
          cosPhi: CRITERIOS_REBT.datos.cosPhi,
        }),
      );
    }
  }
  if (estimadas) avisos.push({ id: "longitudes-estimadas", tipo: "supuesto", datos: { unifamiliar: j.unifamiliar, lga: lga !== null && lLgaDada === null } });

  // Interruptor general de maniobra (ITC-BT-16 ap. 3), con más de dos usuarios.
  const cont = detalle(j, "contadores");
  const I = LGA_ITC_BT_14.datos.igm;
  const igm_A = !j.unifamiliar && !ex && cont && cont.n > I.masDeUsuarios ? (j.total_W <= I.hasta_kW * 1000 ? I.menor_A : I.mayor_A) : null;

  // ── La puesta a tierra ────────────────────────────────────────────────────
  const sua8 = { ...sua8EstadoDefaults, ...((p.justificaciones?.sua8?.inputs as Partial<Sua8Estado> | undefined) ?? {}) };
  const pararrayos = justificarSua8(sua8, p).decisiones.instalacion === "si";
  const tierra = tierraRebt({
    existente: p.existente !== undefined,
    unifamiliar: j.unifamiliar,
    perimetro_m: positivo(estado.perimetroTierra_m),
    planta: plantaEdificio(p, sua8),
    resistividad_ohm_m: positivo(estado.resistividad_ohm_m),
    pararrayos,
  });
  if (!tierra.existente && tierra.terrenoSupuesto) avisos.push({ id: "terreno-supuesto", tipo: "supuesto", datos: { r: tierra.r_ohm, picas: tierra.picas } });
  if (!tierra.existente && tierra.excesivo) avisos.push({ id: "tierra-picas", tipo: "caso_especial", datos: { picas: tierra.picas } });

  return { instalacion: { equipos, viviendas, lga, lgaExistente, derivaciones, igm_A, tierra }, avisos };
}
