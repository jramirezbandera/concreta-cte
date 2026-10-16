# feature-34 — Memoria como la del estudio · Fase 6b: el REBT aguas abajo en el anejo

> Segunda mitad de la fase 6 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.6). Escrito el 2026-10-16,
> tras cerrar la 6a ([feature-33.md](feature-33.md)), que dejó hecho el documento «Anejo 5.3 ·
> Instalaciones del edificio» con fontanería (5.3.1) y saneamiento (5.3.2), y el hueco del 5.3.3
> («Pendiente: el cálculo extenso de la instalación eléctrica aún no se desarrolla en este anejo»).

## Lo que hay hoy

**El módulo REBT** ([justificacion.ts](src/modules/rebt/justificacion.ts), feature-23 y 24) llega
hasta la acometida del edificio:
- el grado de electrificación de cada vivienda tipo, con su potencia y su IGA (ITC-BT-10 ap. 2);
- la previsión de cargas: viviendas con la tabla 1, servicios generales, locales y oficinas,
  garaje y recarga, y la intensidad de la LGA (400 V, cos φ 0,9) o de la derivación de la
  unifamiliar;
- dónde van los contadores (ITC-BT-16) y si pide proyecto o memoria técnica de diseño
  (ITC-BT-04);
- en obra existente, la carga antes y después, y las viviendas y locales nuevos.

**Lo que no hay.** Todo lo que va del contador hacia dentro y de la CGP al contador:
- **circuitos** de la vivienda (C1–C13 de la ITC-BT-25): ni cuáles, ni su interruptor, sección,
  tubo y puntos;
- **puntos de utilización** por estancia (ITC-BT-25 tabla 2);
- **derivación individual y LGA** (ITC-BT-14 y 15): ni longitud, ni sección, ni caída de
  tensión, ni tubo, ni fusible;
- **puesta a tierra** (ITC-BT-18 y 26).

La decisión «elevada» (`electrificacion: "elevada"`) junta la climatización eléctrica, la
secadora y la automatización en una sola opción. Para los circuitos hace falta saber cuál
(C8, C9, C10 o C11): es el pendiente «Lista de la Guía como casillas» de feature-23.

**Las estancias** las guarda Habitabilidad (`HabEstado.estancias`, feature-32) por vivienda tipo,
con superficie útil si se conoce. Sin ellas, `estanciasPropuestas` las deduce de dormitorios,
baños y aseos, sin superficies.

**Las alturas de planta** están en El edificio (`altura_m` por grupo): con ellas se estima el
recorrido vertical de las derivaciones, como HS 4 estima sus montantes.

**El ejemplo del estudio** (unifamiliar, 5.3 «Instalación eléctrica de baja tensión») trae: la
previsión de cargas, la tabla de puntos de utilización por estancia con sus circuitos, la tabla de
caídas de tensión máximas y la puesta a tierra (resistencias supuestas de 15 Ω y 10 Ω, esquema
TT, corriente de defecto). No trae circuitos con sección y longitud: eso va en el unifilar (plano
I11).

## Objetivo

El **5.3.3 · Electricidad (REBT)** del anejo, con lo que el plan pide en §5.6:
- circuitos C1–C13 por vivienda tipo (interruptor, sección, tubo, puntos);
- puntos de utilización por estancia;
- derivación individual y LGA (sección por intensidad admisible y por caída de tensión,
  fusible, tubo);
- puesta a tierra.

La memoria (4.1.1) remite a él y a los planos, como HS 4 y HS 5. Criterio de hecho del plan: **el
anejo sustituye al de CYPE en la unifamiliar del ejemplo sin contradecir la memoria.**

## Principios

- **Los de la 6a.** El anejo no calcula nada que la memoria no sepa: lee la misma
  `JustificacionRebt`, a la que se le añade lo nuevo (circuitos, líneas, tierra) sin cambiar
  ninguna cifra de la previsión. Las abreviaturas, una vez. Sin filas de relleno. Misma tubería.
- **Lo estimado se dice.** Las longitudes de la DI y la LGA salen de El edificio con un criterio
  de la app y se rotulan así; «Antes de entregar» pide confirmarlas (como `longitudes-estimadas`
  de HS 4). Igual la resistividad del terreno.
- **Del lado del reglamento, no del de la obra.** La sección de cada circuito es la mínima de la
  tabla 1 de la ITC-BT-25; la app no sabe cuánto mide cada circuito. En lugar de inventarle una
  longitud, da la **longitud máxima** con la que esa sección cumple la caída de tensión: es lo que
  el proyectista comprueba en el plano.
- **Ninguna cifra sin verificar** (paso 0). Las tablas de intensidades admisibles son de normas
  UNE que el REBT cita: se usa la que reproduce el propio reglamento o su guía, con su cita, y lo
  que no esté en el BOE se rotula como de la guía.

## Pasos

### Paso 0 · Normativa (agente `cte-normativa`)

Contra el consolidado del BOE (`research/pdf/REBT.pdf`) y las guías del Ministerio (las que
falten, bajadas a `research/pdf/`), en imagen donde haya tablas:
1. **ITC-BT-25 tabla 1**, completa: por circuito C1–C12, potencia prevista por toma, Fs, Fu, tipo
   de toma, interruptor automático, máximo de puntos, sección mínima y Ø de tubo; con sus notas.
   C13 (ITC-BT-52 tabla 1). Cuántos diferenciales (uno por cada cinco circuitos) y de qué
   sensibilidad. Qué circuitos se desdoblan y cuándo eso no lleva a la elevada.
2. **ITC-BT-25 tabla 2**, puntos de utilización por estancia, con las reglas por superficie o
   longitud («hasta 10 m², 2 si S > 10 m²», «uno cada 5 m de longitud») y sus notas.
3. **Caídas de tensión máximas**: LGA (ITC-BT-14), DI (ITC-BT-15) e instalación interior
   (ITC-BT-19 y 25), con el reparto entre DI e interior que se admite.
4. **LGA y DI**: secciones mínimas, tipo de cable (no propagador del incendio, baja opacidad),
   Ø de tubo (tablas de las ITC-BT-14 y 15, con su ampliación del 100 %), hilo de mando.
5. **Intensidades admisibles** (ITC-BT-19 tabla 1, o la que corresponda al método de instalación
   de la LGA y la DI en tubo empotrado o en canaladura), con la temperatura de referencia; y los
   de los cables enterrados si la DI de la unifamiliar va enterrada (ITC-BT-07).
6. **Protección de la LGA**: fusibles de la CGP (ITC-BT-13) y su coordinación con el cable
   (ITC-BT-22): Ib ≤ In ≤ Iz e I2 ≤ 1,45·Iz, y cómo se traduce para fusibles gG.
7. **Conductividad y fórmula de la caída** (Guía, Anexo 2): γ del cobre a la temperatura de
   servicio, cos φ en vivienda, monofásica y trifásica.
8. **Puesta a tierra** (ITC-BT-18 y 26): conductor en anillo bajo la cimentación (sección,
   material), picas, resistividad por tipo de terreno (tabla de valores medios), fórmulas de la
   resistencia del anillo y de la pica; qué resistencia máxima se exige con diferencial de 30 mA
   (tensión de contacto de 24 V o 50 V) y lo que diga la Guía BT-26 de la longitud mínima del
   anillo con o sin pararrayos. Línea principal y conductores de protección (tabla 2 de la
   ITC-BT-18).
9. **Electrificación elevada por equipos**: a qué circuito va una bomba de calor reversible
   (C8, C9 o ambos), la de solo ACS (C4, K-REBT.2) y el suelo radiante eléctrico.

Se apunta como K-REBT.20 y siguientes en
[research/verificacion-rebt.md](research/verificacion-rebt.md).

### Paso 1 · Tablas y decisiones

- [tablas.ts](src/modules/rebt/tablas.ts): `CIRCUITOS_ITC_BT_25` (tabla 1), `PUNTOS_ITC_BT_25`
  (tabla 2), `CAIDAS_TENSION`, `LGA_ITC_BT_14`, `DI_ITC_BT_15`, `INTENSIDADES_ADMISIBLES`,
  `TUBOS`, `FUSIBLES`, `TIERRA_ITC_BT_18`, cada una con su procedencia (`tablaCTE`).
- **Equipos de la vivienda** (estado nuevo, opcional, por defecto el habitual): calefacción
  eléctrica (C8), aire acondicionado (C9), secadora (C10), automatización (C11). La opción
  `elevada` de hoy pasa a ser «alguno de estos»; lo habitual sigue siendo elevada por la
  climatización (paso 0, pto 9, decide qué circuitos lleva). Ninguna cifra de la previsión cambia
  (snapshots).
- **Longitudes** (estado nuevo, opcional): de la LGA y de la DI más desfavorable. Sin dato, las
  estima la app (criterio del paso 3).
- **Terreno** (estado nuevo, opcional): tipo de terreno de la tabla de resistividades, o la
  resistividad medida; sin dato, el del lado de la seguridad que diga el paso 0, con aviso.

### Paso 2 · Circuitos y puntos de utilización

- `circuitosVivienda(vivienda, estancias, equipos)`, puro:
  - **puntos por estancia** con la tabla 2. Si la estancia no tiene superficie, se toma el mínimo
    de «hasta 10 m²» y se dice («Antes de entregar» pide las superficies en Habitabilidad);
  - **circuitos**: C1–C5 siempre; C8–C11 por los equipos; C13 en la unifamiliar con recarga.
    Si los puntos de C1, C2 o C5 pasan del máximo, el circuito se desdobla (C6, C7, C12) y la
    vivienda es elevada; si eso pasa en una vivienda que la app tenía por básica, aviso;
  - por circuito: puntos, interruptor automático, sección, tubo, y la **longitud máxima** con la
    que la sección cumple la caída de tensión de la instalación interior;
  - **diferenciales**: cuántos y de qué sensibilidad.
- En `JustificacionRebt`: `circuitos` por vivienda tipo. En oficinas y locales, la instalación
  interior es del proyecto de cada local: una línea que lo dice.

### Paso 3 · Derivación individual y LGA

- **Longitudes estimadas** (criterio, rotulado):
  - **unifamiliar**: DI de la CPM (en el límite de la parcela) al cuadro de la vivienda, con un
    valor tipo;
  - **edificio**: LGA de la CGP a la centralización (valor tipo); DI de la centralización a la
    vivienda más alejada, con el recorrido vertical por las alturas de planta de El edificio más
    un tramo horizontal tipo. Una DI por vivienda tipo en su planta más alejada, otra para los
    servicios generales y una por local.
- **Sección** de cada línea: la mayor de la mínima reglamentaria, la de la intensidad admisible
  con el método de instalación y la de la caída de tensión. **Fusible** de la CGP o de la DI,
  coordinado con el cable. **Tubo** por la tabla de su ITC.
- En obra existente: la LGA existente no se toca; si la carga después de la obra pasa de lo que
  admite (dato que la app no tiene), «Antes de entregar» pide comprobarla. Las DI nuevas sí se
  calculan.

### Paso 4 · Puesta a tierra

- Conductor en anillo bajo la cimentación, con la longitud del perímetro del edificio (de El
  edificio; si no lo hay, estimada y dicho), picas si hacen falta, y su resistencia con la
  resistividad del terreno.
- Comprobación de la resistencia frente a la que exige el diferencial (paso 0, pto 8); línea
  principal y conductores de protección.

### Paso 5 · El anejo 5.3.3

`anejoRebt(j)` en [anejo.ts](src/modules/rebt/anejo.ts) y `anejo()` en el módulo, con estas partes:
1. **Previsión de cargas**: la tabla resumen (la misma cifra que la memoria) y la remisión a
   4.1.1 para el detalle.
2. **Puntos de utilización por estancia** (tabla 2), una columna por vivienda tipo.
3. **Circuitos** por vivienda tipo: circuito, uso, puntos, interruptor, sección, tubo, longitud
   máxima por caída de tensión; y los diferenciales.
4. **Líneas**: LGA y DI en una tabla (línea, P, I, L, sección, Iz, ΔU %, ΔU máx, tubo,
   protección), con la caída acumulada al contador y a la vivienda.
5. **Contadores y caja general de protección**: lo de la memoria más el fusible y el interruptor
   general de maniobra.
6. **Puesta a tierra**.

La tabla de líneas es la ancha (`TablaMemoria.ancha`).

### Paso 6 · Remisiones, pantalla, casos y cierre

- **Memoria**: al final del 4.1.1, la frase de remisión de [remision.ts](src/lib/obra/remision.ts)
  (ya admite `rebt`).
- **Pantalla**: «Para el anejo» en el REBT: planos, equipos de la vivienda, longitudes de LGA y
  DI (con la estimada a la vista) y terreno.
- **Antes de entregar**: longitudes estimadas, terreno supuesto, estancias sin superficie y planos
  de electricidad.
- **Casos**: el Demo, la unifamiliar, el edificio de oficinas y «Reforma: local a vivienda»; la
  coherencia memoria–anejo (previsión, IGA, contadores) en un test, como en la 6a.
- **Foto del expediente**: cambian las huellas del anejo y, en la memoria, solo la frase de
  remisión del REBT.
- Abrir el Word en Word.

## Fuera de alcance

- **Circuitos de locales, oficinas y zonas comunes** (alumbrado de escalera, ascensor, garaje):
  son del proyecto de cada uso o del de la instalación del edificio. Se calcula su DI, no su
  interior.
- **La red de recarga del garaje colectivo** (esquemas de la ITC-BT-52): su carga ya está en la
  previsión; su red, en el proyecto de la infraestructura de recarga.
- **Cálculo de cortocircuito** (poder de corte, Icc en el cuadro): depende de la red de la
  distribuidora.
- **Unifilar**: es plano; el anejo remite a él.
- **Pararrayos** (SUA 8): la tierra solo lo tiene en cuenta si el paso 0 dice que cambia la
  longitud del anillo.

## Decisiones a validar (propuestas)

1. **Longitud máxima por circuito** en lugar de una longitud inventada: la sección es la mínima
   de la tabla 1 y el anejo dice hasta qué longitud cumple la caída de tensión.
2. **Longitudes de LGA y DI estimadas** desde El edificio, rotuladas y en «Antes de entregar»,
   con el valor del proyecto como dato opcional.
3. **Equipos como casillas** (C8–C11) en lugar de la sola opción «elevada».
4. **Estancias de Habitabilidad**, sin pedirlas de nuevo; sin superficie, el mínimo de
   «hasta 10 m²».
5. **Una DI por vivienda tipo**, la de su planta más alejada de la centralización, no una por
   vivienda.
6. **Interior de locales, oficinas y zonas comunes fuera**: solo su DI.
