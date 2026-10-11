// Habitabilidad — Pantalla (feature-32). La pantalla es la común (`PantallaSi`);
// aquí van las decisiones: la norma, que se declara en Los datos de la obra y
// aquí solo se enseña; las estancias de cada vivienda, con su superficie útil y
// lo que mide su hueco; y la superficie residencial para la densidad, si se
// declara otra que la de El edificio.

import type { JSX } from "react";
import { Link } from "react-router";
import { DecisionValor } from "../../components/justificacion/Decision";
import { NOMBRE_TIPO_ESTANCIA, TIPOS_ESTANCIA, type TipoEstancia } from "../../lib/habitabilidad/norma";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { hab } from "./definicion";
import { estanciasPropuestas, medida, type EstanciaHab, type HabEstado } from "./estado";
import type { JustificacionHab, ViviendaHab } from "./justificacion";
import { m2, resumenNorma } from "./textos";

const CELDA =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-7 w-full min-w-0 rounded border px-1.5 text-[12.5px] focus:outline-none";
const BOTON = "border-border-main bg-bg-primary text-accent hover:text-accent-hover inline-flex h-7 items-center rounded border px-2.5 text-[12px]";

function leer(txt: string): number | null {
  const limpio = txt.trim().replace(/\s/g, "").replace(",", ".");
  if (limpio === "") return null;
  const n = Number(limpio);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** «26», «4,2», «1,25»: sin ceros de más, para que quepa en la celda. */
const formato = (v: number | null): string => (v === null ? "" : String(Math.round(v * 100) / 100).replace(".", ","));

/** Un número que puede faltar: vacío es «sin dato». Se confirma al salir o con Enter. */
function Medida(props: { id: string; value: number | null; onChange: (v: number | null) => void; etiqueta: string }): JSX.Element {
  const texto = formato(props.value);
  return (
    <input
      key={texto}
      id={props.id}
      type="text"
      inputMode="decimal"
      defaultValue={texto}
      placeholder="—"
      aria-label={props.etiqueta}
      onBlur={(e) => {
        const n = leer(e.currentTarget.value);
        if (n !== props.value) props.onChange(n);
        else e.currentTarget.value = texto;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.currentTarget.value = texto;
          e.currentTarget.blur();
        }
      }}
      className={`${CELDA} text-right font-mono tabular-nums`}
    />
  );
}

/** Las columnas de medida que piden las normas declaradas (el hueco, siempre). */
function columnas(j: JustificacionHab): { clave: "hueco_m2" | "acristalada_m2" | "practicable_m2"; titulo: string }[] {
  const mide = new Set<string>(["hueco"]);
  for (const n of j.normas) {
    mide.add(n.iluminacion.mide);
    if (n.ventilacion !== "conjunta") mide.add(n.ventilacion.mide);
  }
  return [
    { clave: "hueco_m2" as const, titulo: "Hueco" },
    ...(mide.has("acristalada") ? [{ clave: "acristalada_m2" as const, titulo: "Acristal." }] : []),
    ...(mide.has("practicable") ? [{ clave: "practicable_m2" as const, titulo: "Practic." }] : []),
  ];
}

function EditorEstancias(props: {
  v: ViviendaHab;
  j: JustificacionHab;
  onChange: (lista: EstanciaHab[]) => void;
}): JSX.Element {
  const { v, j, onChange } = props;
  const cols = columnas(j);
  const lista = v.estancias;
  const cambiar = (id: string, cambio: Partial<EstanciaHab>) => onChange(lista.map((e) => (e.id === id ? { ...e, ...cambio } : e)));
  const anadir = () => {
    let n = lista.length + 1;
    while (lista.some((e) => e.id === `n${n}`)) n++;
    onChange([...lista, { id: `n${n}`, nombre: "Estancia", tipo: "dormitorio", util_m2: null, hueco_m2: null, acristalada_m2: null, practicable_m2: null }]);
  };
  const suma = lista.reduce((a, e) => a + (medida(e.util_m2) ?? 0), 0);
  // Dos líneas por estancia: nombre y tipo arriba; las superficies debajo, en columnas con su cabecera.
  const cifras = `repeat(${1 + cols.length}, minmax(0,1fr))`;
  if (lista.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 py-1">
        <button type="button" className={BOTON} onClick={() => onChange(estanciasPropuestas(v))}>
          Proponer desde el tipo
        </button>
        <span className="text-text-disabled text-[11.5px]">
          {v.dormitorios} dormitorios, {v.banos} baños y {v.aseos} aseos de El edificio, sin superficies.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="text-text-disabled grid gap-1 text-[10.5px] font-medium tracking-[0.04em] uppercase" style={{ gridTemplateColumns: cifras }}>
        <span className="text-right">Su m²</span>
        {cols.map((c) => (
          <span key={c.clave} className="text-right">
            {c.titulo} m²
          </span>
        ))}
      </div>
      {lista.map((e) => (
        <div key={e.id} className="border-border-sub flex flex-col gap-1 border-t pt-1.5">
          <div className="grid items-center gap-1" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) 22px" }}>
            <input
              type="text"
              value={e.nombre}
              aria-label="Nombre de la estancia"
              onChange={(ev) => cambiar(e.id, { nombre: ev.target.value })}
              className={CELDA}
            />
            <select value={e.tipo} aria-label={`Tipo de ${e.nombre}`} onChange={(ev) => cambiar(e.id, { tipo: ev.target.value as TipoEstancia })} className={CELDA}>
              {TIPOS_ESTANCIA.map((t) => (
                <option key={t} value={t}>
                  {NOMBRE_TIPO_ESTANCIA[t]}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Quitar ${e.nombre}`}
              onClick={() => onChange(lista.filter((x) => x.id !== e.id))}
              className="text-text-disabled hover:text-state-fail text-[15px] leading-none"
            >
              ×
            </button>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: cifras }}>
            <Medida id={`hab-${v.id}-${e.id}-su`} etiqueta={`Superficie útil de ${e.nombre}`} value={e.util_m2} onChange={(x) => cambiar(e.id, { util_m2: x })} />
            {cols.map((c) => (
              <Medida key={c.clave} id={`hab-${v.id}-${e.id}-${c.clave}`} etiqueta={`${c.titulo} de ${e.nombre}`} value={e[c.clave]} onChange={(x) => cambiar(e.id, { [c.clave]: x })} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button type="button" className={BOTON} onClick={anadir}>
          Añadir estancia
        </button>
        <span className="text-text-disabled font-mono text-[11px]">
          Σ {m2(suma)}
          {v.util_m2 !== null ? ` de ${m2(v.util_m2)}` : ""}
        </span>
      </div>
    </div>
  );
}

function DecisionesHab({ state, setField, j }: PropsDecisionesSi<HabEstado, JustificacionHab>): JSX.Element {
  const { proyecto } = useProyecto();
  const datos = (
    <Link to={`/p/${proyecto.id}/datos`} className="text-accent hover:text-accent-hover underline">
      Los datos de la obra
    </Link>
  );
  const dens = j.elementos.find((e) => e.detalle.clase === "densidad")?.detalle;
  const densidad = dens && dens.clase === "densidad" ? dens : null;
  const setEstancias = (viviendaId: string, lista: EstanciaHab[]) => setField("estancias", { ...state.estancias, [viviendaId]: lista });
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const nDensidad = j.viviendas.length + 2;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <DecisionValor
        numero={1}
        pregunta="Norma de habitabilidad"
        marca={j.normas.length > 0 ? { texto: "declarada" } : { texto: "sin declarar", aviso: true }}
        control={
          <span className="text-text-primary text-[13px]">
            {j.normas.length > 0 ? j.normas.map((x) => x.referencia).join(" · ") : "Ninguna"}
          </span>
        }
        texto={
          j.normas.length > 0 ? (
            <>
              {j.normas.map((x) => resumenNorma(x)).join(". ")}. Se cambia en {datos}.
            </>
          ) : (
            <>La fija el planeamiento del municipio: la herramienta no la supone. Declárala en {datos}, con su artículo.</>
          )
        }
      />

      {j.viviendas.map((v, i) => (
        <div key={v.id} className="border-border-sub border-t pt-3 pb-3.5">
          <div className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
            <span className="text-text-disabled font-mono text-[10.5px] font-medium">{i + 2}</span>
            Estancias · {v.nombre}
            {v.cantidad > 1 && <span className="text-text-secondary font-normal">({v.cantidad})</span>}
          </div>
          <EditorEstancias v={v} j={j} onChange={(lista) => setEstancias(v.id, lista)} />
        </div>
      ))}

      {densidad && (
        <DecisionValor
          numero={nDensidad}
          pregunta="Superficie residencial para la densidad"
          marca={densidad.declarada ? { texto: "declarada" } : { texto: "El edificio" }}
          control={
            <span className="w-[110px]">
              <Medida id="hab-superficie" etiqueta="Superficie residencial" value={state.superficieResidencial_m2} onChange={(x) => setField("superficieResidencial_m2", x)} />
            </span>
          }
          texto={`Vacía, la de las zonas de vivienda de El edificio: ${m2(densidad.superficie_m2)}. Decláralo si la norma cuenta otra (solo sobre rasante, usos vinculados).`}
        />
      )}
      {densidad?.antes && (
        <DecisionValor
          numero={nDensidad + 1}
          pregunta="Superficie residencial antes de la obra"
          marca={densidad.antes.declarada ? { texto: "declarada" } : { texto: "El edificio" }}
          control={
            <span className="w-[110px]">
              <Medida id="hab-superficie-antes" etiqueta="Superficie residencial antes de la obra" value={state.superficieResidencialAntes_m2} onChange={(x) => setField("superficieResidencialAntes_m2", x)} />
            </span>
          }
          texto={`Para el estado actual: ${m2(densidad.antes.superficie_m2)} y ${densidad.antes.viviendas} viviendas.`}
        />
      )}
    </section>
  );
}

export function HabModule(): JSX.Element {
  return <PantallaSi def={hab} Decisiones={DecisionesHab} />;
}
