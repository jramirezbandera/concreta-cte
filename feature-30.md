# feature-30 — Memoria como la del estudio · Fase 3: obra existente redactada como intervención

> Fase 3 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.3). Escrito el 2026-10-10, tras cerrar la
> fase 2 ([feature-29.md](feature-29.md)).
> Verificación normativa: [research/verificacion-intervencion.md](research/verificacion-intervencion.md)
> (K-INT.*), además de K-REF (reformas) y K-MEM (memoria).

## Lo que hay hoy

Desde feature-27 cada módulo **calcula** lo intervenido (`edificioParaModulo`), pero lo **redacta**
como si fuera el edificio entero, porque no sabe qué hay alrededor. Volcado de la memoria de
«Reforma: local a vivienda» con el código de 4cb3892:

| Apartado | Lo que dice | Problema |
|---|---|---|
| REBT | Previsión de las 7 viviendas, ascensor, local y garaje: 84,2 kW, 9 contadores, proyecto del aparcamiento. | Es la previsión del edificio, no de la obra. |
| HS 4 | «Una batería de 2 contadores —una vivienda y las zonas comunes—». | La batería existe y tiene 8; se añade uno. |
| HS 5 | Colector general de 23 UD y pluviales de toda la cubierta (210 m²). | La vivienda acomete a una red existente; las pluviales no se tocan. |
| SI 3 | Salida del edificio para 5 personas; escalera «que no usa nadie». | La salida del edificio sirve a todo el edificio; los comunes no se justifican (criterio 8). |
| SI 4 | Extintores en P3…S1, BIE y detección del garaje. | Lo describe como proyectado; el garaje no se toca. |
| HS 1 | Muros y suelo del sótano, solera de 125 m², cubierta. | Solo se cambian huecos y particiones. |
| HS 3 | Extractores en cubierta. | La vivienda está en planta baja: el conducto puede no llegar (K-MEM.3). |
| HS 6 | Forjado sanitario nuevo bajo 125 m². | Sobre solera existente: soluciones del ap. 3 para existentes. |
| SUA 8 | Edificio entero con C4 de comercial: pide pararrayos. | El cambio de local a vivienda no aumenta el riesgo. |
| SUA 1 | «Aún sin redactar» (en planta baja no hay escaleras, barreras ni vidrios altos). | Hay que decir qué se ha comprobado. |
| HE 4 / 5 / 6 | «No aplica» con la lista de supuestos. | Falta la razón de fondo y la cifra. |
| HR | Solo la separación con el portal. | Faltan el forjado con la vivienda de arriba y el resto del local, que quedan fuera al quitar lo existente. |

## Objetivo

En el caso de reforma ningún apartado describe el edificio entero como proyectado. Cada módulo en
`aplica_reformado` dice **qué se proyecta** y **qué existe y no se modifica**; lo existente lo cubre
el no empeoramiento, que ya dice el párrafo de alcance. SUA 1 sale redactado.

## Principios

- **Obra nueva no cambia, y una reforma sin el asistente respondido tampoco.** Lo nuevo solo actúa
  con `alcance` (la foto de los 40 proyectos no tiene asistente: no debe cambiar).
- **Se deduce antes de preguntar.** Lo existente se lee de El edificio entero (contadores,
  viviendas, usos anteriores). Solo se pregunta lo que El edificio no sabe (el colector existente,
  la expulsión), como decisión del módulo y solo en obra existente.
- **Lo existente no bloquea.** Una comprobación de algo existente que no se toca no da «no cumple»;
  si lo existente condiciona la obra (el colector no admite las UD), sí.
- **Ninguna cita sin verificar** (K-INT).

## Pasos

### Paso 0 · Verificación

Agente `cte-normativa` → `research/verificacion-intervencion.md`: HS 6 en existentes, SUA 8 en un
cambio de uso parcial, HR (forjado con la vivienda de arriba y recinto de actividad al lado), SI 4,
HS 4/HS 5 con instalaciones existentes, REBT art. 2.2.

### Paso 1 · Lo existente, a la vista de los módulos

- `ObraExistente` en [alcance.ts](src/lib/proyecto/alcance.ts): El edificio entero, la marca de cada
  zona, `AlcanceEdificio` y las respuestas del asistente. Solo en un edificio existente con el
  asistente respondido.
- `proyectoParaModulo` la añade; `ProyectoSi.existente` y el `obra` de HS 1, HS 3–HS 6 la llevan.
  Las pantallas de los módulos la pasan igual que La obra, para que la pestaña Memoria diga lo mismo.

### Paso 2 · Instalaciones

- **HS 4**: la batería existente (contadores antes y después, deducidos de El edificio entero), el
  contador que se añade y la derivación nueva; la presión de la red existente como dato.
- **HS 5**: las UD que se añaden; la red existente a la que acometen (decisión: Ø y pendiente del
  colector o bajante) con las UD que ya recibe, deducidas de lo existente; pluviales «no se
  modifican» si el asistente lo dice.
- **REBT**: grado y potencia de las viviendas nuevas; derivación individual nueva y su contador en
  la centralización existente; la carga del edificio antes y después del cambio, que dice si la
  LGA existente queda servida o hay que comprobarla.

### Paso 3 · Envolvente y aire

- **HS 1**: solo los elementos que se tocan según el asistente (huecos: puntos singulares de
  carpinterías sobre la fachada existente); muros, suelos y cubierta existentes no se describen.
- **HS 3**: decisión «expulsión: cubierta / fachada»; con fachada, ventilación mecánica y el
  párrafo de flexibilidad (K-MEM.3); aviso de la ordenanza municipal.
- **HS 6**: las soluciones para existentes (K-INT.1) en lugar del forjado sanitario nuevo.

### Paso 4 · SI y SUA

- **SI 3**: la ocupación de lo intervenido y su salida a los elementos comunes existentes (criterio
  8); los comunes no se dimensionan como si fueran de la obra.
- **SI 4**: la dotación propia de lo intervenido; las instalaciones existentes «no se modifican».
- **SUA 1**: redactado sobre lo intervenido aunque no haya escaleras ni barreras: suelos y
  discontinuidades, desniveles, lo que se ha comprobado.
- **SUA 8**: en un cambio de uso no característico, el C4 antes y después (K-INT.2).

### Paso 5 · HE y HR

- **HE 4 / HE 5 / HE 6**: el «no aplica» dice el uso característico (que no cambia) y la cifra (l/d
  de ACS, m² construidos, plazas).
- **HR**: las separaciones de lo intervenido con lo existente (la vivienda de arriba, el local de al
  lado, el garaje de abajo), leídas de El edificio entero; si la del forjado de arriba no se puede
  resolver por completo, la flexibilidad concreta (K-INT.3).

### Paso 6 · Cierre

- Tests en verde; la foto del expediente no cambia.
- Volcado de la memoria de la reforma antes y después, con el diff revisado; el Word abierto.

## Fuera de esta fase

- Las tablas «Norma | Proyecto» (fase 4).
- El anejo de cálculo con circuitos y derivación individual dimensionada (fase 6).

## Hecho (2026-10-10)

1568 tests en verde. La foto del expediente no cambia: sus 40 proyectos no tienen el asistente
respondido. Obra nueva sale idéntica (volcado de la unifamiliar y la plurifamiliar antes y
después). El Word de la reforma se abre en Word: 14 páginas, con cabecera y pie. Commits: a091e04
(pasos 0 a 2), a5d5375 (paso 3), 23776d7 (paso 4), aea2ae9 (paso 5) y cfe8ddd (SI 1).

- **Paso 0.** [research/verificacion-intervencion.md](research/verificacion-intervencion.md),
  K-INT.1 a 20. En esta fase se cotejaron en imagen HS 6 (pp. 139–141) y HS 1 ap. 2.3.3.6 (p. 26).
- **Paso 1.** En [alcance.ts](src/lib/proyecto/alcance.ts):
  - `ObraExistente`, `obraExistenteDe` y `ProyectoModulo`; `proyectoParaModulo` la añade;
  - `edificioAntes`: lo nuevo fuera y lo que cambia de uso con su uso anterior; la parte que se
    segrega de un local vuelve a él.

  La llevan `ProyectoSi.existente` y el `obra` de HS 1, HS 3 a HS 6. Las pantallas la pasan igual
  que La obra y el anejo.
- **Paso 2.**
  - HS 4: contador en la batería existente («pasa a tener 9 contadores»); acometida y tubo de
    alimentación sin modificar.
  - HS 5: decisión «Colector existente al que acomete» (Ø y pendiente). Sin el dato, la memoria
    da el mínimo para las UD del colector general del edificio entero (158 UD, ≥ Ø110) y hay
    aviso. Con un Ø que no las admite, no cumple. Pluviales «no se modifican» si el asistente lo
    dice.
  - REBT: vivienda nueva, derivación y contador en la centralización existente. La carga del
    edificio pasa de 85,9 a 84,2 kW: no aumenta, así que la LGA y la CGP no se modifican. Memoria
    técnica de diseño.
- **Paso 3.**
  - HS 1: solo lo que el asistente marca de la envolvente; con solo huecos, los encuentros del
    ap. 2.3.3.6.
  - HS 3: decisión «Dónde expulsan los conductos». En fachada: mecánica y párrafo de flexibilidad;
    avisos de híbrida y de ordenanza municipal. En cubierta con plantas existentes encima: aviso.
  - HS 6: geometría del edificio entero y protección de lo intervenido. En la reforma, la vivienda
    está sobre el garaje, que no se toca: el garaje es la contención y la barrera va en el forjado.
    Sobre solera existente: lámina encima o solera sellada, y cámara interior de 5 cm o
    despresurización, con medición posterior.
- **Paso 4.**
  - SI 3: con el criterio 8, la ocupación de lo intervenido (5 personas). En el portal que se
    reforma, puerta y señales con la del edificio (40). Sin escalera ni garaje.
  - SI 4: la tabla 1.1 antes y después. Lo existente, con el criterio 10 en condicional.
  - SUA 1: elemento «Discontinuidades del pavimento» y textos de lo intervenido. Ya no queda
    ningún apartado pendiente.
  - SUA 8: Ne igual y Na que no baja: «la evaluación es la del edificio preexistente».
- **Paso 5.**
  - HE 4, HE 5 y HE 6: «En esta obra, …», con la demanda de ACS antes y después (700 l/d) y los
    m² construidos (1368).
  - HR: separaciones del edificio entero, solo las que tocan lo que cambia de uso. Sale el
    «Forjado con la vivienda de arriba»: aéreo con el techo de la vivienda nueva y el suelo de
    arriba a ΔRA 0; impactos por flexibilidad, con aviso. Entran el local de al lado y el garaje
    de abajo; salen la cubierta y el portal.
- **SI 1, fuera de la tabla del plan.** Decía «el edificio se compartimenta en un único sector de
  150 m²», que solo era lo intervenido. Ahora la vivienda se integra en el sector de viviendas del
  edificio (763 m²) y se separa del local con EI 90, que antes no salía.

## Decisiones a validar

1. **Todo esto solo actúa con el asistente de alcance respondido.** Una reforma sin él se redacta
   como hasta feature-29.
2. **HS 4.** La acometida y el tubo de alimentación existentes «no se modifican», sin comprobar
   que admiten el caudal añadido. HS 4 no lo pide para existentes (K-INT.16).
3. **HS 5.**
   - El colector existente es una decisión del módulo; sin ella, la memoria da el Ø mínimo y hay
     aviso.
   - La ventilación «a través de la red existente» supone sus bajantes prolongadas sobre la
     cubierta.
4. **REBT.** Si la carga del edificio no aumenta, la LGA y la CGP no se modifican
   (INTERPRETACIÓN, K-INT.19). Si aumenta, se pide comprobarlas.
5. **HS 3.** La expulsión en fachada es un párrafo del módulo; no cambia la aplicabilidad a «con
   flexibilidad» en La obra.
6. **HS 6.**
   - Si el sótano no se toca, la barrera va siempre en el forjado de planta baja.
   - La rebaja por medición previa (K-INT.6) no entra.
7. **SI 3.** Con el criterio 8 se dejan de justificar escalera, salidas de planta y garaje; solo
   la ocupación propia y, si se reforman zonas comunes, puerta y señales.
8. **SI 4.** No se pregunta si la obra toca el soporte de las instalaciones existentes. El
   criterio 10 se dice en condicional.
9. **SUA 8.** Sin variación no bloquea, aunque el edificio necesitara pararrayos: esa necesidad es
   del edificio, no de la obra (INTERPRETACIÓN, K-INT.9). La nota de alcance sigue diciendo «se
   evalúa para el edificio completo».
10. **HR.**
    - En un cambio de uso parcial, el ámbito es lo que cambia de uso: lo que solo se reforma (el
      portal) no entra.
    - Los impactos de la vivienda de arriba van por flexibilidad con el párrafo de la Guía.
    - El techo del garaje existente sigue siendo una decisión del módulo («techo bajo»), aunque
      el garaje no se toca.
11. **SI 1.** Lindan con lo intervenido los sectores de su planta y de la de debajo, no los de
    encima.

## Pendiente

- **HS 1 con el terreno tocado.** HS 1 tiene el mismo fallo de geometría que tenía HS 6: con el
  sótano quitado, la planta baja parece apoyar en el terreno. No sale en la reforma, porque no se
  toca el terreno.
- **HS 3** dice «Las viviendas se ventilan» con una sola vivienda nueva.
- **SI 2, SUA 2 a SUA 4 y SUA 9** siguen con frases del edificio (altura de fachada, rellanos de
  cada planta). Son condiciones de los elementos y no describen la obra como el edificio entero.
- **Cotejo en imagen** de lo que la verificación deja pendiente (DB-HR p. 31, REBT, HS 4 y HS 5)
  antes de citarlo literalmente.
