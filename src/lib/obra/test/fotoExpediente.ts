import { justificacionRegistry } from "../../../data/justificacionRegistry";
import { CASOS_OBRA_NUEVA, edificioDeCaso } from "../../edificio/casos";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Intervencion, JustificacionKey, Proyecto } from "../../proyecto/tipos";
import { evaluarExpediente } from "../evaluar";
import { memoriaCte, textoPlanoMemoriaCte } from "../memoria";
import { anejoInstalaciones, textoPlanoAnejoInstalaciones } from "../anejoInstalaciones";
import { estudioBasico, textoPlanoEstudioBasico } from "../estudioBasico";
import type { EstudioSeguridadSalud } from "../../ebss/tipos";

// =============================================================================
// Foto del expediente (feature-27, paso 8): por proyecto, la aplicabilidad, la
// nota, la cita, el estado y el veredicto de cada justificación, y una huella
// del texto entero de la memoria y, desde feature-33, la del anejo de
// instalaciones y, desde feature-35, la del estudio básico de seguridad y salud
// (con unos datos fijos, para que salga entero). Se genera igual con el código de partida
// (7e576d8) y con el de ahora: obra nueva y las reformas sin asistente deben
// dar lo mismo.
// =============================================================================

/** FNV-1a de 32 bits: huella estable del texto de la memoria. */
function huella(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Lo que declara el proyectista en la foto: una obra pequeña, básico, sin amianto. */
const SEGURIDAD_SALUD: EstudioSeguridadSalud = {
  presupuesto: { pem: 120_000, gg_pct: 13, bi_pct: 6, iva_pct: 10 },
  manoDeObra: { plazoDias: 80, maxTrabajadores: 6 },
  subterraneas: false,
  amianto: { estado: "no_identificado" },
  coordinacion: { variosProyectistas: false, variasEmpresas: true },
  entorno: {
    centroAsistencial: { nombre: "Hospital Regional", direccion: "Av. Carlos Haya s/n", distancia_km: 3.2, tiempo_min: 9 },
    viaPublica: false,
    edificioEnUso: false,
    servicios: { linea_aerea: false, linea_enterrada: false, transformador: false, gas: false, agua: true, saneamiento: true, telecomunicaciones: true },
  },
};
const FIRMA = {
  firmantes: [{ id: "a", nombre: "Ana Pérez", titulacion: "Arquitecta", colegiacion: "Colegiada nº 1" }],
  fecha: "2026-10-18T10:00:00.000Z",
};

const INTERVENCIONES: Intervencion[] = ["obra_nueva", "reforma", "ampliacion", "cambio_uso"];

function proyectos(): [string, Proyecto][] {
  const lista: [string, Proyecto][] = [];
  const base = crearProyectoDemo("2026-10-09T10:00:00.000Z");
  const edificios: [string, () => Proyecto["edificio"]][] = [
    ["demo", () => structuredClone(base.edificio)],
    // Los cuatro casos de partida de antes de feature-27 (sin el ejemplo de reforma).
    ...CASOS_OBRA_NUEVA.map(
      (c): [string, () => Proyecto["edificio"]] => [c, () => edificioDeCaso(c)],
    ),
  ];
  for (const [nombre, edificio] of edificios) {
    for (const intervencion of INTERVENCIONES) {
      for (const tienePiscina of [false, true]) {
        const p: Proyecto = {
          ...structuredClone(base),
          edificio: edificio(),
          justificaciones: nombre === "demo" ? structuredClone(base.justificaciones) : {},
        };
        p.datosGenerales = { ...p.datosGenerales, intervencion, tienePiscina };
        lista.push([`${nombre}|${intervencion}|${tienePiscina ? "piscina" : "sin"}`, p]);
      }
    }
  }
  return lista;
}

export type FotoExpediente = Record<string, Record<string, string>>;

export function fotoExpedientes(): FotoExpediente {
  const foto: FotoExpediente = {};
  for (const [id, p] of proyectos()) {
    const ev = evaluarExpediente(p);
    const fila: Record<string, string> = {};
    for (const e of justificacionRegistry) {
      if (e.dev) continue;
      const j = ev.porClave[e.key as JustificacionKey];
      if (!j) continue;
      fila[e.key] = [j.aplicabilidad, j.estado, j.veredicto ?? "", huella(j.nota ?? ""), j.cita ?? ""].join("|");
    }
    fila.memoria = huella(textoPlanoMemoriaCte(memoriaCte(p)));
    fila.anejo = huella(textoPlanoAnejoInstalaciones(anejoInstalaciones(p)));
    fila.estudioBasico = huella(
      textoPlanoEstudioBasico(estudioBasico({ ...p, seguridadSalud: SEGURIDAD_SALUD }, FIRMA)),
    );
    foto[id] = fila;
  }
  return foto;
}
