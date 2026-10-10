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
