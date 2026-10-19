// =============================================================================
// Comunidades y ciudades autónomas por el código INE de la provincia (los dos
// primeros dígitos del código de municipio). feature-36, paso 1: la comunidad no
// se pregunta, sale del municipio. Fuente: relación de provincias del INE.
// =============================================================================

export type ComunidadAutonoma =
  | "andalucia"
  | "aragon"
  | "asturias"
  | "baleares"
  | "canarias"
  | "cantabria"
  | "castilla_la_mancha"
  | "castilla_y_leon"
  | "cataluna"
  | "comunidad_valenciana"
  | "extremadura"
  | "galicia"
  | "madrid"
  | "murcia"
  | "navarra"
  | "pais_vasco"
  | "la_rioja"
  | "ceuta"
  | "melilla";

export const NOMBRE_COMUNIDAD: Record<ComunidadAutonoma, string> = {
  andalucia: "Andalucía",
  aragon: "Aragón",
  asturias: "Principado de Asturias",
  baleares: "Illes Balears",
  canarias: "Canarias",
  cantabria: "Cantabria",
  castilla_la_mancha: "Castilla-La Mancha",
  castilla_y_leon: "Castilla y León",
  cataluna: "Cataluña",
  comunidad_valenciana: "Comunitat Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  madrid: "Comunidad de Madrid",
  murcia: "Región de Murcia",
  navarra: "Comunidad Foral de Navarra",
  pais_vasco: "País Vasco",
  la_rioja: "La Rioja",
  ceuta: "Ciudad Autónoma de Ceuta",
  melilla: "Ciudad Autónoma de Melilla",
};

/** Código INE de provincia → comunidad. */
export const COMUNIDAD_DE_PROVINCIA: Readonly<Record<string, ComunidadAutonoma>> = {
  "01": "pais_vasco",
  "02": "castilla_la_mancha",
  "03": "comunidad_valenciana",
  "04": "andalucia",
  "05": "castilla_y_leon",
  "06": "extremadura",
  "07": "baleares",
  "08": "cataluna",
  "09": "castilla_y_leon",
  "10": "extremadura",
  "11": "andalucia",
  "12": "comunidad_valenciana",
  "13": "castilla_la_mancha",
  "14": "andalucia",
  "15": "galicia",
  "16": "castilla_la_mancha",
  "17": "cataluna",
  "18": "andalucia",
  "19": "castilla_la_mancha",
  "20": "pais_vasco",
  "21": "andalucia",
  "22": "aragon",
  "23": "andalucia",
  "24": "castilla_y_leon",
  "25": "cataluna",
  "26": "la_rioja",
  "27": "galicia",
  "28": "madrid",
  "29": "andalucia",
  "30": "murcia",
  "31": "navarra",
  "32": "galicia",
  "33": "asturias",
  "34": "castilla_y_leon",
  "35": "canarias",
  "36": "galicia",
  "37": "castilla_y_leon",
  "38": "canarias",
  "39": "cantabria",
  "40": "castilla_y_leon",
  "41": "andalucia",
  "42": "castilla_y_leon",
  "43": "cataluna",
  "44": "aragon",
  "45": "castilla_la_mancha",
  "46": "comunidad_valenciana",
  "47": "castilla_y_leon",
  "48": "pais_vasco",
  "49": "castilla_y_leon",
  "50": "aragon",
  "51": "ceuta",
  "52": "melilla",
};

/** La comunidad de un municipio por su código INE (5 dígitos) o de una provincia (2). */
export function comunidadDeIne(ine: string | undefined): ComunidadAutonoma | undefined {
  return ine ? COMUNIDAD_DE_PROVINCIA[ine.slice(0, 2)] : undefined;
}

/** Los códigos INE de las provincias de una comunidad, en orden. */
export function provinciasDe(c: ComunidadAutonoma): string[] {
  return Object.keys(COMUNIDAD_DE_PROVINCIA)
    .filter((p) => COMUNIDAD_DE_PROVINCIA[p] === c)
    .sort();
}
