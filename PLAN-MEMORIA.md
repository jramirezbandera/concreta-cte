# Memoria como la del estudio — plan por fases

> Estado: **fases 0 a 4 hechas** · 2026-10-11 (fase 1 en [feature-28.md](feature-28.md), fase 2
> en [feature-29.md](feature-29.md), fase 3 en [feature-30.md](feature-30.md), fase 4 en
> [feature-31.md](feature-31.md)). Siguiente: fase 5.
> Origen: comparación de la memoria de la app con tres memorias de ejecución reales del estudio,
> en `ejemplos/` (ignorada por git: son datos de clientes):
> - plurifamiliar de 6 viviendas (`01_MEM_26_05_2025.docx`);
> - unifamiliar aislada (`01_MEM_PREP_20_01_26.docx` y su PDF maquetado `101_MEM_MEMORIA_MED.pdf`);
> - cambio de uso de local a vivienda (`25P011_MEMORIA.doc`).
>
> Cada fase se escribe como su `feature-N.md` antes de empezar (la primera, feature-28) y termina
> con tests en verde, la foto del expediente ([fotoExpediente.ts](src/lib/obra/test/fotoExpediente.ts))
> cambiando solo donde se espera, y el Word abierto en Word.

---

## 1. Qué se ha visto, en una página

**En contenido técnico la app ya supera a los ejemplos.** Las memorias del estudio se hacen
rellenando plantillas: fichas con casillas ☒, tablas «Norma | Proyecto» y texto del DB pegado sin
datos del proyecto. Eso arrastra tres tipos de fallo.

- **Normativa derogada:**
  - HS 3 de 2006, con caudales por ocupante;
  - HE 4 y HE 5 de 2013;
  - RITE de 1998 (ITE);
  - RIPCI de 1993;
  - SUA anterior a 2019: 150 N, «UNE EN 2600».
- **Restos de otros proyectos:**
  - ficha del RITE de otra obra;
  - «locales comerciales» que no existen;
  - «UNELCO-ENDESA»;
  - la Ordenanza de Málaga en un proyecto de Benalmádena.
- **Contradicciones internas:**
  - grupo de presión sí/no;
  - termo eléctrico frente a aerotermia;
  - HE 6 al 50 % de las plazas.

HR y HE 0/HE 1 van pegados como imagen.

**Lo que hay que tomar de ellos es el esqueleto, no el contenido:**

| Hoy en la app | En la memoria del estudio |
|---|---|
| Orden del registry: HS, SI, SUA, HR, HE, REBT, sin numerar. | «3. Cumplimiento del CTE»: 3.1 SE, 3.2 SI (3.2.1 SI 1…), 3.3 SUA, 3.4 HS, 3.5 HR, 3.6 HE. Después «4. Otros reglamentos» y «5. Anejos», con el 5.3 «Instalaciones del edificio». |
| Sin cabecera ni pie (una sola sección en [render.ts](src/lib/docx/render.ts)). | Cabecera del estudio (nombre, colegiado, dirección, teléfonos) y pie con el título del proyecto y «Página N». |
| Prosa con una sola tabla por apartado (`MemoriaDoc.tabla`). | Tablas «Parámetro \| Norma \| Proyecto» con notas numeradas, que es lo que el revisor busca de un vistazo. |
| Línea de fuentes con jerga interna («datos de El edificio · motor 0.2.0», «(supuestos)»). | Cita corta del DB y su tabla. |
| Ninguna remisión. | «Ver planos», «se desarrolla en el anejo», con el cálculo extenso (tramos, circuitos) en el anejo de instalaciones. |
| Nada de habitabilidad, RITE, HE 3, ICT ni accesibilidad autonómica. | Los traen todos, aunque mal rellenados. |

**Y hay errores propios de la app** en el caso «Reforma: local a vivienda» (fase 1).

## 2. Principios

1. **No imitar el contenido de las plantillas.** Nada de transcribir el DB ni de rellenar filas
   que no aplican con «-». El «no aplica» va en una línea, con motivo y cita, como ahora.
2. **El documento sale listo para pegar.** Con la numeración, la cabecera y el pie del estudio, y
   con estilos integrados de Word (Heading 1–3) para que el índice funcione.
3. **Un dato, una fuente.** Si la memoria dice algo del sistema de ACS, del garaje o de los
   contadores, lo dice igual en todos los apartados. La fase 7 lo convierte en comprobaciones.
4. **Lo que depende del municipio no se supone.** Habitabilidad, densidad y accesibilidad
   autonómica son datos que declara el proyectista, con su referencia (fase 5). Si la app ofrece
   una norma, es una plantilla verificada y citada, y el proyectista la elige; nunca se aplica en
   silencio.
5. **Lo supuesto no se imprime como si fuera del proyecto.** En lugar de escribir «(supuestos)»
   en el texto, se lista en «Antes de entregar».

## 3. Fases

| Fase | Contenido | Hito / criterio de hecho |
|---|---|---|
| **0 · Verificación y decisiones** | Preguntas de normativa al agente `cte-normativa` (§4) y decisiones del usuario (§6). Sin código. | Verificación hecha el 2026-10-10 en [research/verificacion-memoria.md](research/verificacion-memoria.md) (K-MEM.1–16; resumen en §4.1). Falta: el §6 y cotejar en PDF lo marcado «LEÍDO (web)». |
| **1 · Errores de la app** ✅ | Lo del §5.1: HR que contradice su alcance, notas de alcance duplicadas, rótulos y erratas, REBT frente a HE 6. | El caso de reforma sin contradicciones; la foto del expediente cambia solo en los textos tocados. |
| **2 · Esqueleto del documento** ✅ | Orden y numeración del CTE, cabecera y pie, datos del estudio y del proyecto, título, apartado inicial con cuadro de aplicabilidad, línea de fuentes limpia y «Normativa aplicada» al final (§5.2). | La memoria de la unifamiliar se pega en la plantilla del estudio sin retocar; el índice de Word la recoge. |
| **3 · Obra existente redactada como intervención** ✅ | Cada módulo dice qué existe y no se toca, y qué se proyecta; lo existente lo cubre el no empeoramiento (§5.3). | En el caso de reforma ningún apartado describe el edificio entero; SUA 1 redactado. |
| **4 · Tablas «Norma \| Proyecto»** ✅ | `MemoriaDoc` con varias tablas y notas; tablas en SI 1, SI 3, SI 4, SI 6, SUA 1–4 y SUA 8; HR con la maqueta de la ficha K.1 (§5.4). | Cada apartado de SI y SUA se lee en diagonal por su tabla; el texto no repite la tabla. |
| **5 · Habitabilidad (municipal y autonómica)** | Iluminación y ventilación por estancia, densidad de viviendas, con la norma declarada por el proyectista (§5.5). | El caso de reforma justifica huecos y densidad con la norma que el usuario declara, citada en cada fila. |
| **6 · Anejo de cálculo de instalaciones** | Anejo 5.3: HS 4 por tramos, HS 5 por aparato y arquetas, REBT con circuitos, derivación individual y tierra; la memoria remite a él y a los planos (§5.6). | El anejo sustituye al de CYPE en la unifamiliar del ejemplo, sin contradecir la memoria. |
| **7 · Otros reglamentos y coherencia** | HE 2/RITE, HE 3, ficha ICT del arquitecto, accesibilidad autonómica; comprobaciones cruzadas en «Antes de entregar» (§5.7). | Las contradicciones de los ejemplos (ACS, grupo de presión, garaje) no se pueden dar sin un aviso. |

**Orden.**
- La 1 va primero: son errores de feature-27, recién cerrada.
- La 2 es la de más impacto por esfuerzo, porque convierte la salida en algo que se pega tal cual.
- La 3 antes que la 4, para que las tablas nazcan ya sabiendo qué es intervención.
- La 5 depende de la 0 (normas verificadas) y de los datos de estancias, que puede leer la IA del
  cuadro de superficies (feature-13).
- La 6 es la más grande, sobre todo por el REBT aguas abajo.
- Dentro de la 7, cada módulo es independiente.

## 4. Fase 0 · Qué verificar antes de escribir código

Al agente `cte-normativa`, con cita y versión:

1. **HE 0 y HE 1 en un cambio de uso**: si hay un umbral de superficie útil (¿50 m²?) por debajo
   del cual no se exige la verificación global. Desde 5c7cdec (`he1SegunGlobal`), un cambio de uso
   lleva HE 0 y HE 1 a HULC: si el umbral existe, por debajo de él debe volver HE 1 por elementos.
   El ejemplo tiene 49,66 m²: decide el caso.
2. **HS 3 en edificios existentes**: qué se admite cuando la expulsión no puede llegar a cubierta
   (vivienda en planta baja de un edificio existente).
3. **RITE**: contenido mínimo de la justificación en una vivienda. Documento exigible por potencia
   (art. 15: sin documentación, memoria técnica o proyecto) y qué IT conviene resumir.
4. **HE 3**: ámbito en vivienda (interior excluido) y en zonas comunes de plurifamiliar, obra nueva
   y reforma.
5. **ICT**: cuándo es obligatoria (RD 346/2011 y modificaciones posteriores; propiedad
   horizontal) y qué previsiones del proyecto de arquitectura recoge la ficha.
6. **Habitabilidad en Andalucía**: qué norma autonómica fija, si fija alguna, las condiciones de
   iluminación y ventilación de la vivienda libre, y con qué fracción. Una búsqueda web cita el
   «Decreto 141/2009» con 1/10; **no se da por buena hasta leer el BOJA**. Lo mismo para los
   PGOU que el usuario use más (Málaga, Benalmádena): artículo, fracción, si iluminación y
   ventilación van juntas o separadas, y qué estancias computan.
7. **Accesibilidad autonómica**: Decreto 293/2009 de Andalucía, ámbito en vivienda libre, en
   cambio de uso y en zonas comunes.

### 4.1 Lo que ha salido (2026-10-10)

Detalle, citas y grado de confirmación en
[research/verificacion-memoria.md](research/verificacion-memoria.md). Lo marcado «LEÍDO (web)» se
leyó con un lector que resume: hay que cotejarlo palabra por palabra antes de imprimirlo.

| # | Resultado | Para la app |
|---|---|---|
| 1 | **HE 0** en un cambio de uso solo si la superficie útil que cambia **supera 50 m²**, sea característico o parcial (verificado en imagen). **HE 1 no tiene umbral**: K, q_sol, Ulim de toda la envolvente de esa unidad, permeabilidad y condensaciones. | HE 1 a HULC en cambio de uso sigue siendo correcto (5c7cdec). Corregir que el umbral de HE 0 se salte en el cambio de uso característico (`reglasExistentes.ts`, K-MEM.1). |
| 2 | **HS 3** no tiene excepción para existentes cuando la expulsión no llega a cubierta. La vía es la flexibilidad (Parte I art. 2.3): ventilación mecánica y boca a ≥ 3 m de huecos y zonas ocupadas, por analogía con HS 6 ap. 3.3. | Decisión «expulsión» en obra existente, con el párrafo de flexibilidad y el aviso de ordenanza municipal. |
| 3 | **RITE**: < 5 kW, sin documento; 5–70 kW, memoria técnica; > 70 kW, proyecto (art. 15, RD 178/2021). | Ficha resumen de IT 1.1, 1.2 y 1.3 que remite a la memoria técnica (fase 7). |
| 4 | **HE 3**: excluye el interior de las viviendas. En zonas comunes: VEEI ≤ 4,0, potencia ≤ 10 W/m² (aparcamiento ≤ 5), control manual y horario o por presencia; la luz natural no se exige. | Fase 7. |
| 5 | **ICT** obligatoria en propiedad horizontal (o arrendamiento de más de un año con más de una vivienda), en construcción o rehabilitación integral. La unifamiliar aislada no la necesita. El arquitecto reserva recintos (RITU hasta PB+3 y 16 PAU) y remite al proyecto técnico. | Fase 7. |
| 6 | **Habitabilidad en Andalucía**: no hay norma autonómica con fracciones para la vivienda libre (Ley 5/2025, sin cifras). La de VPO (Orden 21-07-2008, art. 7) pide 10 % de iluminación y 5 % de ventilación, sin baños ni aseos. **El «Decreto 141/2009» no es andaluz**: es canario, de instalaciones eléctricas. | La fracción la fija el PGOU: sin plantilla autonómica para vivienda libre. Plantilla VPO solo si la vivienda es protegida (§5.5). |
| 6b | **PGOU de Málaga** (art. 12.2.34, densidad / 70, y los artículos de huecos) y **PGOU de Benalmádena** (art. 136, remite a la Orden de 1944, ¿1/8?): **sin confirmar**, solo están en PDF. La modificación del art. 136 de Benalmádena (2022) fija densidades por zonas para **frenar la conversión de locales en viviendas**. | Sin plantillas municipales hasta leer los textos. Aviso en «local a vivienda» en Benalmádena. |
| 7 | **Decreto 293/2009**: zonas comunes que se construyen, reforman o cambian de uso; nada en el interior de la vivienda libre; en reforma, solo lo modificado; convive con SUA 9 y se cumple el más exigente. No hay «Decreto 64/2012». | Fase 7. |

## 5. Por fase: qué cambia

### 5.1 Fase 1 · Errores de la app

Comprobados en la salida del caso «Reforma: local a vivienda»:

- **HR.** El párrafo de alcance dice «se aplica a la zona que cambia de uso a vivienda», y el
  cuerpo dice justo después que la obra «queda excluida del ámbito del DB-HR (Introducción II d)».
  El cuerpo debe leer `aplicabilidadEfectiva`, no su propio ámbito.
- **Notas de alcance concatenadas.**
  - HE 1 juntaba la de cambio de uso y la de reforma, que se contradicen, y duplicaba la cita
    («DB-HE 1, ámbito de aplicación; DB-HE 1, ámbito de aplicación…»). Con 5c7cdec HE 1 pasa a
    HULC en un cambio de uso; comprobar que no queda en la reforma por elementos con varias notas.
  - SI 2 repite el sujeto («SI 2 Propagación exterior: … SI 2 Propagación exterior: …»).
  - El criterio 11 se repite en las seis SI.

  Regla: un párrafo de alcance por DB y, por sección, solo lo que difiere. Si hay varias notas,
  se elige la del caso que manda (cambio de uso antes que reforma) en vez de concatenarlas.
- **REBT frente a HE 6.** El REBT suma recarga del vehículo eléctrico («1,4 plazas») cuando HE 6
  no aplica a lo intervenido.
- **Rótulos.** «DB-SUA5», «DB-HE4», «DB-HS2» frente a «DB-HS 1». Además hay subtítulos-cita
  sueltos sin texto debajo («DB-SUA 5, ámbito de aplicación»): la cita va como nota bajo su
  párrafo.
- **Erratas.**
  - «El fregadero del cocina».
  - «Vivienda U» en la tabla del REBT.
  - «se produce de forma individual en cada unidad» en una unifamiliar.
  - Frases con contadores a cero («más que las 0 que la usan», «hay que salvar 0 plantas»):
    se sustituyen por la conclusión.
- **SUA 6 con piscina privada**: decirlo («piscina privada de una vivienda unifamiliar, fuera
  del ámbito») en vez de «no dispone de piscina de uso colectivo».

### 5.2 Fase 2 · Esqueleto del documento

- **Orden y numeración.**
  - Orden del CTE: SE, SI, SUA, HS, HR, HE (HE 0 antes que HE 1).
  - Después, «Otros reglamentos»: REBT y, cuando existan, RITE, ICT y accesibilidad.
  - Numeración 3.x / 3.x.y con prefijo configurable («3.» por defecto), en Heading 1–3.
  - El orden deja de ser el del registry: se define en el documento.
- **Título**: «Cumplimiento del CTE», no «Memoria CTE de instalaciones», porque incluye SI, SUA y HR.
- **Datos del estudio**, guardados una vez para todos los proyectos (PWA, en local, exportables):
  nombre, titulación, nº de colegiado y colegio, dirección y teléfonos. Van a la cabecera del Word
  y del PDF.
- **Datos del proyecto** que hoy no existen: título para el pie («PROYECTO DE EJECUCIÓN PARA
  VIVIENDA UNIFAMILIAR AISLADA»), fase (básico/ejecución), emplazamiento, referencia catastral y
  promotor. El pie lleva el título y «Página N».
- **Apartado inicial «Tipo de obra y aplicabilidad».**
  - La tabla que abre SI en los ejemplos («Tipo de proyecto | Tipo de obras | Alcance | Cambio de
    uso»), que también vale en obra nueva.
  - Un cuadro «DB / sección | Aplica a | Motivo | Cita» generado desde `aplicabilidadEfectiva`.
  - En obra existente, además: el párrafo único de criterios (Parte I art. 2, no empeoramiento,
    flexibilidad), la superficie afectada y lo que no se toca. Es el párrafo que hoy se repite
    por apartado.
- **Fuentes.** La línea por apartado se queda en la cita corta (DB, tablas, apartados). Las
  versiones consolidadas, el motor y «datos de El edificio» van a un apartado final «Normativa
  aplicada» (o al anejo, para la trazabilidad).
- **Lo supuesto.** «(supuestos)» desaparece del texto y pasa a «Antes de entregar»
  ([entrega.ts](src/lib/obra/entrega.ts)) como lista de datos que el proyectista debe confirmar
  (Ng, Ld, zona pluviométrica, superficies…). Esos datos ya existen en `DatosGenerales`.
- **El anejo PDF** ([anejo.ts](src/lib/pdf/anejo.ts)) usa la misma numeración y la misma cabecera.

### 5.3 Fase 3 · Obra existente redactada como intervención

Hoy los módulos calculan lo intervenido (feature-27, paso 6), pero algunos lo redactan como si
fuera el edificio entero. **Regla**: cada módulo en `aplica_reformado` dice qué existe y no se
modifica, y qué se proyecta; lo existente se cubre con una frase de no empeoramiento.

| Módulo | Hoy | Debe decir |
|---|---|---|
| REBT | Previsión del edificio entero (7 viviendas, ascensor, garaje: 89,4 kW). | Grado y potencia de la vivienda nueva; nueva derivación individual; módulo libre en la centralización existente; que la LGA existente admite el cambio de local a vivienda. |
| HS 4 | «Batería de 2 contadores». | Contador añadido en la batería existente y derivación nueva; presión de la red existente como dato. |
| HS 5 | Redimensiona el colector general y las pluviales de toda la cubierta. | Unidades de desagüe y derivaciones nuevas; comprobación de que la bajante o el colector existente (Ø, unidades ya servidas) admite las añadidas; pluviales «no se modifican». |
| SI 3 / SI 4 | Escalera con «0 que la usan»; BIE y detección en un garaje que no se toca. | Solo lo intervenido; los elementos comunes no se describen (criterio 8) o, si se describen, con la ocupación del edificio. |
| HS 1 | Muros, suelo del sótano y cubierta. | Si solo cambian los huecos: puntos singulares de huecos y carpinterías sobre la fachada existente. |
| HS 3 | Extractores en cubierta, sin más. | El trazado de expulsión real, según la verificación 0.2. |
| HS 6 | Forjado sanitario nuevo bajo 125 m². | Las soluciones para existentes del ap. 3 (barrera sobre la solera, despresurización, sellado). |
| SUA 8 | Edificio entero con C4 de comercial: pide pararrayos. | En un cambio de uso no característico, que el cambio no aumenta el riesgo. |
| SUA 1 | «Aún sin redactar». | Redactado sobre lo intervenido: suelos, escalones, barreras y acristalamientos nuevos. |
| HE 1 / HE 0 | Desde 5c7cdec, a HULC en un cambio de uso. | No se replica HULC en la app. HE 1 va siempre a HULC en cambio de uso (no tiene umbral); HE 0, solo con más de 50 m² útiles, también en el característico (K-MEM.1–2). |
| HE 4 / 5 / 6 | «No aplica» sin la razón de fondo. | «Uso característico: Residencial Vivienda, no cambia», más la cifra (l/d, m², plazas). |
| HR | Sin ficha. | El elemento horizontal con el piso de arriba, obligatorio en un cambio de uso en planta baja; si hay limitación, la flexibilidad concreta: elemento, valor alcanzado y medida. |

**Datos nuevos.** Para lo existente hacen falta: nº de contadores de la batería, Ø y unidades de
la bajante o el colector existentes, potencia o LGA existente. Se piden como decisiones del
módulo, solo en obra existente.

### 5.4 Fase 4 · Tablas «Norma | Proyecto»

- **Modelo.** `MemoriaDoc.tabla` pasa a `tablas: TablaMemoria[]`, con un rótulo opcional, notas
  numeradas (1), (2)… debajo y columnas con tipo (`norma`, `proyecto`, `cumple`) para alinear y
  resaltar. [plan.ts](src/lib/docx/plan.ts) y el PDF se adaptan; el troceo de tablas anchas se
  mantiene.
- **Tablas nuevas:**

| Apartado | Tabla |
|---|---|
| SI 1 | Sector o local · uso · superficie Norma/Proyecto · resistencia Norma/Proyecto. |
| SI 3 | Zona · uso · superficie útil · densidad · ocupación · salidas N/P · recorrido N/P · anchura N/P. |
| SI 4 | Instalación · exigida · proyectada (con nº de extintores por planta). |
| SI 6 | Planta o elemento · R exigida · R de proyecto. |
| SUA 1–4 | Parámetro · Norma · Proyecto (barreras por planta, escalera, altura libre, umbrales, fuerza de apertura, iluminancias). |
| SUA 8 | Ng · Ae · C1 · Ne · C2…C5 · Na · E · nivel (ya calculado, falta la tabla). |
| HR | Ficha K.1 de la opción simplificada (§5.4.1). |

- **El texto no repite la tabla**: se queda con lo que la tabla no dice (criterio, decisión,
  condición).

#### 5.4.1 Ficha K.1 de HR

Referencia: el informe «HR K-1» que genera la herramienta de Saint-Gobain (ejemplo del edificio
Pedregal 41, Málaga, aportado por el usuario el 2026-10-10). Es lo que hoy se pega como imagen en
las memorias del estudio.

**El motor ya tiene todos los datos.** `JustificacionHr` da, por elemento, la solución del CEC,
m, RA, ΔRA y ΔLw de proyecto, y la fila de la tabla 3.2/3.3/3.4 con lo exigido (ver la salida
actual: «m = 184, RA = 58 · fila: m ≥ 170, RA ≥ 54»). La ficha es una forma de presentar ese
resultado, no un cálculo nuevo.

**Maqueta que se toma de Saint-Gobain:**
1. **Identificación del edificio**: nombre, dirección, municipio, CP, provincia, referencia
   catastral. Sale de los datos del proyecto de la fase 2.
2. **Tabiques**: tipo; m y RA, de proyecto ≥ exigido.
3. **Elementos de separación vertical**, un bloque por cada tipo de recinto con el que se linda
   (otra unidad de uso, zona común, instalaciones, actividad, ascensor). Filas «Elemento base» y
   «Trasdosado», con columnas m, RA y ΔRA, de proyecto ≥ exigido.
4. **Medianerías**: elemento base y trasdosado, con RA.
5. **Elementos de separación horizontal**, un bloque por caso (entre usuarios, sobre zona común,
   sobre actividad o instalaciones). Filas forjado (m, RA), suelo flotante (ΔRA, ΔLw) y techo
   suspendido (ΔRA).
6. **Fachadas, cubiertas y suelos en contacto con el aire exterior**, por recinto receptor: % de
   huecos, RA,tr de la parte ciega y de los huecos, de proyecto ≥ exigido.
7. **Condicionantes del edificio**: los que imponga la solución, que el motor ya sabe (por ejemplo,
   tabiquería con bandas elásticas, techo suspendido obligatorio sobre el garaje).

En el Word, una tabla por bloque; en el PDF, la misma maqueta con `renderFicha`.

**Lo que NO se copia** (fallos del propio ejemplo):
- **Valores en rojo sin conclusión.** El ejemplo marca «RA 60 ≥ 68» en rojo en dos bloques y en
  la última página dice «No existen condicionantes». En la nuestra, cada bloque termina en Cumple
  o No cumple, y un no-cumple bloquea la entrega como en el resto de módulos.
- **«None» y «≥ -»** impresos donde no hay exigencia. Si un parámetro no se exige en ese caso, la
  celda dice «no se exige».
- **Tiempo de reverberación y absorción** listados en un residencial privado, con la absorción
  rotulada como reverberación («Zonas comunes: al menos 0,2 m²»). Si no aplica, una línea con el
  motivo (ap. 2.2), como ya hace el texto.
- **Fachada sin Ld ni exigencia de D2m,nT,Atr.** La nuestra dice el Ld de la zona, su origen y la
  exigencia por recinto (dormitorios / estancias), que ya se calculan.
- **«Normativa vigente: CTE 2013».** Se pone la versión consolidada que se ha aplicado.
- **Productos de marca con valores del fabricante.** Los nuestros son del CEC; los de producto se
  marcan como orientativos y exigibles por ensayo en el pliego, como ya dice el texto.
- **Descargo de responsabilidad del fabricante.** No procede: la ficha la firma el proyectista.

### 5.5 Fase 5 · Habitabilidad (municipal y autonómica)

**El problema.** La fracción de hueco no es universal. Unos municipios o comunidades piden 1/10
de la superficie útil para iluminación y ventilación juntas, otros 1/8, y otros separan ambas
(por ejemplo, 12 % iluminación y 8 % ventilación). Cambian también las estancias que computan y
si cuenta el hueco de fachada o la superficie practicable. **La app no puede suponerla.**

**Diseño.**

1. **La norma es un dato de la obra que declara el proyectista.** En Los datos de la obra, el
   bloque «Habitabilidad» tiene una o varias normas de aplicación (municipal y autonómica). Si se
   declaran dos, se comprueban las dos y cada fila cita la suya.
2. **Cada norma es un conjunto de parámetros con su referencia:**
   - referencia libre y obligatoria («PGOU de Málaga, art. …»);
   - fracción de iluminación;
   - fracción de ventilación, o «conjunta»;
   - qué se mide: hueco de fachada, superficie acristalada o superficie practicable;
   - estancias que computan (por defecto, las vivideras: estar, comedor, cocina, dormitorios;
     baños y pasillos fuera);
   - opcionales: superficie útil mínima por estancia y densidad (m² construidos residenciales
     por vivienda, con su artículo).
3. **Plantillas, nunca valores por defecto.** La app solo ofrece normas que hayan pasado la
   verificación 0.6, con su BOJA/BOP y fecha. Tras la fase 0 (§4.1, punto 6) **no hay ninguna
   para la vivienda libre en Andalucía**: solo la de VPO (10 % / 5 %), para la vivienda protegida.
   Las de Málaga y Benalmádena esperan a leer sus PGOU, o el texto que aporte el usuario. Si el municipio de la obra tiene una, se **sugiere**
   y el proyectista la acepta. Además, «Mis normas»: lo que el proyectista define se guarda en
   local para reutilizarlo en otros proyectos (Málaga una vez, todas las obras de Málaga después),
   exportable en JSON.
4. **Sin norma declarada, el apartado no se inventa.** Sale como pendiente en «Antes de entregar»:
   «Declara la norma de habitabilidad del municipio».
5. **Datos de estancias.** Hoy `ViviendaTipo` solo tiene dormitorios, baños, aseos y superficie
   útil. Se añade una lista opcional de estancias por vivienda tipo: nombre, tipo, superficie
   útil, superficie de hueco y superficie practicable. La IA del cuadro de superficies
   (feature-13) puede proponer las superficies; los huecos los mete el proyectista o salen de la
   carpintería.
6. **Salida.**
   - Tabla «Estancia | Su | Exigido (Su·f) | Proyecto | Cumple» por vivienda tipo.
   - Para densidad: «Superficie residencial / nº viviendas ≥ X m²/viv», con el estado actual y el
     resultante en obra existente.
   - El párrafo cita la norma tal como la declaró el proyectista, y la ficha marca esos parámetros
     con origen «dato del proyectista».

**Fuera de alcance de esta fase**: patios mínimos, programa mínimo de la vivienda y alturas
libres. Se pueden añadir como parámetros después.

### 5.6 Fase 6 · Anejo de cálculo de instalaciones

- **Documento.** Un «Anejo · Instalaciones del edificio» (Word y PDF), separado de la memoria, con
  la misma cabecera y numeración. La memoria remite a él («ver anejo 5.3, tabla …»).
- **HS 4**: tabla por tramos (tramo, Lr, Lt, Qb, K, Q, Ø, v, J, Pentrada, Psalida), del contador al
  grifo más desfavorable; armario del contador (tabla 4.1); retorno de ACS y aislamiento si los
  hay. Las abreviaturas, una vez.
- **HS 5**: unidades de desagüe por aparato y vivienda tipo (aparato, nº, UD, Ø sifón); colectores
  por tramo (UD, pendiente, Ø); arquetas (tabla 4.13).
- **REBT**, lo que falta aguas abajo:
  - circuitos C1–C13 por tipo de vivienda (ITC-BT-25: In, sección, tubo, puntos);
  - puntos de utilización por estancia;
  - derivación individual y LGA (sección por Iz y por caída de tensión, fusible, tubo);
  - puesta a tierra.

  Es motor nuevo: el más grande del plan.
- **Planos.** Un campo de planos por módulo («I05–I07»), para remitir desde la memoria.

### 5.7 Fase 7 · Otros reglamentos y coherencia

- **HE 2 / RITE**: generador, potencias de frío y calor, rendimiento, acumulación de ACS y
  documento exigible (0.3). Se alimenta del mismo dato de ACS y clima que HE 4 y REBT.
- **HE 3**: una línea en vivienda; zonas comunes de plurifamiliar con VEEI, potencia y control
  (0.4).
- **ICT**: ficha de las previsiones del arquitecto (PAU, tomas por estancia, acometidas, recintos)
  desde el nº de viviendas y estancias, o «no obligatoria» con su motivo (0.5).
- **Accesibilidad autonómica**: con el mismo patrón que habitabilidad (norma declarada y motivo
  citado) (0.7).
- **Coherencia en «Antes de entregar»**: avisos cuando dos apartados no dicen lo mismo:
  - sistema de ACS en HE 4, HS 4, RITE y REBT;
  - grupo de presión en HS 4 y REBT;
  - garaje y plazas en SI, SUA 7, HE 6 y REBT;
  - nº de viviendas y contadores en HS 4 y REBT;
  - superficies.
- **Piscina privada**: ITC-BT-31 en REBT, vaciado en HS 5 y la frase de SUA 6. Pendiente de
  decidir si entra (§6).

## 6. Decisiones a validar con el usuario

1. **Prosa y tabla, o solo tabla** en SI y SUA (fase 4). Propuesta: tabla más el texto que la
   tabla no dice.
2. **Ficha K.1 de HR**: ¿sustituye al texto o lo acompaña? Propuesta: lo acompaña; el texto se
   queda con lo que la ficha no recoge (ámbito, Ld y su origen, uniones, instalaciones). La ficha
   iría en la memoria (Word) y en el anejo de fichas (PDF).
3. **Datos del estudio**: ¿uno solo o varios perfiles (si se firma con otros compañeros)?
4. **Prefijo de numeración**: «3.» fijo o configurable por proyecto. Propuesta: configurable, «3.»
   por defecto.
5. **Anejo de instalaciones**: ¿documento aparte o al final de la misma memoria? Propuesta:
   aparte, como el 5.3 de los ejemplos.
6. **Habitabilidad**: ¿qué municipios y comunidades usas más, para verificar primero sus normas y
   ofrecerlas como plantillas?
7. **Piscina privada**: ¿entra en la fase 7 o se deja fuera?
8. **«Normativa aplicada»**: ¿apartado al final de la memoria o solo en el anejo de fichas?
