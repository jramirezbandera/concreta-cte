import { describe, expect, it } from "vitest";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";
import { antesDeEntregar, entregables } from "../entrega";
import { bloquesMemoria, memoriaCte, textoPlanoMemoriaCte } from "../memoria";
import { verificacionDePrueba } from "../../energia/test/informeSintetico";

// =============================================================================
// «Antes de entregar», los entregables y la memoria CTE (feature-16 §C–§E).
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-04T10:00:00.000Z");

/** El Demo con la red a 60 kPa: HS4 no cumple. */
function conHs4Fallando(): Proyecto {
  const p = demo();
  return { ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } };
}

describe("antesDeEntregar", () => {
  it("el Demo: los avisos sin revisar, en el orden del registry", () => {
    const l = antesDeEntregar(demo());
    expect(l.map((x) => `${x.codigo}:${x.tipo}`)).toEqual([
      "HS1:revisar",
      "HS2:revisar",
      "HS2:revisar",
      "HS4:revisar",
      "HS5:revisar",
      "HS5:revisar",
      "HS6:revisar",
      "SI1:revisar",
      "SI1:revisar",
      "SI3:revisar",
      "SI3:revisar",
      "SI4:revisar",
      "SI6:revisar",
      "SUA2:revisar",
      "SUA3:revisar",
      "SUA4:revisar",
      "SUA8:revisar",
      "SUA8:revisar",
      "SUA9:revisar",
      "HR:revisar",
      "HR:revisar",
      "HR:revisar",
      "HR:revisar",
      "HE4:revisar",
      "HE4:revisar",
      "HE5:revisar",
      "HE5:revisar",
      "HE6:revisar",
      "REBT:revisar",
      "REBT:revisar",
      "REBT:revisar",
    ]);
    expect(l[0]).toMatchObject({ id: "hs1:clima-supuesto", ruta: "hs/humedad" });
    expect(l[0].detalle.length).toBeGreaterThan(10);
  });

  it("lo que no cumple va primero", () => {
    const l = antesDeEntregar(conHs4Fallando());
    expect(l[0]).toMatchObject({ codigo: "HS4", tipo: "no_cumple" });
    expect(l.filter((x) => x.tipo === "no_cumple").every((x, i) => l[i] === x)).toBe(true);
  });

  it("revisado todo, no queda nada", () => {
    const p = demo();
    const j = p.justificaciones;
    const q: Proyecto = {
      ...p,
      justificaciones: {
        ...j,
        hs1: { ...j.hs1, revisados: ["clima-supuesto"] },
        hs2: { revisados: ["dobles", "recogida"] },
        hs4: { ...j.hs4, revisados: ["presion-red-supuesta"] },
        hs5: { ...j.hs5, revisados: ["garaje-s1-bombeo", "pluviometria-supuesta"] },
        hs6: { ...j.hs6, revisados: ["nucleo-garaje"] },
        si1: { revisados: ["uso-local-z2", "cuarto-z6"] },
        si3: { revisados: ["recorrido", "recorrido-garaje"] },
        si4: { revisados: ["construida-garaje"] },
        si6: { revisados: ["sector-sotano"] },
        sua2: { revisados: ["garaje-altura"] },
        sua3: { revisados: ["cierrapuertas"] },
        sua4: { revisados: ["cuarto-sin-tipo"] },
        sua8: { revisados: ["ng-supuesto", "local-comercial"] },
        sua9: { revisados: ["viviendas-accesibles"] },
        he4: { revisados: ["perdidas", "scop"] },
        he5: { revisados: ["construida", "mixto"] },
        he6: { revisados: ["mixto"] },
        rebt: { revisados: ["ascensor-supuesto", "servicios", "humo"] },
        hr: { revisados: ["huecos", "ld", "colindancias", "local"] },
      },
    };
    expect(antesDeEntregar(q)).toEqual([]);
  });
});

describe("entregables", () => {
  it("el Demo: todo listo", () => {
    expect(entregables(demo())).toEqual({
      memoria: { listos: 27, total: 27, noCumplen: [] },
      fichas: { listos: 25, total: 25, noCumplen: [] },
      esquemas: { listos: 2, total: 2, noCumplen: [], claves: ["hs5", "hs4"] },
    });
  });

  it("lo que no cumple no cuenta como listo", () => {
    expect(entregables(conHs4Fallando())).toEqual({
      memoria: { listos: 26, total: 27, noCumplen: ["HS4"] },
      fichas: { listos: 24, total: 25, noCumplen: ["HS4"] },
      esquemas: { listos: 1, total: 2, noCumplen: ["HS4"], claves: ["hs5"] },
    });
  });
});

describe("memoriaCte", () => {
  it("los apartados en el orden del documento (feature-29), sin nada pendiente", () => {
    const m = memoriaCte(demo());
    expect(m.apartados.map((a) => `${a.codigo}:${a.tipo}`)).toEqual([
      "DB-SE:externo",
      "SI1:redactado",
      "SI2:redactado",
      "SI3:redactado",
      "SI4:redactado",
      "SI5:redactado",
      "SI6:redactado",
      "SUA1:redactado",
      "SUA2:redactado",
      "SUA3:redactado",
      "SUA4:redactado",
      "SUA5:no_aplica",
      "SUA6:no_aplica",
      "SUA7:redactado",
      "SUA8:redactado",
      "SUA9:redactado",
      "HS1:redactado",
      "HS2:redactado",
      "HS3:redactado",
      "HS4:redactado",
      "HS5:redactado",
      "HS6:redactado",
      "HR:redactado",
      "HE0:externo",
      "HE1:externo",
      "HE4:redactado",
      "HE5:redactado",
      "HE6:redactado",
      "REBT:redactado",
      "HAB:redactado",
    ]);
    const enc = (k: string) => m.apartados.find((a) => a.key === k)!.encabezado;
    expect(enc("hs5")).toBe("3.4.5. HS 5 Evacuación de aguas");
    expect(enc("hs1")).toBe("3.4.1. HS 1 Protección frente a la humedad");
    expect(enc("sua6")).toBe("3.3.6. SUA 6 Seguridad frente al riesgo de ahogamiento");
    // Desde feature-25 (HR) no queda ningún apartado por redactar.
    expect(m.pendientes).toEqual([]);
    expect(enc("he4")).toBe("3.6.3. HE 4 Contribución mínima de energía renovable para cubrir la demanda de agua caliente sanitaria");
    expect(enc("rebt")).toBe("4.1.1. ITC-BT-10 Grado de electrificación y previsión de cargas");
    // SE y HR son la sección entera: sin título propio.
    expect(m.apartados.find((a) => a.key === "hr")).toMatchObject({ sinTitulo: true, encabezado: "3.5. Protección frente al ruido DB HR" });
    expect(m.apartados.find((a) => a.key === "dbse")).toMatchObject({ sinTitulo: true, encabezado: "3.1. Seguridad estructural DB SE" });
    expect(m.apartados.find((a) => a.key === "hab")).toMatchObject({ sinTitulo: true, encabezado: "4.2. Habitabilidad" });
  });

  it("lo que no cumple sale como pendiente, sin su texto", () => {
    const m = memoriaCte(conHs4Fallando());
    const hs4 = m.apartados.find((a) => a.key === "hs4")!;
    expect(hs4.tipo).toBe("no_cumple");
    const b = bloquesMemoria(m);
    const i = b.findIndex((x) => x.tipo === "titulo" && x.texto === "3.4.4. HS 4 Suministro de agua");
    expect(b[i + 1].tipo).toBe("pendiente");
    // Un motivo por línea —los que enseña HS4— y ni una frase de su memoria.
    const j = b.findIndex((x, k) => k > i && x.tipo === "titulo");
    const motivos = b.slice(i + 2, j);
    expect(motivos.length).toBe(hs4.tipo === "no_cumple" ? hs4.motivos.length : -1);
    expect(motivos.every((x) => x.tipo === "parrafo" && x.texto.startsWith("– "))).toBe(true);
    expect(motivos.map((x) => (x.tipo === "parrafo" ? x.texto : ""))).toContain("– No llega presión a las plantas 1, 2 y 3.");
  });

  it("bloques: capítulos, DB numerados y el párrafo del «no aplica» con su cita", () => {
    const b = bloquesMemoria(memoriaCte(demo()));
    expect(b[0]).toEqual({ tipo: "titulo", nivel: 1, texto: "3. Cumplimiento del CTE" });
    expect(b.flatMap((x) => (x.tipo === "titulo" && x.nivel === 1 ? [x.texto] : []))).toEqual([
      "3. Cumplimiento del CTE",
      "4. Cumplimiento de otros reglamentos",
    ]);
    expect(b.flatMap((x) => (x.tipo === "titulo" && x.nivel === 2 ? [x.texto] : []))).toEqual([
      "3.1. Seguridad estructural DB SE",
      "3.2. Seguridad en caso de incendio DB SI",
      "3.3. Seguridad de utilización y accesibilidad DB SUA",
      "3.4. Salubridad DB HS",
      "3.5. Protección frente al ruido DB HR",
      "3.6. Ahorro de energía DB HE",
      "4.1. Reglamento electrotécnico para baja tensión (REBT)",
      "4.2. Habitabilidad",
    ]);
    // Ni el proyecto en el cuerpo, ni la jerga de la ficha en las fuentes.
    expect(b.some((x) => x.tipo === "parrafo" && x.texto.startsWith("Demo — "))).toBe(false);
    expect(b.some((x) => x.tipo === "nota" && /motor \d|datos de El edificio|consolidado/.test(x.texto))).toBe(false);
    expect(b.some((x) => x.tipo === "nota" && x.texto === "DB-SUA 6, ámbito de aplicación")).toBe(true);
    expect(b.some((x) => x.tipo === "tabla")).toBe(true);
  });

  it("el texto plano lleva todo, con las tablas por tabuladores", () => {
    const t = textoPlanoMemoriaCte(memoriaCte(demo()));
    expect(t).toMatch(/^3\. Cumplimiento del CTE\n\n/);
    expect(t).toContain("SUA 6 Seguridad frente al riesgo de ahogamiento");
    expect(t).toContain("Se justifica con HULC o CE3X. Pendiente de adjuntar el documento.");
    expect(t).toContain("\t");
  });
});

describe("la verificación energética con el informe leído", () => {
  const conInforme = (v = verificacionDePrueba(), extra = {}): Proyecto => {
    const p = demo();
    return { ...p, justificaciones: { ...p.justificaciones, he0he1_global: { verificacion: v, refExterna: "HE-01", ...extra } } };
  };

  it("en la memoria: el programa, el informe y la tabla de resultados de cada apartado", () => {
    const b = bloquesMemoria(memoriaCte(conInforme()));
    const i = b.findIndex((x) => x.tipo === "titulo" && x.texto.startsWith("3.6.1. HE 0 y HE 1 "));
    expect(b[i + 1]).toEqual({
      tipo: "parrafo",
      texto: "Se justifica con CE3X v2.3, según su informe de verificación de los requisitos de HE0 y HE1 de 3/5/2026, que se adjunta. Documento de referencia: HE-01. Resultados:",
    });
    expect(b[i + 2]).toMatchObject({ tipo: "tabla", cabecera: ["Exigencia", "Proyecto", "Límite", "Cumple"] });
    const tabla = (x: (typeof b)[number] | undefined) => (x?.tipo === "tabla" ? x.filas : []);
    expect(tabla(b[i + 2])[0]).toEqual(["HE0 · Energía primaria no renovable (Cep,nren)", "48,07 kWh/m²·año", "≤ 60,21 kWh/m²·año", "Sí"]);
    const he1 = b.findIndex((x) => x.tipo === "titulo" && x.texto === "3.6.2. HE 1 Condiciones para el control de la demanda energética");
    expect(tabla(b[he1 + 2]).map((f) => f[0])).toContain("HE1 · Condensaciones intersticiales");
  });

  it("lo que no cumple sale como pendiente y en «Antes de entregar»", () => {
    const v = { ...verificacionDePrueba(), cepNren: { valor: 70, limite: 60.21, cumple: false } };
    const b = bloquesMemoria(memoriaCte(conInforme(v)));
    expect(b).toContainEqual({ tipo: "pendiente", texto: "Pendiente: según el informe, el edificio no cumple todas las exigencias." });
    const fallo = antesDeEntregar(conInforme(v)).find((x) => x.key === "he0he1_global" && x.tipo === "no_cumple");
    expect(fallo).toMatchObject({ titulo: "HE0 · Energía primaria no renovable (Cep,nren): no cumple", detalle: "70 kWh/m²·año (límite ≤ 60,21 kWh/m²·año), según el informe de CE3X v2.3." });
    expect(fallo!.ruta).toBeUndefined();
  });

  it("los avisos del informe, hasta marcarlos como revisados", () => {
    const avisos = (p: Proyecto) => antesDeEntregar(p).filter((x) => x.key === "he0he1_global").map((x) => x.id);
    expect(avisos(conInforme())).toEqual(["he0he1_global:energia-normativa", "he0he1_global:energia-zona"]);
    expect(avisos(conInforme(undefined, { revisados: ["energia-normativa", "energia-zona"] }))).toEqual([]);
  });
});
