# feature-31 — Memoria como la del estudio · Fase 4: tablas «Norma | Proyecto»

> Fase 4 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.4). Escrito el 2026-10-11, tras cerrar la
> fase 3 ([feature-30.md](feature-30.md)).

## Lo que hay hoy

`MemoriaDoc` tiene una sola tabla opcional (`tabla: { cabecera, filas }`), que va después de todos
los párrafos. El Word, el PDF, la pantalla y el texto copiado la pintan igual: la columna 0 a la
izquierda y en negrita, el resto a la derecha.

| Apartado | Tabla de hoy | Lo que repite el texto |
|---|---|---|
| SI 1 | Sector · uso · superficie · resistencia, sin lo exigido. | Todo: el texto ya da superficie, límite y EI. |
| SI 3 | Ninguna. | Ocupaciones, salidas, recorridos y anchuras van en prosa. |
| SI 4 | Ninguna. | La dotación, en un párrafo por instalación. |
| SI 6 | Planta · uso que manda · R exigida, sin la de proyecto. | La R de cada planta, con su porqué. |
| SUA 1 | Escaleras: planta, altura, peldaños, C, 2C + H. | Las barreras por planta, en prosa. |
| SUA 2 a SUA 4 | Ninguna. | Alturas libres, fuerzas de apertura, iluminancias. |
| SUA 8 | Ninguna. | Ng, Ae, C1…C5, Ne, Na, E y nivel, en tres párrafos. |
| HR | Elemento · solución · proyecto · exigido · cumple. | Cada elemento, en su párrafo. |

## Objetivo

Cada apartado de SI y SUA se lee en diagonal por su tabla, como las memorias del estudio: la
columna «Norma» con lo exigido y la columna «Proyecto» con lo proyectado. El texto se queda con lo
que la tabla no dice (criterio, decisión, condición, remisión). HR lleva la ficha K.1 de la opción
simplificada, una tabla por bloque.

## Principios

- **La tabla no inventa.** Lo de proyecto es lo que el módulo ya sabe (decisión, dato de El
  edificio o la solución que adopta). Si el proyecto solo declara que cumple (una EI, una fuerza de
  apertura), la celda dice el valor que se declara, no una medida.
- **«No se exige»**, nunca «—» ni «None», donde un parámetro no se exige en ese caso.
- **Cada tabla termina en «Cumple» o «No cumple»** por fila, cuando hay comparación.
- **El texto no repite la tabla.** Lo que pasa a la tabla sale del párrafo; el párrafo no
  desaparece si dice algo más (el porqué, la condición constructiva).
- **Un apartado sin alcance, sin tabla.** En obra existente con el criterio 8 (SI 3) o sin
  variación (SI 4), la tabla es solo de lo intervenido o no sale.
- **Obra nueva y existente**: la foto del expediente cambia solo en la huella de la memoria.

## Pasos

### Paso 1 · Modelo y salida

- `TablaMemoria` en [presentacion.ts](src/lib/cte/presentacion.ts): `rotulo?`, `cabecera`,
  `columnas?` (tipo por columna: `texto`, `norma`, `proyecto`, `cumple`), `filas`, `notas?`
  (numeradas (1), (2)… debajo) y `tras?` (el nº de párrafos que la preceden; por defecto, al final).
- `MemoriaDoc.tabla` → `tablas?: TablaMemoria[]`. Todos los módulos que tenían `tabla` pasan a
  `tablas: [ … ]` sin cambiar su contenido.
- `BloqueMemoria` de tabla con `rotulo`, `columnas` y `notas`. El Word: rótulo en negrita (con
  «mantener con el siguiente»), alineación por tipo (texto a la izquierda, el resto centrado),
  «No cumple» en negrita y las notas en `Caption`. El PDF y la pantalla, igual. El troceo de
  tablas anchas se mantiene, con los tipos troceados con las columnas.
- Un solo componente de tabla para la pestaña Memoria y la página de la memoria.

### Paso 2 · SI

| Apartado | Tabla |
|---|---|
| SI 1 | Sector o local · uso · superficie construida Norma/Proyecto · resistencia Norma/Proyecto. |
| SI 3 | Zona · uso · superficie útil · densidad · ocupación. Y una de evacuación: parámetro (salidas de planta, recorrido, altura de evacuación, anchura de escalera y de puerta, protección de la escalera) · Norma · Proyecto. |
| SI 4 | Instalación · exigida (con su porqué) · proyectada, con los extintores por planta. |
| SI 6 | Planta o elemento · uso que manda · R exigida · R de proyecto. |

### Paso 3 · SUA

| Apartado | Tabla |
|---|---|
| SUA 1 | Parámetro · Norma · Proyecto: resbaladicidad, discontinuidades, barreras por planta (altura), escalera (huella, contrahuella, 2C + H, anchura, tramo, pasamanos). Se mantiene la de peldaños por planta. |
| SUA 2 | Altura libre por zona, umbrales, vidrios por planta (fila de la tabla 1.1). |
| SUA 3 | Fuerza de apertura por tipo de puerta, desbloqueo. |
| SUA 4 | Iluminancia por zona; alumbrado de emergencia (iluminancia, autonomía). |
| SUA 8 | Ng · Ae · C1 · Ne · C2…C5 · Na · E · nivel, con la tabla de cada coeficiente. |

### Paso 4 · HR: ficha K.1

Con lo que ya calcula `JustificacionHr`, la maqueta de §5.4.1 del plan: tabiques; separación
vertical por tipo de recinto colindante (elemento base y trasdosado); medianerías; separación
horizontal por caso (forjado, suelo flotante, techo suspendido); fachadas, cubiertas y suelos al
exterior por recinto receptor (con el Ld y su origen); condicionantes. Una tabla por bloque, cada
fila con «Cumple». La tabla de hoy desaparece; el texto se queda con el ámbito, el Ld, las uniones,
las instalaciones y la nota del CEC.

### Paso 5 · Cierre

Tests en verde; la foto del expediente cambia solo en la huella de la memoria; volcado de la
memoria de los casos antes y después, con el diff revisado; el Word abierto.

## Fuera de esta fase

- Habitabilidad (fase 5) y el anejo de instalaciones (fase 6).
- Las tablas de HS y HE: sus módulos ya tienen la suya y el plan no las toca.

## Hecho (2026-10-11)

1612 tests en verde (44 más que al empezar), tipos y lint limpios. La foto del expediente cambia
solo en la huella de la memoria de los 40 proyectos. El Word de plurifamiliar con locales y el de
la reforma se abren en Word: 19 y 16 páginas, con 39 y 34 tablas, sin palabras partidas en las
celdas. Commits: df93b90 (paso 1), f098e5c (SI 1), 7738226 (PDF), 13e287e (SUA 3 y SUA 4),
9cf53ea (SI 6 y SUA 8), 3e295d1 (SUA 1 y SUA 2), 5a9b014 (SI 3 y SI 4), 7e6afec (HR) y 234e0c7
(foto).

- **Paso 1.**
  - `TablaMemoria` y `MemoriaDoc.tablas`; `piezasMemoria` coloca cada tabla tras sus párrafos.
  - [tablaNorma.ts](src/lib/cte/tablaNorma.ts): «no se exige», «Cumple» / «No cumple» y la
    tabla de cuatro columnas.
  - El Word centra las columnas tipadas, pone «No cumple» en negrita y las notas en `Caption`,
    pegadas a la tabla. La pantalla usa un solo componente,
    [TablaMemoriaVista](src/components/justificacion/TablaMemoriaVista.tsx).
  - **Fuera del plan, en el PDF:** `drawTable` escribía una línea por celda, y las celdas largas
    se solapaban. La memoria en PDF pinta ahora sus tablas con salto de línea y filas de alto
    variable. Las fichas siguen con `drawTable`.
  - **Fuera del plan, en el Word y el PDF:** cada columna recibe al menos el ancho de su palabra
    más larga (`anchosDeTabla`, medido en Word: 1,8 mm por carácter). Antes «Cumple» salía
    partido.
- **Paso 2 (SI).**
  - SI 1: una tabla de sectores y locales, con superficie y resistencia, norma y proyecto.
  - SI 3: «Ocupación» por zona y «Evacuación» (Parámetro · Norma · Proyecto · Cumple). Con el
    criterio 8, solo la ocupación propia y la puerta del portal.
  - SI 4: una fila por instalación de la tabla 1.1; «no se exige / no se dispone» sustituye a la
    frase final. En obra existente, «existentes, no se modifican».
  - SI 6: R exigida y R de proyecto por planta y local, y las dimensiones del Anejo C en una
    segunda tabla.
- **Paso 3 (SUA).**
  - SUA 1: discontinuidades, barreras por planta y una tabla por escalera; se mantiene la de
    peldaños, con «no se exige» en vez de «—».
  - SUA 2: alturas libres y vuelos, vidrios por planta, y señalización y correderas.
  - SUA 3: desbloqueo, luz, llamada y fuerzas de apertura.
  - SUA 4: alumbrado normal, la dotación de emergencia como tabla «Zona | Exige | Por qué»,
    alumbrado de emergencia y señales.
  - SUA 8: «Parámetro | Valor | Referencia» de Ng a nivel; en obra existente, antes y después.
- **Paso 4 (HR).** La ficha K.1, una tabla por bloque con una fila por parámetro: tabiquería,
  verticales por recinto colindante, medianerías, horizontales por caso, fachadas y cubierta por
  recinto receptor (Ld y D2m,nT,Atr en el rótulo) y condicionantes. Sustituye a la tabla
  resumen.
- **De paso.**
  - En oficinas, SI 3 decía «uso Residencial Vivienda» en la escalera y en las zonas de refugio.
  - SUA 2 decía «de el garaje» y «de el vestíbulo».
  - SI 6 da por primera vez, en nota, el porqué de los nervios del garaje sin revestir.
  - HR da por primera vez, en nota, la combinación de ventana y caja de persiana (Anejo G).

## Decisiones a validar

1. **«Proyecto» cuando el proyecto solo declara.** Repite el valor con su signo («≤ 140 N»,
   «≥ 100 lux», «≤ 25 m» si el recorrido no se ha medido, «EI 120»). Norma y Proyecto coinciden
   en muchas filas de SI 1, SUA 2 a SUA 4 y SI 4. Lo que decide el módulo va sin signo (alturas
   libres, barreras, huella, anchura). La alternativa es una columna «Proyecto» con «se declara».
2. **Texto y tabla** (decisión 1 de PLAN-MEMORIA §6): se ha aplicado la propuesta, tabla más el
   texto que la tabla no dice.
3. **Ficha K.1** (decisión 2 de §6): sustituye a la tabla resumen y acompaña al texto. Una fila
   por parámetro, con el elemento y la solución solo en la primera fila. Con columnas por
   parámetro, la vertical necesitaría 9 columnas.
4. **HR.**
   - El «Cumple» es por parámetro. Si un elemento falla por una nota o un flanco, el «No cumple»
     sale en la tabla de condicionantes.
   - Los condicionantes que solo se declaran dicen «Se declara».
   - Los bloques verticales siguen lo que agrupa el motor (viviendas con zona común; actividad
     con instalaciones), no un bloque por tipo de recinto.
5. **SI 1.**
   - La resistencia del sector principal es «EI 60 entre viviendas» o «la de cada colindante».
   - La superficie de los locales de riesgo especial dice «no se exige» en Norma, porque la
     tabla 2.1 clasifica, no limita.
6. **SI 3.**
   - El local sin uso no entra en la tabla de ocupación: sale por sus puertas.
   - Las zonas repetidas en varias plantas salen por planta («158 m² × 3»).
7. **SI 4.**
   - La «Norma» no repite la superficie del garaje, que ya está en SI 1.
   - La detección que la tabla 1.1 no exige y SI 3 sí dice «según SI 3, ap. 8».
8. **SI 6.**
   - La R de proyecto es la exigida, con su anejo («R 60 (Anejo C)»).
   - El Anejo C va en una tabla sin «Proyecto» ni «Cumple»: el módulo solo conoce los mínimos.
9. **SUA 4.**
   - La dotación de emergencia es una tabla sin «Cumple».
   - Lleva una fila nueva, «Interior de las viviendas | no».
   - Los trasteros de 50 m² o menos salen «por criterio».
10. **SUA 8.** La tabla abre el apartado y el texto se queda con la conclusión. En obra
    existente, la tabla «antes / después» de Ne, C4 y Na.

## Pendiente

- La tabla de la pantalla (`TablaMemoriaVista`) no se ha mirado en el navegador. Solo la
  comprueban los tests.
- Las celdas vacías de la primera columna de HR (filas de continuación) se pintan en negrita.
  No se ve, pero si el usuario prefiere celdas combinadas, el Word lo admite.
