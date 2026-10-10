// =============================================================================
// DB-SI, SI 4 — La memoria redactada (feature-19): la dotación de la tabla 1.1,
// lo que se exige con su porqué y lo que no, y la señalización. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi4, Instalacion, JustificacionSi4 } from "./justificacion";

function parrafoExtintores(d: Extract<DetalleSi4, { clase: "extintores" }>): Trozo[] {
  if (d.total === 0) {
    return ["El interior de la vivienda no es origen de evacuación, por lo que no se requieren extintores portátiles conforme a la tabla 1.1 de SI 4."];
  }
  const out: Trozo[] = ["Se disponen extintores portátiles de eficacia ", { v: "21A-113B" }, " de modo que el recorrido hasta alguno de ellos, desde todo origen de evacuación, no excede de 15 m en cada planta"];
  if (d.plantas.length > 0) out.push(` (${listaY(d.plantas.map((p) => p.etiqueta))})`);
  if (d.locales.length > 0) out.push(", y uno en el exterior de cada local de riesgo especial, próximo a su puerta de acceso, con los necesarios en su interior para que el recorrido no exceda de 15 m");
  out.push(" (SI 4, tabla 1.1 y su nota 1). Su parte superior queda entre 80 y 120 cm sobre el suelo (RD 513/2017).");
  return out;
}

/**
 * En un edificio existente (feature-30; K-INT.14 y 15): lo que la obra hace
 * exigible se dispone; lo que ya existía no se modifica, salvo que la obra
 * afecte a su soporte o a su recorrido (criterio 10).
 */
const ARTICULO: Record<Instalacion, string> = {
  bie: "las",
  columna: "la",
  deteccion: "la",
  alarma: "el",
  hidrantes: "los",
  extincion: "la",
  ascensor: "el",
};

function parrafosExistente(j: JustificacionSi4): Trozo[][] {
  const ex = j.existente!;
  const p: Trozo[][] = [];
  const ext = j.elementos.find((el) => el.detalle.clase === "extintores")?.detalle;
  const nuevas = ext && ext.clase === "extintores" ? ext.plantas.filter((pl) => !ex.extintoresAntes.has(pl.nivel)) : [];
  if (ex.pasaAVivienda) {
    p.push([
      "El interior de la vivienda no es origen de evacuación (DB-SI, Anejo SI A), por lo que no requiere dotación propia de extintores; la de su planta se refiere a los orígenes de evacuación de las zonas comunes.",
    ]);
  }
  if (nuevas.length > 0) {
    p.push([
      "Con la obra se disponen extintores portátiles de eficacia ",
      { v: "21A-113B" },
      ` en ${listaY(nuevas.map((pl) => pl.etiqueta))}, de modo que el recorrido hasta alguno de ellos, desde todo origen de evacuación, no excede de 15 m (SI 4, tabla 1.1). Su parte superior queda entre 80 y 120 cm sobre el suelo (RD 513/2017).`,
    ]);
  }
  const existentes: string[] = [];
  if (ex.extintoresAntes.size > 0) existentes.push("los extintores de las zonas comunes");
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase !== "dotacion" && d.clase !== "hidrantes") continue;
    if (!d.exige) continue;
    if (ex.antes.has(el.id)) {
      const donde = listaY([...new Set(d.reglas.filter((r) => r.exige).map((r) => r.donde.replace(/^en (el|la) /, "del ").replace(/^en todo el /, "de todo el ")))]);
      existentes.push(d.clase === "hidrantes" ? "los hidrantes exteriores" : `${ARTICULO[d.inst]} ${el.nombre.toLowerCase()} ${donde}`);
    } else {
      const reglas = d.clase === "dotacion" ? d.reglas.filter((r) => r.exige) : d.reglas;
      p.push([`Con la obra se dispone `, { v: el.nombre.toLowerCase() }, `, por exigirlo la tabla 1.1 (${reglas.map((r) => `${r.regla.toLowerCase()}: ${r.valor}`).join("; ")}).`]);
    }
  }
  const varia = nuevas.length > 0 || j.elementos.some((el) => (el.detalle.clase === "dotacion" || el.detalle.clase === "hidrantes") && el.detalle.exige && !ex.antes.has(el.id));
  if (!varia) p.push(["La obra no cambia las dotaciones que la tabla 1.1 exige al edificio, que dependen de su uso, de su altura de evacuación y de su superficie construida."]);
  if (existentes.length > 0) {
    p.push([
      `Las instalaciones de protección contra incendios existentes —${listaY(existentes)}— no son objeto de la intervención; si la obra afecta a elementos que les sirven de soporte o a zonas por las que discurren sus componentes, se adecúan a este DB (DB-SI, Introducción III, criterio 10). La obra no menoscaba las condiciones de seguridad preexistentes (criterio 11).`,
    ]);
  }
  return p;
}

export function memoriaSi4(j: JustificacionSi4): MemoriaDoc {
  if (j.existente) {
    return {
      titulo: "Instalaciones de protección contra incendios",
      norma: "DB-SI 4",
      parrafos: parrafosExistente(j),
      fuente: ["DB-SI · SI 4 (consolidado 4-mar-2025)", "tabla 1.1", "Introducción III, criterios 10 y 11", "Anejo SI A", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
    };
  }
  const parrafos: Trozo[][] = [];
  const no: string[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "extintores") parrafos.push(parrafoExtintores(d));
    if (d.clase === "dotacion") {
      if (d.exige) {
        const reglas = d.reglas.filter((r) => r.exige);
        parrafos.push([`Se dispone `, { v: el.nombre.toLowerCase() }, ` ${listaY([...new Set(reglas.map((r) => r.donde))])}, por exigirlo la tabla 1.1 (${reglas.map((r) => `${r.regla.toLowerCase()}: ${r.valor}`).join("; ")})${d.inst === "bie" ? ", con equipos de 25 mm" : ""}.`]);
      } else if (d.nota) {
        parrafos.push([d.nota]);
      } else {
        no.push(el.nombre.toLowerCase());
      }
    }
    if (d.clase === "hidrantes") {
      if (d.exige) {
        parrafos.push([
          `Se requiere${d.numero > 1 ? "n" : ""} `,
          { v: `${d.numero} hidrante${d.numero > 1 ? "s" : ""} exterior${d.numero > 1 ? "es" : ""}` },
          d.publico ? ", que se cubre con el hidrante de la vía pública situado a menos de 100 m de la fachada accesible del edificio (tabla 1.1, nota 3)." : " del proyecto, que puede conectarse a la red pública de abastecimiento (tabla 1.1, nota 3).",
        ]);
      } else {
        no.push("hidrantes exteriores");
      }
    }
    if (d.clase === "local") {
      parrafos.push(["El local sin actividad definida se dotará de las instalaciones que correspondan a su uso en el proyecto de su actividad."]);
    }
  }
  if (no.length > 0) parrafos.push([`Conforme a la tabla 1.1, no se requieren ${listaY(no)}.`]);
  parrafos.push([
    "La señalización de las instalaciones manuales de protección contra incendios cumple el Reglamento de instalaciones de protección contra incendios (RD 513/2017), Anexo I, sección 2.ª (SI 4, ap. 2).",
  ]);
  return {
    titulo: "Instalaciones de protección contra incendios",
    norma: "DB-SI 4",
    parrafos,
    fuente: ["DB-SI · SI 4 (consolidado 4-mar-2025)", "tabla 1.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
