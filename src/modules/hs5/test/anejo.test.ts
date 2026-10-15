import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { textoParrafo } from "../../../lib/cte/memoria";
import type { AnejoDoc, ParteAnejo } from "../../../lib/cte/presentacion";
import { hs5EstadoDefaults, type Hs5Estado } from "../estado";
import { justificarHs5, type ObraHs5 } from "../justificacion";
import { memoriaHs5 } from "../memoria";
import { anejoHs5, arquetaTabla413, arquetasHs5 } from "../anejo";

// =============================================================================
// feature-33, paso 3: el cálculo extenso de saneamiento para el anejo. Sale del
// mismo resultado que la memoria; las arquetas, con las reglas del DB que
// recoge K-MEM.18 según el colector vaya enterrado o colgado.
// =============================================================================

const OBRA: ObraHs5 = { pluviometria: { zona: "A", isoyeta: 30 }, cotaAlcantarillado_m: -1.2 };

function estado(parcial: Partial<Hs5Estado> = {}): Hs5Estado {
  return { ...hs5EstadoDefaults, ...parcial };
}

function parte(a: AnejoDoc, titulo: string): ParteAnejo {
  const p = a.partes.find((x) => x.titulo === titulo);
  if (!p) throw new Error(`no hay parte ${titulo}`);
  return p;
}

const texto = (p: ParteAnejo) => p.parrafos.map(textoParrafo).join(" ");

const DEMO = edificioDeCaso("plurifamiliar_locales");
const UNIFAMILIAR = edificioDeCaso("unifamiliar");

describe("arquetaTabla413", () => {
  it("la primera columna igual o mayor que el Ø de salida", () => {
    expect(arquetaTabla413(110)).toEqual({ diametro_mm: 150, largo_cm: 50, ancho_cm: 50 });
    expect(arquetaTabla413(90)).toMatchObject({ largo_cm: 40, ancho_cm: 40 });
    expect(arquetaTabla413(600)).toBeNull();
  });
});

describe("anejoHs5 · el Demo (colectores colgados del garaje)", () => {
  const j = justificarHs5(estado(), DEMO, OBRA);
  const a = anejoHs5(j);

  it("las seis partes", () => {
    expect(a.partes.map((p) => p.titulo)).toEqual([
      "Unidades de desagüe por aparato",
      "Bajantes",
      "Ramales y colectores",
      "Arquetas",
      "Pluviales",
      "Ventilación",
    ]);
  });

  it("UD por vivienda tipo: las que dice la memoria", () => {
    const t = parte(a, "Unidades de desagüe por aparato").tablas![0];
    expect(t.cabecera).toEqual(["Aparato", "UD", "Ø [mm]", "Viv. A", "Viv. B"]);
    expect(t.filas.find((f) => f[0] === "Cuarto de baño (inodoro con cisterna)")).toEqual(["Cuarto de baño (inodoro con cisterna)", "7", "100", "2", "1"]);
    const total = t.filas.at(-1)!;
    expect(total[0]).toBe("UD de la unidad");
    const memoria = memoriaHs5(j).parrafos.map(textoParrafo).join(" ");
    expect(memoria).toContain(`suman ${total[3]} y ${total[4]} UD`);
  });

  it("el colector general, con las mismas UD y el mismo Ø que la tabla de la memoria", () => {
    const fila = parte(a, "Ramales y colectores").tablas![0].filas[0];
    const col = j.residuales!.porTramo.find((t) => t.id === j.red.colectorId)!;
    expect(fila.slice(0, 5)).toEqual(["Colector general", "1", String(col.udAcumuladas), "2", String(col.diametro_mm)]);
    const enMemoria = memoriaHs5(j).tablas[0].filas.find((f) => f[0].startsWith("Colector general"))!;
    expect(enMemoria[1]).toBe(`${col.udAcumuladas} UD`);
    expect(enMemoria[3]).toBe(String(col.diametro_mm));
  });

  it("los ramales iguales de varias plantas van en una fila", () => {
    const filas = parte(a, "Ramales y colectores").tablas![0].filas;
    expect(filas.find((f) => f[0] === "Ramal de cocina · A · P1, P2 y P3")?.[1]).toBe("3");
  });

  it("las bajantes, con las dos comprobaciones de la tabla 4.4", () => {
    const t = parte(a, "Bajantes").tablas![0];
    expect(t.cabecera).toEqual(["Bajante", "N.º", "Plantas", "UD total", "Ø por total", "UD ramal", "Ø por ramal", "Ø"]);
    expect(t.filas.map((f) => f[0])).toEqual(["Bajante de fecales · A", "Bajante de cocina · A", "Bajante de fecales · B", "Bajante de cocina · B"]);
  });

  it("colgados: sin arquetas a pie de bajante, el pozo general con trasdós y cierre hidráulico", () => {
    expect(arquetasHs5(j).map((x) => x.tipo)).toEqual(["Pozo general (residuales y pluviales)"]);
    const t = texto(parte(a, "Arquetas"));
    expect(t).toContain("Con los colectores colgados, las bajantes se conectan mediante piezas especiales, sin arquetas");
    expect(t).toContain("arqueta de trasdós (ap. 3.3.1.5 pto 2 d)");
    expect(t).toContain("con arqueta sifónica o con cierres en los puntos de captación (ap. 3.2 pto 1)");
    expect(t).toContain("separador de grasas");
    expect(t).toContain("distancias no mayores de 15 m");
  });

  it("separativo: un pozo por red, sin trasdós", () => {
    const js = justificarHs5(estado({ alcantarillado: "separativo" }), DEMO, OBRA);
    expect(arquetasHs5(js).map((x) => x.tipo)).toEqual(["Pozo general de residuales", "Pozo general de pluviales"]);
    expect(texto(parte(anejoHs5(js), "Arquetas"))).not.toContain("trasdós");
  });
});

describe("anejoHs5 · la unifamiliar (colectores enterrados)", () => {
  const j = justificarHs5(estado(), UNIFAMILIAR, OBRA);

  it("una arqueta a pie de cada bajante, no sifónica, con el Ø del colector al que vierte", () => {
    const arq = arquetasHs5(j);
    const res = arq.find((x) => x.tipo.startsWith("A pie de bajante de residuales"))!;
    const col = j.residuales!.porTramo.find((t) => t.id === j.red.colectorId)!;
    expect(res.n).toBe(j.residuales!.porTramo.filter((t) => t.tipo === "bajante").length);
    expect(res.diametro_mm).toBe(col.diametro_mm);
    expect(arq.find((x) => x.tipo.startsWith("A pie de bajante de pluviales"))?.n).toBe(j.pluviales!.bajantes);
    expect(arq.at(-1)!.tipo).toBe("Pozo general (residuales y pluviales)");
  });

  it("la tabla de arquetas lleva la dimensión de la tabla 4.13", () => {
    const fila = parte(anejoHs5(j), "Arquetas").tablas![0].filas[0];
    expect(fila).toEqual(["A pie de bajante de residuales (no sifónica)", "1", "110", "50 × 50", "ap. 3.3.1.4.2 pto 3"]);
  });
});
