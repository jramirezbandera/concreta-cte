import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { sua3 } from "../definicion";
import { sua3EstadoDefaults, type Sua3Estado } from "../estado";
import { justificarSua3 } from "../justificacion";
import { APRISIONAMIENTO_SUA3, ASEO_ACCESIBLE_ANEJO_A } from "../tablas";

// =============================================================================
// SUA 3 · Aprisionamiento (feature-20). Cifras:
// research/verificacion-sua2-sua5.md, bloque B3.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const CASOS = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const;
const caso = (c: CasoEdificio, estado: Partial<Sua3Estado> = {}) =>
  justificarSua3({ ...sua3EstadoDefaults, ...estado }, { edificio: edificioDeCaso(c), datosGenerales: dg });
const detalle = (c: CasoEdificio, id: string, estado: Partial<Sua3Estado> = {}) => caso(c, estado).elementos.find((e) => e.id === id)?.detalle;

describe("SUA3 · tablas", () => {
  it("fuerzas de apertura y el aseo accesible del Anejo A", () => {
    expect(APRISIONAMIENTO_SUA3.datos).toMatchObject({
      fuerzaApertura_puertasSalida_maxN: 140,
      fuerzaApertura_itinerarioAccesible_maxN: 25,
      fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN: 65,
      metodoEnsayo: "UNE-EN 12046-2:2000",
    });
    expect(ASEO_ACCESIBLE_ANEJO_A.datos.giroLibre_diametro_m).toBe(1.5);
    expect(ASEO_ACCESIBLE_ANEJO_A.procedencia.articulo).toMatch(/Anejo A/);
  });
});

describe("SUA3 · justificación", () => {
  it("unifamiliar: desbloqueo sin luz desde dentro; sin llamada; 140 N sin itinerario accesible", () => {
    const j = caso("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["bloqueo", "fuerza"]);
    expect(detalle("unifamiliar", "bloqueo")).toMatchObject({ pestillos: "desbloqueo", luzInterior: [] });
    expect(detalle("unifamiliar", "fuerza")).toMatchObject({ accesibles: [], resistentes: [] });
    expect(j.avisos).toHaveLength(0);
  });

  it("plurifamiliar: itinerario accesible a 25 N y puertas del garaje a 65 N, con su aviso", () => {
    const j = caso("plurifamiliar");
    const f = detalle("plurifamiliar", "fuerza");
    expect(f?.clase === "fuerza" && f.accesibles.length).toBe(1);
    expect(f?.clase === "fuerza" && f.resistentes.length).toBe(1);
    expect(j.avisos.map((a) => a.id)).toEqual(["cierrapuertas"]);
    expect(j.elementos.some((e) => e.id === "llamada")).toBe(false);
  });

  it("oficinas: luz desde dentro en los aseos; llamada de asistencia salvo sin uso público", () => {
    expect(detalle("oficinas", "bloqueo")).toMatchObject({ luzInterior: ["los aseos de las oficinas"] });
    expect(caso("oficinas").elementos.find((e) => e.id === "llamada")!.veredicto).toBe("ok");
    expect(caso("oficinas", { aseoPublico: "no" }).elementos.find((e) => e.id === "llamada")!.veredicto).toBe("dato");
  });

  it("sin pestillo: sigue cumpliendo y la memoria lo dice", () => {
    const j = caso("plurifamiliar", { pestillos: "sin_pestillo" });
    expect(j.veredicto).toBe("ok");
    expect(textoPlanoMemoria(sua3.memoria(j))).toMatch(/no tienen dispositivo de bloqueo/);
  });
});

describe("SUA3 · memoria, ficha y dibujo", () => {
  it("los cuatro casos", () => {
    for (const c of CASOS) {
      const j = caso(c);
      const texto = textoPlanoMemoria(sua3.memoria(j));
      expect(texto).toMatch(/≤ 140 N/);
      expect(texto).toMatch(/Desbloqueo de .*\tdesde el exterior\tdesde el exterior\tCumple/);
      expect(texto).toMatch(/UNE-EN 12046-2:2000/);
      if (c !== "oficinas") expect(texto).toMatch(/al ser de uso privado todas sus zonas/);
      if (c === "unifamiliar") expect(texto).not.toMatch(/25 N/);
      const dibujo = sua3.dibujo(j, edificioDeCaso(c));
      expect(dibujo.etiquetas.map((e) => e.elementoId).sort()).toEqual(j.elementos.map((e) => e.id).sort());
      expect(dibujo.marcas.some((m) => m.tipo === "icono" && m.icono === "puerta")).toBe(true);
      const ficha = sua3.ficha(j, { estado: sua3EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(sua3.frase(j).length).toBeGreaterThan(20);
    }
  });

  it("la tabla «Norma | Proyecto» lleva el desbloqueo, la llamada y las fuerzas; el texto no las repite (feature-31)", () => {
    const m = sua3.memoria(caso("plurifamiliar_locales"));
    const t = m.tablas![0];
    expect(t.cabecera).toEqual(["Parámetro", "Norma", "Proyecto", "Cumple"]);
    expect(t.filas).toContainEqual(["Fuerza de apertura, itinerario accesible (resistentes al fuego)", "≤ 65 N", "≤ 65 N", "Cumple"]);
    expect(t.filas).toContainEqual(["Llamada de asistencia en aseos accesibles", "no se exige", "no se exige", "Cumple"]);
    // Tras los tres párrafos de SUA 3; antes del local sin uso.
    expect(t.tras).toBe(3);
    expect(textoParrafo(m.parrafos[3])).toMatch(/^El local sin uso/);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toMatch(/\d+ N/);
    expect(texto).toMatch(/^Las puertas de los baños y aseos de las viviendas tienen dispositivo de bloqueo/);
    expect(texto).toMatch(/Son puertas de salida la del portal, la de cada vivienda/);
  });

  it("oficinas: la luz desde dentro y la llamada de asistencia, que sí se exigen", () => {
    const filas = sua3.memoria(caso("oficinas")).tablas![0].filas;
    expect(filas).toContainEqual(["Control de la luz de los aseos de las oficinas", "desde el interior", "desde el interior", "Cumple"]);
    expect(filas).toContainEqual(["Llamada de asistencia en aseos accesibles", "se exige", "se dispone", "Cumple"]);
    expect(sua3.memoria(caso("plurifamiliar", { pestillos: "sin_pestillo" })).tablas![0].filas[0]).toEqual(["Desbloqueo de los baños y aseos de las viviendas", "no se exige", "sin bloqueo interior", "Cumple"]);
  });
});
