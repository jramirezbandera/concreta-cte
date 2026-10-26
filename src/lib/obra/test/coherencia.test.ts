import { describe, expect, it } from "vitest";
import { crearProyectoDemoConSupuestos } from "../../proyecto/demo";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import type { JustificacionKey, Proyecto } from "../../proyecto/tipos";
import { coherencia, coherenciaPendiente } from "../coherencia";
import { antesDeEntregar } from "../entrega";

// =============================================================================
// feature-36, paso 6: la coherencia entre apartados. Las contradicciones de los
// ejemplos del estudio que pueden darse en la app dan su aviso; las que no
// (lo que sale de una sola fuente) no se comprueban.
// =============================================================================

const AHORA = "2026-10-19T10:00:00.000Z";
const demo = (): Proyecto => crearProyectoDemoConSupuestos(AHORA);

function deCaso(caso: CasoEdificio): Proyecto {
  const p: Proyecto = { ...demo(), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}) };
  return p;
}

/** El proyecto con las entradas de un módulo cambiadas. */
function con(p: Proyecto, key: JustificacionKey, inputs: Record<string, unknown>): Proyecto {
  const j = p.justificaciones[key] ?? {};
  return { ...p, justificaciones: { ...p.justificaciones, [key]: { ...j, inputs: { ...(j.inputs ?? {}), ...inputs } } } };
}

function forzada(p: Proyecto, key: JustificacionKey, valor: "aplica" | "no_aplica"): Proyecto {
  const j = p.justificaciones[key] ?? {};
  return { ...p, justificaciones: { ...p.justificaciones, [key]: { ...j, aplicabilidadForzada: { valor, nota: "No se proyectan aparcamientos." } } } };
}

const ids = (p: Proyecto) => coherencia(p).map((a) => a.id);

describe("coherencia", () => {
  it.each([
    ["el Demo", demo],
    ...(["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas", "reforma_local_vivienda"] as CasoEdificio[]).map(
      (c): [string, () => Proyecto] => [c, () => deCaso(c)],
    ),
  ])("%s, con lo habitual: nada que avisar", (_n, crear) => {
    expect(coherencia(crear())).toEqual([]);
  });

  it("ACS: HS 4 central y HE 4 individual (el termo de 75 l frente a la aerotermia del ejemplo)", () => {
    const p = con(demo(), "hs4", { aguaCaliente: "central" });
    const [a] = coherencia(p);
    expect(a).toMatchObject({ id: "acs:central-individual", tema: "acs" });
    expect(a!.detalle).toContain("HS 4 la da por centralizada y HE 4, por individual en cada vivienda");
    expect(a!.enlaces.map((e) => e.codigo)).toEqual(["HS4", "HE4"]);
    // Las dos centralizadas: coinciden.
    expect(ids(con(p, "he4", { produccion: "centralizada" })).filter((x) => x.startsWith("acs:"))).toEqual([]);
  });

  it("ACS: en la unifamiliar HE 4 no pregunta la producción, no se compara", () => {
    expect(ids(con(deCaso("unifamiliar"), "hs4", { aguaCaliente: "central" }))).toEqual([]);
  });

  it("servicios: el grupo de presión de HS 4 sin potencia en el REBT (el ejemplo del grupo)", () => {
    const p = con(demo(), "hs4", { grupoPresion: true });
    const a = coherencia(p).find((x) => x.tema === "servicios");
    expect(a).toMatchObject({ id: "servicios:grupo", titulo: "El REBT no suma la potencia del grupo de presión de HS 4." });
    expect(a!.detalle).toContain("sin indicar");
    // Con los otros servicios a 0 kW, también; con potencia, ya no.
    expect(coherencia(con(p, "rebt", { otrosServicios_kW: 0 })).find((x) => x.tema === "servicios")!.detalle).toContain("a 0 kW");
    expect(ids(con(p, "rebt", { otrosServicios_kW: 4.1 }))).toEqual([]);
  });

  it("servicios: la climatización centralizada del RITE, junto al grupo", () => {
    const p = con(con(demo(), "rite", { produccion: "centralizada" }), "hs4", { grupoPresion: true });
    const a = coherencia(p).find((x) => x.tema === "servicios")!;
    expect(a.id).toBe("servicios:grupo-clima");
    expect(a.titulo).toBe("El REBT no suma la potencia del grupo de presión de HS 4 y de la producción centralizada de climatización del RITE.");
    expect(a.enlaces.map((e) => e.codigo)).toEqual(["HS4", "HE2", "REBT"]);
  });

  it("electrificación: aire-aire en el RITE y el REBT por superficie (la básica del ejemplo)", () => {
    const p = con(demo(), "rebt", { electrificacion: "superficie" });
    const a = coherencia(p).find((x) => x.tema === "electrificacion")!;
    expect(a.id).toBe("electrificacion:basica-aire_aire");
    expect(a.detalle).toContain("bomba de calor aire-aire en cada vivienda");
    // Con producción centralizada, la máquina no está en la vivienda.
    expect(ids(con(p, "rite", { produccion: "centralizada" })).filter((x) => x.startsWith("electrificacion:"))).toEqual([]);
  });

  it("electrificación: caldera en el RITE y el REBT elevada por equipos", () => {
    const p = con(demo(), "rite", { calefaccion: "caldera", refrigeracion: "ninguna" });
    const a = coherencia(p).find((x) => x.tema === "electrificacion")!;
    expect(a.id).toBe("electrificacion:elevada-caldera-ninguna");
    expect(a.detalle).toContain("calefacción con caldera y sin refrigeración");
    // Con secadora, la elevada tiene motivo.
    expect(ids(con(p, "rebt", { secadora: true }))).toEqual([]);
    // Por superficie, coinciden.
    expect(ids(con(p, "rebt", { electrificacion: "superficie" }))).toEqual([]);
  });

  it("electrificación: producción centralizada en el RITE y el REBT elevada por equipos", () => {
    const p = con(demo(), "rite", { produccion: "centralizada" });
    const a = coherencia(p).find((x) => x.tema === "electrificacion")!;
    expect(a.id).toBe("electrificacion:elevada-aire_aire-misma-centralizada");
    expect(a.detalle).toMatch(/^El RITE prevé la producción de climatización centralizada, fuera de las viviendas, y el REBT no lleva secadora/);
    expect(ids(con(p, "rebt", { electrificacion: "superficie" })).filter((x) => x.startsWith("electrificacion:"))).toEqual([]);
  });

  it("garaje: HE 6 «no aplica» con el garaje de El edificio y SUA 7 justificándolo (el ejemplo)", () => {
    const p = forzada(deCaso("plurifamiliar"), "he6", "no_aplica");
    const a = coherencia(p).find((x) => x.tema === "garaje")!;
    expect(a.id).toBe("garaje:he6-no");
    expect(a.titulo).toBe("HE 6 se ha marcado «no aplica», pero El edificio tiene garaje.");
    expect(a.detalle).toMatch(/^El edificio tiene \d+ plazas de garaje, que justifican SUA 7 y el REBT\. /);
  });

  it("garaje: SUA 7 forzado a aplicar sin garaje", () => {
    const base = deCaso("plurifamiliar");
    const sinGaraje = { ...base.edificio, grupos: base.edificio.grupos.map((g) => ({ ...g, zonas: g.zonas.filter((z) => z.uso !== "garaje") })) };
    const p = forzada({ ...base, edificio: sinGaraje }, "sua7", "aplica");
    const [a] = coherencia(p);
    expect(a).toMatchObject({ id: "garaje:sua7-si", titulo: "SUA 7 se ha marcado como que aplica, pero El edificio no tiene garaje." });
  });

  it("garaje: las plazas exteriores de HE 6 que el REBT no cuenta (4 plazas sin recarga)", () => {
    const p = con(deCaso("plurifamiliar"), "he6", { plazasExteriores: 4 });
    const a = coherencia(p).find((x) => x.tema === "garaje")!;
    expect(a.id).toBe("garaje:exteriores-4");
    expect(a.detalle).toContain("a 4 plazas exteriores");
  });

  it("contadores: un local sin superficie lo cuenta HS 4 y no el REBT", () => {
    const base = deCaso("plurifamiliar_locales");
    const edificio = {
      ...base.edificio,
      grupos: base.edificio.grupos.map((g) => ({ ...g, zonas: g.zonas.map((z) => (z.uso === "local_sin_uso" ? { ...z, superficieUtil_m2: 0 } : z)) })),
    };
    const a = coherencia({ ...base, edificio }).find((x) => x.tema === "contadores")!;
    expect(a).toMatchObject({ titulo: "HS 4 y el REBT no cuentan los mismos contadores." });
    expect(a.detalle).toMatch(/^HS 4 lleva .* y 1 de local u oficina; el REBT, .* y 0 de locales u oficinas\./);
    expect(a.enlaces.map((e) => e.codigo)).toEqual(["HS4", "REBT"]);
    // En una obra existente no se compara.
    expect(coherencia({ ...base, edificio, datosGenerales: { ...base.datosGenerales, intervencion: "reforma" } }).some((x) => x.tema === "contadores")).toBe(false);
  });

  it("los cinco ejemplos de contradicción de feature-36 dan cada uno su aviso", () => {
    const sinLocal = deCaso("plurifamiliar_locales");
    sinLocal.edificio = {
      ...sinLocal.edificio,
      grupos: sinLocal.edificio.grupos.map((g) => ({ ...g, zonas: g.zonas.map((z) => (z.uso === "local_sin_uso" ? { ...z, superficieUtil_m2: 0 } : z)) })),
    };
    const ejemplos: [string, Proyecto][] = [
      ["acs", con(demo(), "hs4", { aguaCaliente: "central" })],
      ["servicios", con(demo(), "hs4", { grupoPresion: true })],
      ["garaje", forzada(deCaso("plurifamiliar"), "he6", "no_aplica")],
      ["contadores", sinLocal],
      ["electrificacion", con(demo(), "rebt", { electrificacion: "superficie" })],
    ];
    for (const [tema, p] of ejemplos) expect(coherenciaPendiente(p).map((a) => a.tema), tema).toContain(tema);
  });

  it("revisado: deja de estar pendiente y vuelve si cambia lo que se compara", () => {
    const p = con(demo(), "hs4", { aguaCaliente: "central" });
    const revisado = { ...p, datosGenerales: { ...p.datosGenerales, coherenciaRevisada: ["acs:central-individual"] } };
    expect(coherenciaPendiente(revisado)).toEqual([]);
    expect(coherencia(revisado)).toHaveLength(1);
    const otro = con(con(revisado, "hs4", { aguaCaliente: "individual" }), "he4", { produccion: "centralizada" });
    expect(coherenciaPendiente(otro).map((a) => a.id)).toEqual(["acs:individual-centralizada"]);
  });

  it("en «Antes de entregar», tras los avisos de los módulos, con sus apartados", () => {
    const p = con(demo(), "hs4", { aguaCaliente: "central" });
    const l = antesDeEntregar(p);
    const i = l.findIndex((x) => x.key === "coherencia");
    expect(l[i]).toMatchObject({
      id: "coherencia:acs:central-individual",
      codigo: "Coherencia",
      tipo: "revisar",
      enlaces: [
        { key: "hs4", codigo: "HS4", ruta: "hs/fontaneria" },
        { key: "he4", codigo: "HE4" },
      ],
    });
    expect(l.slice(0, i).every((x) => x.key !== "coherencia" && x.key !== "seguridadSalud")).toBe(true);
  });
});
