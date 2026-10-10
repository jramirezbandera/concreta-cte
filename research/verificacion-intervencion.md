# Verificación normativa — La memoria de una intervención en edificio existente: redactar solo lo intervenido (Fase 3 de PLAN-MEMORIA.md)

**Fecha:** 2026-10-10 · Agente: cte-normativa · **No se ha editado código.**

**Caso tipo:**
- Edificio plurifamiliar existente: sótano con garaje, planta baja y tres plantas de viviendas.
- Parte del local de PB (90 m² útiles, sobre solera apoyada en el terreno, sin sótano debajo) cambia de uso a una vivienda.
- El resto del local (70 m²) y las viviendas existentes no se tocan. El portal se reforma.
- Municipio en zona II de radón.

Criterios numerados **K-INT.1 … K-INT.20**, en el orden de las seis preguntas del encargo.

**Método y límites de esta sesión**
- **No hay herramienta de shell en esta sesión**: no se ha podido ejecutar PyMuPDF. El lector de PDF solo devuelve imagen de documentos de 10 páginas o menos, o de PDF ya troceados. Con eso se ha hecho lo siguiente:
  - **Leído en imagen en esta sesión:**
    - Guía DB-HR, cap. 2.0 (pp. 19–22) y cap. 2.1 (pp. 23–109), en los PDF por capítulos de codigotecnico.org (mismo documento que `research/pdf/GUIA_DBHR_201612.pdf`);
    - Guía BT-04 y Guía BT-10 completas;
    - DB-SUA pp. 5 y 29, y DB-SUA con comentarios pp. 9 y 51 (PNG ya renderizados en sesiones anteriores);
    - DB-HS p. 138 (PNG del cotejo del 2026-10-09).
  - **Leído en texto** (volcados `pdftotext` de los mismos PDF de `research/pdf`, hechos en sesiones anteriores, con marca de página):
    - DB-HS pp. 85–86, 90–91, 100, 104, 116–118 y 139–141;
    - DB-HS con comentarios pp. 146–150;
    - DB-SI pp. 32 y 46;
    - DB-HR p. 31;
    - REBT pp. 110–115.
  - **Reutilizado sin repetir** (ya cotejado en imagen en sesiones anteriores):
    - CTE Parte I art. 2 (`verificacion-reformas.md` A.1–A.7);
    - criterios de existentes del DB-SI, DB-SUA y DB-HS (B.6–B.27);
    - ámbitos HS 4, HS 5 y HS 6 (C.32–C.34);
    - REBT art. 2 (C.41–C.43);
    - DB-HR, exigencias 2.1 y opción simplificada, tablas 3.2 y 3.3 (`verificacion-hr.md` C, G y H);
    - DB-SI SI 4, tabla 1.1 (`verificacion-si4-si6.md` C1);
    - DB-SUA SUA 8, tablas 1.1 a 1.5 (`verificacion-sua6-sua8.md` C3);
    - DB-HS 4, contadores (`verificacion-hs4-v4.md` B3);
    - REBT, ITC-BT-04 y 10 (`verificacion-rebt.md`).
- **Grados:**
  - **VERIFICADO (imagen)**: literal leído en la imagen de la página, en esta sesión o en una anterior.
  - **VERIFICADO (texto)**: literal leído en el volcado de texto del PDF. Cotejar en imagen antes de imprimirlo como cita.
  - **LEÍDO (comentario)**: DB con comentarios del Ministerio. «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.»
  - **LEÍDO (Guía)**: guía del Ministerio, no reglamentaria.
  - **INTERPRETACIÓN**: se sigue de la norma, pero la norma no lo escribe tal cual.
  - **SIN CONFIRMAR**: no leído en fuente oficial en esta sesión. No se codifica.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura en esta sesión |
|---|---|---|---|---|
| [PI22] | CTE Parte I, consolidado del Ministerio | 14-06-2022 | `verificacion-reformas.md` A.1–A.7 | Reutilizado (imagen, sesión anterior) |
| [HS22] | DB-HS, consolidado | 14-06-2022 | `research/pdf/DBHS.pdf` | Imagen p. 138; texto pp. 85–86, 90–91, 100, 104, 116–118, 139–141 |
| [DccHS] | DB-HS con comentarios | Comentarios 12-02-2025 | `research/pdf/DccHS.pdf` | Texto pp. 146–150 |
| [SUA22] | DB-SUA, consolidado | 14-06-2022 | `research/pdf/DBSUA.pdf` | Imagen pp. 5, 29 |
| [DccSUA] | DB-SUA con comentarios | Comentarios 15-07-2024 | `research/pdf/DccSUA.pdf` | Imagen pp. 9, 51 |
| [HR19] | DB-HR, consolidado | 20-12-2019 | `research/pdf/DBHR.pdf` | Texto p. 31 (folio HR-25). Resto reutilizado de `verificacion-hr.md` (imagen) |
| [DccHR] | DB-HR con comentarios | 20-12-2019 | `research/pdf/DccHR.pdf` | Reutilizado |
| [GuíaHR] | Guía de aplicación del DB-HR | V.03, diciembre 2016 | codigotecnico.org, `/pdf/GuiasyOtros/GuiaHR/03_Capitulo2_0_…pdf` y `04_Capitulo2_1_aislamiento_acustico.pdf` | **Imagen pp. 19–109** |
| [SI25] | DB-SI, consolidado | 04-03-2025 (RD 164/2025) | `research/pdf/DBSI.pdf` | Texto pp. 32, 46. Criterios de existentes, imagen pp. 5–6 (sesión anterior) |
| [REBT] | RD 842/2002, consolidado BOE-A-2002-18099 | Últ. modif. 03-09-2025 | `research/pdf/REBT.pdf` | Texto pp. 110–115. Art. 2, imagen p. 9 (sesión anterior) |
| [G04] | Guía técnica de aplicación ITC-BT-04 | sep 03, rev. 1 | `research/pdf/guia_bt_04_sep03R1.pdf` | **Imagen pp. 1–17** |
| [G10] | Guía técnica de aplicación ITC-BT-10 | sep 03, rev. 1 | `research/pdf/guia_bt_10_sep03R1.pdf` | **Imagen pp. 1–6** |

### Avisos y correcciones (resumen)

1. **HS 6 en la vivienda nueva: «zona afectada», no todo el edificio.** Es un cambio de uso parcial (HS 6 ap. 1 pto 1 b ii). El resto del local, el garaje y las viviendas quedan fuera de HS 6. (K-INT.1)
2. **HS 6 admite una vivienda en PB sin levantar la solera.** Para eso tiene tres vías propias de edificios existentes:
   - la solera existente sellada que funciona como barrera (3.1.1 pto 4);
   - una cámara de al menos 5 cm por el interior (3.2 pto 6);
   - la despresurización desde la solera o perimetral (3.3 pto 3).

   Las dos últimas exigen **medición posterior según el Apéndice C** (3.2 pto 7; 3.3 pto 6). Además, con mediciones previas que no superen 300 Bq/m³, el comentario del Ministerio dice que no se exigen soluciones. (K-INT.2 a K-INT.7)
3. **SUA 8:** el C4 es «del uso del edificio» (tabla 1.4). Con el resto del local Comercial, el C4 sigue en 3 (coeficiente más desfavorable, comentario). Ne y Na no cambian: la evaluación da lo mismo que antes. (K-INT.9)
4. **DB-HR, punto crítico: el ruido de impactos desde la vivienda de arriba.**
   - **Antes:** con el local debajo, el forjado solo necesitaba la combinación de ΔRA. La Guía lo dice: «no es preciso proteger el recinto de instalaciones respecto al ruido de impactos procedente de la vivienda».
   - **Ahora:** con una vivienda debajo, el forjado «que delimita superiormente una unidad de uso» necesita **suelo flotante con ΔLw** (3.1.2.3.5 pto 2). Ese suelo está en la vivienda de arriba, que no se toca.
   - **La opción simplificada no da solución:** todas sus filas piden ΔLw del suelo flotante.
   - **Vías:** opción general (el techo suspendido entra como «ΔLd,w», ec. 3.22), ensayo in situ o flexibilidad. Es la que la Guía describe para «cuando la intervención sólo pueda realizarse por el interior de la vivienda generada». (K-INT.10 a K-INT.13)
5. **DB-SI 4:** el interior de la vivienda **no es origen de evacuación**: no le corresponde extintor propio. Las instalaciones existentes (extintor del portal, BIE y detección del garaje) solo se adecuan si la reforma del portal afecta a sus soportes o recorridos (criterio 10). (K-INT.14, K-INT.15)
6. **HS 4 y HS 5 no tienen nada específico de existentes**, salvo el ámbito 1.1 y una recomendación de filtro (HS 4 5.1.4 pto 2).
   - El DB-HS consolidado **no tiene tabla de reserva de espacio para la batería** de contadores: el 4.1 solo trata el contador general.
   - La comprobación de los tramos existentes sale del método general de dimensionado: HS 4 4.2.1 pto 2 a; HS 5 tablas 4.4 y 4.5. (K-INT.16, K-INT.17)
7. **REBT:**
   - El art. 2.2 b limita la aplicación a la parte ampliada.
   - La ITC-BT-15 obliga a dejar **tubos de reserva** para ampliaciones (uno por cada 10 derivaciones, y uno por cada 50 m² en locales sin partición definida): es lo que permite llevar la derivación nueva.
   - La ITC-BT-16 no tiene «módulo de reserva» para viviendas (solo el de recarga de VE de la ITC-BT-52).
   - Documento: **memoria técnica de diseño** (ITC-BT-04 ap. 4), marcada «A (Ampliación-Reforma)» en el modelo de la Guía BT-04. (K-INT.18, K-INT.19)

---

## Bloque 1 — DB-HS 6 en el edificio existente

### K-INT.1 — Ámbito de HS 6 en el caso tipo

**Pregunta.** ¿A qué parte del edificio se aplica HS 6 cuando parte del local de PB pasa a vivienda en un municipio de zona II?

**Respuesta.** Solo a la **zona que cambia de uso** (la vivienda nueva, 90 m²). No se aplica:
- al resto del local, que no cambia de uso ni se reforma en sus cerramientos en contacto con el terreno;
- al garaje, que es local no habitable;
- a las viviendas de las plantas altas.

El **portal** reformado entra solo si la reforma modifica su suelo en contacto con el terreno (b iii).

**Cita.** DB-HS, HS 6 ap. 1, [HS22] p. 138, **VERIFICADO (imagen)**:
> «b) intervenciones en edificios existentes: i) en ampliaciones, a la parte nueva; ii) en cambio de uso, a todo el edificio si se trata de un cambio de uso característico o a la zona afectada, si se trata de un cambio de uso que afecta únicamente a parte de un edificio o de un establecimiento; iii) en obras de reforma, a la zona afectada, cuando se realicen modificaciones que permitan aumentar la protección frente al radón o alteren la protección inicial.»
> «2 Esta sección no será de aplicación en los siguientes casos: a) en *locales no habitables*, por ser recintos con bajo tiempo de permanencia; […]»

Terminología, [HS22] p. 144, **VERIFICADO (texto)**: «Se consideran locales no habitables dentro del ámbito de aplicación de esta sección, los garajes, trasteros y cuartos técnicos.»

Comentario, [DccHS] p. 146, **LEÍDO (comentario)**: «si existen zonas puntuales en contacto con el terreno (como por ejemplo los portales de acceso), esa parte en contacto con el terreno es susceptible de servir de vía de entrada al radón y deberá ser protegida.» (El comentario está en el contexto de la exclusión del pto 2 b.)

**Grado:**
- Ámbito: VERIFICADO (imagen).
- Portal: INTERPRETACIÓN apoyada en el comentario.

**Consecuencia para la app.** HS 6 → `aplica_reformado`, limitado a la zona que cambia de uso. Si el portal reformado actúa sobre su solera, se añade al alcance. Párrafo:
> «DB-HS 6 Protección frente a la exposición al radón. El municipio está incluido en la zona II del apéndice B. La intervención es un cambio de uso que afecta únicamente a parte del edificio, por lo que la sección se aplica a la zona afectada: la vivienda de nueva implantación en planta baja, cuyo suelo apoya sobre solera en contacto con el terreno (HS 6 ap. 1 pto 1 b ii). No se aplica al resto del local, que mantiene su uso y no se reforma, al garaje, que es local no habitable (ap. 1 pto 2 a), ni a las viviendas de las plantas superiores, que no están en contacto con el terreno.»

---

### K-INT.2 — HS 6 ap. 3 pto 3: soluciones alternativas en edificios existentes

**Pregunta.** Texto literal del ap. 3 pto 3.

**Respuesta.** En existentes, las soluciones de zona I y II se pueden **ajustar** con soluciones alternativas que, **en conjunto**, limiten adecuadamente la entrada de radón. Hay una condición sin excepción: ventilación interior reglamentaria (HS 3).

**Cita.** HS 6 ap. 3 pto 3, [HS22] p. 139, **VERIFICADO (texto)**:
> «En el caso de intervenciones en edificios existentes, la aplicación de las soluciones anteriores podrá ajustarse mediante la utilización de soluciones alternativas que, en conjunto, permitan limitar adecuadamente la entrada de radón. En todo caso es necesario que los locales habitables dispongan de un nivel de ventilación interior que cumpla con la reglamentación en vigor de calidad del aire.»

Texto idéntico en [DccHS] p. 148.

Las «soluciones anteriores» son las del pto 1. Su encabezado ya admite equivalentes: «deberán implementarse las siguientes soluciones, u otras que proporcionen un nivel de protección análogo o superior» ([HS22] p. 138, **VERIFICADO (imagen)**).

**Grado:** VERIFICADO (texto); encabezado del pto 1, VERIFICADO (imagen).

**Consecuencia para la app.** Se cita siempre junto a la solución elegida y enlaza con HS 3 de la vivienda. Frase fija:
> «En aplicación del ap. 3 pto 3, la solución se ajusta a las condiciones del edificio existente; los locales habitables de la vivienda disponen de la ventilación interior exigida por la Sección HS 3 (apartado [n] de esta memoria).»

---

### K-INT.3 — HS 6 ap. 3.1.1 pto 4: la solera existente como barrera

**Pregunta.** Texto literal del 3.1.1 pto 4 y qué queda exigido.

**Respuesta.** Si no se puede colocar una barrera con las características del 3.1.1, **los cerramientos existentes entre el terreno y los locales habitables funcionan como barrera**. Para eso hay que:
- sellar cuidadosamente sus grietas y juntas;
- cumplir al menos las letras b) y c) del pto 3:
  - b) sellar los encuentros con los elementos que la interrumpan;
  - c) puertas que interrumpan la barrera, estancas y con cierre automático.

**Cita.** HS 6 ap. 3.1.1, [HS22] p. 139, **VERIFICADO (texto)**:
> pto 4: «En intervenciones en edificios existentes, si no es posible la colocación de una barrera con las características indicadas en este apartado, los cerramientos situados entre el terreno y los locales habitables deberán funcionar como una barrera. Para ello se sellarán cuidadosamente las grietas y juntas de estos cerramientos y se cumplirá, al menos, con lo establecido en las letras b) y c) del párrafo anterior.»
> pto 3 b): «tener sellados los encuentros con los elementos que la interrumpan, como pasos de conducciones o similares;»
> pto 3 c): «las puertas de comunicación que interrumpan la continuidad de la barrera deberán ser estancas y estar dotadas de un mecanismo de cierre automático;»

Comentarios, **LEÍDO (comentario)**:
- [DccHS] p. 148: «La barrera de protección puede estar constituída por una lámina o por un elemento másico, como por ejemplo hormigón, siempre y cuando cumpla las condiciones descritas a continuación y su dimensionado se realice según el apartado 3.1.2.»
- [DccHS] p. 146: «Las operaciones de mantenimiento no se incluyen en el ámbito de aplicación del CTE, como por ejemplo el sellado de grietas y juntas de los cerramientos o el sellado de encuentros con elementos pasantes de los cerramientos […]»

**Grado:**
- Literal: VERIFICADO (texto).
- Lectura «la solera cuenta como barrera»: es el sentido literal del pto 4.
- **INTERPRETACIÓN:** el pto 4 no exime de la «barrera» en sentido funcional; solo de sus características 3.1.1 (lámina ≥ 2 mm, D < 10⁻¹¹ m²/s, continuidad, durabilidad).

**Consecuencia para la app.** Es la opción de mínimo para la barrera. En zona II **no basta sola**: el pto 1 b) pide barrera **junto con** un sistema adicional (K-INT.7). Párrafo (si se elige):
> «Barrera de protección: al no ser posible disponer una barrera con las características del ap. 3.1.1 bajo la solera existente, la propia solera funciona como barrera. Se sellan cuidadosamente sus grietas y juntas, se sellan los encuentros con los pasos de conducciones y [no existen puertas que interrumpan la barrera / las puertas que la interrumpen son estancas y de cierre automático] (HS 6 ap. 3.1.1 pto 4 y pto 3 b y c).»

---

### K-INT.4 — HS 6 ap. 3.2 pto 6 y pto 7: cámara por el interior

**Pregunta.** Texto literal del 3.2 pto 6.

**Respuesta.** En existentes **sin cámara** se puede hacer una cámara que, sin las características generales del 3.2, **mejore** la protección:
- por el interior del cerramiento en contacto con el terreno;
- continua y sobre toda la superficie a proteger;
- comunicada con el exterior;
- con **altura o espesor de al menos 5 cm**.

La eficacia **se comprueba con mediciones posteriores** (pto 7). Si la ventilación natural no basta, extractores mecánicos, con boca de expulsión según HS 3 3.2.1, «excepto lo relativo a la disposición en cubierta, que se considera opcional» (pto 8).

**Cita.** HS 6 ap. 3.2, [HS22] pp. 140–141, **VERIFICADO (texto)**:
> pto 6: «En el caso de edificios existentes en los que no exista cámara de aire se podrá implementar una cámara que, aunque no tenga las mismas características de la cámara descrita anteriormente, mejore la protección frente al radón. En este caso la cámara podría construirse por el interior del cerramiento en contacto con el terreno, debiendo ser continua y abarcando toda la superficie a proteger. Además, deberá estar comunicada con el exterior y disponer de una altura o espesor de al menos 5 cm.»
> pto 7: «La eficacia de la solución se deberá comprobar experimentalmente con mediciones de concentración de radón posteriores a la intervención de acuerdo al apéndice C.»
> pto 8 (p. 141): «[…] se dispondrán extractores mecánicos. […] Las bocas de expulsión estarán situadas conforme a lo especificado en el apartado 3.2.1 del DB HS3, excepto lo relativo a la disposición en cubierta, que se considera opcional.»

Comentario, [DccHS] p. 150, **LEÍDO (comentario)**: «La eficacia del espacio de contención ventilado deberá comprobarse experimentalmente tanto para edificios de obra nueva como existentes. […] Si no se alcanzan las concentraciones deseadas, tras ajustarse el sistema deberá realizarse una nueva medición.» Y: «Los elementos de comunicación situados en un cerramiento que separe un espacio de contención de un local habitable, como puertas o trampillas, es conveniente que sean estancos y estén dotados de un mecanismo de cierre automático».

**Grado:**
- Literal: VERIFICADO (texto).
- **INTERPRETACIÓN:** un suelo técnico elevado y ventilado sobre la solera existente es una forma de construir esa cámara. El DB no pone el ejemplo.

**Consecuencia para la app.**
- Dato del proyectista: «altura de la cámara [mm]». Se comprueba ≥ 50 mm.
- Dos casillas: «continua sobre toda la superficie» y «comunicada con el exterior».
- Aviso fijo en «Antes de entregar» y en el pliego: «medición de radón posterior a la obra según el Apéndice C (HS 6 ap. 3.2 pto 7)».

---

### K-INT.5 — HS 6 ap. 3.3 pto 3 y pto 6: despresurización desde la solera o perimetral

**Pregunta.** Texto literal del 3.3 pto 3.

**Respuesta.** El pto 3 prevé el sistema **bajo el edificio, accediendo desde la solera o desde el exterior**. Si eso no es posible, **perimetral en el terreno exterior**. En los dos casos hace falta un **estudio específico** de la cimentación y de la circulación del aire bajo el edificio.

«Accediendo desde la solera» permite perforarla para disponer los puntos de captación, **sin levantarla** (INTERPRETACIÓN). La eficacia se comprueba con medición posterior (pto 6).

**Cita.** HS 6 ap. 3.3, [HS22] p. 141, **VERIFICADO (texto)**:
> pto 1: «El sistema de despresurización del terreno se configurará mediante una red de elementos de captación, formada por arquetas o tubos perforados instalada en una capa de relleno granular que favorezca la circulación del aire, situada bajo el edificio, conectada a un conducto de extracción y un sistema de extracción mecánica.»
> pto 2: «Las bocas de expulsión estarán situadas conforme a lo especificado en el apartado 3.2.1 del DB HS3. En el caso de que no fuera posible su disposición en cubierta se deberán cumplir al menos el resto de condiciones descritas en dicho apartado.»
> pto 3: «En el caso de intervenciones en edificios existentes, si no es posible la instalación del sistema bajo el edificio accediendo desde la solera o desde el exterior, se podrá instalar de forma perimetral en el terreno exterior junto al edificio. En cualquiera de estos casos será necesario un estudio específico de la cimentación y la circulación del aire bajo el edificio.»
> pto 6: «La eficacia del sistema se deberá comprobar experimentalmente con mediciones de concentración de radón posteriores a la intervención de acuerdo al apéndice C.»

Comentario, [DccHS] p. 150, **LEÍDO (comentario)**: «Para favorecer la efectividad del sistema es importante que el cerramiento en contacto con el terreno sea estanco. Dicha estanqueidad se consigue con la instalación de la barrera de protección indicada en el apartado 3.1 o, en caso de edificio existente en el que no sea posible su instalación, con el sellado exhaustivo de grietas, juntas y elementos de encuentro.»

**Grado:**
- Literal: VERIFICADO (texto).
- «Sin levantar la solera»: INTERPRETACIÓN de «accediendo desde la solera».

**Consecuencia para la app.**
- Con esta opción, la memoria cita el estudio específico como documento del proyecto: dato «referencia del estudio de cimentación y circulación del aire».
- Si falta, aviso en «Antes de entregar».
- La boca de expulsión reutiliza las comprobaciones de K-MEM.3 (HS 3 3.2.1).
- Se añade el aviso de medición posterior (pto 6).

---

### K-INT.6 — HS 6 ap. 3 pto 4: mediciones previas

**Pregunta.** ¿Puede una medición previa cambiar las soluciones exigidas?

**Respuesta.** Sí, en existentes:
- valores entre 1 y 2 veces el nivel de referencia (300–600 Bq/m³) → soluciones de **zona I**;
- más de 2 veces → **zona II**.

El comentario añade que si **ninguna** zona de muestreo supera el nivel de referencia, **no se exige** implantar soluciones. Esa conclusión no está en el articulado.

**Cita.**
- HS 6 ap. 3 pto 4, [HS22] p. 139, **VERIFICADO (texto)**: «En el caso de intervenciones en edificios existentes, cuando se disponga de valores medidos del promedio anual de concentración de radón, obtenidos según el apéndice C, y alguna de las zonas de muestreo establecidas conforme a dicho apéndice supere el nivel de referencia, se tendrá en cuenta lo siguiente: a) si se presentan valores comprendidos entre 1 y 2 veces el nivel de referencia, se adoptarán las soluciones correspondientes a municipios de zona I; b) si se presentan valores que superen 2 veces el nivel de referencia, se adoptarán las soluciones correspondientes a municipios de zona II.»
- Comentario, [DccHS] p. 148, **LEÍDO (comentario)**: «Cuando en los municipios de las zonas I o II del apéndice B se constate, de acuerdo con el apéndice C, que ninguna zona de muestreo presente valores del promedio anual de concentración de radón superiores al nivel de referencia, no se exigirá implementar soluciones de protección frente al radón.»
- Apéndice C ap. 2.1 pto 3 a), [HS22] p. 181, **VERIFICADO (texto)**: en cada unidad de uso, «una zona de muestreo por cada 200 m2 de superficie útil» y «una zona de muestreo por planta». Pto 4: «excepto en unidades de uso de superficie inferior a 200 m2 en los que se haya definido una única zona de muestreo, donde se instalarán al menos 2 detectores.» Las entidades de medida, acreditadas por ENAC según UNE-EN ISO/IEC 17025:2017 (ap. 3.1, p. 182).

**Grado:**
- Pto 4: VERIFICADO (texto).
- «No se exige si no supera»: LEÍDO (comentario).
- Medir el local antes del cambio de uso para el uso futuro: **INTERPRETACIÓN** (el DB habla de «intervenciones en edificios existentes», sin más precisión).

**Consecuencia para la app.** Pregunta opcional en HS 6 existente: «¿hay medición previa según el Apéndice C? [no / sí: valor máximo Bq/m³]».
- Con > 600 → zona II.
- Con 300–600 → zona I, aunque el municipio sea de zona II.
- Con ≤ 300 en todas las zonas → «no se exigen soluciones», con rótulo «criterio del comentario del Ministerio (DccHS 12-02-2025, p. 148), no reglamentario».

Datos del informe: entidad, fechas, número de detectores (≥ 2 en la vivienda de 90 m²).

---

### K-INT.7 — Vivienda en PB sobre solera existente, zona II: qué admite el DB y cómo se redacta. No empeoramiento

**Pregunta.** ¿Qué soluciones admite el DB sin levantar la solera? ¿Cómo se redacta? ¿Qué se dice del no empeoramiento?

**Respuesta.** En zona II la regla general es **barrera + sistema adicional** (espacio de contención ventilado **o** despresurización) (3 pto 1 b). Sin levantar la solera, el DB permite estas piezas:

| Pieza | Opción sin levantar la solera | Base |
|---|---|---|
| Barrera | (a) Lámina barrera **sobre** la solera existente, bajo el nuevo pavimento, con las condiciones del 3.1.1 (≥ 2 mm, D < 10⁻¹¹ m²/s, juntas y encuentros sellados, sin fisuras) | 3 pto 1 a) «entre el terreno y los locales habitables»; 3.1.1 ptos 1–3; 5.1.1 pto 1 («superficie limpia y uniforme»). La colocación sobre la solera es **INTERPRETACIÓN**: el DB solo exige que esté entre el terreno y los locales |
| | (b) Si (a) no es posible: la solera sellada funciona como barrera | 3.1.1 pto 4 (K-INT.3) |
| Sistema adicional | (c) Cámara ≥ 5 cm por el interior, continua, comunicada con el exterior (p. ej. suelo técnico ventilado) | 3.2 pto 6 (K-INT.4) |
| | (d) Despresurización accediendo desde la solera, o perimetral exterior, con estudio específico | 3.3 pto 3 (K-INT.5) |
| Ajuste del conjunto | (e) Soluciones alternativas que en conjunto limiten la entrada de radón, con la ventilación de HS 3 | 3 pto 3 (K-INT.2) |
| Rebaja por medición | (f) Medición previa: zona I o ninguna solución | 3 pto 4; comentario p. 148 (K-INT.6) |
| Comprobación | Medición posterior obligatoria con (c) y (d) | 3.2 pto 7; 3.3 pto 6 |

**No empeoramiento.** HS 6 **no tiene criterio propio**. El DB-HS no tiene criterios de existentes en su Introducción (`verificacion-reformas.md` B.6). Rige el art. 2.3, párrafo 4, de la Parte I, VERIFICADO (imagen) en sesión anterior: «En las intervenciones en los edificios existentes no se podrán reducir las condiciones preexistentes relacionadas con las exigencias básicas, cuando dichas condiciones sean menos exigentes que las establecidas en los documentos básicos […]». La única regla de HS 6 que mira la «protección inicial» es la de reformas: se aplica a la zona afectada cuando las obras «alteren la protección inicial» (ap. 1 pto 1 b iii). Ejemplo: perforar la solera del resto del local o del portal para pasar instalaciones.

**Grado:**
- Tabla: cada fila con su grado (texto o imagen; colocación de la lámina sobre la solera, INTERPRETACIÓN).
- No empeoramiento: VERIFICADO (imagen, Parte I) + INTERPRETACIÓN de su alcance a HS 6.

**Consecuencia para la app.** Selector «Solución HS 6 en existente» con las combinaciones válidas en zona II:
- (a) + (c);
- (a) + (d);
- (b) + (c);
- (b) + (d);
- solución alternativa (e), con texto libre;
- rebaja por medición (f).

**CUMPLE solo si** hay barrera y sistema adicional, o si la medición previa rebaja la zona. Párrafo modelo, (a) + (c):
> «DB-HS 6. Zona II. Se dispone una barrera de protección tipo lámina sobre la solera existente, bajo el nuevo pavimento, con coeficiente de difusión frente al radón inferior a 10⁻¹¹ m²/s y espesor no menor de 2 mm, con juntas, encuentros y pasos de conducciones sellados (HS 6 ap. 3.1.1 ptos 2 y 3). Como sistema adicional, al no existir cámara bajo la solera, se construye por el interior una cámara de aire de [h] mm (≥ 50 mm), continua bajo toda la superficie de la vivienda y comunicada con el exterior mediante [aberturas / extracción mecánica con boca de expulsión según HS 3 ap. 3.2.1] (HS 6 ap. 3.2 ptos 6 y 8). En aplicación del ap. 3 pto 3, la solución se ajusta a las condiciones del edificio existente; los locales habitables disponen de la ventilación interior exigida por HS 3. La eficacia de la solución se comprobará con mediciones de concentración de radón posteriores a la intervención según el apéndice C (ap. 3.2 pto 7), cuyo resultado se incorporará a la documentación final de la obra. La intervención no reduce las condiciones preexistentes de protección del resto del edificio (CTE Parte I, art. 2.3).»

---

## Bloque 2 — DB-SUA, Introducción III y SUA 8

### K-INT.8 — Criterios de aplicación de la Introducción III del DB-SUA (literal)

**Pregunta.** Texto literal de los criterios de la Introducción III aplicables al caso.

**Respuesta.** Los cuatro criterios numerados, cotejados en imagen:
- el **2** rige la vivienda nueva (cambio de uso parcial);
- el **3** y el **4** rigen el portal (reforma con el mismo uso).

**Cita.** DB-SUA, Introducción III, [SUA22] p. 5, **VERIFICADO (imagen, esta sesión)**:
> «A efectos de este DB deben tenerse en cuenta los siguientes criterios de aplicación:
> 1 Los edificios o zonas cuyo uso previsto no se encuentre entre los definidos en el Anejo SUA A de este DB deberán cumplir, salvo indicación en otro sentido, las condiciones particulares del uso al que mejor puedan asimilarse.
> 2 Cuando un cambio de uso afecte únicamente a parte de un edificio o cuando se realice una ampliación a un edificio existente, este DB deberá aplicarse a dicha parte, y disponer cuando sea exigible según la Sección SUA 9, al menos un *itinerario accesible* que la comunique con la vía pública.
> 3 En obras de reforma en las que se mantenga el uso, este DB debe aplicarse a los elementos del edificio modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones de seguridad de utilización y accesibilidad establecidas en este DB.
> 4 En todo caso, las obras de reforma no podrán menoscabar las condiciones de seguridad de utilización y accesibilidad preexistentes, cuando éstas sean menos estrictas que las contempladas en este DB.»

Comentario, [DccSUA] p. 9, **VERIFICADO (imagen, esta sesión)**, «Adecuación efectiva y no empeoramiento en cambios de uso en edificios existentes»: «Cuando no sea viable alcanzar las condiciones del DB en cambios de uso, parece razonable el favorecer o, al menos, no penalizar los cambios de uso que supongan una disminución del nivel de riesgo o de los requisitos exigibles de accesibilidad. […] se podría adoptar el criterio de flexibilidad en casos como los siguientes: […] cuando se convierta un local comercial situado en un edificio de viviendas en vivienda.» Es **LEÍDO (comentario)**: no reglamentario.

**Grado:** VERIFICADO (imagen).

**Consecuencia para la app.** Ya cubierto por D.3 de `verificacion-reformas.md` (criterios 2 a 4). Se añade la frase del comentario como nota opcional en las secciones donde el proyectista marque flexibilidad, con su rótulo.

---

### K-INT.9 — SUA 8 en el cambio de uso parcial de local a vivienda

**Pregunta.** La parte que cambia pasa de Comercial (C4 = 3) a vivienda (C4 = 1), y el resto del edificio sigue teniendo local. ¿Obliga a evaluar SUA 8 o basta decir que el cambio no aumenta el riesgo?

**Respuesta.**
1. **C4 es un coeficiente del uso del edificio**, no de la parte. La tabla 1.4 lo llama «coeficiente en función del uso del edificio». Con un edificio de varios usos, el comentario manda tomar el más desfavorable. Como el resto del local sigue siendo Comercial, **C4 sigue siendo 3** después de la obra.
2. **Ne no cambia**: no cambian la planta, la altura ni el entorno. **C2, C3 y C5 tampoco.** Por tanto **Na y E son los mismos que antes** y la evaluación da el mismo resultado que la situación preexistente.
3. Si el local desapareciera entero, C4 bajaría a 1 y Na se triplicaría. La necesidad de protección solo puede **bajar**: un cambio de Comercial a vivienda nunca aumenta lo exigido por SUA 8.
4. **INTERPRETACIÓN:**
   - El criterio 2 manda aplicar el DB «a dicha parte». SUA 8 es una evaluación del edificio, que no se puede hacer «a una parte». Lo que el cambio de uso puede alterar es el C4, y aquí no lo altera.
   - **Basta dejar escrito** que la intervención no modifica ninguno de los parámetros de la evaluación (o que solo puede disminuir la exigencia), **con la cita de la tabla 1.4 y del comentario**.
   - El cálculo completo no es exigible por el cambio de uso. Es una comprobación opcional, porque su resultado es el preexistente. Si el edificio existente no tiene pararrayos y el cálculo diera nivel 1 a 3, esa necesidad **viene del edificio, no del cambio de uso**: el criterio 2 no obliga a instalarla.
   - La retirada de una instalación existente sí la prohíbe el criterio 4, por no empeoramiento.

**Cita.**
- SUA 8 ap. 1 pto 4 y tabla 1.4, [SUA22] p. 29, **VERIFICADO (imagen, esta sesión)**: «C4 coeficiente en función del uso del edificio, conforme a la tabla 1.4;» · Tabla 1.4 «Coeficiente C4»: «Edificios no ocupados normalmente 0,5 · *Usos Pública Concurrencia, Sanitario, Comercial, Docente* 3 · Resto de edificios 1». Fórmula (1.2): «Na = 5,5 / (C2C3C4C5) · 10⁻³».
- SUA 8 ap. 1 pto 1, [SUA22] p. 28, **VERIFICADO** (`verificacion-sua6-sua8.md` C3.1): «Será necesaria la instalación de un sistema de protección contra el rayo, en los términos que se establecen en el apartado 2, cuando la frecuencia esperada de impactos Ne sea mayor que el riesgo admisible Na.»
- Comentario, [DccSUA] p. 51, **VERIFICADO (imagen, esta sesión)** como lectura, **LEÍDO (comentario)** como grado: «La sección SUA 8 establece un análisis de riesgo simplificado para evaluar si es o no necesaria la instalación de un pararrayos en un edificio. Por lo tanto, para el análisis de la evaluación del riesgo de un edificio con elementos híbridos (construidos con estructuras de distintos tipos, que contengan distintos usos, etc.) hay que acogerse al coeficiente más desfavorable.»
- Introducción III, criterios 2 y 4: K-INT.8.

**Grado:**
- Tabla y fórmula: VERIFICADO (imagen).
- Coeficiente más desfavorable: LEÍDO (comentario).
- «Basta con declararlo» y «la necesidad preexistente no la impone el cambio de uso»: **INTERPRETACIÓN**.

**Consecuencia para la app.**
- **Cambia K-REF.11.** CUp → nuevo estado `no_aplica_sin_variacion` («la intervención no modifica la evaluación»), con cálculo opcional. Se mantiene `aplica` si la intervención cambia dimensiones (ampliación) o si el cambio de uso **sube** el C4 (p. ej. vivienda → comercial) o el C3/C5.
- Regla: `C4_despues = max(C4 de los usos del edificio tras la obra)`; si `C4_despues ≤ C4_antes` y no cambian Ae, C1, C2, C3 ni C5 → párrafo de «sin variación».

Párrafo:
> «SUA 8 Seguridad frente al riesgo causado por la acción del rayo. La intervención no modifica las dimensiones del edificio ni su entorno, por lo que la frecuencia esperada de impactos Ne no varía. El coeficiente C4 depende del uso del edificio (SUA 8 ap. 1 pto 4, tabla 1.4); como el edificio conserva en planta baja un local de uso Comercial, se mantiene el coeficiente más desfavorable, C4 = 3, y el riesgo admisible Na no varía. La evaluación del ap. 1 es, por tanto, la del edificio preexistente, y el cambio de uso no aumenta la exigencia de protección. No se actúa sobre ninguna instalación de protección contra el rayo existente (DB-SUA, Introducción III, criterio 4).»

Rótulo en la ficha: «el criterio del coeficiente más desfavorable es del comentario del Ministerio (DccSUA 15-07-2024, p. 51), no reglamentario».

---

## Bloque 3 — DB-HR en el cambio de uso de local a vivienda

### K-INT.10 — Exigencias que afectan a la vivienda nueva

**Pregunta.** ¿Qué exigencias de ruido aéreo y de impactos afectan al forjado con la vivienda de arriba y a la separación con el resto del local?

**Respuesta.**
- **Aplicabilidad:** el DB-HR excluye «ampliación, modificación, reforma o rehabilitación» en existentes salvo la rehabilitación integral. **No nombra el cambio de uso.** La Guía recomienda aplicarlo en los cambios de uso a vivienda. Criterio de producto vigente (K-REF.4): CUp a vivienda → `aplica_reformado`.
- **Exigencias sobre la vivienda nueva:**

| Par de recintos | Ruido aéreo | Impactos | Base |
|---|---|---|---|
| Protegido de la vivienda nueva ↔ recintos de la vivienda de arriba (otra unidad de uso) | DnT,A ≥ 50 dBA. Habitables: ≥ 45 dBA | En los protegidos de la vivienda **nueva** (abajo): L'nT,w ≤ 65 dB por impactos generados **arriba** | 2.1.1 a ii, b ii; 2.1.2 a i |
| Protegido de la vivienda de arriba ↔ vivienda nueva | DnT,A ≥ 50 dBA (antes ≥ 55, con el local debajo) | **Sin exigencia** (impactos hacia el recinto superior) | 2.1.1 a ii; comentario |
| Vivienda nueva ↔ resto del local (recinto de actividad, colindante horizontalmente) | Protegidos DnT,A ≥ 55 dBA; habitables ≥ 45 dBA (con puertas: puerta RA ≥ 30 y cerramiento RA ≥ 50). Ningún recinto de actividad puede tener puertas a recintos protegidos | Protegidos **y** habitables: L'nT,w ≤ 60 dB | 2.1.1 a iii, b iii; 2.1.2 a ii, b i |

**Cita.**
- DB-HR ap. 2.1.1 y 2.1.2, [HR19] pp. 8–10, **VERIFICADO (imagen)** (`verificacion-hr.md` C.2, C.3, C.6, C.7, C.15, C.17, C.18):
  - a ii: «El aislamiento acústico a ruido aéreo, DnT,A, entre un recinto protegido y cualquier otro recinto habitable o protegido del edificio no perteneciente a la misma unidad de uso y que no sea recinto de instalaciones o de actividad, colindante vertical u horizontalmente con él, no será menor que 50 dBA […]»
  - a iii: «[…] entre un recinto protegido y un recinto de instalaciones o un recinto de actividad, colindante vertical u horizontalmente con él, no será menor que 55 dBA.»
  - 2.1.2 a i: «El nivel global de presión de ruido de impactos, L'nT,w, en un recinto protegido colindante vertical, horizontalmente o que tenga una arista horizontal común con cualquier otro recinto habitable o protegido del edificio, no perteneciente a la misma unidad de uso y que no sea recinto de instalaciones o de actividad, no será mayor que 65 dB.»
  - a ii y b i: «[…] con un recinto de actividad o con un recinto de instalaciones no será mayor que 60 dB.»
- Guía DB-HR, tabla 2.1.2.2 nota (III), [GuíaHR] p. 36, **LEÍDO (Guía, imagen)**: «Un recinto de instalaciones o de actividad no puede tener puertas que den acceso directamente a los recintos protegidos del edificio.»
- Guía DB-HR, [GuíaHR] p. 23, **LEÍDO (Guía, imagen)**: «si en un edificio de viviendas existieran locales comerciales, deberían aislarse las viviendas de los locales. Éstos se consideran recintos de actividad […] y se aplicarían las exigencias de aislamiento acústico a ruido aéreo entre recintos, DnT,A ≥ 55 dBA, así como el nivel de presión de ruido de impactos, L'nT,w, ≤ 60 dB.»
- Impactos hacia arriba, [GuíaHR] p. 79, **LEÍDO (Guía, imagen)**: «Tanto en la opción simplificada, como en la general, no se contempla la transmisión de ruido de impactos entre un recinto y otro recinto situado encima del emisor.» (Igual en [DccHR] p. 14, `verificacion-hr.md` C.19.)

**Grado:**
- Valores: VERIFICADO (imagen).
- Aplicabilidad del DB-HR al cambio de uso parcial: INTERPRETACIÓN / CRITERIO (K-REF.4).

**Consecuencia para la app.** El módulo HR en existente pinta solo los **pares de recintos con la vivienda nueva**:
- forjado superior: dos sentidos, impactos solo hacia abajo;
- separación con el local: aéreo e impactos.

Fachada (tabla 2.1/3.4) si se sustituye el escaparate. El resto del edificio, sin fila. La subida o bajada de exigencia se escribe explícita: con la vivienda de arriba, de 55 a 50 dBA; impactos, de «sin exigencia» a 65 dB hacia la vivienda nueva.

---

### K-INT.11 — El forjado con la vivienda de arriba: tabla 3.3 y el suelo flotante que no se puede tocar

**Pregunta.** ¿Qué pide la opción simplificada (forjado, suelo flotante, techo suspendido) en ese forjado? ¿Qué pasa si el suelo flotante de la vivienda de arriba no se puede tocar?

**Respuesta.**
1. **La situación cambia de fila de la tabla 3.3.**
   - **Antes** (local = recinto de actividad debajo de la vivienda): pto 3 de 3.1.2.3.5. Solo combinación de suelo flotante y techo suspendido con el **ΔRA entre paréntesis**; el ΔLw no se exige en ese forjado. La Guía: «no es preciso proteger el recinto de instalaciones respecto al ruido de impactos procedente de la vivienda».
   - **Ahora:** el forjado «delimita superiormente una unidad de uso» (la vivienda nueva) → pto 2: **suelo flotante con ΔLw y ΔRA** y, en su caso, techo suspendido, con la fila **sin paréntesis**.
2. **En la opción simplificada el ΔLw solo lo da un suelo flotante en el recinto emisor** (la vivienda de arriba). Todas las filas «normales» de la tabla 3.3 piden ΔLw de 9 a 26 dB. El techo suspendido solo aporta ΔRA. **Si el suelo de la vivienda de arriba no se puede tocar, la opción simplificada no se puede cumplir para impactos**, salvo que el suelo existente ya sea flotante y se conozcan su ΔLw y ΔRA.
3. **Ruido aéreo:** sí se puede resolver desde abajo con el techo suspendido de la vivienda nueva, siempre que haya en la celda una combinación (ΔRA Sf ; ΔRA Ts) cuyo ΔRA del suelo sea 0 o el del suelo existente. Ejemplo, forjado 300/52, tabiquería de la vivienda nueva de fábrica con apoyo directo: combinaciones (3;15), (8;5), (9;4) y **ΔLw 18**. Ninguna tiene ΔRA de suelo 0, y todas piden el ΔLw. Con el forjado 350/54 en la misma columna: (0;12), es decir, **techo de ΔRA ≥ 12 dBA sin mejora del suelo, pero con ΔLw 16**. La celda depende siempre de la **tabiquería del recinto receptor** (`verificacion-hr.md` H.12).
4. **Vías para impactos:**
   - (a) acreditar el suelo existente de la vivienda de arriba (ensayo o documentación);
   - (b) **opción general** (3.1.3.6.1): el techo suspendido entra en la transmisión directa como «reducción del nivel global de presión de ruido de impactos por revestimiento del lado de la recepción (p.e. techos suspendidos)». **No corta** las transmisiones por flancos (muros);
   - (c) ensayo in situ después de la obra (L'nT,w), que la Guía presenta como herramienta, no obligación;
   - (d) **flexibilidad** de la Parte I art. 2.3, con las palabras de la Guía para este caso (K-INT.13).

**Cita.**
- DB-HR 3.1.2.3.5, [HR19] pp. 18–19, **VERIFICADO (imagen)** (`verificacion-hr.md` H.1–H.3):
  - pto 2: «Los forjados que delimitan superiormente una unidad de uso deben disponer de un suelo flotante y, en su caso, de un techo suspendido con los que se cumplan los valores de mejora del índice global de reducción acústica, ponderado A, ΔRA y de reducción del nivel global de presión de ruido de impactos, ΔLw especificados en la tabla 3.3.»
  - pto 3: «Los forjados que delimitan inferiormente una unidad de uso y la separan de cualquier otro recinto del edificio deben disponer de una combinación de suelo flotante y techo suspendido con los que se cumplan los valores de mejora del índice global de reducción acústica, ponderado A, ΔRA.»
- Tabla 3.3, forjados 300 y 350, columna «apoyo directo», [HR19] p. 21, **VERIFICADO (imagen)** (`verificacion-hr.md` bloque H): 300/52 «18 · (3;15) (8;5) (9;4)»; 350/54 «16 · (0;12) (1;8) (2;5) (8;1) (12;0)».
- Guía DB-HR, [GuíaHR] p. 40, **LEÍDO (Guía, imagen)**: «3 El modo de aislar a ruido de impacto un recinto consiste en actuar sobre el forjado donde se van a producir los impactos. Si se trata de una transmisión de ruido de impactos entre recintos superpuestos, debe actuarse en el forjado superior […]» · «La manera más efectiva de aislar el ruido de impactos es la de emplear suelos flotantes».
- Guía DB-HR, [GuíaHR] p. 79, **LEÍDO (Guía, imagen)**: «Los suelos flotantes con el valor de ΔLw requerido deben instalarse en el forjado que delimita superioramente una unidad de uso […]» · «En los forjados que delimitan inferiormente una unidad de uso, no es necesario cumplir los valores de ΔLw, ya que en el recinto inferior no existe exigencia de aislamiento acústico a ruido de impactos.»
- Guía DB-HR, [GuíaHR] p. 81, **LEÍDO (Guía, imagen)**, local bajo viviendas: «el elemento de separación horizontal debe tener un aislamiento acústico a ruido aéreo DnT,A ≥ 55 dBA, pero no es preciso proteger el recinto de instalaciones respecto al ruido de impactos procedente de la vivienda.»
- DB-HR opción general 3.1.3.6.1 pto 2, ec. (3.22), [HR19] p. 31 (folio HR-25), **VERIFICADO (texto)**: transmisión directa «Ln,w,d = Ln,w − ΔLw − ΔLd,w», siendo «ΔLw reducción del nivel global de presión de ruido de impactos por revestimiento del lado de la emisión, (p.e. suelos flotantes), [dB]; ΔLd,w reducción del nivel global de presión de ruido de impactos por revestimiento del lado de la recepción, (p.e. techos suspendidos), [dB].» El volcado de texto pierde los símbolos Δ: **cotejar en imagen antes de imprimir la fórmula**.

**Grado:**
- DB: VERIFICADO (imagen); ec. 3.22, VERIFICADO (texto).
- Guía: LEÍDO (Guía, imagen).
- «La simplificada no se puede cumplir sin actuar arriba»: INTERPRETACIÓN, directa de la tabla.

**Consecuencia para la app.**
- La fila del forjado superior de la vivienda nueva pide: forjado (m, RA), tabiquería del receptor, suelo flotante existente arriba [desconocido / conocido: ΔLw, ΔRA] y techo suspendido nuevo (ΔRA).
- **Aéreo:** se comprueba con la tabla 3.3 tomando el ΔRA del suelo existente (0 si es desconocido).
- **Impactos:**
  - con suelo arriba desconocido o sin ΔLw → estado **«no justificable en opción simplificada»** (no un NO CUMPLE seco);
  - salidas: (b) opción general, `externo`; (c) ensayo in situ; (d) flexibilidad, párrafo de K-INT.13.
- Párrafo (aéreo):
  > «Forjado entre la vivienda y la vivienda superior existente: forjado [tipo], m = [..] kg/m², RA = [..] dBA; en la vivienda se dispone techo suspendido de ΔRA = [..] dBA; el suelo de la vivienda superior no es objeto de la intervención [y se toma ΔRA = 0]. Con tabiquería [tipo] en el recinto receptor, la combinación (ΔRA suelo ; ΔRA techo) = ([..] ; [..]) cumple la tabla 3.3 (DB-HR ap. 3.1.2.3.5 ptos 2 y 3). CUMPLE en lo relativo a ruido aéreo.»

---

### K-INT.12 — Separación vertical con el resto del local (tabla 3.2) y los impactos que llegan desde el local

**Pregunta.** ¿Qué pide la tabla 3.2 para la separación con el recinto de actividad, y qué pasa con los impactos que llegan desde el local?

**Respuesta.**
1. **La partición entre la vivienda y el resto del local es nueva**: se proyecta entera con los **valores entre paréntesis** de la tabla 3.2.
2. **Trasdosado:** el tipo 1 se trasdosa **por las dos caras**. La cara del local queda fuera de la intervención. Si no se puede trasdosar por esa cara y la transmisión es principalmente directa, se admite **una sola cara con +4 dBA** sobre el ΔRA de la tabla.

   Filas con paréntesis que no piden actuar en el local:
   - tipo 1, 300/52, columna fábrica: «(9)», sin nota, con forjado ≥ 300 → una cara, ≥ 13 dBA;
   - tipo 1, 250/51 y 300/52, columna entramado: «(8)⁽¹³⁾», con forjado ≥ 175;
   - tipo 1, 400/57: «(6)⁽¹³⁾»;
   - tipo 3 (60)/(68): nota 10, forjado de masa > 400 kg/m².

   No sirven aquí:
   - las celdas con nota (11): piden suelo flotante en emisor y receptor;
   - el tipo 3 (52)/(64), nota 9: pide suelo flotante y techo suspendido **en el recinto de actividad**;
   - el tipo 2 (200)/(61), nota 6: pide bandas en la tabiquería del recinto de actividad y del protegido superior.
3. **Impactos desde el local** (L'nT,w ≤ 60 dB en protegidos y habitables, colindancia horizontal): en simplificada se resuelven con **suelo flotante en el suelo del recinto de actividad** (pto 4, ΔLw entre paréntesis). El suelo del local es una solera y queda fuera de la intervención.
   - **INTERPRETACIÓN:** la Guía equipara «forjado o losa». Sobre una solera continua apoyada en el terreno hay transmisión por flancos que la tabla no modela.
   - Salidas: actuar en el suelo del local (si la propiedad lo permite), opción general o flexibilidad.

**Cita.**
- DB-HR 3.1.2.3.4 pto 2, [HR19] p. 14, **VERIFICADO (imagen)** (`verificacion-hr.md` G.1): «En el caso de elementos de separación verticales de tipo 1, el *trasdosado* debe aplicarse por ambas caras del elemento constructivo base. Si no fuera posible trasdosar por ambas caras y la transmisión de ruido se produjera principalmente a través del elemento de separación vertical, podrá trasdosarse el elemento constructivo base solamente por una cara, incrementándose en 4 dBA la mejora ΔRA del *trasdosado* especificada en la tabla 3.2.»
- Tabla 3.2 y notas (6), (9), (10), (11), (13), [HR19] pp. 17–18, **VERIFICADO (imagen)** (`verificacion-hr.md` G).
- DB-HR 3.1.2.3.5 pto 4, [HR19] p. 19, **VERIFICADO (imagen)** (H.3): «[…] en el forjado de cualquier *recinto de instalaciones* o de *actividad* que sea colindante horizontalmente con un *recinto protegido* o *habitable* del edificio o con una arista horizontal común con los mismos, debe disponerse de un *suelo flotante* cuya reducción del nivel global de presión de ruido de impactos, ΔLw, sea la especificada en la tabla 3.3.»
- Guía DB-HR, [GuíaHR] p. 40, nota 12, **LEÍDO (Guía, imagen)**: «Forjado o losa.» · p. 44: el trasdosado por una cara se admite «por ejemplo, en el caso de cajas de escaleras»; «Este incremento sobre la mejora del índice de reducción acústica podrá ser menor que 4 dBA, siempre que esté avalada por estudios específicos, ensayos, etc.»

**Grado:**
- DB: VERIFICADO (imagen).
- Selección de filas: INTERPRETACIÓN sobre la tabla verificada.
- Solera: INTERPRETACIÓN.

**Consecuencia para la app.**
- La fila «separación con el local» usa los valores entre paréntesis y la casilla «trasdosado solo por la cara de la vivienda (+4 dBA)».
- Avisos automáticos:
  - si la celda elegida lleva notas (6), (9) u (11): «la solución exige actuar en el recinto de actividad, que no es objeto de la intervención»;
  - impactos desde el local: «suelo flotante en el local» o, si no se interviene en él, «no justificable en opción simplificada» → opción general o flexibilidad (K-INT.13).
- Párrafo (aéreo):
  > «Separación con el local colindante (recinto de actividad): elemento de tipo 1, base [..] (m = [..] kg/m², RA = [..] dBA), con trasdosado de ΔRA = [..] dBA solo por la cara de la vivienda, al quedar el local fuera de la intervención; la mejora exigida se incrementa en 4 dBA (DB-HR ap. 3.1.2.3.4 pto 2, tabla 3.2, valores entre paréntesis). La partición no tiene puertas entre el local y la vivienda. CUMPLE en lo relativo a ruido aéreo.»

---

### K-INT.13 — La Guía DB-HR sobre cambios de uso y flexibilidad, y cómo se redacta

**Pregunta.** ¿Qué dice la Guía sobre cambios de uso y flexibilidad, en particular sobre el techo suspendido en la vivienda nueva y los impactos?

**Respuesta.**
- La Guía trata el cambio de uso a vivienda como **recomendación** («es conveniente aplicar»).
- Prevé expresamente el caso en que la intervención **solo puede hacerse por el interior de la vivienda generada**: se adoptan «las soluciones que permitan mejorar las prestaciones acústicas del edificio en la medida de lo posible», siempre que la vivienda no colinde con un recinto ruidoso.
- **No dice nada específico del techo suspendido frente a impactos.** El efecto del techo en impactos solo aparece en la opción general del DB (ΔLd,w, K-INT.11).
- Añade que los **ensayos in situ** permiten evaluar el aislamiento antes y después de la intervención, aunque no sean obligatorios.

**Cita.** [GuíaHR], **LEÍDO (Guía, imagen, esta sesión)**:
- p. 19, 2.0.2: «En lo relativo a intervenciones sobre edificios existentes, no será de aplicación el DB HR salvo cuando se trate de rehabilitación integral. […] Sin embargo, el objetivo lógico de toda intervención en los edificios existentes debe ser la mejora progresiva de las condiciones de la edificación para adaptarla a estándares de calidad actuales.»
- p. 21, «Cambios de uso»: «Si en cambio se produce un cambio de uso parcial, es decir, si es una parte del edificio la que cambia de uso, deberían tenerse en cuenta las siguientes recomendaciones para proteger a los usuarios de los edificios: a) Siempre que se generen recintos de actividad y/o instalaciones colindantes con unidades de uso, es conveniente el cumplimiento del DB HR. […] b) En los cambios de uso a vivienda, es conveniente aplicar las exigencias del DB HR. Pueden existir algunas limitaciones técnicas para conseguir la adecuación de los elementos constructivos a las exigencias del DB HR, como por ejemplo, cuando la intervención sólo pueda realizarse por el interior de la vivienda generada. En estos casos se recomienda que se adopten las soluciones que permitan mejorar las prestaciones acústicas del edificio en la medida de lo posible, siempre que la vivienda no colinde con un recinto ruidoso.»
- p. 21: «A pesar de que en el punto 5.3 del DB HR no se establece la obligatoriedad de realizar ensayos in situ, los ensayos de aislamiento acústico in situ son una herramienta que permite evaluar el aislamiento acústico en el estado previo a la intervención y en el estado reformado.»
- p. 20 (reformas parciales): «El DB HR puede aplicarse a aquéllos elementos constructivos que se modifiquen, sustituyan o incorporen, siempre que la intervención consiga una mejora efectiva de las condiciones de protección frente al ruido, es decir, que se puedan alcanzar o aproximarse a los niveles exigidos.» (**No citar** la lista a)–d) de esa página: su letra b) tiene una errata, «suponga» por «no suponga»; `verificacion-reformas.md` C.40.)
- Recinto ruidoso, nota 1 de p. 21: «mayor que 80 dBA». El local de uso Comercial se trata como recinto de actividad (p. 23, K-INT.10).

CTE Parte I art. 2.3, párrafos 2 y 3 (flexibilidad y constancia en la documentación final), [PI22] p. 5, **VERIFICADO (imagen)**, `verificacion-reformas.md` A.4–A.5.

**Grado:** LEÍDO (Guía, imagen). La flexibilidad se apoya en la Parte I: VERIFICADO (imagen).

**Consecuencia para la app.** Salida «flexibilidad» de HR, con este párrafo (rellena el proyectista los [ ]):
> «DB-HR Protección frente al ruido. Se aplica a la zona que cambia de uso a vivienda; la exclusión de la Introducción II d) del DB-HR no menciona los cambios de uso, y la Guía de aplicación del DB-HR recomienda aplicar sus exigencias en los cambios de uso a vivienda. El aislamiento a ruido aéreo con la vivienda superior y con el local colindante se justifica en los apartados anteriores. El aislamiento a ruido de impactos procedente de [la vivienda superior / el local colindante] depende del suelo de ese recinto, que no es objeto de la intervención: la opción simplificada exige un suelo flotante en el recinto emisor (DB-HR ap. 3.1.2.3.5 ptos 2 y 4), que no puede disponerse desde la vivienda. Por inviabilidad técnica de intervenir fuera de la vivienda generada, se aplica el criterio de flexibilidad de la Parte I del CTE (art. 2.3): se dispone [techo suspendido de ΔRA = .. dBA y ΔLd,w = .. dB, desolidarizado / bandas elásticas en …], solución que mejora las prestaciones acústicas en la medida de lo posible, conforme a la recomendación de la Guía de aplicación del DB-HR (ap. 2.0.2, cambios de uso, caso b) para intervenciones que solo pueden realizarse por el interior de la vivienda generada. La vivienda no colinda con ningún recinto ruidoso. [Se realizará un ensayo in situ de L'nT,w tras la intervención.] En la documentación final de la obra quedará constancia del nivel de prestación alcanzado.»

Rótulo: «Guía DB-HR V.03 (dic. 2016), no reglamentaria».

---

## Bloque 4 — DB-SI 4 y criterios de existentes

### K-INT.14 — ¿Requiere la vivienda nueva alguna dotación propia de SI 4?

**Pregunta.** ¿Requiere la vivienda nueva alguna dotación propia? Origen de evacuación; tabla 1.1 «En general» y Residencial Vivienda.

**Respuesta.** **No.**
- La dotación «En general» (extintor 21A-113B a 15 m de recorrido en cada planta **desde todo origen de evacuación**) **no alcanza al interior de la vivienda**: el interior de las viviendas no es origen de evacuación.
- El extintor de PB se mide desde los orígenes de evacuación de las zonas comunes (portal).
- Las filas de Residencial Vivienda dependen del edificio:
  - columna seca si la altura de evacuación > 24 m;
  - detección y alarma > 50 m;
  - hidrantes con 5 000–10 000 m² de superficie **total** construida.

  La vivienda nueva no cambia ni la altura de evacuación ni la superficie construida del edificio, así que esas dotaciones no varían.

**Cita.**
- DB-SI, Anejo SI A, «Origen de evacuación», [SI25] p. 46, **VERIFICADO (texto)**: «Es todo punto ocupable de un edificio, exceptuando los del interior de las viviendas y los de todo recinto o conjunto de ellos comunicados entre sí, en los que la densidad de ocupación no exceda de 1 persona/5 m² y cuya superficie total no exceda de 50 m², como pueden ser las habitaciones de hotel, residencia u hospital, los despachos de oficinas, etc.»
- SI 4 ap. 1 pto 1, [SI25] p. 32, **VERIFICADO (texto)**: «Los edificios deben disponer de los equipos e instalaciones de protección contra incendios que se indican en la tabla 1.1. […]»
- Tabla 1.1, «En general», extintores, [SI25] p. 32, **VERIFICADO (imagen)** (`verificacion-si4-si6.md` C1.5 y C7.1): «Uno de eficacia 21A -113B: — A 15 m de recorrido en cada planta, como máximo, desde todo origen de evacuación. — En las zonas de riesgo especial conforme al capítulo 2 de la Sección 1 de este DB.»
- Tabla 1.1, Residencial Vivienda, [SI25] p. 33, **VERIFICADO (imagen)** (C7.3, C7.5): columna seca «Si la altura de evacuación excede de 24 m»; detección y alarma «Si la altura de evacuación excede de 50 m»; hidrantes «Uno si la superficie total construida está comprendida entre 5.000 y 10.000 m²» (y uno más por cada 10 000 m² adicionales o fracción).

**Grado:**
- Definición y SI 4 pto 1: VERIFICADO (texto).
- Tabla 1.1: VERIFICADO (imagen).
- Conclusión: INTERPRETACIÓN directa.

**Consecuencia para la app.** SI 4 en la vivienda nueva → `no_aplica` en cuanto a dotación propia. Párrafo:
> «SI 4 Instalaciones de protección contra incendios. El interior de la vivienda no constituye origen de evacuación (DB-SI, Anejo SI A), por lo que no requiere dotación propia de extintores; la dotación de la planta baja se refiere a los orígenes de evacuación de las zonas comunes. La intervención no modifica la altura de evacuación ni la superficie construida del edificio, de las que dependen las dotaciones de uso Residencial Vivienda de la tabla 1.1 (columna seca, detección y alarma, hidrantes), que no varían.»

---

### K-INT.15 — Criterios de existentes del DB-SI (8 a 11) y las instalaciones que no se tocan

**Pregunta.** ¿Qué criterios de la Introducción III se aplican a las instalaciones existentes que no se tocan (extintores de zonas comunes, BIE y detección del garaje)?

**Respuesta.**
- **Criterio 8 (cambio de uso parcial):** el DB se aplica a la vivienda y a sus medios de evacuación hasta el espacio exterior seguro, **salvo la excepción**. En edificios de uso Residencial Vivienda existentes que transforman en ese uso zonas de otro uso, no es preciso aplicarlo a los **elementos comunes de evacuación**. El caso tipo está en la excepción.
- **Criterio 9 (reforma del portal, mismo uso):** se aplica a los elementos que la reforma modifica, siempre que mejore la adecuación.
- **Criterio 10, segunda frase:** las instalaciones PCI solo hay que adecuarlas si la reforma afecta a elementos que les sirven de **soporte** o a zonas por las que **discurren sus componentes**. Ejemplos: el paramento donde va el extintor del portal, o el recorrido de la detección.
  - El **garaje** (BIE y detección) no se toca → nada.
  - El **extintor del portal**: si se desmonta o se cambia su paramento, se recoloca cumpliendo SI 4: 21A-113B, a ≤ 15 m de recorrido.
- **Criterio 11:** no menoscabar las condiciones preexistentes. Ninguna instalación se retira ni se deja fuera de servicio.

**Cita.** DB-SI, Introducción III, [SI25] pp. 5–6, **VERIFICADO (imagen)** (`verificacion-reformas.md` B.10–B.13):
> crit. 8: «Cuando un cambio de uso afecte únicamente a parte de un edificio o de un establecimiento, este DB se debe aplicar a dicha parte, así como a los medios de evacuación que la sirvan y que conduzcan hasta el espacio exterior seguro, estén o no situados en ella. Como excepción a lo anterior, cuando en edificios de uso Residencial Vivienda existentes se trate de transformar en dicho uso zonas destinadas a cualquier otro, no es preciso aplicar este DB a los elementos comunes de evacuación del edificio.»
> crit. 9: «En las obras de reforma en las que se mantenga el uso, este DB debe aplicarse a los elementos del edificio modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones de seguridad establecidas en este DB.»
> crit. 10: «Si la reforma altera la ocupación o su distribución con respecto a los elementos de evacuación, la aplicación de este DB debe afectar también a éstos. Si la reforma afecta a elementos constructivos que deban servir de soporte a las instalaciones de protección contra incendios, o a zonas por las que discurren sus componentes, dichas instalaciones deben adecuarse a lo establecido en este DB.»
> crit. 11: «En todo caso, las obras de reforma no podrán menoscabar las condiciones de seguridad preexistentes, cuando éstas sean menos estrictas que las contempladas en este DB.»

Comentario, [DccSI] p. 8, **LEÍDO (comentario)** (`verificacion-reformas.md` B.15): proporcionalidad «entre el alcance constructivo de la intervención y el grado de mejora».

**Grado:** VERIFICADO (imagen). Aplicación al caso: INTERPRETACIÓN.

**Consecuencia para la app.**
- Lista «Instalaciones PCI existentes» (extintores de zonas comunes, BIE, detección, alumbrado de emergencia), cada una con «¿la reforma afecta a su soporte o recorrido? sí / no».
- Con «no», párrafo fijo:
  > «Las instalaciones de protección contra incendios existentes —extintores de las zonas comunes, bocas de incendio equipadas y sistema de detección del garaje— no son objeto de la intervención, y la reforma del portal no afecta a elementos que les sirvan de soporte ni a zonas por las que discurran sus componentes, por lo que no procede su adecuación (DB-SI, Introducción III, criterio 10). La intervención no menoscaba las condiciones de seguridad preexistentes (criterio 11). Al tratarse de la transformación en uso Residencial Vivienda de una zona de otro uso en un edificio de ese uso, no es preciso aplicar el DB a los elementos comunes de evacuación por razón del cambio de uso (criterio 8); en el portal se aplica a los elementos que modifica la reforma (criterio 9).»
- Con «sí» en el extintor: «se recoloca un extintor 21A-113B a no más de 15 m de recorrido desde todo origen de evacuación de la planta (SI 4, tabla 1.1)».

---

## Bloque 5 — DB-HS 4 y HS 5 con una vivienda más en instalaciones existentes

### K-INT.16 — HS 4: batería o armario de contadores y tramos existentes

**Pregunta.** ¿Qué exige el DB respecto a la batería o armario de contadores existente y a los tramos que alimentarán la vivienda nueva?

**Respuesta.** **Nada específico de existentes**, salvo:
- **Ámbito (1.1):** la intervención queda incluida porque se amplía el número de aparatos receptores.
- **5.1.4 pto 2:** recomienda («es conveniente») un filtro adicional en el punto de transición con la instalación existente.

Sobre los contadores, lo que se aplica es lo general del contador **nuevo**:
- en zona de uso común, de fácil y libre acceso;
- preinstalación para lectura a distancia;
- llave de corte antes y válvula de retención después (3.2.1.2.7).

**El DB-HS consolidado no tiene reserva de espacio para la batería:** el 4.1 solo dimensiona el armario o arqueta del **contador general** (tabla 4.1). «Batería» solo aparece en el Apéndice A y en el 7.3 pto 4 (`verificacion-hs4-v4.md` B3c).

Los tramos existentes que pasan a alimentar la vivienda (acometida, tubo de alimentación, distribuidor, montante) se comprueban con el método general: «el caudal máximo de cada tramo será igual a la suma de los caudales de los puntos de consumo alimentados por el mismo» (4.2.1 pto 2 a). El coeficiente de simultaneidad, «con un criterio adecuado» (pto 2 b).

**Cita.** [HS22], **VERIFICADO (texto)** salvo indicación:
- 1.1, p. 81, **VERIFICADO (imagen)** (C.32): «Las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes se consideran incluidas cuando se amplía el número o la capacidad de los aparatos receptores existentes en la instalación.»
- 3.2.1.2.7, p. 86: «1 Los contadores divisionarios deben situarse en zonas de uso común del edificio, de fácil y libre acceso. 2 Contarán con pre-instalación adecuada para una conexión de envío de señales para lectura a distancia del contador. 3 Antes de cada contador divisionario se dispondrá una llave de corte. Después de cada contador se dispondrá una válvula de retención.»
- 4.1 pto 1, p. 90: «En los edificios dotados con contador general único se preverá un espacio para un armario o una cámara para alojar el contador general de las dimensiones indicadas en la tabla 4.1.» (Sin más puntos; el 4.2 empieza a continuación.)
- 4.2.1 pto 2, pp. 90–91: «a) el caudal máximo de cada tramos será igual a la suma de los caudales de los puntos de consumo alimentados por el mismo de acuerdo con la tabla 2.1. b) establecimiento de los coeficientes de simultaneidad de cada tramo de acuerdo con un criterio adecuado.»
- 5.1.4 pto 2, p. 100: «En la ampliación de instalaciones existentes o en el cambio de tramos grandes de instalación, es conveniente la instalación de un filtro adicional en el punto de transición, para evitar la transferencia de materias sólidas de los tramos de conducción existentes.»
- 7.3 pto 4, p. 104: «En caso de contabilización del consumo mediante batería de contadores, las montantes hasta cada derivación particular se considerará que forman parte de la instalación general, a efectos de conservación y mantenimiento puesto que discurren por zonas comunes del edificio;»

**Grado:**
- 1.1: VERIFICADO (imagen); resto: VERIFICADO (texto).
- «Comprobar los tramos existentes»: INTERPRETACIÓN del 4.2.1 aplicado a un tramo que gana consumos.
- Recordatorio: el K de simultaneidad no lo fija el DB-HS 4 (criterio externo, UNE 149201).

**Consecuencia para la app.**
- HS 4 en existente: tabla de tramos con «existente / nuevo». Los existentes llevan el caudal acumulado con la vivienda nueva y se comprueba su diámetro y velocidad con los mismos criterios.
- Datos del contador: posición en la batería existente, «hueco libre en la batería: sí / no (ampliar)» como dato del proyecto, rotulado «normas de la entidad suministradora, no CTE».
- Casilla de filtro en transición, como recomendación del 5.1.4 pto 2.
- Párrafo:
  > «DB-HS 4 Suministro de agua. La intervención amplía el número de aparatos receptores de la instalación existente, por lo que queda incluida en el ámbito de la Sección (HS 4 ap. 1.1). La vivienda dispone de contador divisionario propio en [la batería existente, situada en zona de uso común de fácil y libre acceso], con preinstalación para lectura a distancia, llave de corte anterior y válvula de retención posterior (ap. 3.2.1.2.7). Los tramos existentes que pasan a alimentar la vivienda se comprueban con el caudal de los puntos de consumo que alimentan tras la intervención (ap. 4.2.1). Se dispone un filtro en el punto de transición con la instalación existente (ap. 5.1.4 pto 2, recomendación). El DB-HS 4 no establece condiciones específicas para baterías de contadores existentes.»

---

### K-INT.17 — HS 5: la bajante o el colector existente que recibe las descargas nuevas

**Pregunta.** ¿Qué exige el DB respecto a la bajante o colector existente que recibe las nuevas descargas?

**Respuesta.** **Nada específico de existentes**, salvo el ámbito 1.1, igual que HS 4. El dimensionado general cubre el caso:
- la **bajante**: tabla 4.4, por el número máximo de UD en la bajante y en cada ramal, según «hasta 3 plantas» o «más de 3 plantas»;
- el **colector horizontal**: tabla 4.5, por el número máximo de UD y la pendiente.

Las UD de la vivienda nueva (tabla 4.1, uso privado) se **suman** a las que ya recibe el tramo existente. INTERPRETACIÓN: la comprobación es la misma que en obra nueva, con las UD totales.

**Cita.** [HS22], **VERIFICADO (texto)** salvo indicación:
- 1.1, p. 111, **VERIFICADO (imagen)** (C.33): mismo texto que HS 4 1.1, «cuando se amplía el número o la capacidad de los aparatos receptores existentes en la instalación.»
- 4.1.1.1 pto 1, p. 116: «La adjudicación de UD a cada tipo de aparato y los diámetros mínimos de los sifones y las derivaciones individuales correspondientes se establecen en la tabla 4.1 en función del uso.»
- 4.1.2, p. 118: «1 El dimensionado de las bajantes debe realizarse de forma tal que no se rebase el límite de 250 Pa de variación de presión y para un caudal tal que la superficie ocupada por el agua no sea mayor que 1/3 de la sección transversal de la tubería. 2 El diámetro de las bajantes se obtiene en la tabla 4.4 como el mayor de los valores obtenidos considerando el máximo número de UD en la bajante y el máximo número de UD en cada ramal en función del número de plantas.»
- 4.1.3, p. 118: «1 Los colectores horizontales se dimensionan para funcionar a media de sección, hasta un máximo de tres cuartos de sección, bajo condiciones de flujo uniforme. 2 El diámetro de los colectores horizontales se obtiene en la tabla 4.5 en función del máximo número de UD y de la pendiente.»

**Grado:**
- 1.1: VERIFICADO (imagen); resto: VERIFICADO (texto).
- «Sumar a las UD existentes»: INTERPRETACIÓN.
- Las celdas de las tablas 4.4 y 4.5 no se transcriben aquí: el módulo HS 5 ya las tiene verificadas.

**Consecuencia para la app.**
- HS 5 en existente: campo «UD existentes que ya recibe el tramo [bajante / colector]» (dato del proyectista, con «desconocido» permitido).
- La app suma las UD de la vivienda y comprueba el Ø existente con las tablas 4.4 y 4.5.
- Con «desconocido»: aviso «comprobar la capacidad del tramo existente» en «Antes de entregar», sin veredicto.
- Párrafo:
  > «DB-HS 5 Evacuación de aguas. La intervención amplía el número de aparatos receptores de la instalación existente (HS 5 ap. 1.1). Las derivaciones y ramales de la vivienda se dimensionan con las tablas 4.1 y 4.3. Las descargas de la vivienda, [n] UD, acometen al [colector / bajante] existente de Ø [..] mm, que recibe en total [N] UD tras la intervención; con pendiente del [..] % [en colector], su capacidad según la tabla [4.5 / 4.4] es de [..] UD. CUMPLE. El DB-HS 5 no establece condiciones específicas para redes existentes distintas de las de dimensionado.»

---

## Bloque 6 — REBT

### K-INT.18 — Art. 2.2 y documentación (ITC-BT-04; Guía BT-04)

**Pregunta.** Texto literal del art. 2.2. ¿Qué documento exige añadir una vivienda?

**Respuesta.**
- Una instalación existente **posterior al REBT de 2002** se amplía y le aplica el 2.2 a): «a sus modificaciones y a sus ampliaciones».
- Si es **anterior**, el 2.2 b): solo a la parte ampliada, con medidas para la seguridad del conjunto.
- **Documentación:** la instalación de la vivienda es una ampliación del grupo e (edificio principalmente de viviendas), que solo pide proyecto con P > 100 kW por CGP. Por tanto **memoria técnica de diseño** (ITC-BT-04 ap. 4), salvo los casos de 3.2 b) y c):
  - b) la ampliación hace superar el umbral del grupo;
  - c) la instalación tuvo proyecto y las ampliaciones superan el 50 % de su potencia prevista.

  La MTD incluye los «cálculos justificativos de las características de la línea general de alimentación, derivaciones individuales y líneas secundarias». En el modelo de la Guía BT-04, la casilla «Memoria por» se marca «A (Ampliación-Reforma)».

**Cita.**
- REBT art. 2.2, [REBT] p. 9, **VERIFICADO (imagen)** (`verificacion-reformas.md` C.41): «2. El presente Reglamento se aplicará: a) A las nuevas instalaciones, a sus modificaciones y a sus ampliaciones. b) A las modificaciones, reparaciones y ampliaciones, sean o no de importancia, de las instalaciones existentes antes de su entrada en vigor, solo en lo que afecta a la parte modificada, reparada o ampliada, y siempre y cuando se tomen las medidas necesarias para garantizar las condiciones de seguridad del conjunto de la instalación. […]» y «Se entenderá por modificaciones o reparaciones de importancia, a los efectos de la documentación exigible y de la obligatoriedad de inspección inicial, a las que afectan a más del 50 por 100 de la potencia instalada. […]» (C.42).
- ITC-BT-04 ap. 3.2 y 4, [REBT] p. 53, **VERIFICADO (texto)**; igual en [G04] p. 11, **LEÍDO (Guía, imagen)**: «Requerirán Memoria Técnica de Diseño todas las instalaciones - sean nuevas, ampliaciones o modificaciones - no incluidas en los grupos indicados en el apartado 3.»
- ITC-BT-04 ap. 2.2 (contenido de la MTD), reproducido en [G04] p. 3, **LEÍDO (Guía, imagen)**: «Cálculos justificativos de las características de la línea general de alimentación, derivaciones individuales y líneas secundarias, sus elementos de protección y sus puntos de utilización;»
- Modelo de MTD, [G04] p. 4, nota (1), **LEÍDO (Guía, imagen)**: «Instalación: N (Nuevo), A (Ampliación-Reforma), CN (Cambio de Nombre) CT (Cambio Tensión)». En p. 5, el bloque «Previsión de cargas en edificios de viviendas» pide nº de viviendas por grado, coeficiente de simultaneidad, servicios generales y «Superficie útil total» de locales.

**Grado:**
- Art. 2.2: VERIFICADO (imagen).
- ITC-BT-04: VERIFICADO (texto) / LEÍDO (Guía, imagen).
- **La Guía BT-04 no dice nada específico de una vivienda nueva en edificio existente**, más allá de la casilla «A». La Guía BT-10 tampoco (leída entera, pp. 1–6).

**Consecuencia para la app.**
- REBT en existente: preguntas «año de la instalación del edificio: anterior / posterior a 2002 (REBT)» y «¿la instalación del edificio tuvo proyecto?».
- Documento: MTD «A (Ampliación-Reforma)», salvo 3.2 b o c.
- Párrafo:
  > «REBT. La intervención amplía la instalación eléctrica del edificio con una nueva derivación individual y la instalación interior de la vivienda, a las que se aplica el Reglamento (RD 842/2002, art. 2.2 [a / b: instalación anterior a su entrada en vigor; solo la parte ampliada, con las medidas necesarias para garantizar la seguridad del conjunto]). La ampliación no se incluye en los supuestos que requieren proyecto (ITC-BT-04 ap. 3.2), por lo que se documenta con memoria técnica de diseño (ap. 4), elaborada por instalador autorizado o técnico competente.»

---

### K-INT.19 — LGA, derivación individual y centralización existentes (ITC-BT-10, 14, 15 y 16)

**Pregunta.** ¿Qué ITC aplican al añadir una vivienda con centralización y LGA existentes? ¿Hay que reservar o justificar módulo?

**Respuesta.**
- **ITC-BT-10:** la previsión del edificio cambia:
  - una vivienda más (la de 90 m² útiles, básica, ≥ 5 750 W), con su coeficiente de simultaneidad;
  - el local pasa de 160 a 70 m² (100 W/m², mínimo 3 450 W).

  La LGA existente se comprueba con la **nueva** previsión. En el caso tipo, la previsión **suele bajar**: −9 000 W del local frente a +5 750 W de la vivienda, menos el efecto de la simultaneidad. Es una INTERPRETACIÓN aritmética que depende del número de viviendas.
- **ITC-BT-14 (LGA):** sección por caída de tensión (0,5 % centralizada, 1 % parcial) e intensidad máxima «de acuerdo con la previsión de potencias establecidas en la ITC-BT-10». Si la previsión no sube, la LGA existente **no necesita** comprobación nueva (INTERPRETACIÓN).
- **ITC-BT-15 (DI):** cada derivación individual, independiente. La instrucción obliga a que la obra original dejara **tubos de reserva**: uno por cada diez DI, y en locales sin partición definida, uno por cada 50 m². Es la previsión reglamentaria para llevar la DI nueva. Si no existen (edificio anterior a 2002), hay que habilitar canalización por zonas comunes. La DI nueva, con tubo ≥ 32 mm de diámetro exterior y ampliable al 100 %.
- **ITC-BT-16 (contadores):** **no exige módulo de reserva para viviendas.** Solo exige que módulos, paneles y armarios tengan dimensiones «adecuadas para el tipo y número de contadores». Al pasar de un suministro (el local) a dos (local + vivienda), la centralización debe alojar un contador más.
  - **Ojo, ITC-BT-52 3.2 b:** ese módulo de reserva es para la recarga de VE, no para viviendas.
  - Si el número total de contadores pasa de 16, la centralización debe estar en **local** (ITC-BT-16 2.2): comprobar si se cruza el umbral (`verificacion-rebt.md` G.1).

**Cita.** [REBT], **VERIFICADO (texto)**:
- ITC-BT-14 ap. 2 y 3, p. 110: «Las dimensiones de otros tipos de canalizaciones deberán permitir la ampliación de la sección de los conductores en un 100%.» · «La caída de tensión máxima permitida será: – Para líneas generales de alimentación destinadas a contadores totalmente centralizados: 0,5 por 100. – Para líneas generales de alimentación destinadas a centralizaciones parciales de contadores: 1 por 100. La intensidad máxima admisible a considerar será la fijada en la UNE 20.460 -5-523 con los factores de corrección correspondientes a cada tipo de montaje, de acuerdo con la previsión de potencias establecidas en la ITC-BT-10.»
- ITC-BT-15 ap. 1 y 2, pp. 111–112: «Cada derivación individual será totalmente independiente de las derivaciones correspondientes a otros usuarios.» · «Los tubos y canales protectoras tendrán una sección nominal que permita ampliar la sección de los conductores inicialmente instalados en un 100%. En las mencionadas condiciones de instalación, los diámetros exteriores nominales mínimos de los tubos en derivaciones individuales serán de 32 mm.» · «En cualquier caso, se dispondrá de un tubo de reserva por cada diez derivaciones individuales o fracción, desde las concentraciones de contadores hasta las viviendas o locales, para poder atender fácilmente posibles ampliaciones. En locales donde no esté definida su partición, se instalará como mínimo un tubo por cada 50 m2 de superficie.» · «[…] las derivaciones individuales deberán discurrir por lugares de uso común, o en caso contrario quedar determinadas sus servidumbres correspondientes.»
- ITC-BT-16 ap. 1, p. 114: «Las dimensiones de los módulos, paneles y armarios, serán las adecuadas para el tipo y número de contadores así como del resto de dispositivos necesarios para la facturación de la energía, que según el tipo de suministro deban llevar.» · «Cada derivación individual debe llevar asociado en su origen su propia protección compuesta por fusibles de seguridad […]»
- ITC-BT-10, Guía [G10] pp. 3–5, **LEÍDO (Guía, imagen)**, que reproduce el reglamento:
  - 2.2: «para nuevas construcciones, no será inferior a 5 750 W a 230 V, en cada vivienda»;
  - 3.3: «Se calculará considerando un mínimo de 100 W por metro cuadrado y planta, con un mínimo por local de 3450 W a 230 V y coeficiente de simultaneidad 1.»
  - Comentario de la Guía, p. 2: la previsión busca «que futuros aumentos de la potencia demandada por los usuarios no tenga como consecuencia inmediata la necesidad de modificar la instalación.»

**Grado:**
- ITC: VERIFICADO (texto); ITC-BT-10, VERIFICADO (imagen) en `verificacion-rebt.md`.
- «Si la previsión baja, la LGA no se recomprueba» y «los tubos de reserva son la vía»: INTERPRETACIÓN.
- **SIN CONFIRMAR:** las normas particulares de la empresa distribuidora sobre ampliación de centralizaciones. No son REBT.

**Consecuencia para la app.**
- La previsión de cargas del módulo REBT se calcula **antes y después** de la intervención, con el mismo método ITC-BT-10.
- Si P_después > P_antes, se comprueba la LGA (dato de la sección existente).
- Datos nuevos:
  - «tubo de reserva disponible en la canalización de DI: sí / no»;
  - «hueco para un contador más en la centralización: sí / no (ampliar)»;
  - nº total de contadores tras la obra (aviso si > 16 y la centralización está en armario).
- Párrafo:
  > «Instalaciones de enlace. La previsión de cargas del edificio tras la intervención, con [n] viviendas ([grado]) y un local de [70] m², es de [P] W, [inferior / superior] a la del estado previo, [P0] W (ITC-BT-10 ap. 3). [Al no aumentar la previsión, la línea general de alimentación existente no se modifica. / La línea general de alimentación existente, de [s] mm², se comprueba con la nueva previsión (ITC-BT-14 ap. 3).] La derivación individual de la vivienda, independiente de las demás, discurre desde la centralización por zonas comunes en [un tubo de reserva de la canalización existente / una canalización nueva] de diámetro exterior no inferior a 32 mm (ITC-BT-15 ap. 2). La centralización existente aloja el contador de la vivienda en [un módulo libre / un módulo que se añade], con sus fusibles de seguridad (ITC-BT-16 ap. 1).»

---

### K-INT.20 — Párrafo común de no empeoramiento para el resto del edificio

**Pregunta.** ¿Cómo se redacta en una sola vez lo no intervenido?

**Respuesta.**
- Un párrafo de cierre en el capítulo de cumplimiento del CTE, con la regla general de la Parte I y las tres versiones propias que existen:
  - DB-SI criterio 11;
  - DB-SUA criterio 4;
  - DB-HE Introducción IV criterio 1.
- DB-HS y DB-HR no tienen criterio propio: se cita la Parte I.
- Evita repetir en cada DB «el resto del edificio no se toca».

**Cita.**
- CTE Parte I art. 2.3, párrafo 4, [PI22] p. 5, **VERIFICADO (imagen)** (`verificacion-reformas.md` A.5b).
- DB-SI Intro III crit. 11 y DB-SUA Intro III crit. 4: K-INT.15 y K-INT.8, **VERIFICADO (imagen)**.
- DB-HE Intro IV crit. 1, [HE22] p. 5, **VERIFICADO (imagen)** (B.1).

**Grado:** VERIFICADO (imagen).

**Consecuencia para la app.** Párrafo fijo, una vez por memoria de intervención:
> «Alcance de la intervención y resto del edificio. La intervención se limita al cambio de uso de [90] m² útiles del local de planta baja a vivienda y a la reforma del portal. El resto del edificio —local de [70] m², viviendas de las plantas primera a tercera y garaje en sótano— no es objeto de la intervención, y en él no se reducen las condiciones preexistentes relacionadas con las exigencias básicas (CTE Parte I, art. 2.3; DB-SI, Introducción III, criterio 11; DB-SUA, Introducción III, criterio 4; DB-HE, Introducción IV, criterio 1). Cada apartado de esta memoria justifica únicamente los elementos y las instalaciones intervenidos.»

---

## Cambios propuestos a decisiones previas

| # | Decisión previa | Cambio | Base |
|---|---|---|---|
| 1 | K-REF.11 (`verificacion-reformas.md`): SUA 8 en cambio de uso parcial → `aplica` | → «sin variación» si el C4 del edificio no sube y no cambian Ae, C1, C2, C3 ni C5; `aplica` si suben | K-INT.9 |
| 2 | Párrafo «hs6 · a lo reformado» (D.1) | Sustituir por el selector de K-INT.7 y su párrafo modelo, con medición posterior | K-INT.2 a K-INT.7 |
| 3 | Párrafo «hr · cambio de uso parcial a vivienda» (D.4) | Añadir el estado «impactos no justificables en opción simplificada» y el párrafo de flexibilidad de K-INT.13 | K-INT.11 a K-INT.13 |
| 4 | Módulo REBT | Previsión antes y después; tubos de reserva; hueco en centralización; umbral de 16 contadores | K-INT.19 |

## Pendiente de cotejo en imagen antes de imprimir citas

Cuando haya renderizador (PyMuPDF con shell):
- [HS22] pp. 139–141 (HS 6 ap. 3 ptos 3–4, 3.1.1 pto 4, 3.2 ptos 6–8, 3.3 ptos 1–6);
- p. 144 (definición de local no habitable);
- p. 181 (Apéndice C 2.1);
- pp. 86, 90–91, 100, 104, 116, 118 (HS 4 y HS 5);
- [DccHS] pp. 146–150;
- [SI25] pp. 32 y 46;
- [HR19] p. 31 (ec. 3.22, símbolos Δ perdidos en el texto);
- [REBT] pp. 53 y 110–115.
