// =============================================================================
// La memoria CTE en PDF (feature-16 §F). Los mismos bloques que el Word
// (`bloquesMemoria`), maquetados con jsPDF: A4, márgenes del anejo, tablas con
// celdas que parten el texto, y en todas las hojas la cabecera del estudio y el pie con el
// título del proyecto y la página, como las memorias del estudio (feature-29).
// =============================================================================

import jsPDF from "jspdf";
import { anchosDeTabla } from "../docx/plan";
import { columnasDe, esNoCumple, notasNumeradas } from "../cte/memoria";
import type { TipoColumna } from "../cte/presentacion";
import { nombreArchivoMemoria, type BloqueMemoria } from "../obra/memoria";
import type { Membrete } from "../estudio/estudio";
import { ensureSpace, FOOTER_RESERVE, PAGE_H, PAGE_W, pdfStr, setGray, type PdfResult } from "./utils";

const M = 18;
const CW = PAGE_W - 2 * M;
const MAX_Y = PAGE_H - M - FOOTER_RESERVE;

interface Estilo {
  size: number;
  bold: boolean;
  gray: number;
  /** Interlineado [mm]. */
  lh: number;
  antes: number;
  despues: number;
}

const ESTILOS: Record<"h1" | "h2" | "h3" | "parrafo" | "nota" | "pendiente" | "rotulo" | "notaTabla", Estilo> = {
  h1: { size: 15, bold: true, gray: 15, lh: 6.5, antes: 0, despues: 2 },
  h2: { size: 11.5, bold: true, gray: 20, lh: 5.2, antes: 5, despues: 1.5 },
  h3: { size: 10, bold: true, gray: 30, lh: 4.6, antes: 3.5, despues: 1 },
  parrafo: { size: 9.5, bold: false, gray: 40, lh: 4.4, antes: 0, despues: 2.2 },
  nota: { size: 7.5, bold: false, gray: 110, lh: 3.4, antes: 0, despues: 2.2 },
  pendiente: { size: 9.5, bold: true, gray: 30, lh: 4.4, antes: 0, despues: 2.2 },
  rotulo: { size: 9, bold: true, gray: 30, lh: 4.2, antes: 0.5, despues: 1 },
  notaTabla: { size: 7.5, bold: false, gray: 110, lh: 3.4, antes: 0, despues: 0.8 },
};

/** Escribe un texto con salto de línea y de página. Devuelve la y siguiente. */
function texto(doc: jsPDF, t: string, y: number, e: Estilo): number {
  doc.setFont("helvetica", e.bold ? "bold" : "normal");
  doc.setFontSize(e.size);
  setGray(doc, e.gray);
  const lineas = doc.splitTextToSize(pdfStr(t), CW) as string[];
  y += e.antes;
  // Un título no se queda solo al pie: pide sitio para dos líneas más.
  y = ensureSpace(doc, y, e.lh * (e.bold ? lineas.length + 2 : 1), M);
  for (const l of lineas) {
    if (y > MAX_Y) y = ensureSpace(doc, y, e.lh, M);
    doc.text(l, M, y);
    y += e.lh;
  }
  return y + e.despues;
}

const ALINEA: Record<TipoColumna, "left" | "right" | "center"> = { texto: "left", dato: "right", norma: "center", proyecto: "center", cumple: "center" };

/** Las celdas de las tablas: 7,5 pt, con su margen y su interlineado [mm]. */
const CELDA = { size: 7.5, pad: 1.5, lh: 3.2, arriba: 3.1, abajo: 1.4 };

/**
 * Una tabla de la memoria. A diferencia de `drawTable` (las fichas), cada celda
 * parte su texto en líneas y la fila crece con la más alta: las tablas «Norma |
 * Proyecto» tienen celdas largas en columnas estrechas (feature-31). La
 * cabecera se repite al cambiar de hoja y ninguna fila se parte.
 */
function tabla(doc: jsPDF, b: Extract<BloqueMemoria, { tipo: "tabla" }>, y: number): number {
  const { cabecera, filas } = b;
  const tipos = columnasDe(b);
  const anchos = anchosDeTabla(cabecera, filas).map((a) => (CW * a) / 100);
  doc.setFontSize(CELDA.size);
  const partir = (celdas: string[], negrita: (j: number) => boolean): string[][] =>
    anchos.map((w, j) => {
      doc.setFont("helvetica", negrita(j) ? "bold" : "normal");
      return doc.splitTextToSize(pdfStr(celdas[j] ?? ""), Math.max(4, w - 2 * CELDA.pad)) as string[];
    });
  const alto = (ls: string[][]): number => Math.max(1, ...ls.map((l) => l.length)) * CELDA.lh + CELDA.abajo;
  const pintar = (ls: string[][], arriba: number, negrita: (j: number) => boolean, gris: number): void => {
    let x = M;
    ls.forEach((lineas, j) => {
      const w = anchos[j];
      const al = ALINEA[tipos[j]];
      const tx = al === "right" ? x + w - CELDA.pad : al === "center" ? x + w / 2 : x + CELDA.pad;
      doc.setFont("helvetica", negrita(j) ? "bold" : "normal");
      setGray(doc, gris);
      lineas.forEach((l, k) => doc.text(l, tx, arriba + CELDA.arriba + k * CELDA.lh, al === "left" ? undefined : { align: al }));
      x += w;
    });
  };
  const negritaCab = () => true;
  const cab = partir(cabecera, negritaCab);
  const altoCab = alto(cab);
  const pintarCabecera = (arriba: number): number => {
    doc.setFontSize(CELDA.size);
    pintar(cab, arriba, negritaCab, 60);
    setGray(doc, 160);
    doc.setLineWidth(0.2);
    doc.line(M, arriba + altoCab, M + CW, arriba + altoCab);
    return arriba + altoCab + 0.6;
  };
  // El rótulo no se queda solo al pie: pide sitio para él, la cabecera y una fila.
  if (b.rotulo) {
    y = ensureSpace(doc, y, 20, M);
    y = texto(doc, b.rotulo, y, ESTILOS.rotulo);
  }
  y = ensureSpace(doc, y, altoCab + 8, M);
  y = pintarCabecera(y);
  filas.forEach((f, i) => {
    // Lo que no cumple, para que se vea (feature-31).
    const negrita = (j: number) => tipos[j] === "cumple" && esNoCumple(f[j] ?? "");
    doc.setFontSize(CELDA.size);
    const ls = partir(f, negrita);
    const h = alto(ls);
    y = ensureSpace(doc, y, h, M, (ny) => pintarCabecera(ny));
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(M, y, CW, h, "F");
    }
    doc.setFontSize(CELDA.size);
    pintar(ls, y, negrita, 80);
    y += h;
  });
  // De la raya de abajo a la línea base de lo siguiente; las notas, más pegadas.
  y += b.notas?.length ? 3.5 : 5;
  for (const n of notasNumeradas(b.notas)) y = texto(doc, n, y, ESTILOS.notaTabla);
  return y;
}

/**
 * Cabecera y pie en todas las hojas: a la izquierda quien firma y la dirección,
 * a la derecha la colegiación y el contacto; abajo, el título del proyecto y
 * «Página N». La cabecera vive en el margen superior (8–24 mm): el cuerpo de
 * cada hoja empieza en M + 10.
 */
function membreteEnCadaHoja(doc: jsPDF, m: Membrete): void {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    if (m.cabecera.length > 0) {
      let y = 10;
      for (const [izq, der] of m.cabecera) {
        doc.setFontSize(8);
        setGray(doc, 60);
        doc.setFont("helvetica", "normal");
        doc.text(pdfStr(izq), M, y);
        doc.setFont("helvetica", "bold");
        doc.text(pdfStr(der), PAGE_W - M, y, { align: "right" });
        y += 3.6;
      }
      setGray(doc, 120);
      doc.setLineWidth(0.2);
      doc.line(M, y - 1.6, PAGE_W - M, y - 1.6);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setGray(doc, 90);
    const pagina = `Página ${i}`;
    const ancho = CW - doc.getTextWidth(pagina) - 6;
    const pie = (doc.splitTextToSize(pdfStr(m.pie), ancho) as string[])[0] ?? "";
    doc.text(pie, M, PAGE_H - 8);
    doc.text(pagina, PAGE_W - M, PAGE_H - 8, { align: "right" });
  }
}

/** El documento jsPDF de la memoria (separado de la URL para poder leerlo en los tests). */
export function componerMemoriaPdf(bloques: BloqueMemoria[], membrete: Membrete): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = M + 10;
  for (const b of bloques) {
    switch (b.tipo) {
      case "titulo":
        y = texto(doc, b.texto, y, b.nivel === 1 ? ESTILOS.h1 : b.nivel === 2 ? ESTILOS.h2 : ESTILOS.h3);
        if (b.nivel === 2) {
          setGray(doc, 200);
          doc.setLineWidth(0.2);
          doc.line(M, y - 2.6, M + CW, y - 2.6);
          y += 1;
        }
        break;
      case "parrafo":
        y = texto(doc, b.texto, y, ESTILOS.parrafo);
        break;
      case "nota":
        y = texto(doc, b.texto, y, ESTILOS.nota);
        break;
      case "pendiente":
        y = texto(doc, b.texto, y, ESTILOS.pendiente);
        break;
      case "tabla":
        y = tabla(doc, b, y);
        break;
    }
  }
  membreteEnCadaHoja(doc, membrete);
  return doc;
}

export function renderMemoriaPdf(bloques: BloqueMemoria[], membrete: Membrete): PdfResult {
  const doc = componerMemoriaPdf(bloques, membrete);
  const blob = doc.output("blob");
  return {
    blobUrl: URL.createObjectURL(blob),
    filename: nombreArchivoMemoria(membrete.proyecto, "pdf"),
    pageCount: doc.getNumberOfPages(),
  };
}
