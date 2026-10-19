import { describe, expect, it } from "vitest";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { evaluarExpediente } from "../../../lib/obra/evaluar";
import { memoriaCte, textoPlanoMemoriaCte } from "../../../lib/obra/memoria";
import { obraDeCaso } from "../../../lib/proyecto/alcance";
import { aplicabilidadEfectiva } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Alcance, Proyecto, PromocionObra } from "../../../lib/proyecto/tipos";
import type { EstanciaHab } from "../../hab/estado";
import { ictEstadoDefaults, type IctEstado } from "../estado";
import { justificarIct, tomasVivienda, type DetalleIct } from "../justificacion";
import { memoriaIct } from "../memoria";
import { arquetaEntrada, medidasRecinto, recintoAdmitido, tubosExternos, tubosPrincipal } from "../tablas";
import { fraseIct, textoIncumplimientoIct } from "../textos";

// =============================================================================
// feature-36, paso 3: ICT, previsiones del proyecto de arquitectura.
// =============================================================================

const AHORA = "2026-10-19T10:00:00.000Z";

/** `promocion` null: sin el régimen contestado. */
function caso(c: CasoEdificio, promocion: PromocionObra | null = { propiedadHorizontal: true }, ict?: Partial<IctEstado>): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(c), justificaciones: {} };
  const { promocion: _p, ...dg } = p.datosGenerales;
  p.datosGenerales = { ...dg, ...(promocion ? { promocion } : {}), ...(obraDeCaso(c) ?? {}) };
  if (ict) p.justificaciones = { ict: { inputs: { ...ictEstadoDefaults, ...ict } as unknown as Record<string, unknown>, schemaVersion: "1" } };
  return p;
}

const j = (p: Proyecto) =>
  justificarIct((p.justificaciones.ict?.inputs ?? {}) as Partial<IctEstado>, { edificio: p.edificio, datosGenerales: p.datosGenerales, justificaciones: p.justificaciones });
const det = <C extends DetalleIct["clase"]>(p: Proyecto, c: C) => j(p).elementos.find((e) => e.detalle.clase === c)!.detalle as Extract<DetalleIct, { clase: C }>;

describe("aplicabilidad (K-MEM.7)", () => {
  it("unifamiliar fuera de la propiedad horizontal: no aplica, una sola vivienda", () => {
    const a = aplicabilidadEfectiva(caso("unifamiliar", { propiedadHorizontal: false }), "ict");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/una sola vivienda.*RD-ley 1\/1998, art\. 2/);
  });

  it("plurifamiliar fuera del régimen: no aplica, con el motivo del arrendamiento", () => {
    const a = aplicabilidadEfectiva(caso("plurifamiliar", { propiedadHorizontal: false }), "ict");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/propiedad horizontal.*plazo superior a un año/);
  });

  it("en propiedad horizontal, o sin declarar: aplica (sin declarar, el módulo lo pide)", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      expect(aplicabilidadEfectiva(caso(c), "ict").aplicabilidad, c).toBe("aplica");
      expect(aplicabilidadEfectiva(caso(c, null), "ict").aplicabilidad, c).toBe("aplica");
    }
  });

  it("existente: solo la rehabilitación integral pide proyecto; el local a vivienda, no (INTERPRETACIÓN)", () => {
    const a = aplicabilidadEfectiva(caso("reforma_local_vivienda"), "ict");
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/rehabilitación integral.*interpretación.*se conecta a la infraestructura existente/);
    const integral = caso("plurifamiliar");
    integral.datosGenerales = { ...integral.datosGenerales, intervencion: "reforma", alcance: { tipos: ["reforma"], integral: true } satisfies Alcance };
    expect(aplicabilidadEfectiva(integral, "ict")).toMatchObject({ aplicabilidad: "aplica" });
  });
});

describe("las tablas del Anexo III (K-MEM.21)", () => {
  it("arqueta de entrada: ≤ 20, 21–100; con más de 100 PAU, ninguna (el Reglamento se contradice)", () => {
    expect(arquetaEntrada(20)).toEqual({ a: 400, b: 400, c: 600 });
    expect(arquetaEntrada(21)).toEqual({ a: 600, b: 600, c: 800 });
    expect(arquetaEntrada(100)).toEqual({ a: 600, b: 600, c: 800 });
    expect(arquetaEntrada(101)).toBeUndefined();
  });

  it("canalización externa y principal por PAU", () => {
    expect([4, 5, 20, 21, 40, 41].map(tubosExternos)).toEqual([3, 4, 4, 5, 5, 6]);
    expect([10, 11, 20, 21, 30, 31].map(tubosPrincipal)).toEqual([5, 6, 6, 7, 7, undefined]);
  });

  it("recintos: RITU con y sin zonas comunes hasta 5 PAU; RITI/RITS y RITU-A por PAU", () => {
    expect(medidasRecinto("ritu", 1, false)).toEqual({ a: 1000, b: 500, c: 300 });
    expect(medidasRecinto("ritu", 5, true)).toEqual({ a: 1000, b: 1000, c: 500 });
    expect(medidasRecinto("ritu", 16, true)).toEqual({ a: 2000, b: 1000, c: 500 });
    expect(medidasRecinto("riti_rits", 20, true)).toEqual({ a: 2000, b: 1000, c: 500 });
    expect(medidasRecinto("riti_rits", 46, true)).toEqual({ a: 2300, b: 2000, c: 1000 });
    expect(medidasRecinto("riti_rits", 75, true)).toEqual({ a: 2300, b: 2000, c: 2000 });
    expect(medidasRecinto("ritu_a", 16, true)).toEqual({ a: 2000, b: 2000, c: 500 });
    expect(medidasRecinto("ritu_a", 21, true)).toEqual({ a: 2000, b: 3000, c: 500 });
  });

  it("ámbito: RITU hasta PB + 3 y 16 PAU; RITU-A con más alturas hasta 16 o de 17 a 30; RITI + RITS siempre", () => {
    expect(recintoAdmitido("ritu", 16, 4)).toBe(true);
    expect(recintoAdmitido("ritu", 17, 4)).toBe(false);
    expect(recintoAdmitido("ritu", 8, 5)).toBe(false);
    expect(recintoAdmitido("ritu_a", 8, 5)).toBe(true);
    expect(recintoAdmitido("ritu_a", 8, 4)).toBe(false);
    expect(recintoAdmitido("ritu_a", 25, 3)).toBe(true);
    expect(recintoAdmitido("ritu_a", 31, 6)).toBe(false);
    expect(recintoAdmitido("riti_rits", 2, 1)).toBe(true);
  });
});

describe("la justificación", () => {
  it("sin el régimen declarado: «sin declarar», no cumple y lo dice la cabecera", () => {
    const p = caso("plurifamiliar", null);
    const r = j(p);
    expect(r.veredicto).toBe("fail");
    expect(r.elementos.find((e) => e.id === "regimen")).toMatchObject({ veredicto: "fail", valor: { texto: "sin declarar" } });
    expect(fraseIct(r)).toMatch(/^Falta declarar en La obra/);
    expect(textoIncumplimientoIct(r.elementos.find((e) => e.id === "regimen")!)?.titulo).toBe("Falta el régimen de propiedad horizontal.");
  });

  it("los PAU: viviendas de El edificio, un local u oficina por zona y planta, y los declarados", () => {
    expect(det(caso("plurifamiliar"), "pau")).toMatchObject({ viviendas: 7, locales: 0, comunes: 0, total: 7 });
    expect(det(caso("plurifamiliar_locales"), "pau")).toMatchObject({ viviendas: 6, locales: 1, total: 7 });
    expect(det(caso("plurifamiliar_locales", undefined, { pauLocales: 3, pauComunes: 1 }), "pau")).toMatchObject({ locales: 3, localesDeclarados: true, comunes: 1, total: 10 });
    expect(det(caso("unifamiliar"), "pau").total).toBe(1);
  });

  it("el recinto: RITU lo habitual en su ámbito; el elegido fuera de su ámbito no cumple", () => {
    const r = j(caso("plurifamiliar"));
    expect(r).toMatchObject({ recinto: "ritu", recintoHabitual: "ritu", veredicto: "ok" });
    const a = j(caso("plurifamiliar", undefined, { recinto: "ritu_a" }));
    expect(a.elementos.find((e) => e.id === "recinto")?.veredicto).toBe("fail");
    expect(textoIncumplimientoIct(a.elementos.find((e) => e.id === "recinto")!)?.titulo).toBe("El RITU-A se sale de su ámbito.");
    expect(j(caso("plurifamiliar", null, { recinto: "riti_rits" })).veredicto).toBe("fail"); // sin régimen
    expect(j(caso("plurifamiliar", { propiedadHorizontal: true }, { recinto: "riti_rits" })).veredicto).toBe("ok");
  });

  it("la unifamiliar no tiene canalización principal", () => {
    expect(j(caso("unifamiliar")).elementos.some((e) => e.id === "canalizacion-principal")).toBe(false);
    expect(j(caso("plurifamiliar")).elementos.some((e) => e.id === "canalizacion-principal")).toBe(true);
  });

  it("registros de toma (5.13): 2 principales con 2 PT + 1 coaxial + 1 RTV; el resto 1 PT + 1 RTV; fibra y configurable", () => {
    expect(tomasVivienda(4)).toEqual({ estancias: 4, paresTrenzados: 6, coaxial: 2, rtv: 4, fibra: 1, configurable: 1 });
    expect(tomasVivienda(1)).toEqual({ estancias: 1, paresTrenzados: 2, coaxial: 1, rtv: 1, fibra: 1, configurable: 1 });
  });

  it("las estancias de Habitabilidad mandan; sin ellas, las deducidas del tipo con un aviso", () => {
    const sin = j(caso("plurifamiliar"));
    expect(sin.avisos.map((a) => a.id)).toEqual(["estancias-A", "estancias-B"]);
    const p = caso("plurifamiliar");
    const est = (id: string, tipo: EstanciaHab["tipo"]): EstanciaHab => ({ id, nombre: id, tipo, util_m2: null, hueco_m2: null, acristalada_m2: null, practicable_m2: null });
    p.justificaciones = {
      hab: { inputs: { estancias: { A: [est("e", "estar_comedor"), est("c", "cocina"), est("d", "dormitorio"), est("b", "bano"), est("p", "pasillo")] } }, schemaVersion: "1" },
    };
    const conHab = j(p);
    const a = conHab.elementos.find((e) => e.id === "tomas-A")!.detalle as Extract<DetalleIct, { clase: "tomas" }>;
    expect(a).toMatchObject({ deHabitabilidad: true, tomas: { estancias: 3 } });
    expect(conHab.avisos.map((x) => x.id)).toEqual(["estancias-B"]);
  });
});

describe("la memoria", () => {
  it("el ámbito, la remisión al proyecto técnico y las dos tablas", () => {
    const m = memoriaIct(j(caso("plurifamiliar_locales", undefined, { proyectoAutor: "Ingeniera de telecomunicación", proyectoFecha: "marzo de 2026" })));
    expect(m.norma).toBe("ICT");
    const texto = m.parrafos.flat().map((t) => (typeof t === "string" ? t : t.v)).join(" ");
    expect(texto).toMatch(/nueva construcción y está acogido, o debe acogerse, al régimen de propiedad horizontal/);
    expect(texto).toMatch(/redactado por Ingeniera de telecomunicación \(marzo de 2026\)/);
    expect(texto).toMatch(/Reglamento, art\. 9/);
    expect(m.tablas?.map((t) => t.rotulo)).toEqual(["Previsiones del proyecto de arquitectura", "Registros de toma por vivienda"]);
    const prev = m.tablas![0];
    expect(prev.filas[0]).toEqual(["Puntos de acceso al usuario (PAU)", "—", "7 PAU: 6 viviendas y 1 local u oficina"]);
    expect(prev.filas[1]).toEqual(["Recinto de instalaciones (RITU)", "2000 × 1000 × 500 mm (1)", "RITU"]);
    expect(prev.notas).toHaveLength(3);
  });

  it("con más de 100 PAU la arqueta no lleva cifra ni nota", () => {
    const m = memoriaIct(j(caso("plurifamiliar", undefined, { pauLocales: 100 })));
    const arq = m.tablas![0].filas.find((f) => f[0] === "Arqueta de entrada")!;
    expect(arq).toEqual(["Arqueta de entrada", "—", "la dimensiona el proyecto técnico"]);
    expect(m.tablas![0].notas).toHaveLength(2);
    expect(m.tablas![0].filas.find((f) => f[0].startsWith("Registro de terminación"))![1]).toMatch(/\(2\)$/);
  });

  it("el Demo: la ICT cumple y su apartado va en el 4.3, tras habitabilidad", () => {
    const p = crearProyectoDemo(AHORA);
    expect(evaluarExpediente(p).porClave.ict).toMatchObject({ aplicabilidad: "aplica", veredicto: "ok" });
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(t).toMatch(/4\.3\. Infraestructuras comunes de telecomunicaciones \(ICT\)/);
    expect(t.indexOf("4.2. Habitabilidad")).toBeLessThan(t.indexOf("4.3. Infraestructuras comunes"));
  });

  it("la unifamiliar fuera del régimen: el «no aplica» en una línea", () => {
    const t = textoPlanoMemoriaCte(memoriaCte(caso("unifamiliar", { propiedadHorizontal: false })));
    expect(t).toMatch(/Infraestructuras comunes de telecomunicaciones: no es de aplicación — el edificio alberga una sola vivienda/);
  });
});

describe("los textos", () => {
  it("solo lo que no cumple tiene texto de incumplimiento", () => {
    for (const e of j(caso("plurifamiliar")).elementos) expect(textoIncumplimientoIct(e), e.id).toBeNull();
  });
});
