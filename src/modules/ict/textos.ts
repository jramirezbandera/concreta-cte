// =============================================================================
// ICT — Textos (feature-36, paso 3): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. PURAS.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { DetalleIct, ElementoIct, JustificacionIct, TomasVivienda } from "./justificacion";
import { CANALIZACION_EXTERNA_ICT, CANALIZACION_PRINCIPAL_ICT, RITU_A_ICT, RITU_ICT, RTR_ICT, TOMAS_ICT, textoMedidas, type RecintoIct } from "./tablas";

const CE = CANALIZACION_EXTERNA_ICT.datos;
const CP = CANALIZACION_PRINCIPAL_ICT.datos;
const RTR = RTR_ICT.datos;
const TO = TOMAS_ICT.datos;

export const NOMBRE_RECINTO: Record<RecintoIct, string> = {
  riti_rits: "RITI y RITS",
  ritu: "RITU",
  ritu_a: "RITU-A",
};

/** «1 PAU», «7 PAU». */
export const pauTexto = (n: number) => `${n} PAU`;

/** «3 tubos de Ø63 mm». */
export const tubosTexto = (n: number, d: number) => `${n} ${n === 1 ? "tubo" : "tubos"} de Ø${d} mm`;

function det(el: ElementoSi<unknown>): DetalleIct {
  return (el as ElementoIct).detalle;
}

/** «6 viviendas, 1 local y 1 estancia común». */
export function desglosePau(d: Extract<DetalleIct, { clase: "pau" }>): string {
  const partes = [
    d.viviendas > 0 ? `${d.viviendas} ${d.viviendas === 1 ? "vivienda" : "viviendas"}` : null,
    d.locales > 0 ? `${d.locales} ${d.locales === 1 ? "local u oficina" : "locales u oficinas"}` : null,
    d.comunes > 0 ? `${d.comunes} ${d.comunes === 1 ? "estancia común" : "estancias comunes"}` : null,
  ].filter((x): x is string => x !== null);
  if (partes.length === 0) return "ninguno";
  return partes.length === 1 ? partes[0]! : `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`;
}

/** «2 de pares trenzados, 1 coaxial y 2 de RTV». */
export function textoTomas(t: TomasVivienda): string {
  return `${t.paresTrenzados} de pares trenzados, ${t.coaxial} coaxial${t.coaxial === 1 ? "" : "es"}, ${t.rtv} de RTV y ${t.fibra} de fibra óptica, más ${t.configurable} configurable junto al PAU`;
}

/** El ámbito del recinto elegido, en una frase (4.5.3). */
function ambitoRecinto(r: RecintoIct): string {
  if (r === "ritu") return `edificios de hasta tres alturas y planta baja con ${RITU_ICT.datos.ambito.pauMax} PAU como máximo`;
  if (r === "ritu_a") return `edificios de más de tres alturas con hasta ${RITU_A_ICT.datos.ambito.pauConMasAlturasMax} PAU, o de 17 a ${RITU_A_ICT.datos.ambito.pauMax} PAU`;
  return "cualquier número de PAU";
}

const elementoDe = (j: JustificacionIct, clase: DetalleIct["clase"]) => j.elementos.find((e) => e.detalle.clase === clase);

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseIct(j: JustificacionIct): string {
  if (j.propiedadHorizontal === undefined) return "Falta declarar en La obra si el edificio está en régimen de propiedad horizontal: es lo que decide la ICT.";
  const rec = elementoDe(j, "recinto");
  if (rec?.veredicto === "fail") return `El ${NOMBRE_RECINTO[j.recinto]} no vale para ${pauTexto(j.pau)} y ${j.plantasSobreRasante} plantas sobre rasante: elige otro recinto.`;
  return `${pauTexto(j.pau)} con ${j.recinto === "riti_rits" ? "RITI y RITS" : NOMBRE_RECINTO[j.recinto]}: la arquitectura reserva recintos, canalizaciones y registros, y el proyecto técnico de ICT los dimensiona.`;
}

export function metricasIct(j: JustificacionIct): string {
  const partes = [pauTexto(j.pau), NOMBRE_RECINTO[j.recinto]];
  if (j.propiedadHorizontal === undefined) partes.push("régimen sin declarar");
  return partes.join(" · ");
}

export function piezasIct(j: JustificacionIct): { texto: string; acento: boolean }[] {
  if (j.propiedadHorizontal === undefined) return [{ texto: "régimen sin declarar", acento: true }];
  return [
    { texto: pauTexto(j.pau), acento: false },
    { texto: NOMBRE_RECINTO[j.recinto], acento: elementoDe(j, "recinto")?.veredicto === "fail" },
  ];
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraIct(j: JustificacionIct, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const fila = (titulo: string, detalle: string, t: string) => filas.push({ id: el.id, titulo, detalle, trato: t, estado: trato(estados[el.id]), elementoId: el.id });
    if (d.clase === "pau") fila("PAU", desglosePau(d), pauTexto(d.total));
    else if (d.clase === "tomas") fila(d.nombre, `${d.cantidad > 1 ? `${d.cantidad} viviendas · ` : ""}${d.tomas.estancias} estancias`, d.deHabitabilidad ? "de Habitabilidad" : "deducidas del tipo");
  }
  return filas;
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaIct(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "regimen":
      return d.propiedadHorizontal === undefined ? "régimen sin declarar" : d.propiedadHorizontal ? "propiedad horizontal" : "sin propiedad horizontal";
    case "pau":
      return pauTexto(d.total);
    case "recinto":
      return NOMBRE_RECINTO[d.recinto];
    case "arqueta":
      return "arqueta de entrada";
    case "canalizacion_externa":
      return `${d.tubos} × Ø${CE.diametro_mm}`;
    case "canalizacion_principal":
      return d.tubos === undefined ? "patinillo: cálculo" : `patinillo ${d.tubos} × Ø${CP.diametro_mm}`;
    case "rtr":
      return `RTR × ${d.cuantos}`;
    case "tomas":
      return `${d.tomas.paresTrenzados + d.tomas.coaxial + d.tomas.rtv + d.tomas.configurable} registros`;
    case "proyecto":
      return "proyecto técnico";
  }
}

export function resultadoListaIct(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "regimen":
      return d.propiedadHorizontal === undefined ? "decláralo en La obra, «Régimen de la promoción»" : d.propiedadHorizontal ? "acogido, o debe acogerse, al régimen (art. 2)" : "fuera del régimen (art. 2)";
    case "pau":
      return desglosePau(d);
    case "recinto":
      return d.medidas ? `${d.recinto === "riti_rits" ? "cada uno, " : ""}≥ ${textoMedidas(d.medidas)} (alto × ancho × profundo)` : "medidas del proyecto técnico";
    case "arqueta":
      return d.medidas ? `≥ ${textoMedidas(d.medidas)} (largo × ancho × profundo)` : "la dimensiona el proyecto técnico";
    case "canalizacion_externa":
      return tubosTexto(d.tubos, CE.diametro_mm);
    case "canalizacion_principal":
      return d.tubos === undefined ? "con más de 30 PAU, cálculo específico" : tubosTexto(d.tubos, CP.diametro_mm);
    case "rtr":
      return `uno por PAU, empotrado, ≥ ${textoMedidas(RTR.medidas)}`;
    case "tomas":
      return textoTomas(d.tomas);
    case "proyecto":
      return d.autor ? `${d.autor}${d.fecha ? `, ${d.fecha}` : ""}` : "se une al proyecto arquitectónico";
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaIct(el: ElementoSi<unknown>, _j: JustificacionIct, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "regimen":
      return {
        clase: "Ámbito · RD-ley 1/1998",
        titulo: el.nombre,
        valor: d.propiedadHorizontal === undefined ? "Sin declarar" : d.propiedadHorizontal ? "Sí" : "No",
        estado,
        manda:
          "La ICT es obligatoria en los edificios acogidos, o que deban acogerse, al régimen de propiedad horizontal, y en los arrendados por más de un año, salvo los de una sola vivienda; para construirlos o rehabilitarlos íntegramente, al proyecto arquitectónico se une el proyecto técnico de ICT.",
        nota: d.propiedadHorizontal === undefined ? "Es un dato de la promoción, no del número de viviendas: decláralo en La obra, «Régimen de la promoción»." : undefined,
        filas: [],
        cita: "RD-ley 1/1998 · arts. 2 y 3.1",
      };
    case "pau":
      return {
        clase: "Puntos de acceso al usuario",
        titulo: el.nombre,
        valor: String(d.total),
        unidad: "PAU",
        estado,
        manda: "Cada vivienda, local u oficina tiene su PAU; las tablas del Anexo III van por número de PAU.",
        nota: d.localesDeclarados ? undefined : d.locales > 0 ? "Los locales y oficinas cuentan uno por zona y planta de El edificio; si se dividen, ajústalo." : undefined,
        filas: [
          { k: "Viviendas", v: String(d.viviendas) },
          { k: "Locales u oficinas", v: `${d.locales}${d.localesDeclarados ? " (declarados)" : ""}` },
          { k: "Estancias comunes", v: String(d.comunes) },
        ],
        cita: "RD 346/2011 · Anexo III",
      };
    case "recinto":
      return {
        clase: "Recintos · Anexo III 4.5 y 5.5",
        titulo: el.nombre,
        valor: NOMBRE_RECINTO[d.recinto],
        unidad: d.medidas ? `≥ ${textoMedidas(d.medidas)}` : undefined,
        estado,
        manda: `${d.recinto === "riti_rits" ? "Un recinto inferior (RITI) y uno superior (RITS)" : `El ${NOMBRE_RECINTO[d.recinto]} vale para ${ambitoRecinto(d.recinto)}`}. Las medidas son las mínimas del Anexo III (alto × ancho × profundo), con ${pauTexto(d.pau)}.`,
        nota: d.admitido
          ? d.recinto === d.habitual
            ? undefined
            : `Lo habitual con ${pauTexto(d.pau)} y ${d.plantas} plantas sobre rasante es ${NOMBRE_RECINTO[d.habitual]}.`
          : `Con ${pauTexto(d.pau)} y ${d.plantas} plantas sobre rasante el ${NOMBRE_RECINTO[d.recinto]} se sale de su ámbito.`,
        filas: [
          { k: "PAU", v: String(d.pau) },
          { k: "Plantas sobre rasante", v: String(d.plantas) },
          ...(d.medidas ? [{ k: d.recinto === "riti_rits" ? "Cada recinto, mínimo" : "Mínimo", v: textoMedidas(d.medidas) }] : []),
        ],
        cita: "RD 346/2011 · Anexo III 4.5.3 y 5.5",
      };
    case "arqueta":
      return {
        clase: "Arqueta de entrada · 5.1",
        titulo: el.nombre,
        valor: d.medidas ? textoMedidas(d.medidas) : "Proyecto técnico",
        estado,
        manda: "La arqueta de entrada recibe la canalización externa de los operadores; sus medidas mínimas van por número de PAU (largo × ancho × profundo).",
        nota: d.medidas ? undefined : "Con más de 100 PAU el Reglamento da dos medidas distintas (ap. 5.1 y apéndice 3): la fija el proyecto técnico.",
        filas: [{ k: "PAU", v: String(d.pau) }],
        cita: "RD 346/2011 · Anexo III 5.1",
      };
    case "canalizacion_externa":
      return {
        clase: "Canalización externa · 5.2",
        titulo: el.nombre,
        valor: String(d.tubos),
        unidad: `tubos de Ø${CE.diametro_mm} mm`,
        estado,
        manda: `De la arqueta de entrada al punto de entrada general del edificio, con arquetas de paso de ${textoMedidas(CE.arquetaPaso)} cada ${CE.arquetaPasoCada_m} m.`,
        filas: [{ k: "PAU", v: String(d.pau) }],
        cita: "RD 346/2011 · Anexo III 5.2",
      };
    case "canalizacion_principal":
      return {
        clase: "Canalización principal · 5.7",
        titulo: el.nombre,
        valor: d.tubos === undefined ? "Cálculo" : String(d.tubos),
        unidad: d.tubos === undefined ? undefined : `tubos de Ø${CP.diametro_mm} mm`,
        estado,
        manda: "Une el recinto inferior con el superior y con los registros secundarios de cada planta: la arquitectura reserva el patinillo.",
        nota: d.tubos === undefined ? "Con más de 30 PAU el número de tubos sale de un cálculo específico del proyecto técnico." : undefined,
        filas: [{ k: "PAU", v: String(d.pau) }],
        cita: "RD 346/2011 · Anexo III 5.7",
      };
    case "rtr":
      return {
        clase: "RTR · 5.11",
        titulo: el.nombre,
        valor: String(d.cuantos),
        unidad: `≥ ${textoMedidas(RTR.medidas)}`,
        estado,
        manda: `Uno en cada vivienda, local u oficina, empotrado, de ${textoMedidas(RTR.medidas)} como mínimo, con ${RTR.tomasCorriente} tomas de corriente y entre ${RTR.alturaMin_mm} y ${RTR.alturaMax_mm.toLocaleString("es-ES")} mm del suelo.`,
        filas: [],
        cita: "RD 346/2011 · Anexo III 5.11",
      };
    case "tomas":
      return {
        clase: "Registros de toma · 5.13",
        titulo: d.nombre,
        valor: String(d.tomas.paresTrenzados + d.tomas.coaxial + d.tomas.rtv + d.tomas.configurable),
        unidad: "registros",
        estado,
        manda: `En ${TO.principales} estancias principales, ${TO.porPrincipal.paresTrenzados} de pares trenzados, ${TO.porPrincipal.coaxial} coaxial y ${TO.porPrincipal.rtv} de RTV en cada una, con fibra óptica en una de ellas; en el resto, sin baños ni trasteros, ${TO.porResto.paresTrenzados} de pares trenzados y ${TO.porResto.rtv} de RTV; y uno configurable junto al PAU.`,
        nota: d.deHabitabilidad ? undefined : "Sin las estancias de Habitabilidad, se cuentan las de El edificio: estar-comedor, cocina y dormitorios.",
        filas: [
          { k: "Estancias con tomas", v: String(d.tomas.estancias) },
          { k: "Pares trenzados", v: String(d.tomas.paresTrenzados) },
          { k: "Coaxial", v: String(d.tomas.coaxial) },
          { k: "RTV", v: String(d.tomas.rtv) },
          { k: "Fibra óptica", v: String(d.tomas.fibra) },
          { k: "Configurable", v: String(d.tomas.configurable) },
          ...(d.cantidad > 1 ? [{ k: "Viviendas de este tipo", v: String(d.cantidad) }] : []),
        ],
        cita: "RD 346/2011 · Anexo III 5.13",
      };
    case "proyecto":
      return {
        clase: "Proyecto técnico",
        titulo: el.nombre,
        valor: "Se une",
        estado,
        manda: "El proyecto técnico de ICT, de técnico competente en telecomunicaciones, diseña y dimensiona la infraestructura en coordinación con el autor del proyecto de edificación, y se une al proyecto arquitectónico.",
        filas: [
          { k: "Autor", v: d.autor ?? "sin declarar" },
          { k: "Fecha", v: d.fecha ?? "sin declarar" },
        ],
        cita: "RD-ley 1/1998 · art. 3.1 · RD 346/2011 · art. 9",
      };
  }
}

// ── Avisos y lo que no cumple ───────────────────────────────────────────────

export function textoAvisoIct(a: Aviso): TextoSi {
  const x = a.datos as Record<string, string>;
  if (a.id.startsWith("estancias-")) {
    return {
      titulo: `${x.vivienda}: registros de toma con las estancias deducidas.`,
      detalle: "Sin las estancias de Habitabilidad, se cuentan estar-comedor, cocina y dormitorios del tipo de El edificio. Declara las estancias en Habitabilidad para contarlas con el programa real.",
    };
  }
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function textoIncumplimientoIct(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "regimen") {
    return {
      titulo: "Falta el régimen de propiedad horizontal.",
      detalle: "Declara en La obra, «Régimen de la promoción», si el edificio está, o debe estar, en propiedad horizontal: decide si hace falta la ICT (RD-ley 1/1998, art. 2).",
    };
  }
  if (d.clase === "recinto") {
    return {
      titulo: `El ${NOMBRE_RECINTO[d.recinto]} se sale de su ámbito.`,
      detalle: `Vale para ${ambitoRecinto(d.recinto)}, y el edificio tiene ${pauTexto(d.pau)} y ${d.plantas} plantas sobre rasante. Elige ${NOMBRE_RECINTO[d.habitual]}.`,
    };
  }
  return null;
}

export function describirDibujoIct(j: JustificacionIct): string {
  return `Sección del edificio con los ${pauTexto(j.pau)}, el recinto (${NOMBRE_RECINTO[j.recinto]}) y las canalizaciones que reserva la arquitectura.`;
}
