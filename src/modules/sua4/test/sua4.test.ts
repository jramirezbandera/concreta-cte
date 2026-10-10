import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { edificioSi } from "../../si/edificio";
import { clasificarRiesgo } from "../../si/riesgo";
import { sua4 } from "../definicion";
import { sua4EstadoDefaults, type Sua4Estado } from "../estado";
import { justificarSua4 } from "../justificacion";
import { ALUMBRADO_NORMAL_SUA4_1, DOTACION_EMERGENCIA_SUA4_2_1, INSTALACION_EMERGENCIA_SUA4_2_3, SENALES_SUA4_2_4 } from "../tablas";

// =============================================================================
// SUA 4 · Iluminación (feature-20). Cifras:
// research/verificacion-sua2-sua5.md, bloques B4 y B5.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const CASOS = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const;
const con = (edificio: Edificio, estado: Partial<Sua4Estado> = {}) => justificarSua4({ ...sua4EstadoDefaults, ...estado }, { edificio, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Sua4Estado> = {}) => con(edificioDeCaso(c), estado);
const ids = (j: ReturnType<typeof caso>) => j.elementos.map((e) => e.id);
const det = (j: ReturnType<typeof caso>, id: string) => j.elementos.find((e) => e.id === id)?.detalle;

/** Cambia una zona de un edificio de caso. */
function editar(c: CasoEdificio, zonaId: string, cambio: Record<string, unknown>): Edificio {
  const e = edificioDeCaso(c);
  for (const g of e.grupos) g.zonas = g.zonas.map((z) => (z.id === zonaId ? { ...z, ...cambio } : z));
  return e;
}

describe("SUA4 · tablas", () => {
  it("alumbrado normal, instalación y señales", () => {
    expect(ALUMBRADO_NORMAL_SUA4_1.datos).toEqual({ exterior_lx: 20, interior_lx: 100, aparcamientoInterior_lx: 50, uniformidadMediaMin: 0.4 });
    expect(INSTALACION_EMERGENCIA_SUA4_2_3.datos).toMatchObject({
      falloTensionPorDebajoDe: 0.7,
      autonomiaMin_h: 1,
      viaEvacuacion: { anchuraMax_m: 2, ejeCentralMin_lx: 1, bandaCentralMin_lx: 0.5 },
      equiposYCuadrosMin_lx: 5,
      relacionMaxMinEjeMax: 40,
      raMin: 40,
    });
    expect(SENALES_SUA4_2_4.datos).toMatchObject({ luminanciaColorSeguridadMin_cd_m2: 2, relacionMaxMinMax: 10, relacionBlancoColor: { min: 5, max: 15 } });
    expect(DOTACION_EMERGENCIA_SUA4_2_1.datos.c.construidaMayorQue_m2).toBe(100);
  });
});

describe("SUA4 · justificación", () => {
  it("unifamiliar: sin alumbrado normal comprobado; emergencia solo en el garaje (lo habitual)", () => {
    const j = caso("unifamiliar");
    expect(ids(j)).not.toContain("normal-interior");
    expect(ids(j)).not.toContain("emergencia-recorridos");
    expect(det(j, "emergencia-garaje")).toMatchObject({ unifamiliar: true, dispone: true, letra: "d" });
    expect(j.avisos).toHaveLength(0);
  });

  it("unifamiliar sin emergencia en el garaje: se avisa (lectura literal) y no hay instalación", () => {
    const j = caso("unifamiliar", { garajeVivienda: "no" });
    expect(j.avisos.map((a) => a.id)).toEqual(["garaje-vivienda-sin"]);
    expect(j.conEmergencia).toBe(false);
    expect(ids(j)).toEqual(["emergencia-garaje"]);
  });

  it("unifamiliar sin garaje: no se exige alumbrado de emergencia", () => {
    const e = edificioDeCaso("unifamiliar");
    e.grupos[1].zonas = e.grupos[1].zonas.filter((z) => z.uso !== "garaje_privado");
    const j = con(e);
    expect(ids(j)).toEqual(["emergencia"]);
    expect(j.elementos[0].veredicto).toBe("dato");
    expect(textoPlanoMemoria(sua4.memoria(j))).toMatch(/no es origen de evacuación/);
  });

  it("plurifamiliar: 100 lux en zonas comunes, 50 en el garaje; emergencia en recorridos, garaje (c) y locales de SI 1", () => {
    const j = caso("plurifamiliar");
    expect(det(j, "normal-interior")).toMatchObject({ lux: 100 });
    expect(det(j, "normal-garaje")).toMatchObject({ lux: 50 });
    expect(det(j, "emergencia-garaje")).toMatchObject({ letra: "c", dispone: true });
    expect(det(j, "emergencia-recorridos")).toMatchObject({ escalera: "S1–P3", letras: ["b", "h"] });
    // Los locales son los de SI 1, sin los garajes.
    const si = clasificarRiesgo(edificioSi(edificioDeCaso("plurifamiliar"))).locales.filter((l) => !l.tipo.startsWith("garaje"));
    const loc = det(j, "emergencia-locales");
    expect(loc?.clase === "locales" && loc.locales.map((l) => l.zona.id)).toEqual(si.map((l) => l.zona.id));
  });

  it("garaje: «exceda de 100 m²» construidos, estricto (c); 100 m² justos, local de riesgo (d)", () => {
    expect(det(con(editar("plurifamiliar", "z4", { superficieConstruida_m2: 100 })), "emergencia-garaje")).toMatchObject({ letra: "d", dispone: true });
    expect(det(con(editar("plurifamiliar", "z4", { superficieConstruida_m2: 101 })), "emergencia-garaje")).toMatchObject({ letra: "c" });
  });

  it("recinto de más de 100 personas (a): 1.001 m² de oficinas sí, 1.000 no", () => {
    const letras = (m2: number) => {
      const d = det(con(editar("oficinas", "z1", { superficieUtil_m2: m2 })), "emergencia-recorridos");
      return d?.clase === "recorridos" ? d.letras : [];
    };
    expect(letras(1001)).toContain("a");
    expect(letras(1000)).not.toContain("a");
    expect(letras(320)).toEqual(["b", "e", "h"]);
  });

  it("cuarto sin tipo: se supone de riesgo especial y se avisa; con tipo «agua», ni aviso ni emergencia", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.avisos.map((a) => a.id)).toEqual(["cuarto-sin-tipo"]);
    expect(sua4.avisosAEdificio?.has("cuarto-sin-tipo")).toBe(true);
    const agua = con(editar("plurifamiliar_locales", "z6", { cuarto: "agua" }));
    expect(agua.avisos).toHaveLength(0);
    expect(agua.emergenciaDe.z6).toBeUndefined();
    expect(caso("plurifamiliar").avisos).toHaveLength(0);
  });

  it("trasteros de 50 m² o menos sin riesgo especial: emergencia en su pasillo por criterio", () => {
    const d = det(caso("plurifamiliar_locales"), "emergencia-recorridos");
    expect(d?.clase === "recorridos" && d.trasterosCriterio.map((z) => z.id)).toEqual(["z5"]);
  });
});

describe("SUA4 · memoria, ficha y dibujo", () => {
  it("los cuatro casos", () => {
    for (const c of CASOS) {
      const j = caso(c);
      const texto = textoPlanoMemoria(sua4.memoria(j));
      expect(texto).toMatch(/alumbrado de emergencia/);
      expect(texto).toMatch(/Iluminancia en el eje central \(1\)\t≥ 1 lux\t≥ 1 lux\tCumple/);
      if (c !== "unifamiliar") expect(texto).toMatch(/Iluminancia en zonas interiores\t≥ 100 lux/);
      const dibujo = sua4.dibujo(j, edificioDeCaso(c));
      expect(dibujo.etiquetas.map((e) => e.elementoId).sort()).toEqual(j.elementos.map((e) => e.id).sort());
      expect(dibujo.marcas.some((m) => m.tipo === "icono" && m.icono === "luz")).toBe(true);
      if (c !== "unifamiliar") expect(dibujo.marcas.some((m) => m.tipo === "zona" && m.tono === "acento")).toBe(true);
      const ficha = sua4.ficha(j, { estado: sua4EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(sua4.frase(j).length).toBeGreaterThan(20);
    }
  });

  it("cada tabla tras su párrafo: alumbrado normal, dotación, emergencia y señales (feature-31)", () => {
    const m = sua4.memoria(caso("plurifamiliar_locales"));
    expect(m.tablas!.map((t) => [t.rotulo, t.tras])).toEqual([
      ["Alumbrado normal", 1],
      ["Dotación de alumbrado de emergencia", 2],
      ["Alumbrado de emergencia", 3],
      ["Señales de seguridad", 4],
    ]);
    const [normal, dotacion, emergencia, senales] = m.tablas!;
    expect(normal.cabecera).toEqual(["Parámetro", "Norma", "Proyecto", "Cumple"]);
    expect(normal.filas).toContainEqual(["Iluminancia en el aparcamiento", "≥ 50 lux", "≥ 50 lux", "Cumple"]);
    expect(normal.filas).toContainEqual(["Uniformidad media", "≥ 40 %", "≥ 40 %", "Cumple"]);
    expect(dotacion.cabecera).toEqual(["Zona o elemento", "Exige", "Por qué (ap. 2.1)"]);
    expect(dotacion.filas).toContainEqual(["Aparcamiento, con sus pasillos y escaleras", "sí", "504 m² construidos, más de 100 m² (c)"]);
    // El pasillo de los trasteros de 50 m² o menos, aparte y por criterio (S12).
    expect(dotacion.filas).toContainEqual(["El pasillo de los trasteros", "por criterio", "recorrido hasta la salida de planta (b)"]);
    expect(dotacion.filas.at(-1)).toEqual(["Interior de las viviendas", "no", "no es origen de evacuación (Anejo SI A)"]);
    expect(emergencia.filas).toContainEqual(["Autonomía", "≥ 1 h", "≥ 1 h", "Cumple"]);
    expect(emergencia.notas).toHaveLength(2);
    expect(senales.filas).toContainEqual(["Luminancia del color de seguridad", "≥ 2 cd/m²", "≥ 2 cd/m²", "Cumple"]);
    // El texto no repite las cifras de las tablas.
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toMatch(/\d lux|\d h\b|cd\/m²|\d+:1|\d+ %|504 m²|2,00 m/);
    expect(texto).toMatch(/medida a nivel del suelo y, en el aparcamiento, en toda su superficie/);
  });

  it("unifamiliar: sin tabla de dotación (el párrafo ya es corto); sin emergencia, sin tablas de emergencia", () => {
    const m = sua4.memoria(caso("unifamiliar"));
    expect(m.tablas!.map((t) => t.rotulo)).toEqual(["Alumbrado normal", "Alumbrado de emergencia", "Señales de seguridad"]);
    expect(m.tablas![0].filas).toEqual([
      ["Iluminancia en pasillos de la vivienda", "≥ 100 lux", "≥ 100 lux", "Cumple"],
      ["Iluminancia en el garaje de la vivienda", "≥ 50 lux", "≥ 50 lux", "Cumple"],
    ]);
    expect(sua4.memoria(caso("unifamiliar", { garajeVivienda: "no" })).tablas!.map((t) => t.rotulo)).toEqual(["Alumbrado normal"]);
  });
});
