# feature-29 — Memoria como la del estudio · Fase 2: el esqueleto del documento

> Fase 2 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.2). Escrito el 2026-10-10, tras cerrar la
> fase 1 ([feature-28.md](feature-28.md)).

## Decisiones del usuario (2026-10-10)

1. **Numeración fija**, sin prefijo configurable, con el esquema de las memorias del estudio:
   - «3. Cumplimiento del CTE», con 3.1 SE, 3.2 SI (3.2.1 SI 1…), 3.3 SUA, 3.4 HS, 3.5 HR y 3.6 HE;
   - «4. Cumplimiento de otros reglamentos», con 4.1 REBT.

   Cuando la app haga la memoria completa (descriptiva, constructiva…), el capítulo ya tiene su
   número.
2. **Firma uno; puede firmar un segundo.** Los datos del estudio guardan las personas que firman,
   y cada proyecto elige una (por defecto) o dos.
3. **«Normativa aplicada» va en el anejo de fichas**, no en la memoria.

## Lo que hay hoy

- **Orden y rótulos.** La memoria sigue el orden del registry (HS, SI, SUA, HR, HE, REBT, SE) con
  rótulos «DB-HS 1 · Protección frente a la humedad», sin número. El título es «Memoria CTE de
  instalaciones».
- **Formato del Word.** [render.ts](src/lib/docx/render.ts) hace un Word de una sola sección, sin
  cabecera ni pie.
- **Datos que no existen.** No hay datos del estudio ni del documento: título para el pie, fase,
  emplazamiento, referencia catastral, promotor y firmantes. La portada del anejo dice «CONCRETA
  INSTALACIONES» y el nombre del proyecto.
- **Línea de fuente.** Cada apartado la termina con la versión consolidada, «datos de El
  edificio» y «motor 0.2.0».

## Objetivo

La memoria de la unifamiliar se pega en la plantilla del estudio sin retocar. Para ello:

- capítulos y apartados numerados, en el orden del CTE;
- cabecera con el estudio y pie con el título del proyecto y «Página N»;
- índice de Word que recoge los títulos;
- cuadro inicial con el tipo de obra y dónde se justifica cada exigencia;
- sin jerga interna;
- en el anejo de fichas, los firmantes en la portada y la normativa aplicada.

## Pasos

### Paso 1 · Orden y numeración (puro)

- En [memoria.ts](src/lib/obra/memoria.ts), un mapa de capítulos y secciones del documento, en vez
  del `grupo` del registry:
  - 3: SE, SI, SUA, HS, HR, HE (HE 0/HE 1 antes que HE 1);
  - 4: REBT.
- Un test asegura que toda justificación del registry tiene su sitio.
- Cada apartado lleva su número y un rótulo corto: «3.2.1. SI 1 Propagación interior».
- Una sección con un solo apartado del mismo nombre (SE, HR) no repite título: el texto va bajo
  «3.5. Protección frente al ruido DB HR».
- Títulos: H1 para el capítulo, H2 para el DB, H3 para la sección.
- «Apartados pendientes» al final, sin número.

### Paso 2 · Cuadro inicial

Bajo «3. Cumplimiento del CTE», dos tablas:

- tipo de proyecto, tipo de obras, alcance y cambio de uso, como abren el SI los ejemplos;
- exigencia, cómo se aplica (se aplica, a lo intervenido, no aplica, con HULC…) y en qué apartado
  se justifica.

### Paso 3 · Línea de fuente limpia

- En la memoria (no en la ficha ni en el anejo), la línea de fuente pierde la versión
  consolidada, «datos de…» y «motor…».
- Se queda con el DB, las tablas y los apartados.

### Paso 4 · Datos del estudio y del documento

- **Estudio**, global y en local (como los ajustes de la IA):
  - personas que firman: nombre, titulación, nº de colegiado y colegio;
  - dirección, teléfonos y correo.
- **Documento**, en el proyecto (`DatosGenerales.documento`, opcional, sin migrador):
  - título para el pie y fase (básico, ejecución, básico y ejecución);
  - emplazamiento, referencia catastral y promotor;
  - quién firma: por defecto, la primera persona del estudio.
- **Pantallas:**
  - «Tu estudio» en Inicio;
  - «Documento» en Los datos de la obra.

### Paso 5 · Cabecera y pie

- **Word**: cabecera en dos columnas, como la del estudio. A la izquierda los firmantes con su
  titulación y la dirección; a la derecha el colegiado y los teléfonos. Pie con el título del
  proyecto y «Página N» (campo de Word).
- **PDF de la memoria**: lo mismo.
- **Sin datos del estudio**: ni cabecera ni aviso dentro del documento. Sale en «Antes de
  entregar».

### Paso 6 · Anejo de fichas

- La portada lleva el título del documento, el emplazamiento, el promotor y los firmantes.
- Una página «Normativa aplicada» tras el índice: documento y versión consolidada que se ha
  aplicado, sacadas de las fichas (`edicionDB`, `normativa`), y el motor.

### Paso 7 · Lo supuesto fuera del texto

- Los «(supuesto)» / «(supuestos)» que salen en el texto de la memoria se quitan de la memoria
  (no de la ficha ni de la pantalla).
- Cada uno queda como aviso en «Antes de entregar». Se comprueba módulo a módulo que el aviso ya
  existe, y si no, se crea.

### Paso 8 · Cierre

- Tests en verde.
- La foto del expediente cambia solo en la huella de la memoria.
- El Word abierto en Word, y la memoria de la unifamiliar comparada con la del ejemplo.

## Fuera de esta fase

- El párrafo único de criterios de obra existente (Parte I art. 2.3, no empeoramiento) en lugar de
  repetirlo en cada sección: fase 3, con el resto de la obra existente.
- La numeración configurable: no hace falta hasta tener la memoria completa.

## Hecho (2026-10-10)

1551 tests en verde. La foto del expediente solo cambia en la huella de la memoria. Commits:
698910e (pasos 1 y 3), b5c9254 (pasos 2, 4 y 5), f36be96 (paso 6) y el del paso 7.

- **Pasos 1 y 3.** `SECCIONES`, `CAPITULOS`, `numeroFijo` y `fuenteCorta` en
  [memoria.ts](src/lib/obra/memoria.ts).
  - Rótulos con el título del CTE (`TITULOS`), sea cual sea el estado del apartado.
  - SE y HR van sin título propio, bajo el de su sección.
  - El cuerpo ya no lleva «proyecto · fecha»: `bloquesMemoria` y `textoPlanoMemoriaCte` pierden
    el parámetro de la fecha.
  - La pantalla de Memoria enseña los capítulos.
- **Paso 2.**
  - `cuadroInicial`: tipo de proyecto, tipo de obras, alcance y cambio de uso, y la tabla
    «Exigencia | Aplicación | Apartado», con los pendientes en su sitio.
  - **La numeración es fija**: un pendiente (SUA 1 en la reforma) no corre la de los demás.
- **Paso 4.**
  - [estudio.ts](src/lib/estudio/estudio.ts): `parseEstudio`, `leerEstudio`, `guardarEstudio`,
    `firmantesDe` y `membreteDe`.
  - [useEstudio.ts](src/lib/estudio/useEstudio.ts).
  - «Tu estudio» en Inicio ([TuEstudio.tsx](src/components/estudio/TuEstudio.tsx)): hasta
    4 personas.
  - «Documento» en Los datos de la obra.
  - `DatosGenerales.documento`, opcional y sin migrador.
- **Paso 5.**
  - Word con cabecera (tabla de dos columnas sin bordes y raya) y pie con el título y el campo
    PAGE.
  - PDF con lo mismo; el pie con el motor se va de la memoria y se queda en el anejo.
  - Sin estudio, aviso «Documento · Sin datos del estudio» en «Antes de entregar».
- **Paso 6.**
  - Portada del anejo con título, fase, emplazamiento, promotor, referencia catastral y
    firmantes.
  - «Normativa aplicada» al final (`normativaAplicada`), con el motor.
  - La marca de la portada pasa a «CONCRETA MEMORIAS».
- **Paso 7.** `sinSupuestos` quita del texto de la memoria las marcas «(supuesto…)»,
  «(estimación)» y las coletillas «a falta de la del emplazamiento / del leído para el
  municipio». La ficha y la pantalla del módulo las conservan.

## Decisiones a validar

1. **La colegiación es texto libre**, tal como debe salir en la cabecera («Colegiado nº 1711 del
   COA Málaga»), igual que la titulación. Así no se presupone el género de quien firma.
2. **«Normativa aplicada» va al final del anejo**, tras los pendientes, no como página con
   entrada en el índice.
3. **El Ld por defecto de HR se queda en el texto** («valor por defecto del DB… a falta de datos
   oficiales»): es el criterio del propio DB-HR, no un supuesto de la app.
4. **Sin el estudio rellenado, el aviso sale en todos los proyectos**: es ámbar y desaparece en
   cuanto se rellena «Tu estudio».
5. **En el PDF de la memoria**, las columnas del cuadro inicial salen alineadas a la derecha
   (`drawTable`): legible, pero distinto del Word.
