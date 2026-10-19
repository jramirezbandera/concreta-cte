# feature-36 — Memoria como la del estudio · Fase 7: otros reglamentos y coherencia

> Fase 7 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.7), la última del plan. Escrito el 2026-10-19.
> Base normativa: [research/verificacion-memoria.md](research/verificacion-memoria.md), K-MEM.4–8
> y K-MEM.14–16, más lo que coteje el paso 0 (K-MEM.19 y siguientes), que manda en todo lo
> normativo.

## Lo que hay hoy

**Ninguno de los cuatro reglamentos existe en la app.** No hay `JustificacionKey` de RITE, HE 3,
ICT ni accesibilidad autonómica. El capítulo 4 de la memoria, «Cumplimiento de otros
reglamentos» ([memoria.ts](src/lib/obra/memoria.ts)), tiene 4.1 REBT y 4.2 Habitabilidad; el 3.6
(HE) no trae HE 2 ni HE 3. Lo único que hay del RITE son menciones en notas (HS 3 «no aplica», usos
del edificio, el caudal de aire exterior).

**Datos que ya existen y se reutilizan:**
- **ACS y clima.** HE 4 guarda el sistema (`bomba_calor | solar | biomasa | red`), si es
  `individual | centralizada` y el apoyo; **no guarda la potencia del generador**. HS 4 guarda
  `aguaCaliente` (`individual | central`), `grupoPresion` y los contadores; **no lee HE 4**. El REBT
  guarda la climatización «para el anejo» (`ninguna | aire_aire | aire_agua | emisores`), que según
  la decisión 3 de feature-34 debe salir del RITE. En obra existente, `Alcance.generacionTermica`.
- **Garaje y plazas** en El edificio (`Zona.plazas`), SI 3, SUA 7, HE 6 (`plazasInteriores`,
  exteriores, accesibles) y REBT (`plazasRecarga`).
- **Viviendas y contadores**: `ResumenEdificio.numViviendas`; HS 4 cuenta contadores
  (`red.ts`), el REBT las derivaciones individuales.
- **Estancias por vivienda**: las del módulo de habitabilidad (`EstanciaHab`), que ya lee el REBT.
- **Ascensor** (`Edificio.ascensor`), plantas, zonas comunes (`zona_comun`, `vestibulo`,
  `trasteros`, sin distinguir portal, escalera y pasillo), piscina (`tienePiscina`).
- **SUA 9** ya decide ascensor o previsión de ascensor y avisa de las viviendas accesibles.

**Lo que no existe:** régimen de propiedad horizontal, promoción protegida o pública,
autopromoción para uso propio, comunidad autónoma (Andalucía se deduce del INE del municipio) y la
potencia del generador térmico.

**«Antes de entregar»** ([entrega.ts](src/lib/obra/entrega.ts)) junta incumplimientos, avisos de
cada módulo, planos y seguridad y salud. **No hay ninguna comprobación cruzada entre módulos**;
solo avisos dentro de un módulo (REBT `acs-central` lee HE 4; HE 6 lee el REBT; HE 5 lee HE 4).

**El patrón a copiar** es el de habitabilidad (feature-32, 9f7e67f): clave, registry, ruta,
aplicabilidad (obra nueva y existente), sección de la memoria, demo, foto del expediente; y para la
norma autonómica, `NormaHabitabilidad` con `PLANTILLAS` cotejadas y «Mis normas».

**Lo que traen los ejemplos** (las tres memorias de `ejemplos/`):

| | Plurifamiliar (6 viv.) | Unifamiliar | Local a vivienda |
|---|---|---|---|
| RITE | 3.6.1, ficha de casillas de otra obra | 3.6, potencias que no suman | ficha de 1998, vacía |
| HE 3 | «no aplica» (mal: hay portal, escalera y trasteros) | «no aplica» (bien) | ámbito de 2006 |
| ICT | 4.1, ficha «Norma \| Proyecto» y proyecto técnico anexo; recintos sin elegir | «no aplica», con el RD 401/2003 derogado | una frase |
| Decreto 293/2009 | 4.2, Datos generales y Ficha III de la Orden de 2012 | «no es vivienda adaptada» | «no es vivienda adaptada» |
| Piscina | — (SUA 6 dice «privada» igual) | la tiene; solo SUA 6 y la depuradora en HS 4 | — |

Y las contradicciones que la fase debe impedir:
- **ACS**: aerotermia con 200 l en la ficha RITE, termo eléctrico de 75 l en el anejo HS 4 (el
  plurifamiliar); bomba de calor de 2,6 kW en HE 4 y «ACS 0 kW» en el RITE (la unifamiliar).
- **Grupo de presión**: «abastecimiento directo» en HS 4, depósito y grupo en el anejo, «grupo de
  presión 4,10 kW» en el REBT.
- **Garaje**: «no se proyectan aparcamientos» en HE 6 y SUA 7 rellenando el aparcamiento; 4 plazas
  con HE 6 al 50 % y el REBT sin recarga.
- **Contadores**: «un solo titular, contador general» en HS 4, baterías de divisionarios en el anejo
  y 6 derivaciones en el REBT.
- **Electrificación**: básica (5.750 W) en la memoria constructiva, elevada (9.200 W) en el anejo.

## Objetivo

- Cuatro apartados nuevos, con el lenguaje y las tablas de los módulos:
  - **3.6.x HE 2 / RITE**: el documento que exige el RITE por la potencia, y una ficha corta del
    sistema (generador, potencias, ACS y acumulación, condiciones interiores, redes y control,
    seguridad) que **remite a la memoria técnica o al proyecto RITE**; no calcula cargas.
  - **3.6.x HE 3**: una línea en vivienda; en las zonas comunes del plurifamiliar, la tabla de VEEI,
    potencia y control.
  - **4.x ICT**: obligatoria o no con su motivo; si lo es, la ficha de previsiones del arquitecto
    (PAU, recinto, RTR, tomas por estancia) y la remisión al proyecto técnico.
  - **4.x Accesibilidad autonómica**: con la norma que declara el proyectista; para Andalucía, la
    plantilla del Decreto 293/2009 (zonas comunes, ascensor o reserva, reserva de viviendas).
- **Coherencia en «Antes de entregar»**: un aviso cuando dos apartados no dicen lo mismo del ACS,
  del grupo de presión, del garaje, de los contadores o de la electrificación.

Criterio de hecho del plan: **las contradicciones de los ejemplos (ACS, grupo de presión, garaje)
no se pueden dar sin un aviso.**

## Principios

- **Los de la memoria (§2 del plan).** «No aplica» en una línea con motivo y cita; nada de casillas
  ni de texto del reglamento pegado. Lo supuesto va a «Antes de entregar», no al texto.
- **Un dato, una fuente.** El generador térmico se declara una vez (en el RITE) y lo leen HE 4, el
  REBT y HS 4. Donde dos módulos guardan cada uno su dato (contadores, grupo de presión, plazas),
  no se fusionan: se comparan y se avisa.
- **Ninguna cifra sin cotejar.** Lo «LEÍDO (web)» de K-MEM se coteja en el paso 0; lo que quede
  sin confirmar no se imprime (dimensiones de recintos, tablas del RITE).
- **Remitir, no suplantar.** El proyecto o la memoria técnica del RITE y el proyecto técnico de ICT
  son documentos de otros técnicos: la memoria de arquitectura resume, reserva y remite.
- **Lo autonómico, declarado.** Como habitabilidad: la app ofrece la plantilla verificada de
  Andalucía y el proyectista la elige; en otra comunidad, declara la norma.

## Pasos

### Paso 0 · Normativa pendiente (agente `cte-normativa`)

Cotejar en el BOE y el BOJA lo que K-MEM dejó como «LEÍDO (web)» o «SIN CONFIRMAR»: RITE (art. 15
con el RD 178/2021, IT 1.1.4.1.2 tabla 1.4.1.1, IT 1.1.4.4, IT 1.2.3, IT 1.2.4.1, 1.2.4.4 y
1.2.4.5, IT 1.3.3), ICT (RD-ley 1/1998 arts. 2 y 3; RD 346/2011 arts. 3, 8 y 9, anexo III con los
recintos y el RTR, anexos I y II con las tomas; lo que cambió el RD 250/2025), Decreto 293/2009
consolidado (arts. 2, 104, 106, 111 y DA 1.ª; Orden de 9-01-2012) e ITC-BT-31 con el ámbito de
SUA 6 (para decidir la piscina). Resultado en K-MEM.19 y siguientes.

**Hecho (2026-10-19), K-MEM.19–24.** Leído en los consolidados del BOE y en el BOJA, con cada literal
cotejado en la imagen de la página. Cambia el diseño así:
- **RITE** (K-MEM.19, consolidado de 02-08-2022, sin cambios de 2023 a 2026): confirmados el art. 15
  (< 5 / 5–70 / > 70 kW), los arts. 16.2 y 17.2, la tabla 1.4.1.1 (23…25 °C y 45…60 % en verano;
  21…23 °C y 40…50 % en invierno), IT 1.1.4.2.1, IT 1.2.3 y IT 1.3.3. **Corregido:** la higiene es la
  **IT 1.1.4.3**, no la 1.1.4.4 (acústica), y el RITE no da temperaturas de ACS: remite a la norma de
  legionela. No hay rendimiento mínimo de bomba de calor (remite a diseño ecológico); la
  contabilización (IT 1.2.4.4) y la recuperación de calor (IT 1.2.4.5.2, más de 0,28 m³/s) no alcanzan
  a una vivienda (INTERPRETACIÓN). Sin confirmar: IT 1.2.4.1, la tabla de aislamiento de ACS y el
  RD 487/2022 (legionela): no se imprimen.
- **DB-HE** (K-MEM.20): sin versión posterior a la de 2022 (el RD 164/2025 solo toca el DB-SI).
- **ICT** (K-MEM.21, consolidado de 26-03-2025): confirmados el ámbito y la obligación de proyecto.
  **Corregido:** la coordinación con el proyecto de edificación es el **art. 9**, no el 8. **Nuevo,
  verificado en imagen:** arqueta de entrada y canalización externa por nº de PAU, tablas de RITI/RITS,
  RITU y RITU-A, tubos del patinillo, RTR de 500 × 600 × 80 mm y registros de toma por vivienda
  (anexo III, 5.13). El RD 250/2025 solo toca la TDT. Sin confirmar: cuándo el RITU es obligatorio u
  opcional y los registros secundarios. El propio Reglamento se contradice en la arqueta de más de
  100 PAU (800 × 700 frente a 800 × 720): esa fila no se imprime.
- **Decreto 293/2009** (K-MEM.22): no hay consolidado oficial; los artículos que usa la app no han
  cambiado. **Corregido:** el art. 2.1 j) tiene una segunda frase (en la reforma de zonas comunes,
  solo lo modificado). **La reserva de viviendas del art. 111.1 la supera la Ley 4/2017, art. 58.1:**
  de 17 a 25 viviendas, 1; con más de 25, el 4 % redondeado. Orden de 9-01-2012: BOJA núm. 12, con la
  Ficha III (zonas comunes) y la Ficha IV (viviendas reservadas). No existe un «Decreto 64/2012».
- **Piscina** (K-MEM.23): SUA 6 excluye la piscina de la vivienda unifamiliar, pero **la ITC-BT-31 se
  aplica a toda piscina**, privada o no: zonas 0, 1 y 2 con su IP; en 0 y 1, solo MBTS de 12 V con la
  fuente fuera; en la 2, MBTS, diferencial de 30 mA o separación; equipotencial local. Trámite:
  proyecto si la instalación de la piscina pasa de 5 kW (ITC-BT-04) y OCA (inicial y cada 5 años) si
  pasa de 10 kW (ITC-BT-05).

### Paso 1 · Datos de la promoción y del generador

En «La obra», un bloque nuevo **«Régimen de la promoción»** (`DatosGenerales.promocion?`, opcional
para que los expedientes guardados se sigan leyendo):
- **régimen de propiedad horizontal** (o arrendamiento de más de un año con más de una vivienda):
  sí / no. Lo pide la ICT; no se deduce del número de viviendas (K-MEM.7);
- **promoción protegida o de las Administraciones públicas**: sí / no (reserva de viviendas del
  Decreto 293/2009 art. 111 y viviendas accesibles de SUA 9 1.2.1);
- **autopromoción individual para uso propio**: sí / no, solo en vivienda unifamiliar (art. 106.5).
- **Comunidad autónoma** derivada del INE del municipio (tabla de prefijos de provincia), sin
  pedirla.

El **generador térmico** va en el módulo RITE (paso 4): es su dato.

Sin respuesta, cada módulo que lo necesita sale pendiente (no supone).

### Paso 2 · HE 3, iluminación

Clave **`he3`**, en 3.6 tras HE 1. Aplicabilidad (K-MEM.6, VERIFICADO):
- **vivienda unifamiliar, o solo interior de viviendas**: `no_aplica`, «instalaciones interiores de
  viviendas (HE 3 ap. 1 pto 2 a)»;
- **edificio aislado de menos de 50 m² útiles**: `no_aplica` (pto 2 e);
- **plurifamiliar u otro uso con zonas comunes, obra nueva**: aplica a las zonas comunes y al
  aparcamiento;
- **existente**: las reglas del pto 3 (todo el edificio con cambio de uso característico o con más
  de 1.000 m² y más del 25 % de la superficie iluminada renovada; si no, la parte renovada). Un local
  que pasa a vivienda, `no_aplica`.

Módulo: tabla por zona común (las de El edificio: `zona_comun`, `vestibulo`, `trasteros`,
garaje), con S de El edificio y **P (W) y Em (lux) declarados** por el proyectista: VEEI =
100·P/(S·Em) frente a 4,0, PTOT/STOT frente a 10 W/m² (5 en aparcamiento) y el sistema de control
(manual + horario, o presencia / pulsador temporizado en uso esporádico). Sin P o Em, pendiente.
Sin exigencia de luz natural (3.4 pto 2).

### Paso 3 · ICT

Clave **`ict`**, en el capítulo 4 («Otros reglamentos»). Aplicabilidad (K-MEM.7):
- obra nueva o rehabilitación integral **y** propiedad horizontal → la ficha de previsiones y
  `externo` en cuanto al proyecto técnico de ICT;
- un edificio de una sola vivienda fuera de la propiedad horizontal → `no_aplica`, con el motivo
  (RD-ley 1/1998, art. 2);
- reforma no integral o cambio de uso parcial → `no_aplica` en cuanto a proyecto (INTERPRETACIÓN),
  «la nueva unidad se conecta a la ICT existente»;
- sin el régimen declarado (paso 1), pendiente.

Ficha «Previsiones del proyecto de arquitectura» (K-MEM.8): nº de PAU (viviendas, locales,
estancias comunes), recinto (RITU hasta PB + 3 y 16 PAU; si no, RITI + RITS), RTR en cada vivienda,
tomas mínimas por vivienda desde las estancias de habitabilidad, arqueta de entrada y canalización.
Remisión al proyecto técnico (autor y fecha, declarados; coordinación del art. 9). Las dimensiones
de arqueta, recintos y RTR, de las tablas verificadas en K-MEM.21; la fila de más de 100 PAU y la
elección entre RITU obligatorio u opcional, no.

### Paso 4 · HE 2 / RITE

Clave **`rite`** (rótulo «HE 2 · RITE»), en 3.6. Datos del módulo, que son la fuente del generador:
- **generadores**: tipo (bomba de calor aire-agua, aire-aire, caldera, solar, biomasa, red, termo
  eléctrico), servicio (calefacción, refrigeración, ACS), potencia nominal de calor y de frío, y
  rendimiento declarado (COP/SCOP, EER/SEER); individual por vivienda o centralizado;
- acumulación de ACS (l) y su tratamiento frente a la legionela;
- emisores (suelo radiante, radiadores, fancoils, splits) y control.

Lo que da (K-MEM.4 y 5):
- **documento exigible** por la potencia (art. 15): < 5 kW, ninguno; 5–70 kW, memoria técnica de
  instalador habilitado o técnico competente; > 70 kW, proyecto. Con varios generadores, la suma de
  los necesarios para el servicio, sin la solar térmica; en bomba de calor reversible, la mayor de
  calor y frío (INTERPRETACIÓN);
- la ficha resumen de IT 1.1, 1.2 y 1.3 con remisión a ese documento: condiciones interiores de la
  tabla 1.4.1.1, calidad del aire por HS 3, higiene (IT 1.1.4.3) con remisión a la norma de legionela,
  sin temperaturas ni rendimientos mínimos (el RITE no los da);
- **lectura por los demás**: HE 4 toma de aquí el generador de ACS (sin repetirlo); el REBT, la
  climatización (decisión 3 de feature-34); HS 4, si el ACS es individual o central.

En obra existente, por `Alcance.generacionTermica`: sin renovación, `no_aplica` con el motivo.

### Paso 5 · Accesibilidad autonómica

Clave **`acc`** (rótulo «Accesibilidad»), en el capítulo 4. Norma declarada, con el patrón de
habitabilidad: plantilla **Decreto 293/2009 de Andalucía** (cotejada en el paso 0) y, en otra
comunidad, la norma que declare el proyectista con su referencia.

Con el Decreto (K-MEM.14 y 15):
- **zonas comunes** que se construyen, reforman o cambian de uso: itinerario accesible (art. 104);
  **ascensor o reserva** por el art. 106.2 (plantas sobre rasante y nº de viviendas), con la
  exención de la autopromoción (106.5) y las ayudas técnicas en reforma (106.6);
- **reserva de viviendas** solo en promoción protegida o pública: de 17 a 25 viviendas, 1; con más
  de 25, el 4 % (Ley 4/2017, art. 58.1, que supera la tabla del art. 111.1; K-MEM.22);
- **interior de la vivienda libre**: sin exigencias; **reforma parcial**: solo lo modificado
  (art. 2.2); imposibilidad en existente, motivada (DA 1.ª);
- tabla «Parámetro | DB-SUA | Decreto | Proyecto» (como la Ficha III de la Orden de 2012), con el
  más exigente marcado; **aviso** si SUA 9 y el Decreto no coinciden en el ascensor.

Unifamiliar: «sin zonas comunes» como motivo, no «no es vivienda adaptada».

### Paso 6 · Coherencia en «Antes de entregar»

`coherencia(p)`, puro, en `src/lib/obra/coherencia.ts`, con una comprobación por tema y su
`PendienteEntrega` de tipo `revisar` (revisable, como los avisos de los módulos):

| Tema | Qué se compara |
|---|---|
| ACS | el generador de ACS del RITE, el sistema de HE 4, `aguaCaliente` de HS 4 y la central de ACS del REBT |
| Grupo de presión | `grupoPresion` de HS 4 y la potencia de servicios generales del REBT |
| Garaje | plazas de El edificio, HE 6, SUA 7 y la recarga del REBT; garaje sin HE 6 o HE 6 sin garaje |
| Contadores | contadores de HS 4 (batería / por planta, número) y derivaciones individuales del REBT |
| Electrificación | grado y potencia del REBT frente a lo que se diga en otros apartados |
| Superficies | las que guardan los módulos con dato propio frente a El edificio |

Antes de codificar, un inventario de qué módulos guardan **dato propio** que pisa El edificio: solo
ahí puede haber contradicción. Lo que ya sale de una sola fuente no se comprueba.

### Paso 7 · Piscina (si entra, decisión 1)

Para la piscina privada de una unifamiliar (K-MEM.23): SUA 6 ya dice que queda fuera; en el REBT y
en el anejo, un apartado ITC-BT-31 (zonas 0, 1 y 2, MBTS de 12 V en 0 y 1, protección en la 2,
equipotencial) con el circuito de la depuradora y su potencia declarada, y los avisos de trámite
(proyecto con más de 5 kW, OCA con más de 10 kW); HS 5, el vaciado a la red; HS 4, la depuradora
fuera del caudal de los aparatos.

### Paso 8 · Casos y cierre

- Tests puros de cada módulo en el Demo, la unifamiliar, la plurifamiliar y «Reforma: local a
  vivienda».
- **Foto del expediente**: filas nuevas `he3`, `rite`, `ict`, `acc`; el resto cambia solo por lo
  que lean de ellos (REBT, HE 4) y por la huella de la memoria.
- Los cinco ejemplos de contradicción, reproducidos como test: cada uno da su aviso.
- Abrir el Word en Word y comprobar en el navegador.

## Fuera de alcance

- **Cargas térmicas y dimensionado del RITE**: son de la memoria técnica o del proyecto RITE.
- **Proyecto técnico de ICT** y su dimensionado de redes.
- **Las fichas oficiales de la Orden de 9-01-2012** en su formato: la app da el contenido.
- **Normas de accesibilidad de otras comunidades** como plantilla: se declaran.
- **HE 3 en uso distinto de residencial** más allá de zonas comunes y aparcamiento (oficinas,
  locales con actividad): lo declara el proyectista o queda para otra feature.
- **Tabla «otras normativas específicas»** del 1.2.3 de los ejemplos: la decisión 8 del plan
  («Normativa aplicada») sigue abierta.

## Decisiones a validar

1. **Piscina privada**: ¿entra (paso 7) o se deja fuera? Propuesta: **entra, acotada**: la
   ITC-BT-31 se aplica también a la piscina privada (K-MEM.23), así que el REBT debe decirlo, con los
   avisos de trámite por potencia; el resto, textos con cita, sin cálculo. La unifamiliar del ejemplo
   la tiene y su memoria no dice nada.
2. **Dónde va cada apartado**: HE 2 / RITE y HE 3 en el 3.6 (son secciones del DB-HE); ICT y
   accesibilidad en el capítulo 4, tras el REBT y habitabilidad, como en los ejemplos.
3. **El generador se declara en el RITE** y HE 4 lo lee: HE 4 deja de pedir el tipo de sistema si
   el RITE lo tiene. Alternativa: que HE 4 siga siendo la fuente y el RITE lo lea.
4. **Régimen de la promoción en «La obra»**, con tres preguntas sí / no, sin valor por defecto.
5. **HE 3 pide P y Em por zona común**; la app no calcula luminarias ni toma niveles de iluminación
   de ninguna norma (el CTE no los fija; la UNE-EN 12464-1 no está verificada).
6. **ICT sin proyecto en reforma no integral**, rotulado INTERPRETACIÓN (la norma no define
   «rehabilitación integral»); se usa `Alcance.integral`.
7. **Accesibilidad: solo Andalucía como plantilla**; el contenido de la Ficha III en tabla, no el
   formulario oficial.
8. **Coherencia como avisos `revisar` revisables**, nunca como «no cumple»: dos apartados que no
   coinciden pueden ser un error o un caso raro que el proyectista conoce.
9. **Orden de los pasos**: HE 3 e ICT primero (pequeños y con normativa casi cerrada), luego el
   RITE (el que más toca a otros módulos), accesibilidad, coherencia y piscina. Un commit por paso,
   como feature-35.
