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
- **Un dato, una fuente.** Cada servicio se declara una vez: el ACS en HE 4 (como hoy) y la
  calefacción y la refrigeración en el RITE, que lee el ACS de HE 4; el REBT lee la climatización del
  RITE. Donde dos módulos guardan cada uno su dato (contadores, grupo de presión, plazas),
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
  **Quitada en el paso 5**: el art. 106 solo alcanza a los plurifamiliares (corrección del usuario).
- **Comunidad autónoma** derivada del INE del municipio (tabla de prefijos de provincia), sin
  pedirla.

El **sistema de ACS** sigue en HE 4; la **calefacción y la refrigeración**, y la potencia de todos
los generadores, van en el módulo RITE (paso 4, decisión 3).

Sin respuesta, cada módulo que lo necesita sale pendiente (no supone).

**Hecho (2026-10-19).** 10 tests en `src/lib/proyecto/test/promocion.test.ts`; comprobado en el
navegador (se contesta, se guarda y se relee; sin errores de consola):
- [src/data/comunidades.ts](src/data/comunidades.ts): las 52 provincias por código INE con sus 19
  comunidades y ciudades autónomas, `comunidadDeIne` y `provinciasDe`. La plantilla andaluza de
  habitabilidad toma de aquí sus provincias (antes, una lista suelta).
- `DatosGenerales.promocion?: PromocionObra` en [tipos.ts](src/lib/proyecto/tipos.ts), con
  `propiedadHorizontal`, `protegida` y `autopromocion`, opcionales.
- [promocion.ts](src/lib/proyecto/promocion.ts), puro: `promocionDe` (lee solo los sí / no con
  forma), `conPromocion` (borra la respuesta con `undefined` y el campo entero si se queda vacío),
  `preguntaAutopromocion` (solo en unifamiliar) y `comunidadDeObra`.
- [SeccionPromocion.tsx](src/components/proyecto/SeccionPromocion.tsx) en La obra, tras «Documento»:
  las preguntas con su ayuda y su cita, y la comunidad autónoma que sale del municipio. Cerrada
  mientras no haya nada contestado.

**Decisiones del paso 1, a validar:**
1. **La sección va en la columna izquierda de La obra, entre «Documento» y «Habitabilidad»**, y no
   en El edificio: es un dato de la promoción, no de la geometría.
2. ~~**La autopromoción solo se pregunta en vivienda unifamiliar**~~. **Quitada en el paso 5**: sin
   lector (el art. 106 es de los plurifamiliares); en un expediente guardado se ignora.
3. **La comunidad no se puede cambiar a mano**: sin municipio, «elige el municipio».
4. **Los controles sí / no son los de seguridad y salud** (ningún botón pulsado si no se contesta).

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

**Hecho (2026-10-19).** 18 tests en `src/modules/he3/test/he3.test.ts`; comprobado en el navegador
(pantalla y memoria del Demo, sin errores de consola):
- [src/modules/he3/](src/modules/he3/) con el patrón de SUA 4: `tablas.ts` (tabla 3.1, tabla 3.2, control
  del 3.3 y 3.4, `veei`), `estado.ts` (por zona `potencia_W` e `iluminancia_lx`; `control` con lo
  habitual), `justificacion.ts`, `textos.ts`, `memoria.ts`, `dibujo.ts`, `definicion.ts` y `ui.tsx`.
- Las zonas: las de uso general del DB-SUA (portal, vestíbulo), trasteros, cuartos de instalaciones y
  el garaje que no es de la unifamiliar. Por zona, el VEEI frente a 4,0 (6,0 en las zonas comunes de un
  edificio no residencial); por grupo, PTOT/STOT frente a 10 W/m² (25 con más de 600 lux) y 5 en el
  aparcamiento, con todas las plantas. Oficinas y locales, previstos con su actividad.
- Aplicabilidad: atributo `iluminacionHe3` (hay algo fuera de las viviendas) con la regla de la
  exclusión a); en existente, `he3` en `REGLAS_EXISTENTES` (cambio de uso característico, todo el
  edificio; ampliación, reforma integral o alumbrado renovado, lo renovado, nombrando la regla de
  1.000 m² y 25 %; si no, no aplica) y `ALCANCE_MODULO.he3 = "intervenido"`.
- Registro (`he/iluminacion`, tras HE 1), ruta, La obra, anejo de fichas, memoria (3.6.3, y HE 4 a
  HE 6 pasan a 3.6.4–3.6.6) y Demo con potencias e iluminancias de demostración.
- Foto del expediente: la fila `he3` y la huella de la memoria; nada más.

**Decisiones del paso 2, a validar:**
1. **Sin potencia o sin iluminancia, la zona «no cumple» («sin declarar»)**, como habitabilidad sin
   norma: el expediente no se da por bueno sin el dato. Un proyecto nuevo de plurifamiliar sale con HE 3
   en rojo hasta que se declaran.
2. **Potencia e iluminancia por planta** en las zonas que se repiten (la escalera de P1–P3); PTOT y STOT
   suman todas las plantas.
3. **Trasteros y cuartos de instalaciones cuentan como zonas comunes** (límite 4,0); el CTE no los
   excluye.
4. **Más de 600 lux en una zona sube el máximo de todas las zonas comunes a 25 W/m²**: la tabla 3.2 va
   por uso, no por zona, y se toma la mayor iluminancia (INTERPRETACIÓN).
5. **Control: detección de presencia, lo habitual**; las tres opciones del 3.3 valen en uso esporádico y
   no hay «no cumple» posible.
6. **El 25 % de la superficie iluminada renovada no se pregunta**: con alumbrado renovado sale
   «aplica_reformado» y la nota nombra la regla de todo el edificio.

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

**Hecho (2026-10-19).** 19 tests en `src/modules/ict/test/ict.test.ts`; comprobado en el navegador
(pantalla y memoria 4.3 del Demo, sin errores de consola):
- [src/modules/ict/](src/modules/ict/) con el patrón de habitabilidad: `tablas.ts` (ámbito del RD-ley,
  RITU, RITU-A, RITI/RITS, arqueta ≤ 100 PAU, canalización externa y principal, RTR y registros de toma
  del 5.13, con `recintoAdmitido` y `medidasRecinto`), `estado.ts` (recinto con lo habitual, PAU de
  locales y de estancias comunes, autor y fecha del proyecto técnico), `justificacion.ts`, `textos.ts`,
  `memoria.ts`, `dibujo.ts`, `definicion.ts` y `ui.tsx`. `CampoTexto` nuevo en `ParaElAnejo.tsx`
  (`CampoPlanos` pasa a usarlo).
- Elementos: régimen (sin declarar, «no cumple»), PAU, recinto (fuera de su ámbito, «no cumple»),
  arqueta, canalización externa, canalización principal (no en la unifamiliar), RTR, registros de toma
  por vivienda tipo (con las estancias de Habitabilidad o, sin ellas, las deducidas del tipo y un aviso)
  y el proyecto técnico, «previsto».
- Aplicabilidad: `AtributosProyecto.propiedadHorizontal`; dos reglas de `no_aplica` con el «no»
  (una sola vivienda; o fuera del régimen y sin arrendamiento), cita «RD-ley 1/1998, art. 2». En
  existente, `ict` en `REGLAS_EXISTENTES`: con `Alcance.integral`, aplica; si no, `no_aplica` rotulado
  interpretación, «se conecta a la infraestructura existente».
- Registro (grupo «Telecomunicaciones (ICT)», ruta `ict`), La obra, anejo de fichas, memoria (4.3,
  tras habitabilidad) y Demo en propiedad horizontal.
- Foto del expediente: la fila `ict` y la huella de la memoria; nada más.

**Decisiones del paso 3, a validar:**
1. **`aplica`, no `externo`**: el módulo es la ficha de previsiones de la arquitectura y remite al
   proyecto técnico; `externo` no tiene pantalla. «Sin declarar» el régimen, aplica y el módulo sale
   «no cumple» hasta contestarlo en La obra (como habitabilidad sin norma).
2. **PAU**: las viviendas de El edificio, un local u oficina por zona y planta (ajustable) y las
   estancias comunes que se declaren (por defecto, ninguna).
3. **Recinto elegido por el proyectista**, con lo habitual RITU en su ámbito (hasta PB + 3 y 16 PAU) y
   RITI + RITS fuera de él; el RITU y el RITU-A fuera de su ámbito, «no cumple»; RITI + RITS siempre vale.
   El RITM y los conjuntos de unifamiliares no se distinguen (la regla del 4.5 sigue sin transcribir).
4. **El RITU de hasta 5 PAU «con zonas comunes»** si El edificio tiene portal o zona común.
5. **Estancias con registros de toma**: todas menos baños, aseos y pasillos; «otra» cuenta. Las dos
   principales son las dos primeras; con una sola estancia, una principal.
6. **Arqueta de más de 100 PAU**: sin cifra («la dimensiona el proyecto técnico»); canalización
   principal de más de 30 PAU, «cálculo específico».
7. **En existente solo cuenta `Alcance.integral`** (decisión 6 del plan): la ampliación o el cambio de
   uso característico sin rehabilitación integral no piden proyecto.
8. **Autor y fecha del proyecto técnico, opcionales**: sin ellos, la memoria remite sin nombrarlo.

### Paso 4 · HE 2 / RITE

Clave **`rite`** (rótulo «HE 2 · RITE»), en 3.6. La fuente se reparte por servicio (decisión 3):
- **ACS**: el sistema, si es individual o centralizado, y el apoyo, **los lee de HE 4** (sin
  repetirlos); el RITE añade lo suyo: potencia nominal del generador de ACS y acumulación (l);
- **calefacción y refrigeración**, que hoy no están en ningún sitio: tipo (bomba de calor
  aire-agua, aire-aire, caldera, biomasa, red, eléctrica), potencia nominal de calor y de frío,
  rendimiento declarado (COP/SCOP, EER/SEER), individual por vivienda o centralizado; si es la misma
  máquina que la del ACS, se marca y no se suma dos veces;
- emisores (suelo radiante, radiadores, fancoils, splits) y control.

Lo que da (K-MEM.4 y 5):
- **documento exigible** por la potencia (art. 15): < 5 kW, ninguno; 5–70 kW, memoria técnica de
  instalador habilitado o técnico competente; > 70 kW, proyecto. Con varios generadores, la suma de
  los necesarios para el servicio, sin la solar térmica; en bomba de calor reversible, la mayor de
  calor y frío (INTERPRETACIÓN);
- la ficha resumen de IT 1.1, 1.2 y 1.3 con remisión a ese documento: condiciones interiores de la
  tabla 1.4.1.1, calidad del aire por HS 3, higiene (IT 1.1.4.3) con remisión a la norma de legionela,
  sin temperaturas ni rendimientos mínimos (el RITE no los da);
- **lectura por los demás**: el REBT toma de aquí la climatización (decisión 3 de feature-34) y
  deja de pedirla «para el anejo»; HE 4 y HS 4 no cambian (lo que no cuadre lo avisa el paso 6).

En obra existente, por `Alcance.generacionTermica`: sin renovación, `no_aplica` con el motivo.

**Hecho (2026-10-19).** 16 tests en `src/modules/rite/test/rite.test.ts`; comprobado en el navegador
(pantalla, de «sin potencia» a «memoria técnica» al declarar las potencias; memoria 3.6.3; el REBT con la
climatización de solo lectura; sin errores de consola):
- [src/modules/rite/](src/modules/rite/) con el patrón de la ICT: `tablas.ts` (literal de HE 2, art. 15.1
  y 15.2, tabla 1.4.1.1, umbral de la IT 1.2.4.5.2, `documentoExigible`), `estado.ts` (calefacción,
  emisores, refrigeración, producción, potencias, SCOP y SEER, ACS de la misma máquina, potencia y
  acumulación del ACS; `resolverRite` y `climatizacionParaRebt`), `justificacion.ts`, `textos.ts`,
  `memoria.ts`, `dibujo.ts`, `definicion.ts` y `ui.tsx`.
- Elementos: calefacción, refrigeración, ACS (de HE 4), el documento de cada instalación («no cumple» sin
  alguna potencia), condiciones interiores, calidad del aire (HS 3 en viviendas), higiene (legionela),
  contabilización, recuperación de calor (solo residencial) y el art. 15.6 en el cambio de uso.
- Instalaciones: una si la climatización y el ACS se producen igual; dos si no. Potencia = la mayor de la
  suma de calor (calefacción + ACS, sin la solar térmica ni el ACS de la misma máquina) y la de frío.
- El REBT lee la climatización del RITE (`equiposDe` con la del RITE) y deja de pedirla: en su pantalla,
  una línea de solo lectura con el enlace.
- Aplicabilidad en existente: `rite` en `REGLAS_EXISTENTES` (cambio de uso característico, aplica por el
  art. 2.3 e y 15.6; generación general o parcial, a lo renovado; sin responder, se propone; «no», no
  aplica). Obra nueva: aplica siempre.
- Registro (`he/termicas`, código HE2, en Ahorro de energía), La obra, anejo, memoria (3.6.3; HE 3 a HE 6
  pasan a 3.6.4–3.6.7) y Demo con potencias de demostración (memoria técnica, 5,4 kW por vivienda).
- Foto del expediente: la fila `rite` y la huella de la memoria; el REBT no cambia.

**Decisiones del paso 4, a validar:**
1. **Lo habitual: bomba de calor aire-aire reversible, con split, individual**, que es lo que el REBT
   suponía; así el REBT de los expedientes guardados no cambia.
2. **La climatización que guardaba el REBT decide lo habitual del RITE** (aire-agua → aire-agua;
   emisores → eléctrica; «ninguna eléctrica» → caldera), para no perderla; el campo del REBT ya no se
   edita.
3. **Se suman calefacción y ACS** en la misma instalación (art. 15.2, «los necesarios para cubrir el
   servicio»; INTERPRETACIÓN), salvo que el ACS salga de la misma máquina. Frente a esa suma, la de frío;
   manda la mayor.
4. **Sin alguna potencia, «no cumple»** (como HE 3): sin ella no se sabe el documento.
5. **Dos instalaciones** cuando la climatización y el ACS (de HE 4) no se producen igual (individual o
   centralizada); «misma máquina» solo si el tipo y la producción coinciden.
6. **Potencias por vivienda (la mayor) en producción individual**; la total en centralizada.
7. **El REBT con una sola climatización**: aire-agua de calefacción con split de frío sale como C8 (se
   pierde el C9); habría que ampliar el REBT si se da.
8. **Reparto de gastos** solo con alguna instalación centralizada y más de un usuario (viviendas más
   locales y oficinas, uno por zona y planta).
9. **Sin cifras de aislamiento, temperaturas de ACS ni rendimientos mínimos**: la memoria remite al
   documento RITE.

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

**Hecho (2026-10-19).** 14 tests en `src/modules/acc/test/acc.test.ts`; comprobado en el navegador
(el Demo en Cáceres con la norma declarada y el mismo Demo en Málaga con la plantilla; memoria 4.4; sin
errores de consola):
- [src/modules/acc/](src/modules/acc/) con el patrón de la ICT: `tablas.ts` (art. 106.2, reserva de la
  Ley 4/2017 y la Ficha IV, tramos del art. 104; `exigenciaVertical`, `viviendasReservadas`),
  `estado.ts` (la norma de otra comunidad y la declaración de la DA 1.ª), `justificacion.ts`,
  `textos.ts`, `memoria.ts`, `dibujo.ts`, `definicion.ts` y `ui.tsx`.
- **Andalucía** (comunidad por el INE del municipio), en plurifamiliar: la norma; itinerarios del art. 104 (sin medidas:
  la Ficha III no está transcrita); comunicación vertical por el 106.2 frente a lo que exige SUA 9, con
  aviso si no coinciden y la tabla «DB-SUA 9 | Decreto | Proyecto»; reserva de viviendas frente a las
  accesibles de SUA 9; en existente, lo modificado y la DA 1.ª; otros usos, «fuera» (Ficha II).
- **Otra comunidad**: solo la norma declarada; sin ella (o sin municipio), «no cumple».
- **Unifamiliar andaluza**: `no_aplica` siempre, «sin elementos de uso comunitario (art. 2.1 j); el
  interior de la vivienda libre no tiene exigencias»; forzada a aplicar, una línea «sin exigencias».
- Aplicabilidad: regla de atributos (Andalucía y unifamiliar → `no_aplica` con el motivo); en existente, `acc` en `REGLAS_EXISTENTES` con `AlcanceEdificio.intervieneComunes` (nuevo:
  alguna zona común nueva, reformada o que cambia de uso) y `ContextoExistente.comunidad`.
- Registro (ruta `accesibilidad`, grupo «Accesibilidad (autonómica)»), La obra, anejo, memoria (4.4) y
  Demo con una norma de demostración rotulada (Cáceres no tiene plantilla).
- Foto del expediente: la fila `acc` y la huella de la memoria; nada más.

**Decisiones del paso 5, a validar:**
1. **Solo Andalucía con plantilla**; en otra comunidad, la norma con su referencia y una línea de
   remisión, sin comprobar nada.
2. **VALIDADA CON CORRECCIÓN (2026-10-19): el art. 106 solo se aplica a los plurifamiliares.** El primer
   borrador metía en el 106.2 la unifamiliar que no fuera de autopromoción; el usuario lo corrige: la
   unifamiliar andaluza no aplica nunca (sin elementos comunitarios, interior libre sin exigencias). Se
   quita la pregunta de autopromoción de La obra.
3. **Las viviendas reservadas las cuenta SUA 9** (sus viviendas accesibles para silla de ruedas): si
   son menos que la reserva, «no cumple» con el texto que dice cuántas indicar en SUA 9.
4. **Sin ascensor declarado en El edificio, se supone el que exija el Decreto o SUA 9**; con «no»
   explícito y el Decreto pidiéndolo, «no cumple».
5. **En existente, la comunicación vertical es un dato**, sin «no cumple»: se aplica a lo modificado y,
   si no se puede, la DA 1.ª y las ayudas técnicas.
6. **Promoción protegida de menos de 17 viviendas: cero reservadas con un aviso** (la Ley 4/2017 no fija
   umbral; sin confirmar).
7. **Los edificios de otros usos, «fuera»** (Ficha II): la app no la trae.
8. **No se imprimen las medidas de la Ficha III** (anchos, rampas, escaleras, mecanismos): no están
   transcritas; la memoria remite a la ficha.

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

**Hecho (2026-10-19).** 17 tests en `src/lib/obra/test/coherencia.test.ts` y uno de pantalla en
`src/components/obra/test/obra.test.tsx`.

**El inventario.** Sale de una sola fuente, y por eso no se compara:
- **plazas, viviendas, locales y garaje**: HE 6, SUA 7, SI 3, HS 4 y el REBT los leen de El edificio; la
  recarga del REBT lee HE 6 (estaciones y esquema);
- **ACS**: el RITE lee de HE 4 el sistema, la producción y el apoyo; el REBT lee la central de HE 4 y ya
  avisa (`acs-central`); el anejo de HS 4 no nombra el generador ni la acumulación (el termo de 75 l del
  ejemplo no puede salir);
- **grupo de presión**: el anejo y la memoria lo leen de HS 4; el REBT no nombra el grupo, solo «los demás
  servicios del edificio»;
- **climatización**: el REBT la lee del RITE;
- **superficies**: solo habitabilidad guarda las de las estancias, y ya avisa si suman más que la vivienda
  (`util-*`); la superficie residencial (hab) y la cubierta no transitable (HE 5) se **declaran** porque la de
  El edificio no vale para eso: no se comparan.

Lo que guardan dos módulos y se compara, en [coherencia.ts](src/lib/obra/coherencia.ts):

| Tema | Aviso |
|---|---|
| ACS | «Agua caliente» de HS 4 frente a la producción de HE 4 (solo con más de una vivienda: HE 4 no la pregunta en otro caso) |
| Servicios | el grupo de presión de HS 4 y la producción centralizada del RITE con los «otros servicios» del REBT sin indicar o a 0 kW |
| Electrificación | climatización eléctrica individual en el RITE y viviendas en básica en el REBT; o elevada solo «por equipos» sin climatización eléctrica, secadora ni automatización |
| Garaje | HE 6 o SUA 7 forzados en contra de lo que propone la app (el «no se proyectan aparcamientos» con SUA 7 justificándolo); plazas exteriores de HE 6 en un edificio de viviendas, que la recarga del REBT no cuenta |
| Contadores | viviendas y locales u oficinas de HS 4 frente a los del REBT (obra nueva, red deducida) |

- `AvisoCoherencia` con `id` que lleva lo comparado (`acs:central-individual`): si cambia un dato, vuelve.
- En «Antes de entregar», tras los avisos de los módulos, con el código «Coherencia», un botón «Ir a» por
  cada apartado y «Marcar como revisado» allí mismo; los revisados se guardan en
  `DatosGenerales.coherenciaRevisada` (sin schema nuevo) y se pueden volver a mostrar.
- El Demo y los cinco casos de partida, sin ningún aviso; la foto del expediente no cambia.

**Decisiones del paso 6, validadas el 2026-10-20** (la 5, con el arreglo del REBT; la 6, para más adelante):
1. **Los avisos se revisan en «Antes de entregar»**, no en los módulos: no son de ninguno. Se guardan en los
   datos de la obra.
2. **La central de ACS de HE 4 no se repite**: ya la avisa el REBT (`acs-central`); la coherencia solo añade
   el grupo de presión y la climatización centralizada.
3. **ACS solo con más de una vivienda** (HE 4 no pregunta la producción con una).
4. **Electrificación en los dos sentidos**: la elevada sin motivo también avisa, porque la memoria del REBT
   la explica por «climatización eléctrica u otros equipos».
5. **Producción centralizada del RITE: la máquina no está en la vivienda**, así que no pide elevada.
   **Arreglado (2026-10-20):** el REBT ponía el C8 o el C9 en la vivienda elevada aunque la producción
   fuera centralizada. Ahora `climatizacionDe` no da climatización en la vivienda con la centralizada,
   salvo los emisores eléctricos, que siguen en cada estancia; los fancoils o emisores de la central
   van en los circuitos normales. La elevada que quede solo «por equipos» (sin secadora ni
   automatización) da el aviso de coherencia, con su texto para la centralizada.
6. **Plazas exteriores de HE 6 en viviendas**: aviso sin arreglo en la app (el REBT solo calcula la
   recarga del garaje); el proyectista lo revisa. **Para más adelante:** que el REBT calcule también la
   recarga de las plazas exteriores.
7. **Contadores solo en obra nueva**: en una existente, HS 4 ve lo intervenido y el REBT el edificio.
8. **Sin comprobación de superficies**: las únicas con dato propio se declaran a propósito o ya avisan.

### Paso 7 · Piscina (si entra, decisión 1)

Para la piscina privada de una unifamiliar (K-MEM.23): SUA 6 ya dice que queda fuera; en el REBT y
en el anejo, un apartado ITC-BT-31 (zonas 0, 1 y 2, MBTS de 12 V en 0 y 1, protección en la 2,
equipotencial) con el circuito de la depuradora y su potencia declarada, y los avisos de trámite
(proyecto con más de 5 kW, OCA con más de 10 kW); HS 5, el vaciado a la red; HS 4, la depuradora
fuera del caudal de los aparatos.

**Hecho (2026-10-20).** 7 tests en `src/modules/rebt/test/piscina.test.ts`; comprobado en el navegador
(el Demo con piscina: REBT «no cumple» sin la potencia; con 12 kW, servicios generales de 23,8 kW, aviso de
OCA, proyecto por los grupos e, g y n, y la memoria con su párrafo; sin errores de consola):
- **K-MEM.25** (research/verificacion-memoria.md): **el DB-HS no regula la piscina**. La palabra no aparece
  ni en el DB-HS de 2022 ni en sus comentarios. HS 4 no la trae como aparato (la app ya no la cuenta en el
  caudal) y HS 5 no regula el vaciado (va por la ordenanza municipal). **HS 4 y HS 5 no cambian.** Además,
  la letra de la ITC-BT-31 que K-MEM.23 daba como resumen, leída en el texto del consolidado.
- `PISCINA_REBT` en [tablas.ts](src/modules/rebt/tablas.ts): zonas, grados IP, MBTS de 12 V / 30 V,
  30 mA, proyecto con más de 5 kW (grupo n) e inspección con más de 10 kW, cada 5 años.
- `RebtEstado.piscina_kW` y `piscinaAlumbrado`, opcionales (los expedientes guardados se leen igual).
- Elemento `piscina` del REBT con la piscina de La obra (`tienePiscina`), privada o comunitaria: sin
  potencia, «no cumple»; con ella, el trámite. Aviso `piscina-oca` con más de 10 kW. La documentación
  añade el grupo n, y `soloAparcamiento` pasa a `solo: ("aparcamiento" | "piscina")[]` («proyecto de la
  piscina; el resto, MTD»).
- En el edificio, la piscina comunitaria **suma en los servicios generales** (ITC-BT-10 ap. 3.2), con su
  línea en la memoria; en la unifamiliar no cambia la previsión.
- Memoria del REBT: un párrafo con la ITC-BT-31, la potencia y el trámite, que remite al anejo. Anejo
  5.3.3: la parte «Piscina (ITC-BT-31)», con la tabla de zonas (extensión, grado mínimo y protección),
  la equipotencial, las canalizaciones, cajas y aparatos, el alumbrado del vaso si lo hay y el cuarto de
  máquinas (ITC-BT-30).
- Pantalla del REBT: la decisión «Potencia de la piscina» y, en «Para el anejo», «Alumbrado en el vaso».
  La ayuda de la casilla «Piscina» de La obra nombra la ITC-BT-31.
- Foto del expediente: los 20 proyectos con piscina pasan a REBT «no cumple» (sin la potencia) y cambian
  la huella de la memoria y la del anejo; nada más.

**Decisiones del paso 7, VALIDADAS el 2026-10-20** (la 5, cambiada a propuesta de la revisión):
1. **También la piscina comunitaria**: la ITC-BT-31 no distingue (su ámbito es «las piscinas»), así que
   no es una ampliación por exclusión. Sigue la letra.
2. **Sin potencia, «no cumple»**, como el RITE y HE 3: sin ella no se sabe si hace falta proyecto. Un
   expediente guardado con piscina sale con el REBT en rojo hasta que se indica.
3. **La comunitaria suma en los servicios generales**; la ayuda de «Otros servicios» dice que no se
   cuente allí. **La de la unifamiliar no cambia la previsión** (la ITC-BT-10 da la de la vivienda por su
   grado; con una demanda mayor conocida, la memoria ya dice que se prevé esa).
4. **Proyecto solo de la piscina**, como el del aparcamiento: con el grupo n y nada más, «el resto, MTD,
   salvo que la Administración pida un único proyecto». El usuario confirma la práctica: la piscina de una
   unifamiliar no lleva trámite propio en Industria (con menos de 5 kW, la MTD del instalador). Se queda la
   letra literal; no se lee el ap. 3.3 como «proyecto de toda la instalación».
5. ~~**En un edificio existente no entra**~~. **Cambiada**: el asistente de alcance pregunta «Obra en la
   piscina» (`Alcance.piscina`, P13), solo con piscina en La obra. Sin responder o «sí», el REBT la
   justifica (lo prudente, como el aparcamiento); «no», no entra. En el plurifamiliar existente, la
   potencia de la piscina cuenta como carga añadida (el «antes» se calcula sin ella) y la memoria trae su
   párrafo y su documentación. SUA 6 no lee la respuesta (sigue «se aplica a la piscina, los pozos o los
   depósitos solo si son objeto de la intervención»).
6. **El circuito de la piscina no se calcula**: el anejo dice que lo define la documentación de la
   instalación (MTD o proyecto). No se imprime la excepción de las piscinas pequeñas.
7. **HS 4 y HS 5, sin cambios** (K-MEM.25). El antirretorno de los «tubos de alimentación no destinados a
   usos domésticos» (HS 4 ap. 2.1.2 d) en el llenado sería una interpretación que amplía lo exigible: no se
   codifica sin que lo diga el usuario.

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

## Decisiones (validadas el 2026-10-19)

El usuario valida las nueve; la 3 cambia respecto al borrador (fuente repartida por servicio).

1. **Piscina privada**: **entra, acotada** (paso 7): la
   ITC-BT-31 se aplica también a la piscina privada (K-MEM.23), así que el REBT debe decirlo, con los
   avisos de trámite por potencia; el resto, textos con cita, sin cálculo. La unifamiliar del ejemplo
   la tiene y su memoria no dice nada.
2. **Dónde va cada apartado**: HE 2 / RITE y HE 3 en el 3.6 (son secciones del DB-HE); ICT y
   accesibilidad en el capítulo 4, tras el REBT y habitabilidad, como en los ejemplos.
3. **La fuente, por servicio**: el ACS sigue en HE 4, que ya lo guarda y está probado (sin migrar
   expedientes ni tocar su foto); la calefacción y la refrigeración, en el RITE, que lee el ACS de
   HE 4 y solo añade su potencia y la acumulación; el REBT lee la climatización del RITE.
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
