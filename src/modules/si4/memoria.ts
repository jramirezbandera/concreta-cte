// =============================================================================
// DB-SI, SI 4 — La memoria redactada (feature-19): la dotación de la tabla 1.1,
// lo que se exige con su porqué y lo que no, y la señalización. PURA.
//
// La tabla «Instalación | Norma | Proyecto | Cumple» (feature-31) lleva cada
// instalación de la tabla 1.1 que el módulo mira: en «Norma», si se exige y por
// qué regla; en «Proyecto», lo que se dispone. El texto se queda con el criterio
// y las condiciones que la tabla no dice (la altura del extintor, la nota 3).
// =============================================================================

import { soloTablas } from "../../lib/cte/memoria";
import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { NO_SE_EXIGE, tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { USOS } from "../../lib/edificio/usos";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi4, ElementoSi4, JustificacionSi4 } from "./justificacion";
import { DOTACION_TABLA_1_1 } from "./tablas";

const T = DOTACION_TABLA_1_1.datos;
const EFICACIA = T.enGeneral.extintorEficacia;

/** Lo que la tabla 1.1 pide en cada planta: «21A-113B, ≤ 15 m desde todo origen». */
const NORMA_EXTINTOR = `${EFICACIA}, ≤ ${T.enGeneral.extintorRecorrido_m} m desde todo origen`;

/** «Bocas de incendio equipadas» y «Hidrantes exteriores» llevan el verbo en plural. */
function plural(nombre: string): boolean {
  return /s$/.test(nombre.split(" ")[0]);
}

/** La regla por la que se exige: «garaje > 500 m² construidos: se exige». */
function normaExigida(el: ElementoSi4): string {
  const d = el.detalle;
  if (d.clase !== "dotacion" && d.clase !== "hidrantes") return NO_SE_EXIGE;
  if (!d.exige) return NO_SE_EXIGE;
  const reglas = [...new Set(d.reglas.filter((r) => r.exige).map((r) => r.corta))];
  return `${listaY(reglas)}: ${plural(el.nombre) ? "se exigen" : "se exige"}`;
}

/** Lo que se dispone de una instalación exigida: dónde, y el diámetro de la BIE o el hidrante que cuenta. */
function proyectoExigida(el: ElementoSi4): string {
  const d = el.detalle;
  if (d.clase === "hidrantes") {
    return d.publico ? `hidrante público a < ${T.hidrantePublicoMax_m} m` : `${d.numero} ${d.numero > 1 ? "hidrantes" : "hidrante"} del proyecto`;
  }
  if (d.clase !== "dotacion") return "";
  const reglas = d.reglas.filter((r) => r.exige);
  // El ascensor de emergencia, en las plantas que lo piden.
  const donde = listaY([...new Set(reglas.map((r) => (d.inst === "ascensor" ? `en ${r.valor}` : r.donde)))]);
  return d.inst === "bie" ? `BIE de ${T.bie_mm} mm ${donde}` : donde;
}

/** Los locales de riesgo especial, por su nombre: «instalaciones (S1)». */
function nombresLocales(d: Extract<DetalleSi4, { clase: "extintores" }>): string {
  return listaY(d.locales.map((z) => `${USOS[z.uso].etiqueta.toLowerCase()} (${z.plantas})`));
}

/** Las filas de una obra nueva: cada instalación de la tabla 1.1 que se mira, se exija o no. */
function filasObraNueva(j: JustificacionSi4): FilaNorma[] {
  const filas: FilaNorma[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const ok = el.veredicto === "fail" ? "fail" : "ok";
    if (d.clase === "extintores") {
      filas.push(
        d.plantas.length > 0
          ? ["Extintores portátiles", NORMA_EXTINTOR, `${EFICACIA}, ≤ ${T.enGeneral.extintorRecorrido_m} m: ${listaY(d.plantas.map((p) => p.etiqueta))}`, ok]
          : ["Extintores portátiles", NO_SE_EXIGE, "no se disponen", ok],
      );
      if (d.locales.length > 0) filas.push(["Extintores de los locales de riesgo especial", `${EFICACIA} junto a su puerta`, `junto a la puerta: ${nombresLocales(d)}`, ok]);
    }
    if (d.clase === "dotacion" || d.clase === "hidrantes") {
      if (d.exige) filas.push([el.nombre, normaExigida(el), proyectoExigida(el), ok]);
      // La detección del garaje bajo rasante que no pide la tabla 1.1 la puede pedir SI 3 (la nota va en el texto).
      else if (d.clase === "dotacion" && d.nota) filas.push([el.nombre, NO_SE_EXIGE, "según SI 3, ap. 8", ok]);
      else filas.push([el.nombre, NO_SE_EXIGE, plural(el.nombre) ? "no se disponen" : "no se dispone", ok]);
    }
  }
  return filas;
}

/**
 * En un edificio existente (feature-30; K-INT.14 y 15): lo que la obra hace
 * exigible se dispone; lo que ya existía no se modifica, salvo que la obra
 * afecte a su soporte o a su recorrido (criterio 10). La tabla lleva solo lo
 * que la tabla 1.1 exige, con «existente, no se modifica» en lo que ya había.
 */
function memoriaExistente(j: JustificacionSi4): { parrafos: Trozo[][]; filas: FilaNorma[]; tras: number } {
  const ex = j.existente!;
  const p: Trozo[][] = [];
  const filas: FilaNorma[] = [];
  const ext = j.elementos.find((el) => el.detalle.clase === "extintores");
  const de = ext?.detalle.clase === "extintores" ? ext.detalle : undefined;
  const nuevas = de ? de.plantas.filter((pl) => !ex.extintoresAntes.has(pl.nivel)) : [];
  let hayExistentes = false;
  if (ex.pasaAVivienda) {
    p.push([
      "El interior de la vivienda no es origen de evacuación (DB-SI, Anejo SI A), por lo que no requiere dotación propia de extintores; la de su planta se refiere a los orígenes de evacuación de las zonas comunes.",
    ]);
  }
  if (ext && (nuevas.length > 0 || ex.extintoresAntes.size > 0)) {
    const proyecto: string[] = [];
    if (nuevas.length > 0) proyecto.push(`${EFICACIA}, ≤ ${T.enGeneral.extintorRecorrido_m} m: ${listaY(nuevas.map((pl) => pl.etiqueta))}`);
    if (ex.extintoresAntes.size > 0) proyecto.push(nuevas.length > 0 ? "el resto, existentes" : "existentes, no se modifican");
    filas.push(["Extintores portátiles", NORMA_EXTINTOR, proyecto.join("; "), ext.veredicto === "fail" ? "fail" : "ok"]);
    hayExistentes = ex.extintoresAntes.size > 0;
  }
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase !== "dotacion" && d.clase !== "hidrantes") continue;
    if (!d.exige) continue;
    const antes = ex.antes.has(el.id);
    hayExistentes ||= antes;
    filas.push([el.nombre, normaExigida(el), antes ? (plural(el.nombre) ? "existentes, no se modifican" : "existente, no se modifica") : proyectoExigida(el), el.veredicto === "fail" ? "fail" : "ok"]);
  }
  const varia = nuevas.length > 0 || j.elementos.some((el) => (el.detalle.clase === "dotacion" || el.detalle.clase === "hidrantes") && el.detalle.exige && !ex.antes.has(el.id));
  p.push([
    varia
      ? "Con la obra se disponen las instalaciones que la tabla 1.1 pasa a exigir al edificio por su uso, su altura de evacuación y su superficie construida."
      : "La obra no cambia las dotaciones que la tabla 1.1 exige al edificio, que dependen de su uso, de su altura de evacuación y de su superficie construida.",
  ]);
  const tras = p.length;
  if (nuevas.length > 0) p.push(["La parte superior de los extintores nuevos queda entre 80 y 120 cm sobre el suelo (RD 513/2017)."]);
  if (hayExistentes) {
    // Cuáles son las existentes lo dice la tabla.
    p.push([
      "Las instalaciones de protección contra incendios existentes no son objeto de la intervención; si la obra afecta a elementos que les sirven de soporte o a zonas por las que discurren sus componentes, se adecúan a este DB (DB-SI, Introducción III, criterio 10). La obra no menoscaba las condiciones de seguridad preexistentes (criterio 11).",
    ]);
  }
  return { parrafos: p, filas, tras };
}

export function memoriaSi4(j: JustificacionSi4): MemoriaDoc {
  if (j.existente) {
    const { parrafos, filas, tras } = memoriaExistente(j);
    return {
      titulo: "Instalaciones de protección contra incendios",
      norma: "DB-SI 4",
      parrafos,
      tablas: soloTablas(tablaNorma(filas, { parametro: "Instalación", tras })),
      fuente: ["DB-SI · SI 4 (consolidado 4-mar-2025)", "tabla 1.1", "Introducción III, criterios 10 y 11", "Anejo SI A", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
    };
  }
  // Lo exigido y lo dispuesto van en la tabla, tras el primer párrafo (feature-31):
  // aquí, de dónde sale la dotación y las condiciones que la tabla no dice.
  const ext = j.elementos.find((el) => el.detalle.clase === "extintores")?.detalle;
  const de = ext?.clase === "extintores" ? ext : undefined;
  const parrafos: Trozo[][] = [
    [
      `La dotación de instalaciones de protección contra incendios es la que exige la tabla 1.1 de SI 4 por el uso, la altura de evacuación y la superficie construida de cada parte del edificio${j.comp.riesgo.aparcamiento ? "; el garaje se dota por separado del resto" : ""}.${de?.unifamiliar && de.plantas.length === 0 ? " El interior de la vivienda no es origen de evacuación (Anejo SI A), por lo que sus plantas no requieren extintores portátiles." : ""}`,
    ],
  ];
  if (de && de.total > 0) {
    parrafos.push([
      `${de.locales.length > 0 ? "El extintor de cada local de riesgo especial se sitúa en el exterior, próximo a su puerta de acceso, con los necesarios en su interior para que el recorrido no exceda de 15 m (SI 4, tabla 1.1, nota 1). " : ""}La parte superior de los extintores queda entre 80 y 120 cm sobre el suelo (RD 513/2017).`,
    ]);
  }
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "dotacion" && !d.exige && d.nota) parrafos.push([d.nota]);
    if (d.clase === "hidrantes" && d.exige) {
      parrafos.push([
        d.publico
          ? `El hidrante exigido se cubre con el de la vía pública situado a menos de ${T.hidrantePublicoMax_m} m de la fachada accesible del edificio (tabla 1.1, nota 3).`
          : `${d.numero > 1 ? "Los hidrantes del proyecto pueden" : "El hidrante del proyecto puede"} conectarse a la red pública de abastecimiento (tabla 1.1, nota 3).`,
      ]);
    }
    if (d.clase === "local") {
      parrafos.push(["El local sin actividad definida se dotará de las instalaciones que correspondan a su uso en el proyecto de su actividad."]);
    }
  }
  parrafos.push([
    "La señalización de las instalaciones manuales de protección contra incendios cumple el Reglamento de instalaciones de protección contra incendios (RD 513/2017), Anexo I, sección 2.ª (SI 4, ap. 2).",
  ]);
  return {
    titulo: "Instalaciones de protección contra incendios",
    norma: "DB-SI 4",
    parrafos,
    tablas: soloTablas(tablaNorma(filasObraNueva(j), { parametro: "Instalación", tras: 1 })),
    fuente: ["DB-SI · SI 4 (consolidado 4-mar-2025)", "tabla 1.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
