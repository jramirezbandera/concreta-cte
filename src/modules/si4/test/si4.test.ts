import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { obraDeCaso, proyectoParaModulo } from "../../../lib/proyecto/alcance";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { cambiarZonaSi } from "../../si/editar";
import { si4 } from "../definicion";
import { si4EstadoDefaults } from "../estado";
import { justificarSi4, zonasConstruidaSi4 } from "../justificacion";
import { numeroHidrantes } from "../tablas";

// =============================================================================
// SI 4 · Instalaciones de protección (feature-19): la dotación de la tabla 1.1.
// Cifras: research/verificacion-si4-si6.md, bloque C1.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio) => justificarSi4(si4EstadoDefaults, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio) => con(edificioDeCaso(c));
const exige = (j: ReturnType<typeof con>, id: string) => {
  const d = j.elementos.find((e) => e.id === id)?.detalle;
  return d !== undefined && (d.clase === "dotacion" || d.clase === "hidrantes") && d.exige;
};

describe("SI4", () => {
  it("hidrantes: uno hasta 10.000 m² y uno más por cada 10.000 o fracción", () => {
    expect([5000, 10000, 10001, 20000, 20001].map(numeroHidrantes)).toEqual([1, 1, 2, 2, 3]);
  });

  it("Demo: un extintor por planta y junto al cuarto; BIE y detección por la construida supuesta del garaje", () => {
    const j = caso("plurifamiliar_locales");
    const ext = j.elementos.find((e) => e.id === "extintores")!.detalle;
    expect(ext.clase === "extintores" && [ext.plantas.map((p) => p.etiqueta), ext.total]).toEqual([["P3", "P2", "P1", "PB", "S1"], 6]);
    expect(exige(j, "bie")).toBe(true);
    expect(exige(j, "deteccion")).toBe(true);
    expect(j.avisos.map((a) => a.id)).toEqual(["construida-garaje"]);
    expect(si4.textoAviso(j.avisos[0]).titulo).toBe("La superficie construida del garaje decide bocas de incendio equipadas y detección de incendio.");
    expect(zonasConstruidaSi4(j).map((z) => z.id)).toEqual(["z4"]);
  });

  it("con 470 m² construidos el garaje no lleva BIE ni detección por la tabla, pero sí la que pide SI 3", () => {
    const j = con(cambiarZonaSi(edificioDeCaso("plurifamiliar_locales"), "z4", { superficieConstruida_m2: 470 }));
    expect(exige(j, "bie")).toBe(false);
    expect(exige(j, "deteccion")).toBe(false);
    expect(j.avisos).toEqual([]);
    expect(si4.frase(j)).toMatch(/detección en el garaje para su ventilación \(SI 3\)/);
  });

  it("unifamiliar: un extintor, el de su garaje", () => {
    const j = caso("unifamiliar");
    expect(si4.frase(j)).toBe("1 extintor 21A-113B como mínimo; no se exigen BIE, columna seca, detección ni hidrantes.");
  });

  it("más de 24 m: columna seca; dos sótanos de 3,10 m: hidrante por la altura ascendente", () => {
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 9 } : g)) };
    expect(exige(con(alto), "columna")).toBe(true);
    const hondo: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g3" ? { ...g, repeticiones: 2, altura_m: 3.1 } : g)) };
    expect(exige(con(hondo), "hidrantes")).toBe(true);
  });

  it("la memoria pone lo que no se exige en la tabla, no en una frase", () => {
    const m = si4.memoria(caso("plurifamiliar"));
    expect(m.tablas![0].filas).toContainEqual(["Columna seca", "no se exige", "no se dispone", "Cumple"]);
    expect(m.tablas![0].filas).toContainEqual(["Hidrantes exteriores", "no se exige", "no se disponen", "Cumple"]);
    expect(textoPlanoMemoria(m)).not.toMatch(/no se requieren/);
  });
});

describe("SI4 · tabla de la memoria (feature-31)", () => {
  it("«Instalación | Norma | Proyecto | Cumple»: lo exigido con su porqué y lo dispuesto; el texto no lo repite", () => {
    const m = si4.memoria(caso("plurifamiliar_locales"));
    const t = m.tablas![0];
    expect(t.cabecera).toEqual(["Instalación", "Norma", "Proyecto", "Cumple"]);
    expect(t.filas[0]).toEqual(["Extintores portátiles", "21A-113B, ≤ 15 m desde todo origen", "21A-113B, ≤ 15 m: P3, P2, P1, PB y S1", "Cumple"]);
    expect(t.filas).toContainEqual(["Bocas de incendio equipadas", "garaje > 500 m² construidos: se exigen", "BIE de 25 mm en el garaje", "Cumple"]);
    // Tras el párrafo de dónde sale la dotación.
    expect(t.tras).toBe(1);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toContain("504 m²");
    expect(texto).not.toContain("21A-113B");
    expect(texto).not.toMatch(/Se dispone (bocas|detección)/);
  });

  it("en la reforma, lo exigido que ya existía: «existente, no se modifica»", () => {
    const p: Proyecto = { ...crearProyectoDemo("2026-10-10T10:00:00.000Z"), edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
    p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}) };
    const m = si4.memoria(justificarSi4(si4EstadoDefaults, proyectoParaModulo(p, "si4")));
    const t = m.tablas![0];
    expect(t.filas).toEqual([
      ["Extintores portátiles", "21A-113B, ≤ 15 m desde todo origen", "existentes, no se modifican", "Cumple"],
      ["Bocas de incendio equipadas", "garaje > 500 m² construidos: se exigen", "existentes, no se modifican", "Cumple"],
      ["Detección de incendio", "garaje > 500 m² construidos: se exige", "existente, no se modifica", "Cumple"],
    ]);
    // La lista de las existentes la dice la tabla; el texto se queda con el criterio 10.
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).toContain("criterio 10");
    expect(texto).not.toContain("las bocas de incendio equipadas del garaje");
  });
});
