// DB-HE 3 — Pantalla de iluminación (feature-36, paso 2). La pantalla es la común
// (`PantallaSi`); las zonas que se justifican salen de El edificio. Aquí van lo
// que declara el proyectista de cada zona (potencia instalada e iluminancia media,
// por planta) y el sistema de control.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { CampoNumeroOpcional } from "../../components/justificacion/ParaElAnejo";
import { USOS } from "../../lib/edificio/usos";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { he3 } from "./definicion";
import { conZona, zonaDe, type ControlHe3, type He3Estado } from "./estado";
import type { JustificacionHe3 } from "./justificacion";
import { NOMBRE_CONTROL, num } from "./textos";

function DecisionesHe3({ state, setField, j }: PropsDecisionesSi<He3Estado, JustificacionHe3>): JSX.Element {
  const aire = (v: number | null) => (v === null ? undefined : v);
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {j.zonas.length > 0 && (
        <Decision<ControlHe3>
          numero={1}
          pregunta="Control"
          opciones={[
            { valor: "presencia", label: "Presencia" },
            { valor: "pulsador", label: "Pulsador" },
            { valor: "manual_horario", label: "Horario" },
          ]}
          valor={j.control}
          habitual={j.controlHabitual}
          onChange={(v) => setField("control", v === j.controlHabitual ? "habitual" : v)}
          texto={`Con ${NOMBRE_CONTROL[j.control]} y un encendido manual fuera del cuadro. En zonas de uso esporádico (escaleras, pasillos, aparcamiento) valen las tres (HE 3 ap. 3.3).`}
        />
      )}

      {j.zonas.map((z) => {
        const d = zonaDe(state, z.id);
        return (
          <div key={z.id} className="border-border-sub border-t pt-3 pb-2">
            <div className="text-text-primary text-[13px] font-medium">
              {USOS[z.uso].etiqueta} <span className="text-text-disabled font-normal">({z.plantas} · {num(z.util_m2)} m² por planta)</span>
            </div>
            <CampoNumeroOpcional
              id={`he3-p-${z.id}`}
              etiqueta="Potencia instalada"
              valor={aire(d.potencia_W)}
              unidad="W"
              onChange={(v) => setField("zonas", conZona(state.zonas, z.id, { potencia_W: v ?? null }))}
              ayuda="Por planta: lámparas y equipos auxiliares de la iluminación de la zona, del proyecto de iluminación."
            />
            <CampoNumeroOpcional
              id={`he3-em-${z.id}`}
              etiqueta="Iluminancia media"
              valor={aire(d.iluminancia_lx)}
              unidad="lx"
              onChange={(v) => setField("zonas", conZona(state.zonas, z.id, { iluminancia_lx: v ?? null }))}
              ayuda="Iluminancia media horizontal mantenida de proyecto. El CTE no la fija; SUA 4 pide al menos 100 lux en las zonas de circulación y 50 en el aparcamiento."
            />
          </div>
        );
      })}
    </section>
  );
}

export function He3Module(): JSX.Element {
  return <PantallaSi def={he3} Decisiones={DecisionesHe3} />;
}
