# feature-35 — Memoria como la del estudio · Fase 8: estudio básico de seguridad y salud

> Fase 8 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§4.2, §4.3 y §5.8). Escrito el 2026-10-16.
> Base normativa: [research/verificacion-seguridad-salud.md](research/verificacion-seguridad-salud.md)
> (K-SYS.1–14), que manda en todo lo normativo. Base de contenido:
> [research/analisis-ejemplos-ebss.md](research/analisis-ejemplos-ebss.md), el análisis de los 15
> estudios de `ejemplos/seguridad y salud/`.
>
> El **estudio de gestión de residuos no va aquí**: se hace en concreta-mediciones, que tiene las
> partidas (decidido el 2026-10-16, PLAN-MEMORIA §5.8). Esta app solo remite a él.

## Lo que hay hoy

**Nada de seguridad y salud.** La app no tiene presupuesto, plazo, trabajadores ni amianto: no
aparecen en `src/`. El proyecto (`Proyecto`, [tipos.ts](src/lib/proyecto/tipos.ts)) tiene los
datos de la obra (`DatosGenerales`), El edificio y las justificaciones del CTE, y nada más.

**Lo que se puede aprovechar:**
- **La tubería de documentos.** El anejo de instalaciones ([anejoInstalaciones.ts](src/lib/obra/anejoInstalaciones.ts),
  feature-33) es el modelo: `anejoInstalaciones(p)` da el modelo, `bloquesAnejoInstalaciones` los
  `BloqueMemoria[]`, y `memoriaDocx` y `renderMemoriaPdf` los pintan con la cabecera, el pie y los
  estilos de la memoria. Tiene su página «Leer» (`/p/:id/anejo-instalaciones`), su fila en Lo que
  se entrega y su hook en `useExportarDocumento`.
- **Lo que la app ya sabe de la obra**, que decide qué fichas proponer:
  - la intervención (`obra_nueva`, `reforma`, `ampliacion`, `cambio_uso`) y el alcance de una
    obra en edificio existente (`Alcance`: envolvente, cubiertas, estructura, instalaciones,
    interior, aparcamiento, edificio protegido);
  - El edificio: plantas, alturas, cubierta, usos, viviendas, garaje, ascensor;
  - qué justificaciones aplican (HS 4, HS 5, HE 4, REBT, HE 6…), que dicen qué instalaciones
    se ejecutan;
  - los datos del documento (`DocumentoProyecto`: título, fase, emplazamiento, promotor,
    firmantes) y los datos del estudio (cabecera).
- **«Mis normas»** de habitabilidad ([useMisNormas.ts](src/lib/habitabilidad/useMisNormas.ts)):
  el patrón para guardar en el navegador lo que el proyectista reutiliza entre obras.

**Lo que traen los ejemplos** (analisis-ejemplos-ebss §2): casi todo es plantilla genérica, con
normativa derogada (RD 486/1997 aplicado a la obra en 12 de 13, Ordenanzas de 1970 y 1971, aviso
previo). Ninguno identifica el amianto, da las ratios del convenio, rellena el anexo II ni da
trabajos posteriores propios de la obra. Lo mejor es del estudio del usuario: la hoja del art. 4
con el PEC desglosado y el compromiso del promotor (ss02, ss03, ss04).

## Objetivo

Un cuarto entregable, **«Estudio básico de seguridad y salud»**, en Word y PDF, con la misma
cabecera, pie y estilos que la memoria:
- abre con la **justificación del art. 4**: por qué basta el básico, con los datos de la obra;
- solo lleva las **fichas de riesgos de lo que tiene esta obra**, propuestas por la app y
  confirmadas por el proyectista;
- trae lo que los ejemplos no traen y la norma exige: **amianto, anexo II, servicios higiénicos
  del convenio, trabajos posteriores y otras actividades en el lugar**;
- sin nada derogado.

Criterio de hecho del plan: **el estudio básico sale en los casos de partida con sus riesgos por
fase de obra, al nivel de los ejemplos del estudio y sin lo derogado.**

## Principios

- **Los de la memoria (§2 del plan).** Lo que depende de la obra no se supone (principio 4): sin
  PEM, plazo o amianto, el apartado sale pendiente en «Antes de entregar». Lo supuesto no se
  imprime como si fuera del proyecto (principio 5).
- **Solo lo que tiene la obra** (Guía del INSST, folios 26–27; K-SYS.12). Nada de «listados
  genéricos que carecen de utilidad preventiva». La app propone; el proyectista marca o quita.
- **Ninguna cifra sin verificar.** Las cifras del catálogo marcadas ⚠ en el análisis (§4.9) se
  imprimen sin cifra hasta cotejarlas. Las normas sin leer se citan por número y título, sin
  literal.
- **Lista de prohibidos como test.** Un test recorre el catálogo y el documento generado y falla
  si aparece algo de la lista (K-SYS «Para la app» y analisis §5.1): «aviso previo», «anexo III»,
  «Ordenanza General de Seguridad e Higiene», «Ordenanza … Vidrio y Cerámica», el RD 486/1997
  aplicado a la obra, ratios atribuidas al RD 1627, «copia a la Inspección» de toda anotación,
  valores límite de amianto, «cinturón de seguridad».
- **El básico es descriptivo** (K-SYS.3): sin presupuesto propio.
- **Mismo documento, misma tubería**, como el anejo de instalaciones: `BloqueMemoria[]` con
  `memoriaDocx` y `renderMemoriaPdf`.
- **No es una justificación del CTE.** No entra en `JustificacionKey` ni en el mapa de cobertura:
  es un documento de la obra con su propio estado en el proyecto.

## Pasos

### Paso 0 · Normativa pendiente (agente `cte-normativa`)

Lo que dejaron abierto la verificación (K-SYS) y el análisis (§6). Con `pdftotext` y PyMuPDF
(están en la máquina), cotejando el PDF oficial:
1. **Nombres de riesgo**: la lista del análisis (§4.2, formas de accidente del INSST) frente a
   los 22 de la NTP 908 que fija K-SYS.13. Decidir cuál manda y fijar las claves.
2. **Cifras en conflicto** (analisis §4.9): ITC-BT-18 y ITC-BT-33 (instalación provisional y
   tierra), RD 1215/1997 anexo II aps. 4.2 y 4.3 (escaleras, andamios), RD 614/2001 (distancias a
   líneas eléctricas), RD 286/2006, RD 487/1997. Lo que no se coteje se queda sin cifra.
3. **Lista corta de normas** (analisis §3): título exacto y estado en el BOE de cada una.
4. **Amianto**: si se ha publicado el nuevo real decreto (a 2026-10-16 el consolidado del
   RD 396/2006 no lo marca derogado).
5. **Botiquín**: la Orden TAS/2947/2007 que cita ss09, si aplica a obras; si no, solo el texto del
   anexo IV A.14 del RD 1627.
6. **ss03 y ss04 en imagen**: las marcas SÍ/NO de la hoja del art. 4, que el texto pierde.

El resultado va como K-SYS.15 y siguientes en la verificación.

**Hecho (2026-10-16), K-SYS.15–20.** Leído en los consolidados del BOE pasados a texto; la tabla 1
del RD 614/2001 y la hoja del art. 4 de ss03 y ss04, en imagen. Cambia el diseño así:
- **Nombres de riesgo** (K-SYS.15): **la NTP 908 no es una terminología** (trata de plantas de
  tratamiento de frigoríficos) y la Guía no trae ninguna lista. Manda la del análisis §4.2: las 28
  claves, con cinco nombres ajustados («Contactos eléctricos», «Exposición a agentes químicos»,
  «… agentes biológicos», «Exposición al ruido», «Exposición al amianto»). Es INTERPRETACIÓN: no
  hay terminología reglamentaria.
- **Cifras** (K-SYS.16), las 19 del análisis §4.9:
  - **fijadas**: toma de tierra por RA × Ia ≤ 24 V (ITC-BT-33 y 24; no un valor fijo en ohmios);
    diferencial de 30 mA en toda base de enchufe; barandilla de 90 cm y protección desde 2 m de
    caída; escalera de mano 1 m por encima, unos 75° y anticaídas a más de 3,5 m con esfuerzos
    peligrosos; viento de 72 km/h solo en grúa torre (o el del fabricante); distancias a líneas
    eléctricas por la tabla 1 del RD 614/2001 (3, 5 y 7 m sin delimitación precisa; cotejada en
    imagen); ruido 80, 85 y 87 dB(A); IP45 y cables de 450/750 V en la instalación provisional;
  - **sin cifra**: entibación, acopios y vehículos al borde, rodapié y resistencia de barandilla,
    borriquetas, compresor, iluminación, anclajes y separación del andamio, bajante de escombros,
    pies derechos. Los 25 kg de cargas no son del RD 487/1997: buena práctica, sin cita.
- **Lista corta de normas** (K-SYS.17): 20 normas, todas vigentes, con título exacto y fecha de su
  última modificación. Las de grúas, solo si la obra tiene grúa. Fuera: RD 486/1997, Orden
  TAS/2947/2007, Orden TAS/2926/2002. Sin leer y quizá necesarias: RD 665/1997 (sílice) y RD 664/1997.
- **Amianto** (K-SYS.18): el RD 396/2006 sigue sin modificaciones; el nuevo real decreto sigue en
  proyecto. Se vuelve a mirar en el paso 7.
- **Botiquín** (K-SYS.19): la Orden TAS/2947/2007 no es norma de la obra (solo dice que la mutua
  paga el botiquín del RD 486/1997). Se imprime el RD 1627, anexo IV A.14, y el art. 234 del VII
  Convenio (personal con formación en primeros auxilios, local si hay más de 50 trabajadores,
  información del centro sanitario). Contenido, revisión y reposición, como buena práctica de la
  Guía (folio 78).
- **Comunicación de apertura** (K-SYS.20, Orden TIN/1071/2010): previa al comienzo, expuesta en
  la obra y actualizada; la presenta el contratista con el plan aprobado; el promotor le facilita
  los datos.

**Lo que cambia en los pasos siguientes:**
- **Paso 1**: dos datos más, la tensión de las líneas eléctricas próximas (kV) y si hay grúa
  torre o grúa móvil.
- **Paso 2**: la dotación suma el local de primeros auxilios con más de 50 trabajadores.
- **Paso 3**: claves de K-SYS.15 y cifras de K-SYS.16 (fuera el «30 cm» del andamio y la
  «protección auditiva a menos de 4 m» que proponía el análisis). La lista de prohibidos suma:
  valores fijos de resistencia de tierra en ohmios, «300 mA en fuerza», los 25 kg atribuidos al
  RD 487/1997, el RD 486/1997 o la Orden TAS/2947/2007 como base del botiquín y las distancias a
  líneas sin base («6 m», «corte en 50 kV»). El RD 1627 C.3 b) dice «cinturones de seguridad con
  anclaje»: el catálogo lo nombra «arnés anticaídas» y no cita ese literal, así que el prohibido
  se mantiene.
- **Paso 5**: el apartado 5 con la lista de K-SYS.17; el 6 con el botiquín de K-SYS.19; el 13 con
  la comunicación de apertura de K-SYS.20; el 0 con los datos que el promotor facilita al
  contratista, en el orden de la orden.

### Paso 1 · Datos de la obra para el estudio

`Proyecto.seguridadSalud?: EstudioSeguridadSalud` (opcional: los expedientes guardados se siguen
leyendo, sin cambiar el schema). Tipos en `src/lib/ebss/tipos.ts`:
- **Presupuesto**: PEM y los porcentajes de gastos generales, beneficio industrial e IVA. Sin
  valores por defecto (decisión 2). Más adelante pueden venir de concreta-mediciones (Fuera de
  alcance).
- **Plazo** en días laborables y **máximo de trabajadores a la vez**. Ayuda opcional para
  estimar los trabajadores desde el PEM con el porcentaje de mano de obra que declare el
  proyectista (decisión 3); el dato que cuenta es el que confirma.
- **Jornadas**, solo si días × trabajadores pasa de 500 (K-SYS.2): la suma Σ Tᵢ × Dᵢ por periodos,
  con una tabla de periodos opcional.
- **Túneles, galerías, conducciones subterráneas o presas**: sí/no, con la aclaración de la Guía
  (las zanjas a cielo abierto no cuentan).
- **Amianto**: `no_identificado | posible | identificado`, con ubicación y si es friable.
  **Obligatorio en obra existente** (RD 396/2006 art. 10.2, K-SYS.9).
- **Coordinación**: ¿varios proyectistas?, ¿más de una empresa, o empresa y autónomos? (art. 3).
  En vivienda, ¿el promotor es cabeza de familia que contrata directamente (art. 2.3)?
- **Entorno**: centro asistencial (nombre, dirección, distancia y tiempo; decisión 7), edificio o
  local en uso durante la obra, ocupación de la vía pública, y la tabla de servicios afectados
  «existe / no existe» (líneas aéreas y enterradas, gas, agua, saneamiento, telecomunicaciones).
- **Selección de fichas** (paso 4) y lo que el proyectista edita en ellas.

Funciones puras con sus tests, como el resto de `src/lib/`.

**Hecho (2026-10-16).** [src/lib/ebss/tipos.ts](src/lib/ebss/tipos.ts) y
[src/lib/ebss/datos.ts](src/lib/ebss/datos.ts), con 22 tests en `src/lib/ebss/test/datos.test.ts`:
- `Proyecto.seguridadSalud?` y `actualizarSeguridadSalud` en el contexto. Al leer del navegador o
  importar, `parseSeguridadSalud` descarta lo que no tiene forma; un expediente sin el campo se
  lee igual.
- Mano de obra: `jornadasDePeriodos` (Σ Tᵢ × Dᵢ), `cotaJornadas` y `pideJornadas` (plazo ×
  trabajadores > 500), `jornadasDeclaradas` (manda la tabla si la hay) y `estimarTrabajadores`.
- `amiantoObligatorio`, `preguntaCabezaFamilia` y `pendientesSeguridadSalud`, la lista de lo que
  falta, en el orden del documento, para «Antes de entregar».
- Los dos datos del paso 0: `entorno.tensionLineas_kV` y `medios.gruaTorre` / `gruaMovil`.

**Decisiones del paso 1, a validar:**
1. **Derribo previo en obra nueva** (`demolicionPrevia`, dato nuevo): si se derriba una
   construcción existente, el amianto es obligatorio como en una obra sobre edificio existente
   (K-SYS.9 habla de «toda obra de demolición»).
2. **La estimación pide también el coste de la hora** (€/h), sin valor por defecto, como el
   porcentaje de mano de obra. Da las jornadas y la **media** de trabajadores (por exceso, mínimo 1),
   no el máximo a la vez; el art. 4 solo usa lo que confirma el proyectista.
3. **Cuentan como pendientes**, además de los de la lista del paso 6: los porcentajes del PEC, las
   jornadas si la cota pasa de 500, el supuesto d), las dos preguntas de coordinación, la tabla
   de servicios (con uno solo sin declarar), la tensión si hay líneas aéreas, la vía pública y,
   en obra existente, el edificio en uso. **El cabeza de familia no**: sin respuesta, el estudio
   no añade el párrafo del art. 2.3.
4. **0 % de GG, BI o IVA** es un dato válido; el PEM tiene que ser mayor que 0 y el porcentaje de
   mano de obra, como mucho el 100 %.
5. **Las ediciones de una ficha se guardan por texto** (lo quitado es el texto del catálogo tal
   cual): si el catálogo cambia ese texto, la medida vuelve a salir, que es lo prudente. Los
   riesgos, por clave.
6. **Las 28 claves de riesgo** (K-SYS.15) ya son un tipo (`ClaveRiesgo`); los nombres llegan con
   el catálogo en el paso 3.

### Paso 2 · Motor: art. 4, coordinación y servicios higiénicos

`src/lib/ebss/art4.ts`, puro:
- **PEC** = (PEM + GG + BI) × (1 + IVA) (Guía folio 24), con el desglose para la tabla.
- **Los cuatro supuestos del art. 4.1**, cada uno con umbral, dato del proyecto y si se supera:
  a) PEC ≥ 450.759,08 €; b) más de 30 días laborables **y** más de 20 trabajadores a la vez;
  c) más de 500 jornadas (o el atajo: si días × trabajadores ≤ 500, descartado); d) túneles,
  galerías, conducciones subterráneas o presas.
- **Resultado**: `basico` o `completo`. Con `completo`, el estudio no se redacta: el documento
  dice qué supuesto se supera y que hace falta el estudio completo (Fuera de alcance), y «Antes de
  entregar» lo marca en rojo.
- **Aviso de cercanía**: PEC a menos de un 5 % del umbral (ss02 quedaba a 540 €; decisión 4).
- **Coordinadores** (art. 3): en proyecto, si hay varios proyectistas; en ejecución, si hay más de
  una empresa, o empresa y autónomos. Si no, «no procede» con el motivo.
- **Servicios higiénicos** (K-SYS.5): dotación obligatoria por el VII Convenio, art. 232.2, con n
  trabajadores a la vez: duchas y lavabos ⌈n/10⌉, retretes ⌈n/25⌉; vestuarios por el 232.1.
  Aparte, lo que recomienda la Guía (folios 79–80). Soluciones alternativas en obra corta o en
  edificio existente (art. 231.4).

Tests: los cuatro supuestos en el límite (450.759,07 / 450.759,08; 30 y 20; 500), el atajo de
jornadas, el redondeo de la dotación y los casos de ss02 a ss04 con sus cifras.

### Paso 3 · El catálogo como datos

`src/lib/ebss/catalogo.ts`: las 89 entradas del análisis (§4.3–4.7), versionadas como las tablas
del CTE:
- **Grupos**: instalaciones provisionales (IP), fases de obra (F), medios auxiliares y
  protecciones colectivas (MA), maquinaria (M) y trabajos posteriores (TP), con los ids del
  análisis.
- **Cada entrada**: descripción; riesgos (clave del paso 0 y causa); medidas preventivas;
  protecciones colectivas; EPI; apartado del anexo II si aplica; marca `vivienda`; fuentes (ssNN,
  solo para trazar, no se imprimen).
- **Cifras**: solo las verificadas o las de buena práctica sin conflicto (analisis §4.1). Las ⚠, sin
  cifra.
- **Bloque «toda la obra»** (ss10): lo común a todas las fases, una vez, con la frecuencia de uso
  de cada medida y EPI (decisión 6).
- **Huecos** (analisis §4.8): para la primera versión se redactan los cuatro de vivienda más
  frecuentes en el estudio: apertura de huecos y recalces, edificio habitado, vuelo sobre la vía
  pública e izado de equipos a cubierta (decisión 11). Se marcan «redactado por la app» para que el
  proyectista los revise.

Tests: cada riesgo tiene una clave válida; cada entrada tiene al menos un riesgo y una medida; la
lista de prohibidos no aparece; ninguna cifra ⚠ tiene número.

### Paso 4 · Qué fichas propone la app

`fichasPropuestas(p)`, puro, con la tabla de correspondencias del análisis (§3, «Cómo se eligen
las fichas»), cada propuesta con su motivo:
- **Obra nueva**: implantación, cimentación, estructura, cerramientos, cubierta, instalaciones y
  acabados, con sus medios y máquinas.
- **Obra en edificio existente**: demoliciones, apertura de huecos y lo intervenido según el
  `Alcance` (envolvente, cubierta, estructura, interior, instalaciones). El apartado de amianto,
  siempre.
- **Por justificaciones que aplican**: HS 4 y HS 5 → fontanería y saneamiento (y zanja si hay red
  enterrada); HE 4 → ACS; REBT y HE 6 → electricidad; ICT; ascensor.
- **Por El edificio**: andamio de fachada desde una altura (con aviso del anexo II.1); cubierta
  plana o inclinada.
- **Edificio en uso o vía pública** → apartado de otras actividades e instalaciones provisionales
  con su solución alternativa.

La selección se guarda como **diferencia con la propuesta** (añadidas y quitadas), para que un
cambio en la obra (una cubierta nueva, HS 4 que pasa a aplicar) se refleje sin perder lo que el
proyectista decidió. Lo que edite dentro de una ficha (quitar un riesgo, añadir una medida) se
guarda por ficha.

Tests: la propuesta de los casos de partida (unifamiliar, plurifamiliar, «Reforma: local a
vivienda»); una ficha quitada sigue quitada al cambiar la obra; una nueva propuesta aparece.

### Paso 5 · El documento

`src/lib/obra/estudioBasico.ts`: `estudioBasico(p)` (modelo) y `bloquesEstudioBasico(e)` (bloques),
puros, como el anejo. Apartados (analisis §3):

| Nº | Apartado | De dónde sale |
|---|---|---|
| 0 | Datos generales | Documento, estudio, El edificio, paso 1; coordinadores del paso 2 |
| 1 | Justificación del estudio básico | Tabla del paso 2 con el PEC desglosado y el compromiso del promotor (decisión 5) |
| 2 | Objeto | Texto fijo: art. 6.2 y 6.3; información del promotor al contratista (RD 171/2004, DA 1.ª); base del plan (art. 7) |
| 3 | Emplazamiento, entorno y servicios afectados | Paso 1: accesos, colindantes, vía pública, tabla «existe / no existe», centro asistencial |
| 4 | Descripción de la obra y organización | Unidades de obra de la selección, maquinaria y medios previstos, orden de ejecución; «fase única» en obra pequeña |
| 5 | Normas aplicables | Lista corta del paso 0, por número y título |
| 6 | Implantación, instalaciones provisionales y servicios higiénicos | Fichas IP; dotación del paso 2, obligatoria y recomendada aparte |
| 7 | Riesgos evitables y medidas para evitarlos | Solo los que se evitan con una decisión de esta obra |
| 8 | Riesgos no eliminables | Bloque «toda la obra» y las fichas seleccionadas, a cuatro columnas *Riesgo \| Medidas preventivas \| Protecciones colectivas \| EPI* (decisión 1), con una frase de eficacia por ficha (decisión 6) |
| 9 | Otras actividades en el lugar | Edificio en uso, vecinos, vía pública; «no se prevén» con el motivo si no hay |
| 10 | Trabajos con riesgos especiales (anexo II) y recurso preventivo | Apartados del anexo II que se dan, con su medida; **nunca vacío** |
| 11 | Amianto | Del paso 1; con «posible» o «identificado»: RERA, plan de trabajo aprobado antes de empezar, retirada antes de demoler, anexo II.2. Sin valores límite |
| 12 | Trabajos posteriores | Previsiones e informaciones útiles por elemento de esta obra (cubierta, fachada, instalaciones, ascensor), con destino al promotor y al Libro del Edificio |
| 13 | Obligaciones durante la obra | Texto fijo corregido: plan, comunicación de apertura, libro de incidencias (art. 13.4), subcontratación, recursos preventivos, cabeza de familia si procede |
| 14 | Firma | Lugar, fecha y firmantes |

- **Título y numeración**: «Estudio básico de seguridad y salud», con apartados del 1 al 14 sin
  prefijo de capítulo (decisión 8). Nombre de archivo `estudio-basico-ss-<proyecto>`.
- **Remisiones desde la memoria**: en el apartado inicial «Tipo de obra y aplicabilidad», una
  línea: «El estudio básico de seguridad y salud y el estudio de gestión de residuos se presentan
  como documentos aparte» (decisión 9).
- **Documentación gráfica**: no se genera. Un campo de planos («SS01–SS02»), como los de las
  instalaciones, y la frase de remisión (decisión 10).

Tests: el documento de los casos de partida; la lista de prohibidos sobre el texto entero; con
`completo`, el documento solo dice que hace falta el estudio completo; sin datos, los pendientes.

### Paso 6 · Pantalla, entrega y avisos

- **Pantalla** «Seguridad y salud» en `/p/:id/seguridad-salud`, con el mismo lenguaje visual que los
  módulos:
  - arriba, los datos del art. 4 con la tabla de supuestos en vivo y el resultado;
  - amianto, coordinación y entorno;
  - las fichas propuestas agrupadas, cada una con su motivo («porque aplica HS 4»), para marcar o
    quitar, y su edición.
- **Lo que se entrega**: fila «Estudio básico de seguridad y salud» con Leer, Word y PDF, y su
  recuento en `entregables()`. Página «Leer» en `/p/:id/estudio-basico`.
- **Antes de entregar**:
  - en rojo, si se supera un supuesto del art. 4;
  - en ámbar, sin PEM, plazo o trabajadores; sin amianto declarado en obra existente; sin centro
    asistencial; con fichas «redactadas por la app» sin revisar.

  `PendienteEntrega.key` es hoy una `JustificacionKey`: se amplía para admitir el documento.
- **Navegación**: entrada en la barra lateral de la obra, junto a Lo que se entrega.

### Paso 7 · Casos y cierre

- Tests puros de `estudioBasico` sobre el Demo, la unifamiliar y «Reforma: local a vivienda»:
  - en la reforma, amianto obligatorio, demoliciones y apertura de huecos propuestas, edificio en
    uso si el resto del edificio sigue habitado;
  - en la unifamiliar, andamio y cubierta con el aviso del anexo II.1.
- **Foto del expediente**: se añade la huella del estudio básico; la memoria cambia solo por la
  línea de remisión.
- Comparar con ss02 a ss04: lo que tienen y el nuestro no, y al revés.
- Abrir el Word en Word.
- Comprobar en el navegador: datos, selección de fichas, Leer, Word y PDF, sin errores de consola.

## Fuera de alcance

- **Estudio de gestión de residuos**: en concreta-mediciones (PLAN-MEMORIA §5.8).
- **Estudio completo** (memoria, pliego, presupuesto y planos): la app dice cuándo hace falta y no
  lo redacta.
- **Importar el PEM y el PEC de concreta-mediciones**: pieza común de integración, para más
  adelante. Mientras, se teclean.
- **Documentación gráfica**: planos de situación, ordenación de obra y detalles tipo.
- **«Mis fichas»** reutilizables entre obras, como «Mis normas»: en esta versión las ediciones son
  de la obra. Si hace falta, en una feature aparte.
- **Plan de seguridad y salud**, que es del contratista.
- **Obra civil**: las fichas de carreteras y glorietas de ss08 y ss15 no entran.

## Decisiones (validadas el 2026-10-16)

Las del análisis (§6). El usuario las valida todas; en la 5, no hay motivo para «encargar y
visar»: se quita.

1. **Formato de la ficha**: cuatro columnas *Riesgo | Medidas preventivas | Protecciones
   colectivas | EPI*, con los evitables en su propio apartado (7), en lugar de la tabla
   «evitables / no evitables» de la plantilla del estudio.
2. **Presupuesto sin valores por defecto**: PEM, GG, BI e IVA los declara el proyectista.
3. **Trabajadores**: la app ofrece una estimación desde el PEM con el porcentaje de mano de obra
   que declare el proyectista; cuenta el dato que él confirma.
4. **Aviso** si el PEC queda a menos de un 5 % del umbral del art. 4.1 a).
5. **Compromiso del promotor** de la hoja del art. 4 (ss02 a ss04): se mantiene, sin «encargar y
   visar» ni «Decreto 1627/1997».
6. **Eficacia y frecuencia** (art. 6.2): una frase por ficha que dice qué medidas eliminan la
   exposición y cuáles la reducen; la frecuencia de uso (permanente / frecuente / ocasional), solo
   en el bloque «toda la obra».
7. **Centro asistencial**: lo declara el proyectista (nombre, dirección, distancia, tiempo), con un
   botón al mapa como el de los otros datos de la obra.
8. **Título sin número de capítulo**, apartados 1 a 14. La plantilla del estudio lo mete como
   capítulo del proyecto (ss04, cap. 8) o como anejo numerado (ss09, ss15): se añade el número si
   se pide.
9. **Remisión desde la memoria** a los dos estudios, en el apartado inicial.
10. **Documentación gráfica**: no se genera; campo de planos y remisión.
11. **Huecos del catálogo** para esta versión: apertura de huecos y recalces, edificio habitado,
    vuelo sobre la vía pública e izado de equipos a cubierta, marcados «redactado por la app».
12. **Plomo y otros agentes** del edificio existente (ss03): una nota en la ficha de demoliciones,
    no un apartado propio como el del amianto.
13. **Coordinador en proyecto con dos coautores** (ss04): la app pregunta «¿varios proyectistas?» y
    no decide por su cuenta; la ayuda dice que la Guía lo plantea con varios proyectistas durante
    la elaboración del proyecto (K-SYS.11).
14. **La plantilla de 20 fichas del estudio** se sustituye entera por el catálogo; lo que el
    proyectista quiera conservar lo añade editando la ficha.
15. **Botiquín**: el texto del anexo IV A.14 del RD 1627 y el art. 234 del VII Convenio; el
    contenido, la revisión y la reposición, como buena práctica de la Guía. Sin la Orden
    TAS/2947/2007 (paso 0, K-SYS.19).
