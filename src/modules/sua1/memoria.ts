// =============================================================================
// DB-SUA, SUA 1 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Frases de
// research/verificacion-sua1.md, bloque A7. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
//
// Las tablas «Norma | Proyecto» (feature-31): resbaladicidad, discontinuidades,
// barreras por planta, cada escalera, rampas y limpieza, cada una tras su
// párrafo. El texto se queda con el criterio, el porqué y la condición; las
// cifras que comparan van a la tabla.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { NO_SE_EXIGE, tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleEscalera, DetalleSua1, FalloEscalera, JustificacionSua1 } from "./justificacion";
import { SUA1_BARRERAS, SUA1_CLASE_EXIGIBLE, SUA1_DISCONTINUIDADES, SUA1_ESCALERA_GENERAL, SUA1_LIMPIEZA, SUA1_RAMPAS } from "./tablas";
import { cm, escaleras, m, pct, rangoCm } from "./textos";

const G = SUA1_ESCALERA_GENERAL.datos;
const B = SUA1_BARRERAS.datos;
const RA = SUA1_RAMPAS.datos;
const D = SUA1_DISCONTINUIDADES.datos;
const CL = SUA1_CLASE_EXIGIBLE.datos;
const L = SUA1_LIMPIEZA.datos;

function detalles<C extends DetalleSua1["clase"]>(j: JustificacionSua1, clase: C): Extract<DetalleSua1, { clase: C }>[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === clase ? [e.detalle as Extract<DetalleSua1, { clase: C }>] : []));
}

/** Los elementos de una clase con su veredicto: la columna «Cumple» de la tabla. */
function conVeredicto<C extends DetalleSua1["clase"]>(j: JustificacionSua1, clase: C): { d: Extract<DetalleSua1, { clase: C }>; ok: boolean }[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === clase ? [{ d: e.detalle as Extract<DetalleSua1, { clase: C }>, ok: e.veredicto !== "fail" }] : []));
}

/** «entre 13 y 18,5 cm». */
function entre(a: number, b: number, unidad: string): string {
  return `entre ${String(a).replace(".", ",")} y ${String(b).replace(".", ",")} ${unidad}`;
}

function parrafoUsos(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = ["Se justifica la exigencia básica SUA 1 mediante la aplicación de la Sección SUA 1 del DB-SUA (texto consolidado de 14-06-2022). "];
  if (c.unifamiliar) {
    p.push("El edificio es una vivienda unifamiliar, de uso Residencial Vivienda: todas sus zonas, incluido el garaje, son interior de la vivienda, de ", { v: "uso restringido" }, " y uso privado (Anejo A).");
  } else if (c.residencial && j.existente) {
    // Lo intervenido en un edificio existente (feature-30).
    p.push(
      "El edificio es de uso Residencial Vivienda. En lo intervenido, el interior de la vivienda es de ",
      { v: "uso restringido" },
      j.existente.zonasComunes ? " y las zonas comunes que se reforman, de " : "",
      ...(j.existente.zonasComunes ? [{ v: "uso general" }] : []),
      "; en Residencial Vivienda todas las zonas son de uso privado (Anejo A).",
    );
  } else if (c.residencial) {
    p.push(
      "El edificio es de uso Residencial Vivienda: el interior de las viviendas es de ",
      { v: "uso restringido" },
      " y las zonas comunes (portal, escalera, rellanos y garaje), de ",
      { v: "uso general" },
      "; en Residencial Vivienda todas las zonas son de uso privado (Anejo A).",
    );
    if (c.oficinas) p.push(" Las oficinas son de uso Administrativo y uso general.");
  } else {
    p.push(
      "El edificio es de uso Administrativo, de ",
      { v: "uso general" },
      c.oficinas && j.decisiones.usoPublico === "si" ? ", con zonas de uso público (atención al público y salas de visitas)" : ", sin zonas de uso público",
      "; el garaje es un aparcamiento privado (Anejo A).",
    );
  }
  return p;
}

function parrafoResbaladicidad(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = [];
  if (c.residencial) {
    p.push(`El uso Residencial Vivienda no figura entre los del apartado 1 de SUA 1: no se exige clase de resbaladicidad a sus suelos${j.existente ? "" : ", ni al aparcamiento"} (SUA 1-1 pto 1).`);
  }
  if (c.oficinas) {
    if (p.length > 0) p.push(" ");
    // La clase de cada localización va en la tabla (feature-31).
    p.push(
      "Los suelos de las oficinas (uso Administrativo) tienen, como mínimo, la clase de resbaladicidad que la tabla 1.2 de SUA 1-1 exige según su localización y pendiente, con Rd determinado por el ensayo del péndulo de la norma UNE 41901:2017 EX (tabla 1.1). Se excluyen las zonas de ocupación nula.",
    );
  }
  if (!c.residencial && !c.oficinas) {
    p.push("No hay zonas de los usos del apartado 1 de SUA 1: no se exige clase de resbaladicidad (SUA 1-1 pto 1).");
  }
  return p;
}

/** La clase exigida en cada localización (tabla 1.2); la de proyecto es la que se declara. Solo con oficinas. */
function tablaResbaladicidad(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  if (!j.contexto.oficinas) return undefined;
  const u = `${CL.umbralPendiente_pct} %`;
  const fila = (zona: string, clase: number): FilaNorma => [zona, `clase ≥ ${clase}`, `clase ${clase}`, true];
  return tablaNorma(
    [
      fila(`Interior seco, pendiente < ${u}`, CL.interiorSeco.menor6),
      fila(`Interior seco, pendiente ≥ ${u} y escaleras`, CL.interiorSeco.mayor6oEscalera),
      fila(`Interior húmedo (entrada, aseos), pendiente < ${u}`, CL.interiorHumedo.menor6),
      fila(`Interior húmedo, pendiente ≥ ${u} y escaleras`, CL.interiorHumedo.mayor6oEscalera),
      fila("Exterior", CL.exterior),
    ],
    { rotulo: "Resbaladicidad de los suelos", parametro: "Localización", tras },
  );
}

/** El pavimento de uso general: ¿se justifican las discontinuidades? */
function conDiscontinuidades(j: JustificacionSua1): boolean {
  const c = j.contexto;
  if (c.unifamiliar) return false;
  return !(j.existente && !j.existente.zonasComunes && c.residencial);
}

function parrafoDiscontinuidades(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  if (c.unifamiliar) {
    return ["Al ser toda la vivienda de uso restringido, no le son de aplicación las condiciones de las discontinuidades del pavimento (SUA 1-2 pto 1)."];
  }
  if (!conDiscontinuidades(j)) {
    return ["El interior de la vivienda es de uso restringido: no le son de aplicación las condiciones de las discontinuidades del pavimento (SUA 1-2 pto 1)."];
  }
  const zonas = j.existente
    ? "En las zonas comunes que se reforman"
    : c.residencial
      ? (c.oficinas ? "En las zonas comunes, el garaje y las oficinas" : "En las zonas comunes y el garaje")
      : "En las oficinas, el vestíbulo y el garaje";
  const esc = c.residencial
    ? "Solo hay escalones aislados o dos consecutivos en el interior de las viviendas, en las zonas comunes o en el acceso al edificio, y nunca en el itinerario accesible (SUA 1-2 pto 3)."
    : "No hay escalones aislados ni dos consecutivos en zonas de circulación, salvo en el acceso o la salida del edificio y fuera del itinerario accesible (SUA 1-2 pto 3).";
  // Los límites del resalto, los salientes, los desniveles y las barreras van en la tabla (feature-31).
  return [
    `${zonas} el pavimento cumple las condiciones de juntas, salientes, desniveles y perforaciones de SUA 1-2 pto 1, y las barreras que delimitan zonas de circulación tienen la altura del pto 2. ${c.residencial ? "No es exigible en el interior de las viviendas (uso restringido) ni en zonas exteriores." : "No es exigible en zonas exteriores."} `,
    esc,
  ];
}

/** Las condiciones del pavimento (SUA 1-2): el proyecto declara que las cumple. */
function tablaDiscontinuidades(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  if (!conDiscontinuidades(j)) return undefined;
  const igual = (p: string, n: string): FilaNorma => [p, n, n, true];
  return tablaNorma(
    [
      igual("Resalto de las juntas", `≤ ${D.resaltoJuntaMax_mm} mm`),
      igual("Saliente puntual", `≤ ${D.salientePuntualMax_mm} mm`),
      igual(`Ángulo del saliente de más de ${D.salienteConAngulo_mm} mm`, `≤ ${D.anguloSalienteMax_grados}º`),
      igual(`Pendiente en desniveles de hasta ${D.desnivelConPendiente_cm} cm`, `≤ ${D.pendienteDesnivelMax_pct} %`),
      igual("Huecos y perforaciones (esfera que no pasa)", `Ø ${cm(D.esferaPerforacion_cm)}`),
      igual("Barreras que delimitan zonas de circulación", `≥ ${D.barreraDelimitacionMin_cm} cm`),
    ],
    { rotulo: "Discontinuidades del pavimento", tras },
  );
}

function parrafoBarreras(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const xs = detalles(j, "barreras");
  if (j.existente && xs.length === 0) {
    return ["Lo intervenido no tiene desniveles, huecos ni aberturas con una diferencia de cota mayor que 55 cm, por lo que no requiere barreras de protección (SUA 1-3.1 pto 1)."];
  }
  // La altura exigida y la de proyecto de cada planta van en la tabla (feature-31).
  const p: Trozo[] = [
    "Se disponen barreras de protección en los desniveles, huecos y aberturas con diferencia de cota mayor que 55 cm (SUA 1-3.1 pto 1), con la altura que SUA 1-3.2.1 fija según la diferencia de cota de cada planta, medida desde el suelo o desde la línea de inclinación de la escalera.",
  ];
  if (xs.length === 0) p.push(" El edificio no tiene plantas con el suelo a más de 55 cm sobre la rasante.");
  p.push(" Las barreras resisten la fuerza horizontal del DB SE-AE, apartado 3.2.1 (SUA 1-3.2.2).");
  if (c.residencial) {
    p.push(
      ` Al ser un edificio de uso Residencial Vivienda, las barreras, incluidas las de escaleras y rampas, no tienen puntos de apoyo entre 30 y 50 cm sobre el suelo o la línea de inclinación ni salientes horizontales de más de 15 cm de fondo entre 50 y 80 cm, y sus aberturas no dejan pasar una esfera de ${cm(B.esferaVivienda_cm, 0)}; el límite inferior de la barandilla de la escalera está a ≤ 5 cm de la línea de inclinación (SUA 1-3.2.3). No hay zonas de uso público: no es de aplicación la señalización de desniveles (SUA 1-3.1 pto 2) ni hay barreras delante de asientos fijos (SUA 1-3.2.4).`,
    );
  } else if (j.decisiones.usoPublico === "si") {
    p.push(
      ` En las zonas de uso público las barreras no tienen aberturas por las que pase una esfera de ${cm(B.esferaOtrosUsosPublico_cm, 0)} (SUA 1-3.2.3) y los desniveles de hasta 55 cm se señalizan con diferenciación visual y táctil a partir de 25 cm del borde (SUA 1-3.1 pto 2).`,
    );
  }
  if (c.cubierta !== "plana_transitable" && !j.existente?.cubiertaSinTocar) {
    p.push(
      " La cubierta no es transitable: solo es accesible para mantenimiento, queda fuera del ámbito del DB-SUA (Introducción II) y se dota de los medios de seguridad para su conservación conforme al RD 1627/1997 y al RD 486/1997.",
    );
  }
  return p;
}

/** Barreras por planta: la altura exigida por la cota y la de proyecto (decisión del módulo). */
function tablaBarreras(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  const filas: FilaNorma[] = conVeredicto(j, "barreras").map(({ d, ok }) => {
    const cota = d.cotaMin_m === d.cotaMax_m ? `a ${m(d.cotaMax_m)}` : `de ${m(d.cotaMin_m).replace(" m", "")} a ${m(d.cotaMax_m)}`;
    const donde = d.grupo === "cubierta" ? `Cubierta transitable (${cota})` : `${d.plantas} (suelo ${cota})`;
    return [donde, `≥ ${m(d.min_m)}`, m(d.altura_m), ok];
  });
  return tablaNorma(filas, { rotulo: "Barreras de protección", parametro: "Planta", tras });
}

function nombreEscalera(d: DetalleEscalera): string {
  return d.tipo === "interior" ? "Escalera interior de la vivienda" : d.tipo === "comun" ? "Escalera común" : "Escalera del garaje";
}

function parrafoEscalera(d: DetalleEscalera): Trozo[] {
  // Huella, contrahuella, 2C + H, tramo, anchura, pasamanos y barandilla del ojo van en la tabla (feature-31).
  if (d.restringida) {
    return [`La escalera interior de la vivienda (${d.plantas}) es de `, { v: "uso restringido" }, " (SUA 1-4.1) y lleva barandilla en sus lados abiertos (SUA 1-3.2.1)."];
  }
  const nombre = d.tipo === "comun" ? "La escalera común" : "La escalera del garaje";
  const ascensor = d.ascensor?.valor ? "con ascensor como alternativa" : "sin ascensor como alternativa";
  const uso = d.usoPublico ? "de uso general y uso público" : "de uso general y uso privado";
  return [
    `${nombre} (${d.plantas}) es ${uso}, ${ascensor}, de tramos rectos, ${d.tramos} por planta, con la misma contrahuella en toda la planta; ${d.tabica ? "tabicas verticales o inclinadas ≤ 15º y sin bocel" : "sin bocel"} (SUA 1-4.2.1 y 4.2.2). La anchura útil es la de la tabla 4.1 (${d.residencial ? "Residencial Vivienda, incluso escalera de comunicación con aparcamiento" : "casos restantes, escalera que comunica con una zona accesible"}) y la de evacuación de SI 3, medida entre paredes y barreras sin descontar el pasamanos, que vuela ≤ 12 cm; las mesetas tienen la anchura de la escalera, sin barrido de puertas en los cambios de dirección (SUA 1-4.2.2 y 4.2.3). La escalera salva más de 55 cm y dispone de pasamanos separado ≥ 4 cm del paramento (SUA 1-4.2.4); la barandilla del ojo tiene la altura de SUA 1-3.2.1.`,
  ];
}

/**
 * Una escalera: lo exigido por su uso y lo de proyecto (las decisiones del
 * módulo y lo que sale de la altura de las plantas). Lo que el proyecto solo
 * declara (mesetas, pasamanos, barandilla del ojo) lleva el valor que se declara.
 */
function tablaEscalera(d: DetalleEscalera, tras: number): TablaMemoria | undefined {
  const ok = (f: FalloEscalera) => !d.fallos.includes(f);
  const contrahuella = rangoCm(d.cMenor_cm, d.cMayor_cm, 2);
  const rotulo = `${nombreEscalera(d)} (${d.plantas})`;
  if (d.restringida) {
    return tablaNorma(
      [
        ["Anchura", `≥ ${m(d.anchuraMin_m)}`, m(d.anchura_m), ok("anchura")],
        ["Huella", "≥ 22 cm", cm(d.huella_cm), ok("huella")],
        ["Contrahuella", `≤ ${cm(d.cMax_cm, 0)}`, contrahuella, ok("contrahuella")],
        ["Barandilla en los lados abiertos", `≥ ${m(d.barandillaMin_m)}`, `≥ ${m(d.barandillaMin_m)}`, true],
      ],
      { rotulo, tras },
    );
  }
  const filas: FilaNorma[] = [
    ["Huella", `≥ ${cm(G.huellaMin_cm, 0)}`, cm(d.huella_cm), ok("huella")],
    ["Contrahuella", entre(d.cMin_cm ?? G.contrahuellaMin_cm, d.cMax_cm, "cm"), contrahuella, ok("contrahuella")],
    ["2C + H", entre(G.relacionMin_cm, G.relacionMax_cm, "cm"), rangoCm(d.relacionMenor_cm, d.relacionMayor_cm, 1), ok("relacion")],
  ];
  if (d.porPlanta.length > 1) filas.push(["Variación de C entre plantas", `≤ ${cm(G.variacionContrahuellaMax_cm, 0)}`, cm(d.variacion_cm, 2), ok("variacion")]);
  filas.push(["Altura de un tramo", `≤ ${m(d.tramoMax_m ?? 0)}`, m(d.alturaTramoMayor_m), ok("tramo")]);
  if (d.peldanosMinTramo !== null) {
    const menor = Math.min(...d.porPlanta.map((t) => t.peldanosTramoMin));
    filas.push(["Peldaños por tramo", `≥ ${d.peldanosMinTramo}`, String(menor), ok("peldanos")]);
  }
  const pasamanos = d.pasamanos === "ambos" ? `en ambos lados${d.prolongacion ? `, prolongado ${G.pasamanosProlongacion_cm} cm` : ""}` : "al menos en un lado";
  const [h0, h1] = G.pasamanosAltura_cm;
  filas.push(
    ["Anchura útil", `≥ ${m(d.anchuraMin_m)}`, m(d.anchura_m), ok("anchura")],
    ["Longitud de las mesetas", `≥ ${m(G.mesetaLongitudMin_m)}`, `≥ ${m(G.mesetaLongitudMin_m)}`, true],
    ["Pasamanos", pasamanos, pasamanos, true],
    ["Altura del pasamanos", entre(h0, h1, "cm"), entre(h0, h1, "cm"), true],
    [`Barandilla del ojo (${d.ojo === "estrecho" ? "ojo < 40 cm" : `caída de ${m(d.caida_m)}`})`, `≥ ${m(d.barandillaMin_m)}`, `≥ ${m(d.barandillaMin_m)}`, true],
  );
  return tablaNorma(filas, { rotulo, tras });
}

/** Los peldaños de cada planta, de cada escalera (sin comparación: los datos con que sale la contrahuella). */
function tablaPeldanos(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  const xs = escaleras(j);
  if (xs.length === 0) return undefined;
  return {
    rotulo: "Peldaños por planta",
    cabecera: ["Escalera", "Planta", "Altura", "Peldaños", "Contrahuella", "2C + H"],
    filas: xs.flatMap((x) =>
      x.porPlanta.map((t) => [
        x.tipo === "interior" ? "Interior" : x.tipo === "comun" ? "Común" : "Garaje",
        t.etiqueta,
        m(t.h_m),
        String(t.peldanos),
        cm(t.c_cm, 2),
        // En uso restringido no se exige 2C + H (SUA 1-4.1).
        x.restringida ? NO_SE_EXIGE : cm(t.relacion_cm),
      ]),
    ),
    tras,
  };
}

function parrafoRampas(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = [];
  const g = detalles(j, "rampa_garaje")[0];
  if (g) {
    if (g.peatonal) {
      // La pendiente, en la tabla (feature-31).
      p.push("La rampa de vehículos del aparcamiento está prevista también para personas y no pertenece a un itinerario accesible (SUA 1-4.3 pto 1 y 4.3.1 b); cumple SUA 7.");
    } else {
      p.push("La rampa del garaje es solo de vehículos: el acceso peatonal se hace por la escalera, y la rampa no es un itinerario de personas a efectos de SUA 1-4.3; su pendiente se ajusta a las ordenanzas municipales.");
    }
  }
  const a = detalles(j, "rampa_acceso")[0];
  if (a) {
    if (p.length > 0) p.push(" ");
    // Pendiente, tramo, anchura y mesetas, en la tabla; aquí, de qué depende la pendiente y los pasamanos.
    p.push(
      "La rampa de acceso pertenece al itinerario accesible: su pendiente máxima depende de la longitud del tramo (≤ 10 % en menos de 3 m, ≤ 8 % en menos de 6 m, ≤ 6 % en el resto)",
      a.pasamanosAmbos
        ? `, y dispone de pasamanos continuo en ambos lados a 90–110 y 65–75 cm${a.prolongacion ? ", prolongado 30 cm" : ""}, con zócalo de ${cm(RA.zocaloMin_cm, 0)} en los bordes libres`
        : "",
      " (SUA 1-4.3).",
    );
  } else if (c.acceso) {
    if (p.length > 0) p.push(" ");
    p.push("La entrada principal está a la cota de la acera: no hay rampas en el itinerario de acceso.");
  }
  if (p.length > 0) p.push(" ");
  p.push("No existen pasillos escalonados de graderíos (SUA 1-4.4).");
  return p;
}

/** Las rampas de personas: la pendiente (decisión del módulo) y, en la de acceso, el tramo y lo que se declara. */
function tablaRampas(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  const filas: FilaNorma[] = [];
  for (const { d, ok } of conVeredicto(j, "rampa_garaje")) {
    if (d.peatonal) filas.push(["Pendiente de la rampa del garaje", `≤ ${pct(d.max_pct)}`, pct(d.pendiente_pct), ok]);
  }
  for (const { d } of conVeredicto(j, "rampa_acceso")) {
    filas.push(
      [`Pendiente de la rampa de acceso (tramo de ${m(d.longitud_m)})`, `≤ ${pct(d.max_pct)}`, pct(d.pendiente_pct), !d.fallos.includes("pendiente")],
      ["Longitud del tramo", `≤ ${m(d.tramoMax_m)}`, m(d.longitud_m), !d.fallos.includes("longitud")],
      ["Pendiente transversal", `≤ ${pct(RA.pendienteTransversalAccesible_pct)}`, `≤ ${pct(RA.pendienteTransversalAccesible_pct)}`, true],
      ["Anchura del tramo", `≥ ${m(RA.anchuraAccesibleMin_m)}`, `≥ ${m(RA.anchuraAccesibleMin_m)}`, true],
      ["Superficie horizontal en los extremos", `≥ ${m(RA.horizontalExtremosAccesible_m)}`, `≥ ${m(RA.horizontalExtremosAccesible_m)}`, true],
    );
  }
  return tablaNorma(filas, { rotulo: "Rampas", tras });
}

function parrafoLimpieza(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const l = detalles(j, "limpieza")[0];
  if (!c.residencial) return ["El apartado 5 de SUA 1 (limpieza de los acristalamientos exteriores) solo se aplica a edificios de uso Residencial Vivienda."];
  if (!l) return ["No hay acristalamientos de vidrio transparente a más de 6 m sobre la rasante exterior: no es de aplicación SUA 1-5."];
  if (l.carpinteria === "practicable") {
    return [
      `Los acristalamientos de vidrio transparente situados a más de 6 m sobre la rasante exterior (${l.plantas}) son `,
      { v: "practicables o fácilmente desmontables" },
      " y permiten su limpieza desde el interior (SUA 1-5).",
    ];
  }
  // El alcance y la altura del punto del borde, en la tabla (feature-31).
  return [
    `En los acristalamientos de vidrio transparente situados a más de 6 m sobre la rasante exterior (${l.plantas}), toda su superficie exterior queda `,
    { v: "al alcance desde un punto del borde de la zona practicable" },
    ", y los reversibles llevan un dispositivo que los bloquea en posición invertida durante la limpieza (SUA 1-5).",
  ];
}

/** Solo con paños fijos: el alcance desde el borde practicable (figura 5.1). Se declara. */
function tablaLimpieza(j: JustificacionSua1, tras: number): TablaMemoria | undefined {
  const l = detalles(j, "limpieza")[0];
  if (!l || l.carpinteria === "practicable") return undefined;
  return tablaNorma(
    [
      ["Distancia al borde de la zona practicable", `≤ ${m(L.radioAlcance_m)}`, `≤ ${m(L.radioAlcance_m)}`, true],
      ["Altura del punto del borde", `≤ ${m(L.alturaMaxPuntoBorde_m)}`, `≤ ${m(L.alturaMaxPuntoBorde_m)}`, true],
    ],
    { rotulo: "Limpieza de los acristalamientos", tras },
  );
}

export function memoriaSua1(j: JustificacionSua1): MemoriaDoc {
  // Cada tabla, tras el párrafo que la presenta (feature-31).
  const parrafos: Trozo[][] = [];
  const tablas: (TablaMemoria | undefined)[] = [];
  const poner = (p: Trozo[], tabla?: (tras: number) => TablaMemoria | undefined) => {
    if (p.length > 0) parrafos.push(p);
    if (tabla) tablas.push(tabla(parrafos.length));
  };
  poner(parrafoUsos(j));
  poner(parrafoResbaladicidad(j), (n) => tablaResbaladicidad(j, n));
  poner(parrafoDiscontinuidades(j), (n) => tablaDiscontinuidades(j, n));
  poner(parrafoBarreras(j), (n) => tablaBarreras(j, n));
  for (const d of escaleras(j)) poner(parrafoEscalera(d), (n) => tablaEscalera(d, n));
  // Los peldaños de todas las escaleras, tras la última.
  tablas.push(tablaPeldanos(j, parrafos.length));
  poner(parrafoRampas(j), (n) => tablaRampas(j, n));
  poner(parrafoLimpieza(j), (n) => tablaLimpieza(j, n));
  if (j.contexto.locales) poner(["El local sin uso es una obra inacabada; su cumplimiento del DB-SUA se justificará en el proyecto de su actividad."]);
  return {
    titulo: "Seguridad frente al riesgo de caídas",
    norma: "DB-SUA 1",
    parrafos,
    tablas: soloTablas(...tablas),
    fuente: ["DB-SUA · SUA 1 (consolidado 14-jun-2022)", "ap. 1 a 5", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
