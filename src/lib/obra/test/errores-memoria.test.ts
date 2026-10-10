import { describe, it, expect } from "vitest";
import { memoriaCte, normaLegible, textoPlanoMemoriaCte } from "../memoria";
import { evaluarExpediente } from "../evaluar";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import { crearProyectoDemo } from "../../proyecto/demo";
import { HE1_SIN_K, juntarNotas, propuestaExistente, sinContenidas } from "../../proyecto/reglasExistentes";
import type { Proyecto } from "../../proyecto/tipos";
import { delCuarto } from "../../../modules/hs4/textos";

// =============================================================================
// feature-28, fase 1 de PLAN-MEMORIA: los errores que salían impresos en la
// memoria de los casos de partida, sobre todo en «Reforma: local a vivienda».
// =============================================================================

function deCaso(caso: CasoEdificio): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo("2026-10-10T10:00:00.000Z"), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}) };
  return p;
}

const texto = (p: Proyecto): string => textoPlanoMemoriaCte(memoriaCte(p));

describe("la reforma de local a vivienda", () => {
  const p = deCaso("reforma_local_vivienda");
  const t = texto(p);

  it("HR no dice que está excluido cuando se aplica a la zona que cambia de uso", () => {
    expect(evaluarExpediente(p).porClave.hr?.aplicabilidad).toBe("aplica_reformado");
    expect(t).toContain("DB-HR Protección frente al ruido: se aplica a la zona que cambia de uso a vivienda.");
    expect(t).not.toContain("queda excluida del ámbito del DB-HR");
    expect(t).toContain("En la parte a la que se aplica, se justifica mediante la opción simplificada (ap. 3.1.2)");
  });

  it("las notas de alcance no repiten el sujeto", () => {
    expect(t).not.toMatch(/(SI \d [A-Za-zÁÉÍÓÚáéíóúñ ]+): [^\n]*\1: /);
    expect(t).toContain("SI 2 Propagación exterior: se aplica a la zona que se transforma en uso Residencial Vivienda;");
    expect(t).toContain("Además, se aplica a los elementos modificados por la reforma");
  });

  it("HE 1 va con la global, sin la frase de la reforma que dice que no se verifica K", () => {
    const he1 = evaluarExpediente(p).porClave.he1!;
    expect(he1.aplicabilidad).toBe("externo");
    expect(he1.nota).not.toContain(HE1_SIN_K.trim());
    expect(t).toContain("en el mismo documento que la verificación energética global.");
    // La nota de alcance de la global (K, control solar y HE 0) sale en la memoria.
    expect(t).toContain("DB-HE 0 y verificación global del HE 1: el coeficiente global K y el control solar se verifican");
  });

  it("el REBT no suma la recarga si HE 6 no se aplica a la obra", () => {
    expect(evaluarExpediente(p).porClave.he6?.aplicabilidad).toBe("no_aplica");
    expect(t).not.toContain("Recarga del vehículo eléctrico\t");
    expect(t).not.toContain("reserva para la recarga");
  });

  it("sin cifras a cero en SI 3 ni en SUA 9", () => {
    expect(t).not.toContain("las 0 que la usan");
    expect(t).not.toContain("salvar 0 plantas");
    expect(t).not.toContain("hay 0 viviendas");
  });
});

describe("la unifamiliar", () => {
  const t = texto(deCaso("unifamiliar"));

  it("sin «del cocina», «Vivienda U» ni «en cada unidad»", () => {
    expect(t).not.toContain("del cocina");
    expect(t).toContain("de la cocina");
    expect(t).not.toMatch(/^Vivienda U\t/m);
    expect(t).not.toContain("en cada unidad");
  });

  it("obra nueva: el REBT sigue sumando la recarga del garaje", () => {
    const pl = texto(deCaso("plurifamiliar"));
    expect(pl).toContain("Recarga del vehículo eléctrico\t");
  });
});

describe("rótulos", () => {
  it("con el espacio de los redactados", () => {
    expect(normaLegible("DB-HS2")).toBe("DB-HS 2");
    expect(normaLegible("DB-SUA5")).toBe("DB-SUA 5");
    expect(normaLegible("DB-HE0 / DB-HE1")).toBe("DB-HE 0 / DB-HE 1");
    expect(normaLegible("DB-HR")).toBe("DB-HR");
    expect(normaLegible("REBT ITC-BT-10")).toBe("REBT ITC-BT-10");
  });

  it("ningún apartado de la memoria sale sin espacio", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "reforma_local_vivienda"] as CasoEdificio[]) {
      expect(texto(deCaso(c))).not.toMatch(/^DB-[A-Z]+\d/m);
    }
  });
});

describe("notas y citas de varios casos de obra", () => {
  it("juntarNotas quita el sujeto repetido", () => {
    expect(juntarNotas(["X: se aplica a A.", "X: se aplica a B.", "Otra cosa."])).toEqual([
      "X: se aplica a A.",
      "Además, se aplica a B.",
      "Otra cosa.",
    ]);
    expect(juntarNotas(["Sin sujeto."])).toEqual(["Sin sujeto."]);
  });

  it("sinContenidas quita la cita que ya está en otra", () => {
    expect(sinContenidas(["DB-HE 1, ámbito de aplicación", "DB-HE 1, ámbito de aplicación y ap. 3.1.1 pto 2"])).toEqual([
      "DB-HE 1, ámbito de aplicación y ap. 3.1.1 pto 2",
    ]);
  });
});

describe("HE 0 en el cambio de uso característico (K-MEM.1)", () => {
  const ctx = (util: number) =>
    ({
      alcance: { tipos: ["cambio_uso"], cambioUsoCaracteristico: true },
      edificio: { utilCambioUso_m2: util },
    }) as unknown as Parameters<typeof propuestaExistente>[2];

  it("con 50 m² útiles o menos que cambian de uso, sin HE 0", () => {
    const n = propuestaExistente("he0he1_global", ["cambio_uso_caracteristico"], ctx(45))!.nota;
    expect(n).not.toContain("HE 0 ap. 1");
  });

  it("con más de 50 m², con HE 0; sin zonas marcadas, del lado prudente", () => {
    expect(propuestaExistente("he0he1_global", ["cambio_uso_caracteristico"], ctx(80))!.nota).toContain("HE 0 ap. 1");
    expect(propuestaExistente("he0he1_global", ["cambio_uso_caracteristico"], ctx(0))!.nota).toContain("HE 0 ap. 1");
  });
});

describe("delCuarto", () => {
  it("concuerda el artículo", () => {
    expect(delCuarto("Cocina")).toBe("de la cocina");
    expect(delCuarto("Baño 1")).toBe("del baño 1");
    expect(delCuarto("Aseo")).toBe("del aseo");
  });
});
