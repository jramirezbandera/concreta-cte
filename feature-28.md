# feature-28 — Memoria como la del estudio · Fase 1: errores de la app

> Primera fase de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§3 y §5.1). Escrito el 2026-10-10, tras
> comparar la memoria de la app con las memorias reales del estudio (`ejemplos/`).
> En paralelo corre la fase 0 (verificación normativa →
> `research/verificacion-memoria.md`), que esta fase no necesita.

## Lo que hay hoy

Errores comprobados al regenerar la memoria de los casos de partida con el código de 5c7cdec
(volcado de `textoPlanoMemoriaCte`), sobre todo en «Reforma: local a vivienda»:

1. **HR se contradice.** La aplicabilidad dice «se aplica a la zona que cambia de uso a vivienda»
   (K-REF.4) y el módulo, que decide su ámbito con `intervencion === "obra_nueva"`
   ([justificacion.ts](src/modules/hr/justificacion.ts)), redacta debajo «queda excluida del ámbito
   del DB-HR (Introducción II d)».
2. **Notas de alcance que repiten el sujeto.** Cuando dos casos de obra empatan en «aplica a lo
   intervenido», `propuestaExistente` junta sus notas tal cual: «SI 2 Propagación exterior: se
   aplica a la zona… SI 2 Propagación exterior: se aplica a los elementos modificados…». Pasa en
   SI 2, SI 3, SUA 2 y otros. Las citas se juntan aunque una contenga a la otra.
3. **HE 1 y HE 0 dos veces a HULC.** Desde 5c7cdec, HE 1 es «externo → HULC» cuando la global va a
   HULC. La memoria pinta dos apartados seguidos con «Se justifica con HULC. Pendiente de adjuntar
   el documento.» y pierde la nota de alcance de HE 1.
4. **REBT suma la recarga del vehículo eléctrico en obra existente** aunque HE 6 no aplica y el
   garaje no se toca («Recarga del vehículo eléctrico · 1,4 plazas · 5152 W»).
5. **Rótulos sin espacio** en los apartados «no aplica» y «externo»: «DB-HS2», «DB-SUA5»,
   «DB-HE4», «DB-HE0 / DB-HE1», frente a «DB-HS 1» de los redactados. Salen del `db` del registry.
6. **Erratas:**
   - «El fregadero del cocina» (HS 4, unifamiliar);
   - «de forma individual en cada unidad» en una unifamiliar (HS 4);
   - «Vivienda U» en la tabla del REBT de la unifamiliar;
   - «más que las 0 que la usan» (SI 3, cuando ningún ocupante de lo intervenido usa la escalera);
   - «hay que salvar 0 plantas… y hay 0 viviendas» (SUA 9).

**Descartado tras comprobar:**
- SUA 6 con piscina privada ya lo dice bien. En el primer volcado la piscina estaba desactivada.
- Las citas bajo cada «no aplica» («DB-SUA 5, ámbito de aplicación») son la línea de fuente del
  apartado, como la de los redactados. Se quedan.

**Fuera de esta fase:**
- Los módulos que redactan el edificio entero en obra existente (REBT, HS 4, HS 5, SI 4…) son la
  fase 3.
- SUA 1 «aún sin redactar» en la reforma, también.

## Objetivo

La memoria del caso de reforma sin contradicciones ni duplicados, y las erratas fuera. Obra nueva
no cambia salvo en los rótulos y en las erratas corregidas.

## Pasos

### Paso 1 · HR lee la aplicabilidad del expediente

- `aplicabilidadEfectiva` y `aplicabilidadPropuesta` aceptan lo que leen (`datosGenerales`,
  `edificio`, `justificaciones`), no un `Proyecto` entero.
- Un `seAplicaEnLaObra(p, key)`: en obra nueva, sí, como hasta ahora; en un edificio existente, si
  la aplicabilidad efectiva no es `no_aplica`.
- HR calcula `aplica` con él. En un edificio existente, el párrafo de ámbito ya no repite la nota
  de alcance, que la memoria pone delante: dice que lo que se aplica se justifica por la opción
  simplificada.

### Paso 2 · Notas de alcance sin sujeto repetido

- En `propuestaExistente`, las notas segunda y siguientes que empiezan por el mismo sujeto («SI 2
  Propagación exterior: ») lo pierden y se encadenan con «Además, …».
- Una cita que ya está contenida en otra se quita.

### Paso 3 · HE 1 con la verificación global

- Si HE 1 y HE 0/HE 1 global son externas con el mismo destino, la memoria las da en un solo
  apartado: «DB-HE 0 y DB-HE 1 · Verificación energética global y envolvente térmica».
- Ese apartado lleva la nota de alcance de HE 1 si la hay.

### Paso 4 · REBT: recarga solo si aplica a la obra

En viviendas, la previsión de la recarga se suma en obra nueva (como ahora) y, en un edificio
existente, solo si HE 6 se aplica a la obra (`seAplicaEnLaObra(p, "he6")`). Es coherente con la
ITC-BT-52 (nueva construcción) y con los supuestos de existentes de HE 6 (ap. 1 pto 1 b).

### Paso 5 · Rótulos y erratas

- Rótulos de «no aplica» y «externo» con el espacio de los redactados («DB-HS 2», «DB-HE 0 /
  DB-HE 1»), formateados en la memoria sin tocar el `db` del registry.
- Las erratas del punto 6, cada una con su test.

### Paso 5b · Umbral de HE 0 en el cambio de uso característico

`he0he1` en [reglasExistentes.ts](src/lib/proyecto/reglasExistentes.ts) aplica HE 0 a todo cambio
de uso característico. HE 0 ap. 1 pto 1 b) solo lo exige con más de 50 m² útiles y no distingue
entre característico y parcial (K-MEM.1, verificado en imagen). En la práctica solo cambia en
edificios de 50 m² útiles o menos.

### Paso 6 · Cierre

- Tests en verde.
- La foto del expediente ([foto-antes.json](src/lib/obra/test/foto-antes.json)) cambia solo en la
  huella de la memoria (textos) y en lo que se espera del paso 4.
- Volcado de las memorias de los casos antes y después, con el diff revisado.

## Hecho (2026-10-10)

1532 tests en verde. La foto del expediente
([foto-antes.json](src/lib/obra/test/foto-antes.json)) solo cambia en la huella de la memoria de
los 40 proyectos (rótulos y erratas). Tests nuevos en
[errores-memoria.test.ts](src/lib/obra/test/errores-memoria.test.ts).

- **Paso 1.**
  - `seAplicaEnLaObra` y `ProyectoAplicabilidad` en [aplicabilidad.ts](src/lib/proyecto/aplicabilidad.ts).
  - HR calcula con la aplicabilidad efectiva y lleva `existente`.
  - En la reforma, HR justifica ya la zona que cambia de uso: separación con el portal, fachadas y
    tabiquería.
- **Paso 2.** `juntarNotas` y `sinContenidas` en [reglasExistentes.ts](src/lib/proyecto/reglasExistentes.ts).
- **Paso 3, cambiado.** La sesión paralela (3569786, c03cfc8) separa a propósito los resultados del
  informe de HULC/CE3X: HE 1 lleva transmitancias y condensaciones, la global lleva HE 0, K, q_sol
  y n50, con documento compartido. **No se funden los dos apartados.** En su lugar:
  - HE 1 sin informe dice «en el mismo documento que la verificación energética global» en vez de
    «pendiente de adjuntar»;
  - los apartados externos de una obra existente imprimen su nota de alcance, que se perdía;
  - la frase de la reforma «no se verifican K ni el control solar» (`HE1_SIN_K`) se quita cuando
    HE 1 va con la global, porque ahí sí se verifican.
- **Paso 4.**
  - La recarga del REBT y sus módulos de reserva en la concentración solo con HE 6 aplicable a la
    obra, cuando el alcance está respondido.
  - Sin asistente, como antes.
  - En la reforma, la carga baja de 89,4 a 84,2 kW.
- **Paso 5.**
  - `normaLegible` para los rótulos.
  - `delCuarto` en HS 4.
  - «Vivienda» en el REBT de la unifamiliar.
  - «en la propia vivienda» en HS 4.
  - SI 3 y SUA 9 sin cifras a cero.
- **Paso 5b.** HE 0 con el umbral de 50 m² también en el cambio de uso característico; sin zonas
  marcadas, se aplica (lado prudente).

## Decisiones a validar

1. **HE 1 y la verificación global quedan como dos apartados** (ver paso 3), para no deshacer el
   diseño de los resultados del informe. Si se prefiere uno solo, se hace en la fase 2 al ordenar
   el documento.
2. **Sin asistente de alcance, el REBT sigue sumando la recarga** en edificios existentes, como
   antes de esta fase (la foto de feature-27 lo exige). Con el asistente respondido, solo si HE 6
   aplica.
3. **HR en la reforma** justifica ahora con los valores por defecto del módulo (Ld 60 dBA,
   colindancias supuestas). Falta lo que la fase 3 pide: el forjado con el piso de arriba
   (obligatorio en un cambio de uso en planta baja) y la flexibilidad concreta.
