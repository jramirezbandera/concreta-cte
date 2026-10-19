import { describe, it, expect } from "vitest";
import { fotoExpedientes } from "./fotoExpediente";
import antes from "./foto-antes.json";

// =============================================================================
// Cierre de feature-27 (paso 8): sin asistente de alcance ni marcas de zona,
// el expediente es el mismo que con el código de partida (7e576d8). 40
// proyectos: el Demo y los cuatro casos de El edificio, cada intervención, con
// y sin piscina. Por justificación: aplicabilidad, estado, veredicto, nota y
// cita; y la huella del texto entero de la memoria.
// Regenerada al llevar HE1 al programa de la verificación global y al nombrar
// el programa «HULC o CE3X»: solo cambiaron las filas de HE1 y HE0 y la huella
// de la memoria de los 40 proyectos.
// Regenerada en feature-28 (rótulos «DB-HS 2» con espacio) y en feature-29
// (capítulos, numeración, fuentes cortas, cuadro inicial y sin «supuestos»):
// solo cambió la
// huella de la memoria de los 40 proyectos. Y en feature-31 (tablas «Norma |
// Proyecto» de SI, SUA y HR), lo mismo. En feature-32 (habitabilidad) se añade
// la fila «hab» y cambia la huella de la memoria; nada más. En feature-33 (anejo
// de instalaciones) se añade la huella del anejo y cambia la de la memoria, por
// la frase que remite al anejo y a los planos; nada más.
// En feature-34 (el REBT en el anejo) cambian la huella del anejo y la de la
// memoria, por la remisión al 5.3.3, y el REBT de las 8 unifamiliares pasa a
// «revisar» por las longitudes y el terreno supuestos; nada más.
// En feature-35 (paso 5) cambia la huella de la memoria de los 40 proyectos,
// por la línea que remite al estudio de seguridad y salud y al de residuos;
// nada más. En el paso 7 se añade la huella del estudio básico (con unos datos
// fijos de seguridad y salud); el resto, igual. En feature-36 (paso 2, HE 3) se
// añade la fila «he3» y cambia la huella de la memoria, por el apartado nuevo y la
// numeración del 3.6; nada más. En el paso 3 (ICT) se añade la fila «ict» y
// cambia la huella de la memoria, por el apartado 4.3; nada más (el Demo, del que
// salen los datos de la obra de los 40, pasa a estar en propiedad horizontal).
// En el paso 4 (HE 2 · RITE) se añade la fila «rite» y cambia la huella de la
// memoria, por el apartado 3.6.3 y la numeración del 3.6; el REBT, que lee la
// climatización del RITE, no cambia (lo habitual sigue siendo la aire-aire). En
// el paso 5 (accesibilidad autonómica) se añade la fila «acc» y cambia la huella
// de la memoria, por el apartado 4.4; nada más.
// =============================================================================

describe("sin asistente de alcance, nada cambia", () => {
  const ahora = fotoExpedientes();

  it("los mismos proyectos", () => {
    expect(Object.keys(ahora).sort()).toEqual(Object.keys(antes).sort());
  });

  it.each(Object.keys(antes))("%s", (id) => {
    expect(ahora[id]).toEqual((antes as Record<string, Record<string, string>>)[id]);
  });
});
