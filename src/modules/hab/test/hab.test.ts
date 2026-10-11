import { describe, it, expect } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { leerFraccion, parseNorma, PLANTILLAS, textoFraccion, viviendasMaximas, type NormaHabitabilidad } from "../../../lib/habitabilidad/norma";
import { evaluarExpediente } from "../../../lib/obra/evaluar";
import { antesDeEntregar } from "../../../lib/obra/entrega";
import { bloquesMemoria, memoriaCte, textoPlanoMemoriaCte } from "../../../lib/obra/memoria";
import { obraDeCaso } from "../../../lib/proyecto/alcance";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { estanciasPropuestas, habEstadoDefaults, type EstanciaHab, type HabEstado } from "../estado";

// =============================================================================
// feature-32, fase 5 de PLAN-MEMORIA: habitabilidad con la norma que declara el
// proyectista. La norma de los tests es inventada a propósito (como la del
// Demo): la herramienta no trae normas municipales sin cotejar.
// =============================================================================

const NORMA: NormaHabitabilidad = {
  id: "test",
  referencia: "Ordenanza de prueba, art. 10",
  ambito: "municipal",
  iluminacion: { fraccion: 0.1, mide: "hueco" },
  ventilacion: { fraccion: 0.05, mide: "practicable" },
  computan: ["estar_comedor", "cocina", "dormitorio"],
  superficieMinima: { dormitorio: 8 },
  densidad: { m2PorVivienda: 70, superficie: "construida", redondeo: "al_mas_proximo", referencia: "art. 12" },
};

const est = (id: string, nombre: string, tipo: EstanciaHab["tipo"], util: number | null, hueco: number | null, practicable: number | null): EstanciaHab => ({
  id,
  nombre,
  tipo,
  util_m2: util,
  hueco_m2: hueco,
  acristalada_m2: null,
  practicable_m2: practicable,
});

/** El caso «Reforma: local a vivienda» con la norma de prueba y la vivienda A descrita. */
function reforma(estancias?: EstanciaHab[], normas: NormaHabitabilidad[] = [NORMA]): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo("2026-10-11T10:00:00.000Z"), edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}), habitabilidad: { normas } };
  const inputs: HabEstado = {
    ...habEstadoDefaults,
    estancias: {
      A: estancias ?? [
        est("e1", "Estar-comedor", "estar_comedor", 25, 3, 1.5),
        est("e2", "Cocina", "cocina", 9, 1.2, 0.6),
        est("d1", "Dormitorio principal", "dormitorio", 13, 1.5, 0.8),
        est("d2", "Dormitorio 2", "dormitorio", 10, 1.2, 0.6),
        est("d3", "Dormitorio 3", "dormitorio", 9, 1, 0.5),
        est("b1", "Baño", "bano", 5, null, null),
      ],
    },
  };
  p.justificaciones = { hab: { inputs: inputs as unknown as Record<string, unknown>, schemaVersion: "1" } };
  return p;
}

const ev = (p: Proyecto) => evaluarExpediente(p).porClave.hab!;

describe("la norma", () => {
  it("fracciones como las escribe la norma", () => {
    expect(leerFraccion("1/10")).toBeCloseTo(0.1);
    expect(leerFraccion("10 %")).toBeCloseTo(0.1);
    expect(leerFraccion("0,125")).toBeCloseTo(0.125);
    expect(leerFraccion("1/6")).toBeCloseTo(1 / 6);
    expect(leerFraccion("10")).toBeNull();
    expect(leerFraccion("")).toBeNull();
    expect(textoFraccion(0.1)).toBe("10 %");
    expect(textoFraccion(0.05)).toBe("5 %");
    expect(textoFraccion(1 / 6)).toBe("1/6");
    expect(textoFraccion(0.125)).toBe("1/8");
  });

  it("el máximo de viviendas, por defecto o al más próximo", () => {
    const d = { m2PorVivienda: 70, superficie: "construida" as const, redondeo: "por_defecto" as const };
    expect(viviendasMaximas(d, 174)).toBe(2);
    expect(viviendasMaximas({ ...d, redondeo: "al_mas_proximo" }, 174)).toBe(2);
    expect(viviendasMaximas({ ...d, redondeo: "al_mas_proximo" }, 175)).toBe(3);
  });

  it("lectura defensiva: sin referencia o sin fracción, nada", () => {
    expect(parseNorma({ ...NORMA, referencia: "" })).toBeNull();
    expect(parseNorma({ ...NORMA, iluminacion: { fraccion: 3 } })).toBeNull();
    expect(parseNorma(JSON.parse(JSON.stringify(NORMA)))).toEqual(NORMA);
    expect(parseNorma({ ...NORMA, ventilacion: "conjunta", computan: ["dormitorio", "nada"] })).toMatchObject({ ventilacion: "conjunta", computan: ["dormitorio"] });
  });

  it("las plantillas son las cotejadas: VPO de Andalucía (10 % / 5 %) y la Orden de 1944 (1/6)", () => {
    expect(PLANTILLAS.map((p) => p.norma.plantilla)).toEqual(["vpo-andalucia-2020", "orden-1944"]);
    const [vpo, o44] = PLANTILLAS;
    expect(vpo.norma).toMatchObject({ iluminacion: { fraccion: 0.1 }, ventilacion: { fraccion: 0.05, mide: "practicable" } });
    expect(vpo.norma.computan).not.toContain("bano");
    expect(vpo.soloProtegida).toBe(true);
    expect(o44.norma.iluminacion.fraccion).toBeCloseTo(1 / 6);
    expect(o44.norma.ventilacion).toBe("conjunta");
  });
});

describe("la justificación en el caso de reforma", () => {
  it("se aplica a la vivienda que resulta del cambio de uso", () => {
    const e = ev(reforma());
    expect(e.aplicabilidad).toBe("aplica_reformado");
    expect(e.nota).toMatch(/viviendas que resultan del cambio de uso/);
    // Cumple, con el aviso de la superficie de la densidad tomada de El edificio.
    expect(e.estado).toBe("revisar");
    expect(e.avisos.map((a) => a.id)).toEqual(["superficie-test"]);
  });

  it("cada estancia que computa, con iluminación, ventilación y superficie mínima; el baño no", () => {
    const e = ev(reforma());
    const ids = e.calculado!.elementos.map((x) => x.id);
    expect(ids).toContain("test|A|e1");
    expect(ids).toContain("test|A|d3");
    expect(ids).not.toContain("test|A|b1");
  });

  it("un hueco corto no cumple, con su cifra", () => {
    const p = reforma([est("d1", "Dormitorio", "dormitorio", 12, 1, 0.6)]);
    const e = ev(p);
    expect(e.estado).toBe("no_cumple");
    expect(e.incumplimientos.map((i) => i.titulo)).toContain("Dormitorio (vivienda tipo a) no cumple.");
    expect(e.incumplimientos.find((i) => i.id === "test|A|d1")!.detalle).toMatch(/iluminación 1,00 m², mínimo 1,20 m²/);
  });

  it("sin dato no cumple: falta el hueco", () => {
    const e = ev(reforma([est("d1", "Dormitorio", "dormitorio", 12, null, null)]));
    expect(e.estado).toBe("no_cumple");
    expect(e.incumplimientos[0].titulo).toMatch(/falta el hueco y la superficie practicable/);
  });

  it("la densidad, antes y después de la obra: una vivienda más", () => {
    const e = ev(reforma());
    const d = e.calculado!.elementos.find((x) => x.id === "test|densidad")!;
    const det = (d as unknown as { detalle: { viviendas: number; antes?: { viviendas: number } } }).detalle;
    expect(det.antes).toBeDefined();
    expect(det.viviendas).toBe(det.antes!.viviendas + 1);
  });

  it("los dormitorios que no coinciden con El edificio avisan", () => {
    const e = ev(reforma([est("d1", "Dormitorio", "dormitorio", 12, 2, 1)]));
    expect(e.avisos.map((a) => a.id)).toContain("dormitorios-A");
  });
});

describe("sin norma", () => {
  it("no se inventa: «Antes de entregar» pide declararla", () => {
    const p = reforma(undefined, []);
    expect(ev(p).estado).toBe("no_cumple");
    expect(antesDeEntregar(p).some((x) => x.key === "hab" && x.titulo === "Declara la norma de habitabilidad del municipio.")).toBe(true);
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    // Tras el párrafo de alcance y su cita, el pendiente.
    expect(t).toMatch(/4\.2\. Habitabilidad\n\n[^\n]*cambio de uso[^\n]*\n\n[^\n]*\n\nPendiente/);
    expect(t).not.toMatch(/Exige iluminación/);
  });

  it("sin estancias, la vivienda no se da por buena", () => {
    const p = reforma([]);
    expect(ev(p).incumplimientos.map((i) => i.titulo)).toContain("Vivienda tipo A: faltan sus estancias.");
  });
});

describe("la memoria", () => {
  it("la norma citada, la tabla de la vivienda y la de densidad con el estado actual y el reformado", () => {
    const b = bloquesMemoria(memoriaCte(reforma()));
    const i = b.findIndex((x) => x.tipo === "titulo" && x.texto === "4.2. Habitabilidad");
    expect(i).toBeGreaterThan(0);
    const resto = b.slice(i + 1);
    expect(resto.some((x) => x.tipo === "parrafo" && x.texto.startsWith("Norma de aplicación: Ordenanza de prueba, art. 10. Exige iluminación 10 %"))).toBe(true);
    const tablas = resto.filter((x) => x.tipo === "tabla");
    expect(tablas[0]).toMatchObject({
      rotulo: "Vivienda tipo A",
      cabecera: ["Estancia", "Su (m²)", "Iluminación 10 % · Norma", "Proyecto (m²)", "Ventilación 5 % · Norma", "Proyecto (m²)", "Su mínima (m²)", "Cumple"],
    });
    if (tablas[0].tipo !== "tabla") throw new Error();
    expect(tablas[0].filas[0]).toEqual(["Estar-comedor", "25,00", "≥ 2,50", "3,00", "≥ 1,25", "1,50", "no se exige", "Cumple"]);
    expect(tablas[0].notas).toEqual(["No computan: baño."]);
    expect(tablas[1]).toMatchObject({ rotulo: "Densidad de viviendas" });
    if (tablas[1].tipo !== "tabla") throw new Error();
    expect(tablas[1].filas.map((f) => f[0])).toEqual(["Estado actual", "Estado reformado"]);
  });

  it("propuesta de estancias desde el tipo: estar, cocina, dormitorios y cuartos húmedos, sin superficies", () => {
    const l = estanciasPropuestas({ dormitorios: 3, banos: 2, aseos: 0 });
    expect(l.map((e) => e.nombre)).toEqual(["Estar-comedor", "Cocina", "Dormitorio principal", "Dormitorio 2", "Dormitorio 3", "Baño 1", "Baño 2"]);
    expect(l.every((e) => e.util_m2 === null && e.hueco_m2 === null)).toBe(true);
  });
});

describe("aplicabilidad", () => {
  it("sin viviendas, no aplica", () => {
    const p: Proyecto = { ...crearProyectoDemo("2026-10-11T10:00:00.000Z"), edificio: edificioDeCaso("oficinas"), justificaciones: {} };
    expect(ev(p).aplicabilidad).toBe("no_aplica");
  });

  it("una reforma que no toca distribución ni huecos, no aplica", () => {
    const p = reforma();
    p.datosGenerales = {
      ...p.datosGenerales,
      intervencion: "reforma",
      alcance: { ...p.datosGenerales.alcance, tipos: ["reforma"], interior: ["revestimientos"], envolvente: ["cubiertas"] },
    };
    expect(ev(p)).toMatchObject({ aplicabilidad: "no_aplica" });
    expect(ev(p).nota).toMatch(/no crea viviendas ni modifica su distribución ni sus huecos/);
  });
});
