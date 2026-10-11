// =============================================================================
// Los datos de la obra · Habitabilidad (feature-32, PLAN-MEMORIA §5.5). El
// proyectista declara la norma de habitabilidad de la obra (una o dos): de una
// plantilla cotejada, de «Mis normas» o nueva. Nada se aplica en silencio: sin
// norma, el apartado sale pendiente. Lo que define se puede guardar en Mis
// normas, ligado al municipio, y exportar o importar en JSON.
// =============================================================================

import { useState, type ChangeEvent, type JSX } from "react";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import {
  COMPUTAN_HABITUAL,
  conNorma,
  idNorma,
  leerFraccion,
  MAX_NORMAS_OBRA,
  NOMBRE_AMBITO,
  NOMBRE_MEDIDA,
  NOMBRE_TIPO_ESTANCIA,
  parseNormas,
  plantillasPara,
  sugeridasPara,
  textoFraccion,
  TIPOS_ESTANCIA,
  type AmbitoNorma,
  type MedidaIluminacion,
  type MedidaVentilacion,
  type NormaHabitabilidad,
  type PlantillaNorma,
  type RedondeoDensidad,
  type TipoEstancia,
} from "../../lib/habitabilidad/norma";
import { useMisNormas } from "../../lib/habitabilidad/useMisNormas";
import type { DatosGenerales } from "../../lib/proyecto/tipos";

const INPUT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] focus:ring-1 focus:outline-none";
const BOTON = "border-border-main bg-bg-primary text-accent hover:text-accent-hover inline-flex h-7 items-center rounded border px-2.5 text-[12px]";
const ETIQUETA = "text-text-secondary text-[12px]";

/** El borrador del editor: los números como texto, para escribirlos a gusto. */
interface Borrador {
  id: string;
  referencia: string;
  ambito: AmbitoNorma;
  iluminacion: string;
  mideIl: MedidaIluminacion;
  conjunta: boolean;
  ventilacion: string;
  mideVe: MedidaVentilacion;
  computan: TipoEstancia[];
  minimas: Partial<Record<TipoEstancia, string>>;
  densidad: string;
  superficie: "construida" | "util";
  redondeo: RedondeoDensidad;
  refDensidad: string;
  plantilla?: string;
}

const coma = (n: number) => String(Math.round(n * 1000) / 1000).replace(".", ",");

function borradorDe(n: NormaHabitabilidad): Borrador {
  return {
    id: n.id,
    referencia: n.referencia,
    ambito: n.ambito,
    iluminacion: textoFraccion(n.iluminacion.fraccion),
    mideIl: n.iluminacion.mide,
    conjunta: n.ventilacion === "conjunta",
    ventilacion: n.ventilacion === "conjunta" ? "" : textoFraccion(n.ventilacion.fraccion),
    mideVe: n.ventilacion === "conjunta" ? "practicable" : n.ventilacion.mide,
    computan: [...n.computan],
    minimas: Object.fromEntries(Object.entries(n.superficieMinima ?? {}).map(([k, v]) => [k, coma(v)])),
    densidad: n.densidad ? coma(n.densidad.m2PorVivienda) : "",
    superficie: n.densidad?.superficie ?? "construida",
    redondeo: n.densidad?.redondeo ?? "por_defecto",
    refDensidad: n.densidad?.referencia ?? "",
    ...(n.plantilla ? { plantilla: n.plantilla } : {}),
  };
}

function nuevoBorrador(): Borrador {
  return {
    id: "",
    referencia: "",
    ambito: "municipal",
    iluminacion: "",
    mideIl: "hueco",
    conjunta: true,
    ventilacion: "",
    mideVe: "practicable",
    computan: [...COMPUTAN_HABITUAL],
    minimas: {},
    densidad: "",
    superficie: "construida",
    redondeo: "por_defecto",
    refDensidad: "",
  };
}

const numero = (t: string | undefined): number | null => {
  if (!t) return null;
  const n = Number(t.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** La norma del borrador, o lo que falta para que lo sea. */
function normaDe(b: Borrador, ahora: number): { norma: NormaHabitabilidad } | { error: string } {
  if (b.referencia.trim() === "") return { error: "Falta la referencia: «PGOU de …, art. …»." };
  const il = leerFraccion(b.iluminacion);
  if (il === null) return { error: "La fracción de iluminación no se entiende: escribe «1/10», «10 %» o «0,1»." };
  const ve = b.conjunta ? null : leerFraccion(b.ventilacion);
  if (!b.conjunta && ve === null) return { error: "La fracción de ventilación no se entiende." };
  if (b.computan.length === 0) return { error: "Marca al menos una estancia que compute." };
  const minimas: Partial<Record<TipoEstancia, number>> = {};
  for (const [k, v] of Object.entries(b.minimas)) {
    const n = numero(v);
    if (n !== null) minimas[k as TipoEstancia] = n;
  }
  const dens = numero(b.densidad);
  const norma: NormaHabitabilidad = {
    id: b.id || idNorma(b.referencia, ahora),
    referencia: b.referencia.trim(),
    ambito: b.ambito,
    iluminacion: { fraccion: il, mide: b.mideIl },
    ventilacion: b.conjunta || ve === null ? "conjunta" : { fraccion: ve, mide: b.mideVe },
    computan: TIPOS_ESTANCIA.filter((t) => b.computan.includes(t)),
    ...(Object.keys(minimas).length > 0 ? { superficieMinima: minimas } : {}),
    ...(dens !== null
      ? { densidad: { m2PorVivienda: dens, superficie: b.superficie, redondeo: b.redondeo, ...(b.refDensidad.trim() ? { referencia: b.refDensidad.trim() } : {}) } }
      : {}),
    ...(b.plantilla ? { plantilla: b.plantilla } : {}),
  };
  return { norma };
}

function Editor(props: { inicial: Borrador; onAplicar: (n: NormaHabitabilidad) => void; onCancelar: () => void }): JSX.Element {
  const [b, setB] = useState<Borrador>(props.inicial);
  const [error, setError] = useState<string | null>(null);
  const set = (cambio: Partial<Borrador>) => setB((x) => ({ ...x, ...cambio }));
  const alternar = (t: TipoEstancia) => set({ computan: b.computan.includes(t) ? b.computan.filter((x) => x !== t) : [...b.computan, t] });
  const aplicar = () => {
    const r = normaDe(b, Date.now());
    if ("error" in r) setError(r.error);
    else props.onAplicar(r.norma);
  };
  return (
    <div className="border-border-main bg-bg-surface mt-1 mb-2 flex flex-col gap-2 rounded border p-3">
      <label className="flex flex-col gap-1">
        <span className={ETIQUETA}>Referencia (como se cita en la memoria)</span>
        <input type="text" value={b.referencia} onChange={(e) => set({ referencia: e.target.value })} placeholder="PGOU de …, art. …" className={INPUT} />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span className={ETIQUETA}>Ámbito</span>
        <select value={b.ambito} onChange={(e) => set({ ambito: e.target.value as AmbitoNorma })} className={`${INPUT} max-w-[200px]`}>
          {(Object.keys(NOMBRE_AMBITO) as AmbitoNorma[]).map((a) => (
            <option key={a} value={a}>
              {NOMBRE_AMBITO[a]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className={ETIQUETA}>Iluminación (de Su)</span>
          <input type="text" value={b.iluminacion} onChange={(e) => set({ iluminacion: e.target.value })} placeholder="1/10 o 10 %" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={ETIQUETA}>Se mide</span>
          <select value={b.mideIl} onChange={(e) => set({ mideIl: e.target.value as MedidaIluminacion })} className={INPUT}>
            <option value="hueco">{NOMBRE_MEDIDA.hueco}</option>
            <option value="acristalada">{NOMBRE_MEDIDA.acristalada}</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={b.conjunta} onChange={(e) => set({ conjunta: e.target.checked })} />
        Iluminación y ventilación conjuntas (el mismo hueco)
      </label>
      {!b.conjunta && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Ventilación (de Su)</span>
            <input type="text" value={b.ventilacion} onChange={(e) => set({ ventilacion: e.target.value })} placeholder="1/20 o 5 %" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Se mide</span>
            <select value={b.mideVe} onChange={(e) => set({ mideVe: e.target.value as MedidaVentilacion })} className={INPUT}>
              <option value="practicable">{NOMBRE_MEDIDA.practicable}</option>
              <option value="hueco">{NOMBRE_MEDIDA.hueco}</option>
            </select>
          </label>
        </div>
      )}
      <fieldset>
        <legend className={`${ETIQUETA} mb-1`}>Computan · superficie útil mínima (m², opcional)</legend>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {TIPOS_ESTANCIA.map((t) => (
            <div key={t} className="flex items-center gap-2 text-[12.5px]">
              <label className="flex min-w-0 flex-1 items-center gap-1.5">
                <input type="checkbox" checked={b.computan.includes(t)} onChange={() => alternar(t)} />
                <span className="truncate">{NOMBRE_TIPO_ESTANCIA[t]}</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                aria-label={`Superficie mínima de ${NOMBRE_TIPO_ESTANCIA[t]}`}
                value={b.minimas[t] ?? ""}
                onChange={(e) => set({ minimas: { ...b.minimas, [t]: e.target.value } })}
                placeholder="—"
                className={`${INPUT} w-[64px] text-right font-mono`}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className={`${ETIQUETA} mb-1`}>Densidad (opcional)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>m² por vivienda</span>
            <input type="text" inputMode="decimal" value={b.densidad} onChange={(e) => set({ densidad: e.target.value })} placeholder="—" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Superficie</span>
            <select value={b.superficie} onChange={(e) => set({ superficie: e.target.value as "construida" | "util" })} className={INPUT}>
              <option value="construida">construida</option>
              <option value="util">útil</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Redondeo del máximo</span>
            <select value={b.redondeo} onChange={(e) => set({ redondeo: e.target.value as RedondeoDensidad })} className={INPUT}>
              <option value="por_defecto">cociente entero</option>
              <option value="al_mas_proximo">+1 si el decimal ≥ 0,5</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Artículo</span>
            <input type="text" value={b.refDensidad} onChange={(e) => set({ refDensidad: e.target.value })} placeholder="art. …" className={INPUT} />
          </label>
        </div>
      </fieldset>
      {error && <p className="text-state-warn text-[11.5px]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className={BOTON} onClick={aplicar}>
          Aplicar
        </button>
        <button type="button" className={`${BOTON} text-text-secondary`} onClick={props.onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function descargar(nombre: string, contenido: string): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function SeccionHabitabilidad(props: { dg: DatosGenerales; setDg: (f: (prev: DatosGenerales) => DatosGenerales) => void }): JSX.Element {
  const [misNormas, guardarMisNormas] = useMisNormas();
  const [editando, setEditando] = useState<{ indice: number | null; borrador: Borrador } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const normas = props.dg.habitabilidad?.normas ?? [];
  const ine = props.dg.municipioIne;
  const plantillas = plantillasPara(ine?.slice(0, 2));
  const sugeridas = sugeridasPara(misNormas, ine).filter((n) => !normas.some((x) => x.id === n.id));
  const lleno = normas.length >= MAX_NORMAS_OBRA;

  const setNormas = (lista: NormaHabitabilidad[]) =>
    props.setDg((prev) => {
      const { habitabilidad: _, ...resto } = prev;
      return lista.length > 0 ? { ...resto, habitabilidad: { normas: lista } } : resto;
    });
  const aplicar = (n: NormaHabitabilidad) => {
    setNormas(editando?.indice === null || editando?.indice === undefined ? [...normas, n] : normas.map((x, i) => (i === editando.indice ? n : x)));
    setEditando(null);
  };
  const deMisNormas = (id: string) => {
    const n = misNormas.find((x) => x.id === id);
    if (n) setNormas([...normas, n]);
  };
  const dePlantilla = (p: PlantillaNorma) => setEditando({ indice: null, borrador: borradorDe({ ...p.norma, id: "" }) });
  const guardarEnMisNormas = (n: NormaHabitabilidad) => {
    const ligada = n.municipioIne || !ine || n.ambito !== "municipal" ? n : { ...n, municipioIne: ine, ...(props.dg.municipio ? { municipio: props.dg.municipio } : {}) };
    guardarMisNormas(conNorma(misNormas, ligada));
    if (ligada !== n) setNormas(normas.map((x) => (x.id === n.id ? ligada : x)));
    setAviso(`«${n.referencia}» guardada en Mis normas.`);
  };
  const importar = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const leidas = parseNormas(JSON.parse(await f.text()));
      guardarMisNormas(leidas.reduce(conNorma, misNormas));
      setAviso(leidas.length > 0 ? `${leidas.length} normas importadas a Mis normas.` : "El archivo no trae normas que se puedan leer.");
    } catch {
      setAviso("El archivo no es un JSON de normas.");
    }
  };

  return (
    <CollapsibleSection label="Habitabilidad" refNorma="norma municipal o autonómica" defaultOpen={normas.length > 0}>
      <p className="text-text-disabled py-1 text-[11.5px] leading-snug">
        La fracción de hueco y la densidad las fija el planeamiento del municipio (y, en vivienda protegida, la comunidad): la herramienta no las supone. Declara
        la norma de la obra con su artículo; sin ella, el apartado de habitabilidad sale pendiente.
      </p>

      {normas.map((n, i) => (
        <div key={n.id} className="border-border-sub border-t py-2">
          <div className="text-text-primary text-[13px] font-medium">{n.referencia}</div>
          <div className="text-text-secondary text-[12px] leading-snug">
            {NOMBRE_AMBITO[n.ambito]} · iluminación {textoFraccion(n.iluminacion.fraccion)} ({NOMBRE_MEDIDA[n.iluminacion.mide]}) ·{" "}
            {n.ventilacion === "conjunta" ? "ventilación conjunta" : `ventilación ${textoFraccion(n.ventilacion.fraccion)} (${NOMBRE_MEDIDA[n.ventilacion.mide]})`}
            {n.densidad ? ` · densidad ${n.densidad.m2PorVivienda} m²/viv.` : ""}
          </div>
          {n.municipioIne && ine && n.municipioIne !== ine && (
            <p className="text-state-warn text-[11.5px]">Es de {n.municipio ?? "otro municipio"}, no del de la obra.</p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-2">
            <button type="button" className={BOTON} onClick={() => setEditando({ indice: i, borrador: borradorDe(n) })}>
              Editar
            </button>
            <button type="button" className={BOTON} onClick={() => guardarEnMisNormas(n)}>
              Guardar en Mis normas
            </button>
            <button type="button" className={`${BOTON} text-text-secondary`} onClick={() => setNormas(normas.filter((x) => x.id !== n.id))}>
              Quitar
            </button>
          </div>
          {editando?.indice === i && <Editor inicial={editando.borrador} onAplicar={aplicar} onCancelar={() => setEditando(null)} />}
        </div>
      ))}

      {editando?.indice === null && <Editor inicial={editando.borrador} onAplicar={aplicar} onCancelar={() => setEditando(null)} />}

      {!lleno && editando === null && (
        <div className="border-border-sub flex flex-col gap-2 border-t py-2">
          {sugeridas.length > 0 && (
            <label className="flex flex-col gap-1">
              <span className={ETIQUETA}>De Mis normas</span>
              <select value="" onChange={(e) => deMisNormas(e.target.value)} className={INPUT}>
                <option value="">Elige una…</option>
                {sugeridas.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.referencia}
                    {n.municipio ? ` · ${n.municipio}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          {plantillas.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className={ETIQUETA}>De una plantilla cotejada en su boletín (se revisa antes de aplicarla)</span>
              {plantillas.map((p) => (
                <div key={p.norma.plantilla} className="flex items-start gap-2">
                  <button type="button" className={`${BOTON} shrink-0`} onClick={() => dePlantilla(p)}>
                    Usar
                  </button>
                  <span className="text-[12px] leading-snug">
                    <span className="text-text-primary">{p.norma.referencia}</span>
                    <span className="text-text-disabled"> · {p.boletin}. {p.advertencia}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div>
            <button type="button" className={BOTON} onClick={() => setEditando({ indice: null, borrador: nuevoBorrador() })}>
              Nueva norma
            </button>
          </div>
        </div>
      )}

      <div className="border-border-sub flex flex-wrap items-center gap-2 border-t pt-2 pb-1">
        <span className="text-text-disabled text-[11.5px]">Mis normas: {misNormas.length}</span>
        <button type="button" className={BOTON} disabled={misNormas.length === 0} onClick={() => descargar("mis-normas-habitabilidad.json", JSON.stringify(misNormas, null, 2))}>
          Exportar
        </button>
        <label className={`${BOTON} cursor-pointer`}>
          Importar
          <input type="file" accept="application/json,.json" className="sr-only" onChange={importar} />
        </label>
      </div>
      {aviso && <p className="text-text-secondary text-[11.5px]">{aviso}</p>}
    </CollapsibleSection>
  );
}
