// =============================================================================
// La memoria CTE del expediente (feature-16 §E). PURA.
//
// Junta, en el orden del documento (capítulos 3 y 4 de la memoria del estudio,
// feature-29), el texto que redacta cada módulo que aplica (el de su pestaña
// Memoria), los «no aplica» con su párrafo y su cita, y las externas con su
// referencia. Lo que no cumple NO se pega como si estuviera
// bien: en la pantalla se enseña con su aviso y en el Word, el PDF y el texto
// copiado sale como pendiente. Lo que la herramienta aún no redacta se lista
// al final.
//
// `bloquesMemoria` la pasa a una lista de bloques (títulos, párrafos y tablas)
// que comparten el Word y el PDF: el documento se decide una vez.
// =============================================================================

import type { MemoriaDoc, TipoColumna } from "../cte/presentacion";
import { piezasMemoria, textoParrafo, textoTabla } from "../cte/memoria";
import type { Aplicabilidad, JustificacionKey, Proyecto, TipoObraExistente } from "../proyecto/tipos";
import { tiposDeObra } from "../proyecto/alcance";
import { NOMBRE_FASE } from "../estudio/estudio";
import { notaAlcance, type NotaAlcance } from "./alcanceTexto";
import { evaluarExpediente, type EvaluacionJustificacion } from "./evaluar";
import { aplicabilidadEfectiva } from "../proyecto/aplicabilidad";
import { CLAVES_ENERGIA, programaEnergia, referenciaExterna, resultadosDe, type ResultadoVerificacion } from "../energia/verificacion";

export const TITULO_MEMORIA = "Cumplimiento del CTE";

// ── El orden del documento (feature-29) ─────────────────────────────────────

/** Los capítulos de la memoria del estudio que redacta la app. */
export const CAPITULOS = { 3: "Cumplimiento del CTE", 4: "Cumplimiento de otros reglamentos" } as const;
export type Capitulo = keyof typeof CAPITULOS;

/** Un DB (o reglamento) del documento: su número, su título y sus justificaciones, en orden. */
export interface SeccionDocumento {
  capitulo: Capitulo;
  /** «3.2». */
  numero: string;
  /** «Seguridad en caso de incendio DB SI». */
  titulo: string;
  keys: readonly JustificacionKey[];
  /** Un solo apartado que es la sección entera (SE, HR): sin título propio. */
  sinSubapartados?: boolean;
}

/** Numeración fija, la de las memorias del estudio (decisión del 2026-10-10). */
export const SECCIONES: readonly SeccionDocumento[] = [
  { capitulo: 3, numero: "3.1", titulo: "Seguridad estructural DB SE", keys: ["dbse"], sinSubapartados: true },
  { capitulo: 3, numero: "3.2", titulo: "Seguridad en caso de incendio DB SI", keys: ["si1", "si2", "si3", "si4", "si5", "si6"] },
  {
    capitulo: 3,
    numero: "3.3",
    titulo: "Seguridad de utilización y accesibilidad DB SUA",
    keys: ["sua1", "sua2", "sua3", "sua4", "sua5", "sua6", "sua7", "sua8", "sua9"],
  },
  { capitulo: 3, numero: "3.4", titulo: "Salubridad DB HS", keys: ["hs1", "hs2", "hs3", "hs4", "hs5", "hs6"] },
  { capitulo: 3, numero: "3.5", titulo: "Protección frente al ruido DB HR", keys: ["hr"], sinSubapartados: true },
  { capitulo: 3, numero: "3.6", titulo: "Ahorro de energía DB HE", keys: ["he0he1_global", "he1", "he4", "he5", "he6"] },
  { capitulo: 4, numero: "4.1", titulo: "Reglamento electrotécnico para baja tensión (REBT)", keys: ["rebt"] },
  { capitulo: 4, numero: "4.2", titulo: "Habitabilidad", keys: ["hab"], sinSubapartados: true },
];

/**
 * El título de cada sección en el documento, el del CTE, sea cual sea el
 * estado del apartado: el «no aplica» y el redactado se titulan igual.
 */
const TITULOS: Partial<Record<JustificacionKey, string>> = {
  si1: "SI 1 Propagación interior",
  si2: "SI 2 Propagación exterior",
  si3: "SI 3 Evacuación de ocupantes",
  si4: "SI 4 Instalaciones de protección contra incendios",
  si5: "SI 5 Intervención de los bomberos",
  si6: "SI 6 Resistencia al fuego de la estructura",
  sua1: "SUA 1 Seguridad frente al riesgo de caídas",
  sua2: "SUA 2 Seguridad frente al riesgo de impacto o de atrapamiento",
  sua3: "SUA 3 Seguridad frente al riesgo de aprisionamiento en recintos",
  sua4: "SUA 4 Seguridad frente al riesgo causado por iluminación inadecuada",
  sua5: "SUA 5 Seguridad frente al riesgo causado por situaciones de alta ocupación",
  sua6: "SUA 6 Seguridad frente al riesgo de ahogamiento",
  sua7: "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento",
  sua8: "SUA 8 Seguridad frente al riesgo causado por la acción del rayo",
  sua9: "SUA 9 Accesibilidad",
  hs1: "HS 1 Protección frente a la humedad",
  hs2: "HS 2 Recogida y evacuación de residuos",
  hs3: "HS 3 Calidad del aire interior",
  hs4: "HS 4 Suministro de agua",
  hs5: "HS 5 Evacuación de aguas",
  hs6: "HS 6 Protección frente a la exposición al radón",
  he0he1_global: "HE 0 y HE 1 Limitación del consumo energético y verificación global de la demanda",
  he1: "HE 1 Condiciones para el control de la demanda energética",
  he4: "HE 4 Contribución mínima de energía renovable para cubrir la demanda de agua caliente sanitaria",
  he5: "HE 5 Generación mínima de energía eléctrica procedente de fuentes renovables",
  he6: "HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos",
};

/** «DB-SI 1» + «Propagación interior» → «SI 1 Propagación interior»; «DB-HE 0 / DB-HE 1» → «HE 0 y HE 1 …». */
function rotulo(norma: string, titulo: string): string {
  const n = normaLegible(norma).replace(/\bDB-/g, "").replace(" / ", " y ").replace(/^REBT /, "");
  return `${n} ${titulo}`;
}

/**
 * La línea de fuente del documento: el DB, las tablas y los apartados. La
 * versión consolidada va a «Normativa aplicada» del anejo, y «datos de…» y
 * «motor…» son trazabilidad de la ficha, no texto de memoria (feature-29).
 */
export function fuenteCorta(fuente: string): string {
  return fuente
    .split(" · ")
    .filter((t) => !/^(datos de |motor )/.test(t.trim()))
    .map((t) =>
      t
        .replace(/\s*\((?:[^()]*,\s*)?consolidado[^()]*\)/, "")
        .replace(/,\s*consolidado .*$/, "")
        .trim(),
    )
    .filter((t) => t.length > 0)
    .join(" · ");
}

/**
 * Lo supuesto no se imprime en la memoria como si fuera del proyecto
 * (feature-29, paso 7): fuera las marcas «(supuestos)», «(estimación)» y las
 * coletillas «a falta de…». Cada supuesto ya es un aviso en «Antes de
 * entregar», donde el proyectista lo confirma; la ficha y la pantalla del
 * módulo lo siguen diciendo. El Ld por defecto de HR no se toca: es el
 * criterio del propio DB-HR.
 */
export function sinSupuestos(t: string): string {
  return t
    .replace(/ \(supuest[oa]s?\b[^)]*\)/g, "")
    .replace(/ \(estimación\)/g, "")
    .replace(/, a falta de(?:l)? (?:la del emplazamiento|leído para el municipio)/g, "");
}

interface ApartadoBase {
  key: JustificacionKey;
  codigo: string;
  aplicabilidad: Aplicabilidad;
  /** Sin número: «SI 1 Propagación interior»; el de la sección si no tiene título propio. */
  titulo: string;
  /** «3.2.1. SI 1 Propagación interior»; si no tiene título propio, el de su sección. */
  encabezado: string;
  /** Su sección: «3.2. Seguridad en caso de incendio DB SI». */
  grupo: string;
  capitulo: Capitulo;
  /** Va directamente bajo el título de su sección (SE, HR). */
  sinTitulo: boolean;
}

export type ApartadoMemoria =
  | (ApartadoBase & { tipo: "redactado"; doc: MemoriaDoc; porRevisar: number; alcance?: NotaAlcance })
  | (ApartadoBase & { tipo: "no_cumple"; doc: MemoriaDoc; motivos: string[]; alcance?: NotaAlcance })
  | (ApartadoBase & { tipo: "no_aplica"; parrafo: string; cita?: string })
  | (ApartadoBase & {
      tipo: "externo";
      destino: string;
      referencia?: string;
      /** Del informe leído (energía): cuál es y qué comprueba. */
      informe?: { archivo: string; fecha?: string; resultados: ResultadoVerificacion[] };
      /** En un edificio existente, a qué se aplica (feature-28). */
      alcance?: NotaAlcance;
      /** HE 1 que va en el documento de la verificación global (feature-28). */
      conLaGlobal?: boolean;
    });

/** La fila del tipo de obra con que abre el capítulo, como la que abre el SI en las memorias del estudio. */
export interface ObraMemoria {
  tipoProyecto: string;
  tipoObras: string;
  alcance: string;
  cambioUso: string;
}

export interface MemoriaCte {
  titulo: string;
  proyecto: string;
  obra: ObraMemoria;
  apartados: ApartadoMemoria[];
  /** Lo que la herramienta aún no redacta (o no tiene nada que redactar), con el número que le toca. */
  pendientes: { key: JustificacionKey; codigo: string; label: string; numero: string }[];
}

/** «DB-HS2» → «DB-HS 2», «DB-HE0 / DB-HE1» → «DB-HE 0 / DB-HE 1»: como los redactados (feature-28). */
export function normaLegible(db: string): string {
  return db.replace(/\b(DB-[A-Z]+)(\d)/g, "$1 $2");
}

/**
 * La nota de alcance de una externa en un edificio existente, sin la frase
 * «Se justifica con…» del final, que ya dice el apartado (feature-28).
 */
function alcanceExterno(ev: EvaluacionJustificacion, p: Proyecto): NotaAlcance | undefined {
  if (p.datosGenerales.intervencion === "obra_nueva" || !p.datosGenerales.alcance || !ev.nota) return undefined;
  const parrafo = ev.nota.replace(/\s*Se justifica con [^.]*\.$/, "").trim();
  if (!parrafo) return undefined;
  return { parrafo, ...(ev.cita ? { cita: ev.cita } : {}) };
}

/** El apartado sin colocar: `memoriaCte` le pone número, sección y capítulo. */
type ApartadoSinColocar = ApartadoMemoria;

function apartadoDe(ev: EvaluacionJustificacion, p: Proyecto): ApartadoSinColocar | null {
  const e = ev.entrada;
  const base = { key: ev.key, codigo: e.codigo, aplicabilidad: ev.aplicabilidad, titulo: "", grupo: "", capitulo: 3 as Capitulo, sinTitulo: false };
  // En una obra existente, a qué se aplica (feature-27).
  const n = notaAlcance(p, ev.key);
  const alcance = n ? { alcance: n } : {};
  switch (ev.estado) {
    case "cumple":
    case "revisar": {
      const doc = ev.calculado!.memoria();
      return { ...base, ...alcance, encabezado: rotulo(doc.norma, doc.titulo), tipo: "redactado", doc, porRevisar: ev.avisos.length };
    }
    case "no_cumple": {
      const doc = ev.calculado!.memoria();
      return {
        ...base,
        ...alcance,
        encabezado: rotulo(doc.norma, doc.titulo),
        tipo: "no_cumple",
        doc,
        motivos: ev.incumplimientos.map((i) => i.titulo),
      };
    }
    case "error":
      return {
        ...base,
        encabezado: rotulo(e.db, e.label),
        tipo: "no_cumple",
        doc: { titulo: e.label, norma: normaLegible(e.db), parrafos: [], fuente: "" },
        motivos: ev.incumplimientos.map((i) => i.titulo),
      };
    case "no_aplica":
      return {
        ...base,
        encabezado: rotulo(e.db, e.label),
        tipo: "no_aplica",
        parrafo: ev.nota ?? `${e.codigo} ${e.label}: no es de aplicación.`,
        ...(ev.cita !== undefined ? { cita: ev.cita } : {}),
      };
    case "externo": {
      const ref = referenciaExterna(p, ev.key);
      const v = p.justificaciones.he0he1_global?.verificacion;
      const resultados = v && CLAVES_ENERGIA.includes(ev.key) ? resultadosDe(v, ev.key) : [];
      const al = alcanceExterno(ev, p);
      const conLaGlobal = ev.key === "he1" && aplicabilidadEfectiva(p, "he0he1_global").aplicabilidad === "externo";
      return {
        ...base,
        encabezado: rotulo(e.db, e.label),
        tipo: "externo",
        destino: programaEnergia(p, ev.key),
        ...(ref ? { referencia: ref } : {}),
        ...(v && resultados.length > 0 ? { informe: { archivo: v.archivo, ...(v.fecha ? { fecha: v.fecha } : {}), resultados } } : {}),
        ...(al ? { alcance: al } : {}),
        ...(conLaGlobal ? { conLaGlobal } : {}),
      };
    }
    default:
      return null;
  }
}

/**
 * El número de una justificación en el documento: fijo, por su sitio en la
 * sección, haya o no apartado (un pendiente no corre la numeración de los
 * demás). La sección entera si no tiene subapartados.
 */
export function numeroFijo(key: JustificacionKey): string {
  const s = SECCIONES.find((x) => x.keys.includes(key));
  if (!s) return "—";
  return s.sinSubapartados ? s.numero : `${s.numero}.${s.keys.indexOf(key) + 1}`;
}

/** La memoria del expediente, apartado a apartado, en el orden y con la numeración del documento. */
export function memoriaCte(p: Proyecto): MemoriaCte {
  const porClave = new Map<JustificacionKey, ApartadoSinColocar>();
  const pendientes: MemoriaCte["pendientes"] = [];
  for (const ev of evaluarExpediente(p).justificaciones) {
    const a = apartadoDe(ev, p);
    if (a) porClave.set(ev.key, a);
    else pendientes.push({ key: ev.key, codigo: ev.entrada.codigo, label: ev.entrada.label, numero: numeroFijo(ev.key) });
  }
  const apartados: ApartadoMemoria[] = [];
  for (const s of SECCIONES) {
    const deLaSeccion = s.keys.flatMap((k) => porClave.get(k) ?? []);
    const sinTitulo = s.sinSubapartados === true && deLaSeccion.length === 1;
    for (const a of deLaSeccion) {
      porClave.delete(a.key);
      const grupo = `${s.numero}. ${s.titulo}`;
      const titulo = sinTitulo ? s.titulo : (TITULOS[a.key] ?? a.encabezado);
      apartados.push({ ...a, capitulo: s.capitulo, grupo, sinTitulo, titulo, encabezado: sinTitulo ? grupo : `${numeroFijo(a.key)}. ${titulo}` });
    }
  }
  // Una justificación nueva que aún no tiene sitio en el documento: al final, sin número.
  for (const a of porClave.values()) apartados.push({ ...a, capitulo: 4, grupo: "Otras justificaciones", titulo: a.encabezado });
  return { titulo: TITULO_MEMORIA, proyecto: p.nombre, obra: obraDe(p), apartados, pendientes };
}

const NOMBRE_OBRA: Record<TipoObraExistente, string> = { reforma: "reforma", ampliacion: "ampliación", cambio_uso: "cambio de uso" };

/** «Cambio de uso y reforma». */
function tipoObras(p: Proyecto): string {
  const tipos = tiposDeObra(p.datosGenerales).map((t) => NOMBRE_OBRA[t]);
  if (tipos.length === 0) return "Obra nueva";
  const t = tipos.length === 1 ? tipos[0] : `${tipos.slice(0, -1).join(", ")} y ${tipos.at(-1)}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function obraDe(p: Proyecto): ObraMemoria {
  const dg = p.datosGenerales;
  const fase = dg.documento?.fase;
  const a = dg.alcance;
  const nueva = dg.intervencion === "obra_nueva";
  const cambia = tiposDeObra(dg).includes("cambio_uso");
  return {
    tipoProyecto: fase ? NOMBRE_FASE[fase] : "—",
    tipoObras: tipoObras(p),
    alcance: nueva ? "No procede" : !a ? "Pendiente del asistente de alcance" : a.integral ? "Integral" : "Parcial",
    cambioUso: !cambia ? "No" : a?.cambioUsoCaracteristico ? "Sí, del uso característico" : "Sí, de una parte del edificio",
  };
}

/** Cómo se aplica cada exigencia, en una palabra o dos, para el cuadro inicial. */
function comoSeAplica(a: ApartadoMemoria): string {
  if (a.tipo === "externo") return `Con ${a.destino}`;
  switch (a.aplicabilidad) {
    case "aplica":
      return "Se aplica";
    case "aplica_reformado":
      return "A lo intervenido";
    case "aplica_flexibilidad":
      return "Con flexibilidad";
    case "no_aplica":
      return "No aplica";
    default:
      return "Se aplica";
  }
}



// ── Bloques: lo que comparten el Word, el PDF y el texto copiado ────────────

export type BloqueMemoria =
  | { tipo: "titulo"; nivel: 1 | 2 | 3; texto: string }
  | { tipo: "parrafo"; texto: string }
  /** Línea de fuentes o cita: en pequeño. */
  | { tipo: "nota"; texto: string }
  /** Lo que falta: se resalta para que no pase desapercibido. */
  | { tipo: "pendiente"; texto: string }
  | {
      tipo: "tabla";
      cabecera: string[];
      filas: string[][];
      /** Encima, en negrita (feature-31). */
      rotulo?: string;
      /** Sin decir, la primera es `texto` y el resto `dato`. */
      columnas?: TipoColumna[];
      /** Debajo, numeradas. */
      notas?: string[];
      /** Hasta 12 columnas en letra más pequeña, sin partir (feature-33). */
      ancha?: boolean;
    };

/** El párrafo de una externa: con qué se justifica y su documento. */
function textoExterno(a: Extract<ApartadoMemoria, { tipo: "externo" }>): string {
  if (a.informe) {
    const cuando = a.informe.fecha ? ` de ${a.informe.fecha}` : "";
    const ref = a.referencia ? ` Documento de referencia: ${a.referencia}.` : "";
    return `Se justifica con ${a.destino}, según su informe de verificación de los requisitos de HE0 y HE1${cuando}, que se adjunta.${ref} Resultados:`;
  }
  // HE 1 con la global: el mismo documento, no otro que adjuntar (feature-28).
  const con = a.conLaGlobal
    ? `Se justifica con ${a.destino}, en el mismo documento que la verificación energética global.`
    : `Se justifica con ${a.destino}.`;
  return a.referencia ? `${con} Documento de referencia: ${a.referencia}.` : a.conLaGlobal ? con : `${con} Pendiente de adjuntar el documento.`;
}

/**
 * Lo que abre el capítulo 3 (feature-29): el tipo de obra, como la tabla con que
 * abren el SI las memorias del estudio, y dónde se justifica cada exigencia.
 */
export function cuadroInicial(m: MemoriaCte): BloqueMemoria[] {
  const o = m.obra;
  return [
    {
      tipo: "tabla",
      cabecera: ["Tipo de proyecto", "Tipo de obras", "Alcance de las obras", "Cambio de uso"],
      filas: [[o.tipoProyecto, o.tipoObras, o.alcance, o.cambioUso]],
    },
    { tipo: "parrafo", texto: "Cada exigencia se justifica en el apartado que se indica:" },
    {
      tipo: "tabla",
      cabecera: ["Exigencia", "Aplicación", "Apartado"],
      // En el orden del documento, con los pendientes en su sitio.
      filas: SECCIONES.flatMap((s) =>
        s.keys.flatMap((k) => {
          const a = m.apartados.find((x) => x.key === k);
          if (a) return [[a.titulo, comoSeAplica(a), numeroFijo(k)]];
          const pe = m.pendientes.find((x) => x.key === k);
          return pe ? [[TITULOS[k] ?? `${pe.codigo} ${pe.label}`, "Pendiente de redactar", numeroFijo(k)]] : [];
        }),
      ),
    },
  ];
}

/**
 * La memoria como bloques: el capítulo (H1), el DB (H2) y la sección (H3), con
 * la numeración del documento (feature-29). El proyecto y la fecha no van en el
 * cuerpo: el título del proyecto va al pie del Word y del PDF.
 */
export function bloquesMemoria(m: MemoriaCte): BloqueMemoria[] {
  const b: BloqueMemoria[] = [];
  let capitulo: Capitulo | 0 = 0;
  let grupo = "";
  for (const a of m.apartados) {
    if (a.capitulo !== capitulo) {
      capitulo = a.capitulo;
      b.push({ tipo: "titulo", nivel: 1, texto: `${capitulo}. ${CAPITULOS[capitulo]}` });
      if (capitulo === 3) b.push(...cuadroInicial(m));
    }
    if (a.grupo !== grupo) {
      grupo = a.grupo;
      b.push({ tipo: "titulo", nivel: 2, texto: grupo });
    }
    if (!a.sinTitulo) b.push({ tipo: "titulo", nivel: 3, texto: a.encabezado });
    if ((a.tipo === "redactado" || a.tipo === "no_cumple" || a.tipo === "externo") && a.alcance) {
      b.push({ tipo: "parrafo", texto: a.alcance.parrafo });
      if (a.alcance.cita) b.push({ tipo: "nota", texto: a.alcance.cita });
    }
    switch (a.tipo) {
      case "redactado":
        for (const x of piezasMemoria(a.doc)) {
          if (x.tipo === "parrafo") {
            b.push({ tipo: "parrafo", texto: sinSupuestos(textoParrafo(x.p)) });
            continue;
          }
          const t = x.t;
          b.push({
            tipo: "tabla",
            cabecera: t.cabecera,
            filas: t.filas.map((f) => f.map(sinSupuestos)),
            ...(t.rotulo ? { rotulo: t.rotulo } : {}),
            ...(t.columnas ? { columnas: t.columnas } : {}),
            ...(t.notas && t.notas.length > 0 ? { notas: t.notas.map(sinSupuestos) } : {}),
            ...(t.ancha ? { ancha: true } : {}),
          });
        }
        if (a.doc.fuente) b.push({ tipo: "nota", texto: fuenteCorta(a.doc.fuente) });
        break;
      case "no_cumple":
        b.push({ tipo: "pendiente", texto: "Pendiente: este apartado aún no cumple y no se incluye hasta que se resuelva." });
        for (const motivo of a.motivos) b.push({ tipo: "parrafo", texto: `– ${motivo}` });
        break;
      case "no_aplica":
        b.push({ tipo: "parrafo", texto: a.parrafo });
        if (a.cita) b.push({ tipo: "nota", texto: a.cita });
        break;
      case "externo":
        b.push({ tipo: "parrafo", texto: textoExterno(a) });
        if (a.informe) {
          b.push({
            tipo: "tabla",
            cabecera: ["Exigencia", "Proyecto", "Límite", "Cumple"],
            filas: a.informe.resultados.map((r) => [r.exigencia, r.proyecto, r.limite, r.cumple ? "Sí" : "No"]),
          });
          if (a.informe.resultados.some((r) => !r.cumple)) {
            b.push({ tipo: "pendiente", texto: "Pendiente: según el informe, el edificio no cumple todas las exigencias." });
          }
        }
        break;
    }
  }
  if (m.pendientes.length > 0) {
    b.push({ tipo: "titulo", nivel: 2, texto: "Apartados pendientes" });
    b.push({
      tipo: "pendiente",
      texto: `Aún sin redactar: ${m.pendientes.map((x) => `${x.codigo} ${x.label}`).join("; ")}.`,
    });
  }
  return b;
}

/** La memoria entera en texto plano, para «Copiar todo». */
export function textoPlanoMemoriaCte(m: MemoriaCte): string {
  return bloquesMemoria(m)
    .map((bl) => {
      if (bl.tipo === "tabla") return textoTabla(bl);
      return bl.texto;
    })
    .join("\n\n");
}

/** «Viviendas y local · C/ Mayor 12» → «memoria-cte-viviendas-y-local-c-mayor-12.pdf». */
export function nombreArchivoMemoria(proyecto: string, ext: "pdf" | "docx"): string {
  return nombreArchivo("memoria-cte", proyecto, ext);
}

/** El nombre de un documento del proyecto: «<prefijo>-<proyecto en minúsculas y sin acentos>.<ext>». */
export function nombreArchivo(prefijo: string, proyecto: string, ext: "pdf" | "docx"): string {
  const slug = proyecto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefijo}-${slug || "proyecto"}.${ext}`;
}
