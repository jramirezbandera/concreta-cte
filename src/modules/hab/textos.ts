// =============================================================================
// Habitabilidad — Textos (feature-32): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { NOMBRE_AMBITO, NOMBRE_MEDIDA, textoFraccion, type NormaHabitabilidad } from "../../lib/habitabilidad/norma";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { ComprobacionHueco, DetalleHab, ElementoHab, FaltaEstancia, JustificacionHab } from "./justificacion";

/** «12,50 m²». */
export function m2(v: number | null): string {
  if (v === null) return "sin dato";
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;
}

/** «3 viviendas», «1 vivienda». */
export function viviendas(n: number): string {
  return `${n} ${n === 1 ? "vivienda" : "viviendas"}`;
}

function det(el: ElementoSi<unknown>): DetalleHab {
  return (el as ElementoHab).detalle;
}

const NOMBRE_FALTA: Record<FaltaEstancia, string> = {
  util: "la superficie útil",
  hueco: "el hueco",
  acristalada: "la superficie acristalada",
  practicable: "la superficie practicable",
};

/** «la superficie útil y el hueco». */
export function textoFaltan(f: readonly FaltaEstancia[]): string {
  const t = f.map((x) => NOMBRE_FALTA[x]);
  return t.length <= 1 ? (t[0] ?? "") : `${t.slice(0, -1).join(", ")} y ${t.at(-1)}`;
}

/** Lo que pide una norma, en una línea: «iluminación 1/8 del hueco; ventilación, el mismo hueco». */
export function resumenNorma(n: NormaHabitabilidad): string {
  const il = `iluminación ${textoFraccion(n.iluminacion.fraccion)} de la superficie útil (${NOMBRE_MEDIDA[n.iluminacion.mide]})`;
  const ve =
    n.ventilacion === "conjunta"
      ? "ventilación por el mismo hueco"
      : `ventilación ${textoFraccion(n.ventilacion.fraccion)} (${NOMBRE_MEDIDA[n.ventilacion.mide]})`;
  return `${il}; ${ve}`;
}

/** «≥ 1,60 m²»: lo exigido de una comprobación. */
export function exigido(c: ComprobacionHueco): string {
  return c.exigido_m2 === null ? "Su · " + textoFraccion(c.fraccion) : `≥ ${m2(c.exigido_m2)}`;
}

const estancias = (j: JustificacionHab) => j.elementos.filter((e) => e.detalle.clase === "estancia");

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHab(j: JustificacionHab): string {
  if (!j.aplica) return "Sin viviendas en lo que se proyecta: la habitabilidad no se justifica.";
  if (j.normas.length === 0) return "Falta declarar la norma de habitabilidad del municipio, en Los datos de la obra.";
  const sin = j.viviendas.filter((v) => v.estancias.length === 0);
  if (sin.length > 0) return `Faltan las estancias de ${sin.map((v) => v.nombre.toLowerCase()).join(", ")}: con su superficie y sus huecos.`;
  const es = estancias(j);
  const ko = es.filter((e) => e.veredicto === "fail");
  const dens = j.elementos.find((e) => e.detalle.clase === "densidad" && e.veredicto === "fail");
  if (ko.length === 0 && !dens) return `${es.length} ${es.length === 1 ? "estancia cumple" : "estancias cumplen"} con ${j.normas.map((n) => n.referencia).join(" y ")}.`;
  const partes = [ko.length > 0 ? `${ko.length} de ${es.length} estancias no cumplen o les falta un dato` : "", dens ? "la densidad supera el máximo" : ""].filter(Boolean);
  return `${partes.join(" y ")}.`.replace(/^./, (c) => c.toUpperCase());
}

export function metricasHab(j: JustificacionHab): string {
  if (!j.aplica) return "sin viviendas";
  const es = estancias(j);
  const ok = es.filter((e) => e.veredicto === "ok").length;
  return `${viviendas(j.viviendas.reduce((a, v) => a + v.cantidad, 0))} · estancias ${ok}/${es.length}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHab(j: JustificacionHab, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  return j.viviendas.map((v) => {
    const suyas = j.elementos.filter((e) => e.detalle.clase === "estancia" && e.detalle.vivienda.id === v.id);
    const ko = suyas.find((e) => estados[e.id] === "ko");
    const primero = ko ?? suyas[0];
    return {
      id: v.id,
      titulo: v.nombre,
      detalle: `${v.cantidad > 1 ? `${v.cantidad} · ` : ""}${v.estancias.length} estancias`,
      trato: v.estancias.length === 0 ? "sin estancias" : `${suyas.length} comprobaciones`,
      estado: v.estancias.length === 0 ? "ko" : trato(ko ? "ko" : undefined),
      elementoId: primero?.id ?? `viv-${v.id}`,
    };
  });
}

export function piezasHab(j: JustificacionHab): { texto: string; acento: boolean }[] {
  if (!j.aplica) return [{ texto: "sin viviendas", acento: false }];
  if (j.normas.length === 0) return [{ texto: "sin norma", acento: true }];
  const es = estancias(j);
  const ko = es.filter((e) => e.veredicto === "fail").length;
  const dens = j.elementos.find((e) => e.detalle.clase === "densidad");
  return [
    { texto: `estancias ${es.length - ko}/${es.length}`, acento: ko > 0 || es.length === 0 },
    ...(dens && dens.detalle.clase === "densidad" ? [{ texto: `densidad ${dens.detalle.viviendas}/${dens.detalle.maximo}`, acento: !dens.detalle.cumple }] : []),
  ];
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHab(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "sin_norma":
      return "Sin norma";
    case "norma":
      return `Norma: ${textoFraccion(d.norma.iluminacion.fraccion)}${d.norma.ventilacion === "conjunta" ? "" : ` y ${textoFraccion(d.norma.ventilacion.fraccion)}`}`;
    case "sin_estancias":
      return `${d.vivienda.corto}: sin estancias`;
    case "estancia":
      return `${d.vivienda.corto} · ${d.estancia.nombre}`;
    case "densidad":
      return `${viviendas(d.viviendas)} / ${d.maximo}`;
  }
}

export function resultadoListaHab(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "sin_norma":
      return "Declárala en Los datos de la obra";
    case "norma":
      return resumenNorma(d.norma);
    case "sin_estancias":
      return "Describe sus estancias";
    case "estancia": {
      if (d.faltan.length > 0) return `Falta ${textoFaltan(d.faltan)}`;
      const partes = [`iluminación ${m2(d.iluminacion.proyecto_m2)} ${exigido(d.iluminacion)}`];
      if (d.ventilacion) partes.push(`ventilación ${m2(d.ventilacion.proyecto_m2)} ${exigido(d.ventilacion)}`);
      if (d.minima) partes.push(`Su ${m2(d.estancia.util_m2)} ≥ ${m2(d.minima.exigida_m2)}`);
      return partes.join(" · ");
    }
    case "densidad":
      return `${viviendas(d.viviendas)} frente a un máximo de ${d.maximo} (${m2(d.superficie_m2)} / ${d.m2PorVivienda} m²)`;
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaHab(el: ElementoSi<unknown>, _j: JustificacionHab, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "sin_norma":
      return {
        clase: "Norma de aplicación",
        titulo: el.nombre,
        valor: "Sin declarar",
        estado,
        manda: "La fracción de hueco la fija el planeamiento del municipio (y, en vivienda protegida, la comunidad autónoma): la herramienta no la supone. Declárala en Los datos de la obra, con su artículo.",
        filas: [],
        cita: "Los datos de la obra · Habitabilidad",
      };
    case "norma":
      return {
        clase: NOMBRE_AMBITO[d.norma.ambito],
        titulo: d.norma.referencia,
        valor: textoFraccion(d.norma.iluminacion.fraccion),
        unidad: "de la superficie útil",
        estado,
        manda: `${resumenNorma(d.norma)}. Declarada por el proyectista.`,
        nota: d.otroMunicipio ? `Ligada a ${d.norma.municipio ?? "otro municipio"}, no al de la obra.` : undefined,
        filas: [
          { k: "Computan", v: d.norma.computan.length > 0 ? `${d.norma.computan.length} tipos de estancia` : "ninguna" },
          ...(d.norma.densidad ? [{ k: "Densidad", v: `${d.norma.densidad.m2PorVivienda} m² por vivienda` }] : []),
        ],
        cita: d.norma.referencia,
      };
    case "sin_estancias":
      return {
        clase: "Estancias",
        titulo: d.vivienda.nombre,
        valor: "0",
        unidad: "estancias",
        estado,
        manda: "Para justificar los huecos hace falta cada estancia de la vivienda con su superficie útil y lo que mide su hueco. Proponlas desde el tipo y completa las superficies.",
        filas: [
          { k: "Dormitorios", v: String(d.vivienda.dormitorios) },
          { k: "Baños y aseos", v: String(d.vivienda.banos + d.vivienda.aseos) },
        ],
        cita: "Decisiones · estancias",
      };
    case "estancia": {
      const filas = [
        { k: "Superficie útil", v: m2(d.estancia.util_m2) },
        { k: `Iluminación · ${NOMBRE_MEDIDA[d.iluminacion.mide]}`, v: `${m2(d.iluminacion.proyecto_m2)} ${exigido(d.iluminacion)}` },
      ];
      if (d.ventilacion) filas.push({ k: `Ventilación · ${NOMBRE_MEDIDA[d.ventilacion.mide]}`, v: `${m2(d.ventilacion.proyecto_m2)} ${exigido(d.ventilacion)}` });
      if (d.minima) filas.push({ k: "Superficie mínima", v: `≥ ${m2(d.minima.exigida_m2)}` });
      return {
        clase: `${d.vivienda.nombre} · ${d.norma.referencia}`,
        titulo: d.estancia.nombre,
        valor: d.iluminacion.proyecto_m2 === null ? "—" : m2(d.iluminacion.proyecto_m2).replace(" m²", ""),
        unidad: d.iluminacion.exigido_m2 === null ? "m²" : `m² · mínimo ${m2(d.iluminacion.exigido_m2)}`,
        estado,
        manda: `${resumenNorma(d.norma)}.`,
        nota: d.faltan.length > 0 ? `Falta ${textoFaltan(d.faltan)}: sin dato no se da por buena.` : undefined,
        filas,
        uso: el.uso,
        cita: d.norma.referencia,
      };
    }
    case "densidad":
      return {
        clase: "Densidad de viviendas",
        titulo: d.norma.densidad?.referencia ? `${d.norma.referencia}, ${d.norma.densidad.referencia}` : d.norma.referencia,
        valor: String(d.viviendas),
        unidad: `viviendas · máximo ${d.maximo}`,
        estado,
        manda: `Número máximo de viviendas: superficie ${d.superficie === "construida" ? "construida" : "útil"} residencial entre ${d.m2PorVivienda} m², ${d.norma.densidad?.redondeo === "al_mas_proximo" ? "redondeado al entero más próximo" : "por defecto"}.`,
        nota: d.declarada ? "Superficie declarada por el proyectista." : d.conUtil ? "Superficie de las zonas de vivienda de El edificio, con la útil donde falta la construida." : "Superficie de las zonas de vivienda de El edificio.",
        filas: [
          { k: "Superficie residencial", v: m2(d.superficie_m2) },
          { k: "Viviendas", v: String(d.viviendas) },
          { k: "Máximo", v: String(d.maximo) },
          ...(d.antes ? [{ k: "Antes de la obra", v: `${viviendas(d.antes.viviendas)}, máximo ${d.antes.maximo}` }] : []),
        ],
        cita: d.norma.referencia,
      };
  }
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHab(a: Aviso): TextoSi {
  const x = a.datos as Record<string, string | number | boolean>;
  if (a.id.startsWith("municipio-")) {
    return {
      titulo: "La norma declarada es de otro municipio.",
      detalle: `«${x.referencia}» está ligada a ${x.municipio || "otro municipio"} y la obra está en ${x.obra || "otro"}. Comprueba que es la que rige aquí.`,
    };
  }
  if (a.id.startsWith("dormitorios-")) {
    return {
      titulo: `${x.vivienda}: los dormitorios no coinciden con El edificio.`,
      detalle: `Hay ${x.estancias} estancias de dormitorio y el tipo de El edificio tiene ${x.edificio}. Ajusta uno de los dos: HS 3 y HS 4 leen El edificio.`,
    };
  }
  if (a.id.startsWith("util-")) {
    return {
      titulo: `${x.vivienda}: las estancias suman más que la vivienda.`,
      detalle: `Suman ${m2(Number(x.suma))} y la superficie útil del tipo en El edificio es ${m2(Number(x.edificio))}.`,
    };
  }
  if (a.id.startsWith("superficie-")) {
    return {
      titulo: "Confirma la superficie que computa para la densidad.",
      detalle: `Se ha tomado la de las zonas de vivienda de El edificio${x.conUtil ? ", con la útil donde falta la construida (menor: del lado de la seguridad)" : ""}. Si la norma cuenta otra cosa (solo sobre rasante, usos vinculados), decláralo en las decisiones.`,
    };
  }
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function textoIncumplimientoHab(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  switch (d.clase) {
    case "sin_norma":
      return {
        titulo: "Declara la norma de habitabilidad del municipio.",
        detalle: "En Los datos de la obra, con su referencia: la fracción de hueco no se supone.",
      };
    case "sin_estancias":
      return { titulo: `${d.vivienda.nombre}: faltan sus estancias.`, detalle: "Con su superficie útil y sus huecos, en las decisiones de Habitabilidad." };
    case "estancia": {
      if (d.faltan.length > 0) return { titulo: `${d.estancia.nombre} (${d.vivienda.nombre.toLowerCase()}): falta ${textoFaltan(d.faltan)}.`, detalle: `Sin dato no se justifica con ${d.norma.referencia}.` };
      const fallos: string[] = [];
      if (!d.iluminacion.cumple) fallos.push(`iluminación ${m2(d.iluminacion.proyecto_m2)}, mínimo ${m2(d.iluminacion.exigido_m2)}`);
      if (d.ventilacion && !d.ventilacion.cumple) fallos.push(`ventilación ${m2(d.ventilacion.proyecto_m2)}, mínimo ${m2(d.ventilacion.exigido_m2)}`);
      if (d.minima && !d.minima.cumple) fallos.push(`superficie ${m2(d.estancia.util_m2)}, mínimo ${m2(d.minima.exigida_m2)}`);
      return { titulo: `${d.estancia.nombre} (${d.vivienda.nombre.toLowerCase()}) no cumple.`, detalle: `${fallos.join("; ")} (${d.norma.referencia}).` };
    }
    case "densidad":
      return {
        titulo: "La densidad supera el máximo de viviendas.",
        detalle: `${viviendas(d.viviendas)} y el máximo es ${d.maximo}: ${m2(d.superficie_m2)} / ${d.m2PorVivienda} m² (${d.norma.referencia}).`,
      };
    default:
      return null;
  }
}

export function describirDibujoHab(j: JustificacionHab): string {
  if (!j.aplica) return "Sección del edificio: sin viviendas en lo que se proyecta.";
  return `Sección del edificio con las viviendas que se justifican: ${j.viviendas.map((v) => v.nombre.toLowerCase()).join(", ")}.`;
}
