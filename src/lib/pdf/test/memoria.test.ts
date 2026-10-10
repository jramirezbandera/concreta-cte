import { describe, expect, it } from "vitest";
import { componerMemoriaPdf, renderMemoriaPdf } from "../memoria";
import { bloquesMemoria, memoriaCte, nombreArchivoMemoria } from "../../obra/memoria";
import { crearProyectoDemo } from "../../proyecto/demo";
import { ESTUDIO_VACIO, membreteDe } from "../../estudio/estudio";

// =============================================================================
// La memoria CTE en PDF (feature-16 §F).
// =============================================================================

describe("renderMemoriaPdf", () => {
  const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");
  const bloques = bloquesMemoria(memoriaCte(p));
  const membrete = membreteDe(
    { firmantes: [{ id: "a", nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1 del COA Málaga" }] },
    p,
  );

  it("pagina el Demo con su nombre de fichero", () => {
    const r = renderMemoriaPdf(bloques, membreteDe(ESTUDIO_VACIO, p));
    expect(r.filename).toBe("memoria-cte-demo-vivienda-c-mayor-12.pdf");
    expect(r.pageCount).toBeGreaterThanOrEqual(2);
  });

  it("escribe los títulos, y la cabecera del estudio y el pie con la página en cada hoja (feature-29)", () => {
    const doc = componerMemoriaPdf(bloques, membrete);
    const crudo = doc.output();
    const n = doc.getNumberOfPages();
    expect(crudo).toContain("(3. Cumplimiento del CTE)");
    expect(crudo).toContain("(3.4. Salubridad DB HS)");
    expect(crudo.match(/\(Ana P/g)).toHaveLength(n);
    expect(crudo).toContain(`(Página ${n})`);
    expect(crudo).not.toContain("(Motor v");
  });

  it("nombre de fichero sin acentos ni símbolos", () => {
    expect(nombreArchivoMemoria("Viviendas y local · C/ Mayor 12", "docx")).toBe("memoria-cte-viviendas-y-local-c-mayor-12.docx");
  });
});
