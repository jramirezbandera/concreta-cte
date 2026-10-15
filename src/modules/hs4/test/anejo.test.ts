import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { textoParrafo } from "../../../lib/cte/memoria";
import type { AnejoDoc, ParteAnejo } from "../../../lib/cte/presentacion";
import { caminoCritico, calcHS4, hs4Defaults } from "../calc";
import { hs4EstadoDefaults, type Hs4Estado } from "../estado";
import { justificarHs4 } from "../justificacion";
import { memoriaHs4 } from "../memoria";
import { anejoHs4, idaAcsEstimada_m } from "../anejo";
import { CONTADOR_GENERAL_TABLA_4_1, filaContadorGeneral } from "../tablas";

// =============================================================================
// feature-33, paso 2: el cálculo extenso de fontanería para el anejo. Sale del
// mismo resultado que la memoria; lo que el motor no guardaba (J, la presión
// de entrada, el camino ordenado) se añade sin cambiar ningún número.
// =============================================================================

function estado(parcial: Partial<Hs4Estado> = {}): Hs4Estado {
  return { ...hs4EstadoDefaults, ...parcial };
}

const DEMO = edificioDeCaso("plurifamiliar_locales");
const UNIFAMILIAR = edificioDeCaso("unifamiliar");

function parte(a: AnejoDoc, titulo: string): ParteAnejo {
  const p = a.partes.find((x) => x.titulo === titulo);
  if (!p) throw new Error(`no hay parte ${titulo}`);
  return p;
}

const texto = (p: ParteAnejo) => p.parrafos.map(textoParrafo).join(" ");

describe("caminoCritico", () => {
  const r = calcHS4(hs4Defaults);
  const camino = caminoCritico(r);

  it("de la acometida al punto crítico, tramo a tramo", () => {
    expect(camino[0].parentId).toBeNull();
    expect(camino[0].presionEntrada_kPa).toBe(r.presionAcometida_kPa);
    const ap = r.porAparato.find((a) => a.id === r.puntoCriticoId)!;
    expect(camino.at(-1)!.id).toBe(ap.tramoId);
    for (let i = 1; i < camino.length; i++) {
      expect(camino[i].parentId).toBe(camino[i - 1].id);
      expect(camino[i].presionEntrada_kPa).toBe(camino[i - 1].presionResidual_kPa);
    }
    expect(camino.every((t) => t.esCritico)).toBe(true);
  });

  it("las pérdidas del camino suman lo que va de la acometida al punto crítico", () => {
    const suma = camino.reduce((s, t) => s + t.perdida_kPa, 0);
    expect(suma).toBeCloseTo(r.presionAcometida_kPa - r.presionCritica_kPa, 9);
  });

  it("J·L es la pérdida por rozamiento, y las localizadas, la fracción f", () => {
    for (const t of r.porTramo) {
      expect(t.j_kPa_m * t.longitud_m).toBeCloseTo(t.perdidas.rozamiento_kPa, 9);
      expect(t.perdidas.localizadas_kPa).toBeCloseTo(t.perdidas.rozamiento_kPa * r.fraccionPerdidasLocalizadas, 9);
    }
    expect(r.fraccionPerdidasLocalizadas).toBe(0.25);
  });

  it("sin aparatos, vacío", () => {
    expect(caminoCritico(calcHS4({ ...hs4Defaults, aparatos: [] }))).toEqual([]);
  });
});

describe("tabla 4.1", () => {
  it("la primera columna igual o mayor; armario hasta 40, cámara desde 50", () => {
    expect(filaContadorGeneral(25)).toMatchObject({ alojamiento: "armario", largo_mm: 900, ancho_mm: 500, alto_mm: 300 });
    expect(filaContadorGeneral(26)?.diametro_mm).toBe(32);
    expect(filaContadorGeneral(40)?.alojamiento).toBe("armario");
    expect(filaContadorGeneral(50)).toMatchObject({ alojamiento: "camara", largo_mm: 2100, ancho_mm: 700, alto_mm: 700 });
    expect(filaContadorGeneral(151)).toBeNull();
    expect(CONTADOR_GENERAL_TABLA_4_1.procedencia.tabla).toBe("Tabla 4.1");
  });
});

describe("anejoHs4 · el Demo", () => {
  const j = justificarHs4(estado(), DEMO, { presionAcometida_kPa: 250 });
  const a = anejoHs4(j);

  it("las cinco partes, con las abreviaturas una vez", () => {
    expect(a.partes.map((p) => p.titulo)).toEqual(["Caudales por aparato", "Camino crítico", "Resto de la red", "Contador", "Agua caliente sanitaria"]);
    expect(a.abreviaturas?.map(([k]) => k)).toEqual(["Lr", "Lt", "Qb", "K", "Q", "Ø", "v", "J", "Pent y Psal"]);
  });

  it("aparatos por vivienda tipo, con los caudales de la tabla 2.1", () => {
    const t = parte(a, "Caudales por aparato").tablas![0];
    expect(t.cabecera).toEqual(["Aparato", "AF [dm³/s]", "ACS [dm³/s]", "Viv. A", "Viv. B"]);
    expect(t.filas.find((f) => f[0] === "Lavabo")).toEqual(["Lavabo", "0,100", "0,065", "2", "2"]);
    expect(t.filas.find((f) => f[0] === "Inodoro con cisterna")?.[2]).toBe("—");
  });

  it("el camino crítico: once columnas, ancha, Lt = Lr·1,25 y las longitudes tipo con su nota", () => {
    const t = parte(a, "Camino crítico").tablas![0];
    expect(t.ancha).toBe(true);
    expect(t.cabecera).toEqual(["Tramo", "Lr (1)", "Lt", "Qb", "K", "Q", "Ø", "v", "J", "Pent", "Psal"]);
    expect(t.filas[0].slice(0, 3)).toEqual(["Acometida", "3,00", "3,75"]);
    expect(t.notas?.[0]).toMatch(/^Longitudes tipo de la herramienta/);
    const camino = caminoCritico(j.resultado!);
    expect(t.filas).toHaveLength(camino.length);
  });

  it("la memoria y el anejo dan la misma presión en el punto crítico", () => {
    const pc = Math.round(j.resultado!.presionCritica_kPa);
    expect(texto(parte(a, "Camino crítico"))).toContain(`llegan ${pc} kPa, por encima del mínimo de 100 kPa`);
    expect(memoriaHs4(j).parrafos.map(textoParrafo).join(" ")).toContain(`${pc} kPa, por encima del mínimo de 100 kPa`);
  });

  it("el resto de la red agrupa los tramos iguales y no repite los del camino", () => {
    const filas = parte(a, "Resto de la red").tablas![0].filas;
    const total = filas.reduce((s, f) => s + Number(f[1]), 0);
    expect(total).toBe(j.resultado!.porTramo.filter((t) => !t.esCritico).length);
    expect(filas.find((f) => f[0].startsWith("Montante · A1, A2"))).toBeDefined();
  });

  it("la batería, sin dimensiones del DB", () => {
    expect(texto(parte(a, "Contador"))).toMatch(/^La batería de contadores divisionarios tiene 8 contadores\. El DB-HS 4 no fija dimensiones/);
  });

  it("el ACS individual, con la ida estimada y su cita", () => {
    expect(idaAcsEstimada_m(j)).toBeCloseTo(8.5, 9);
    expect(texto(parte(a, "Agua caliente sanitaria"))).toBe(
      "El agua caliente se produce de forma individual en cada unidad. La ida al punto más alejado mide 8,5 m (estimada sobre la red de agua fría, con las longitudes tipo), menos de 15 m, así que no necesita red de retorno (DB-HS 4, ap. 2.3 pto 2 y ap. 3.2.2.1 pto 3).",
    );
  });

  it("con la ida declarada de 18 m, retorno", () => {
    const t = texto(parte(anejoHs4(j, { longitudIdaAcs_m: 18 }), "Agua caliente sanitaria"));
    expect(t).toContain("La ida al punto más alejado mide 18 m: al ser de 15 m o más, la instalación de ACS dispone de red de retorno");
  });

  it("con ACS central, la impulsión y el retorno se dimensionan aparte", () => {
    const jc = justificarHs4(estado({ aguaCaliente: "central" }), DEMO, { presionAcometida_kPa: 250 });
    expect(texto(parte(anejoHs4(jc), "Agua caliente sanitaria"))).toMatch(/^El agua caliente se produce de forma centralizada; su red de impulsión y retorno se dimensiona aparte\./);
  });
});

describe("anejoHs4 · la unifamiliar, con contador general", () => {
  const j = justificarHs4(estado(), UNIFAMILIAR, { presionAcometida_kPa: 250 });

  it("sin el Ø de la compañía, el del tubo de alimentación, como criterio", () => {
    expect(texto(parte(anejoHs4(j), "Contador"))).toBe(
      "El contador general se toma de Ø 25 mm: a falta del Ø de la compañía, el del tubo de alimentación, como criterio de proyecto (el calibre se adecua a los caudales, ap. 4.5.1). Se aloja en un armario de 900 × 500 × 300 mm (longitud × anchura × profundidad), el de la tabla 4.1 para Ø 25 mm (ap. 4.1 pto 1).",
    );
  });

  it("con el Ø de la compañía: de 50, cámara; de 200, fuera de la tabla", () => {
    expect(texto(parte(anejoHs4(j, { diametroContador_mm: 50 }), "Contador"))).toBe(
      "El contador general es de Ø 50 mm, el que fija la compañía suministradora. Se aloja en una cámara de 2100 × 700 × 700 mm (largo × ancho × alto), el de la tabla 4.1 para Ø 50 mm (ap. 4.1 pto 1).",
    );
    expect(texto(parte(anejoHs4(j, { diametroContador_mm: 200 }), "Contador"))).toContain("Queda fuera de la tabla 4.1");
  });

  it("sin «· Vivienda» en los tramos", () => {
    const filas = parte(anejoHs4(j), "Camino crítico").tablas![0].filas;
    expect(filas.some((f) => f[0].includes("Vivienda"))).toBe(false);
  });
});

describe("anejoHs4 · red a mano", () => {
  it("sin la nota de longitudes tipo, y los aparatos de la red en una columna", () => {
    const j = justificarHs4(estado({ red: "manual" }), DEMO, { presionAcometida_kPa: 250 });
    const a = anejoHs4(j);
    expect(parte(a, "Camino crítico").tablas![0].notas).toBeUndefined();
    expect(parte(a, "Caudales por aparato").tablas![0].cabecera.at(-1)).toBe("Red");
  });
});
