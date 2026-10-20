// HE 2 · RITE — Pantalla (feature-36, paso 4). La pantalla es la común
// (`PantallaSi`); aquí van las decisiones: el generador de calefacción y sus
// emisores, la refrigeración, la producción individual o centralizada y si el
// ACS sale de la misma máquina; y las potencias y rendimientos del fabricante.
// El ACS (sistema, producción y apoyo) se declara en HE 4 y aquí solo se enseña.

import type { JSX } from "react";
import { Link } from "react-router";
import { Decision } from "../../components/justificacion/Decision";
import { CampoNumeroOpcional, CampoOpciones } from "../../components/justificacion/ParaElAnejo";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { rite } from "./definicion";
import { esBombaDeCalor, positivo, type Calefaccion, type Emisores, type ProduccionClima, type Refrigeracion, type RiteEstado } from "./estado";
import type { JustificacionRite } from "./justificacion";
import { NOMBRE_CALEFACCION, NOMBRE_EMISORES, textoAcs } from "./textos";

const CALEFACCIONES: Calefaccion[] = ["aire_aire", "aire_agua", "caldera", "biomasa", "red", "electrica", "ninguna"];
const EMISORES: Emisores[] = ["splits", "conductos", "suelo_radiante", "radiadores", "fancoils"];
const mayuscula = (s: string) => s[0].toUpperCase() + s.slice(1);

function DecisionesRite({ state, setField, j }: PropsDecisionesSi<RiteEstado, JustificacionRite>): JSX.Element {
  const { proyecto } = useProyecto();
  const d = j.decisiones;
  const h = j.habituales;
  const aire = (v: unknown) => positivo(v) ?? undefined;
  const he4 = (
    <Link to={`/p/${proyecto.id}/he/acs`} className="text-accent hover:text-accent-hover underline">
      HE 4
    </Link>
  );
  const individual = d.produccion === "individual" && !j.unifamiliar;
  const refrigeraciones: { valor: Refrigeracion; label: string }[] = [
    ...(esBombaDeCalor(d.calefaccion) ? [{ valor: "misma" as const, label: "La misma" }] : []),
    { valor: "aire_aire", label: "Aire-aire" },
    { valor: "ninguna", label: "Ninguna" },
  ];
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const nAcs = j.unifamiliar ? 2 : 3;
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <CampoOpciones<Calefaccion>
        id="rite-calefaccion"
        etiqueta="Calefacción"
        valor={d.calefaccion}
        opciones={CALEFACCIONES.map((c) => ({ valor: c, label: mayuscula(NOMBRE_CALEFACCION[c]) }))}
        onChange={(v) => setField("calefaccion", v === h.calefaccion ? "habitual" : v)}
        ayuda={`${d.calefaccion === h.calefaccion ? "Lo habitual." : `Lo habitual: ${NOMBRE_CALEFACCION[h.calefaccion]}.`} El REBT lee de aquí la climatización eléctrica de las viviendas.`}
      />
      {d.calefaccion !== "ninguna" && (
        <CampoOpciones<Emisores>
          id="rite-emisores"
          etiqueta="Emisores"
          valor={d.emisores}
          opciones={EMISORES.map((e) => ({ valor: e, label: mayuscula(NOMBRE_EMISORES[e]) }))}
          onChange={(v) => setField("emisores", v === h.emisores ? "habitual" : v)}
          ayuda={d.emisores === h.emisores ? "Lo habitual con este generador." : `Lo habitual con este generador: ${NOMBRE_EMISORES[h.emisores]}.`}
        />
      )}

      <Decision<Refrigeracion>
        numero={1}
        pregunta="Refrigeración"
        opciones={refrigeraciones}
        valor={d.refrigeracion}
        habitual={h.refrigeracion}
        onChange={(v) => setField("refrigeracion", v === h.refrigeracion ? "habitual" : v)}
        texto="«La misma»: la bomba de calor es reversible y se compara la mayor de las potencias de calor y de frío (art. 15.1, interpretación)."
      />

      {!j.unifamiliar && (
        <Decision<ProduccionClima>
          numero={2}
          pregunta="Producción"
          opciones={[
            { valor: "individual", label: "Individual" },
            { valor: "centralizada", label: "Centralizada" },
          ]}
          valor={d.produccion}
          habitual={h.produccion}
          onChange={(v) => setField("produccion", v === h.produccion ? "habitual" : v)}
          texto={`De la calefacción y la refrigeración. El ACS es ${j.acs.he4.produccion}, como dice HE 4: si no coinciden, son dos instalaciones con su documento cada una. Con la centralizada, la bomba de calor no está en la vivienda y el REBT no le pone circuito.`}
        />
      )}

      {j.puedeMismaMaquina && (
        <Decision<"si" | "no">
          numero={nAcs}
          pregunta="ACS con la misma máquina"
          opciones={[
            { valor: "no", label: "Aparte" },
            { valor: "si", label: "La misma" },
          ]}
          valor={j.acs.mismaMaquina ? "si" : "no"}
          habitual="no"
          onChange={(v) => setField("acsMismaMaquina", v === "si")}
          texto="Si el generador de la calefacción produce también el ACS, su potencia no se suma dos veces."
        />
      )}

      <section aria-label="Potencias y rendimientos" className="flex flex-col">
        <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Potencias y rendimientos</div>
        {d.calefaccion !== "ninguna" && (
          <>
            <CampoNumeroOpcional
              id="rite-calor"
              etiqueta="Potencia de calefacción"
              valor={aire(state.potenciaCalor_kW)}
              unidad="kW"
              onChange={(v) => setField("potenciaCalor_kW", v ?? null)}
              ayuda={`Nominal, del fabricante${individual ? ", por vivienda (la mayor)" : d.produccion === "centralizada" && !j.unifamiliar ? ", la total de la central" : ""}.`}
            />
            {esBombaDeCalor(d.calefaccion) && (
              <CampoNumeroOpcional id="rite-scop" etiqueta="SCOP" valor={aire(state.scop)} unidad="W/W" onChange={(v) => setField("scop", v ?? null)} ayuda="Del fabricante. El RITE no fija un mínimo (IT 1.2.4.1)." />
            )}
          </>
        )}
        {d.refrigeracion !== "ninguna" && (
          <>
            <CampoNumeroOpcional
              id="rite-frio"
              etiqueta="Potencia de refrigeración"
              valor={aire(state.potenciaFrio_kW)}
              unidad="kW"
              onChange={(v) => setField("potenciaFrio_kW", v ?? null)}
              ayuda={`Frigorífica nominal, del fabricante${individual ? ", por vivienda (la mayor)" : ""}.`}
            />
            <CampoNumeroOpcional id="rite-seer" etiqueta="SEER" valor={aire(state.seer)} unidad="W/W" onChange={(v) => setField("seer", v ?? null)} ayuda="Del fabricante. El RITE no fija un mínimo (IT 1.2.4.1)." />
          </>
        )}
        {!j.acs.mismaMaquina && (
          <CampoNumeroOpcional
            id="rite-acs"
            etiqueta="Potencia del generador de ACS"
            valor={aire(state.potenciaAcs_kW)}
            unidad="kW"
            onChange={(v) => setField("potenciaAcs_kW", v ?? null)}
            ayuda={`De la ${textoAcs(j.acs)} que dice HE 4${j.acs.he4.sistema === "solar" ? " (la del apoyo: la solar térmica no suma, art. 15.2)" : ""}.`}
          />
        )}
        <CampoNumeroOpcional
          id="rite-acumulacion"
          etiqueta="Acumulación de ACS"
          valor={aire(state.acumulacion_l)}
          unidad="l"
          onChange={(v) => setField("acumulacion_l", v ?? null)}
          ayuda="Volumen del depósito. Opcional: va a la tabla de la memoria."
        />
        <p className="text-text-secondary pt-2 text-[12px] leading-normal">
          El sistema de ACS ({textoAcs(j.acs)}, {j.acs.he4.produccion}) se cambia en {he4}.
        </p>
      </section>
    </section>
  );
}

export function RiteModule(): JSX.Element {
  return <PantallaSi def={rite} Decisiones={DecisionesRite} />;
}
