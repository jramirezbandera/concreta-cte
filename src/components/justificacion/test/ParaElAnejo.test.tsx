import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampoNumeroOpcional, CampoPlanos, ParaElAnejo } from "../ParaElAnejo";

// =============================================================================
// «Para el anejo» (feature-33, paso 4): los planos y los datos opcionales se
// escriben a mano, se confirman al salir o con Enter y vacíos quedan sin dato.
// =============================================================================

beforeEach(() => cleanup());

describe("CampoPlanos", () => {
  it("confirma con Enter, recortado; vacío es sin dato", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ParaElAnejo>
        <CampoPlanos id="p" valor="I05" onChange={onChange} ayuda="Ayuda" />
      </ParaElAnejo>,
    );
    expect(screen.getByRole("region", { name: "Para el anejo" })).toBeInTheDocument();
    const input = screen.getByLabelText("Planos");
    await user.clear(input);
    await user.type(input, "  I05–I07 {Enter}");
    expect(onChange).toHaveBeenLastCalledWith("I05–I07");
    await user.clear(input);
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("Escape deshace", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoPlanos id="p" valor="I05" onChange={onChange} ayuda="Ayuda" />);
    const input = screen.getByLabelText("Planos");
    await user.type(input, "X{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("I05");
  });
});

describe("CampoNumeroOpcional", () => {
  it("lee la coma decimal, rechaza lo que no es un número positivo y vacío es sin dato", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoNumeroOpcional id="n" etiqueta="Ida del ACS" valor={undefined} unidad="m" onChange={onChange} ayuda="Ayuda" />);
    const input = screen.getByLabelText("Ida del ACS");
    await user.type(input, "17,5{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(17.5);
    onChange.mockClear();
    await user.clear(input);
    await user.type(input, "abc{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("borrar un valor lo deja sin dato", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoNumeroOpcional id="n" etiqueta="Ø del contador" valor={25} unidad="mm" onChange={onChange} ayuda="Ayuda" />);
    const input = screen.getByLabelText("Ø del contador");
    expect(input).toHaveValue("25");
    await user.clear(input);
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
