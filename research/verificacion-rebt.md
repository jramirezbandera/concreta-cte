# Verificación normativa — REBT, ITC-BT-10 «Previsión de cargas para suministros en baja tensión», con ITC-BT-04, 16, 25 y 52, para el módulo REBT · Grado de electrificación y previsión de cargas (feature-23)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** puntos 1 a 12 del encargo, en ese orden. ITC-BT-10 completa; ITC-BT-04 ap. 3 y 4; ITC-BT-16 ap. 2 y 3; ITC-BT-25 ap. 1, 2 y tabla 1; ITC-BT-52 ap. 1, 2 (SPL), 3.1, 3.2, 4 y 5. Además: DB-HE, HE 6, y las guías técnicas de aplicación del Ministerio. Se amplía y confirma en imagen el bloque B de `research/verificacion-edificio-usos.md`. Al final, una revisión del módulo `src/modules/rebt/`, que ya existe.

**Regla aplicada:** todas las cifras y literales marcados como VERIFICADO se han leído en la **imagen** de la página del consolidado del BOE (PNG a 200 ppp). Las guías, también en imagen, salvo donde se marca «(texto)». Veredictos:
- **VERIFICADO**: literal del reglamento, leído en la imagen del consolidado.
- **LEÍDO (Guía)**: literal de una guía técnica de aplicación del Ministerio. No es reglamentaria; la ficha la rotula como guía.
- **LEÍDO (web)**: leído en boe.es o en otra web mediante una consulta resumida, no en la imagen. Hay que cotejarlo antes de citar el literal.
- **CORREGIDO**: lo que dice el encargo, o una fuente secundaria, no coincide con el reglamento.
- **INTERPRETACIÓN**: se sigue del reglamento, pero el reglamento no lo escribe tal cual.
- **NO LO FIJA EL REGLAMENTO → CRITERIO**: decisión de producto. No es exigencia del REBT y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [REBT] | Real Decreto 842/2002, REBT e ITC-BT, texto consolidado | Portada (imagen p. 1): «BOE núm. 224, de 18 de septiembre de 2002 · Referencia: BOE-A-2002-18099». **«Última modificación: 03 de septiembre de 2025»** (p. 5, texto) | `research/pdf/REBT.pdf` (boe.es) | Imagen: pp. 1, 52–53 (BT-04), 97–100 (BT-10), 114–116 (BT-16), 166–169 (BT-25), 266, 268, 279–282 (BT-52). Texto: p. 5; p. 12 (arts. 12 y 13); pp. 109–111 (BT-14); ITC-BT-16 ap. 3 (interruptor general de maniobra); ITC-BT-28 ap. 1 y 3.3.1. **feature-34 (2026-10-16):** lectura completa en imagen, pp. 1–288; se citan p. 40 (BT-02), 79–83 (BT-07), 108–119 (BT-13 a BT-17), 119–130 (BT-18 y BT-19), 142–145 (BT-21), 150 (BT-22), 157–159 (BT-24), 166–174 (BT-25 y BT-26), 254–255 (BT-46) y 279–288 (BT-52), cotejadas con el texto extraído |
| [G10] | Guía técnica de aplicación ITC-BT-10 | «Edición: sep 03 · Revisión: 1» | `guia_bt_10_sep03R1.pdf` | Imagen: pp. 2–6 |
| [G25] | Guía técnica de aplicación ITC-BT-25 | «Edición: jul 12 · Revisión: 2» | `guia_bt_25_jul12R2.pdf` | Imagen: pp. 2–3. Texto: pp. 5, 7, 10. **feature-34:** imagen, pp. 1–24 completas |
| [G52] | Guía técnica de aplicación ITC-BT-52 | **«Edición: septiembre 2024 · Revisión: 2»**. El nombre del fichero («nov17R1») engaña | `guia_bt_52_nov17R1.pdf` | Imagen: pp. 1, 27–30, 42–45. Texto: pp. 4, 24–26 |
| [G04] | Guía técnica de aplicación ITC-BT-04 | «Edición: sep 03 · Revisión: 1» | `guia_bt_04_sep03R1.pdf` | Imagen: p. 5 (modelo de MTD). Texto: pp. 8–11 |
| [G16] | Guía técnica de aplicación ITC-BT-16 | «Edición: sep 03 · Revisión: 1» | `guia_bt_16_sep03R1.pdf` | Imagen: p. 7. Texto: pp. 2–3, 8–11 |
| [G14] | Guía técnica de aplicación ITC-BT-14 | «Edición: sep 03 · Revisión: 1» | `guia_bt_14_sep03R1.pdf` | Texto: pp. 4–9. **feature-34:** imagen, pp. 1–9 completas |
| [GA2] | Guía técnica de aplicación, **Anexo 2** «Cálculo de las caídas de tensión» | **«Edición: febrero 2026 · Revisión: 2»** (Ministerio de Industria y Turismo). El nombre del fichero («sep03R1») engaña | `guia_bt_anexo_2_sep03R1.pdf` | Imagen: pp. 1–14 completas (feature-34) |
| [G13] | Guía técnica de aplicación ITC-BT-13 | «Edición: sep 03 · Revisión: 1» | `guia_bt_13_sep03R1.pdf` | Imagen: pp. 1–8 completas (feature-34) |
| [G15] | Guía técnica de aplicación ITC-BT-15 | «Edición: sep 03 · Revisión: 1» | `guia_bt_15_sep03R1.pdf` | Imagen: pp. 1–15 completas (feature-34) |
| [G18] | Guía técnica de aplicación ITC-BT-18 | «Edición: Oct 05 · Revisión: 1» | `guia_bt_18_oct05R1.pdf` | Imagen: pp. 1–20 completas (feature-34) |
| [G19] | Guía técnica de aplicación ITC-BT-19 | «Edición: feb 09 · Revisión: 2» | `guia_bt_19_feb09R2.pdf` | Imagen: pp. 1–26 completas (feature-34) |
| [G21] | Guía técnica de aplicación ITC-BT-21 | «Edición: sep 03 · Revisión: 1» | `guia_bt_21_sep03R1.pdf` | Imagen: pp. 1–20 completas (feature-34) |
| [G22] | Guía técnica de aplicación ITC-BT-22 | «Edición: Oct 05 · Revisión: 1» | `guia_bt_22_oct05R1.pdf` | Imagen: pp. 1–14 completas (feature-34) |
| [G24] | Guía técnica de aplicación ITC-BT-24 | «Edición: junio-2019 · Revisión: 2» | `guia_bt_24_jun19R2.pdf` | Imagen: pp. 1–33 completas (feature-34) |
| [G26] | Guía técnica de aplicación ITC-BT-26 | «Edición: sep 03 · Revisión: 1» | `guia_bt_26_sep03R1.pdf` | Imagen: pp. 1–13 completas (feature-34) |
| [HE22] | CTE DB-HE, consolidado | 14-06-2022 | `research/pdf/DBHE.pdf` | Imagen: pp. 33–34 (HE 6) |
| [RD1048] | Real Decreto 1048/2013, retribución de la distribución, texto consolidado | «BOE núm. 312, de 30 de diciembre de 2013 · Referencia: BOE-A-2013-13767» · «Última modificación: 03 de noviembre de 2016» | `research/pdf/RD1048_2013.pdf` (boe.es, 2026-10-05) | Imagen: pp. 32–33 (art. 26). Texto: p. 3 |
| [EN8120] | prEN 81-20:2011, «Finalised version» (CEN/TC 10 WG1, doc. N 1072, 2011-07-29), borrador previo a la encuesta CEN. **No es la UNE-EN 81-20 publicada**: que la tabla 6 publicada conserva las cifras de 450 y 630 kg se apoya en fuentes secundarias (Elevator World, «Rated Load and Maximum Available Car Area», resumen web) | — | eigel.es (PDF público del secretariado CEN/AFNOR); no se guarda en el repo | Imagen: pp. 1 y 58 |
| [DBSI] | CTE DB-SI, consolidado | — | `research/pdf/DBSI.pdf` | Imagen: p. 42 (Anejo SI A) |
| [SI3], [SUA9], [SI12] | Verificaciones previas del repo | — | `research/verificacion-si3.md` (B8), `verificacion-sua9.md` (D7.1), `verificacion-si1-si2.md` (10.6) | No releídas aquí; se citan |
| [BOE-web] | Fichas de boe.es: RD 1053/2014 (BOE-A-2014-13681), RD 450/2022 (BOE-A-2022-9848), RD 770/2025, RD 1955/2000 (BOE-A-2000-24019), STC 120/2016 (BOE-A-2016-7297) | — | boe.es | LEÍDO (web), resumen automático |
| [REPO] | `src/modules/rebt/{tablas,justificacion,estado}.ts` | Estado actual, sin commit | repo | Revisión en el bloque M |

Avisos de las propias fuentes:
- El consolidado del BOE advierte: «Este documento es de carácter informativo y no tiene valor jurídico.»
- Las guías BT-10, BT-04, BT-14 y BT-16 son de **2003**, anteriores al RD 1053/2014. La Guía BT-10 **no recoge** el ap. 1 actualizado (no tiene aparcamientos con recarga), ni el ap. 5 (vehículo eléctrico), y numera la previsión de cargas como 5 y los suministros monofásicos como 6. La Guía BT-04 dice «garajes» donde el consolidado dice «aparcamientos o estacionamientos», y no tiene el grupo z.

**Disposiciones que tocaron las ITC usadas** ([BOE-web], sin cotejar con el BOE de cada una):
- **RD 1053/2014** (BOE 31-12-2014, en vigor 30-06-2015).
  - Añade la ITC-BT-52.
  - Modifica las ITC-BT-02, 04, 05, 10, 16 y 25.
  - En la ITC-BT-10: nuevo lugar de consumo en el ap. 1; nuevo ap. 5 (recarga del vehículo eléctrico); «El apartado 5, "Previsión de cargas", pasará a ser el apartado 6» (y el 6 pasa a 7).
  - En la ITC-BT-04: nuevo grupo z.
  - En la ITC-BT-25: circuito C13.
- **RD 450/2022** (BOE 15-06-2022, en vigor al día siguiente), disposición final primera. Modifica del RD 1053/2014:
  - la disposición adicional primera (estacionamientos **no adscritos** a edificios y vía pública: una estación por cada 40 plazas o fracción);
  - el **ap. 3.2** de la ITC-BT-52;
  - el **ap. 5.4** de la ITC-BT-52.
  - **No toca la ITC-BT-10.**
- **RD 770/2025** (BOE 03-09-2025). Es la última modificación del consolidado. Solo modifica la ITC-BT-03 (medios humanos de las empresas instaladoras). No afecta a este módulo.
- Otras disposiciones que tampoco afectan a este módulo:
  - RD 560/2010: terminología de empresas instaladoras.
  - RD 542/2020: art. 14.
  - RD 298/2021: art. 2.
  - RD 145/2023: art. 25.

**Cita para la ficha:** «REBT (RD 842/2002), ITC-BT-10, ap. [x], texto consolidado BOE-A-2002-18099, últ. modif. 03-09-2025. Apartados 1, 2.1.2 y 5 de la ITC-BT-10 e ITC-BT-52 según el RD 1053/2014; ap. 3.2 de la ITC-BT-52 según el RD 450/2022.»
- Las guías se citan aparte: «Guía técnica de aplicación ITC-BT-xx (Ministerio, ed. …), no reglamentaria».
- Que el RD 1053/2014 tocara el ap. 2.1.2 de la ITC-BT-10 es **INTERPRETACIÓN**: ese apartado menciona la recarga del vehículo eléctrico, que no existía en 2002.

**Correcciones al encargo (resumen; el detalle va en cada bloque):**
1. La lista ampliada de la electrificación elevada (secadora, automatización, más de 30 puntos de luz, más de 20 tomas, más de 6 tomas de baño y cocina) **no está en la ITC-BT-10**.
   - Está en la **Guía BT-10** (pp. 2–3) y en la **Guía BT-25** (p. 2).
   - Se deriva de la ITC-BT-25: ap. 2.3.2 (automatización, C10 secadora, C6, C7 y C12) y máximos de la tabla 1 (30, 20 y 6 puntos). (A.3)
2. La **reserva de local para centro de transformación** ya no está en el RD 1955/2000: sus arts. 44, 45 y 47 están **derogados** por el RD 1048/2013. Hoy está en el **art. 26 del RD 1048/2013**, leído en literal el 2026-10-05: es una obligación del solicitante («deberá reservar un local»), no algo que la distribuidora «puede exigir». El art. 13 del REBT remite a esa reglamentación. (I)
3. La ITC-BT-52 ap. 4.1 define P1 como «el número de viviendas por el coeficiente de simultaneidad». Es una **redacción imprecisa**; manda la ITC-BT-10 ap. 3.1 (media aritmética × coeficiente). La Guía BT-52, Anexo 2, calcula «P1(diurno) = CS · Pm,v». (B.6)
4. La ITC-BT-10 ap. 5.2 **solo vale** para viviendas nuevas en régimen de propiedad horizontal (título del ap. 5 y del 5.2). Para el garaje de un edificio de oficinas, la Guía BT-52 (p. 28) da **«P5 mínimo = (Nº plazas / 40) · 3,68 kW»**, no el 10 %. (F.7)
5. La Guía BT-52, Anexo 2, recomienda **PVE = FS1·N·3 680 W con N = plazas con preinstalación** cuando la preinstalación pasa del 50 % de las plazas. Con el HE 6 (100 % en residencial privado) eso es **siempre** en vivienda nueva, y da **10 veces** el mínimo reglamentario sin SPL. Es una recomendación de la Guía, no una exigencia. La propia Guía dice que el 10 % «debe considerarse como valor mínimo reglamentario». (F.9–F.11)
6. Esquema 4 (4a y 4b): la ITC-BT-52 ap. 4.3 fija el **factor 1,0**. La Guía BT-52 (p. 43) admite el SPL en el 4b y le aplica el «caso general» (0,3). Manda el reglamento. (F.6)
7. El consolidado tiene más erratas en la ITC-BT-10:
   - ap. 5.2: «y **su** sumará» (se sumará) y «un sistema protección» (sistema **de** protección);
   - tabla 1: la fórmula «15,3+(n-21).0,5» usa el punto como signo de multiplicar;
   - confirmadas las de n = 19 («14 3») y n = 21 («15 3»).
8. **Superficie de los locales:** el modelo de memoria técnica de diseño de la Guía BT-04 escribe **«Superficie útil total»**. Es la única pista ministerial; el reglamento no lo fija. (D.4)
9. **Ascensor por defecto:** ITA-2 (400 kg) **no** basta para una cabina accesible. La más pequeña admitida, 1,00 × 1,25 m, necesita al menos 450 kg (tabla 6 de la EN 81-20, leída en el borrador CEN; C.6 bis). Hay que tomar **ITA-3** (630 kg, 11,5 kW). (C.6)
10. El módulo del repo pasa la unifamiliar a trifásica por encima de 9 200 W. La ITC-BT-10 ap. 7 obliga a la distribuidora a dar monofásico **hasta 14 490 W** si lo pide el cliente. (M.1)

---

## Bloque A — Grado de electrificación (ITC-BT-10 ap. 2; ITC-BT-25 ap. 1, 2.1 y 2.3.2) — punto 1 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Básica | VERIFICADO | — | 2.1.1: «Es la necesaria para la cobertura de las posibles necesidades de utilización primarias sin necesidad de obras posteriores de adecuación. Debe permitir la utilización de los aparatos eléctricos de uso común en una vivienda.» | [REBT] p. 98 |
| A.2 | Criterios de la elevada (reglamento) | VERIFICADO | Cinco criterios: electrodomésticos por encima de la básica; calefacción eléctrica; aire acondicionado; **superficie útil > 160 m²**; recarga del vehículo eléctrico **en unifamiliar**; o combinación | 2.1.2: «Es la correspondiente a viviendas con una previsión de utilización de aparatos electrodomésticos superior a la electrificación básica o con previsión de utilización de sistemas de calefacción eléctrica o de acondicionamiento de aire o con superficies útiles de la vivienda superiores a 160 m², o con una instalación para la recarga del vehículo eléctrico en viviendas unifamiliares, o con cualquier combinación de los casos anteriores.» | [REBT] p. 98 |
| A.3 | ITC-BT-25 2.3.2 añade automatización y el criterio de circuitos | VERIFICADO | Elevada si los electrodomésticos «obligue[n] a instalar más de un circuito de cualquiera de los tipos» (C1–C5), y con automatización, gestión técnica de la energía y seguridad. Circuitos: **C6** por cada 30 puntos de luz; **C7** por cada 20 tomas o si la superficie útil es mayor de 160 m²; **C8** calefacción eléctrica; **C9** aire acondicionado; **C10** secadora independiente; **C11** automatización; **C12** C3 o C4 adicionales, o C5 adicional «cuando su número de tomas de corriente exceda de 6»; **C13** recarga | «Es el caso de viviendas con una previsión importante de aparatos electrodomésticos que obligue a instalar mas de un circuito de cualquiera de los tipos descritos anteriormente, así como con previsión de sistemas de calefacción eléctrica, acondicionamiento de aire, automatización, gestión técnica de la energía y seguridad, para la recarga de vehículos eléctricos en viviendas unifamiliares, o con superficies útiles de las viviendas superiores a 160 m².» | [REBT] p. 168 |
| A.4 | Lista ampliada | LEÍDO (Guía) + **CORREGIDO** (no es de la ITC-BT-10) | Es elevada si: superficie útil > 160 m²; aire acondicionado; calefacción eléctrica; automatización; secadora; **> 30 puntos de luz**; **> 20 tomas de uso general**; **> 6 tomas de baño y auxiliares de cocina**; «en otras condiciones indicadas en la ITC-BT-25». Es la traducción de la tabla 1 de la ITC-BT-25 (máximos por circuito: C1 30, C2 20, C5 6) y de los circuitos C6–C12. **No incluye la recarga del vehículo eléctrico:** la guía es de 2003 | [G10] pp. 2–3: «El grado de electrificación de una vivienda será "electrificación elevada" cuando se cumpla alguna de las siguientes condiciones: …». Igual en [G25] p. 2 | [G10]; [G25] |
| A.5 | Excepciones que **no** llevan a la elevada | VERIFICADO + LEÍDO (Guía, texto) | (a) **Reglamento**, tabla 1, nota (8): desdoblar el C4 «no supondrá el paso a electrificación elevada ni la necesidad de disponer de un diferencial adicional». (b) **Guía**: desdoblar el C1, C2 o C5 sin superar el máximo de puntos «no supondrá el paso a electrificación elevada si se mantiene el mismo interruptor general». (c) **Guía**: una automatización que no gestione cargas distintas de las de la básica no obliga a la elevada | [REBT] p. 169 (imagen); [G25] pp. 5 y 7 (texto) | — |
| A.6 | 5 750 W y 9 200 W | VERIFICADO | **≥ 5 750 W a 230 V** por vivienda nueva; **≥ 9 200 W** en elevada. Son mínimos; los fija el promotor de acuerdo con la empresa suministradora | 2.2: «… la potencia a prever, la cual, para nuevas construcciones, no será inferior a 5 750 W a 230 V, en cada vivienda, independientemente de la potencia a contratar por cada usuario … En las viviendas con grado de electrificación elevada, la potencia a prever no será inferior a 9 200 W.» | [REBT] p. 98 |
| A.7 | Correspondencia con el IGA | VERIFICADO | «En todos los casos, la potencia a prever se corresponderá con la capacidad máxima de la instalación, definida ésta por la intensidad asignada del interruptor general automático, según se indica en la ITC-BT-25.» ITC-BT-25 ap. 1: la capacidad de la instalación y la de la derivación individual son, como mínimo, la del IGA | [REBT] pp. 98, 167 | — |
| A.8 | IGA mínimo 25 A | VERIFICADO | «Un interruptor general automático de corte omnipolar con accionamiento manual, de intensidad nominal mínima de 25 A …» | ITC-BT-25 ap. 2.1 | [REBT] p. 167 |
| A.9 | Tabla C (escalones) | LEÍDO (Guía) | 5 750 W / 25 A y 7 360 W / 32 A (básica); 9 200 / 40, 11 500 / 50 y 14 490 / 63 (elevada). Son 230 V × calibre. La misma tabla es la «Tabla A» de la Guía BT-25 | [G10] p. 6, «Tabla C: escalones de potencia prevista en suministros monofásicos»; [G25] p. 3 | [G10]; [G25] |
| A.10 | En la básica caben 5 750 y 7 360 W | LEÍDO (Guía) | «En consecuencia, teóricamente la previsión de carga en un grado de electrificación básico abarca el rango 5 750 W a 9 199 W, aunque en la práctica al estar condicionada esta previsión al calibre del interruptor general automático, los dos valores posibles son 5 750 W (para un calibre de 25 A) y 7 360 W (para un calibre de 32 A).» | [G10] p. 3 | — |
| A.11 | Las cifras son mínimos | LEÍDO (Guía) | «Las previsiones de carga establecidas son los valores teóricos mínimos a considerar. Por lo tanto, en caso de conocer la demanda real de los usuarios, es necesario utilizar estos valores cuando sean superiores a los mínimos teóricos.» | [G10] p. 2 | — |
| A.12 | ¿«> 160 m²» estricto? | VERIFICADO | **Estricto.** Con 160 m² justos no es elevada por superficie. Superficie **útil** de la vivienda | 2.1.2: «superiores a 160 m²»; ITC-BT-25 C7: «mayor de 160 m²» | [REBT] pp. 98, 168 |
| A.13 | Máximo monofásico | VERIFICADO | Monofásico obligatorio para la distribuidora, si lo pide el cliente, hasta **14 490 W**. Por encima, trifásico (INTERPRETACIÓN) | ap. 7: «Las empresas distribuidoras estarán obligadas, siempre que lo solicite el cliente, a efectuar el suministro de forma que permita el funcionamiento de cualquier receptor monofásico de potencia menor o igual a 5750 W a 230 V, hasta un suministro de potencia máxima de 14 490 W a 230V.» | [REBT] p. 100 |
| A.14 | Aerotermia | **NO LO FIJA EL REGLAMENTO → CRITERIO** | El REBT no define «calefacción eléctrica». Una bomba de calor para calefacción es un sistema de calefacción accionado eléctricamente con circuito propio (C8 o C9, 25 A, hasta 5 750 W por la nota (2) de la tabla 1). Lectura propuesta: **elevada**. Si la bomba de calor es **solo de ACS** (termo con bomba de calor), cabe en el C4 («termo eléctrico») y **no** obliga a la elevada. Ver K-REBT.2 | ITC-BT-10 2.1.2; ITC-BT-25 2.3.2 y tabla 1 | — |

**Frases de memoria:**
- Básica: «Las viviendas del tipo [X] (superficie útil [S] m², no superior a 160 m²) no prevén calefacción eléctrica, aire acondicionado, automatización ni electrodomésticos que obliguen a circuitos adicionales: grado de electrificación básica, potencia prevista [5 750 / 7 360] W a 230 V, IGA de [25 / 32] A (REBT, ITC-BT-10 ap. 2.1.1 y 2.2; ITC-BT-25 ap. 2.1).»
- Elevada: «Las viviendas del tipo [X] tienen grado de electrificación elevada por [superficie útil de S m², superior a 160 m² / previsión de calefacción eléctrica (bomba de calor) / aire acondicionado / …]: potencia prevista [9 200] W a 230 V, IGA de [40] A (ITC-BT-10 ap. 2.1.2 y 2.2; ITC-BT-25 ap. 2.3.2).»

---

## Bloque B — Conjunto de viviendas, tabla 1 (ITC-BT-10 ap. 3.1) — punto 2 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B.1 | Regla | VERIFICADO | **P1 = media aritmética de las potencias máximas previstas × coeficiente** | 3.1: «Se obtendrá multiplicando la media aritmética de las potencias máximas previstas en cada vivienda, por el coeficiente de simultaneidad indicado en la tabla 1, según el número de viviendas.» | [REBT] p. 98 |
| B.2 | Tabla 1, n = 1…21, casilla a casilla | VERIFICADO (cotejada contra [G10] p. 4) | Ver la transcripción. **Las 21 casillas y la fórmula coinciden** en las dos fuentes, salvo las erratas tipográficas del consolidado | Tabla 1 | [REBT] pp. 98–99; [G10] p. 4 |
| B.3 | Erratas del consolidado | VERIFICADO / **CORREGIDO** | n = 19: «14 3» → **14,3**. n = 21: «15 3» → **15,3**. La Guía imprime 14,3 y 15,3, y la fórmula de n > 21 parte de 15,3. Para n = 19 hay además coherencia aritmética: los saltos son de 0,6 entre 15 y 19 (11,9 → 12,5 → 13,1 → 13,7 → 14,3) | Tabla 1 | [REBT] p. 99; [G10] p. 4 |
| B.4 | n > 21 | VERIFICADO | **15,3 + (n − 21) · 0,5**. El consolidado lo escribe «15,3+(n-21).0,5» | Tabla 1 | [REBT] p. 99 |
| B.5 | Tarifa nocturna | VERIFICADO + LEÍDO (Guía) | Coeficiente = n.º de viviendas. Guía: «Se considerará que la instalación de tarifa nocturna está prevista, cuando el proyecto o memoria técnica del edificio así lo contemple.» | «Para edificios cuya instalación esté prevista para la aplicación de la tarifa nocturna, la simultaneidad será 1 (Coeficiente de simultaneidad = n.º de viviendas)» | [REBT] p. 99; [G10] p. 4 |
| B.6 | ITC-BT-52 4.1: P1 = «número de viviendas por el coeficiente» | VERIFICADO (que lo dice) + **INTERPRETACIÓN: redacción imprecisa, no cambia nada** | Tomado al pie de la letra, n × CS no tiene sentido: el coeficiente **ya es** un número equivalente de viviendas. Manda la ITC-BT-10 3.1, a la que remite la propia ITC-BT-52 («la tabla 1 de la (ITC) BT-10»). La Guía BT-52 repite la redacción (pp. 28 y 43), pero en el Anexo 2 calcula «P1(diurno) = CS · Pm,v», con Pm,v la media aritmética | ITC-BT-52 4.1: «P1 Carga correspondiente al conjunto de viviendas obtenida como el número de viviendas por el coeficiente de simultaneidad de la tabla 1 de la (ITC) BT-10.» | [REBT] p. 281; [G52] pp. 28, 43–45 |
| B.7 | Ejemplo de la Guía | LEÍDO (Guía) + comprobado | 12 × 5 750 + 2 × 9 200 = 87 400 W. / 14 = 6 242,857 W. × 11,3 = **70 544,3 W** → «70,544kW» ✓. Áticos de 200 m²: elevada por superficie; resto, básica | [G10] p. 4: «11,3 · ((12 · 5750 + 2 · 9200) / 14) = 70,544kW» | [G10] |
| B.8 | Media con viviendas de distinto grado | INTERPRETACIÓN (avalada por el ejemplo) | Media **ponderada por el número de viviendas de cada tipo**, sobre las potencias previstas (no sobre los mínimos si se prevé más) | B.1, B.7 | — |

**Tabla 1 — Coeficiente de simultaneidad, según el número de viviendas** (ITC-BT-10 ap. 3.1; [REBT] pp. 98–99 y [G10] p. 4, imagen)

| n | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | n > 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CS | 1 | 2 | 3 | 3,8 | 4,6 | 5,4 | 6,2 | 7 | 7,8 | 8,5 | 9,2 | 9,9 | 10,6 | 11,3 | 11,9 | 12,5 | 13,1 | 13,7 | 14,3 | 14,8 | 15,3 | 15,3 + (n − 21) · 0,5 |

**Ejemplos (para los tests):** 20 viviendas básicas: 14,8 × 5 750 = **85 100 W**. 21: 15,3 × 5 750 = **87 975 W**. 30: (15,3 + 9 · 0,5) = 19,8 → × 5 750 = **113 850 W**.

**Frase de memoria:** «Carga de las viviendas: [n] viviendas con una potencia media prevista de [Pm] W; coeficiente de simultaneidad [CS] (ITC-BT-10, tabla 1); P1 = [Pm] × [CS] = [P1] W (ITC-BT-10 ap. 3.1).» Con tarifa nocturna: «… coeficiente = n.º de viviendas, por estar prevista la tarifa nocturna (ITC-BT-10 ap. 3.1).»

---

## Bloque C — Servicios generales (ITC-BT-10 ap. 3.2) — punto 3 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C.1 | Simultaneidad 1 | VERIFICADO | Suma sin reducción | 3.2: «Será la suma de la potencia prevista en ascensores, aparatos elevadores, centrales de calor y frío, grupos de presión, alumbrado de portal, caja de escalera y espacios comunes y en todo el servicio eléctrico general del edificio sin aplicar ningún factor de reducción por simultaneidad (factor de simultaneidad = 1).» | [REBT] p. 99 |
| C.2 | Tabla A (ITA) | LEÍDO (Guía) | Ver la transcripción. Valores «típicos» según la Norma Tecnológica NTE-ITA, **no reglamentarios** | [G10] p. 5: «En la siguiente tabla se indican los valores típicos de las potencias de los aparatos elevadores según especifica la Norma Tecnológica de la Edificación ITE-ITA» (sic: ITE) | [G10] |
| C.3 | Alumbrado común | LEÍDO (Guía) | Portal y otros espacios comunes: **15 W/m²** (incandescencia) / **8 W/m²** (fluorescencia). Caja de escalera: **7 W/m²** / **4 W/m²** | [G10] p. 5: «Para el alumbrado de portal y otros espacios comunes se puede estimar una potencia de 15 W/m² si las lámparas son incandescentes y de 8 W/m² si son fluorescentes. Para el alumbrado de la caja de escalera se puede estimar una potencia de 7 W/m² para incandescencia y de 4 W/m² para alumbrado con fluorescencia.» | [G10] |
| C.4 | LED | **NO LO FIJA EL REGLAMENTO → CRITERIO** | Ni el REBT ni la Guía hablan de LED. Propuesta: tomar las cifras de **fluorescencia (8 y 4 W/m²) como cota superior**. La eficacia del LED es igual o mayor, así que es del lado de la seguridad sin inflar la previsión. Ver K-REBT.6 | — | — |
| C.5 | Otros servicios | VERIFICADO (la lista) + CRITERIO (las cifras) | Centrales de calor y frío, grupos de presión y «todo el servicio eléctrico general». El REBT no da cifras: dato del proyecto, o de otros módulos (grupo de presión de HS 4, producción de ACS centralizada de HE 4). **No meter aquí** la ventilación ni el alumbrado del garaje: van en el ap. 3.4 (INTERPRETACIÓN, para no contarlos dos veces) | 3.2 | [REBT] p. 99 |
| C.6 | Ascensor por defecto: ¿ITA-2 o ITA-3? | **CRITERIO** + dato **LEÍDO** (ver C.6 bis) | **ITA-3** (630 kg, 8 personas, 1,00 m/s, **11,5 kW**). Motivos: (a) la cabina mínima de un ascensor accesible es 1,00 × 1,25 m (tabla corregida desde el 21-02-2025: 1,00 × 1,30), y 1,10 × 1,40 m con viviendas accesibles para usuarios de silla de ruedas ([SUA9] D7.1.2 y D7.1.4); (b) por la UNE-EN 81-20 (tabla de superficie de cabina por carga), 1,00 × 1,25 ≈ 1,25 m² corresponde a **450 kg / 6 personas** y 1,10 × 1,40 ≈ 1,54 m² a **630 kg / 8 personas** (**de memoria, no verificado**: UNE de pago, no leída); (c) ITA-1 e ITA-2 son de 400 kg / 5 personas, por debajo de cualquier cabina accesible. La primera fila de la tabla A que cubre los dos casos es ITA-3. Los valores ITA son antiguos (máquinas de dos velocidades); un ascensor actual con variador consume menos. El dato del proyecto manda | [G10] p. 5; [SUA9] D7.1 | — |
| C.6 bis | Cabina y carga (2026-10-05) | **LEÍDO (borrador CEN)** + **VERIFICADO** (DB-SI) | (a) Tabla «Rated load and maximum available car area» (tabla 5 del borrador, tabla 6 de la EN 81-20 publicada): **400 kg → 1,17 m²; 450 kg → 1,30 m²; 525 → 1,45; 600 → 1,60; 630 kg → 1,66 m²**; «For intermediate loads the area is determined by linear interpolation». Es la superficie **máxima** por carga, así que una cabina de 1,00 × 1,25 = 1,25 m² necesita **≥ 450 kg** (400 kg solo admite 1,17 m²) y la de 1,00 × 1,30 de la tabla corregida, 1,30 m², exactamente 450 kg. (b) DB-SI, Anejo SI A, «Ascensor de emergencia»: «Tendrá como mínimo una capacidad de carga de 630 kg, unas dimensiones de cabina de 1,10 m x 1,40 m, una anchura de paso de 1,00 m…». (c) **Matiz:** por la tabla, 1,10 × 1,40 = 1,54 m² pediría solo unos 570 kg (interpolando entre 525 y 600); los 630 kg de esa cabina son el tipo 2 de la UNE-EN 81-70 y el mínimo del ascensor de emergencia, no un mínimo de la tabla 6. **Conclusión para K-REBT.5:** ninguna cabina accesible cabe en 400 kg, y la tabla A de la Guía BT-10 salta de 400 a 630 kg: ITA-3 se mantiene | Tabla 5 del prEN 81-20:2011: «Rated load, mass (kg) / Maximum available car area (m²)». DB-SI Anejo SI A | [EN8120] p. 58 (imagen, 130 ppp); [DBSI] p. 42 (imagen, 170 ppp) |

**Tabla A de la Guía BT-10 — Previsión de potencia para aparatos elevadores** ([G10] p. 5, imagen; no reglamentaria)

| Tipo | Carga (kg) | Nº de personas | Velocidad (m/s) | Potencia (kW) |
|---|---|---|---|---|
| ITA-1 | 400 | 5 | 0,63 | 4,5 |
| ITA-2 | 400 | 5 | 1,00 | 7,5 |
| ITA-3 | 630 | 8 | 1,00 | 11,5 |
| ITA-4 | 630 | 8 | 1,60 | 18,5 |
| ITA-5 | 1000 | 13 | 1,60 | 29,5 |
| ITA-6 | 1000 | 13 | 2,50 | 46,0 |

**Frase de memoria:** «Servicios generales, con simultaneidad 1 (ITC-BT-10 ap. 3.2):
- ascensor de [carga] kg a [v] m/s, [P] kW ([dato del proyecto] / [valor típico ITA-3 de la Guía BT-10, tabla A, no reglamentario]);
- alumbrado de portal y espacios comunes, [S] m² × 8 W/m²;
- alumbrado de escalera, [S] m² × 4 W/m² (estimación de la Guía BT-10 con valores de fluorescencia, tomada como cota del alumbrado LED; criterio de proyecto);
- otros servicios: [lista], [P] kW.
P2 = [P2] W.»

---

## Bloque D — Locales comerciales y oficinas (ITC-BT-10 ap. 3.3 y 4.1) — punto 4 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| D.1 | 100 W/m², 3 450 W, simultaneidad 1 | VERIFICADO | Igual en el ap. 3.3 (edificio de viviendas) y en el 4.1 (edificio comercial o de oficinas) | 3.3 y 4.1: «Se calculará considerando un mínimo de 100 W por metro cuadrado y planta, con un mínimo por local de 3450 W a 230 V y coeficiente de simultaneidad 1.» | [REBT] p. 99 |
| D.2 | Son mínimos; manda la demanda | VERIFICADO | Ap. 4: la demanda real manda, con suelo en 100 W/m² y 3 450 W por local | 4: «En general, la demanda de potencia determinará la carga a prever en estos casos que no podrá ser nunca inferior a los siguientes valores.» | [REBT] p. 99 |
| D.3 | Ejemplo de la Guía (tabla B) | LEÍDO (Guía) + comprobado | **P_local = máx(previsión real; 100 · S; 3 450)**. Local 1: 25 m², desconocida → 2 500 → **3 450**. Local 2: 50 m² → **5 000**. Oficina 1: 200 m², real 35 000 → **35 000**. Oficina 2: 150 m², real 13 500 < 15 000 → **15 000**. Total (coeficiente 1) **58 450 W** ✓ | [G10] p. 5, «Tabla B: ejemplo de previsión de cargas en locales comerciales y oficinas» | [G10] |
| D.4 | ¿Útil o construida? | **NO LO FIJA EL REGLAMENTO** + LEÍDO (Guía BT-04) | El reglamento dice «por metro cuadrado y planta», sin adjetivo. La tabla B de la Guía BT-10 dice «Superficie (m²)». El **modelo de memoria técnica de diseño de la Guía BT-04** pide, para locales y oficinas, **«Superficie útil total»** y «Potencia específica prevista W/m²». Propuesta: **útil** (K-REBT.8). El repo ya guarda la útil de cada zona | [G04] p. 5 (imagen): «LOCALES COMERCIALES Y/U OFICINAS: Superficie útil total … m² · Potencia específica prevista … W/m²» | [G04] |
| D.5 | «Por local» | INTERPRETACIÓN | El mínimo de 3 450 W es por cada local o establecimiento independiente (cada suministro), no por planta ni por zona | 3.3 | — |

**Frase de memoria:** «Locales y oficinas: [n] locales; P = máx(demanda prevista; 100 W/m² × superficie útil; 3 450 W) por local, con simultaneidad 1 (ITC-BT-10 ap. [3.3 / 4.1]): [desglose] = [P3] W. Superficie útil, según el modelo de memoria técnica de diseño de la Guía BT-04.»

---

## Bloque E — Garajes (ITC-BT-10 ap. 3.4) y control de humo (DB-SI, SI 3 ap. 8) — punto 5 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E.1 | 10 / 20 W/m², mínimo 3 450 W | VERIFICADO | 10 W/m² y planta con ventilación natural; 20 W/m² con forzada; mínimo 3 450 W; simultaneidad 1 | 3.4: «Se calculará considerando un mínimo de 10 W por metro cuadrado y planta para garajes de ventilación natural y de 20 W para los de ventilación forzada, con un mínimo de 3450 W a 230 V y coeficiente de simultaneidad 1.» | [REBT] p. 99 |
| E.2 | Humo de incendio → estudio específico | VERIFICADO | — | «Cuando en aplicación de la NBE-CPI-96 sea necesario un sistema de ventilación forzada para la evacuación de humos de incendio, se estudiará de forma específica la previsión de cargas de los garajes.» | [REBT] p. 99 |
| E.3 | Comentario de la Guía | LEÍDO (Guía) | «Para efectuar la previsión de cargas en lo correspondiente a garajes se tendrá en cuenta lo que indiquen los reglamentos y normas de protección contra incendios» | [G10] p. 6 | — |
| E.4 | Equivalente actual de la NBE-CPI-96 | VERIFICADO en [SI3] B8.1 y B8.6–B8.8 (no releído) + INTERPRETACIÓN | DB-SI, **SI 3 ap. 8**: control de humo obligatorio en las «zonas de uso Aparcamiento que no tengan la consideración de aparcamiento abierto». Se admite la ventilación de HS 3; si es **mecánica**: extraer **150 l/plaza·s** (aportación ≤ 120), activación automática por **detección**, ventiladores **F₃₀₀ 60**, conductos E₃₀₀ 60 o EI 60. La ventilación **natural** conforme a HS 3 vale sin esas condiciones ([SI3] B8.7). El «uso Aparcamiento» del DB-SI excluye el garaje de ≤ 100 m² construidos y el de la vivienda unifamiliar ([SI3] B8.4). **Equivalencia:** el «sistema de ventilación forzada para la evacuación de humos de incendio» de la ITC-BT-10 es hoy el **garaje de uso Aparcamiento, no abierto, con control de humo mecánico** | SI 3 ap. 8 pto 1 a) y pto 2 | [SI3] |
| E.5 | Qué hacer en ese caso | CRITERIO | El 20 W/m² deja de ser suficiente por sí solo («se estudiará de forma específica»). Propuesta: **P4 = máx(20 W/m² · S; 3 450 W; potencia declarada de los ventiladores de extracción, que se dimensionan para 150 l/plaza·s, + alumbrado + resto)**, con aviso. Ver K-REBT.10 | — | — |
| E.6 | Edificio de oficinas con garaje | **NO LO FIJA EL REGLAMENTO → CRITERIO** | El ap. 4 no da ratio de garaje. El ap. 3.4 es el único reglamentario: se aplica **por analogía**, rotulado | ap. 4 | [REBT] p. 99 |
| E.7 | Proyecto y pública concurrencia | VERIFICADO (texto) | La ITC-BT-28 ap. 1 cuenta como local de pública concurrencia, «cualquiera que sea su ocupación», el estacionamiento cerrado y cubierto para más de 5 vehículos. Su ap. 3.3.1 d) exige en él alumbrado de seguridad | ITC-BT-28 ap. 1 y 3.3.1 d) | [REBT] (texto) |

**Frase de memoria:** «Garaje de [S] m² útiles con ventilación [natural / forzada]: P4 = máx([10 / 20] W/m² × S; 3 450 W) = [P4] W, con simultaneidad 1 (ITC-BT-10 ap. 3.4).» Con control de humo mecánico: «El garaje es de uso Aparcamiento no abierto y controla el humo de incendio con ventilación mecánica (DB-SI, SI 3 ap. 8). Por ello la previsión se estudia de forma específica (ITC-BT-10 ap. 3.4): [ventiladores de extracción, P kW, + alumbrado …] = [P4] W, no inferior a 20 W/m².»

---

## Bloque F — Recarga del vehículo eléctrico (ITC-BT-10 ap. 5; ITC-BT-52 ap. 3 y 4; DB-HE, HE 6) — punto 6 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| F.1 | Ámbito del ap. 5 | VERIFICADO | El título lo restringe a «viviendas de nueva construcción» | «5. CARGA CORRESPONDIENTE A LAS ZONAS DE ESTACIONAMIENTO CON INFRAESTRUCTURA PARA LA RECARGA DE LOS VEHÍCULOS ELÉCTRICOS EN VIVIENDAS DE NUEVA CONSTRUCCIÓN.» | [REBT] p. 99 |
| F.2 | 5.1 Unifamiliar | VERIFICADO | → **elevada** | «Para la previsión de cargas de viviendas unifamiliares dotadas de infraestructura para la recarga de vehículos eléctricos se considerará grado de electrificación elevado.» | [REBT] p. 100 |
| F.3 | ¿C13 obligatorio en toda unifamiliar nueva? | VERIFICADO | **Sí**, si dispone «de aparcamiento **o zona prevista**». Esquema 4a. La Guía añade que debe quedar **totalmente instalado**: canalización, cables, protecciones **y el punto de recarga** | ITC-BT-52 3.1: «En las viviendas unifamiliares nuevas que dispongan de aparcamiento o zona prevista para poder albergar un vehículo eléctrico se instalará un circuito exclusivo para la recarga de vehículo eléctrico. Este circuito se denominará circuito C13, según la nomenclatura de la (ITC) BT-25 y seguirá el esquema de instalación 4a.» · [G52] p. 24 (texto): «En todas las viviendas unifamiliares nuevas el circuito C13 debe quedar totalmente instalando incluyendo los sistemas de canalización, los cables, las protecciones y el punto de recarga.» | [REBT] p. 279; [G52] |
| F.4 | Potencias del C13 (unifamiliar) | VERIFICADO | Tabla 1 de la ITC-BT-52: a 230 V, 10 A 2 300 W, 16 A 3 680 W, 20 A 4 600 W, 32 A 7 360 W, 40 A 9 200 W (1 estación cada uno); a 230/400 V, 16 A 11 085 W (1–3 estaciones), 20 A 13 856 W (1–4), 32 A 22 170 W (1–6), 40 A 27 713 W (1–8). «… los circuitos C13 monofásicos no dispondrán de una potencia instalada superior a los 9.200 W.» La Guía añade: en la unifamiliar con esquema 4a, la previsión de la vivienda **incluye** la recarga, «con una previsión mínima de 9200 W por vivienda» | [REBT] p. 279; [G52] p. 29 | — |
| F.5 | C13 en propiedad horizontal | VERIFICADO | En los aparcamientos colectivos en propiedad horizontal, el C13 «quedará sustituido» por los esquemas de la ITC-BT-52 en zonas comunes. **La recarga no hace elevada a la vivienda de un plurifamiliar** (el ap. 5.1 solo habla de unifamiliares). Guía, esquema 2: «No resulta necesario prever un grado de electrificación elevado para las viviendas en todos los casos …» | ITC-BT-25 2.3.2, último párrafo | [REBT] p. 168; [G52] p. 29 |
| F.6 | Factores 0,3 / 1,0 | VERIFICADO + **CORREGIDO respecto a la Guía** | **4.1 colectivo (1a, 1b, 1c):** el SPL es **opcional** («a criterio del promotor» en obra nueva); **0,3 con SPL, 1,0 sin SPL**. **4.2 individual (2, 3a, 3b): 1,0.** **4.3 esquema 4 (4a, 4b): 1,0.** La Guía (p. 43) admite el SPL en el 4b y le aplica el caso general (0,3); el reglamento dice 1,0. **Manda el reglamento** | 4.1: «… considerando un factor de simultaneidad de las cargas del vehículo eléctrico con el resto de la instalación igual a 0,3 cuando se instale el SPL y de 1,0 cuando no se instale.» Fórmulas: «Pedificio = (P1 + P2 + P3 + P4 ) + 0,3 · P5 (se instala el SPL)»; «Pedificio = (P1 + P2 + P3 + P4 ) + P5 (no se instala el SPL)». 4.2: «… igual a 1,0.» 4.3: «… con el resto de circuitos de la instalación igual a 1,0.» | [REBT] p. 281; [G52] p. 43 |
| F.7 | 5.2: 3 680 W × 10 % × factor | VERIFICADO | **P5 = 3 680 W × 0,10 × plazas construidas**; después, × factor (F.6). El proyectista puede prever más. Título: solo aparcamientos colectivos **en régimen de propiedad horizontal** | 5.2: «La previsión de cargas para la carga del vehículo eléctrico se calculará multiplicando 3.680 W, por el 10 % del total de las plazas de aparcamiento construidas. La suma de todas estas potencias se multiplicará por el factor de simultaneidad que corresponda y su sumará con la previsión de potencia del resto de la instalación del edificio, en función del esquema de la instalación y de la disponibilidad de un sistema protección de la línea general de alimentación, tal y como se establece en la (ITC) BT-52. No obstante el proyectista de la instalación podrá prever una potencia instalada mayor cuando disponga de los datos que lo justifiquen.» (dos erratas: «su sumará», «sistema protección») | [REBT] p. 100 |
| F.8 | ¿Se redondea el 10 %? | **NO LO FIJA EL REGLAMENTO** + LEÍDO (Guía) | El reglamento multiplica, no habla de plazas enteras. La Guía lo escribe como fórmula continua: **«P5 mínimo = 0,1 · Nº plazas · 3,68 kW»**. Propuesta: **no redondear** (25 plazas → 2,5 × 3 680 = 9 200 W). Ver K-REBT.12 | [G52] p. 28 | [G52] |
| F.9 | El 10 % es el mínimo reglamentario | LEÍDO (Guía) | «Este porcentaje sobre el total de plazas del 10% para la previsión de cargas debe considerarse como valor mínimo reglamentario» | [G52] p. 42 | — |
| F.10 | Anexo 2: PVE = FS1·N·3 680 W | LEÍDO (Guía) | **«PVE = FS1 · P5 = FS1 · N · 3680 W (2)»**. «N, número de plazas de garaje en las que se realiza la preinstalación»; «FS1, factor de simultaneidad cuyo valor depende de si se prevé o no el SPL (0,3 si se prevé y 1 si no se prevé)». Vale para los esquemas 1a, 1b, 1c y 4b (caso general). En el **esquema 2 o 4a**, la recarga entra en P1 por vivienda: período diurno «Pvivienda(con VE) = Pvivienda(sin VE) + (0,3) · 3680 W»; período nocturno «P1(nocturno) = 0,5 · CS · Pvivienda(sin VE) + N · 3680 W»; se toma el mayor. En los **esquemas 3a y 3b**: PVE = N · 3 680 W | [G52] pp. 42–45 | — |
| F.11 | ¿Cuándo se aplica el Anexo 2? | LEÍDO (Guía) + INTERPRETACIÓN | La Guía lo recomienda cuando la preinstalación supera el 50 % de las plazas: «… cuando se desee realizar la preinstalación en un número de plazas, N, elevado, por encima del 50% del total de plazas de garaje construidas …» (p. 42); «… se podrá seguir lo indicado en el anexo 2 …» (p. 27). El texto de p. 26 dice: «En relación con las potencias previstas, será de aplicación lo indicado en el Anexo 2» (texto). Con el **HE 6 ap. 3 pto 1** (conducción de cables al **100 %** en residencial privado), toda promoción nueva de viviendas cae en ese supuesto. **Pero el mínimo reglamentario sigue siendo el 10 %** (F.9). La diferencia es grande: con 40 plazas, el mínimo sin SPL es 14 720 W y el Anexo 2 sin SPL da 147 200 W. Ver K-REBT.12 | [G52] pp. 26–27, 42 | — |
| F.12 | El valor Y | LEÍDO (Guía) | «En el proyecto se debe indicar el punto de recarga número Y, a partir del cual será necesario instalar el SPL. El valor de Y se calculará como la parte entera del número que resulte de multiplicar 0,3 por N.» | [G52] p. 43 | — |
| F.13 | Edificios de uso no residencial (oficinas) | LEÍDO (Guía) + **CORREGIDO** (fundamento) | **«P5 mínimo = (Nº plazas / 40) · 3,68 kW»**, «conforme a la disposición adicional primera del RD 1053/2014». Desde el RD 450/2022, esa disposición solo cubre estacionamientos **no adscritos** a edificios y la vía pública ([BOE-web]). En edificios manda el **HE 6 ap. 3 pto 2**: una estación de recarga «por cada 40 plazas de aparcamiento, **o fracción**». El ap. 5.2 de la ITC-BT-10 **no alcanza** literalmente al garaje de oficinas (F.7). La Guía, p. 29, aplica ese P5 mínimo también a los esquemas 2, 3 y 4 «en edificios de uso no residencial» | [G52] pp. 28–29: «La previsión de potencia de los puntos de recarga a instalar en edificios de uso no residencial tales como los edificios de oficinas u otros de usos comerciales se calculará conforme a la disposición adicional primera del RD 1053/2014 con la siguiente fórmula: …» | [G52]; [HE22] p. 34 |
| F.14 | Preinstalación (3.2, RD 450/2022) | VERIFICADO | **a)** Conducción de cables desde la centralización por las vías principales. Al **100 %** de las plazas, llega a cada plaza; si no, se definen las plazas que cumplen la dotación y llega a ellas. **b)** Centralización dimensionada según el esquema y la ITC-BT-16, con **módulos de reserva** para al menos el 20 % de las plazas no asociadas a una vivienda, y como mínimo uno aunque todas estén asociadas | 3.2 b): «Se instalarán módulos de reserva para al menos el 20 % de las plazas de garaje no asociadas a una vivienda y, aunque todas las plazas estén asociadas a viviendas, como mínimo un módulo de reserva.» | [REBT] p. 280 |
| F.15 | HE 6 | VERIFICADO | **3 pto 1:** residencial privado, conducción de cables para el **100 %** de las plazas. **3 pto 2:** otros usos, al menos el **20 %** y **una estación por cada 40 plazas o fracción** (Administración General del Estado: 1 por cada 20; además, 1 por cada 5 plazas accesibles, que computan). **3 pto 3:** en edificios mixtos sin aparcamientos claramente diferenciados, el uso característico. **Excluidos (1 pto 2 a):** edificios de uso distinto del residencial privado con **10 plazas o menos** | HE 6 ap. 1 y 3 | [HE22] pp. 33–34 |
| F.16 | ¿Qué esquema y SPL por defecto? | **NO LO FIJA EL REGLAMENTO → CRITERIO** | **Factor 1,0** («sin SPL»): es el valor de los esquemas 1 sin SPL, 2, 3 y 4, así que vale **sea cual sea el esquema** que se elija después. 0,3 solo si el usuario declara esquema 1a, 1b o 1c **con SPL**. Ver K-REBT.12 | — | — |

**Ejemplos (para los tests):**
- 40 plazas en propiedad horizontal: P5 = 0,1 · 40 · 3 680 = **14 720 W**. Con SPL (esquema 1): 0,3 · 14 720 = **4 416 W**. Sin SPL: **14 720 W**.
- 25 plazas: P5 = **9 200 W**, sin redondear. Redondeando a plazas enteras por exceso: 3 · 3 680 = 11 040 W.
- Anexo 2 de la Guía con N = 40 (100 %): con SPL 0,3 · 40 · 3 680 = **44 160 W**; sin SPL **147 200 W**.
- Oficinas con 50 plazas: Guía 50/40 · 3,68 = **4,6 kW**. HE 6: ⌈50/40⌉ = 2 estaciones → 2 · 3 680 = **7 360 W**.

**Frases de memoria:**
- Unifamiliar: «La vivienda unifamiliar dispone de [aparcamiento / zona prevista] para un vehículo eléctrico: se instala el circuito C13, esquema 4a (ITC-BT-52 ap. 3.1), y se considera electrificación elevada (ITC-BT-10 ap. 5.1). Potencia prevista [P] W, no inferior a 9 200 W, que incluye la recarga.»
- Plurifamiliar: «Recarga del vehículo eléctrico: P5 = 3 680 W × 10 % de [N] plazas construidas = [P5] W (ITC-BT-10 ap. 5.2). Factor de simultaneidad con el resto del edificio [1,0, sin sistema de protección de la línea general de alimentación (SPL), válido para cualquier esquema de la ITC-BT-52 / 0,3, esquema colectivo con SPL] (ITC-BT-52 ap. 4). Se suman [P] W. Preinstalación: conducción de cables al 100 % de las plazas (DB-HE, HE 6 ap. 3.1) y módulos de reserva en la centralización (ITC-BT-52 ap. 3.2 b).»

---

## Bloque G — Contadores (ITC-BT-16 ap. 2 y 3) — punto 7 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| G.1 | > 16 → local | VERIFICADO | **> 16 contadores: local obligatorio. ≤ 16: armario o local** | 2.2: «Cuando el número de contadores a instalar sea superior a 16, será obligatoria su ubicación en local, según el apartado 2.2.1 siguiente.» 2.2.2: «Si el número de contadores a centralizar es igual o inferior a 16, además de poderse instalar en un local …, la concentración podrá ubicarse en un armario destinado única y exclusivamente a este fin.» | [REBT] pp. 115–116 |
| G.2 | Qué se cuenta | VERIFICADO (literal) + INTERPRETACIÓN | Los contadores «de cada uno de los usuarios y de los servicios generales del edificio»: **viviendas + locales u oficinas (uno por suministro) + servicios generales**. Más, según el esquema de recarga: los **contadores principales** de los esquemas 1a, 1b, 1c, 2, 3a y 3b, que van «en el propio local o armario» de la concentración (ITC-BT-52 ap. 5), y los **módulos de reserva** de la ITC-BT-52 3.2 b) (F.14). El REBT no dice si los módulos de reserva cuentan para el umbral de 16 → CRITERIO K-REBT.13 | 2.2: «Los contadores y demás dispositivos para la medida de la energía eléctrica de cada uno de los usuarios y de los servicios generales del edificio, podrán concentrarse en uno o varios lugares …» | [REBT] p. 115; p. 281 |
| G.3 | Un solo usuario | VERIFICADO | Colocación individual (caja de protección y medida) solo para un usuario, o dos alimentados desde el mismo lugar | 2.1: «Esta disposición se utilizará sólo cuando se trate de un suministro a un único usuario independiente o a dos usuarios alimentados desde un mismo lugar.» | [REBT] p. 114 |
| G.4 | Planta | VERIFICADO | Edificios de hasta 12 plantas: planta baja, entresuelo o primer sótano. Más de 12: concentración por plantas intermedias, de 6 o más plantas cada una. Concentración por plantas si cada una tiene más de 16 contadores | 2.2 | [REBT] p. 115 |
| G.5 | Condiciones del local que chocan con «El edificio» | VERIFICADO | El local: (a) está «dedicado única y exclusivamente a este fin», aunque puede albergar el equipo de comunicación de la compañía y el **cuadro general de mando y protección de los servicios comunes**; (b) «nunca podrá coincidir con el de otros servicios tales como cuarto de calderas, concentración de contadores de agua, gas, telecomunicaciones, maquinaria de ascensores o de otros como almacén, cuarto trastero, de basuras, etc.»; (c) «no servirá nunca de paso ni de acceso a otros locales»; (d) está en planta baja, entresuelo o primer sótano, cerca de la entrada; (e) sumideros si la cota del suelo es ≤ la de los locales colindantes; (f) altura mínima 2,30 m; anchura en las paredes con contadores ≥ 1,50 m; 1,10 m libres enfrente; 0,20 m a los lados; (g) puerta de 0,70 × 2 m que abre hacia fuera; (h) alumbrado de emergencia de 1 h y 5 lux; extintor de eficacia 21B fuera, junto a la puerta | 2.2.1 | [REBT] pp. 115–116 |
| G.6 | Riesgo especial | VERIFICADO en [SI12] 10.6 (no releído) | El texto cita la NBE-CPI-96 (riesgo especial bajo). Hoy: DB-SI, SI 1 tabla 2.1, «Local de contadores de electricidad y de cuadros generales de distribución» → **riesgo especial bajo en todo caso** | — | [SI12] |
| G.7 | Armario | VERIFICADO | En la zona común de la entrada; pasillo de **1,5 m**; **PF 30**; ventilación e iluminación; extintor 21B; base de enchufe de 16 A | 2.2.2 | [REBT] p. 116 |
| G.8 | Interruptor general de maniobra | VERIFICADO (texto) | Obligatorio con más de dos usuarios. «El interruptor será, como mínimo, de 160 A para previsiones de carga hasta 90 kW, y de 250 A para las superiores a ésta, hasta 150 kW.» | ITC-BT-16 ap. 3 | [REBT] (texto) |
| G.9 | ¿Algo más en la Guía BT-16? | LEÍDO (Guía) | Repite el reglamento (p. 7, imagen). Comentarios útiles (texto): el local «RF90 según el artículo 19 de la NBE-CPI-96»; la puerta «RF60 como mínimo excepto cuando el paso se realice desde un vestíbulo previo, caso en que la puerta será RF30». Son de la NBE-CPI-96, derogada: **no usar** | [G16] pp. 7–8 | — |

**Frase de memoria:** «Contadores: [n_v] viviendas + [n_l] locales + 1 de servicios generales [+ n_r módulos de reserva para la recarga del vehículo eléctrico (ITC-BT-52 ap. 3.2 b)] = [N] contadores, [superior a 16: concentración en local obligatoria / no superior a 16: concentración en armario o local] (ITC-BT-16 ap. 2.2). El local está en [planta], es de uso exclusivo y no coincide con otros servicios (ITC-BT-16 ap. 2.2.1); es local de riesgo especial bajo (DB-SI, SI 1, tabla 2.1).»

---

## Bloque H — Proyecto o memoria técnica de diseño (ITC-BT-04 ap. 3 y 4) — punto 8 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| H.1 | Grupo e | VERIFICADO | **P > 100 kW por caja general de protección** | «Las de edificios destinados principalmente a viviendas, locales comerciales y oficinas, que no tengan la consideración de locales de pública concurrencia, en edificación vertical u horizontal.» · «P > 100 kW por caja gral. de protección.» | [REBT] p. 52 |
| H.2 | Grupo f | VERIFICADO | Viviendas unifamiliares, **P > 50 kW** | «Las correspondientes a viviendas unifamiliares.» · «P > 50 kW.» | [REBT] p. 52 |
| H.3 | Grupos g y h | VERIFICADO + **CORREGIDO** (redacción) | Dice «**aparcamientos o estacionamientos**», no «garajes» (la Guía BT-04 de 2003 aún dice garajes). g: los que requieren ventilación forzada, «Cualquiera que sea su ocupación». h: los que disponen de ventilación natural, «De más de 5 plazas de estacionamiento» (estricto: 5 → no) | «Las de aparcamientos o estacionamientos que requieren ventilación forzada.» / «Las de aparcamientos o estacionamientos que disponen de ventilación natural.» | [REBT] p. 52 |
| H.4 | Grupo i | VERIFICADO + E.7 | Locales de pública concurrencia, sin límite. El estacionamiento cerrado y cubierto para más de 5 vehículos lo es (ITC-BT-28) | — | [REBT] p. 52 |
| H.5 | Grupo z | VERIFICADO | Tres filas: «Las correspondientes a las infraestructuras para la recarga del vehículo eléctrico.» **P > 50 kW** · «Instalaciones de recarga situadas en el exterior.» **P > 10 kW** · «Todas las instalaciones que incluyan estaciones de recarga previstas para el modo de carga 4.» **Sin límite** | Tabla de 3.1 | [REBT] p. 53 |
| H.6 | Qué es P | VERIFICADO | «[P = Potencia prevista en la instalación, teniendo en cuenta lo estipulado en la (ITC) BT-10].» Para el grupo z, INTERPRETACIÓN: P5 **sin** el factor de simultaneidad con el resto del edificio, porque ese factor no reduce la potencia de la propia instalación de recarga. Con el 10 %: P5 > 50 kW ⇔ **plazas ≥ 136** | — | [REBT] p. 53 |
| H.7 | Recarga en aparcamientos existentes | VERIFICADO | «No será necesaria la elaboración de proyecto para las instalaciones de recarga que se ejecuten en los grupos de instalación g) y h) existentes en edificios de viviendas, siempre que las nuevas instalaciones no estén incluidas en el grupo z).» (no aplica a obra nueva) | — | [REBT] p. 53 |
| H.8 | 3.3 | VERIFICADO | «Si una instalación está comprendida en más de un grupo de los especificados en 3.1, se le aplicará el criterio más exigente de los establecidos para dichos grupos.» | — | [REBT] p. 53 |
| H.9 | ¿El grupo g o h obliga a proyectar todo el edificio? | **NO LO FIJA EL REGLAMENTO → INTERPRETACIÓN** | El grupo g o h define como «instalación» la **del aparcamiento**. El 3.3 resuelve una instalación que cae en dos grupos, no extiende la exigencia al resto del edificio. Por otro lado, el ap. 2.1 permite el proyecto «bien como parte del proyecto general del edificio, bien en forma de uno o varios proyectos específicos». Lectura propuesta: **el aparcamiento requiere proyecto**; las viviendas y los servicios, según el grupo e. La Guía BT-04 no comenta este caso (texto pp. 8–11). En la práctica, muchas comunidades autónomas tramitan un único proyecto del edificio: avisarlo | ap. 2.1 y 3.3 | [REBT] pp. 51–53 |
| H.10 | Resto | VERIFICADO | «Requerirán Memoria Técnica de Diseño todas las instalaciones sean nuevas, ampliaciones o modificaciones no incluidas en los grupos indicados en el apartado 3.» | ap. 4 | [REBT] p. 53 |

**Frase de memoria:** «Documentación (ITC-BT-04 ap. 3.1 y 4):
- edificio de viviendas con una previsión de [P] kW por caja general de protección, [superior / no superior] a 100 kW (grupo e);
- aparcamiento con ventilación [forzada (grupo g, sin límite) / natural de N plazas (grupo h, más de 5)];
- infraestructura de recarga de [P5] kW (grupo z, más de 50 kW).
La instalación [del aparcamiento] requiere proyecto; el resto, [proyecto / memoria técnica de diseño].»

---

## Bloque I — Reserva de local para centro de transformación — punto 9 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita / fuente |
|---|---|---|---|---|
| I.1 | RD 1955/2000, arts. 45 a 47 | LEÍDO (web) + **CORREGIDO** | En el consolidado de boe.es (actualizado a 12-02-2026), los arts. 44, 45 y 47 constan «(Derogado)»: «Se deroga por la disposición derogatoria única del Real Decreto 1048/2013, de 27 de diciembre. Ref. BOE-A-2013-13767». El art. 46 sigue vigente. **Ya no se puede citar el RD 1955/2000 para la reserva de local** | [BOE-web] BOE-A-2000-24019 |
| I.2 | Dónde está hoy | **VERIFICADO** (2026-10-05) + **CORREGIDO** (matiz) | **RD 1048/2013, art. 26 «Reserva de uso de locales»**, ap. 1: «Cuando se trate de suministros sobre suelos en situación básica de urbanizados por contar con las infraestructuras y los servicios a que se refiere el artículo 12.3.b del texto refundido de la Ley de Suelo, aprobado por Real Decreto Legislativo 2/2008, de 20 de junio, incluidos los suministros de alumbrado público, y la potencia solicitada para un local, edificio o agrupación de éstos sea superior a 100 kW, o cuando la potencia solicitada de un nuevo suministro o ampliación de uno existente sea superior a esa cifra, **el solicitante deberá reservar un local**, para su posterior uso por la empresa distribuidora, de acuerdo con las condiciones técnicas reglamentarias y con las normas técnicas establecidas por la empresa distribuidora y aprobadas por la Administración Pública competente, cerrado y adaptado, con fácil acceso desde la vía pública, para la ubicación de un centro de transformación cuya situación corresponda a las características de la red de suministro aérea o subterránea y destinado exclusivamente a la finalidad prevista. El propietario del local quedará obligado a registrar esta cesión de uso, corriendo los gastos correspondientes a cargo de la empresa distribuidora.» Ap. 2: «Si el local no fuera utilizado por la empresa distribuidora transcurridos seis meses desde la puesta a su disposición por el propietario, desaparecerá la obligación de cesión a que se refiere el apartado anterior.» **Matiz corregido:** es una obligación del solicitante («deberá reservar»), no algo que la distribuidora «puede exigir». El umbral es la **potencia solicitada**, no la previsión de cargas, aunque en la práctica suele ser la misma | [RD1048] pp. 32–33 (imagen, 150 ppp) |
| I.3 | Vigencia | **VERIFICADO** | El consolidado lleva «Última modificación: 03 de noviembre de 2016» y, tras el art. 26, una sola nota: «Téngase en cuenta que se declara la inconstitucionalidad y nulidad del inciso destacado del apartado 3 por Sentencia del TC 120/2016, de 23 de junio. Ref. BOE-A-2016-7297.» El inciso nulo es la compensación «que se establecerá por orden del Ministro de Industria, Energía y Turismo, previo acuerdo de la Comisión Delegada…». Los ap. 1 y 2 están intactos y **ninguna norma posterior a 2016 ha tocado el artículo** (descartado el RD 1183/2020) | [RD1048] pp. 3 (texto) y 33 (imagen) |
| I.4 | Remisión del REBT | VERIFICADO (texto) | Art. 13 «Reserva de local»: «En lo relativo a la reserva de local se seguirán las prescripciones recogidas en la reglamentación por la que se regulen las actividades de transporte, distribución, comercialización, suministro y procedimientos de autorización de instalaciones de energía eléctrica.» Art. 12: los titulares facilitan a la suministradora la información de cargas «a fin de poder adecuar … las previsiones de cargas en sus centros de transformación» | [REBT] p. 12 (texto) |
| I.5 | Suministro en baja tensión > 50 kW | LEÍDO (web) | RD 1955/2000 art. 46 (vigente): baja tensión hasta 1 kV, «no pudiéndose atender suministros con potencia superiores a 50 kW, salvo acuerdo con la empresa distribuidora». Literal sin cotejar | [BOE-web] |

**Frase de memoria (aviso, no veredicto):** «Al superar 100 kW, en suelo urbanizado el solicitante reservará a la empresa distribuidora un local cerrado y adaptado, con fácil acceso desde la vía pública, para centro de transformación (art. 13 del REBT; RD 1048/2013, art. 26.1); la obligación decae si la distribuidora no lo usa en seis meses (art. 26.2). Se coordinará con ella.» Sigue siendo un aviso: la app no sabe si el suelo es urbanizado ni la potencia que se solicitará.

---

## Bloque J — Intensidad de la línea general de alimentación — punto 10 del encargo

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| J.1 | ¿Fórmula en el reglamento? | **NO LO FIJA EL REGLAMENTO** | La ITC-BT-14 ap. 3 solo dice que la intensidad máxima admisible es la de la UNE 20.460-5-523 «de acuerdo con la previsión de potencias establecidas en la ITC-BT-10». Caída de tensión máxima: **0,5 %** con contadores totalmente centralizados y **1 %** con centralizaciones parciales. Sección mínima 10 mm² Cu o 16 mm² Al. No da fórmula de intensidad ni cos φ | [REBT] ITC-BT-14 (texto) |
| J.2 | ¿Fórmula en la Guía BT-14? | **NO** (lo leído) | La Guía remite a otro documento: «El método de cálculo de la caída de tensión se indica en el Anexo 2 de esta Unidad Temática». Ese anexo (`guia_bt_anexo_2_sep03R1.pdf`) se descargó pero **no se ha podido leer** (no se pudo renderizar). No hay cos φ en las pp. 4–9 | [G14] p. 8 (texto) |
| J.3 | cos φ en otras guías | LEÍDO (Guía, texto) | La Guía BT-25 calcula las longitudes máximas de los circuitos interiores con «cosϕ = 1» | [G25] p. 10 (texto) |
| J.4 | Propuesta | **CRITERIO** | **I = P / (√3 · 400 · cos φ)**, con **cos φ = 0,9** (da un 11 % más de intensidad que con 1). Unifamiliar monofásica: I = P / 230. Ejemplo: 70 544 W → **113,1 A** con 0,9 (101,8 A con 1). Rotular «criterio de cálculo; el REBT no fija el factor de potencia». Ver K-REBT.15 | — |

**Frase de memoria:** «Intensidad de cálculo de la línea general de alimentación: I = P / (√3 · 400 V · 0,9) = [I] A (factor de potencia 0,9, criterio de cálculo; el REBT no lo fija). La sección se comprobará con la UNE 20.460-5-523 y la caída de tensión máxima del [0,5 / 1] % (ITC-BT-14 ap. 3).»

---

## Bloque K — Clasificación del lugar de consumo (ap. 1, 3 y 4) — punto 11 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| K.1 | Lista | VERIFICADO | «– Edificios destinados principalmente a viviendas. – Edificios comerciales o de oficinas. – Edificios destinados a una industria específica. – Edificios destinados a una concentración de industrias. – Aparcamientos o estacionamientos dotados de infraestructura para la recarga de los vehículos eléctricos.» | ap. 1 | [REBT] p. 98 |
| K.2 | El ap. 3 ya es mixto | VERIFICADO | El edificio «principalmente» de viviendas incluye los locales comerciales y los garajes «que forman parte del mismo». El ap. 3 dice «preferentemente» en el título y «principalmente» en el cuerpo | 3: «La carga total correspondiente a un edificio destinado principalmente a viviendas resulta de la suma de la carga correspondiente al conjunto de viviendas, de los servicios generales del edificio, de la correspondiente a los locales comerciales y de los garajes que forman parte del mismo.» | [REBT] p. 98 |
| K.3 | ¿Cómo se clasifica un mixto? | **NO LO FIJA EL REGLAMENTO → CRITERIO** | No define «principalmente». **En la práctica la clasificación cambia poco:** locales y oficinas tienen el mismo ratio en 3.3 y en 4.1. Lo que cambia: (a) los servicios generales y el garaje solo tienen apartado en el 3; (b) el ap. 5.2 (recarga) solo vale en residencial. Propuesta: **si hay viviendas → ap. 3** (suma viviendas + servicios generales + locales u oficinas + garaje + recarga). Sin viviendas → ap. 4, sumando por analogía servicios generales y garaje (E.6) y la recarga según HE 6 o la Guía (F.13). La ITC-BT-16 2.2 apoya la lectura: «edificios destinados a viviendas y locales comerciales». Ver K-REBT.14 | — | — |
| K.4 | Coherencia con HE 5 y HE 6 | INTERPRETACIÓN | Esta clasificación es solo eléctrica. Para el VE, el HE 6 ap. 3 pto 3 manda el uso característico solo si las zonas de aparcamiento no están diferenciadas | [HE22] p. 34 | — |

**Frase de memoria:** «El edificio se destina principalmente a viviendas, con [locales / oficinas] y garaje que forman parte de él: su carga total es la suma de viviendas, servicios generales, locales y garaje (ITC-BT-10 ap. 1 y 3).» Sin viviendas: «Edificio de oficinas: la demanda de potencia determina la carga, que no será inferior a 100 W/m² con un mínimo de 3 450 W por local (ITC-BT-10 ap. 4.1). Servicios generales y garaje se añaden por analogía con los ap. 3.2 y 3.4 (criterio de proyecto).»

---

## Bloque L — Edición y cita (incluye el índice desactualizado) — punto 12 del encargo

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| L.1 | Última modificación | VERIFICADO (texto) | «Última modificación: 03 de septiembre de 2025». Es el RD 770/2025, que solo toca la ITC-BT-03 ([BOE-web]) | [REBT] p. 5 |
| L.2 | Índice de la ITC-BT-10 sin actualizar | VERIFICADO | El índice (p. 97) termina en «5. PREVISIÓN DE CARGAS» y «6. SUMINISTROS MONOFÁSICOS», y en el ap. 1 no tiene el lugar de consumo nuevo. El cuerpo (pp. 99–100) tiene **5** recarga del vehículo eléctrico (5.1 y 5.2), **6** previsión de cargas y **7** suministros monofásicos. **Citar por el cuerpo.** El ap. 6 dice además «capítulos 2, 3, 4 y 5» (la Guía BT-10, de 2003, decía «2,3 y 4») | [REBT] pp. 97, 99–100; [G10] p. 6 |
| L.3 | Qué disposición tocó cada ITC | LEÍDO (web) | Ver el apartado 0 | [BOE-web] |
| L.4 | Cita en la ficha | — | «REBT (RD 842/2002), ITC-BT-xx ap. y, consolidado BOE-A-2002-18099, últ. modif. 03-09-2025.» Las guías, siempre «(Guía técnica de aplicación, Ministerio, ed. …; no reglamentaria)» | — |

---

## Bloque M — Revisión del módulo existente (`src/modules/rebt/`)

Lo verificado coincide con `tablas.ts`:
- grado (5 750 / 9 200 / > 160 / IGA 25);
- tabla C;
- tabla 1 con las erratas corregidas;
- tabla A y alumbrado;
- 100 W/m² y 3 450 W;
- 10 / 20 W/m² y 3 450 W;
- 3 680 W, 10 %, 0,3 / 1,0;
- 16 contadores y 12 plantas;
- umbrales de la ITC-BT-04.

Diferencias o huecos (para `motor-calculo`; no se ha tocado código):

| # | Dónde | Qué | Propuesta | Base |
|---|---|---|---|---|
| M.1 | `justificacion.ts`, `trifasica = !unifamiliar \|\| total_W > G.elevada_W` | Hace trifásica la unifamiliar por encima de **9 200 W** | Umbral **14 490 W** (ap. 7). Además, `igaDe()` devuelve ⌈P/230⌉ por encima de 14 490 W, que no es un calibre normalizado: por encima de 14 490 W, trifásico | A.13 |
| M.2 | Recarga solo si `clasificacion === "viviendas"` | El garaje de un edificio de oficinas queda sin previsión de recarga | K-REBT.11: ⌈plazas/40⌉ · 3 680 W (HE 6), salvo las exclusiones del HE 6 (≤ 10 plazas) | F.13, F.15 |
| M.3 | `conRecarga` solo con zona `garaje_privado` | La ITC-BT-52 3.1 también obliga con una «zona prevista» (plaza exterior) | Añadir la decisión «plaza o zona para vehículo en la parcela» | F.3 |
| M.4 | Contadores | No cuenta los módulos de reserva (ITC-BT-52 3.2 b) ni los contadores principales de recarga de los esquemas 1, 2 y 3 | K-REBT.13 | G.2, F.14 |
| M.5 | `humo = forzada && bajoRasante` | El SI 3 ap. 8 solo obliga en «uso Aparcamiento» (> 100 m² construidos, no unifamiliar) y no abierto | Añadir la condición de > 100 m² construidos | E.4 |
| M.6 | Grupo e con `total_W` | El umbral es **por caja general de protección** | Suponer una sola CGP y decirlo («se supone una única caja general de protección») | H.1 |
| M.7 | `PROC_GUIA` sin edición | Las guías tienen ediciones distintas | BT-10 sep-03 R1; BT-25 jul-12 R2; **BT-52 sept-2024 R2**; BT-04 y BT-16 sep-03 R1 | Apartado 0 |
| M.8 | `HABITUALES_REBT.electrificacion = "elevada"` | Es un criterio de producto, no del reglamento (el mínimo reglamentario es la básica) | Mantener, rotulado según K-REBT.1 | A.6, A.14 |
| M.9 | Factor 0,3 con SPL para cualquier esquema | La ITC-BT-52 solo admite 0,3 en el esquema colectivo (1a, 1b, 1c) | Que la decisión sea «esquema colectivo con SPL», no «con SPL» a secas | F.6 |
| M.10 | Comentario de `tablas.ts`: «RD 1053/2014 (… apartados 1, 2.1.2 y 5 de la ITC-BT-10)» | 1 y 5: LEÍDO (web). 2.1.2: INTERPRETACIÓN | Dejarlo, añadiendo «ITC-BT-52 ap. 3.2 según RD 450/2022» | Apartado 0 |

---

## Decisiones de producto (lo que el reglamento no fija)

Todas son **CRITERIO** y se rotulan así en la ficha, salvo las marcadas como «Guía».

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-REBT.1 | Grado por defecto | **Elevada** (9 200 W, IGA 40 A) si el usuario no dice nada, rotulado «criterio: vivienda nueva con climatización eléctrica, lo habitual hoy». **Básica** solo si el usuario confirma que no hay calefacción eléctrica ni aire acondicionado, no hay más de 160 m², no hay recarga en unifamiliar y no hay electrodomésticos que pidan circuitos adicionales. En la básica, ofrecer 5 750 o 7 360 W | A.2, A.6, A.10 |
| K-REBT.2 | Aerotermia | Bomba de calor para **calefacción o refrigeración** → **elevada** («sistema de calefacción eléctrica / acondicionamiento de aire», ITC-BT-10 2.1.2). Bomba de calor **solo de ACS** → C4 «termo eléctrico», **no** fuerza la elevada. Leer la producción de HE 4 si existe | A.14 |
| K-REBT.3 | Lista de la Guía | Lista de comprobación con los 8 criterios de la Guía BT-10 y BT-25, rotulada «Guía, no reglamentaria». Que cualquiera marcado pase a elevada, salvo las excepciones de A.5 | A.4, A.5 |
| K-REBT.4 | Escalones | Potencia por vivienda ∈ {5 750, 7 360, 9 200, 11 500, 14 490} W (tabla C). Por encima de 14 490 W, **suministro trifásico** (ap. 7) | A.9, A.13 |
| K-REBT.5 | Ascensor | **ITA-3, 11,5 kW** si no hay dato, rotulado «valor típico de la Guía BT-10, tabla A (NTE-ITA); cabina de ascensor accesible». El dato del proyecto manda | C.6 |
| K-REBT.6 | Alumbrado común LED | **8 W/m²** en portal y espacios comunes; **4 W/m²** en escalera (fluorescencia de la Guía, como cota del LED) | C.3, C.4 |
| K-REBT.7 | Otros servicios generales | Grupo de presión (de HS 4), producción centralizada de ACS o calefacción (de HE 4 o el RITE), telecomunicaciones, puertas: dato del usuario, sin valor por defecto, con aviso si falta. **No** contar la ventilación ni el alumbrado del garaje (van en P4) | C.5 |
| K-REBT.8 | Superficie de locales, oficinas y garaje | **Útil** (modelo de memoria técnica de diseño de la Guía BT-04), rotulado | D.4 |
| K-REBT.9 | Local u oficina | P = máx(dato; 100 · S_útil; 3 450) **por local**. Local sin uso: 100 W/m² con el mínimo, como «previsto» | D.1–D.5 |
| K-REBT.10 | Garaje con control de humo mecánico (uso Aparcamiento > 100 m² construidos, no abierto, ventilación mecánica) | P4 = máx(20 · S; 3 450; potencia declarada de ventiladores + alumbrado + resto). Aviso: «estudio específico (ITC-BT-10 ap. 3.4; DB-SI, SI 3 ap. 8: extracción de 150 l/plaza·s)». Sin dato, 20 W/m² y aviso | E.2–E.5 |
| K-REBT.11 | Garaje en edificio sin viviendas | P4 por analogía con el ap. 3.4. Recarga: **⌈plazas/40⌉ · 3 680 W** (HE 6 ap. 3 pto 2, «o fracción»); cubre el mínimo de la Guía, plazas/40 · 3,68 kW. Factor 1,0. Sin recarga si hay ≤ 10 plazas (exclusión del HE 6) | E.6, F.13, F.15 |
| K-REBT.12 | Recarga en viviendas | **P5 = 0,1 · plazas · 3 680 W, sin redondear** (literal y Guía). **Factor 1,0 por defecto**, rotulado «sin SPL; válido para cualquier esquema de la ITC-BT-52». 0,3 solo si el usuario declara **esquema 1a, 1b o 1c con SPL**, y entonces se muestra el valor Y = ⌊0,3 · N⌋ de la Guía. Mostrar **como información** la previsión del Anexo 2 de la Guía (FS1 · N · 3 680 W con N = plazas con conducción, el 100 % por el HE 6), rotulada «recomendación de la Guía BT-52, no reglamentaria». No usarla para el veredicto | F.6–F.12, F.16 |
| K-REBT.13 | Recuento de contadores | viviendas + locales u oficinas (uno por local) + 1 de servicios generales (el garaje comunitario va dentro). Más los **módulos de reserva** de la ITC-BT-52 3.2 b): ⌈0,2 · plazas no asociadas a vivienda⌉, **mínimo 1** si hay garaje. Más los contadores principales de recarga si el usuario declara esquema 1 o 3. Contar los módulos de reserva en el umbral de 16 (del lado de exigir local) y rotularlo | G.1, G.2, F.14 |
| K-REBT.14 | Edificio mixto | Con viviendas → ap. 3 para todo. Sin viviendas → ap. 4, más servicios generales y garaje por analogía | K.3 |
| K-REBT.15 | Intensidad de la línea general de alimentación | I = P / (√3 · 400 · 0,9). Unifamiliar: I = P / 230 hasta 14 490 W | J.4 |
| K-REBT.16 | Proyecto | Grupo e: total del edificio > 100 kW, suponiendo **una** CGP (avisarlo). Grupo f: unifamiliar > 50 kW. **g:** ventilación forzada; **h:** natural con > 5 plazas. Rotular «la instalación del aparcamiento requiere proyecto; la Administración autonómica puede pedir un único proyecto del edificio». Grupo z: P5 (sin factor) > 50 kW | H.1–H.9 |
| K-REBT.17 | Reserva de local para centro de transformación | Si la previsión total > 100 kW: **aviso, no veredicto**: «en suelo urbanizado, el solicitante debe reservar un local para centro de transformación; decae a los seis meses si la distribuidora no lo usa (REBT art. 13; RD 1048/2013 art. 26.1 y 26.2)». No citar el RD 1955/2000 | I.1–I.4 |
| K-REBT.18 | Cita y edición | Como en L.4. Las guías, con su edición | Apartado 0, L |

---

## Cifras para el código

```text
# REBT — RD 842/2002, consolidado BOE-A-2002-18099, últ. modif. 03-09-2025 (imagen salvo «texto»)
BT10.basica_W                     = 5750      # ap.2.2, a 230 V, mínimo
BT10.elevada_W                    = 9200      # ap.2.2, mínimo
BT10.elevada.superficieUtil_m2    = 160       # estricto ">" (ap.2.1.2; BT-25 C7)
BT10.monofasicoMax_W              = 14490     # ap.7
BT25.igaMin_A                     = 25        # ap.2.1
BT25.tabla1.maxPuntos             = {C1: 30, C2: 20, C5: 6}   # más → C6/C7/C12 → elevada (2.3.2)
BT25.tabla1.C8_C9_maxCircuito_W   = 5750      # nota (2)
BT10.tabla1.CS[n=1..21]           = [1,2,3,3.8,4.6,5.4,6.2,7,7.8,8.5,9.2,9.9,10.6,11.3,11.9,12.5,13.1,13.7,14.3,14.8,15.3]
BT10.tabla1.CS[n>21]              = 15.3 + (n-21)*0.5
BT10.tarifaNocturna.CS            = n
BT10.P1                           = media(Pvivienda) * CS
BT10.servicios.simultaneidad      = 1
BT10.locales.W_m2                 = 100       # «por metro cuadrado y planta»
BT10.locales.minimoPorLocal_W     = 3450
BT10.garaje.natural_W_m2          = 10
BT10.garaje.forzada_W_m2          = 20
BT10.garaje.minimo_W              = 3450
BT10.VE.porPlaza_W                = 3680      # ap.5.2
BT10.VE.fraccionPlazas            = 0.10      # de las plazas construidas; sin redondeo
BT52.factor.colectivoConSPL       = 0.3       # solo esquemas 1a/1b/1c (ap.4.1)
BT52.factor.colectivoSinSPL       = 1.0
BT52.factor.individual            = 1.0       # 2, 3a, 3b (ap.4.2)
BT52.factor.esquema4              = 1.0       # 4a, 4b (ap.4.3)
BT52.C13.monofasicoMax_W          = 9200      # ap.3.1
BT52.reserva.fraccionNoAsociadas  = 0.20      # módulos de reserva; mínimo 1 (ap.3.2 b)
BT16.localSiMasDe                 = 16        # ap.2.2 (estricto)
BT16.plantasConcentracionUnica    = 12        # ap.2.2
BT16.IGM_A                        = {hasta90kW: 160, hasta150kW: 250}   # ap.3 (texto)
BT04.e.edificioPorCGP_kW          = 100       # ">"
BT04.f.unifamiliar_kW             = 50        # ">"
BT04.h.naturalMasDe_plazas        = 5         # ">"
BT04.z.recarga_kW                 = 50        # ">"; exterior 10; modo 4 sin límite

# Guías (no reglamentarias)
G10.tablaC = [[5750,25],[7360,32],[9200,40],[11500,50],[14490,63]]   # W, A
G10.tablaA = ITA-1 400kg/5p/0.63/4.5 | ITA-2 400/5/1.00/7.5 | ITA-3 630/8/1.00/11.5 | ITA-4 630/8/1.60/18.5 | ITA-5 1000/13/1.60/29.5 | ITA-6 1000/13/2.50/46.0
G10.alumbrado.portal_W_m2  = {incandescencia: 15, fluorescencia: 8}
G10.alumbrado.escalera_W_m2 = {incandescencia: 7, fluorescencia: 4}
G52.P5min.noResidencial    = plazas/40 * 3680   # W (Guía p.28)
G52.anexo2.PVE             = FS1 * N * 3680     # N = plazas con preinstalación; FS1 0,3 con SPL / 1 sin
G52.Y                      = floor(0.3 * N)

# DB-HE, HE 6 (consolidado 14-06-2022, imagen pp.33–34)
HE6.residencial.conduccion = 1.00   # 100 % de las plazas
HE6.otros.conduccion       = 0.20   # al menos
HE6.otros.estaciones       = ceil(plazas/40)    # «o fracción»; AGE: ceil(plazas/20)
HE6.otros.excluidoHasta    = 10     # plazas (≤ 10 excluido)
HE6.accesibles.estaciones  = ceil(plazasAccesibles/5)   # computan

# Criterios del producto (NO son del REBT)
crit.ascensor           = "ITA-3"   # 11,5 kW
crit.alumbradoLED       = fluorescencia (8 / 4 W/m²)
crit.superficie         = "útil"
crit.cosPhi             = 0.9 ; U = 400 V
crit.VE.factorDefecto   = 1.0
crit.VE.redondeo        = ninguno
```

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Grado y potencias | REBT | RD 842/2002, consolidado | 2025-09-03 | ITC-BT-10 ap. 2.1.2 y 2.2; ITC-BT-25 ap. 2.1 | — | boe.es BOE-A-2002-18099, pp. 98, 167 (imagen) |
| Coeficiente de simultaneidad | REBT | ídem | 2025-09-03 | ITC-BT-10 ap. 3.1 | Tabla 1 | ídem pp. 98–99; erratas cotejadas con Guía BT-10 p. 4 |
| Locales, garajes, servicios | REBT | ídem | 2025-09-03 | ITC-BT-10 ap. 3.2, 3.3, 3.4 y 4.1 | — | ídem p. 99 |
| Recarga del vehículo eléctrico | REBT | ídem (ap. 5 por RD 1053/2014) | 2025-09-03 | ITC-BT-10 ap. 5; ITC-BT-52 ap. 3.1, 3.2 y 4 | ITC-BT-52 Tabla 1 | ídem pp. 99–100, 279–281 |
| Contadores | REBT | ídem | 2025-09-03 | ITC-BT-16 ap. 2.1, 2.2 y 3 | — | ídem pp. 114–116 |
| Proyecto o MTD | REBT | ídem | 2025-09-03 | ITC-BT-04 ap. 3.1, 3.3 y 4 | — | ídem pp. 52–53 |
| Escalones IGA | Guía técnica ITC-BT-10 | sep-03, rev. 1 | 2003-09 | ap. 6 | Tabla C | guia_bt_10_sep03R1.pdf p. 6 (= Guía BT-25 jul-12 rev. 2, Tabla A, p. 3) |
| Ascensores, alumbrado | Guía técnica ITC-BT-10 | sep-03, rev. 1 | 2003-09 | ap. 3.2 | Tabla A | ídem p. 5 |
| P5 mínimo no residencial; Anexo 2; Y | Guía técnica ITC-BT-52 | sept-2024, rev. 2 | 2024-09 | ap. 4; Anexo 2 | — | guia_bt_52_nov17R1.pdf pp. 27–29, 42–45 |
| Dotaciones de recarga | DB-HE | 2019, consolidado 14-06-2022 | 2022-06-14 | HE 6 ap. 1 y 3 | — | DBHE.pdf pp. 33–34 |

---

## Pendientes

1. ~~**P1 — RD 1048/2013, art. 26**~~ **Hecho (2026-10-05):** literal leído en la imagen del consolidado (I.2, I.3). Sin cambios después de 2016. K-REBT.17 sigue siendo un aviso, con el texto corregido.
2. ~~**P2 — Guía-BT-Anexo 2 (cálculo de caídas de tensión, sep-03):** descargado, sin leer. Comprobar si fija el cos φ de la línea general de alimentación (J.2).~~ **Hecho (2026-10-16, feature-34):** leído en imagen completo. Su edición real es **febrero 2026, revisión 2**. No fija un cos φ general: en la LGA usa el «factor de potencia conocido de la carga» (0,90 en su ejemplo) y en la DI y los circuitos interiores de vivienda calcula con cos φ = 1. Coincide con K-REBT.15. Detalle en N.7; J.2 queda superado.
3. ~~**P3 — UNE-EN 81-20 y UNE-EN 81-70**~~ **Hecho (2026-10-05)**, sin la UNE de pago: tabla de carga y superficie leída en el borrador CEN público y relación 630 kg ↔ 1,10 × 1,40 en el DB-SI (C.6 bis). Queda sin fuente primaria el emparejamiento de tipos de la UNE-EN 81-70 (tipo 1: 450 kg, 1,00 × 1,25; tipo 2: 630 kg, 1,10 × 1,40). No hace falta para K-REBT.5.
4. **P4 — BOE del RD 1053/2014 y del RD 450/2022:** cotejar en el PDF del BOE qué apartados reescribieron (ITC-BT-10 ap. 1, 2.1.2, 5, 6 y 7; ITC-BT-04 grupos g, h, l y z; ITC-BT-25 ap. 2.3.2; ITC-BT-52 ap. 3.2 y 5.4). Ahora se apoyan en resúmenes web.
5. **P5 — DB-HE, HE 6:** comprobar qué disposición dio la redacción actual del ap. 3 (¿RD 450/2022?). No cambia las cifras.
6. **P6 — Texto sin imagen:** ITC-BT-14, ITC-BT-16 ap. 3 (interruptor general de maniobra), ITC-BT-28 ap. 1 y 3.3.1, arts. 12–13 del REBT, Guía BT-25 pp. 5, 7 y 10 y Guía BT-52 pp. 4 y 24–26. Renderizarlos si se van a citar literalmente en la ficha. **En parte hecho (2026-10-16):** el consolidado entero (incluidas ITC-BT-14 e ITC-BT-16) y la Guía BT-25 completa se han leído en imagen. Quedan sin imagen la ITC-BT-28 (no se ha releído con atención) y la Guía BT-52.
7. **P7 — Criterios a validar por el responsable:** K-REBT.1 (elevada por defecto), K-REBT.2 (aerotermia), K-REBT.5 (ITA-3), K-REBT.8 (útil), K-REBT.12 (factor 1,0 por defecto y el Anexo 2 solo como información) y K-REBT.13 (módulos de reserva en el recuento).
8. **P8 — UNE-HD 60364-5-52:2022 (+A12:2023).** La ITC-BT-02 (consolidado, p. 40) la pone en lugar de la UNE-HD 60364-5-52:2014, y la ITC-BT-19 remite «en su totalidad» a la UNE 20.460-5-523 (N.5.1–N.5.3). No está en el repo (norma de pago). Hasta leerla, las intensidades admisibles salen de la tabla 1 de la ITC-BT-19 y de la tabla A de la Guía BT-19 (2004), tomando la menor (K-REBT.19).
9. ~~**P9 — Celda «3» de la fila C13 (máximo de puntos) de la tabla 1 de la ITC-BT-25**~~ **Hecho (2026-10-16):** cotejada en la imagen de la p. 169 a 220 ppp: «3». Fila completa: Fs 1, Fu 1, máximo 3 puntos, 2,5 mm², tubo de 20 mm; potencia, toma e IA, «(10)» (N.1.4).
10. **P10 — Calibres de los fusibles y tipos de CGP:** ni el REBT ni las guías BT-13, 14, 15, 16 y 22 los fijan; remiten a las especificaciones técnicas de la empresa distribuidora y a la serie UNE-EN 60269. No leídas. La serie de K-REBT.25 es criterio sin fuente primaria.
11. **P11 — Literales de guía por transcribir antes de citarlos en la ficha:** Guía BT-25 p. 14 (comentarios a la tabla 2), pp. 5–7 (desdoblamientos y C13) y p. 11 (nota de la tabla B); Guía BT-15, tabla G, fila de 35 mm² (casillas dudosas en la imagen); Guía Anexo 2, páginas exactas de cada ejemplo.
12. **P12 — Guía BT-52 para el C13 de la unifamiliar** (esquema 4a: interruptor, bases y diferencial en el cuadro de la vivienda): no se ha releído en esta pasada.
13. **P13 — Criterios de feature-34 a validar:** K-REBT.19 a K-REBT.36.

---

## Bloque N — Aguas abajo (feature-34): circuitos, puntos, LGA, DI, protecciones y puesta a tierra

**Fecha:** 2026-10-16 · Agente: cte-normativa · **No se ha editado código.** Paso 0 de [feature-34.md](../feature-34.md).
**Fuentes:** el consolidado [REBT] leído entero en imagen (pp. 1–288) y cotejado con su texto extraído; las guías [G13], [G14], [G15], [G18], [G19], [G21], [G22], [G24], [G25], [G26] y [GA2], leídas enteras en imagen (ediciones en el apartado 0). Mismos veredictos que arriba. Donde una cifra de guía contradice al reglamento, manda el reglamento; donde dos guías no coinciden, se dice.
**Numeración:** feature-34.md pedía «K-REBT.20 y siguientes»; como la serie existente acaba en K-REBT.18, aquí empieza en **K-REBT.19**.

### N.1 Circuitos interiores (ITC-BT-25 ap. 2 y 3, tabla 1; ITC-BT-17; ITC-BT-52) — punto 1

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.1.1 | ¿Qué trae la tabla 1? | VERIFICADO | 10 filas: C1, C2, C3, C4, C5, C8, C9, C10, C11 y **C13**. **No hay fila para C6, C7 ni C12.** Transcripción completa debajo | «Tabla 1. Características eléctricas de los circuitos(1).» | [REBT] p. 169 (imagen; cotejada con el texto) |
| N.1.2 | C6, C7 y C12 | VERIFICADO + INTERPRETACIÓN | Son «adicional del tipo» C1, C2 y C3/C4/C5: llevan las características del circuito del que son adicionales (INTERPRETACIÓN: la tabla no les da fila) | 2.3.2: «C6 Circuito adicional del tipo C1, por cada 30 puntos de luz. C7 Circuito adicional del tipo C2, por cada 20 tomas de corriente de uso general o si la superficie útil de la vivienda es mayor de 160 m2. … C12 Circuitos adicionales de cualquiera de los tipos C3 o C4, cuando se prevean, o circuito adicional del tipo C5, cuando su número de tomas de corriente exceda de 6.» | [REBT] p. 168 |
| N.1.3 | C13 en la ITC-BT-25 | VERIFICADO + **CORREGIDO** (fuente) | El consolidado **sí** tiene fila C13 en la tabla 1 de la ITC-BT-25 (la pedía el encargo «de la ITC-BT-52»). La **Guía BT-25 (jul-12) no la tiene** (su tabla 1, p. 12, y su tabla 2, p. 13, son anteriores al RD 1053/2014): para el C13 manda el BOE | Fila: «C13 Recarga del vehículo eléctrico. (10) 1 1 (10). (10) 3 2,5 20». Nota (10): «La potencia prevista por toma, los tipos de bases de toma de corriente y la intensidad asignada del interruptor automático para el circuito C13 se especifican en la ITC-BT-52.» | [REBT] p. 169; [G25] pp. 12–13 |
| N.1.4 | Valores del C13 | VERIFICADO | Fs 1; Fu 1; máximo de puntos **3** (imagen de la p. 169, P9 hecho); **2,5 mm²**; tubo **20 mm**; potencia, toma e IA: ITC-BT-52 (tabla 1: F.4). Además, ITC-BT-52: caída ≤ **5 %** hasta el punto de recarga; sección ≥ **2,5 mm²** Cu; diferencial **≤ 30 mA, clase A, por punto de conexión**; magnetotérmico **curva C**; en modo 1 o 2 con bases UNE 20315, IA de **10 A** (16 A si el fabricante de la base lo garantiza). Diferencial **exclusivo** para el C13 (ITC-BT-25) | ITC-BT-25 2.3.2: «En el circuito C13, se colocará un interruptor diferencial exclusivo para éste con las características especificadas en la (ITC) BT-52.» ITC-BT-52: «La caída de tensión máxima admisible en cualquier circuito desde su origen hasta el punto de recarga no será superior al 5 %. Los conductores utilizados serán generalmente de cobre y su sección no será inferior a 2,5 mm2 …»; 6.1: «Cada punto de conexión deberá protegerse individualmente mediante un dispositivo de protección diferencial de corriente diferencial-residual asignada máxima de 30 mA … Los dispositivos de protección diferencial serán de clase A.»; 6.3: «… con dispositivos de corte omnipolar, curva C, dimensionados de acuerdo con los requisitos de la (ITC) BT-22.» | [REBT] pp. 168, 169, 282, 285, 287 |
| N.1.5 | Intensidad del circuito | VERIFICADO | I = n · Ia · Fs · Fu | «I= n x Ia x Fs x Fu» («N n.º de tomas o receptores; Ia Intensidad prevista por toma o receptor; Fs (factor de simultaneidad) …; Fu (factor de utilización) …») | [REBT] p. 168 |
| N.1.6 | Sección y caída del circuito | VERIFICADO | Cu; sección ≥ la de la tabla 1 **y** caída ≤ 3 %, calculada **con la intensidad nominal del interruptor automático** y **hasta el punto de utilización más alejado**; compensable con la DI | «Los conductores serán de cobre y su sección será como mínimo la indicada en la Tabla 1, y además estará condicionada a que la caída de tensión sea como máximo el 3 %. Esta caída de tensión se calculará para una intensidad de funcionamiento del circuito igual a la intensidad nominal del interruptor automático de dicho circuito y para una distancia correspondiente a la del punto de utilización mas alejado del origen de la instalación interior.» | [REBT] p. 169 |
| N.1.7 | Más puntos que el máximo | VERIFICADO | «De aumentarse el número de puntos de utilización, será necesaria la instalación de circuitos adicionales correspondientes.» (→ C6, C7, C12 y elevada, A.3) | ídem | [REBT] p. 168 |
| N.1.8 | Diferenciales: cuántos y cuáles | VERIFICADO + INTERPRETACIÓN | **Al menos 1 por cada 5 circuitos** (básica y elevada); **≤ 30 mA**; intensidad asignada **≥ IGA**; en serie, todos los circuitos protegidos a ≤ 30 mA. INTERPRETACIÓN: n.º ≥ ⌈circuitos/5⌉, y el C13 lleva el suyo aparte (es «exclusivo») | 2.3: «Tanto para la electrificación básica como para la elevada, se colocará, como mínimo, un interruptor diferencial de las características indicadas en el apartado 2.1 por cada cinco circuitos instalados.» 2.1: «… con una intensidad diferencial-residual máxima de 30 mA e intensidad asignada superior o igual que la del interruptor general.» | [REBT] pp. 167–168 |
| N.1.9 | Diferenciales: recomendaciones | LEÍDO (Guía) | Fuga acumulada aguas abajo ≤ 30 % de IΔn; «puede ser aconsejable limitar el número de circuitos por diferencial a menos de 5»; diferenciales exclusivos para lavadora, lavavajillas, termo, climatización u horno; climatización «Hasta 2 mA/kW». En serie: el de aguas arriba, al menos 3 veces IΔn del de aguas abajo y tipo S. Tipos AC, A, F y B (Anexo I) | [G24] p. 30: «Según la ITC-BT-25 se deberá instalar, como mínimo, un DDR por cada 5 circuitos en vivienda, pero puede ser aconsejable limitar el número de circuitos por diferencial a menos de 5.» [G26] p. 8: «La intensidad diferencial-nominal del diferencial instalado aguas arriba deberá ser como mínimo tres veces superior a la del diferencial situado aguas abajo. Los diferenciales instalados aguas arriba serán de tipo S.» | [G24] pp. 25, 29–30; [G26] p. 8 |
| N.1.10 | Desdoblamientos que no llevan a la elevada | VERIFICADO + LEÍDO (Guía) | C4 por aparato (nota (8)): ni elevada ni diferencial adicional (reglamento). C1, C2 o C5 desdoblados sin pasar del máximo y con el mismo IGA: no elevada (Guía, ya en A.5) | Nota (8): «… el desdoblamiento del circuito con este fin no supondrá el paso a electrificación elevada ni la necesidad de disponer de un diferencial adicional.» | [REBT] p. 169; [G25] p. 5 |
| N.1.11 | IGA | VERIFICADO | ≥ 25 A, corte omnipolar, accionamiento manual, independiente del ICP; **poder de corte ≥ 4 500 A**; cuadro junto a la puerta de entrada, no en dormitorios ni baños, a **1,4–2 m** del suelo | ITC-BT-17 1.3: «El interruptor general automático de corte omnipolar tendrá poder de corte suficiente para la intensidad de cortocircuito que pueda producirse en el punto de su instalación, de 4.500 A como mínimo.» 1.1: «… estará comprendida entre 1,4 y 2 m, para viviendas.» | [REBT] pp. 118–119, 167 |
| N.1.12 | C3 con base de 32 A | LEÍDO (Guía) | La base ESB 32a (UNE 20315:2004) se admite en el C3; exige previsión ≥ 7 360 W y PIA de 32 A en el C3, y adecuar la sección | «La instalación de esta base de toma de corriente requiere la adecuación de la previsión de cargas en la instalación, que en el caso de viviendas, será de al menos 7360 W, incluyendo la instalación del PIA del circuito C3 de 32 A, así como en su caso, la adecuación de la sección de los conductores.» | [G19] p. 24 |
| N.1.13 | Longitud máxima por circuito | LEÍDO (Guía) + cálculo propio | Guía BT-25, tabla B (3 %, cos φ = 1): 1,5 mm²/10 A **27 m**; 2,5/10 A 45; 2,5/16 A **28**; 4/16 A 45; 4/20 A **36**; 6/20 A 53; 6/25 A **43**. Comprobado: corresponde a γ ≈ 52 (unos 40 °C). Con γ = 48 (70 °C, [GA2]) salen más cortas: C1 24,8 m; C2, C5 y C10 25,9 m; C4 33,1 m; C3, C8 y C9 39,7 m (ver «Cifras») | Tabla B y su nota | [G25] pp. 10–11 |

**Tabla 1 — Características eléctricas de los circuitos** ([REBT] ITC-BT-25 ap. 3, p. 169, imagen)

| Circuito de utilización | Potencia prevista por toma (W) | Fs | Fu | Tipo de toma (7) | Interruptor automático (A) | Máx. n.º de puntos o tomas por circuito | Sección mínima (mm²) (5) | Tubo o conducto, Ø (mm) (3) |
|---|---|---|---|---|---|---|---|---|
| C1 Iluminación | 200 | 0,75 | 0,5 | Punto de luz (9) | 10 | 30 | 1,5 | 16 |
| C2 Tomas de uso general | 3.450 | 0,2 | 0,25 | Base 16 A 2p+T | 16 | 20 | 2,5 | 20 |
| C3 Cocina y horno | 5.400 | 0,5 | 0,75 | Base 25 A 2p+T | 25 | 2 | 6 | 25 |
| C4 Lavadora, lavavajillas y termo eléctrico | 3.450 | 0,66 | 0,75 | Base 16 A 2p+T combinadas con fusibles o interruptores automáticos de 16 A (8) | 20 | 3 | 4 (6) | 20 |
| C5 Baño, cuarto de cocina | 3.450 | 0,4 | 0,5 | Base 16 A 2p+T | 16 | 6 | 2,5 | 20 |
| C8 Calefacción | (2) | – | – | – | 25 | – | 6 | 25 |
| C9 Aire acondicionado | (2) | – | – | – | 25 | – | 6 | 25 |
| C10 Secadora | 3.450 | 1 | 0,75 | Base 16 A 2p+T | 16 | 1 | 2,5 | 20 |
| C11 Automatización | (4) | – | – | – | 10 | – | 1,5 | 16 |
| C13 Recarga del vehículo eléctrico | (10) | 1 | 1 | (10) | (10) | 3 | 2,5 | 20 |

Notas (literal, p. 169):
- (1) «La tensión considerada es de 230 V entre fase y neutro.»
- (2) «La potencia máxima permisible por circuito será de 5.750 W.»
- (3) «Diámetros externos según ITC-BT-19.»
- (4) «La potencia máxima permisible por circuito será de 2.300 W.»
- (5) «Este valor corresponde a una instalación de dos conductores y tierra con aislamiento de PVC bajo tubo empotrado en obra, según tabla 1 de ITC-BT-19. Otras secciones pueden ser requeridas para otros tipos de cable o condiciones de instalación.»
- (6) «En este circuito exclusivamente, cada toma individual puede conectarse mediante un conductor de sección 2,5 mm2 que parta de una caja de derivación del circuito de 4 mm2.»
- (7) «Las bases de toma de corriente de 16 A 2p+T serán fijas del tipo indicado en la figura C2a y las de 25 A 2p+T serán del tipo indicado en la figura ESB 25-5A, ambas de la norma UNE 20315.»
- (8) «Los fusibles o interruptores automáticos no son necesarios si se dispone de circuitos independientes para cada aparato, con interruptor automático de 16 A en cada circuito. el desdoblamiento del circuito con este fin no supondrá el paso a electrificación elevada ni la necesidad de disponer de un diferencial adicional.»
- (9) «El punto de luz incluirá conductor de protección.»
- (10) «La potencia prevista por toma, los tipos de bases de toma de corriente y la intensidad asignada del interruptor automático para el circuito C13 se especifican en la ITC-BT-52.»

### N.2 Puntos de utilización por estancia (ITC-BT-25 ap. 4, tabla 2) — punto 2

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.2.1 | Tabla 2 | VERIFICADO | Transcripción debajo, con C13 en «Garajes unifamiliares y otros» | «En cada estancia se utilizará como mínimo los siguientes puntos de utilización:» | [REBT] p. 170 (imagen) |
| N.2.2 | Reglas por superficie y longitud | VERIFICADO (literal) + INTERPRETACIÓN (fórmula) | Puntos de luz: 1 si S ≤ 10 m², **2** si S > 10 m² (no crece más). Tomas C2 en salón y dormitorios: **máx(3; ⌈S/6⌉)**. Pasillo: luces ⌈L/5⌉ («uno cada 5 m»), interruptor o conmutador «uno en cada acceso», tomas C2 1 si L ≤ 5 m y 2 si L > 5 m. Interruptores: uno por punto de luz | «Hasta 10 m2 (dos si S > 10 m2)»; «Una por cada 6 m2, redondeado al entero superior»; «Uno cada 5 m de longitud»; «Hasta 5 m (dos si L > 5 m)» | [REBT] p. 170 |
| N.2.3 | Notas | VERIFICADO | (1) TV: base múltiple = una base. (2) C5 de cocina fuera del volumen de 0,5 m del fregadero y de la encimera de cocción. (3) C13: ITC-BT-52 | Literal debajo | [REBT] p. 170 |
| N.2.4 | Comentarios de la Guía | LEÍDO (Guía, paráfrasis; P11) | El pulsador de timbre no computa como punto del C1; amplía la nota (1) a las tomas junto a la de TV; los equipos de conexión fija de C8, C9 y C11 se alimentan desde caja de conexión. La tabla 2 de la Guía (p. 13) no tiene C13 | — | [G25] pp. 13–14 |
| N.2.5 | Estancia sin superficie | **NO LO FIJA EL REGLAMENTO → CRITERIO** | Ver K-REBT.36 | — | — |

**Tabla 2 — Puntos de utilización mínimos por estancia** ([REBT] ITC-BT-25 ap. 4, p. 170, imagen)

| Estancia | Circuito | Mecanismo | N.º mínimo | Superf./longitud |
|---|---|---|---|---|
| Acceso | C1 | Pulsador timbre | 1 | — |
| Vestíbulo | C1 | Punto de luz / Interruptor 10 A | 1 / 1 | – |
| | C2 | Base 16 A 2p+T | 1 | – |
| Sala de estar o salón | C1 | Punto de luz / Interruptor 10 A | 1 / 1 | Hasta 10 m² (dos si S > 10 m²) / Uno por cada punto de luz |
| | C2 | Base 16 A 2p+T | 3 (1) | Una por cada 6 m², redondeado al entero superior |
| | C8 | Toma de calefacción | 1 | Hasta 10 m² (dos si S > 10 m²) |
| | C9 | Toma de aire acondicionado | 1 | Hasta 10 m² (dos si S > 10 m²) |
| Dormitorios | C1 | Puntos de luz / Interruptor 10 A | 1 / 1 | Hasta 10 m² (dos si S > 10 m²) / Uno por cada punto de luz |
| | C2 | Base 16 A 2p+T | 3 (1) | Una por cada 6 m², redondeado al entero superior |
| | C8 | Toma de calefacción | 1 | – |
| | C9 | Toma de aire acondicionado | 1 | – |
| Baños | C1 | Puntos de luz / Interruptor 10 A | 1 / 1 | – |
| | C5 | Base 16 A 2p+T | 1 | – |
| | C8 | Toma de calefacción | 1 | – |
| Pasillos o distribuidores | C1 | Puntos de luz / Interruptor/Conmutador 10 A | 1 / 1 | Uno cada 5 m de longitud / Uno en cada acceso |
| | C2 | Base 16 A 2p+T | 1 | Hasta 5 m (dos si L > 5 m) |
| | C8 | Toma de calefacción | 1 | – |
| Cocina | C1 | Puntos de luz / Interruptor 10 A | 1 / 1 | Hasta 10 m² (dos si S > 10 m²) / Uno por cada punto de luz |
| | C2 | Base 16 A 2p+T | 2 | Extractor y frigorífico |
| | C3 | Base 25 A 2p+T | 1 | Cocina/horno |
| | C4 | Base 16 A 2p+T | 3 | Lavadora, lavavajillas y termo |
| | C5 | Base 16 A 2p+T | 3 (2) | Encima del plano de trabajo |
| | C8 | Toma calefacción | 1 | – |
| | C10 | Base 16 A 2p+T | 1 | Secadora |
| Terrazas y vestidores | C1 | Puntos de luz / Interruptor 10 A | 1 / 1 | Hasta 10 m² (dos si S > 10 m²) / Uno por cada punto de luz |
| Garajes unifamiliares y otros | C1 | Puntos de luz / Interruptor 10 A | 1 / 1 | Hasta 10 m² (dos si S > 10 m²) / Uno por cada punto de luz |
| | C2 | Base 16 A 2p+T | 1 | Hasta 10 m² (dos si S > 10 m²) |
| | C13 | Base de toma de corriente (3) | 1 | – |

Notas (literal, p. 170):
- (1) «En donde se prevea la instalación de una toma para el receptor de TV, la base correspondiente deberá ser múltiple, y en este caso se considerará como una sola base a los efectos del número de puntos de utilización de la tabla 1.»
- (2) «Se colocarán fuera de un volumen delimitado por los planos verticales situados a 0,5 m del fregadero y de la encimera de cocción o cocina.»
- (3) «La potencia prevista por toma, los tipos de bases de toma de corriente y la intensidad asignada del interruptor automático para el circuito C13 se especifican en la ITC-BT-52.»

### N.3 Caídas de tensión máximas (ITC-BT-14, 15, 19, 25 y 52) — punto 3

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.3.1 | LGA | VERIFICADO | **0,5 %** con contadores totalmente centralizados; **1 %** con centralizaciones parciales | «– Para líneas generales de alimentación destinadas a contadores totalmente centralizados: 0,5 por 100. – Para líneas generales de alimentación destinadas a centralizaciones parciales de contadores: 1 por 100.» | [REBT] p. 110 |
| N.3.2 | DI | VERIFICADO | **0,5 %** contadores en más de un lugar; **1 %** totalmente concentrados; **1,5 %** usuario único sin LGA | «– Para el caso de contadores concentrados en más de un lugar: 0,5%. – Para el caso de contadores totalmente concentrados: 1%. – Para el caso de derivaciones individuales en suministros para un único usuario en que no existe línea general de alimentación: 1,5%.» | [REBT] p. 113 |
| N.3.3 | Instalación interior | VERIFICADO | Vivienda: **< 3 %** desde el origen de la instalación interior a cualquier punto de utilización. Otras instalaciones: 3 % alumbrado, 5 % resto | ITC-BT-19 2.2.2: «… menor del 3 % de la tensión nominal para cualquier circuito interior de viviendas, y para otras instalaciones interiores o receptoras, del 3 % para alumbrado y del 5 % para los demás usos.» | [REBT] p. 128 |
| N.3.4 | Compensación DI ↔ interior | VERIFICADO + LEÍDO (Guía) | Se admite: la suma debe quedar por debajo de la suma de límites. La Guía: «en ambos sentidos» | «El valor de la caída de tensión podrá compensarse entre la de la instalación interior y la de las derivaciones individuales, de forma que la caída de tensión total sea inferior a la suma de los valores límites especificados para ambas, según el tipo de esquema utilizado.» [G19]: «La compensación de las caídas de tensión entre la instalación interior y la derivación individual se puede realizar en ambos sentidos.» | [REBT] pp. 128, 169; [G19] p. 5 |
| N.3.5 | Origen de cada tramo | LEÍDO (Guía) + INTERPRETACIÓN | Figura A de la Guía BT-19: CPM → cuadro (DI, 1,5 %); CGP → centralización (LGA, 0,5 %) → cuadro (DI, 1 %); con varias centralizaciones, LGA 1 % y DI 0,5 %; la interior (3 %) empieza en el cuadro de la vivienda. La LGA **no se compensa** con nada (el reglamento solo habla de DI e interior) | [G19] p. 5, «Figura A: Esquemas resumen de las caídas de tensión máximas admisibles» | [G19] p. 5 |
| N.3.6 | Recarga (C13) | VERIFICADO | **5 %** desde el origen del circuito hasta el punto de recarga | N.1.4 | [REBT] p. 282 |
| N.3.7 | Errata de la Guía BT-15 | LEÍDO (Guía) + **CORREGIDO** | «0,5% de 230V = 1,65 V» → es **1,15 V** | [G15] p. 11 | [G15] p. 11 |
| N.3.8 | Errata del consolidado | VERIFICADO + **CORREGIDO** | ITC-BT-15 tabla 1: «0 65» y «0 50» → **0,65** y **0,50** (la Guía BT-15 imprime 0,65 y 0,50) | Tabla 1 de la ITC-BT-15 | [REBT] p. 112; [G15] p. 6 |

### N.4 Línea general de alimentación y derivación individual (ITC-BT-14, 15 y 16) — punto 4

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.4.1 | LGA: conductores | VERIFICADO | 3 fases + neutro, Cu o Al, unipolares, **0,6/1 kV**; no propagadores del incendio, humos y opacidad reducidos (UNE 21.123 parte 4 o 5); sección uniforme sin empalmes (salvo derivaciones en cajas a centralizaciones); **mín. 10 mm² Cu / 16 mm² Al**; incluye conductor de protección | «Los conductores a utilizar, tres de fase y uno de neutro, serán de cobre o aluminio, unipolares y aislados, siendo su tensión asignada 0,6/1 kV.» «La sección mínima será de 10 mm2 en cobre o 16 mm2 en aluminio.» «Las canalizaciones incluirán en cualquier caso, el conductor de protección.» | [REBT] pp. 109–110 |
| N.4.2 | LGA: neutro | VERIFICADO + LEÍDO (Guía) | Reglamento: ≈ 50 % de la fase, no menor que la tabla 1. Guía: «en general» igual a la fase salvo que se justifique que no hay desequilibrios ni armónicos | «El conductor neutro tendrá una sección de aproximadamente el 50 por 100 de la correspondiente al conductor de fase, no siendo inferior a los valores especificados en la tabla 1.» [G14]: «El conductor neutro deberá ser, en general, de la misma sección que los conductores de fase excepto cuando se justifique que no pueden existir desequilibrios o corrientes armónicas debidas a cargas no lineales.» | [REBT] pp. 110–111; [G14] p. 9 |
| N.4.3 | LGA: tubo y canaladura | VERIFICADO | Tubo: Ø de la **tabla 1** (fase/neutro/Ø: 10 Cu/10/75 · 16 Cu/10/75 · 16 Al/16/75 · 25/16/110 · 35/16/110 · 50/25/125 · 70/35/140 · 95/50/140 · 120/70/160 · 150/70/160 · 185/95/180 · 240/120/200). **Otras canalizaciones: ampliación del 100 %.** Vertical: canaladura de obra **≥ 30 × 30 cm**, RF 120, registrable y precintable en cada planta, cortafuegos cada 3 plantas, tapas RF 30; exclusiva para LGA y CP. Enterrada: ITC-BT-07 | «Cuando se instalen en el interior de tubos, su diámetro en función de la sección del cable a instalar, será el que se indica en la tabla 1. Las dimensiones de otros tipos de canalizaciones deberán permitir la ampliación de la sección de los conductores en un 100%.» «… Las dimensiones mínimas del conducto serán de 30 x 30 cm …» | [REBT] pp. 110–111; [G14] p. 9 (misma tabla) |
| N.4.4 | LGA: tipo de cable (Guía) | LEÍDO (Guía) | RZ1-K (AS) o DZ1-K (AS) (UNE 21.123-4 / -5); RZ1-Al (AS) en aluminio; tubo superficial 4321, empotrado 2221, enterrado 250/450 N | [G14] p. 7, tabla de características mínimas | [G14] p. 7 |
| N.4.5 | DI: conductores | VERIFICADO | Fase(s) + neutro + CP + hilo de mando; Cu o Al, normalmente unipolares **450/750 V**; **0,6/1 kV** si multiconductor o enterrada; no propagadores del incendio, humos y opacidad reducidos (UNE 21.123-4/5 o UNE 211002); **mín. 6 mm²** fases, neutro y CP; **hilo de mando 1,5 mm² rojo**; sin neutro ni CP comunes | «Además, cada derivación individual incluirá el hilo de mando para posibilitar la aplicación de diferentes tarifas.» «La sección mínima será de 6 mm2 para los cables polares, neutro y protección y de 1,5 mm2 para el hilo de mando, que será de color rojo.» | [REBT] pp. 112–113 |
| N.4.6 | DI: hilo de mando con telegestión | VERIFICADO | **No hace falta** si la DI sale de un contador con telegestión | ITC-BT-16: «Cuando en una centralización se instalen contadores inteligentes que incorporen la función de telegestión, las derivaciones individuales con origen en estos contadores no requerirán del hilo mando especificado en la (ITC) BT-15, ya que estos contadores permiten la aplicación de diferentes tarifas sin necesidad del hilo de mando.» | [REBT] p. 114 |
| N.4.7 | DI: tubos y canaladura | VERIFICADO | Ampliación **100 %**; Ø exterior **≥ 32 mm**; **1 tubo de reserva por cada 10 DI** o fracción; locales sin partición: **1 tubo por cada 50 m²**; vertical en canaladura RF 120 con cortafuegos y tapas RF 30 **cada 3 plantas**; tabla 1 de anchuras (hasta 12 DI: 0,65 m una fila / 0,50 m dos filas; 13–24: 1,25 / 0,65; 25–36: 1,85 / 0,95; 36–48: 2,45 / 1,35); tapas de 0,30 m de alto a ≥ 0,20 m del techo; cajas de registro cada 15 m, sin empalmes | «Los tubos y canales protectoras tendrán una sección nominal que permita ampliar la sección de los conductores inicialmente instalados en un 100%. En las mencionadas condiciones de instalación, los diámetros exteriores nominales mínimos de los tubos en derivaciones individuales serán de 32 mm.» «… se dispondrá de un tubo de reserva por cada diez derivaciones individuales o fracción …» | [REBT] pp. 111–112 |
| N.4.8 | DI: Ø de tubo por sección | LEÍDO (Guía) | Tablas F (monofásico) y G (trifásico) de la Guía BT-15; ver «Cifras». **Discrepancia interna de la Guía:** para ES07Z1-K de 6 y 10 mm² la tabla F da 32 mm empotrado y las tablas H e I dan 40 mm | [G15] pp. 13–15 | [G15] pp. 13–15 |
| N.4.9 | DI: neutro | LEÍDO (Guía) | Igual a la fase «en general» | «El conductor neutro deberá, en general, ser de la misma sección que los conductores de fase, excepto cuando se justifique que no puedan existir desequilibrios o corrientes armónicas por cargas no lineales.» | [G15] p. 10 |
| N.4.10 | DI: con qué intensidad | VERIFICADO + LEÍDO (Guía) | La demanda prevista «controlada por los dispositivos privados de mando y protección» = **la del IGA** (ITC-BT-25 ap. 1: la DI tiene, como mínimo, la capacidad del IGA). La Guía: la caída es casi siempre el criterio que manda | «a) La demanda prevista por cada usuario, que será como mínimo la fijada por la RBT-010 y cuya intensidad estará controlada por los dispositivos privados de mando y protección.» [G15]: «Generalmente la caída de tensión es el parámetro crítico para la elección de la sección de los conductores de la derivación individual.» | [REBT] pp. 113, 167; [G15] p. 10 |
| N.4.11 | Fusibles de seguridad y cables en la centralización | VERIFICADO | Cada DI lleva en su origen fusibles de seguridad, antes del contador, en cada fase, con poder de corte adecuado, precintados por la distribuidora. Cables de la centralización de 6 mm² (más si lo piden previsión y caída). **El calibre no lo fija** | «Cada derivación individual debe llevar asociado en su origen su propia protección compuesta por fusibles de seguridad, con independencia de las protecciones correspondientes a la instalación interior de cada suministro.» | [REBT] p. 114 |

### N.5 Intensidades admisibles (ITC-BT-19, ITC-BT-07, ITC-BT-02) — punto 5

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.5.1 | Qué norma manda | VERIFICADO | La UNE 20.460-5-523 «en su totalidad»; la tabla 1 de la ITC-BT-19 es la de 40 °C para varios métodos | «Las intensidades máximas admisibles, se regirán en su totalidad por lo indicado en la Norma UNE 20.460-5-523 y su anexo Nacional. En la siguiente tabla se indican las intensidades admisibles para una temperatura ambiente del aire de 40 ºC …» | [REBT] p. 128 |
| N.5.2 | Actualización de la norma | VERIFICADO (la lista) + INTERPRETACIÓN (la cadena) | La ITC-BT-02 lista «UNE-HD 60364-5-52 … EDIC.: 2022; 2022/A12: 2023» en lugar de «UNE-HD 60364-5-52: 2014 y sus modificaciones posteriores». INTERPRETACIÓN: la referencia de la ITC-BT-19 apunta hoy a esa norma, **no disponible** en el repo (P8) | ITC-BT-02, lista de normas | [REBT] p. 40 |
| N.5.3 | ¿La tabla 1 de la ITC-BT-19 o la de la Guía? | LEÍDO (Guía) + **CORREGIDO** (feature-34 supone una sola tabla) | La Guía BT-19 (feb-09) **tacha** la frase que daba por aplicable la tabla de la ITC al cobre y recomienda la UNE 20460-5-523:2004 (tabla A, 40 °C). Para PVC/Z1 coincide; **para XLPE la de 2004 da hasta un 10 % menos** (B1, 3 × XLPE, 10 mm²: 54 A frente a 60) | «Esta tabla 1, corresponde al apartado 11.2 de la edición de 1994 de la norma UNE 20460-5-523. … no obstante, se recomienda aplicar con carácter general la norma UNE 20460-5-523, en su edición de 2004.» | [G19] pp. 8–9 |
| N.5.4 | Método por defecto | VERIFICADO (circuitos) + LEÍDO (Guía) (LGA y DI) | **B** (B1): conductores o cables unipolares en tubo empotrado en obra, en canal o en conducto de obra. Interior: nota (5) de la tabla 1 de la ITC-BT-25. LGA y DI: Guías BT-14 y 15 («método B, columna 8»). Tabiques térmicamente aislantes: **A1** | Nota (5), N.1; [G14]: «Según tabla 1 de la ITC-19, método B, columna 8, temperatura ambiente 40 ºC»; [G19] tabla B | [REBT] p. 169; [G14] p. 8; [G15] p. 12; [G19] p. 10 |
| N.5.5 | Columnas del método B (ITC-BT-19) | VERIFICADO | 3 × PVC: col. 4; 2 × PVC: col. 5; 3 × XLPE: col. 8; 2 × XLPE: col. 9. Los cables Z1 (ES07Z1-K) cuentan como PVC (Guía BT-19, tabla A). Transcripción en «Cifras». Cotejado: la Guía BT-15 (tablas C y D) y la BT-14 (tabla A) reproducen esas columnas | Tabla 1 | [REBT] p. 129 (imagen); [G19] p. 7 (misma tabla); [G15] p. 12; [G14] p. 8 |
| N.5.6 | Enterrados (ITC-BT-07) | VERIFICADO | Tabla 5 (Cu): terna de unipolares XLPE 6 → 72 A, 10 → 96, 16 → 125, 25 → 160, 35 → 190, 50 → 230 …; 25 °C, 0,70 m, **1 K·m/W**. Dos unipolares o bipolar: × 1,225. **En tubo: × 0,8** (terna o tripolar en un tubo); cuatro unipolares en tubos separados: × 0,9 | 3.1.3: «En el caso de una línea con cable tripolar o con una terna de cables unipolares en el interior de un mismo tubo, se aplicará un factor de corrección de 0,8.» Nota (2) de la tabla 5: «Para el caso de dos cables unipolares, la intensidad máxima admisible será la correspondiente a la columna de la terna de cables unipolares de la misma sección y tipo de aislamiento, multiplicada por 1,225.» | [REBT] pp. 80–81, 83 |
| N.5.7 | Enterrados (Guía) | LEÍDO (Guía) | La Guía BT-19 recomienda la norma de 2004 para el tubo enterrado (tabla D, 1,5 K·m/W, 25 °C, 0,70 m): 2 × XLPE Cu 6 → **58 A** (frente a 72 × 1,225 × 0,8 ≈ 71 A por la ITC-BT-07). La Guía BT-15 (tabla D, sm enterrado: 71, 94, 122, 157, 186) sigue la ITC-BT-07 | [G19] pp. 11–12; [G15] p. 12 | [G19]; [G15] |
| N.5.8 | Agrupamiento | LEÍDO (Guía) | Empotrados: 1 → 1,00; 2 → 0,80; 3 → 0,70; 4 → 0,70; 6 → 0,55; 9 → 0,50; 12 → 0,45; 16 → 0,40; 20 → 0,40. No se aplican si los circuitos van paralelos menos de 2 m (salida del cuadro) | «No se considerarán los factores de reducción cuando la distancia en la que discurran paralelos los circuitos sea inferior a 2 m, por ejemplo en la salida de varios circuitos de un cuadro de mando y protección.» | [G19] p. 13 |

### N.6 Protección de la LGA y de la DI (ITC-BT-13, 16, 17, 22 y 24) — punto 6

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.6.1 | CGP | VERIFICADO | Tipos de las especificaciones de la distribuidora aprobadas por la Administración; fusibles en todas las fases, con poder de corte ≥ Icc prevista; neutro amovible; IP43, IK08, precintable | «Dentro de las mismas se instalarán cortacircuitos fusibles en todos los conductores de fase o polares, con poder de corte al menos igual a la corriente de cortocircuito prevista en el punto de su instalación.» | [REBT] ITC-BT-13 ap. 1.2 (p. 108); [G13] p. 5 |
| N.6.2 | Calibres normalizados de los fusibles | **NO LO FIJA EL REGLAMENTO → CRITERIO** | Ni el REBT ni las guías BT-13, 14, 15, 16 ni 22 dan calibres. La CGP y su fusible los fija la empresa distribuidora (P10). K-REBT.25 | — | — |
| N.6.3 | Regla de la ITC-BT-22 | VERIFICADO + **NO LO FIJA EL REGLAMENTO** (las inecuaciones) | El reglamento exige que la protección garantice la intensidad admisible del conductor y remite a la UNE 20.460-4-43; **no escribe** Ib ≤ In ≤ Iz ni I2 ≤ 1,45·Iz | 1.1 a): «El límite de intensidad de corriente admisible en un conductor ha de quedar en todo caso garantizada por el dispositivo de protección utilizado.» «La norma UNE 20.460-4-43 recoge en su articulado todos los aspectos requeridos para los dispositivos de protección …» | [REBT] p. 150 |
| N.6.4 | Inecuaciones y fusibles gG | LEÍDO (Guía) + INTERPRETACIÓN | **Ib ≤ In ≤ Iz** y **I2 ≤ 1,45·Iz**. I2 = 1,45·In (UNE-EN 60898 y 61009); 1,30·In (UNE-EN 60947-2). Fusible gG: If = **1,60·In** (In ≥ 16 A), 1,90·In (4 < In < 16 A), 2,10·In (In ≤ 4 A). INTERPRETACIÓN: para gG de In ≥ 16 A, **In ≤ 1,45/1,60·Iz = 0,906·Iz**; para magnetotérmicos 60898, basta In ≤ Iz | «1) IB ≤ In ≤ Iz 2) I2 ≤ 1,45 Iz» · «If = 1,60 In si In ≥16A · If = 1,90 In si 4A < In<16A · If = 2,10 In si In ≤ 4A» | [G22] p. 4 |
| N.6.5 | Cortocircuito | LEÍDO (Guía) | Curvas B (3–5 In), **C (5–10 In)**, D (10–20 In); vivienda: curva C. Comprobación práctica: **Icc mín > Im** (TT: fase-neutro), Im = 10·In en curva C. Longitud máxima: L = 0,8·U·SF·γ / (Im·(1 + m)), m = SF/SN, U fase-neutro, γ = 56/1,5 (145 °C). k (UNE 20460-4-43): PVC 70 °C Cu 115 / Al 76; XLPE/EPR Cu 143 / Al 94 | «Icc mín > Im» · ejemplo: 2,5 mm², 16 A curva C → 53,7 m | [G22] pp. 5, 7–8, 12–13 |
| N.6.6 | Fuera de alcance | — | El poder de corte y la Icc en el cuadro dependen de la red: feature-34 los deja fuera. IGA ≥ 4 500 A (N.1.11) sí se cita | — | — |

### N.7 Fórmulas, conductividad, temperatura y cos φ (Guía, Anexo 2) — punto 7 · resuelve P2

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.7.1 | Fórmulas de sección | LEÍDO (Guía) | Monofásica: **S = 2·P·L / (γ·e·U)**; trifásica: **S = P·L / (γ·e·U)** (e = caída en V; U = 230 V o 400 V). En intensidad: e = 2·L·I·cos φ / (γ·S) y e = √3·L·I·cos φ / (γ·S) | — | [GA2] (lectura completa, pp. 1–14) |
| N.7.2 | Conductividad | LEÍDO (Guía) | γ Cu: **56** (20 °C), **48** (70 °C), **44** (90 °C) m/(Ω·mm²). γ Al: 35 / 30 / 28 | — | [GA2] |
| N.7.3 | Temperatura de servicio | LEÍDO (Guía) | Se puede estimar con **T = T0 + (Tmáx − T0)·(I/Imáx)²**; los ejemplos de DI con ES07Z1-K calculan a **70 °C** (método simplificado). La Guía BT-15 (2003) calculaba a **40 °C** y pedía × 1,12 para 70 °C | [G15] p. 11: «Si la temperatura a considerar fuera 70 ºC, según lo dicho anteriormente, los valores de caída de tensión, incluidos en las tablas siguientes, deberán multiplicarse por el factor de corrección 1,12.» | [GA2]; [G15] p. 11 |
| N.7.4 | cos φ | LEÍDO (Guía) + INTERPRETACIÓN | **LGA:** el «factor de potencia conocido de la carga», **0,90** en el ejemplo (= K-REBT.15). **DI y circuitos de vivienda:** **cos φ = 1**, con I = calibre del IGA o del interruptor del circuito. INTERPRETACIÓN útil: sin reactancia, la caída en función de P **no depende de cos φ** (e = P·L/(γ·S·U)); cos φ solo sube la intensidad para la comprobación de Iz | — | [GA2]; [G25] p. 10 |
| N.7.5 | Intensidad de cálculo de la LGA en la Guía | LEÍDO (Guía) | En el ejemplo de la LGA, la caída se calcula con la intensidad del **fusible de la CGP** (250 A), no con la de la previsión. Es más conservador que K-REBT.15 | — | [GA2] (ejemplo 1) |
| N.7.6 | Reactancia | LEÍDO (Guía) | Despreciable hasta **120 mm²** (tabla 1 del anexo) | — | [GA2] |

### N.8 Puesta a tierra (ITC-BT-18, 24 y 26) — punto 8

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.8.1 | Sistema en edificio nuevo | VERIFICADO | **Anillo cerrado** de cable rígido de **cobre desnudo** en el fondo de las zanjas de cimentación, antes de hormigonar, por todo el perímetro; **picas** cuando haga falta bajar la resistencia; unir los anillos de edificios próximos; conectar la estructura metálica o, con zapatas de hormigón armado, hierros principales, **al menos uno por zapata**, con soldadura aluminotérmica o autógena. En rehabilitación: electrodos en patios o jardines | «Instalando en el fondo de las zanjas de cimentación de los edificios, y antes de empezar ésta, un cable rígido de cobre desnudo de una sección mínima según se indica en la ITC-BT-18, formando un anillo cerrado que interese a todo el perímetro del edificio. A este anillo deberán conectarse electrodos verticalmente hincados en el terreno cuando, se prevea la necesidad de disminuir la resistencia de tierra que pueda presentar el conductor en anillo.» | [REBT] p. 171 |
| N.8.2 | Sección del anillo | VERIFICADO + **CORREGIDO** («35 mm²») | Reglamento: ITC-BT-18 tabla 1 → cobre enterrado **no protegido contra la corrosión: 25 mm²** (hierro 50). **35 mm²** es recomendación de las guías (NTE 1973) y es reglamentario solo en las redes de tierra exteriores de las ITC-BT-09 y 52 | Tabla 1: «No protegido contra la corrosión · 25 mm2 Cobre · 50 mm2 Hierro». [G26]: «Con una sección mínima de 35 mm2 según NTE 1973 "Puesta a tierra"». [G18]: «… es recomendable que la sección mínima del conductor de tierra de cobre enterrado y desnudo sea de 35 mm2.» ITC-BT-52 7.1: «Desnudos, de cobre, de 35 mm2 de sección mínima, si forman parte de la propia red de tierra …» | [REBT] pp. 122, 287; [G26] p. 3; [G18] p. 5 |
| N.8.3 | Profundidad | VERIFICADO + LEÍDO (Guía) | **≥ 0,50 m** (reglamento). **0,8 m** recomendado (guías) | ITC-BT-18 3.1: «La profundidad nunca será inferior a 0,50 m.» [G26]: «La profundidad mínima de enterramiento del conductor recomendada es de 0,8 m.» | [REBT] p. 122; [G26] p. 3; [G18] p. 4 |
| N.8.4 | Picas | LEÍDO (Guía) | Repartidas a lo largo del anillo, separadas **≥ 2 veces su longitud**; picas de **2 m** en la tabla A de la Guía BT-26; acero-cobre Ø ≥ 14,2 mm (250 µm), acero galvanizado Ø ≥ 20 mm | [G26]: «… conectadas a ésta y separadas una distancia no inferior a 2 veces su longitud.» | [G26] pp. 3–4; [G18] pp. 5, 13 |
| N.8.5 | Resistividad (tablas 3 y 4) | VERIFICADO + **errata** | Tabla 3 (rangos) y tabla 4 (medias): **50** Ω·m terrenos cultivables y fértiles, terraplenes compactos y húmedos; **500** terraplenes poco fértiles y otros; **3 000** suelos pedregosos desnudos, arenas secas permeables. Errata en la tabla 3 (también en la Guía BT-18): «Suelo pedregoso cubierto de césped 300 a 5.00» (probablemente 5.000) | Tablas 3 y 4 | [REBT] pp. 125–126; [G18] p. 12 |
| N.8.6 | Fórmulas (tabla 5) | VERIFICADO + LEÍDO (Guía) | Placa enterrada **R = 0,8·ρ/P**; pica vertical **R = ρ/L**; conductor horizontal **R = 2·ρ/L** (L = longitud del conductor). Guía: placa horizontal R = 1,6·ρ/P. **No hay fórmula para anillo + picas** | Tabla 5 | [REBT] p. 126; [G18] pp. 12–13 |
| N.8.7 | Tensión de contacto | VERIFICADO + LEÍDO (Guía) | **24 V** en local o emplazamiento conductor; **50 V** en los demás. Guía BT-24: 24 V también en locales húmedos o mojados, intemperie y obras | ITC-BT-18 9: «– 24 V en local o emplazamiento conductor – 50 V en los demás casos.» ITC-BT-24 4.1: «La tensión límite convencional es igual a 50 V, valor eficaz en corriente alterna, en condiciones normales.» | [REBT] pp. 125, 157; [G24] p. 8 |
| N.8.8 | Resistencia máxima con 30 mA | VERIFICADO (la condición) + INTERPRETACIÓN (la cifra) | TT: **RA · Ia ≤ U**, Ia = IΔn del diferencial. Con 30 mA: **R ≤ 1 667 Ω** (50 V) u **800 Ω** (24 V). Con varios diferenciales en la misma toma, el de **mayor** IΔn (Guía BT-24): con uno de 300 mA, 167 Ω / 80 Ω. Ni la ITC-BT-24 ni la 26 fijan un valor numérico | «RA x Ia ≤ U … Cuando el dispositivo de protección es un dispositivo de corriente diferencial-residual es la corriente diferencial-residual asignada.» [G26] p. 2: «… ni en esta ITC ni en la ITC-BT-24 se indica un valor máximo para la resistencia de tierra …» | [REBT] p. 159; [G24] pp. 11–12; [G26] p. 2 |
| N.8.9 | Valores orientativos y pararrayos | LEÍDO (Guía) | **< 15 Ω con pararrayos; < 37 Ω sin pararrayos**, aplicando la tabla A (n.º de picas de 2 m según terreno, longitud del anillo y pararrayos). Transcripción debajo. **El pararrayos sí cambia la longitud** | «La resistencia a tierra obtenida con la aplicación de los valores de esta tabla debería ser, en la práctica, inferior a 15 Ω para edificios con pararrayos y de 37 Ω para edificios sin pararrayos.» | [G26] p. 4 |
| N.8.10 | Elementos a conectar | VERIFICADO | Toda masa metálica importante y las masas de los receptores que lo exijan; partes metálicas de **depósitos de gasóleo, calefacción general, instalaciones de agua, gas canalizado y antenas de radio y TV**. Ascensores: punto de puesta a tierra en la base de su estructura metálica. **El pararrayos no aparece** en la ITC-BT-26 | 3.2: «A esta misma toma de tierra deberán conectarse las partes metálicas de los depósitos de gasóleo, de las instalaciones de calefacción general, de las instalaciones de agua, de las instalaciones de gas canalizado y de las antenas de radio y televisión.» | [REBT] p. 172 |
| N.8.11 | Puntos de puesta a tierra | VERIFICADO + LEÍDO (Guía) | a) patios de luces (rehabilitación); b) centralización de contadores; c) base de la estructura de ascensores y montacargas; d) CGP; e) locales de servicios generales que lo necesiten. Guía: en obra nueva, **b, c y d**, y e si procede; borne principal el de la centralización | 3.3 (literal a–e) · [G26]: «En nuevas instalaciones los puntos de conexión o bornes de puesta a tierra, deberán situarse en las ubicaciones b), c) y d) y si procede la e).» | [REBT] p. 172; [G26] p. 6 |
| N.8.12 | Línea principal y derivaciones | VERIFICADO | Por las mismas canalizaciones que la LGA y las DI. Línea principal: **Cu, igual sección que los CP (ITC-BT-19), mínimo 16 mm²**. Derivaciones: sección de los CP. Prohibido usar tuberías de agua, gas, calefacción, desagües, humos, cubiertas de cables o canalizaciones como conductor de tierra | «Las líneas principales de tierra estarán constituidas por conductores de cobre de igual sección que la fijada para los conductores de protección en la Instrucción ITC-BT-19, con un mínimo de 16 milímetros cuadrados.» | [REBT] p. 172 |
| N.8.13 | Conductores de protección | VERIFICADO | S ≤ 16 → S; 16 < S ≤ 35 → 16; S > 35 → S/2; si no forman parte de la canalización: ≥ 2,5 mm² con protección mecánica, ≥ 4 mm² sin ella. En vivienda, en todos los circuitos hasta los puntos de utilización, con el mismo aislamiento y por la misma canalización | ITC-BT-19 tabla 2 e ITC-BT-18 tabla 2. ITC-BT-26 3.5: «Se instalarán conductores de protección acompañando a los conductores activos en todos los circuitos de la vivienda hasta los puntos de utilización.» | [REBT] pp. 123, 130, 172–173 |
| N.8.14 | Borne principal, equipotencial y revisión | VERIFICADO | Borne principal con dispositivo desmontable para medir la resistencia; conductor equipotencial principal **≥ la mitad del CP mayor, mín. 6 mm²** (reducible a 2,5 mm² si es de cobre); comprobación al dar de alta y **anual**, en época seca | 8: «El conductor principal de equipotencialidad debe tener una sección no inferior a la mitad de la del conductor de protección de sección mayor de la instalación, con un mínimo de 6 mm2. Sin embargo, su sección puede ser reducida a 2,5 mm2, si es de cobre.» | [REBT] pp. 122, 125, 127 |

**Tabla A de la Guía BT-26 — Longitud mínima del anillo (m) según terreno, pararrayos y n.º de picas de 2 m** ([G26] p. 4, imagen; no reglamentaria). «^»: «aumentar la longitud de los conductores enterrados del anillo». ΣL = longitud en planta de la conducción enterrada.

| N.º de picas | Orgánicos, arcillas y margas · sin | con | Arenas arcillosas y graveras, rocas sedimentarias y metamórficas · sin | con | Calizas agrietadas y rocas eruptivas · sin | con | Grava y arena silícea · sin | con |
|---|---|---|---|---|---|---|---|---|
| 0 | 25 | 34 | 28 | 67 | 54 | 134 | 162 | 400 |
| 1 | ^ | 30 | 25 | 63 | 50 | 130 | 158 | 396 |
| 2 | | 26 | ^ | 59 | 46 | 126 | 154 | 392 |
| 3 | | ^ | | 55 | 42 | 122 | 150 | 388 |
| 4 | | | | 51 | 38 | 118 | 146 | 384 |
| 5 | | | | 47 | 34 | 114 | 142 | 380 |
| 6 | | | | 43 | 30 | 110 | 138 | 376 |
| 7 | | | | 39 | ^ | 106 | 134 | 372 |
| 8 | | | | 35 | | 105 (sic) | 130 | 368 |
| 9 | | | | ^ | | 98 | 126 | 364 |
| 10 | | | | | | 94 | 122 | 360 |
| 15 | | | | | | 74 | 102 | 340 |
| 20 | | | | | | ^ | 82 | 320 |
| 30 | | | | | | | ^ | 280 |
| 40 | | | | | | | | 240 |
| 50 | | | | | | | | 200 |

Lectura (ejemplo de la Guía, pp. 4–5): con pararrayos, arena arcillosa y ΣL = 33 m, «la longitud mínima de la conducción enterrada debe ser de 35 m» y con ella «necesitamos colocar 8 picas». Es decir: el menor n.º de picas cuya cifra sea ≤ ΣL; si ΣL es menor que la menor cifra de la columna, alargar el anillo. «105» a 8 picas rompe la serie de 4 en 4 (cabría 102): se transcribe tal cual.

### N.9 Equipos que llevan a la elevada: bomba de calor y suelo radiante — punto 9

| # | Pregunta | Veredicto | Valor | Cita literal | Fuente/página |
|---|---|---|---|---|---|
| N.9.1 | ¿Dice algo el REBT o la Guía BT-25 de la bomba de calor? | **NO LO FIJA EL REGLAMENTO → CRITERIO** | Ni la ITC-BT-25 ni la Guía BT-25 (leída entera) hablan de bomba de calor. Solo distinguen C8 «calefacción eléctrica» y C9 «aire acondicionado», ambos de 25 A y 6 mm², hasta **5 750 W por circuito** (nota (2)). Más potencia → más circuitos del mismo tipo (INTERPRETACIÓN) | C8: «… destinado a la instalación de calefacción eléctrica, cuando existe previsión de ésta.» C9: «… destinado a la instalación aire acondicionado, cuando existe previsión de éste.» | [REBT] pp. 168–169 |
| N.9.2 | Suelo radiante eléctrico | VERIFICADO (ITC-BT-46) + INTERPRETACIÓN (C8) | Es calefacción eléctrica → C8. La ITC-BT-46 exige subdividirlo según la ITC-BT-25, **≤ 25 A por fase y circuito**, IA omnipolar por circuito y **diferencial de 30 mA por circuito** | 3.2: «El circuito de calefacción se subdividirá en circuitos según los criterios de ITC-BT-25, en función de la simultaneidad de uso, distancia y otros criterios de seguridad etc., con un máximo de 25 A por fase y circuito. … Es obligatoria una protección diferencial de alta sensibilidad (30 mA) para cada circuito de calefacción por cables calefactores o folio radiante.» | [REBT] p. 255 |
| N.9.3 | Tomas de la tabla 2 | VERIFICADO + INTERPRETACIÓN | Las tomas C8 por estancia (salón, dormitorios, baños, pasillos, cocina) y C9 (salón y dormitorios) son las de **emisores eléctricos por estancia**. Con una bomba de calor centralizada (una unidad exterior), lo que existe es **un** equipo con su circuito | Tabla 2 (N.2) | [REBT] p. 170 |

### Contradicciones con feature-34.md

1. **Intensidades admisibles (paso 0, pto 5; principio «se usa la que reproduce el propio reglamento o su guía»):** no hay una sola tabla. La ITC-BT-19 trae la de 1994; la Guía BT-19 (2009) tacha su aplicabilidad y da la de 2004, menor para XLPE; y la ITC-BT-02 ya apunta a la UNE-HD 60364-5-52:2022, que no tenemos (N.5.2–N.5.3, P8). Propuesta: la menor de las dos (K-REBT.19).
2. **Sección de la DI (paso 3):** la regla de feature-34 (la mayor entre mínimo, intensidad admisible y caída) es correcta, pero la intensidad no es la de la previsión con simultaneidad: es la del **IGA** de la vivienda (N.4.10). Mínimo 6 mm²; casi siempre manda la caída.
3. **Caída de la LGA:** K-REBT.15 usa la intensidad de la previsión (como la ITC-BT-14); la Guía Anexo 2 usa el calibre del fusible de la CGP (N.7.5). Decidir (K-REBT.22).
4. **Anillo de tierra:** el reglamento pide **25 mm²**; los «35 mm²» son de las guías (N.8.2).
5. **Pararrayos (fuera de alcance «salvo que el paso 0 diga que cambia la longitud del anillo»):** **la cambia**. La tabla A de la Guía BT-26 pide mucho más anillo o picas con pararrayos y fija 15 Ω frente a 37 Ω (N.8.9). Hace falta saber si hay pararrayos (dato de SUA 8 o del usuario).
6. **Hilo de mando (paso 0, pto 4):** no hace falta si los contadores tienen telegestión (ITC-BT-16, N.4.6).
7. **Fusible de la CGP o de la DI (paso 3):** ni el REBT ni las guías dan calibres; son de la distribuidora (N.6.2, P10). La coordinación sí: In ≤ 0,906·Iz para gG (N.6.4).
8. **«Ø de tubo con su ampliación del 100 %» (paso 0, pto 4):** en la LGA el Ø de tubo lo da la tabla 1 de la ITC-BT-14; el 100 % es para «otros tipos de canalizaciones». En la DI sí rige el 100 % con mínimo de 32 mm (N.4.3, N.4.7).
9. **C13 (paso 0, pto 1: «C13 (ITC-BT-52 tabla 1)»):** la fila C13 está en la tabla 1 de la ITC-BT-25 del consolidado; la de la ITC-BT-52 da potencias e interruptores (N.1.3).
10. **Numeración:** K-REBT.19 en adelante, no 20.

### Decisiones de producto (feature-34)

Todas son **CRITERIO** salvo que se diga «Guía». Se rotulan así en el anejo.

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-REBT.19 | Tabla de intensidades admisibles | **Iz = mín(ITC-BT-19 tabla 1; Guía BT-19 tabla A, UNE 20460-5-523:2004)**, mismo método y n.º de conductores cargados. Rotular «UNE 20460-5-523 según la ITC-BT-19 y su Guía; pendiente la UNE-HD 60364-5-52:2022». Enterrados: mín(ITC-BT-07 tabla 5 × 0,8 [× 1,225 si son dos unipolares]; Guía BT-19 tabla D) | N.5.1–N.5.7; lado de la seguridad |
| K-REBT.20 | Método de instalación por defecto | **B** (tubo empotrado en obra, canal, conducto o canaladura de obra) para circuitos, DI y LGA. **A1** si el usuario declara tabiquería térmicamente aislante. Enterrada solo si el usuario lo dice (DI de unifamiliar con CPM en la linde) | N.5.4 |
| K-REBT.21 | Temperatura para γ | La **máxima del aislamiento**: 70 °C para PVC y Z1 (H07V-K, ES07Z1-K) → γCu = 48, γAl = 30; 90 °C para XLPE y EPR (RZ1-K, DZ1-K) → γCu = 44, γAl = 28. No usar los 40 °C de las guías de 2003 | N.7.2–N.7.3; lado de la seguridad |
| K-REBT.22 | Intensidad para la caída | Interior: **In del interruptor del circuito** (reglamento). DI: **In del IGA** (reglamento y Guía). LGA: **Ib de la previsión** con cos φ 0,9 (ITC-BT-14, K-REBT.15), y mostrar como información la caída con el calibre del fusible (Guía Anexo 2). Validar si el veredicto pasa a hacerse con el fusible | N.1.6, N.4.10, N.7.4–N.7.5 |
| K-REBT.23 | cos φ | **1** en DI y circuitos de vivienda (Guía Anexo 2); **0,9** en la LGA (K-REBT.15). Decirlo: sin reactancia la caída no depende de cos φ; solo la intensidad | N.7.4 |
| K-REBT.24 | Longitud máxima por circuito | **Lmáx = 0,03 · 230 · γ · S / (2 · In)** con γ = 48. Sin compensación con la DI por defecto; si la DI calculada deja margen, mostrar aparte la longitud con compensación | N.1.6, N.1.13, N.3.4 |
| K-REBT.25 | Fusibles | CGP y fusibles de seguridad: **«según especificaciones de la empresa distribuidora»**. Para coordinar la LGA: el menor gG de la serie 63, 80, 100, 125, 160, 200, 250, 315, 400 A (serie **no verificada**, P10) con Ib ≤ In ≤ 0,906·Iz; si no hay ninguno, subir sección. DI: comprobar que el fusible de seguridad no supera 0,906·Iz si se conoce; si no, aviso | N.6.2–N.6.4 |
| K-REBT.26 | Neutro de LGA y DI | **Igual a la fase** (Guías BT-14 y BT-15, cargas monofásicas no lineales). Tubo de la LGA: tabla 1 de la ITC-BT-14 por la sección de fase, con aviso de que la tabla supone el neutro reducido | N.4.2, N.4.9 |
| K-REBT.27 | Hilo de mando | Incluirlo (1,5 mm², rojo) salvo que el proyecto declare contadores con telegestión; decirlo en ambos casos | N.4.5–N.4.6 |
| K-REBT.28 | Tubos | Circuitos: Ø de la tabla 1 de la ITC-BT-25. LGA: tabla 1 de la ITC-BT-14. DI monofásica con ES07Z1-K empotrada: **40 mm hasta 16 mm², 50 mm para 25 y 35 mm²** (el mayor de las tablas F y H de la Guía BT-15); trifásica: tabla G (ES07Z1-K empotrado 32/40/50/63 mm para 6/10/16/25 mm²; 35 mm² a recotejar, P11). Más 1 tubo de reserva por cada 10 DI | N.4.3, N.4.7–N.4.8 |
| K-REBT.29 | Longitudes estimadas | Unifamiliar: DI de **15 m**. Edificio: LGA de **10 m**; DI = **3 m** en la centralización + suma de alturas de planta hasta la de la vivienda + **10 m** en planta. Rotuladas «estimadas» y en «Antes de entregar» | feature-34 paso 3 |
| K-REBT.30 | Terreno por defecto | Para el veredicto reglamentario: **ρ = 3 000 Ω·m** (peor fila de la tabla 4), con aviso «terreno supuesto; medir». La comparación con la tabla A y los 15/37 Ω de la Guía BT-26 solo se muestra si el usuario elige terreno | N.8.5, N.8.8–N.8.9 |
| K-REBT.31 | Tensión de contacto e Ia | **U = 24 V** (lado de la seguridad; 50 V es lo reglamentario fuera de locales conductores). **Ia = 30 mA** en la unifamiliar; en edificio, **300 mA** si hay servicios generales y no se dice otra cosa (Guía BT-24: el mayor IΔn de la misma toma). R máx = U/Ia. Mostrar al lado los 15 Ω / 37 Ω de la Guía BT-26 como orientativos | N.8.7–N.8.9 |
| K-REBT.32 | Anillo y picas | Cu desnudo de **35 mm²** (Guía; el mínimo reglamentario, 25 mm², se cita), a **0,8 m**, longitud = perímetro del edificio (estimado si falta). R anillo = 2ρ/L. Si no cumple, picas de 2 m separadas ≥ 4 m: R = (1/R_anillo + n/R_pica)⁻¹ con R_pica = ρ/2, rotulado «paralelo ideal, optimista; comprobar con la medida» | N.8.2–N.8.6 |
| K-REBT.33 | Pararrayos | Dato de entrada (de SUA 8 si existe; si no, del usuario; por defecto «sin»). Cambia la columna de la tabla A y el objetivo orientativo (15 Ω). La conexión del pararrayos a la tierra del edificio **no la fija el REBT**: no afirmarla | N.8.9–N.8.10 |
| K-REBT.34 | Línea principal de tierra y CP | Línea principal: Cu = CP de la LGA (tabla 2 de la ITC-BT-19), **mínimo 16 mm²**. Derivaciones: CP de cada DI. CP de circuitos: igual a la fase (S ≤ 16 mm²) | N.8.12–N.8.13 |
| K-REBT.35 | Bomba de calor y suelo radiante | Aire-aire reversible (split o multisplit): **C9** (también cubre la calefacción y lleva a la elevada); aire-agua para calefacción, con o sin frío: **C8**; si es reversible, rotular «C8 (bomba de calor reversible)». Un circuito por unidad exterior; si pasa de 5 750 W, otro del mismo tipo (nota (2)). Tomas de la tabla 2 por estancia solo con emisores eléctricos por estancia. Solo ACS: **C4** (K-REBT.2). Suelo radiante eléctrico: **C8**, ⌈P/5 750⌉ circuitos y ≤ 25 A por circuito, con diferencial de 30 mA en cada uno (ITC-BT-46) | N.9 |
| K-REBT.36 | Diferenciales y estancias sin dato | Diferenciales: ⌈circuitos sin C13 / 5⌉ de 30 mA y In ≥ IGA, más uno exclusivo clase A para el C13; recomendar tipo A en circuitos con electrónica (climatización, lavadora). Estancia sin superficie: 1 punto de luz y el mínimo fijo de tomas (3 en salón y dormitorios); pasillo sin longitud: 1 punto de luz y 1 toma; rotularlo | N.1.8–N.1.9, N.2.2 |

### Cifras para el código (feature-34)

```text
# REBT — RD 842/2002, consolidado BOE-A-2002-18099, últ. modif. 03-09-2025 (imagen, lectura 2026-10-16)
# ITC-BT-25 tabla 1 (p.169)
BT25.tabla1.C1  = {P_W: 200,  Fs: 0.75, Fu: 0.5,  toma: "punto de luz (con CP)",  IA_A: 10, maxPuntos: 30, S_mm2: 1.5, tubo_mm: 16}
BT25.tabla1.C2  = {P_W: 3450, Fs: 0.2,  Fu: 0.25, toma: "base 16 A 2p+T (C2a)",   IA_A: 16, maxPuntos: 20, S_mm2: 2.5, tubo_mm: 20}
BT25.tabla1.C3  = {P_W: 5400, Fs: 0.5,  Fu: 0.75, toma: "base 25 A 2p+T (ESB 25-5A)", IA_A: 25, maxPuntos: 2, S_mm2: 6, tubo_mm: 25}
BT25.tabla1.C4  = {P_W: 3450, Fs: 0.66, Fu: 0.75, toma: "base 16 A 2p+T + fusible o IA de 16 A", IA_A: 20, maxPuntos: 3, S_mm2: 4, tubo_mm: 20, derivacionToma_mm2: 2.5}   # notas (6) y (8)
BT25.tabla1.C5  = {P_W: 3450, Fs: 0.4,  Fu: 0.5,  toma: "base 16 A 2p+T",         IA_A: 16, maxPuntos: 6,  S_mm2: 2.5, tubo_mm: 20}
BT25.tabla1.C8  = {Pmax_W: 5750, IA_A: 25, S_mm2: 6,   tubo_mm: 25}     # nota (2)
BT25.tabla1.C9  = {Pmax_W: 5750, IA_A: 25, S_mm2: 6,   tubo_mm: 25}     # nota (2)
BT25.tabla1.C10 = {P_W: 3450, Fs: 1,    Fu: 0.75, toma: "base 16 A 2p+T",         IA_A: 16, maxPuntos: 1,  S_mm2: 2.5, tubo_mm: 20}
BT25.tabla1.C11 = {Pmax_W: 2300, IA_A: 10, S_mm2: 1.5, tubo_mm: 16}     # nota (4)
BT25.tabla1.C13 = {Fs: 1, Fu: 1, maxPuntos: 3, S_mm2: 2.5, tubo_mm: 20, P_toma_IA: "ITC-BT-52"}   # nota (10)
BT25.adicional  = {C6: "C1", C7: "C2", C12: ["C3", "C4", "C5"]}        # 2.3.2: mismas características (INTERPRETACIÓN)
BT25.C6.cadaPuntosLuz = 30 ; BT25.C7.cadaTomas = 20 ; BT25.C7.siSuperficieUtil_m2_mayorQue = 160 ; BT25.C12.C5_siTomasMayorQue = 6
BT25.I_circuito       = n * Ia * Fs * Fu                                  # ap.3
BT25.caidaInterior    = 0.03    # con I = In del IA, hasta el punto más alejado; compensable con la DI (ap.3)
BT25.diferencial      = {IDn_max_A: 0.030, cadaCircuitos: 5, In: ">= IGA", C13: "exclusivo"}   # ap.2.1 y 2.3
BT17.IGA.poderCorte_A = 4500 ; BT17.cuadro.altura_m = [1.4, 2.0]          # ITC-BT-17 1.3 y 1.1 (pp.118–119)
BT52.C13              = {caidaMax: 0.05, Smin_Cu_mm2: 2.5, diferencial: "30 mA clase A por punto", curva: "C", IA_modo12_A: 10 /* 16 con garantía del fabricante */}   # pp.282, 285, 287
BT46.sueloRadiante    = {IAmaxPorFaseYCircuito_A: 25, diferencialPorCircuito_A: 0.030}   # p.255

# ITC-BT-25 tabla 2 (p.170). luz10 = 1 si S <= 10 m², 2 si S > 10
BT25.tabla2 = {
  acceso:      [{C1: "pulsador timbre", min: 1}],
  vestibulo:   [{C1: "punto de luz + interruptor 10 A", min: 1}, {C2: "base 16 A", min: 1}],
  salon:       [{C1: "punto de luz", n: luz10, interruptores: "1 por punto"}, {C2: "base 16 A", n: max(3, ceil(S/6)), nota: 1},
                {C8: "toma calefacción", n: luz10}, {C9: "toma aire acondicionado", n: luz10}],
  dormitorio:  [{C1: "punto de luz", n: luz10}, {C2: "base 16 A", n: max(3, ceil(S/6)), nota: 1}, {C8: 1}, {C9: 1}],
  bano:        [{C1: 1}, {C5: "base 16 A", min: 1}, {C8: 1}],
  pasillo:     [{C1: "punto de luz", n: ceil(L/5), mando: "interruptor/conmutador en cada acceso"}, {C2: "base 16 A", n: (L <= 5 ? 1 : 2)}, {C8: 1}],
  cocina:      [{C1: "punto de luz", n: luz10}, {C2: 2 /* extractor y frigorífico */}, {C3: 1 /* base 25 A */}, {C4: 3},
                {C5: 3, nota: 2 /* fuera de 0,5 m de fregadero y encimera */}, {C8: 1}, {C10: 1}],
  terraza_vestidor: [{C1: "punto de luz", n: luz10}],
  garaje_unifamiliar: [{C1: "punto de luz", n: luz10}, {C2: "base 16 A", n: luz10}, {C13: 1, nota: 3}] }

# Caídas de tensión
BT14.LGA.caida = {contadoresTotalmenteCentralizados: 0.005, centralizacionesParciales: 0.01}            # p.110
BT15.DI.caida  = {contadoresEnMasDeUnLugar: 0.005, totalmenteConcentrados: 0.01, usuarioUnicoSinLGA: 0.015}   # p.113
BT19.interior.caida = {vivienda: 0.03, otros: {alumbrado: 0.03, resto: 0.05}}   # p.128; compensable DI ↔ interior

# LGA (ITC-BT-14, pp.109–111)
BT14.LGA = {conductores: "3F + N unipolares + CP", tension: "0,6/1 kV", Smin_mm2: {Cu: 10, Al: 16}, seccionUniforme: true,
            neutro: ">= ~50 % de la fase y >= tabla 1", otrasCanalizaciones_ampliacion: 1.00,
            canaladuraVertical: {min_cm: [30, 30], paredes: "RF 120", tapas: "RF 30", registro: "cada planta", cortafuegos: "cada 3 plantas"}}
BT14.tabla1 = [ // [fase, neutro, Ø tubo mm]
  ["10 Cu",10,75], ["16 Cu",10,75], ["16 Al",16,75], [25,16,110], [35,16,110], [50,25,125], [70,35,140],
  [95,50,140], [120,70,160], [150,70,160], [185,95,180], [240,120,200] ]
# DI (ITC-BT-15, pp.111–113; ITC-BT-16 p.114)
BT15.DI = {Smin_mm2: 6, hiloMando: {S_mm2: 1.5, color: "rojo", exentoConTelegestion: true /* ITC-BT-16 */},
           tension: {unipolares: "450/750 V", multiconductorOEnterrada: "0,6/1 kV"}, tuboMin_mm: 32, ampliacion: 1.00,
           tuboReserva: "1 por cada 10 DI o fracción", localesSinParticion: "1 tubo por cada 50 m²", cajasRegistro_m: 15}
BT15.tabla1_canaladura = [["hasta 12", 0.65, 0.50], ["13-24", 1.25, 0.65], ["25-36", 1.85, 0.95], ["36-48", 2.45, 1.35]]   # anchura m: [una fila P=0,15; dos filas P=0,30]; errata BOE «0 65», «0 50»

# Intensidades admisibles, Cu, aire 40 °C — ITC-BT-19 tabla 1, método B (p.129, imagen)
secciones_mm2         = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]
BT19.tabla1.B.PVC3    = [13.5, 18.5, 24, 32, 44, 59, 77, 96, 117, 149, 180, 208, 236, 268, 315, 360]   # col.4
BT19.tabla1.B.PVC2    = [15, 21, 27, 36, 50, 66, 84, 104, 125, 160, 194, 225, 260, 297, 350, 404]      # col.5
BT19.tabla1.B.XLPE3   = [18, 25, 34, 44, 60, 80, 106, 131, 159, 202, 245, 284, 338, 386, 455, 524]     # col.8
BT19.tabla1.B.XLPE2   = [21, 29, 38, 49, 68, 91, 116, 144, 175, 224, 271, 314, 363, 415, 490, 565]     # col.9
# Guía BT-19 (feb-09) tabla A = UNE 20460-5-523:2004, método B1 (p.9); Z1 cuenta como PVC
G19.tablaA.B1.PVC3    = [13.5, 18.5, 24, 32, 44, 59, 77, 96, 117, 149, 180, 208, 236, 268, 315, 361]   # col.5
G19.tablaA.B1.PVC2    = [15, 21, 27, 36, 50, 66, 84, 104, 125, 160, 194, 225, 260, 297, 350, 401]      # col.6
G19.tablaA.B1.XLPE3   = [16.5, 23, 31, 40, 54, 73, 95, 119, 145, 185, 224, 260, 299, 341, 401, 461]    # col.8
G19.tablaA.B1.XLPE2   = [20, 26.5, 36, 46, 65, 87, 110, 137, 167, 214, 259, 301, 343, 391, 468, 538]   # col.10
Iz = min(BT19.tabla1, G19.tablaA)   # K-REBT.19
# Enterrados — ITC-BT-07 tabla 5 (Cu, 25 °C, 0,70 m, 1 K·m/W; pp.80–81) y 3.1.3 (p.83)
BT07.tabla5.XLPE.terna    = {6: 72, 10: 96, 16: 125, 25: 160, 35: 190, 50: 230, 70: 280, 95: 335, 120: 380, 150: 425, 185: 480, 240: 550, 300: 620}
BT07.tabla5.XLPE.tripolar = {6: 66, 10: 88, 16: 115, 25: 150, 35: 180, 50: 215, 70: 260, 95: 310, 120: 355, 150: 400, 185: 450, 240: 520, 300: 590}
BT07.factor = {dosUnipolaresOBipolar: 1.225, enTubo: 0.8, cuatroUnipolaresEnTubosSeparados: 0.9}
G19.tablaD.tuboEnterrado.Cu = {XLPE3: {6: 48, 10: 64, 16: 82, 25: 105, 35: 130, 50: 155}, XLPE2: {6: 58, 10: 77, 16: 100, 25: 130, 35: 155, 50: 183}}   # 1,5 K·m/W (p.12)
G19.tablaE.empotrados = {1: 1.00, 2: 0.80, 3: 0.70, 4: 0.70, 6: 0.55, 9: 0.50, 12: 0.45, 16: 0.40, 20: 0.40}   # p.13

# Tubos — ITC-BT-21 (pp.142–145) = Guía BT-21 (pp.5, 8, 12). Ø ext. mm por n.º de conductores [1,2,3,4,5]
BT21.tabla5.empotrado  = {1.5: [12,12,16,16,20], 2.5: [12,16,20,20,20], 4: [12,16,20,20,25], 6: [12,16,25,25,25], 10: [16,25,25,32,32], 16: [20,25,32,32,40], 25: [25,32,40,40,50], 35: [25,40,40,50,50]}
BT21.tabla2.superficie = {1.5: [12,12,16,16,16], 2.5: [12,12,16,16,20], 4: [12,16,20,20,20], 6: [12,16,20,20,25], 10: [16,20,25,32,32], 16: [16,25,32,32,32], 25: [20,32,32,40,40], 35: [25,32,40,40,50]}
BT21.tabla9.enterrado_hasta6 = {1.5: 25, 2.5: 32, 4: 40, 6: 50, 10: 63, 16: 63, 25: 90, 35: 90, 50: 110, 70: 125, 95: 140, 120: 160, 150: 180, 185: 180, 240: 225}
# Guía BT-15 (pp.13–15): DI, Ø ext. tubo mm
G15.tablaF.mono = {ES07Z1K_3U: {sup: {6:32,10:32,16:40,25:50,35:63}, emp: {6:32,10:32,16:40,25:50,35:50}},
                   RZ1K_3U:    {sup: {6:32,10:40,16:40,25:50,35:50}, emp: {6:40,10:40,16:50,25:50,35:63}, ent: {6:40,10:50,16:50,25:63,35:63}}}
G15.tablaG.tri  = {ES07Z1K_5U: {emp: {6:32,10:40,16:50,25:63 /*, 35: P11 */}}, RZ1K_5U: {ent: {6:50,10:63,16:63,25:75,35:90,50:110}}}
G15.tablaH_I    = {basica_5750W: {6: "≤14 m", 10: "≤23", 16: "≤38", 25: "≤59"}, elevada_9200W: {6: "≤8", 10: "≤14", 16: "≤23", 25: "≤37", 35: "≤52"}}   # 1 %, 40 °C; tubo ES07Z1-K 40/40/40/50/50

# Protecciones — Guía BT-22 (oct-05)
G22.I2       = {UNE_EN_60898_61009: 1.45, UNE_EN_60947_2: 1.30}   # × In
G22.gG.If    = {"In>=16": 1.60, "4<In<16": 1.90, "In<=4": 2.10}   # × In
coordinacion = (Ib <= In && In <= Iz && I2 <= 1.45 * Iz)            # → gG (In ≥ 16 A): In <= 0.906 * Iz (INTERPRETACIÓN)
G22.curvas   = {B: [3, 5], C: [5, 10], D: [10, 20]}               # Im / In
G22.Lmax_cc  = 0.8 * U0 * S_F * (56 / 1.5) / (Im * (1 + S_F / S_N))   # Im = 10·In en curva C
G22.k        = {PVC_70: {Cu: 115, Al: 76}, XLPE_EPR_90: {Cu: 143, Al: 94}}

# Fórmulas — Guía Anexo 2 (feb-2026, rev. 2)
GA2.gamma    = {Cu: {20: 56, 70: 48, 90: 44}, Al: {20: 35, 70: 30, 90: 28}}   # m/(Ω·mm²)
GA2.S_mono   = 2 * P * L / (gamma * e * U)        # U = 230 V
GA2.S_tri    = P * L / (gamma * e * U)            # U = 400 V
GA2.T        = T0 + (Tmax - T0) * (I / Imax)^2
GA2.reactancia = "despreciable hasta 120 mm²"
GA2.cosPhi   = {LGA: "el de la carga (0,90 en el ejemplo)", DI_y_circuitos_vivienda: 1}
# Longitud máxima por circuito (cálculo propio, K-REBT.24: 3 %, 230 V, γ = 48)
Lmax_m = 6.9 * 48 * S / (2 * In)   # → C1 24,8 · C2/C5/C10 25,9 · C4 33,1 · C3/C8/C9 39,7 · C11 24,8 · C13 (5 %, 16 A) 43,1
G25.tablaB_m = {"1.5/10": 27, "2.5/10": 45, "2.5/16": 28, "4/16": 45, "4/20": 36, "6/20": 53, "6/25": 43}   # Guía, γ ≈ 52

# Puesta a tierra — ITC-BT-18 (pp.122–127), ITC-BT-24 (pp.157–159), ITC-BT-26 (pp.171–173)
BT18.tabla1 = {protegidoCorrosion: {protegidoMec: "según 3.4", noProtegidoMec: {Cu: 16, AceroGalv: 16}}, noProtegidoCorrosion: {Cu: 25, Fe: 50}}   # mm²
BT18.profundidadMin_m = 0.50
BT18.tabla2_CP  = (S <= 16 ? S : S <= 35 ? 16 : S / 2) ; BT18.CPfueraCanalizacion_min_mm2 = {conProteccionMec: 2.5, sin: 4}
BT18.tabla4_rho = {cultivablesFertiles: 50, terraplenes: 500, pedregososArenasSecas: 3000}   # Ω·m
BT18.tabla5     = {placa: "R = 0,8·ρ/P", pica: "R = ρ/L", conductorHorizontal: "R = 2·ρ/L"}
BT18.Ucontacto_V = {localConductor: 24, demas: 50}
BT18.equipotencialPrincipal_mm2 = max(CPmayor / 2, 6)   # reducible a 2,5 si es Cu
BT24.TT = "RA · Ia <= U, Ia = IΔn"   # → R máx 30 mA: 1667 Ω (50 V) / 800 Ω (24 V); 300 mA: 167 / 80 Ω
BT26.lineaPrincipal_Cu_min_mm2 = 16 ; BT26.puntos = ["a) patios (rehab.)", "b) centralización", "c) ascensores", "d) CGP", "e) servicios"]
BT26.conectar = ["masas", "depósitos de gasóleo", "calefacción general", "agua", "gas canalizado", "antenas de radio y TV"]
# Guías (no reglamentarias)
G26.anillo = {S_Cu_mm2: 35, profundidad_m: 0.8} ; G26.pica = {L_m: 2, separacionMin: "2 × L"} ; G26.Robjetivo_ohm = {conPararrayos: 15, sinPararrayos: 37}
G26.tablaA_m = { // n.º picas → longitud mínima ΣL (null = «^», alargar el anillo)
  organicos:  {sin: {0: 25},           con: {0: 34, 1: 30, 2: 26}},
  arenasArcillosas: {sin: {0: 28, 1: 25}, con: {0: 67, 1: 63, 2: 59, 3: 55, 4: 51, 5: 47, 6: 43, 7: 39, 8: 35}},
  calizasAgrietadas: {sin: {0: 54, 1: 50, 2: 46, 3: 42, 4: 38, 5: 34, 6: 30}, con: {0: 134, 1: 130, 2: 126, 3: 122, 4: 118, 5: 114, 6: 110, 7: 106, 8: 105, 9: 98, 10: 94, 15: 74}},
  gravaArenaSilicea: {sin: {0: 162, 1: 158, 2: 154, 3: 150, 4: 146, 5: 142, 6: 138, 7: 134, 8: 130, 9: 126, 10: 122, 15: 102, 20: 82},
                      con: {0: 400, 1: 396, 2: 392, 3: 388, 4: 384, 5: 380, 6: 376, 7: 372, 8: 368, 9: 364, 10: 360, 15: 340, 20: 320, 30: 280, 40: 240, 50: 200}} }
G18.placaHorizontal = "R = 1,6·ρ/P" ; G18.pica = {acero_cobre_D_mm: 14.2, acero_galv_D_mm: 20}

# Criterios del producto (NO son del REBT) — K-REBT.19 a 36
crit.Iz                 = "mín(ITC-BT-19 tabla 1; Guía BT-19 tabla A)"
crit.metodo             = "B"            # A1 con tabiquería aislante
crit.temperaturaGamma   = {PVC_Z1: 70, XLPE_EPR: 90}
crit.cosPhi             = {LGA: 0.9, DI: 1, interior: 1}
crit.longitudes_m       = {DI_unifamiliar: 15, LGA: 10, DI_centralizacion: 3, DI_horizontalPlanta: 10}
crit.fusibles_A         = [63, 80, 100, 125, 160, 200, 250, 315, 400]   # NO verificada (P10)
crit.neutro             = "igual a la fase"
crit.rhoDefecto_ohm_m   = 3000
crit.Ucontacto_V        = 24 ; crit.Ia_A = {unifamiliar: 0.03, edificioConServiciosGenerales: 0.3}
crit.anillo             = {S_Cu_mm2: 35, profundidad_m: 0.8}
```

### Procedencia sugerida para `shared/tablas` (feature-34)

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Circuitos | REBT | RD 842/2002, consolidado (C13 por RD 1053/2014) | 2025-09-03 | ITC-BT-25 ap. 2 y 3 | Tabla 1 | BOE-A-2002-18099 pp. 167–169 (imagen) |
| Puntos de utilización | REBT | ídem | 2025-09-03 | ITC-BT-25 ap. 4 | Tabla 2 | ídem p. 170 |
| Caídas de tensión | REBT | ídem | 2025-09-03 | ITC-BT-14 ap. 3; ITC-BT-15 ap. 3; ITC-BT-19 ap. 2.2.2; ITC-BT-52 ap. 5 | — | ídem pp. 110, 113, 128, 282 |
| LGA | REBT | ídem | 2025-09-03 | ITC-BT-14 ap. 1–3 | Tabla 1 | ídem pp. 109–111 |
| DI | REBT | ídem | 2025-09-03 | ITC-BT-15 ap. 1–3; ITC-BT-16 ap. 1 | Tabla 1 | ídem pp. 111–114 |
| Intensidades admisibles (aire) | REBT + Guía BT-19 | consolidado + feb-09, rev. 2 | 2025-09-03 / 2009-02 | ITC-BT-19 ap. 2.2.3 | Tabla 1; Guía tabla A | ídem p. 129; guia_bt_19_feb09R2.pdf p. 9 |
| Intensidades admisibles (enterrados) | REBT + Guía BT-19 | ídem | ídem | ITC-BT-07 ap. 3.1.2 y 3.1.3 | Tabla 5; Guía tabla D | ídem pp. 80–83; guía p. 12 |
| Tubos | REBT + Guía BT-15 | consolidado + sep-03, rev. 1 | 2025-09-03 / 2003-09 | ITC-BT-21 ap. 1.2; ITC-BT-14 tabla 1 | Tablas 2, 5, 9; Guía F, G | ídem pp. 142–145; guia_bt_15_sep03R1.pdf p. 13 |
| Coordinación de protecciones | Guía BT-22 | Oct-05, rev. 1 | 2005-10 | (ITC-BT-22 ap. 1.1) | — | guia_bt_22_oct05R1.pdf pp. 4–8, 12–13 |
| Fórmulas y γ | Guía, Anexo 2 | feb-2026, rev. 2 | 2026-02 | — | — | guia_bt_anexo_2_sep03R1.pdf |
| Puesta a tierra | REBT | consolidado | 2025-09-03 | ITC-BT-18 ap. 3, 8, 9; ITC-BT-24 ap. 4.1.2; ITC-BT-26 ap. 3 | Tablas 1–5 (BT-18) | ídem pp. 122–127, 159, 171–172 |
| Anillo y picas (orientativo) | Guía BT-26 | sep-03, rev. 1 | 2003-09 | ap. 3.1 | Tabla A | guia_bt_26_sep03R1.pdf pp. 3–5 |
