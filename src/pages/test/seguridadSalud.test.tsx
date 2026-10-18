import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProyectoProvider, useProyecto } from "../../lib/proyecto/ProyectoContext";
import { ThemeProvider } from "../../lib/theme/ThemeProvider";
import { crearProyectoDemo } from "../../lib/proyecto/demo";
import { edificioDeCaso } from "../../lib/edificio/casos";
import { obraDeCaso } from "../../lib/proyecto/alcance";
import type { Proyecto } from "../../lib/proyecto/tipos";
import { SeguridadSaludPage } from "../SeguridadSaludPage";
import { EstudioBasicoPage } from "../EstudioBasicoPage";
import { LoQueSeEntrega } from "../../components/obra/LoQueSeEntrega";
import { AntesDeEntregar } from "../../components/obra/AntesDeEntregar";

// =============================================================================
// feature-35, paso 6: la pantalla «Seguridad y salud», la página Leer del
// estudio básico y su fila en Lo que se entrega.
// =============================================================================

const AHORA = "2026-10-18T10:00:00.000Z";

function reforma(): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}), documento: { promotor: "Promotora Ejemplo" } };
  return p;
}

/** Lo que guarda el proyecto, para leerlo en el test. */
function Sonda(): React.ReactNode {
  const { proyecto } = useProyecto();
  return <output data-testid="ss">{JSON.stringify(proyecto.seguridadSalud ?? null)}</output>;
}
const guardado = () => JSON.parse(screen.getByTestId("ss").textContent ?? "null");

function montar(ui: React.ReactNode, proyecto: Proyecto = reforma()) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <ProyectoProvider proyectoInicial={proyecto} persistir={false}>
          {ui}
          <Sonda />
        </ProyectoProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

afterEach(() => cleanup());

async function escribir(user: ReturnType<typeof userEvent.setup>, id: string, texto: string) {
  const el = document.getElementById(id) as HTMLInputElement;
  await user.clear(el);
  await user.type(el, `${texto}{Enter}`);
}

const TUNELES = "Túneles, galerías, conducciones subterráneas o presas";
const HUECOS = "Apertura de huecos en muros de carga, recalces y refuerzos de cimentación";

describe("Seguridad y salud", () => {
  it("el art. 4 en vivo: el PEC desglosado y el resultado", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    expect(screen.getByText("Faltan datos para decidir.")).toBeInTheDocument();
    expect(guardado()).toBeNull();

    await escribir(user, "ss-pem", "120.000");
    await escribir(user, "ss-gg", "13");
    await escribir(user, "ss-bi", "6");
    await escribir(user, "ss-iva", "10");
    expect(guardado().presupuesto).toEqual({ pem: 120000, gg_pct: 13, bi_pct: 6, iva_pct: 10 });
    expect(screen.getAllByText("157.080,00 €").length).toBeGreaterThan(0);

    await escribir(user, "ss-plazo", "80");
    await escribir(user, "ss-trab", "6");
    await user.click(within(screen.getByRole("group", { name: TUNELES })).getByRole("button", { name: "No" }));
    expect(screen.getByText("Basta el estudio básico.")).toBeInTheDocument();
    expect(guardado()).toMatchObject({ manoDeObra: { plazoDias: 80, maxTrabajadores: 6 }, subterraneas: false });

    // Vaciar un campo es «sin declarar», no un cero.
    await user.clear(document.getElementById("ss-trab") as HTMLInputElement);
    await user.tab();
    expect(guardado().manoDeObra).toEqual({ plazoDias: 80 });
    expect(screen.getByText("Faltan datos para decidir.")).toBeInTheDocument();
  });

  it("si se supera un supuesto, lo dice en rojo", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    await user.click(within(screen.getByRole("group", { name: TUNELES })).getByRole("button", { name: "Sí" }));
    expect(screen.getByText("Hace falta el estudio de seguridad y salud completo.")).toBeInTheDocument();
  });

  it("amianto: obligatorio en la reforma; con «posible», dónde y qué tipo", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    expect(screen.getByText("obligatorio")).toBeInTheDocument();
    await user.click(within(screen.getByRole("group", { name: "Materiales con amianto" })).getByRole("button", { name: "Posible" }));
    await escribir(user, "ss-amianto-ubi", "bajantes del patio");
    await user.click(screen.getByRole("button", { name: "No friable" }));
    expect(guardado().amianto).toEqual({ estado: "posible", ubicacion: "bajantes del patio", friable: false });
  });

  it("las fichas: propuestas con su motivo; quitar una se guarda como diferencia", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    const huecos = screen.getByLabelText(HUECOS);
    expect(huecos).toBeChecked();
    expect(screen.getAllByText(/^La propone la app: /).length).toBeGreaterThan(10);
    expect(screen.getAllByText("Redactada por la app · sin revisar").length).toBeGreaterThan(0);
    await user.click(huecos);
    expect(guardado().seleccion).toEqual({ quitadas: ["F40"] });
    expect(huecos).not.toBeChecked();
    await user.click(huecos);
    expect(guardado()).toEqual({});
  });

  it("editar una ficha: quitar una medida, añadir otra y darla por revisada", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    await user.click(screen.getByRole("button", { name: `Editar la ficha ${HUECOS}` }));
    await user.click(screen.getByLabelText("La he leído y la doy por buena"));
    expect(guardado().seleccion).toEqual({ ediciones: { F40: { revisada: true } } });
    const quitar = screen.getAllByRole("button", { name: /^Quitar: / })[0];
    const texto = quitar.getAttribute("aria-label")!.replace(/^Quitar: /, "");
    await user.click(quitar);
    expect(guardado().seleccion.ediciones.F40).toEqual({ revisada: true, medidas: { quitados: [texto] } });
    expect(screen.getByRole("button", { name: `Volver a poner: ${texto}` })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Añadir a medidas preventivas"), "Apuntalar antes de abrir el hueco{Enter}");
    expect(guardado().seleccion.ediciones.F40.medidas).toEqual({ quitados: [texto], anadidos: ["Apuntalar antes de abrir el hueco"] });
  });

  it("todo el catálogo, para añadir lo que la app no propone", async () => {
    const user = userEvent.setup();
    montar(<SeguridadSaludPage />);
    expect(screen.queryByText("La app no la propone para esta obra.")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Todo el catálogo" }));
    expect(screen.getAllByText("La app no la propone para esta obra.").length).toBeGreaterThan(10);
  });
});

describe("el estudio básico, para leer", () => {
  it("los apartados del documento y lo que falta", () => {
    montar(<EstudioBasicoPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Estudio básico de seguridad y salud" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Justificación del estudio básico" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "14. Firma" })).toBeInTheDocument();
    expect(within(screen.getByRole("complementary", { name: "Lo que falta" })).getByText("Falta el centro asistencial más próximo.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Datos y fichas" })).toHaveAttribute("href", "/p/demo/seguridad-salud");
  });
});

describe("en La obra", () => {
  it("la fila de Lo que se entrega: sin empezar, y con datos, sus apartados", () => {
    montar(<LoQueSeEntrega />);
    expect(screen.getByText("Estudio básico de seguridad y salud")).toBeInTheDocument();
    expect(screen.getByText("sin empezar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leer el estudio básico" })).toHaveAttribute("href", "/estudio-basico");
    expect(screen.getByRole("button", { name: "Estudio básico en Word" })).toBeDisabled();
    cleanup();
    montar(<LoQueSeEntrega />, { ...reforma(), seguridadSalud: { subterraneas: false } });
    expect(screen.getByText(/de 15 apartados/)).toBeInTheDocument();
  });

  it("«Antes de entregar» lleva a la pantalla de seguridad y salud", () => {
    montar(<AntesDeEntregar />, { ...reforma(), seguridadSalud: {} });
    const pem = screen.getByText(/Falta el presupuesto de ejecución material/).closest("a")!;
    expect(pem).toHaveAttribute("href", "/seguridad-salud");
    expect(pem).toHaveTextContent(/^Por revisar: Seguridad y salud · /);
  });
});
