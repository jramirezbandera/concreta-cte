import { describe, it, expect } from "vitest";
import { memoriaCte, textoPlanoMemoriaCte } from "../memoria";
import { evaluarExpediente } from "../evaluar";
import { edificioDeCaso } from "../../edificio/casos";
import { edificioAntes, obraDeCaso, obraExistenteDe } from "../../proyecto/alcance";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";

// =============================================================================
// feature-30, fase 3 de PLAN-MEMORIA: en una obra en un edificio existente, cada
// apartado dice qué se proyecta y qué existe y no se modifica.
// =============================================================================

function reforma(): Proyecto {
  const p: Proyecto = {
    ...crearProyectoDemo("2026-10-10T10:00:00.000Z"),
    edificio: edificioDeCaso("reforma_local_vivienda"),
    justificaciones: {},
  };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}) };
  return p;
}

const texto = (p: Proyecto): string => textoPlanoMemoriaCte(memoriaCte(p));

/** El texto de un apartado: desde su título hasta el siguiente. */
function apartado(t: string, titulo: string): string {
  const i = t.indexOf(titulo);
  if (i < 0) throw new Error(`no está «${titulo}»`);
  const resto = t.slice(i + titulo.length);
  const fin = resto.search(/\n\n\d+\.\d+(\.\d+)?\. /);
  return fin < 0 ? resto : resto.slice(0, fin);
}

describe("el edificio antes de la obra", () => {
  it("la parte del local que pasa a vivienda vuelve al local del que se segrega", () => {
    const p = reforma();
    const antes = edificioAntes(obraExistenteDe(p.datosGenerales, p.edificio)!);
    const pb = antes.grupos.find((g) => g.nivelInicial === 0)!;
    const locales = pb.zonas.filter((z) => z.uso === "local_sin_uso");
    expect(locales).toHaveLength(1);
    expect(locales[0].superficieUtil_m2).toBe(160);
    expect(pb.zonas.some((z) => z.uso === "viviendas")).toBe(false);
  });

  it("sin asistente respondido no hay contexto de lo existente", () => {
    const p = reforma();
    expect(obraExistenteDe({ ...p.datosGenerales, alcance: undefined }, p.edificio)).toBeUndefined();
    expect(obraExistenteDe({ ...p.datosGenerales, intervencion: "obra_nueva" }, p.edificio)).toBeUndefined();
  });
});

describe("instalaciones (paso 2)", () => {
  const t = texto(reforma());

  it("HS 4: el contador se añade a la batería existente", () => {
    const hs4 = apartado(t, "3.4.4. HS 4 Suministro de agua");
    expect(hs4).not.toContain("batería de 2 contadores");
    expect(hs4).toContain("se abastece de la batería de contadores existente");
    expect(hs4).toContain("que pasa a tener 9 contadores");
    expect(hs4).toContain("La acometida y el tubo de alimentación existentes no se modifican.");
    expect(hs4).not.toContain("se justifica con HE 4");
  });

  it("HS 5: acomete a la red existente y las pluviales no se tocan", () => {
    const hs5 = apartado(t, "3.4.5. HS 5 Evacuación de aguas");
    expect(hs5).toContain("Acomete al colector general existente, que con la obra hecha recibe 158 UD, 23 de ellas de lo intervenido.");
    expect(hs5).toContain("la red de pluviales existente, que no se modifica");
    expect(hs5).not.toContain("La cubierta, de 210 m²");
    expect(hs5).not.toContain("sotano");
    expect(evaluarExpediente(reforma()).porClave.hs5?.avisos.map((a) => a.id)).toContain("red-existente-sin-dato");
  });

  it("HS 5: con el Ø del colector existente, comprueba que admite lo que recibe", () => {
    const con = (mm: number): Proyecto => ({ ...reforma(), justificaciones: { hs5: { inputs: { redExistente_mm: mm, redExistentePendiente_pct: 2 } } } });
    expect(evaluarExpediente(con(90)).porClave.hs5!.estado).toBe("no_cumple");
    const p = con(125);
    const ok = evaluarExpediente(p).porClave.hs5!;
    expect(ok.estado).not.toBe("no_cumple");
    expect(apartado(texto(p), "3.4.5. HS 5 Evacuación de aguas")).toContain("que admite 480 UD (tabla 4.5): no hay que modificarlo.");
  });

  it("REBT: la vivienda nueva y la carga del edificio antes y después", () => {
    const rebt = apartado(t, "4.1.1. ITC-BT-10");
    expect(rebt).toContain("La vivienda nueva (del tipo A, de 90 m² útiles)");
    expect(rebt).toContain("la centralización pasa a tener 9 contadores");
    expect(rebt).toContain("la carga prevista del edificio no aumenta: pasa de 85,9 kW a 84,2 kW");
    expect(rebt).not.toContain("Las 7 viviendas");
    expect(rebt).not.toContain("precisa proyecto");
  });
});

describe("envolvente y aire (paso 3)", () => {
  const t = texto(reforma());

  it("HS 1: solo los huecos; lo demás existente no se describe", () => {
    const hs1 = apartado(t, "3.4.1. HS 1 Protección frente a la humedad");
    expect(hs1).toContain("los huecos de fachada, cuyas carpinterías se sustituyen");
    expect(hs1).toContain("Los muros y los suelos en contacto con el terreno y la cubierta existentes no se modifican.");
    expect(hs1).toContain("ap. 2.3.3.6 pto 2");
    expect(hs1).not.toContain("Muros del sótano");
    expect(hs1).not.toContain("La cubierta es plana");
  });

  it("HS 3: con la expulsión en fachada, mecánica y el párrafo de flexibilidad", () => {
    expect(evaluarExpediente(reforma()).porClave.hs3?.avisos.map((a) => a.id)).toContain("expulsion-cubierta");
    const p: Proyecto = { ...reforma(), justificaciones: { hs3: { inputs: { expulsion: "fachada", sistema: "hibrida" } } } };
    const ev = evaluarExpediente(p).porClave.hs3!;
    expect(ev.avisos.map((a) => a.id)).toEqual(expect.arrayContaining(["expulsion-hibrida", "expulsion-ordenanza"]));
    const hs3 = apartado(texto(p), "3.4.3. HS 3 Calidad del aire interior");
    expect(hs3).toContain("sistema mecánico");
    expect(hs3).toContain("boca de expulsión en fachada");
    expect(hs3).toContain("se aplica el criterio de flexibilidad de la Parte I del CTE (art. 2.3)");
  });

  it("HS 6: sobre el garaje que no se toca, la barrera en el forjado y el garaje como contención", () => {
    const hs6 = apartado(t, "3.4.6. HS 6 Protección frente a la exposición al radón");
    expect(hs6).toContain("Sobre el garaje, la barrera se dispone en el forjado de planta baja");
    expect(hs6).not.toContain("forjado sanitario");
    expect(hs6).not.toContain("bajo la solera y en los muros");
  });

  it("HS 6: lo que apoya en el terreno, con las soluciones para existentes y la medición posterior", () => {
    const p = reforma();
    // Sin sótano: la vivienda nueva apoya en la solera existente.
    p.edificio = { ...p.edificio, grupos: p.edificio.grupos.filter((g) => g.nivelInicial >= 0) };
    const hs6 = apartado(texto(p), "3.4.6. HS 6 Protección frente a la exposición al radón");
    expect(hs6).toContain("se dispone sobre la solera existente, bajo el pavimento nuevo");
    expect(hs6).toContain("se construye por el interior una cámara de aire de al menos 5 cm");
    expect(hs6).toContain("mediciones de la concentración de radón posteriores a la intervención");
    expect(evaluarExpediente(p).porClave.hs6?.avisos.map((a) => a.id)).toContain("medicion-posterior");
  });
});

describe("SI y SUA (paso 4)", () => {
  const p = reforma();
  const t = texto(p);

  it("SI 3: la ocupación de lo intervenido y, en el portal que se reforma, la del edificio entero", () => {
    const si3 = apartado(t, "3.2.3. SI 3 Evacuación de ocupantes");
    expect(si3).toContain("es de 5 personas");
    expect(si3).toContain("no es preciso aplicar este DB a los elementos comunes de evacuación (DB-SI, Introducción III, criterio 8)");
    expect(si3).toContain("La puerta de salida del edificio, para 40 personas");
    expect(si3).not.toContain("La escalera es");
    expect(si3).not.toContain("garaje");
  });

  it("SI 4: sin dotación propia; lo existente no se modifica", () => {
    const si4 = apartado(t, "3.2.4. SI 4 Instalaciones de protección contra incendios");
    expect(si4).toContain("El interior de la vivienda no es origen de evacuación");
    expect(si4).toContain("las bocas de incendio equipadas del garaje");
    expect(si4).toContain("criterio 10");
    expect(si4).not.toContain("Se dispone bocas de incendio");
  });

  it("SUA 1 se redacta sobre lo intervenido", () => {
    expect(memoriaCte(p).pendientes).toEqual([]);
    const sua1 = apartado(t, "3.3.1. SUA 1 Seguridad frente al riesgo de caídas");
    expect(sua1).toContain("En lo intervenido, el interior de la vivienda es de uso restringido");
    expect(sua1).toContain("no requiere barreras de protección");
    expect(sua1).not.toContain("La cubierta no es transitable");
  });

  it("SUA 8: la obra no cambia la evaluación ni pide pararrayos", () => {
    const sua8 = apartado(t, "3.3.8. SUA 8 Seguridad frente al riesgo causado por la acción del rayo");
    expect(sua8).toContain("la frecuencia esperada de impactos Ne no varía");
    expect(sua8).toContain("se mantiene ese coeficiente, el más desfavorable");
    expect(sua8).not.toContain("es necesaria la instalación");
    expect(evaluarExpediente(p).porClave.sua8?.estado).not.toBe("no_cumple");
  });
});

describe("HE y HR (paso 5)", () => {
  const p = reforma();
  const t = texto(p);

  it("HE 4, HE 5 y HE 6: el no aplica dice por qué en esta obra, con la cifra", () => {
    expect(apartado(t, "3.6.3. HE 4")).toContain("En esta obra, el uso característico del edificio no cambia");
    expect(apartado(t, "3.6.3. HE 4")).toMatch(/de \d+ l\/d antes de la obra y \d+ l\/d después/);
    expect(apartado(t, "3.6.4. HE 5")).toMatch(/de \d+ m² construidos/);
    expect(apartado(t, "3.6.5. HE 6")).toContain("la obra no actúa sobre el aparcamiento");
  });

  it("HR: el forjado con la vivienda de arriba y el local de al lado, leídos del edificio entero", () => {
    const hr = apartado(t, "3.5. Protección frente al ruido DB HR");
    expect(hr).toContain("Forjado entre la vivienda y la vivienda superior existente (viviendas existentes de P1)");
    expect(hr).toContain("se aplica el criterio de flexibilidad de la Parte I del CTE (art. 2.3)");
    expect(hr).toContain("Local sin uso (PB)");
    // La cubierta no está sobre la vivienda nueva, ni el portal reformado es del ámbito del DB-HR.
    expect(hr).not.toContain("Cubierta: plana");
    expect(hr).not.toContain("Portal y escalera (PB), bajo viviendas");
    expect(evaluarExpediente(p).porClave.hr?.avisos.map((a) => a.id)).toContain("impactos-existente");
  });
});

describe("SI 1 en obra existente (cierre)", () => {
  it("la vivienda se integra en el sector del edificio y lo que linda con ella se separa con su resistencia", () => {
    const si1 = apartado(texto(reforma()), "3.2.1. SI 1 Propagación interior");
    expect(si1).toContain("La zona que se transforma en vivienda se integra en el sector de incendio de uso Residencial Vivienda del edificio existente");
    expect(si1).toContain("Local\tComercial\t≤ 2500 m²\t84 m²\tEI 90 · techo REI 90\t");
    expect(si1).not.toContain("El edificio se compartimenta en un único sector");
  });
});
