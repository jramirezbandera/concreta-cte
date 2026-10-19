import { describe, expect, it } from "vitest";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { evaluarExpediente } from "../../../lib/obra/evaluar";
import { memoriaCte, textoPlanoMemoriaCte } from "../../../lib/obra/memoria";
import { obraDeCaso } from "../../../lib/proyecto/alcance";
import { aplicabilidadEfectiva } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Alcance, Proyecto } from "../../../lib/proyecto/tipos";
import { he4EstadoDefaults, type He4Estado } from "../../he4/estado";
import { rebtEstadoDefaults, type RebtEstado } from "../../rebt/estado";
import { justificarRebt } from "../../rebt/justificacion";
import { climatizacionParaRebt, resolverRite, riteEstadoDefaults, type RiteEstado } from "../estado";
import { justificarRite } from "../justificacion";
import { memoriaRite } from "../memoria";
import { documentoExigible } from "../tablas";
import { fraseRite, textoIncumplimientoRite } from "../textos";

// =============================================================================
// feature-36, paso 4: HE 2 · RITE. Potencias inventadas, como las del Demo.
// =============================================================================

const AHORA = "2026-10-19T10:00:00.000Z";
const inputs = (x: object) => ({ inputs: x as unknown as Record<string, unknown>, schemaVersion: "1" });

function caso(c: CasoEdificio, rite?: Partial<RiteEstado>, otros: { he4?: Partial<He4Estado>; rebt?: Partial<RebtEstado> } = {}): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(c), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(c) ?? {}) };
  p.justificaciones = {
    ...(rite ? { rite: inputs({ ...riteEstadoDefaults, ...rite }) } : {}),
    ...(otros.he4 ? { he4: inputs({ ...he4EstadoDefaults, ...otros.he4 }) } : {}),
    ...(otros.rebt ? { rebt: inputs({ ...rebtEstadoDefaults, ...otros.rebt }) } : {}),
  };
  return p;
}

const j = (p: Proyecto) =>
  justificarRite((p.justificaciones.rite?.inputs ?? {}) as Partial<RiteEstado>, { edificio: p.edificio, datosGenerales: p.datosGenerales, justificaciones: p.justificaciones });

const POT = { potenciaCalor_kW: 3.6, potenciaFrio_kW: 3.4, potenciaAcs_kW: 1.8 };

describe("art. 15.1 (K-MEM.4 y 19)", () => {
  it("menos de 5 kW, ninguno; de 5 a 70, memoria técnica; más de 70, proyecto", () => {
    expect([4.99, 5, 70, 70.01].map(documentoExigible)).toEqual(["ninguno", "memoria", "memoria", "proyecto"]);
  });
});

describe("aplicabilidad", () => {
  it("obra nueva: aplica en todos los casos", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) expect(aplicabilidadEfectiva(caso(c), "rite").aplicabilidad, c).toBe("aplica");
  });

  it("existente: por la generación térmica; el cambio de uso característico, todo (art. 2.3 e y 15.6)", () => {
    const existente = (alcance: Alcance): Proyecto => {
      const p = caso("plurifamiliar");
      p.datosGenerales = { ...p.datosGenerales, intervencion: "reforma", alcance: { tipos: ["reforma"], ...alcance } };
      return p;
    };
    expect(aplicabilidadEfectiva(existente({ generacionTermica: "no" }), "rite")).toMatchObject({ aplicabilidad: "no_aplica" });
    expect(aplicabilidadEfectiva(existente({ generacionTermica: "parcial" }), "rite")).toMatchObject({ aplicabilidad: "aplica_reformado" });
    expect(aplicabilidadEfectiva(existente({ generacionTermica: "general" }), "rite")).toMatchObject({ aplicabilidad: "aplica_reformado" });
    expect(aplicabilidadEfectiva(existente({}), "rite").nota).toMatch(/mientras no se precise/);
    const cambio = existente({ tipos: ["cambio_uso"], cambioUsoCaracteristico: true, generacionTermica: "no" });
    expect(aplicabilidadEfectiva(cambio, "rite")).toMatchObject({ aplicabilidad: "aplica" });
    expect(aplicabilidadEfectiva(cambio, "rite").nota).toMatch(/art\. 2\.3 e.*15\.6/);
  });

  it("el local que pasa a vivienda (generación parcial): a lo que se renueva, con la línea del 15.6", () => {
    const p = caso("reforma_local_vivienda", POT);
    expect(aplicabilidadEfectiva(p, "rite").aplicabilidad).toBe("aplica_reformado");
    expect(j(p).elementos.some((e) => e.id === "cambio-uso")).toBe(true);
  });
});

describe("lo habitual y lo que se guarda", () => {
  it("bomba de calor aire-aire reversible, con split, individual", () => {
    const d = resolverRite({}, { unifamiliar: false });
    expect(d).toMatchObject({ calefaccion: "aire_aire", refrigeracion: "misma", emisores: "splits", produccion: "individual" });
  });

  it("lo que guardaba el REBT antes decide lo habitual: aire-agua, emisores eléctricos o caldera", () => {
    expect(resolverRite({}, { unifamiliar: false, rebt: { climatizacion: "aire_agua" } }).calefaccion).toBe("aire_agua");
    expect(resolverRite({}, { unifamiliar: false, rebt: { climatizacion: "emisores" } }).calefaccion).toBe("electrica");
    expect(resolverRite({}, { unifamiliar: false, rebt: { climatizacion: "ninguna" } })).toMatchObject({ calefaccion: "caldera", refrigeracion: "ninguna", emisores: "radiadores" });
  });

  it("«la misma» refrigeración solo con una bomba de calor; la unifamiliar siempre individual", () => {
    expect(resolverRite({ calefaccion: "caldera", refrigeracion: "misma" }, { unifamiliar: false }).refrigeracion).toBe("ninguna");
    expect(resolverRite({ produccion: "centralizada" }, { unifamiliar: true }).produccion).toBe("individual");
  });
});

describe("las instalaciones y su documento", () => {
  it("una instalación por vivienda: calor de la bomba y del ACS sumados frente al frío", () => {
    const r = j(caso("plurifamiliar", POT));
    expect(r.instalaciones).toEqual([
      { id: "unica", servicios: ["calefaccion", "refrigeracion", "acs"], produccion: "individual", calor_kW: 5.4, frio_kW: 3.4, potencia_kW: 5.4, documento: "memoria", faltan: [] },
    ]);
    expect(r.veredicto).toBe("ok");
    expect(fraseRite(r)).toBe("Bomba de calor aire-aire y ACS con bomba de calor: memoria técnica (5,4 kW por vivienda), según el art. 15 del RITE.");
  });

  it("el ACS de la misma máquina (aire-agua y bomba de calor en HE 4) no se suma dos veces", () => {
    const r = j(caso("unifamiliar", { ...POT, calefaccion: "aire_agua", potenciaCalor_kW: 4.5, acsMismaMaquina: true }));
    expect(r.puedeMismaMaquina).toBe(true);
    expect(r.instalaciones[0]).toMatchObject({ calor_kW: 4.5, potencia_kW: 4.5, documento: "ninguno" });
  });

  it("la misma máquina no vale si HE 4 dice otro sistema", () => {
    const r = j(caso("unifamiliar", { ...POT, calefaccion: "aire_agua", acsMismaMaquina: true }, { he4: { sistema: "red" } }));
    expect(r.puedeMismaMaquina).toBe(false);
    expect(r.acs.mismaMaquina).toBe(false);
  });

  it("climatización centralizada y ACS individual: dos instalaciones, cada una con su documento", () => {
    const r = j(caso("plurifamiliar", { ...POT, calefaccion: "caldera", produccion: "centralizada", potenciaCalor_kW: 90 }));
    expect(r.instalaciones.map((i) => [i.id, i.potencia_kW, i.documento])).toEqual([
      ["clima", 90, "proyecto"],
      ["acs", 1.8, "ninguno"],
    ]);
    expect(r.elementos.find((e) => e.id === "contabilizacion")?.valor).toEqual({ texto: "reparto de gastos" });
  });

  it("sin potencias: «falta la potencia», no cumple y lo dice", () => {
    const r = j(caso("plurifamiliar"));
    expect(r.veredicto).toBe("fail");
    expect(fraseRite(r)).toMatch(/^Falta la potencia nominal de calefacción, refrigeración y ACS/);
    const doc = r.elementos.find((e) => e.id === "documento-unica")!;
    expect(textoIncumplimientoRite(doc)?.titulo).toBe("Falta la potencia nominal de calefacción, refrigeración y ACS.");
    for (const e of j(caso("plurifamiliar", POT)).elementos) expect(textoIncumplimientoRite(e), e.id).toBeNull();
  });
});

describe("el REBT lee la climatización del RITE", () => {
  it("aire-agua → C8; emisores eléctricos → C8 con tomas; caldera con split de frío → C9; caldera sola → ninguna", () => {
    const de = (r: Partial<RiteEstado>) => climatizacionParaRebt({ rite: inputs({ ...riteEstadoDefaults, ...r }) }, false);
    expect(de({ calefaccion: "aire_agua" })).toBe("aire_agua");
    expect(de({ calefaccion: "electrica" })).toBe("emisores");
    expect(de({ calefaccion: "caldera", refrigeracion: "aire_aire" })).toBe("aire_aire");
    expect(de({ calefaccion: "caldera" })).toBe("ninguna");
    expect(climatizacionParaRebt({}, false)).toBe("aire_aire");
  });

  it("los circuitos del REBT siguen al RITE", () => {
    const p = caso("plurifamiliar", { ...POT, calefaccion: "aire_agua" });
    const r = justificarRebt({ ...rebtEstadoDefaults }, { edificio: p.edificio, datosGenerales: p.datosGenerales, justificaciones: p.justificaciones });
    expect(r.instalacion.equipos.climatizacion).toBe("aire_agua");
  });
});

describe("la memoria", () => {
  it("la remisión de HE 2, el sistema, el documento y la tabla 1.4.1.1", () => {
    const m = memoriaRite(j(caso("plurifamiliar", { ...POT, scop: 4.1, seer: 6.5, acumulacion_l: 200 })));
    expect(m.norma).toBe("DB-HE 2");
    const texto = m.parrafos.flat().map((t) => (typeof t === "string" ? t : t.v)).join(" ");
    expect(texto).toMatch(/se desarrolla actualmente en el vigente Reglamento de Instalaciones Térmicas/);
    expect(texto).toMatch(/memoria técnica \(RITE art\. 15\.1 b\), elaborada por instalador habilitado/);
    expect(texto).toMatch(/Sección HS 3 del CTE \(IT 1\.1\.4\.2\.1\)/);
    expect(texto).toMatch(/legionelosis \(IT 1\.1\.4\.3\)/);
    expect(texto).not.toMatch(/\d+ ?°C/);
    expect(m.tablas?.map((t) => t.rotulo)).toEqual(["Instalaciones térmicas", "Condiciones interiores de diseño (RITE IT 1.1.4.1.2, tabla 1.4.1.1)"]);
    expect(m.tablas![0].filas[0]).toEqual(["Calefacción", "bomba de calor aire-aire", "unidades interiores (split)", "3,6", "SCOP 4,1"]);
    expect(m.tablas![0].filas[2]).toEqual(["Agua caliente sanitaria", "bomba de calor", "acumulación de 200 l", "1,8", "—"]);
    expect(m.tablas![1].filas).toEqual([
      ["Verano", "23…25", "45…60"],
      ["Invierno", "21…23", "40…50"],
    ]);
  });

  it("el Demo: HE 2 cumple y va en el 3.6.3, tras HE 1 y antes de HE 3", () => {
    const p = crearProyectoDemo(AHORA);
    expect(evaluarExpediente(p).porClave.rite).toMatchObject({ aplicabilidad: "aplica", veredicto: "ok" });
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(t).toMatch(/3\.6\.3\. HE 2 Condiciones de las instalaciones térmicas/);
    expect(t.indexOf("HE 2 Condiciones")).toBeLessThan(t.indexOf("HE 3 Condiciones"));
  });
});
