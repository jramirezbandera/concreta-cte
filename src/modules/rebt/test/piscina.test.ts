import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { obraExistenteDe } from "../../../lib/proyecto/alcance";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { ProyectoSi } from "../../si/definicion";
import { anejoRebt } from "../anejo";
import { rebt } from "../definicion";
import { rebtEstadoDefaults, type RebtEstado } from "../estado";
import { justificarRebt, type DetalleRebt, type JustificacionRebt } from "../justificacion";

// =============================================================================
// REBT · la piscina (feature-36, paso 7): la ITC-BT-31 se aplica a toda piscina,
// privada o comunitaria; proyecto con más de 5 kW (ITC-BT-04, grupo n) e
// inspección con más de 10 kW (ITC-BT-05). research/verificacion-memoria.md K-MEM.23.
// =============================================================================

const demo = crearProyectoDemo("2026-10-20T10:00:00.000Z");
const caso = (c: CasoEdificio, estado: Partial<RebtEstado> = {}, piscina = true, existente?: ProyectoSi["existente"]) =>
  justificarRebt(
    { ...rebtEstadoDefaults, ...estado },
    { edificio: edificioDeCaso(c), datosGenerales: { ...demo.datosGenerales, tienePiscina: piscina }, justificaciones: {}, ...(existente ? { existente } : {}) },
  );
const detalle = <C extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleRebt, { clase: C }> | undefined;
const textoAnejo = (j: JustificacionRebt) =>
  anejoRebt(j)
    .partes.filter((p) => p.titulo === "Piscina (ITC-BT-31)")
    .flatMap((p) => p.parrafos.map(textoParrafo))
    .join(" ");

describe("REBT · la piscina", () => {
  it("sin piscina en La obra, nada cambia", () => {
    const j = caso("unifamiliar", { piscina_kW: 3 }, false);
    expect(detalle(j, "piscina")).toBeUndefined();
    expect(anejoRebt(j).partes.map((p) => p.titulo)).not.toContain("Piscina (ITC-BT-31)");
  });

  it("la unifamiliar sin la potencia: «no cumple», con su texto, y no cambia la previsión", () => {
    const j = caso("unifamiliar");
    const el = j.elementos.find((e) => e.id === "piscina")!;
    expect(el.veredicto).toBe("fail");
    expect(el.detalle).toEqual({ clase: "piscina", comunitaria: false, kW: null, alumbrado: false, proyecto: null, oca: null });
    expect(rebt.textoIncumplimiento(el)?.titulo).toBe("Indica la potencia de la piscina.");
    expect(detalle(j, "total")!.p_W).toBe(9200);
    expect(j.veredicto).toBe("fail");
  });

  it("hasta 5 kW, memoria técnica de diseño; más de 5, proyecto de la piscina (grupo n); más de 10, OCA", () => {
    const j5 = caso("unifamiliar", { piscina_kW: 5 });
    expect(detalle(j5, "piscina")).toMatchObject({ kW: 5, proyecto: false, oca: false });
    expect(detalle(j5, "documentacion")).toMatchObject({ proyecto: false, solo: [] });
    expect(j5.veredicto).toBe("ok");

    const j6 = caso("unifamiliar", { piscina_kW: 6 });
    expect(detalle(j6, "documentacion")).toMatchObject({ proyecto: true, solo: ["piscina"], grupos: [{ grupo: "n", motivo: "piscina de más de 5 kW" }] });
    expect(j6.avisos.map((a) => a.id)).not.toContain("piscina-oca");
    expect(rebt.frase(j6)).toMatch(/Proyecto\.$/);

    const j11 = caso("unifamiliar", { piscina_kW: 11 });
    expect(detalle(j11, "piscina")).toMatchObject({ proyecto: true, oca: true });
    expect(j11.avisos.map((a) => a.id)).toContain("piscina-oca");
    expect(detalle(j11, "total")!.p_W).toBe(9200);
  });

  it("la piscina comunitaria suma en los servicios generales, y el aparcamiento y la piscina piden proyecto", () => {
    const sin = caso("plurifamiliar", {}, false);
    const j = caso("plurifamiliar", { piscina_kW: 7.5 });
    expect(detalle(j, "piscina")).toMatchObject({ comunitaria: true, kW: 7.5, proyecto: true });
    expect(detalle(j, "servicios")).toMatchObject({ piscina_kW: 7.5, p_W: detalle(sin, "servicios")!.p_W + 7500 });
    expect(detalle(j, "documentacion")).toMatchObject({ solo: ["aparcamiento", "piscina"] });
    expect(rebt.resultadoLista(j.elementos.find((e) => e.id === "documentacion")!)).toBe("Proyecto del aparcamiento y de la piscina (grupo g y n de la ITC-BT-04)");
    expect(textoPlanoMemoria(rebt.memoria(j))).toMatch(/la piscina comunitaria \(7,5 kW\)/);
  });

  it("la memoria: la ITC-BT-31, la potencia y el trámite; remite al anejo", () => {
    const texto = textoPlanoMemoria(rebt.memoria(caso("unifamiliar", { piscina_kW: 12 })));
    expect(texto).toMatch(/local de características especiales \(REBT art\. 11\) y cumple la ITC-BT-31/);
    expect(texto).toMatch(/se desarrolla en el anejo de instalaciones/);
    expect(texto).toMatch(/precisa proyecto \(ITC-BT-04 tabla 3\.1, grupo n\)/);
    expect(texto).toMatch(/inspección inicial por organismo de control y periódica cada 5 años \(ITC-BT-05 ap\. 4\.1 e y 4\.2\)/);
    expect(texto).toMatch(/La instalación de la piscina precisa proyecto/);
    expect(rebt.memoria(caso("unifamiliar", { piscina_kW: 12 })).fuente).toMatch(/ITC-BT-04, 05, 10, 16, 25, 31 y 52/);
  });

  it("el anejo: la tabla de zonas con su IP y las protecciones; el alumbrado del vaso solo si lo hay", () => {
    const j = caso("unifamiliar", { piscina_kW: 3 });
    const parte = anejoRebt(j).partes.find((p) => p.titulo === "Piscina (ITC-BT-31)")!;
    expect(parte.tablas![0].filas.map((f) => [f[0], f[2]])).toEqual([
      ["0", "IPX8"],
      ["1", "IPX5 (IPX4 en interiores que no se limpian con chorro)"],
      ["2", "IPX2 en interior, IPX4 en exterior, IPX5 si se limpia con chorro"],
    ]);
    const texto = textoAnejo(j);
    expect(texto).toMatch(/conexión equipotencial suplementaria local/);
    expect(texto).toMatch(/memoria técnica de diseño \(ITC-BT-04 ap\. 4/);
    expect(texto).toMatch(/locales mojados \(ITC-BT-30\)/);
    expect(texto).not.toMatch(/UNE-EN 60598-2-18/);
    expect(textoAnejo(caso("unifamiliar", { piscina_kW: 3, piscinaAlumbrado: true }))).toMatch(/alumbrado del vaso, en la zona 0, se alimenta con MBTS a 12 V/);
    expect(anejoRebt(j).fuente).toMatch(/30, 31 y 52/);
  });

  it("en un edificio existente, por la respuesta del asistente: sin responder entra (lo prudente); con «no», no", () => {
    const e = edificioDeCaso("unifamiliar");
    const ex = (piscina?: boolean) =>
      ({ edificio: e, deduccion: {}, respuestas: piscina === undefined ? {} : { piscina }, intervencion: {} }) as unknown as ProyectoSi["existente"];
    expect(detalle(caso("unifamiliar", { piscina_kW: 3 }, true, ex()), "piscina")).toMatchObject({ kW: 3 });
    expect(detalle(caso("unifamiliar", { piscina_kW: 3 }, true, ex(true)), "piscina")).toMatchObject({ kW: 3 });
    expect(detalle(caso("unifamiliar", { piscina_kW: 3 }, true, ex(false)), "piscina")).toBeUndefined();
  });

  it("el plurifamiliar existente: la piscina de la obra es carga añadida, y la memoria la justifica", () => {
    const edificio = edificioDeCaso("plurifamiliar");
    const dg = { ...demo.datosGenerales, tienePiscina: true, intervencion: "reforma" as const, alcance: { tipos: ["reforma" as const], piscina: true } };
    const existente = obraExistenteDe(dg, edificio)!;
    const j = justificarRebt({ ...rebtEstadoDefaults, piscina_kW: 7.5 }, { edificio, datosGenerales: dg, justificaciones: {}, existente });
    expect(j.existente!.despues_W - j.existente!.antes_W).toBe(7500);
    const texto = textoPlanoMemoria(rebt.memoria(j));
    expect(texto).toMatch(/cumple la ITC-BT-31/);
    expect(texto).toMatch(/La instalación de la piscina precisa proyecto, redactado y firmado/);
  });
});
