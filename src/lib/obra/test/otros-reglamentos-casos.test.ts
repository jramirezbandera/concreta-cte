import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { crearProyectoDemo } from "../../proyecto/demo";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import type { JustificacionKey, PromocionObra, Proyecto } from "../../proyecto/tipos";
import { justificarHe3 } from "../../../modules/he3/justificacion";
import { riteEstadoDefaults } from "../../../modules/rite/estado";
import { documentoMemoria } from "../../docx/render";
import { ESTUDIO_VACIO, membreteDe } from "../../estudio/estudio";
import { antesDeEntregar } from "../entrega";
import { evaluarExpediente } from "../evaluar";
import { bloquesMemoria, memoriaCte, textoPlanoMemoriaCte } from "../memoria";

// =============================================================================
// feature-36, paso 8: los cuatro apartados nuevos (HE 2 · RITE, HE 3, ICT y
// accesibilidad) en el Demo, la unifamiliar, la plurifamiliar y «Reforma: local
// a vivienda», con lo que declara el proyectista (potencias del RITE, potencia e
// iluminancia de las zonas comunes, la promoción) y en Málaga, para que salga la
// plantilla de Andalucía. Potencias inventadas, como las del Demo.
// =============================================================================

const AHORA = "2026-10-20T10:00:00.000Z";
const MALAGA = "29067";
const NUEVOS: JustificacionKey[] = ["rite", "he3", "ict", "acc"];
const inputs = (x: object) => ({ inputs: x as unknown as Record<string, unknown>, schemaVersion: "1" });

function deCaso(c: CasoEdificio, promocion: PromocionObra): Proyecto {
  const base = crearProyectoDemo(AHORA);
  const { promocion: _p, ...dg } = base.datosGenerales;
  const p: Proyecto = { ...base, edificio: edificioDeCaso(c), justificaciones: {} };
  p.datosGenerales = { ...dg, municipioIne: MALAGA, promocion, ...(obraDeCaso(c) ?? {}) };
  // 2 W/m² con 100 lux en cada zona que justifica HE 3: VEEI de 2, bajo cualquier límite.
  const zonas = Object.fromEntries(
    justificarHe3({}, { edificio: p.edificio, datosGenerales: p.datosGenerales }).zonas.map((z) => [
      z.id,
      { potencia_W: Math.round(2 * z.zona.superficieUtil_m2), iluminancia_lx: 100 },
    ]),
  );
  p.justificaciones = {
    rite: inputs({ ...riteEstadoDefaults, potenciaCalor_kW: 3.6, potenciaFrio_kW: 3.4, potenciaAcs_kW: 1.8, acumulacion_l: 200 }),
    he3: inputs({ zonas }),
  };
  return p;
}

const estado = (p: Proyecto) => {
  const ev = evaluarExpediente(p);
  return Object.fromEntries(NUEVOS.map((k) => [k, `${ev.porClave[k]?.aplicabilidad}|${ev.porClave[k]?.veredicto ?? "-"}`]));
};

/** El texto de un apartado de la memoria: desde su título hasta el siguiente. */
function apartado(t: string, titulo: string): string {
  const i = t.indexOf(titulo);
  if (i < 0) throw new Error(`no está «${titulo}»`);
  const resto = t.slice(i + titulo.length);
  const fin = resto.search(/\n\n\d+\.\d+(\.\d+)?\. /);
  return (fin < 0 ? resto : resto.slice(0, fin)).trim();
}

const TITULOS = [
  "3.6.3. HE 2 Condiciones de las instalaciones térmicas",
  "3.6.4. HE 3 Condiciones de las instalaciones de iluminación",
  "4.3. Infraestructuras comunes de telecomunicaciones (ICT)",
  "4.4. Accesibilidad",
];

const pendientesNuevos = (p: Proyecto) =>
  antesDeEntregar(p)
    .filter((x) => NUEVOS.includes(x.key as JustificacionKey) || x.key === "coherencia")
    .map((x) => `${x.key}:${x.tipo}`);

const CASOS: [string, () => Proyecto][] = [
  ["el Demo", () => crearProyectoDemo(AHORA)],
  ["unifamiliar", () => deCaso("unifamiliar", { propiedadHorizontal: false })],
  ["plurifamiliar", () => deCaso("plurifamiliar", { propiedadHorizontal: true, protegida: false })],
  ["reforma_local_vivienda", () => deCaso("reforma_local_vivienda", { propiedadHorizontal: true, protegida: false })],
];

describe("los cuatro apartados nuevos en los casos", () => {
  it("el Demo: los cuatro cumplen y nada queda pendiente", () => {
    const p = crearProyectoDemo(AHORA);
    expect(estado(p)).toEqual({ rite: "aplica|ok", he3: "aplica|ok", ict: "aplica|ok", acc: "aplica|ok" });
    expect(pendientesNuevos(p)).toEqual([]);
  });

  it("la unifamiliar andaluza: el RITE cumple; HE 3, ICT y accesibilidad, «no aplica» en una línea con su motivo", () => {
    const p = deCaso("unifamiliar", { propiedadHorizontal: false });
    expect(estado(p)).toEqual({ rite: "aplica|ok", he3: "no_aplica|-", ict: "no_aplica|-", acc: "no_aplica|-" });
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    const [, he3, ict, acc] = TITULOS.map((x) => apartado(t, x));
    // Un párrafo y, si la lleva, la línea de su cita.
    for (const a of [he3, ict, acc]) expect(a.split("\n\n").length).toBeLessThanOrEqual(2);
    expect(he3).toMatch(/instalaciones interiores de las viviendas están excluidas/);
    expect(ict).toMatch(/una sola vivienda y no está acogido al régimen de propiedad horizontal/);
    expect(acc).toMatch(/Decreto 293\/2009 de Andalucía.*unifamiliar, sin elementos de uso comunitario/);
    expect(pendientesNuevos(p)).toEqual([]);
  });

  it("la plurifamiliar andaluza: cumplen; la ICT avisa de las estancias deducidas (sin las de habitabilidad)", () => {
    const p = deCaso("plurifamiliar", { propiedadHorizontal: true, protegida: false });
    expect(estado(p)).toEqual({ rite: "aplica|ok", he3: "aplica|ok", ict: "aplica|warn", acc: "aplica|ok" });
    expect(pendientesNuevos(p)).toEqual(["ict:revisar", "ict:revisar"]);
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(apartado(t, TITULOS[3])).toMatch(/Decreto 293\/2009/);
    expect(apartado(t, TITULOS[2])).toMatch(/proyecto técnico/);
  });

  it("la reforma de local a vivienda: el RITE y la accesibilidad a lo reformado; sin HE 3 ni proyecto de ICT", () => {
    const p = deCaso("reforma_local_vivienda", { propiedadHorizontal: true, protegida: false });
    expect(estado(p)).toEqual({ rite: "aplica_reformado|ok", he3: "no_aplica|-", ict: "no_aplica|-", acc: "aplica_reformado|ok" });
    expect(pendientesNuevos(p)).toEqual([]);
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    expect(apartado(t, TITULOS[2])).toMatch(/no se exige proyecto técnico de ICT/);
  });

  it.each(CASOS)("%s: los apartados, en su orden tras HE 1 y el REBT y habitabilidad; el Word se compone", async (_n, crear) => {
    const p = crear();
    const t = textoPlanoMemoriaCte(memoriaCte(p));
    const pos = TITULOS.map((x) => t.indexOf(x));
    expect(pos.every((x) => x > 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    expect(t.indexOf("3.6.2. HE 1")).toBeLessThan(pos[0]!);
    expect(t.indexOf("4.2. ")).toBeLessThan(pos[2]!);
    const d = documentoMemoria(bloquesMemoria(memoriaCte(p)), membreteDe(ESTUDIO_VACIO, p));
    expect((await Packer.toBuffer(d)).byteLength).toBeGreaterThan(0);
  });
});
