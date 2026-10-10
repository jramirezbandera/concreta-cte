import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TuEstudio } from "../TuEstudio";
import { CLAVE_ESTUDIO, leerEstudio } from "../../../lib/estudio/estudio";

// =============================================================================
// «Tu estudio» en Inicio (feature-29): se rellena, se guarda en el navegador
// y se resume.
// =============================================================================

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("TuEstudio", () => {
  it("sin datos invita a añadirlos; se guardan y se resumen", async () => {
    const user = userEvent.setup();
    render(<TuEstudio />);
    expect(screen.getByText(/va a la cabecera de la memoria/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Añadir" }));
    await user.type(screen.getByLabelText("Nombre"), "Ana Pérez");
    await user.type(screen.getByLabelText("Titulación"), "Arquitecta");
    await user.type(screen.getByLabelText("Colegiación, como debe salir"), "Colegiada nº 1 del COA Málaga");
    await user.type(screen.getByLabelText("Teléfonos"), "600 000 000");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    const guardado = leerEstudio();
    expect(guardado.firmantes).toMatchObject([{ nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1 del COA Málaga" }]);
    expect(guardado.telefonos).toBe("600 000 000");
    expect(localStorage.getItem(CLAVE_ESTUDIO)).not.toBeNull();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("una persona sin nombre no se guarda", async () => {
    const user = userEvent.setup();
    render(<TuEstudio />);
    await user.click(screen.getByRole("button", { name: "Añadir" }));
    await user.type(screen.getByLabelText("Titulación"), "Arquitecto");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(leerEstudio().firmantes).toEqual([]);
  });
});
