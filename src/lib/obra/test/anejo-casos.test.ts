import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { crearProyectoDemo } from "../../proyecto/demo";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import type { Proyecto } from "../../proyecto/tipos";
import { textoParrafo } from "../../cte/memoria";
import type { AnejoDoc, ParteAnejo } from "../../cte/presentacion";
import { anejoInstalaciones, bloquesAnejoInstalaciones, textoPlanoAnejoInstalaciones, type AnejoInstalaciones } from "../anejoInstalaciones";
import { memoriaCte, textoPlanoMemoriaCte } from "../memoria";
import { documentoMemoria } from "../../docx/render";
import { ESTUDIO_VACIO, membreteDe } from "../../estudio/estudio";

// =============================================================================
// feature-33, paso 5: el anejo en los casos de partida, y que diga lo mismo que
// la memoria (el criterio de hecho de la fase 6 de PLAN-MEMORIA): la presión
// del punto más desfavorable, y las UD y el Ø del colector.
// =============================================================================

const AHORA = "2026-10-16T10:00:00.000Z";

function deCaso(caso: CasoEdificio): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}) };
  return p;
}

const CASOS: [string, () => Proyecto][] = [
  ["el Demo", () => crearProyectoDemo(AHORA)],
  ...(["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas", "reforma_local_vivienda"] as CasoEdificio[]).map(
    (c): [string, () => Proyecto] => [c, () => deCaso(c)],
  ),
];

function doc(a: AnejoInstalaciones, key: string): AnejoDoc {
  const ap = a.apartados.find((x) => x.key === key);
  if (ap?.tipo !== "calculado") throw new Error(`${key} no está calculado: ${ap?.tipo}`);
  return ap.doc;
}

function parte(d: AnejoDoc, titulo: string): ParteAnejo {
  const p = d.partes.find((x) => x.titulo === titulo);
  if (!p) throw new Error(`no hay parte ${titulo}`);
  return p;
}

const texto = (p: ParteAnejo) => p.parrafos.map(textoParrafo).join(" ");

/** El texto de un apartado de la memoria: desde su título hasta el siguiente. */
function apartado(t: string, titulo: string): string {
  const i = t.indexOf(titulo);
  if (i < 0) throw new Error(`no está «${titulo}»`);
  const resto = t.slice(i + titulo.length);
  const fin = resto.search(/\n\n\d+\.\d+(\.\d+)?\. /);
  return fin < 0 ? resto : resto.slice(0, fin);
}

describe("la memoria y el anejo dicen lo mismo", () => {
  it.each(CASOS)("%s", (_n, crear) => {
    const p = crear();
    const a = anejoInstalaciones(p);
    const m = textoPlanoMemoriaCte(memoriaCte(p));

    // HS 4: la presión del punto más desfavorable, en el texto y al final del camino crítico.
    const camino = parte(doc(a, "hs4"), "Camino crítico");
    const llegan = /En el punto más desfavorable llegan (\d+) kPa/.exec(texto(camino))?.[1];
    expect(llegan).toBeDefined();
    expect(apartado(m, "3.4.4. HS 4")).toContain(`dispone de ${llegan} kPa`);
    const psal = Number(camino.tablas![0].filas.at(-1)!.at(-1)!.replace(",", "."));
    expect(String(Math.round(psal))).toBe(llegan);

    // HS 5: las UD y el Ø del colector (el general, o el de lo intervenido).
    const colector = parte(doc(a, "hs5"), "Ramales y colectores").tablas![0].filas[0];
    expect(colector[0]).toMatch(/^Colector (general|de lo intervenido)$/);
    const [, ud, d] = /recoge (\d+) UD y se resuelve en Ø(\d+) mm/.exec(apartado(m, "3.4.5. HS 5")) ?? [];
    expect([colector[2], colector[4]]).toEqual([ud, d]);

    // REBT (feature-34): la carga total y el IGA de cada vivienda tipo.
    const rebt = doc(a, "rebt");
    const prevision = parte(rebt, "Previsión de cargas");
    const total = /se justifica en la memoria: ([\d.,]+ k?W)/.exec(texto(prevision))?.[1];
    // En la reforma el anejo da la carga antes y después de la obra, no la frase de la total.
    if (_n !== "reforma_local_vivienda") expect(total).toBeDefined();
    if (total) expect(apartado(m, "4.1.1.")).toContain(total);
    for (const fila of prevision.tablas?.[0]?.filas ?? []) expect(apartado(m, "4.1.1.")).toContain(`${fila.at(-1)} A`);
  });
});

describe("la reforma: solo lo intervenido", () => {
  const p = deCaso("reforma_local_vivienda");
  const a = anejoInstalaciones(p);
  const m = textoPlanoMemoriaCte(memoriaCte(p));

  it("fontanería: el contador se añade a la batería existente; los tramos existentes, marcados", () => {
    const hs4 = doc(a, "hs4");
    expect(texto(parte(hs4, "Contador"))).toMatch(/^La batería de contadores divisionarios existente pasa a tener 9 contadores\./);
    const t = parte(hs4, "Camino crítico").tablas![0];
    expect(t.filas.slice(0, 2).map((f) => f[0])).toEqual(["Acometida (existente)", "Tubo de alimentación (existente)"]);
    expect(t.notas).toContain("Los tramos existentes no se modifican; entran en el cálculo porque la presión llega por ellos.");
  });

  it("saneamiento: las UD que llegan al colector existente, con su comprobación", () => {
    const t = parte(doc(a, "hs5"), "Ramales y colectores").tablas![0];
    const ex = t.filas.at(-1)!;
    expect(ex[0]).toBe("Colector general existente (1)");
    expect(m).toContain(`recibe ${ex[2]} UD, 23 de ellas de lo intervenido`);
    expect(t.notas).toEqual(["El colector existente no consta: con las UD de la obra hecha necesita al menos Ø110 (tabla 4.5)."]);
  });

  it("electricidad: la vivienda nueva en planta baja, la LGA y la tierra existentes", () => {
    const rebt = doc(a, "rebt");
    const lineas = parte(rebt, "Línea general de alimentación y derivaciones individuales");
    expect(lineas.tablas![0].filas.map((f) => f[0])).toEqual(["Vivienda A (PB) (1)"]);
    expect(texto(lineas)).toContain("La línea general de alimentación es la existente y no se modifica.");
    expect(texto(parte(rebt, "Puesta a tierra"))).toMatch(/^La instalación de la obra se conecta a la puesta a tierra existente/);
    expect(texto(parte(rebt, "Contadores"))).toBe("Los contadores de la obra se añaden a la centralización existente: 1 más. La caja general de protección es la existente.");
  });

  it("sin bajantes: los ramales van al colector, en la memoria y en el anejo", () => {
    const arq = texto(parte(doc(a, "hs5"), "Arquetas"));
    expect(arq).toContain("el pozo general y la acometida existentes no se modifican");
    expect(arq).toContain("Con los colectores colgados, los ramales se conectan mediante piezas especiales");
    expect(apartado(m, "3.4.5. HS 5")).toContain("no puede ser menor que los ramales que recibe");
    expect(doc(a, "hs5").partes.map((x) => x.titulo)).not.toContain("Bajantes");
  });
});

describe("sin HS 4 ni HS 5", () => {
  // Una reforma sin aparatos nuevos: HS 4 y HS 5 no aplican (K-REF.7).
  function sinAparatos(): Proyecto {
    const p = deCaso("reforma_local_vivienda");
    p.datosGenerales = { ...p.datosGenerales, alcance: { ...p.datosGenerales.alcance, aparatos: "no" } };
    return p;
  }

  it("el anejo dice que no proceden, y la memoria no remite a él", () => {
    const p = sinAparatos();
    const a = anejoInstalaciones(p);
    expect(a.apartados.map((x) => `${x.key}:${x.tipo}`).slice(0, 2)).toEqual(["hs4:no_aplica", "hs5:no_aplica"]);
    const t = textoPlanoAnejoInstalaciones(a);
    expect(t).toContain("5.3.1. Fontanería (DB-HS 4)");
    expect(t).not.toContain("Tabla 5.3.1-");
    const m = textoPlanoMemoriaCte(memoriaCte(p));
    expect(m).not.toContain("El cálculo extenso se desarrolla en el anejo 5.3.1");
    expect(m).not.toContain("El cálculo extenso se desarrolla en el anejo 5.3.2");
    // La electricidad sí: la vivienda nueva lleva su derivación y sus circuitos (feature-34).
    expect(m).toContain("El cálculo extenso se desarrolla en el anejo 5.3.3");
  });

  it("el Word se genera", async () => {
    const p = sinAparatos();
    const d = documentoMemoria(bloquesAnejoInstalaciones(anejoInstalaciones(p)), membreteDe(ESTUDIO_VACIO, p));
    expect((await Packer.toBuffer(d)).byteLength).toBeGreaterThan(0);
  });
});
