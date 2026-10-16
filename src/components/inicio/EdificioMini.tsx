import type { JSX } from "react";
import type { ResumenEdificio } from "../../lib/edificio/derivar";

// =============================================================================
// Alzado esquemático del edificio para la tarjeta de Inicio: plantas sobre y
// bajo rasante, cubierta y local en planta baja, leídos del resumen del
// edificio. Es decorativo (aria-hidden): las cifras van en texto en la tarjeta.
// =============================================================================

const H = 100;
const SUELO = 76;
/** Altura disponible para las plantas sobre rasante, dejando sitio a la cubierta. */
const ALTO_UTIL = 58;
const MAX_SOBRE = 12;
const MAX_BAJO = 2;

/**
 * `lienzo` es el ancho del viewBox: se elige con la proporción del hueco donde va
 * (la cabecera de la tarjeta es apaisada; la miniatura de la lista, casi cuadrada)
 * El terreno se sale del lienzo (overflow visible) para llegar de borde a borde
 * aunque el hueco sea algo más ancho; lo recorta el contenedor.
 */
export function EdificioMini({
  edificio: e,
  lienzo: W = 320,
}: {
  edificio: ResumenEdificio;
  lienzo?: number;
}): JSX.Element {
  const sobre = Math.min(Math.max(1, e.plantasSobreRasante), MAX_SOBRE);
  const bajo = Math.min(e.plantasBajoRasante, MAX_BAJO);
  const hPl = Math.min(13, ALTO_UTIL / sobre);
  const ancho = e.esUnifamiliar ? 56 : e.numViviendas > 8 || e.tipo === "oficinas" ? 88 : 72;
  const x0 = (W - ancho) / 2;
  const techo = SUELO - sobre * hPl;
  const huecos = Math.max(2, Math.floor(ancho / 15));
  const paso = ancho / huecos;
  const hHueco = Math.max(1.5, hPl * 0.42);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" aria-hidden="true" focusable="false">
      {/* Terreno */}
      <rect x={-W} y={SUELO} width={3 * W} height={H - SUELO} className="fill-earth/35" />

      {/* Sótanos */}
      {Array.from({ length: bajo }, (_, j) => (
        <rect
          key={`b${j}`}
          x={x0}
          y={SUELO + 1.5 + j * 11}
          width={ancho}
          height={10}
          className="fill-slab stroke-ink"
          strokeWidth={0.8}
          strokeDasharray="2 1.5"
        />
      ))}

      {/* Plantas sobre rasante */}
      {Array.from({ length: sobre }, (_, i) => {
        const y = SUELO - (i + 1) * hPl;
        const localPB = i === 0 && e.tieneLocalPB;
        return (
          <g key={`p${i}`}>
            <rect x={x0} y={y} width={ancho} height={hPl} className="fill-bg-primary stroke-ink" strokeWidth={0.9} />
            {localPB ? (
              <rect x={x0 + 4} y={y + hPl * 0.25} width={ancho - 8} height={hPl * 0.6} className="fill-accent/25" />
            ) : (
              hPl >= 4 &&
              Array.from({ length: huecos }, (_, k) => (
                <rect
                  key={k}
                  x={x0 + paso * k + paso / 2 - 3}
                  y={y + (hPl - hHueco) / 2}
                  width={6}
                  height={hHueco}
                  className="fill-accent/30"
                />
              ))
            )}
          </g>
        );
      })}

      {/* Cubierta */}
      {e.tipoCubierta === "inclinada" ? (
        <polygon
          points={`${x0 - 4},${techo} ${W / 2},${techo - 16} ${x0 + ancho + 4},${techo}`}
          className="fill-slab stroke-ink"
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
      ) : (
        <>
          <rect x={x0 - 1.5} y={techo - 2} width={ancho + 3} height={2} className="fill-ink" />
          {e.cubiertaTransitable && (
            <path
              d={`M${x0} ${techo - 6} H${x0 + ancho} ${Array.from({ length: 7 }, (_, k) => `M${x0 + (ancho / 6) * k} ${techo - 6} V${techo - 2}`).join(" ")}`}
              className="stroke-ink"
              strokeWidth={0.7}
              fill="none"
            />
          )}
        </>
      )}

      {/* Rasante */}
      <line x1={-W} x2={2 * W} y1={SUELO} y2={SUELO} className="stroke-ink" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}
