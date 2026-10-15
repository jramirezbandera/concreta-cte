# Verificación normativa — Estudio de gestión de RCD (Fase 8 de PLAN-MEMORIA.md)

**Fecha:** 2026-10-16 (segunda pasada, contra los PDF oficiales) · Agente: cte-normativa · **No se ha editado código.**
**Encargo:** las preguntas 8, 9 y 10 de `PLAN-MEMORIA.md` §4.2 (RD 105/2008 tras la Ley 7/2022; Andalucía; ratios de generación), para el anejo «Estudio de gestión de residuos de construcción y demolición» de §5.8. Criterios numerados **K-RCD.1 … K-RCD.17**, en el orden de las preguntas. La pregunta 11 (RD 1627/1997) no es de este encargo.

**Método y límites de esta sesión**
- **Volcados de texto** (`pdftotext -layout`, UTF-8) de los PDF oficiales, en `…\scratchpad\fase8\txt\` (PDF en `…\fase8\pdf\`): RD 105/2008 y Ley 7/2022 (consolidados BOE); Decisión 2014/955/UE (DOUE L 370); Decisión Delegada (UE) 2025/934 (DOUE serie L); Ley 3/2023 de Andalucía y Ley 2/2026 de Andalucía (consolidados BOE); Decreto 73/2012 (BOJA 81/2012, original); guía CGATE-CSCAE «Ratios Nacionales» (2020); CTE DB SE-AE (codigotecnico.org). La página citada es el pie o la cabecera impresa del PDF («Página N» en el BOE; «L 370/N» en el DOUE; «Página núm. N» en el BOJA; «SE-AE N» en el DB). → **VERIFICADO (texto)**.
- **Cuidado con las tablas a dos columnas** (BOJA, DOUE 2025/934, DB SE-AE tabla C.1): `pdftotext` separa los nombres de los valores. Donde el emparejamiento sale solo del orden de lectura, se marca **INTERPRETACIÓN (orden de lectura)** y hay que cotejarlo en imagen.
- **Cotejo en imagen** (2026-10-16, páginas renderizadas con PyMuPDF): tabla C.1 del DB SE-AE (p. 19 del documento) y anexo de la Decisión Delegada 2025/934 (p. 3/5). Las tablas de la guía CGATE-CSCAE no se han cotejado: son imagen y su licencia impide usarlas (K-RCD.14).
- Lo que solo se leyó en HTML con un lector que resume, o en un buscador, sigue como **LEÍDO (web)** o **LEÍDO (web, secundaria)**.
- **Plantilla del ejemplo 25P011**: volcado de texto (`…\scratchpad\fase8\25P011-EGR.txt`) y búsqueda de cadenas en `ejemplos/25P011_MEMORIA.doc`. Es dato de cliente: aquí solo se cita su estructura, sus ratios y sus citas legales. → **VERIFICADO (texto)** para «lo que dice la plantilla».

**Veredictos** (los mismos de `verificacion-memoria.md`):
- **VERIFICADO (imagen)** / **VERIFICADO (texto)**: literal de la norma, con página.
- **LEÍDO (web)**: boe.es / juntadeandalucia.es en HTML, lectura resumida.
- **LEÍDO (comentario)**: DB con comentarios del Ministerio. No es reglamentario.
- **INTERPRETACIÓN**: se sigue de la norma, pero la norma no lo escribe tal cual.
- **CORREGIDO**: el encargo, el plan o una fuente previa (incluida la primera pasada de este fichero) no coincide con la fuente.
- **SIN CONFIRMAR**: no se ha podido leer en fuente oficial. **No se codifica.**

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición / versión | Fuente | Lectura |
|---|---|---|---|---|
| [RD105] | RD 105/2008, de 1 de febrero, producción y gestión de RCD | BOE núm. 38, 13-02-2008, en vigor 14-02-2008. «TEXTO CONSOLIDADO / Última modificación: sin modificaciones» (p. 3) | BOE-A-2008-2486, PDF consolidado | **VERIFICADO (texto)**: arts. 2–7, DA 1.ª y 4.ª, DF 2.ª y 4.ª (pp. 3, 5–8, 11–13) |
| [L7/22] | Ley 7/2022, de 8 de abril, de residuos y suelos contaminados para una economía circular | BOE núm. 85, 09-04-2022. «Última modificación: 02 de abril de 2025» (p. 4) | BOE-A-2022-5809, PDF consolidado | **VERIFICADO (texto)**: arts. 6.1 (p. 26), 26.1 (pp. 44–45), 30 (pp. 47–48), DA 14.ª (p. 101), disp. derogatoria 1.ª (pp. 106–107), anexo II (pp. 119–120), anexo III (p. 121) |
| [MAM] | Orden MAM/304/2002 | **Derogada** (Ley 7/2022, disp. derogatoria 1.ª.3) | [L7/22] p. 106 | VERIFICADO (texto) la derogación; fecha de efectos 10-04-2022 según la ficha BOE, LEÍDO (web) |
| [RD833] | RD 833/1988 | **Derogado** (Ley 7/2022, disp. derogatoria 1.ª.2) | [L7/22] p. 106 | VERIFICADO (texto) la derogación |
| [L10/98] | Ley 10/1998, de Residuos | **Derogada** con efectos 30-07-2011 (Ley 22/2011) | nota de [RD105] p. 3 | VERIFICADO (texto) |
| [LER] | Decisión 2000/532/CE, lista de residuos, **en la redacción de la Decisión 2014/955/UE**, de 18-12-2014 | DOUE L 370, 30-12-2014, pp. 44–86; «Será aplicable a partir del 1 de junio de 2015.» (art. 3, p. 45) | PDF DOUE | **VERIFICADO (texto)**: cap. 17 (pp. 78–79); 01 04 (p. 49); 08 01 (p. 60); 13 02 (p. 72); 15 01 y 15 02 (p. 74); 16 06 (p. 76); 20 01 21 (p. 85); 20 03 01 (p. 86) |
| [DD934] | Decisión Delegada (UE) 2025/934, de 5-03-2025, lista de residuos: pilas y baterías | DO L de 20-05-2025. Art. 2: «Será aplicable a partir del 9 de noviembre de 2026.» (p. 2/5) | PDF DOUE (texto original, sin corrección de errores) | **VERIFICADO (texto)**. La corrección de errores que según el buscador lleva la fecha al 09-12-2026: **SIN CONFIRMAR** |
| [PEMAR] | PEMAR 2025-2035 | BOE núm. 9, 10-01-2026 (BOE-A-2026-606); texto en la web del MITECO | buscador | LEÍDO (web, secundaria). Plan no leído |
| [L3/23] | Ley 3/2023, de 30 de marzo, de Economía Circular de Andalucía | BOJA núm. 67, 11-04-2023; BOE-A-2023-9957. «Última modificación: sin modificaciones» (p. 7) | PDF consolidado BOE | **VERIFICADO (texto)**: arts. 67 (p. 38), 70 (p. 39), disp. derogatoria única (p. 50), DF 5.ª (p. 52), DF 6.ª (p. 53), DF 11.ª (p. 54), DF 15.ª (p. 55) |
| [D73] | Decreto 73/2012, de 20 de marzo, Reglamento de Residuos de Andalucía | BOJA núm. 81, 26-04-2012, texto **original** (no hay consolidado oficial leído) | PDF BOJA, a dos columnas | **VERIFICADO (texto)**: DT 10.ª.2 (p. 76), arts. 79–83 (pp. 105–106), 84–88 (pp. 106–107), 89 (p. 107) |
| [LEGAM] | Ley 2/2026, de 12 de marzo, para la Gestión Ambiental de Andalucía | BOJA núm. 55, 20-03-2026; BOE núm. 82, 03-04-2026 (BOE-A-2026-7558). «Última modificación: sin modificaciones» (p. 4) | PDF consolidado BOE | **VERIFICADO (texto)**: art. 138 (p. 96), disp. derogatoria única (pp. 120–121), DF 7.ª (p. 136); búsqueda en todo el volcado |
| [GICA] | Ley 7/2007 (Andalucía), art. 104 | **Derogada** por [LEGAM] | ordenanzas que lo transcriben | LEÍDO (web, secundaria) el texto; VERIFICADO (texto) la derogación |
| [ITEC-P] | Ratios del ITEC de la plantilla 25P011 | sin título ni edición del documento ITEC | `ejemplos/25P011_MEMORIA.doc`; estudio de gestión del Ayuntamiento de Zaragoza | VERIFICADO (texto) en la plantilla; LEÍDO (web, secundaria) en Zaragoza |
| [EGR-CM] | Modelo «EGR-CM Vers. 3» (COAM / Comunidad de Madrid), versión «reforma», 22-05-2014 | coam.org (.doc) | LEÍDO (web) |
| [RAT20] | «Ratios Nacionales. Generación de residuos de construcción y demolición», CGATE y CSCAE | «Edición 2020»; ISBN 978-84-09-21237-8; licencia CC BY-NC-ND 4.0 | PDF cgate.es | **VERIFICADO (texto)** el texto (estructura, metodología, anexo 2). **Tablas de ratios: imagen, no legibles → SIN CONFIRMAR** |
| [SE-AE] | CTE DB SE-AE, Acciones en la edificación | «Abril 2009» (portada del PDF). No se ha comprobado si hay versión posterior | PDF codigotecnico.org | **VERIFICADO (texto)**: B.3 (p. 17), anejo C, tablas C.1–C.6 (pp. 18–21); columna derecha de C.1, INTERPRETACIÓN (orden de lectura) |
| [ORD-MA] / [ORD-BE] | Ordenanzas de RCD de Málaga y de Benalmádena | — | no encontradas | **SIN CONFIRMAR** |

### Correcciones al encargo, al plan y a la primera pasada (resumen)

1. **El inventario de residuos peligrosos (art. 4.1.b) va dentro del estudio.** (K-RCD.3)
2. **Los umbrales del art. 5.5 del RD 105/2008 ya no deciden qué se separa**: desde el 01-07-2022 la Ley 7/2022 (art. 30.2) exige clasificar siempre madera, minerales, metales, vidrio, plástico y yeso. Solo papel y cartón conserva el umbral (0,5 t). La exención andaluza del art. 88.2 del Decreto 73/2012 cae con la del art. 5.6 del RD. (K-RCD.4)
3. **La demolición selectiva es obligatoria desde el 01-01-2024.** (K-RCD.5)
4. **CORREGIDO (encargo):** la exclusión de la obra menor está en la **DA 1.ª** del RD 105/2008, no en el art. 3. (K-RCD.6)
5. **La fianza tiene dos bases.** RD 105/2008 art. 6.3 (básico): el presupuesto del estudio. Decreto 73/2012 art. 81: el PEM total, con porcentajes mínimos. Manda la ordenanza (art. 89 del Decreto). (K-RCD.7, K-RCD.12)
6. **La Orden MAM/304/2002 está derogada**: la lista se cita por la Decisión 2014/955/UE (Ley 7/2022 art. 6.1). (K-RCD.8)
7. **CORREGIDO (primera pasada):** los textos que se dieron como códigos R0506 y R0511 eran la columna «tipos de instalaciones», no el nombre de la operación. R0506 es «Valorización de residuos inorgánicos para la producción de áridos.» y R0511 es «Preparación para la reutilización de residuos inorgánicos.» (K-RCD.8)
8. **CORREGIDO (primera pasada):** la Decisión Delegada (UE) 2025/934 es aplicable, según su texto, **desde el 09-11-2026**, no desde el 09-12-2026. Cambia los códigos de pilas que usa la plantilla: el **16 06 04 pasa a peligroso** («16 06 04*») y el **16 06 05 desaparece**. No toca el capítulo 17. (K-RCD.8)
9. **La LEGAM deroga la GICA, en vigor a los tres meses de su publicación en el BOJA (20-06-2026).** No tiene ningún artículo de RCD ni de fianza de obra. El Decreto 73/2012 sigue vigente. **CORREGIDO (primera pasada):** el consolidado del BOE dice «sin modificaciones». La «corrección de errores en el BOJA núm. 134 de 14-07-2026» que se citó salió del lector web y **no se ha confirmado**. (K-RCD.11)
10. **Ratios:** los de la plantilla (ITEC) son de demolición completa. Las tablas de la guía CGATE-CSCAE son **imagen** y no se han podido leer. Además, su **licencia CC BY-NC-ND** no deja reproducir los valores en una app comercial sin permiso. (K-RCD.13, K-RCD.14)
11. **Nuevo:** las densidades por material del **DB SE-AE, anejo C**, son legibles y son norma del CTE: base para estimar por partidas. (K-RCD.15)

---

## K-RCD.1 — Vigencia del RD 105/2008 y marco legal de 2026

**Respuesta.** **Vigente y sin modificar.** La Ley 7/2022 no lo deroga expresamente. Su disposición derogatoria 1.ª nombra solo la Ley 22/2011, el RD 833/1988, la Orden MAM/304/2002 y la Orden de 13-10-1989, más una cláusula general. **No se ha encontrado un real decreto nuevo de RCD.** El PEMAR 2025-2035 es un plan, no una norma.

**Cita.**
- [RD105] p. 3, **VERIFICADO (texto)**: «TEXTO CONSOLIDADO / Última modificación: sin modificaciones». Nota: «Téngase en cuenta que la Ley 10/1998, de 21 de abril, de residuos, a la que hace referencia el presente Real Decreto, ha sido derogada con efectos de 30 de julio de 2011 por la disposición derogatoria única.1 de la Ley 22/2011 […]».
- [RD105] DF 2.ª, p. 12: «Este real decreto tiene carácter básico y se dicta al amparo de lo dispuesto en el artículo 149.1.23.ª de la Constitución […]».
- [L7/22] disp. derogatoria 1.ª, pp. 106–107, **VERIFICADO (texto)**: «Quedan derogadas todas aquellas disposiciones que se opongan, contradigan o resulten incompatibles con lo dispuesto en esta ley y en particular: 1. Ley 22/2011, de 28 de julio, de residuos y suelos contaminados. 2. El Real Decreto 833/1988, de 20 de julio, […]. 3. La Orden MAM/304/2002, de 8 de febrero, por la que se publican las operaciones de valorización y eliminación de residuos y la lista europea de residuos. 4. La Orden de 13 de octubre de 1989 […].»

**INTERPRETACIÓN.** El RD 105/2008 se aplica en lo que no contradiga la Ley 7/2022. Sus referencias a la Ley 10/1998 se entienden hechas a la Ley 7/2022.

**Consecuencia para la app.** Cabecera normativa: RD 105/2008 (sin modificaciones) + Ley 7/2022 (consolidado 02-04-2025) + Ley 3/2023 y Decreto 73/2012 de Andalucía + ordenanza municipal (dato).

---

## K-RCD.2 — Contenido mínimo del estudio (art. 4.1.a, 1.º a 7.º)

**Cita.** [RD105] art. 4, pp. 6–7, **VERIFICADO (texto)**:

> «1. Además de los requisitos exigidos por la legislación sobre residuos, el productor de residuos de construcción y demolición deberá cumplir con las siguientes obligaciones:
> a) Incluir en el proyecto de ejecución de la obra un estudio de gestión de residuos de construcción y demolición, que contendrá como mínimo:
> 1.º Una estimación de la cantidad, expresada en toneladas y en metros cúbicos, de los residuos de construcción y demolición que se generarán en la obra, codificados con arreglo a la lista europea de residuos publicada por Orden MAM/304/2002, de 8 de febrero, por la que se publican las operaciones de valorización y eliminación de residuos y la lista europea de residuos, o norma que la sustituya.
> 2.º Las medidas para la prevención de residuos en la obra objeto del proyecto.
> 3.º Las operaciones de reutilización, valorización o eliminación a que se destinarán los residuos que se generarán en la obra.
> 4.º Las medidas para la separación de los residuos en obra, en particular, para el cumplimiento por parte del poseedor de los residuos, de la obligación establecida en el apartado 5 del artículo 5.
> 5.º Los planos de las instalaciones previstas para el almacenamiento, manejo, separación y, en su caso, otras operaciones de gestión de los residuos de construcción y demolición dentro de la obra. Posteriormente, dichos planos podrán ser objeto de adaptación a las características particulares de la obra y sus sistemas de ejecución, previo acuerdo de la dirección facultativa de la obra.
> 6.º Las prescripciones del pliego de prescripciones técnicas particulares del proyecto, en relación con el almacenamiento, manejo, separación y, en su caso, otras operaciones de gestión de los residuos de construcción y demolición dentro de la obra.
> 7.º Una valoración del coste previsto de la gestión de los residuos de construcción y demolición que formará parte del presupuesto del proyecto en capítulo independiente.»

Art. 4.2, p. 7: «2. En el caso de obras de edificación, cuando se presente un proyecto básico para la obtención de la licencia urbanística, dicho proyecto contendrá, al menos, los documentos referidos en los números 1.º, 2.º, 3.º, 4.º y 7.º de la letra a) y en la letra b) del apartado 1.» El art. 4 no tiene apartado 3.

Andalucía, [D73] art. 80.1, p. 105, **VERIFICADO (texto)**: «Los proyectos de obra sometidos a licencia municipal deberán incluir la estimación de la cantidad de residuos de construcción y demolición que se vayan a producir y las medidas para su clasificación y separación por tipos en origen […]». No añade contenido al del RD. Si se prevén **plantas móviles**, el art. 85.1 (p. 106) exige que estén «prevista[s] en el correspondiente proyecto de ejecución de obras».

**INTERPRETACIÓN.**
- 1.º pide **toneladas y metros cúbicos por código**. La plantilla no lo hace.
- «o norma que la sustituya» permite citar la Decisión 2014/955/UE (K-RCD.8).
- 4.º remite al art. 5.5, cuyos umbrales han cedido (K-RCD.4).
- 5.º son planos: la app remite a un plano del proyecto.
- 7.º es la base de la fianza según el art. 6.3 (K-RCD.7).

**Consecuencia para la app.** Siete apartados fijos con el literal de cabecera. Con proyecto básico: 1.º, 2.º, 3.º, 4.º, 7.º y el inventario.

---

## K-RCD.3 — Inventario de residuos peligrosos

**Cita.**
- [RD105] art. 4.1.b, p. 7, **VERIFICADO (texto)**: «b) En obras de demolición, rehabilitación, reparación o reforma, hacer un inventario de los residuos peligrosos que se generarán, que deberá incluirse en el estudio de gestión a que se refiere la letra a) del apartado 1, así como prever su retirada selectiva, con el fin de evitar la mezcla entre ellos o con otros residuos no peligrosos, y asegurar su envío a gestores autorizados de residuos peligrosos.»
- [RD105] art. 2 c) 1.º, p. 5: la obra de construcción o demolición es «La construcción, rehabilitación, reparación, reforma o demolición de un bien inmueble […]».
- [RD105] DA 4.ª, p. 12: el trabajo con amianto se rige, en prevención de riesgos laborales, por el «Real Decreto 396/2006, de 31 de marzo».
- [L7/22] art. 30.1, p. 47, **VERIFICADO (texto)**: «1. Sin perjuicio de la normativa específica para determinados residuos, en las obras de demolición, deberán retirarse, prohibiendo su mezcla con otros residuos, y manejarse de manera segura las sustancias peligrosas, en particular, el amianto.»
- [L7/22] DA 14.ª, p. 101: censo municipal de instalaciones con amianto y calendario de retirada; las públicas de mayor riesgo «deberán estar gestionadas antes de 2028». Obliga al ayuntamiento, no al productor.
- **Nuevo.** [D73] art. 88.1 a), p. 107, **VERIFICADO (texto)** (orden de lectura del BOJA a dos columnas, sin ambigüedad): los poseedores tendrán que «Separar los residuos peligrosos de los no peligrosos, independientemente de la cantidad generada, siempre que sea técnicamente viable. En caso de no poder separarse, todos tendrán la consideración de residuos peligrosos.»
- [L7/22] art. 6.1, p. 26: «Cuando se indique la codificación de un residuo como peligroso, dicha codificación será vinculante.»

**INTERPRETACIÓN.** Reforma y cambio de uso con obras llevan inventario aunque no se prevean peligrosos («no se prevén»). 17 06 05* es peligroso sin entrada espejo (K-RCD.9). En Andalucía, si los peligrosos no se separan, **toda la mezcla es peligrosa** (art. 88.1 a): conviene escribirlo en el pliego (6.º).

**Consecuencia para la app.** Inventario «Código | Residuo peligroso | Elemento de origen | Cantidad | Retirada selectiva | Gestor de peligrosos» desde lo intervenido y el dato de amianto; frase del art. 88.1 a) en Andalucía; remisión al RD 396/2006.

---

## K-RCD.4 — Separación: art. 5.5 del RD 105/2008, art. 88 del Decreto 73/2012 y art. 30.2 de la Ley 7/2022

**Cita.**
- [RD105] art. 5.5, pp. 7–8, **VERIFICADO (texto)**: «5. Los residuos de construcción y demolición deberán separarse en las siguientes fracciones, cuando, de forma individualizada para cada una de dichas fracciones, la cantidad prevista de generación para el total de la obra supere las siguientes cantidades: Hormigón: 80 t. / Ladrillos, tejas, cerámicos: 40 t. / Metal: 2 t. / Madera: 1 t. / Vidrio: 1 t. / Plástico: 0,5 t. / Papel y cartón: 0,5 t. La separación en fracciones se llevará a cabo preferentemente por el poseedor de los residuos de construcción y demolición dentro de la obra en que se produzcan. Cuando por falta de espacio físico en la obra no resulte técnicamente viable efectuar dicha separación en origen, el poseedor podrá encomendar la separación de fracciones a un gestor de residuos en una instalación de tratamiento de residuos de construcción y demolición externa a la obra. En este último caso, el poseedor deberá obtener del gestor de la instalación documentación acreditativa de que éste ha cumplido, en su nombre, la obligación recogida en el presente apartado.»
- [RD105] DF 4.ª.2, p. 13: umbrales exigibles en obras iniciadas dos años después de la entrada en vigor (desde el 14-02-2010).
- [RD105] art. 5.6, p. 8: exención excepcional del órgano autonómico «siempre que la separación de los residuos no haya sido especificada y presupuestada en el proyecto de obra».
- **Nuevo.** [D73] art. 88.2, p. 107, **VERIFICADO (texto)**: «2. Las personas o entidades poseedoras separarán en la obra las fracciones de residuos previstas en el artículo 5.5 del Real Decreto 105/2008, de 1 de febrero, siempre que la generación individualizada supere los umbrales establecidos en dicho artículo. Excepcionalmente, cuando la separación no haya sido especificada ni presupuestada en el proyecto de obra y ante casos justificados y motivados, la Delegación Provincial de la Consejería competente en materia de medio ambiente podrá, mediante resolución, eximir de esta obligación para alguna o todas las fracciones.» La solicitud se presenta «con carácter previo a la solicitud de la licencia municipal», y el silencio de un mes es desestimatorio.
- [L7/22] art. 30.2, p. 47, **VERIFICADO (texto)**: «2. A partir del 1 de julio de 2022, los residuos de la construcción y demolición no peligrosos deberán ser clasificados en, al menos, las siguientes fracciones: madera, fracciones de minerales (hormigón, ladrillos, azulejos, cerámica y piedra), metales, vidrio, plástico y yeso. Asimismo, se clasificarán aquellos elementos susceptibles de ser reutilizados tales como tejas, sanitarios o elementos estructurales. Esta clasificación se realizará de forma preferente en el lugar de generación de los residuos y sin perjuicio del resto de residuos que ya tienen establecida una recogida separada obligatoria.»

**Respuesta (INTERPRETACIÓN).**
1. Madera, minerales, metales, vidrio, plástico y yeso: **clasificación obligatoria desde el 01-07-2022 sin umbral**. Los umbrales del art. 5.5 del RD y del art. 88.2 del Decreto 73/2012 ceden ante la ley en estas fracciones.
2. Papel y cartón: sigue el umbral de 0,5 t (art. 5.5).
3. Separación fuera de la obra por gestor: posible («de forma preferente en el lugar de generación»), con la acreditación del art. 5.5.
4. Elementos reutilizables: se clasifican aparte.
5. Las exenciones del art. 5.6 del RD y del art. 88.2 del Decreto 73/2012 se oponen a la obligación general del art. 30.2. **No se ofrecen.**

**Consecuencia para la app.** Lista fija de fracciones (solo las que la obra genera); papel y cartón > 0,5 t; peligrosos siempre aparte. Cita: «Ley 7/2022, art. 30.2 (desde el 01-07-2022), y RD 105/2008, art. 5.5, en lo no desplazado por aquella». Fuera las casillas de umbral de la plantilla.

---

## K-RCD.5 — Demolición selectiva

**Cita.** [L7/22] art. 30.3, p. 47, **VERIFICADO (texto)**: «3. La demolición se llevará a cabo preferiblemente de forma selectiva, y con carácter obligatorio a partir del 1 de enero de 2024, garantizando la retirada de, al menos, las fracciones de materiales indicadas en el apartado anterior, previo estudio que identifique las cantidades que se prevé generar de cada fracción, cuando no exista obligación de disponer de un estudio de gestión de residuos y prevea el tratamiento de estos según la jerarquía establecida en el artículo 8.» Párrafo final del art. 30 (p. 48): libros digitales de materiales y ecodiseño, por desarrollo reglamentario.

**INTERPRETACIÓN.** Alcanza también a la demolición parcial de una reforma. Con estudio de gestión, el «previo estudio» es el propio estudio. La ley no escribe excepciones: cualquier excepción técnica es **SIN CONFIRMAR** y no se codifica.

**Consecuencia para la app.** Texto fijo en 2.º y 6.º; fuera las casillas «Derribo integral […]» y «No se prevé operación de prevención alguna».

---

## K-RCD.6 — Ámbito: obra menor, reforma con proyecto, cambio de uso, tierras

**Cita.** [RD105], **VERIFICADO (texto)**:
- Art. 2 d), p. 5: «d) Obra menor de construcción o reparación domiciliaria: obra de construcción o demolición en un domicilio particular, comercio, oficina o inmueble del sector servicios, de sencilla técnica y escasa entidad constructiva y económica, que no suponga alteración del volumen, del uso, de las instalaciones de uso común o del número de viviendas y locales, y que no precisa de proyecto firmado por profesionales titulados.»
- DA 1.ª, p. 11: «Las obligaciones establecidas en los artículos 4 y 5 no serán de aplicación a los productores o poseedores de residuos de construcción y demolición en obras menores de construcción o reparación domiciliaria, que estarán sujetos a los requisitos que establezcan las entidades locales en sus respectivas ordenanzas municipales.»
- Art. 3.1 a), p. 6: excluidas las tierras y piedras no contaminadas reutilizadas «siempre y cuando pueda acreditarse de forma fehaciente su destino a reutilización».
- Art. 2 e) 1.º y f), pp. 5–6: productor = titular de la licencia (o del inmueble); poseedor = quien ejecuta la obra, no los trabajadores por cuenta ajena.
- **Ahora VERIFICADO (texto).** [D73] art. 79, p. 105: los RCD tendrán la consideración jurídica de «1. Municipales, cuando se generen en las obras consideradas "obras menores de construcción y reparación domiciliaria" según la definición del apartado d) del artículo 2 del Real Decreto 105/2008, de 1 de febrero.» Su régimen lo regulan las administraciones locales «conforme a lo regulado en las ordenanzas locales». Y «2. No municipales, los generados en las obras de construcción o demolición no contempladas en la letra anterior, por lo que compete a la Administración autonómica la regulación del régimen jurídico de su producción y gestión, así como la vigilancia, inspección y sanción.»

**Respuesta.** Reforma de vivienda con proyecto y cambio de uso: **no son obra menor → llevan estudio**, y sus RCD son «no municipales» en Andalucía. **CORREGIDO (encargo):** la exclusión de la obra menor está en la DA 1.ª, no en el art. 3.

---

## K-RCD.7 — Otras obligaciones del productor y del poseedor

**Cita.** [RD105], pp. 7–8, **VERIFICADO (texto)** (literales en la primera pasada; sin cambios):
- Art. 4.1.c: documentación acreditativa de la gestión; «La documentación correspondiente a cada año natural deberá mantenerse durante los cinco años siguientes.»
- Art. 4.1.d: fianza «cuando proceda, en los términos previstos en la legislación de las comunidades autónomas».
- **Art. 6.2–6.3**: «3. En aquellas obras cuyo proyecto, de acuerdo con el artículo 4, incluya un estudio de gestión de residuos de la obra, el cálculo de la cuantía de la fianza o garantía financiera equivalente establecida en el apartado anterior, se basará en el presupuesto de dicho estudio. No obstante, si se considera que el presupuesto ha sido elaborado de modo infundado a la baja, se podrá elevar motivadamente dicha fianza.»
- Arts. 5.1 (plan del poseedor, documento contractual), 5.2 (preferencia: reutilización, reciclado, otra valorización), 5.3 (documento de entrega), 5.7 (costes y certificados al productor; cinco años).
- [L7/22] art. 26.1 b), pp. 44–45: objetivo del 70 % en peso de RCD no peligrosos a valorización, «a través de los planes y programas de gestión de residuos». Es un objetivo de las administraciones.
- **Nuevo.** [D73] art. 86, p. 106, **VERIFICADO (texto)**: «1. A fin de garantizar que todos los residuos se someten a operaciones de valorización, sólo podrán depositarse en vertedero los residuos resultantes de las operaciones de valorización de residuos de construcción y demolición. 2. Solo se podrán depositar directamente en vertedero los residuos de construcción y demolición cuyo tratamiento sea técnica, medioambiental o económicamente inviable, circunstancia que deberá ser justificada en los términos previstos en el artículo 128 siguiendo el procedimiento previsto en el artículo 129.»

**Consecuencia para la app.** En 3.º, en Andalucía, **no proponer «vertedero» como destino directo** de los RCD. El destino por defecto es la planta de valorización (R). D05 (depósito en vertedero, anexo III Ley 7/2022, p. 121) solo para los rechazos del tratamiento o con la justificación del art. 86.2.

---

## K-RCD.8 — Lista europea de residuos y operaciones: cómo se citan hoy

**Cita.**
- [L7/22] art. 6.1, p. 26, **VERIFICADO (texto)**: «1. La identificación y clasificación de los residuos se hará de conformidad con la lista establecida en la Decisión 2014/955/UE de la Comisión, de 18 de diciembre de 2014, por la que se modifica la Decisión 2000/532/CE, sobre la lista de residuos, de conformidad con la Directiva 2008/98/CE del Parlamento Europeo y del Consejo, conforme a la normativa específica de residuos que se apruebe, para incluir nuevos códigos o desagregar los anteriores, cuando sea necesario por su peculiar composición o peligrosidad. Cuando se indique la codificación de un residuo como peligroso, dicha codificación será vinculante. […]»
- [LER] art. 3, p. 45: «Será aplicable a partir del 1 de junio de 2015.»
- **[DD934], VERIFICADO (texto).**
  - Art. 2 (p. 2/5): «La presente Decisión entrará en vigor a los veinte días de su publicación en el Diario Oficial de la Unión Europea. Será aplicable a partir del 9 de noviembre de 2026.»
  - **CORREGIDO** (primera pasada, que decía 09-12-2026 según un buscador). La corrección de errores que movería la fecha **no se ha leído: SIN CONFIRMAR.**
  - Anexo, ocho puntos: 1) 09 01 11*; 2) nuevas 10 08 21* a 10 08 26; 3) **sustituye el capítulo 16 06**; 4) suprime 19 02 11*; 5) añade 19 02 12* y 19 02 13*; 6) nuevo subcapítulo 19 14; 7) **suprime 20 01 33* y 20 01 34**; 8) añade 20 01 42*, 20 01 43* y 20 01 44.
  - **No toca el capítulo 17** ni los códigos 08 01 11*, 08 01 12, 13 02 05*, 15 01 xx, 15 02 02*, 20 01 21* y 20 03 01 que usa la plantilla.
  - En el nuevo 16 06, **VERIFICADO (imagen)** (p. 3/5): «16 06 04*  residuos de pilas y baterías alcalinas (distintos de los especificados en el código 16 06 03)». Es decir, **las pilas alcalinas pasan a peligrosas**. El **16 06 05 ya no existe** en la lista nueva (la secuencia salta de 16 06 04* a 16 06 06*).
- **Operaciones.** [L7/22] anexo II (valorización), pp. 119–120, y anexo III (eliminación), p. 121, **VERIFICADO (texto)**. Las que usa una obra:
  - «R0506 Valorización de residuos inorgánicos para la producción de áridos.»
  - «R0508 Valorización de materiales inorgánicos en operaciones de relleno (backfilling).»
  - «R0511 Preparación para la reutilización de residuos inorgánicos.»
  - «R1201 Clasificación de residuos.»
  - «D0501 Depósito en vertederos de residuos inertes.»
  - «D0502 Depósito en vertederos de residuos no peligrosos.»
  - «D0503 Depósito en vertederos de residuos peligrosos.»
  - **CORREGIDO** (primera pasada): «Instalaciones de producción de áridos a partir de RCDs […]» y «Instalaciones de clasificación y limpieza de residuos obtenidos en la demolición selectiva tales como tejas, piedras, etc. para su reutilización.» son textos de la columna «Tipos de instalaciones de tratamiento (lista no exhaustiva)», no el nombre de la operación.

**Texto de cita para la app.** «Códigos de la Lista europea de residuos (Decisión 2000/532/CE, en la redacción de la Decisión 2014/955/UE), conforme al art. 6.1 de la Ley 7/2022». Para obras posteriores al 09-11-2026 hay que añadir «y la Decisión Delegada (UE) 2025/934» si el estudio usa códigos de pilas. Operaciones: anexos II y III de la Ley 7/2022.

---

## K-RCD.9 — Códigos del capítulo 17 y otros para una obra de vivienda

**Cita.** [LER], DOUE L 370, pp. 78–79, **VERIFICADO (texto)**. Las descripciones son las del volcado; los guiones de partición de palabra («sustan­cias») se han unido. Las cuatro de 17 05 05* a 17 05 08, parafraseadas en la primera pasada, **coinciden ahora con el literal**.

Capítulo 17 (p. 78): «RESIDUOS DE LA CONSTRUCCIÓN Y DEMOLICIÓN (INCLUIDA LA TIERRA EXCAVADA DE ZONAS CONTAMINADAS)»

| Código | Descripción (literal) | P | Nueva | Reforma |
|---|---|---|---|---|
| **17 01** | **Hormigón, ladrillos, tejas y materiales cerámicos** | | | |
| 17 01 01 | Hormigón | | x | x |
| 17 01 02 | Ladrillos | | x | x |
| 17 01 03 | Tejas y materiales cerámicos | | x | x |
| 17 01 06* | Mezclas, o fracciones separadas, de hormigón, ladrillos, tejas y materiales cerámicos que contienen sustancias peligrosas | P | | x |
| 17 01 07 | Mezclas de hormigón, ladrillos, tejas y materiales cerámicos, distintas de las especificadas en el código 17 01 06 | | x | x |
| **17 02** | **Madera, vidrio y plástico** | | | |
| 17 02 01 | Madera | | x | x |
| 17 02 02 | Vidrio | | x | x |
| 17 02 03 | Plástico | | x | x |
| 17 02 04* | Vidrio, plástico y madera que contienen sustancias peligrosas o están contaminados por ellas | P | | x |
| **17 03** | **Mezclas bituminosas, alquitrán de hulla y otros productos alquitranados** | | | |
| 17 03 01* | Mezclas bituminosas que contienen alquitrán de hulla | P | | x |
| 17 03 02 | Mezclas bituminosas distintas de las especificadas en el código 17 03 01 | | x | x |
| 17 03 03* | Alquitrán de hulla y productos alquitranados | P | | x |
| **17 04** | **Metales (incluidas sus aleaciones)** | | | |
| 17 04 01 | Cobre, bronce, latón | | x | x |
| 17 04 02 | Aluminio | | x | x |
| 17 04 03 | Plomo | | | x |
| 17 04 04 | Zinc | | x | x |
| 17 04 05 | Hierro y acero | | x | x |
| 17 04 06 | Estaño | | | |
| 17 04 07 | Metales mezclados | | x | x |
| 17 04 09* | Residuos metálicos contaminados con sustancias peligrosas | P | | x |
| 17 04 10* | Cables que contienen hidrocarburos, alquitrán de hulla y otras sustancias peligrosas | P | | x |
| 17 04 11 | Cables distintos de los especificados en el código 17 04 10 | | x | x |
| **17 05** (p. 79) | **Tierra (incluida la tierra excavada de zonas contaminadas), piedras y lodos de drenaje** | | | |
| 17 05 03* | Tierra y piedras que contienen sustancias peligrosas | P | | |
| 17 05 04 | Tierra y piedras distintas de las especificadas en el código 17 05 03 | | x | |
| 17 05 05* | Lodos de drenaje que contienen sustancias peligrosas | P | | |
| 17 05 06 | Lodos de drenaje distintos de los especificados en el código 17 05 05 | | | |
| 17 05 07* | Balasto de vías férreas que contiene sustancias peligrosas | P | | |
| 17 05 08 | Balasto de vías férreas distinto del especificado en el código 17 05 07 | | | |
| **17 06** | **Materiales de aislamiento y materiales de construcción que contienen amianto** | | | |
| 17 06 01* | Materiales de aislamiento que contienen amianto | P | | x |
| 17 06 03* | Otros materiales de aislamiento que consisten en sustancias peligrosas o contienen dichas sustancias | P | | x |
| 17 06 04 | Materiales de aislamiento distintos de los especificados en los códigos 17 06 01 y 17 06 03 | | x | x |
| 17 06 05* | Materiales de construcción que contienen amianto | P | | x |
| **17 08** | **Materiales de construcción a base de yeso** | | | |
| 17 08 01* | Materiales de construcción a base de yeso contaminados con sustancias peligrosas | P | | x |
| 17 08 02 | Materiales de construcción a base de yeso distintos de los especificados en el código 17 08 01 | | x | x |
| **17 09** | **Otros residuos de construcción y demolición** | | | |
| 17 09 01* | Residuos de construcción y demolición que contienen mercurio | P | | x |
| 17 09 02* | Residuos de construcción y demolición que contienen PCB (por ejemplo, sellantes que contienen PCB, revestimientos de suelo a base de resinas que contienen PCB, acristalamientos dobles que contienen PCB, condensadores que contienen PCB) | P | | x |
| 17 09 03* | Otros residuos de construcción y demolición (incluidos los residuos mezclados) que contienen sustancias peligrosas | P | | x |
| 17 09 04 | Residuos mezclados de construcción y demolición distintos de los especificados en los códigos 17 09 01, 17 09 02 y 17 09 03 | | x | x |

Notas: 38 códigos. No existen 17 06 02, 17 07 ni 17 08 03. Las columnas «Nueva» y «Reforma» son **INTERPRETACIÓN** (catálogo propuesto), no norma.

Otros capítulos, **VERIFICADO (texto)**:

| Código | Descripción (literal) | P | Página DOUE | 2025/934 |
|---|---|---|---|---|
| 08 01 11* | Residuos de pintura y barniz que contienen disolventes orgánicos u otras sustancias peligrosas | P | 60 | sin cambio |
| 08 01 12 | Residuos de pintura y barniz, distintos de los especificados en el código 08 01 11 | | 60 | sin cambio |
| 13 02 05* | Aceites minerales no clorados de motor, de transmisión mecánica y lubricantes | P | 72 | sin cambio |
| 15 01 01 | Envases de papel y cartón | | 74 | sin cambio |
| 15 01 02 | Envases de plástico | | 74 | sin cambio |
| 15 01 03 | Envases de madera | | 74 | sin cambio |
| 15 01 10* | Envases que contienen restos de sustancias peligrosas o están contaminados por ellas | P | 74 | sin cambio |
| 15 02 02* | Absorbentes, materiales de filtración (incluidos los filtros de aceite no especificados en otra categoría), trapos de limpieza y ropas protectoras contaminados por sustancias peligrosas | P | 74 | sin cambio |
| 16 06 04 | Pilas alcalinas (excepto 16 06 03) | | 76 | **cambia el 09-11-2026**: pasa a 16 06 04*, «residuos de pilas y baterías alcalinas (distintos de los especificados en el código 16 06 03)» (orden de lectura) |
| 16 06 05 | Otras pilas y acumuladores | | 76 | **desaparece el 09-11-2026** |
| 20 01 21* | Tubos fluorescentes y otros residuos que contienen mercurio | P | 85 | sin cambio |
| 20 03 01 | Mezclas de residuos municipales | | 86 | sin cambio |

**Mal codificado en la plantilla** (INTERPRETACIÓN el juicio):
- 01 04 08 «Residuos de grava y rocas trituradas distintos de los mencionados en el código 01 04 07» y 01 04 09 «Residuos de arena y arcillas» ([LER] p. 49; la plantilla escribe «arcilla») son del capítulo 01, residuos de minería: no son RCD.
- «17 01 07» repetido en dos grupos: doble cómputo posible.
- «a partir de Yeso»: redacción de 2002. La vigente es «a base de yeso».
- «Pilas alcalinas y salinas»: desde el 09-11-2026 son 16 06 04* (peligrosas); el 16 06 05 desaparece.

---

## K-RCD.10 — Andalucía: Ley 3/2023 de Economía Circular

**Respuesta.** **No añade contenido al estudio.** Con rango de ley, obliga a constituir la fianza, sin cuantía.

**Cita.** [L3/23], **VERIFICADO (texto)** (antes LEÍDO (web); los literales coinciden salvo la DF 6.ª):
- Art. 70.1, p. 39: «1. Las personas o entidades productoras de residuos de construcción y demolición tendrán que constituir las fianzas o garantías para asegurar la correcta gestión de los residuos generados, en los términos previstos en la normativa estatal, autonómica y local.» Aps. 2 y 3: puntos limpios con espacios para RCD de competencia municipal; agilización del almacenamiento temporal de RCD no municipales, «principalmente en el entorno rural», y uso de RCD valorizados y tecnosuelos en rellenos.
- Art. 67.2, p. 38: el literal de la primera pasada coincide. Art. 67.1 b): fomento de materiales reutilizados o procedentes de residuos y de la construcción «en seco».
- Disp. derogatoria única, p. 50: «Quedan derogadas cuantas disposiciones de igual o inferior rango se opongan a lo establecido en la presente Ley o lo contradigan.»
- DF 6.ª, p. 53. **CORREGIDO** (la primera pasada omitía la última palabra): «8. Información sobre las fianzas para asegurar la correcta gestión de los residuos de construcción y demolición generados.»
- DF 11.ª «Cuantía de fianzas o garantías», p. 54: «En el plazo de un año desde la entrada en vigor de esta Ley, la Consejería competente en materia de medio ambiente aprobará las correspondientes normas técnicas para la determinación de las cuantías de las fianzas u otras garantías financieras que se deban constituir cuando así lo exijan las normas que regulan la gestión de residuos peligrosos u otros específicos o las que regulan operaciones de gestión y eliminación de residuos.»

**INTERPRETACIÓN.** La DF 11.ª podría alcanzar la fianza de RCD: el Decreto 73/2012 trata los RCD en su Título V, «RESIDUOS ESPECÍFICOS» (p. 105). Pero la DF habla de las fianzas que exigen las normas de gestión, más propia de los gestores. **SIN CONFIRMAR** si esas normas técnicas se han aprobado.

---

## K-RCD.11 — Decreto 73/2012 y LEGAM: vigencia

**LEGAM**, [LEGAM], **VERIFICADO (texto)**:
- DF 7.ª, p. 136: «La presente ley entrará en vigor a los tres meses de su publicación en el "Boletín Oficial de la Junta de Andalucía".» Con el BOJA núm. 55, de 20-03-2026, son **el 20-06-2026** (INTERPRETACIÓN del cómputo de fecha a fecha).
- Disp. derogatoria única, pp. 120–121: «1. Quedan derogadas cuantas disposiciones de igual o inferior rango se opongan a lo previsto en esta ley. 2. Quedan derogadas, en particular, las siguientes normas: a) Ley 7/2007, de 9 de julio, de Gestión Integrada de la Calidad Ambiental. b) Decreto 297/1995 […]. c) Apartado 1 y apartado 5 del anexo VIII del Decreto 356/2010 […]. 3. Las referencias contenidas en normas vigentes a las disposiciones que se derogan expresamente deberán entenderse efectuadas a las disposiciones de esta ley que regulan la misma materia que aquellas. 4. Las disposiciones dictadas en desarrollo y ejecución de la Ley 7/2007, de 9 de julio, conservarán su vigencia en todo aquello que no contradiga lo dispuesto en esta ley.»
- Art. 138, p. 96: «1. En la materia relativa a residuos y economía circular, corresponde a la Consejería competente en materia de medio ambiente el ejercicio de las competencias autonómicas previstas en el artículo 12.4 de la Ley 7/2022, de 8 de abril, y en la Ley 3/2023, de 30 de marzo. 2. A las entidades locales corresponde el ejercicio de las competencias que les atribuye el artículo 12.5 de la Ley 7/2022, de 8 de abril, así como las previstas en el artículo 9.6 de la Ley 5/2010, de 11 de junio, y en la Ley 3/2023, de 30 de marzo.»
- **Búsqueda en todo el volcado:**
  - «construcción y demolición», «obra menor» y «escombro»: 0 apariciones.
  - «fianza»: solo en vertidos al dominio público hidráulico (modificación de la Ley de Aguas).
  - «73/2012»: 0 apariciones.
  - «demolición»: solo en la definición de «proyecto» y en el contenido de documentos ambientales.
  - → La LEGAM **no regula la fianza de RCD**.
- Consolidado: «Última modificación: sin modificaciones» (p. 4). **CORREGIDO**: la corrección de errores (BOJA 134/2026) de la primera pasada no consta en el consolidado → SIN CONFIRMAR.

**Decreto 73/2012.** Original, VERIFICADO (texto). Modificaciones por la Ley 3/2023 (DF 5.ª y 6.ª), que no tocan los arts. 79–89. Anulaciones del TSJA de 2015, ajenas a estos artículos: LEÍDO (web, secundaria).
- DT 10.ª.2, p. 76: los entes locales dispondrán «de un plazo de un año desde la entrada en vigor de este Decreto para regular mediante ordenanza la constitución de la fianza que condiciona el otorgamiento de la licencia de obras a la que se hace referencia en el artículo 104 de la Ley 7/2007, de 9 de julio.»
- Art. 89 «Ordenanzas sobre residuos de construcción y demolición», p. 107: «Los entes locales aprobarán una ordenanza que regule la prevención, producción, posesión, transporte, gestión y destino de los residuos de construcción y demolición en su ámbito territorial de actuación así como los mecanismos para el cálculo, la prestación y el retorno de la fianza. La elaboración de esta ordenanza podrá omitirse cuando sus previsiones estén incluidas en la ordenanza para la prevención y gestión de los residuos prevista en el artículo 59.»

**INTERPRETACIÓN.** Los arts. 79–89 siguen vigentes: no contradicen la LEGAM, que no regula la materia (disp. derogatoria ap. 4). Tienen además el respaldo del art. 70.1 de la Ley 3/2023 y de los arts. 4.1.d y 6.2 del RD 105/2008. La remisión del art. 80.1 y de la DT 10.ª al «artículo 104 de la Ley 7/2007» se queda sin destino: la LEGAM no tiene un artículo «que regul[e] la misma materia» (ap. 3). **No imprimirla.** La ordenanza de RCD de cada municipio puede estar dentro de su ordenanza general de residuos (art. 89).

---

## K-RCD.12 — Fianza: cómo se fija y quién la exige

**Cita.** [D73], **VERIFICADO (texto)**. Antes LEÍDO (web); el literal de los arts. 80 y 81 de la primera pasada coincide palabra por palabra con el BOJA.
- Art. 80, p. 105: «1. Los proyectos de obra sometidos a licencia municipal deberán incluir la estimación de la cantidad de residuos de construcción y demolición que se vayan a producir y las medidas para su clasificación y separación por tipos en origen, de conformidad con el artículo 104.1 de la Ley 7/2007, de 9 de julio. Para el otorgamiento de la licencia municipal de obras, las personas o entidades productoras tendrán que constituir a favor del Ayuntamiento una fianza o garantía financiera equivalente, a fin de asegurar la correcta gestión de los residuos generados. 2. No se podrán conceder licencias municipales de obra sin que se haya constituido previamente la fianza, la cual se reintegrará a la persona o entidad productora en el momento en que aporte el certificado emitido por persona autorizada acreditativo de la operación de valorización y eliminación a la que han sido destinados los residuos, de acuerdo con el modelo del Anexo XII.»
- Art. 81, p. 105: «1. El cálculo de las garantías financieras previstas en el artículo anterior se realizará según establezca la ordenanza municipal, fijándose las cuantías sobre la base del presupuesto de ejecución material total de la obra, aplicando como mínimo los siguientes porcentajes: a) Para obras de derribo: 2%. b) Para obras de nueva construcción: 1%. c) Para obras de excavación: 2%. Cuando en la obra o actuación concurran simultáneamente varios de los supuestos anteriores, el cálculo de la garantía financiera se podrá realizar aplicando cada uno de estos porcentajes a sus correspondientes partidas presupuestarias. No obstante, si se considera que el presupuesto ha sido elaborado de modo infundado a la baja, se podrá elevar motivadamente dicha fianza. 2. Los entes locales podrán definir otros criterios alternativos para el cálculo de la fianza con el objeto de garantizar la adecuada gestión de los residuos generados en las obras. 3. En el caso de obras menores que no requieran presentar un proyecto técnico, los entes locales establecerán la fianza sobre la base del presupuesto de ejecución material de la obra o bien fijarán una cuantía mínima regulada en las ordenanzas aprobadas al efecto.»
- Art. 82.1, p. 105 (ahora literal): en las obras públicas exentas de licencia, el contratista «deberá constituir una fianza o garantía financiera equivalente a favor de la Consejería competente en medio ambiente, […] de conformidad con el artículo 6.2 del Real Decreto 105/2008 de 1 de febrero. La forma de constitución de la fianza y el importe de la misma se determinarán en base al presupuesto de ejecución material de la obra, aplicándole los criterios de cálculo establecidos en el artículo 81.»
- Art. 83, pp. 105–106: la valorización y eliminación de RCD están sujetas a autorización. El gestor sin autorización de peligrosos debe tener un procedimiento de admisión que segregue los peligrosos «en cumplimiento del artículo 7.d) del Real Decreto 105/2008».
- [RD105] art. 6.3, p. 8: con estudio, la fianza «se basará en el presupuesto de dicho estudio».

**INTERPRETACIÓN.**
- Dos bases distintas: el presupuesto del estudio (RD, básico) y el PEM total con mínimos porcentuales (Decreto 73/2012). La segunda frase es idéntica en los dos textos. Manda la ordenanza (arts. 81.1 y 89).
- Reforma y cambio de uso no están entre los supuestos a), b) y c). El 2 % de «derribo» sobre las partidas de demolición es lo más defendible, pero **no es un literal**: no se codifica como regla.

**Ordenanzas de Málaga y Benalmádena: SIN CONFIRMAR** (no encontradas). Dato útil: la guía [RAT20] (anexo 1, p. 28) cita entre sus fuentes a los colegios de Málaga con «Normativa, EGR y Tablas de Ratios». Puede haber ratios o criterios locales.

**Consecuencia para la app.** Fianza = dato del proyectista (importe, criterio, artículo de la ordenanza). La app muestra dos referencias con su cita: el coste del 7.º (RD 105/2008 art. 6.3) y el mínimo del art. 81.1 sobre las partidas que el proyectista marque.

---

## K-RCD.13 — Ratios «del ITEC» de la plantilla

Sin cambios respecto a la primera pasada. **VERIFICADO (texto)** en la plantilla: vivienda, en m³/m² de demolición, fábrica 0,068 + 0,656 + 0,002 = 0,726 y hormigón 0,064 + 0,829 + 0,002 = 0,895. Obra nueva: S × 0,2; densidad 0,5–1,5 t/m³. El documento ITEC de origen no está identificado (**SIN CONFIRMAR**). **No citable.** Son de demolición completa, sin reforma, en tres grupos y no por código.

---

## K-RCD.14 — Guía CGATE-CSCAE «Ratios Nacionales» (2020) y otras alternativas

**Lo verificado** ([RAT20], **VERIFICADO (texto)**):
- Portada y créditos: «Edición 2020». Autores: Helena Granados Menéndez, José Fernández Castillo y Juan López-Asiain Martínez. ISBN 978-84-09-21237-8. Licencia **«Creative Commons Reconocimiento-NoComercial-SinObraDerivada 4.0 Internacional (CC BY-NC-ND 4.0)»**: no permite uso comercial ni distribuir el material modificado.
- Índice: tablas «a. Residencial obra nueva», con «1) Mediterráneo Litoral» en la p. 18, y «b. Residencial demolición», con Mediterráneo Litoral en la p. 23. **No hay tablas de reforma ni de rehabilitación.**
- Metodología, pp. 9–10: ratios por m² de obra «globales y para cada Código LER», en peso (T/m²) y volumen (m³/m²); densidades ρap (aparente) y ρtab (tabulada); factor de conversión de esponjamiento (F.C.E.). El dato prioritario es el peso por código LER. Las «Tierras y pétreos de la excavación» se excluyen de las tablas.
- Pp. 15–16: el técnico determina «que región es la más asimilable a la tipología constructiva». Las tablas son «Residencial y terciario – Obra Nueva» y «Residencial y terciario – Demolición». Son ratios «orientativos».
- Anexo 2, p. 30: «Málaga: Mediterráneo» (también Cádiz, Granada y Huelva; Sevilla, Córdoba y Jaén son «Continental Sur»; Almería, «Semiárido»).
- **Las tablas de valores (pp. 18–27) no están en el volcado: son imagen. → SIN CONFIRMAR.** Hay que transcribirlas en imagen (render de página) celda a celda.

**INTERPRETACIÓN (licencia).** CC BY-NC-ND 4.0 impide meter los valores de la guía en una app de uso comercial sin permiso del CGATE y el CSCAE. Dos salidas: pedir permiso, o que el proyectista teclee el ratio citando la guía (es su uso profesional, no una redistribución de la app).

Resto de alternativas: sin cambios respecto a la primera pasada. El modelo COAM/CM (20 cm/m² obra nueva, 10–20 cm/m² reforma), los planes caducados (Madrid 2006-2016, PNRCD 2001-2006), el PEMAR 2025-2035, el PIRec 2030 y Cataluña / País Vasco siguen sin tabla oficial leída.

---

## K-RCD.15 — Densidades por material: CTE DB SE-AE, anejo C (nuevo)

**Cita.** [SE-AE] «Abril 2009», **VERIFICADO (texto)**.
- B.3.3 (p. 17): «A efectos prácticos se podrá considerar la siguiente correspondencia entre las unidades de fuerza de los sistemas MKS y SI: 1 kilopondio [1 kp] = 10 Newton [10 N].» → **1 kN/m³ ≈ 0,1 t/m³.**
- Son pesos específicos **del material en obra** (volumen macizo), no densidades aparentes de escombro. Para el volumen de contenedor falta el esponjamiento (SIN CONFIRMAR).
- Tabla C.1 «Peso específico aparente de materiales de construcción» (p. 18). **Columna izquierda VERIFICADO (texto).** Columna derecha (madera, metales, plásticos, otros): emparejada por orden de lectura y **cotejada en imagen el 2026-10-16 → VERIFICADO (imagen)**. «Mortero de yeso 12,0 a 28,0» y «13,o a 16,0» (bloque hueco de cemento) están así en el original. El emparejamiento cuadra con los valores físicos conocidos (acero 77–78,5; aluminio 27; cobre 87–89; vidrio 25).

| Material (Tabla C.1, salvo otra indicación) | kN/m³ | ≈ t/m³ | Columna | Código LER |
|---|---|---|---|---|
| Hormigón normal ⁽¹⁾ | 24,0 | 2,4 | izq. | 17 01 01 |
| Hormigón armado (nota (1): «En hormigón armado con armados usuales o fresco aumenta 1 kN/m3») | 25,0 | 2,5 | izq. | 17 01 01 |
| Hormigón ligero | 9,0 a 20,0 | 0,9–2,0 | izq. | 17 01 01 |
| Mortero de cemento | 19,0 a 23,0 | 1,9–2,3 | izq. | 17 01 07 |
| Mortero de cemento y cal | 18,0 a 20,0 | 1,8–2,0 | izq. | 17 01 07 |
| Mortero de cal | 12,0 a 18,0 | 1,2–1,8 | izq. | 17 01 07 |
| Mortero de yeso | «12,0 a 28,0» (así en el volcado; **cotejar**, el límite superior parece errata) | — | izq. | 17 08 02 |
| Ladrillo cerámico macizo | 18,0 | 1,8 | izq. | 17 01 02 |
| Ladrillo cerámico perforado | 15,0 | 1,5 | izq. | 17 01 02 |
| Ladrillo cerámico hueco | 12,0 | 1,2 | izq. | 17 01 02 |
| Ladrillo silicocalcáreo | 20,0 | 2,0 | izq. | 17 01 02 |
| Bloque hueco de cemento | 13,0 a 16,0 (volcado: «13,o») | 1,3–1,6 | izq. | 17 01 07 |
| Bloque hueco de yeso | 10,0 | 1,0 | izq. | 17 08 02 |
| Calizas compactas, mármoles | 28,0 | 2,8 | izq. | 17 01 07 (piedra) |
| Granito | 27,0 a 30,0 | 2,7–3,0 | izq. | 17 01 07 (piedra) |
| Terracota compacta | 21,0 a 27,0 | 2,1–2,7 | izq. | 17 01 03 |
| Baldosa cerámica | 18,0 | 1,8 | der. | 17 01 03 |
| Baldosa de gres | 19,0 | 1,9 | der. | 17 01 03 |
| Pizarra | 29,0 | 2,9 | der. | 17 01 07 (piedra) |
| Vidrio | 25,0 | 2,5 | der. | 17 02 02 |
| Madera aserrada, tipos C14 a C40 | 3,5 a 5,0 | 0,35–0,5 | der. | 17 02 01 |
| Madera laminada encolada | 3,7 a 4,4 | 0,37–0,44 | der. | 17 02 01 |
| Tablero contrachapado | 5,0 | 0,5 | der. | 17 02 01 |
| Tablero de fibras | 8,0 a 10,0 | 0,8–1,0 | der. | 17 02 01 |
| Acero | 77,0 a 78,5 | 7,7–7,85 | der. | 17 04 05 |
| Aluminio | 27,0 | 2,7 | der. | 17 04 02 |
| Cobre | 87,0 a 89,0 | 8,7–8,9 | der. | 17 04 01 |
| Plomo | 112,0 a 114,0 | 11,2–11,4 | der. | 17 04 03 |
| Zinc | 71,0 a 72,0 | 7,1–7,2 | der. | 17 04 04 |
| Asfalto | 24,0 | 2,4 | der. | 17 03 02 |
| Poliestireno expandido | 0,3 | 0,03 | der. | 17 06 04 |
| Yeso suelto (Tabla C.6, a granel) | 15 | 1,5 | izq. | 17 08 02 |
| Arena y grava (Tabla C.6, a granel) | 15 a 20 | 1,5–2,0 | izq. | 17 05 04 / 17 01 07 |

Pesos por superficie útiles para estimar por partidas (VERIFICADO (texto)):
- Tabla C.4, p. 20: tabiques sin revestir de «Rasilla, 30 mm de espesor 0,40», «Ladrillo hueco, 45 mm de espesor 0,60» y «de 90 mm de espesor 1,00» kN/m². Los valores de los revestimientos por cara no salen en el volcado.
- Tabla C.5, p. 20, solados (incluido el material de agarre): «Pavimento de madera, cerámico o hidráulico sobre plastón; grueso total < 0,08 m 1,0» kN/m². Particiones (altura libre del orden de 3,0 m, con enlucido), en kN/m lineal: «Tablero o tabique simple; grueso total< 0,09 m 3»; «Tabicón u hoja simple de albañilería; grueso total < 0,14 m 5».
- Tabla C.3, p. 20 (baldosa con material de agarre por espesor): los valores salen desordenados en el volcado → cotejar.

**Consecuencia para la app.** Tabla de densidades versionada (DB SE-AE, abril 2009, anejo C) para el método por partidas. La columna derecha de C.1 y el mortero de yeso están cotejados en imagen (2026-10-16). El intervalo del mortero de yeso (12,0 a 28,0) es el del original, aunque es muy ancho: se codifica tal cual y el proyectista puede ajustarlo.

---

## K-RCD.16 — Recomendación para la app (ratios y estimación)

**INTERPRETACIÓN** (actualiza la primera pasada):
1. **Obra existente (reforma, cambio de uso): método por partidas.** m² demolidos × espesor = m³ macizos; × densidad DB SE-AE anejo C = t; cada partida con su código LER. Para los tabiques y solados más comunes se pueden usar directamente los pesos por m² de las tablas C.4 y C.5 (kN/m² × 0,1 = t/m²). Volumen aparente: macizo × esponjamiento, dato del proyectista (SIN CONFIRMAR una fuente oficial).
2. **Obra nueva y demolición completa:** ratio por m² de la guía CGATE-CSCAE, región Mediterráneo Litoral para Málaga. Hasta transcribir las tablas, y salvo permiso por la licencia NC-ND, **el ratio lo teclea el proyectista** con su fuente. Alternativa: los de la plantilla, declarados como criterio del redactor.
3. El proyectista declara siempre: método, fuente y edición del ratio, densidades, esponjamiento, precios de gestión, gestor y operación R/D, fianza (importe, criterio, artículo de ordenanza) y amianto.
4. No usar la horquilla 0,5–1,5 t/m³ como dato único.

---

## K-RCD.17 — Plantilla del ejemplo 25P011: qué está mal o derogado

| En la plantilla | Problema | Criterio |
|---|---|---|
| Lista europea «publicada por Orden MAM/304/2002 […]» | Orden derogada (Ley 7/2022, disp. derogatoria 1.ª.3). Citar Decisión 2014/955/UE | K-RCD.8 |
| «Ley 10/1998, Real Decreto 833/88, R.D. 952/1997 y Orden MAM/304/2002» | Ley 10/1998 derogada (2011); RD 833/1988 y Orden MAM/304/2002 derogados (2022); el RD 952/1997 modifica el RD 833/1988 (vigencia propia no comprobada) | K-RCD.1 |
| «Ley 5/2003, Decreto 4/1991» (Madrid); Registro de Transportistas «del art. 43 de la Ley 5/2003 […] de la Comunidad de Madrid»; banda reflectante de 15 cm | Normas madrileñas, no rigen en Andalucía. Citar Ley 3/2023, Decreto 73/2012 y la ordenanza | K-RCD.10–12 |
| «Anejo III.B de la Decisión Comisión 96/350/CE» | Superada: anexos II y III de la Ley 7/2022 | K-RCD.8 |
| «Punto 17 06 05* (6), para considerar dichos residuos como peligrosos o como no peligrosos» | 17 06 05* es siempre peligroso; codificación vinculante (Ley 7/2022 art. 6.1) | K-RCD.3, K-RCD.9 |
| Casillas «que superen […] las cantidades limitantes» del art. 5.5 | Ley 7/2022 art. 30.2: seis fracciones sin umbral desde el 01-07-2022 | K-RCD.4 |
| «Realización de demolición selectiva» opcional; «Derribo integral […]»; «No se prevé operación de prevención alguna» | Demolición selectiva obligatoria desde el 01-01-2024 | K-RCD.5 |
| Destinos «Restauración / Verted.», «Reciclado / Vertedero», «Tratamiento / Depósito» | En Andalucía, vertedero directo solo si el tratamiento es inviable y se justifica (Decreto 73/2012 art. 86) | K-RCD.7 |
| Tabla de demolición del ITEC aplicada a la superficie del caso | Ratio de demolición completa en una reforma interior; sin t y m³ por código | K-RCD.2, K-RCD.13 |
| 01 04 08 y 01 04 09 («arena y arcilla»; el literal es «arcillas») | Capítulo 01, minería: no son RCD | K-RCD.9 |
| «17 01 07» en dos grupos | Doble cómputo | K-RCD.9 |
| «a partir de Yeso» | Hoy «a base de yeso» | K-RCD.9 |
| «Pilas alcalinas y salinas» (16 06 04, 16 06 05) | Desde el 09-11-2026, 16 06 04* (peligroso) y el 16 06 05 desaparece (Decisión Delegada (UE) 2025/934) | K-RCD.8 |
| Nota: en proyecto básico «sólo deberá indicarse el presupuesto de ejecución material aproximado […]» | RD 105/2008 art. 4.2 exige 1.º, 2.º, 3.º, 4.º, 7.º y el inventario | K-RCD.2 |

---

## Para la app (fase 8)

### Qué se codifica (datos versionados para `shared/tablas`)

```jsonc
// rcd/ler.json — K-RCD.9   veredicto: VERIFICADO (texto)
{
  "db": "Decisión 2000/532/CE (Lista de residuos)", "edicion": "Decisión 2014/955/UE",
  "fecha": "2014-12-18 (aplicable 2015-06-01)", "articulo": "Ley 7/2022, art. 6.1",
  "tabla": "Anexo, cap. 17 (DOUE L 370 pp. 78–79) + 08 01, 13 02, 15 01, 15 02, 16 06, 20 01, 20 03",
  "fuente": "DOUE L 370, 30-12-2014 (PDF), volcado pdftotext",
  "codigos": [ { "codigo": "17 01 01", "descripcion": "Hormigón", "peligroso": false, "pagina": 78 }, "… los 38 del cap. 17 y los 12 de otros capítulos de K-RCD.9" ],
  "versiones": [ { "desde": "2026-11-09", "norma": "Decisión Delegada (UE) 2025/934, art. 2",
                   "cambios": { "16 06 04": { "peligroso": true, "descripcion": "residuos de pilas y baterías alcalinas (distintos de los especificados en el código 16 06 03)", "veredicto": "INTERPRETACIÓN (orden de lectura)" },
                                "16 06 05": "suprimido" } } ]
}

// rcd/operaciones.json — K-RCD.8   veredicto: VERIFICADO (texto)
{ "db": "Ley 7/2022", "edicion": "consolidado 2025-04-02", "tabla": "anexos II (pp. 119–120) y III (p. 121)",
  "R0506": "Valorización de residuos inorgánicos para la producción de áridos.",
  "R0508": "Valorización de materiales inorgánicos en operaciones de relleno (backfilling).",
  "R0511": "Preparación para la reutilización de residuos inorgánicos.",
  "R1201": "Clasificación de residuos.",
  "D0501": "Depósito en vertederos de residuos inertes.", "D0502": "Depósito en vertederos de residuos no peligrosos.", "D0503": "Depósito en vertederos de residuos peligrosos." }

// rcd/fracciones-separacion.json — K-RCD.4   VERIFICADO (texto) + INTERPRETACIÓN
{ "db": "Ley 7/2022", "articulo": "art. 30.2", "pagina": 47, "vigente_desde": "2022-07-01",
  "fracciones_sin_umbral": ["madera", "minerales (hormigón, ladrillos, azulejos, cerámica y piedra)", "metales", "vidrio", "plástico", "yeso"],
  "reutilizables": ["tejas", "sanitarios", "elementos estructurales"],
  "residual_RD105_art5_5": { "papel y cartón": 0.5 },
  "andalucia": "peligrosos separados siempre; si no, toda la mezcla es peligrosa (Decreto 73/2012 art. 88.1 a, p. 107)",
  "exenciones": [] }

// rcd/demolicion-selectiva.json — K-RCD.5   VERIFICADO (texto)
{ "db": "Ley 7/2022", "articulo": "art. 30.3", "pagina": 47, "obligatoria_desde": "2024-01-01", "excepciones": [] }

// rcd/fianza.json — K-RCD.12   VERIFICADO (texto); solo referencias mostradas
{ "estatal":   { "db": "RD 105/2008", "articulo": "art. 6.3", "pagina": 8, "base": "presupuesto del estudio (4.1.a 7.º)" },
  "andalucia": { "db": "Decreto 73/2012", "edicion": "BOJA 81, 2012-04-26 (original)", "articulo": "art. 81.1", "pagina": 105,
                 "base": "PEM total", "minimos_pct": { "derribo": 2, "nueva_construccion": 1, "excavacion": 2 },
                 "manda": "ordenanza municipal (arts. 81.2 y 89)" } }

// rcd/densidades-se-ae.json — K-RCD.15   VERIFICADO (texto) col. izq.; col. der. VERIFICADO (imagen)
{ "db": "CTE DB SE-AE", "edicion": "Abril 2009", "articulo": "Anejo C", "tabla": "C.1 (p. 18), C.4–C.6 (pp. 20–21)",
  "unidad": "kN/m3", "conversion": "B.3.3: 1 kp = 10 N → t/m3 ≈ kN/m3 × 0,1",
  "nota": "peso del material en obra, no densidad aparente del escombro",
  "valores": "tabla de K-RCD.15" }
```

Reglas del motor y textos de cita: los de la primera pasada, más:
- Andalucía: frase del art. 88.1 a) en el pliego.
- Destino por defecto, planta de valorización (R). Vertedero solo como rechazo, o con la justificación del art. 86.2 del Decreto 73/2012.
- Códigos de pilas según la fecha de la obra (antes o después del 09-11-2026).
- No imprimir las remisiones al «artículo 104 de la Ley 7/2007».

### Qué se pide al proyectista

Lo de la primera pasada, más: espesor por partida (para el método por partidas), ratio por m² con su fuente en obra nueva o demolición completa, y si prevé planta móvil (Decreto 73/2012 art. 85: debe constar en el proyecto de ejecución).

### Qué queda SIN CONFIRMAR (no se codifica)

- **Tablas de la guía CGATE-CSCAE (pp. 18–27): son imagen**, no salen en el texto. Hay que transcribirlas en imagen. Su licencia CC BY-NC-ND 4.0 condiciona además meterlas en la app.
- Tabla C.3 del DB SE-AE: cotejo en imagen. (La columna derecha de C.1 y el mortero de yeso ya están cotejados, 2026-10-16.)
- Esponjamiento: sin fuente oficial legible (la guía lo da en imagen).
- Mapeo nombre–código del nuevo 16 06 de la Decisión Delegada 2025/934 (orden de lectura) y la corrección de errores que movería la fecha al 09-12-2026.
- Ordenanzas de RCD de Málaga y de Benalmádena.
- Normas técnicas de la DF 11.ª de la Ley 3/2023.
- Corrección de errores de la LEGAM (BOJA 134/2026).
- Vigencia del RD 952/1997; PEMAR 2025-2035; fuente primaria de los ratios ITEC; edición vigente del DB SE-AE (se ha leído la de abril de 2009).
- Excepciones técnicas a la demolición selectiva.

### Qué está mal o derogado en la plantilla del ejemplo

Ver K-RCD.17.
