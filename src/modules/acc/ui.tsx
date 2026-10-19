// Accesibilidad autonómica — Pantalla (feature-36, paso 5). La pantalla es la
// común (`PantallaSi`). La comunidad sale del municipio, y el régimen de la
// promoción y el ascensor se declaran en La obra y El edificio: aquí solo se
// enseñan. Se escriben la norma, fuera de Andalucía, y la declaración de
// circunstancias de la DA 1.ª en un edificio existente.

import type { JSX } from "react";
import { Link } from "react-router";
import { DecisionValor } from "../../components/justificacion/Decision";
import { CampoTexto } from "../../components/justificacion/ParaElAnejo";
import { NOMBRE_COMUNIDAD } from "../../data/comunidades";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { acc } from "./definicion";
import type { AccEstado } from "./estado";
import type { JustificacionAcc } from "./justificacion";

function DecisionesAcc({ state, setField, j }: PropsDecisionesSi<AccEstado, JustificacionAcc>): JSX.Element {
  const { proyecto } = useProyecto();
  const enlace = (a: string, texto: string) => (
    <Link to={`/p/${proyecto.id}/${a}`} className="text-accent hover:text-accent-hover underline">
      {texto}
    </Link>
  );
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <DecisionValor
        numero={1}
        pregunta="Comunidad autónoma"
        marca={j.comunidad ? { texto: j.andalucia ? "con plantilla" : "sin plantilla" } : { texto: "sin municipio", aviso: true }}
        control={<span className="text-text-primary text-[13px]">{j.comunidad ? NOMBRE_COMUNIDAD[j.comunidad] : "—"}</span>}
        texto={
          j.andalucia ? (
            <>
              Se aplica el Decreto 293/2009. La comunidad sale del municipio de {enlace("datos", "Los datos de la obra")}, donde también va el régimen de la promoción; el ascensor, de{" "}
              {enlace("edificio", "El edificio")}.
            </>
          ) : j.comunidad ? (
            <>La herramienta solo trae la plantilla de Andalucía: declara aquí la norma de esta comunidad, con su referencia.</>
          ) : (
            <>Elige el municipio en {enlace("datos", "Los datos de la obra")}.</>
          )
        }
      />

      {j.comunidad && !j.andalucia && (
        <CampoTexto
          id="acc-norma"
          etiqueta="Norma autonómica"
          valor={state.normaOtra}
          onChange={(v) => setField("normaOtra", v)}
          placeholder="Decreto …/…, de …"
          ancho="w-[220px]"
          ayuda="Con su número, fecha y diario oficial. La memoria remite a ella y a sus fichas; la herramienta no la comprueba."
        />
      )}

      {j.andalucia && j.existente && (
        <CampoTexto
          id="acc-imposibilidad"
          etiqueta="Imposibilidad (DA 1.ª)"
          valor={state.imposibilidad}
          onChange={(v) => setField("imposibilidad", v)}
          placeholder="Art. …, por …"
          ancho="w-[220px]"
          ayuda="Solo si algo no se puede cumplir: los artículos y el motivo (físico, histórico o normativo). Vacío, no se declara."
        />
      )}
    </section>
  );
}

export function AccModule(): JSX.Element {
  return <PantallaSi def={acc} Decisiones={DecisionesAcc} />;
}
