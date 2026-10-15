// =============================================================================
// DB-HS4 — El cálculo extenso para el anejo de instalaciones (feature-33, paso
// 2): lo que la memoria resume, tramo a tramo. PURA.
//
// No calcula nada que la memoria no sepa: lee el mismo `HS4Result`. Partes:
//   1. caudales por aparato (tabla 2.1) y por unidad tipo;
//   2. el camino crítico, de la acometida al punto más desfavorable, con todas
//      las columnas (Lr, Lt, Qb, K, Q, Ø, v, J, Pent, Psal);
//   3. el resto de la red, con los tramos iguales agrupados;
//   4. el contador (tabla 4.1) o la batería;
//   5. el agua caliente y su retorno (≥ 15 m de ida).
// Lo estimado se dice: en modo «edificio» las longitudes son de la herramienta.
// =============================================================================

import type { AnejoDoc, ParteAnejo, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { caminoCritico, type ResultadoTramoHS4 } from "./calc";
import type { Hs4Estado } from "./estado";
import type { JustificacionHs4 } from "./justificacion";
import {
  AHORRO_AGUA,
  CAUDAL_INSTANTANEO_TABLA_2_1,
  PRESIONES,
  filaContadorGeneral,
  type TipoAparatoHS4,
} from "./tablas";
import { describirPunto, nombrePlanta } from "./textos";

/** Los datos del módulo que solo usa el anejo (feature-33). */
export type DatosAnejoHs4 = Pick<Hs4Estado, "diametroContador_mm" | "longitudIdaAcs_m">;

/** Cifra con decimales fijos, en español: «0,10». */
function f(v: number | null, d: number): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Los nombres de la tabla 2.1, como los da el DB. */
const NOMBRE_TABLA_2_1: Record<TipoAparatoHS4, string> = {
  lavamanos: "Lavamanos",
  lavabo: "Lavabo",
  ducha: "Ducha",
  banera_ge_140: "Bañera de 1,40 m o más",
  banera_lt_140: "Bañera de menos de 1,40 m",
  bide: "Bidé",
  inodoro_cisterna: "Inodoro con cisterna",
  inodoro_fluxor: "Inodoro con fluxor",
  urinario_temporizado: "Urinario con grifo temporizado",
  urinario_cisterna: "Urinario con cisterna",
  fregadero_domestico: "Fregadero doméstico",
  fregadero_no_domestico: "Fregadero no doméstico",
  lavavajillas_domestico: "Lavavajillas doméstico",
  lavavajillas_industrial: "Lavavajillas industrial",
  lavadero: "Lavadero",
  lavadora_domestica: "Lavadora doméstica",
  lavadora_industrial: "Lavadora industrial",
  grifo_aislado: "Grifo aislado",
  grifo_garaje: "Grifo de garaje",
  vertedero: "Vertedero",
};

const ORDEN_APARATOS = Object.keys(NOMBRE_TABLA_2_1) as TipoAparatoHS4[];

// -----------------------------------------------------------------------------
// 1 · Caudales por aparato
// -----------------------------------------------------------------------------

/** Una columna de la tabla de aparatos: una unidad tipo y cuántos aparatos de cada clase tiene. */
interface ColumnaUnidad {
  titulo: string;
  aparatos: TipoAparatoHS4[];
}

function columnasUnidades(j: JustificacionHs4): ColumnaUnidad[] {
  if (j.modo === "manual") return [{ titulo: "Red", aparatos: j.inputs.aparatos.map((a) => a.tipo) }];
  const vistas = new Map<string, ColumnaUnidad>();
  for (const u of j.red.unidades) {
    const clave = `${u.clase}:${u.nombreTipo}`;
    if (vistas.has(clave)) continue;
    const titulo =
      u.clase === "comunes" ? "Comunes" : u.clase === "oficinas" ? "Oficinas" : j.red.unifamiliar ? "Vivienda" : `Viv. ${u.nombreTipo}`;
    vistas.set(clave, { titulo, aparatos: u.cuartos.flatMap((g) => g.cuartos.flatMap((c) => c.aparatos)) });
  }
  return [...vistas.values()];
}

function parteCaudales(j: JustificacionHs4): ParteAnejo | null {
  const cols = columnasUnidades(j);
  const usados = ORDEN_APARATOS.filter((t) => cols.some((c) => c.aparatos.includes(t)));
  if (usados.length === 0) return null;
  const t21 = CAUDAL_INSTANTANEO_TABLA_2_1.datos.aparatos;
  const filas = usados.map((t) => [
    NOMBRE_TABLA_2_1[t],
    f(t21[t].af_dm3_s, 3),
    t21[t].acs_dm3_s === null ? "—" : f(t21[t].acs_dm3_s, 3),
    ...cols.map((c) => String(c.aparatos.filter((x) => x === t).length || "—")),
  ]);
  const suma = (c: ColumnaUnidad, k: "af_dm3_s" | "acs_dm3_s") => c.aparatos.reduce((s, t) => s + (t21[t][k] ?? 0), 0);
  filas.push(["Qb de agua fría", "", "", ...cols.map((c) => f(suma(c, "af_dm3_s"), 2))]);
  filas.push(["Qb de ACS", "", "", ...cols.map((c) => f(suma(c, "acs_dm3_s"), 2))]);
  return {
    titulo: "Caudales por aparato",
    parrafos: [
      [
        j.modo === "manual"
          ? "Caudal instantáneo mínimo de cada aparato (tabla 2.1) y número de aparatos de la red."
          : `Caudal instantáneo mínimo de cada aparato (tabla 2.1) y número de aparatos de ${j.red.unifamiliar ? "la vivienda" : j.red.unidades.length === 1 ? "la unidad" : "cada unidad tipo"}.`,
      ],
    ],
    tablas: [
      {
        rotulo: "Caudales instantáneos y aparatos",
        cabecera: ["Aparato", "AF [dm³/s]", "ACS [dm³/s]", ...cols.map((c) => c.titulo)],
        filas,
        ...(cols.length + 3 > 8 ? { ancha: true } : {}),
      },
    ],
  };
}

// -----------------------------------------------------------------------------
// 2 · Camino crítico y 3 · resto de la red
// -----------------------------------------------------------------------------

/** El nombre de un tramo, partido en lo que es y de quién es: «Montante» · «A3». */
interface NombreTramo {
  base: string;
  donde: string | null;
}

function nombresTramos(j: JustificacionHs4): Map<string, NombreTramo> {
  const out = new Map<string, NombreTramo>();
  const existentes = tramosExistentes(j);
  const aparatoDe = new Map(j.inputs.aparatos.map((a) => [a.tramoId, a] as const));
  for (const t of j.inputs.tramos) {
    const nombre = t.nombre?.trim() || t.id;
    const ap = aparatoDe.get(t.id);
    if (t.tipo === "derivacion_aparato" && ap) {
      const p = j.puntos.get(ap.id);
      const donde = p ? (j.red.unifamiliar ? p.cuarto : (p.unidad?.nombre ?? p.cuarto)) : null;
      out.set(t.id, { base: NOMBRE_TABLA_2_1[ap.tipo], donde });
      continue;
    }
    const i = j.modo === "edificio" ? nombre.lastIndexOf(" · ") : -1;
    const base = i > 0 ? nombre.slice(0, i) : nombre;
    // En la unifamiliar, «· Vivienda» no dice nada.
    const donde = i > 0 && !j.red.unifamiliar ? nombre.slice(i + 3) : null;
    out.set(t.id, { base: existentes.has(t.id) ? `${base} (existente)` : base, donde });
  }
  return out;
}

/**
 * Los tramos de la instalación existente que no se modifican (feature-30): la
 * acometida, el tubo de alimentación y, con contadores por planta, el montante
 * general. Entran en el cálculo porque la presión llega por ellos.
 */
function tramosExistentes(j: JustificacionHs4): Set<string> {
  if (!j.existente || j.modo !== "edificio") return new Set();
  return new Set(
    j.inputs.tramos
      .filter((t) => t.tipo === "acometida" || t.tipo === "tubo_alimentacion" || (j.existente!.porPlanta && t.id.startsWith("montante-") && t.tramoAlimentacion === "distribuidor_principal"))
      .map((t) => t.id),
  );
}

function etiqueta(n: NombreTramo | undefined, id: string): string {
  if (!n) return id;
  return n.donde ? `${n.base} · ${n.donde}` : n.base;
}

const ABREVIATURAS: [string, string][] = [
  ["Lr", "longitud real del tramo [m]"],
  ["Lt", "longitud de cálculo, Lr·(1 + f), con f la fracción de pérdidas localizadas [m]"],
  ["Qb", "caudal bruto: suma de los caudales instantáneos de la tabla 2.1 [dm³/s]"],
  ["K", "coeficiente de simultaneidad"],
  ["Q", "caudal de cálculo, Qb·K [dm³/s]"],
  ["Ø", "diámetro interior [mm]"],
  ["v", "velocidad [m/s]"],
  ["J", "pérdida de carga unitaria por rozamiento [kPa/m]"],
  ["Pent y Psal", "presión a la entrada y a la salida del tramo [kPa]"],
];

function parteCamino(j: JustificacionHs4, nombres: Map<string, NombreTramo>): ParteAnejo | null {
  const r = j.resultado;
  if (!r) return null;
  const camino = caminoCritico(r);
  if (camino.length === 0) return null;
  const fr = r.fraccionPerdidasLocalizadas;
  const estimadas = j.modo === "edificio";
  const filas = camino.map((t) => [
    etiqueta(nombres.get(t.id), t.id),
    f(t.longitud_m, 2),
    f(t.longitud_m * (1 + fr), 2),
    f(t.caudalAcumulado_dm3_s, 3),
    f(t.k, 2),
    f(t.caudalCalculo_dm3_s, 3),
    f(t.diametro_mm, 0),
    f(t.velocidad_m_s, 2),
    f(t.j_kPa_m, 3),
    f(t.presionEntrada_kPa, 1),
    f(t.presionResidual_kPa, 1),
  ]);

  const ap = r.porAparato.find((a) => a.id === r.puntoCriticoId)!;
  const punto = j.puntos.get(ap.id);
  const desc = punto ? describirPunto(punto, j.red.unifamiliar) : NOMBRE_TABLA_2_1[ap.tipo].toLowerCase();
  const donde = punto?.nivel != null ? `, en la ${nombrePlanta(punto.nivel)}` : "";
  const g = j.red.decisiones;
  const arranque: Trozo[] = g.grupoPresion
    ? [`La red arranca a la salida del grupo de presión, a ${f(j.partida_kPa, 0)} kPa.`]
    : [`La red arranca con la presión de la acometida, ${f(j.partida_kPa, 0)} kPa${j.presionSinDato ? " (supuesta: no consta el dato de la compañía)" : ""}.`];

  const intro: Trozo[] = [
    `Recorrido de la acometida al punto de consumo más desfavorable, ${desc}${donde}, que es el de menor margen sobre su presión mínima. `,
    ...arranque,
    ` En cada tramo la presión baja J·Lt y, si el tramo sube, 9,81 kPa por metro. Las pérdidas localizadas se toman como el ${f(fr * 100, 0)} % de las de rozamiento (ap. 4.2.2 pto 1 a); J sale de la expresión de predimensionado J = 12,7·v^1,75/Ø^1,25 (criterio de proyecto) y K, del método tradicional, K = 1/√(n − 1) (ap. 4.2.1 pto 2 b).`,
  ];

  // La conclusión: el punto crítico frente a su mínima y el de más presión frente a la máxima.
  const pMin = ap.presionMinExigida_kPa;
  const pMax = PRESIONES.datos.presionMaxConsumo_kPa;
  const masAlta = r.porAparato.reduce((m, a) => (a.presionResidual_kPa > m.presionResidual_kPa ? a : m), ap);
  const conclusion: Trozo[] = [
    `En el punto más desfavorable llegan `,
    { v: `${f(ap.presionResidual_kPa, 0)} kPa` },
    ap.presionResidual_kPa >= pMin
      ? `, por encima del mínimo de ${f(pMin, 0)} kPa (ap. 2.1.3 pto 2)`
      : `, por debajo del mínimo de ${f(pMin, 0)} kPa (ap. 2.1.3 pto 2): es necesario un grupo de presión (ap. 4.2.2 pto 1 b)`,
    `. En el punto con más presión llegan ${f(masAlta.presionResidual_kPa, 0)} kPa, ${masAlta.presionResidual_kPa <= pMax ? "sin pasar" : "por encima"} del máximo de ${f(pMax, 0)} kPa (ap. 2.1.3 pto 3)${masAlta.presionResidual_kPa > pMax ? ": se dispone una válvula reductora" : ""}.`,
  ];

  const hayExistentes = camino.some((t) => tramosExistentes(j).has(t.id));
  const notas = [
    ...(estimadas ? ["Longitudes tipo de la herramienta, estimadas a partir de El edificio; se confirman con los planos o ajustando la red a mano."] : []),
    ...(hayExistentes ? ["Los tramos existentes no se modifican; entran en el cálculo porque la presión llega por ellos."] : []),
  ];
  const tabla: TablaMemoria = {
    rotulo: "Camino crítico",
    cabecera: [hayExistentes ? `Tramo (${notas.length})` : "Tramo", estimadas ? "Lr (1)" : "Lr", "Lt", "Qb", "K", "Q", "Ø", "v", "J", "Pent", "Psal"],
    columnas: ["texto", "dato", "dato", "dato", "dato", "dato", "dato", "dato", "dato", "dato", "dato"],
    filas,
    ancha: true,
    tras: 1,
    ...(notas.length > 0 ? { notas } : {}),
  };
  return { titulo: "Camino crítico", parrafos: [intro, conclusion], tablas: [tabla] };
}

/** Lo que el anejo agrupa: los tramos con el mismo nombre (sin el de quién) y las mismas cifras. */
function parteResto(j: JustificacionHs4, nombres: Map<string, NombreTramo>): ParteAnejo | null {
  const r = j.resultado;
  if (!r) return null;
  const resto = r.porTramo.filter((t) => !t.esCritico);
  if (resto.length === 0) return null;
  const grupos = new Map<string, { base: string; dondes: string[]; n: number; cifras: string[] }>();
  const cifras = (t: ResultadoTramoHS4) => [
    f(t.caudalAcumulado_dm3_s, 3),
    f(t.k, 2),
    f(t.caudalCalculo_dm3_s, 3),
    f(t.diametro_mm, 0),
    f(t.velocidad_m_s, 2),
  ];
  // De la acometida a los aparatos, como el camino crítico: por profundidad en la red.
  const porId = new Map(r.porTramo.map((t) => [t.id, t] as const));
  const profundidad = new Map<string, number>();
  const prof = (t: ResultadoTramoHS4): number => {
    const ya = profundidad.get(t.id);
    if (ya !== undefined) return ya;
    const padre = t.parentId !== null ? porId.get(t.parentId) : undefined;
    profundidad.set(t.id, 0);
    const p = padre ? prof(padre) + 1 : 0;
    profundidad.set(t.id, p);
    return p;
  };
  for (const t of [...resto].reverse().sort((a, b) => prof(a) - prof(b))) {
    const nom = nombres.get(t.id) ?? { base: t.id, donde: null };
    const c = cifras(t);
    const clave = `${nom.base}|${c.join("|")}`;
    const g = grupos.get(clave);
    if (g) {
      g.n++;
      if (nom.donde && !g.dondes.includes(nom.donde)) g.dondes.push(nom.donde);
    } else grupos.set(clave, { base: nom.base, dondes: nom.donde ? [nom.donde] : [], n: 1, cifras: c });
  }
  const quien = (sinOrden: string[]) => {
    const ds = [...sinOrden].sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
    return ds.length === 0 ? "" : ds.length <= 4 ? ` · ${ds.join(", ")}` : ` · ${ds.slice(0, 3).join(", ")} y ${ds.length - 3} más`;
  };
  const filas = [...grupos.values()].map((g) => [`${g.base}${quien(g.dondes)}`, String(g.n), ...g.cifras]);
  return {
    titulo: "Resto de la red",
    parrafos: [["Los demás tramos de la red, con el Ø que les da el mismo cálculo. Los tramos con el mismo nombre y las mismas cifras se agrupan en una fila (n.º)."]],
    tablas: [
      {
        rotulo: "Resto de los tramos",
        cabecera: ["Tramo", "N.º", "Qb", "K", "Q", "Ø", "v"],
        filas,
      },
    ],
  };
}

// -----------------------------------------------------------------------------
// 4 · Contador
// -----------------------------------------------------------------------------

function parteContador(j: JustificacionHs4, datos: DatosAnejoHs4): ParteAnejo | null {
  const red = j.red;
  if (!j.resultado || red.unidades.length === 0) return null;
  const p: Trozo[] = [];
  if (red.unifamiliar) {
    if (j.existente) {
      p.push("El contador general existente no se modifica.");
    } else {
      const alim = j.resultado.porTramo.find((t) => t.tipo === "tubo_alimentacion");
      const dato = datos.diametroContador_mm;
      const d = dato !== undefined && Number.isFinite(dato) && dato > 0 ? dato : (alim?.diametro_mm ?? null);
      const deCompania = dato !== undefined && d === dato;
      const fila = d !== null ? filaContadorGeneral(d) : null;
      if (d === null) p.push("El Ø del contador general lo fija la compañía suministradora; su alojamiento, según la tabla 4.1 (ap. 4.1 pto 1).");
      else {
        p.push(
          deCompania
            ? `El contador general es de Ø ${f(d, 0)} mm, el que fija la compañía suministradora.`
            : `El contador general se toma de Ø ${f(d, 0)} mm: a falta del Ø de la compañía, el del tubo de alimentación, como criterio de proyecto (el calibre se adecua a los caudales, ap. 4.5.1).`,
        );
        if (!fila) p.push(" Queda fuera de la tabla 4.1: su alojamiento lo fija la compañía suministradora.");
        else
          p.push(
            ` Se aloja en ${fila.alojamiento === "armario" ? "un armario" : "una cámara"} de `,
            { v: `${f(fila.largo_mm, 0)} × ${f(fila.ancho_mm, 0)} × ${f(fila.alto_mm, 0)} mm` },
            fila.alojamiento === "armario" ? " (longitud × anchura × profundidad)" : " (largo × ancho × alto)",
            `, el de la tabla 4.1 para Ø ${f(fila.diametro_mm, 0)} mm (ap. 4.1 pto 1).`,
          );
      }
    }
  } else if (red.decisiones.contadores === "bateria") {
    const total = j.existente ? j.existente.bateria.total : red.contadores.total;
    p.push(
      `${j.existente ? "La batería de contadores divisionarios existente pasa a tener" : "La batería de contadores divisionarios tiene"} ${total} contadores. El DB-HS 4 no fija dimensiones para su alojamiento: se ajusta a las normas de la entidad suministradora. Se sitúa en zona de uso común, de fácil y libre acceso (ap. 3.2.1.2.7 pto 1), en un local de dimensiones suficientes para su mantenimiento (ap. 2.1.4 pto 1).`,
    );
  } else {
    p.push(
      "Los contadores divisionarios se alojan en cada planta, en zona de uso común, en cámara, arqueta o armario con desagüe (ap. 5.1.2.2), en un local de dimensiones suficientes para su mantenimiento (ap. 2.1.4 pto 1). Sus dimensiones las fija la entidad suministradora.",
    );
  }
  return { titulo: "Contador", parrafos: [p] };
}

// -----------------------------------------------------------------------------
// 5 · Agua caliente
// -----------------------------------------------------------------------------

/**
 * La ida del ACS al punto más alejado, estimada sobre la red de agua fría: del
 * arranque de la unidad (su derivación) al aparato con toma de ACS más lejano;
 * con producción central, desde el tubo de alimentación. Criterio de proyecto:
 * la red de ACS sigue a la de agua fría.
 */
export function idaAcsEstimada_m(j: JustificacionHs4): number | null {
  const r = j.resultado;
  if (!r) return null;
  const porId = new Map(r.porTramo.map((t) => [t.id, t] as const));
  const central = j.red.decisiones.aguaCaliente === "central";
  const arranques = new Set(j.red.unidades.map((u) => u.derivacionId));
  const t21 = CAUDAL_INSTANTANEO_TABLA_2_1.datos.aparatos;
  let max: number | null = null;
  for (const a of r.porAparato) {
    if (t21[a.tipo].acs_dm3_s === null) continue;
    let l = 0;
    let cur: string | null = a.tramoId;
    const visto = new Set<string>();
    while (cur !== null && !visto.has(cur)) {
      visto.add(cur);
      const t = porId.get(cur);
      if (!t || t.tipo === "acometida" || t.tipo === "tubo_alimentacion") break;
      // En una red a mano no se sabe dónde empieza la unidad: hasta el montante.
      if (!central && j.modo === "manual" && t.tipo === "columna_montante") break;
      l += t.longitud_m;
      if (!central && arranques.has(t.id)) break;
      cur = t.parentId;
    }
    if (max === null || l > max) max = l;
  }
  return max;
}

function parteAcs(j: JustificacionHs4, datos: DatosAnejoHs4): ParteAnejo | null {
  if (!j.resultado) return null;
  const red = j.red;
  const central = red.decisiones.aguaCaliente === "central";
  const umbral = AHORRO_AGUA.datos.retornoACSDesdeLongitudIda_m;
  const cita = "(DB-HS 4, ap. 2.3 pto 2 y ap. 3.2.2.1 pto 3)";
  const sistema = central
    ? "El agua caliente se produce de forma centralizada; su red de impulsión y retorno se dimensiona aparte."
    : red.unifamiliar || (red.contadores.viviendas === 1 && red.contadores.oficinas === 0)
      ? "El agua caliente se produce en la propia vivienda."
      : "El agua caliente se produce de forma individual en cada unidad.";
  const dato = datos.longitudIdaAcs_m;
  const conDato = dato !== undefined && Number.isFinite(dato) && dato > 0;
  const l = conDato ? dato : idaAcsEstimada_m(j);
  const p: Trozo[] = [sistema, " "];
  if (l === null) {
    p.push(`La red de ACS dispone de retorno si la ida al punto más alejado mide ${umbral} m o más ${cita}.`);
  } else {
    const origen = conDato ? "" : ` (estimada sobre la red de agua fría${j.modo === "edificio" ? ", con las longitudes tipo" : ""})`;
    p.push(`La ida al punto más alejado mide `, { v: `${fmt(l, undefined, 1)} m` }, origen);
    p.push(
      l >= umbral
        ? `: al ser de ${umbral} m o más, la instalación de ACS dispone de red de retorno ${cita}.`
        : `, menos de ${umbral} m, así que no necesita red de retorno ${cita}.`,
    );
  }
  return { titulo: "Agua caliente sanitaria", parrafos: [p] };
}

// -----------------------------------------------------------------------------

function fuente(j: JustificacionHs4): string {
  return [
    "DB-HS · HS 4 (consolidado 14-06-2022)",
    "ap. 2.1.3, 2.1.4, 2.3, 3.2.2.1, 4.1, 4.2 y 4.5.1",
    "tablas 2.1, 4.1, 4.2 y 4.3",
    "simultaneidad por el método tradicional",
    j.modo === "manual" ? "red definida por el proyectista" : "datos de El edificio",
    `motor ${ENGINE_VERSION}`,
  ].join(" · ");
}

export function anejoHs4(j: JustificacionHs4, datos: DatosAnejoHs4 = {}): AnejoDoc {
  const nombres = nombresTramos(j);
  const partes = [parteCaudales(j), parteCamino(j, nombres), parteResto(j, nombres), parteContador(j, datos), parteAcs(j, datos)].filter(
    (x): x is ParteAnejo => x !== null,
  );
  return { abreviaturas: ABREVIATURAS, partes, fuente: fuente(j) };
}
