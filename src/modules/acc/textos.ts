// =============================================================================
// Accesibilidad autonómica — Textos (feature-36, paso 5): la frase de la
// cabecera, «Qué entra», la franja de cada elemento, las etiquetas del dibujo y
// de la lista, los avisos y lo que no cumple. PURAS.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import { NOMBRE_COMUNIDAD } from "../../data/comunidades";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { DetalleAcc, ElementoAcc, JustificacionAcc } from "./justificacion";
import { ASCENSOR_D293, ITINERARIOS_D293, RESERVA_D293, type ExigenciaVertical } from "./tablas";

const A = ASCENSOR_D293.datos;
const R = RESERVA_D293.datos;

export const NOMBRE_EXIGENCIA: Record<ExigenciaVertical, string> = {
  ninguna: "no se exige",
  reserva: "reserva del espacio estructural para un ascensor futuro",
  ascensor: "ascensor",
};

/** «3 plantas sobre rasante» */
const plantasTexto = (n: number) => `${n} ${n === 1 ? "planta" : "plantas"} sobre rasante`;
const viviendasTexto = (n: number) => `${n} ${n === 1 ? "vivienda" : "viviendas"}`;

function det(el: ElementoSi<unknown>): DetalleAcc {
  return (el as ElementoAcc).detalle;
}

const elemento = <C extends DetalleAcc["clase"]>(j: JustificacionAcc, c: C) =>
  j.elementos.find((e) => e.detalle.clase === c) as (ElementoAcc & { detalle: Extract<DetalleAcc, { clase: C }> }) | undefined;

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseAcc(j: JustificacionAcc): string {
  const norma = elemento(j, "norma")!.detalle;
  if (!j.comunidad) return "Elige el municipio en La obra: la norma de accesibilidad es la de su comunidad autónoma.";
  if (!j.andalucia) {
    return norma.otra
      ? `${NOMBRE_COMUNIDAD[j.comunidad]}: se justifica con ${norma.otra}, que declara el proyectista.`
      : `${NOMBRE_COMUNIDAD[j.comunidad]}: declara la norma autonómica de accesibilidad. La herramienta solo trae la de Andalucía.`;
  }
  if (!j.residencial) return "Edificio de otros usos: la accesibilidad andaluza se justifica con la Ficha II, fuera del alcance de la herramienta.";
  const fallo = j.elementos.find((e) => e.veredicto === "fail");
  if (fallo) return textoIncumplimientoAcc(fallo)?.titulo ?? "Revisa la accesibilidad.";
  const asc = elemento(j, "ascensor")?.detalle;
  const vertical = asc ? (asc.excluida ? "autopromoción para uso propio, excluida del art. 106" : asc.exigencia === "ninguna" ? "sin comunicación vertical que exigir" : NOMBRE_EXIGENCIA[asc.exigencia]) : "";
  return `Decreto 293/2009: ${j.unifamiliar ? "sin zonas comunes" : "zonas comunes con itinerario accesible"}; ${vertical}.`;
}

export function metricasAcc(j: JustificacionAcc): string {
  if (!j.andalucia) return elemento(j, "norma")!.detalle.otra ?? "norma sin declarar";
  const asc = elemento(j, "ascensor")?.detalle;
  const res = elemento(j, "reserva")?.detalle;
  return [asc ? (asc.excluida ? "106.5" : NOMBRE_EXIGENCIA[asc.exigencia]) : null, res && res.protegida ? `${res.reservadas} reservadas` : null].filter(Boolean).join(" · ") || "Decreto 293/2009";
}

export function piezasAcc(j: JustificacionAcc): { texto: string; acento: boolean }[] {
  if (!j.andalucia) return [{ texto: elemento(j, "norma")!.detalle.otra ? "norma declarada" : "sin norma", acento: !elemento(j, "norma")!.detalle.otra }];
  const asc = elemento(j, "ascensor");
  return asc ? [{ texto: textoEtiquetaAcc(asc), acento: asc.veredicto === "fail" }] : [{ texto: "Decreto 293/2009", acento: false }];
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraAcc(j: JustificacionAcc, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const fila = (titulo: string, detalle: string, t: string) => filas.push({ id: el.id, titulo, detalle, trato: t, estado: trato(estados[el.id]), elementoId: el.id });
    if (d.clase === "norma") fila("Comunidad", d.comunidad ? NOMBRE_COMUNIDAD[d.comunidad] : "sin municipio", d.andalucia ? "Decreto 293/2009" : d.otra ? "declarada" : "sin declarar");
    else if (d.clase === "ascensor") fila("Edificio", `${plantasTexto(d.plantas)} · ${viviendasTexto(d.viviendas)}`, NOMBRE_EXIGENCIA[d.exigencia]);
  }
  return filas;
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaAcc(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "norma":
      return d.andalucia ? "Decreto 293/2009" : d.otra ? "norma declarada" : "sin norma";
    case "itinerarios":
      return "itinerario accesible";
    case "ascensor":
      if (d.excluida) return "excluida (106.5)";
      if (d.unifamiliar && d.autopromocion === undefined && d.exigencia !== "ninguna") return "¿autopromoción?";
      return d.exigencia === "ninguna" ? "sin exigencia" : d.hay ? "ascensor" : d.exigencia === "reserva" ? "reserva de hueco" : "sin ascensor";
    case "reserva":
      return d.protegida === undefined ? "promoción sin declarar" : `${d.reservadas} reservadas`;
    case "existente":
      return d.imposibilidad ? "DA 1.ª" : "lo modificado";
    case "otros_usos":
      return "Ficha II";
  }
}

export function resultadoListaAcc(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "norma":
      if (d.andalucia) return "Andalucía, por el municipio de la obra";
      return d.otra ? `${d.comunidad ? NOMBRE_COMUNIDAD[d.comunidad] : ""}: ${d.otra}` : d.comunidad ? `${NOMBRE_COMUNIDAD[d.comunidad]}: declara la norma` : "elige el municipio en La obra";
    case "itinerarios":
      return d.existente ? "los que se construyen o reforman, con la Ficha III" : "desde el exterior, en las zonas comunes y hasta cada vivienda, con la Ficha III";
    case "ascensor":
      if (d.excluida) return "vivienda de autopromoción individual para uso propio (art. 106.5)";
      if (d.unifamiliar && d.autopromocion === undefined && d.exigencia !== "ninguna") return "declara en La obra si es autopromoción para uso propio (106.5)";
      return `${plantasTexto(d.plantas)} y ${viviendasTexto(d.viviendas)}: ${NOMBRE_EXIGENCIA[d.exigencia]}${d.exigencia !== "ninguna" ? (d.hay ? "; el edificio tiene ascensor" : d.exigencia === "ascensor" ? "; el edificio no lo tiene" : "") : ""}`;
    case "reserva":
      if (d.protegida === undefined) return "declara en La obra si la promoción es protegida o pública";
      if (!d.protegida) return "promoción libre: no hay reserva obligatoria";
      return `${viviendasTexto(d.viviendas)} → ${d.reservadas} reservadas; SUA 9 indica ${d.sr} accesibles`;
    case "existente":
      return d.imposibilidad ? "con la declaración de circunstancias de la DA 1.ª" : "solo los elementos comunitarios que se modifican (art. 2.1 j y 2.2)";
    case "otros_usos":
      return "fuera del alcance de la herramienta";
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaAcc(el: ElementoSi<unknown>, _j: JustificacionAcc, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "norma":
      return {
        clase: "Norma autonómica",
        titulo: el.nombre,
        valor: d.andalucia ? "Decreto 293/2009" : d.otra ? "Declarada" : "Sin declarar",
        estado,
        manda: d.andalucia
          ? "En Andalucía, el Reglamento de accesibilidad se aplica a los elementos de uso comunitario de las edificaciones de vivienda que se construyen, reforman o cambian de uso (art. 2.1 j). El interior de la vivienda libre no reservada no tiene exigencias."
          : "Cada comunidad tiene su norma de accesibilidad. La herramienta solo trae la plantilla de Andalucía: en otra comunidad, el proyectista declara la norma y la justifica con las fichas que pida.",
        nota: !d.comunidad ? "Elige el municipio en La obra." : !d.andalucia && !d.otra ? "Declárala con su referencia (número, fecha y diario oficial)." : undefined,
        filas: [{ k: "Comunidad", v: d.comunidad ? NOMBRE_COMUNIDAD[d.comunidad] : "sin municipio" }, ...(d.otra ? [{ k: "Norma", v: d.otra }] : [])],
        cita: d.andalucia ? "Decreto 293/2009 · art. 2" : "Norma autonómica",
      };
    case "itinerarios":
      return {
        clase: "Itinerarios · art. 104",
        titulo: el.nombre,
        valor: "Art. 104",
        estado,
        manda: `Hay itinerarios accesibles ${ITINERARIOS_D293.datos.tramos.join("; ")}.`,
        nota: "Sus medidas se justifican en la Ficha III de la Orden de 9-01-2012; la herramienta no las imprime (sin transcribir).",
        filas: [],
        cita: "Decreto 293/2009 · art. 104 · Ficha III",
      };
    case "ascensor":
      return {
        clase: "Comunicación vertical · art. 106",
        titulo: el.nombre,
        valor: d.excluida ? "Excluida" : d.exigencia === "ninguna" ? "No se exige" : d.exigencia === "reserva" ? "Reserva" : "Ascensor",
        estado,
        manda: `Con ${A.plantasReserva} plantas sobre rasante y ${A.viviendasReservaMax} viviendas o menos, se reserva el espacio estructural para un ascensor futuro; con más viviendas, o con ${A.plantasAscensor} o más plantas, ascensor, que llega también a los sótanos de aparcamiento (106.4). Las viviendas de autopromoción individual para uso propio quedan excluidas (106.5).`,
        nota: d.existente
          ? "En la reforma se aplica a lo que se modifica; con imposibilidad física, ayudas técnicas (106.6) y la declaración de la DA 1.ª."
          : d.unifamiliar && !d.excluida
            ? "La unifamiliar que no es de autopromoción para uso propio entra en el 106.2 (interpretación: la exclusión del 106.5 solo tiene sentido así)."
            : d.supuesto && d.exigencia !== "ninguna"
              ? "El edificio no dice si tiene ascensor: se supone el que se exige. Márcalo en El edificio."
              : undefined,
        filas: [
          { k: "Plantas sobre rasante", v: String(d.plantas) },
          { k: "Viviendas", v: String(d.viviendas) },
          ...(d.sua9 ? [{ k: "SUA 9 1.1.2", v: d.sua9 === "ascensor" ? "ascensor" : "previsión de ascensor" }] : []),
          { k: "Ascensor en El edificio", v: d.supuesto ? `${d.hay ? "sí" : "no"} (supuesto)` : d.hay ? "sí" : "no" },
          ...(d.garajeSotano && d.exigencia === "ascensor" ? [{ k: "Garaje en sótano", v: "el ascensor llega (106.4)" }] : []),
        ],
        cita: "Decreto 293/2009 · art. 106",
      };
    case "reserva":
      return {
        clase: "Viviendas reservadas · Ficha IV",
        titulo: el.nombre,
        valor: d.protegida === undefined ? "—" : String(d.reservadas),
        unidad: d.protegida === undefined ? undefined : "viviendas",
        estado,
        manda: `En las promociones protegidas o de las Administraciones públicas se reservan viviendas para personas con movilidad reducida: de ${R.desde} a ${R.unaHasta} viviendas, una; con más de ${R.unaHasta}, el ${R.porcentaje} %, redondeado. En la promoción libre, la reserva es voluntaria.`,
        nota: d.protegida === undefined ? "Declara en La obra si la promoción es protegida o pública." : d.sr < d.reservadas ? `Indica en SUA 9 al menos ${d.reservadas} viviendas accesibles para usuarios de silla de ruedas.` : undefined,
        filas: [
          { k: "Viviendas", v: String(d.viviendas) },
          { k: "Promoción", v: d.protegida === undefined ? "sin declarar" : d.protegida ? "protegida o pública" : "libre" },
          { k: "Accesibles en SUA 9", v: String(d.sr) },
        ],
        cita: "Ley 4/2017 · art. 58.1 · Orden de 9-01-2012 · Ficha IV",
      };
    case "existente":
      return {
        clase: "Edificio existente · DA 1.ª",
        titulo: el.nombre,
        valor: d.imposibilidad ? "Con imposibilidad" : "Lo modificado",
        estado,
        manda: "En la reforma de los espacios comunitarios, el Reglamento se aplica solo a los elementos o partes que se modifican. Si las condiciones físicas, históricas o normativas impiden cumplirlo del todo, la memoria indica de forma motivada los artículos imposibles de cumplir y se mejoran las condiciones existentes con ayudas técnicas.",
        filas: d.imposibilidad ? [{ k: "Declaración", v: d.imposibilidad }] : [],
        cita: "Decreto 293/2009 · art. 2.1 j y 2.2 · DA 1.ª",
      };
    case "otros_usos":
      return {
        clase: "Otros usos",
        titulo: el.nombre,
        valor: "Ficha II",
        estado,
        manda: "Los edificios, establecimientos e instalaciones que no son de vivienda se justifican con la Ficha II de la Orden de 9-01-2012.",
        filas: [],
        cita: "Orden de 9-01-2012 · Ficha II",
      };
  }
}

// ── Avisos y lo que no cumple ───────────────────────────────────────────────

export function textoAvisoAcc(a: Aviso): TextoSi {
  if (a.id === "manda-decreto") {
    return {
      titulo: "El Decreto 293/2009 pide ascensor y SUA 9 solo su previsión.",
      detalle: "Se cumple el más exigente de los dos: el ascensor del Decreto (art. 106.2). Ninguna de las dos normas fija cuál prevalece (interpretación).",
    };
  }
  if (a.id === "manda-sua9") {
    return {
      titulo: "SUA 9 pide ascensor y el Decreto 293/2009 no.",
      detalle: "Se cumple el más exigente de los dos: el ascensor de SUA 9 (1.1.2).",
    };
  }
  if (a.id === "reserva-menos-17") {
    return {
      titulo: "Promoción protegida de menos de 17 viviendas: sin reserva.",
      detalle: "La Ley 4/2017 fija un mínimo del 4 % sin umbral, «en la forma que se determine reglamentariamente», y el umbral de 17 es del Reglamento. Confírmalo con la Administración.",
    };
  }
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function textoIncumplimientoAcc(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "norma") {
    return d.comunidad
      ? { titulo: "Falta la norma autonómica de accesibilidad.", detalle: `Declárala con su referencia: la herramienta solo trae la de Andalucía y la obra está en ${NOMBRE_COMUNIDAD[d.comunidad]}.` }
      : { titulo: "Falta el municipio de la obra.", detalle: "La norma de accesibilidad es la de la comunidad autónoma: elige el municipio en La obra." };
  }
  if (d.clase === "ascensor") {
    if (d.unifamiliar && d.autopromocion === undefined) {
      return {
        titulo: "Falta decir si la vivienda es de autopromoción para uso propio.",
        detalle: `Con ${plantasTexto(d.plantas)}, el art. 106.2 pide ${NOMBRE_EXIGENCIA[d.exigencia]} salvo en la autopromoción individual para uso propio (106.5). Contéstalo en La obra, «Régimen de la promoción».`,
      };
    }
    return {
      titulo: "El Decreto 293/2009 exige ascensor y el edificio no lo tiene.",
      detalle: `Con ${plantasTexto(d.plantas)} y ${viviendasTexto(d.viviendas)} (art. 106.2 b). Márcalo en El edificio.`,
    };
  }
  if (d.clase === "reserva") {
    return d.protegida === undefined
      ? { titulo: "Falta decir si la promoción es protegida o pública.", detalle: "Decide la reserva de viviendas para personas con movilidad reducida (Ley 4/2017, art. 58.1). Contéstalo en La obra, «Régimen de la promoción»." }
      : { titulo: `Faltan viviendas accesibles: se reservan ${d.reservadas} y SUA 9 indica ${d.sr}.`, detalle: `Indica en SUA 9 al menos ${d.reservadas} viviendas accesibles para usuarios de silla de ruedas (Ley 4/2017, art. 58.1; Ficha IV).` };
  }
  return null;
}

export function describirDibujoAcc(j: JustificacionAcc): string {
  return j.andalucia ? "Sección del edificio con las zonas comunes y la comunicación vertical que exige el Decreto 293/2009." : "Sección del edificio: la accesibilidad autonómica se justifica con la norma que declara el proyectista.";
}
