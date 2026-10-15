# Verificación normativa — Estudio básico de seguridad y salud (Fase 8 de PLAN-MEMORIA.md)

**Fecha:** 2026-10-15 · **Revisión 2026-10-16: cotejo en texto** (ver «Método») · Agente: cte-normativa · **No se ha editado código.**
**Encargo:** la pregunta 11 de `PLAN-MEMORIA.md` §4.2 (RD 1627/1997: art. 4, jornadas, art. 6, anexo II, anexo IV, modificaciones, amianto, coordinación y subcontratación, obras pequeñas y coordinadores) y el catálogo de riesgos por fase de obra que pide §5.8. Criterios numerados **K-SYS.1 … K-SYS.14**, en el orden de las preguntas, y una sección final «Para la app (fase 8)».

**Método y límites**
- **Cotejo en texto (2026-10-16).** El coordinador bajó los PDF oficiales y los pasó a texto con `pdftotext -layout` (`…\scratchpad\fase8\txt\`; PDF en `…\fase8\pdf\`). Con ellos se ha cotejado palabra por palabra lo que antes era LEÍDO (web) o SIN CONFIRMAR de cuatro fuentes:
  - **RD 1627/1997**, consolidado del BOE (`BOE-A-1997-22614.txt`, 22 pp.). Página = la del pie «Página N» del PDF consolidado.
  - **RD 396/2006**, consolidado del BOE (`BOE-A-2006-6474.txt`). Página = pie «Página N».
  - **VII CGSC**, PDF original del BOE núm. 228, 23-09-2023 (`BOE-A-2023-19903.txt`). Se cita la página del BOE («Pág. 129148») y la del PDF (= pág. − 129032).
  - **Guía técnica del INSST, 2019** (`guia-insst-2019.txt`). Se cita el **folio impreso** y la **página del PDF**, que es folio − 1 (comprobado contando saltos de página: el folio 8 cae en la p. 7 del PDF, el 63 en la 62 y la serie sigue sin saltos hasta el folio 142).
- Lo que coincide palabra por palabra pasa a **VERIFICADO (texto)**, con página. Lo que no coincide, o lo que el lector web se saltó, va como **CORREGIDO**.
- **No cotejado en texto** (sigue LEÍDO (web)): RD 486/1997, RD 1215/1997, RD 171/2004, Ley 31/1995, Ley 32/2006, Orden TAS/2926/2002, CTE Parte I, el «Análisis» del BOE (lista de normas modificadoras del RD 1627; el PDF consolidado no trae notas de modificación) y la FAQ del INSST.
- **Modelo de la CNSST de 2011**: no hay copia; sigue **SIN CONFIRMAR**. Directiva (UE) 2023/2668 y proyecto de RD de amianto: siguen **SIN CONFIRMAR**.
- Esta materia **no es CTE**: no hay «DB con comentarios». La escala «LEÍDO (comentario)» se usa para los documentos **no vinculantes del INSST** (Guía técnica, NTP, FAQ). La disposición final primera del RD 1627/1997 habla de una Guía técnica «de carácter no vinculante». Cuando el texto de la Guía se ha cotejado, se escribe **LEÍDO (comentario), cotejado en texto**, con página.

**Veredictos** (los mismos de `verificacion-memoria.md`):
- **VERIFICADO (imagen)** / **VERIFICADO (texto)**: literal de la norma, con página.
- **LEÍDO (web)**: boe.es en HTML, lectura resumida, literal pedido por trozos.
- **LEÍDO (comentario)**: documento técnico del INSST (Guía técnica, NTP, FAQ). No es reglamentario.
- **INTERPRETACIÓN**: se sigue de la norma, pero la norma no lo escribe tal cual.
- **CORREGIDO**: el encargo, el plan o una fuente previa no coincide con la fuente.
- **SIN CONFIRMAR**: no se ha podido leer en fuente oficial. **No se codifica.**

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición / versión | Fuente | Lectura |
|---|---|---|---|---|
| [RD1627] | RD 1627/1997, de 24 de octubre, disposiciones mínimas de seguridad y salud en las obras de construcción | BOE-A-1997-22614; BOE núm. 256, 25-10-1997; en vigor 25-12-1997. Consolidado, cabecera del PDF: **«Última modificación: 23 de marzo de 2010»**. Según el «Análisis» del BOE, modificado por **RD 2177/2004** (anexo IV, C.5), **RD 604/2006** (añade la DA única), **RD 1109/2007** (arts. 13.4 y 18.2) y **RD 337/2010** (deroga el art. 18, modifica el 19.1). Transpone la Directiva 92/57/CEE | PDF consolidado del BOE (22 pp.) y boe.es («Análisis») | **VERIFICADO (texto)**: arts. 1–8, 13, 14, 17, 18, 19, DA única, DT única, DD única, DF 1.ª; anexos I, II y IV. La lista de normas modificadoras sigue LEÍDO (web) |
| [GT-Obras] | INSST, *Guía técnica para la evaluación y prevención de los riesgos relativos a las obras de construcción* | **3.ª edición, Madrid, noviembre 2019** (GT.113.1.19; NIPO en línea 871-19-111-0; papel 871-19-110-5). Ediciones anteriores 2003 y 2012 | PDF de insst.es; texto `guia-insst-2019.txt` | **LEÍDO (comentario), cotejado en texto**: art. 2.3 (folio 22), art. 4 (folios 24–25), art. 5 (folios 26–33), art. 6 (folios 33–34), anexo IV A.15–16 (folios 79–81), C.12 (folio 104), apéndice 4 (folios 121–125) |
| [NTP1071] | INSST, NTP 1071, *Gestión de la seguridad y salud en obras sin proyecto (I)* | 2016 (NIPO 272-15-025-5) | insst.es (HTML) | LEÍDO (comentario) |
| [FAQ-LT] | INSST, Preguntas técnicas frecuentes sobre lugares de trabajo | Consultada 2026-10-15 | insst.es (HTML) | LEÍDO (comentario) |
| [CGSC7] | **VII Convenio colectivo general del sector de la construcción** (Resolución de 6-09-2023, Dirección General de Trabajo; suscrito el 3-07-2023) | BOE-A-2023-19903, BOE núm. 228, **23-09-2023**, págs. 129033 y siguientes. Vigencia **01-01-2022 a 31-12-2026** (art. 7.1); después «continuará rigiendo hasta que sea sustituido por otro» (art. 7.2) | PDF original del BOE | **VERIFICADO (texto)**: art. 7 (pág. 129039), arts. 231–233 (págs. 129148–129149) |
| [RD486] | RD 486/1997, lugares de trabajo | BOE-A-1997-8669; consolidado, última actualización 12-05-2023 | boe.es | LEÍDO (web): art. 1.2, DD única, anexo V.A |
| [RD1215] | RD 1215/1997, equipos de trabajo | BOE-A-1997-17824; consolidado, última actualización 13-11-2004 (RD 2177/2004) | boe.es | LEÍDO (web): anexo II, aps. 4.1–4.4, 4.2.3, 4.2.4, 4.3.3 |
| [RD396] | RD 396/2006, de 31 de marzo, trabajos con riesgo de exposición al amianto | **BOE-A-2006-6474** (BOE núm. 86, 11-04-2006); en vigor 11-10-2006. Cabecera del consolidado: **«Última modificación: sin modificaciones»** | PDF consolidado del BOE | **VERIFICADO (texto)**: arts. 3, 4.1, 10, 11, 12, 16, 17 |
| [Dir2668] | Directiva (UE) 2023/2668, que modifica la Directiva 2009/148/CE (amianto) | De 22-11-2023; transposición hasta 21-12-2025; segundo hito 21-12-2029 | Fuentes secundarias; EUR-Lex no se pudo leer | SIN CONFIRMAR en sus cifras |
| [PRD-Am] | Proyecto de real decreto de amianto (Ministerio de Trabajo), que **derogaría** el RD 396/2006 | Información pública, febrero de 2026. **No encontrado publicado en el BOE** (ver K-SYS.9) | mites.gob.es (PDF no leído), prensa | SIN CONFIRMAR |
| [LPRL] | Ley 31/1995, de Prevención de Riesgos Laborales | BOE-A-1995-24292; consolidado, última actualización **09-04-2026** | boe.es | LEÍDO (web): art. 32 bis.1, DA 14.ª.1 |
| [RD171] | RD 171/2004, coordinación de actividades empresariales | BOE-A-2004-1848; sin modificaciones (última actualización 31-01-2004) | boe.es | LEÍDO (web): DA 1.ª. *(La Guía, folio 24, cita literalmente su DA 1.ª: «se entenderá cumplida por el promotor mediante el estudio de seguridad y salud o el estudio básico».)* |
| [L32] | Ley 32/2006, subcontratación en el sector de la construcción | BOE-A-2006-18205; consolidado, última actualización 30-12-2021 | boe.es | LEÍDO (web, parcial): arts. 4.2, 5.2, 8.1 |
| [O1071] | Orden TIN/1071/2010, de 27 de abril, comunicaciones de apertura | BOE 01-05-2010 | Solo páginas autonómicas de trámite | SIN CONFIRMAR (no leída en el BOE) |
| [TAS2926] | Orden TAS/2926/2002, modelos de parte de accidente (Delt@) | BOE-A-2002-22650; en vigor 01-01-2003 | boe.es | LEÍDO (web): anexo II, tabla 5 «Forma contacto» |
| [PI-BOE] | CTE Parte I (RD 314/2006), Anejo I «Contenido del proyecto» | BOE-A-2006-5515, consolidado 15-06-2022; el Anejo I con la redacción de 11-03-2010 | boe.es | LEÍDO (web) |
| [CNSST] | Comisión Nacional de Seguridad y Salud en el Trabajo, Grupo de trabajo de Construcción: documentos aprobados | Página consultada 2026-10-15 | insst.es (HTML) | LEÍDO (web) la lista; los PDF, no. **Modelo 2011: SIN CONFIRMAR** |

### Correcciones al encargo y al plan (resumen)

1. **El umbral es de ejecución por contrata, no material.** El art. 4.1 a) dice «presupuesto de ejecución por contrata incluido en el proyecto». La Guía lo define **con IVA**: PEC = (PEM + GG + BI) x (1+IVA). `PLAN-MEMORIA.md` §5.8 solo prevé pedir el **PEM**: con el PEM no basta para decidir. (K-SYS.1)
2. **El RD 1627/1997 no fija ratios de servicios higiénicos.** El anexo IV dice «número suficiente». La frase de §5.8 «dimensionados por el número de trabajadores (anexo IV)» es **incorrecta en la cita**. Las ratios salen del **VII CGSC, art. 232.2**. La Guía del INSST recomienda además vestuarios, duchas y lavabos **en todas las obras**, y retretes por sexos. (K-SYS.5)
3. **El «aviso previo» ya no existe.** El art. 18 figura «(Derogado)» en el consolidado. Ahora el contratista presenta la **comunicación de apertura** (art. 19.1). El EBSS no debe mencionar el aviso previo. El anexo III («Contenido del aviso previo») sigue impreso en el consolidado, pero ya no lo usa ningún artículo. (K-SYS.6)
4. **El estudio básico no lleva presupuesto propio.** El art. 6 no lo pide; la Guía lo llama «un documento exclusivamente descriptivo». (K-SYS.3)
5. **Amianto: el RD 396/2006 está vigente y «sin modificaciones».** **CORREGIDO, y es nuevo:** su art. 10.2 obliga a que la identificación de materiales con amianto «deberá quedar reflejada en el estudio de seguridad y salud, o en el estudio básico». La lectura web se saltó ese párrafo. (K-SYS.9)
6. **No hay un catálogo oficial de riesgos por fase de obra.** Confirmado en el texto: la Guía 2019 no trae ninguno, ni siquiera en su apéndice 4. La estructura codificable sale del propio RD (anexo I y anexo IV, parte C). (K-SYS.12 y K-SYS.13)
7. **La Guía pide justificar en el proyecto por qué no se hace el estudio completo**, con los datos de presupuesto, duración y mano de obra. Es un apartado nuevo del EBSS. (K-SYS.2)
8. **Cabeza de familia** (art. 2.3 del RD): si contrata directamente a autónomos para su vivienda, no es contratista, y según la Guía no hace falta plan de seguridad para esas partes. El EBSS se sigue exigiendo. (K-SYS.11)

---

## K-SYS.1 — Art. 4.1: cuándo hace falta el estudio completo

**Pregunta.** Supuestos que obligan al estudio de seguridad y salud (completo), con cifras exactas; si el presupuesto es de ejecución por contrata o material y qué incluye.

**Respuesta.** Hace falta el estudio completo si se da **uno cualquiera** de los cuatro supuestos. El presupuesto es **de ejecución por contrata (PEC)**, «incluido en el proyecto», y la Guía lo define con IVA. La cifra es 75 millones de pesetas = **450.759,08 €**.

**Cita.** [RD1627] art. 4.1, p. 5, **VERIFICADO (texto)**:
> «1. El promotor estará obligado a que en la fase de redacción del proyecto se elabore un estudio de seguridad y salud en los proyectos de obras en que se den alguno de los supuestos siguientes:
> a) Que el presupuesto de ejecución por contrata incluido en el proyecto sea igual o superior a 75 millones de pesetas.
> b) Que la duración estimada sea superior a 30 días laborables, empleándose en algún momento a más de 20 trabajadores simultáneamente.
> c) Que el volumen de mano de obra estimada, entendiendo por tal la suma de los días de trabajo del total de los trabajadores en la obra, sea superior a 500.
> d) Las obras de túneles, galerías, conducciones subterráneas y presas.»

**Guía**, [GT-Obras] folio 24 (PDF p. 23), **LEÍDO (comentario), cotejado en texto**:
> «Los 75 millones de pesetas equivalen a 450.759,08 euros.
> El presupuesto de ejecución por contrata se obtiene a partir de los siguientes conceptos:
> PEC = (PEM + GG + BI) x (1+IVA)
> Donde: PEC = Presupuesto de ejecución por contrata. PEM = Presupuesto de ejecución material. GG = Gastos generales. BI = Beneficio industrial. IVA = Impuesto sobre el valor añadido.»

Sobre b), mismo folio: «Este apartado será de aplicación cuando se den las dos condiciones enunciadas en el mismo de forma simultánea, es decir, duración y número de trabajadores.»
Sobre d), folio 25 (PDF p. 24): «El concepto de "conducciones subterráneas" que se recoge en este apartado del real decreto comprende las tareas relativas a cualquier tipo de trabajo que sea necesario ejecutar para la correcta instalación de conducciones enterradas, siempre que estas se realicen por debajo de la cota del terreno, no sean a cielo abierto y requieran la presencia de trabajadores en su interior.»
Y (folio 24): el promotor puede encargar un estudio completo aunque solo sea exigible el básico.

*(La cita de la Guía se ha recompuesto desde la maquetación a dos columnas del texto; el orden de las frases es el de la página.)*

**Lo que el literal fija (para el motor)**
- a) **igual o superior**: `PEC ≥ 450.759,08 €`, con **PEC = (PEM + GG + BI) × (1 + IVA)**.
- b) **las dos condiciones a la vez** (la Guía lo confirma): `días laborables > 30` **y** `trabajadores simultáneos > 20`.
- c) **estrictamente superior**: `jornadas > 500`.
- d) por tipo de obra, sin cifra. Las zanjas a cielo abierto de saneamiento o acometidas **no** son «conducciones subterráneas» (Guía).

**Conversión a euros.** La cifra en euros la da la Guía literalmente. **Antes INTERPRETACIÓN, ahora LEÍDO (comentario), cotejado en texto.**

**Consecuencia para la app (actualizada)**
- Pedir **PEM, % GG, % BI y % IVA** (o directamente el PEC del resumen de presupuesto) y calcular `PEC = (PEM + GG + BI) × (1 + IVA)` con la fórmula de la Guía. Los porcentajes los declara el proyectista: no se suponen (principio 4).
- Si el proyectista solo da el PEM, la app puede seguir descartando con una cota (`PEM × 1,19 × 1,21 < 450.759,08`, GG 13 % + BI 6 % + IVA 21 %) y confirmar cuando `PEM ≥ 450.759,08`. Entre medias, pide los porcentajes.
- Pregunta d) con la aclaración de la Guía: «¿trabajos con personas dentro de conducciones enterradas que no son a cielo abierto?».

---

## K-SYS.2 — Art. 4.2: en los demás casos, estudio básico; volumen de mano de obra

**Pregunta.** Que en los demás casos basta el básico. Cómo se estima el volumen de mano de obra: si hay método oficial o del INSST desde el presupuesto.

**Cita.** [RD1627] art. 4.2, p. 5, **VERIFICADO (texto)**:
> «2. En los proyectos de obras no incluidos en ninguno de los supuestos previstos en el apartado anterior, el promotor estará obligado a que en la fase de redacción del proyecto se elabore un estudio básico de seguridad y salud.»

**Jornadas.** [GT-Obras] folio 25 (PDF p. 24), **LEÍDO (comentario), cotejado en texto**:
> «Para su cálculo se puede aplicar la siguiente fórmula: […] Donde: n = Número de períodos en los cuales el número de trabajadores permanece constante. i = Período de tiempo durante el cual el número de trabajadores permanece constante. Ti = Número de trabajadores para cada periodo i. Di = Número de días de trabajo para cada periodo i.»
> «1. Con el fin de computar el número de trabajadores, se considerará el total de los necesarios para ejecutar la obra en el plazo previsto en el proyecto, con independencia de que en dicha ejecución participen una o varias empresas o trabajadores autónomos.
> 2. Como referencia, un día de trabajo equivale a una jornada de 8 horas.
> Cuando el sumatorio sea superior a 500, se elaborará el preceptivo estudio de seguridad y salud.»

- **La expresión de la fórmula** es una imagen en el PDF. Cotejada en imagen el 2026-10-16 (folio 25, p. 25 del PDF renderizada): **Σᵢ₌₁ⁿ Tᵢ × Dᵢ > 500** → **VERIFICADO (imagen)** como texto de la Guía (no reglamentario).
- **No hay método para estimar las jornadas desde el presupuesto.** La Guía solo da la suma por periodos y la equivalencia día = 8 h. **Antes SIN CONFIRMAR, ahora LEÍDO (comentario), cotejado en texto.**

**Justificación en el proyecto. NUEVO.** [GT-Obras] folio 25 (PDF p. 24), **LEÍDO (comentario), cotejado en texto**:
> «En el proyecto debieran incluirse los datos necesarios (presupuesto de ejecución, duración y volumen de mano de obra) que permitan determinar si procede elaborar un estudio o un estudio básico de seguridad y salud. En el caso de que la obra no esté incluida en ninguno de los supuestos especificados en el artículo 4.1, apartados a), b) o c) de este real decreto, es conveniente justificar, con los datos extraídos del proyecto, por qué no procede elaborar un estudio de seguridad y salud. En tal circunstancia se elaborará un estudio básico.»

**Consecuencia para la app (actualizada)**
- Las jornadas las declara el proyectista, o salen de una tablita de periodos (Tᵢ, Dᵢ) que la app suma. Nota «1 día = jornada de 8 h; todos los trabajadores necesarios, también autónomos y subcontratas».
- **Atajo exacto (INTERPRETACIÓN, aritmética):** jornadas ≤ días laborables × máximo de trabajadores simultáneos. Si ese producto es ≤ 500, el supuesto c) queda descartado.
- **Primer apartado del EBSS: «Justificación del estudio básico»**, una tabla «Supuesto del art. 4.1 | Umbral | Proyecto | ¿Se supera?» con PEC, días × simultáneos, jornadas y tipo de obra. Es lo que pide la Guía.

---

## K-SYS.3 — Art. 6: contenido del estudio básico; quién lo redacta y cuándo

**Cita.** [RD1627] art. 6, pp. 6–7, **VERIFICADO (texto)**:
> «1. El estudio básico de seguridad y salud a que se refiere el apartado 2 del artículo 4 será elaborado por el técnico competente designado por el promotor. Cuando deba existir un coordinador en materia de seguridad y salud durante la elaboración del proyecto de obra, le corresponderá a éste elaborar o hacer que se elabore, bajo su responsabilidad, dicho estudio.
> 2. El estudio básico deberá precisar las normas de seguridad y salud aplicables a la obra. A tal efecto, deberá contemplar la identificación de los riesgos laborales que puedan ser evitados, indicando las medidas técnicas necesarias para ello; relación de los riesgos laborales que no puedan eliminarse conforme a lo señalado anteriormente, especificando las medidas preventivas y protecciones técnicas tendentes a controlar y reducir dichos riesgos y valorando su eficacia, en especial cuando se propongan medidas alternativas. En su caso, tendrá en cuenta cualquier otro tipo de actividad que se lleve a cabo en la misma, y contendrá medidas específicas relativas a los trabajos incluidos en uno o varios de los apartados del anexo II.
> 3. En el estudio básico se contemplarán también las previsiones y las informaciones útiles para efectuar en su día, en las debidas condiciones de seguridad y salud, los previsibles trabajos posteriores.»

**CORREGIDO (nota de numeración).** El 6.1 **sí lleva el «1.»** en el BOE (p. 6). El párrafo sin número es el primero del **art. 5** (p. 5), no el del art. 6.

**Fase y visado.** [RD1627] art. 17.1, p. 11, **VERIFICADO (texto)**:
> «1. La inclusión en el proyecto de ejecución de obra del estudio de seguridad y salud o, en su caso, del estudio básico será requisito necesario para el visado de aquél por el Colegio profesional correspondiente, expedición de la licencia municipal y demás autorizaciones y trámites por parte de las distintas Administraciones públicas.»

**CORREGIDO**: el BOE no lleva la coma que aparecía en la lectura web después de «estudio básico».
CTE Parte I, Anejo I: «Estudio de Seguridad y Salud o Estudio Básico, en su caso.» (LEÍDO (web), sin cambios.)

**Qué es el básico.** [GT-Obras] folio 34 (PDF p. 33), **LEÍDO (comentario), cotejado en texto**:
> «El estudio básico se configura en este real decreto como un documento exclusivamente descriptivo. Por lo tanto, su redacción es conveniente que sea lo suficientemente detallada para que permita la elaboración del plan de seguridad y salud en el trabajo. Esto quiere decir que, si el redactor del estudio básico lo considera oportuno, puede anexar documentación gráfica complementaria.»

Y folio 33 (PDF p. 32): el apéndice 4 de la Guía, «Salvo indicación en contrario, […] será de aplicación tanto al estudio como al estudio básico». Sobre el 6.2 la Guía remite a su comentario del 5.2 a). Ese comentario pide describir en la memoria «los servicios sanitarios y comunes», aplicando los puntos 14, 15, 16 y 19 de la parte A del anexo IV (folio 27).

**Sin presupuesto.** **Antes INTERPRETACIÓN; ahora la respalda la Guía** («exclusivamente descriptivo»). El presupuesto del estudio completo (art. 5.2 e y 5.4, pp. 5–6, VERIFICADO (texto)) se calcula sobre el PEC (Guía folio 31) y va como un capítulo más del presupuesto general. Nada de eso se exige al básico.

**Otros cambios del cotejo**
- El art. 5.2 a) (solo estudio completo, p. 6) dice además: «Asimismo, se incluirá la descripción de los servicios sanitarios y comunes de que deberá estar dotado el centro de trabajo de la obra, en función del número de trabajadores que vayan a utilizarlos.»
- El **CGSC7 art. 231.2** (VERIFICADO (texto), pág. 129148) dice que, en obras con estudio o estudio básico, las instalaciones higiénicas «se definirán en el plan de seguridad y salud en el trabajo en función de lo previsto en el correspondiente estudio o estudio básico».
- → **INTERPRETACIÓN reforzada**: el EBSS debe prever los servicios higiénicos (K-SYS.5).

**Consecuencia para la app (actualizada).** Orden del documento:
0. justificación del básico (K-SYS.2);
1. normas aplicables;
2. riesgos evitables y medidas técnicas;
3. riesgos no eliminables, con medidas, protecciones y eficacia;
4. otras actividades en el lugar;
5. medidas específicas del anexo II;
6. servicios higiénicos y comunes (A.14–16 y 19);
7. identificación de amianto (K-SYS.9);
8. trabajos posteriores.

Sin presupuesto. Planos opcionales («documentación gráfica complementaria»).

---

## K-SYS.4 — Anexo II: trabajos con riesgos especiales

**Cita.** [RD1627] anexo II, p. 13, **VERIFICADO (texto)**. Los diez apartados coinciden palabra por palabra con los transcritos en la versión anterior. Título: «Relación no exhaustiva de los trabajos que implican riesgos especiales para la seguridad y la salud de los trabajadores». Definición art. 2.1 b), p. 4, **VERIFICADO (texto)**.

**NUEVO, recurso preventivo.** [GT-Obras] folio 32 (PDF p. 31), **LEÍDO (comentario), cotejado en texto**: «para la ejecución de trabajos especificados en el anexo II es preceptiva la presencia de un recurso preventivo. Esta circunstancia también deberá ser considerada en el estudio de seguridad y salud.» La DA única a) del RD (pp. 11–12, **VERIFICADO (texto)**) deja al plan la forma de esa presencia.

**Para el estudio completo** (art. 5.5, p. 6, VERIFICADO (texto)), las zonas con trabajos del anexo II deben estar «localizadas e identificadas». **Para el básico, el art. 6.2 solo pide «medidas específicas».** La app no exige planos de zonas en el EBSS.

Las asignaciones a cada apartado (amianto → 2; cubierta, fachada, huecos, excavación → 1; etc.) siguen siendo **INTERPRETACIÓN**, sin cambios.

---

## K-SYS.5 — Anexo IV: servicios higiénicos y locales de descanso; ratios

**Respuesta (actualizada).**
- El RD 1627/1997 **no fija ninguna ratio**.
- Lo **vigente y obligatorio** con cifras es el **VII CGSC, art. 232.2**: 1 ducha y 1 lavabo por cada 10, 1 retrete por cada 25 «personas trabajadoras o fracción que desarrollen actividades simultáneamente en la obra».
- La **Guía del INSST para obras** (no vinculante) va más allá:
  - vestuarios, duchas y lavabos **en todas las obras**, con alternativas en obras de corta duración;
  - retretes **1 por cada 25 hombres y 1 por cada 15 mujeres**, y 1 urinario por cada 25 hombres.

**Cita 1.** [RD1627] anexo IV parte A, ap. 14 (p. 16) y aps. 15, 16 y 19 (p. 17), **VERIFICADO (texto)**. Los literales de la versión anterior coinciden. Ninguna ratio. Además:
- 19 b): «En la obra, los trabajadores deberán disponer de agua potable y, en su caso, de otra bebida apropiada no alcohólica en cantidad suficiente, tanto en los locales que ocupen como cerca de los puestos de trabajo.»
- 19 c): «Los trabajadores deberán disponer de instalaciones para poder comer y, en su caso, para preparar sus comidas en condiciones de seguridad y salud.»

**Cita 2.** [CGSC7], **VERIFICADO (texto)**:
- **Art. 231.1** (pág. 129148, PDF p. 116): «Las obras de construcción estarán dotadas de servicios sanitarios y comunes, en función del número de personas trabajadoras que vayan a utilizarlos. Dichas instalaciones se irán adaptando progresivamente a medida que se incorporen las personas trabajadoras, incluidos los de las empresas subcontratistas y trabajadores/as autónomos/as, guardando siempre relación con el número de personas trabajadoras que desempeñen simultáneamente tareas en la obra.»
- **Art. 231.2**: ver K-SYS.3.
- **Art. 231.3 y 231.4**: coinciden con la versión anterior.
- **Art. 232.1** (pág. 129148). **CORREGIDO**: es más exigente que el RD. Vestuarios «Cuando las personas trabajadoras tengan que llevar ropa especial de trabajo, o se realicen trabajos sucios»; «Los vestuarios estarán dotados de un sistema de climatización que garantice el confort térmico de acuerdo con la normativa»; ropa separada «contando, para ello, con taquillas de doble compartimentación»; «En todo caso, cada trabajador/a deberá poder disponer de un espacio para colocar su ropa y sus objetos personales bajo llave.»
- **Art. 232.2** (pág. 129149, PDF p. 117): coincide palabra por palabra con la cita de la versión anterior. Al final añade: «Si las duchas o los lavabos y los vestuarios estuvieren separados, la comunicación entre unos y otros deberá ser fácil.»
- **Art. 232.3**: separación por sexos o uso separado.
- **Art. 233.5**: instalaciones para comer «dotadas de hornos calienta comida, ventilación suficiente, calefacción y condiciones adecuadas de higiene y limpieza».

**Cita 3.** [GT-Obras], comentario al anexo IV A.15, folios 79–80 (PDF pp. 78–79), **LEÍDO (comentario), cotejado en texto**:
> «Independientemente de lo anterior, y dada la singularidad de los trabajos de construcción, todas las obras dispondrán de vestuarios adecuados. No obstante, en el caso de las obras de corta duración se podrá disponer de un medio alternativo para cambiarse y guardar la ropa.»
> «En todas las obras de construcción se dispondrá de duchas y lavabos apropiados. En este sentido, el VI Convenio General del Sector de la Construcción establece, como mínimo, una ducha y un lavabo por cada 10 trabajadores o fracción que desarrollen actividades simultáneamente en la obra. No obstante, en obras de corta duración, se podrán instaurar soluciones alternativas que permitan el aseo.»
> «La dotación recomendada será: • Un retrete por cada 25 hombres o fracción y uno por cada 15 mujeres o fracción. • Un urinario por cada 25 hombres o fracción. No obstante, para aquellas obras de corta duración se podrá disponer de medios alternativos a los descritos.»
> Nota 36: «El VI Convenio General del Sector de la Construcción prevé la instalación de un retrete "por cada 25 trabajadores o fracción que desarrollen actividades simultáneamente en la obra."»

La Guía (2019) cita el **VI** Convenio. El vigente es el **VII**, que mantiene las mismas cifras en su art. 232.2.

**Tabla de vigencia (actualizada)**

| Fuente | ¿Aplica a obras? | ¿Ratios? | Veredicto |
|---|---|---|---|
| RD 1627/1997, anexo IV A.14–16 y 19 | Sí, es la norma | No | Se cita siempre. VERIFICADO (texto) |
| VII CGSC, arts. 231–233 | Sí: empresas del sector; vigente hasta 31-12-2026 y después prorrogado (art. 7.2) | 1/10 duchas (si actividad o salubridad lo requieren), 1/10 lavabos, 1/25 retretes, «o fracción», simultáneos | **Citable y obligatorio**. VERIFICADO (texto) |
| Guía técnica INSST de obras (2019), comentario a A.15 | Sí (no vinculante) | Vestuarios, duchas y lavabos en todas las obras; retretes 1/25 hombres + 1/15 mujeres; urinario 1/25 hombres; alternativas en obras de corta duración | **Citable como criterio técnico**. LEÍDO (comentario), cotejado en texto. **CORREGIDO**: la versión anterior atribuía la cifra de 1/15 solo a la Guía de lugares de trabajo |
| RD 486/1997, anexo V | **No** (art. 1.2 b) | No | No se cita. LEÍDO (web) |
| Ordenanza General de 1971 / Ordenanza Laboral de 1970 | No citable para obras | No leídas | SIN CONFIRMAR, sin cambios |

**Cálculo para la app (INTERPRETACIÓN, actualizado)**, con n = máximo de trabajadores simultáneos:
- **Obligatorio (convenio):** retretes ⌈n/25⌉; lavabos ⌈n/10⌉; duchas ⌈n/10⌉ cuando el tipo de actividad o la salubridad lo requieran.
- **Recomendado (Guía):** duchas y vestuarios **siempre**. Si el proyectista declara cuántas mujeres y cuántos hombres, retretes ⌈hombres/25⌉ + ⌈mujeres/15⌉ y urinarios ⌈hombres/25⌉. Si no lo declara, se imprime la ratio del convenio y la frase de la Guía.
- **Obra de corta duración o de escasa importancia:** soluciones alternativas (convenio 231.4; Guía, folios 79–80), a elección del proyectista y con texto.
- Vestuario climatizado y taquilla de doble compartimento cuando haya ropa especial o trabajos sucios (convenio 232.1).

---

## K-SYS.6 — Modificaciones posteriores: lo que el EBSS debe decir hoy

**Cotejo.** [RD1627], **VERIFICADO (texto)**:
- Art. 7.1 y 7.2: p. 7.
- Art. 13: p. 10. El 13.4 vigente coincide: copia a la Inspección «en el plazo de veinticuatro horas» solo si la anotación se refiere a un incumplimiento de advertencias anteriores o al supuesto del art. 14 (paralización).
- Art. 18: «(Derogado)», p. 11.
- Art. 19.1: p. 11, coincide.
- DA única: pp. 11–12, coincide.

**Lo nuevo del cotejo**
- Art. 19.2 (p. 11): «El plan de seguridad y salud estará a disposición permanente de la Inspección de Trabajo y Seguridad Social y de los técnicos de los órganos especializados en materia de seguridad y salud en las Administraciones públicas competentes.»
- Art. 7.3 (p. 7): en la obra, el plan «constituye el instrumento básico de ordenación de las actividades de identificación y, en su caso, evaluación de los riesgos y planificación de la actividad preventiva».
- Art. 9 c) y f) (p. 8): sin coordinador, la dirección facultativa aprueba el plan y controla el acceso a la obra.

**El anexo III («Contenido del aviso previo») sigue impreso en el consolidado** (pp. 13–14), pero ningún artículo vigente remite a él. **CORREGIDO**: la versión anterior lo daba por desaparecido. Sigue **prohibido citarlo** en el EBSS.

Lo que viene del «Análisis» del BOE (qué RD modifica cada artículo), la Orden TIN/1071/2010 y la Ley 32/2006: sin cambios.

---

## K-SYS.7 — Ley 31/1995, RD 171/2004 y Ley 32/2006: qué citar

**Sin cambios de fondo.** La Guía (folio 24, PDF p. 23) cita literalmente la DA 1.ª del RD 171/2004: la información del empresario titular «se entenderá cumplida por el promotor mediante el estudio de seguridad y salud o el estudio básico». En su apéndice 4 (folio 122, PDF p. 121) añade que el estudio es «el instrumento mediante el cual el promotor informa al contratista sobre los aspectos más relevantes de la obra en relación con la prevención de riesgos laborales». **LEÍDO (comentario), cotejado en texto.**

**Nuevo (apéndice 4, folio 122):** «Cabe recordar que la falta de alcance y contenido del estudio de SS está tipificada como infracción grave en el artículo 12.24 de la Ley sobre Infracciones y Sanciones en el Orden Social (Real Decreto Legislativo 5/2000).» El RDL 5/2000 no se ha leído. Es útil para el aviso de «Antes de entregar», sin citar el artículo hasta leerlo → **SIN CONFIRMAR** el artículo.

---

## K-SYS.8 — Andamios y escaleras de mano

[RD1627] anexo IV C.5, p. 20, **VERIFICADO (texto)**: coincide. Lo del **RD 1215/1997** (3,5 m, 5 m, 6 / 8 / 24 m) sigue **LEÍDO (web)**, sin copia en texto.

---

## K-SYS.9 — Amianto: RD 396/2006

**Cabecera.** [RD396]: «TEXTO CONSOLIDADO. Última modificación: sin modificaciones». **CORREGIDO**: la versión anterior decía «última actualización 11-04-2006»; el dato es que no tiene modificaciones.

**Cotejo, VERIFICADO (texto)**: art. 3.1 a), c)–f) (p. 5); art. 10.1 (p. 8); art. 10.2 (pp. 8–9); art. 11.1 (p. 9); art. 11.4 (p. 10); art. 12.1 (p. 10); art. 16.1, primera frase (p. 12); art. 17.1 (p. 12). Coinciden con los literales de la versión anterior, **salvo lo que sigue**.

**CORREGIDO, 1: art. 10.2 tiene un segundo párrafo que la lectura web omitió** (p. 9):
> «A estos efectos, la identificación deberá quedar reflejada en el estudio de seguridad y salud, o en el estudio básico de seguridad y salud, a que se refiere el Real Decreto 1627/1997, de 24 de octubre, por el que se establecen disposiciones mínimas de seguridad y salud en las obras de construcción, o en su caso en la evaluación de riesgos en aquellas obras en las que reglamentariamente no sea exigible la elaboración de dichos estudios.»

La Guía lo repite (folio 28, PDF p. 27, LEÍDO (comentario), cotejado en texto): el art. 10.2 «determina la obligación de reflejar la identificación de los materiales que puedan contener amianto en el estudio o en el estudio básico de seguridad y salud».
→ **Ya no es INTERPRETACIÓN: es una obligación directa del EBSS.**

**CORREGIDO, 2: art. 12.2 completo** (p. 10):
> «El plazo para resolver y notificar la resolución será de cuarenta y cinco días, a contar desde la fecha en que la solicitud haya tenido entrada en el registro de la autoridad laboral competente; si, transcurrido dicho plazo, no se hubiera notificado pronunciamiento expreso, el plan de trabajo se entenderá aprobado.»

Hay silencio positivo. Y «En la tramitación del expediente deberá recabarse el informe de la Inspección de Trabajo y Seguridad Social y de los órganos técnicos en materia preventiva de las correspondientes comunidades autónomas.»

**NUEVO, 3: art. 3.2, excepciones** (pp. 5–6):
> «No obstante lo anterior, siempre que se trate de exposiciones esporádicas de los trabajadores, que la intensidad de dichas exposiciones sea baja y que los resultados de la evaluación prevista en el artículo 5 indiquen claramente que no se sobrepasará el valor límite de exposición al amianto en el área de la zona de trabajo, los artículos 11, 16, 17 y 18 no serán de aplicación cuando se trabaje: a) en actividades cortas y discontinuas de mantenimiento durante las cuales sólo se trabaje con materiales no friables, b) en la retirada sin deterioro de materiales no friables, c) en la encapsulación y en el sellado de materiales en buen estado que contengan amianto, siempre que estas operaciones no impliquen riesgo de liberación de fibras, y d) en la vigilancia y control del aire y en la toma de muestras para detectar la presencia de amianto en un material determinado.»

→ **INTERPRETACIÓN**: la excepción depende de la evaluación con medición del art. 5, que hace la empresa. El EBSS no puede darla por hecha. La app no la aplica: si hay o puede haber amianto, imprime plan de trabajo, RERA y vigilancia de la salud, y una frase que remite al art. 3.2 «cuando la evaluación del art. 5 lo acredite».

**NUEVO, 4**
- Art. 11.2 (p. 9): el plan de trabajo especifica, entre otras cosas, si el material es «friable (amianto proyectado, calorifugados, paneles aislantes, etc.) o no friable (fibrocemento, amianto-vinilo, etc.)».
- Art. 11.5 (p. 10): quien contrate esos trabajos «deberá comprobar que dichos contratistas o subcontratistas cuentan con el correspondiente plan de trabajo», y el contratista o subcontratista remite el plan, «una vez aprobado por la autoridad laboral», a la empresa principal.
- Art. 4.1 (p. 6): VLA-ED de **0,1 fibras/cm³**. Vigente, pero **no se imprime**: va a cambiar con la transposición.

**Directiva (UE) 2023/2668 y proyecto de RD**: sin cambios, **SIN CONFIRMAR**.

**Consecuencia para la app (actualizada)**
- En toda obra de **demolición o mantenimiento sobre edificio existente**, el EBSS lleva **siempre** un apartado «Identificación de materiales con amianto (RD 396/2006, art. 10.2)». Su contenido es la declaración del proyectista: **no se ha identificado / posible / identificado**, con la ubicación y el tipo (friable o no friable) si se conoce. El apartado es obligatorio: si falta la declaración, sale pendiente en «Antes de entregar».
- Con «posible» o «identificado»:
  - empresa inscrita en el RERA (art. 17.1);
  - plan de trabajo aprobado por la autoridad laboral **antes** del inicio (arts. 11 y 12): 45 días, con silencio positivo;
  - retirada antes de demoler (art. 11.1 a);
  - comprobación del plan por quien contrate (art. 11.5);
  - anexo II.2 y recurso preventivo;
  - residuos peligrosos al estudio de residuos.
- Sin valores límite. Cita «RD 396/2006, o la norma que lo sustituya en transposición de la Directiva (UE) 2023/2668».

---

## K-SYS.10 — Obras sin proyecto

**Sin cambios** (NTP 1071, LEÍDO (comentario)). Ahora se apoya también en dos textos cotejados:
- RD 396/2006 art. 10.2 (p. 9, VERIFICADO (texto)), que prevé «la evaluación de riesgos en aquellas obras en las que reglamentariamente no sea exigible la elaboración de dichos estudios».
- La Guía, apéndice 4 (folio 121, PDF p. 120): si la obra no está obligada a plan de SST, «las medidas preventivas deberán planificarse de acuerdo con lo establecido en la LPRL, en el RSP, en el Real Decreto 1627/1997 (salvo lo especificado en el citado artículo 7) y en el resto de normativa de prevención de riesgos laborales».

---

## K-SYS.11 — Proyecto de reforma pequeña, coordinadores y cabeza de familia

**Cotejo.** [RD1627] art. 3 (p. 5) y art. 2.1 c) a h) (p. 4), **VERIFICADO (texto)**: coinciden.

**NUEVO, cabeza de familia.** [RD1627] art. 2.3, p. 5, **VERIFICADO (texto)**:
> «3. Cuando el promotor contrate directamente trabajadores autónomos para la realización de la obra o de determinados trabajos de la misma, tendrá la consideración de contratista respecto de aquéllos a efectos de lo dispuesto en el presente Real Decreto.
> Lo dispuesto en el párrafo anterior no será de aplicación cuando la actividad contratada se refiera exclusivamente a la construcción o reparación que pueda contratar un cabeza de familia respecto de su vivienda.»

[GT-Obras] folio 22 (PDF p. 21), **LEÍDO (comentario), cotejado en texto**: «Se entiende como "cabeza de familia", a los efectos de este real decreto, aquella persona que construye o repara una vivienda (de la cual es titular) para su utilización propia o de su familia.» Si contrata directamente a autónomos sin que estos sean empresarios, «no es obligado elaborar el plan de seguridad y salud en el trabajo correspondiente a las partes de la obra ejecutadas por estos trabajadores».

**INTERPRETACIÓN.** Esto toca al **plan**, no al **estudio**. El art. 4 no tiene excepción para el cabeza de familia, así que el EBSS se sigue exigiendo en todo proyecto (y el art. 17.1 lo pide para visado y licencia).

**Guía sobre el coordinador en proyecto** (folio 26, PDF p. 25, cotejado en texto): «En el supuesto de intervención de varios proyectistas durante la elaboración del proyecto de la obra, resulta necesario que el promotor designe un coordinador […]. En este caso, ese coordinador será el responsable de la elaboración del estudio de seguridad y salud.»

**Consecuencia para la app.** Pregunta nueva, solo en vivienda: «¿el promotor es una persona que reforma su propia vivienda y contrata directamente a autónomos?». Con «sí», el EBSS dice que en esas partes el promotor no es contratista (art. 2.3) y, según la Guía, no hay plan para ellas. El EBSS se redacta igual.

---

## K-SYS.12 — Catálogo de riesgos: fuente oficial y estructura

**Cotejo.**
- [RD1627] anexo I (p. 13) y anexo IV (pp. 14–22), **VERIFICADO (texto)**: títulos de las partes A, B y C y de sus apartados, y C.3, C.12 a) y b). Coinciden. El anexo I lleva letras a) a m), que la lista anterior omitía.
- [GT-Obras], **LEÍDO (comentario), cotejado en texto**: los siete apéndices coinciden con la lista anterior (índice, PDF pp. 8–9; apéndice 4 en folios 121–125, PDF pp. 120–124).

**Confirmado: la Guía no trae catálogo de riesgos por fases.** Ni el apéndice 4 ni el resto del documento tienen listas de riesgos tipo: los términos «caída de personas» o «atrapamiento» aparecen dos veces en toda la Guía. **Antes SIN CONFIRMAR, ahora LEÍDO (comentario), cotejado en texto.** La Guía da orientaciones de método:
- (folio 122, PDF p. 121) «en el estudio de SS se deben contemplar cada una de las actividades u operaciones de forma independiente prestando especial atención a los equipos, medios auxiliares, materiales y elementos utilizados o presentes en la obra», y considerar «la posible concurrencia de actividades que pueda darse en cada una de las fases de ejecución de la obra»;
- (folio 26, PDF p. 25, comentario al art. 5.2 a) la memoria parte del «Conjunto de unidades de obra descritas según los métodos y sistemas de ejecución previstos en el proyecto», el «Orden cronológico de ejecución de la obra» y la «Localización en el centro de trabajo de las unidades de obra a ejecutar»;
- (folio 27, PDF p. 26) no hace falta identificar los riesgos que el propio proyecto ha evitado, y los riesgos de los equipos se identifican «en relación con el entorno de la obra», «para evitar así la redacción de listados genéricos que carecen de utilidad preventiva».

**Consecuencia de la frase anterior. INTERPRETACIÓN, importante para el diseño del catálogo:** el catálogo de la app debe proponer riesgos **ligados a las fases y unidades que tiene esta obra**, no un listado genérico. Es lo que ya prevé §5.8 (la app propone desde los módulos y lo intervenido, y el proyectista marca o quita).

**Referencia para demoliciones.** [GT-Obras] folio 104 (PDF p. 103), cotejado en texto: «se puede tomar como referencia lo especificado en la Norma Tecnológica de la Edificación NTE-ADD/1975 (Acondicionamiento del terreno. Desmontes. Demoliciones)». La NTE no se ha leído.

**Modelo CNSST 2011**: sigue **SIN CONFIRMAR**. La correspondencia fases → anexo IV / anexo II sigue como **INTERPRETACIÓN**, sin cambios.

---

## K-SYS.13 — Terminología de los riesgos

**Sin cambios.** La Guía no la fija (ver K-SYS.12). Sigue la lista de 22 nombres de la NTP 908 (LEÍDO (comentario)).

---

## K-SYS.14 — Trabajos posteriores (art. 6.3)

**Cotejo.** [RD1627] arts. 5.6, 6.3 y 8.2, pp. 6–8, **VERIFICADO (texto)**. Comentario de la Guía al 5.6, al que remite el del 6.3: folios 32–33 (PDF pp. 31–32), **LEÍDO (comentario), cotejado en texto**.

**Definiciones de la Guía:**
- «"trabajos posteriores": los de reparación, conservación y mantenimiento de la totalidad de la obra en sí misma, o de parte de ella, y de sus instalaciones una vez entregada esta (sustitución de material de cubierta, luminarias, limpieza de canalones, bajantes, muros cortina, lucernarios, mantenimiento de instalaciones, desbroces, cunetas, biondas etc.).»
- «"previsiones": los elementos de seguridad y salud (pasarelas, plataformas, barandillas, puntos de anclaje, etc.) cuya finalidad es evitar el daño o minimizar sus consecuencias.»
- «"informaciones útiles": todas aquellas relativas a la construcción que puedan ser relevantes para la ejecución de los previsibles trabajos posteriores (instrucciones de uso y mantenimiento de los equipos e instalaciones, cargas máximas sobre los elementos constructivos, localización de conducciones, etc.).»

**Cubiertas.** El proyectista incluirá los requisitos, dispositivos y sistemas relacionados con:
- «el acceso a la cubierta»;
- «la resistencia de la cubierta y de sus componentes traslúcidos»;
- «las zonas de tránsito»;
- «la señalización de las zonas frágiles»;
- «los elementos indispensables para la instalación de las protecciones necesarias, priorizando las protecciones colectivas frente a las individuales».

**DB SUA.** La Guía recoge que el personal de mantenimiento «no se considera usuario del edificio» a efectos del DB SUA (comentario del DB SUA de 29-06-2018), así que esos elementos cumplen la normativa de seguridad en el trabajo.

**Destino.** «todas estas previsiones e informaciones para efectuar los trabajos posteriores deberán quedar en poder del promotor, con el fin de que este proceda a su posterior traslado al futuro usuario o usuarios de la obra». En edificación van al **Libro del Edificio** (art. 7 de la LOE).

**Consecuencia para la app (actualizada).** El apartado se divide en «Previsiones» (elementos) e «Informaciones útiles» (datos), con las definiciones de la Guía. La app propone:
- en cubierta, los cinco puntos de la Guía, según el tipo de cubierta del proyecto;
- información útil desde los módulos: equipos de HE 4/HE 5/HS 3 en cubierta, bajantes y arquetas de HS 5, conducciones.

Frase final: «Estas previsiones e informaciones quedan en poder del promotor para su traslado al Libro del Edificio.»

---

## Para la app (fase 8)

### Se codifica (con su cita)

| Qué | Regla | Cita | Veredicto |
|---|---|---|---|
| ¿Estudio completo o básico? | Completo si `PEC ≥ 450.759,08` **o** (`días laborables > 30` **y** `simultáneos > 20`) **o** `jornadas > 500` **o** túneles, galerías, conducciones subterráneas (no a cielo abierto, con trabajadores dentro) o presas. Si no, básico. Si sale completo, la app lo dice y **no** lo redacta | RD 1627/1997 art. 4.1–4.2 (p. 5); Guía folios 24–25 | **VERIFICADO (texto)** + Guía cotejada |
| PEC | `PEC = (PEM + GG + BI) × (1 + IVA)`, con GG, BI e IVA declarados por el proyectista (o el PEC del resumen de presupuesto) | Guía folio 24 (PDF p. 23) | LEÍDO (comentario), cotejado en texto |
| Jornadas | Σ Tᵢ × Dᵢ por periodos de plantilla constante; 1 día = jornada de 8 h; todos los trabajadores, también autónomos y subcontratas. Atajo: si días × simultáneos ≤ 500, c) descartado | Guía folio 25 (PDF p. 24) | LEÍDO (comentario), cotejado; la expresión Σ, cotejada en imagen |
| Justificación del básico | Tabla «Supuesto \| Umbral \| Proyecto \| ¿Se supera?» al principio del EBSS | Guía folio 25 | LEÍDO (comentario), cotejado en texto |
| Estructura del documento | Justificación · normas aplicables · riesgos evitables · riesgos no eliminables (medidas, protecciones, eficacia) · otras actividades · anexo II · servicios higiénicos · amianto · trabajos posteriores. Descriptivo, sin presupuesto; planos opcionales | RD art. 6 (pp. 6–7); Guía folio 34 | **VERIFICADO (texto)** + Guía cotejada |
| Quién y cuándo | Técnico competente designado por el promotor, o el coordinador en proyecto; en la redacción del proyecto; anejo a la memoria; requisito de visado y licencia | RD arts. 4.2, 6.1, 17.1 (pp. 5–6, 11); CTE Parte I Anejo I | **VERIFICADO (texto)**; CTE LEÍDO (web) |
| Anexo II | Lista literal de los 10 apartados; avisos automáticos (amianto → 2; cubierta, fachada, huecos, excavación → 1; AT → 4; prefabricados pesados → 10). **Recurso preventivo preceptivo** si se marca alguno | RD anexo II (p. 13); DA única (p. 11); Guía folio 32 | **VERIFICADO (texto)**; la asignación es INTERPRETACIÓN |
| Servicios higiénicos | **Obligatorio:** retretes ⌈n/25⌉, lavabos ⌈n/10⌉, duchas ⌈n/10⌉ si actividad o salubridad lo requieren; vestuarios (climatizados, taquilla doble) si hay ropa especial o trabajos sucios; separación por sexos. **Recomendado (Guía):** vestuarios, duchas y lavabos en todas las obras; retretes ⌈H/25⌉ + ⌈M/15⌉ y urinarios ⌈H/25⌉ si se conoce el reparto. Alternativas en obras de corta duración o escasa importancia. Agua potable e instalaciones para comer (A.19) | **VII CGSC arts. 231–233** (págs. 129148–129149); RD anexo IV A.14–16 y 19 (pp. 16–18); Guía folios 79–80 | **VERIFICADO (texto)** + Guía cotejada |
| Medidas con cifra | Barandilla ≥ 90 cm con reborde de protección, pasamanos y protección intermedia, para caídas > 2 m (RD, p. 19, VERIFICADO (texto)). Plan de montaje de andamio > 6 m y resto del 4.3.3; escalera > 5 m solo con garantías; anticaídas > 3,5 m con esfuerzos peligrosos | RD anexo IV C.3; RD 1215/1997 anexo II | C.3 VERIFICADO (texto); RD 1215 LEÍDO (web) |
| Coordinadores | Proyecto: si hay varios proyectistas (también parciales); entonces el coordinador redacta el estudio. Ejecución: si hay más de una empresa, o empresa y autónomos | RD arts. 2.1 d, 3 (pp. 4–5); Guía folio 26 | **VERIFICADO (texto)** + INTERPRETACIÓN |
| Cabeza de familia | Pregunta en vivienda; texto del art. 2.3; el EBSS se mantiene | RD art. 2.3 (p. 5); Guía folio 22 | **VERIFICADO (texto)** + Guía cotejada |
| Obligaciones durante la obra | Plan de cada contratista, aprobado por el coordinador o la DF antes del inicio; comunicación de apertura con el plan; plan a disposición de la ITSS; libro de incidencias (Colegio; copia a la ITSS solo en los casos del 13.4); libro de subcontratación; recursos preventivos | RD arts. 7, 9, 13, 19, DA única (pp. 7–12); Ley 32/2006 art. 8 | **VERIFICADO (texto)**; Ley 32 LEÍDO (web) |
| Amianto | **Apartado obligatorio** en demolición o mantenimiento de edificio existente: identificación (no / posible / identificado; ubicación; friable o no). Si posible o identificado: RERA, plan de trabajo aprobado antes del inicio (45 días, silencio positivo), retirada antes de demoler, comprobación del plan por quien contrate, anexo II.2, residuos peligrosos. Sin valores límite | RD 396/2006 arts. 3, 10.2, 11, 12, 17 (pp. 5–12); Guía folio 28 | **VERIFICADO (texto)** |
| Trabajos posteriores | Previsiones e informaciones útiles con las definiciones de la Guía; los cinco puntos de cubierta; destino: promotor y Libro del Edificio | RD arts. 5.6, 6.3, 8.2; Guía folios 32–33 | **VERIFICADO (texto)** + Guía cotejada |
| Fases | Lista de §5.8 con la correspondencia al anexo IV parte C y al anexo II. Riesgos ligados a las fases y unidades de **esta** obra, no listados genéricos | RD anexos I y IV (pp. 13–22); Guía folios 26–27 y 122 | Títulos VERIFICADO (texto); correspondencia INTERPRETACIÓN |
| Nombres de riesgos | Los 22 nombres de la NTP 908 | INSST (terminología PYME) | LEÍDO (comentario) |
| Prohibido en plantilla | «aviso previo», «anexo III», «copia a la Inspección de toda anotación», ratios atribuidas al RD 1627 o al RD 486/1997, valores límite de amianto, la excepción del art. 3.2 del RD 396 dada por hecha | RD arts. 13.4 y 18; RD 396 arts. 3.2 y 4.1 | CORREGIDO |

### Se pide al proyectista (principio 4: no se supone)

- **PEM y % de GG, BI e IVA**, o directamente el PEC del resumen de presupuesto.
- **Plazo en días laborables**, **máximo de trabajadores simultáneos** y, solo si días × simultáneos > 500, **jornadas** (o la tablita de periodos).
- ¿Trabajos con personas dentro de conducciones enterradas que no son a cielo abierto? ¿Túneles, galerías o presas?
- ¿Otros proyectistas con proyectos parciales? ¿Más de una empresa o autónomos en ejecución?
- En vivienda: ¿el promotor es una persona que reforma su propia vivienda y contrata directamente a autónomos?
- **Amianto** (obligatorio en demolición o mantenimiento de edificio existente): no se ha identificado / posible / identificado, con ubicación y tipo si se conoce.
- ¿Líneas de alta tensión próximas? ¿Prefabricados pesados? ¿Excavaciones con riesgo de sepultamiento?
- Servicios: ¿obra de corta duración o de escasa importancia (soluciones alternativas)? Reparto hombres / mujeres (opcional, para la dotación de la Guía).
- ¿La obra se hace con el edificio o el local en uso (otras actividades, art. 6.2)?
- Marcar o quitar fases, riesgos y medidas que proponga el catálogo; lo que añada se guarda en local (como «Mis normas»).
- Tipo de andamio (la app avisa por altura).
- Previsiones e informaciones útiles para trabajos posteriores que proponga la app.

### Queda SIN CONFIRMAR (no se codifica)

1. ~~Fórmula del PEC en la Guía~~ → **VERIFICADA** en el cotejo (folio 24).
2. ~~Expresión gráfica de la fórmula de jornadas~~ → **cotejada en imagen** el 2026-10-16: Σᵢ₌₁ⁿ Tᵢ × Dᵢ > 500 (Guía, folio 25).
3. **Modelo de estudio de la CNSST de 2011** (fichas por fase): sin copia. *(Apéndice 4 de la Guía: leído; no trae catálogo.)*
4. **Cifras de la Directiva (UE) 2023/2668** y **si el nuevo RD de amianto se ha publicado** entre julio y octubre de 2026. A 2026-10-16 el consolidado del BOE (descargado ese día) no lo marca derogado ni modificado. Volver a comprobarlo en el BOE antes de cerrar feature-35; si se ha publicado, sustituir las citas del RD 396/2006 (artículos, plazo de 45 días y silencio positivo incluidos).
5. **Año de la prohibición general del amianto** (referencia para el aviso suave): no leído; no se imprime.
6. **Orden TIN/1071/2010**: no leída en el BOE.
7. **RD 1109/2007** (libro de subcontratación, REA) y **RDL 5/2000 art. 12.24** (infracción por falta de contenido del estudio): solo citados por referencia en la Guía.
8. **Ediciones de las normas específicas** de la lista del 6.2 distintas de RD 1215/1997, RD 396/2006 y RD 665/1997.
9. **Ordenanza General de 1971 y Ordenanza Laboral de la Construcción de 1970**: no se citan.
10. **Nombres de riesgo adicionales** fuera de los 22 de la NTP 908.
11. **NTE-ADD/1975** (referencia de la Guía para demoliciones): no leída.
12. **Sigue LEÍDO (web)**: RD 1215/1997, RD 486/1997, RD 171/2004, Ley 31/1995, Ley 32/2006, Orden TAS/2926/2002, CTE Parte I y el «Análisis» del BOE del RD 1627. Cotejar antes de imprimir sus literales.

### Fuentes consultadas

- [RD 1627/1997, consolidado (BOE-A-1997-22614)](https://www.boe.es/buscar/act.php?id=BOE-A-1997-22614) y [su análisis](https://www.boe.es/buscar/doc.php?id=BOE-A-1997-22614); PDF consolidado en `…\scratchpad\fase8\pdf\BOE-A-1997-22614.pdf`
- [VII Convenio General del Sector de la Construcción (BOE-A-2023-19903)](https://www.boe.es/buscar/doc.php?id=BOE-A-2023-19903); PDF en `…\fase8\pdf\BOE-A-2023-19903.pdf`
- [RD 396/2006 (BOE-A-2006-6474)](https://www.boe.es/buscar/act.php?id=BOE-A-2006-6474); PDF en `…\fase8\pdf\BOE-A-2006-6474.pdf`
- [INSST, Guía técnica de obras de construcción, 2019 (ficha)](https://www.insst.es/documentacion/catalogo-de-publicaciones/guia-tecnica-para-la-evaluacion-y-prevencion-de-los-riesgos-relativos-a-las-obras-de-construccion-ano-2019); PDF en `…\fase8\pdf\guia-insst-2019.pdf`
- [RD 486/1997 (BOE-A-1997-8669)](https://www.boe.es/buscar/act.php?id=BOE-A-1997-8669)
- [RD 1215/1997 (BOE-A-1997-17824)](https://www.boe.es/buscar/act.php?id=BOE-A-1997-17824)
- [RD 171/2004 (BOE-A-2004-1848)](https://www.boe.es/buscar/act.php?id=BOE-A-2004-1848)
- [Ley 31/1995 (BOE-A-1995-24292)](https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292)
- [Ley 32/2006 (BOE-A-2006-18205)](https://www.boe.es/buscar/act.php?id=BOE-A-2006-18205)
- [Orden TAS/2926/2002 (BOE-A-2002-22650)](https://www.boe.es/buscar/act.php?id=BOE-A-2002-22650)
- [CTE Parte I, RD 314/2006 (BOE-A-2006-5515)](https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515)
- [INSST, FAQ lugares de trabajo](https://www.insst.es/materias/riesgos/seguridad-en-el-trabajo/lugares-trabajo/faq)
- [INSST, NTP 1071](https://www.insst.es/documentacion/colecciones-tecnicas/ntp-notas-tecnicas-de-prevencion/31-serie-ntp-numeros-1066-a-1101-ano-2016/ntp-1.071-gestion-de-la-seguridad-y-salud-en-obras-sin-proyecto-i-en-un-centro-de-trabajo-con-distinta-actividad)
- [INSST, NTP 908](https://www.insst.es/documentacion/colecciones-tecnicas/ntp-notas-tecnicas-de-prevencion/26-serie-ntp-numeros-891-a-925-ano-2011/nota-tecnica-de-prevencion-ntp-908)
- [CNSST, Grupo de trabajo de Construcción](https://www.insst.es/cnsst/grupos-de-trabajo/en-funcionamiento/construccion)
- Estado del proyecto de RD de amianto (fuentes secundarias): [Adpreven](https://www.adpreven.es/noticias/nueva-normativa-amianto-real-decreto-2026/), [Noticias Obreras, marzo 2026](https://noticiasobreras.es/2026/03/trabajo-ultima-un-real-decreto-con-nuevas-exigencias-de-seguridad-frente-al-amianto-tras-el-toque-de-atencion-de-bruselas/), [proyecto en mites.gob.es](https://expinterweb.mites.gob.es/participa/listado/download/6e963260-dc39-4eb2-8ecd-94a68133efab)
