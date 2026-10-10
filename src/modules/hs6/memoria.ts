// =============================================================================
// DB-HS6 — La memoria redactada (feature-15, HS6): el texto que el proyectista
// copia a su memoria justificativa. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { JustificacionHs6 } from "./justificacion";
import { nombresUsos, rangoNiveles } from "./proteccion";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function parrafoZona(j: JustificacionHs6): Trozo[] {
  const pr = j.proteccion;
  const donde = j.municipio ? `en ${j.municipio}` : "en un municipio";
  if (pr.zona === "sin_exigencia") {
    return [
      `El edificio se sitúa ${donde}${j.municipio ? "," : ""} que no figura en el apéndice B de la sección HS 6 del DB-HS: la sección no se aplica.`,
    ];
  }
  return [
    `El edificio se sitúa ${donde}, clasificado en `,
    { v: `zona ${pr.zona}` },
    " en el apéndice B de la sección HS 6 del DB-HS. Se limita la exposición de los locales habitables a un nivel de referencia de ",
    { v: "300 Bq/m³" },
    " de media anual.",
  ];
}

function parrafoBarrera(j: JustificacionHs6): Trozo[] {
  const pr = j.proteccion;
  if (!pr.aplica) return [];
  const b = j.elementos.find((e) => e.id === "barrera");
  const p: Trozo[] = [];
  if (pr.zona === "II") {
    p.push(
      `Conforme al apartado 3, en zona II se dispone una barrera de protección y, además, ${j.elementos.some((e) => e.id === "despresurizacion") && !j.elementos.some((e) => e.id === "contencion-garaje") ? "la despresurización del terreno" : "un espacio de contención ventilado"}.`,
    );
  } else {
    p.push(
      `Conforme al apartado 3, en zona I basta ${pr.decisiones.medidaTerreno === "barrera" ? "una barrera de protección" : "una cámara de aire ventilada"}.`,
    );
  }
  if (b && b.detalle.clase === "barrera") {
    if (b.detalle.existente === "solera") {
      // Edificio existente: la solera sellada hace de barrera (ap. 3.1.1 pto 4; K-INT.3).
      p.push(
        " Al no ser posible disponer sobre lo que apoya en el terreno una barrera con las características del apartado 3.1.1, la propia solera existente funciona como barrera: se sellan cuidadosamente sus grietas y juntas, se sellan los encuentros con los pasos de conducciones y las puertas que la interrumpen son estancas y de cierre automático (ap. 3.1.1 pto 4 y pto 3 b y c).",
      );
    } else if (b.detalle.existente === "lamina" && b.detalle.via !== "calculo") {
      p.push(
        " La barrera es una ",
        { v: `lámina de al menos ${n0(b.detalle.espesorMin_mm)} mm` },
        " con un coeficiente de difusión del radón menor que 10⁻¹¹ m²/s, que se dispone sobre la solera existente, bajo el pavimento nuevo, entre el terreno y los locales habitables; es continua, tiene sellados juntas, encuentros y pasos de conducciones, y las puertas que la interrumpen son estancas y de cierre automático (ap. 3.1.1 ptos 2 y 3).",
      );
    } else if (b.detalle.via === "calculo") {
      p.push(" La barrera se justifica por cálculo (apartado 3.1.2), en documento aparte.");
    } else {
      p.push(
        " La barrera es una ",
        { v: `lámina de al menos ${n0(b.detalle.espesorMin_mm)} mm` },
        " con un coeficiente de difusión del radón menor que 10⁻¹¹ m²/s, que cumple las condiciones de la barrera tipo del apartado 3.1 sin necesidad de cálculo; es continua, tiene sellados juntas, encuentros y penetraciones, y las puertas que la interrumpen son estancas y de cierre automático.",
      );
    }
    if (pr.sobreNoHabitable) {
      p.push(
        pr.decisiones.posicionBarrera === "solera"
          ? ` Bajo el ${pr.sobreNoHabitable.conGaraje ? "garaje" : "sótano"}, la barrera se dispone bajo la solera y en los muros en contacto con el terreno.`
          : ` Sobre el ${pr.sobreNoHabitable.conGaraje ? "garaje" : "sótano"}, la barrera se dispone en el forjado de planta baja, con el paso del núcleo de comunicación sellado.`,
      );
    }
  }
  return p;
}

function parrafoContencion(j: JustificacionHs6): Trozo[] {
  const pr = j.proteccion;
  const p: Trozo[] = [];
  const g = j.elementos.find((e) => e.id === "contencion-garaje");
  if (g && pr.sobreNoHabitable) {
    p.push(
      `Bajo ${listaY(nombresUsos(pr.sobreNoHabitable.usosProtegidos).split(/, | y /).map((u) => `${u.endsWith("s") ? "las" : u === "vivienda" ? "la" : "el"} ${u}`))}, el espacio de contención es el propio ${pr.sobreNoHabitable.conGaraje ? "garaje" : "sótano"}, local no habitable cuya ventilación conforme a HS 3 se considera suficiente (apartado 3.2)`,
      pr.zona === "I" ? ", como protección análoga a la cámara de aire." : ".",
    );
  }
  const c = j.elementos.find((e) => e.id === "camara");
  if (c && c.detalle.clase === "camara" && c.detalle.existente) {
    // Edificio existente sin cámara bajo la solera (ap. 3.2 ptos 6 y 8; K-INT.4).
    const s = c.detalle.partes.reduce((a, t) => a + t.superficie_m2, 0);
    p.push(
      `${p.length > 0 ? " " : ""}Al no existir cámara bajo la solera, se construye por el interior una cámara de aire de `,
      { v: "al menos 5 cm" },
      ` de altura o espesor, continua bajo toda la superficie a proteger (${n0(s)} m²) y comunicada con el exterior (ap. 3.2 pto 6); si la ventilación natural no basta, se disponen extractores mecánicos, con las bocas de expulsión conforme al apartado 3.2.1 del DB HS 3, salvo la disposición en cubierta, que es opcional (ap. 3.2 pto 8).`,
    );
  } else if (c && c.detalle.clase === "camara") {
    const s = c.detalle.partes.reduce((a, t) => a + t.superficie_m2, 0);
    p.push(
      `${p.length > 0 ? " " : ""}${c.detalle.partes.some((t) => t.parcial) ? "Bajo la parte de la planta baja que apoya en el terreno sin sótano" : "Bajo lo que apoya en el terreno"} (${n0(s)} m²) se proyecta un forjado sanitario con cámara de aire ventilada de forma natural, con `,
      { v: `${n0(c.detalle.aberturas_cm2)} cm²` },
      " de aberturas repartidas en las fachadas.",
    );
  }
  const dp = j.elementos.find((e) => e.id === "despresurizacion");
  if (dp && dp.detalle.clase === "despresurizacion" && dp.detalle.existente) {
    p.push(
      `${p.length > 0 ? " " : ""}Bajo lo que apoya en el terreno se dispone la despresurización del terreno, instalada bajo el edificio accediendo desde la solera, con el estudio específico de la cimentación y de la circulación del aire bajo el edificio que pide el ap. 3.3 pto 3.`,
    );
  } else if (dp) {
    p.push(
      `${p.length > 0 ? " " : ""}Bajo lo que apoya en el terreno se dispone la despresurización del terreno: una red de captación en el relleno granular bajo la solera, conectada a un conducto con extracción mecánica (apartado 3.3).`,
    );
  }
  return p;
}

/**
 * El ajuste al edificio existente (ap. 3 pto 3) y la medición posterior (ap. 3.2
 * pto 7 y 3.3 pto 6), cotejados en imagen (DB-HS pp. 139–141; K-INT.2, 4 y 5).
 */
function parrafoExistente(j: JustificacionHs6): Trozo[] {
  if (!j.existente || !j.proteccion.aplica || j.proteccion.sobreTerreno.length === 0) return [];
  const mide = j.elementos.some((e) => (e.detalle.clase === "camara" || e.detalle.clase === "despresurizacion") && e.detalle.existente);
  const p: Trozo[] = [
    "En aplicación del ap. 3 pto 3, la solución se ajusta a las condiciones del edificio existente; los locales habitables disponen de la ventilación interior exigida por la sección HS 3.",
  ];
  if (mide) {
    p.push(
      " La eficacia de la solución se comprobará con mediciones de la concentración de radón posteriores a la intervención según el apéndice C, cuyo resultado se incorporará a la documentación final de la obra.",
    );
  }
  return p;
}

function parrafoNoTocan(j: JustificacionHs6): Trozo[] {
  const e = j.elementos.find((x) => x.detalle.clase === "no_tocan");
  if (!e || e.detalle.clase !== "no_tocan") return [];
  const una = e.detalle.niveles.length === 1;
  return [
    `${una ? "La planta" : "Las plantas"} ${rangoNiveles(e.detalle.niveles)} (${nombresUsos(e.detalle.usos)}) no ${una ? "está" : "están"} en contacto con el terreno y no necesita${una ? "" : "n"} medidas propias.`,
  ];
}

export function memoriaHs6(j: JustificacionHs6): MemoriaDoc {
  const ap = ["2"];
  if (j.proteccion.aplica) ap.push("3.1");
  if (j.elementos.some((e) => e.id === "contencion-garaje" || e.id === "camara")) ap.push("3.2");
  if (j.elementos.some((e) => e.id === "despresurizacion")) ap.push("3.3");
  if (j.existente && j.proteccion.aplica && j.proteccion.sobreTerreno.length > 0) ap.splice(1, 0, "3");
  return {
    titulo: "Protección frente a la exposición al radón",
    norma: "DB-HS 6",
    parrafos: [parrafoZona(j), parrafoBarrera(j), parrafoContencion(j), parrafoExistente(j), parrafoNoTocan(j)].filter((p) => p.length > 0),
    fuente: [
      "DB-HS · HS 6 (RD 732/2019, consolidado 14-06-2022)",
      `ap. ${listaY(ap)}`,
      "apéndice B",
      "datos de El edificio",
      `motor ${ENGINE_VERSION}`,
    ].join(" · "),
  };
}
