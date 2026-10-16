import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import JSZip from "jszip";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";
import {
  anejoInstalaciones,
  bloquesAnejoInstalaciones,
  INSTALACIONES_ANEJO,
  numeroTabla,
  textoPlanoAnejoInstalaciones,
  type AnejoInstalaciones,
  type ApartadoAnejo,
} from "../anejoInstalaciones";
import { nombreArchivo, nombreArchivoMemoria, numeroFijo } from "../memoria";
import { MAX_COLUMNAS, MAX_COLUMNAS_ANCHA, planificarDocx } from "../../docx/plan";
import { documentoMemoria } from "../../docx/render";
import { ESTUDIO_VACIO, membreteDe } from "../../estudio/estudio";

// =============================================================================
// feature-33, paso 1: el documento del anejo de instalaciones. El contenido de
// cada instalación lo dan los módulos (pasos 2 y 3); aquí, el esqueleto.
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-15T10:00:00.000Z");

/** Un apartado desarrollado, con dos partes y tres tablas, una de ellas ancha. */
function calculado(): ApartadoAnejo {
  const cab = ["Tramo", "Lr", "Lt", "Qb", "K", "Q", "Ø", "v", "J", "Pent", "Psal"];
  return {
    key: "hs4",
    numero: "5.3.1",
    titulo: "Fontanería",
    codigo: "HS4",
    norma: "DB-HS 4",
    encabezado: "5.3.1. Fontanería (DB-HS 4)",
    enMemoria: "3.4.4",
    tipo: "calculado",
    porRevisar: 0,
    doc: {
      abreviaturas: [
        ["Lr", "longitud real [m]"],
        ["Qb", "caudal bruto [l/s]"],
      ],
      partes: [
        {
          titulo: "Caudales",
          parrafos: [["Los caudales de la tabla 2.1."]],
          tablas: [{ rotulo: "Caudales por aparato", cabecera: ["Aparato", "Q"], filas: [["Lavabo", "0,10"]] }],
        },
        {
          titulo: "Camino crítico",
          parrafos: [["Del contador al grifo más desfavorable."], [{ v: "Cumple" }, " con 152 kPa."]],
          tablas: [
            { rotulo: "Camino crítico", cabecera: cab, filas: [cab.map((_, j) => `c${j}`)], ancha: true, tras: 1 },
            { cabecera: ["Tramo", "Q"], filas: [["T2", "0,2"]] },
          ],
        },
      ],
      fuente: "DB-HS · HS 4 (consolidado 14-06-2022) · tabla 2.1 · motor 0.2.0",
    },
  };
}

function conApartados(apartados: ApartadoAnejo[]): AnejoInstalaciones {
  return { titulo: "5.3. Instalaciones del edificio", proyecto: "Demo", apartados };
}

describe("anejoInstalaciones", () => {
  it("fontanería, saneamiento y electricidad, con su número fijo y su sitio en la memoria", () => {
    const a = anejoInstalaciones(demo());
    expect(a.titulo).toBe("5.3. Instalaciones del edificio");
    expect(a.apartados.map((x) => x.encabezado)).toEqual(["5.3.1. Fontanería (DB-HS 4)", "5.3.2. Saneamiento (DB-HS 5)", "5.3.3. Electricidad (REBT)"]);
    expect(a.apartados.map((x) => x.enMemoria)).toEqual(INSTALACIONES_ANEJO.map((i) => numeroFijo(i.key)));
    expect(a.apartados.map((x) => x.enMemoria)).toEqual(["3.4.4", "3.4.5", "4.1.1"]);
  });

  it("las tres instalaciones dan su cálculo extenso (el REBT desde feature-34)", () => {
    const aps = anejoInstalaciones(demo()).apartados;
    expect(aps.map((x) => x.tipo)).toEqual(["calculado", "calculado", "calculado"]);
  });

  it("lo que no cumple no entra: sale como pendiente, con sus motivos", () => {
    const p = demo();
    const a = anejoInstalaciones({ ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } });
    const hs4 = a.apartados.find((x) => x.key === "hs4")!;
    expect(hs4.tipo).toBe("no_cumple");
    const b = bloquesAnejoInstalaciones(conApartados([hs4]));
    expect(b[3]).toEqual({ tipo: "pendiente", texto: "Pendiente: HS4 aún no cumple; su cálculo entra en el anejo cuando se resuelva." });
  });
});

describe("bloquesAnejoInstalaciones", () => {
  it("abre remitiendo a los apartados de la memoria", () => {
    const b = bloquesAnejoInstalaciones(anejoInstalaciones(demo()));
    expect(b[0]).toEqual({ tipo: "titulo", nivel: 1, texto: "5.3. Instalaciones del edificio" });
    expect(b[1]).toEqual({
      tipo: "parrafo",
      texto:
        "Este anejo desarrolla el cálculo de las instalaciones del edificio que se justifican en la memoria: fontanería (apartado 3.4.4), saneamiento (3.4.5) y electricidad (4.1.1).",
    });
    expect(b.filter((x) => x.tipo === "titulo" && x.nivel === 2).map((x) => (x.tipo === "titulo" ? x.texto : ""))).toHaveLength(3);
  });

  it("un apartado desarrollado: abreviaturas una vez, partes en H3 y tablas numeradas en orden", () => {
    const b = bloquesAnejoInstalaciones(conApartados([calculado()]));
    expect(b.map((x) => (x.tipo === "tabla" ? `tabla:${x.rotulo}` : `${x.tipo}${x.tipo === "titulo" ? x.nivel : ""}:${x.texto}`))).toEqual([
      "titulo1:5.3. Instalaciones del edificio",
      expect.stringMatching(/^parrafo:Este anejo/),
      "titulo2:5.3.1. Fontanería (DB-HS 4)",
      "parrafo:Abreviaturas de las tablas: Lr, longitud real [m]; Qb, caudal bruto [l/s].",
      "titulo3:Caudales",
      "parrafo:Los caudales de la tabla 2.1.",
      "tabla:Tabla 5.3.1-1. Caudales por aparato",
      "titulo3:Camino crítico",
      "parrafo:Del contador al grifo más desfavorable.",
      "tabla:Tabla 5.3.1-2. Camino crítico",
      "parrafo:Cumple con 152 kPa.",
      "tabla:Tabla 5.3.1-3",
      "nota:DB-HS · HS 4 · tabla 2.1",
    ]);
    const ancha = b.find((x) => x.tipo === "tabla" && x.rotulo === "Tabla 5.3.1-2. Camino crítico");
    expect(ancha).toMatchObject({ ancha: true });
  });

  it("numeroTabla", () => {
    expect(numeroTabla("5.3.2", 0)).toBe("Tabla 5.3.2-1");
  });

  it("el texto plano lleva las tablas", () => {
    const t = textoPlanoAnejoInstalaciones(conApartados([calculado()]));
    expect(t).toContain("Tabla 5.3.1-1. Caudales por aparato\nAparato\tQ\nLavabo\t0,10");
  });
});

describe("la tabla ancha en el Word", () => {
  it("hasta 12 columnas no se parte; la normal sí, por encima de 8", () => {
    expect(MAX_COLUMNAS_ANCHA).toBe(12);
    const cab = Array.from({ length: 11 }, (_, j) => `C${j}`);
    const fila = cab.map((c) => c.toLowerCase());
    const ancha = planificarDocx([{ tipo: "tabla", cabecera: cab, filas: [fila], ancha: true }]).bloques;
    expect(ancha).toHaveLength(1);
    expect(ancha[0]).toMatchObject({ tipo: "tabla", ancha: true });
    if (ancha[0].tipo === "tabla") expect(ancha[0].anchos.reduce((x, y) => x + y, 0)).toBe(100);
    const normal = planificarDocx([{ tipo: "tabla", cabecera: cab, filas: [fila] }]).bloques;
    expect(normal).toHaveLength(Math.ceil((cab.length - 1) / (MAX_COLUMNAS - 1)));
  });

  it("a 7 pt, y con las propiedades del anejo", async () => {
    const p = demo();
    const doc = documentoMemoria(bloquesAnejoInstalaciones(conApartados([calculado()])), membreteDe(ESTUDIO_VACIO, p), {
      asunto: "Anejo de instalaciones del edificio",
      descripcion: "Cálculo de las instalaciones",
    });
    const zip = await JSZip.loadAsync(await Packer.toBuffer(doc));
    const xml = await zip.file("word/document.xml")!.async("string");
    const core = await zip.file("docProps/core.xml")!.async("string");
    // La celda «c10» de la tabla ancha, a 7 pt (14 medios puntos).
    expect(xml).toMatch(/<w:sz w:val="14"\/>(?:(?!<w:t).)*<w:t[^>]*>c10<\/w:t>/s);
    expect(core).toContain("Anejo de instalaciones del edificio · ");
    expect(core).toContain("Cálculo de las instalaciones");
  });
});

describe("nombreArchivo", () => {
  it("el de la memoria no cambia; el anejo con su prefijo", () => {
    expect(nombreArchivoMemoria("Viviendas y local · C/ Mayor 12", "pdf")).toBe("memoria-cte-viviendas-y-local-c-mayor-12.pdf");
    expect(nombreArchivo("anejo-instalaciones", "Vivienda en Benalmádena", "docx")).toBe("anejo-instalaciones-vivienda-en-benalmadena.docx");
  });
});
