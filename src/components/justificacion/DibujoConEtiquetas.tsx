import { useLayoutEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { TEXTO_ESTADO, type EstadoPresentacion } from "../../lib/cte/presentacion";

// =============================================================================
// El dibujo con sus cifras encima (REDISENO-V4 §3.3, feature-14 §H). El SVG va
// a su tamaño ajustado y cada cifra es un BOTÓN HTML colocado en % sobre su
// ancla del viewBox: se lee, se enfoca con el teclado y se pulsa. Pulsar
// selecciona el elemento; la franja y la lista lo siguen.
//
// Estado multicanal (WCAG 1.4.1): punto de color, borde (discontinuo en lo
// previsto) y el estado en el nombre accesible, nunca solo el color. En papel
// las etiquetas van dentro del SVG (svg2pdf no ve HTML): eso es cosa del módulo.
// =============================================================================

export interface EtiquetaDibujo {
  /** Clave única de la etiqueta (un elemento puede tener varias). */
  key: string;
  elementoId: string;
  /** Ancla en unidades del viewBox. */
  x: number;
  y: number;
  texto: string;
  estado: EstadoPresentacion;
  /** Nombre del elemento para el lector de pantalla («Bajante A · fecales»). */
  nombre: string;
}

const CHIP: Record<EstadoPresentacion, string> = {
  ok: "border-border-main text-text-primary bg-bg-primary",
  rv: "border-state-warn/55 text-state-warn bg-bg-primary",
  ko: "border-state-fail/60 text-state-fail bg-[color-mix(in_srgb,var(--color-state-fail)_7%,var(--color-bg-primary))]",
  pv: "border-border-main border-dashed text-text-secondary bg-bg-primary",
  in: "border-border-main text-text-secondary bg-bg-primary",
  dt: "border-border-main text-text-secondary bg-bg-primary",
  fu: "border-border-main text-text-secondary bg-bg-primary",
};

const PUNTO: Record<EstadoPresentacion, string> = {
  ok: "bg-state-ok",
  rv: "bg-state-warn",
  ko: "bg-state-fail",
  pv: "border-[1.5px] border-text-disabled",
  in: "bg-text-disabled",
  dt: "bg-text-disabled",
  fu: "bg-text-disabled",
};

// Medidas del chip [px] (h-[26px], px-[7px], punto 6 + hueco 5, mono 12 px ≈ 7,25 px/carácter).
const CHIP_ALTO = 26;
const CHIP_FIJO = 2 * 7 + 6 + 5 + 2;
const CHIP_CARACTER = 7.25;
const HOLGURA = 4;
/**
 * Huecos que se prueban, en orden, cuando el chip choca: [dx, dy] en medios
 * anchos de chip y en alturas de chip. Primero arriba y abajo; luego a un lado
 * (el chip queda junto a su ancla); luego más lejos en vertical.
 */
const HUECOS: [number, number][] = [
  [0, 0],
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [0, 2],
  [0, -2],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [0, 3],
  [0, -3],
];
/** Para no tapar un rótulo del dibujo solo se aleja el chip hasta aquí (índice en HUECOS). */
const HUECOS_POR_ROTULO = 5;
/** Lo que un chip puede rozar un rótulo sin taparlo [px]: la caja del texto incluye su interlineado. */
const ROCE = 4;

/** Un rectángulo [px] en coordenadas del lienzo: centro y medidas. */
interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

const solape = (a: Caja, b: Caja, holgura: number): number => {
  const sx = (a.w + b.w) / 2 + holgura - Math.abs(a.x - b.x);
  const sy = (a.h + b.h) / 2 + holgura - Math.abs(a.y - b.y);
  return sx > 0 && sy > 0 ? sx * sy : 0;
};

/**
 * Centro de cada chip [px]. Las anclas vienen del dibujo, pero los chips miden
 * lo mismo a cualquier escala: con el dibujo estrecho, dos anclas vecinas se
 * pisan. En orden, cada chip busca el primer hueco que no choque con otro chip
 * ni tape un rótulo del dibujo (`rotulos`); si no lo hay cerca, uno que solo no
 * choque con otro chip; y si tampoco, el que menos se pise.
 */
function colocar(
  etiquetas: EtiquetaDibujo[],
  ancho: number,
  alto: number,
  viewW: number,
  viewH: number,
  rotulos: readonly Caja[],
) {
  const puestas: Caja[] = [];
  return etiquetas.map((e) => {
    const x0 = (e.x / viewW) * ancho;
    const y0 = (e.y / viewH) * alto;
    const w = e.texto.length * CHIP_CARACTER + CHIP_FIJO;
    const candidatas = HUECOS.map(([dx, dy]) => ({
      x: x0 + dx * (w / 2 + HOLGURA * 2),
      y: y0 + dy * (CHIP_ALTO + HOLGURA),
      w,
      h: CHIP_ALTO,
    })).filter(
      (c, i) =>
        i === 0 ||
        (c.y - CHIP_ALTO / 2 >= 0 && c.y + CHIP_ALTO / 2 <= alto && c.x - w / 2 >= 0 && c.x + w / 2 <= ancho),
    );
    const contraChips = (c: Caja) => puestas.reduce((s, p) => s + solape(c, p, HOLGURA), 0);
    const tapaRotulo = (c: Caja) => rotulos.some((r) => solape(c, r, -ROCE) > 0);
    const elegida =
      candidatas.slice(0, HUECOS_POR_ROTULO).find((c) => contraChips(c) === 0 && !tapaRotulo(c)) ??
      candidatas.find((c) => contraChips(c) === 0) ??
      candidatas.reduce((mejor, c) => (contraChips(c) < contraChips(mejor) ? c : mejor));
    puestas.push(elegida);
    return { x: elegida.x, y: elegida.y };
  });
}

/**
 * Las cajas [px] de los rótulos del SVG (`<text>` y lo marcado con
 * `data-rotulo`, como los iconos), medidas en el navegador respecto al lienzo.
 * Sin medida real (jsdom) no hay ninguna.
 */
function medirRotulos(lienzo: HTMLElement): Caja[] {
  const base = lienzo.getBoundingClientRect();
  const cajas: Caja[] = [];
  lienzo.querySelectorAll("svg text, svg [data-rotulo]").forEach((t) => {
    const r = t.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      cajas.push({
        x: Math.round(r.left - base.left + r.width / 2),
        y: Math.round(r.top - base.top + r.height / 2),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  });
  return cajas;
}

interface DibujoConEtiquetasProps {
  /** Tamaño al que se pinta el SVG [px]. */
  ancho: number;
  alto: number;
  /** Tamaño del viewBox. */
  viewW: number;
  viewH: number;
  svg: ReactNode;
  etiquetas: EtiquetaDibujo[];
  seleccion: string | null;
  onSelect: (elementoId: string) => void;
}

export function DibujoConEtiquetas({
  ancho,
  alto,
  viewW,
  viewH,
  svg,
  etiquetas,
  seleccion,
  onSelect,
}: DibujoConEtiquetasProps): JSX.Element {
  // Los rótulos del SVG se miden después de pintarlo; con ellos, los chips se
  // recolocan para no taparlos. Solo cambia el estado si cambian las medidas.
  const lienzoRef = useRef<HTMLDivElement>(null);
  const [rotulos, setRotulos] = useState<{ clave: string; cajas: Caja[] }>({ clave: "", cajas: [] });
  useLayoutEffect(() => {
    if (!lienzoRef.current) return;
    const cajas = medirRotulos(lienzoRef.current);
    const clave = JSON.stringify(cajas);
    setRotulos((prev) => (prev.clave === clave ? prev : { clave, cajas }));
  }, [ancho, alto, svg]);
  const sitios = colocar(etiquetas, ancho, alto, viewW, viewH, rotulos.cajas);
  return (
    <div ref={lienzoRef} className="relative" style={{ width: ancho, height: alto }}>
      {svg}
      <ul aria-label="Cifras del dibujo">
        {etiquetas.map((e, i) => {
          const on = e.elementoId === seleccion;
          return (
            <li key={e.key}>
              <button
                type="button"
                onClick={() => onSelect(e.elementoId)}
                aria-pressed={on}
                aria-label={`${e.nombre}: ${e.texto}, ${TEXTO_ESTADO[e.estado]}`}
                style={{ left: sitios[i].x, top: sitios[i].y }}
                className={[
                  "absolute inline-flex h-[26px] -translate-x-1/2 -translate-y-1/2 items-center gap-[5px] rounded border px-[7px] font-mono text-[12px] font-medium whitespace-nowrap transition-colors",
                  on
                    ? "border-accent bg-accent text-bg-primary z-[2]"
                    : `${CHIP[e.estado]} hover:border-text-disabled z-[1]`,
                ].join(" ")}
              >
                <i
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${on ? "bg-bg-primary" : PUNTO[e.estado]}`}
                />
                {e.texto}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
