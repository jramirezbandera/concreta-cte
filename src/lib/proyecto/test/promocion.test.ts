import { describe, expect, it } from "vitest";
import { COMUNIDAD_DE_PROVINCIA, NOMBRE_COMUNIDAD, comunidadDeIne, provinciasDe } from "../../../data/comunidades";
import { PLANTILLAS } from "../../habitabilidad/norma";
import { crearProyectoDemo } from "../demo";
import { comunidadDeObra, conPromocion, preguntaAutopromocion, promocionDe } from "../promocion";
import type { DatosGenerales } from "../tipos";

// =============================================================================
// feature-36, paso 1: el régimen de la promoción y la comunidad autónoma.
// =============================================================================

const dg = (): DatosGenerales => crearProyectoDemo("2026-10-19T10:00:00.000Z").datosGenerales;

describe("comunidades por el código INE", () => {
  it("las 52 provincias, cada una con su comunidad, y las 19 comunidades con nombre", () => {
    const codigos = Object.keys(COMUNIDAD_DE_PROVINCIA);
    expect(codigos).toHaveLength(52);
    expect(codigos.sort()).toEqual(Array.from({ length: 52 }, (_, i) => String(i + 1).padStart(2, "0")));
    expect(new Set(Object.values(COMUNIDAD_DE_PROVINCIA)).size).toBe(19);
    for (const c of Object.values(COMUNIDAD_DE_PROVINCIA)) expect(NOMBRE_COMUNIDAD[c]).toBeTruthy();
  });

  it("Andalucía: las ocho provincias", () => {
    expect(provinciasDe("andalucia")).toEqual(["04", "11", "14", "18", "21", "23", "29", "41"]);
  });

  it("de un municipio (5 dígitos) o de una provincia (2)", () => {
    expect(comunidadDeIne("29025")).toBe("andalucia"); // Benalmádena
    expect(comunidadDeIne("10037")).toBe("extremadura"); // Cáceres
    expect(comunidadDeIne("48")).toBe("pais_vasco");
    expect(comunidadDeIne("51001")).toBe("ceuta");
    expect(comunidadDeIne(undefined)).toBeUndefined();
    expect(comunidadDeIne("99001")).toBeUndefined();
  });

  it("la plantilla andaluza de habitabilidad sigue con las mismas provincias", () => {
    const andaluzas = PLANTILLAS.filter((p) => p.provinciasIne);
    expect(andaluzas.length).toBeGreaterThan(0);
    for (const p of andaluzas) expect([...p.provinciasIne!]).toEqual(provinciasDe("andalucia"));
  });

  it("la comunidad de la obra sale del municipio", () => {
    expect(comunidadDeObra({ municipioIne: "29069" })).toBe("andalucia");
    expect(comunidadDeObra({})).toBeUndefined();
  });
});

describe("el régimen de la promoción", () => {
  it("sin contestar: nada, y un expediente de antes se lee igual", () => {
    expect(dg().promocion).toBeUndefined();
    expect(promocionDe(dg())).toEqual({});
  });

  it("se contesta, se cambia y se borra; sin respuestas, el campo desaparece", () => {
    let d = conPromocion(dg(), { propiedadHorizontal: true });
    expect(d.promocion).toEqual({ propiedadHorizontal: true });
    d = conPromocion(d, { protegida: false });
    expect(promocionDe(d)).toEqual({ propiedadHorizontal: true, protegida: false });
    d = conPromocion(d, { propiedadHorizontal: undefined });
    expect(d.promocion).toEqual({ protegida: false });
    d = conPromocion(d, { protegida: undefined });
    expect("promocion" in d).toBe(false);
  });

  it("un «no» es una respuesta, no un hueco", () => {
    expect(promocionDe(conPromocion(dg(), { autopromocion: false }))).toEqual({ autopromocion: false });
  });

  it("lo que no tiene forma se descarta al leer", () => {
    const tocado = { ...dg(), promocion: { propiedadHorizontal: "sí", protegida: true, otra: 1 } } as unknown as DatosGenerales;
    expect(promocionDe(tocado)).toEqual({ protegida: true });
    expect(promocionDe({ promocion: "x" } as unknown as DatosGenerales)).toEqual({});
  });

  it("la autopromoción solo se pregunta en vivienda unifamiliar", () => {
    expect(preguntaAutopromocion({ esUnifamiliar: true })).toBe(true);
    expect(preguntaAutopromocion({ esUnifamiliar: false })).toBe(false);
  });
});
