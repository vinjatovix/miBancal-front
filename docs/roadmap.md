# Roadmap: Catálogo fiel al contrato y con el diseño Botanical Precision

## Objetivo final (reformulado)

Que el catálogo público que ya existe (listado y ficha de plantas, listado y ficha de familias)
funcione exactamente según `contracts/openapi.yaml`, muestre todos sus datos correctamente en
castellano y tenga la identidad visual de `docs/design.md`. Todo ello verificado por los quality
gates que exige la constitución.

Se considera cumplido cuando:

1. Ninguna petición del front viola el contrato: claves de orden, operadores, límites,
   `fields`/`include` y forma de las respuestas. Lo demuestran los tests de servicio (URL exacta)
   y las fixtures validadas contra el OpenAPI en CI.
2. La ficha de planta muestra bien todos los campos que el contrato devuelve y no se rompe cuando
   faltan los opcionales. No aparece ninguna clave i18n cruda ni ningún UUID donde debería haber
   un nombre.
3. La UI usa solo tokens de color, tipografía y espaciado de `docs/design.md`, iconos Material
   Symbols (cero emojis) y la distribución por breakpoints definida allí.
4. Todos los gates de CI de la constitución que dependen del código están activos y en verde.

**Fuera de alcance**: autenticación y sesión, CRUD de admin, bancales, enciclopedias y feature
flags, selección de varios meses de siembra, Lighthouse post-deploy, protección de ramas en
GitHub y destino de observabilidad en producción.

**Mapa de dependencias** (el resto de iteraciones son independientes entre sí):

- 5 → 4 · 7 → 4, 5
- 12 → 10 · 13 → 10 · 14 → 4, 10 · 15 → 6, 10
- Se recomienda cerrar 1 y 2 antes que las demás, para que ya se verifiquen con los gates.

## Estado a 2026-10-16

Revisado contra el código real y el historial (última revisión de 2026-10-10 solo cubría hasta la
spec 008; desde entonces se han trabajado las specs 009–014). Los prompts de cada iteración
describen el problema de partida y no se reescriben.

> Aviso: los checkboxes de `specs/*/tasks.md` no siempre reflejan el código. En particular, la spec
> 002 figura casi completa en su `tasks.md`, pero el DoD **no** está implementado (ver It. 2). El
> estado de esta tabla prevalece sobre esos checkboxes.

| It. | Título                                     | Estado               | Evidencia / pendiente                                                                                                                                                                                                     |
| --- | ------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Gates de tipado y lint                     | Parcial              | `strict` y lint con `--max-warnings=0` hechos; regla custom `local/no-hardcoded-ui-text` activa. Faltan `complexity`, `max-lines`, `no-console` y restricciones de imports entre capas (spec 001: 24/42)                  |
| 2   | Gates de tests, build y dependencias       | Pendiente            | `vite.config.ts` sin `thresholds` de cobertura, no existe `.env.example`, no hay `npm audit` ni gate de bundle en `ci.yml`. (Los checkboxes de spec 002 están adelantados respecto al código)                             |
| 3   | Listado de plantas que respeta el contrato | Hecha (salvo umbral) | Orden y límite corregidos. Falta el umbral del 95 % en `services/` (depende de la 2)                                                                                                                                      |
| 4   | Ficha de planta fiel al modelo             | Parcial              | Tipos y estaciones hechos. Las fixtures no se validan contra el schema en CI                                                                                                                                              |
| 5   | Nombre de la familia en las plantas        | Hecha                | Commit `a8c6866`                                                                                                                                                                                                          |
| 6   | Familias robustas                          | Hecha                | Commit `e1f528a`. Riesgo de una sola página de 100 familias resuelto en la spec 008                                                                                                                                       |
| 7   | Peticiones ligeras en los listados         | Hecha                | Spec 007. Familia −94,5 %, listado −82,6 % ([medición](../specs/007-lightweight-list-requests/measurements.md)). Spec 008. Listado de familias −95,7 % ([medición](../specs/008-lightweight-family-list/measurements.md)) |
| 8   | Errores, rutas inválidas y vacíos          | Hecha                | Spec 010 (69/1). `appErrorScreen`, `routeErrorFallback`, error boundary por sección/página/app y pantallas _no encontrado_                                                                                                |
| 9   | Toda la interfaz en castellano             | Hecha                | Spec 011 (36/1). Meses en castellano desde el diccionario y regla de lint `no-hardcoded-ui-text` (incl. texto en expresiones y atributos)                                                                                 |
| 10  | Tokens de diseño                           | Hecha                | Spec 009 (61/1). Newsreader y Manrope vía `@fontsource` en `src/styles/fonts.css`, `src/styles/tokens.css` y gate `check:colors`                                                                                          |
| 11  | Iconos en lugar de emojis                  | Hecha                | Spec 012 (71/0). **0 emojis** en `src/`, componente `Icon` y gate `check:emoji`                                                                                                                                           |
| 12  | Estructura de la aplicación                | Parcial              | `MainLayout` tiene barra superior con marca y navegación (Plantas/Familias). Falta verificar márgenes por breakpoint, sección activa resaltada y sin scroll a 320 px                                                      |
| 13  | Catálogo de plantas con el nuevo diseño    | Parcial              | Spec 013 (filtros/orden, cabecera de catálogo, chips aplicados, modos cuadrícula/lista). Falta verificar el DoD de grid responsive y tarjetas (imagen 4:3 diferida)                                                       |
| 14  | Ficha de planta con el nuevo diseño        | Parcial              | Existen `PlantHero` y secciones (`QuickFacts`, `PlantCultivation`, `PlantEcology`, `PlantNotes`, `PlantResources`, `PlantCalendar`…). Sin spec dedicada ni DoD verificado                                                 |
| 15  | Familias con el nuevo diseño               | Parcial              | Existen `FamilyHero`, `FamilyInfo`, `FamilyPlants`. Sin spec dedicada ni DoD verificado                                                                                                                                   |
| 16  | Accesibilidad base                         | Parcial              | El `Drawer` cierra con Escape y tiene botón con `aria-label`. Faltan `role="dialog"`/`aria-modal`/focus trap, pestañas de recursos con flechas y reglas `jsx-a11y` en CI                                                  |
| 17  | Pantallas de acceso y menú MiBancal        | Hecha                | Spec 016 (55/55). Renombrado a MiBancal, cabecera unificada con menú accesible `NavDrawer`, sesión JWT en `sessionStorage`/memoria, login, registro, activación de cuenta, Google SSO y preview SSO tras flag.            |
| 18  | Lenguaje claro en los textos               | Pendiente            | Descartada de la spec 039                                                                                                                                                                                                 |
| 19  | Regresión visual por captura               | Pendiente            | Descartada de la spec 039. Depende de que la 039 esté cerrada                                                                                                                                                             |
| 20  | Fotografías adaptadas al tema oscuro       | Pendiente            | Descartada de la spec 039                                                                                                                                                                                                 |
| 21  | Estructura de títulos y regiones de página | Pendiente            | Descartada de la spec 039. Complementa la 16                                                                                                                                                                              |

Specs de trabajo en `specs/`: 001 (It. 1), 002 (It. 2), 003 (It. 3), 004 (edición de comestibles y
tóxicas, y estaciones; no estaba en el DoD original), 005 (It. 5), 006 (It. 6), 007 y 008 (It. 7),
009 (It. 10), 010 (It. 8), 011 (It. 9), 012 (It. 11), 013 (It. 13), 014 (corrección de scroll del
catálogo) y 016 (pantallas de acceso y barra de navegación MiBancal).

## Iteración 1: Gates de tipado y lint

- **Estado (2026-10-10)**: parcial. Hecho: `typecheck` sobre `src/` con `strict` y lint con
  `--max-warnings=0`. Pendiente: regla `complexity` ≤ 10 con sus excepciones, `max-lines` de 250,
  `no-console` fuera de observabilidad y restricciones de capas. Ninguna de estas reglas está en
  `eslint.config.js` ni en `.eslint/`.
- **Valor entregado**: el CI pasa a comprobar de verdad los tipos (hoy el script `typecheck` no
  comprueba ningún archivo) y deja de admitir warnings, violaciones de capas o complejidad nueva.
- **Definition of Done**:
  - `typecheck` comprueba `src/` y `strict` está activo.
  - ESLint pasa con `--max-warnings=0` e incluye `complexity` ≤ 10 (con las 4 funciones
    conocidas como excepciones documentadas), `max-lines`, `no-console` y las restricciones de
    imports entre capas.
  - Las 3 importaciones que hoy violan las capas están corregidas.
  - CI en verde y sin cambios visibles para el usuario.
- **Dependencias**: ninguna.
- **Riesgos**:
  - `strict` puede destapar errores que hoy no se ven, porque el typecheck no compila nada.
  - Las excepciones de complejidad no deben convertirse en permanentes.
- **Prompt para /speckit.specify**:
  ```
  Queremos que la integración continua de agro-front verifique de verdad la calidad estática del
  código, tal como exige la constitución del proyecto. Hoy el paso de typecheck no comprueba
  ningún archivo, TypeScript no está en modo estricto, el lint admite warnings y nada impide que
  aparezcan funciones demasiado complejas, archivos enormes, console.* sueltos o importaciones que
  rompen el sentido de las capas (páginas → componentes → shared; hooks → servicios). Por qué: sin
  estas comprobaciones automáticas, cualquier cambio posterior puede degradar el código sin que
  nadie lo note. Resultado esperado: un PR falla si introduce errores de tipos en modo estricto,
  cualquier warning de lint, una función con complejidad ciclomática mayor que 10, un archivo de
  más de 250 líneas útiles (salvo el diccionario de traducciones), console.* fuera del módulo de
  observabilidad o una importación entre capas no permitida. Las cuatro funciones que hoy superan
  la complejidad quedan registradas como excepciones explícitas y temporales. Las importaciones
  que hoy violan las capas se corrigen. El comportamiento de la aplicación no cambia.
  ```

## Iteración 2: Gates de tests, build y dependencias

- **Estado (2026-10-10)**: pendiente. Hecho: la suite corre con `test:coverage`. Pendiente:
  umbrales en `vite.config.ts` (hoy no hay ninguno), gate de JS y CSS, `npm audit` en CI, y
  `.env.example` (no existe; la única `VITE_*` usada es `VITE_API_URL`). No hay `.only` ni `.skip`,
  pero nada lo impide.

- **Valor entregado**: la cobertura, el tamaño del bundle, las vulnerabilidades y las variables
  de entorno quedan vigiladas en cada PR, con los umbrales de la constitución.
- **Definition of Done**:
  - La cobertura se mide sobre todo `src/` y falla por debajo de 85/85/85/80 (líneas,
    statements, funciones, ramas).
  - Los directorios de lógica que ya cumplen ≥ 95 % tienen ese umbral activo.
  - CI falla si el JS inicial supera 150 KB gzip o el CSS 20 KB, si `npm audit` encuentra algo
    de severidad alta, si una variable `VITE_*` usada no está en `.env.example`, o si hay
    `.only`, o `.skip` sin incidencia.
  - Existe `.env.example`.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**:
  - `npm audit` puede fallar hoy por dependencias transitivas.
  - `services/` (77 %) no cumple todavía el 95 %, así que su umbral no se activa en esta
    iteración.
- **Prompt para /speckit.specify**:
  ```
  Queremos que cada PR de agro-front se rechace automáticamente si empeora la red de seguridad
  del proyecto. Hoy la cobertura solo cuenta los archivos que algún test importa y no tiene mínimo,
  el tamaño del bundle no se vigila, no se auditan vulnerabilidades, no existe un .env.example que
  documente las variables públicas y nada impide subir tests marcados con .only o .skip. Por qué:
  la constitución fija estos umbrales y, mientras no se comprueben en CI, solo son buenas
  intenciones. Resultado esperado: la cobertura se mide sobre todo el código fuente y bloquea el
  PR por debajo de 85 % en líneas, statements y funciones o de 80 % en ramas; los directorios de
  lógica que ya alcanzan el 95 % de líneas quedan protegidos con ese umbral; el PR falla si el
  JavaScript inicial supera 150 KB gzip o el CSS 20 KB gzip, si hay vulnerabilidades de severidad
  alta en dependencias de producción, si se usa una variable VITE_* que no figura en .env.example,
  o si hay tests con .only, o con .skip sin referencia a una incidencia. Hoy todo esto debe quedar
  en verde.
  ```

## Iteración 3: Listado de plantas que respeta el contrato

- **Estado (2026-10-10)**: hecha salvo el umbral del 95 % en `services/`, que depende de la 2. Hecho:
  orden por `sort[name]` y `sort[scientificName]`, límite máximo de 100 (`PAGINATION_LIMIT_MAX`) y
  tests de contrato en `tests/contract/`. Quedan abiertas tareas de `specs/002` (T013a, T033, T057).

- **Valor entregado**: el listado de plantas deja de pedir un orden que el contrato rechaza con
  400 y permite ordenar por nombre común o científico.
- **Definition of Done**:
  - Las peticiones usan solo `sort[name]` o `sort[scientificName]`, y `pagination[limit]` ≤ 100
    aunque la URL diga otra cosa.
  - Cada función del servicio de plantas tiene un test que comprueba la URL exacta.
  - El servicio queda en complejidad ≤ 10 y sale de la lista de excepciones.
  - El umbral de cobertura del 95 % en `services/` queda activo.
  - CI en verde.
- **Dependencias**: ninguna (se recomienda tras la 1 y la 2).
- **Riesgos**: si el back de dev todavía acepta la clave antigua, el error no se ve en dev. La
  verificación se hace contra el contrato, no contra el entorno.
- **Prompt para /speckit.specify**:
  ```
  El listado público de plantas de agro-front pide a la API un criterio de orden que el contrato
  vigente (contracts/openapi.yaml) no declara, y el contrato responde 400 a cualquier clave de
  orden desconocida. Además, el número de resultados por página se toma de la URL sin límite,
  aunque el contrato admite 100 como máximo. Por qué: el contrato es la fuente de verdad y el
  catálogo es la funcionalidad principal; si el listado falla, la aplicación no sirve. Resultado
  esperado: el usuario puede ordenar las plantas por nombre común o por nombre científico, en
  orden ascendente o descendente; cualquier valor de la URL fuera de lo que admite el contrato se
  corrige a un valor válido en lugar de provocar un error; y queda demostrado con tests que cada
  petición del listado coincide exactamente con lo que declara el contrato (ruta, filtros,
  paginación y orden).
  ```

## Iteración 4: Ficha de planta fiel al modelo del contrato

- **Estado (2026-10-10)**: parcial. Hecho: tipos de `Plant` con `seasons[]`, `pollination` y campos
  opcionales (`src/types/Plants/Plant.ts`), estaciones de poda y propagación (`7dacb1f`) y las
  claves `family_unavailable` y `not_found`. Además se hizo la spec 004 (comestibles, tóxicas,
  filtros y marcas), que no estaba en el DoD original. Pendiente: las fixtures de `tests/fixtures/`
  no se validan contra el schema (`validateSchema` solo se usa en `tests/contract/`), así que CI no
  lo comprueba. Sin verificar: el render con solo campos obligatorios, y la prueba manual de la
  spec 004 (T062).

- **Valor entregado**: la ficha muestra bien las estaciones de poda y propagación y no se rompe
  cuando faltan datos opcionales. Las fixtures pasan a validarse contra el contrato.
- **Definition of Done**:
  - Los tipos de planta reflejan el schema `Plant` (opcionalidad, `seasons[]`,
    `pollination.types[]`, `status` sin `INACTIVE`, fechas como string, texto libre donde no hay
    `enum`).
  - Las fixtures cumplen el schema y CI lo valida.
  - Una planta con solo los campos obligatorios se renderiza sin errores.
  - Ninguna clave i18n cruda aparece en pantalla.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**:
  - Es la iteración más ancha porque toca tipos usados en todo el catálogo.
  - Puede haber datos reales en dev con claves que el diccionario aún no tiene.
- **Prompt para /speckit.specify**:
  ```
  La ficha de planta de agro-front se construye sobre un modelo de datos que ya no coincide con
  el contrato de la API (contracts/openapi.yaml): las estaciones de poda y de propagación llegan
  como listas y el front espera un único valor, la polinización tiene otra forma, hay campos que
  el contrato marca como opcionales y el front da por presentes, y campos de texto libre que el
  front trata como listas cerradas. Consecuencias: en la ficha aparecen claves de traducción sin
  traducir y una planta sin ciertos datos opcionales puede romper la pantalla. Además, los datos
  de prueba de los tests siguen la forma antigua, así que los tests no detectan nada de esto. Por
  qué: el contrato es la fuente de verdad y el usuario debe ver información correcta y completa.
  Resultado esperado: la ficha muestra todas las estaciones de cada método de poda y propagación,
  sigue funcionando con una planta que solo tenga los campos obligatorios, nunca enseña una clave
  de traducción (si llega un valor sin traducir se muestra el valor recibido) y los datos de
  prueba se validan automáticamente contra el contrato para que cualquier divergencia futura haga
  fallar el CI.
  ```

## Iteración 5: Nombre de la familia en las plantas

- **Estado (2026-10-10)**: hecha (`a8c6866`). La ficha muestra el nombre de la familia con enlace por
  slug y, si no se resuelve, «Familia no disponible» sin enlace.

- **Valor entregado**: la ficha de planta muestra el nombre de su familia, que hoy aparece como
  un UUID, y enlaza a su ficha.
- **Definition of Done**:
  - La ficha pide la familia embebida tal como permite el contrato y muestra su nombre.
  - Si la familia no se encuentra, la pantalla se degrada sin romperse: no muestra un UUID ni un
    enlace roto.
  - Existe un test para cada uno de los dos casos.
  - CI en verde.
- **Dependencias**: 4 (forma de `identity.family`).
- **Riesgos**: con la familia embebida, la respuesta no trae `ETag`. Hoy es irrelevante porque el
  catálogo es de solo lectura.
- **Prompt para /speckit.specify**:
  ```
  En la ficha de planta de agro-front, la familia botánica aparece como un identificador interno
  ilegible en lugar de su nombre, porque el front no aprovecha que la API puede devolver un
  resumen de la familia (identificador, nombre y slug) junto con la planta. Por qué: el usuario
  necesita saber a qué familia pertenece una planta y poder navegar a ella; un UUID no le dice
  nada. Resultado esperado: la ficha de planta muestra el nombre de la familia y enlaza a su
  ficha; si la API no encuentra la familia y solo devuelve el identificador, la pantalla lo
  gestiona sin mostrar el identificador en crudo ni un enlace que lleve a un error. Todo conforme
  a lo que declara contracts/openapi.yaml.
  ```

## Iteración 6: Familias robustas

- **Estado (2026-10-10)**: hecha (`e1f528a`). La ficha resuelve la familia por id o slug y pide sus
  plantas con el id real. Muestra «Mostrando X de Y plantas» o «Y plantas en total» con enlace al
  listado filtrado. El selector muestra nombres ordenados. Riesgo resuelto en la spec 008: `getFamilyList`
  pide todas las páginas de 100 familias hasta `totalPages`.

- **Valor entregado**: las fichas de familia funcionan tanto por id como por slug, y el selector
  de familias muestra nombres legibles en lugar de slugs.
- **Definition of Done**:
  - Abrir `/families/<slug>` muestra la familia y sus plantas, filtrando por el id real.
  - La ficha indica cuántas plantas tiene la familia y enlaza al listado filtrado.
  - El selector de familia del listado de plantas muestra nombres ordenados.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**: resuelto en la spec 008 (`getFamilyList` pide todas las páginas).
- **Prompt para /speckit.specify**:
  ```
  Las pantallas de familias de agro-front tienen comportamientos incorrectos frente al contrato
  de la API (contracts/openapi.yaml). Si se entra en la ficha de una familia por su slug, la lista
  de sus plantas falla, porque la API exige el identificador real para filtrar plantas por
  familia. La ficha solo enseña las primeras plantas sin indicar que hay más. Y el selector de
  familia del listado de plantas muestra slugs técnicos en lugar de nombres. Por qué: las familias
  son la segunda vía de navegación del catálogo y deben funcionar con cualquier enlace válido.
  Resultado esperado: la ficha de familia funciona igual por identificador que por slug, muestra
  sus plantas e indica cuántas hay en total con un acceso al listado filtrado por esa familia, y
  el selector de familias muestra los nombres en castellano, ordenados alfabéticamente.
  ```

## Iteración 7: Peticiones ligeras en los listados

- **Estado (2026-10-10)**: hecha (spec 007). El listado pide
  `fields[plants]=identity,traits,image,status` y la ficha de familia
  `fields[plants]=identity,status`. Medición en
  [measurements.md](../specs/007-lightweight-list-requests/measurements.md), hecha contra el back
  local porque no hay URL de dev documentada: la familia baja un 94,5 % y el listado un 82,6 %.
  El riesgo de `knowledge` se resolvió con el campo `image` del contrato (2026-10-10).
  Spec 008 (2026-10-11): el listado de familias que comparten el selector de `/plants` y
  `/families` pide `fields[families]=name,scientificName` y baja un 95,7 % (161 336 B → 6 887 B;
  [measurements.md](../specs/008-lightweight-family-list/measurements.md)).
- **Valor entregado**: los listados descargan solo los campos que pintan, en lugar de la planta
  completa, lo que reduce de forma apreciable el tamaño de las respuestas.
- **Definition of Done**:
  - El listado de plantas y las plantas de una familia piden solo los campos que muestran,
    usando `fields` del contrato.
  - Los tests de servicio comprueban esos parámetros.
  - Existe una comparación documentada del tamaño de la respuesta antes y después en dev.
  - CI en verde.
- **Dependencias**: 4 (tipos de respuesta parcial) y 5 (`include` solo funciona si se pide
  `identity`).
- **Riesgos**: si la tarjeta necesita un campo anidado (la imagen está en `knowledge.resources`),
  hay que pedir `knowledge` completo y el ahorro es menor.
- **Prompt para /speckit.specify**:
  ```
  Los listados del catálogo de agro-front (plantas y plantas de una familia) descargan cada
  planta completa, con todo su bloque de conocimiento agronómico, aunque solo pintan el nombre, el
  nombre científico, los alias y la imagen. El contrato (contracts/openapi.yaml) permite pedir
  solo determinados campos de cada recurso. Por qué: la constitución obliga a que los listados
  pidan únicamente lo que muestran, y el público objetivo navega a menudo desde el móvil con
  conexiones limitadas. Resultado esperado: los listados piden únicamente los campos que
  necesitan, muestran exactamente lo mismo que antes y queda medida la reducción del tamaño de las
  respuestas.
  ```

## Iteración 8: Errores, rutas inválidas y estados vacíos

- **Valor entregado**: ningún fallo de la API ni ninguna URL inválida deja al usuario ante una
  pantalla en blanco o una lista vacía engañosa.
- **Definition of Done**:
  - Cada ruta tiene una pantalla de error y existe una página de "no encontrado".
  - El listado de familias muestra un error si la API falla.
  - Los listados sin resultados muestran un mensaje propio.
  - Una planta o familia inexistente muestra "no encontrado".
  - Ningún render lanza excepciones.
  - Tests de cada estado. CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**: el destino de los errores en producción sigue sin definir; esta iteración los
  canaliza por un único punto, pero no los envía a ningún sitio.
- **Prompt para /speckit.specify**:
  ```
  Hoy, en agro-front, algunos fallos dejan al usuario sin explicación: si la API falla al cargar
  las familias se muestra una lista vacía como si no hubiera datos, una URL con un identificador
  inexistente o una excepción al pintar tumba la aplicación entera, no existe una página de "no
  encontrado" y los listados sin resultados no dicen nada. Por qué: la constitución exige que toda
  vista con datos asíncronos tenga estados de carga, error y vacío, y que ningún dato o parámetro
  inválido provoque una excepción en pantalla. Resultado esperado: cualquier error de la API se
  explica al usuario en castellano; una planta o familia inexistente, o una ruta desconocida,
  lleva a una pantalla de "no encontrado" con forma de volver; los listados vacíos muestran un
  mensaje claro (por ejemplo, que ningún resultado coincide con los filtros); y un error
  inesperado al pintar queda contenido en su sección sin tirar la aplicación. Los errores
  inesperados se registran a través de un único punto de observabilidad.
  ```

## Iteración 9: Toda la interfaz en castellano

- **Valor entregado**: desaparecen los textos en inglés y las traducciones duplicadas o
  incoherentes; todo texto visible sale del diccionario.
- **Definition of Done**:
  - Los meses aparecen en castellano.
  - No quedan literales de UI fuera del diccionario, tampoco en `aria-label`, `alt`, `title` ni
    `placeholder`.
  - Las etiquetas duplicadas de los datos rápidos se unifican con el diccionario ("Sol pleno"
    frente a "Pleno sol").
  - La regla de lint cubre también esos atributos.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**: ampliar la regla puede sacar muchos avisos en los tests. Hay que limitarla a
  `src/`.
- **Prompt para /speckit.specify**:
  ```
  agro-front se dirige a todo el público hispanohablante y su interfaz debe estar íntegramente en
  castellano, pero hoy los meses del calendario y de los filtros aparecen en inglés, algunos
  textos de accesibilidad están en inglés, y la sección de datos rápidos de la ficha de planta usa
  sus propias etiquetas, que no coinciden con las de los filtros (por ejemplo, "Pleno sol" frente a
  "Sol pleno"). Además, la comprobación automática de textos sin traducir no mira los atributos
  de accesibilidad ni los textos alternativos. Por qué: la constitución exige que todo texto
  visible pase por el diccionario, para que la terminología sea coherente. Resultado esperado:
  ningún texto de la interfaz ni de sus atributos de accesibilidad aparece en otro idioma, cada
  concepto se nombra igual en todas las pantallas y el CI detecta cualquier texto visible o
  atributo accesible escrito fuera del diccionario.
  ```

## Iteración 10: Tokens de diseño

- **Valor entregado**: toda la aplicación adopta la paleta, la tipografía y el espaciado de
  `docs/design.md` sin cambiar la distribución de las pantallas.
- **Definition of Done**:
  - Todos los colores, fuentes, radios, sombras y espaciados salen de tokens definidos una sola
    vez.
  - No queda ningún literal de color fuera del archivo de tokens, y CI lo comprueba.
  - Newsreader y Manrope se cargan y se aplican según los estilos de `docs/design.md`.
  - El CSS inicial sigue por debajo de 20 KB gzip.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**:
  - Cargar las fuentes puede afectar al LCP y producir saltos de layout si no se gestiona.
  - Hay contraste que revisar en combinaciones no emparejadas.
- **Prompt para /speckit.specify**:
  ```
  La interfaz de agro-front usa grises sueltos, la fuente del sistema y valores de color escritos
  a mano en cada hoja de estilos, sin relación con la identidad visual definida en
  docs/design.md (paleta Material 3 "Botanical Precision", Newsreader para titulares y nombres
  científicos, Manrope para la interfaz, radios, espaciado en múltiplos de 8 px y sombras
  tintadas). Por qué: una identidad coherente da al catálogo la credibilidad de una referencia
  botánica, y centralizar los valores evita que cada pantalla se desvíe. Resultado esperado: todas
  las pantallas existentes usan exclusivamente la paleta, las tipografías, los radios, las sombras
  y el espaciado de docs/design.md, definidos una única vez; los nombres científicos se ven en
  cursiva con su estilo propio; ningún color queda escrito fuera de esa definición y el CI lo
  impide; la distribución de las pantallas no cambia y la carga de las fuentes no provoca saltos
  visibles del contenido.
  ```

## Iteración 11: Iconos en lugar de emojis

- **Valor entregado**: los emojis desaparecen de la interfaz y en su lugar hay iconos Material
  Symbols coherentes y accesibles.
- **Definition of Done**:
  - Todos los iconos se pintan con un único componente de icono.
  - No queda ningún emoji en `src/`, y CI lo comprueba.
  - Los iconos decorativos se ocultan a lectores de pantalla y los que tienen significado llevan
    nombre accesible.
  - Los identificadores de test ya no dependen de emojis.
  - El JS inicial sigue por debajo de 150 KB gzip.
  - CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**:
  - Elegir el paquete de iconos (SVG empaquetado) afecta al tamaño del bundle.
  - Algunos conceptos pueden no tener un icono equivalente obvio.
- **Prompt para /speckit.specify**:
  ```
  agro-front usa emojis como iconos en toda la interfaz (navegación, secciones de la ficha,
  filtros, insignias, errores), lo que da un aspecto poco profesional, se ve distinto en cada
  sistema operativo y no es accesible. La decisión de diseño (docs/design.md) es usar iconos
  Material Symbols Outlined. Por qué: el catálogo aspira a una estética de referencia botánica y
  los iconos deben verse igual en todos los dispositivos y ser comprensibles para lectores de
  pantalla. Resultado esperado: cada icono actual se sustituye por su equivalente de Material
  Symbols; no queda ningún emoji en la interfaz y el CI impide reintroducirlos; los iconos
  puramente decorativos no se anuncian a lectores de pantalla y los que transmiten significado
  tienen un nombre accesible en castellano; y el peso de la aplicación se mantiene dentro de su
  presupuesto.
  ```

## Iteración 12: Estructura de la aplicación

- **Valor entregado**: la aplicación tiene la barra superior, la navegación y los márgenes de
  `docs/design.md` en todos los tamaños de pantalla.
- **Definition of Done**:
  - Barra superior fija de 64 px con marca y navegación, con la sección activa resaltada.
  - Contenido con los márgenes y gutters de cada breakpoint (< 768, 768–1199, ≥ 1200).
  - Sin scroll horizontal a 320 px.
  - Tests de la navegación activa. CI en verde.
- **Dependencias**: 10 (tokens).
- **Riesgos**: una barra fija puede tapar los anclajes y la cabecera sticky de la ficha de
  planta; hay que comprobarlo.
- **Prompt para /speckit.specify**:
  ```
  La estructura general de agro-front (cabecera, navegación y área de contenido) no sigue la
  distribución definida en docs/design.md: no hay una barra superior fija con la marca, la
  navegación no indica en qué sección está el usuario y los márgenes no se adaptan a móvil,
  tablet y escritorio. Por qué: la estructura común es lo primero que percibe el usuario y la base
  sobre la que se apoyan todas las pantallas del catálogo. Resultado esperado: en todas las
  pantallas hay una barra superior fija con la marca y los accesos a Plantas y Familias, con la
  sección activa claramente marcada; el contenido respeta los márgenes de cada tamaño de pantalla
  definidos en docs/design.md; y la aplicación se usa sin desplazamiento horizontal desde 320 px
  de ancho.
  ```

## Iteración 13: Catálogo de plantas con el nuevo diseño

- **Valor entregado**: el listado de plantas adopta la distribución de `docs/design.md`: filtros
  laterales, grid adaptable y tarjetas con imagen y taxonomía.
- **Definition of Done**:
  - En escritorio, la barra lateral de filtros es sticky de 320 px.
  - En tablet y móvil los filtros están en un panel desplegable.
  - El grid es de 3–4, 2–3 o 1 columnas según el breakpoint.
  - Las tarjetas tienen imagen 4:3 con carga diferida y dimensiones reservadas, nombre común y
    nombre científico en cursiva.
  - Los toggles, chips de mes y paginación tienen forma de pill.
  - CI en verde.
- **Dependencias**: 10 (tokens).
- **Riesgos**: cambiar el panel de filtros en móvil afecta a la accesibilidad (foco y Escape).
  Hay que mantener el comportamiento actual.
- **Prompt para /speckit.specify**:
  ```
  El listado de plantas de agro-front no sigue la distribución definida en docs/design.md: los
  filtros, el grid y las tarjetas no se adaptan a los tamaños de pantalla previstos y las tarjetas
  no destacan la imagen ni la taxonomía. Por qué: es la pantalla principal del catálogo y donde el
  usuario pasa más tiempo filtrando y comparando plantas. Resultado esperado: en escritorio los
  filtros quedan en una columna lateral fija mientras se recorre el listado; en tablet y móvil se
  abren desde un acceso visible y se cierran sin perder lo seleccionado; el número de tarjetas por
  fila se adapta a cada tamaño de pantalla; cada tarjeta muestra la imagen con proporción fija sin
  provocar saltos al cargar, el nombre común destacado y el nombre científico diferenciado en
  cursiva; y los controles de filtro, meses y paginación siguen el estilo de docs/design.md. Los
  filtros, el orden y la paginación conservan exactamente su comportamiento actual.
  ```

## Iteración 14: Ficha de planta con el nuevo diseño

- **Valor entregado**: la ficha de planta se lee como una ficha de herbario: cabecera con imagen
  y taxonomía, y secciones jerarquizadas según `docs/design.md`.
- **Definition of Done**:
  - Cabecera con imagen de proporción fija, nombre en Newsreader, nombre científico en cursiva y
    alias.
  - Secciones (calendario, datos rápidos, cultivo, ecología, notas y recursos) con la jerarquía
    tipográfica y las superficies de `docs/design.md`.
  - Calendario de meses legible en móvil.
  - Vídeos con carga diferida.
  - CI en verde.
- **Dependencias**: 4 (modelo de planta) y 10 (tokens).
- **Riesgos**: los vídeos embebidos y las imágenes grandes pueden empeorar el LCP de la ficha.
- **Prompt para /speckit.specify**:
  ```
  La ficha de planta de agro-front presenta mucha información agronómica (calendario de siembra,
  floración y cosecha, datos rápidos, cultivo, poda, propagación, ecología, notas y recursos) con
  una jerarquía visual plana que no sigue docs/design.md, lo que dificulta encontrar un dato
  concreto, sobre todo en el móvil. Por qué: la ficha es la referencia que el usuario consulta
  mientras trabaja en el huerto; debe poder escanearse de un vistazo. Resultado esperado: la ficha
  abre con una cabecera que muestra la imagen con proporción fija, el nombre común destacado, el
  nombre científico en cursiva y los alias; cada sección se distingue claramente con la jerarquía
  tipográfica y las superficies de docs/design.md; el calendario de meses se lee bien desde 320 px;
  y las imágenes y vídeos no retrasan la carga inicial ni provocan saltos del contenido. La
  información mostrada no cambia.
  ```

## Iteración 15: Familias con el nuevo diseño

- **Valor entregado**: el listado y la ficha de familias adoptan la distribución y los estilos de
  `docs/design.md`, en coherencia con el catálogo de plantas.
- **Definition of Done**:
  - El listado de familias es un grid adaptable de tarjetas con nombre común y nombre científico
    en cursiva.
  - La ficha tiene cabecera taxonómica (orden, nombre científico, especies, distribución, alias),
    secciones de descripción y destacados, y el bloque de plantas de la familia, con los tokens y
    breakpoints de `docs/design.md`.
  - CI en verde.
- **Dependencias**: 6 (comportamiento de familias) y 10 (tokens).
- **Riesgos**: bajo. Es la iteración visual más acotada.
- **Prompt para /speckit.specify**:
  ```
  Las pantallas de familias botánicas de agro-front (listado y ficha) no siguen la distribución
  ni los estilos definidos en docs/design.md y desentonan con el resto del catálogo. Por qué: las
  familias son la segunda vía de exploración del catálogo y deben transmitir la misma identidad de
  referencia botánica que las plantas. Resultado esperado: el listado de familias se presenta como
  un grid de tarjetas que se adapta a móvil, tablet y escritorio, cada una con el nombre común y el
  nombre científico diferenciado en cursiva; la ficha de familia presenta de forma jerarquizada su
  taxonomía (orden, nombre científico, número de especies, distribución y alias), su descripción,
  sus rasgos destacados y sus plantas, con los estilos de docs/design.md. La información mostrada
  y la navegación no cambian.
  ```

## Iteración 16: Accesibilidad base

- **Valor entregado**: la aplicación se puede usar con teclado y lector de pantalla, y el CI
  detecta las regresiones de accesibilidad.
- **Definition of Done**:
  - El panel de filtros móvil se comporta como un diálogo: se anuncia como tal, atrapa el foco,
    se cierra con Escape y devuelve el foco al cerrarse.
  - Todos los controles tienen etiqueta accesible.
  - Las pestañas de recursos se manejan con flechas.
  - Las reglas de lint de accesibilidad están activas en CI.
  - Tests con consultas por rol. CI en verde.
- **Dependencias**: ninguna.
- **Riesgos**: activar las reglas de lint de accesibilidad puede destapar bastantes avisos en
  componentes existentes.
- **Prompt para /speckit.specify**:
  ```
  agro-front no es plenamente utilizable con teclado ni con lector de pantalla: el panel de
  filtros en el móvil no se comporta como un diálogo (no retiene el foco ni lo devuelve al
  cerrarse), algunos controles carecen de etiqueta accesible, las pestañas de recursos de la ficha
  de planta no se manejan como pestañas y nada en el CI detecta problemas de accesibilidad. Por
  qué: el catálogo es público y debe poder usarlo cualquier persona; la constitución exige
  diálogos accesibles, controles con nombre accesible y elementos interactivos semánticos.
  Resultado esperado: todo el catálogo se recorre y se usa solo con teclado; el panel de filtros
  móvil se anuncia como diálogo, mantiene el foco dentro mientras está abierto, se cierra con
  Escape y devuelve el foco al control que lo abrió; cada control tiene un nombre accesible en
  castellano; las pestañas de recursos se navegan con las flechas; y el CI falla ante nuevas
  infracciones de accesibilidad detectables estáticamente.
  ```

## Iteración 18: Lenguaje claro en los textos de la app

- **Origen**: descartado del alcance de la spec 039 (sistema de diseño accesible) para no
  mezclar diseño visual con revisión de contenido.
- **Valor entregado**: cualquier persona entiende etiquetas, ayudas, errores y descripciones a la
  primera, incluidas personas con dificultades cognitivas o de lectura.
- **Definition of Done**:
  - Guía de redacción en `docs/` (tono, frases cortas, voz activa, términos del glosario).
  - Los textos de interfaz del diccionario i18n se revisan contra la guía.
  - Los términos técnicos de agronomía se explican la primera vez que aparecen o tienen ayuda.
- **Dependencias**: ninguna (mejor después de la 039, que reescribe los mensajes de error).
- **Prompt para /speckit.specify**:
  ```
  Los textos de agro-front (etiquetas, ayudas, mensajes y descripciones) no siguen una guía de
  redacción y usan términos técnicos de agronomía sin explicarlos. Por qué: WCAG 3.1.5 (AAA) pide
  textos comprensibles sin un nivel de lectura avanzado, y la app la usan personas sin
  formación agronómica. Resultado esperado: una guía de redacción documentada y todos los textos
  del diccionario revisados con ella, con los términos técnicos explicados o con ayuda.
  ```

## Iteración 19: Regresión visual por captura en ambos temas

- **Origen**: descartado del alcance de la spec 039; esta solo vigila tokens y pares de color.
- **Valor entregado**: un cambio de estilos que rompe un componente en claro u oscuro se detecta
  en CI antes de llegar a producción.
- **Definition of Done**:
  - Capturas de referencia de los componentes del catálogo y de las pantallas principales, en
    ambos temas y en móvil y escritorio.
  - CI compara las capturas y falla ante diferencias no aprobadas.
- **Dependencias**: spec 039 cerrada (catálogo de componentes estable).
- **Riesgos**: falsos positivos por fuentes y antialiasing entre entornos; coste de tiempo de CI.
- **Prompt para /speckit.specify**:
  ```
  Nada en el CI de agro-front detecta que un cambio de estilos rompa visualmente un componente en
  el tema claro o en el oscuro: la verificación de la spec 039 solo comprueba tokens y pares de
  contraste. Por qué: con dos temas y un catálogo común, un cambio en un componente afecta a
  muchas pantallas. Resultado esperado: capturas de referencia de componentes y pantallas
  principales en ambos temas y tamaños, comparadas en CI, que fallan ante cambios no aprobados.
  ```

## Iteración 20: Fotografías adaptadas al tema oscuro

- **Origen**: descartado del alcance de la spec 039 por ser cosmético.
- **Valor entregado**: en el tema oscuro las fotos de plantas y anomalías no deslumbran.
- **Definition of Done**:
  - En el tema oscuro las fotos se atenúan ligeramente y recuperan su brillo al ampliarlas.
  - La atenuación no altera los colores que sirven para identificar una plaga o una planta.
- **Dependencias**: spec 039.
- **Prompt para /speckit.specify**:
  ```
  En el tema oscuro de agro-front las fotografías de plantas y anomalías se ven mucho más
  brillantes que el resto de la interfaz y deslumbran de noche. Por qué: el tema oscuro debe ser
  cómodo en penumbra. Resultado esperado: fotos ligeramente atenuadas en oscuro, con brillo
  completo al ampliarlas y sin alterar los colores útiles para identificar plantas o plagas.
  ```

## Iteración 21: Estructura de títulos y regiones de página

- **Origen**: descartado del alcance de la spec 039 por ser accesibilidad semántica, no visual.
  Complementa la iteración 16.
- **Valor entregado**: quien usa lector de pantalla salta directamente a la sección que busca.
- **Definition of Done**:
  - Cada página tiene un único título principal y una jerarquía de títulos sin saltos.
  - Las regiones de cabecera, navegación, contenido principal y pie están declaradas, y hay un
    enlace visible con el foco para saltar al contenido.
  - Test automático de la jerarquía de títulos en las pantallas principales.
- **Dependencias**: ninguna.
- **Prompt para /speckit.specify**:
  ```
  Las páginas de agro-front no garantizan una jerarquía de títulos coherente ni regiones de
  página declaradas, y no hay enlace para saltar al contenido. Por qué: las personas que usan
  lector de pantalla navegan por títulos y regiones (WCAG 1.3.1, 2.4.1, 2.4.6). Resultado
  esperado: un título principal por página, jerarquía sin saltos, regiones declaradas, enlace
  de salto visible con el foco y un test que lo verifique.
  ```

## Iteración 22: Consentimiento legal y acceso a los documentos legales

- **Origen**: preparación para producción. Antes de abrir el registro público, la app necesita
  pedir consentimiento expreso para tratar datos personales (RGPD) y dar acceso a los documentos
  legales. Hoy `Register.tsx` no tiene ningún checkbox de aceptación y no existe ninguna ruta que
  muestre aviso legal, política de privacidad o términos de uso; los borradores ya existen en
  `docs/legal/` (`aviso-legal.md`, `politica-privacidad.md`, `terminos-de-uso.md`) pendientes de
  publicar.
- **Valor entregado**: el registro deja de crear cuentas sin que la persona haya aceptado
  expresamente cómo se tratan sus datos, y cualquiera puede consultar esos documentos desde la
  propia app, cerrando un requisito legal de cara a producción.
- **Definition of Done**:
  - El formulario de registro (`Register.tsx`) incluye un checkbox, no premarcado, para aceptar
    la política de privacidad y los términos de uso; el envío queda bloqueado mientras no esté
    marcado, con su propio mensaje de validación (igual que el resto de campos del formulario).
  - Existen tres rutas públicas (p. ej. `/legal`, `/privacidad`, `/terminos`) que muestran el
    contenido de los tres documentos de `docs/legal/`, enlazadas desde el checkbox de registro y
    desde el pie de la aplicación.
  - Los documentos se muestran en castellano, con los tokens de diseño de `docs/design.md` (sin
    maquetación nueva de componentes, solo tipografía/espaciado existentes) y son navegables con
    teclado y lector de pantalla.
  - Test de que el registro rechaza el envío sin el checkbox marcado, y test de que las tres
    rutas legales renderizan su contenido.
  - CI en verde.
- **Dependencias**: ninguna técnica; conviene cerrarla antes de abrir el registro público.
- **Riesgos**:
  - Toca `Register.tsx` y `validation.ts`/`validateRegisterForm`, archivos que otro trabajo en
    curso sobre accesibilidad (spec 039 y relacionadas) puede estar modificando a la vez: antes
    de empezar esta iteración, confirmar que no hay cambios simultáneos sobre esos archivos para
    no pisar ese trabajo.
  - Los textos de `docs/legal/` todavía tienen datos pendientes de completar (NIF, región de
    Atlas/Railway, proveedor de email) antes de publicarse como definitivos.
- **Prompt para /speckit.specify**:
  ```
  agro-front no pide ningún consentimiento expreso al registrar una cuenta ni ofrece ninguna
  pantalla donde consultar el aviso legal, la política de privacidad o los términos de uso,
  aunque esos tres documentos ya existen como borrador en docs/legal/. Por qué: antes de abrir
  el registro a usuarios reales, el RGPD exige que la persona acepte expresamente cómo se
  tratan sus datos, y debe poder consultar esa información en cualquier momento desde la propia
  aplicación. Resultado esperado: el formulario de registro incluye un checkbox sin marcar por
  defecto para aceptar la política de privacidad y los términos de uso, y no permite enviarse
  mientras no esté marcado, con un mensaje de validación igual que el resto de campos; existen
  tres rutas públicas que muestran el aviso legal, la política de privacidad y los términos de
  uso a partir del contenido de docs/legal/, enlazadas desde ese checkbox y desde el pie de la
  aplicación, en castellano y con los tokens de diseño existentes.
  ```

## Futura Iteración (Bancales): Motor Espacial - Drag & Drop en el Bancal

- **Estado**: subsumida y estructurada en el roadmap del diseñador de bancales.

---

# Roadmap del objetivo: Diseñador interactivo de bancales y motor espacial agronómico

> **Estado a 2026-11-08 (importante para trabajo en paralelo)**: el diseñador interactivo se
> implementa hoy sobre **`/locations/:id/layout`** (`LocationLayoutPage`), **no** sobre `/beds/:id`.
> La prosa de las iteraciones de abajo todavía redacta el diseñador "en el bancal" (`/beds/:id`) y con
> arrastrar-y-soltar desde el catálogo: **está desactualizada** respecto a este pivote y se conserva
> solo como referencia de intención (no reescrita aún).
>
> - **Feature 047** (brochas de patrón de siembra): entregada e integrada en el diseñador de ubicación.
> - **Feature 048** (`048-bed-placement-ux-redesign`, **en curso**): rediseño exclusivo del **flujo e
>   interfaz** del diseñador de `/locations/:id/layout` — modelo de tres modos (Ver/Colocar/Sembrar),
>   composición estable y encuadre sin saltos. No cambia contrato ni red. Toca
>   `src/pages/locations/LocationLayoutPage/*` y `src/components/beds/{layout,visualizer}/*`.
> - **`/beds/:id` está congelado** (candidato a deprecación): no se modifica; los cambios en
>   `useBedViewport` son aditivos para no romperlo.
> - **Para otra tarea en paralelo**: no toques esos directorios ni `useBedViewport` mientras 048 esté
>   abierta, para evitar conflictos.

## Objetivo final

Dotar a agro-front de un diseñador visual de bancales interactivo, accesible y de alta precisión métrica que permita a hortelanos y agricultores planificar la disposición de sus cultivos sobre el terreno real. El sistema traduce las dimensiones físicas del bancal (`width`, `height`, `depth`) a un lienzo vectorial enriquecido con capas de cuadrículas agrícolas (Square Foot Gardening de 30 cm, decímetros y centímetros), líneas de cota acotadas exteriores y una brújula o rosa de los vientos interactiva que refleje la orientación cardinal (azimut Norte) para optimizar la exposición solar de las especies.

Sobre este lienzo, un motor espacial en cliente evalúa en tiempo real el posicionamiento de las plantas mediante arrastre y soltado desde el catálogo. El motor vigila los radios de desarrollo botánico y los límites físicos del bancal para advertir colisiones por solapamiento excesivo (destacado en rojo), y calcula la distancia euclidiana entre especies vecinas para proyectar una red ecológica en vivo: líneas de conexión verdes para asociaciones simbióticas en rango de interacción biológica, rojas para incompatibilidades o efectos alelopáticos perjudiciales, y neutralidad visual para plantas sin interacción.

La solución se completa con herramientas profesionales de gestión sobre el terreno: la exportación del plano métrico a PDF vectorial imprimible con cotas y leyenda agronómica, y una vista dividida (split-view) estacional que permita comparar la temporada anterior frente a la actual para planificar rotaciones de cultivo eficaces y prevenir el agotamiento del suelo o la proliferación de plagas. Todo ello respetando estrictamente el contrato OpenAPI existente, el sistema de tokens de diseño y los principios de calidad de la constitución.

**Mapa de dependencias entre iteraciones**:

- Iteración 1 (Lienzo métrico y cuadrículas) es la base visual.
- Iteración 2 (Orientación y brújula) depende de la Iteración 1.
- Iteración 3 (Emplazamiento y motor de colisiones físicas) depende de la Iteración 1.
- Iteración 4 (Red espacial de relaciones ecológicas) depende de la Iteración 3.
- Iteración 5 (Exportación técnica a PDF) depende de la Iteración 1 (opcionalmente incluye capas de 2 y 3 si están presentes).
- Iteración 6 (Comparador de temporadas en pantalla dividida) depende de la Iteración 3.

---

## Iteración 1: Lienzo métrico del bancal con cotas y cuadrículas agrícolas

**Valor entregado**: Permite a los usuarios visualizar las dimensiones físicas de sus bancales a escala métrica real, alternando capas de cuadrícula (SFG 30x30 cm, 10 cm, 15 cm) y leyendo cotas arquitectónicas proyectadas fuera del perímetro.
**Definition of Done**:

- El componente del bancal renderiza las dimensiones exactas (`width` y `height` en cm) de forma escalable y responsive sin deformaciones de aspecto.
- Líneas de cota acotadas exteriores en el margen superior e izquierdo proyectan los centímetros totales con tipografía y flechas delimitadoras legibles.
- Tres capas de cuadrícula independientes (Square Foot Gardening 30 cm, decímetros 10 cm y cuadrícula fina de 1 cm) pueden activarse y desactivarse mediante controles accesibles.
- Controles de zoom y desplazamiento (pan) permiten examinar bancales de grandes dimensiones en cualquier dispositivo.
- Todos los textos visibles e indicaciones de cota están en castellano mediante `t()`, usan tokens de diseño y cumplen cobertura de tests unitarios (AAA).
  **Riesgos / dependencias**:
- Depende de los datos del bancal según `contracts/openapi.yaml` (`GET /api/v1/beds/{id}`).
- Riesgo de sobrecarga visual o de renderizado si las cuadrículas métricas finas se instanciaran como nodos DOM individuales; deben resolverse como patrones vectoriales repetitivos ligeros.
  **Prompt para /speckit.specify**:

```
En agro-front no existe ninguna representación gráfica de los bancales registrados por el usuario, mostrándose únicamente como registros alfanuméricos sin contexto espacial. Por qué: para planificar un huerto es imprescindible percibir visualmente el espacio físico disponible, entender las proporciones métricas reales del bancal y disponer de referencias modulares de siembra antes de decidir qué plantar. Qué necesitamos: una vista visual del bancal que dibuje a escala métrica precisa sus dimensiones (ancho y largo en centímetros), proyecte líneas de cota acotadas fuera de su perímetro indicando las medidas totales, y ofrezca selectores para superponer o alternar de forma independiente cuadrículas agrícolas estándar (Square Foot Gardening de 30x30 cm, decímetros y centímetros), contando con navegación fluida de zoom y desplazamiento adaptable a dispositivos móviles y escritorio.
```

---

## Iteración 2: Rosa de los vientos y orientación cardinal del bancal

**Valor entregado**: Facilita orientar geográficamente el bancal respecto al Norte magnético mediante una brújula interactiva, permitiendo al hortelano anticipar la trayectoria solar y el asoleamiento de sus plantas.
**Definition of Done**:

- Un widget interactivo de rosa de los vientos / brújula se visualiza en la vista del bancal, indicando los puntos cardinales (N, S, E, O) y el acimut en grados.
- El usuario puede ajustar y fijar la orientación geográfica del bancal mediante manipulación directa de la brújula o selección de rumbo cardinal.
- Indicadores cardinales sutiles en los bordes del bancal reflejan visualmente qué lados corresponden al Norte, Sur, Este y Oeste en todo momento.
- La orientación seleccionada se conserva durante la sesión y es operable íntegramente mediante teclado y lector de pantalla con etiquetas accesibles.
- Cobertura de tests unitarios estricta (AAA) para la lógica de rotación angular y cálculo de rumbos.
  **Riesgos / dependencias**:
- Depende de la Iteración 1 (lienzo visual del bancal).
- El contrato actual `Bed` en OpenAPI no incluye aún un campo de persistencia de acimut; la orientación debe gestionarse en el estado de visualización del cliente o vincularse a la ubicación geográfica (`latitude`, `longitude`) sin romper el contrato del backend.
  **Prompt para /speckit.specify**:

```
El visor de bancales no ofrece ninguna indicación sobre la orientación geográfica del bancal respecto a los puntos cardinales. Por qué: en agronomía y permacultura la orientación cardinal respecto al Norte es decisiva para la captación solar, la exposición a vientos dominantes y la correcta disposición de cultivos altos para no proyectar sombras perjudiciales sobre cultivos bajos. Qué necesitamos: incorporar una rosa de los vientos o brújula interactiva asociada al bancal que permita al usuario fijar e inspeccionar el rumbo y azimut del bancal, mostrando de forma visual e inequívoca qué lados del terreno corresponden al Norte, Sur, Este y Oeste, con controles accesibles por teclado y etiquetas descriptivas en castellano.
```

---

## Iteración 3: Emplazamiento de plantas y motor espacial de colisiones físicas

**Valor entregado**: Permite a los usuarios arrastrar y ubicar plantas del catálogo en el bancal, con un motor espacial que valida en tiempo real los radios botánicos y resalta en rojo las colisiones o desbordamientos del perímetro.
**Definition of Done**:

- El usuario puede arrastrar una planta desde el catálogo o paleta lateral y soltarla en coordenadas específicas $(x, y)$ del bancal, o mover plantas ya sembradas.
- Cada instancia de planta renderiza su centro y su circunferencia de radio de espaciado agronómico según las características de la especie.
- Un motor espacial matemático en cliente calcula en tiempo real distancias euclidianas y alerta visualmente (circunferencia en rojo y aviso de proximidad) cuando dos plantas solapan excesivamente sus radios vitales o cuando una planta sobrepasa los bordes físicos del bancal.
- La acción de posicionar, mover o retirar persiste la instancia de cultivo a través de los endpoints oficiales (`/api/v1/plant-instances`) respetando `contracts/openapi.yaml`.
- Suite de tests unitarios de lógica pura (AAA) para el detector de colisiones y límites geométricos con cobertura ≥ 95 %.
  **Riesgos / dependencias**:
- Depende de la Iteración 1 (lienzo del bancal) y de la disponibilidad de la API de `plant-instances`.
- Riesgo de degradación de fluidez durante el arrastre; el cálculo geométrico debe ejecutarse en cliente en memoria sin peticiones de red en eventos de movimiento.
  **Prompt para /speckit.specify**:

```
Actualmente los usuarios no pueden ubicar plantas en el lienzo del bancal ni conocer si el espacio disponible es suficiente para el desarrollo radicular y aéreo de cada especie. Por qué: sembrar cultivos a una distancia inferior a su marco de plantación recomendado provoca competencia nociva por nutrientes, agua y luz, reduciendo drásticamente la productividad o asfixiando los cultivos. Qué necesitamos: permitir arrastrar plantas desde el catálogo lateral hacia el interior del bancal para registrarlas en coordenadas concretas en centímetros, calculando automáticamente su radio vital de ocupación y alertando de forma visual e inmediata (mediante halos o circunferencias rojas) cuando dos plantas colisionen por proximidad excesiva o cuando un cultivo quede fuera de los márgenes del bancal, persistiendo los cambios según el contrato de instancias de cultivo de la API.
```

---

## Iteración 4: Red espacial de relaciones ecológicas en tiempo real

**Valor entregado**: Proyecta sobre el bancal una red visual dinámica de compatibilidades botánicas, enlazando con líneas verdes las asociaciones beneficiosas en rango y con líneas rojas las incompatibilidades perjudiciales.
**Definition of Done**:

- Al mover o ubicar una planta, el motor evalúa en caliente las relaciones ecológicas con las demás plantas presentes en el bancal utilizando la matriz botánica del catálogo (`/api/v1/plant-relations`).
- Si dos plantas poseen una relación benéfica y su distancia euclidiana está dentro de su radio de interacción biológica, se dibuja una línea verde continua de conexión entre ambas.
- Si la relación es perjudicial o alelopática y están dentro del rango de interferencia, se dibuja una línea roja discontinua de advertencia; las relaciones neutras o fuera de rango permanecen invisibles.
- Al interactuar con una línea o nodo se despliega información accesible del beneficio o perjuicio agronómico correspondiente.
- Cero peticiones de red durante el movimiento del cursor gracias a la precarga indexada de relaciones de las especies involucradas.
- Cobertura de tests exhaustiva (AAA) para el evaluador de proximidad ecológica.
  **Riesgos / dependencias**:
- Depende de la Iteración 3 (emplazamiento y coordenadas de plantas) y del catálogo de `plant-relations`.
- Complejidad en bancales densamente poblados; debe incluirse un control para alternar o filtrar la visibilidad de la red ecológica para no saturar la vista.
  **Prompt para /speckit.specify**:

```
Los hortelanos que diseñan la distribución de su bancal no reciben asistencia visual sobre cómo interactúan biológicamente las plantas que han colocado unas junto a otras en el espacio físico. Por qué: la asociación de cultivos es el pilar de la agricultura ecológica; juntar plantas compañeras potencia su crecimiento y repele plagas, mientras que ubicar plantas incompatibles a corta distancia frena su desarrollo por alelopatías o atracción de patógenos comunes. Qué necesitamos: un sistema que evalúe en tiempo real las distancias físicas entre todas las plantas situadas en el bancal y dibuje dinámicamente líneas de conexión que unan a las plantas vecinas (verdes para asociaciones simbióticas y rojas de advertencia para incompatibilidades perjudiciales) únicamente cuando la distancia entre ellas esté dentro del alcance biológico efectivo de la relación, manteniendo la interfaz despejada ante especies neutras o lejanas.
```

---

## Iteración 5: Exportación técnica del plano del bancal a PDF

**Valor entregado**: Permite al usuario generar y descargar un documento PDF vectorial a escala con el plano acotado del bancal, su orientación cardinal y la lista de cultivos para llevar al huerto físico.
**Definition of Done**:

- Un botón accesible de exportación genera un documento PDF descargable con maquetación limpia y nítida a cualquier resolución.
- El PDF incluye el dibujo a escala del bancal con sus líneas de cota totales, la cuadrícula activa seleccionada, la flecha/rosa de orientación Norte y la ubicación de cada planta.
- Se adjunta una leyenda técnica con el listado de especies presentes, número de ejemplares y dimensiones generales del bancal.
- La generación ocurre íntegramente en cliente de forma asíncrona sin bloquear la interfaz de usuario ni depender de servicios externos.
- Tests automatizados que validan la generación del documento y la inclusión de los metadatos requeridos.
  **Riesgos / dependencias**:
- Depende de la Iteración 1 (lienzo y cotas) y opcionalmente refleja los elementos de las Iteraciones 2 y 3.
- Cuidar el peso del bundle evitando librerías de generación masivas que vulneren los presupuestos de rendimiento (constitution Principle V).
  **Prompt para /speckit.specify**:

```
Los usuarios que planifican digitalmente su bancal no disponen de ningún mecanismo para trasladar fácilmente su diseño a la práctica cuando van a trabajar sobre la tierra. Por qué: en el huerto o parcela exterior el uso de teléfonos o pantallas puede ser incómodo o inviable por reflejos solares, suciedad o falta de cobertura, siendo necesario contar con una ficha técnica en papel o documento imprimible. Qué necesitamos: permitir al usuario exportar en un clic el diseño de su bancal a un documento PDF de alta fidelidad vectorial que reproduzca a escala el plano del bancal con sus cotas de dimensiones, su orientación respecto al Norte, la cuadrícula activa y la posición exacta de cada cultivo junto a una tabla resumen con las especies sembradas.
```

---

## Iteración 6: Comparador estacional de rotación de cultivos en pantalla dividida

**Valor entregado**: Proporciona una vista en pantalla dividida (_split-view_) para contrastar la distribución de cultivos de la temporada anterior frente a la planificación actual, facilitando la rotación de familias botánicas.
**Definition of Done**:

- La interfaz ofrece un modo de visualización dividida: a la izquierda el bancal con los cultivos de la temporada previa (modo histórico de solo lectura) y a la derecha el diseñador activo de la temporada en curso.
- Ambas vistas sincronizan opcionalmente su nivel de zoom y desplazamiento para comparar celdas equivalentes con precisión.
- El sistema alerta visualmente si el usuario intenta ubicar una especie de la misma familia botánica en una zona donde ya estuvo presente la temporada pasada (riesgo de fatiga de suelo o plagas endémicas).
- Totalmente responsive: en pantallas reducidas se sustituye la división horizontal por un selector alternador accesible o pestañas de temporada.
- Cobertura de tests unitarios e integración (AAA) para la detección de conflictos de rotación familiar.
  **Riesgos / dependencias**:
- Depende de la Iteración 3 (instancias de plantas con información temporal o estado histórico).
- En el contrato de la API, las instancias históricas de cultivo se identifican por `instanceStatus: removed` o por fechas `plantedAt`/`removedAt`; la vista debe consumir estos datos sin crear esquemas artificiales.
  **Prompt para /speckit.specify**:

```
Al planificar una nueva temporada de siembra, los usuarios no tienen forma de consultar directamente sobre el plano qué cultivos ocuparon cada zona del bancal en el ciclo anterior. Por qué: la rotación de cultivos es esencial para evitar el agotamiento de nutrientes específicos en el suelo y prevenir la acumulación de plagas y hongos característicos de una misma familia botánica si se repite en el mismo espacio año tras año. Qué necesitamos: una modalidad de visualización dividida que muestre en paralelo el bancal de la temporada pasada (en modo de consulta histórica) y el bancal de la temporada actual (en edición activa), permitiendo comparar celda a celda la ocupación del suelo y advirtiendo cuando se intente sembrar una planta de la misma familia botánica en un área recientemente ocupada por ella.
```
