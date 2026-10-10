import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import JSZip from "jszip";
import { MAX_COLUMNAS, planificarDocx, repartirAnchos } from "../plan";
import { documentoMemoria } from "../render";
import { bloquesMemoria, memoriaCte, type BloqueMemoria } from "../../obra/memoria";
import { crearProyectoDemo } from "../../proyecto/demo";
import { ESTUDIO_VACIO, membreteDe, type Estudio } from "../../estudio/estudio";

// =============================================================================
// El Word de la memoria (feature-16 §F): el plan es puro y el render traduce.
// =============================================================================

describe("repartirAnchos", () => {
  it("porcentajes enteros que suman 100, con la etiqueta entre el 18 y el 40 %", () => {
    for (const pesos of [[5, 40, 3], [40, 1, 1, 1], [2, 2], [10, 3, 3, 3, 3, 3, 3, 3]]) {
      const a = repartirAnchos(pesos);
      expect(a.reduce((x, y) => x + y, 0)).toBe(100);
      expect(a[0]).toBeGreaterThanOrEqual(18);
      expect(a[0]).toBeLessThanOrEqual(40);
      expect(a.every(Number.isInteger)).toBe(true);
    }
    expect(repartirAnchos([7])).toEqual([100]);
    expect(repartirAnchos([])).toEqual([]);
  });
});

describe("planificarDocx", () => {
  it("cada bloque con su estilo de Word", () => {
    const bloques: BloqueMemoria[] = [
      { tipo: "titulo", nivel: 1, texto: "Memoria" },
      { tipo: "titulo", nivel: 2, texto: "Salubridad (DB-HS)" },
      { tipo: "titulo", nivel: 3, texto: "DB-HS 5 · Evacuación de aguas" },
      { tipo: "parrafo", texto: "Colector Ø110 al 2 %." },
      { tipo: "nota", texto: "HS 5 · tabla 4.5" },
      { tipo: "pendiente", texto: "Pendiente: …" },
    ];
    const plan = planificarDocx(bloques);
    expect(plan.titulo).toBe("Memoria");
    expect(plan.bloques.map((b) => (b.tipo === "parrafo" ? b.estilo : b.tipo))).toEqual([
      "Heading1",
      "Heading2",
      "Heading3",
      "Normal",
      "Caption",
      "Pendiente",
    ]);
    // El texto viaja tal cual: nada de pdfStr.
    expect(plan.bloques[3]).toMatchObject({ texto: "Colector Ø110 al 2 %." });
  });

  it("una tabla ancha se trocea repitiendo la columna 0; la cabecera en negrita", () => {
    const cabecera = Array.from({ length: 11 }, (_, i) => `C${i}`);
    const filas = [cabecera.map((_, i) => `v${i}`)];
    const plan = planificarDocx([{ tipo: "tabla", cabecera, filas }]);
    expect(plan.bloques).toHaveLength(2);
    for (const b of plan.bloques) {
      if (b.tipo !== "tabla") throw new Error("se esperaba tabla");
      expect(b.filas[0].celdas.length).toBeLessThanOrEqual(MAX_COLUMNAS);
      expect(b.filas[0].celdas[0]).toEqual({ texto: "C0", negrita: true });
      expect(b.filas[1].celdas[0]).toEqual({ texto: "v0", negrita: true });
      expect(b.filas[1].celdas[1].negrita).toBe(false);
      expect(b.anchos.reduce((x, y) => x + y, 0)).toBe(100);
    }
  });
});

describe("documentoMemoria", () => {
  it("el Demo sale como un .docx con su texto y en A4", async () => {
    const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    const doc = documentoMemoria(bloquesMemoria(memoriaCte(p)), membreteDe(ESTUDIO_VACIO, p));
    const zip = await JSZip.loadAsync(await Packer.toBuffer(doc));
    const xml = await zip.file("word/document.xml")!.async("string");
    expect(xml).toContain("3. Cumplimiento del CTE");
    expect(xml).toContain("Evacuación de aguas");
    expect(xml).toContain("Ø");
    expect(xml).toContain('w:w="11906"'); // A4
  });

  it("con la cabecera del estudio y el pie con el título y la página (feature-29)", async () => {
    const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    p.datosGenerales = { ...p.datosGenerales, documento: { titulo: "PROYECTO DE EJECUCIÓN PARA VIVIENDA" } };
    const zip = await JSZip.loadAsync(await Packer.toBuffer(documentoMemoria(bloquesMemoria(memoriaCte(p)), membreteDe(ESTUDIO, p))));
    const archivos = Object.keys(zip.files);
    const header = await zip.file(archivos.find((f) => /^word\/header\d*\.xml$/.test(f))!)!.async("string");
    expect(header).toContain("Ana Pérez, Arquitecta");
    expect(header).toContain("Colegiada nº 1 del COA Málaga");
    expect(header).toContain("C/ Larios 1, Málaga");
    expect(header).not.toContain("Luis Gil"); // sin elegir, firma la primera persona
    const footer = await zip.file(archivos.find((f) => /^word\/footer\d*\.xml$/.test(f))!)!.async("string");
    expect(footer).toContain("PROYECTO DE EJECUCIÓN PARA VIVIENDA");
    expect(footer).toContain("PAGE");
  });

  it("sin estudio, sin cabecera; el pie lleva el nombre del proyecto", async () => {
    const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    const zip = await JSZip.loadAsync(await Packer.toBuffer(documentoMemoria(bloquesMemoria(memoriaCte(p)), membreteDe(ESTUDIO_VACIO, p))));
    expect(Object.keys(zip.files).some((f) => /^word\/header/.test(f))).toBe(false);
    const footer = await zip.file(Object.keys(zip.files).find((f) => /^word\/footer\d*\.xml$/.test(f))!)!.async("string");
    expect(footer).toContain(p.nombre);
  });
});

const ESTUDIO: Estudio = {
  firmantes: [
    { id: "a", nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1 del COA Málaga" },
    { id: "b", nombre: "Luis Gil", titulacion: "Arquitecto" },
  ],
  direccion: "C/ Larios 1, Málaga",
  telefonos: "600 000 000",
};

