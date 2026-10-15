import { describe, expect, it } from "vitest";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";
import type { AnejoDoc } from "../../cte/presentacion";
import { conPlanos, remisionAnejo } from "../remision";
import { bloquesMemoria, memoriaCte } from "../memoria";
import { antesDeEntregar } from "../entrega";

// =============================================================================
// feature-33, paso 4: la memoria remite al anejo de instalaciones (con los
// números de sus tablas) y a los planos que declara el proyectista.
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-16T10:00:00.000Z");

function anejo(tablas: number): AnejoDoc {
  return {
    partes: [{ titulo: "Parte", parrafos: [], tablas: Array.from({ length: tablas }, () => ({ cabecera: ["a"], filas: [] })) }],
    fuente: "",
  };
}

describe("remisionAnejo", () => {
  it("el anejo con el rango de sus tablas y los planos", () => {
    expect(remisionAnejo("hs4", anejo(3), "I05–I07")).toBe("El cálculo extenso se desarrolla en el anejo 5.3.1 (tablas 5.3.1-1 a 5.3.1-3). Ver planos I05–I07.");
    expect(remisionAnejo("hs5", anejo(1), "I06")).toBe("El cálculo extenso se desarrolla en el anejo 5.3.2 (tabla 5.3.2-1). Ver plano I06.");
    expect(remisionAnejo("hs5", anejo(0), undefined)).toBe("El cálculo extenso se desarrolla en el anejo 5.3.2.");
  });

  it("«planos» si son varios: con guion, coma, «y» o «e»", () => {
    expect(remisionAnejo("hs4", undefined, "I06 e I07")).toBe("Ver planos I06 e I07.");
    expect(remisionAnejo("hs4", undefined, "I06, I07")).toBe("Ver planos I06, I07.");
    expect(remisionAnejo("hs4", undefined, "  ")).toBeNull();
  });

  it("solo para las instalaciones del anejo", () => {
    expect(remisionAnejo("si1", anejo(2), "A01")).toBeNull();
  });
});

describe("conPlanos", () => {
  it("cambia uno y deja los demás; vacío, lo quita", () => {
    expect(conPlanos({ hs4: "I05" }, "hs5", " I06 ")).toEqual({ hs4: "I05", hs5: "I06" });
    expect(conPlanos({ hs4: "I05", hs5: "I06" }, "hs4", undefined)).toEqual({ hs5: "I06" });
    expect(conPlanos(undefined, "hs4", "")).toEqual({});
  });
});

describe("la memoria remite al anejo y a los planos", () => {
  it("el Demo: al final de HS 4 y HS 5, antes de la fuente", () => {
    const b = bloquesMemoria(memoriaCte(demo()));
    const i4 = b.findIndex((x) => x.tipo === "parrafo" && x.texto.startsWith("El cálculo extenso se desarrolla en el anejo 5.3.1"));
    expect(i4).toBeGreaterThan(0);
    expect(b[i4]).toEqual({ tipo: "parrafo", texto: "El cálculo extenso se desarrolla en el anejo 5.3.1 (tablas 5.3.1-1 a 5.3.1-3). Ver plano I05." });
    expect(b[i4 + 1].tipo).toBe("nota");
    const t5 = b.find((x) => x.tipo === "parrafo" && x.texto.includes("anejo 5.3.2"));
    expect(t5).toEqual({ tipo: "parrafo", texto: "El cálculo extenso se desarrolla en el anejo 5.3.2 (tablas 5.3.2-1 a 5.3.2-5). Ver planos I06 e I07." });
  });

  it("sin planos, solo el anejo, y «Antes de entregar» los pide", () => {
    const p = demo();
    const q: Proyecto = { ...p, datosGenerales: { ...p.datosGenerales, planos: { hs5: "I06" } } };
    const b = bloquesMemoria(memoriaCte(q));
    expect(b.some((x) => x.tipo === "parrafo" && x.texto === "El cálculo extenso se desarrolla en el anejo 5.3.1 (tablas 5.3.1-1 a 5.3.1-3).")).toBe(true);
    const pend = antesDeEntregar(q).filter((x) => x.id.endsWith(":planos"));
    expect(pend.map((x) => `${x.id}|${x.titulo}`)).toEqual(["hs4:planos|Indica los planos de fontanería."]);
    expect(pend[0].ruta).toBe("hs/fontaneria");
  });
});
