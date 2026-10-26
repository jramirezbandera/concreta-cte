import { describe, expect, it } from "vitest";
import { crearProyectoDemoConSupuestos } from "../../proyecto/demo";
import { edificioDeCaso } from "../../edificio/casos";
import { obraDeCaso } from "../../proyecto/alcance";
import type { Proyecto } from "../../proyecto/tipos";
import type { EstudioSeguridadSalud } from "../../ebss/tipos";
import { conEdicion } from "../../ebss/propuesta";
import { antesDeEntregar, CLAVE_SEGURIDAD_SALUD, entregables } from "../entrega";
import { estudioBasico, pendientesEstudioBasico } from "../estudioBasico";

// =============================================================================
// feature-35, paso 6: el estudio básico en «Antes de entregar» y en Lo que se
// entrega.
// =============================================================================

const AHORA = "2026-10-18T10:00:00.000Z";

const COMPLETO: EstudioSeguridadSalud = {
  presupuesto: { pem: 120_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 },
  manoDeObra: { plazoDias: 80, maxTrabajadores: 6 },
  subterraneas: false,
  coordinacion: { variosProyectistas: false, variasEmpresas: true },
  entorno: {
    centroAsistencial: { nombre: "Hospital Regional", distancia_km: 3.2, tiempo_min: 9 },
    viaPublica: false,
    edificioEnUso: false,
    servicios: { linea_aerea: false, linea_enterrada: false, transformador: false, gas: false, agua: true, saneamiento: true, telecomunicaciones: true },
  },
};

function reforma(ss?: EstudioSeguridadSalud): Proyecto {
  const p: Proyecto = { ...crearProyectoDemoConSupuestos(AHORA), edificio: edificioDeCaso("reforma_local_vivienda"), justificaciones: {} };
  p.datosGenerales = { ...p.datosGenerales, ...(obraDeCaso("reforma_local_vivienda") ?? {}), documento: { promotor: "Promotora Ejemplo" } };
  // Abre un hueco en un muro de carga: así propone la apertura de huecos, una ficha redactada por la app.
  p.datosGenerales.alcance = { ...p.datosGenerales.alcance, estructura: true };
  if (ss) p.seguridadSalud = ss;
  return p;
}

const ebss = (p: Proyecto) => antesDeEntregar(p).filter((x) => x.key === CLAVE_SEGURIDAD_SALUD);

describe("el estudio básico en «Antes de entregar»", () => {
  it("sin empezar, no llena la lista", () => {
    expect(ebss(reforma())).toEqual([]);
    expect(ebss(crearProyectoDemoConSupuestos(AHORA))).toEqual([]);
  });

  it("empezado y vacío: los datos que nombra el plan, uno a uno, y el resto en una línea", () => {
    const l = ebss(reforma({}));
    expect(l.map((x) => x.id)).toEqual([
      "seguridadSalud:pem",
      "seguridadSalud:plazo",
      "seguridadSalud:trabajadores",
      "seguridadSalud:centro",
      "seguridadSalud:amianto",
      // Las fichas redactadas por la app que propone la reforma, sin revisar.
      ...l.filter((x) => x.id.startsWith("seguridadSalud:ficha:")).map((x) => x.id),
      "seguridadSalud:resto",
    ]);
    expect(l.filter((x) => x.id.startsWith("seguridadSalud:ficha:")).length).toBeGreaterThan(0);
    expect(l.every((x) => x.tipo === "revisar" && x.ruta === "seguridad-salud" && x.codigo === "Seguridad y salud")).toBe(true);
    expect(l.at(-1)!.titulo).toMatch(/^Quedan \d+ cosas más por completar/);
    // Los firmantes no: ya tienen su aviso, el de «Tu estudio».
    expect(l.some((x) => /firma/.test(x.titulo + x.detalle))).toBe(false);
  });

  it("con todo declarado y las fichas revisadas, no queda nada", () => {
    let p = reforma({ ...COMPLETO, amianto: { estado: "no_identificado" } });
    const sinRevisar = ebss(p).filter((x) => x.id.startsWith("seguridadSalud:ficha:"));
    let sel = p.seguridadSalud!.seleccion;
    for (const x of sinRevisar) sel = conEdicion(sel, x.id.split(":")[2], { revisada: true });
    p = { ...p, seguridadSalud: { ...p.seguridadSalud, seleccion: sel } };
    expect(ebss(p)).toEqual([]);
    // El documento solo echa en falta quién firma, que es del estudio.
    expect(pendientesEstudioBasico(p).map((d) => d.id)).toEqual(["firmantes"]);
  });

  it("si se supera un supuesto del art. 4.1, en rojo y solo eso", () => {
    const l = ebss(reforma({ ...COMPLETO, presupuesto: { pem: 500_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 } }));
    expect(l).toHaveLength(1);
    expect(l[0]).toMatchObject({ tipo: "no_cumple", titulo: "Hace falta el estudio de seguridad y salud completo." });
    expect(l[0].detalle).toMatch(/supuesto a\)/);
  });

  it("el PEC cerca del umbral, en ámbar (decisión 4)", () => {
    // 330.000 × 1,19 × 1,10 = 431.970 €: a un 4,17 % del umbral.
    const l = ebss(reforma({ ...COMPLETO, amianto: { estado: "no_identificado" }, presupuesto: { pem: 330_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 } }));
    expect(l[0]).toMatchObject({ id: "seguridadSalud:pec-cerca", tipo: "revisar" });
    expect(l[0].detalle).toMatch(/450\.759,08 €/);
  });
});

describe("el estudio básico en Lo que se entrega", () => {
  it("cuenta los apartados sin pendientes; sin firmantes, la firma cuenta como lista", () => {
    const p = reforma({ ...COMPLETO, amianto: { estado: "no_identificado" } });
    const r = entregables(p).seguridadSalud;
    expect(r).toMatchObject({ total: 15, resultado: "basico", empezado: true, noCumplen: [] });
    expect(r.listos).toBe(estudioBasico(p).apartados.filter((a) => a.bloques.every((b) => b.tipo !== "pendiente" || /quién firma/.test(b.texto))).length);
    expect(r.listos).toBe(15);
  });

  it("con el estudio completo, nada listo", () => {
    const r = entregables(reforma({ ...COMPLETO, subterraneas: true })).seguridadSalud;
    expect(r).toMatchObject({ listos: 0, total: 1, resultado: "completo" });
  });
});
