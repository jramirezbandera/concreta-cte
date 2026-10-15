# feature-33 — Memoria como la del estudio · Fase 6a: anejo de instalaciones (HS 4 y HS 5)

> Primera mitad de la fase 6 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.6). Escrito el 2026-10-15,
> tras cerrar la fase 5 ([feature-32.md](feature-32.md)). La fase se parte en dos:
> - **6a (esta)**: el documento, HS 4 y HS 5, que tiran de motores que ya existen, los planos
>   y las remisiones desde la memoria;
> - **6b (feature-34)**: el REBT aguas abajo (circuitos, puntos de utilización, derivación
>   individual, LGA y tierra), que es motor nuevo.

## Lo que hay hoy

**El documento.**
- La memoria (Word y PDF) sale de `bloquesMemoria(memoriaCte(p))` → `BloqueMemoria[]` más el
  `Membrete`, con capítulos fijos 3 (CTE) y 4 (otros reglamentos) en
  [memoria.ts](src/lib/obra/memoria.ts). La tubería es genérica: `memoriaDocx(bloques, membrete)`
  y `renderMemoriaPdf` sirven para cualquier lista de bloques. Solo dan por hecho que el
  documento es la memoria en dos sitios: el `subject` del Word y el nombre del archivo.
- El «anejo» que existe ([anejo.ts](src/lib/pdf/anejo.ts)) es otra cosa: el PDF de fichas, sin
  numeración, con su propio pie legal. Se queda como está.
- En Word, una tabla de más de 8 columnas (`MAX_COLUMNAS`) se parte repitiendo la columna 0.
- No hay remisiones («ver anejo», «ver planos») ni un campo de planos.

**HS 4** ([calc.ts](src/modules/hs4/calc.ts)).
- Calcula por tramo casi todo lo que pide la tabla: Lr, Qb, K, Q, Ø, v, pérdidas (altura,
  rozamiento, localizadas) y presión residual. El camino al punto crítico está marcado
  (`esCritico`), pero no ordenado.
- No guarda J (se calcula y se tira), ni la presión de entrada del tramo (es la de salida del
  padre), ni Lt. Las pérdidas localizadas son un porcentaje del rozamiento (25 % por defecto), no
  una longitud equivalente.
- Del contador solo hay recuentos y la decisión batería / por planta. No hay tabla 4.1, ni red de
  ACS, ni retorno (el dato de 15 m existe, pero no se usa), ni aislamiento.
- La memoria lleva una tabla de presiones por planta. No hay tabla por tramos.

**HS 5** ([calc.ts](src/modules/hs5/calc.ts)).
- UD y Ø mínimo por aparato (tabla 4.1); por tramo, el tipo, las UD acumuladas, la pendiente, el
  Ø y la capacidad; las comprobaciones de bajante (tabla 4.4) y las pluviales.
- La tabla de aparatos por vivienda tipo hay que montarla agrupando. En modo «edificio» hay un
  solo «Colector general», del que cuelgan todas las bajantes. Los tramos no tienen longitud.
- La tabla 4.13 de arquetas está como dato, pero solo la usa un texto (`arquetaDe`). No hay
  arquetas como objetos.

**Las dos redes** salen del edificio (modo «edificio», con longitudes por defecto) o las dibuja el
proyectista (modo «manual»).

## Objetivo

Un tercer entregable, **«Anejo 5.3 · Instalaciones del edificio»**, en Word y PDF:
- con la misma cabecera, el mismo pie y los mismos estilos que la memoria;
- con el cálculo extenso de fontanería (5.3.1) y saneamiento (5.3.2);
- con el hueco de electricidad (5.3.3) reservado para feature-34.

La memoria remite a él y a los planos de cada instalación. Criterio de hecho del plan: **el anejo
sustituye al de CYPE en la unifamiliar del ejemplo sin contradecir la memoria.**

## Principios

- **El anejo no calcula nada que la memoria no sepa.** Lee el mismo `HS4Result` y `HS5Result`.
  Si el anejo necesita un dato que el motor no guarda (J, Pentrada), se añade al resultado del
  motor sin cambiar ningún número.
- **Lo estimado se dice.** En modo «edificio», las longitudes son de la app, no del proyecto. La
  tabla lleva una nota que lo dice y «Antes de entregar» pide confirmarlas o dibujar la red
  (principio 5 del plan).
- **Las abreviaturas, una vez**, al principio de cada apartado, no en cada tabla.
- **Sin filas de relleno.** Lo que no hay (retorno de ACS sin red de ACS, contador general en una
  batería que da la compañía) va en una línea con su motivo, como en la memoria.
- **Mismo documento, misma tubería.** El anejo son `BloqueMemoria[]`, que se pintan con
  `memoriaDocx` y `renderMemoriaPdf`; no hay un tercer renderizador.

## Pasos

### Paso 0 · Normativa (agente `cte-normativa`)

Antes de escribir código:
1. **HS 4, tabla 4.1** (armario y cámara del contador general): valores por Ø del contador,
   cuándo es armario y cuándo cámara, y qué Ø de contador tomar si la compañía no lo ha dado.
2. **HS 5, tabla 4.13** (arquetas): cotejar la tabla que ya está en
   [tablas.ts](src/modules/hs5/tablas.ts). Además, qué arquetas exige el DB, con su apartado:
   a pie de bajante, de paso por cambio de dirección y por distancia, sifónica o registro antes
   de la acometida.
3. **Retorno de ACS** (HS 4 ap. 2.3 y 4.4): umbral de 15 m y cómo se cita. Solo para la línea de
   «no aplica» o de remisión; el dimensionado del retorno queda fuera (ver Fuera de alcance).

El resultado se apunta como K-MEM.18 y siguientes en
[research/verificacion-memoria.md](research/verificacion-memoria.md).

**Hecho (2026-10-15), K-MEM.18.** Leído en el consolidado vigente (DBHS.pdf, RD 450/2022) y en
el comentado (DccHS.pdf, 12-02-2025). La tabla 4.1 se ha cotejado en imagen (p. 90); el resto, en
texto coincidente en los dos PDF. Cambia el diseño de los pasos 2 y 3:
- **Tabla 4.1**: once Ø, de 15 a 150 mm. **Armario hasta Ø 40 y cámara desde Ø 50** (imagen). El
  rótulo literal dice «armario y … arqueta».
- **Ø del contador**: el DB no da tabla (4.5.1: «adecuado» a los caudales; 2.1.1 pto 2: los da la
  compañía). Se usa como criterio el DN del tubo de alimentación, redondeado a la columna igual
  o mayor, salvo que el proyectista dé el de la compañía.
- **Batería de divisionarios**: el DB no fija dimensiones (lo dice el comentario, p. 98). Solo
  pide un local suficiente para el mantenimiento (2.1.4 pto 1), salvo en vivienda aislada o
  adosada.
- **Tabla 4.13**: la de la app es correcta (cifras, L × A y «ap. 4.5 pto 1»).
- **Arquetas**:
  - a pie de bajante, solo con colector enterrado, y nunca sifónica; con colector colgado, piezas
    especiales y registros;
  - pozo general siempre, uno por acometida;
  - arqueta de trasdós si llega más de un colector al pozo general;
  - arqueta sifónica, condicional: con alcantarillado unitario se puede sustituir por cierres
    en los puntos de captación;
  - registros a ≤ 15 m, en red enterrada y en colgada (3.3.1.4.1 pto 5 y 3.3.1.4.2 pto 4);
  - la arqueta en el límite de parcela no es del DB, sino de la ordenanza o de la entidad de
    saneamiento.
- **Retorno de ACS**: el 3.2.2.1 pto 3 dice «tanto en instalaciones individuales como en
  instalaciones de producción centralizada». **También con ACS individual.** Cita: «ap. 2.3 pto 2
  y ap. 3.2.2.1 pto 3».
- **Presiones** (p. 83, en el PDF oficial): 100 kPa en grifos comunes, 150 kPa en fluxores y
  calentadores, y 500 kPa como máximo en cualquier punto.

### Paso 1 · El documento

- `src/lib/obra/anejoInstalaciones.ts`: `anejoInstalaciones(p)` (modelo) y
  `bloquesAnejoInstalaciones(a)` (bloques), puros, como `memoriaCte` / `bloquesMemoria`.
  - H1 «5.3. Instalaciones del edificio»; H2 «5.3.1. Fontanería (DB-HS 4)», «5.3.2. Saneamiento
    (DB-HS 5)» y «5.3.3. Electricidad (REBT)».
  - Un apartado que no aplica o no está calculado sale en una línea («No procede: …») con el
    mismo motivo que la memoria. El 5.3.3 dice que está pendiente hasta feature-34.
- Tablas numeradas «Tabla 5.3.1-1 …» en el rótulo, para que la memoria las cite.
- **Tablas anchas.** La de tramos de HS 4 tiene 11 columnas. Se añade `TablaMemoria.ancha` (hasta
  12 columnas, letra de 7 pt) para no partirla: una tabla de tramos partida por la columna 0 no
  se lee. El troceo de siempre sigue para el resto.
- `memoriaDocx` y `renderMemoriaPdf` reciben el título, el `subject` y el nombre de archivo en un
  parámetro (hoy «Justificación del CTE» y `nombreArchivoMemoria`). El anejo se llama
  `anejo-instalaciones-<proyecto>`.
- En Lo que se entrega ([LoQueSeEntrega.tsx](src/components/obra/LoQueSeEntrega.tsx)), una fila
  nueva «Anejo de instalaciones» con Leer, Word y PDF, y su recuento en `entregables()`. El hook,
  como `useExportarMemoria`.

**Hecho (2026-10-15).**
- [anejoInstalaciones.ts](src/lib/obra/anejoInstalaciones.ts): `anejoInstalaciones(p)`,
  `bloquesAnejoInstalaciones`, `numeroTabla` y `textoPlanoAnejoInstalaciones`.
  - Cada módulo da su cálculo con `ModuloCalculado.anejo?(): AnejoDoc`: abreviaturas y partes
    (H3, sin número), con párrafos y tablas.
  - Un módulo que cumple pero aún no tiene `anejo()` sale como «Pendiente: el cálculo extenso de
    … aún no se desarrolla en este anejo». No cuenta como listo.
  - El párrafo de entrada remite a la memoria: fontanería (3.4.4), saneamiento (3.4.5) y
    electricidad (4.1.1).
- `TablaMemoria.ancha`: hasta 12 columnas sin partir, a 7 pt en el Word y a 6,5 pt en el PDF.
- `memoriaDocx` recibe el asunto y la descripción; `renderMemoriaPdf`, el nombre del archivo.
  `nombreArchivo(prefijo, …)`.
- Lo que se entrega: la fila «Anejo de instalaciones» con Leer, Word y PDF, y el recuento
  `entregables().instalaciones`. Hasta que HS 4 y HS 5 den su `anejo()` sale «0 de 3» y los
  botones están desactivados.
- Página «Leer» en `/p/:id/anejo-instalaciones`.
- `useExportarMemoria` pasa a ser `useExportarDocumento`, con dos usos: la memoria y el anejo.
- Tests: [anejoInstalaciones.test.ts](src/lib/obra/test/anejoInstalaciones.test.ts) (10). También
  se ajustan los de entregables y los de Lo que se entrega. 1638 en verde.

### Paso 2 · Fontanería (5.3.1)

- **Motor, sin cambiar números.** `ResultadoTramoHS4` gana `j_kPa_m` y `presionEntrada_kPa`. Se
  añade `caminoCritico(result)`, que devuelve los tramos ordenados del contador al grifo más
  desfavorable. Test: los resultados de siempre no cambian (snapshot) y la suma de pérdidas del
  camino es igual a Pacometida − Pcrítica.
- **Tabla 5.3.1-1, camino crítico.** Columnas: tramo, Lr, Lt, Qb, K, Q, Ø, v, J, Pentrada,
  Psalida.
  - Lt = Lr·(1 + f), con f el porcentaje de localizadas. Es como calcula el motor, y la
    abreviatura lo dice.
  - Una fila por tramo, del contador al punto crítico.
  - La última línea es la conclusión: presión en el punto crítico frente a la mínima (100 kPa en
    grifo común, 150 kPa en fluxor y calentador), presión en el punto más bajo frente a la máxima
    (500 kPa), y si hace falta grupo de presión o reductora.
- **Tabla 5.3.1-2, resto de tramos.** Tramo, Qb, K, Q, Ø, v. Así queda justificado cada Ø de la
  red, no solo el del camino crítico. Los tramos iguales (`iguales`) se agrupan en una fila con
  «× n».
- **Caudales por aparato** (tabla 2.1): aparato, nº por vivienda tipo, Qagua fría y QACS. Es lo
  que el revisor coteja primero.
- **Contador** (K-MEM.18):
  - **con contador general**: armario (Ø ≤ 40) o cámara (Ø ≥ 50) con las medidas de la tabla 4.1.
    El Ø es el de la compañía si el proyectista lo da (dato nuevo, opcional). Si no, es el DN del
    tubo de alimentación redondeado a la columna igual o mayor, rotulado «criterio de proyecto» y
    listado en «Antes de entregar»;
  - **con batería de divisionarios**: nº de contadores y una línea: «local con dimensiones
    suficientes para su mantenimiento (ap. 2.1.4 pto 1); medidas de la batería según la compañía
    suministradora». No se pone en vivienda aislada ni adosada.
- **ACS:** la línea del sistema (individual o central) y la del retorno, **en los dos
  casos**: «la red de ACS dispone de retorno por ser la ida al punto más alejado ≥ 15 m (DB-HS 4,
  ap. 2.3 pto 2 y ap. 3.2.2.1 pto 3)», o que no lo necesita por ser < 15 m.
  - La longitud de ida es un dato nuevo del módulo, opcional. Se sugiere desde la red de HS 4: el
    recorrido desde la entrada de la vivienda (o la producción, si es central) hasta el aparato
    con ACS más alejado.
  - Sin dato ni red, la línea dice la condición y «Antes de entregar» la pide.
- **Nota de longitudes** en modo «edificio» y aviso en «Antes de entregar».

**Hecho (2026-10-15).**
- **Motor** ([calc.ts](src/modules/hs4/calc.ts)): añade `j_kPa_m` y `presionEntrada_kPa` por tramo,
  `fraccionPerdidasLocalizadas` en el resultado y `caminoCritico(r)`. Al regenerar los snapshots
  solo se añaden líneas: 86 nuevas y ninguna cifra cambia. Los tests comprueban que:
  - las pérdidas del camino suman Pacometida − Pcrítica;
  - J·L es el rozamiento.
- **Tabla 4.1** en [tablas.ts](src/modules/hs4/tablas.ts) (`CONTADOR_GENERAL_TABLA_4_1`,
  `filaContadorGeneral`).
- **[anejo.ts](src/modules/hs4/anejo.ts)** (`anejoHs4`), con cinco partes:
  - **caudales por aparato**: una columna por unidad tipo, con los Qb de agua fría y de ACS;
  - **camino crítico**: 11 columnas, en tabla ancha;
  - **resto de la red**: los tramos iguales agrupados, ordenados por profundidad en la red;
  - **contador**: tabla 4.1 en la unifamiliar; batería o por planta en el resto, sin
    dimensiones del DB;
  - **agua caliente sanitaria**: ida estimada o declarada, frente a 15 m.
- **En reforma**, la acometida y el tubo de alimentación salen como «(existente)», con su nota.
- **Aviso nuevo** `longitudes-estimadas` en modo «edificio», que sale en «Antes de entregar».
  - Demo: 32 avisos (antes 31).
  - HS 4 del Demo: «2 cosas por revisar».
- **Datos opcionales** `Hs4Estado.diametroContador_mm` y `longitudIdaAcs_m`: el anejo ya los lee.
  **Su control en pantalla va en el paso 4**, con el de planos.
- Tests: [anejo.test.ts](src/modules/hs4/test/anejo.test.ts) (18), con la coherencia
  memoria–anejo de la presión crítica. 1656 en verde.
- PDF del Demo revisado en imagen: la tabla de 11 columnas cabe sin partir y se lee.

### Paso 3 · Saneamiento (5.3.2)

- **Tabla 5.3.2-1, aparatos por vivienda tipo** (tabla 4.1 del DB): aparato, nº, UD por aparato,
  Ø de sifón y derivación, y el total de UD de la vivienda. Se agrupan los cuartos de la vertical
  por tipo de aparato.
- **Tabla 5.3.2-2, ramales, bajantes y colectores:** elemento, tipo, UD que recibe, pendiente, Ø
  y capacidad (UD admisibles). En bajantes, las dos comprobaciones de la tabla 4.4 (UD totales y
  ramal más cargado).
- **Arquetas** (K-MEM.18): `arquetasHs5(result, red)`, puro. Lee la disposición de los
  colectores (`colectores: "colgado" | "enterrado"`) y el tipo de alcantarillado, que el modelo
  ya tiene.
  - **Siempre**: el pozo general, uno por acometida.
  - **Colector enterrado**: una arqueta a pie de cada bajante, nunca sifónica. En modo «manual»,
    además, una por nudo (encuentro o cambio de dirección).
  - **Colector colgado**: sin arquetas a pie de bajante; una línea de piezas especiales y
    registros.
  - **Arqueta de trasdós**, si llega más de un colector al pozo general.
  - **Arqueta sifónica**: la exigencia y, con alcantarillado unitario, la alternativa de cierres
    hidráulicos en los puntos de captación.
  - **Registros a ≤ 15 m**, en una línea con su cita, que remite a planos: sin longitudes no se
    cuentan.
  - Por arqueta: tipo, Ø del colector de salida y dimensión de la tabla 4.13. `arquetaDe` pasa a
    leer de aquí.
  - La arqueta en el límite de parcela no se pone: es de la ordenanza o de la entidad de
    saneamiento.
- **Pluviales:** superficie, sumideros, canalón, bajantes y colector, con Ø y capacidad (ya
  calculados).
- **Ventilación** (primaria, secundaria): la línea que ya da el motor.

**Hecho (2026-10-15).** [anejo.ts](src/modules/hs5/anejo.ts) (`anejoHs5`, `arquetasHs5`,
`arquetaTabla413`), con seis partes:
- **Unidades de desagüe por aparato**: tabla 4.1 con los nombres del DB, una columna por unidad
  tipo y sus UD totales. Los cuartos de baño y de aseo van como conjunto, como los cuenta el motor.
- **Bajantes**: las dos comprobaciones de la tabla 4.4 (UD totales y ramal más cargado). Si sirve y
  atraviesa plantas a distinto lado de 3, una nota explica el criterio de las dos columnas.
- **Ramales y colectores**: los ramales iguales de varias plantas en una fila («· P1, P2 y P3»).
  En reforma, el colector existente con sus UD y la nota de lo que le añade la obra.
- **Arquetas**, con las reglas de K-MEM.18:
  - con colector enterrado, una a pie de cada bajante de residuales y de pluviales, no
    sifónicas, con el Ø del colector al que vierten;
  - con colgado, piezas especiales y registros;
  - pozo general siempre: uno con alcantarillado unitario y uno por red con separativo;
  - con unitario, arqueta de trasdós y cierre hidráulico;
  - separador de grasas si hay garaje;
  - registros a ≤ 15 m, en una línea;
  - en reforma, la acometida existente no se modifica.
- **Pluviales**: f = i/100 y una tabla con sumideros o canalón, bajante y colector.
- **Ventilación**.

Tests: [anejo.test.ts](src/modules/hs5/test/anejo.test.ts) (10), con la coherencia
memoria–anejo de las UD por vivienda y del colector general. 1666 en verde.

### Paso 4 · Remisiones y planos

- **Planos.** Un campo `planos?: string` por instalación («I05–I07»), editable en la pantalla de
  HS 4 y de HS 5. Se guarda en el proyecto (`DatosGenerales.planos?: Partial<Record<…>>`) para que
  REBT lo use igual en feature-34.
- **Memoria.** Al final de cada apartado de HS 4 y HS 5: «El cálculo por tramos se desarrolla en
  el anejo 5.3.1 (tablas 5.3.1-1 y 5.3.1-2). Ver planos I05–I07.» Sin planos declarados, solo la
  primera frase.
- **Antes de entregar.** Si hay apartado de instalaciones sin planos declarados, un pendiente
  suave: «Indica los planos de fontanería».

### Paso 5 · Casos y cierre

- Tests puros de `anejoInstalaciones` sobre el demo, la unifamiliar y «Reforma: local a vivienda»:
  - en reforma, solo lo intervenido: el contador añadido a la batería existente y las UD que se
    añaden a la bajante existente, con su comprobación (feature-30);
  - sin HS 4 ni HS 5, el anejo dice que no procede y no se rompe.
- **Foto del expediente:** se añade el hash del texto del anejo. La memoria cambia solo por las
  frases de remisión.
- **Coherencia memoria–anejo:** test que comprueba que el Ø, la presión crítica y las UD de la
  memoria coinciden con las del anejo. Es el criterio de hecho del plan.
- Abrir el Word en Word: índice, tabla ancha, cabecera y pie.
- Decisiones a validar, al final de este documento.

## Fuera de alcance

- **REBT aguas abajo**: feature-34.
- **Dimensionado de la red de ACS y de su retorno**: el modelo no tiene red de ACS. Hacerla es
  un motor aparte (caudales de ACS de la tabla 2.1, retorno, recirculación) que encaja mejor con
  el RITE de la fase 7.
- **Aislamiento de tuberías**: es RITE (IT 1.2.4.2.1). Fase 7.
- **Longitudes reales en modo «edificio»**: siguen siendo estimadas. Para que sean del proyecto,
  hay que dibujar la red (modo «manual») o, más adelante, leerla del plano.

## Decisiones a validar (propuestas)

1. **Partir la fase**: 6a (HS 4 + HS 5 + documento) y 6b (REBT, feature-34).
2. **Numeración «5.3» fija**, como los capítulos 3 y 4 de la memoria, que hoy no son
   configurables.
3. **Camino crítico completo más el resto de tramos resumido** (Q, Ø, v), en vez de todos los
   tramos con todas las columnas, que es lo que hace CYPE.
4. **Lt = Lr·(1 + f)** en lugar de longitudes equivalentes por accesorio: es lo que calcula el
   motor; cambiarlo cambiaría los resultados.
5. **Tabla ancha de 7 pt** para los tramos, en vez de partirla o poner la página en horizontal.
6. **Arquetas**: las que exige el DB según la red (K-MEM.18). Sin distancias, los registros
   a ≤ 15 m van en una línea que remite a planos, no se cuentan.
7. **Planos como texto libre** por instalación, no como lista de planos con número y título.
8. **Ø del contador general**: el de la compañía si se da y, si no, el DN del tubo de
   alimentación (criterio de proyecto, en «Antes de entregar»).
9. **Longitud de ida de ACS**: dato opcional del módulo, con un valor sugerido desde la red de
   HS 4.
