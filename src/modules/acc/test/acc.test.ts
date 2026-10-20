import { describe, expect, it } from "vitest";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { resumenEdificio } from "../../../lib/edificio/derivar";
import { evaluarExpediente } from "../../../lib/obra/evaluar";
import { memoriaCte, textoPlanoMemoriaCte } from "../../../lib/obra/memoria";
import { obraDeCaso } from "../../../lib/proyecto/alcance";
import { aplicabilidadEfectiva } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto, PromocionObra } from "../../../lib/proyecto/tipos";
import type { AccEstado } from "../estado";
import { justificarAcc, type DetalleAcc } from "../justificacion";
import { memoriaAcc } from "../memoria";
import { exigenciaVertical, viviendasReservadas } from "../tablas";
import { fraseAcc, textoAvisoAcc, textoIncumplimientoAcc } from "../textos";

// =============================================================================
// feature-36, paso 5: accesibilidad autonómica. Solo Andalucía trae plantilla.
// =============================================================================

const AHORA = "2026-10-19T10:00:00.000Z";
const MALAGA = "29067";
const CACERES = "10037";

function caso(c: CasoEdificio, opciones: { ine?: string; promocion?: PromocionObra; acc?: AccEstado; ascensor?: boolean } = {}): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(c), justificaciones: {} };
  const { promocion: _p, ...dg } = p.datosGenerales;
  p.datosGenerales = { ...dg, municipioIne: opciones.ine ?? MALAGA, ...(opciones.promocion ? { promocion: opciones.promocion } : {}), ...(obraDeCaso(c) ?? {}) };
  if (opciones.ascensor !== undefined) p.edificio = { ...p.edificio, ascensor: opciones.ascensor };
  if (opciones.acc) p.justificaciones = { acc: { inputs: opciones.acc as Record<string, unknown>, schemaVersion: "1" } };
  return p;
}

const j = (p: Proyecto) =>
  justificarAcc((p.justificaciones.acc?.inputs ?? {}) as Partial<AccEstado>, { edificio: p.edificio, datosGenerales: p.datosGenerales, justificaciones: p.justificaciones });
const det = <C extends DetalleAcc["clase"]>(p: Proyecto, c: C) => j(p).elementos.find((e) => e.detalle.clase === c)?.detalle as Extract<DetalleAcc, { clase: C }> | undefined;

describe("el Decreto 293/2009 (K-MEM.22)", () => {
  it("art. 106.2: una planta, nada; PB+1 con 6 viviendas o menos, reserva; con más, o PB+2, ascensor", () => {
    expect(exigenciaVertical(1, 20)).toBe("ninguna");
    expect(exigenciaVertical(2, 6)).toBe("reserva");
    expect(exigenciaVertical(2, 7)).toBe("ascensor");
    expect(exigenciaVertical(3, 1)).toBe("ascensor");
  });

  it("reserva (Ley 4/2017; Ficha IV): de 17 a 25, una; con más, el 4 % redondeado; menos de 17, ninguna", () => {
    expect([16, 17, 25, 26, 37, 38, 100].map(viviendasReservadas)).toEqual([0, 1, 1, 1, 1, 2, 4]);
  });
});

describe("aplicabilidad", () => {
  it("unifamiliar andaluza: no aplica, sin elementos comunitarios (el art. 106 es de los plurifamiliares)", () => {
    const a = aplicabilidadEfectiva(caso("unifamiliar"), "acc");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/es unifamiliar, sin elementos de uso comunitario \(art\. 2\.1 j\)/);
    expect(a.nota).not.toMatch(/106/);
  });

  it("fuera de Andalucía, la unifamiliar sigue aplicando (decide su norma)", () => {
    expect(aplicabilidadEfectiva(caso("unifamiliar", { ine: CACERES }), "acc").aplicabilidad).toBe("aplica");
  });

  it("local a vivienda en Andalucía: a las zonas comunes que se reforman (el portal); sin tocarlas, no aplica", () => {
    expect(aplicabilidadEfectiva(caso("reforma_local_vivienda"), "acc").aplicabilidad).toBe("aplica_reformado");
    const p = caso("reforma_local_vivienda");
    p.edificio = { ...p.edificio, grupos: p.edificio.grupos.map((g) => ({ ...g, zonas: g.zonas.map((z) => (z.id === "z3" ? { ...z, obra: "existente" as const } : z)) })) };
    const a = aplicabilidadEfectiva(p, "acc");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/no construye, reforma ni cambia de uso elementos de uso comunitario/);
  });
});

describe("fuera de Andalucía: la norma declarada", () => {
  it("sin municipio o sin norma, no cumple; declarada, cumple y la memoria remite a ella", () => {
    const sinMunicipio = caso("plurifamiliar");
    sinMunicipio.datosGenerales = { ...sinMunicipio.datosGenerales, municipioIne: undefined };
    expect(textoIncumplimientoAcc(j(sinMunicipio).elementos[0])?.titulo).toBe("Falta el municipio de la obra.");
    const sin = j(caso("plurifamiliar", { ine: CACERES }));
    expect(sin.veredicto).toBe("fail");
    expect(fraseAcc(sin)).toMatch(/^Extremadura: declara la norma autonómica/);
    const con = j(caso("plurifamiliar", { ine: CACERES, acc: { normaOtra: "Norma X" } }));
    expect(con.veredicto).toBe("ok");
    expect(con.elementos.map((e) => e.id)).toEqual(["norma"]);
    expect(memoriaAcc(con).parrafos[0][0]).toMatch(/^La accesibilidad se justifica con Norma X, norma de Extremadura/);
  });
});

describe("Andalucía", () => {
  it("plurifamiliar de 4 plantas: itinerarios y ascensor; sin ascensor en El edificio, no cumple", () => {
    expect(det(caso("plurifamiliar"), "ascensor")).toMatchObject({ exigencia: "ascensor", plantas: resumenEdificio(edificioDeCaso("plurifamiliar")).plantasSobreRasante });
    const sin = j(caso("plurifamiliar", { promocion: { protegida: false }, ascensor: false }));
    const asc = sin.elementos.find((e) => e.id === "ascensor")!;
    expect(asc.veredicto).toBe("fail");
    expect(textoIncumplimientoAcc(asc)?.titulo).toBe("El Decreto 293/2009 exige ascensor y el edificio no lo tiene.");
    expect(j(caso("plurifamiliar", { promocion: { protegida: false }, ascensor: true })).veredicto).toBe("ok");
  });

  it("la unifamiliar (forzada a aplicar): sin exigencias y sin comunicación vertical", () => {
    const r = j(caso("unifamiliar"));
    expect(r.elementos.map((e) => [e.id, e.veredicto])).toEqual([
      ["norma", "dato"],
      ["unifamiliar", "dato"],
    ]);
    expect(r.veredicto).toBe("ok");
    expect(memoriaAcc(r).parrafos[0][0]).toMatch(/La vivienda unifamiliar no los tiene/);
  });

  it("reserva: sin declarar la promoción, no cumple; protegida con menos de 17, cero y un aviso; las cuenta SUA 9", () => {
    expect(j(caso("plurifamiliar", { ascensor: true })).elementos.find((e) => e.id === "reserva")?.veredicto).toBe("fail");
    const prot = j(caso("plurifamiliar", { ascensor: true, promocion: { protegida: true } }));
    expect(prot.elementos.find((e) => e.id === "reserva")).toMatchObject({ veredicto: "ok", valor: { valor: 0, unidad: "viviendas" } });
    expect(prot.avisos.map((a) => a.id)).toContain("reserva-menos-17");
    expect(textoAvisoAcc(prot.avisos.find((a) => a.id === "reserva-menos-17")!).titulo).toMatch(/menos de 17 viviendas/);
  });

  it("PB+1 con 7 viviendas: el Decreto pide ascensor y SUA 9 solo la previsión; manda el Decreto, con un aviso", () => {
    const p = caso("plurifamiliar", { promocion: { protegida: false } });
    p.edificio = {
      ...p.edificio,
      grupos: p.edificio.grupos.map((g) =>
        g.id === "g1" ? { ...g, repeticiones: 1, zonas: g.zonas.map((z) => ({ ...z, unidades: [{ tipoId: "A", cantidad: 3 }, { tipoId: "B", cantidad: 3 }] })) } : g,
      ),
    };
    const r = j(p);
    expect(r.elementos.find((e) => e.id === "ascensor")?.detalle).toMatchObject({ exigencia: "ascensor", sua9: "prevision", hay: true, supuesto: true });
    expect(r.avisos.map((a) => a.id)).toEqual(["manda-decreto"]);
    expect(textoAvisoAcc(r.avisos[0]).titulo).toBe("El Decreto 293/2009 pide ascensor y SUA 9 solo su previsión.");
    const fila = memoriaAcc(r).tablas![0].filas[0];
    expect(fila).toEqual(["Comunicación vertical", "previsión de ascensor", "ascensor (1)", "ascensor"]);
  });

  it("oficinas: la Ficha II, fuera del alcance", () => {
    const r = j(caso("oficinas"));
    expect(r.elementos.map((e) => [e.id, e.veredicto])).toEqual([
      ["norma", "dato"],
      ["otros-usos", "fuera"],
    ]);
  });

  it("existente: solo lo modificado y la DA 1.ª, si se declara", () => {
    const p = caso("reforma_local_vivienda", { promocion: { protegida: false }, acc: { imposibilidad: "Art. 106.2, por la estructura protegida." } });
    const r = j(p);
    expect(r.elementos.find((e) => e.id === "ascensor")?.veredicto).toBe("dato");
    const texto = memoriaAcc(r).parrafos.flat().join(" ");
    expect(texto).toMatch(/solo a los elementos o partes que se modifican \(arts\. 2\.1 j y 2\.2\)/);
    expect(texto).toMatch(/disposición adicional primera, no es posible cumplir íntegramente lo siguiente: Art\. 106\.2, por la estructura protegida\. Se mejoran/);
  });

  it("existente: los itinerarios, solo en lo que se modifica; ni los de todo el edificio ni el ascensor al garaje (paso 8)", () => {
    const m = memoriaAcc(j(caso("reforma_local_vivienda", { promocion: { protegida: false } })));
    const texto = m.parrafos.flat().join("");
    expect(texto).not.toMatch(/Se disponen itinerarios accesibles/);
    expect(texto).not.toMatch(/art\. 106\.4/);
    expect(texto).toMatch(/que se modifican \(arts\. 2\.1 j y 2\.2\): en ellos, los itinerarios cumplen el art\. 104, con las condiciones que se justifican en la Ficha III/);
    // La tabla, tras el párrafo de la reforma.
    expect(m.tablas?.[0].tras).toBe(m.parrafos.length);
  });
});

describe("la memoria", () => {
  it("Andalucía: el ámbito, los itinerarios y la tabla «DB-SUA 9 | Decreto | Proyecto»", () => {
    const m = memoriaAcc(j(caso("plurifamiliar", { promocion: { protegida: false }, ascensor: true })));
    expect(m.norma).toBe("Accesibilidad");
    const texto = m.parrafos.flat().join(" ");
    expect(texto).toMatch(/Decreto 293\/2009, de 7 de julio \(BOJA núm\. 140, de 21-07-2009/);
    expect(texto).toMatch(/El interior de las viviendas libres no reservadas para personas con movilidad reducida no tiene exigencias/);
    expect(texto).toMatch(/Ficha III de la Orden de 9 de enero de 2012/);
    expect(m.tablas?.[0].cabecera).toEqual(["Parámetro", "DB-SUA 9", "Decreto 293/2009", "Proyecto"]);
    expect(m.tablas?.[0].filas[0]).toEqual(["Comunicación vertical", "ascensor accesible", "ascensor", "ascensor"]);
    expect(m.tablas?.[0].filas[1]).toEqual(["Viviendas reservadas para personas con movilidad reducida", "las de la reglamentación aplicable (1.2.1)", "no se exige (promoción libre)", "0"]);
  });

  it("el Demo (Cáceres): la norma de demostración y el apartado 4.4, tras la ICT", () => {
    const p = crearProyectoDemo(AHORA);
    expect(evaluarExpediente(p).porClave.acc).toMatchObject({ aplicabilidad: "aplica", veredicto: "ok" });
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(t).toMatch(/4\.4\. Accesibilidad/);
    expect(t).toMatch(/Norma de accesibilidad de demostración/);
    expect(t.indexOf("4.3. Infraestructuras")).toBeLessThan(t.indexOf("4.4. Accesibilidad"));
  });
});
