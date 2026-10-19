import type { JSX } from "react";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import { InputLabel } from "../ui/InputLabel";
import { SiNo } from "../ebss/controles";
import { NOMBRE_COMUNIDAD } from "../../data/comunidades";
import type { ResumenEdificio } from "../../lib/edificio/derivar";
import { comunidadDeObra, conPromocion, preguntaAutopromocion, promocionDe } from "../../lib/proyecto/promocion";
import type { DatosGenerales, PromocionObra } from "../../lib/proyecto/tipos";

// =============================================================================
// «Régimen de la promoción» en La obra (feature-36, paso 1). Tres sí / no sin
// valor por defecto: sin contestar, ninguno pulsado, y el apartado que lo
// necesita lo pide. La comunidad autónoma se muestra, no se pregunta.
// =============================================================================

interface Pregunta {
  campo: keyof PromocionObra;
  etiqueta: string;
  help: string;
  refText: string;
}

const PREGUNTAS: readonly Pregunta[] = [
  {
    campo: "propiedadHorizontal",
    etiqueta: "Propiedad horizontal",
    help: "El edificio está, o debe estar, en régimen de propiedad horizontal, o se arrienda por más de un año con más de una vivienda. Decide si hace falta la infraestructura común de telecomunicaciones (ICT). No se deduce del número de viviendas.",
    refText: "RD-ley 1/1998, art. 2",
  },
  {
    campo: "protegida",
    etiqueta: "Promoción protegida o pública",
    help: "Vivienda protegida, o promovida o subvencionada por las Administraciones públicas. Decide la reserva de viviendas accesibles: en Andalucía, una de 17 a 25 viviendas y el 4 % con más de 25.",
    refText: "Decreto 293/2009, art. 111; Ley 4/2017, art. 58.1; DB-SUA 9 1.2.1",
  },
  {
    campo: "autopromocion",
    etiqueta: "Autopromoción para uso propio",
    help: "Vivienda unifamiliar que el promotor construye para sí. En Andalucía, queda exenta de las exigencias de ascensor del Decreto de accesibilidad.",
    refText: "Decreto 293/2009, art. 106.5",
  },
];

export function SeccionPromocion(props: {
  dg: DatosGenerales;
  setDg: (f: (prev: DatosGenerales) => DatosGenerales) => void;
  resumen: Pick<ResumenEdificio, "esUnifamiliar">;
}): JSX.Element {
  const p = promocionDe(props.dg);
  const comunidad = comunidadDeObra(props.dg);
  const preguntas = PREGUNTAS.filter((q) => q.campo !== "autopromocion" || preguntaAutopromocion(props.resumen));
  const contestadas = preguntas.filter((q) => p[q.campo] !== undefined).length;
  return (
    <CollapsibleSection label="Régimen de la promoción" refNorma="ICT · accesibilidad" defaultOpen={contestadas > 0}>
      <p className="text-text-disabled mb-1 text-[11px] leading-snug">
        Lo que El edificio no sabe y deciden la ICT y la accesibilidad. Sin contestar, esos apartados lo piden como pendiente.
      </p>
      {preguntas.map((q) => (
        <div key={q.campo} className="mt-2 flex items-center justify-between gap-3">
          <InputLabel label={q.etiqueta} help={q.help} refText={q.refText} />
          <SiNo etiqueta={q.etiqueta} valor={p[q.campo]} onChange={(v) => props.setDg((prev) => conPromocion(prev, { [q.campo]: v }))} />
        </div>
      ))}
      <div className="mt-2.5 flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-[13px]">Comunidad autónoma</span>
        <span className="text-text-primary text-[13px]">
          {comunidad ? NOMBRE_COMUNIDAD[comunidad] : <span className="text-text-disabled">elige el municipio</span>}
        </span>
      </div>
      <p className="text-text-disabled text-[11px] leading-snug">Sale del municipio (código INE de la provincia).</p>
    </CollapsibleSection>
  );
}
