import { comunidadDeIne, type ComunidadAutonoma } from "../../data/comunidades";
import type { DatosGenerales, PromocionObra } from "./tipos";

// =============================================================================
// El régimen de la promoción (feature-36, paso 1). PURO.
//
// Dos preguntas sí / no que El edificio no sabe y que deciden apartados de la
// fase 7: la propiedad horizontal (ICT) y la promoción protegida o pública
// (reserva de viviendas accesibles). La autopromoción para uso propio se quitó en
// el paso 5: el art. 106 del Decreto 293/2009 solo alcanza a los plurifamiliares,
// y en un expediente guardado se ignora. Sin valor por defecto: lo que no se contesta, el
// apartado que lo necesita lo pide como pendiente. La comunidad autónoma no se
// pregunta: sale del código INE del municipio.
// =============================================================================

const CAMPOS = ["propiedadHorizontal", "protegida"] as const satisfies readonly (keyof PromocionObra)[];

/** Lo declarado, leído con cuidado: solo los sí / no que tienen forma (un expediente tocado a mano no rompe nada). */
export function promocionDe(dg: Pick<DatosGenerales, "promocion">): PromocionObra {
  const p: unknown = dg.promocion;
  const r: PromocionObra = {};
  if (typeof p !== "object" || p === null) return r;
  for (const c of CAMPOS) {
    const v = (p as Record<string, unknown>)[c];
    if (typeof v === "boolean") r[c] = v;
  }
  return r;
}

/**
 * Los datos de la obra con un cambio en el régimen. `undefined` borra la
 * respuesta; sin ninguna, el campo `promocion` desaparece (como lo leería un
 * expediente de antes de feature-36).
 */
export function conPromocion(dg: DatosGenerales, cambio: Partial<Record<keyof PromocionObra, boolean | undefined>>): DatosGenerales {
  const r: PromocionObra = { ...promocionDe(dg) };
  for (const c of CAMPOS) {
    if (!(c in cambio)) continue;
    const v = cambio[c];
    if (v === undefined) delete r[c];
    else r[c] = v;
  }
  const { promocion: _p, ...resto } = dg;
  return Object.keys(r).length > 0 ? { ...resto, promocion: r } : resto;
}

/** La comunidad autónoma de la obra, por el municipio; sin municipio elegido, ninguna. */
export function comunidadDeObra(dg: Pick<DatosGenerales, "municipioIne">): ComunidadAutonoma | undefined {
  return comunidadDeIne(dg.municipioIne);
}
