import { describe, it, expect } from "vitest";
import { justificacionRegistry } from "../../../data/justificacionRegistry";
import { cuadroInicial, fuenteCorta, memoriaCte, numeroFijo, SECCIONES, sinSupuestos, textoPlanoMemoriaCte, type MemoriaCte } from "../memoria";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import { crearProyectoDemoConSupuestos } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";
import { ESTUDIO_VACIO, firmantesDe, membreteDe, parseEstudio, type Estudio } from "../../estudio/estudio";

// =============================================================================
// feature-29: el esqueleto del documento. Cada justificación tiene su sitio
// numerado, y la línea de fuente de la memoria se queda con la cita.
// =============================================================================

describe("las secciones del documento", () => {
  it("toda justificación del expediente tiene su sitio, una sola vez", () => {
    const enDocumento = SECCIONES.flatMap((s) => s.keys);
    const delRegistry = justificacionRegistry.filter((e) => !e.dev).map((e) => e.key);
    expect([...enDocumento].sort()).toEqual([...delRegistry].sort());
    expect(new Set(enDocumento).size).toBe(enDocumento.length);
  });

  it("numeradas en orden dentro de cada capítulo", () => {
    for (const cap of [3, 4] as const) {
      const nums = SECCIONES.filter((s) => s.capitulo === cap).map((s) => s.numero);
      expect(nums).toEqual(nums.map((_, i) => `${cap}.${i + 1}`));
    }
  });
});

describe("fuenteCorta", () => {
  it("quita la versión consolidada, «datos de…» y el motor", () => {
    expect(fuenteCorta("DB-HS · HS 1 (consolidado 14-06-2022) · tablas 2.1 y 2.2 · datos de El edificio y de la obra · motor 0.2.0")).toBe(
      "DB-HS · HS 1 · tablas 2.1 y 2.2",
    );
    expect(fuenteCorta("DB-HS · HS 6 (RD 732/2019, consolidado 14-06-2022) · ap. 2 · apéndice B · motor 0.2.0")).toBe(
      "DB-HS · HS 6 · ap. 2 · apéndice B",
    );
    expect(fuenteCorta("REBT (RD 842/2002), consolidado BOE 03-09-2025 · ITC-BT-04, 10, 16, 25 y 52 · motor 0.2.0")).toBe(
      "REBT (RD 842/2002) · ITC-BT-04, 10, 16, 25 y 52",
    );
  });

  it("deja lo que no es versión: fechas de comentarios y del Catálogo", () => {
    const f = "DB-SUA · SUA 9 · comentarios del Ministerio (15-jul-2024, no reglamentarios) · CEC (marzo 2010)";
    expect(fuenteCorta(f)).toBe(f);
  });
});

// ─── El cuadro inicial y la numeración fija (pasos 1 y 2) ──────────────────────

function deCaso(caso: CasoEdificio): Proyecto {
  const p: Proyecto = { ...crearProyectoDemoConSupuestos("2026-10-10T10:00:00.000Z"), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}) };
  return p;
}

const tablas = (m: MemoriaCte) => cuadroInicial(m).flatMap((b) => (b.tipo === "tabla" ? [b.filas] : []));

describe("el cuadro inicial", () => {
  it("en la reforma: el tipo de obra y la numeración fija", () => {
    const m = memoriaCte(deCaso("reforma_local_vivienda"));
    const [obra, cuadro] = tablas(m);
    expect(obra).toEqual([["—", "Cambio de uso y reforma", "Parcial", "Sí, de una parte del edificio"]]);
    // Desde feature-30 SUA 1 se redacta también en la reforma, en su sitio.
    expect(cuadro).toContainEqual(["SUA 1 Seguridad frente al riesgo de caídas", "A lo intervenido", "3.3.1"]);
    expect(m.pendientes).toEqual([]);
    expect(cuadro).toContainEqual(["SUA 2 Seguridad frente al riesgo de impacto o de atrapamiento", "A lo intervenido", "3.3.2"]);
    expect(m.apartados.find((a) => a.key === "sua2")!.encabezado).toMatch(/^3\.3\.2\. /);
    expect(cuadro).toContainEqual(["Protección frente al ruido DB HR", "A lo intervenido", "3.5"]);
  });

  it("en obra nueva, con la fase del documento", () => {
    const p = deCaso("unifamiliar");
    p.datosGenerales = { ...p.datosGenerales, documento: { fase: "ejecucion" } };
    const [obra, cuadro] = tablas(memoriaCte(p));
    expect(obra).toEqual([["Proyecto de ejecución", "Obra nueva", "No procede", "No"]]);
    expect(cuadro[0]).toEqual(["Seguridad estructural DB SE", "Con Concreta estructura", "3.1"]);
  });

  it("el número fijo de cada justificación", () => {
    expect(numeroFijo("si1")).toBe("3.2.1");
    expect(numeroFijo("sua9")).toBe("3.3.9");
    expect(numeroFijo("hr")).toBe("3.5");
    expect(numeroFijo("rebt")).toBe("4.1.1");
  });
});

// ─── Los datos del estudio y el membrete (pasos 4 y 5) ─────────────────────────

describe("el estudio", () => {
  const ana = { id: "a", nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1 del COA Málaga" };
  const luis = { id: "b", nombre: "Luis Gil", titulacion: "Arquitecto" };
  const marta = { id: "c", nombre: "Marta Ruiz", titulacion: "Arquitecta técnica" };
  const estudio: Estudio = { firmantes: [ana, luis, marta], direccion: "C/ Larios 1, Málaga", telefonos: "600 000 000", correo: "a@b.es" };
  const conFirma = (firmantes?: string[]) => ({ nombre: "Casa", datosGenerales: { documento: firmantes ? { firmantes } : {} } }) as unknown as Proyecto;

  it("se lee con cautela: lo que no tiene forma se descarta", () => {
    expect(parseEstudio(null)).toEqual({ firmantes: [] });
    expect(parseEstudio({ firmantes: [{ id: "x" }, { id: "y", nombre: "  Eva  ", titulacion: 3 }, "z"], direccion: " " })).toEqual({
      firmantes: [{ id: "y", nombre: "Eva", titulacion: "" }],
    });
  });

  it("firma la primera persona si no se elige; como mucho dos; los que ya no están, fuera", () => {
    expect(firmantesDe(estudio, conFirma()).map((f) => f.id)).toEqual(["a"]);
    expect(firmantesDe(estudio, conFirma(["c", "b"])).map((f) => f.id)).toEqual(["c", "b"]);
    expect(firmantesDe(estudio, conFirma(["a", "b", "c"]))).toHaveLength(2);
    expect(firmantesDe(estudio, conFirma(["borrado"])).map((f) => f.id)).toEqual(["a"]);
    expect(firmantesDe({ firmantes: [] }, conFirma())).toEqual([]);
  });

  it("el membrete: una fila por firmante, la del contacto, y el pie", () => {
    const m = membreteDe(estudio, conFirma(["a", "b"]));
    expect(m.cabecera).toEqual([
      ["Ana Pérez, Arquitecta", "Colegiada nº 1 del COA Málaga"],
      ["Luis Gil, Arquitecto", ""],
      ["C/ Larios 1, Málaga", "Tlf: 600 000 000 · a@b.es"],
    ]);
    expect(m.pie).toBe("Casa");
    const conTitulo = { nombre: "Casa", datosGenerales: { documento: { titulo: " PROYECTO DE EJECUCIÓN " } } } as unknown as Proyecto;
    expect(membreteDe(ESTUDIO_VACIO, conTitulo)).toEqual({ cabecera: [], pie: "PROYECTO DE EJECUCIÓN", proyecto: "Casa" });
  });
});

// ─── Lo supuesto fuera del texto (paso 7) ──────────────────────────────────────

describe("sinSupuestos", () => {
  it("quita las marcas de lo supuesto y las coletillas «a falta de…»", () => {
    expect(sinSupuestos("forman un sector de 655 m² (supuestos)")).toBe("forman un sector de 655 m²");
    expect(sinSupuestos("de 504 m² construidos (supuestos a partir de la superficie útil)")).toBe("de 504 m² construidos");
    expect(sinSupuestos("zona pluviométrica de promedios I (supuesta, del lado de la seguridad) y")).toBe("zona pluviométrica de promedios I y");
    expect(sinSupuestos("La presión de la red es de 250 kPa (supuesta: no consta el dato de la compañía).")).toBe("La presión de la red es de 250 kPa.");
    expect(sinSupuestos("planta de 14,5 m × 14,5 m (supuesta cuadrada, con la superficie de la cubierta) y")).toBe("planta de 14,5 m × 14,5 m y");
    expect(sinSupuestos("recirculación del 10 % (estimación), se recoge")).toBe("recirculación del 10 %, se recoge");
    expect(sinSupuestos("de 100 mm/h, a falta de la del emplazamiento, por debajo")).toBe("de 100 mm/h, por debajo");
    expect(sinSupuestos("el mayor valor del mapa de la figura 1.1, a falta del leído para el municipio; una")).toBe("el mayor valor del mapa de la figura 1.1; una");
  });

  it("deja lo que no es una marca: «supuestos» de la norma y el Ld por defecto del DB-HR", () => {
    const he6 = "no está en ninguno de los supuestos de edificios existentes de la Sección";
    expect(sinSupuestos(he6)).toBe(he6);
    const hr = "Ld = 60 dBA (valor por defecto del DB para áreas de predominio residencial, a falta de datos oficiales).";
    expect(sinSupuestos(hr)).toBe(hr);
  });

  it("en la memoria de los casos no queda ninguna marca", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas", "reforma_local_vivienda"] as CasoEdificio[]) {
      const t = textoPlanoMemoriaCte(memoriaCte(deCaso(c)));
      expect(t).not.toMatch(/\(supuest|\(estimación\)|a falta de la del emplazamiento|a falta del leído/);
    }
  });
});
