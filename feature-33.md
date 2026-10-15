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
    grifo común, 150 kPa en fluxor y calentador), y si hace falta grupo de presión.
- **Tabla 5.3.1-2, resto de tramos.** Tramo, Qb, K, Q, Ø, v. Así queda justificado cada Ø de la
  red, no solo el del camino crítico. Los tramos iguales (`iguales`) se agrupan en una fila con
  «× n».
- **Caudales por aparato** (tabla 2.1): aparato, nº por vivienda tipo, Qagua fría y QACS. Es lo
  que el revisor coteja primero.
- **Contador** (paso 0.1):
  - con contador general: el armario o la cámara de la tabla 4.1, según el Ø;
  - con batería de divisionarios: nº de contadores y una línea que remite a la compañía
    suministradora para su dimensión.
- **ACS:** la línea del sistema (individual o central) y, si es central, el retorno con su
  motivo y su cita (paso 0.3).
- **Nota de longitudes** en modo «edificio» y aviso en «Antes de entregar».

### Paso 3 · Saneamiento (5.3.2)

- **Tabla 5.3.2-1, aparatos por vivienda tipo** (tabla 4.1 del DB): aparato, nº, UD por aparato,
  Ø de sifón y derivación, y el total de UD de la vivienda. Se agrupan los cuartos de la vertical
  por tipo de aparato.
- **Tabla 5.3.2-2, ramales, bajantes y colectores:** elemento, tipo, UD que recibe, pendiente, Ø
  y capacidad (UD admisibles). En bajantes, las dos comprobaciones de la tabla 4.4 (UD totales y
  ramal más cargado).
- **Arquetas** (paso 0.2): `arquetasHs5(result, red)`, puro.
  - **En modo «edificio»**: una a pie de cada bajante y una general antes de la acometida.
  - **En modo «manual»**: una por cada nudo de colector (encuentro o cambio de dirección) más la
    general.
  - Por arqueta: tipo, Ø del colector de salida y dimensión de la tabla 4.13. `arquetaDe` pasa a
    leer de aquí.
- **Pluviales:** superficie, sumideros, canalón, bajantes y colector, con Ø y capacidad (ya
  calculados).
- **Ventilación** (primaria, secundaria): la línea que ya da el motor.

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
6. **Arquetas en modo «edificio»**: a pie de bajante más la general. Sin distancias, no se
   proponen arquetas de paso.
7. **Planos como texto libre** por instalación, no como lista de planos con número y título.
