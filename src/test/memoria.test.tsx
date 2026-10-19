import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// La memoria CTE (feature-16 §E) sobre el router real: la barra lateral lleva a
// ella con su recuento y la página enseña los apartados redactados del Demo.
// Un solo router por archivo (ver rutas.test.tsx).
// =============================================================================

async function renderApp(hash: string) {
  window.location.hash = hash;
  vi.resetModules();
  const { App } = await import("../App");
  return render(<App />);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
});

describe("«/p/demo/memoria»", () => {
  it("los apartados del Demo y el «no aplica»; «Copiar todo» copia el texto", async () => {
    inicializarStorage("2026-10-04T10:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/memoria`);

    expect(await screen.findByRole("heading", { level: 1, name: "Cumplimiento del CTE" }, { timeout: 20000 })).toBeInTheDocument();
    expect(screen.getByText("29 de 29 apartados listos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.4.5. HS 5 Evacuación de aguas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.3.6. SUA 6 Seguridad frente al riesgo de ahogamiento" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.4.1. HS 1 Protección frente a la humedad" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.2.1. SI 1 Propagación interior" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.4.2. HS 2 Recogida y evacuación de residuos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.6.4. HE 4 Contribución mínima de energía renovable para cubrir la demanda de agua caliente sanitaria" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.6.5. HE 5 Generación mínima de energía eléctrica procedente de fuentes renovables" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.6.6. HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.6.3. HE 3 Condiciones de las instalaciones de iluminación" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4.1.1. ITC-BT-10 Grado de electrificación y previsión de cargas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3.5. Protección frente al ruido DB HR" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4.2. Habitabilidad" })).toBeInTheDocument();
    // Desde feature-25 (HR) no queda nada por redactar.
    expect(screen.queryByText(/Aún sin redactar/)).toBeNull();
    expect(screen.getByRole("link", { name: /Memoria CTE/ })).toHaveTextContent("29/29");

    // user-event pone su propio portapapeles: se espía después de crearlo.
    const user = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: "Copiar todo" }));
    expect(escribir).toHaveBeenCalledTimes(1);
    expect(escribir.mock.calls[0][0]).toMatch(/^3\. Cumplimiento del CTE\n\n/);
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
  });
});
