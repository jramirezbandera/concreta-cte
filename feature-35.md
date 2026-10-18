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

**Hecho (2026-10-16).** [src/lib/ebss/art4.ts](src/lib/ebss/art4.ts), puro, con 35 tests en
`src/lib/ebss/test/art4.test.ts`:
- `calcularPec` da el desglose (PEM, GG, BI, total, IVA, PEC); `evaluarSupuestos` las cuatro filas
  de la tabla «Supuesto | Umbral | Proyecto | ¿Se supera?» con su nota; `art4(e)` lo monta desde lo
  guardado; `avisoCercaniaPec` el aviso del 5 %; `coordinadores` las dos fases con su motivo;
  `dotacionHigienica` la dotación del convenio, la de la Guía si hay reparto por sexos, el local de
  primeros auxilios (más de 50) y la solución alternativa.
- Los casos del estudio: ss02 (PEM 312.672,94 €, PEC 450.217,77 €, a 541,31 € del umbral: avisa),
  ss03 (PEC 35.997,50 €) y ss04 (PEC 56.516,08 €, cuyo IVA redondea 9.808,575 hacia arriba), los tres
  básicos y con sus cifras cotejadas en el PDF con `pdftotext`.
- Datos nuevos, opcionales, en `EstudioSeguridadSalud.serviciosHigienicos`: obra de corta duración o
  de escasa importancia, la solución alternativa en texto y el reparto hombres / mujeres.

**Decisiones del paso 2, a validar:**
1. **El PEC se redondea línea a línea a céntimos**, como en la hoja del estudio (ss02 a ss04), en
   céntimos enteros para que 9.808,575 dé 9.808,58 y no dependa de la coma flotante.
2. **Tres resultados, no dos**: `basico`, `completo` y `pendiente`. Un supuesto sin dato queda «sin
   datos», no «no se supera» (principio 4). `completo` manda aunque falten otros datos; `pendiente`
   es «ninguno se supera de los que se pueden decidir, pero falta alguno».
3. **Supuesto b)**: con una de las dos condiciones que no se cumple basta para descartarlo, aunque
   falte la otra (30 días sin máximo de trabajadores ya es «no»).
4. **Supuesto c)**: las jornadas declaradas mandan sobre el atajo, también si el atajo las descartaría.
5. **Las duchas se cuentan como obligatorias del convenio**, ⌈n/10⌉; la condición «cuando el tipo de
   actividad o la salubridad lo requieran» y la recomendación de la Guía van como texto en el paso 5.
   Los vestuarios no se cuentan: en toda obra, con la alternativa de la obra corta.
6. **La solución alternativa solo la declara el proyectista** (`cortaDuracion`), con su texto; no se
   deduce del plazo ni de que la obra sea en edificio existente. Los datos de servicios higiénicos
   **no cuentan como pendientes**: sin ellos sale la dotación del convenio.
7. **Coordinador en ejecución «no procede»** lleva la reserva del art. 3.2: si durante la obra
   interviene más de una empresa, o empresa y autónomos, el promotor lo designa en cuanto se constate.
8. **Los textos del art. 3 van parafraseados**, no entre comillas: la verificación los da por
   cotejados pero no trae el literal.

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

**Hecho (2026-10-18).** [src/lib/ebss/catalogo.ts](src/lib/ebss/catalogo.ts) (módulo público) con los
datos en `src/lib/ebss/catalogo/` por grupos (instalaciones, fases1, fases2, medios, maquinaria,
posteriores), más [cifras.ts](src/lib/ebss/cifras.ts) y [prohibidos.ts](src/lib/ebss/prohibidos.ts);
tipos nuevos en `tipos.ts` (`FichaCatalogo`, `ItemFicha`, `AnexoIIFicha`, `GrupoFicha`,
`Frecuencia`). 38 tests en `catalogo.test.ts` y `cifras.test.ts`:
- **93 fichas**: las 89 del análisis (8 IP, 40 F, 16 MA, 22 M, 3 TP; 57 con marca vivienda) y los
  4 huecos redactados por la app (`redactadaPorApp`), con nota para que el proyectista los revise:
  IP9 edificio habitado, F40 apertura de huecos y recalces, F41 vuelo sobre la vía pública, F42
  izado de equipos a cubierta.
- `NOMBRES_RIESGO` (28, K-SYS.15) y `ANEXO_II` (resumen de los 10 apartados) como tablas versionadas
  con `tablaCTE`; `CATALOGO_EBSS` con su procedencia; ayudas puras `fichaPorId`, `fichasDeGrupo`,
  `textoFicha`, `textoCatalogo`, `riesgosDeFicha`.
- `cifras.ts`: tabla 1 del RD 614/2001 con `distanciasLineas(kV)` (interpolación lineal, hacia
  arriba al cm), `TIERRA_PROVISIONAL` con `resistenciaTierraMax(mA)` (800 Ω a 30 mA), ruido, vibraciones,
  barandilla, escalera, plan de montaje del andamio y viento de la grúa torre.
- `prohibidos.ts`: 26 patrones con su motivo y `buscarProhibidos(texto)`, para el catálogo ahora y
  para el documento en el paso 5. El test ya cazó un «aviso previo» en IP9.
- Tests: recuento, ids con prefijo, claves válidas sin repetir por lista, textos únicos, anexo II
  en 1–10 (una obra de vivienda activa 1, 2, 4, 6 y 10), solo TP con previsiones, amianto solo en
  F1, F0 con frecuencia en todo, prohibidos ausentes, cifras ⚠ sin número (lux, Ω, 300 mA,
  entibación, acopios y vehículos al borde, rodapié, borriquetas, compresor, andamio, bajante,
  viento salvo M7), cifras verificadas presentes, y toda remisión «(ver XX)» apunta a una ficha.

**Decisiones del paso 3, a validar:**
1. **Una medida = una cadena.** Los bloques en negrita del análisis (Acometida, Puesta a tierra…)
   se funden en frases sueltas: es la clave de las ediciones por texto (decisión 5 del paso 1).
   Solo F0 lleva `frecuencia` en todo y marca `evitable` la medida del clima (apartado 7).
2. **`eficacia` y `descripcion` ya en el catálogo** (una frase cada una por ficha), no en el paso 5:
   la frase de eficacia (decisión 6) es contenido de la ficha, y la descripción sirve al apartado 4.
3. **Edificio habitado va en IP** (IP9, organización de la obra), no en fases; los otros tres huecos
   siguen la numeración de F (F40–F42). Los 4 cuentan aparte de los 89.
4. **Más cifras quitadas** además de las ⚠: las de vehículos y máquinas junto al borde (M1, M4, M5,
   M6: «la distancia que fije el técnico competente», K-SYS.16 filas 5 y 6), las de una sola
   fuente que no aportan (rampa de 4,5 m / 12 % / 8 %, prueba de carga del ascensor, inspección
   cada quince días, vertido desde dos plantas, vuelo de 2,5 m de la marquesina) y el radio de las
   compactadoras (5 m en F7 frente a 6 m en F39). Quedan las de buena práctica sin conflicto
   (pilas de 1,50 m, plataformas de 60 cm, 24 V, tendido a 2 y 5 m, red a 6 m, hormigonera y
   sierra a 3 m, compresor y grupo a 2 m, 100 kg/m² en demolición).
5. **«300 mA» no aparece.** IP4 dice 30 mA en toda base y RA × Ia ≤ 24 V, con IP45 y 450/750 V;
   el prohibido es la frase «300 mA en fuerza». Las mangueras de 1.000 V de M14 y M19 se quedan
   como práctica (más exigente que la ITC).
6. **Anexo II en resumen**, no literal: el estudio lo cita por número. F42 activa el 1 y, si hay
   línea próxima, el 4.
7. **UNE**: solo la UNE-EN 13374 «como referencia» (K-SYS.16). Las 12810/12811, 1263 y 353-2 de
   los ejemplos no se citan por no estar cotejadas; en su lugar, «según el fabricante».
8. **Vibraciones**: M14, M15 y M20 citan los valores de acción y límite del RD 1311/2005 como
   referencia de la evaluación de la empresa, sin fijar relevos por norma.
9. **Prohibidos**: la detección de ratios atribuidas al RD 1627 se limita a una misma frase (hasta
   120 caracteres sin punto); «fibrocemento» solo se prohíbe como «tubo de fibrocemento», porque
   el apartado de amianto sí tiene que poder nombrarlo.
10. **Interpolación del RD 614/2001** redondeada hacia arriba al centímetro, por prudencia.

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

**Hecho (2026-10-18).** [src/lib/ebss/propuesta.ts](src/lib/ebss/propuesta.ts), puro, con 24 tests en
`src/lib/ebss/test/propuesta.test.ts`:
- `REGLAS_PROPUESTA`: la tabla del análisis como reglas «motivo → fichas», de lo general a lo
  particular; `fichasPropuestas(p)` da cada ficha con sus motivos («aplica HS 4», «cubierta
  inclinada», «se modifican los huecos de fachada»), en el orden del catálogo.
- `seleccionDeFichas(p)`: todo el catálogo con `propuesta`, `motivos` y `marcada`, para la pantalla
  del paso 6. `marcarFicha` y `conEdicion` escriben la diferencia (`SeleccionFichas`) sin listas
  vacías, igual que la lee `parseSeguridadSalud`.
- `fichaEditada` aplica lo que edita el proyectista; `fichasDelEstudio(p)` da las fichas del
  documento (paso 5), ya editadas; `fichasSinRevisar(p)`, las «redactadas por la app» marcadas y
  sin revisar, para «Antes de entregar».
- Lo que sale en los casos: la unifamiliar, 51 fichas (cubierta inclinada con línea de vida,
  andamio de fachada con el anexo II.1); la plurifamiliar, 51 (cubierta plana, ICT); la reforma
  «local a vivienda», 34 (demoliciones, picado, apertura de huecos, puntales, bajante, martillo
  rompedor, particiones, carpintería, aseos e instalaciones; sin cimentación, estructura, cubierta
  ni andamio).

**Decisiones del paso 4, a validar:**
1. **Lo común a toda obra** (F0, IP1, IP3–IP7, MA2, MA5, M13, M22) se propone también en edificio
   existente; el análisis lo daba solo en obra nueva.
2. **IP2 (vía pública) solo si se declara** que se ocupa; el análisis la daba en toda obra nueva.
   IP9, con el edificio o el local en uso.
3. **En obra nueva, la cubierta, las instalaciones y el andamio no van en bloque**: la cubierta
   según El edificio (F16 + F18 si es plana, F17 + MA9 si es inclinada), las instalaciones por las
   justificaciones y el andamio por las plantas.
4. **Andamio de fachada (MA1) desde dos plantas sobre rasante**; con una sola, la torre móvil
   (MA3). El aviso del anexo II.1 lo lleva la propia ficha MA1.
5. **Apertura de huecos (F40)** con actuación en la estructura **o con los huecos de fachada en el
   alcance**: el local que pasa a vivienda abre o cambia huecos. Si solo se cambian carpinterías,
   el proyectista la quita.
6. **Línea de vida (MA9) con cubierta inclinada**, que no estaba en la tabla.
7. **«Aplica» es la aplicabilidad efectiva distinta de «no aplica»**, también en obra nueva y
   también la forzada o «externo»: HE 6 sin aparcamiento no propone la electricidad por HE 6, y una
   HS 4 forzada a «no aplica» quita la fontanería.
8. **ICT (F26) solo en plurifamiliar de obra nueva** (no hay justificación de ICT en la app);
   **ascensor (F27) solo en obra nueva** con el ascensor marcado en El edificio.
9. **F41 y F42 solo en edificio existente con vía pública**: el vuelo, si se interviene la
   fachada; el izado de equipos, si aplica HE 4 o HE 5.
10. **Fichas que siguen a otras**: IP8 (inflamables) con pinturas o impermeabilización; TP3 con
    cualquier instalación (F22–F27); TP1 con la cubierta; TP2 con la fachada o sus huecos.
11. **Grúa móvil → camión grúa (M6)**, que es grúa móvil autopropulsada; grúa torre → M7. Las dos
    proponen el izado de cargas (F36). **Derribo previo** en obra nueva → F2, MA10, M1 y M2.
12. **Quitar una añadida que la app no propone no la apunta como quitada**: si más adelante la
    propone, vuelve a salir. Marcar una ficha la saca siempre de las quitadas.
13. **En las ediciones**, un riesgo añadido que ya está en la ficha no se repite, ni una medida
    añadida con el texto de otra; una edición vacía se borra; los ids que el catálogo ya no tiene
    se ignoran.

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

**Hecho (2026-10-18).** [src/lib/obra/estudioBasico.ts](src/lib/obra/estudioBasico.ts), puro, con los textos
fijos en [src/lib/ebss/textos.ts](src/lib/ebss/textos.ts) y 48 tests en `src/lib/obra/test/estudioBasico.test.ts`
(más 3 en `catalogo.test.ts`):
- `estudioBasico(p, { firmantes, fecha })` da los apartados con sus bloques y la lista `pendientes`
  (para «Antes de entregar», paso 6); `bloquesEstudioBasico`, `textoPlanoEstudioBasico`,
  `nombreArchivoEstudioBasico` («estudio-basico-ss-…») y `META_ESTUDIO_BASICO` para el Word.
- `NORMAS_EBSS` (K-SYS.17, las de grúas solo con la grúa o con M6 / M7 marcadas), objeto, primeros
  auxilios (A.14 literal, convenio 234, botiquín de la Guía), amianto, obligaciones (comunicación de
  apertura de K-SYS.20 literal, libro de incidencias con el 13.4) y cabeza de familia.
- La memoria remite a los dos estudios al final del cuadro inicial (`remisionEstudios`). La foto del
  expediente se regenera: solo cambia la huella de la memoria de los 40 proyectos.
- Catálogo: las notas para el proyectista pasan a `avisos` (no se imprimen) y 6 medidas llevan
  `evitable` con la clave del riesgo que evitan.
- Comprobado: en los cuatro casos, ningún prohibido, ningún id de ficha ni referencia interna, ningún
  apartado vacío; el Word y el PDF se componen (la reforma, más de 10 hojas).

**Decisiones del paso 5, a validar:**
1. **Datos generales delante, sin número**, y los apartados del 1 al 14 (la tabla del plan tenía un
   0). Los datos van en el orden de la Orden TIN/1071/2010, art. 2.2, con PEM y PEC al final.
2. **Las cuatro columnas de la ficha son listas independientes**, una entrada por fila, como en los
   ejemplos de tres columnas (ss10, ss12): así ninguna fila crece y la tabla se parte entre hojas. Al
   principio del 8, una frase lo aclara («las medidas de una ficha se aplican a todos sus riesgos»).
3. **Riesgos evitables (7)**: las medidas del catálogo marcadas `evitable` (F0 clima, F1 acometidas
   anuladas, F3 localizar instalaciones antes de picar, F22 conectar sin tensión, F35 sustituir
   productos peligrosos, IP3 desvío o corte del servicio) y dos de la obra: con línea aérea, su
   desvío o corte (RD 1627 anexo IV C.10 c); con amianto posible o identificado, retirarlo antes de
   demoler. Salen de la tabla de su ficha. Cierra con «no se relacionan los que el proyecto ya ha
   evitado» (Guía folio 27).
4. **Notas internas fuera del documento**: las de F17, F40–F42, IP6 e IP9 pasan a `avisos`; a las de
   F1 y F5 se les quita «(decisión 12)» y «K-SYS.1».
5. **Remisiones entre fichas**: «(ver MA10)» se imprime con el título de la ficha entre comillas, y
   desaparece si esa ficha no está en el estudio.
6. **Dónde va cada grupo**: IP en el 6 (IP6, servicios higiénicos, en 6.2, tras la dotación
   calculada); F0, F, MA y M en el 8; TP en el 12, con dos tablas (previsiones e informaciones útiles;
   riesgos y medidas).
7. **Orden de ejecución propio** para el 4 y el 8: F40 tras el picado, F41 tras los cerramientos, F42
   tras la climatización; F36–F38 al final como «trabajos que se dan en varias fases». No se inventa
   la «fase única» ni la tabla proceso → cuadrilla (la app no sabe las cuadrillas).
8. **Anexo II**: los datos deciden el 2 (amianto) y el 4 (alta tensión: más de 1 kV declarado); sin
   dato, la condición del catálogo va entre paréntesis («si hay una línea de alta tensión próxima»).
   Cada apartado lleva una medida específica de texto fijo. Sin ninguno, «no se prevén» con el motivo.
9. **Con `completo`**, solo el apartado 1, sin el compromiso del promotor, y un pendiente.
10. **Compromiso del promotor** al final del 1 (en `basico` y `pendiente`) y una línea «Conforme con
    el compromiso del apartado 1, el promotor» en la firma.
11. **Pendientes en su apartado**: la vía pública y el edificio en uso solo en el 9; lo del art. 4 en
    el 1; centro, servicios y tensión en el 3. La lista `pendientes` suma promotor, firmantes, fichas
    sin revisar, sin unidades de obra y sin trabajos posteriores.
12. **Fecha y lugar**: el municipio y la fecha que se pasa; sin fecha, «en la fecha de la firma».
13. **Autor del estudio**: el coordinador en proyecto si procede (art. 6.1); si no, los firmantes como
    «técnico competente designado por el promotor».
14. **Parafraseado sin cotejar el literal** (no está en K-SYS): el art. 13.2 (el libro lo facilita el
    colegio del técnico que aprueba el plan), la notificación del 13.4 al contratista y a los
    representantes, y el art. 14 (paralización). Conviene cotejarlos en el paso 7.
15. **Cifras**: los euros con el formato de `art4` (es-ES: «7200,00 €», sin punto en cuatro cifras,
    como pide la RAE); las distancias del RD 614/2001 en metros con dos decimales.

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

**Hecho (2026-10-18).** 16 tests nuevos (7 en `src/lib/obra/test/entregaEbss.test.ts` y 9 de interfaz en
`src/pages/test/seguridadSalud.test.tsx`) y comprobado en el
navegador (sin errores de consola; en móvil, sin desplazamiento lateral):
- [SeguridadSaludPage.tsx](src/pages/SeguridadSaludPage.tsx) en `/p/:id/seguridad-salud`: a la izquierda,
  el art. 4 (presupuesto con el PEC desglosado, plazo, trabajadores con la ayuda para estimarlos,
  jornadas con la tabla de periodos si la cota pasa de 500, túneles), la tabla de supuestos en vivo y el
  resultado; amianto, coordinación (con el motivo de cada coordinador), entorno (centro asistencial con
  el mapa, vía pública, edificio en uso, servicios afectados, tensión) y medios, servicios higiénicos y
  planos. A la derecha, [FichasEbss.tsx](src/components/ebss/FichasEbss.tsx): las fichas por grupo, con su
  motivo, para marcar o quitar, y su edición (riesgos, medidas, protecciones y EPI; «la doy por buena»
  en las redactadas por la app). Controles en [src/components/ebss/controles.tsx](src/components/ebss/controles.tsx).
- [EstudioBasicoPage.tsx](src/pages/EstudioBasicoPage.tsx) en `/p/:id/estudio-basico`: el documento como
  sale en el Word, con lo que falta arriba.
- `useExportarEstudioBasico` en el hook común (los bloques reciben ya el estudio, para los firmantes).
- `entrega.ts`: `PendienteEntrega.key` admite `"seguridadSalud"`; `antesDeEntregar` suma los del estudio
  básico; `entregables().seguridadSalud` con `resultado` y `empezado`. `estudioBasico.ts` da
  `pendientesEstudioBasico(p)`, los pendientes con su id, sin componer el documento.
- Lo que se entrega: la fila del estudio básico, la última, con Datos, Leer, Word y PDF. Barra lateral:
  «Seguridad y salud» tras Memoria CTE.

**Decisiones del paso 6, a validar:**
1. **Sin empezar no hay avisos.** Mientras el proyecto no tiene `seguridadSalud`, «Antes de entregar» no
   añade nada (el estudio puede hacerse fuera); La obra pone «sin empezar» y desactiva Word y PDF; la
   barra lateral, sin glifo. Cualquier dato que se declare lo empieza.
2. **«Antes de entregar», sin inundar**: en rojo, el supuesto superado (y solo eso); en ámbar, el PEC
   cerca del umbral (decisión 4), el PEM, el plazo, los trabajadores, el centro, el amianto y cada ficha
   redactada por la app sin revisar, uno a uno; lo demás, en una línea («Quedan 7 cosas más…») con los
   textos en el detalle. Los firmantes no: ya tienen el aviso de «Tu estudio».
3. **El código del aviso es «Seguridad y salud»** y lleva a la pantalla.
4. **Recuento**: los apartados sin «Pendiente», de 15, sin contar el de quién firma (es del estudio, no
   del proyecto). Con el estudio completo, «hace falta el estudio completo» en rojo y 0 de 1.
5. **Sin fecha**: el documento dice «en la fecha de la firma». Firman los de «Tu estudio» que elige el
   proyecto, como en la memoria.
6. **Glifo de la barra lateral**: ✕ completo, ! con apartados pendientes, ✓ listo.
7. **Dos columnas**: datos a la izquierda, fichas a la derecha. Por defecto «Las de esta obra» (las
   propuestas y las marcadas); «Todo el catálogo» para añadir las que la app no propone.
8. **La estimación de trabajadores solo informa** (jornadas y media), sin botón para tomarla: el dato del
   art. 4 lo teclea el proyectista.
9. **El mapa del centro asistencial** busca en Google Maps «urgencias cerca de <municipio>». Dirección,
   distancia y tiempo se activan con el nombre (sin nombre, el dato no se guarda).
10. **Números**: vacío es «sin declarar», nunca 0; coma decimal y puntos de millar («450.759»). Lo que se
    guarda pasa por `parseSeguridadSalud`, igual que al importar.
11. **La tabla de supuestos usa un nombre corto** («Volumen de mano de obra»); el texto del art. 4.1 va en
    la ayuda de la celda y en el documento.
12. **No se editan** las previsiones e informaciones útiles de los trabajos posteriores, ni la
    descripción ni la eficacia de las fichas: solo riesgos, medidas, protecciones y EPI. «Deshacer lo
    editado» conserva la marca de revisada.

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
