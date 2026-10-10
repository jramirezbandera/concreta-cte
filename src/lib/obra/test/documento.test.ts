import { describe, it, expect } from "vitest";
import { justificacionRegistry } from "../../../data/justificacionRegistry";
import { fuenteCorta, SECCIONES } from "../memoria";

// =============================================================================
// feature-29: el esqueleto del documento. Cada justificación tiene su sitio
// numerado, y la línea de fuente de la memoria se queda con la cita.
// =============================================================================

describe("las secciones del documento", () => {
  it("toda justificación del expediente tiene su sitio, una sola vez", () => {
    const enDocumento = SECCIONES.flatMap((s) => s.keys);
    const delRegistry = justificacionRegistry.filter((e) => !e.dev).map((e) => e.key);
    expect([...enDocumento].sort()).toEqual([...delRegistry].sort());
    expect(new Set(enDocumento).size).toBe(enDocumento.length);
  });

  it("numeradas en orden dentro de cada capítulo", () => {
    for (const cap of [3, 4] as const) {
      const nums = SECCIONES.filter((s) => s.capitulo === cap).map((s) => s.numero);
      expect(nums).toEqual(nums.map((_, i) => `${cap}.${i + 1}`));
    }
  });
});

describe("fuenteCorta", () => {
  it("quita la versión consolidada, «datos de…» y el motor", () => {
    expect(fuenteCorta("DB-HS · HS 1 (consolidado 14-06-2022) · tablas 2.1 y 2.2 · datos de El edificio y de la obra · motor 0.2.0")).toBe(
      "DB-HS · HS 1 · tablas 2.1 y 2.2",
    );
    expect(fuenteCorta("DB-HS · HS 6 (RD 732/2019, consolidado 14-06-2022) · ap. 2 · apéndice B · motor 0.2.0")).toBe(
      "DB-HS · HS 6 · ap. 2 · apéndice B",
    );
    expect(fuenteCorta("REBT (RD 842/2002), consolidado BOE 03-09-2025 · ITC-BT-04, 10, 16, 25 y 52 · motor 0.2.0")).toBe(
      "REBT (RD 842/2002) · ITC-BT-04, 10, 16, 25 y 52",
    );
  });

  it("deja lo que no es versión: fechas de comentarios y del Catálogo", () => {
    const f = "DB-SUA · SUA 9 · comentarios del Ministerio (15-jul-2024, no reglamentarios) · CEC (marzo 2010)";
    expect(fuenteCorta(f)).toBe(f);
  });
});
