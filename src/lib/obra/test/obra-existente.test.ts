import { describe, it, expect } from "vitest";
import { memoriaCte, textoPlanoMemoriaCte } from "../memoria";
import { evaluarExpediente } from "../evaluar";
import { edificioDeCaso } from "../../edificio/casos";
import { edificioAntes, obraDeCaso, obraExistenteDe } from "../../proyecto/alcance";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";

// =============================================================================
// feature-30, fase 3 de PLAN-MEMORIA: en una obra en un edificio existente, cada
// apartado dice qué se proyecta y qué existe y no se modifica.
// =============================================================================

function reforma(): Proyecto {
  const p: Proyecto = {
    ...crearProyectoDemo("2026-10-10T10:00:00.000Z"),
    edificio: edificioDeCaso("reforma_local_vivienda"),
    justificaciones: {},
  };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}) };
  return p;
}

const texto = (p: Proyecto): string => textoPlanoMemoriaCte(memoriaCte(p));

/** El texto de un apartado: desde su título hasta el siguiente. */
function apartado(t: string, titulo: string): string {
  const i = t.indexOf(titulo);
  if (i < 0) throw new Error(`no está «${titulo}»`);
  const resto = t.slice(i + titulo.length);
  const fin = resto.search(/\n\n\d+\.\d+(\.\d+)?\. /);
  return fin < 0 ? resto : resto.slice(0, fin);
}

describe("el edificio antes de la obra", () => {
  it("la parte del local que pasa a vivienda vuelve al local del que se segrega", () => {
    const p = reforma();
    const antes = edificioAntes(obraExistenteDe(p.datosGenerales, p.edificio)!);
    const pb = antes.grupos.find((g) => g.nivelInicial === 0)!;
    const locales = pb.zonas.filter((z) => z.uso === "local_sin_uso");
    expect(locales).toHaveLength(1);
    expect(locales[0].superficieUtil_m2).toBe(160);
    expect(pb.zonas.some((z) => z.uso === "viviendas")).toBe(false);
  });

  it("sin asistente respondido no hay contexto de lo existente", () => {
    const p = reforma();
    expect(obraExistenteDe({ ...p.datosGenerales, alcance: undefined }, p.edificio)).toBeUndefined();
    expect(obraExistenteDe({ ...p.datosGenerales, intervencion: "obra_nueva" }, p.edificio)).toBeUndefined();
  });
});

describe("instalaciones (paso 2)", () => {
  const t = texto(reforma());

  it("HS 4: el contador se añade a la batería existente", () => {
    const hs4 = apartado(t, "3.4.4. HS 4 Suministro de agua");
    expect(hs4).not.toContain("batería de 2 contadores");
    expect(hs4).toContain("se abastece de la batería de contadores existente");
    expect(hs4).toContain("que pasa a tener 9 contadores");
    expect(hs4).toContain("La acometida y el tubo de alimentación existentes no se modifican.");
    expect(hs4).not.toContain("se justifica con HE 4");
  });

  it("HS 5: acomete a la red existente y las pluviales no se tocan", () => {
    const hs5 = apartado(t, "3.4.5. HS 5 Evacuación de aguas");
    expect(hs5).toContain("Acomete al colector general existente, que con la obra hecha recibe 158 UD, 23 de ellas de lo intervenido.");
    expect(hs5).toContain("la red de pluviales existente, que no se modifica");
    expect(hs5).not.toContain("La cubierta, de 210 m²");
    expect(hs5).not.toContain("sotano");
    expect(evaluarExpediente(reforma()).porClave.hs5?.avisos.map((a) => a.id)).toContain("red-existente-sin-dato");
  });

  it("HS 5: con el Ø del colector existente, comprueba que admite lo que recibe", () => {
    const con = (mm: number): Proyecto => ({ ...reforma(), justificaciones: { hs5: { inputs: { redExistente_mm: mm, redExistentePendiente_pct: 2 } } } });
    expect(evaluarExpediente(con(90)).porClave.hs5!.estado).toBe("no_cumple");
    const p = con(125);
    const ok = evaluarExpediente(p).porClave.hs5!;
    expect(ok.estado).not.toBe("no_cumple");
    expect(apartado(texto(p), "3.4.5. HS 5 Evacuación de aguas")).toContain("que admite 480 UD (tabla 4.5): no hay que modificarlo.");
  });

  it("REBT: la vivienda nueva y la carga del edificio antes y después", () => {
    const rebt = apartado(t, "4.1.1. ITC-BT-10");
    expect(rebt).toContain("La vivienda nueva (del tipo A, de 90 m² útiles)");
    expect(rebt).toContain("la centralización pasa a tener 9 contadores");
    expect(rebt).toContain("la carga prevista del edificio no aumenta: pasa de 85,9 kW a 84,2 kW");
    expect(rebt).not.toContain("Las 7 viviendas");
    expect(rebt).not.toContain("precisa proyecto");
  });
});
