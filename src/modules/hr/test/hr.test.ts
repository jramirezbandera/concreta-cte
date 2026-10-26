import { describe, expect, it } from "vitest";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import type { MemoriaDoc } from "../../../lib/cte/presentacion";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { obraDeCaso, proyectoParaModulo } from "../../../lib/proyecto/alcance";
import { crearProyectoDemoConSupuestos } from "../../../lib/proyecto/demo";
import type { DatosGenerales, Proyecto } from "../../../lib/proyecto/tipos";
import { dRASuelo, dRATecho, dRATrasdosado, solucionDe } from "../../../lib/constructivo/catalogo";
import { comprobarFachada, comprobarHorizontal, comprobarVertical, type EntradaVertical, type FachadaFlanco } from "../comprobar";
import { hr } from "../definicion";
import { hrEstadoDefaults, type HrEstado } from "../estado";
import { justificarHr, type DetalleHr, type JustificacionHr } from "../justificacion";
import { exigenciaExterior, mixto, tramoHuecos } from "../tablas";

// =============================================================================
// DB-HR · Protección frente al ruido, opción simplificada (feature-25). Cifras y
// criterios: research/verificacion-hr.md (DB y Guía) y verificacion-hr-cec.md
// (Catálogo). Los ejemplos son los de esos documentos.
// =============================================================================

const demo = crearProyectoDemoConSupuestos("2026-10-05T10:00:00.000Z");
type Justs = Proyecto["justificaciones"];
const con = (edificio: Edificio, estado: Partial<HrEstado> = {}, dg: Partial<DatosGenerales> = {}, justificaciones: Justs = {}): JustificacionHr =>
  justificarHr({ ...hrEstadoDefaults, ...estado }, { edificio, datosGenerales: { ...demo.datosGenerales, ...dg }, justificaciones });
const detalle = <C extends DetalleHr["clase"]>(j: JustificacionHr, id: string) => j.elementos.find((e) => e.id === id)?.detalle as Extract<DetalleHr, { clase: C }> | undefined;
const veredicto = (j: JustificacionHr, id: string) => j.elementos.find((e) => e.id === id)?.veredicto;
const ids = (j: JustificacionHr) => j.elementos.map((e) => e.id);
const avisos = (j: JustificacionHr) => j.avisos.map((a) => a.id);
const medianeras = (v: "si" | "no"): Justs => ({ si2: { inputs: { medianeras: v } } }) as unknown as Justs;

/** Fachada de dos hojas de ½ pie y LHD (F 3.1), la de por defecto. */
const F31: FachadaFlanco = { clase: "dos_hojas", interior: "fabrica", aislExterior: false, principal: { m: 135, RA: 41 }, hojaInterior: null };
const SATE: FachadaFlanco = { clase: "una_hoja", interior: "fabrica", aislExterior: true, principal: { m: 161, RA: 42 }, hojaInterior: null };

const vertical = (e: Partial<EntradaVertical>) =>
  comprobarVertical({
    tipo: 1, m: 150, RA: 42, dRA: null, unaCara: false, columna: "fabrica", tabiqueria: "bandas", paren: false, instalaciones: false,
    forjadoM: 372, sueloDRA: 4, techoDRA: 0, fachada: F31, ...e,
  });

describe("HR · las tablas", () => {
  it("tabla 2.1: dormitorios y estancias por Ld; aeronaves + 4; fachada no expuesta, Ld − 10 (no con aeronaves)", () => {
    expect([60, 63, 70, 72, 76].map((ld) => exigenciaExterior(ld, "dormitorios", false, false).D)).toEqual([30, 32, 37, 42, 47]);
    expect([60, 63, 70, 72, 76].map((ld) => exigenciaExterior(ld, "estancias", false, false).D)).toEqual([30, 30, 32, 37, 42]);
    expect(exigenciaExterior(70, "dormitorios", true, false).D).toBe(41);
    expect(exigenciaExterior(70, "dormitorios", false, true)).toEqual({ ld: 60, D: 30 });
    expect(exigenciaExterior(70, "dormitorios", true, true)).toEqual({ ld: 70, D: 41 });
  });

  it("tabla 3.4: la fila de mayor parte ciega que no supera la del proyecto; tramos inclusivos", () => {
    expect([0, 15, 15.4, 30, 60, 80, 81].map(tramoHuecos)).toEqual([0, 0, 1, 1, 2, 3, 4]);
    expect(comprobarFachada(30, 45, 28.9, 20)).toEqual({ cumple: true, nivel: 30, ciegaExigida: 45, huecoExigido: 28 });
    expect(comprobarFachada(30, 38, 29, 20)).toMatchObject({ cumple: true, ciegaExigida: 35, huecoExigido: 29 });
    expect(comprobarFachada(30, 34, 40, 20)).toMatchObject({ cumple: false, ciegaExigida: 35 });
    expect(comprobarFachada(37, 50, null, 0)).toMatchObject({ cumple: true, ciegaExigida: 39, huecoExigido: null });
    expect(comprobarFachada(42, 60, 44, 90)).toMatchObject({ cumple: true, huecoExigido: 44 });
    // Un nivel que no está (una ordenanza): el superior más próximo (K-HR.8).
    expect(comprobarFachada(31, 45, 30, 20)).toMatchObject({ nivel: 32, huecoExigido: 29 });
  });

  it("ventana y caja de persiana con la G.1 (criterio K-CEC.8): 30 + CP1 = 28,9", () => {
    expect(mixto([{ fraccion: 1 - 0.2 / 1.5, R: 30 }, { fraccion: 0.2 / 1.5, R: 25 }])).toBe(28.9);
  });

  it("el Catálogo: masa intermedia del trasdosado por arriba; suelo y techo por la masa del forjado", () => {
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-autoportante-pyl-lm"), 150)).toBe(14);
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-autoportante-pyl-lm"), 500)).toBe(7);
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-ceramico-lh50-lm"), 284)).toBe(0);
    expect(dRASuelo(solucionDe("suelo", "sf-mortero-lm20"), 372)).toBe(6);
    expect(dRASuelo(solucionDe("suelo", "sf-mortero-lm20"), 625)).toBe(0);
    expect(dRATecho(solucionDe("techo", "ts-pyl15-lm50-c100"), 372)).toBe(7);
    expect(dRATecho(solucionDe("techo", "ts-pyl15-lm50-c100"), 333)).toBe(13);
  });
});

describe("HR · tabla 3.2", () => {
  it("LP ½ pie con trasdosado autoportante y tabiquería de fábrica: pide 16 y da 14 (verificacion-hr-cec B)", () => {
    const r = vertical({ m: 150, RA: 42, dRA: 14 });
    expect(r.cumple).toBe(false);
    expect(r.fila).toMatchObject({ m: 150, RA: 41 });
    expect(r.dRAExigido).toBe(16);
  });

  it("tipo 2 de doble LHD con bandas (P3.1): no cumple con el mínimo (53 < 54), sí con el medio", () => {
    const bandas = { en: "dos" as const, hojaM: 89 };
    expect(vertical({ tipo: 2, m: 148, RA: 53, bandas }).cumple).toBe(false);
    expect(vertical({ tipo: 2, m: 170, RA: 55, bandas }).cumple).toBe(true);
  });

  it("tipo 2 contra una fachada de una hoja: menos de 170 kg/m² no se permite", () => {
    const r = vertical({ tipo: 2, m: 148, RA: 55, bandas: { en: "dos", hojaM: 89 }, fachada: SATE });
    expect(r.cumple).toBe(false);
    expect(r.flancos[0].texto).toMatch(/no permitido/);
  });

  it("sin nota 11, 12 o 13, el forjado de 300 kg/m² (pto 5)", () => {
    expect(vertical({ tipo: 2, m: 184, RA: 58, bandas: { en: "una", hojaM: 89, apoyadaRA: 42 }, forjadoM: 290 }).cumple).toBe(false);
    expect(vertical({ tipo: 2, m: 184, RA: 58, bandas: { en: "una", hojaM: 89, apoyadaRA: 42 }, forjadoM: 300 }).cumple).toBe(true);
  });

  it("entre paréntesis: hormigón de 16 cm con trasdosado autoportante, fila 400/57 (6)⁽¹³⁾", () => {
    const r = vertical({ m: 400, RA: 57, dRA: 7, paren: true });
    expect(r.cumple).toBe(true);
    expect(r.alt).toMatchObject({ dRA: 6, paren: true, notas: [13] });
    // Trasdosado por una cara: + 4 dBA.
    expect(vertical({ m: 400, RA: 57, dRA: 7, paren: true, unaCara: true }).cumple).toBe(false);
  });

  it("tipo 1 contra una fachada de una hoja no vale junto a un recinto de instalaciones", () => {
    const r = vertical({ m: 400, RA: 57, dRA: 7, paren: true, instalaciones: true, fachada: SATE });
    expect(r.cumple).toBe(false);
    expect(r.flancos.some((c) => c.cumple === false && /instalaciones/.test(c.texto))).toBe(true);
  });
});

describe("HR · tabla 3.3", () => {
  const H = { columna: "BE" as const, caso: "normal" as const, dLw: "normal" as const, garaje: false, sueloDLw: 19, sueloDRA: 4, techoDRA: 0 };

  it("forjado de 372 kg/m² con bandas: fila 350/54, ΔLw ≥ 15 y (0 ; 0)", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 372, RA: 55, eps: false } });
    expect(r).toMatchObject({ cumple: true, dLwExigido: 15, comb: { sf: 0, ts: 0 } });
    expect(r.fila).toMatchObject({ m: 350 });
  });

  it("EPS: el ΔLw de las filas con nota (4) sube 4 dB", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 300, RA: 52, eps: true } });
    expect(r).toMatchObject({ cumple: false, dLwExigido: 20 });
    expect(comprobarHorizontal({ ...H, forjado: { m: 300, RA: 52, eps: true }, sueloDLw: 20 }).cumple).toBe(true);
  });

  it("garaje bajo viviendas (Guía, figura 2.1.4.11): forjado 400, bandas, (6) ; (0) sin techo y el ΔLw sin paréntesis", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 400, RA: 57, eps: false }, caso: "paren", garaje: true, sueloDLw: 12, sueloDRA: 6 });
    expect(r).toMatchObject({ cumple: true, dLwExigido: 12, comb: { sf: 6, ts: 0 } });
    expect(comprobarHorizontal({ ...H, forjado: { m: 400, RA: 57, eps: false }, caso: "paren", garaje: true, sueloDLw: 12, sueloDRA: 5 }).cumple).toBe(false);
  });

  it("instalaciones encima de viviendas (Guía p. 85): ΔLw ≥ 21, suelo ΔRA ≥ 3 y techo ≥ 15", () => {
    const e = { ...H, forjado: { m: 300, RA: 52, eps: false }, caso: "paren" as const, dLw: "paren" as const, sueloDLw: 21, sueloDRA: 3, techoDRA: 15 };
    expect(comprobarHorizontal(e)).toMatchObject({ cumple: true, dLwExigido: 21, comb: { sf: 3, ts: 15 } });
    expect(comprobarHorizontal({ ...e, techoDRA: 14 }).cumple).toBe(false);
  });

  it("tabiquería con apoyo directo: con forjados de menos de 300 kg/m² no hay solución", () => {
    const r = comprobarHorizontal({ ...H, columna: "AD", forjado: { m: 250, RA: 49, eps: false } });
    expect(r.cumple).toBe(false);
    expect(r.fila).toBeNull();
  });
});

describe("HR · el Demo (plurifamiliar con local)", () => {
  const j = con(demo.edificio, {}, {}, demo.justificaciones);

  it("los elementos, todos cumplen, y los avisos del Ld, los huecos y el local", () => {
    expect(ids(j)).toEqual([
      "tabiqueria", "separacion", "puerta", "ascensor", "forjado-viviendas", "forjado-comun", "forjado-actividad",
      "medianeria", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones",
    ]);
    expect(j.veredicto).toBe("ok");
    expect(avisos(j)).toEqual(["huecos", "ld", "colindancias", "local"]);
    expect(hr.frase(j)).toBe("6 viviendas con Ld 60 dBA: tabiquería, separaciones, forjados y fachadas cumplen la opción simplificada.");
  });

  it("qué linda con qué: lo deducido de El edificio, supuesto mientras no se indique (K-HR.16)", () => {
    expect(j.separaciones.colindancias.map((c) => [c.clave, c.nombre, c.relacion, c.linda, c.supuesta])).toEqual([
      ["entre:g1", "Viviendas (P1–P3)", "entre", true, true],
      ["debajo:z3", "Portal y escalera (PB)", "debajo", true, true],
      ["debajo:z2", "Local sin uso (PB)", "debajo", true, true],
    ]);
    expect(textoPlanoMemoria(hr.memoria(j))).toContain("Sin la distribución en planta, se suponen todas del lado de la seguridad");

    // El local no queda bajo viviendas: su forjado y su aviso desaparecen; lo demás, indicado.
    const k = con(demo.edificio, { colindancias: { "entre:g1": true, "debajo:z3": true, "debajo:z2": false } }, {}, demo.justificaciones);
    expect(ids(k)).not.toContain("forjado-actividad");
    expect(ids(k)).toContain("forjado-comun");
    expect(avisos(k)).toEqual(["huecos", "ld"]);
    expect(k.separaciones.colindancias.every((c) => !c.supuesta)).toBe(true);
    const texto = textoPlanoMemoria(hr.memoria(k));
    expect(texto).toContain("Según el proyecto, no lindan con las viviendas: Local sin uso (PB), bajo viviendas.");
    expect(texto).toContain("Las colindancias son las del proyecto.");
  });

  it("entre viviendas, el tipo 2 de ½ pie y LH con bandas, fila 170/54 sin trasdosado", () => {
    expect(detalle<"vertical">(j, "separacion")?.r).toMatchObject({ cumple: true, fila: { tipo: 2, m: 170, RA: 54 }, dRAExigido: null });
  });

  it("sobre el local, la combinación entre paréntesis con el techo del local", () => {
    const d = detalle<"horizontal">(j, "forjado-actividad");
    expect(d).toMatchObject({ techo: { dRA: 7 }, suelo: { dRA: 4 }, r: { cumple: true, comb: { sf: 4, ts: 5 } } });
    // Sin techo en el local, no llega.
    expect(veredicto(con(demo.edificio, { techoBajo: null }, {}, demo.justificaciones), "forjado-actividad")).toBe("fail");
  });

  it("con el Ld de una calle ruidosa, la parte ciega de la fachada ya no llega", () => {
    const k = con(demo.edificio, {}, { ldZona: 75 }, demo.justificaciones);
    expect(detalle<"exterior">(k, "fachada-dormitorios")).toMatchObject({ D: 42, r: { cumple: false, ciegaExigida: 50 } });
    expect(hr.textoIncumplimiento(k.elementos.find((e) => e.id === "fachada-dormitorios")!)?.titulo).toBe("La parte ciega no llega a ninguna fila de la tabla 3.4.");
    expect(avisos(k)).not.toContain("ld");
  });

  it("la memoria: ámbito, Ld, la ficha K.1 por bloques y la reverberación que no se aplica", () => {
    const m = hr.memoria(j);
    const t = textoPlanoMemoria(m);
    expect(t).toContain("le es de aplicación el DB-HR (Introducción II)");
    expect(t).toContain("Ld = 60 dBA");
    expect(t).toContain("no le son de aplicación los valores límite de tiempo de reverberación");
    expect(m.tablas?.map((x) => x.rotulo)).toEqual([
      "Tabiquería",
      "Elementos de separación verticales con otras unidades de uso o zonas comunes: otras viviendas (P3, P2, P1)",
      "Elementos de separación verticales con el recinto del ascensor",
      "Medianerías",
      "Elementos de separación horizontales entre viviendas: viviendas de P3, viviendas de P2",
      "Elementos de separación horizontales sobre zonas comunes: Portal y escalera (PB)",
      "Elementos de separación horizontales sobre recintos de actividad o de instalaciones: Local sin uso (PB)",
      "Fachada y cubierta, dormitorios: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA",
      "Fachada, estancias: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA",
      "Condicionantes de las soluciones",
    ]);
    // Nada de «—», «None» ni «≥ -»; cada fila termina en Cumple, No cumple o Se declara.
    for (const tb of m.tablas!) {
      for (const f of tb.filas) {
        expect(f.join(" ")).not.toMatch(/—|None|≥ -/);
        expect(f[f.length - 1]).toMatch(/^(Cumple|No cumple|Se declara)$/);
      }
    }
  });


  it("en un edificio existente, no se aplica", () => {
    const k = con(demo.edificio, {}, { intervencion: "reforma" }, demo.justificaciones);
    expect(k.aplica).toBe(false);
    expect(hr.frase(k)).toMatch(/solo se aplica a la rehabilitación integral/);
  });
});

describe("HR · la ficha K.1 en la memoria (feature-31)", () => {
  const j = con(demo.edificio, {}, {}, demo.justificaciones);
  const m = hr.memoria(j);
  const texto = m.parrafos.map(textoParrafo).join(" ");
  const tabla = (doc: MemoriaDoc, rotulo: string | RegExp) => doc.tablas!.find((t) => (typeof rotulo === "string" ? t.rotulo === rotulo : rotulo.test(t.rotulo ?? "")))!;

  it("tabiquería: el tipo y la solución, m y RA con lo exigido; el texto no repite la cifra", () => {
    const t = tabla(m, "Tabiquería");
    expect(t.cabecera).toEqual(["Elemento", "Solución", "Parámetro", "Norma", "Proyecto", "Cumple"]);
    expect(t.columnas).toEqual(["texto", "texto", "texto", "norma", "proyecto", "cumple"]);
    expect(t.filas).toEqual([
      ["Fábrica con bandas elásticas", "LHD 7 cm + yeso por ambas caras (CEC P1.1, p. 101)", "m", "≥ 65 kg/m²", "89 kg/m²", "Cumple"],
      ["", "", "RA", "≥ 33 dBA", "36 dBA", "Cumple"],
    ]);
    expect(texto).not.toContain("89 kg/m²");
    // En la aislada, la m no se exige.
    const uni = hr.memoria(con(edificioDeCaso("unifamiliar")));
    expect(tabla(uni, "Tabiquería").filas[0].slice(2)).toEqual(["m", "no se exige", "89 kg/m²", "Cumple"]);
  });

  it("separación vertical: elemento base, trasdosado y puerta de entrada; la fila de la tabla 3.2 en la nota", () => {
    const t = tabla(m, /^Elementos de separación verticales con otras unidades de uso o zonas comunes: /);
    expect(t.filas).toContainEqual(["Elemento base", "LP ½ pie + lana mineral + LH 5 con bandas (CEC P3.2, p. 109)", "m", "≥ 170 kg/m² (1)", "184 kg/m²", "Cumple"]);
    expect(t.filas).toContainEqual(["Trasdosado", "sin trasdosado", "ΔRA", "no se exige", "no lleva", "Cumple"]);
    expect(t.filas).toContainEqual(["Puerta de entrada", "abre a un vestíbulo", "RA", "≥ 20 dBA", "≥ 20 dBA, en el pliego", "Cumple"]);
    expect(t.filas).toContainEqual(["Cerramiento con la puerta", "elemento base", "RA", "≥ 50 dBA", "58 dBA", "Cumple"]);
    expect(t.notas).toEqual(["Tabla 3.2, elementos de tipo 2, columna de tabiquería de fábrica."]);
    expect(texto).not.toContain("184 kg/m²");
    expect(texto).not.toContain("Puerta de entrada");
    // El ascensor: el porqué en el texto; las cifras, en su tabla.
    expect(texto).toContain("su recinto es un recinto de instalaciones");
    const asc = tabla(m, "Elementos de separación verticales con el recinto del ascensor");
    expect(asc.filas[2]).toEqual(["Trasdosado", "Autoportante de PYL con lana mineral (CEC TR1, p. 108), por ambas caras", "ΔRA", "≥ 6 dBA", "7 dBA", "Cumple"]);
    expect(asc.notas?.[0]).toMatch(/valores entre paréntesis, por ser recinto de instalaciones/);
  });

  it("medianería: RA con lo exigido y su apartado en la nota", () => {
    const t = tabla(m, "Medianerías");
    expect(t.filas).toEqual([["Medianería", "LP 1 pie + yeso por ambas caras (CEC P1.5, p. 102)", "RA", "≥ 45 dBA (1)", "49 dBA", "Cumple"]]);
    expect(t.notas?.[0]).toMatch(/ap\. 3\.1\.2\.4/);
    expect(texto).not.toContain("49 dBA");
  });

  it("separación horizontal: forjado, suelo flotante y techo suspendido; lo que no se exige lo dice", () => {
    const t = tabla(m, /^Elementos de separación horizontales sobre recintos de actividad o de instalaciones: /);
    expect(t.filas).toEqual([
      ["Forjado", "Unidireccional, bovedilla de hormigón, 30 cm (CEC 3.18.1, p. 29)", "m", "≥ 350 kg/m² (1)", "372 kg/m²", "Cumple"],
      ["", "", "RA", "≥ 54 dBA", "55 dBA", "Cumple"],
      ["Suelo flotante", "Mortero 5 cm sobre polietileno reticulado 5 mm (CEC S01, p. 115)", "ΔRA", "≥ 4 dBA", "4 dBA", "Cumple"],
      ["", "", "ΔLw", "≥ 15 dB", "19 dB", "Cumple"],
      ["Techo suspendido", "PYL 15 suspendida con lana mineral (CEC T01, p. 118)", "ΔRA", "≥ 5 dBA", "7 dBA", "Cumple"],
    ]);
    expect(t.notas).toEqual(["Tabla 3.3, columna de fábrica con bandas elásticas; fila entre paréntesis, por ser recinto de actividad o de instalaciones."]);
    expect(tabla(m, /^Elementos de separación horizontales entre viviendas: /).filas[4]).toEqual(["Techo suspendido", "sin techo suspendido", "ΔRA", "no se exige", "no lleva", "Cumple"]);
    expect(texto).not.toContain("ΔLw");
    // Sin techo en el local no llega: la fila que falta, «No cumple».
    const sin = hr.memoria(con(demo.edificio, { techoBajo: null }, {}, demo.justificaciones));
    const filas = tabla(sin, /^Elementos de separación horizontales sobre recintos de actividad/).filas;
    expect(filas.some((f) => f[5] === "No cumple")).toBe(true);
  });

  it("fachadas por recinto receptor: el Ld y el D2m,nT,Atr en el rótulo, la cubierta con los dormitorios", () => {
    const t = tabla(m, "Fachada y cubierta, dormitorios: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA");
    expect(t.filas).toEqual([
      ["Parte ciega", "Enfoscado + LP ½ pie + cámara + aislante + LHD 7 + enlucido (CEC F 3.2, p. 59)", "RA,tr", "≥ 45 dBA", "45 dBA", "Cumple"],
      ["Huecos, 20 % (supuesto)", "Batiente, vidrio 4-cámara-6, clase 3 (CEC 4.3.2, p. 97), con caja de persiana CP1", "RA,tr", "≥ 28 dBA (1)", "28,9 dBA (2)", "Cumple"],
      ["Cubierta", "Plana no transitable, con grava (CEC C 5.3, p. 41)", "RA,tr", "≥ 33 dBA", "52 dBA", "Cumple"],
    ]);
    expect(t.notas).toEqual(["Tabla 3.4, huecos de 16 a 30 %, con la parte ciega de proyecto.", "Ventana de 30 dBA y caja de persiana CP1 de 25 dBA, combinadas (Anejo G, G.1)."]);
    expect(tabla(m, "Fachada, estancias: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA").filas[1][0]).toBe("Huecos, 30 % (supuesto)");
    // El texto: el Ld y su origen; la exigencia de cada recinto, en el rótulo.
    expect(texto).toContain("Ld = 60 dBA (valor por defecto del DB");
    expect(texto).not.toMatch(/D2m,nT,Atr ≥|RA,tr =/);
    // Con una calle ruidosa, la parte ciega no llega: «No cumple».
    const ruido = hr.memoria(con(demo.edificio, {}, { ldZona: 75 }, demo.justificaciones));
    expect(tabla(ruido, /^Fachada y cubierta, dormitorios: Ld = 75 dBA, D2m,nT,Atr ≥ 42 dBA$/).filas[0].slice(3)).toEqual(["≥ 50 dBA", "45 dBA", "No cumple"]);
  });

  it("condicionantes: los de la solución, con su elemento; sin ninguno, no sale", () => {
    const t = tabla(m, "Condicionantes de las soluciones");
    expect(t.cabecera).toEqual(["Elemento", "Condición", "Cumple"]);
    expect(t.filas).toContainEqual(["Entre viviendas y con la zona común", "Forjado m ≥ 300 kg/m² (ap. 3.1.2.3.4 pto 5)", "Cumple"]);
    // El ΔRA del trasdosado es fila de su bloque, no condicionante.
    expect(t.filas.some((f) => f[1].startsWith("Trasdosado"))).toBe(false);
    const uni = hr.memoria(con(edificioDeCaso("unifamiliar")));
    expect(uni.tablas!.map((x) => x.rotulo)).toEqual(["Tabiquería", "Fachada y cubierta, dormitorios: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA", "Fachada, estancias: Ld = 60 dBA, D2m,nT,Atr ≥ 30 dBA"]);
  });

  it("cada tabla en su sitio: las de los elementos tras el ascensor, las de fachada tras el Ld, los condicionantes antes de las uniones", () => {
    const tras = (r: string | RegExp) => tabla(m, r).tras!;
    expect(textoParrafo(m.parrafos[tras("Tabiquería") - 1])).toMatch(/^El ascensor tiene la maquinaria en el hueco/);
    expect(textoParrafo(m.parrafos[tras(/^Fachada y cubierta/) - 1])).toMatch(/^Índice de ruido día de la zona/);
    expect(textoParrafo(m.parrafos[tras("Condicionantes de las soluciones")])).toMatch(/^Se cumplen las condiciones de diseño de las uniones/);
  });

  it("obra existente: el forjado bajo la vivienda de arriba, sin ΔLw, y la flexibilidad en el texto (feature-30)", () => {
    const p: Proyecto = { ...demo, edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
    p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}) };
    const r = hr.memoria(justificarHr({ ...hrEstadoDefaults }, proyectoParaModulo(p, "hr")));
    const t = tabla(r, "Elementos de separación horizontales bajo las viviendas existentes de P1");
    expect(t.filas.map((f) => f[2])).toEqual(["m", "RA", "ΔRA", "ΔRA"]);
    expect(t.filas[2]).toEqual(["Suelo de la vivienda superior", "existente, no es objeto de la intervención", "ΔRA", "no se exige", "0 dBA, sin mejora", "Cumple"]);
    const txt = r.parrafos.map(textoParrafo).join(" ");
    expect(txt).toContain("En el forjado con la vivienda superior existente, la tabla comprueba el ruido aéreo");
    expect(txt).toContain("se aplica el criterio de flexibilidad de la Parte I del CTE (art. 2.3)");
    expect(textoParrafo(r.parrafos[t.tras!])).toMatch(/^En el forjado con la vivienda superior existente/);
    // El local de al lado, con su bloque entre paréntesis.
    expect(tabla(r, "Elementos de separación verticales con recintos de actividad o de instalaciones: Local sin uso (PB)").filas[0][4]).toBe("400 kg/m²");
  });
});

describe("HR · los valores medios del Catálogo", () => {
  it("con P3.1 no cumple con el mínimo: avisa y el arreglo pasa a los medios", () => {
    const j = con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas" } }, {}, demo.justificaciones);
    expect(veredicto(j, "separacion")).toBe("fail");
    expect(avisos(j)).toContain("medios");
    const el = j.elementos.find((e) => e.id === "separacion")!;
    expect(hr.arreglo!(el, j)).toEqual({ etiqueta: "Usar los valores medios del Catálogo", cambios: { medios: true } });
    expect(veredicto(con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas" }, medios: true }, {}, demo.justificaciones), "separacion")).toBe("ok");
  });

  it("los valores propios sustituyen a los del Catálogo", () => {
    const j = con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas", valores: { RA: 55 } } }, {}, demo.justificaciones);
    expect(detalle<"vertical">(j, "separacion")).toMatchObject({ RA: 55, sol: { propios: true } });
    expect(veredicto(j, "separacion")).toBe("ok");
  });
});

describe("HR · la unifamiliar", () => {
  it("aislada: tabiquería de 33 dBA, fachada, cubierta e instalaciones; sin separaciones", () => {
    const j = con(edificioDeCaso("unifamiliar"));
    expect(j.tipologia).toBe("aislada");
    expect(ids(j)).toEqual(["tabiqueria", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones"]);
    // Gran formato con apoyo directo (33 dBA): vale en la aislada, no en un edificio de viviendas (35).
    const gf = { tabiqueria: { id: "tab-lhgf70-yeso" }, apoyo: "directo" as const };
    expect(veredicto(con(edificioDeCaso("unifamiliar"), gf), "tabiqueria")).toBe("ok");
    expect(veredicto(con(demo.edificio, gf, {}, demo.justificaciones), "tabiqueria")).toBe("fail");
  });

  it("adosada (medianeras de SI 2) con estructura independiente: dos hojas de 45 dBA; el ½ pie no llega", () => {
    const j = con(edificioDeCaso("unifamiliar"), { estructura: "independiente" }, {}, medianeras("si"));
    expect(j.tipologia).toBe("adosada");
    expect(ids(j)).toContain("adosada");
    expect(veredicto(j, "adosada")).toBe("ok");
    expect(veredicto(con(edificioDeCaso("unifamiliar"), { estructura: "independiente", hojaAdosada: { id: "sv-lp115-yeso" } }, {}, medianeras("si")), "adosada")).toBe("fail");
  });

  it("adosada con estructura compartida: tabla 3.2 y el suelo flotante de la tabla I.1", () => {
    const j = con(edificioDeCaso("unifamiliar"), {}, {}, medianeras("si"));
    expect(ids(j)).toEqual(["tabiqueria", "separacion", "forjado-adosada", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones"]);
    // Forjado 372 (fila 300) y separación de tipo 2: ΔLw ≥ 11 y ΔRA ≥ 0.
    expect(detalle<"forjado-adosada">(j, "forjado-adosada")?.r).toMatchObject({ cumple: true, dLwExigido: 11, dRAExigido: 0 });
  });
});

describe("HR · los otros edificios de ejemplo", () => {
  it("plurifamiliar con garaje bajo las viviendas: el forjado sobre el garaje entre paréntesis", () => {
    const j = con(edificioDeCaso("plurifamiliar"));
    expect(detalle<"horizontal">(j, "forjado-actividad")).toMatchObject({ garaje: true, separa: ["Garaje (S1)"] });
    expect(j.elementos.find((e) => e.id === "instalaciones")?.detalle).toMatchObject({ condiciones: expect.arrayContaining([expect.stringMatching(/humos del garaje/)]) });
  });

  it("oficinas sin viviendas: solo el ruido exterior, con su aviso", () => {
    const j = con(edificioDeCaso("oficinas"));
    expect(j.tipologia).toBe("otros");
    expect(ids(j)).not.toContain("tabiqueria");
    expect(ids(j)).toContain("fachada-estancias");
    expect(avisos(j)).toContain("otros");
  });

  it("el ascensor con la maquinaria en un cuarto: RA del cerramiento mayor que 50", () => {
    const j = con(demo.edificio, { ascensor: "cuarto" }, {}, demo.justificaciones);
    expect(detalle<"ascensor">(j, "ascensor")).toMatchObject({ modo: "cuarto", RA: 58, r: null });
    expect(veredicto(j, "ascensor")).toBe("ok");
  });
});
