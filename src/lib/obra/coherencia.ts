// =============================================================================
// La coherencia entre apartados (feature-36, paso 6). PURA.
//
// Donde dos módulos guardan cada uno su dato del mismo servicio, no se
// fusionan: se comparan y, si no dicen lo mismo, un aviso `revisar` en «Antes
// de entregar», nunca un «no cumple» (decisión 8): puede ser un error o un caso
// que el proyectista conoce, y lo marca como revisado.
//
// El inventario del paso 6: lo que sale de una sola fuente no se compara. Las
// plazas, las viviendas y los locales los leen todos de El edificio; el RITE lee
// el ACS de HE 4 y el REBT, la climatización del RITE, la recarga de HE 6 y la
// central de ACS de HE 4 (con su propio aviso, `acs-central`); el anejo lee cada
// módulo. Las superficies con dato propio (las estancias de habitabilidad, que
// ya avisan si suman más que la vivienda; la superficie residencial y la
// cubierta de HE 5, que se declaran porque la de El edificio no vale) no se
// comparan. Quedan:
//   - ACS: «Agua caliente» de HS 4 frente a la producción de HE 4;
//   - servicios generales: el grupo de presión de HS 4 y la producción
//     centralizada del RITE frente a los «otros servicios» del REBT;
//   - electrificación: la climatización eléctrica del RITE frente al grado del
//     REBT, en los dos sentidos;
//   - garaje: HE 6 o SUA 7 forzados en contra de lo que dice El edificio, y las
//     plazas exteriores de HE 6 que la previsión del REBT no cuenta;
//   - contadores: los de HS 4 frente a los del REBT (obra nueva).
// =============================================================================

import { resumenEdificio } from "../edificio/derivar";
import type { Edificio } from "../edificio/tipos";
import { proyectoParaModulo } from "../proyecto/alcance";
import { aplicabilidadPropuesta } from "../proyecto/aplicabilidad";
import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, estadoEfectivo, type EvaluacionExpediente } from "./evaluar";
import { generarRedHs4, resolverDecisionesHs4, type DecisionesHs4 } from "../../modules/hs4/red";
import type { Hs4Estado } from "../../modules/hs4/estado";
import { resolverHe4, type He4Estado } from "../../modules/he4/estado";
import type { He6Estado } from "../../modules/he6/estado";
import { climatizacionDe, resolverRite, type RiteEstado } from "../../modules/rite/estado";
import { NOMBRE_CALEFACCION } from "../../modules/rite/textos";
import { noNegativo, type Climatizacion, type RebtEstado } from "../../modules/rebt/estado";
import { justificarRebt, type JustificacionRebt } from "../../modules/rebt/justificacion";
import type { ProyectoSi } from "../../modules/si/definicion";

/** La clave de los avisos de coherencia en «Antes de entregar». */
export const CLAVE_COHERENCIA = "coherencia";

export type TemaCoherencia = "acs" | "servicios" | "electrificacion" | "garaje" | "contadores";

/** Un apartado al que ir a mirarlo. */
export interface EnlaceCoherencia {
  key: JustificacionKey;
  codigo: string;
  ruta?: string;
}

export interface AvisoCoherencia {
  /** Estable y con lo que se compara («acs:central-individual»): si cambia un dato, es otro aviso. */
  id: string;
  tema: TemaCoherencia;
  titulo: string;
  detalle: string;
  /** Los apartados que no coinciden, en el orden en que se nombran. */
  enlaces: EnlaceCoherencia[];
}

/** Los estados en los que un módulo ha calculado y dice algo. */
const CALCULADO = new Set(["cumple", "revisar", "no_cumple"]);

const NOMBRE_CLIMA: Record<Exclude<Climatizacion, "ninguna">, string> = {
  aire_aire: "bomba de calor aire-aire",
  aire_agua: "bomba de calor aire-agua",
  emisores: "emisores eléctricos",
};

const lista = (xs: string[]): string => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);

const plural = (n: number, uno: string, varios: string): string => `${n} ${n === 1 ? uno : varios}`;

const memo = new WeakMap<Proyecto, AvisoCoherencia[]>();

/** Todos los avisos de coherencia del expediente, revisados o no. Memorizada por proyecto. */
export function coherencia(p: Proyecto): AvisoCoherencia[] {
  const hecho = memo.get(p);
  if (hecho) return hecho;
  const c = new Contexto(p);
  const avisos = [...acs(c), ...servicios(c), ...electrificacion(c), ...garaje(c), ...contadores(c)];
  memo.set(p, avisos);
  return avisos;
}

/** Los que quedan por revisar: los que no ha marcado el proyectista. */
export function coherenciaPendiente(p: Proyecto): AvisoCoherencia[] {
  const revisados = new Set(p.datosGenerales.coherenciaRevisada ?? []);
  return coherencia(p).filter((a) => !revisados.has(a.id));
}

/** Lo que leen todas las comprobaciones, calculado una vez. */
class Contexto {
  readonly p: Proyecto;
  readonly evs: EvaluacionExpediente;
  readonly unifamiliar: boolean;
  readonly numViviendas: number;
  private rebtJ?: JustificacionRebt | null;

  constructor(p: Proyecto) {
    this.p = p;
    this.evs = evaluarExpediente(p);
    const r = resumenEdificio(p.edificio);
    this.unifamiliar = r.esUnifamiliar;
    this.numViviendas = r.numViviendas;
  }

  calculado(k: JustificacionKey): boolean {
    const ev = this.evs.porClave[k];
    return ev !== undefined && CALCULADO.has(ev.estado);
  }

  estado<T>(k: JustificacionKey): T {
    return estadoEfectivo(this.p, k) as unknown as T;
  }

  /** Cómo se nombra en el texto: «HE 6», «SUA 7». */
  nombre(k: JustificacionKey): string {
    return this.enlace(k).codigo.replace(/^([A-Z]+)(\d)/, "$1 $2");
  }

  enlace(k: JustificacionKey): EnlaceCoherencia {
    const e = this.evs.porClave[k]?.entrada;
    return { key: k, codigo: e?.codigo ?? k.toUpperCase(), ...(e?.route ? { ruta: e.route } : {}) };
  }

  /** El REBT calculado (el mismo que el de su pantalla), o null si no calcula. */
  rebt(): JustificacionRebt | null {
    if (this.rebtJ !== undefined) return this.rebtJ;
    this.rebtJ = null;
    if (this.calculado("rebt")) {
      try {
        this.rebtJ = justificarRebt(this.estado<RebtEstado>("rebt"), proyectoParaModulo(this.p, "rebt") as ProyectoSi);
      } catch {
        this.rebtJ = null;
      }
    }
    return this.rebtJ;
  }

  rite() {
    return resolverRite(this.estado<Partial<RiteEstado>>("rite"), {
      unifamiliar: this.unifamiliar,
      rebt: this.p.justificaciones.rebt?.inputs as Partial<RebtEstado> | undefined,
    });
  }
}

// ── ACS ───────────────────────────────────────────────────────────────────────

/**
 * «Agua caliente» de HS 4 frente a la producción de HE 4, que es la fuente del
 * RITE y del REBT. HE 4 solo la pregunta con más de una vivienda.
 */
function acs(c: Contexto): AvisoCoherencia[] {
  if (c.unifamiliar || c.numViviendas <= 1 || !c.calculado("hs4") || !c.calculado("he4")) return [];
  const hs4 = resolverDecisionesHs4(c.estado<DecisionesHs4>("hs4")).aguaCaliente;
  const he4 = resolverHe4(c.estado<He4Estado>("he4")).produccion;
  if ((hs4 === "central") === (he4 === "centralizada")) return [];
  const dice = (central: boolean) => (central ? "centralizada" : "individual en cada vivienda");
  return [
    {
      id: `acs:${hs4}-${he4}`,
      tema: "acs",
      titulo: "HS 4 y HE 4 no dicen lo mismo de la producción del agua caliente.",
      detalle:
        `HS 4 la da por ${dice(hs4 === "central")} y HE 4, por ${dice(he4 === "centralizada")}; ` +
        "el RITE y el REBT leen la de HE 4. Cambia la que no sea en «Agua caliente» de HS 4 o en la producción de HE 4.",
      enlaces: [c.enlace("hs4"), c.enlace("he4")],
    },
  ];
}

// ── Servicios generales ──────────────────────────────────────────────────────

/**
 * Lo que va en los servicios generales y otro módulo declara: el grupo de
 * presión de HS 4 y la producción centralizada de calefacción o refrigeración
 * del RITE. El REBT no lo suma si sus «otros servicios» no se indican (o son
 * 0). La central de ACS de HE 4 ya la avisa el REBT (`acs-central`).
 */
function servicios(c: Contexto): AvisoCoherencia[] {
  if (c.unifamiliar) return [];
  const j = c.rebt();
  if (!j || j.unifamiliar) return [];
  const otros = noNegativo(c.estado<RebtEstado>("rebt").otrosServicios_kW);
  if (otros !== null && otros > 0) return [];
  const que: { id: string; texto: string; key: JustificacionKey }[] = [];
  if (c.calculado("hs4") && resolverDecisionesHs4(c.estado<DecisionesHs4>("hs4")).grupoPresion) {
    que.push({ id: "grupo", texto: "del grupo de presión de HS 4", key: "hs4" });
  }
  if (c.calculado("rite")) {
    const d = c.rite();
    if (d.produccion === "centralizada" && (d.calefaccion !== "ninguna" || d.refrigeracion !== "ninguna")) {
      que.push({ id: "clima", texto: "de la producción centralizada de climatización del RITE", key: "rite" });
    }
  }
  if (que.length === 0) return [];
  return [
    {
      id: `servicios:${que.map((x) => x.id).join("-")}`,
      tema: "servicios",
      titulo: `El REBT no suma la potencia ${lista(que.map((x) => x.texto))}.`,
      detalle:
        `Sus servicios generales tienen los «otros servicios» ${otros === null ? "sin indicar" : "a 0 kW"}: ` +
        "indica en el REBT la potencia eléctrica de lo que se proyecta, o la carga del edificio se queda corta.",
      enlaces: [...que.map((x) => c.enlace(x.key)), c.enlace("rebt")],
    },
  ];
}

// ── Electrificación ──────────────────────────────────────────────────────────

/**
 * La climatización eléctrica de cada vivienda (la del RITE, producción
 * individual) frente al grado del REBT: con ella, viviendas en básica pierden su
 * circuito en el anejo; sin ella (ni secadora ni automatización), la elevada
 * «por equipos» la explica la memoria por una climatización que no hay.
 */
function electrificacion(c: Contexto): AvisoCoherencia[] {
  if (!c.calculado("rite")) return [];
  const j = c.rebt();
  if (!j || j.viviendas.length === 0) return [];
  const d = c.rite();
  // La del RITE en la vivienda: con la producción centralizada, la bomba de calor no lo está.
  const clima = climatizacionDe(d);

  if (clima !== "ninguna") {
    const basicas = j.viviendas.filter((v) => v.grado === "basica");
    if (basicas.length === 0) return [];
    const cuales = j.unifamiliar ? "la vivienda queda" : basicas.length === j.viviendas.length ? "las viviendas quedan" : `${lista(basicas.map((v) => `la vivienda ${v.nombre}`))} quedan`;
    return [
      {
        id: `electrificacion:basica-${clima}`,
        tema: "electrificacion",
        titulo: "El RITE proyecta climatización eléctrica y el REBT deja viviendas en electrificación básica.",
        detalle:
          `El RITE prevé ${NOMBRE_CLIMA[clima]} en cada vivienda; en el REBT ${cuales} en básica, sin su circuito. ` +
          "Elige en el REBT la electrificación elevada o cambia la climatización en el RITE.",
        enlaces: [c.enlace("rite"), c.enlace("rebt")],
      },
    ];
  }

  const e = c.estado<RebtEstado>("rebt");
  const soloPorEquipos = j.viviendas.filter((v) => v.motivos.length === 1 && v.motivos[0] === "equipos");
  if (e.secadora === true || e.automatizacion === true || soloPorEquipos.length === 0) return [];
  const central = d.produccion === "centralizada" && (d.calefaccion !== "ninguna" || d.refrigeracion !== "ninguna");
  return [
    {
      id: `electrificacion:elevada-${d.calefaccion}-${d.refrigeracion}${central ? "-centralizada" : ""}`,
      tema: "electrificacion",
      titulo: "El REBT da electrificación elevada por la climatización eléctrica y el RITE no la pone en las viviendas.",
      detalle:
        (central
          ? "El RITE prevé la producción de climatización centralizada, fuera de las viviendas"
          : // Sin climatización eléctrica, la refrigeración es «ninguna» (la aire-aire lo sería).
            `El RITE prevé ${d.calefaccion === "ninguna" ? "las viviendas sin calefacción" : `calefacción con ${NOMBRE_CALEFACCION[d.calefaccion]}`} y sin refrigeración`) +
        ", y el REBT no lleva secadora ni automatización. " +
        "Si no hay otro equipo que la pida, elige en el REBT la electrificación «Por superficie».",
      enlaces: [c.enlace("rebt"), c.enlace("rite")],
    },
  ];
}

// ── Garaje ───────────────────────────────────────────────────────────────────

/** Las plazas de los garajes de El edificio (la unifamiliar, el suyo). */
function plazasGaraje(e: Edificio): { hay: boolean; plazas: number } {
  let hay = false;
  let plazas = 0;
  for (const g of e.grupos) {
    for (const z of g.zonas) {
      if (z.uso !== "garaje" && z.uso !== "garaje_privado") continue;
      hay = true;
      const n = z.plazas !== undefined && Number.isFinite(z.plazas) ? Math.max(0, Math.trunc(z.plazas)) : 0;
      plazas += n * Math.max(1, Math.trunc(g.repeticiones));
    }
  }
  return { hay, plazas };
}

/**
 * HE 6 y SUA 7 leen el garaje de El edificio: el único modo de que digan cosas
 * distintas es forzar uno en contra de lo que propone la app (el «no se
 * proyectan aparcamientos» de HE 6 con SUA 7 justificando el garaje). Y las
 * plazas exteriores de HE 6 en un edificio de viviendas: la previsión de recarga
 * del REBT (ITC-BT-10 ap. 5.2) solo cuenta las del garaje.
 */
function garaje(c: Contexto): AvisoCoherencia[] {
  const out: AvisoCoherencia[] = [];
  const g = plazasGaraje(c.p.edificio);
  const enGaraje: JustificacionKey[] = ["sua7", "he6"];
  for (const k of enGaraje) {
    const ev = c.evs.porClave[k];
    if (!ev?.forzada) continue;
    const forzadaNo = ev.aplicabilidad === "no_aplica";
    const propuestaNo = aplicabilidadPropuesta(c.p, k).aplicabilidad === "no_aplica";
    if (forzadaNo === propuestaNo) continue;
    const otros = enGaraje.filter((x) => x !== k && c.calculado(x));
    const conRebt = c.rebt()?.elementos.some((x) => x.detalle.clase === "garaje") === true;
    const leen = [...otros.map((x) => c.nombre(x)), ...(conRebt ? ["el REBT"] : [])];
    const codigo = c.nombre(k);
    out.push(
      forzadaNo
        ? {
            id: `garaje:${k}-no`,
            tema: "garaje",
            titulo: `${codigo} se ha marcado «no aplica», pero El edificio tiene garaje.`,
            detalle:
              `${g.plazas > 0 ? `El edificio tiene ${plural(g.plazas, "plaza", "plazas")} de garaje` : "El edificio tiene un garaje"}` +
              `${leen.length > 0 ? `, que justifica${leen.length > 1 ? "n" : ""} ${lista(leen)}` : ""}. ` +
              `Si no hay aparcamiento, quítalo de El edificio; si lo hay, devuelve ${codigo} a lo que propone la app.`,
            enlaces: [c.enlace(k), ...otros.map((x) => c.enlace(x))],
          }
        : {
            id: `garaje:${k}-si`,
            tema: "garaje",
            titulo: `${codigo} se ha marcado como que aplica, pero El edificio no tiene ${g.hay ? "plazas que lo pidan" : "garaje"}.`,
            detalle:
              `SUA 7, HE 6 y el REBT leen el aparcamiento de El edificio: si lo hay, dibújalo allí${g.hay ? " con sus plazas" : ""} ` +
              "para que todos los apartados digan lo mismo.",
            enlaces: [c.enlace(k)],
          },
    );
  }

  // Las plazas exteriores de HE 6 en un edificio de viviendas.
  const j = c.rebt();
  if (j && j.clasificacion === "viviendas" && c.calculado("he6")) {
    const exteriores = Math.max(0, Math.trunc(c.estado<He6Estado>("he6").plazasExteriores || 0));
    if (exteriores > 0) {
      out.push({
        id: `garaje:exteriores-${exteriores}`,
        tema: "garaje",
        titulo: "HE 6 cuenta plazas exteriores que la previsión del REBT no incluye.",
        detalle:
          `HE 6 lleva la conducción de cables a ${plural(exteriores, "plaza exterior", "plazas exteriores")}; la recarga del REBT ` +
          `(ITC-BT-10 ap. 5.2) solo cuenta ${j.plazasGaraje > 0 ? `las ${j.plazasGaraje} del garaje` : "las del garaje, y no hay"}. ` +
          "Comprueba si su recarga debe entrar en la previsión de cargas.",
        enlaces: [c.enlace("he6"), c.enlace("rebt")],
      });
    }
  }
  return out;
}

// ── Contadores ───────────────────────────────────────────────────────────────

/**
 * Los contadores de agua de HS 4 frente a los de electricidad del REBT: los dos
 * leen El edificio, así que deberían contar las mismas viviendas y los mismos
 * locales u oficinas. Solo en obra nueva (en una existente, cada uno cuenta lo
 * suyo de la obra) y con la red deducida de El edificio.
 */
function contadores(c: Contexto): AvisoCoherencia[] {
  if (c.unifamiliar || c.p.datosGenerales.intervencion !== "obra_nueva" || !c.calculado("hs4")) return [];
  const e = c.estado<Hs4Estado>("hs4");
  if (e.red !== "edificio") return [];
  const j = c.rebt();
  const el = j?.elementos.find((x) => x.detalle.clase === "contadores")?.detalle;
  if (!el || el.clase !== "contadores") return [];
  const de = (...ques: string[]) => el.desglose.filter((x) => ques.includes(x.que)).reduce((a, x) => a + x.n, 0);
  const rebt = { viviendas: de("vivienda", "viviendas"), locales: de("local", "locales") };
  const h = generarRedHs4(proyectoParaModulo(c.p, "hs4").edificio, e).contadores;
  const hs4 = { viviendas: h.viviendas, locales: h.locales + h.oficinas };
  if (hs4.viviendas === rebt.viviendas && hs4.locales === rebt.locales) return [];
  const texto = (x: { viviendas: number; locales: number }) =>
    `${plural(x.viviendas, "de vivienda", "de viviendas")} y ${plural(x.locales, "de local u oficina", "de locales u oficinas")}`;
  return [
    {
      id: `contadores:${hs4.viviendas}-${hs4.locales}-${rebt.viviendas}-${rebt.locales}`,
      tema: "contadores",
      titulo: "HS 4 y el REBT no cuentan los mismos contadores.",
      detalle:
        `HS 4 lleva ${texto(hs4)}; el REBT, ${texto(rebt)}. ` +
        "Los dos leen El edificio: revisa las viviendas y los locales de sus zonas.",
      enlaces: [c.enlace("hs4"), c.enlace("rebt")],
    },
  ];
}
