import { useState, type JSX } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle2, FileDown, FileText, Loader2, X, XCircle } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { Fila, ParKV, Sub } from "../components/edificio/controles";
import { Opciones } from "../components/justificacion/Decision";
import { EnlaceVisor } from "../components/proyecto/MapaNormativo";
import { Ayuda, NumeroOpcional, SiNo, Tarjeta, TextoOpcional } from "../components/ebss/controles";
import { FichasEbss } from "../components/ebss/FichasEbss";
import { useExportarEstudioBasico } from "../components/obra/useExportarMemoria";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import { art4, coordinadores, dotacionHigienica, type EstadoSupuesto, type LetraSupuesto } from "../lib/ebss/art4";
import { listaY } from "../lib/cte/redaccion";
import {
  amiantoObligatorio,
  cotaJornadas,
  estimarTrabajadores,
  jornadasDePeriodos,
  parseSeguridadSalud,
  pideJornadas,
  preguntaCabezaFamilia,
  UMBRAL_JORNADAS,
} from "../lib/ebss/datos";
import { seleccionDeFichas } from "../lib/ebss/propuesta";
import {
  ESTADOS_AMIANTO,
  NOMBRE_SERVICIO,
  SERVICIOS_AFECTADOS,
  type Amianto,
  type CentroAsistencial,
  type Coordinacion,
  type EstadoAmianto,
  type EstudioSeguridadSalud,
  type ManoDeObra,
  type PeriodoObra,
  type PresupuestoObra,
  type ServicioAfectado,
} from "../lib/ebss/tipos";
import { RUTA_ESTUDIO_BASICO } from "../lib/obra/entrega";

// =============================================================================
// Seguridad y salud (feature-35, paso 6): los datos de la obra para el estudio
// básico y sus fichas. Arriba, el art. 4 con la tabla de supuestos en vivo y el
// resultado; después, amianto, coordinación y entorno; a la derecha, las fichas
// que propone la app, cada una con su motivo, para marcar o quitar y editar.
// Nada tiene valor por defecto (principio 4): lo que no se declara sale
// pendiente en el documento y en «Antes de entregar». Cada cambio se guarda al
// momento, sin botón.
// =============================================================================

const euros = (v: number): string => `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const entero = (v: number): string => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

const ESTADO_SUPUESTO: Record<EstadoSupuesto, { texto: string; clase: string }> = {
  supera: { texto: "Se supera", clase: "text-state-fail font-semibold" },
  no_supera: { texto: "No se supera", clase: "text-state-ok" },
  sin_datos: { texto: "Sin datos", clase: "text-state-warn" },
};

/** El supuesto en pocas palabras, para la tabla en vivo; el texto del art. 4.1, en la ayuda. */
const SUPUESTO_CORTO: Record<LetraSupuesto, string> = {
  a: "Presupuesto de ejecución por contrata",
  b: "Duración y trabajadores a la vez",
  c: "Volumen de mano de obra",
  d: "Túneles, galerías, conducciones subterráneas o presas",
};

/** «c)», «c) y d)». */
const letras = (ls: readonly LetraSupuesto[]): string => listaY(ls.map((l) => `${l})`));

const NOMBRE_AMIANTO_CORTO: Record<EstadoAmianto, string> = {
  no_identificado: "No identificado",
  posible: "Posible",
  identificado: "Identificado",
};

/** Busca el centro asistencial en el mapa, cerca del municipio de la obra. */
function urlCentro(municipio: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`urgencias cerca de ${municipio}`)}`;
}

/** Añadir un periodo a la tabla de jornadas: solo con trabajadores y días. */
function NuevoPeriodo({ onAnadir }: { onAnadir: (p: PeriodoObra) => void }): JSX.Element {
  const [descripcion, setDescripcion] = useState<string | undefined>();
  const [trabajadores, setTrabajadores] = useState<number | undefined>();
  const [dias, setDias] = useState<number | undefined>();
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3.5 pb-2">
      <div className="min-w-0 flex-[1_1_140px]">
        <TextoOpcional id="ss-periodo-desc" etiqueta="Periodo" valor={descripcion} onChange={setDescripcion} placeholder="Periodo (opcional)" />
      </div>
      <NumeroOpcional id="ss-periodo-trab" etiqueta="Trabajadores del periodo" valor={trabajadores} onChange={setTrabajadores} unidad="trab." entero ancho="w-[56px]" />
      <NumeroOpcional id="ss-periodo-dias" etiqueta="Días del periodo" valor={dias} onChange={setDias} unidad="días" entero ancho="w-[56px]" />
      <button
        type="button"
        disabled={trabajadores === undefined || dias === undefined}
        onClick={() => {
          if (trabajadores === undefined || dias === undefined) return;
          onAnadir({ ...(descripcion ? { descripcion } : {}), trabajadores, dias });
          setDescripcion(undefined);
          setTrabajadores(undefined);
          setDias(undefined);
        }}
        className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary h-8 rounded border px-2.5 text-[12px] disabled:opacity-50"
      >
        Añadir periodo
      </button>
    </div>
  );
}

function Resultado({ a4 }: { a4: ReturnType<typeof art4> }): JSX.Element {
  const caja = "mx-3.5 mt-2 mb-2.5 flex items-start gap-2 rounded border px-3 py-2 text-[12.5px] leading-snug";
  if (a4.resultado === "completo") {
    return (
      <p role="status" className={`${caja} border-state-fail/40 bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))]`}>
        <XCircle size={14} className="text-state-fail mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <b className="font-semibold">Hace falta el estudio de seguridad y salud completo.</b>{" "}
          {a4.superados.length === 1 ? "Se da el supuesto" : "Se dan los supuestos"} {letras(a4.superados)} del art. 4.1: el básico no vale, y la app no
          redacta el completo.
        </span>
      </p>
    );
  }
  if (a4.resultado === "basico") {
    return (
      <p role="status" className={`${caja} border-state-ok/40 bg-[color-mix(in_srgb,var(--color-state-ok)_5%,var(--color-bg-primary))]`}>
        <CheckCircle2 size={14} className="text-state-ok mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <b className="font-semibold">Basta el estudio básico.</b> No se da ninguno de los supuestos del art. 4.1 del RD 1627/1997.
        </span>
      </p>
    );
  }
  return (
    <p role="status" className={`${caja} border-state-warn/40 bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]`}>
      <AlertTriangle size={14} className="text-state-warn mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <b className="font-semibold">Faltan datos para decidir.</b> Con lo declarado no se supera ningún supuesto; sin{" "}
        {a4.sinDatos.length === 1 ? "el supuesto" : "los supuestos"} {letras(a4.sinDatos)}, no se puede decir que baste el básico.
      </span>
    </p>
  );
}

export function SeguridadSaludPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  const { proyecto, actualizarSeguridadSalud } = useProyecto();
  const exportar = useExportarEstudioBasico();
  const ss: EstudioSeguridadSalud = proyecto.seguridadSalud ?? {};
  const dg = proyecto.datosGenerales;
  const nueva = dg.intervencion === "obra_nueva";

  /** Guarda lo saneado, como lo leería al importar: nada vacío ni mal formado. */
  const guardar = (next: EstudioSeguridadSalud) => actualizarSeguridadSalud(parseSeguridadSalud(next) ?? {}, new Date().toISOString());
  const setPresupuesto = <K extends keyof PresupuestoObra>(k: K, v: PresupuestoObra[K]) => guardar({ ...ss, presupuesto: { ...ss.presupuesto, [k]: v } });
  const setMano = <K extends keyof ManoDeObra>(k: K, v: ManoDeObra[K]) => guardar({ ...ss, manoDeObra: { ...ss.manoDeObra, [k]: v } });
  const setCoord = <K extends keyof Coordinacion>(k: K, v: Coordinacion[K]) => guardar({ ...ss, coordinacion: { ...ss.coordinacion, [k]: v } });
  const setEntorno = <K extends keyof NonNullable<EstudioSeguridadSalud["entorno"]>>(k: K, v: NonNullable<EstudioSeguridadSalud["entorno"]>[K]) =>
    guardar({ ...ss, entorno: { ...ss.entorno, [k]: v } });
  const setCentro = <K extends keyof CentroAsistencial>(k: K, v: CentroAsistencial[K]) =>
    setEntorno("centroAsistencial", { ...(ss.entorno?.centroAsistencial ?? { nombre: "" }), [k]: v });
  const setServicio = (s: ServicioAfectado, v: boolean) => setEntorno("servicios", { ...ss.entorno?.servicios, [s]: v });
  const setAmianto = (a: Partial<Amianto>) => {
    const estado = a.estado ?? ss.amianto?.estado;
    if (estado) guardar({ ...ss, amianto: { ...ss.amianto, ...a, estado } });
  };

  const a4 = art4(ss);
  const m = ss.manoDeObra;
  const est = estimarTrabajadores(ss.presupuesto?.pem, m?.estimacion, m?.plazoDias);
  const cota = cotaJornadas(m);
  const coord = coordinadores(ss.coordinacion);
  const dot = dotacionHigienica(m?.maxTrabajadores, ss.serviciosHigienicos);
  const amiantoPide = amiantoObligatorio(proyecto);
  const hayAmianto = ss.amianto?.estado === "posible" || ss.amianto?.estado === "identificado";
  const centro = ss.entorno?.centroAsistencial;
  const fichas = seleccionDeFichas(proyecto);

  const BOTON =
    "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[12.5px] disabled:cursor-wait disabled:opacity-60";

  return (
    <>
      <Topbar moduleLabel="Seguridad y salud" moduleGroup="Proyecto" onMenuOpen={openDrawer} />
      <div className="scroll-hide flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-9">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex max-w-[640px] flex-col gap-1">
              <h1 className="text-text-primary text-[22px] leading-tight font-semibold tracking-[-0.01em]">Seguridad y salud</h1>
              <p className="text-text-secondary text-[12.5px] leading-normal">
                Los datos de la obra para el estudio básico (RD 1627/1997) y sus fichas de riesgos. La app propone las fichas de lo que tiene esta
                obra; tú marcas, quitas y editas. Lo que no declares sale como pendiente.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Link to={`/p/${proyecto.id}/${RUTA_ESTUDIO_BASICO}`} className={BOTON}>
                Leer el estudio
              </Link>
              <button type="button" onClick={exportar.word} disabled={exportar.ocupado !== null} className={BOTON} aria-label="Estudio básico en Word">
                {exportar.ocupado === "word" ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <FileText size={13} aria-hidden="true" />}
                Word
              </button>
              <button
                type="button"
                onClick={exportar.pdf}
                disabled={exportar.ocupado !== null}
                aria-label="Estudio básico en PDF"
                className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg inline-flex h-8 items-center gap-1.5 rounded px-3 text-[12.5px] font-medium disabled:cursor-wait disabled:opacity-60"
              >
                {exportar.ocupado === "pdf" ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <FileDown size={13} aria-hidden="true" />}
                PDF
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
              {/* ── Art. 4 ─────────────────────────────────────────────── */}
              <Tarjeta rotulo="Art. 4 del RD 1627/1997" titulo="¿Basta el estudio básico?">
                <Sub>Presupuesto</Sub>
                <Fila etiqueta="Presupuesto de ejecución material" htmlFor="ss-pem">
                  <NumeroOpcional id="ss-pem" valor={ss.presupuesto?.pem} onChange={(v) => setPresupuesto("pem", v)} unidad="€" ancho="w-[120px]" />
                </Fila>
                <Fila etiqueta="Gastos generales" htmlFor="ss-gg">
                  <NumeroOpcional id="ss-gg" valor={ss.presupuesto?.gg_pct} onChange={(v) => setPresupuesto("gg_pct", v)} unidad="%" cero max={100} ancho="w-[64px]" />
                </Fila>
                <Fila etiqueta="Beneficio industrial" htmlFor="ss-bi">
                  <NumeroOpcional id="ss-bi" valor={ss.presupuesto?.bi_pct} onChange={(v) => setPresupuesto("bi_pct", v)} unidad="%" cero max={100} ancho="w-[64px]" />
                </Fila>
                <Fila etiqueta="IVA" htmlFor="ss-iva">
                  <NumeroOpcional id="ss-iva" valor={ss.presupuesto?.iva_pct} onChange={(v) => setPresupuesto("iva_pct", v)} unidad="%" cero max={100} ancho="w-[64px]" />
                </Fila>
                {a4.pec ? (
                  <>
                    <ParKV k="PEM + GG + BI" v={euros(a4.pec.base)} />
                    <ParKV k={`IVA (${a4.pec.iva_pct.toLocaleString("es-ES")} %)`} v={euros(a4.pec.iva)} />
                    <ParKV k="Presupuesto de ejecución por contrata" v={euros(a4.pec.pec)} />
                  </>
                ) : (
                  <Ayuda>Sin valores por defecto: el PEC sale con el PEM y los tres porcentajes (un 0 % vale).</Ayuda>
                )}
                {a4.avisoPec && (
                  <Ayuda aviso>
                    El PEC queda a {euros(a4.avisoPec.diferencia)} del umbral (un {a4.avisoPec.pct.toLocaleString("es-ES")} %): si el presupuesto sube, hace
                    falta el estudio completo.
                  </Ayuda>
                )}

                <Sub>Duración y mano de obra</Sub>
                <Fila etiqueta="Plazo de ejecución" htmlFor="ss-plazo">
                  <NumeroOpcional id="ss-plazo" valor={m?.plazoDias} onChange={(v) => setMano("plazoDias", v)} unidad="días lab." entero ancho="w-[64px]" />
                </Fila>
                <Fila etiqueta="Máximo de trabajadores a la vez" htmlFor="ss-trab">
                  <NumeroOpcional id="ss-trab" valor={m?.maxTrabajadores} onChange={(v) => setMano("maxTrabajadores", v)} unidad="trab." entero ancho="w-[64px]" />
                </Fila>
                <Ayuda>Cuentan los de todas las empresas, subcontratas y autónomos que coincidan en la obra.</Ayuda>
                <details className="border-border-sub border-t">
                  <summary className="text-accent hover:text-accent-hover cursor-pointer px-3.5 py-2 text-[12.5px]">Ayuda para estimar los trabajadores</summary>
                  <Fila etiqueta="Parte del PEM que es mano de obra" htmlFor="ss-mo">
                    <NumeroOpcional
                      id="ss-mo"
                      valor={m?.estimacion?.manoObra_pct}
                      onChange={(v) => setMano("estimacion", { ...m?.estimacion, manoObra_pct: v })}
                      unidad="%"
                      max={100}
                      ancho="w-[64px]"
                    />
                  </Fila>
                  <Fila etiqueta="Coste medio de la hora" htmlFor="ss-hora">
                    <NumeroOpcional
                      id="ss-hora"
                      valor={m?.estimacion?.costeHora}
                      onChange={(v) => setMano("estimacion", { ...m?.estimacion, costeHora: v })}
                      unidad="€/h"
                      ancho="w-[64px]"
                    />
                  </Fila>
                  <Ayuda>
                    {est
                      ? `Unas ${entero(est.jornadas)} jornadas de 8 h: una media de ${est.trabajadoresMedios} ${est.trabajadoresMedios === 1 ? "trabajador" : "trabajadores"} en el plazo. Es una media; el máximo a la vez suele ser mayor, y el que cuenta es el que declaras arriba.`
                      : "Con el PEM, el plazo, la parte de mano de obra y el coste de la hora, la app estima las jornadas y la media de trabajadores. No es un dato del proyecto."}
                  </Ayuda>
                </details>
                {pideJornadas(m) && (
                  <>
                    <Fila etiqueta="Volumen de mano de obra" htmlFor="ss-jornadas">
                      <NumeroOpcional
                        id="ss-jornadas"
                        valor={m?.periodos && m.periodos.length > 0 ? jornadasDePeriodos(m.periodos) : m?.jornadas}
                        onChange={(v) => setMano("jornadas", v)}
                        unidad="jornadas"
                        entero
                        ancho="w-[72px]"
                        disabled={(m?.periodos?.length ?? 0) > 0}
                      />
                    </Fila>
                    <Ayuda>
                      El plazo por el máximo a la vez da {cota !== undefined ? entero(cota) : "—"}, más de {UMBRAL_JORNADAS}: hacen falta las jornadas, la suma de
                      los días de trabajo de todos los trabajadores. Con la tabla de periodos, manda su suma (Σ trabajadores × días).
                    </Ayuda>
                    {(m?.periodos ?? []).map((pe, i) => (
                      <div key={i} className="border-border-sub text-text-secondary flex items-center gap-2 border-t px-3.5 py-1.5 text-[12.5px]">
                        <span className="min-w-0 flex-1 truncate">{pe.descripcion ?? `Periodo ${i + 1}`}</span>
                        <span className="text-text-primary font-mono text-[12px]">
                          {pe.trabajadores} × {pe.dias} = {entero(pe.trabajadores * pe.dias)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Quitar el periodo ${pe.descripcion ?? i + 1}`}
                          onClick={() => setMano("periodos", (m?.periodos ?? []).filter((_, j) => j !== i))}
                          className="text-text-disabled hover:text-state-fail p-1"
                        >
                          <X size={12} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <NuevoPeriodo onAnadir={(pe) => setMano("periodos", [...(m?.periodos ?? []), pe])} />
                  </>
                )}

                <Sub>Tipo de obra</Sub>
                <Fila etiqueta="Túneles, galerías, conducciones subterráneas o presas">
                  <SiNo etiqueta="Túneles, galerías, conducciones subterráneas o presas" valor={ss.subterraneas} onChange={(v) => guardar({ ...ss, subterraneas: v })} />
                </Fila>
                <Ayuda>Las zanjas a cielo abierto para las acometidas no cuentan (Guía del INSST).</Ayuda>

                <Sub>Supuestos del art. 4.1</Sub>
                <div className="overflow-x-auto px-3.5">
                  <table className="w-full min-w-[400px] text-left text-[12px] leading-snug">
                    <thead>
                      <tr className="text-text-disabled border-border-sub border-b text-[10.5px]">
                        <th scope="col" className="py-1 pr-2 font-medium">
                          Supuesto
                        </th>
                        <th scope="col" className="py-1 pr-2 font-medium">
                          Umbral
                        </th>
                        <th scope="col" className="py-1 pr-2 font-medium">
                          Proyecto
                        </th>
                        <th scope="col" className="py-1 font-medium">
                          ¿Se supera?
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {a4.supuestos.map((s) => (
                        <tr key={s.letra} className="border-border-sub border-b align-top last:border-b-0">
                          <td className="text-text-secondary py-1.5 pr-2" title={s.titulo}>
                            <b className="text-text-primary font-mono">{s.letra})</b> {SUPUESTO_CORTO[s.letra]}
                            {s.nota && <span className="text-text-disabled block text-[11px]">{s.nota}</span>}
                          </td>
                          <td className="text-text-secondary py-1.5 pr-2 font-mono text-[11.5px]">{s.umbral}</td>
                          <td className="text-text-primary py-1.5 pr-2 font-mono text-[11.5px]">{s.proyecto}</td>
                          <td className={`py-1.5 whitespace-nowrap ${ESTADO_SUPUESTO[s.estado].clase}`}>{ESTADO_SUPUESTO[s.estado].texto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Resultado a4={a4} />
              </Tarjeta>

              {/* ── Amianto ────────────────────────────────────────────── */}
              <Tarjeta rotulo="RD 396/2006" titulo="Amianto" aside={amiantoPide ? <span className="text-text-disabled shrink-0 pt-1 text-[11px]">obligatorio</span> : undefined}>
                {nueva && (
                  <>
                    <Fila etiqueta="¿Se derriba una construcción existente?">
                      <SiNo etiqueta="Se derriba una construcción existente" valor={ss.demolicionPrevia} onChange={(v) => guardar({ ...ss, demolicionPrevia: v })} />
                    </Fila>
                    <Ayuda>Con derribo previo, el amianto se declara como en una obra sobre un edificio existente, y la app propone las fichas del derribo.</Ayuda>
                  </>
                )}
                <Fila etiqueta="Materiales con amianto" columna>
                  <Opciones<EstadoAmianto | "">
                    etiqueta="Materiales con amianto"
                    opciones={ESTADOS_AMIANTO.map((e) => ({ valor: e, label: NOMBRE_AMIANTO_CORTO[e] }))}
                    valor={ss.amianto?.estado ?? ""}
                    onChange={(v) => v !== "" && setAmianto({ estado: v })}
                    pequenas
                  />
                </Fila>
                {!ss.amianto && amiantoPide && (
                  <Ayuda aviso>En obra sobre un edificio existente, el estudio tiene que decir si hay o puede haber amianto (art. 10.2).</Ayuda>
                )}
                {hayAmianto && (
                  <>
                    <Fila etiqueta="Dónde está o puede estar" htmlFor="ss-amianto-ubi" columna>
                      <TextoOpcional
                        id="ss-amianto-ubi"
                        valor={ss.amianto?.ubicacion}
                        onChange={(v) => setAmianto({ ubicacion: v })}
                        placeholder="Bajantes de fibrocemento del patio"
                      />
                    </Fila>
                    <Fila etiqueta="Tipo de material" columna>
                      <Opciones<"friable" | "no" | "">
                        etiqueta="Tipo de material con amianto"
                        opciones={[
                          { valor: "no", label: "No friable" },
                          { valor: "friable", label: "Friable" },
                          { valor: "", label: "No se sabe" },
                        ]}
                        valor={ss.amianto?.friable === undefined ? "" : ss.amianto.friable ? "friable" : "no"}
                        onChange={(v) => {
                          const { friable: _, ...resto } = ss.amianto!;
                          guardar({ ...ss, amianto: v === "" ? resto : { ...resto, friable: v === "friable" } });
                        }}
                        pequenas
                      />
                    </Fila>
                    <Ayuda>No friable: fibrocemento, amianto-vinilo. Friable: proyectado, calorifugados, paneles aislantes.</Ayuda>
                  </>
                )}
              </Tarjeta>

              {/* ── Coordinación ───────────────────────────────────────── */}
              <Tarjeta rotulo="Art. 3 del RD 1627/1997" titulo="Coordinación">
                <Fila etiqueta="¿Intervienen varios proyectistas?">
                  <SiNo etiqueta="Intervienen varios proyectistas" valor={ss.coordinacion?.variosProyectistas} onChange={(v) => setCoord("variosProyectistas", v)} />
                </Fila>
                <Ayuda aviso={coord.proyecto.estado === "sin_datos"}>{coord.proyecto.motivo}</Ayuda>
                <Fila etiqueta="¿Más de una empresa, o empresa y autónomos?">
                  <SiNo etiqueta="Más de una empresa, o empresa y autónomos" valor={ss.coordinacion?.variasEmpresas} onChange={(v) => setCoord("variasEmpresas", v)} />
                </Fila>
                <Ayuda aviso={coord.ejecucion.estado === "sin_datos"}>{coord.ejecucion.motivo}</Ayuda>
                {preguntaCabezaFamilia(proyecto) && (
                  <>
                    <Fila etiqueta="¿El promotor contrata él mismo para su vivienda?">
                      <SiNo etiqueta="El promotor contrata él mismo para su vivienda" valor={ss.coordinacion?.cabezaFamilia} onChange={(v) => setCoord("cabezaFamilia", v)} />
                    </Fila>
                    <Ayuda>
                      Cabeza de familia que construye o reforma su propia vivienda y contrata directamente a autónomos (art. 2.3). Con «sí», el estudio
                      añade el párrafo; sin contestar, no.
                    </Ayuda>
                  </>
                )}
              </Tarjeta>

              {/* ── Entorno ────────────────────────────────────────────── */}
              <Tarjeta rotulo="Apartados 3 y 9 del estudio" titulo="Entorno de la obra">
                <Sub>Centro asistencial más próximo</Sub>
                <Fila etiqueta="Nombre" htmlFor="ss-centro" columna>
                  <div className="flex items-center gap-2">
                    <TextoOpcional
                      id="ss-centro"
                      valor={centro?.nombre}
                      onChange={(v) => setEntorno("centroAsistencial", v ? { ...centro, nombre: v } : undefined)}
                      placeholder="Hospital, centro de salud con urgencias…"
                    />
                    <EnlaceVisor href={urlCentro(dg.municipio)} etiqueta={`Buscar las urgencias cerca de ${dg.municipio} en el mapa`} />
                  </div>
                </Fila>
                <Fila etiqueta="Dirección" htmlFor="ss-centro-dir" columna>
                  <TextoOpcional id="ss-centro-dir" valor={centro?.direccion} onChange={(v) => setCentro("direccion", v)} disabled={!centro} />
                </Fila>
                <Fila etiqueta="Distancia y tiempo de llegada">
                  <span className="flex gap-1.5">
                    <NumeroOpcional id="ss-centro-km" etiqueta="Distancia al centro" valor={centro?.distancia_km} onChange={(v) => setCentro("distancia_km", v)} unidad="km" decimales={1} ancho="w-[56px]" disabled={!centro} />
                    <NumeroOpcional id="ss-centro-min" etiqueta="Tiempo de llegada" valor={centro?.tiempo_min} onChange={(v) => setCentro("tiempo_min", v)} unidad="min" entero ancho="w-[48px]" disabled={!centro} />
                  </span>
                </Fila>
                {!centro && <Ayuda>Primero el nombre; el mapa busca las urgencias cerca del municipio de la obra.</Ayuda>}

                <Sub>Otras actividades</Sub>
                <Fila etiqueta="¿Se ocupa la vía pública?">
                  <SiNo etiqueta="Se ocupa la vía pública" valor={ss.entorno?.viaPublica} onChange={(v) => setEntorno("viaPublica", v)} />
                </Fila>
                {!nueva && (
                  <Fila etiqueta="¿Sigue en uso el edificio o el local durante la obra?">
                    <SiNo etiqueta="El edificio o el local sigue en uso durante la obra" valor={ss.entorno?.edificioEnUso} onChange={(v) => setEntorno("edificioEnUso", v)} />
                  </Fila>
                )}

                <Sub>Servicios afectados</Sub>
                {SERVICIOS_AFECTADOS.map((s) => (
                  <Fila key={s} etiqueta={NOMBRE_SERVICIO[s]}>
                    <SiNo etiqueta={NOMBRE_SERVICIO[s]} valor={ss.entorno?.servicios?.[s]} onChange={(v) => setServicio(s, v)} si="Existe" no="No existe" />
                  </Fila>
                ))}
                {ss.entorno?.servicios?.linea_aerea === true && (
                  <>
                    <Fila etiqueta="Tensión de las líneas aéreas" htmlFor="ss-kv">
                      <NumeroOpcional id="ss-kv" valor={ss.entorno?.tensionLineas_kV} onChange={(v) => setEntorno("tensionLineas_kV", v)} unidad="kV" decimales={1} ancho="w-[64px]" />
                    </Fila>
                    <Ayuda>Para las distancias de la tabla 1 del RD 614/2001. Más de 1 kV es alta tensión (anexo II, apartado 4).</Ayuda>
                  </>
                )}
              </Tarjeta>

              {/* ── Medios, servicios higiénicos y planos ──────────────── */}
              <Tarjeta rotulo="Apartados 4 y 6 del estudio" titulo="Medios y servicios higiénicos">
                <Fila etiqueta="Grúa torre">
                  <SiNo etiqueta="Grúa torre" valor={ss.medios?.gruaTorre} onChange={(v) => guardar({ ...ss, medios: { ...ss.medios, gruaTorre: v } })} />
                </Fila>
                <Fila etiqueta="Grúa móvil autopropulsada">
                  <SiNo etiqueta="Grúa móvil autopropulsada" valor={ss.medios?.gruaMovil} onChange={(v) => guardar({ ...ss, medios: { ...ss.medios, gruaMovil: v } })} />
                </Fila>
                <Sub>Servicios higiénicos (VII Convenio)</Sub>
                {dot ? (
                  <>
                    <ParKV k={`Con ${dot.trabajadores} ${dot.trabajadores === 1 ? "trabajador" : "trabajadores"} a la vez`} v={`${dot.convenio.lavabos} lav. · ${dot.convenio.duchas} duch. · ${dot.convenio.retretes} ret.`} />
                    {dot.localPrimerosAuxilios && <Ayuda>Más de 50 trabajadores: hace falta local de primeros auxilios (art. 234.3).</Ayuda>}
                  </>
                ) : (
                  <Ayuda>La dotación sale del máximo de trabajadores a la vez.</Ayuda>
                )}
                <Fila etiqueta="¿Obra de corta duración o escasa importancia?">
                  <SiNo
                    etiqueta="Obra de corta duración o escasa importancia"
                    valor={ss.serviciosHigienicos?.cortaDuracion}
                    onChange={(v) => guardar({ ...ss, serviciosHigienicos: { ...ss.serviciosHigienicos, cortaDuracion: v } })}
                  />
                </Fila>
                {ss.serviciosHigienicos?.cortaDuracion && (
                  <Fila etiqueta="Solución alternativa" htmlFor="ss-alternativa" columna>
                    <TextoOpcional
                      id="ss-alternativa"
                      valor={ss.serviciosHigienicos?.alternativa}
                      onChange={(v) => guardar({ ...ss, serviciosHigienicos: { ...ss.serviciosHigienicos, alternativa: v } })}
                      placeholder="Aseo de la vivienda, cedido por el promotor"
                    />
                  </Fila>
                )}
                <Fila etiqueta="Reparto por sexos (opcional)">
                  <span className="flex gap-1.5">
                    <NumeroOpcional
                      id="ss-hombres"
                      etiqueta="Hombres"
                      valor={ss.serviciosHigienicos?.hombres}
                      onChange={(v) => guardar({ ...ss, serviciosHigienicos: { ...ss.serviciosHigienicos, hombres: v } })}
                      unidad="H"
                      entero
                      cero
                      ancho="w-[48px]"
                    />
                    <NumeroOpcional
                      id="ss-mujeres"
                      etiqueta="Mujeres"
                      valor={ss.serviciosHigienicos?.mujeres}
                      onChange={(v) => guardar({ ...ss, serviciosHigienicos: { ...ss.serviciosHigienicos, mujeres: v } })}
                      unidad="M"
                      entero
                      cero
                      ancho="w-[48px]"
                    />
                  </span>
                </Fila>
                <Ayuda>Con el reparto, el estudio añade la dotación que recomienda la Guía del INSST.</Ayuda>
                <Sub>Documentación gráfica</Sub>
                <Fila etiqueta="Planos del estudio" htmlFor="ss-planos">
                  <div className="w-[140px]">
                    <TextoOpcional id="ss-planos" valor={ss.planos} onChange={(v) => guardar({ ...ss, planos: v })} placeholder="SS01–SS02" />
                  </div>
                </Fila>
                <Ayuda>La app no dibuja los planos; el estudio remite a los que indiques.</Ayuda>
              </Tarjeta>
            </div>

            {/* ── Fichas ─────────────────────────────────────────────── */}
            <section aria-label="Fichas del estudio" className="flex min-w-0 flex-[1_1_520px] flex-col gap-2">
              <div className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">Fichas del estudio</div>
              {a4.resultado === "completo" && (
                <p className="text-state-fail text-[12.5px]">Con el estudio completo, las fichas no se imprimen: el documento solo dice que hace falta.</p>
              )}
              <FichasEbss fichas={fichas} sel={ss.seleccion} onSeleccion={(s) => guardar({ ...ss, seleccion: s })} />
            </section>
          </div>
        </div>
      </div>
      {exportar.modal}
    </>
  );
}
