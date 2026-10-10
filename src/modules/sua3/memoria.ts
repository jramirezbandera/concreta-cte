// =============================================================================
// DB-SUA, SUA 3 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. PURA.
//
// Las cifras (fuerzas de apertura) y lo exigido a cada recinto van en la tabla
// «Parámetro | Norma | Proyecto | Cumple» (feature-31); el texto se queda con
// el porqué: qué puertas son de salida, la excepción de los baños de vivienda,
// el uso público y el método de ensayo.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import { NO_SE_EXIGE, tablaNorma, type FilaNorma } from "../../lib/cte/tablaNorma";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { DetalleSua3, ElementoSua3, JustificacionSua3 } from "./justificacion";
import { APRISIONAMIENTO_SUA3 } from "./tablas";

const T = APRISIONAMIENTO_SUA3.datos;

function elemento<C extends DetalleSua3["clase"]>(j: JustificacionSua3, clase: C): (ElementoSua3 & { detalle: Extract<DetalleSua3, { clase: C }> }) | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el as ElementoSua3 & { detalle: Extract<DetalleSua3, { clase: C }> }) : null;
}

function detalle<C extends DetalleSua3["clase"]>(j: JustificacionSua3, clase: C): Extract<DetalleSua3, { clase: C }> | null {
  return elemento(j, clase)?.detalle ?? null;
}

/** El veredicto del elemento, para la columna «Cumple». */
const ok = (el: ElementoSua3 | null) => (el?.veredicto === "fail" ? "fail" : "ok");

function parrafoBloqueo(j: JustificacionSua3): Trozo[] {
  const b = detalle(j, "bloqueo");
  if (!b) return [];
  const mayus = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  if (b.pestillos === "sin_pestillo") {
    return [`${mayus(lista(b.recintos))} no tienen dispositivo de bloqueo desde el interior, por lo que no existe riesgo de aprisionamiento accidental en ellos (SUA 3, ap. 1 pto 1).`];
  }
  // El desbloqueo y la luz de cada recinto van en la tabla (feature-31): aquí,
  // la condición y la excepción de los baños de vivienda, que es solo la luz (B3.2).
  const p: Trozo[] = [`Las puertas de ${lista(b.recintos)} tienen dispositivo de bloqueo desde el interior`];
  const viviendas = b.recintos.filter((r) => r.includes("viviend"));
  if (viviendas.length > 0) {
    const con = viviendas.length === b.recintos.length ? "con ellos" : "con los baños y aseos de viviendas";
    p.push(`; la excepción que SUA 3 hace ${con} alcanza solo al control de la iluminación desde el interior, no al desbloqueo desde el exterior`);
  }
  p.push(" (SUA 3, ap. 1 pto 1).");
  return p;
}

function parrafoLlamada(j: JustificacionSua3): Trozo[] {
  const l = detalle(j, "llamada");
  // Si se exige o no, en la tabla; aquí, el porqué: solo en zonas de uso público.
  if (!l || !l.publico) {
    return [
      `SUA 3 exige el dispositivo de llamada de asistencia solo en los aseos y cabinas de vestuario accesibles de zonas de uso público, y en el edificio no los hay${j.oficinas ? "" : ", al ser de uso privado todas sus zonas"} (ap. 1 pto 2).`,
    ];
  }
  return [
    "El aseo accesible de las oficinas está en zona de uso público. Su ",
    { v: "dispositivo de llamada de asistencia" },
    " es fácilmente accesible, transmite una llamada perceptible desde un punto de control y permite al usuario verificar que ha sido recibida, o es perceptible desde un paso frecuente de personas (SUA 3, ap. 1 pto 2).",
  ];
}

function parrafoFuerza(j: JustificacionSua3): Trozo[] {
  const f = detalle(j, "fuerza")!;
  // Las fuerzas, en la tabla (feature-31): aquí, qué puertas son de salida
  // (criterio S8), cuáles del itinerario accesible y el método de ensayo.
  const p: Trozo[] = [`${f.salidas.length === 1 ? "La puerta de salida es" : "Son puertas de salida"} ${lista(f.salidas)}`];
  if (f.accesibles.length > 0) {
    p.push(`; se limita además la fuerza de apertura ${lista([...f.accesibles, ...f.resistentes].map((x) => `de ${x}`))}`);
  }
  p.push(
    ` (SUA 3, ap. 1 pto 3${f.accesibles.length > 0 ? "; Anejo A, «Itinerario accesible»" : ""}). La fuerza de apertura se determina según el método de ensayo de ${T.metodoEnsayo} en las puertas manuales con pestillo de media vuelta (ap. 1 pto 4).`,
  );
  return p;
}

/**
 * Desbloqueo y luz de cada recinto, llamada de asistencia y fuerza de apertura
 * por tipo de puerta (feature-31). El proyecto solo declara que cumple: su
 * columna dice lo que se declara.
 */
function tabla(j: JustificacionSua3, tras: number): TablaMemoria | undefined {
  const filas: FilaNorma[] = [];
  const b = elemento(j, "bloqueo");
  if (b) {
    const d = b.detalle;
    for (const r of d.recintos) {
      filas.push(d.pestillos === "desbloqueo" ? [`Desbloqueo de ${r}`, "desde el exterior", "desde el exterior", ok(b)] : [`Desbloqueo de ${r}`, NO_SE_EXIGE, "sin bloqueo interior", ok(b)]);
    }
    // La luz desde dentro solo se exige con bloqueo interior, y nunca en los baños de vivienda.
    if (d.pestillos === "desbloqueo") {
      for (const r of d.recintos) {
        const luz = d.luzInterior.includes(r) ? "desde el interior" : NO_SE_EXIGE;
        filas.push([`Control de la luz de ${r}`, luz, luz, ok(b)]);
      }
    }
  }
  const l = elemento(j, "llamada");
  const publico = l?.detalle.publico ?? false;
  filas.push(["Llamada de asistencia en aseos accesibles", publico ? "se exige" : NO_SE_EXIGE, publico ? "se dispone" : NO_SE_EXIGE, ok(l)]);
  const f = elemento(j, "fuerza");
  if (f) {
    const n = (v: number) => `≤ ${v} N`;
    filas.push(["Fuerza de apertura, puertas de salida", n(T.fuerzaApertura_puertasSalida_maxN), n(T.fuerzaApertura_puertasSalida_maxN), ok(f)]);
    if (f.detalle.accesibles.length > 0) {
      filas.push(["Fuerza de apertura, itinerario accesible", n(T.fuerzaApertura_itinerarioAccesible_maxN), n(T.fuerzaApertura_itinerarioAccesible_maxN), ok(f)]);
      if (f.detalle.resistentes.length > 0) {
        const r = n(T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN);
        filas.push(["Fuerza de apertura, itinerario accesible (resistentes al fuego)", r, r, ok(f)]);
      }
    }
  }
  return tablaNorma(filas, { tras });
}

export function memoriaSua3(j: JustificacionSua3): MemoriaDoc {
  // La tabla, tras los tres párrafos de SUA 3; antes del local sin uso.
  const parrafos = [parrafoBloqueo(j), parrafoLlamada(j), parrafoFuerza(j)].filter((x) => x.length > 0);
  const tras = parrafos.length;
  if (j.local) parrafos.push(["El local sin uso justificará las condiciones de SUA 3 con el proyecto de su actividad."]);
  return {
    titulo: "Seguridad frente al riesgo de aprisionamiento en recintos",
    norma: "DB-SUA 3",
    parrafos,
    tablas: soloTablas(tabla(j, tras)),
    fuente: ["DB-SUA · SUA 3 (consolidado 14-jun-2022)", "ap. 1 y Anejo A", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
