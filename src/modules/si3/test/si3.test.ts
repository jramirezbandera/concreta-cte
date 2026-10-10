import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { obraDeCaso, proyectoParaModulo } from "../../../lib/proyecto/alcance";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { si3 } from "../definicion";
import { si3EstadoDefaults, type Si3Estado } from "../estado";
import { justificarSi3, proteccionExigida } from "../justificacion";
import { CAPACIDAD_TABLA_4_2, capacidadProtegida } from "../tablas";

// =============================================================================
// SI 3 · Evacuación de ocupantes (feature-19): ocupación, salidas y recorridos,
// escaleras, puertas, humo y discapacidad. Cifras: research/verificacion-si3.md.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio, estado: Partial<Si3Estado> = {}) => justificarSi3({ ...si3EstadoDefaults, ...estado }, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Si3Estado> = {}) => con(edificioDeCaso(c), estado);

describe("SI3 · tablas", () => {
  it("tabla 4.2: la protegida es 160·A + n·k en las filas transcritas (2 a 10 plantas, 1,00 m)", () => {
    // Fila 1,00 m de la tabla: 224, 288, 352, 416, 480.
    expect([2, 4, 6, 8, 10].map((n) => capacidadProtegida(1.0, n))).toEqual([224, 288, 352, 416, 480]);
    // Fila 1,50 m: 356 · 472 · 588 · 704 · 820.
    expect([2, 4, 6, 8, 10].map((n) => capacidadProtegida(1.5, n))).toEqual([356, 472, 588, 704, 820]);
    // Con anchuras intermedias, la fila inferior (del lado de la seguridad).
    expect(capacidadProtegida(1.05, 2)).toBe(224);
    expect(CAPACIDAD_TABLA_4_2.datos.anchuras_m).toHaveLength(15);
  });

  it("tabla 5.1 en vivienda: no protegida hasta 14 m, protegida hasta 28 m", () => {
    expect([14, 14.01, 28, 28.01].map(proteccionExigida)).toEqual(["no_protegida", "protegida", "protegida", "especialmente_protegida"]);
  });
});

describe("SI3 · justificación", () => {
  it("Demo: 35 personas, una salida por planta con el recorrido pendiente de medir", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.avisos.map((a) => a.id)).toEqual(["recorrido", "recorrido-garaje"]);
    expect(si3.frase(j)).toBe(
      "35 personas; escalera no protegida de 1 m; una salida por planta con recorridos de hasta 25 m; el garaje, por escalera especialmente protegida.",
    );
    const s = j.elementos.find((e) => e.id === "salidas")!.detalle;
    // Con escalera no protegida, el recorrido llega a la salida del edificio.
    expect(s.clase === "salidas" && s.hastaEdificio).toBe(true);
  });

  it("medido: 22 m cumple y quita el aviso; 28 m no cumple y lo explica", () => {
    expect(caso("plurifamiliar_locales", { recorrido_m: 22 }).avisos.map((a) => a.id)).toEqual(["recorrido-garaje"]);
    const j = caso("plurifamiliar_locales", { recorrido_m: 28 });
    const el = j.elementos.find((e) => e.id === "salidas")!;
    expect(el.veredicto).toBe("fail");
    expect(si3.textoIncumplimiento(el)?.detalle).toMatch(/28 m.*Con la escalera compartimentada o protegida, el recorrido acaba en ella/);
    // Con la escalera compartimentada, el recorrido se mide hasta ella.
    const k = caso("plurifamiliar_locales", { escalera: "compartimentada" });
    const s = k.elementos.find((e) => e.id === "salidas")!.detalle;
    expect(s.clase === "salidas" && s.hastaEdificio).toBe(false);
  });

  it("una escalera no protegida con más de 14 m no vale; lo arregla volver a lo habitual", () => {
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 5 } : g)) };
    const j = con(alto, { escalera: "no_protegida" });
    const el = j.elementos.find((x) => x.id === "escalera")!;
    expect(el.veredicto).toBe("fail");
    expect(si3.arreglo?.(el, j)).toEqual({ etiqueta: "Volver a lo habitual", cambios: { escalera: "habitual" } });
    expect(con(alto).elementos.find((x) => x.id === "escalera")!.veredicto).toBe("ok");
  });

  it("el garaje bajo rasante: control de humo con 150 l/s por plaza", () => {
    const h = caso("plurifamiliar_locales").elementos.find((e) => e.id === "humo")!.detalle;
    expect(h.clase === "humo" && [h.plazas, h.extraccion_l_s, h.aportacion_l_s]).toEqual([14, 2100, 1680]);
  });

  it("unifamiliar: sin recorridos ni escaleras", () => {
    const j = caso("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["ocupacion", "unifamiliar"]);
    expect(j.avisos).toEqual([]);
  });

  it("la memoria dice desde dónde y hasta dónde se mide el recorrido", () => {
    const t = textoPlanoMemoria(si3.memoria(caso("plurifamiliar_locales", { recorrido_m: 21.5 })));
    expect(t).toMatch(/se mide desde la puerta de la vivienda más alejada hasta la salida del edificio, bajando por la escalera, ya que una escalera no protegida no es salida de planta/);
    expect(t).toMatch(/la escalera que le sirve tiene vestíbulo de independencia/);
  });
});

describe("SI3 · tablas de la memoria (feature-31)", () => {
  it("la ocupación: zona, uso, superficie útil, densidad y ocupación, con el total; el texto no la repite", () => {
    const m = si3.memoria(caso("plurifamiliar_locales"));
    const t = m.tablas![0];
    expect(t.cabecera).toEqual(["Zona", "Uso", "Superficie útil", "Densidad", "Ocupación (personas)"]);
    expect(t.filas).toContainEqual(["Viviendas (P1–P3)", "Residencial Vivienda", "158 m² × 3", "20 m²/persona", "8 × 3 = 24"]);
    expect(t.filas.at(-1)).toEqual(["Total", "Residencial Vivienda y Aparcamiento", "894 m²", "según zona", "35"]);
    // Tras el párrafo de la ocupación; el local sale por las suyas y no entra.
    expect(t.tras).toBe(1);
    expect(t.filas.some((f) => f[0].startsWith("Local"))).toBe(false);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toContain("24 personas");
    expect(texto).not.toContain("35 personas");
  });

  it("la evacuación: «Parámetro | Norma | Proyecto | Cumple», con el garaje; el texto no repite las cifras", () => {
    const m = si3.memoria(caso("plurifamiliar_locales", { recorrido_m: 21.5 }));
    const t = m.tablas![1];
    expect(t.rotulo).toBe("Evacuación");
    expect(t.cabecera).toEqual(["Parámetro", "Norma", "Proyecto", "Cumple"]);
    expect(t.filas).toContainEqual(["Recorrido de evacuación", "≤ 25 m", "21,5 m", "Cumple"]);
    expect(t.filas).toContainEqual(["Capacidad de la escalera", "≥ 24 personas", "160 personas (A = 1,00 m)", "Cumple"]);
    expect(t.filas).toContainEqual(["Anchura de la puerta de salida (35 personas)", "A ≥ P/200 ≥ 0,80 m", "≥ 0,80 m", "Cumple"]);
    // Sin medir, el recorrido del garaje se declara con su límite.
    expect(t.filas).toContainEqual(["Recorrido del garaje", "≤ 35 m", "≤ 35 m", "Cumple"]);
    // Antes del humo del garaje, que se queda en el texto.
    expect(textoParrafo(m.parrafos[t.tras!])).toMatch(/^El garaje, que no tiene la consideración de aparcamiento abierto/);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toContain("21,5 m");
    expect(texto).not.toContain("0,8 m");
    expect(texto).not.toMatch(/no excede de (100|500|28 m)/);
  });

  it("lo que no cumple sale en su fila: el recorrido medido de 28 m y la escalera no protegida de más de 14 m", () => {
    const largo = si3.memoria(caso("plurifamiliar_locales", { recorrido_m: 28 })).tablas![1];
    expect(largo.filas).toContainEqual(["Recorrido de evacuación", "≤ 25 m", "28 m", "No cumple"]);
    expect(largo.filas.find((f) => f[0] === "Altura de evacuación")![3]).toBe("Cumple");
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 5 } : g)) };
    const t = si3.memoria(con(alto, { escalera: "no_protegida" })).tablas![1];
    expect(t.filas.find((f) => f[0] === "Protección de la escalera")).toEqual(["Protección de la escalera", "protegida (h ≤ 28 m)", "no protegida", "No cumple"]);
  });

  it("la unifamiliar no lleva tablas; la reforma, la ocupación de lo intervenido y la puerta de los comunes", () => {
    expect(si3.memoria(caso("unifamiliar")).tablas).toEqual([]);
    const p: Proyecto = { ...crearProyectoDemo("2026-10-10T10:00:00.000Z"), edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
    p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}) };
    const m = si3.memoria(justificarSi3(si3EstadoDefaults, proyectoParaModulo(p, "si3")));
    const [oc, ev] = m.tablas!;
    expect(oc.filas).toEqual([["Viviendas (PB)", "Residencial Vivienda", "90 m²", "20 m²/persona", "5"]]);
    // Con el criterio 9, la puerta del portal, con la ocupación del edificio entero.
    expect(ev.filas).toEqual([["Anchura de la puerta de salida (40 personas)", "A ≥ P/200 ≥ 0,80 m", "≥ 0,80 m", "Cumple"]]);
    const texto = m.parrafos.map(textoParrafo).join(" ");
    expect(texto).not.toMatch(/5 personas|40 personas/);
  });
});
