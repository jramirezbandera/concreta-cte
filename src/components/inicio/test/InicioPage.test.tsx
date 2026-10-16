import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "../../../lib/theme/ThemeProvider";
import { InicioPage } from "../../../pages/InicioPage";
import { DEMO_ID, DEMO_NOMBRE } from "../../../lib/proyecto/demo";
import { cargarProyecto } from "../../../lib/proyecto/storage";

// =============================================================================
// Inicio: busca, borra con «Deshacer» y cambia a la vista de lista.
// =============================================================================

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function montar() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <InicioPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("InicioPage", () => {
  it("la búsqueda filtra y se puede volver a ver todo", async () => {
    const user = userEvent.setup();
    montar();
    expect(screen.getByText(DEMO_NOMBRE)).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: /Buscar proyectos/ }), "Bilbao");
    expect(screen.queryByText(DEMO_NOMBRE)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ver todos los proyectos" }));
    expect(screen.getByText(DEMO_NOMBRE)).toBeInTheDocument();
  });

  it("eliminar se deshace desde el aviso", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("button", { name: `Acciones del proyecto ${DEMO_NOMBRE}` }));
    await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    expect(screen.queryByText(DEMO_NOMBRE)).not.toBeInTheDocument();
    expect(cargarProyecto(DEMO_ID)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(screen.getByText(DEMO_NOMBRE)).toBeInTheDocument();
    expect(cargarProyecto(DEMO_ID)?.nombre).toBe(DEMO_NOMBRE);
  });

  it("el menú se recorre con el teclado y Escape lo cierra", async () => {
    const user = userEvent.setup();
    montar();
    const boton = screen.getByRole("button", { name: `Acciones del proyecto ${DEMO_NOMBRE}` });
    await user.click(boton);
    expect(screen.getByRole("menuitem", { name: "Abrir" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicar" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });

  it("la vista de lista se recuerda", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("button", { name: "Ver en lista" }));
    expect(screen.getByRole("list", { name: "Lista de proyectos" })).toBeInTheDocument();
    cleanup();
    montar();
    expect(screen.getByRole("list", { name: "Lista de proyectos" })).toBeInTheDocument();
  });
});
