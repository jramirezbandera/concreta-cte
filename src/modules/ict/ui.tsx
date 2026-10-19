// ICT — Pantalla (feature-36, paso 3). La pantalla es la común (`PantallaSi`);
// aquí van las decisiones: el régimen de propiedad horizontal, que se declara en
// Los datos de la obra y aquí solo se enseña; el recinto; los PAU que El edificio
// no sabe contar; y la referencia del proyecto técnico de ICT, que es de otro
// técnico.

import type { JSX } from "react";
import { Link } from "react-router";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { CampoNumeroOpcional, CampoTexto } from "../../components/justificacion/ParaElAnejo";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { ict } from "./definicion";
import { cuenta, type IctEstado } from "./estado";
import type { JustificacionIct } from "./justificacion";
import { recintoAdmitido, type RecintoIct } from "./tablas";
import { NOMBRE_RECINTO, pauTexto } from "./textos";

function DecisionesIct({ state, setField, j }: PropsDecisionesSi<IctEstado, JustificacionIct>): JSX.Element {
  const { proyecto } = useProyecto();
  const datos = (
    <Link to={`/p/${proyecto.id}/datos`} className="text-accent hover:text-accent-hover underline">
      Los datos de la obra
    </Link>
  );
  const ph = j.propiedadHorizontal;
  const pau = j.elementos.find((e) => e.detalle.clase === "pau")?.detalle;
  const opciones: { valor: RecintoIct; label: string }[] = (["ritu", "ritu_a", "riti_rits"] as const)
    .filter((r) => r === j.recinto || r === "riti_rits" || recintoAdmitido(r, j.pau, j.plantasSobreRasante))
    .map((r) => ({ valor: r, label: r === "riti_rits" ? "RITI + RITS" : NOMBRE_RECINTO[r] }));
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <DecisionValor
        numero={1}
        pregunta="Propiedad horizontal"
        marca={ph === undefined ? { texto: "sin declarar", aviso: true } : { texto: "declarada" }}
        control={<span className="text-text-primary text-[13px]">{ph === undefined ? "Sin declarar" : ph ? "Sí" : "No"}</span>}
        texto={
          ph === undefined ? (
            <>Decide si hace falta la ICT y no se deduce del número de viviendas. Declárala en {datos}, «Régimen de la promoción».</>
          ) : (
            <>Del régimen de la promoción (RD-ley 1/1998, art. 2). Se cambia en {datos}.</>
          )
        }
      />

      <Decision<RecintoIct>
        numero={2}
        pregunta="Recinto de instalaciones"
        opciones={opciones}
        valor={j.recinto}
        habitual={j.recintoHabitual}
        onChange={(v) => setField("recinto", v === j.recintoHabitual ? "habitual" : v)}
        texto={`Con ${pauTexto(j.pau)} y ${j.plantasSobreRasante} ${j.plantasSobreRasante === 1 ? "planta" : "plantas"} sobre rasante. El RITU vale hasta tres alturas y planta baja con 16 PAU; el RITU-A, con más alturas hasta 16 PAU o de 17 a 30 (Anexo III, 4.5.3).`}
      />

      <section aria-label="PAU y proyecto técnico" className="flex flex-col">
        <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">PAU y proyecto técnico</div>
        <CampoNumeroOpcional
          id="ict-pau-locales"
          etiqueta="PAU de locales y oficinas"
          valor={cuenta(state.pauLocales) ?? undefined}
          unidad="PAU"
          onChange={(v) => setField("pauLocales", v ?? null)}
          ayuda={`Vacío: uno por zona y planta de El edificio${pau && pau.clase === "pau" && !pau.localesDeclarados ? ` (hoy, ${pau.locales})` : ""}.`}
        />
        <CampoNumeroOpcional
          id="ict-pau-comunes"
          etiqueta="PAU de estancias comunes"
          valor={cuenta(state.pauComunes) ?? undefined}
          unidad="PAU"
          onChange={(v) => setField("pauComunes", v ?? null)}
          ayuda="Si el proyecto técnico prevé PAU en estancias comunes (portería, local de la comunidad). Vacío: ninguno."
        />
        <CampoTexto
          id="ict-autor"
          etiqueta="Autor del proyecto técnico"
          valor={state.proyectoAutor}
          onChange={(v) => setField("proyectoAutor", v)}
          placeholder="Nombre, titulación"
          ancho="w-[200px]"
          ayuda="El proyecto técnico de ICT es de técnico competente en telecomunicaciones. Vacío: la memoria remite a él sin nombrarlo."
        />
        <CampoTexto
          id="ict-fecha"
          etiqueta="Fecha del proyecto técnico"
          valor={state.proyectoFecha}
          onChange={(v) => setField("proyectoFecha", v)}
          placeholder="marzo de 2026"
          ayuda="Como se quiera escribir en la memoria."
        />
      </section>
    </section>
  );
}

export function IctModule(): JSX.Element {
  return <PantallaSi def={ict} Decisiones={DecisionesIct} />;
}
