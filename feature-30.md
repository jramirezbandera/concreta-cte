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
