// =============================================================================
// HE 2 · RITE — La memoria redactada (feature-36, paso 4). PURA.
//
// La remisión de HE 2 al RITE, el sistema (calefacción, refrigeración y el ACS de
// HE 4) en una tabla, el documento que exige el art. 15 por la potencia y la
// tabla 1.4.1.1; lo demás, una línea con su cita y la remisión al documento RITE.
// Nada de casillas ni de cifras que el RITE no da (temperaturas de ACS,
// rendimientos mínimos).
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import type { InstalacionRite, JustificacionRite } from "./justificacion";
import { CONDICIONES_INTERIORES, HE2 } from "./tablas";
import { kw, NOMBRE_CALEFACCION, NOMBRE_EMISORES, NOMBRE_REFRIGERACION, num, serviciosTexto, textoAcs, textoProduccion } from "./textos";

const CI = CONDICIONES_INTERIORES.datos;

function tablaSistema(j: JustificacionRite, tras: number): TablaMemoria {
  const d = j.decisiones;
  const filas: string[][] = [];
  const p = (v: number | null) => (v === null ? "—" : num(v));
  if (d.calefaccion !== "ninguna") {
    const cal = j.elementos.find((e) => e.detalle.clase === "calefaccion")!.detalle;
    if (cal.clase === "calefaccion") filas.push(["Calefacción", NOMBRE_CALEFACCION[d.calefaccion], NOMBRE_EMISORES[d.emisores], p(cal.potencia_kW), cal.scop === null ? "—" : `SCOP ${num(cal.scop)}`]);
  }
  if (d.refrigeracion !== "ninguna") {
    const ref = j.elementos.find((e) => e.detalle.clase === "refrigeracion")!.detalle;
    if (ref.clase === "refrigeracion") filas.push(["Refrigeración", NOMBRE_REFRIGERACION[d.refrigeracion], d.refrigeracion === "misma" ? NOMBRE_EMISORES[d.emisores] : NOMBRE_EMISORES.splits, p(ref.potencia_kW), ref.seer === null ? "—" : `SEER ${num(ref.seer)}`]);
  }
  const a = j.acs;
  filas.push([
    "Agua caliente sanitaria",
    a.mismaMaquina ? `${textoAcs(a)}, la de la calefacción` : textoAcs(a),
    a.acumulacion_l === null ? "—" : `acumulación de ${num(a.acumulacion_l, 0)} l`,
    a.mismaMaquina ? "—" : p(a.potencia_kW),
    a.scop === null ? "—" : `SCOPdhw ${num(a.scop)}`,
  ]);
  return {
    rotulo: "Instalaciones térmicas",
    cabecera: ["Servicio", "Generador", "Emisión o acumulación", j.unifamiliar ? "Potencia (kW)" : "Potencia (kW) (1)", j.unifamiliar ? "Rendimiento (1)" : "Rendimiento (2)"],
    columnas: ["texto", "texto", "texto", "dato", "dato"],
    filas,
    notas: [
      ...(j.unifamiliar ? [] : ["Por vivienda en la producción individual; la total en la centralizada."]),
      "Del fabricante. El RITE no fija rendimientos mínimos de los generadores: remite a la normativa europea de diseño ecológico (IT 1.2.4.1).",
    ],
    tras,
  };
}

function tablaCondiciones(tras: number): TablaMemoria {
  return {
    rotulo: "Condiciones interiores de diseño (RITE IT 1.1.4.1.2, tabla 1.4.1.1)",
    cabecera: ["Estación", "Temperatura operativa (°C)", "Humedad relativa (%)"],
    columnas: ["texto", "norma", "norma"],
    filas: [
      ["Verano", CI.verano.temperatura_C, CI.verano.humedad_pct],
      ["Invierno", CI.invierno.temperatura_C, CI.invierno.humedad_pct],
    ],
    tras,
  };
}

/** La frase del documento de una instalación. */
function fraseDocumento(i: InstalacionRite, j: JustificacionRite, varias: boolean): string {
  const que = varias ? `La instalación de ${serviciosTexto(i.servicios)}` : "La instalación";
  const pot = `${kw(i.potencia_kW!)}${j.unifamiliar ? "" : i.produccion === "centralizada" ? "" : " por vivienda"}`;
  switch (i.documento) {
    case "proyecto":
      return `${que}, con una potencia térmica nominal de ${pot}, requiere un proyecto (RITE art. 15.1 a), específico o integrado en el proyecto general del edificio (art. 16.2), que la dimensiona y justifica las exigencias de bienestar e higiene, eficiencia energética y seguridad (IT 1.1, IT 1.2 e IT 1.3).`;
    case "memoria":
      return `${que}, con una potencia térmica nominal de ${pot}, se documenta con una memoria técnica (RITE art. 15.1 b), elaborada por instalador habilitado o por técnico titulado competente (art. 17.2), que la dimensiona y justifica las exigencias de bienestar e higiene, eficiencia energética y seguridad (IT 1.1, IT 1.2 e IT 1.3).`;
    default:
      return `${que}, con una potencia térmica nominal de ${pot}, menor de 5 kW, no requiere la presentación de proyecto ni memoria técnica (RITE art. 15.1 c); cumple igualmente las exigencias técnicas del Reglamento.`;
  }
}

export function memoriaRite(j: JustificacionRite): MemoriaDoc {
  const d = j.decisiones;
  const parrafos: Trozo[][] = [];
  parrafos.push([`${HE2.datos.literal.replace("su aplicación quedará definida", "su aplicación queda definida").replace(/\.$/, "")} (DB-HE, HE 2).`]);

  const prod = textoProduccion(d.produccion, j.unifamiliar, j.residencial);
  const clima =
    d.calefaccion === "ninguna" && d.refrigeracion === "ninguna"
      ? "No se proyectan calefacción ni refrigeración."
      : d.calefaccion === "ninguna"
        ? `Se proyecta refrigeración con ${NOMBRE_REFRIGERACION[d.refrigeracion]}, ${prod}; no se proyecta calefacción.`
        : `Se proyecta calefacción con ${NOMBRE_CALEFACCION[d.calefaccion]} y ${NOMBRE_EMISORES[d.emisores]}${d.refrigeracion === "misma" ? ", que también refrigera" : d.refrigeracion === "aire_aire" ? `, y refrigeración con ${NOMBRE_REFRIGERACION.aire_aire}` : ", sin refrigeración"}, ${prod}.`;
  parrafos.push([
    `${clima} El agua caliente sanitaria se produce con ${textoAcs(j.acs)}${j.acs.mismaMaquina ? ", con el mismo generador de la calefacción," : ""}, como se justifica en el apartado de HE 4.`,
  ]);
  const trasSistema = parrafos.length;

  const varias = j.instalaciones.length > 1;
  for (const i of j.instalaciones) if (i.documento !== null) parrafos.push([fraseDocumento(i, j, varias)]);
  const trasCondiciones = parrafos.length;

  const resto: string[] = [];
  resto.push(
    j.residencial
      ? "La calidad del aire interior de las viviendas es la de la Sección HS 3 del CTE (IT 1.1.4.2.1)."
      : "La calidad del aire interior la justifica el documento RITE (IT 1.1.4.2).",
  );
  resto.push("La higiene de la instalación de ACS sigue la normativa de prevención y control de la legionelosis (IT 1.1.4.3).");
  const cont = j.elementos.find((e) => e.detalle.clase === "contabilizacion")?.detalle;
  if (cont && cont.clase === "contabilizacion" && cont.reparto) resto.push("La instalación centralizada da servicio a más de un usuario y dispone de un sistema de reparto de gastos (IT 1.2.4.4).");
  if (j.residencial) resto.push("El caudal de aire expulsado de cada vivienda no supera 0,28 m³/s, por lo que no se exige recuperación de calor (IT 1.2.4.5.2).");
  resto.push("Las redes de tuberías y conductos y su aislamiento (IT 1.2.4.2), el control (IT 1.2.4.3) y la seguridad (IT 1.3) los define el documento de la instalación.");
  parrafos.push([resto.join(" ")]);
  if (j.elementos.some((e) => e.detalle.clase === "cambio_uso")) {
    parrafos.push(["Al cambiar el uso, el documento de la instalación analiza y justifica su explotación energética y la idoneidad de las instalaciones existentes para el nuevo uso (RITE art. 15.6)."]);
  }

  return {
    titulo: "Condiciones de las instalaciones térmicas",
    norma: "DB-HE 2",
    parrafos,
    tablas: soloTablas(tablaSistema(j, trasSistema), tablaCondiciones(trasCondiciones)),
    fuente: [
      "DB-HE · HE 2 (consolidado 14-jun-2022)",
      "RITE (RD 1027/2007, consolidado 02-ago-2022)",
      "art. 15",
      "IT 1.1.4.1.2, tabla 1.4.1.1",
      "datos de El edificio y de HE 4",
    ].join(" · "),
  };
}
