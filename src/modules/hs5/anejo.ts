// =============================================================================
// DB-HS5 — El cálculo extenso para el anejo de instalaciones (feature-33, paso
// 3): lo que la memoria resume, elemento a elemento. PURA.
//
// No calcula nada que la memoria no sepa: lee el mismo `HS5Result` y las
// mismas pluviales. Partes:
//   1. unidades de desagüe por aparato (tabla 4.1) y por unidad tipo;
//   2. bajantes, con las dos comprobaciones de la tabla 4.4;
//   3. ramales y colectores (tablas 4.3 y 4.5);
//   4. arquetas (tabla 4.13), con las reglas del DB que recoge K-MEM.18;
//   5. pluviales;
//   6. ventilación.
// =============================================================================

import type { AnejoDoc, ParteAnejo, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { udDeAparato, type ResultadoTramo } from "./calc";
import type { JustificacionHs5 } from "./justificacion";
import { NOMBRE_BAJANTE, type VerticalHs5 } from "./red";
import { ARQUETAS_TABLA_4_13, UD_APARATOS_TABLA_4_1, type TipoAparato, type UsoAparato } from "./tablas";

/** Cifra con decimales fijos, en español. */
function f(v: number | null | undefined, d = 0): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Los nombres de la tabla 4.1, como los da el DB. */
const NOMBRE_TABLA_4_1: Record<TipoAparato, string> = {
  lavabo: "Lavabo",
  bide: "Bidé",
  ducha: "Ducha",
  banera: "Bañera (con o sin ducha)",
  inodoro_cisterna: "Inodoro con cisterna",
  inodoro_fluxometro: "Inodoro con fluxómetro",
  urinario_pedestal: "Urinario de pedestal",
  urinario_suspendido: "Urinario suspendido",
  urinario_bateria: "Urinario en batería",
  fregadero_cocina: "Fregadero de cocina",
  fregadero_lab_restaurante: "Fregadero de laboratorio, restaurante, etc.",
  lavadero: "Lavadero",
  vertedero: "Vertedero",
  fuente_beber: "Fuente para beber",
  sumidero_sifonico: "Sumidero sifónico",
  lavavajillas: "Lavavajillas",
  lavadora: "Lavadora",
  cuarto_bano_cisterna: "Cuarto de baño (inodoro con cisterna)",
  cuarto_bano_fluxometro: "Cuarto de baño (inodoro con fluxómetro)",
  cuarto_aseo_cisterna: "Cuarto de aseo (inodoro con cisterna)",
  cuarto_aseo_fluxometro: "Cuarto de aseo (inodoro con fluxómetro)",
};

const ORDEN_APARATOS = Object.keys(NOMBRE_TABLA_4_1) as TipoAparato[];

/** Ø mínimo del sifón y la derivación individual (tabla 4.1). */
function diametroAparato(tipo: TipoAparato, uso: UsoAparato): number | null {
  const fila = UD_APARATOS_TABLA_4_1.datos.aparatos[tipo];
  return uso === "privado" ? fila.diametroMin_mm_privado : fila.diametroMin_mm_publico;
}

/** Dimensiones mínimas de la arqueta para el Ø del colector de salida (tabla 4.13, primera columna ≥ Ø). */
export function arquetaTabla413(diametro_mm: number): { largo_cm: number; ancho_cm: number } | null {
  return ARQUETAS_TABLA_4_13.datos.filas.find((x) => x.diametro_mm >= diametro_mm) ?? null;
}

// -----------------------------------------------------------------------------
// 1 · Unidades de desagüe por aparato
// -----------------------------------------------------------------------------

interface ColumnaUnidad {
  titulo: string;
  aparatos: { tipo: TipoAparato; uso: UsoAparato }[];
}

function columnasUnidades(j: JustificacionHs5): ColumnaUnidad[] {
  const usoRed = j.residualesInputs.uso;
  if (j.modo === "manual") {
    return [{ titulo: "Red", aparatos: j.residualesInputs.aparatos.map((a) => ({ tipo: a.tipo, uso: a.uso ?? usoRed })) }];
  }
  const vistas = new Map<string, ColumnaUnidad>();
  for (const v of j.red.verticales) {
    const clave = `${v.clase}:${v.tipoId}`;
    if (vistas.has(clave)) continue;
    const titulo = v.clase === "nucleo_aseos" ? `Aseos ${v.nombre}` : j.red.unifamiliar ? "Vivienda" : `Viv. ${v.nombre}`;
    // Una unidad: la primera planta de la vertical (las demás son iguales).
    const nivel = v.niveles[0];
    const aparatos = v.bajantes.flatMap((b) =>
      b.ramales.filter((r) => j.red.unifamiliar || r.nivel === nivel).flatMap((r) => r.cuartos.flatMap((c) => c.aparatos.map((a) => ({ tipo: a.tipo, uso: a.uso ?? usoRed })))),
    );
    vistas.set(clave, { titulo, aparatos });
  }
  return [...vistas.values()];
}

function parteAparatos(j: JustificacionHs5): ParteAnejo | null {
  const cols = columnasUnidades(j);
  const claves = new Map<string, { tipo: TipoAparato; uso: UsoAparato }>();
  for (const t of ORDEN_APARATOS) {
    for (const uso of ["privado", "publico"] as const) {
      if (cols.some((c) => c.aparatos.some((a) => a.tipo === t && a.uso === uso))) claves.set(`${t}:${uso}`, { tipo: t, uso });
    }
  }
  if (claves.size === 0) return null;
  const hayPublico = [...claves.values()].some((k) => k.uso === "publico");
  const hayPrivado = [...claves.values()].some((k) => k.uso === "privado");
  const filas = [...claves.values()].map((k) => [
    `${NOMBRE_TABLA_4_1[k.tipo]}${hayPublico && hayPrivado ? ` (uso ${k.uso === "publico" ? "público" : "privado"})` : ""}`,
    f(udDeAparato(k.tipo, k.uso), 1).replace(/,0$/, ""),
    f(diametroAparato(k.tipo, k.uso)),
    ...cols.map((c) => String(c.aparatos.filter((a) => a.tipo === k.tipo && a.uso === k.uso).length || "—")),
  ]);
  filas.push(["UD de la unidad", "", "", ...cols.map((c) => f(c.aparatos.reduce((s, a) => s + (udDeAparato(a.tipo, a.uso) ?? 0), 0), 1).replace(/,0$/, ""))]);
  const agrupados = [...claves.values()].some((k) => k.tipo.startsWith("cuarto_"));
  return {
    titulo: "Unidades de desagüe por aparato",
    parrafos: [
      [
        `Unidades de desagüe y Ø mínimo del sifón y de la derivación individual de cada aparato (tabla 4.1, uso ${hayPublico && hayPrivado ? "privado y público" : hayPublico ? "público" : "privado"}), válidos para derivaciones de hasta 1,5 m.`,
        agrupados ? " Los cuartos de baño y de aseo se cuentan como conjunto, como permite la tabla." : "",
      ],
    ],
    tablas: [
      {
        rotulo: "Unidades de desagüe y aparatos",
        cabecera: ["Aparato", "UD", "Ø [mm]", ...cols.map((c) => c.titulo)],
        filas,
        ...(cols.length + 3 > 8 ? { ancha: true } : {}),
      },
    ],
  };
}

// -----------------------------------------------------------------------------
// 2 · Bajantes y 3 · ramales y colectores
// -----------------------------------------------------------------------------


/** Lo que el anejo lista de la red: el tramo dimensionado, su nombre y cuántos iguales representa. */
interface FilaRed {
  t: ResultadoTramo;
  nombre: string;
  n: number;
  /** La planta de un ramal: los ramales iguales de varias plantas van en una fila. */
  planta?: string;
}

/** En modo «edificio», una vertical representa sus instancias iguales («× n»). */
function filasRed(j: JustificacionHs5): FilaRed[] {
  const r = j.residuales;
  if (!r) return [];
  const porId = new Map(r.porTramo.map((t) => [t.id, t] as const));
  if (j.modo === "manual") {
    const nombre = new Map(j.residualesInputs.tramos.map((t) => [t.id, t.nombre?.trim() || t.id] as const));
    return [...r.porTramo].reverse().map((t) => ({ t, nombre: nombre.get(t.id) ?? t.id, n: 1 }));
  }
  const out: FilaRed[] = [];
  const col = j.red.colectorId ? porId.get(j.red.colectorId) : undefined;
  if (col) out.push({ t: col, nombre: j.existente ? "Colector de lo intervenido" : "Colector general", n: 1 });
  const quien = (v: VerticalHs5) => (j.red.unifamiliar ? "" : v.clase === "nucleo_aseos" ? ` · aseos ${v.nombre}` : ` · ${v.nombre}`);
  for (const v of j.red.verticales) {
    for (const b of v.bajantes) {
      const tb = b.id ? porId.get(b.id) : undefined;
      if (tb) out.push({ t: tb, nombre: `Bajante de ${NOMBRE_BAJANTE[b.clase]}${quien(v)}`, n: v.instancias });
      for (const ra of b.ramales) {
        const tr = porId.get(ra.id);
        const cuartos = ra.cuartos.map((c) => c.etiqueta.toLowerCase()).join(" y ");
        if (tr) out.push({ t: tr, nombre: `Ramal de ${cuartos}${quien(v)}`, n: v.instancias, planta: etiquetaNivel(ra.nivel) });
      }
    }
  }
  return out;
}

function parteBajantes(filas: FilaRed[]): ParteAnejo | null {
  const bs = filas.filter((x) => x.t.tipo === "bajante");
  if (bs.length === 0) return null;
  const ambigua = bs.some((x) => x.t.bajante?.columna === "envolvente");
  return {
    titulo: "Bajantes",
    parrafos: [
      [
        "Cada bajante se dimensiona con las dos comprobaciones de la tabla 4.4: las UD que recibe en total y las del ramal más cargado que le acomete, en la columna de su altura en plantas (ap. 4.1.2). El Ø no puede ser menor que el de lo que le vierte.",
      ],
    ],
    tablas: [
      {
        rotulo: "Bajantes",
        cabecera: ["Bajante", "N.º", "Plantas", "UD total", "Ø por total", "UD ramal", "Ø por ramal", "Ø"],
        filas: bs.map(({ t, nombre, n }) => {
          const d = t.bajante;
          return [
            nombre,
            String(n),
            d ? (d.plantasAtravesadas !== d.plantas ? `${d.plantas} (atraviesa ${d.plantasAtravesadas})${d.columna === "envolvente" ? " (1)" : ""}` : String(d.plantas)) : "—",
            f(t.udAcumuladas, 1).replace(/,0$/, ""),
            f(d?.porTotal?.diametro_mm),
            d ? f(d.udMaxRamal, 1).replace(/,0$/, "") : "—",
            f(d?.porRamal?.diametro_mm),
            f(t.diametro_mm),
          ];
        }),
        ...(ambigua
          ? {
              notas: [
                "Las plantas que sirve y las que atraviesa hasta el colector caen a distinto lado de 3: el DB no define la altura de la bajante, así que se entra con las dos columnas de la tabla 4.4 y se toma lo más desfavorable (criterio de proyecto).",
              ],
            }
          : {}),
      },
    ],
  };
}

/** Los ramales iguales de varias plantas, en una fila: «Ramal de cocina · A · P1, P2 y P3». */
function agruparPlantas(filas: FilaRed[]): FilaRed[] {
  const out: (FilaRed & { plantas: string[] })[] = [];
  for (const x of filas) {
    const cifras = (y: FilaRed) => `${y.t.udAcumuladas}|${y.t.pendiente_pct}|${y.t.diametro_mm}|${y.t.capacidad_ud}`;
    const g = x.planta ? out.find((y) => y.planta !== undefined && y.nombre === x.nombre && cifras(y) === cifras(x)) : undefined;
    if (g) {
      g.n += x.n;
      g.plantas.push(x.planta!);
    } else out.push({ ...x, plantas: x.planta ? [x.planta] : [] });
  }
  const lista = (ps: string[]) => (ps.length <= 1 ? (ps[0] ?? "") : `${ps.slice(0, -1).join(", ")} y ${ps.at(-1)}`);
  return out.map(({ plantas, ...x }) => ({ ...x, nombre: plantas.length > 0 ? `${x.nombre} · ${lista(plantas)}` : x.nombre }));
}

function parteRamalesColectores(j: JustificacionHs5, filas: FilaRed[]): ParteAnejo | null {
  const rs = agruparPlantas(filas.filter((x) => x.t.tipo !== "bajante"));
  if (rs.length === 0) return null;
  const tabla: TablaMemoria = {
    rotulo: "Ramales y colectores",
    cabecera: ["Tramo", "N.º", "UD", "i [%]", "Ø", "Admite [UD]"],
    filas: rs.map(({ t, nombre, n }) => [
      nombre,
      String(n),
      f(t.udAcumuladas, 1).replace(/,0$/, ""),
      fmt(t.pendiente_pct, undefined, 1),
      f(t.diametro_mm),
      f(t.capacidad_ud, 1).replace(/,0$/, ""),
    ]),
  };
  const ex = j.existente;
  if (ex) {
    tabla.filas.push([
      "Colector general existente",
      "1",
      f(ex.udTotal, 1).replace(/,0$/, ""),
      fmt(ex.pendiente_pct, undefined, 1),
      ex.diametro_mm === null ? `≥ ${f(ex.minimo_mm)}` : f(ex.diametro_mm),
      f(ex.capacidad_ud, 1).replace(/,0$/, ""),
    ]);
    tabla.notas = [
      ex.diametro_mm === null
        ? `El colector existente no consta: con las UD de la obra hecha necesita al menos Ø${f(ex.minimo_mm)} (tabla 4.5).`
        : `Recibe ${f(ex.udObra, 1).replace(/,0$/, "")} UD de lo intervenido, sobre lo que ya recogía.`,
    ];
  }
  return {
    titulo: "Ramales y colectores",
    parrafos: [
      [
        "Los ramales se dimensionan por la tabla 4.3 y los colectores por la tabla 4.5, a su pendiente. El Ø no disminuye en el sentido del flujo y no puede ser menor que el desagüe de los aparatos que recibe (el inodoro, Ø100).",
      ],
    ],
    tablas: [tabla],
  };
}

// -----------------------------------------------------------------------------
// 4 · Arquetas
// -----------------------------------------------------------------------------

export interface ArquetaHs5 {
  /** «Arqueta a pie de bajante», «Pozo general»… */
  tipo: string;
  n: number;
  /** Ø del colector de salida [mm]. */
  diametro_mm: number | null;
  cita: string;
}

/**
 * Las arquetas que exige el DB para la red (K-MEM.18). Con colector enterrado,
 * una a pie de cada bajante, nunca sifónica; con colgado, ninguna (piezas
 * especiales y registros). Siempre, el pozo general: uno por acometida. En una
 * red a mano, además, una arqueta de paso en cada encuentro de colectores.
 */
export function arquetasHs5(j: JustificacionHs5): ArquetaHs5[] {
  const out: ArquetaHs5[] = [];
  const r = j.residuales;
  const pl = j.existente?.pluvialesSinTocar ? null : j.pluviales;
  const enterrado = j.red.decisiones.colectores === "enterrado";
  const porId = new Map((r?.porTramo ?? []).map((t) => [t.id, t] as const));
  if (enterrado && r) {
    // A pie de bajante: el Ø de salida es el del colector al que vierte.
    const porSalida = new Map<number | null, number>();
    for (const t of r.porTramo.filter((x) => x.tipo === "bajante")) {
      const padre = t.parentId !== null ? porId.get(t.parentId) : undefined;
      const d = padre?.diametro_mm ?? t.diametro_mm;
      porSalida.set(d, (porSalida.get(d) ?? 0) + 1);
    }
    for (const [d, n] of porSalida) out.push({ tipo: "A pie de bajante de residuales (no sifónica)", n, diametro_mm: d, cita: "ap. 3.3.1.4.2 pto 3" });
    if (j.modo === "manual") {
      const pasos = r.porTramo.filter((t) => t.tipo === "colector" && t.parentId !== null && t.childrenIds.filter((c) => porId.get(c)?.tipo === "colector").length > 0);
      for (const t of pasos) out.push({ tipo: "De paso (encuentro de colectores)", n: 1, diametro_mm: porId.get(t.parentId!)?.diametro_mm ?? t.diametro_mm, cita: "ap. 3.3.1.5 ptos 1 y 5" });
    }
  }
  if (enterrado && pl) {
    out.push({ tipo: "A pie de bajante de pluviales (no sifónica)", n: pl.bajantes, diametro_mm: pl.colector.diametro_mm, cita: "ap. 3.3.1.4.2 pto 3" });
  }
  if (j.existente) return out;
  const colRes = j.red.colectorId ? (porId.get(j.red.colectorId)?.diametro_mm ?? null) : null;
  const unitario = j.red.decisiones.alcantarillado === "unitario";
  if (r && pl && unitario) {
    // Las dos redes se unen antes de la acometida: la arqueta de salida.
    const d = Math.max(colRes ?? 0, pl.colector.diametro_mm ?? 0) || null;
    out.push({ tipo: "Pozo general (residuales y pluviales)", n: 1, diametro_mm: d, cita: "ap. 3.3.1.5 pto 3" });
  } else {
    if (r) out.push({ tipo: "Pozo general de residuales", n: 1, diametro_mm: colRes, cita: "ap. 3.3.1.5 pto 3" });
    if (pl) out.push({ tipo: "Pozo general de pluviales", n: 1, diametro_mm: pl.colector.diametro_mm, cita: "ap. 3.3.1.5 pto 3" });
  }
  return out;
}

function parteArquetas(j: JustificacionHs5): ParteAnejo | null {
  if (!j.residuales && !j.pluviales) return null;
  const arquetas = arquetasHs5(j);
  const enterrado = j.red.decisiones.colectores === "enterrado";
  const pl = j.existente?.pluvialesSinTocar ? null : j.pluviales;
  const unitario = j.red.decisiones.alcantarillado === "unitario";
  const p: Trozo[] = [];
  if (j.existente) {
    p.push("Lo intervenido acomete a la red de saneamiento existente del edificio: el pozo general y la acometida existentes no se modifican.");
  }
  if (enterrado) {
    p.push(`${p.length > 0 ? " " : ""}Con los colectores enterrados, cada bajante acomete a una arqueta a pie de bajante, que no debe ser sifónica (ap. 3.3.1.4.2 pto 3).`);
  } else {
    p.push(
      `${p.length > 0 ? " " : ""}Con los colectores colgados, las bajantes se conectan mediante piezas especiales, sin arquetas, y no acometen más de dos colectores en un mismo punto (ap. 3.3.1.4.1 ptos 1 y 4).`,
    );
  }
  p.push(" En los tramos rectos se intercalan registros a distancias no mayores de 15 m (ap. 3.3.1.4.1 pto 5 y 3.3.1.4.2 pto 4); su posición se fija en los planos.");
  if (!j.existente && j.residuales && pl && unitario) {
    p.push(
      " Como el alcantarillado es unitario, las residuales y las pluviales se unen en el pozo general, al que llega más de un colector: se dispone una arqueta de trasdós (ap. 3.3.1.5 pto 2 d) y un cierre hidráulico en la conexión, con arqueta sifónica o con cierres en los puntos de captación (ap. 3.2 pto 1).",
    );
  }
  if (j.red.garajes.length > 0) p.push(" La red del garaje pasa por un separador de grasas antes de unirse a la red general (ap. 3.3.1.5 pto 2 e).");
  const tablas: TablaMemoria[] =
    arquetas.length === 0
      ? []
      : [
          {
            rotulo: "Arquetas",
            cabecera: ["Arqueta", "N.º", "Ø de salida [mm]", "L × A mínimas [cm]", "Apartado"],
            filas: arquetas.map((a) => {
              const dim = a.diametro_mm !== null ? arquetaTabla413(a.diametro_mm) : null;
              return [a.tipo, String(a.n), f(a.diametro_mm), dim ? `${dim.largo_cm} × ${dim.ancho_cm}` : "—", a.cita];
            }),
            notas: ["Dimensiones mínimas de la tabla 4.13 para el Ø del colector de salida, en la primera columna igual o mayor (criterio para los Ø de PVC)."],
          },
        ];
  return { titulo: "Arquetas", parrafos: [p], tablas };
}

// -----------------------------------------------------------------------------
// 5 · Pluviales y 6 · ventilación
// -----------------------------------------------------------------------------

function partePluviales(j: JustificacionHs5): ParteAnejo | null {
  if (j.existente?.pluvialesSinTocar) {
    return { titulo: "Pluviales", parrafos: [["La intervención no actúa sobre las cubiertas ni sobre la red de pluviales existente, que no se modifica."]] };
  }
  const pl = j.pluviales;
  if (!pl) return null;
  const i = j.intensidad;
  const filas: string[][] = [];
  if (pl.sumideros !== null) filas.push(["Sumideros", String(pl.sumideros), f(pl.superficie_m2), "", "", "Tabla 4.6"]);
  if (pl.canalon) {
    filas.push([`Canalón · ${fmt(pl.canalon.pendiente_pct, undefined, 1)} %`, String(pl.bajantes), f(pl.canalon.superficie_m2), f(pl.canalon.corregida_m2), f(pl.canalon.diametro_mm), "Tabla 4.7"]);
  }
  filas.push(["Bajante", String(pl.bajantes), f(pl.bajante.superficie_m2), f(pl.bajante.corregida_m2), f(pl.bajante.diametro_mm), "Tabla 4.8"]);
  filas.push([`Colector · ${fmt(pl.colector.pendiente_pct, undefined, 1)} %`, "1", f(pl.colector.superficie_m2), f(pl.colector.corregida_m2), f(pl.colector.diametro_mm), "Tabla 4.9"]);
  const intensidad = i.supuesta
    ? `la intensidad de referencia, ${f(i.valor_mm_h)} mm/h (no consta la zona pluviométrica del emplazamiento)`
    : `${f(i.valor_mm_h)} mm/h (zona ${i.zona}, isoyeta ${i.isoyeta}, tabla B.1)`;
  return {
    titulo: "Pluviales",
    parrafos: [
      [
        `La cubierta, de ${f(pl.superficie_m2)} m², se calcula con ${intensidad}. Las tablas están hechas para 100 mm/h: la superficie se corrige por f = i/100 = ${fmt(pl.f, undefined, 2)} (ap. 4.2).`,
      ],
    ],
    tablas: [
      {
        rotulo: "Red de pluviales",
        cabecera: ["Elemento", "N.º", "Superficie [m²]", "Corregida [m²]", "Ø [mm]", "Tabla"],
        filas,
      },
    ],
  };
}

function parteVentilacion(j: JustificacionHs5): ParteAnejo | null {
  const r = j.residuales;
  if (!r || r.porTramo.every((t) => t.tipo !== "bajante")) return null;
  const v = r.ventilacion;
  const p: Trozo[] = [
    `Las bajantes se prolongan al menos ${fmt(v.primaria.prolongacionMin_m, undefined, 1)} m sobre la cubierta${j.residualesInputs.cubiertaTransitable ? " transitable" : ""} como ventilación primaria (ap. 3.3.3.1).`,
  ];
  if (v.secundaria.modo === "no_requerida") p.push(" Con menos de siete plantas, la primaria basta.");
  else {
    p.push(
      ` Llevan ventilación secundaria ${v.secundaria.modo === "alternas" ? "en plantas alternas" : "en cada planta"}`,
      ...(v.secundaria.diametroColumna_mm !== null ? [", con columna de ", { v: `Ø${f(v.secundaria.diametroColumna_mm)}` } as Trozo] : []),
      " (ap. 3.3.3.2 y tabla 4.10).",
    );
  }
  if (v.terciaria.obligatoria) p.push(" Los ramales de más de 5 m llevan ventilación terciaria (ap. 3.3.3.3).");
  return { titulo: "Ventilación", parrafos: [p] };
}

// -----------------------------------------------------------------------------

function fuente(j: JustificacionHs5): string {
  return [
    "DB-HS · HS 5 (consolidado 14-06-2022)",
    "ap. 3.2, 3.3.1, 3.3.3, 4.1 y 4.2",
    `tablas 4.1, 4.3, 4.4, 4.5${j.pluviales ? ", 4.6 a 4.9" : ""} y 4.13`,
    j.modo === "manual" ? "red definida por el proyectista" : "datos de El edificio",
    `motor ${ENGINE_VERSION}`,
  ].join(" · ");
}

const ABREVIATURAS: [string, string][] = [
  ["UD", "unidades de desagüe"],
  ["Ø", "diámetro nominal [mm]"],
  ["i", "pendiente [%]"],
  ["N.º", "elementos iguales que representa la fila"],
];

export function anejoHs5(j: JustificacionHs5): AnejoDoc {
  const filas = filasRed(j);
  const partes = [parteAparatos(j), parteBajantes(filas), parteRamalesColectores(j, filas), parteArquetas(j), partePluviales(j), parteVentilacion(j)].filter(
    (x): x is ParteAnejo => x !== null,
  );
  return { abreviaturas: ABREVIATURAS, partes, fuente: fuente(j) };
}
