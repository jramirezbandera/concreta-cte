import { useState, type JSX } from "react";
import { ChevronDown, ChevronRight, Undo2, X } from "lucide-react";
import { Opciones } from "../justificacion/Decision";
import { nombreRiesgo, textoItem } from "../../lib/ebss/catalogo";
import { conEdicion, marcarFicha, type FichaEnSeleccion } from "../../lib/ebss/propuesta";
import {
  CLAVES_RIESGO,
  GRUPOS_FICHA,
  NOMBRE_GRUPO,
  type ClaveRiesgo,
  type EdicionFicha,
  type EdicionLista,
  type FichaCatalogo,
  type GrupoFicha,
  type ItemFicha,
  type SeleccionFichas,
} from "../../lib/ebss/tipos";

// =============================================================================
// Las fichas del estudio básico (feature-35, paso 6): las que propone la app,
// agrupadas, cada una con su motivo («aplica HS 4»), para marcar o quitar, y su
// edición. Lo que se guarda es la DIFERENCIA con la propuesta (paso 4): lo
// quitado sigue quitado si cambia la obra y lo que la app pasa a proponer
// aparece solo. Dentro de la ficha, los textos del catálogo se quitan y se
// vuelven a poner; lo añadido se borra.
// =============================================================================

type Lista = "medidas" | "protecciones" | "epi";

const LISTAS: { key: Lista; titulo: string }[] = [
  { key: "medidas", titulo: "Medidas preventivas" },
  { key: "protecciones", titulo: "Protecciones colectivas" },
  { key: "epi", titulo: "Equipos de protección individual" },
];

const BOTON_MINI =
  "text-text-disabled hover:text-text-primary focus-visible:outline-accent inline-flex h-6 w-6 shrink-0 items-center justify-center rounded focus-visible:outline-2";

function conLista(ed: EdicionFicha, key: Lista, l: EdicionLista): EdicionFicha {
  return { ...ed, [key]: l };
}

const sin = (xs: readonly string[] | undefined, x: string): string[] => (xs ?? []).filter((y) => y !== x);

/** Una lista de la ficha: los textos del catálogo (quitables) y los añadidos (borrables). */
function EditorLista(props: {
  idFicha: string;
  titulo: string;
  items: readonly ItemFicha[];
  ed: EdicionLista | undefined;
  onChange: (l: EdicionLista) => void;
}): JSX.Element {
  const { idFicha, titulo, items, ed, onChange } = props;
  const [nuevo, setNuevo] = useState("");
  const quitados = new Set(ed?.quitados ?? []);
  const anadir = () => {
    const t = nuevo.trim();
    if (t === "") return;
    if (!items.some((i) => textoItem(i) === t) && !(ed?.anadidos ?? []).includes(t)) onChange({ ...ed, anadidos: [...(ed?.anadidos ?? []), t] });
    setNuevo("");
  };
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">{titulo}</h4>
      <ul className="flex flex-col">
        {items.map((i) => {
          const t = textoItem(i);
          const fuera = quitados.has(t);
          const evitable = typeof i !== "string" && i.evitable !== undefined;
          return (
            <li key={t} className="flex items-start gap-1.5 text-[12px] leading-snug">
              <span className={`min-w-0 flex-1 py-[3px] ${fuera ? "text-text-disabled line-through" : "text-text-primary"}`}>
                {t}
                {evitable && !fuera && <span className="text-accent ml-1 text-[10.5px]">(apartado 7, riesgo evitable)</span>}
              </span>
              <button
                type="button"
                aria-label={fuera ? `Volver a poner: ${t}` : `Quitar: ${t}`}
                title={fuera ? "Volver a poner" : "Quitar"}
                onClick={() => onChange({ ...ed, quitados: fuera ? sin(ed?.quitados, t) : [...(ed?.quitados ?? []), t] })}
                className={BOTON_MINI}
              >
                {fuera ? <Undo2 size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
        {(ed?.anadidos ?? []).map((t) => (
          <li key={`+${t}`} className="flex items-start gap-1.5 text-[12px] leading-snug">
            <span className="text-text-primary min-w-0 flex-1 py-[3px]">
              {t} <span className="text-accent text-[10.5px]">(añadida)</span>
            </span>
            <button type="button" aria-label={`Borrar: ${t}`} title="Borrar" onClick={() => onChange({ ...ed, anadidos: sin(ed?.anadidos, t) })} className={BOTON_MINI}>
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-1.5">
        <input
          id={`${idFicha}-${titulo}`}
          type="text"
          value={nuevo}
          onChange={(e) => setNuevo(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") anadir();
          }}
          aria-label={`Añadir a ${titulo.toLowerCase()}`}
          placeholder="Añadir…"
          className="border-border-main bg-bg-primary text-text-primary focus:border-accent placeholder:text-text-disabled h-7 min-w-0 flex-1 rounded border px-2 text-[12px] focus:outline-none"
        />
        <button
          type="button"
          onClick={anadir}
          disabled={nuevo.trim() === ""}
          className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary h-7 rounded border px-2.5 text-[12px] disabled:opacity-50"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}

/** Los riesgos de la ficha (los que evita una protección colectiva, también) y los añadidos. */
function EditorRiesgos(props: { f: FichaCatalogo; ed: EdicionFicha; onChange: (ed: EdicionFicha) => void }): JSX.Element {
  const { f, ed, onChange } = props;
  const [clave, setClave] = useState<ClaveRiesgo | "">("");
  const [causa, setCausa] = useState("");
  const quitados = new Set(ed.riesgos?.quitados ?? []);
  const anadidos = ed.riesgos?.anadidos ?? [];
  const propios = [...(f.evita ?? []).map((r) => ({ ...r, evita: true })), ...f.riesgos.map((r) => ({ ...r, evita: false }))];
  const presentes = new Set<ClaveRiesgo>([...propios.map((r) => r.clave), ...anadidos.map((r) => r.clave)]);
  const libres = CLAVES_RIESGO.filter((k) => !presentes.has(k));
  const riesgos = (r: NonNullable<EdicionFicha["riesgos"]>) => onChange({ ...ed, riesgos: r });
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">Riesgos</h4>
      <ul className="flex flex-col">
        {propios.map((r) => {
          const fuera = quitados.has(r.clave);
          const nombre = nombreRiesgo(r.clave);
          return (
            <li key={`${r.evita ? "e" : "r"}-${r.clave}`} className="flex items-start gap-1.5 text-[12px] leading-snug">
              <span className={`min-w-0 flex-1 py-[3px] ${fuera ? "text-text-disabled line-through" : "text-text-primary"}`}>
                {nombre}
                {r.causa && <span className="text-text-secondary">: {r.causa}</span>}
                {r.evita && <span className="text-text-disabled ml-1 text-[10.5px]">(lo evita)</span>}
              </span>
              <button
                type="button"
                aria-label={fuera ? `Volver a poner el riesgo: ${nombre}` : `Quitar el riesgo: ${nombre}`}
                title={fuera ? "Volver a poner" : "Quitar"}
                onClick={() =>
                  riesgos({
                    ...ed.riesgos,
                    quitados: fuera ? (ed.riesgos?.quitados ?? []).filter((k) => k !== r.clave) : [...(ed.riesgos?.quitados ?? []), r.clave],
                  })
                }
                className={BOTON_MINI}
              >
                {fuera ? <Undo2 size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
        {anadidos.map((r) => (
          <li key={`a-${r.clave}`} className="flex items-start gap-1.5 text-[12px] leading-snug">
            <span className="text-text-primary min-w-0 flex-1 py-[3px]">
              {nombreRiesgo(r.clave)}
              {r.causa && <span className="text-text-secondary">: {r.causa}</span>} <span className="text-accent text-[10.5px]">(añadido)</span>
            </span>
            <button
              type="button"
              aria-label={`Borrar el riesgo: ${nombreRiesgo(r.clave)}`}
              title="Borrar"
              onClick={() => riesgos({ ...ed.riesgos, anadidos: anadidos.filter((x) => x.clave !== r.clave) })}
              className={BOTON_MINI}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {libres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <select
            value={clave}
            onChange={(e) => setClave(e.currentTarget.value as ClaveRiesgo | "")}
            aria-label="Riesgo que se añade"
            className="border-border-main bg-bg-primary text-text-primary h-7 min-w-0 flex-[1_1_180px] rounded border px-1.5 text-[12px]"
          >
            <option value="">Añadir un riesgo…</option>
            {libres.map((k) => (
              <option key={k} value={k}>
                {nombreRiesgo(k)}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={causa}
            onChange={(e) => setCausa(e.currentTarget.value)}
            aria-label="Causa del riesgo que se añade"
            placeholder="Causa (opcional)"
            className="border-border-main bg-bg-primary text-text-primary focus:border-accent placeholder:text-text-disabled h-7 min-w-0 flex-[1_1_140px] rounded border px-2 text-[12px] focus:outline-none"
          />
          <button
            type="button"
            disabled={clave === ""}
            onClick={() => {
              if (clave === "") return;
              const c = causa.trim();
              riesgos({ ...ed.riesgos, anadidos: [...anadidos, { clave, ...(c ? { causa: c } : {}) }] });
              setClave("");
              setCausa("");
            }}
            className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary h-7 rounded border px-2.5 text-[12px] disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      )}
    </div>
  );
}

function Ficha(props: {
  x: FichaEnSeleccion;
  sel: SeleccionFichas | undefined;
  onSeleccion: (s: SeleccionFichas) => void;
}): JSX.Element {
  const { x, sel, onSeleccion } = props;
  const f = x.ficha;
  const [abierta, setAbierta] = useState(false);
  const ed = sel?.ediciones?.[f.id] ?? {};
  const editada = Object.keys(ed).some((k) => k !== "revisada");
  const sinRevisar = f.redactadaPorApp === true && ed.revisada !== true;
  const guardar = (e: EdicionFicha) => onSeleccion(conEdicion(sel, f.id, e));
  const idCheck = `ficha-${f.id}`;
  return (
    <li className="border-border-sub border-t first:border-t-0">
      <div className="flex items-start gap-2.5 px-3.5 py-2">
        <input
          id={idCheck}
          type="checkbox"
          checked={x.marcada}
          onChange={(e) => onSeleccion(marcarFicha(sel, f.id, e.currentTarget.checked, x.propuesta))}
          className="accent-accent mt-[3px] h-4 w-4 shrink-0 cursor-pointer"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <label htmlFor={idCheck} className={`cursor-pointer text-[13px] leading-snug ${x.marcada ? "text-text-primary" : "text-text-secondary"}`}>
            {f.titulo}
          </label>
          <p className="text-text-disabled text-[11.5px] leading-snug">
            {x.propuesta
              ? `La propone la app: ${x.motivos.join(" · ")}${x.marcada ? "" : ". La has quitado."}`
              : x.marcada
                ? "La añades tú: la app no la propone para esta obra."
                : "La app no la propone para esta obra."}
          </p>
          {(f.redactadaPorApp || editada) && x.marcada && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {f.redactadaPorApp && (
                <span
                  className={`rounded border px-1.5 py-px text-[10.5px] ${sinRevisar ? "border-state-warn/45 text-state-warn" : "border-border-sub text-text-secondary"}`}
                >
                  {sinRevisar ? "Redactada por la app · sin revisar" : "Redactada por la app · revisada"}
                </span>
              )}
              {editada && <span className="border-border-sub text-text-secondary rounded border px-1.5 py-px text-[10.5px]">Editada</span>}
            </div>
          )}
        </div>
        {x.marcada && (
          <button
            type="button"
            aria-expanded={abierta}
            aria-label={`${abierta ? "Cerrar" : "Editar"} la ficha ${f.titulo}`}
            onClick={() => setAbierta(!abierta)}
            className="text-accent hover:text-accent-hover inline-flex shrink-0 items-center gap-0.5 pt-px text-[12px] hover:underline"
          >
            {abierta ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronRight size={13} aria-hidden="true" />}
            {abierta ? "Cerrar" : "Editar"}
          </button>
        )}
      </div>
      {abierta && x.marcada && (
        <div className="bg-bg-surface border-border-sub flex flex-col gap-3.5 border-t px-3.5 py-3 sm:pl-10">
          {(f.avisos ?? []).map((a) => (
            <p key={a} role="note" className="text-state-warn text-[11.5px] leading-snug">
              {a}
            </p>
          ))}
          <p className="text-text-secondary text-[12px] leading-snug">{f.descripcion}</p>
          {f.redactadaPorApp && (
            <label className="text-text-primary flex items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                checked={ed.revisada === true}
                onChange={(e) => {
                  const { revisada: _, ...resto } = ed;
                  guardar(e.currentTarget.checked ? { ...resto, revisada: true } : resto);
                }}
                className="accent-accent h-4 w-4"
              />
              La he leído y la doy por buena
            </label>
          )}
          <EditorRiesgos f={f} ed={ed} onChange={guardar} />
          {LISTAS.map((l) => (
            <EditorLista key={l.key} idFicha={f.id} titulo={l.titulo} items={f[l.key]} ed={ed[l.key]} onChange={(v) => guardar(conLista(ed, l.key, v))} />
          ))}
          {(f.notas ?? []).length > 0 && (
            <div className="flex flex-col gap-1">
              <h4 className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">Notas que se imprimen</h4>
              {f.notas!.map((n) => (
                <p key={n} className="text-text-secondary text-[12px] leading-snug">
                  {n}
                </p>
              ))}
            </div>
          )}
          {editada && (
            <button
              type="button"
              onClick={() => guardar(ed.revisada ? { revisada: true } : {})}
              className="text-text-secondary hover:text-text-primary w-fit text-[12px] underline"
            >
              Deshacer lo editado en esta ficha
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function FichasEbss(props: {
  fichas: readonly FichaEnSeleccion[];
  sel: SeleccionFichas | undefined;
  onSeleccion: (s: SeleccionFichas) => void;
}): JSX.Element {
  const { fichas, sel, onSeleccion } = props;
  const [ver, setVer] = useState<"obra" | "todo">("obra");
  const visibles = ver === "todo" ? fichas : fichas.filter((x) => x.propuesta || x.marcada);
  const grupos = GRUPOS_FICHA.map((g: GrupoFicha) => ({ g, xs: visibles.filter((x) => x.ficha.grupo === g) })).filter((x) => x.xs.length > 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-text-secondary text-[12.5px]">
          {fichas.filter((x) => x.marcada).length} fichas en el estudio · la app propone {fichas.filter((x) => x.propuesta).length} de las {fichas.length} del
          catálogo.
        </p>
        <div className="w-[260px]">
          <Opciones<"obra" | "todo">
            etiqueta="Qué fichas se ven"
            opciones={[
              { valor: "obra", label: "Las de esta obra" },
              { valor: "todo", label: "Todo el catálogo" },
            ]}
            valor={ver}
            onChange={setVer}
            pequenas
          />
        </div>
      </div>
      {grupos.map(({ g, xs }) => (
        <section key={g} aria-label={NOMBRE_GRUPO[g]} className="border-border-main bg-bg-primary rounded border">
          <h3 className="text-text-disabled border-border-sub flex items-baseline justify-between border-b px-3.5 pt-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
            {NOMBRE_GRUPO[g]}
            <span className="font-mono tracking-normal normal-case">
              {xs.filter((x) => x.marcada).length}/{xs.length}
            </span>
          </h3>
          <ul>
            {xs.map((x) => (
              <Ficha key={x.ficha.id} x={x} sel={sel} onSeleccion={onSeleccion} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
