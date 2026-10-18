import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { crearProyectoDemo } from "../../proyecto/demo";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import type { Proyecto } from "../../proyecto/tipos";
import type { EstudioSeguridadSalud } from "../../ebss/tipos";
import { buscarProhibidos } from "../../ebss/prohibidos";
import { fichaPorId, textoItem } from "../../ebss/catalogo";
import { conEdicion } from "../../ebss/propuesta";
import { documentoMemoria } from "../../docx/render";
import { componerMemoriaPdf } from "../../pdf/memoria";
import { ESTUDIO_VACIO, membreteDe } from "../../estudio/estudio";
import { cuadroInicial, memoriaCte } from "../memoria";
import {
  META_ESTUDIO_BASICO,
  bloquesEstudioBasico,
  estudioBasico,
  nombreArchivoEstudioBasico,
  textoPlanoEstudioBasico,
  type EstudioBasico,
} from "../estudioBasico";

// =============================================================================
// feature-35, paso 5: el documento del estudio básico de seguridad y salud.
// =============================================================================

const AHORA = "2026-10-18T10:00:00.000Z";
const FIRMA = { firmantes: [{ id: "a", nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1" }], fecha: AHORA };

/** Lo que declara un proyectista que ha rellenado todo: obra pequeña, básico. */
const COMPLETO_DE_DATOS: EstudioSeguridadSalud = {
  presupuesto: { pem: 120_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 },
  manoDeObra: { plazoDias: 80, maxTrabajadores: 6 },
  subterraneas: false,
  coordinacion: { variosProyectistas: false, variasEmpresas: true },
  entorno: {
    centroAsistencial: { nombre: "Hospital Regional", direccion: "Av. Carlos Haya s/n", distancia_km: 3.2, tiempo_min: 9 },
    viaPublica: false,
    edificioEnUso: false,
    servicios: { linea_aerea: false, linea_enterrada: false, transformador: false, gas: false, agua: true, saneamiento: true, telecomunicaciones: true },
  },
};

function deCaso(caso: CasoEdificio, ss?: EstudioSeguridadSalud): Proyecto {
  const p: Proyecto = { ...crearProyectoDemo(AHORA), edificio: edificioDeCaso(caso), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso(caso) ?? {}), documento: { promotor: "Promotora Ejemplo" } };
  if (ss) p.seguridadSalud = ss;
  return p;
}

const conSs = (p: Proyecto, ss: EstudioSeguridadSalud): Proyecto => ({ ...p, seguridadSalud: { ...(p.seguridadSalud ?? {}), ...ss } });

const CASOS: [string, () => Proyecto][] = [
  ["el Demo", () => conSs(crearProyectoDemo(AHORA), { ...COMPLETO_DE_DATOS, amianto: { estado: "no_identificado" } })],
  ["unifamiliar", () => deCaso("unifamiliar", COMPLETO_DE_DATOS)],
  ["plurifamiliar", () => deCaso("plurifamiliar", COMPLETO_DE_DATOS)],
  ["reforma_local_vivienda", () => deCaso("reforma_local_vivienda", { ...COMPLETO_DE_DATOS, amianto: { estado: "posible", ubicacion: "bajantes del patio", friable: false } })],
];

const apartado = (e: EstudioBasico, n: number) => {
  const a = e.apartados.find((x) => x.numero === n);
  if (!a) throw new Error(`no hay apartado ${n}`);
  return a;
};
/** El texto de un apartado: párrafos, pendientes, notas y celdas. */
const textoDe = (e: EstudioBasico, n: number): string =>
  apartado(e, n)
    .bloques.map((b) => (b.tipo === "tabla" ? [b.rotulo ?? "", ...b.cabecera, ...b.filas.flat(), ...(b.notas ?? [])].join("\n") : b.texto))
    .join("\n");
const tablas = (e: EstudioBasico, n: number) => apartado(e, n).bloques.flatMap((b) => (b.tipo === "tabla" ? [b] : []));

describe("el documento en los casos de partida", () => {
  it.each(CASOS)("%s: los apartados de 1 a 14, con los datos generales delante", (_n, crear) => {
    const e = estudioBasico(crear(), FIRMA);
    expect(e.art4.resultado).toBe("basico");
    expect(e.apartados.map((a) => a.numero)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const b = bloquesEstudioBasico(e);
    expect(b[0]).toEqual({ tipo: "titulo", nivel: 1, texto: "Estudio básico de seguridad y salud" });
    expect(b.filter((x) => x.tipo === "titulo" && x.nivel === 2).map((x) => (x as { texto: string }).texto)).toEqual([
      "Datos generales",
      "1. Justificación del estudio básico",
      "2. Objeto",
      "3. Emplazamiento, entorno y servicios afectados",
      "4. Descripción de la obra y organización",
      "5. Normas de seguridad y salud aplicables",
      "6. Implantación, instalaciones provisionales y servicios higiénicos",
      "7. Riesgos evitables y medidas para evitarlos",
      "8. Riesgos no eliminables: medidas, protecciones y eficacia",
      "9. Otras actividades en el lugar",
      "10. Trabajos con riesgos especiales (anexo II) y recurso preventivo",
      "11. Identificación de materiales con amianto",
      "12. Trabajos posteriores: previsiones e informaciones útiles",
      "13. Obligaciones durante la obra",
      "14. Firma",
    ]);
  });

  it.each(CASOS)("%s: ni una palabra de la lista de prohibidos", (_n, crear) => {
    expect(buscarProhibidos(textoPlanoEstudioBasico(estudioBasico(crear(), FIRMA)))).toEqual([]);
  });

  it.each(CASOS)("%s: nada que sea para el proyectista ni para trazar", (_n, crear) => {
    const t = textoPlanoEstudioBasico(estudioBasico(crear(), FIRMA));
    expect(t).not.toMatch(/redactada por la app|Ficha débil|K-SYS|decisión \d|análisis §|\bss\d\d\b|\(ver [A-Z]+\d+\)/);
  });

  it.each(CASOS)("%s: ningún apartado vacío", (_n, crear) => {
    for (const a of estudioBasico(crear(), FIRMA).apartados) expect(a.bloques.length, `${a.numero}`).toBeGreaterThan(0);
  });

  it("con todos los datos, la unifamiliar no tiene pendientes de datos", () => {
    expect(estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA).pendientes).toEqual([]);
  });

  it("la reforma: amianto, demolición y apertura de huecos; sin cimentación ni cubierta", () => {
    const e = estudioBasico(CASOS[3][1](), FIRMA);
    const t4 = textoDe(e, 4);
    expect(t4).toMatch(/Demolición manual/);
    expect(t4).toMatch(/Apertura de huecos en muros de carga/);
    expect(t4).not.toMatch(/Cimentación|Cubierta inclinada|Cubierta plana o azotea/);
    expect(textoDe(e, 11)).toMatch(/Puede haber materiales con amianto: bajantes del patio, de tipo no friable/);
    expect(textoDe(e, 11)).toMatch(/RERA/);
    // F40 es una ficha redactada por la app: sin revisar, va a pendientes.
    expect(e.pendientes.some((x) => /Apertura de huecos/.test(x))).toBe(true);
  });

  it("el Word se arma con los bloques del estudio", async () => {
    const e = estudioBasico(CASOS[1][1](), FIRMA);
    const blob = await Packer.toBlob(documentoMemoria(bloquesEstudioBasico(e), membreteDe(ESTUDIO_VACIO, CASOS[1][1]()), META_ESTUDIO_BASICO));
    expect(blob.size).toBeGreaterThan(10_000);
  });

  it("el PDF se compone con los mismos bloques, en varias hojas", () => {
    const p = CASOS[3][1]();
    const doc = componerMemoriaPdf(bloquesEstudioBasico(estudioBasico(p, FIRMA)), membreteDe(ESTUDIO_VACIO, p));
    expect(doc.getNumberOfPages()).toBeGreaterThan(10);
  });

  it("nombre de archivo", () => {
    expect(nombreArchivoEstudioBasico("Vivienda C/ Mayor 12", "docx")).toBe("estudio-basico-ss-vivienda-c-mayor-12.docx");
  });
});

describe("1. Justificación (art. 4)", () => {
  it("básico: tabla de supuestos, PEC desglosado y compromiso del promotor", () => {
    const e = estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA);
    const [pec, sup] = tablas(e, 1);
    expect(pec.filas.at(-1)).toEqual(["Presupuesto de ejecución por contrata (PEC)", "157.080,00 €"]);
    expect(sup.cabecera).toEqual(["Supuesto", "Umbral", "Proyecto", "¿Se supera?"]);
    expect(sup.filas.map((f) => f[3])).toEqual(["No", "No", "No", "No"]);
    expect(textoDe(e, 1)).toMatch(/estudio básico de seguridad y salud \(art\. 4\.2\), que es este documento/);
    expect(textoDe(e, 1)).toMatch(/El promotor se compromete/);
    expect(textoDe(e, 1)).not.toMatch(/visar|Decreto 1627\/1997/);
  });

  it("con el PEC cerca del umbral, avisa", () => {
    const ss = { ...COMPLETO_DE_DATOS, presupuesto: { pem: 312_672.94, gg_pct: 13, bi_pct: 6, iva_pct: 21 } };
    expect(textoDe(estudioBasico(deCaso("unifamiliar", ss), FIRMA), 1)).toMatch(/queda a 541,31 € del umbral/);
  });

  it("completo: solo la justificación, sin redactar el estudio básico", () => {
    const ss = { ...COMPLETO_DE_DATOS, presupuesto: { pem: 400_000, gg_pct: 13, bi_pct: 6, iva_pct: 21 } };
    const e = estudioBasico(deCaso("plurifamiliar", ss), FIRMA);
    expect(e.art4.resultado).toBe("completo");
    expect(e.apartados.map((a) => a.numero)).toEqual([1]);
    expect(textoDe(e, 1)).toMatch(/Se da el supuesto a\) del art\. 4\.1/);
    expect(textoDe(e, 1)).toMatch(/que este estudio básico no sustituye/);
    expect(apartado(e, 1).bloques.some((b) => b.tipo === "pendiente")).toBe(true);
    expect(textoDe(e, 1)).not.toMatch(/El promotor se compromete/);
    expect(e.pendientes).toHaveLength(1);
    expect(e.pendientes[0]).toMatch(/hace falta el estudio de seguridad y salud/);
  });

  it("sin datos: pendiente, con lo que falta en su apartado y en la lista", () => {
    const e = estudioBasico(deCaso("unifamiliar"), FIRMA);
    expect(e.art4.resultado).toBe("pendiente");
    const pend = apartado(e, 1).bloques.filter((b) => b.tipo === "pendiente").map((b) => (b as { texto: string }).texto);
    expect(pend.some((x) => /PEM/.test(x))).toBe(true);
    expect(pend.some((x) => /plazo/.test(x))).toBe(true);
    expect(e.pendientes.some((x) => /centro asistencial/.test(x))).toBe(true);
    // Datos generales sin presupuesto ni plazo: «Sin declarar», no un valor supuesto.
    const filas = tablas(e, 0)[0].filas;
    expect(filas.find((f) => f[0] === "Duración prevista")?.[1]).toBe("Sin declarar");
    expect(filas.find((f) => f[0] === "Presupuesto de ejecución por contrata")?.[1]).toBe("Sin calcular");
  });
});

describe("fichas: riesgos evitables y no eliminables", () => {
  const uni = () => deCaso("unifamiliar", COMPLETO_DE_DATOS);

  it("la ficha va a cuatro columnas, con tantas filas como la lista más larga", () => {
    const e = estudioBasico(uni(), FIRMA);
    const f14 = fichaPorId("F14")!;
    const t = tablas(e, 8).find((x) => x.rotulo === f14.titulo)!;
    expect(t.cabecera).toEqual(["Riesgo", "Medidas preventivas", "Protecciones colectivas", "EPI"]);
    expect(t.filas).toHaveLength(Math.max(f14.riesgos.length, f14.medidas.length, f14.protecciones.length, f14.epi.length));
    expect(textoDe(e, 8)).toContain(`Eficacia: ${f14.eficacia}.`);
  });

  it("los evitables salen en el 7 y no en su ficha", () => {
    const e = estudioBasico(uni(), FIRMA);
    const t7 = textoDe(e, 7);
    expect(t7).toMatch(/No trabajar en el exterior con viento fuerte/);
    expect(t7).toMatch(/Conectar siempre sin tensión/);
    expect(textoDe(e, 8)).not.toMatch(/No trabajar en el exterior con viento fuerte|Conectar siempre sin tensión/);
  });

  it("una medida evitable que el proyectista quita sale del 7", () => {
    const p = uni();
    const f22 = fichaPorId("F22")!;
    const sinTension = f22.medidas.map(textoItem).find((x) => /sin tensión/.test(x))!;
    p.seguridadSalud = { ...p.seguridadSalud, seleccion: conEdicion(undefined, "F22", { medidas: { quitados: [sinTension] } }) };
    expect(textoDe(estudioBasico(p, FIRMA), 7)).not.toMatch(/Conectar siempre sin tensión/);
  });

  it("F0 lleva la frecuencia entre paréntesis; las demás, no", () => {
    const e = estudioBasico(uni(), FIRMA);
    const f0 = tablas(e, 8).find((x) => x.rotulo === fichaPorId("F0")!.titulo)!;
    expect(f0.filas[0][1]).toBe("Orden y limpieza (permanente)");
    expect(textoDe(e, 8).match(/\((permanente|frecuente|ocasional)\)/g)!.length).toBeGreaterThan(0);
  });

  it("las fichas de instalaciones provisionales van al 6 y los trabajos posteriores al 12", () => {
    const e = estudioBasico(uni(), FIRMA);
    expect(tablas(e, 6).some((t) => t.rotulo === fichaPorId("IP4")!.titulo)).toBe(true);
    expect(tablas(e, 8).some((t) => t.rotulo === fichaPorId("IP4")!.titulo)).toBe(false);
    expect(textoDe(e, 12)).toMatch(/Mantenimiento de cubiertas/);
    expect(textoDe(e, 12)).toMatch(/Libro del Edificio/);
  });
});

describe("6. Servicios higiénicos y primeros auxilios", () => {
  const conTrabajadores = (n: number, extra: Partial<EstudioSeguridadSalud> = {}) =>
    estudioBasico(deCaso("plurifamiliar", { ...COMPLETO_DE_DATOS, manoDeObra: { plazoDias: 20, maxTrabajadores: n }, ...extra }), FIRMA);

  it("la dotación del VII Convenio con n trabajadores a la vez", () => {
    const t = tablas(conTrabajadores(12), 6).find((x) => x.rotulo?.startsWith("Dotación"))!;
    expect(t.filas.map((f) => f[2])).toEqual(["2", "2", "1"]);
  });

  it("local de primeros auxilios solo con más de 50", () => {
    expect(textoDe(conTrabajadores(50), 6)).not.toMatch(/la obra dispone de un local de primeros auxilios/);
    expect(textoDe(conTrabajadores(51), 6)).toMatch(/la obra dispone de un local de primeros auxilios/);
  });

  it("la solución alternativa, solo si se declara obra corta", () => {
    expect(textoDe(conTrabajadores(3, { serviciosHigienicos: { cortaDuracion: true, alternativa: "aseo de la vivienda, cedido por el promotor" } }), 6)).toMatch(
      /solución alternativa \(VII Convenio, art\. 231\.4\): aseo de la vivienda, cedido por el promotor\./,
    );
    expect(textoDe(conTrabajadores(3), 6)).not.toMatch(/solución alternativa \(VII Convenio/);
  });

  it("el botiquín sin la Orden TAS/2947/2007 y los primeros auxilios del anexo IV A.14", () => {
    const t = textoDe(conTrabajadores(6), 6);
    expect(t).toMatch(/anexo IV, parte A, apartado 14 a y d/);
    expect(t).not.toMatch(/TAS\/2947|486\/1997/);
  });
});

describe("10. Anexo II: nunca vacío", () => {
  it("la unifamiliar: apartado 1 por el andamio y la cubierta", () => {
    const e = estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA);
    const t = tablas(e, 10)[0];
    expect(t.filas[0][0]).toMatch(/^1\. /);
    expect(t.filas[0][1]).toMatch(/Andamio tubular o modular de fachada/);
    expect(textoDe(e, 10)).toMatch(/recurso preventivo/);
    // Sin líneas aéreas, el apartado 4 no se da.
    expect(t.filas.some((f) => f[0].startsWith("4. "))).toBe(false);
  });

  it("con una línea de alta tensión declarada, el 4 sin condición y las distancias en el 3", () => {
    const ss: EstudioSeguridadSalud = {
      ...COMPLETO_DE_DATOS,
      entorno: { ...COMPLETO_DE_DATOS.entorno, servicios: { ...COMPLETO_DE_DATOS.entorno!.servicios, linea_aerea: true }, tensionLineas_kV: 20 },
    };
    const e = estudioBasico(deCaso("unifamiliar", ss), FIRMA);
    const fila4 = tablas(e, 10)[0].filas.find((f) => f[0].startsWith("4. "))!;
    expect(fila4[1]).toMatch(/Línea eléctrica aérea de 20 kV/);
    expect(fila4[1]).not.toMatch(/si hay una línea/);
    expect(textoDe(e, 3)).toMatch(/0,72 m .* 3,00 m/s);
    expect(textoDe(e, 7)).toMatch(/Desviar la línea aérea/);
  });

  it("sin ninguno, «no se prevén» con el motivo", () => {
    const p = deCaso("reforma_local_vivienda", { ...COMPLETO_DE_DATOS, amianto: { estado: "no_identificado" } });
    // Se quitan las fichas que activan el anexo II.
    p.seguridadSalud = { ...p.seguridadSalud, seleccion: { quitadas: ["F1", "F40", "IP3"] } };
    const e = estudioBasico(p, FIRMA);
    expect(tablas(e, 10)).toHaveLength(0);
    expect(textoDe(e, 10)).toMatch(/^No se prevén trabajos del anexo II/);
    expect(tablas(e, 0)[0].filas.find((f) => f[0] === "Trabajos del anexo II")?.[1]).toBe("No se prevén (ver apartado 10)");
  });

  it("amianto no identificado quita el 2 de la demolición; posible lo pone", () => {
    const no = estudioBasico(deCaso("reforma_local_vivienda", { ...COMPLETO_DE_DATOS, amianto: { estado: "no_identificado" } }), FIRMA);
    expect(tablas(no, 10)[0].filas.some((f) => f[0].startsWith("2. "))).toBe(false);
    const si = estudioBasico(CASOS[3][1](), FIRMA);
    expect(tablas(si, 10)[0].filas.find((f) => f[0].startsWith("2. "))?.[1]).toMatch(/Materiales con amianto/);
  });
});

describe("11. Amianto", () => {
  it("obligatorio en edificio existente: sin declarar, pendiente", () => {
    const e = estudioBasico(deCaso("reforma_local_vivienda", COMPLETO_DE_DATOS), FIRMA);
    expect(apartado(e, 11).bloques.some((b) => b.tipo === "pendiente")).toBe(true);
    expect(e.pendientes.some((x) => /amianto/.test(x))).toBe(true);
  });

  it("obra nueva sin derribo: no procede", () => {
    expect(textoDe(estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA), 11)).toMatch(/no procede la identificación/);
  });

  it("sin valores límite", () => {
    expect(textoDe(estudioBasico(CASOS[3][1](), FIRMA), 11)).not.toMatch(/fibras|f\/cm/);
  });
});

describe("el resto de apartados", () => {
  it("5: las normas de grúas, solo con la grúa", () => {
    const sin = textoDe(estudioBasico(deCaso("reforma_local_vivienda", COMPLETO_DE_DATOS), FIRMA), 5);
    expect(sin).not.toMatch(/836\/2003|837\/2003/);
    const con = textoDe(estudioBasico(deCaso("reforma_local_vivienda", { ...COMPLETO_DE_DATOS, medios: { gruaTorre: true } }), FIRMA), 5);
    expect(con).toMatch(/836\/2003/);
    expect(con).not.toMatch(/486\/1997|TAS\/2947|TAS\/2926/);
  });

  it("9: «no se prevén» con el motivo, o las actividades que hay", () => {
    const ss = { ...COMPLETO_DE_DATOS, coordinacion: { variosProyectistas: false, variasEmpresas: false } };
    expect(textoDe(estudioBasico(deCaso("unifamiliar", ss), FIRMA), 9)).toMatch(/^No se prevén otras actividades en el lugar: es una obra nueva/);
    const enUso = { ...COMPLETO_DE_DATOS, entorno: { ...COMPLETO_DE_DATOS.entorno, edificioEnUso: true } };
    expect(textoDe(estudioBasico(deCaso("reforma_local_vivienda", enUso), FIRMA), 9)).toMatch(/sigue en uso durante la obra/);
  });

  it("13: comunicación de apertura y libro de incidencias corregidos; cabeza de familia solo si procede", () => {
    const t = textoDe(estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA), 13);
    expect(t).toMatch(/comunicación de apertura del centro de trabajo antes del comienzo de los trabajos/);
    expect(t).toMatch(/solo cuando una anotación se refiere a un incumplimiento/);
    expect(t).not.toMatch(/art\. 2\.3/);
    const cf = { ...COMPLETO_DE_DATOS, coordinacion: { ...COMPLETO_DE_DATOS.coordinacion, cabezaFamilia: true } };
    expect(textoDe(estudioBasico(deCaso("unifamiliar", cf), FIRMA), 13)).toMatch(/art\. 2\.3/);
  });

  it("14: lugar, fecha y firmantes; sin firmantes, pendiente", () => {
    const e = estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA);
    expect(textoDe(e, 14)).toMatch(/a 18 de octubre de 2026\./);
    expect(textoDe(e, 14)).toMatch(/Ana Pérez, Arquitecta/);
    const sin = estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS));
    expect(textoDe(sin, 14)).toMatch(/en la fecha de la firma/);
    expect(apartado(sin, 14).bloques.some((b) => b.tipo === "pendiente")).toBe(true);
    expect(sin.pendientes).toContain("Falta quién firma (los datos del estudio).");
  });

  it("datos generales: coordinadores con su motivo y autor del estudio", () => {
    const e = estudioBasico(deCaso("unifamiliar", COMPLETO_DE_DATOS), FIRMA);
    const filas = tablas(e, 0)[0].filas;
    expect(filas.find((f) => f[0] === "Coordinador durante la elaboración del proyecto")?.[1]).toBe("No procede");
    expect(filas.find((f) => f[0] === "Coordinador durante la ejecución de la obra")?.[1]).toBe("Procede");
    expect(filas.find((f) => f[0] === "Autor del estudio básico")?.[1]).toMatch(/Ana Pérez, Arquitecta, técnico competente/);
    expect(textoDe(e, 0)).toMatch(/art\. 3\.2/);
  });
});

describe("la memoria remite a los estudios (decisión 9)", () => {
  it("el cuadro inicial lleva la línea del estudio básico", () => {
    const m = memoriaCte(deCaso("unifamiliar", COMPLETO_DE_DATOS));
    expect(cuadroInicial(m).at(-1)).toEqual({
      tipo: "parrafo",
      texto: "El estudio básico de seguridad y salud y el estudio de gestión de residuos se presentan como documentos aparte.",
    });
  });

  it("con el completo, el estudio de seguridad y salud", () => {
    const ss = { ...COMPLETO_DE_DATOS, presupuesto: { pem: 400_000, gg_pct: 13, bi_pct: 6, iva_pct: 21 } };
    expect(memoriaCte(deCaso("unifamiliar", ss)).remisionEstudios).toMatch(/^El estudio de seguridad y salud y/);
  });
});
