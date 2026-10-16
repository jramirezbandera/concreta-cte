import { describe, expect, it } from "vitest";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { textoParrafo } from "../../../lib/cte/memoria";
import { pdfStr } from "../../../lib/pdf/utils";
import type { EstanciaHab } from "../../hab/estado";
import { anejoRebt } from "../anejo";
import { rebtEstadoDefaults, type EquiposVivienda, type RebtEstado } from "../estado";
import { interiorVivienda, longitudMaxima } from "../interior";
import { justificarRebt, type JustificacionRebt } from "../justificacion";
import { caidaTension, dimensionar, intensidadAdmisible } from "../lineas";
import { PROTECCION_GUIA_BT22 } from "../tablasInstalacion";
import { tierraRebt } from "../tierra";

// =============================================================================
// REBT aguas abajo (feature-34): circuitos y puntos de la vivienda, LGA y
// derivaciones, puesta a tierra y el anejo 5.3.3. Cifras y criterios:
// research/verificacion-rebt.md, bloque N y K-REBT.19–36.
// =============================================================================

const demo = crearProyectoDemo("2026-10-16T10:00:00.000Z");
const dg = demo.datosGenerales;
const con = (edificio: Edificio, estado: Partial<RebtEstado> = {}, justificaciones: Proyecto["justificaciones"] = {}) =>
  justificarRebt({ ...rebtEstadoDefaults, ...estado }, { edificio, datosGenerales: dg, justificaciones });
const caso = (c: CasoEdificio, estado: Partial<RebtEstado> = {}) => con(edificioDeCaso(c), estado);
const avisos = (j: JustificacionRebt) => j.avisos.map((a) => a.id);

const SIN: EquiposVivienda = { climatizacion: "ninguna", secadora: false, automatizacion: false };
const est = (id: string, tipo: EstanciaHab["tipo"], util_m2: number | null): EstanciaHab => ({
  id,
  nombre: id,
  tipo,
  util_m2,
  hueco_m2: null,
  acristalada_m2: null,
  practicable_m2: null,
});
const VIV = { dormitorios: 2, banos: 1, aseos: 0, superficie_m2: 70, recarga: false };

describe("ITC-BT-25: puntos y circuitos de la vivienda", () => {
  it("tabla 2: dos puntos de luz con más de 10 m² y una toma por cada 6 m², al menos 3", () => {
    const i = interiorVivienda(VIV, [est("salón", "estar_comedor", 26), est("d1", "dormitorio", 10), est("d2", "dormitorio", 9)], SIN);
    const salon = i.estancias.find((e) => e.nombre === "salón")!;
    expect(salon.puntos).toEqual({ C1: 2, C2: 5 });
    expect(i.estancias.find((e) => e.nombre === "d1")!.puntos).toEqual({ C1: 1, C2: 3 });
  });

  it("C1–C5 siempre, con la sección, el IA y el tubo de la tabla 1", () => {
    const i = interiorVivienda(VIV, [], SIN);
    expect(i.circuitos.map((c) => `${c.codigo} ${c.ia_A} A ${c.s_mm2} mm² Ø${c.tubo_mm}`)).toEqual([
      "C1 10 A 1.5 mm² Ø16",
      "C2 16 A 2.5 mm² Ø20",
      "C3 25 A 6 mm² Ø25",
      "C4 20 A 4 mm² Ø20",
      "C5 16 A 2.5 mm² Ø20",
    ]);
    expect(i.diferenciales).toBe(1);
    expect(i.piden).toEqual([]);
  });

  it("estancias deducidas: acceso, vestíbulo y las del tipo, sin superficie (el mínimo)", () => {
    const i = interiorVivienda(VIV, [], SIN);
    expect(i.deHabitabilidad).toBe(false);
    expect(i.estancias.map((e) => e.nombre)).toEqual(["Acceso", "Vestíbulo", "Estar-comedor", "Cocina", "Dormitorio principal", "Dormitorio 2", "Baño"]);
    expect(i.estancias.filter((e) => e.sinSuperficie).map((e) => e.nombre)).toEqual(["Estar-comedor", "Cocina", "Dormitorio principal", "Dormitorio 2"]);
  });

  it("más de 30 puntos de luz: un C6; más de 160 m²: un C7; y se dice qué pide la elevada", () => {
    const muchas = Array.from({ length: 16 }, (_, k) => est(`d${k}`, "dormitorio", 12));
    const i = interiorVivienda({ ...VIV, superficie_m2: 170 }, muchas, SIN);
    expect(i.circuitos.map((c) => c.codigo)).toEqual(["C1", "C6", "C2", "C7", "C7", "C3", "C4", "C5"]);
    expect(i.circuitos.find((c) => c.codigo === "C6")!.adicionalDe).toBe("C1");
    expect(i.piden.length).toBe(2);
  });

  it("la climatización: aire-aire en C9, aire-agua en C8, emisores en C8 con sus tomas", () => {
    const e = [est("s", "estar_comedor", 12), est("d", "dormitorio", 9), est("b", "bano", 4)];
    const cod = (eq: EquiposVivienda) => interiorVivienda(VIV, e, eq).circuitos.map((c) => `${c.codigo}:${c.puntos ?? "-"}`).slice(5);
    expect(cod({ ...SIN, climatizacion: "aire_aire" })).toEqual(["C9:-"]);
    expect(cod({ ...SIN, climatizacion: "aire_agua" })).toEqual(["C8:-"]);
    // Salón de más de 10 m²: 2 tomas; dormitorio y baño: 1 cada uno.
    expect(cod({ ...SIN, climatizacion: "emisores" })).toEqual(["C8:4"]);
    expect(cod({ ...SIN, secadora: true, automatizacion: true })).toEqual(["C10:1", "C11:-"]);
  });

  it("C13 en la unifamiliar con recarga, con su diferencial aparte", () => {
    const i = interiorVivienda({ ...VIV, recarga: true }, [], { ...SIN, climatizacion: "aire_aire" });
    expect(i.circuitos.map((c) => c.codigo)).toEqual(["C1", "C2", "C3", "C4", "C5", "C9", "C13"]);
    expect(i.diferenciales).toBe(2);
    expect(i.recarga).toBe(true);
    expect(i.estancias.at(-1)!.puntos).toEqual({ C1: 1, C2: 1, C13: 1 });
  });

  it("longitud máxima: e·U·γ·S / (2·IA), con γ = 48 (Guía, Anexo 2)", () => {
    expect(longitudMaxima(1.5, 10, 0.03)).toBe(24.8);
    expect(longitudMaxima(2.5, 16, 0.03)).toBe(25.8);
    expect(longitudMaxima(6, 25, 0.03)).toBe(39.7);
    expect(longitudMaxima(2.5, 16, 0.05)).toBe(43.1);
  });
});

describe("LGA y derivaciones: intensidad admisible y caída de tensión", () => {
  it("Iz es la menor de la ITC-BT-19 y de la Guía BT-19 (K-REBT.19)", () => {
    expect(intensidadAdmisible(10, "XLPE", 3, false)).toBe(54);
    expect(intensidadAdmisible(10, "PVC", 2, false)).toBe(50);
    // Enterrada: 96 × 0,8 × 1,225 = 94,1 frente a 77 de la Guía.
    expect(intensidadAdmisible(10, "XLPE", 2, true)).toBe(77);
  });

  it("caída monofásica 2·P·L/(γ·S·U²) y trifásica P·L/(γ·S·U²)", () => {
    expect(caidaTension(9200, 15, 10, 48, false)).toBeCloseTo((2 * 9200 * 15 * 100) / (48 * 10 * 230 * 230), 9);
    expect(caidaTension(100000, 10, 70, 44, true)).toBeCloseTo((100000 * 10 * 100) / (44 * 70 * 400 * 400), 9);
  });

  it("la sección: la mayor de la mínima, la de Iz y la de la caída, y dice cuál manda", () => {
    const base = { trifasica: false, caidaMax_pct: 1.5, sMin_mm2: 6, aislamiento: "PVC" as const, enterrada: false };
    expect(dimensionar({ ...base, p_W: 9200, l_m: 15, izMin_A: 40 })).toMatchObject({ s_mm2: 10, manda: "caida" });
    expect(dimensionar({ ...base, p_W: 9200, l_m: 2, izMin_A: 40 })).toMatchObject({ s_mm2: 10, manda: "intensidad" });
    expect(dimensionar({ ...base, p_W: 5750, l_m: 2, izMin_A: 25 })).toMatchObject({ s_mm2: 6, manda: "minimo" });
  });

  it("la unifamiliar: DI de 15 m estimada a 1,5 %, con el IGA; enterrada, cable de 0,6/1 kV", () => {
    const j = caso("unifamiliar");
    const di = j.instalacion.derivaciones[0];
    expect(di).toMatchObject({ l_m: 15, estimada: true, caidaMax_pct: 1.5, in_A: 40, s_mm2: 10, cable: "ES07Z1-K (AS) 450/750 V" });
    expect(j.instalacion.lga).toBeNull();
    expect(avisos(j)).toContain("longitudes-estimadas");
    const ent = caso("unifamiliar", { diEnterrada: true, longitudDi_m: 30 }).instalacion.derivaciones[0];
    expect(ent).toMatchObject({ l_m: 30, estimada: false, enterrada: true, cable: "RZ1-K (AS) 0,6/1 kV" });
    expect(ent.caida_pct).toBeLessThanOrEqual(1.5);
    expect(avisos(caso("unifamiliar", { longitudDi_m: 30 }))).not.toContain("longitudes-estimadas");
  });

  it("el edificio: LGA con sitio para un fusible gG entre Ib y 0,906·Iz, y una DI por vivienda tipo", () => {
    const j = caso("plurifamiliar");
    const lga = j.instalacion.lga!;
    const k = PROTECCION_GUIA_BT22.datos.i2Limite / PROTECCION_GUIA_BT22.datos.i2FusibleGG;
    expect(lga.ib_A).toBeLessThanOrEqual(k * lga.iz_A);
    expect(lga.caida_pct).toBeLessThanOrEqual(0.5);
    expect(lga.s_mm2).toBeGreaterThanOrEqual(10);
    expect(j.instalacion.derivaciones.map((d) => d.que)).toEqual(["Vivienda A (P3)", "Vivienda B (P3)", "Servicios generales y garaje"]);
    for (const d of j.instalacion.derivaciones) expect(d.caida_pct).toBeLessThanOrEqual(1);
    expect(j.instalacion.igm_A).toBe(160);
  });

  it("la DI más larga dada se aplica a todas las viviendas", () => {
    const j = caso("plurifamiliar", { longitudDi_m: 40, longitudLga_m: 25 });
    const viv = j.instalacion.derivaciones.filter((d) => d.que.startsWith("Vivienda"));
    expect(viv.every((d) => d.l_m === 40 && !d.estimada)).toBe(true);
    expect(j.instalacion.lga!.l_m).toBe(25);
    expect(avisos(j)).not.toContain("longitudes-estimadas");
  });
});

describe("puesta a tierra (ITC-BT-18, 24 y 26)", () => {
  const base = { existente: false, unifamiliar: false, perimetro_m: null, planta: { largo_m: 20, ancho_m: 10, dadas: true }, resistividad_ohm_m: null, pararrayos: false };

  it("el anillo: el perímetro de SUA 8, R = 2ρ/L, con el terreno supuesto de 3000 Ω·m", () => {
    const t = tierraRebt(base);
    expect(t).toMatchObject({ anillo_m: 60, origenAnillo: "sua8", resistividad_ohm_m: 3000, terrenoSupuesto: true, rAnillo_ohm: 100, rMaxReglamento_ohm: 166.7, picas: 0, cumple: true });
  });

  it("con terreno declarado, las picas para la resistencia de la Guía BT-26", () => {
    const t = tierraRebt({ ...base, resistividad_ohm_m: 500 });
    // Anillo 2·500/60 = 16,7 Ω; con picas de 250 Ω hasta 37 Ω: no hacen falta.
    expect(t).toMatchObject({ rAnillo_ohm: 16.7, picas: 0, objetivo_ohm: 37 });
    const c = tierraRebt({ ...base, resistividad_ohm_m: 500, pararrayos: true });
    // Hasta 15 Ω: 1/15 − 1/16,67 = 0,00667 → × 250 = 1,67 → 2 picas.
    expect(c).toMatchObject({ objetivo_ohm: 15, picas: 2 });
    expect(c.r_ohm).toBeLessThanOrEqual(15);
  });

  it("demasiadas picas: se avisa", () => {
    const t = tierraRebt({ ...base, perimetro_m: 20, resistividad_ohm_m: 3000, pararrayos: true });
    expect(t.excesivo).toBe(true);
  });

  it("la unifamiliar: 30 mA, R ≤ 1666,7 Ω", () => {
    expect(tierraRebt({ ...base, unifamiliar: true })).toMatchObject({ ia_A: 0.03, rMaxReglamento_ohm: 1666.7 });
  });
});

describe("el anejo 5.3.3", () => {
  const titulos = (j: JustificacionRebt) => anejoRebt(j).partes.map((p) => p.titulo);

  it("el plurifamiliar: previsión, interior de cada vivienda tipo, líneas, contadores y tierra", () => {
    expect(titulos(caso("plurifamiliar"))).toEqual([
      "Previsión de cargas",
      "Instalación interior · vivienda tipo A",
      "Instalación interior · vivienda tipo B",
      "Línea general de alimentación y derivaciones individuales",
      "Centralización de contadores y caja general de protección",
      "Puesta a tierra",
    ]);
  });

  it("la unifamiliar: CPM y derivación individual, sin LGA", () => {
    expect(titulos(caso("unifamiliar"))).toEqual(["Previsión de cargas", "Instalación interior de la vivienda", "Derivación individual", "Caja de protección y medida", "Puesta a tierra"]);
  });

  it("las oficinas: sin interior, solo las derivaciones de cada uso", () => {
    const a = anejoRebt(caso("oficinas"));
    expect(a.partes.map((p) => p.titulo)).toContain("Instalación interior");
    const texto = a.partes.flatMap((p) => p.parrafos.map(textoParrafo)).join(" ");
    expect(texto).not.toContain("vivienda tipo");
  });

  it("la tabla de líneas es ancha (11 columnas, sin partir)", () => {
    const t = anejoRebt(caso("plurifamiliar")).partes.find((p) => p.titulo.startsWith("Línea general"))!.tablas![0];
    expect(t.ancha).toBe(true);
    expect(t.cabecera).toHaveLength(11);
  });

  it("básica con más puntos de los que admite: aviso de que pide la elevada", () => {
    const hab = { estancias: { [edificioDeCaso("plurifamiliar").unidades[0].id]: Array.from({ length: 12 }, (_, k) => est(`d${k}`, "dormitorio", 12)) } };
    const j = con(edificioDeCaso("plurifamiliar"), { electrificacion: "superficie" }, { hab: { inputs: hab } } as Proyecto["justificaciones"]);
    expect(avisos(j).some((a) => a.startsWith("puntos-elevada-"))).toBe(true);
  });

  it("Ω y ρ llegan al PDF como «ohm» y «rho»", () => {
    expect(pdfStr("37 Ω · ρ = 500 Ω·m")).toBe("37 ohm · rho = 500 ohm·m");
  });
});
