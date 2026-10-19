import { describe, expect, it } from "vitest";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { evaluarExpediente } from "../../../lib/obra/evaluar";
import { textoPlanoMemoriaCte, memoriaCte } from "../../../lib/obra/memoria";
import { obraDeCaso } from "../../../lib/proyecto/alcance";
import { aplicabilidadEfectiva } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Alcance, Proyecto } from "../../../lib/proyecto/tipos";
import { conZona, he3EstadoDefaults, resolverControl, zonaDe, type He3Estado } from "../estado";
import { justificarHe3, type DetalleHe3 } from "../justificacion";
import { memoriaHe3 } from "../memoria";
import { veei } from "../tablas";

// =============================================================================
// feature-36, paso 2: HE 3, condiciones de las instalaciones de iluminación.
// Potencias e iluminancias inventadas, como las del Demo.
// =============================================================================

const AHORA = "2026-10-19T10:00:00.000Z";

function caso(c: CasoEdificio, he3?: Partial<He3Estado>): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(c), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(c) ?? {}) };
  if (he3) p.justificaciones = { he3: { inputs: { ...he3EstadoDefaults, ...he3 } as unknown as Record<string, unknown>, schemaVersion: "1" } };
  return p;
}

const j = (p: Proyecto) => justificarHe3((p.justificaciones.he3?.inputs ?? {}) as Partial<He3Estado>, { edificio: p.edificio, datosGenerales: p.datosGenerales });
const zona = (p: Proyecto, id: string) => j(p).elementos.find((e) => e.id === `zona-${id}`)!;
const det = <C extends DetalleHe3["clase"]>(d: DetalleHe3, c: C) => {
  if (d.clase !== c) throw new Error(`no es ${c}`);
  return d as Extract<DetalleHe3, { clase: C }>;
};

/** Plurifamiliar: portal z3 (35 m²), garaje z4 (460 m²), trasteros z5 (48 m²). */
const PLURI: He3Estado["zonas"] = {
  z3: { potencia_W: 175, iluminancia_lx: 150 },
  z4: { potencia_W: 920, iluminancia_lx: 75 },
  z5: { potencia_W: 144, iluminancia_lx: 100 },
};

describe("aplicabilidad (K-MEM.6)", () => {
  it("unifamiliar: no aplica, las instalaciones interiores de las viviendas están excluidas", () => {
    const a = aplicabilidadEfectiva(caso("unifamiliar"), "he3");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/instalaciones interiores de las viviendas.*ap\. 1 pto 2 a/);
  });

  it("plurifamiliar, con locales y oficinas: aplica", () => {
    for (const c of ["plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) expect(aplicabilidadEfectiva(caso(c), "he3").aplicabilidad, c).toBe("aplica");
  });

  it("existente: cambio de uso característico, todo el edificio; alumbrado renovado, lo renovado; si no, no aplica", () => {
    const existente = (alcance: Alcance, tipos: Alcance["tipos"] = ["reforma"]): Proyecto => {
      const p = caso("plurifamiliar");
      p.datosGenerales = { ...p.datosGenerales, intervencion: "reforma", alcance: { tipos, integral: false, interior: [], envolvente: [], estructura: false, ...alcance } };
      return p;
    };
    expect(aplicabilidadEfectiva(existente({ interior: ["alumbrado"] }), "he3")).toMatchObject({ aplicabilidad: "aplica_reformado" });
    expect(aplicabilidadEfectiva(existente({ interior: ["alumbrado"] }), "he3").nota).toMatch(/1\.000 m².*25 %/);
    expect(aplicabilidadEfectiva(existente({ interior: ["distribucion"] }), "he3")).toMatchObject({ aplicabilidad: "no_aplica" });
    expect(aplicabilidadEfectiva(existente({ integral: true }), "he3")).toMatchObject({ aplicabilidad: "aplica_reformado" });
    expect(aplicabilidadEfectiva(existente({ cambioUsoCaracteristico: true }, ["cambio_uso"]), "he3")).toMatchObject({ aplicabilidad: "aplica" });
  });

  it("local que pasa a vivienda en un edificio con zonas comunes: sin alumbrado común renovado, no aplica", () => {
    expect(aplicabilidadEfectiva(caso("reforma_local_vivienda"), "he3").aplicabilidad).toBe("no_aplica");
  });
});

describe("la justificación", () => {
  it("VEEI = 100·P/(S·Em)", () => {
    expect(veei(175, 35, 150)).toBeCloseTo(3.333, 3);
  });

  it("las zonas que se justifican: portal, garaje y trasteros; no las viviendas", () => {
    const r = j(caso("plurifamiliar", { zonas: PLURI }));
    expect(r.zonas.map((z) => z.uso)).toEqual(["zona_comun", "garaje", "trasteros"]);
    expect(r.veredicto).toBe("ok");
    const z3 = det(zona(caso("plurifamiliar", { zonas: PLURI }), "z3").detalle, "zona");
    expect(z3).toMatchObject({ limite: 4, aparcamiento: false });
    expect(z3.veei).toBeCloseTo(3.333, 3);
    expect(det(zona(caso("plurifamiliar", { zonas: PLURI }), "z4").detalle, "zona").aparcamiento).toBe(true);
  });

  it("un VEEI por encima del límite no cumple", () => {
    const p = caso("plurifamiliar", { zonas: { ...PLURI, z3: { potencia_W: 300, iluminancia_lx: 150 } } });
    expect(zona(p, "z3").veredicto).toBe("fail"); // 5,71 > 4,0
    expect(j(p).veredicto).toBe("fail");
  });

  it("sin potencia o sin iluminancia: «sin declarar», no cumple y lo dice la cabecera", () => {
    const p = caso("plurifamiliar", { zonas: { z3: PLURI.z3 } });
    const r = j(p);
    expect(r.sinDatos).toBe(2);
    expect(zona(p, "z4")).toMatchObject({ veredicto: "fail", valor: { texto: "sin declarar" } });
    expect(r.elementos.find((e) => e.id === "potencia-aparcamiento")).toMatchObject({ veredicto: "fail", valor: { texto: "sin declarar" } });
  });

  it("potencia máxima: zonas comunes ≤ 10 W/m² y aparcamiento ≤ 5, con todas las plantas", () => {
    const r = j(caso("plurifamiliar", { zonas: PLURI }));
    const comunes = det(r.elementos.find((e) => e.id === "potencia-comunes")!.detalle, "potencia");
    expect(comunes).toMatchObject({ limite: 10, ptot_W: 319, stot_m2: 83 });
    const garaje = det(r.elementos.find((e) => e.id === "potencia-aparcamiento")!.detalle, "potencia");
    expect(garaje).toMatchObject({ limite: 5, ptot_W: 920, stot_m2: 460, ratio: 2 });
  });

  it("con más de 600 lux, el máximo de las zonas comunes pasa a 25 W/m²", () => {
    const r = j(caso("plurifamiliar", { zonas: { ...PLURI, z3: { potencia_W: 1000, iluminancia_lx: 700 } } }));
    expect(det(r.elementos.find((e) => e.id === "potencia-comunes")!.detalle, "potencia").limite).toBe(25);
  });

  it("oficinas: zonas comunes con el límite de no residencial (6,0) y las oficinas, previstas con su actividad", () => {
    const r = j(caso("oficinas"));
    const vestibulo = r.elementos.find((e) => e.detalle.clase === "zona" && e.detalle.zona.uso === "vestibulo")!;
    expect(det(vestibulo.detalle, "zona").limite).toBe(6);
    expect(r.elementos.find((e) => e.id === "otros")).toMatchObject({ veredicto: "previsto" });
    expect(r.elementos.some((e) => e.id === "luz-natural")).toBe(false);
  });

  it("control: presencia por defecto; las tres opciones valen", () => {
    expect(resolverControl({})).toBe("presencia");
    expect(resolverControl({ control: "manual_horario" })).toBe("manual_horario");
    const r = j(caso("plurifamiliar", { zonas: PLURI, control: "pulsador" }));
    expect(r.elementos.find((e) => e.id === "control")).toMatchObject({ veredicto: "ok", valor: { texto: "pulsador temporizado" } });
  });
});

describe("lo que se guarda", () => {
  it("una zona sin nada declarado desaparece; los números no válidos se leen como null", () => {
    let zonas = conZona({}, "z3", { potencia_W: 175 });
    expect(zonas).toEqual({ z3: { potencia_W: 175, iluminancia_lx: null } });
    zonas = conZona(zonas, "z3", { potencia_W: null });
    expect(zonas).toEqual({});
    expect(zonaDe({ zonas: { z3: { potencia_W: -5, iluminancia_lx: Number.NaN } } }, "z3")).toEqual({ potencia_W: null, iluminancia_lx: null });
  });
});

describe("la memoria", () => {
  it("la tabla por zona y la de la potencia máxima, con el control en el texto", () => {
    const m = memoriaHe3(j(caso("plurifamiliar", { zonas: PLURI })));
    expect(m.norma).toBe("DB-HE 3");
    expect(m.tablas?.map((t) => t.rotulo)).toEqual(["Valor de eficiencia energética de la instalación", "Potencia máxima de iluminación"]);
    expect(m.tablas![0].filas[0]).toEqual(["Zona común (PB)", "35", "175", "150", "3,33", "≤ 4", "sí"]);
    const texto = m.parrafos.flat().map((t) => (typeof t === "string" ? t : t.v)).join("");
    expect(texto).toMatch(/instalaciones interiores de las viviendas están excluidas/);
    expect(texto).toMatch(/detección de presencia temporizada/);
    expect(texto).toMatch(/luz natural/);
  });

  it("el Demo: HE 3 cumple y su apartado va en el 3.6, tras HE 1", () => {
    const p = crearProyectoDemo(AHORA);
    expect(evaluarExpediente(p).porClave.he3).toMatchObject({ aplicabilidad: "aplica", veredicto: "ok" });
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(t).toMatch(/3\.6\.3\. HE 3 Condiciones de las instalaciones de iluminación/);
    expect(t.indexOf("HE 3 Condiciones")).toBeLessThan(t.indexOf("HE 4 Contribución"));
  });

  it("la unifamiliar: el «no aplica» en una línea", () => {
    const t = textoPlanoMemoriaCte(memoriaCte(caso("unifamiliar")));
    expect(t).toMatch(/HE 3 Condiciones de las instalaciones de iluminación: no es de aplicación/);
  });
});

describe("los textos", () => {
  it("solo lo que no cumple tiene texto de incumplimiento", async () => {
    const { textoIncumplimientoHe3 } = await import("../textos");
    const ok = j(caso("plurifamiliar", { zonas: PLURI }));
    for (const e of ok.elementos) expect(textoIncumplimientoHe3(e), e.id).toBeNull();
    const mal = j(caso("plurifamiliar", { zonas: { ...PLURI, z3: { potencia_W: 300, iluminancia_lx: 150 } } }));
    expect(textoIncumplimientoHe3(mal.elementos.find((e) => e.id === "zona-z3")!)?.titulo).toMatch(/supera el límite/);
    const sin = j(caso("plurifamiliar"));
    expect(textoIncumplimientoHe3(sin.elementos.find((e) => e.id === "zona-z3")!)?.titulo).toMatch(/Falta la potencia o la iluminancia/);
  });
});

describe("la cabecera", () => {
  it("nombra lo que cumple: zonas comunes y aparcamiento", async () => {
    const { fraseHe3 } = await import("../textos");
    expect(fraseHe3(j(caso("plurifamiliar", { zonas: PLURI })))).toBe("Las zonas comunes y el aparcamiento cumplen el VEEI límite y la potencia máxima, con detección de presencia temporizada.");
    expect(fraseHe3(j(caso("plurifamiliar")))).toMatch(/^Faltan la potencia o la iluminancia de 3 zonas/);
    expect(j(caso("plurifamiliar_locales")).elementos.find((e) => e.id === "otros")?.nombre).toBe("Locales");
  });
});
