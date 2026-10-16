import { describe, expect, it } from "vitest";
import { cargarProyecto, inicializarStorage } from "../../../lib/proyecto/storage";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import type { ResumenProyecto } from "../../../lib/proyecto/progreso";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { resumenEdificio } from "../../../lib/edificio/derivar";
import { resumenProyecto } from "../../../lib/proyecto/progreso";
import {
  cifrasEdificio,
  coincideBusqueda,
  estadoExpediente,
  fechaRelativa,
  ordenar,
  pasaFiltro,
  type FilaProyecto,
} from "../inicio";

// =============================================================================
// Inicio: estado del expediente, fecha relativa, búsqueda y orden.
// =============================================================================

const R0: ResumenProyecto = {
  aplicables: 10,
  cumplen: 0,
  noCumplen: 0,
  enCurso: 0,
  sinIniciar: 10,
  noAplica: 0,
  externas: 0,
};

describe("estadoExpediente", () => {
  it("un incumplimiento manda sobre lo demás", () => {
    expect(estadoExpediente({ ...R0, cumplen: 9, noCumplen: 1, sinIniciar: 0 })).toBe("incumple");
  });
  it("todo justificado solo si cumplen todas las aplicables", () => {
    expect(estadoExpediente({ ...R0, cumplen: 10, sinIniciar: 0 })).toBe("todo_justificado");
    expect(estadoExpediente({ ...R0, aplicables: 0, sinIniciar: 0 })).toBe("sin_empezar");
  });
  it("sin empezar y en curso", () => {
    expect(estadoExpediente(R0)).toBe("sin_empezar");
    expect(estadoExpediente({ ...R0, cumplen: 3, sinIniciar: 7 })).toBe("en_curso");
  });
  it("el filtro «En curso» incluye los que están sin empezar", () => {
    expect(pasaFiltro("en_curso", "sin_empezar")).toBe(true);
    expect(pasaFiltro("en_curso", "incumple")).toBe(false);
    expect(pasaFiltro("todos", "incumple")).toBe(true);
  });
});

describe("fechaRelativa", () => {
  const ahora = new Date(2026, 9, 16, 10, 0);
  it("hoy, ayer, días y semanas; después la fecha", () => {
    expect(fechaRelativa(new Date(2026, 9, 16, 1, 0).toISOString(), ahora)).toBe("hoy");
    expect(fechaRelativa(new Date(2026, 9, 15, 23, 0).toISOString(), ahora)).toBe("ayer");
    expect(fechaRelativa(new Date(2026, 9, 12).toISOString(), ahora)).toBe("hace 4 días");
    expect(fechaRelativa(new Date(2026, 9, 8).toISOString(), ahora)).toBe("hace 1 semana");
    expect(fechaRelativa(new Date(2026, 8, 25).toISOString(), ahora)).toBe("hace 3 semanas");
    expect(fechaRelativa(new Date(2026, 6, 1).toISOString(), ahora)).toMatch(/^el 1 jul 2026$/);
    expect(fechaRelativa("no-es-fecha", ahora)).toBe("—");
  });
});

describe("búsqueda, orden y cifras sobre el Demo", () => {
  inicializarStorage("2026-08-23T00:00:00.000Z");
  const demo = cargarProyecto(DEMO_ID) as Proyecto;
  const fila = (p: Proyecto): FilaProyecto => ({
    proyecto: p,
    resumen: resumenProyecto(p),
    edificio: resumenEdificio(p.edificio),
  });

  it("busca sin tildes ni mayúsculas en nombre y municipio", () => {
    expect(coincideBusqueda(demo, "CACERES")).toBe(true);
    expect(coincideBusqueda(demo, "mayor")).toBe(true);
    expect(coincideBusqueda(demo, "")).toBe(true);
    expect(coincideBusqueda(demo, "Bilbao")).toBe(false);
  });

  it("ordena por última edición, por nombre y por progreso", () => {
    const viejo = fila({
      ...demo,
      id: "a",
      nombre: "Zeta",
      modificado: "2026-01-01T00:00:00.000Z",
    });
    const nuevo = fila({
      ...demo,
      id: "b",
      nombre: "alfa",
      modificado: "2026-09-01T00:00:00.000Z",
    });
    expect(ordenar([viejo, nuevo], "reciente").map((f) => f.proyecto.id)).toEqual(["b", "a"]);
    expect(ordenar([viejo, nuevo], "nombre").map((f) => f.proyecto.id)).toEqual(["b", "a"]);
    const vacio = { ...nuevo, resumen: R0 };
    expect(ordenar([vacio, viejo], "progreso").map((f) => f.proyecto.id)).toEqual(["a", "b"]);
  });

  it("resume el edificio en cifras cortas", () => {
    const c = cifrasEdificio(fila(demo).edificio);
    expect(c.some((x) => /viviendas$/.test(x))).toBe(true);
    expect(c.some((x) => /plantas?/.test(x))).toBe(true);
  });
});
