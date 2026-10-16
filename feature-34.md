# feature-34 — Memoria como la del estudio · Fase 6b: el REBT aguas abajo en el anejo

> Segunda mitad de la fase 6 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.6). Escrito el 2026-10-16,
> tras cerrar la 6a ([feature-33.md](feature-33.md)), que dejó hecho el documento «Anejo 5.3 ·
> Instalaciones del edificio» con fontanería (5.3.1) y saneamiento (5.3.2), y el hueco del 5.3.3
> («Pendiente: el cálculo extenso de la instalación eléctrica aún no se desarrolla en este anejo»).
>
> **Cerrada el 2026-10-16**, salvo abrir el Word en Word. Lo que cambió respecto a este plan va en el
> «Hecho» de cada paso; lo que hay que validar, al final.

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

**Hecho (2026-10-16): bloque N y K-REBT.19–36** (la serie acababa en el 18). Consolidado del BOE leído
en imagen; guías BT-13, 14, 15, 18, 19, 21, 22, 24, 25 y 26 y Anexo 2, bajadas a `research/pdf/`.
Lo que cambia el diseño:
- **No hay una sola tabla de intensidades admisibles.** La tabla 1 de la ITC-BT-19 es la de 1994. La
  Guía BT-19 recomienda la de 2004, que da hasta un 10 % menos con XLPE, y la ITC-BT-02 ya remite a la
  UNE-HD 60364-5-52:2022, que no tenemos (P8). Se toma la menor de las dos (K-REBT.19).
- **La DI de una vivienda se calcula con el IGA**, no con la previsión con simultaneidad (ITC-BT-25
  ap. 1). Casi siempre manda la caída.
- **Los calibres de los fusibles los fija la distribuidora** (P10). Se da el intervalo que protege la
  LGA: de Ib a 0,906·Iz (Guía BT-22, gG con I2 = 1,6·In).
- **El anillo: 25 mm² en el reglamento**, 35 mm² en las guías. Se proyecta de 35 y se cita el 25.
- **El pararrayos sí cambia la resistencia orientativa**: 15 Ω con él y 37 Ω sin él (Guía BT-26). Se
  lee de SUA 8.
- **La fila C13 está en la tabla 1 de la ITC-BT-25** del consolidado (la Guía BT-25, de 2012, no la
  tiene). Su «3» (máximo de puntos), cotejado en imagen a 220 ppp (P9 hecho).
- Ni el REBT ni su guía dicen nada de la bomba de calor: aire-aire en C9 y aire-agua en C8, por criterio
  (K-REBT.35).

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

**Hecho (2026-10-16).**
- [tablasInstalacion.ts](src/modules/rebt/tablasInstalacion.ts), aparte de `tablas.ts` (que es la
  previsión): tablas 1 y 2 de la ITC-BT-25, caídas, LGA y DI, intensidades admisibles (ITC-BT-19, su
  Guía y la ITC-BT-07), tubos, protección, fórmulas y tierra, cada una con su procedencia. Los
  criterios, en `CRITERIOS_INSTALACION`.
- [estado.ts](src/modules/rebt/estado.ts): `climatizacion` (habitual, aire-aire), `secadora`,
  `automatizacion`, `longitudLga_m`, `longitudDi_m`, `diEnterrada`, `perimetroTierra_m` y
  `resistividad_ohm_m`, todos opcionales. `equiposDe` los resuelve: solo cuentan con la electrificación
  elevada. La resistividad es un número (con los valores de la tabla 4 en la ayuda), no un tipo de
  terreno.
- **Desviación:** los equipos no van en las decisiones sino en «Para el anejo», porque no cambian la
  previsión. Ninguna cifra de la previsión cambia.

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

**Hecho (2026-10-16).** [interior.ts](src/modules/rebt/interior.ts): `interiorVivienda` y
`longitudMaxima`.
- Estancias de Habitabilidad o, sin ellas, `estanciasPropuestas`. Se añaden acceso (timbre, que no
  cuenta como punto), vestíbulo y, con recarga, el garaje. El estar-cocina suma salón y cocina; el aseo
  va como baño; «otra», como terraza o vestidor; el pasillo, sin longitud, con un punto y una toma.
- Los adicionales reparten los puntos por igual (25 en dos C1 → 13 y 12). El C4 no se desdobla en C12
  (nota 8). Con más de 160 m², un C7.
- Lmáx = e·U·γ·S / (2·IA), redondeada a la baja: C1 24,8 m; C2, C5 y C10 25,8; C4 33,1; C3, C8 y C9
  39,7; C13 (5 %, 16 A) 43,1.
- Diferenciales: ⌈circuitos sin el C13 / 5⌉, y el del C13 aparte.
- Aviso `puntos-elevada-<tipo>` si una vivienda básica pide circuitos adicionales.

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

**Hecho (2026-10-16).** [lineas.ts](src/modules/rebt/lineas.ts) (`intensidadAdmisible`,
`caidaTension`, `dimensionar`, `lineaGeneral`, `derivacionIndividual`) e
[instalacion.ts](src/modules/rebt/instalacion.ts), que lo arma todo desde la previsión.
- LGA: RZ1-K (AS), XLPE, γ = 44, Iz de tres conductores cargados, 0,5 %.
- DI de vivienda: ES07Z1-K (AS), como PVC, γ = 48, con la capacidad del IGA, 1 % (1,5 % en la
  unifamiliar). Enterrada (opción de la unifamiliar), RZ1-K con las intensidades de la ITC-BT-07 y la
  Guía.
- DI de servicios generales (con el garaje) y de cada local: trifásicas con cos φ 0,9 y el calibre
  normalizado igual o mayor; el local de hasta 14 490 W, monofásico con su escalón de IGA.
- La longitud de la DI que da el proyectista se aplica a todas las viviendas (la más larga, del lado de
  la seguridad).
- En la reforma, solo la DI de la vivienda nueva, en su planta (no en la del tipo en el resto del
  edificio). La LGA, existente, con su carga después de la obra.
- Interruptor general de maniobra de 160 o 250 A con más de dos usuarios (ITC-BT-16 ap. 3).
- Aviso `longitudes-estimadas`.

### Paso 4 · Puesta a tierra

- Conductor en anillo bajo la cimentación, con la longitud del perímetro del edificio (de El
  edificio; si no lo hay, estimada y dicho), picas si hacen falta, y su resistencia con la
  resistividad del terreno.
- Comprobación de la resistencia frente a la que exige el diferencial (paso 0, pto 8); línea
  principal y conductores de protección.

**Hecho (2026-10-16).** [tierra.ts](src/modules/rebt/tierra.ts).
- Longitud del anillo: la del proyecto, la planta de SUA 8 (largo y ancho) o un cuadrado con la
  superficie de la cubierta. El pararrayos, de la decisión de SUA 8.
- R = 2ρ/L y R = ρ/L; picas en paralelo, como si no se influyeran (se dice que es optimista).
- **Desviación de K-REBT.31:** tensión de contacto de **50 V**, la del reglamento fuera de local
  conductor (el agente proponía 24 V). Diferencial de referencia de 30 mA en la unifamiliar y de
  300 mA en el edificio.
- **Desviación de K-REBT.30:** con el terreno supuesto (3 000 Ω·m), las picas solo para el límite del
  reglamento. Con el terreno declarado, también para los 37 o 15 Ω de la Guía. Con 3 000 Ω·m y la Guía,
  saldrían decenas de picas sobre un dato inventado.
- Más de 20 picas: aviso `tierra-picas`. Sin terreno: aviso `terreno-supuesto`.
- En obra existente, se conecta a la tierra que hay.

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

**Hecho (2026-10-16).** [anejo.ts](src/modules/rebt/anejo.ts), enganchado con `DefinicionSi.anejo?` y
`moduloSi` ([modulos.ts](src/lib/obra/modulos.ts)): cualquier módulo de la pantalla común puede dar su
anejo.
- Partes: previsión (con la tabla de viviendas tipo), instalación interior por vivienda tipo (puntos y
  circuitos), líneas (11 columnas, con «Manda»: mínima, Iz o e), contadores y CGP, y puesta a tierra.
- En oficinas, una línea: el interior de cada local es de su proyecto.
- La caída se llama «e», no «ΔU» (la fuente del PDF no tiene Δ). `pdfStr` pasa Ω y ρ a «ohm» y «rho».

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

**Hecho (2026-10-16).**
- **Memoria**: la remisión al 5.3.3 sale sola, porque `remisionAnejo` ya admitía `rebt`. Comparado el
  texto de la memoria antes y después en cinco casos: solo se añade esa frase.
- **Pantalla**: «Para el anejo» en el REBT, con planos, climatización, secadora, automatización,
  longitudes (con la estimada a la vista), DI enterrada en la unifamiliar, anillo y resistividad.
  `CampoOpciones` nuevo en [ParaElAnejo.tsx](src/components/justificacion/ParaElAnejo.tsx). Revisada en el
  navegador.
- **Demo**: planos «I08–I11». Gana dos avisos del REBT (longitudes y terreno): 34 en «Antes de
  entregar».
- **Avisos** sin elemento, como el de las longitudes de HS 4, para que la carga total no salga «por
  revisar» por algo que no la cambia.
- **Foto del expediente**: cambian las 40 huellas del anejo y las 40 de la memoria. Además, el REBT de
  las 8 unifamiliares pasa de «cumple» a «revisar» por las longitudes y el terreno supuestos.
- **Tests**: [anejo.test.ts](src/modules/rebt/test/anejo.test.ts) (23) y la pantalla en
  [ui.test.tsx](src/modules/rebt/test/ui.test.tsx). En
  [anejo-casos.test.ts](src/lib/obra/test/anejo-casos.test.ts), la coherencia memoria–anejo (carga total
  e IGA) en el Demo y los cinco casos, y la reforma (DI en PB, LGA y tierra existentes). 1714 en verde;
  tsc, eslint y build limpios.
- PDF del Demo y de la unifamiliar revisados en imagen: la tabla de líneas cabe sin partir.
- **Pendiente: abrir el Word en Word**, que no se puede hacer desde aquí.

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
2. **Longitudes de LGA y DI estimadas** desde El edificio (10 m de LGA; 3 m + subida + 10 m por DI;
   15 m en la unifamiliar), rotuladas y en «Antes de entregar». La DI que se da vale para todas las
   viviendas.
3. **Equipos en «Para el anejo»** (climatización, secadora, automatización), y la bomba de calor
   aire-aire en C9 como habitual de la elevada.
4. **Estancias de Habitabilidad**, sin pedirlas de nuevo; sin superficie, el mínimo de
   «hasta 10 m²»; acceso y vestíbulo siempre.
5. **Una DI por vivienda tipo**, la de su planta más alejada de la centralización.
6. **Interior de locales, oficinas y zonas comunes fuera**: solo su DI.
7. **Iz, la menor de la ITC-BT-19 y de la Guía BT-19** (K-REBT.19), a la espera de la UNE-HD
   60364-5-52:2022.
8. **Fusibles de la CGP como intervalo** (de Ib a 0,906·Iz), no como calibre: lo fija la distribuidora.
9. **Tierra**: 50 V de tensión de contacto, 300 mA de diferencial de referencia en el edificio,
   3 000 Ω·m sin dato, y picas para la Guía BT-26 solo con el terreno declarado.
10. **El REBT de la unifamiliar pasa a «revisar»** mientras las longitudes y el terreno sean supuestos.
