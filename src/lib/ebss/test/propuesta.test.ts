import { describe, it, expect } from "vitest";
import {
  REGLAS_PROPUESTA,
  conEdicion,
  estaMarcada,
  fichaEditada,
  fichasDelEstudio,
  fichasPropuestas,
  fichasSinRevisar,
  marcarFicha,
  seleccionDeFichas,
} from "../propuesta";
import { FICHAS_EBSS, fichaPorId, textoItem } from "../catalogo";
import { amiantoObligatorio, parseSeguridadSalud } from "../datos";
import type { EstudioSeguridadSalud, SeleccionFichas } from "../tipos";
import { crearProyectoDemo } from "../../proyecto/demo";
import { obraDeCaso } from "../../proyecto/alcance";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import type { Alcance, Proyecto } from "../../proyecto/tipos";

// =============================================================================
// feature-35, paso 4: qué fichas propone la app y cuáles salen en el estudio.
// =============================================================================

const AHORA = "2026-10-18T10:00:00.000Z";

function deCaso(caso: CasoEdificio, ss?: EstudioSeguridadSalud): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}) };
  if (ss) p.seguridadSalud = ss;
  return p;
}

const ids = (p: Proyecto): string[] => fichasPropuestas(p).map((f) => f.id);
const motivosDe = (p: Proyecto, id: string): string[] => fichasPropuestas(p).find((f) => f.id === id)?.motivos ?? [];
const conAlcance = (p: Proyecto, a: Alcance): Proyecto => ({
  ...p,
  datosGenerales: { ...p.datosGenerales, alcance: { ...p.datosGenerales.alcance, ...a } },
});
const marcadas = (p: Proyecto): string[] => seleccionDeFichas(p).filter((f) => f.marcada).map((f) => f.ficha.id);
const conSeleccion = (p: Proyecto, seleccion: SeleccionFichas): Proyecto => ({
  ...p,
  seguridadSalud: { ...(p.seguridadSalud ?? {}), seleccion },
});

describe("la tabla de correspondencias", () => {
  it("toda ficha que nombran las reglas está en el catálogo", () => {
    const nombradas = REGLAS_PROPUESTA.flatMap((r) => (typeof r.fichas === "function" ? [] : [...r.fichas]));
    for (const id of [...nombradas, "MA1", "MA3", "F16", "F17", "MA9", "TP1"]) expect(fichaPorId(id), id).toBeDefined();
  });

  it("la propuesta sale en el orden del catálogo, sin repetir ficha ni motivo", () => {
    for (const caso of ["unifamiliar", "plurifamiliar", "reforma_local_vivienda"] as const) {
      const f = fichasPropuestas(deCaso(caso));
      const orden = FICHAS_EBSS.map((x) => x.id).filter((id) => f.some((y) => y.id === id));
      expect(f.map((x) => x.id)).toEqual(orden);
      for (const x of f) {
        expect(x.motivos.length).toBeGreaterThan(0);
        expect(new Set(x.motivos).size).toBe(x.motivos.length);
      }
    }
  });

  it("toda obra lleva el bloque común y la implantación", () => {
    for (const caso of ["unifamiliar", "oficinas", "reforma_local_vivienda"] as const) {
      const p = ids(deCaso(caso));
      for (const id of ["F0", "IP1", "IP3", "IP4", "IP5", "IP6", "IP7", "MA5", "M22"]) expect(p, `${caso} ${id}`).toContain(id);
    }
  });
});

describe("obra nueva", () => {
  it("unifamiliar: fases de obra nueva, cubierta inclinada y andamio de fachada (anexo II.1)", () => {
    const p = deCaso("unifamiliar");
    const f = ids(p);
    for (const id of ["F4", "F5", "F8", "F11", "F14", "F17", "F22", "F23", "F24", "MA1", "MA7", "MA9", "TP1", "TP2"]) {
      expect(f, id).toContain(id);
    }
    expect(f).not.toContain("F16");
    expect(f).not.toContain("MA3");
    expect(f).not.toContain("F1");
    expect(f).not.toContain("F26");
    expect(motivosDe(p, "F17")).toEqual(["cubierta inclinada"]);
    expect(motivosDe(p, "MA1")[0]).toMatch(/fachada con 2 plantas/);
    expect(fichaPorId("MA1")?.anexoII?.some((a) => a.apartado === 1)).toBe(true);
  });

  it("plurifamiliar: cubierta plana con impermeabilización y telecomunicaciones", () => {
    const p = deCaso("plurifamiliar");
    const f = ids(p);
    expect(f).toContain("F16");
    expect(f).not.toContain("F17");
    expect(motivosDe(p, "F18")).toEqual(["obra nueva", "cubierta plana no transitable"]);
    expect(f).toContain("F26");
  });

  it("las instalaciones salen por las justificaciones que aplican", () => {
    const p = deCaso("unifamiliar");
    expect(motivosDe(p, "F23")).toEqual(["aplica HS 4"]);
    expect(motivosDe(p, "F24")).toEqual(["aplica HS 5"]);
    expect(motivosDe(p, "F22")).toContain("aplica el REBT");
    // HS 4 forzada a «no aplica»: sin fontanería.
    const sinHs4: Proyecto = { ...p, justificaciones: { hs4: { aplicabilidadForzada: { valor: "no_aplica" } } } };
    expect(ids(sinHs4)).not.toContain("F23");
  });

  it("ascensor, grúas y derribo previo", () => {
    const p = deCaso("plurifamiliar", { medios: { gruaTorre: true }, demolicionPrevia: true });
    expect(ids(p)).not.toContain("F27");
    p.edificio = { ...p.edificio, ascensor: true };
    const f = ids(p);
    expect(f).toContain("F27");
    expect(motivosDe(p, "M7")).toEqual(["hay grúa torre"]);
    expect(motivosDe(p, "F36")).toContain("hay grúa torre");
    expect(motivosDe(p, "F2")).toEqual(["derribo de una construcción existente"]);
  });

  it("con una sola planta sobre rasante, torre móvil en lugar de andamio de fachada", () => {
    const p = deCaso("unifamiliar");
    p.edificio = { ...p.edificio, grupos: p.edificio.grupos.filter((g) => g.nivelInicial === 0) };
    const f = ids(p);
    expect(f).toContain("MA3");
    expect(f).not.toContain("MA1");
  });
});

describe("obra en edificio existente: «Reforma: local a vivienda»", () => {
  const p = deCaso("reforma_local_vivienda");

  it("demoliciones, apertura de huecos y lo intervenido; el amianto es obligatorio", () => {
    const f = ids(p);
    for (const id of ["F1", "F3", "F15", "F19", "F23", "F24", "F22", "MA6", "MA10", "M14"]) expect(f, id).toContain(id);
    expect(motivosDe(p, "F3")).toEqual(["se pican revestimientos o se demuelen fábricas"]);
    expect(amiantoObligatorio(p)).toBe(true);
  });

  // Paso 7 (comparación con ss02 a ss04): cambiar huecos no es abrirlos en un muro de carga.
  it("la apertura de huecos sale con la estructura, no con los huecos de fachada", () => {
    expect(ids(p)).not.toContain("F40");
    const q = conAlcance(p, { estructura: true });
    expect(motivosDe(q, "F40")).toEqual(["se actúa en la estructura"]);
  });

  it("no propone lo que la obra no toca: cimentación, estructura, cubierta, andamio", () => {
    const f = ids(p);
    for (const id of ["F4", "F8", "F11", "F16", "F17", "MA1", "MA3", "TP1", "F26"]) expect(f, id).not.toContain(id);
  });

  it("el edificio en uso y la vía pública vienen del entorno", () => {
    const f = ids(deCaso("reforma_local_vivienda", { entorno: { edificioEnUso: true, viaPublica: true } }));
    expect(f).toContain("IP9");
    expect(f).toContain("IP2");
    expect(f).not.toContain("F41"); // las fachadas no se intervienen
    expect(ids(p)).not.toContain("IP9");
  });

  it("intervenir la fachada sobre la vía pública propone el andamio y el vuelo", () => {
    const q = deCaso("reforma_local_vivienda", { entorno: { viaPublica: true } });
    q.datosGenerales = {
      ...q.datosGenerales,
      alcance: { ...q.datosGenerales.alcance, envolvente: ["fachadas", "huecos", "particiones"] },
    };
    const f = ids(q);
    expect(f).toContain("F14");
    expect(f).toContain("MA1");
    expect(f).toContain("F41");
  });
});

describe("la selección como diferencia con la propuesta", () => {
  it("sin selección, sale justo la propuesta", () => {
    const p = deCaso("unifamiliar");
    expect(marcadas(p)).toEqual(ids(p));
    expect(fichasDelEstudio(p).map((f) => f.id)).toEqual(ids(p));
  });

  it("una ficha quitada sigue quitada al cambiar la obra", () => {
    const p = deCaso("unifamiliar");
    const p1 = conSeleccion(p, marcarFicha(undefined, "MA9", false, true));
    expect(marcadas(p1)).not.toContain("MA9");
    // La cubierta pasa a plana: MA9 deja de proponerse…
    const plana = { ...p1, edificio: { ...p1.edificio, cubierta: { ...p1.edificio.cubierta, tipo: "plana_no_transitable" as const } } };
    expect(ids(plana)).not.toContain("MA9");
    expect(marcadas(plana)).toContain("F16");
    // …y al volver a inclinada sigue quitada.
    expect(ids(p1)).toContain("MA9");
    expect(marcadas(p1)).not.toContain("MA9");
  });

  it("una nueva propuesta aparece sola, sin tocar lo decidido", () => {
    const p = conSeleccion(deCaso("reforma_local_vivienda"), marcarFicha(undefined, "F3", false, true));
    expect(marcadas(p)).not.toContain("F17");
    p.datosGenerales = {
      ...p.datosGenerales,
      alcance: { ...p.datosGenerales.alcance, envolvente: ["huecos", "particiones", "cubiertas"] },
    };
    const m = marcadas(p);
    expect(m).toContain("F16"); // la plurifamiliar tiene cubierta plana
    expect(m).toContain("TP1");
    expect(m).not.toContain("F3");
  });

  it("marcar y quitar: añadidas y quitadas, sin listas vacías", () => {
    let s = marcarFicha(undefined, "F12", true, false);
    expect(s).toEqual({ anadidas: ["F12"] });
    s = marcarFicha(s, "F12", false, false);
    expect(s).toEqual({});
    s = marcarFicha(s, "F23", false, true);
    expect(s).toEqual({ quitadas: ["F23"] });
    s = marcarFicha(s, "F23", true, true);
    expect(s).toEqual({});
    // Añadida que luego propone la app: al quitarla pasa a quitada.
    s = marcarFicha({ anadidas: ["F27"] }, "F27", false, true);
    expect(s).toEqual({ quitadas: ["F27"] });
    expect(estaMarcada("F27", true, s)).toBe(false);
    // Lo que deja `marcarFicha` se lee igual al cargar.
    const ss = { seleccion: marcarFicha({ ediciones: { F23: { revisada: true } } }, "F12", true, false) };
    expect(parseSeguridadSalud(ss)).toEqual(ss);
  });

  it("una añadida sale en el estudio, en el orden del catálogo", () => {
    const p = conSeleccion(deCaso("unifamiliar"), { anadidas: ["F12"] });
    const f = fichasDelEstudio(p).map((x) => x.id);
    expect(f).toContain("F12");
    expect(f.indexOf("F12")).toBe(f.indexOf("F11") + 1);
  });

  it("un id que el catálogo ya no tiene se ignora", () => {
    const p = conSeleccion(deCaso("unifamiliar"), { anadidas: ["F99"], quitadas: ["X1"] });
    expect(marcadas(p)).toEqual(ids(p));
  });
});

describe("lo que el proyectista edita en una ficha", () => {
  const f23 = fichaPorId("F23")!;
  const medida = textoItem(f23.medidas[0]!);

  it("quita riesgos por clave y medidas por texto, y añade al final", () => {
    const e = fichaEditada(f23, {
      riesgos: { quitados: ["electrico"], anadidos: [{ clave: "ruido", causa: "rozadora" }, { clave: "mismo" }] },
      medidas: { quitados: [medida], anadidos: ["Medida propia"] },
      epi: { anadidos: ["Guantes de nitrilo"] },
    });
    expect(e.riesgos.some((r) => r.clave === "electrico")).toBe(false);
    expect(e.riesgos.at(-1)).toEqual({ clave: "ruido", causa: "rozadora" });
    expect(e.riesgos.filter((r) => r.clave === "mismo")).toHaveLength(1); // ya estaba: no se repite
    expect(e.medidas.map(textoItem)).not.toContain(medida);
    expect(e.medidas.at(-1)).toBe("Medida propia");
    expect(e.epi.at(-1)).toBe("Guantes de nitrilo");
    expect(e.protecciones).toEqual(f23.protecciones);
  });

  it("si el catálogo cambia el texto quitado, la medida vuelve a salir", () => {
    const e = fichaEditada(f23, { medidas: { quitados: [`${medida} (texto antiguo)`] } });
    expect(e.medidas).toEqual(f23.medidas);
  });

  it("conserva la frecuencia del bloque común", () => {
    const f0 = fichaPorId("F0")!;
    const e = fichaEditada(f0, { medidas: { anadidos: ["Otra"] } });
    expect(e.medidas.slice(0, -1)).toEqual(f0.medidas);
  });

  it("la edición va al estudio, y una vacía se borra", () => {
    const sel = conEdicion(undefined, "F23", { riesgos: { quitados: ["electrico"] } });
    const p = conSeleccion(deCaso("unifamiliar"), sel);
    expect(fichasDelEstudio(p).find((f) => f.id === "F23")!.riesgos.some((r) => r.clave === "electrico")).toBe(false);
    expect(conEdicion(sel, "F23", { medidas: {} })).toEqual({});
  });
});

describe("fichas redactadas por la app sin revisar", () => {
  it("salen las marcadas que no se han revisado", () => {
    const p = conAlcance(deCaso("reforma_local_vivienda", { entorno: { edificioEnUso: true } }), { estructura: true });
    expect(fichasSinRevisar(p).map((f) => f.id)).toEqual(["IP9", "F40"]);
    const q = conSeleccion(p, conEdicion(conEdicion(undefined, "IP9", { revisada: true }), "F40", { revisada: true }));
    expect(fichasSinRevisar(q)).toEqual([]);
    // Una quitada no cuenta.
    expect(fichasSinRevisar(conSeleccion(p, { quitadas: ["F40", "IP9"] }))).toEqual([]);
  });

  it("la unifamiliar de obra nueva no propone ninguna", () => {
    expect(fichasSinRevisar(deCaso("unifamiliar"))).toEqual([]);
  });
});

describe("paso 7: lo que enseñó la comparación con los estudios del estudio", () => {
  const sinInterior: Alcance = {
    tipos: ["reforma"], integral: false, estructura: false, envolvente: ["huecos"], interior: [],
    aparatos: "no", electrica: "no", generacionTermica: "no", pluviales: false, aparcamiento: false,
  };
  const existente = (a: Alcance, ascensor = false): Proyecto => {
    const p = deCaso("plurifamiliar");
    return { ...p, edificio: { ...p.edificio, ascensor }, datosGenerales: { ...p.datosGenerales, intervencion: "reforma", alcance: a } };
  };

  it("solo cambiar carpinterías: ni picado ni martillo; sí la demolición manual", () => {
    const f = ids(existente(sinInterior));
    expect(f).toContain("F1");
    expect(f).toContain("F19");
    for (const id of ["F3", "M14", "F40"]) expect(f, id).not.toContain(id);
  });

  it("sin el alcance contestado, el picado se propone por prudencia", () => {
    expect(ids(existente({ tipos: ["reforma"] }))).toContain("F3");
  });

  it("ascensor en un edificio existente: con la accesibilidad intervenida", () => {
    expect(ids(existente(sinInterior, true))).not.toContain("F27");
    const p = existente({ ...sinInterior, interior: ["accesibilidad"] }, true);
    expect(motivosDe(p, "F27")).toEqual(["se interviene la accesibilidad en un edificio con ascensor"]);
    expect(ids(p)).toContain("TP3");
    // Sin ascensor en El edificio, no.
    expect(ids(existente({ ...sinInterior, interior: ["accesibilidad"] }))).not.toContain("F27");
  });
});
