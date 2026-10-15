// =============================================================================
// El anejo de instalaciones del edificio (feature-33, fase 6 de PLAN-MEMORIA).
// PURO.
//
// El 5.3 de las memorias del estudio: el cálculo extenso de fontanería,
// saneamiento y electricidad que la memoria resume. No calcula nada: cada
// módulo da su `anejo()` con el mismo resultado que su memoria, y aquí se le
// pone número, título y numeración de tablas. Lo que no aplica, no cumple o
// aún no se desarrolla sale en una línea, como en la memoria.
//
// `bloquesAnejoInstalaciones` lo pasa a los mismos bloques que la memoria: el
// Word y el PDF se pintan con `memoriaDocx` y `renderMemoriaPdf`.
// =============================================================================

import type { AnejoDoc } from "../cte/presentacion";
import { piezasMemoria, textoParrafo, textoTabla } from "../cte/memoria";
import type { Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, type EvaluacionJustificacion } from "./evaluar";
import { fuenteCorta, numeroFijo, type BloqueMemoria } from "./memoria";
import { INSTALACIONES_ANEJO, numeroTabla, type InstalacionAnejo } from "./remision";

export { INSTALACIONES_ANEJO, numeroTabla, type InstalacionAnejo };

export const TITULO_ANEJO_INSTALACIONES = "Instalaciones del edificio";
/** El número del anejo en las memorias del estudio (5. Anejos · 5.3). Fijo, como los capítulos 3 y 4. */
export const NUMERO_ANEJO_INSTALACIONES = "5.3";

interface ApartadoAnejoBase extends InstalacionAnejo {
  codigo: string;
  /** «5.3.1. Fontanería (DB-HS 4)». */
  encabezado: string;
  /** Dónde se justifica en la memoria: «3.4.4». */
  enMemoria: string;
}

export type ApartadoAnejo =
  | (ApartadoAnejoBase & { tipo: "calculado"; doc: AnejoDoc; porRevisar: number })
  | (ApartadoAnejoBase & { tipo: "no_cumple"; motivos: string[] })
  | (ApartadoAnejoBase & { tipo: "no_aplica"; parrafo: string; cita?: string })
  /** Aplica, pero el anejo aún no lo desarrolla (o el módulo no tiene con qué calcular). */
  | (ApartadoAnejoBase & { tipo: "pendiente"; motivo: string });

export interface AnejoInstalaciones {
  /** «5.3. Instalaciones del edificio». */
  titulo: string;
  proyecto: string;
  apartados: ApartadoAnejo[];
}

/** «el cálculo extenso de la fontanería». */
const DE_LA: Record<string, string> = { hs4: "de la fontanería", hs5: "del saneamiento", rebt: "de la instalación eléctrica" };

function apartadoDe(ins: InstalacionAnejo, ev: EvaluacionJustificacion | undefined): ApartadoAnejo {
  const base: ApartadoAnejoBase = {
    ...ins,
    codigo: ev?.entrada.codigo ?? ins.key.toUpperCase(),
    encabezado: `${ins.numero}. ${ins.titulo} (${ins.norma})`,
    enMemoria: numeroFijo(ins.key),
  };
  const queFalta = `el cálculo extenso ${DE_LA[ins.key] ?? ""} aún no se desarrolla en este anejo.`;
  if (!ev) return { ...base, tipo: "pendiente", motivo: `Pendiente: ${queFalta}` };
  switch (ev.estado) {
    case "cumple":
    case "revisar": {
      const doc = ev.calculado?.anejo?.();
      return doc ? { ...base, tipo: "calculado", doc, porRevisar: ev.avisos.length } : { ...base, tipo: "pendiente", motivo: `Pendiente: ${queFalta}` };
    }
    case "no_cumple":
    case "error":
      return { ...base, tipo: "no_cumple", motivos: ev.incumplimientos.map((i) => i.titulo) };
    case "no_aplica":
      return {
        ...base,
        tipo: "no_aplica",
        parrafo: ev.nota ?? `${ev.entrada.codigo} ${ev.entrada.label}: no es de aplicación.`,
        ...(ev.cita !== undefined ? { cita: ev.cita } : {}),
      };
    case "sin_datos":
      return { ...base, tipo: "pendiente", motivo: `Pendiente: ${ev.entrada.codigo} aún no tiene datos de El edificio con que calcular.` };
    default:
      return { ...base, tipo: "pendiente", motivo: `Pendiente: ${queFalta}` };
  }
}

/**
 * El anejo del expediente, instalación a instalación, con la numeración del
 * documento. `evs`, si ya se ha evaluado el expediente.
 */
export function anejoInstalaciones(p: Proyecto, evs: readonly EvaluacionJustificacion[] = evaluarExpediente(p).justificaciones): AnejoInstalaciones {
  return {
    titulo: `${NUMERO_ANEJO_INSTALACIONES}. ${TITULO_ANEJO_INSTALACIONES}`,
    proyecto: p.nombre,
    apartados: INSTALACIONES_ANEJO.map((ins) => apartadoDe(ins, evs.find((ev) => ev.key === ins.key))),
  };
}

/** «fontanería (apartado 3.4.4), saneamiento (3.4.5) y electricidad (4.1)». */
function remisionMemoria(a: AnejoInstalaciones): string {
  const items = a.apartados.map((x, i) => `${x.titulo.toLowerCase()} (${i === 0 ? "apartado " : ""}${x.enMemoria})`);
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items.at(-1)}` : (items[0] ?? "");
}

/** Lo que una instalación pone en el documento, sin su título. */
function bloquesApartado(a: ApartadoAnejo): BloqueMemoria[] {
  switch (a.tipo) {
    case "calculado": {
      const b: BloqueMemoria[] = [];
      const abr = a.doc.abreviaturas ?? [];
      if (abr.length > 0) b.push({ tipo: "parrafo", texto: `Abreviaturas de las tablas: ${abr.map(([k, v]) => `${k}, ${v}`).join("; ")}.` });
      let n = 0;
      for (const parte of a.doc.partes) {
        b.push({ tipo: "titulo", nivel: 3, texto: parte.titulo });
        for (const x of piezasMemoria(parte)) {
          if (x.tipo === "parrafo") {
            b.push({ tipo: "parrafo", texto: textoParrafo(x.p) });
            continue;
          }
          const t = x.t;
          const num = numeroTabla(a.numero, n++);
          b.push({
            tipo: "tabla",
            rotulo: t.rotulo ? `${num}. ${t.rotulo}` : num,
            cabecera: t.cabecera,
            filas: t.filas,
            ...(t.columnas ? { columnas: t.columnas } : {}),
            ...(t.notas && t.notas.length > 0 ? { notas: t.notas } : {}),
            ...(t.ancha ? { ancha: true } : {}),
          });
        }
      }
      if (a.doc.fuente) b.push({ tipo: "nota", texto: fuenteCorta(a.doc.fuente) });
      return b;
    }
    case "no_cumple":
      return [
        { tipo: "pendiente", texto: `Pendiente: ${a.codigo} aún no cumple; su cálculo entra en el anejo cuando se resuelva.` },
        ...a.motivos.map((m): BloqueMemoria => ({ tipo: "parrafo", texto: `– ${m}` })),
      ];
    case "no_aplica":
      return [{ tipo: "parrafo", texto: a.parrafo }, ...(a.cita ? [{ tipo: "nota" as const, texto: a.cita }] : [])];
    case "pendiente":
      return [{ tipo: "pendiente", texto: a.motivo }];
  }
}

/**
 * El anejo como bloques: el anejo (H1), cada instalación (H2) y sus partes
 * (H3, sin número: las tablas llevan el suyo, «Tabla 5.3.1-1», que es el que
 * cita la memoria).
 */
export function bloquesAnejoInstalaciones(a: AnejoInstalaciones): BloqueMemoria[] {
  const b: BloqueMemoria[] = [{ tipo: "titulo", nivel: 1, texto: a.titulo }];
  b.push({
    tipo: "parrafo",
    texto: `Este anejo desarrolla el cálculo de las instalaciones del edificio que se justifican en la memoria: ${remisionMemoria(a)}.`,
  });
  for (const ap of a.apartados) {
    b.push({ tipo: "titulo", nivel: 2, texto: ap.encabezado });
    b.push(...bloquesApartado(ap));
  }
  return b;
}

/** El anejo entero en texto plano (para la foto del expediente). */
export function textoPlanoAnejoInstalaciones(a: AnejoInstalaciones): string {
  return bloquesAnejoInstalaciones(a)
    .map((bl) => (bl.tipo === "tabla" ? textoTabla(bl) : bl.texto))
    .join("\n\n");
}
