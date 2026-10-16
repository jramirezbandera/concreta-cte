// =============================================================================
// REBT — El cálculo extenso para el anejo de instalaciones (feature-34): lo que
// va aguas abajo de la previsión de cargas que justifica la memoria. PURA.
//
// No calcula nada que la memoria no sepa: lee la misma `JustificacionRebt`, que
// ya trae la instalación (`instalacion.ts`). Partes:
//   1. la previsión, en resumen (el detalle está en la memoria);
//   2. la instalación interior de cada vivienda tipo: puntos de utilización por
//      estancia (tabla 2) y circuitos (tabla 1), con la longitud máxima de cada
//      circuito por la caída de tensión;
//   3. la línea general de alimentación y las derivaciones individuales;
//   4. la centralización de contadores y la caja general de protección;
//   5. la puesta a tierra.
// Lo estimado se dice: longitudes, superficies que faltan y terreno.
// =============================================================================

import type { AnejoDoc, ParteAnejo, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { InteriorTipo } from "./instalacion";
import type { CircuitoRebt, PuntosPorCircuito } from "./interior";
import type { DetalleRebt, JustificacionRebt } from "./justificacion";
import type { LineaRebt } from "./lineas";
import { kW, NOMBRE_GRADO, num, textoDesglose, textoUbicacion, W } from "./textos";
import { CRITERIOS_INSTALACION, FORMULAS_ANEXO2, REGLAS_ITC_BT_25, TIERRA_GUIA_BT26, TIERRA_REBT } from "./tablasInstalacion";

/** Cifra con decimales fijos, en español: «0,45». */
function f(v: number, d: number): string {
  return v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Cifra con hasta d decimales: «2,5», «6». */
function n(v: number, d = 1): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: d });
}

function detalle<K extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: K): Extract<DetalleRebt, { clase: K }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleRebt, { clase: K }>) : null;
}

const ABREVIATURAS: [string, string][] = [
  ["P", "potencia de cálculo [kW]"],
  ["Ib", "intensidad de cálculo [A]"],
  ["IA", "intensidad asignada del interruptor automático [A]"],
  ["L", "longitud de la línea [m]"],
  ["S", "sección de cada conductor de fase [mm²]"],
  ["Iz", "intensidad admisible del cable en su instalación [A]"],
  ["e", "caída de tensión [% de la tensión nominal]"],
  ["Lmáx", "longitud máxima del circuito con la que su sección cumple la caída de tensión [m]"],
  ["Ø", "diámetro exterior del tubo [mm]"],
];

// -----------------------------------------------------------------------------
// 1 · La previsión
// -----------------------------------------------------------------------------

function partePrevision(j: JustificacionRebt): ParteAnejo | null {
  const total = detalle(j, "total");
  if (!total) return null;
  const I = j.instalacion;
  const p: Trozo[][] = [];
  if (j.existente) {
    p.push([
      "La previsión de cargas se justifica en la memoria. Con la obra, la carga del edificio pasa de ",
      { v: kW(j.existente.antes_W) },
      " a ",
      { v: kW(j.existente.despues_W) },
      ` (${num(j.existente.despues_A, 1)} A en la línea general de alimentación). Este anejo desarrolla lo que añade la obra.`,
    ]);
  } else {
    p.push([
      j.unifamiliar ? "La previsión de cargas se justifica en la memoria: " : "La previsión de cargas del edificio se justifica en la memoria: ",
      { v: j.unifamiliar ? W(total.p_W) : kW(total.p_W) },
      j.unifamiliar
        ? `, ${total.trifasica ? "trifásica a 400 V" : "monofásica a 230 V"} (${num(total.i_A, 1)} A).`
        : `, ${num(total.i_A, 1)} A en la línea general de alimentación (400 V, cos φ ${n(CRITERIOS_INSTALACION.datos.cosPhiLga)}).`,
    ]);
  }
  if (I.viviendas.length === 0) return { titulo: "Previsión de cargas", parrafos: p };
  const tabla: TablaMemoria = {
    rotulo: j.unifamiliar ? "Grado de electrificación (ITC-BT-10 ap. 2; ITC-BT-25 ap. 2)" : "Viviendas tipo (ITC-BT-10 ap. 2; ITC-BT-25 ap. 2)",
    cabecera: j.unifamiliar ? ["Vivienda", "Superficie útil (m²)", "Grado", "P (W)", "IGA (A)"] : ["Vivienda tipo", "Nº", "Superficie útil (m²)", "Grado", "P (W)", "IGA (A)"],
    columnas: j.unifamiliar ? ["texto", "dato", "texto", "dato", "dato"] : ["texto", "dato", "dato", "texto", "dato", "dato"],
    filas: I.viviendas.map((v) => {
      const fila = [n(v.superficie_m2, 2), NOMBRE_GRADO[v.grado], n(v.potencia_W, 0), String(v.iga_A)];
      return j.unifamiliar ? ["Vivienda", ...fila] : [v.nombre, String(v.cantidad), ...fila];
    }),
  };
  return { titulo: "Previsión de cargas", parrafos: p, tablas: [tabla] };
}

// -----------------------------------------------------------------------------
// 2 · La instalación interior
// -----------------------------------------------------------------------------

const COLUMNAS_PUNTOS = ["C1", "C2", "C3", "C4", "C5", "C8", "C10", "C13"] as const;
const MECANISMO: Record<(typeof COLUMNAS_PUNTOS)[number], string> = {
  C1: "C1 luz",
  C2: "C2 tomas",
  C3: "C3 cocina",
  C4: "C4",
  C5: "C5 tomas",
  C8: "C8 calef.",
  C10: "C10 secad.",
  C13: "C13 recarga",
};

function tablaPuntos(v: InteriorTipo, titulo: string): TablaMemoria {
  const est = v.interior.estancias.filter((e) => Object.keys(e.puntos).length > 0);
  const cols = COLUMNAS_PUNTOS.filter((c) => est.some((e) => (e.puntos[c] ?? 0) > 0));
  const total = est.reduce<PuntosPorCircuito>((a, e) => {
    for (const c of cols) a[c] = (a[c] ?? 0) + (e.puntos[c] ?? 0);
    return a;
  }, {});
  const hayFalta = est.some((e) => e.sinSuperficie);
  return {
    rotulo: `Puntos de utilización${titulo} (ITC-BT-25 tabla 2)`,
    cabecera: ["Estancia", "Superficie (m²)", ...cols.map((c) => MECANISMO[c])],
    columnas: ["texto", "dato", ...cols.map(() => "dato" as const)],
    filas: [
      ...est.map((e) => [e.nombre, e.util_m2 !== null ? n(e.util_m2, 2) : e.sinSuperficie ? "— (1)" : "—", ...cols.map((c) => (e.puntos[c] ? String(e.puntos[c]) : "—"))]),
      ["Total", "", ...cols.map((c) => String(total[c] ?? 0))],
    ],
    ...(hayFalta ? { notas: ["Sin superficie: el mínimo de la tabla 2 para una estancia de hasta 10 m² (criterio). Indícala en Habitabilidad."] } : {}),
  };
}

function tablaCircuitos(cs: CircuitoRebt[], titulo: string): TablaMemoria {
  const recarga = cs.some((c) => c.codigo === "C13");
  return {
    rotulo: `Circuitos${titulo} (ITC-BT-25 tabla 1)`,
    cabecera: ["Circuito", "Uso", "Puntos", "IA (A)", "S (mm²)", "Ø tubo (mm)", "Lmáx (m)"],
    columnas: ["texto", "texto", "dato", "dato", "dato", "dato", "dato"],
    filas: cs.map((c) => [c.codigo, c.uso, c.puntos !== null ? String(c.puntos) : "—", String(c.ia_A), n(c.s_mm2), String(c.tubo_mm), `${n(c.lmax_m)}${c.codigo === "C13" ? " (1)" : ""}`]),
    notas: recarga ? ["Con la caída del 5 % hasta el punto de recarga (ITC-BT-52 ap. 5) y el interruptor de 16 A de una estación de 3 680 W (ITC-BT-52 tabla 1)."] : [],
  };
}

const NOMBRE_CLIMA = {
  ninguna: "",
  aire_aire: "la bomba de calor aire-aire, en un circuito C9 de aire acondicionado",
  aire_agua: "la bomba de calor aire-agua de calefacción, en un circuito C8",
  emisores: "los emisores eléctricos de calefacción, en un circuito C8 con las tomas de la tabla 2",
} as const;

function parteInterior(j: JustificacionRebt, v: InteriorTipo): ParteAnejo {
  const titulo = j.unifamiliar ? "" : ` · vivienda tipo ${v.nombre}`;
  const R = REGLAS_ITC_BT_25.datos;
  const I = v.interior;
  const eq = j.instalacion.equipos;
  const p: Trozo[][] = [];
  p.push([
    I.deHabitabilidad
      ? "Las estancias son las de la justificación de habitabilidad"
      : "Las estancias se deducen de los dormitorios, baños y aseos de la vivienda (criterio, a falta de las de habitabilidad)",
    "; se añaden el vestíbulo, con un punto de luz y una toma, y el pulsador del timbre en el acceso",
    I.recarga ? ", y el garaje o la plaza con su toma de recarga" : "",
    ". Cada estancia lleva los puntos de utilización mínimos de la tabla 2 de la ITC-BT-25 (ap. 4).",
  ]);
  const equipos: string[] = [];
  if (eq.climatizacion !== "ninguna" && v.grado === "elevada") equipos.push(NOMBRE_CLIMA[eq.climatizacion]);
  if (eq.secadora && v.grado === "elevada") equipos.push("la secadora, en un C10");
  if (eq.automatizacion && v.grado === "elevada") equipos.push("la automatización, en un C11");
  p.push([
    `La vivienda es de electrificación ${NOMBRE_GRADO[v.grado]}: interruptor general automático de `,
    { v: `${v.iga_A} A` },
    `, de corte omnipolar y poder de corte de ${n(R.igaPoderCorte_A, 0)} A como mínimo (ITC-BT-17 ap. 1.3), en el cuadro junto a la entrada, a una altura de 1,40 a 2,00 m (ap. 1.1). `,
    equipos.length > 0 ? `Se ${equipos.length > 1 ? "prevén" : "prevé"} ${lista(equipos)}. ` : "",
    "Los circuitos son los de la tabla 1, con su interruptor automático, la sección mínima de dos conductores y tierra de cobre bajo tubo empotrado y el diámetro de tubo de la tabla; cada circuito lleva su conductor de protección hasta los puntos de utilización (ITC-BT-26 ap. 3.5).",
    I.piden.some((x) => x.includes("(C6)") || x.includes("(C7)") || x.includes("(C12)")) ? " Los puntos que pasan del máximo de un circuito van en circuitos adicionales del mismo tipo (ap. 2.3.2)." : "",
  ]);
  p.push([
    "Diferenciales: ",
    { v: `${I.diferenciales} de ${R.diferencial_mA} mA` },
    `, uno por cada ${R.circuitosPorDiferencial} circuitos como mínimo y de intensidad asignada igual o mayor que la del IGA (ITC-BT-25 ap. 2.1 y 2.3)`,
    I.recarga ? `, y uno exclusivo de ${R.diferencial_mA} mA, clase A, para el C13 (ITC-BT-25 ap. 2.3.2; ITC-BT-52 ap. 6.1).` : ".",
  ]);
  p.push([
    `La sección de cada circuito cumple también la caída de tensión del ${n(R.caidaInterior * 100)} % (ITC-BT-19 ap. 2.2.2; ITC-BT-25 ap. 3), que se calcula con la intensidad del interruptor del circuito hasta el punto más alejado: Lmáx = e·U·γ·S / (2·IA), con U = ${R.tension_V} V y γ = ${FORMULAS_ANEXO2.datos.gammaCu70} m/(Ω·mm²), la del cobre a 70 °C (Guía, Anexo 2). `,
    "Un circuito más largo que su Lmáx pide más sección. Esa caída se puede compensar con la de la derivación individual (ITC-BT-19 ap. 2.2.2).",
  ]);
  return {
    titulo: j.unifamiliar ? "Instalación interior de la vivienda" : `Instalación interior · vivienda tipo ${v.nombre}`,
    parrafos: p,
    tablas: [tablaPuntos(v, titulo), tablaCircuitos(I.circuitos, titulo)],
  };
}

// -----------------------------------------------------------------------------
// 3 · Línea general de alimentación y derivaciones individuales
// -----------------------------------------------------------------------------

const MANDA = { minimo: "mínima", intensidad: "Iz", caida: "e" } as const;

function filaLinea(l: LineaRebt): string[] {
  return [
    `${l.que}${l.estimada ? " (1)" : ""}`,
    n(l.p_W / 1000, 2),
    n(l.ib_A),
    n(l.l_m),
    n(l.s_mm2),
    n(l.iz_A),
    f(l.caida_pct, 2),
    n(l.caidaMax_pct),
    MANDA[l.manda],
    String(l.tubo_mm),
    l.proteccion,
  ];
}

function parteLineas(j: JustificacionRebt): ParteAnejo | null {
  const I = j.instalacion;
  const lineas = [...(I.lga ? [I.lga] : []), ...I.derivaciones];
  if (lineas.length === 0 && !I.lgaExistente) return null;
  const p: Trozo[][] = [];
  const intro: Trozo[] = [];
  if (j.unifamiliar) {
    intro.push(
      "La derivación individual va de la caja de protección y medida, en el límite de la parcela, al cuadro de la vivienda: un único usuario sin línea general de alimentación, con una caída de tensión máxima del 1,5 % (ITC-BT-15 ap. 3). ",
    );
  } else {
    if (I.lgaExistente) {
      intro.push(
        "La línea general de alimentación es la existente y no se modifica. Con la obra, su carga pasa a ",
        { v: `${n(I.lgaExistente.despues_W / 1000)} kW (${n(I.lgaExistente.despues_A)} A)` },
        ": hay que comprobar que su sección y el fusible de la caja general de protección la admiten. ",
      );
    } else {
      intro.push(
        "La línea general de alimentación va de la caja general de protección a la centralización de contadores, que se supone única (contadores totalmente centralizados): caída de tensión máxima del 0,5 % (ITC-BT-14 ap. 3), sección mínima de 10 mm² de cobre, en cables unipolares de 0,6/1 kV (ITC-BT-14). Se calcula con la intensidad de la previsión, y su sección deja sitio a un fusible gG entre esa intensidad y 0,906·Iz (Ib ≤ In ≤ Iz e I2 ≤ 1,45·Iz, con I2 = 1,6·In; Guía BT-22). ",
      );
    }
    intro.push(
      `Cada derivación individual va de la centralización al cuadro de su usuario: caída de tensión máxima del 1 % (ITC-BT-15 ap. 3), 6 mm² como mínimo${I.viviendas.length > 0 ? ", con su capacidad, en las viviendas, como mínimo la del interruptor general (ITC-BT-25 ap. 1). La de cada vivienda tipo se calcula hasta su planta más alejada de la centralización" : ""}. `,
    );
  }
  intro.push(
    "La sección es la mayor de la mínima reglamentaria, la que da la intensidad admisible (Iz, la menor de la tabla 1 de la ITC-BT-19 y de la tabla A de su Guía, método B: tubo empotrado o canaladura de obra, a 40 °C) y la de la caída de tensión (e = 2·P·L / (γ·S·U²) en monofásica y P·L / (γ·S·U²) en trifásica, sin reactancia; Guía, Anexo 2). La columna «Manda» dice cuál de las tres decide.",
  );
  p.push(intro);
  const cables = [...new Set(lineas.map((l) => l.cable))];
  p.push([
    `Conductores de cobre ${lista(cables)}, no propagadores del incendio y con emisión de humos y opacidad reducida (γ = ${FORMULAS_ANEXO2.datos.gammaCu70} m/(Ω·mm²) con aislamiento de 70 °C y ${FORMULAS_ANEXO2.datos.gammaCu90} con el de 90 °C); neutro de la misma sección que las fases y conductor de protección por la tabla 2 de la ITC-BT-18. `,
    j.unifamiliar
      ? "La derivación lleva el hilo de mando de 1,5 mm², rojo, salvo con contador con telegestión (ITC-BT-15; ITC-BT-16)."
      : "Cada derivación lleva el hilo de mando de 1,5 mm², rojo, salvo que los contadores tengan telegestión (ITC-BT-15; ITC-BT-16). Tubos con sitio para ampliar la sección un 100 %, de 32 mm de diámetro como mínimo, y uno de reserva por cada diez derivaciones (ITC-BT-15).",
  ]);
  if (lineas.length === 0) return { titulo: "Línea general de alimentación y derivaciones individuales", parrafos: p };
  const estimadas = lineas.some((l) => l.estimada);
  const tabla: TablaMemoria = {
    rotulo: j.unifamiliar ? "Derivación individual" : "Línea general de alimentación y derivaciones individuales",
    cabecera: ["Línea", "P (kW)", "Ib (A)", "L (m)", "S (mm²)", "Iz (A)", "e (%)", "e máx. (%)", "Manda", "Ø tubo (mm)", "Protección"],
    columnas: ["texto", "dato", "dato", "dato", "dato", "dato", "dato", "dato", "texto", "dato", "texto"],
    filas: lineas.map(filaLinea),
    ancha: true,
    notas: estimadas
      ? [
          j.unifamiliar
            ? "Longitud estimada (criterio): confírmala con los planos."
            : "Longitud estimada (criterio): 10 m de línea general; en cada derivación, 3 m en la centralización, la subida por las alturas de planta y 10 m en planta. Confírmalas con los planos.",
        ]
      : [],
  };
  const notaVivienda = lineas.find((l) => l.clase === "di" && l.proteccion.startsWith("IGA"));
  if (notaVivienda) {
    p.push([
      j.unifamiliar
        ? "P es la capacidad del IGA de la vivienda (U·IA, cos φ 1, Guía Anexo 2). La caída que no agota la derivación puede compensar la de la instalación interior (ITC-BT-19 ap. 2.2.2)."
        : "En las derivaciones de vivienda, P es la capacidad del IGA (U·IA, cos φ 1, Guía Anexo 2), no la potencia prevista con simultaneidad. La caída que no agota la derivación puede compensar la de la instalación interior (ITC-BT-19 ap. 2.2.2).",
    ]);
  }
  return { titulo: j.unifamiliar ? "Derivación individual" : "Línea general de alimentación y derivaciones individuales", parrafos: p, tablas: [tabla] };
}

// -----------------------------------------------------------------------------
// 4 · Centralización de contadores y caja general de protección
// -----------------------------------------------------------------------------

function parteContadores(j: JustificacionRebt): ParteAnejo | null {
  const c = detalle(j, "contadores");
  if (!c) return null;
  const I = j.instalacion;
  const p: Trozo[] = [];
  if (j.unifamiliar) {
    p.push(
      "Un único usuario: caja de protección y medida (CPM), del tipo de las especificaciones de la empresa distribuidora, en lugar de libre y permanente acceso (ITC-BT-13 ap. 2; ITC-BT-16 ap. 2.1). Sus fusibles los fija la distribuidora.",
    );
    return { titulo: "Caja de protección y medida", parrafos: [p] };
  }
  if (j.existente) {
    p.push(`Los contadores de la obra se añaden a la centralización existente: ${j.existente.contadoresNuevos} más. La caja general de protección es la existente.`);
    return { titulo: "Contadores", parrafos: [p] };
  }
  p.push(
    `La centralización tiene ${c.n} contadores (${lista(c.desglose.map(textoDesglose))}), ${textoUbicacion(c)} (ITC-BT-16 ap. 2). `,
  );
  if (I.igm_A !== null) p.push("Con más de dos usuarios, lleva un interruptor general de maniobra de ", { v: `${I.igm_A} A` }, " (ITC-BT-16 ap. 3). ");
  p.push("Cada derivación lleva en su origen sus fusibles de seguridad, precintados por la distribuidora (ITC-BT-16). ");
  if (I.lga) {
    p.push(
      "La caja general de protección es del tipo de las especificaciones de la distribuidora, con fusibles en todas las fases (ITC-BT-13 ap. 1.2): de clase gG y calibre entre ",
      { v: `${Math.ceil(I.lga.ib_A)} y ${I.lga.in_A} A` },
      ` para proteger la línea general de ${n(I.lga.s_mm2)} mm². El calibre lo fija la distribuidora.`,
    );
  }
  return { titulo: "Centralización de contadores y caja general de protección", parrafos: [p] };
}

// -----------------------------------------------------------------------------
// 5 · Puesta a tierra
// -----------------------------------------------------------------------------

function parteTierra(j: JustificacionRebt): ParteAnejo {
  const t = j.instalacion.tierra;
  const T = TIERRA_REBT.datos;
  const G = TIERRA_GUIA_BT26.datos;
  if (t.existente) {
    return {
      titulo: "Puesta a tierra",
      parrafos: [
        [
          "La instalación de la obra se conecta a la puesta a tierra existente del edificio, por la línea principal de tierra y sus derivaciones, que acompañan a la derivación individual. Se comprueba la resistencia de la toma de tierra existente al dar de alta la instalación (ITC-BT-18).",
        ],
      ],
    };
  }
  const origen = { proyecto: "la del proyecto", sua8: "el perímetro de la planta que se da en SUA 8", estimado: "el perímetro de una planta cuadrada con la superficie de la cubierta (criterio)" }[t.origenAnillo];
  const p: Trozo[][] = [
    [
      `Toma de tierra en anillo cerrado de cobre desnudo de ${G.anillo_mm2} mm² (el mínimo del reglamento es ${T.anilloMin_mm2} mm², ITC-BT-18 tabla 1; ${G.anillo_mm2} mm² es lo que recomienda la Guía BT-26), en el fondo de las zanjas de cimentación y antes de hormigonar, por todo el perímetro del edificio y a ${n(G.profundidad_m)} m de profundidad (${n(T.profundidadMin_m, 2)} m como mínimo, ITC-BT-18 ap. 3.1), unido a las armaduras principales de la cimentación, al menos una por zapata (ITC-BT-26 ap. 3.1). `,
      t.picas > 0 ? `Se le conectan ${t.picas} picas de ${n(G.pica_m)} m, separadas al menos el doble de su longitud.` : "",
    ],
    [
      `Longitud del anillo: ${origen}. Resistividad del terreno: `,
      t.terrenoSupuesto
        ? `${n(t.resistividad_ohm_m, 0)} Ω·m, la peor de la tabla 4 de la ITC-BT-18 (supuesta, a falta del estudio geotécnico o la medida). `
        : `${n(t.resistividad_ohm_m, 0)} Ω·m${t.terreno ? ` (${t.terreno}, ITC-BT-18 tabla 4)` : ""}. `,
      `La resistencia del conductor enterrado es R = 2·ρ/L y la de cada pica, R = ρ/L (ITC-BT-18 tabla 5); con picas, en paralelo con el anillo, como si no se influyeran, que es optimista: se comprueba con la medida al dar de alta la instalación.`,
    ],
    [
      `Con un diferencial de ${n(t.ia_A * 1000, 0)} mA${j.unifamiliar ? "" : " (el de mayor sensibilidad asignada que se supone en los servicios generales, criterio)"}, la tensión de contacto no pasa de ${T.contacto_V} V si R·Ia ≤ ${T.contacto_V} V (ITC-BT-18 ap. 9; ITC-BT-24 ap. 4.1.2): R ≤ `,
      { v: `${n(t.rMaxReglamento_ohm)} Ω` },
      `. La Guía BT-26 orienta a menos de ${t.rGuia_ohm} Ω en un edificio ${t.pararrayos ? "con" : "sin"} pararrayos${t.terrenoSupuesto ? ": con el terreno supuesto no se dimensiona para ello" : ""}.`,
    ],
    j.unifamiliar
      ? [
          "El conductor de tierra une la toma de tierra con el borne principal de tierra, junto al cuadro de la vivienda, con un dispositivo desmontable para medir la resistencia; de él salen los conductores de protección de los circuitos (ITC-BT-18). Se conectan a la toma de tierra las instalaciones de agua, de calefacción, de gas y las antenas (ITC-BT-26 ap. 3.2).",
        ]
      : [
          `Línea principal de tierra de cobre, de la sección del conductor de protección de la línea general y ${T.lineaPrincipalMin_mm2} mm² como mínimo, con sus derivaciones por las canalizaciones de las derivaciones individuales (ITC-BT-26 ap. 3). Puntos de puesta a tierra en la centralización de contadores, en la base de la estructura de los ascensores y en la caja general de protección (ap. 3.3). Se conectan a la toma de tierra las instalaciones de agua, de calefacción, de gas y las antenas (ap. 3.2).`,
        ],
  ];
  const tabla: TablaMemoria = {
    rotulo: "Puesta a tierra",
    cabecera: ["Concepto", "Valor"],
    columnas: ["texto", "dato"],
    filas: [
      ["Longitud del anillo (m)", n(t.anillo_m)],
      ["Resistividad del terreno (Ω·m)", `${n(t.resistividad_ohm_m, 0)}${t.terrenoSupuesto ? " (supuesta)" : ""}`],
      ["Resistencia del anillo (Ω)", n(t.rAnillo_ohm)],
      ["Picas de 2 m", String(t.picas)],
      ["Resistencia de la toma de tierra (Ω)", n(t.r_ohm)],
      [`Máxima con ${n(t.ia_A * 1000, 0)} mA y ${T.contacto_V} V (Ω)`, n(t.rMaxReglamento_ohm)],
      [`Orientativa de la Guía BT-26 (Ω)`, String(t.rGuia_ohm)],
    ],
  };
  return { titulo: "Puesta a tierra", parrafos: p, tablas: [tabla] };
}

function fuente(): string {
  return [
    "REBT (RD 842/2002), consolidado 03-09-2025",
    "ITC-BT-13, 14, 15, 16, 17, 18, 19, 24, 25, 26 y 52",
    "Guías técnicas BT-15, 19, 22, 26 y Anexo 2",
    "datos de El edificio",
    `motor ${ENGINE_VERSION}`,
  ].join(" · ");
}

export function anejoRebt(j: JustificacionRebt): AnejoDoc {
  const I = j.instalacion;
  const partes: ParteAnejo[] = [];
  const prev = partePrevision(j);
  if (prev) partes.push(prev);
  for (const v of I.viviendas) partes.push(parteInterior(j, v));
  if (I.viviendas.length === 0 && !j.unifamiliar) {
    partes.push({
      titulo: "Instalación interior",
      parrafos: [["La instalación interior de los locales y las oficinas se justifica en el proyecto o la memoria técnica de diseño de cada uno (ITC-BT-04): aquí, su derivación individual."]],
    });
  }
  const lineas = parteLineas(j);
  if (lineas) partes.push(lineas);
  const cont = parteContadores(j);
  if (cont) partes.push(cont);
  partes.push(parteTierra(j));
  return { abreviaturas: ABREVIATURAS, partes, fuente: fuente() };
}
