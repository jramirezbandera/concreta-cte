# feature-32 — Memoria como la del estudio · Fase 5: habitabilidad

> Fase 5 de [PLAN-MEMORIA.md](PLAN-MEMORIA.md) (§5.5). Escrito el 2026-10-11, tras cerrar la
> fase 4 ([feature-31.md](feature-31.md)). Normativa de partida: K-MEM.9 a K-MEM.13 de
> [research/verificacion-memoria.md](research/verificacion-memoria.md), y el cotejo de plantillas
> de esta fase (K-MEM.17).

## Lo que hay hoy

- La memoria no tiene habitabilidad: ni iluminación y ventilación por estancia ni densidad.
- `ViviendaTipo` solo sabe dormitorios, baños, aseos y superficie útil. No hay estancias.
- La fracción de hueco depende del municipio (y de la comunidad, en vivienda protegida): la app
  no puede suponerla. Tras la fase 0 no hay ninguna norma andaluza para la vivienda libre, y las
  de Málaga y Benalmádena siguen sin leer.

## Objetivo

Un apartado **4.2 Habitabilidad** en «Cumplimiento de otros reglamentos», con la norma que
declara el proyectista citada en cada fila: iluminación y ventilación por estancia, superficie
mínima si la norma la fija y densidad de viviendas, con el estado actual y el resultante en obra
existente. Sin norma declarada, el apartado no se inventa: sale como pendiente.

## Principios

- **La norma es un dato de la obra.** Se declara en Los datos de la obra (una o dos: municipal y
  autonómica). Cada una es un conjunto de parámetros con su referencia, obligatoria.
- **Plantillas, nunca valores por defecto.** La app solo trae normas cotejadas en su boletín.
  Lo que el proyectista define se guarda en «Mis normas» (en el navegador, como los datos del
  estudio), ligado a su municipio, exportable en JSON.
- **Una norma de otro municipio avisa.** La Ordenanza de Málaga en Benalmádena (error de un
  ejemplo del estudio) no pasa sin aviso.
- **Sin dato, no cumple.** Una estancia sin hueco o una vivienda sin estancias no se da por buena:
  sale en «Antes de entregar» con lo que falta.
- **La tabla es la de las memorias del estudio**: «Estancia | Su | Norma | Proyecto | Cumple».

## Pasos

### Paso 1 · La norma y Mis normas

- `src/lib/habitabilidad/norma.ts`: `NormaHabitabilidad` (referencia, ámbito, iluminación con su
  fracción y lo que se mide —hueco o superficie acristalada—, ventilación con la suya —superficie
  practicable u hueco— o «conjunta», estancias que computan, superficie mínima por tipo de
  estancia y densidad: m² por vivienda, superficie construida o útil, redondeo). Lectura
  defensiva, como `parseEstudio`.
- Plantillas verificadas (solo las que el cotejo de K-MEM.17 dé por buenas).
- «Mis normas»: `leerMisNormas` / `guardarMisNormas` y su hook, como `useEstudio`. Exportar e
  importar en JSON.
- `DatosGenerales.habitabilidad?: { normas: NormaHabitabilidad[] }`.
- Los datos de la obra: bloque «Habitabilidad» para declarar la norma (de una plantilla, de Mis
  normas o nueva), editarla y guardarla en Mis normas.

### Paso 2 · El módulo

- `src/modules/hab`, con la pantalla común (`PantallaSi`) y la clave `hab` en el registro.
- Estado del módulo: las estancias de cada vivienda (por vivienda tipo; en la unifamiliar, la
  vivienda), con nombre, tipo, superficie útil, hueco, superficie acristalada y practicable; y la
  superficie residencial para la densidad, si se declara.
- Justificación: por norma y estancia que computa, iluminación (Su·f ≤ hueco), ventilación y
  superficie mínima; por norma con densidad, viviendas ≤ máximo. En obra existente, la densidad
  con el estado actual (`edificioAntes`) y el resultante.
- Aplicabilidad: sin viviendas, no aplica. En obra existente, a las viviendas que se crean
  (cambio de uso, ampliación) o cuya distribución o huecos se modifican; si no, no aplica.

### Paso 3 · Memoria y ficha

- Sección `4.2 Habitabilidad` en el documento. Un párrafo que cita la norma tal como la declaró el
  proyectista, una tabla por vivienda tipo y norma, y la de densidad.
- Ficha del anejo con los parámetros de la norma marcados «dato del proyectista».

### Paso 4 · Caso de reforma y cierre

- El caso «Reforma: local a vivienda» con una norma declarada (en el test): la vivienda nueva
  justificada y la densidad antes y después.
- Foto del expediente: cambia por la fila nueva `hab` y la huella de la memoria.
- Decisiones a validar, al final de este documento.

## Hecho (2026-10-11)

- **Paso 1.** `src/lib/habitabilidad/norma.ts` (norma, lectura defensiva, plantillas, Mis normas,
  `leerFraccion`, `viviendasMaximas`) y `useMisNormas`. `DatosGenerales.habitabilidad`. En Los
  datos de la obra, el bloque «Habitabilidad» ([SeccionHabitabilidad.tsx](src/components/proyecto/SeccionHabitabilidad.tsx)):
  declarar una o dos normas (de una plantilla, de Mis normas o nueva), editarlas, guardarlas en
  Mis normas ligadas al municipio, y exportar o importar Mis normas en JSON.
- **Plantillas** (K-MEM.17, cotejadas en la imagen del boletín):
  - Orden de 21-07-2008, vivienda protegida en Andalucía (BOJA 35/2020): iluminación 10 % del
    hueco, ventilación 5 % practicable; cocina 7 m² y dormitorios 8 m²; solo en obras de Andalucía.
  - Orden de 29-02-1944 (BOE 61/1944), supletoria: **1/6** de hueco, iluminación y ventilación
    conjuntas; mínimos de la condición 6.ª. **Corrige el «1/8»** de las fuentes secundarias.
  - Ni Málaga ni Benalmádena: su texto no se ha leído en el boletín.
- **Paso 2.** Módulo `src/modules/hab` con la pantalla común, ruta `habitabilidad`, clave `hab`,
  grupo «Habitabilidad». Las estancias se editan en la pantalla (dos líneas por estancia), con
  «Proponer desde el tipo». Aplicabilidad: sin viviendas, no aplica; en obra existente, regla
  propia (cambio de uso a vivienda, ampliación, reforma de distribución o huecos).
- **Paso 3.** Memoria `4.2. Habitabilidad`: la norma citada, una tabla por vivienda tipo y norma,
  y la de densidad (estado actual y reformado en obra existente). Ficha del anejo con los
  parámetros marcados «Dato del proyectista».
- **Paso 4.** Tests del módulo con el caso de reforma ([hab.test.ts](src/modules/hab/test/hab.test.ts)).
  La foto del expediente solo cambia por la fila `hab` y la huella de la memoria.
- El Demo lleva una **norma de demostración** (1/10, conjunta, rotulada «sustituir por la del
  municipio») y estancias de sus tipos A y B, como su estudio geotécnico de demostración.

## Decisiones a validar

1. **Las estancias viven en el módulo, no en `ViviendaTipo`** (el plan decía El edificio). Así no
   se toca el modelo del edificio ni su pantalla; la coherencia se avisa (dormitorios distintos
   del tipo, estancias que suman más que la vivienda). Leerlas del cuadro de superficies con IA
   queda para después.
2. **Sin norma, «no cumple»**: sale en rojo en La obra y en «Antes de entregar» («Declara la norma
   de habitabilidad del municipio») y la memoria la deja pendiente. Todos los proyectos sin norma
   pasan a tener este pendiente.
3. **Sin dato no cumple**: una estancia sin superficie o sin hueco, o una vivienda sin estancias,
   no se da por buena.
4. **Habitabilidad va en el capítulo 4** («Cumplimiento de otros reglamentos»), como 4.2, sin
   subapartados.
5. **Regla en obra existente (criterio)**: se justifica en las viviendas que resultan del cambio
   de uso o de la ampliación y en las que cambian su distribución o sus huecos; si no, no aplica.
   Con varios tipos de obra, las notas se suman («Además, …»), como en el resto.
6. **Densidad**: la superficie es la de las zonas de vivienda de El edificio (construida, o útil
   donde falta: del lado de la seguridad), con aviso para confirmarla; el proyectista puede
   declarar otra (y la de antes de la obra). Las viviendas son las del edificio entero.
7. **La plantilla de VPO se ofrece en cualquier obra de Andalucía**, rotulada «Solo vivienda
   protegida» y con la advertencia del art. 2 (cede ante el PGOU). No hay casilla «vivienda
   protegida» en el proyecto.
8. **La Orden de 1944 como plantilla** aunque su vigencia no esté confirmada en fuente oficial:
   el literal sí está cotejado y lo advierte. Computan estar, comedor, cocina y dormitorios
   (interpretación de «pieza habitable»); del dormitorio se comprueba el mínimo de una cama.
9. **Norma de demostración en el Demo**, para que siga enseñando un expediente completo.
10. **Una norma de Mis normas se liga al municipio de la obra** al guardarla (si es municipal), y
    avisa si se usa en otro municipio.

## Pendiente

- Leer el art. 136 de Benalmádena en el BOP de Málaga núm. 167 de 31-08-2022 (edicto 3218/2022):
  el PDF devuelve 403. Con él, plantilla y aviso en «local a vivienda».
- Cotejar los arts. 12.2.34, 12.2.35 y 12.2.37 de Málaga en el BOJA 170/2011 (el texto refundido
  municipal de 2018 dice 1/10 conjunto y densidad S/70 con redondeo al más próximo).
- Abrir el Word de la memoria en Word con la tabla de habitabilidad.
