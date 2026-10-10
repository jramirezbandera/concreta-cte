import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { si6 } from "../definicion";
import { si6EstadoDefaults, type Si6Estado } from "../estado";
import { justificarSi6 } from "../justificacion";
import { BIDIRECCIONALES_C5, CLASES_R, LOSAS_C4, R_TABLA_3_1, R_TABLA_3_2, SOPORTES_C2, VIGAS_C3 } from "../tablas";

// =============================================================================
// SI 6 · Resistencia al fuego de la estructura (feature-19): tablas 3.1 y 3.2 y
// Anejo C. Cifras: research/verificacion-si4-si6.md, bloques C4 y C5.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const caso = (c: CasoEdificio, estado: Partial<Si6Estado> = {}) =>
  justificarSi6({ ...si6EstadoDefaults, ...estado }, { edificio: edificioDeCaso(c), datosGenerales: dg });

describe("SI6 · tablas", () => {
  it("tabla 3.1: más altura, nunca menos R; el sótano no baja de la de h ≤ 15 m", () => {
    const T = R_TABLA_3_1.datos;
    for (const fila of [T.residencial, T.comercial]) {
      expect(fila[1]).toBeLessThanOrEqual(fila[2]!);
      expect(fila[2]!).toBeLessThanOrEqual(fila[3]!);
      expect(fila[0]).toBeGreaterThanOrEqual(fila[1]);
    }
    const t32 = R_TABLA_3_2.datos;
    expect(t32.bajo < t32.medio && t32.medio < t32.alto).toBe(true);
  });

  it("Anejo C: al subir de clase no bajan ni las dimensiones ni las distancias al eje", () => {
    for (let i = 1; i < CLASES_R.length; i++) {
      const a = CLASES_R[i - 1];
      const b = CLASES_R[i];
      expect(SOPORTES_C2.datos[b].soporte[0]).toBeGreaterThanOrEqual(SOPORTES_C2.datos[a].soporte[0]);
      expect(SOPORTES_C2.datos[b].soporte[1]).toBeGreaterThanOrEqual(SOPORTES_C2.datos[a].soporte[1]);
      expect(VIGAS_C3.datos[b].alma).toBeGreaterThanOrEqual(VIGAS_C3.datos[a].alma);
      expect(LOSAS_C4.datos[b].hmin).toBeGreaterThan(LOSAS_C4.datos[a].hmin);
      expect(LOSAS_C4.datos[b].unaDireccion).toBeGreaterThanOrEqual(LOSAS_C4.datos[a].unaDireccion);
      expect(BIDIRECCIONALES_C5.datos[b].hmin).toBeGreaterThan(BIDIRECCIONALES_C5.datos[a].hmin);
    }
  });
});

describe("SI6 · justificación", () => {
  it("Demo: R 60 en las viviendas, R 90 en la PB por el local y R 120 en el sótano por el garaje bajo viviendas", () => {
    const j = caso("plurifamiliar_locales");
    expect(si6.frase(j)).toBe("La estructura necesita R 60 en P1–P3, R 90 en PB (local) y R 120 en S1 (garaje).");
    expect(j.avisos.map((a) => a.id)).toEqual(["sector-sotano"]);
    // El cuarto de riesgo bajo del sótano: R 90 de la tabla 3.2, pero nunca menos que su planta (120).
    const s1 = j.plantas.find((p) => p.nivel === -1)!;
    expect(s1.zonas.find((z) => z.motivo === "riesgo")?.R).toBe(120);
  });

  it("unifamiliar: R 30, y R 90 en la planta del garaje", () => {
    expect(si6.frase(caso("unifamiliar"))).toBe("La estructura necesita R 30 en P1 y R 90 en PB (local de riesgo).");
  });

  it("hormigón: las dimensiones de cada R; el techo del garaje sin revestir va por la tabla C.3", () => {
    const j = caso("plurifamiliar_locales");
    const f = si6.franja(j.elementos.find((e) => e.id === "hormigon")!, j, "ok");
    expect(f.filas.find((x) => x.k === "R 120 · soportes")?.v).toBe("≥ 250 mm, a ≥ 40 mm");
    expect(f.filas.find((x) => x.k === "R 120 · forjado")?.v).toMatch(/nervios como vigas: alma ≥ 120 mm/);
    expect(f.filas.find((x) => x.k === "R 60 · forjado")?.v).toBe("a ≥ 20 mm, con bovedilla y techo revestido");
  });

  it("acero: la R exigida y el anejo con que se justifica, fuera de la herramienta", () => {
    const j = caso("plurifamiliar_locales", { material: "acero" });
    expect(j.elementos.find((e) => e.id === "hormigon")?.veredicto).toBe("fuera");
  });

  it("la memoria dice que la R del forjado es la del sector de debajo", () => {
    expect(textoPlanoMemoria(si6.memoria(caso("plurifamiliar_locales")))).toMatch(/es la del sector que tiene debajo \(tabla 3\.1, nota 1\)/);
  });
});

describe("SI6 · tablas de la memoria (feature-31)", () => {
  it("la R exigida y la de proyecto por planta y local de riesgo especial; el texto no las repite", () => {
    const m = si6.memoria(caso("plurifamiliar_locales"));
    const t = m.tablas![0];
    expect(t.cabecera).toEqual(["Planta o elemento", "Uso que manda", "R exigida", "R de proyecto", "Cumple"]);
    expect(t.filas[0]).toEqual(["P1–P3", "uso Residencial Vivienda, h ≤ 15 m", "R 60", "R 60 (Anejo C)", "Cumple"]);
    // El cuarto de instalaciones del sótano: R 90 de la tabla 3.2, que sube a la de su planta (nota 1).
    expect(t.filas).toContainEqual(["Instalaciones (S1)", "riesgo especial bajo (tabla 3.2)", "R 120 (1)", "R 120 (Anejo C)", "Cumple"]);
    expect(t.notas).toEqual(["No inferior a la de la estructura portante de su planta (tabla 3.2, nota 1)."]);
    // Tras el párrafo del criterio.
    expect(textoParrafo(m.parrafos[t.tras!])).toMatch(/^Los elementos estructurales contenidos en una escalera protegida/);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toContain("R 60 (uso Residencial");
    expect(texto).not.toContain("instalaciones de S1, R 120");
  });

  it("un local de riesgo que manda en su planta va en la fila de la planta, sin repetirse", () => {
    const t = si6.memoria(caso("unifamiliar")).tablas![0];
    expect(t.filas).toEqual([
      ["P1", "vivienda unifamiliar, h ≤ 15 m", "R 30", "R 30 (Anejo C)", "Cumple"],
      ["PB", "garaje privado, riesgo especial bajo (tabla 3.2)", "R 90", "R 90 (Anejo C)", "Cumple"],
    ]);
    expect(t.notas).toBeUndefined();
  });

  it("las dimensiones del Anejo C van en su tabla, con la nota del techo del garaje", () => {
    const m = si6.memoria(caso("plurifamiliar_locales"));
    const t = m.tablas![1];
    expect(t.cabecera).toEqual(["Clase", "Soportes (tabla C.2)", "Forjado"]);
    expect(t.filas[0]).toEqual(["R 60", "≥ 250 mm, a ≥ 20 mm", "a ≥ 20 mm, con bovedilla y techo revestido"]);
    expect(t.filas[2][2]).toMatch(/^nervios como vigas: alma ≥ 120 mm.* \(1\)$/);
    expect(t.tras).toBe(m.parrafos.length);
    expect(m.parrafos.map(textoParrafo).join(" ")).not.toContain("soportes ≥ 250 mm");
  });

  it("acero: la R de proyecto se justifica con el Anejo D y no hay tabla del Anejo C", () => {
    const m = si6.memoria(caso("plurifamiliar_locales", { material: "acero" }));
    expect(m.tablas).toHaveLength(1);
    expect(m.tablas![0].filas[0][3]).toBe("R 60 (Anejo D)");
  });
});
