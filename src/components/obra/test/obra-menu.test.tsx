import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import { ProyectoProvider } from "../../../lib/proyecto/ProyectoContext";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { cargarProyecto, guardarProyecto, importarProyecto, listarProyectos } from "../../../lib/proyecto/storage";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { ObraMenu } from "../../layout/ObraMenu";

// =============================================================================
// El menú de obra de la barra lateral: guardar, exportar, duplicar y recientes
// sin salir del expediente.
// =============================================================================

const descargas = vi.hoisted(() => [] as { blob: Blob; nombre: string }[]);
vi.mock("../../../lib/export/descargar", () => ({
  descargarBlob: (blob: Blob, nombre: string) => descargas.push({ blob, nombre }),
}));

function Donde() {
  const { id } = useParams();
  return <p data-testid="ruta">{id}</p>;
}

function montar(p: Proyecto) {
  return render(
    <MemoryRouter initialEntries={[`/p/${p.id}`]}>
      <Routes>
        <Route
          path="/p/:id"
          element={
            <ProyectoProvider proyectoInicial={p}>
              <ObraMenu onNavegar={() => {}} />
              <Donde />
            </ProyectoProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  descargas.length = 0;
});
afterEach(() => cleanup());

describe("ObraMenu", () => {
  it("enseña las funciones básicas y las obras recientes", async () => {
    const user = userEvent.setup();
    const demo = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    const otra = { ...demo, id: "otra", nombre: "Local C/ Ancha 3", modificado: "2026-10-05T10:00:00.000Z" };
    guardarProyecto(demo);
    guardarProyecto(otra);
    montar(demo);

    await user.click(screen.getByRole("button", { name: /Menú de obra/ }));
    for (const n of ["Nueva obra…", "Datos de la obra…", "Duplicar esta obra", "Guardar", "Exportar .json", "Importar .json…"]) {
      expect(screen.getByRole("menuitem", { name: n })).toBeInTheDocument();
    }
    // La última editada primero; la abierta, marcada y sin papelera.
    const otraItem = screen.getByRole("menuitem", { name: /Local C\/ Ancha 3/ });
    const actual = screen.getByRole("menuitem", { current: true });
    expect(actual).toHaveAttribute("title", demo.nombre);
    expect(otraItem.compareDocumentPosition(actual) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Borrar Local C/ Ancha 3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Borrar ${demo.nombre}` })).not.toBeInTheDocument();
  });

  it("exporta un .json que se vuelve a importar", async () => {
    const user = userEvent.setup();
    const demo = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    guardarProyecto(demo);
    montar(demo);

    await user.click(screen.getByRole("button", { name: /Menú de obra/ }));
    await user.click(screen.getByRole("menuitem", { name: "Exportar .json" }));

    expect(descargas).toHaveLength(1);
    expect(descargas[0].nombre).toBe("concreta-proyecto-demo-vivienda-c-mayor-12.json");
    const res = importarProyecto(await descargas[0].blob.text());
    expect(res.ok && res.proyecto.id).toBe(demo.id);
  });

  it("duplica la obra y abre la copia", async () => {
    const user = userEvent.setup();
    const demo = crearProyectoDemo("2026-10-04T10:00:00.000Z");
    guardarProyecto(demo);
    montar(demo);

    await user.click(screen.getByRole("button", { name: /Menú de obra/ }));
    await user.click(screen.getByRole("menuitem", { name: "Duplicar esta obra" }));

    const copia = listarProyectos().find((p) => p.id !== demo.id);
    expect(copia?.nombre).toBe(`${demo.nombre} (copia)`);
    expect(screen.getByTestId("ruta")).toHaveTextContent(copia!.id);
    expect(cargarProyecto(demo.id)).not.toBeNull();
  });
});
