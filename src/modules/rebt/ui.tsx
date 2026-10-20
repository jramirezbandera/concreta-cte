// REBT — Pantalla del grado de electrificación y la previsión de cargas
// (feature-23). La pantalla es la común (`PantallaSi`); aquí van las decisiones
// que El edificio no describe: el grado de las viviendas (por superficie o
// elevada por la climatización eléctrica), la plaza en la parcela de la
// unifamiliar sin garaje, la potencia del ascensor y de los demás servicios
// generales, la recarga del vehículo eléctrico (esquema colectivo con SPL o sin
// él, y cuántas plazas) y la potencia del garaje que controla el humo con
// ventiladores. La ventilación del garaje se cambia en HS 3.

import type { JSX } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { CampoNumeroOpcional, CampoOpciones, CampoPlanos, ParaElAnejo } from "../../components/justificacion/ParaElAnejo";
import { conPlanos } from "../../lib/obra/remision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { rebt } from "./definicion";
import type { Climatizacion, Electrificacion, RebtEstado, Spl } from "./estado";
import type { JustificacionRebt } from "./justificacion";
import { CRITERIOS_REBT, GRADO_REBT, PISCINA_REBT } from "./tablas";
import { kW, num, W } from "./textos";

const NOMBRE_CLIMATIZACION: Record<Climatizacion, string> = {
  aire_aire: "Bomba de calor aire-aire",
  aire_agua: "Bomba de calor aire-agua",
  emisores: "Emisores eléctricos",
  ninguna: "Ninguna eléctrica",
};

function DecisionesRebt({ state, setField, j, edificio }: PropsDecisionesSi<RebtEstado, JustificacionRebt>): JSX.Element {
  const { proyecto, actualizarDatosGenerales } = useProyecto();
  const d = j.decisiones;
  const h = j.habituales;
  const s = j.elementos.find((e) => e.id === "servicios")?.detalle;
  const servicios = s && s.clase === "servicios" ? s : null;
  const rc = j.elementos.find((e) => e.id === "recarga")?.detalle;
  const recarga = rc && rc.clase === "recarga" ? rc : null;
  const g = j.elementos.find((e) => e.id === "garaje")?.detalle;
  const garaje = g && g.clase === "garaje" ? g : null;
  const pi = j.elementos.find((e) => e.id === "piscina")?.detalle;
  const piscina = pi && pi.clase === "piscina" ? pi : null;
  const conViviendas = j.viviendas.length > 0;
  const sinGaraje = j.unifamiliar && !edificio.grupos.some((gr) => gr.zonas.some((z) => z.uso === "garaje_privado"));
  const recargaViviendas = recarga?.ambito === "viviendas" ? recarga : null;
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const hasta = {
    electrificacion: conViviendas ? 1 : 0,
    parcela: (conViviendas ? 1 : 0) + (sinGaraje ? 1 : 0),
  };
  const hastaAscensor = hasta.parcela + (servicios?.ascensor ? 1 : 0);
  const hastaOtros = hastaAscensor + (servicios ? 1 : 0);
  const hastaRecarga = hastaOtros + (recargaViviendas ? 1 : 0);
  const n = {
    parcela: hasta.electrificacion + 1,
    ascensor: hasta.parcela + 1,
    otros: hastaAscensor + 1,
    recarga: hastaOtros + 1,
    garaje: hastaRecarga + 1,
    humo: hastaRecarga + 2,
    piscina: hastaRecarga + (garaje ? 1 : 0) + (garaje?.humo ? 1 : 0) + 1,
  };
  const numero = (v: number) => (Number.isFinite(v) && v >= 0 ? v : null);
  const G = GRADO_REBT.datos;

  // ── Para el anejo (feature-34) ────────────────────────────────────────────
  const I = j.instalacion;
  const elevada = conViviendas && d.electrificacion === "elevada";
  const diVivienda = I.derivaciones.filter((l) => l.id.startsWith("di-") && l.proteccion.startsWith("IGA"));
  const lDiEstimada = diVivienda.length > 0 ? Math.max(...diVivienda.map((l) => l.l_m)) : null;
  const opcional = (v: number | undefined) => (v === undefined ? null : v);
  const aire = (v: number | null | undefined) => (v === null ? undefined : v);
  const t = I.tierra;

  const paraElAnejo = (
    <ParaElAnejo>
      <CampoPlanos
        id="rebt-planos"
        valor={proyecto.datosGenerales.planos?.rebt}
        onChange={(v) => actualizarDatosGenerales({ ...proyecto.datosGenerales, planos: conPlanos(proyecto.datosGenerales.planos, "rebt", v) }, new Date().toISOString())}
        ayuda="Los de electricidad, como los numeras («I08–I11», con el unifilar). La memoria remite a ellos y al anejo."
      />
      {elevada && (
        <>
          <div className="border-border-sub border-t pt-3 pb-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-primary text-[13px] font-medium">Climatización</span>
              <span className="text-text-primary text-[13px]">{NOMBRE_CLIMATIZACION[I.equipos.climatizacion]}</span>
            </div>
            <p className="text-text-secondary mt-1.5 text-[12px] leading-normal">
              Sale de{" "}
              <Link to={`/p/${proyecto.id}/he/termicas`} className="text-accent hover:text-accent-hover underline">
                HE 2 · RITE
              </Link>
              , donde se cambia. La aire-aire (split) va en un C9; la aire-agua, en un C8; los radiadores o el suelo radiante eléctricos, en C8 con una toma por estancia (ITC-BT-25). Con la producción centralizada, la bomba de calor está fuera de la vivienda y no lleva circuito.
            </p>
          </div>
          <CampoOpciones<"si" | "no">
            id="rebt-secadora"
            etiqueta="Secadora"
            valor={I.equipos.secadora ? "si" : "no"}
            opciones={[
              { valor: "no", label: "No" },
              { valor: "si", label: "Sí, en un C10" },
            ]}
            onChange={(v) => setField("secadora", v === "si")}
            ayuda="Secadora independiente, con su circuito C10 y su toma en la cocina o el lavadero."
          />
          <CampoOpciones<"si" | "no">
            id="rebt-automatizacion"
            etiqueta="Automatización"
            valor={I.equipos.automatizacion ? "si" : "no"}
            opciones={[
              { valor: "no", label: "No" },
              { valor: "si", label: "Sí, en un C11" },
            ]}
            onChange={(v) => setField("automatizacion", v === "si")}
            ayuda="Automatización, gestión de la energía o seguridad, con su circuito C11."
          />
        </>
      )}
      {I.lga && (
        <CampoNumeroOpcional
          id="rebt-lga"
          etiqueta="Longitud de la línea general"
          valor={aire(state.longitudLga_m)}
          unidad="m"
          onChange={(v) => setField("longitudLga_m", opcional(v))}
          ayuda={`De la caja general de protección a la centralización. Vacío, ${num(I.lga.l_m, 1)} m (estimada).`}
        />
      )}
      {lDiEstimada !== null && (
        <CampoNumeroOpcional
          id="rebt-di"
          etiqueta={j.unifamiliar ? "Longitud de la derivación individual" : "Derivación individual más larga"}
          valor={aire(state.longitudDi_m)}
          unidad="m"
          onChange={(v) => setField("longitudDi_m", opcional(v))}
          ayuda={
            j.unifamiliar
              ? `De la caja de protección y medida al cuadro de la vivienda. Vacío, ${num(lDiEstimada, 1)} m (estimada).`
              : `Se aplica a todas las viviendas, del lado de la seguridad. Vacío, cada una con la suya estimada (la más larga, ${num(lDiEstimada, 1)} m).`
          }
        />
      )}
      {j.unifamiliar && (
        <CampoOpciones<"si" | "no">
          id="rebt-di-enterrada"
          etiqueta="Derivación enterrada"
          valor={state.diEnterrada ? "si" : "no"}
          opciones={[
            { valor: "no", label: "No, empotrada" },
            { valor: "si", label: "Sí, en tubo enterrado" },
          ]}
          onChange={(v) => setField("diEnterrada", v === "si")}
          ayuda="Con la caja de protección y medida en el límite de la parcela, la derivación suele ir enterrada: cable de 0,6/1 kV e intensidades de la ITC-BT-07."
        />
      )}
      {piscina && (
        <CampoOpciones<"si" | "no">
          id="rebt-piscina-alumbrado"
          etiqueta="Alumbrado en el vaso"
          valor={piscina.alumbrado ? "si" : "no"}
          opciones={[
            { valor: "no", label: "No" },
            { valor: "si", label: "Sí, a 12 V" },
          ]}
          onChange={(v) => setField("piscinaAlumbrado", v === "si")}
          ayuda="Focos sumergidos en la zona 0: solo MBTS a 12 V, con el transformador fuera de las zonas 0, 1 y 2, y luminarias de la UNE-EN 60598-2-18 (ITC-BT-31)."
        />
      )}
      {!t.existente && (
        <>
          <CampoNumeroOpcional
            id="rebt-anillo"
            etiqueta="Longitud del anillo de tierra"
            valor={aire(state.perimetroTierra_m)}
            unidad="m"
            onChange={(v) => setField("perimetroTierra_m", opcional(v))}
            ayuda={`El perímetro de la cimentación. Vacío, ${num(t.anillo_m, 1)} m (${t.origenAnillo === "sua8" ? "la planta de SUA 8" : "estimado con la superficie de la cubierta"}).`}
          />
          <CampoNumeroOpcional
            id="rebt-rho"
            etiqueta="Resistividad del terreno"
            valor={aire(state.resistividad_ohm_m)}
            unidad="Ω·m"
            onChange={(v) => setField("resistividad_ohm_m", opcional(v))}
            ayuda="La del estudio geotécnico o la medida. Valores medios de la ITC-BT-18: 50 en terrenos cultivables y húmedos, 500 en terraplenes y 3000 en suelos pedregosos y arenas secas. Vacío, 3000 (supuesta)."
          />
        </>
      )}
    </ParaElAnejo>
  );

  return (
    <>
      <section aria-label="Decisiones" className="flex flex-col">
        <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

        {conViviendas && (
          <Decision<Electrificacion>
            numero={1}
            pregunta="Electrificación de las viviendas"
            opciones={[
              { valor: "superficie", label: "Por superficie" },
              { valor: "elevada", label: "Elevada" },
            ]}
            valor={d.electrificacion}
            habitual={h.electrificacion}
            onChange={(v) => setField("electrificacion", v === h.electrificacion ? "habitual" : v)}
            texto={
              d.electrificacion === "elevada"
                ? `Con calefacción eléctrica o aire acondicionado (la aerotermia lo es), secadora o automatización: ${W(G.elevada_W)} por vivienda, IGA de 40 A.`
                : `Sin climatización eléctrica: básica, ${W(G.basica_W)} (IGA de 25 A), salvo con más de ${G.superficieElevadaMasDe_m2} m² útiles${j.unifamiliar ? " o con garaje (recarga del vehículo eléctrico)" : ""}.`
            }
          />
        )}

        {sinGaraje && (
          <Decision<"si" | "no">
            numero={n.parcela}
            pregunta="Plaza en la parcela"
            opciones={[
              { valor: "no", label: "No" },
              { valor: "si", label: "Sí" },
            ]}
            valor={state.plazaParcela ? "si" : "no"}
            habitual="no"
            onChange={(v) => setField("plazaParcela", v === "si")}
            texto={
              state.plazaParcela
                ? "Con aparcamiento o zona prevista para un vehículo, la vivienda lleva el circuito C13 de recarga (ITC-BT-52 ap. 3.1) y es de electrificación elevada (ITC-BT-10 ap. 5.1)."
                : "Sin garaje en El edificio ni plaza en la parcela, no lleva circuito de recarga."
            }
          />
        )}

        {servicios?.ascensor && (
          <DecisionValor
            numero={n.ascensor}
            pregunta="Potencia del ascensor"
            marca={servicios.ascensor.kWSupuesta ? { texto: "supuesta", aviso: true } : { texto: "indicada" }}
            control={
              <CampoNumero id="rebt-ascensor" etiqueta="Potencia del ascensor" value={servicios.ascensor.kW} unidad="kW" decimales={1} onChange={(v) => setField("ascensor_kW", numero(v))} />
            }
            texto={`La del equipo. Sin ella, ${num(servicios.ascensor.kW, 1)} kW: el ${CRITERIOS_REBT.datos.ascensorHabitual} de la Guía BT-10 (630 kg, 8 personas, 1 m/s).`}
          />
        )}

        {servicios && (
          <DecisionValor
            numero={n.otros}
            pregunta="Otros servicios generales"
            marca={servicios.otrosIndicados ? { texto: "indicados" } : { texto: "sin indicar", aviso: true }}
            control={
              <CampoNumero id="rebt-otros" etiqueta="Otros servicios generales" value={servicios.otros_kW} unidad="kW" decimales={1} onChange={(v) => setField("otrosServicios_kW", numero(v))} />
            }
            texto="Grupo de presión, central térmica o de ACS, ventilación, telecomunicaciones, alumbrado de los trasteros…: lo que se conozca, sin simultaneidad."
          />
        )}

        {recargaViviendas && (
          <Decision<Spl>
            numero={n.recarga}
            pregunta="Recarga del vehículo eléctrico"
            opciones={[
              { valor: "sin_spl", label: "Sin SPL" },
              {
                valor: "con_spl",
                label: "Colectivo con SPL",
                ...(recargaViviendas.colectivo ? {} : { deshabilitada: true, motivo: "El esquema de HE 6 no es el colectivo" }),
              },
            ]}
            valor={recargaViviendas.spl}
            habitual={h.spl}
            onChange={(v) => setField("spl", v === h.spl ? "habitual" : v)}
            esHabitual={d.spl === h.spl && state.plazasRecarga === null}
            extra={
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <label htmlFor="rebt-plazas" className="text-text-secondary text-[12px]">
                  Plazas con previsión
                </label>
                <CampoNumero id="rebt-plazas" value={recargaViviendas.plazasPrevision} unidad="plazas" decimales={1} onChange={(v) => setField("plazasRecarga", numero(v))} />
              </div>
            }
            texto={
              recargaViviendas.spl === "con_spl"
                ? `Esquema colectivo con el sistema que protege la línea general de alimentación (SPL): ${kW(recargaViviendas.p5_W)} × 0,3, y un contador principal más en la centralización.`
                : recargaViviendas.colectivo
                  ? `Sin SPL vale para cualquier esquema: ${kW(recargaViviendas.p5_W)} × 1,0. Mínimo, el 10 % de las ${recargaViviendas.plazas} plazas.`
                  : `El esquema de conexión de HE 6 no es el colectivo: sin SPL, ${kW(recargaViviendas.p5_W)} × 1,0. Mínimo, el 10 % de las ${recargaViviendas.plazas} plazas.`
            }
          />
        )}

        {garaje && (
          <DecisionValor
            numero={n.garaje}
            pregunta="Ventilación del garaje"
            marca={{ texto: "HS 3" }}
            control={<span className="text-text-primary font-mono text-[13px]">{garaje.ventilacion === "forzada" ? "Forzada" : "Natural"}</span>}
            texto={
              <>
                {garaje.ventilacion === "forzada" ? "20 W/m²" : "10 W/m²"}. Se cambia en{" "}
                <Link to={`/p/${proyecto.id}/hs/ventilacion`} className="text-accent hover:text-accent-hover underline">
                  HS 3
                </Link>
                .
              </>
            }
          />
        )}

        {garaje?.humo && (
          <DecisionValor
            numero={n.humo}
            pregunta="Potencia del garaje"
            marca={garaje.estudiada_kW !== null ? { texto: "estudiada" } : { texto: "sin estudiar", aviso: true }}
            control={
              <CampoNumero
                id="rebt-garaje"
                etiqueta="Potencia del garaje"
                value={garaje.estudiada_kW ?? garaje.p_W / 1000}
                unidad="kW"
                decimales={1}
                onChange={(v) => setField("garaje_kW", numero(v))}
              />
            }
            texto={`Con los ventiladores de extracción del humo (150 l/s por plaza), el alumbrado y lo demás: la ITC-BT-10 pide estudiarla. No baja de ${garaje.W_m2} W/m².`}
          />
        )}

        {piscina && (
          <DecisionValor
            numero={n.piscina}
            pregunta="Potencia de la piscina"
            marca={piscina.kW !== null ? { texto: "indicada" } : { texto: "sin indicar", aviso: true }}
            control={
              <CampoNumero id="rebt-piscina" etiqueta="Potencia de la piscina" value={piscina.kW ?? 0} unidad="kW" decimales={1} onChange={(v) => setField("piscina_kW", numero(v))} />
            }
            texto={`Depuradora, alumbrado y demás equipos. Con más de ${PISCINA_REBT.datos.proyectoMasDe_kW} kW precisa proyecto (ITC-BT-04, grupo n); con más de ${PISCINA_REBT.datos.ocaMasDe_kW} kW, inspección por organismo de control (ITC-BT-05).${piscina.comunitaria ? " Suma en los servicios generales: no la cuentes en «otros»." : ""}`}
          />
        )}
      </section>
      {paraElAnejo}
    </>
  );
}

export function RebtModule(): JSX.Element {
  return <PantallaSi def={rebt} Decisiones={DecisionesRebt} />;
}
