// =============================================================================
// ICT — La memoria redactada (feature-36, paso 3). PURA.
//
// El ámbito y la remisión al proyecto técnico de ICT, que es de otro técnico; la
// tabla de previsiones de la arquitectura («Previsión | Mínimo | Proyecto»,
// K-MEM.21) y la de registros de toma por vivienda tipo. Las cifras van en las
// tablas; el texto dice por qué se aplica y quién dimensiona.
// =============================================================================

import type { MemoriaDoc, TablaMemoria, Trozo } from "../../lib/cte/presentacion";
import { soloTablas } from "../../lib/cte/memoria";
import type { DetalleIct, JustificacionIct } from "./justificacion";
import { CANALIZACION_EXTERNA_ICT, CANALIZACION_PRINCIPAL_ICT, RTR_ICT, TOMAS_ICT, textoMedidas } from "./tablas";
import { desglosePau, NOMBRE_RECINTO, pauTexto, tubosTexto } from "./textos";

const CE = CANALIZACION_EXTERNA_ICT.datos;
const CP = CANALIZACION_PRINCIPAL_ICT.datos;
const RTR = RTR_ICT.datos;
const TO = TOMAS_ICT.datos;

function detalle<K extends DetalleIct["clase"]>(j: JustificacionIct, clase: K): Extract<DetalleIct, { clase: K }> | undefined {
  return j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleIct, { clase: K }> | undefined;
}

function tablaPrevisiones(j: JustificacionIct, tras: number): TablaMemoria {
  const filas: string[][] = [];
  const notas: string[] = [];
  /** La llamada «(n)» a una nota, que se numera en el orden de las celdas. */
  const nota = (t: string) => `(${notas.push(t)})`;
  const pau = detalle(j, "pau");
  if (pau) filas.push(["Puntos de acceso al usuario (PAU)", "—", `${pauTexto(pau.total)}: ${desglosePau(pau)}`]);
  const rec = detalle(j, "recinto");
  if (rec) {
    filas.push([
      rec.recinto === "riti_rits" ? "Recintos de instalaciones (RITI y RITS)" : `Recinto de instalaciones (${NOMBRE_RECINTO[rec.recinto]})`,
      rec.medidas ? `${rec.recinto === "riti_rits" ? "cada uno " : ""}${textoMedidas(rec.medidas)} ${nota("Alto × ancho × profundo (ap. 5.5).")}` : "—",
      rec.admitido ? NOMBRE_RECINTO[rec.recinto] : `${NOMBRE_RECINTO[rec.recinto]}, fuera de su ámbito`,
    ]);
  }
  const arq = detalle(j, "arqueta");
  if (arq) {
    filas.push([
      "Arqueta de entrada",
      arq.medidas ? `${textoMedidas(arq.medidas)} ${nota("Largo × ancho × profundo (ap. 5.1).")}` : "—",
      arq.medidas ? "se reserva" : "la dimensiona el proyecto técnico",
    ]);
  }
  const ce = detalle(j, "canalizacion_externa");
  if (ce) filas.push(["Canalización externa", tubosTexto(ce.tubos, CE.diametro_mm), "se reserva"]);
  const cp = detalle(j, "canalizacion_principal");
  if (cp) filas.push(["Canalización principal (patinillo)", cp.tubos === undefined ? "cálculo específico" : tubosTexto(cp.tubos, CP.diametro_mm), "se reserva"]);
  const rtr = detalle(j, "rtr");
  if (rtr) {
    const n = nota(`Empotrado, con ${RTR.tomasCorriente} tomas de corriente, entre ${RTR.alturaMin_mm} y ${RTR.alturaMax_mm.toLocaleString("es-ES")} mm del suelo (ap. 5.11).`);
    filas.push(["Registro de terminación de red (RTR)", `${textoMedidas(RTR.medidas)} ${n}`, `uno en cada PAU (${rtr.cuantos})`]);
  }
  return {
    rotulo: "Previsiones del proyecto de arquitectura",
    cabecera: ["Previsión", "Mínimo (Anexo III)", "Proyecto"],
    columnas: ["texto", "norma", "proyecto"],
    filas,
    ...(notas.length > 0 ? { notas } : {}),
    tras,
  };
}

function tablaTomas(j: JustificacionIct, tras: number): TablaMemoria | undefined {
  const ds = j.elementos.flatMap((e) => (e.detalle.clase === "tomas" ? [e.detalle] : []));
  if (ds.length === 0) return undefined;
  return {
    rotulo: "Registros de toma por vivienda",
    cabecera: ["Vivienda", "Estancias (1)", "Pares trenzados", "Coaxial", "RTV", "Fibra óptica", "Configurable"],
    columnas: ["texto", "dato", "dato", "dato", "dato", "dato", "dato"],
    filas: ds.map((d) => [
      `${d.nombre}${d.cantidad > 1 ? ` (${d.cantidad})` : ""}`,
      String(d.tomas.estancias),
      String(d.tomas.paresTrenzados),
      String(d.tomas.coaxial),
      String(d.tomas.rtv),
      String(d.tomas.fibra),
      String(d.tomas.configurable),
    ]),
    notas: [
      `Anexo III, ap. 5.13: en ${TO.principales} estancias principales, ${TO.porPrincipal.paresTrenzados} de pares trenzados, ${TO.porPrincipal.coaxial} coaxial y ${TO.porPrincipal.rtv} de RTV en cada una, y fibra óptica en una de ellas; en el resto, sin baños ni trasteros, ${TO.porResto.paresTrenzados} de pares trenzados y ${TO.porResto.rtv} de RTV; uno configurable junto al PAU.`,
    ],
    tras,
  };
}

export function memoriaIct(j: JustificacionIct): MemoriaDoc {
  const parrafos: Trozo[][] = [];
  const proyecto = detalle(j, "proyecto");
  const obra = proyecto?.integral ? "es objeto de rehabilitación integral" : "es de nueva construcción";
  const regimen =
    j.propiedadHorizontal === false
      ? "El edificio no está en régimen de propiedad horizontal"
      : `El edificio ${obra} y está acogido, o debe acogerse, al régimen de propiedad horizontal`;
  parrafos.push([
    `${regimen}: le es de aplicación el Real Decreto-ley 1/1998, sobre infraestructuras comunes en los edificios para el acceso a los servicios de telecomunicación, y su Reglamento, aprobado por el Real Decreto 346/2011.`,
  ]);
  const ref = proyecto?.autor ? `, redactado por ${proyecto.autor}${proyecto.fecha ? ` (${proyecto.fecha})` : ""},` : "";
  parrafos.push([
    `Al proyecto arquitectónico se une el proyecto técnico de ICT${ref} que diseña y dimensiona la infraestructura en coordinación con el autor del proyecto de edificación (RD-ley 1/1998, art. 3.1; Reglamento, art. 9). Este proyecto reserva los recintos, las canalizaciones y los registros siguientes, con las medidas mínimas del Anexo III del Reglamento por número de puntos de acceso al usuario:`,
  ]);
  const trasTablas = parrafos.length;
  return {
    titulo: "Infraestructuras comunes de telecomunicaciones",
    norma: "ICT",
    parrafos,
    tablas: soloTablas(tablaPrevisiones(j, trasTablas), tablaTomas(j, trasTablas)),
    fuente: ["RD-ley 1/1998 · RD 346/2011, Reglamento de ICT (consolidado 26-mar-2025)", "Anexo III, ap. 5", "datos de El edificio y de La obra"].join(" · "),
  };
}
