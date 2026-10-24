# Contexto del sistema agro-front

> Auditoría descriptiva (cómo **es** el código, no cómo debería ser).
> Fecha: 2026-10-04 · Rama: `develop` · Último commit: `fc338b7 feat(loader): add Loader component`.
> Fuentes: código versionado (175 archivos), `contracts/openapi.yaml` (copia del contrato del backend; ver `contracts/README.md`), ejecución local de tests/lint/skott, y prototipos Stitch (solo como referencia visual, extraída a `docs/design.md`).

---

## 1. Propósito real del sistema

SPA de **solo lectura** que consume la "MiBancal API" (`agro-back`, repo aparte) para mostrar un **catálogo botánico**:

- **Plantas**: listado paginado con filtros agronómicos (familia, texto, ciclo de vida, método de siembra, luz, sistema radicular, mes de siembra con conversión de hemisferio, pH, horas de luz, espaciado, profundidad de suelo) y ficha de detalle (calendario de siembra/floración/cosecha, datos rápidos, cultivo, poda, propagación, ecología, notas, recursos: vídeos de YouTube embebidos y artículos).
- **Familias botánicas**: listado y ficha de detalle con las plantas de esa familia.
- **Home**: página informativa del proyecto (open source, sin ánimo de lucro, avisos sobre imágenes/vídeos, contacto).

Lo que **no** hace hoy (aunque hay rutas o contrato para ello):

- **Autenticación**: `/login` y `/register` existen como rutas pero renderizan solo un emoji. No hay gestión de token, ni cabecera `Authorization`, ni llamadas a `/auth/*`.
- **Admin**: `/admin` renderiza solo un emoji; el enlace en el menú está comentado.
- **Escritura**: no hay ningún `POST/PATCH/DELETE`; no se usan `ETag`/`If-Match`.
- **Bancales (`/beds`)**: existen en el contrato, sin ningún código en el front.

Idioma de la UI: español únicamente (diccionario i18n propio con una sola locale). `index.html` declara `<html lang="es">`.

## 2. Inventario de módulos

Total `src/`: 118 archivos, ~4.800 líneas (≈1.700 de ellas CSS; `loader.css` sola tiene 474). No ha sido necesario dividir ningún módulo.

| Módulo                | Ruta                                                | Propósito real                                                                                                                                                                                                                                                                                                                                  | Depende de (interno)                                        | Depende de (externo)             |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| **app**               | `src/app/`                                          | Bootstrap: `router.tsx` (rutas con `createBrowserRouter`), `queryClient.ts` (`retry: shouldRetryQuery`, `refetchOnWindowFocus: false`, `QueryCache.onError` que registra los errores inesperados)                                                                                                                                               | layouts, pages                                              | react-router-dom, TanStack Query |
| **entry**             | `src/main.tsx`                                      | Monta `<AppErrorBoundary><QueryClientProvider><AuthProvider><RouterProvider/></AuthProvider></QueryClientProvider></AppErrorBoundary>` en `StrictMode` e importa `index.css`                                                                                                                                                                    | app, shared/auth                                            | react-dom                        |
| **layout**            | `src/components/layout/`                            | `MainLayout` (cabecera unificada con marca MiBancal + botón hamburguesa accesible de 3 barras + `NavDrawer` lateral modal + `<Outlet/>`)                                                                                                                                                                                                        | i18n, shared/components/Icon, shared/auth                   | —                                |
| **plants (página)**   | `src/pages/plants/` (38 archivos)                   | `PlantsPage` (sidebar de filtros en escritorio / drawer en móvil ≤768px) → `PlantList` (orden, límite, paginación, grid de `PlantCard`) y `PlantDetail` (8 secciones)                                                                                                                                                                           | services/plants, components/plants, shared/\* , i18n, types | —                                |
| **plants (filtros)**  | `src/components/plants/` (14)                       | `PlantFilters` + `ToggleGroup`, `SliderFilter`, `PlantStatusBadge` (badge «Borrada» de las plantas `DELETED`, feature 007), `TextFilter`, `MonthSelector`, `FamilySelect`; hooks `usePlantFilters`, `useSliderFilter`, `useDebouncedCallback`; config declarativa `filters.config.ts`; `constants.ts`; type guards                              | shared/hooks/useFamilies, i18n, shared/components/Icon      | react-router (`useSearchParams`) |
| **families**          | `src/pages/families/` (9)                           | `FamilyList` (grid de enlaces, estados de error y vacío), `FamilyDetail` (`FamilyHero`, `FamilyInfo`, `FamilyPlants`); hooks `useFamily`, `useFamilyPlants` (`useFamilies` vive en `shared/hooks`)                                                                                                                                              | services/families, **services/plants**, shared, i18n        | —                                |
| **auth**              | `src/pages/auth/`                                   | `Login`, `Register` y `Activate` funcionales bajo lazy loading; subcomponentes `GoogleAuthButton` y `SsoPreviewButtons`                                                                                                                                                                                                                         | i18n, shared/components/Icon, shared/auth, config           | —                                |
| **admin**             | `src/pages/admin/`                                  | `AdminDashboard` con carga diferida (`React.lazy`), protegido por `ProtectedRoute`                                                                                                                                                                                                                                                              | i18n, shared/components/Icon, shared/auth                   | —                                |
| **home**              | `src/pages/Home.tsx`                                | Texto informativo + enlaces a issues de GitHub de back y front                                                                                                                                                                                                                                                                                  | i18n                                                        | —                                |
| **services**          | `src/services/`                                     | `apiFetch<T>` (inyección Bearer, reintento público transparente ante 401, soporte 204 y fusión de cabeceras), `auth.service.ts` (`register`, `activate`, `login`, `google`, `refresh`), `plants.service.ts`, `families.service.ts`                                                                                                              | shared/errors, shared/api, shared/auth, types               | `fetch`, `config/env`            |
| **shared/auth**       | `src/shared/auth/`                                  | `session.ts` (almacenamiento en `sessionStorage` y memoria), `jwt.ts` (parseo puro de JWT), `tokenUrl.ts` (extracción y limpieza de URL), `validation.ts` (reglas cliente), `authContextDef.ts`, `AuthContext.tsx`, `useAuth.ts`                                                                                                                | services/auth, types/auth                                   | —                                |
| **shared/api**        | `src/shared/api/QueryBuilder.ts`                    | Builder inmutable sobre `URLSearchParams`; descarta `undefined`/`null`/strings en blanco; `addArray` une con comas                                                                                                                                                                                                                              | types/Primitive                                             | —                                |
| **shared/errors**     | `src/shared/errors/`                                | `ApiError` (`status`, `errors`), `NetworkError` (`cause`), `classifyFailure` (→ `FailureKind`), `toUiError` (→ `{kind, message}`, mensaje siempre de `t()`)                                                                                                                                                                                     | i18n                                                        | —                                |
| **shared/components** | `src/shared/components/` (19)                       | `<Icon />` (Material Symbols Outlined empaquetados), `Badge`, `BodySection`, `Drawer`, `ErrorResponse`, `LimitSelector` (25/50/100), `Loader` (animación CSS), `OrderSelector`, `Pagination`, `ScientificName`                                                                                                                                  | i18n                                                        | —                                |
| **shared/hooks**      | `src/shared/hooks/`                                 | `useMediaQuery`, `useDrawer`, `useFamilies` (listado ligero de familias, compartido por `FamilySelect` y `FamilyList`)                                                                                                                                                                                                                          | services/families, shared/reactQuery                        | `matchMedia`, TanStack Query     |
| **shared/utils**      | `src/shared/utils/`                                 | `buildPaginationPages`, `parsePositiveInt`, `safeNumber`, `capitalizeFirstLetter`, `getDomainFromUrl`, `formatRange` (sin uso)                                                                                                                                                                                                                  | types                                                       | —                                |
| **shared/reactQuery** | `queryDefaults.ts`, `plantKeys.ts`, `familyKeys.ts` | `QUERY_DEFAULTS = { staleTime: 1 día, gcTime: 7 días }`, aplicado en todos los `useQuery`; factorías de `queryKey` por recurso; `getQueryViewState` (estado de vista), `shouldRetryQuery` (reintento) y `queryMeta` (augmentación de `Register`)                                                                                                | —                                                           | —                                |
| **i18n**              | `src/i18n/core/`                                    | `dictionary` (objeto `as const`, solo español), `t(key)` con claves tipadas (`I18nKey` = DeepKeys), `tValue(group, value)` para enums (con cast `as any`); `monthNames()` devuelve los 12 meses (`{ displayMonth, short, long }`) desde `common.months` y `MONTH_KEYS` (`shared/constants/months.ts`), y lo usan `MonthSelector` y `MonthChips` | —                                                           | —                                |
| **types**             | `src/types/`                                        | Modelos de dominio escritos a mano: `Plant`, `Family`, `Metadata`, `Pagination`, `PaginatedResponse`, `Range`, `Seasons`, `Primitive`, `PlantsSortField`                                                                                                                                                                                        | —                                                           | —                                |

Grafo de dependencias: `skott` informa **0 ciclos**.

## 3. Stack técnico real (versiones)

Rangos declarados en `package.json`; no se ha comprobado la versión exacta instalada salvo Vitest (4.1.6, visto al ejecutarlo).

| Capa                  | Paquete                                                                 | Versión                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime               | react / react-dom                                                       | ^19.2.6                                                                                                                                                             |
| Routing               | react-router-dom                                                        | ^7.15.0 (modo data router: `createBrowserRouter`)                                                                                                                   |
| Data fetching / caché | @tanstack/react-query                                                   | ^5.100.11 (+ devtools en devDeps, **no montados**)                                                                                                                  |
| Lenguaje              | typescript                                                              | ~6.0.2 (`target es2023`, `moduleResolution bundler`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnused*`). **No** hay `"strict": true` en `tsconfig.app.json` |
| Bundler               | vite + @vitejs/plugin-react                                             | ^8.0.12 / ^6.0.1                                                                                                                                                    |
| Tests                 | vitest + jsdom + @vitest/coverage-v8                                    | ^4.1.6 / ^29.1.1                                                                                                                                                    |
| Testing utils         | @testing-library/react / user-event / jest-dom                          | ^16.3.2 / ^14.6.1 / ^6.9.1                                                                                                                                          |
| Lint                  | eslint + typescript-eslint + react-hooks + react-refresh + regla propia | ^10.3.0 / ^8.59 / ^7.1.1 / ^0.5.2                                                                                                                                   |
| Formato               | prettier (+ eslint-config-prettier)                                     | ^3.8.3                                                                                                                                                              |
| Arquitectura          | skott (ciclos)                                                          | ^0.35.11                                                                                                                                                            |
| Git hooks             | husky + lint-staged + commitlint (conventional)                         | ^9.1.7 / ^16.4.0 / ^21.0.1                                                                                                                                          |
| Node                  | `.tool-versions` / `engines`                                            | 24.22.1 (`engines.node: >=24.22.1`, `.npmrc: engine-strict=true`). CI y SonarQube fijados a `^24.22.1`                                                              |

No hay librería de UI, de estilos (CSS plano por componente, BEM aproximado), de formularios, de validación de esquemas (zod, etc.) ni de i18n de terceros. Los tokens de diseño (feature 009) viven en `src/styles/tokens.css`: un único bloque `:root` con los 47 colores de `docs/design.md` (`--color-*`), los derivados `--color-scrim` y `--color-surface-translucent`, las familias `--font-display`/`--font-ui`, los estilos tipográficos como shorthand `font` (`--type-*`, más `--tracking-*`), los radios (`--radius-*`), el espaciado (`--space-xs..xl`, `--gutter`, `--margin-inline`) y las sombras (`--elevation-*`). Es el único archivo con colores literales. `src/styles/fonts.css` importa de `@fontsource/manrope` y `@fontsource/newsreader` (5.3.0, dependencias exactas) solo el subconjunto latin de las 7 variantes usadas (Manrope 400/600/700, Newsreader 500/600/400 cursiva/600 cursiva), con `font-display: swap`, y declara 4 `@font-face` de respaldo con métricas ajustadas (Arial/Roboto y Times New Roman/Noto Serif) para no provocar CLS; los `.woff2` salen con hash en `dist/assets/` (mismo origen, sin `preload`). `src/index.css` importa ambos y define la base global (`body` en `body-lg` sobre `background`, `h1`–`h3` en `headline-xl/md/sm`, controles con `font: inherit`) y el anillo de foco común: `:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible` con `outline: 2px solid var(--color-primary)` y `outline-offset: 2px`. Los nombres científicos se pintan con `shared/components/ScientificName` (`variant` `secondary` por defecto, `taxonomy-scientific`; `title` hereda tamaño y peso del titular en Newsreader cursiva) en `PlantCard`, `PlantHero`, `FamilyHero` y los títulos de `FamilyList`. Todas las hojas de componentes usan esos tokens.

## 4. Patrones arquitectónicos detectados

- **Organización por capas técnicas con agrupación parcial por feature**: `pages/<feature>/{hooks,components,utils}` conviven con `components/plants/`, `services/` y `types/` globales. Sin barrel files salvo `shared/utils/pagination/index.ts`.
- **Service → hook de React Query → componente**: cada pantalla usa un hook propio (`usePlants`, `usePlant`, `useFamilies`, `useFamily`, `useFamilyPlants`) que envuelve `useQuery` + `QUERY_DEFAULTS`. Los hooks que solo envuelven una query devuelven el `UseQueryResult` sin transformar (`usePlant`, `useFamily`, `useFamilies`, `useFamilyPlants`); `usePlants` combina URL y query y devuelve `{ query, ... }`.
- **La URL es la fuente de verdad de los filtros**: `usePlantFilters` escribe en `useSearchParams` y `usePlants` lee de ahí. Cambiar cualquier filtro borra `page`. El texto se aplica con debounce de 300 ms y los sliders se confirman en `onPointerUp`.
- **Vacíos del listado de plantas** (feature 010): con `data.length === 0`, `getPlantListEmptyState({ page, totalItems, hasActiveFilters })` elige el texto (`role="status"`) y la acción: `outOfRange` (página > 1 con resultados en total) → «Ir a la primera página»; `noMatches` (hay filtros válidos activos) → «Quitar filtros»; `emptyCatalog` → sin acción. `hasActiveFilters` cuenta solo los filtros ya parseados en `request.filters`. «Quitar filtros» (`usePlants().clearFilters`, también ofrecido ante un 400 del listado) usa `withoutPlantListFilters`: borra las claves de `PLANT_LIST_FILTER_URL_PARAMS` y `page`, y conserva `limit`, orden y `hemisphere`. El texto de búsqueda del panel sigue al parámetro `identity` de la URL (estado derivado durante el render, sin pisar lo tecleado dentro del debounce).
- **Configuración declarativa de filtros** (`TOGGLE_FILTERS`, `TEXT_FILTERS`, `SLIDER_FILTERS`) que se recorre en `PlantFilters`.
- **Traducción de parámetros UI → contrato** en `buildPlantsQuery`, compartida por `getPlantList` y `getFamilyPlants` (`filter[x][op]=…`, `pagination[…]`, `sort[…]`, `fields[plants]`) mediante `QueryBuilder`. `getFamilyList` construye la suya igual, con las constantes de `services/familyListQuery.ts` (feature 008).
- **Errores de carga** (feature 010): `apiFetch` lanza `NetworkError` (fallo de conexión) o `ApiError(message, status, errors)`. `classifyFailure` los reduce a siete tipos: `offline` (red), `notFound` (404), `badRequest` (400), `forbidden` (401/403), `tooManyRequests` (429), `unavailable` (≥ 500) y `unknown` (el resto). `<ErrorResponse error onRetry? onClearFilters?/>` pinta `t('errors.<tipo>.message')` en `role="alert"` (nunca el `message` del back ni el código) y la acción según el tipo: reintentar, quitar filtros (400 en el listado) o volver al inicio (`forbidden`, `notFound`, `badRequest` sin filtros). Las vistas deciden con `getQueryViewState(query)`: con datos ya cargados un refresco fallido no sustituye la vista, y un reintento manual en curso muestra el `Loader`.
- **Reintento automático**: `shouldRetryQuery` reintenta como máximo 2 veces y solo `offline`, `unavailable` y `tooManyRequests` (backoff por defecto de TanStack, 1 s y 2 s).
- **Registro de errores inesperados**: un único `QueryCache.onError` en `queryClient.ts` clasifica (con `query.meta`) y, si `shouldReportFailure` (`unavailable`, `badRequest`, `forbidden`, `unknown`), llama a `reportUnexpectedError` de `src/shared/observability`, que escribe con `console.error` un objeto saneado (`kind`, `route` = `location.pathname`, `status?`, `error: {name, message}`) y deduplica por identidad del error. Ninguna vista registra por su cuenta.
- **Filtro de familia**: si falla la carga, `FamilySelect` pinta «No se han podido cargar las familias.» con «Reintentar» (sin él en `forbidden`); el resto de filtros sigue activo.
- **Composición de la ficha de detalle**: `BodySection` como contenedor genérico + `InfoRow`/`CalendarRow`/`MonthChips`.
- **Responsive por JS**: `useMediaQuery('(max-width: 768px)')` decide si se pinta el sidebar o el drawer (no solo CSS).
- **Conversión de hemisferio solo en cliente**: `mapMonth(m, 'south') = ((m+5)%12)+1` (`src/shared/utils/mapMonth.ts`); el backend siempre trabaja con meses del hemisferio norte.

## 5. Puntos de entrada

Es una SPA: no tiene CLIs, jobs, colas ni schedulers.

**Bootstrap**: `index.html` → `src/main.tsx` → `RouterProvider(router)`.

**Rutas** (`src/app/router.tsx`):

| Ruta            | Layout     | Componente       | Estado                                             |
| --------------- | ---------- | ---------------- | -------------------------------------------------- |
| `/`             | MainLayout | `Home`           | Funcional (estático)                               |
| `/plants`       | MainLayout | `PlantsPage`     | Funcional                                          |
| `/plants/:id`   | MainLayout | `PlantDetail`    | Funcional                                          |
| `/families`     | MainLayout | `FamilyList`     | Funcional                                          |
| `/families/:id` | MainLayout | `FamilyDetail`   | Funcional                                          |
| `/admin`        | MainLayout | `AdminDashboard` | Protegido con `ProtectedRoute` (`requireAdmin`)    |
| `/login`        | MainLayout | `Login`          | Funcional (lazy, autenticación email y Google SSO) |
| `/register`     | MainLayout | `Register`       | Funcional (lazy, registro con UUID en cliente)     |
| `/activate`     | MainLayout | `Activate`       | Funcional (lazy, activación con token de URL)      |
| `*`             | MainLayout | `NotFoundPage`   | «Página no encontrada» con enlace al inicio        |

**No encontrado** (feature 010): la ruta `*` pinta `NotFoundPage` en la misma URL, con la cabecera unificada y el menú hamburguesa de `MainLayout`, sin redirigir ni añadir historial. Las fichas (`PlantDetail`, `FamilyDetail`) pintan `<NotFound/>` con su propio texto y enlace al listado cuando falta el parámetro de ruta, o la petición devuelve 404 o 400: `usePlant` y `useFamily` usan `skipToken` sin `id` y declaran `meta: { badRequestMeansNotFound: true }`, de modo que `getDetailViewState` da `notFound` y `QueryCache.onError` no registra ese 400. Ya no se lanza ninguna excepción por parámetro de ruta. Rutas de admin protegidas por `ProtectedRoute` verificando rol en el JWT.

**Contención de errores de pintado** (feature 010), en tres niveles, cada uno con aviso en castellano y un único registro `kind: 'render'` por `reportUnexpectedError`:

1. **Sección**: `SectionErrorBoundary` (clase, `shared/components`) envuelve cada sección de `PlantDetail` (`plant.hero`, `plant.calendar`, `plant.quickFacts`, `plant.safety`, `plant.cultivation`, `plant.ecology`, `plant.notes`, `plant.resources`) y de `FamilyDetail` (`family.hero`, `family.info`, `family.plants`). Si una lanza, solo ella se sustituye por «No se ha podido mostrar esta sección.» (sin acciones).
2. **Contenido de página**: todos los hijos de `MainLayout` cuelgan de una ruta sin `path` con `errorElement: <RouteErrorFallback/>`, que se pinta en el `<Outlet>` (cabecera y navegación visibles) con enlace al inicio; registra `section: 'page'`.
3. **Aplicación**: `MainLayout` y `AuthLayout` tienen `errorElement: <LayoutErrorFallback/>` y `main.tsx` envuelve todo en `AppErrorBoundary`; ambos pintan `AppErrorScreen` (pantalla completa con «Recargar» y `<a href="/">`, sin depender del router) y registran `section: 'app'`.

**Query params de `/plants`** (contrato interno URL ↔ UI): `page`, `limit`, `sortDirection`, `family`, `identity`, `lifeCycle`, `sowingMethod`, `lightType`, `rootSystem`, `sowingMonth` (singular), `hemisphere` (solo UI), `soilPh`, `lightHoursMin`, `spacingCm`, `soilAvailableDepthCm`.

**Llamadas HTTP salientes** (todas `GET`, sin auth):

| Función           | Endpoint                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getPlantList`    | `GET /api/v1/plants?filter[...]&pagination[page]&pagination[limit]&sort[name]=asc\|desc&fields[plants]=identity,traits,image,status`                                            |
| `getPlantById`    | `GET /api/v1/plants/{id}?include=family`                                                                                                                                        |
| `getFamilyList`   | `GET /api/v1/families?pagination[page]=<n>&pagination[limit]=100&sort[name]=asc&fields[families]=name,scientificName`, página a página hasta `totalPages` (desde `useFamilies`) |
| `getFamilyById`   | `GET /api/v1/families/{idOrSlug}`                                                                                                                                               |
| `getFamilyPlants` | `GET /api/v1/plants?filter[family][eq]=<uuid>&sort[name]=asc&fields[plants]=identity,status` (desde `useFamilyPlants`)                                                          |

## 6. Modelo de datos

El front no tiene persistencia propia (ni `localStorage`, ni IndexedDB, ni migraciones). El modelo lo define el contrato **`contracts/openapi.yaml`** (OpenAPI 3.0.3, "MiBancal API" v1.0.0). **Confirmado por el propietario: `openapi.yaml` es la fuente de verdad actual.** Cuando el front y el contrato no coinciden, el que está mal es el front. Los tipos de `src/types/` son una **copia manual** que ya ha divergido, y las fixtures de `tests/fixtures/` siguen esa misma forma antigua.

### 6.1 Recursos del contrato

| Recurso  | Endpoints                                                                                                      | Notas clave                                                                                                                                                                                                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health   | `GET /health`                                                                                                  | —                                                                                                                                                                                                                                                                                                                                                                                                  |
| Auth     | `POST /auth/register`, `/login`, `/google`, `GET /auth/validate/{token}`, `POST /auth/refresh`, `/auth/update` | JWT Bearer HS256 (payload `id`, `email`, `username`, `roles` `admin`\|`user`, `iat`, `exp`; emitido por `login`, `google` y `refresh`). Register exige `id` (uuid) generado por el cliente y responde `201` **sin cuerpo** (hay que hacer login después); password de 8–64 caracteres con complejidad                                                                                              |
| Families | `GET/POST /families`, `GET/PATCH /families/{idOrSlug}`                                                         | Filtros `id, slug, name, scientificName, aliases`; orden `name, scientificName, slug`; `fields[families]` (sparse fieldset)                                                                                                                                                                                                                                                                        |
| Plants   | `GET/POST /plants`, `GET/PATCH/DELETE /plants/{id}`                                                            | Filtros (ver 6.3); orden **solo `name`, `scientificName`**; `fields[plants]`; `include=family` (devuelve `FamilySummary`). Los GET son públicos con **token opcional**: sin token o con rol `user` solo devuelven plantas `ACTIVE`; con token `admin` también las `DELETED`. Una planta `DELETED` da 404 sin token admin. **Un token mal formado o caducado → 401, también en estos GET públicos** |
| Beds     | `GET/POST /beds`, `GET/PATCH/DELETE /beds/{id}`                                                                | Todo autenticado; `Bed` incluye `plantInstances[]` (`PlantInstance` con `position {x,y}`, `growthStatus`, `instanceStatus ACTIVE\|REMOVED`)                                                                                                                                                                                                                                                        |

Comportamientos transversales del contrato:

- **Concurrencia optimista**: `ETag` = `"<version>"`. Las escrituras exigen `If-Match` (si falta, 428; si no coincide, 412). Como el GET con `fields` o `include` no devuelve `ETag`, `getPlantById` (que usa `include=family`) no recibe `ETag`; las futuras operaciones de edición exigirán un GET completo previo.
- **PATCH** sigue la semántica JSON Merge Patch (RFC 7396).
- **Paginación** con `pagination[page]` y `pagination[limit]` (por defecto 1/25, máximo 100). La respuesta es `{data, pagination:{page,limit,totalPages,totalItems}}`.
- **Errores** `{message, errors?: Record<path,string>}` (máximo 20 entradas más `_truncated`). Cualquier campo, operador o clave desconocida devuelve **400**.

### 6.2 Divergencias entre `src/types` y el contrato

| Campo                                                                 | Front (`types/`)                              | Contrato                                                                       | Efecto observable                                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `Plant.version`, `Family.version`                                     | ausente                                       | `integer`                                                                      | Imposible implementar escrituras con `If-Match` sin añadirlo                                             |
| `phenology.flowering.pollination`                                     | `{ type: 'insect'\|'wind'\|'self'; agents? }` | `{ types: PollinationType[] (insect, wind, self, water, bird, bat); agents? }` | Forma distinta (`type` frente a `types[]`); la UI no lo pinta                                            |
| `identity.scientificName`                                             | opcional                                      | requerido                                                                      | —                                                                                                        |
| `identity.name.aliases`                                               | requerido                                     | opcional                                                                       | `PlantCard` y `PlantDetailStickyHeader` hacen `.aliases.length` sin guarda, por lo que fallaría si falta |
| `knowledge`                                                           | requerido                                     | `nullable`, opcional en el GET                                                 | `PlantDetail` accede a `knowledge.soil…` sin guardas                                                     |
| `knowledge.ecology.strategicBenefits`                                 | requerido                                     | `ecology` y `strategicBenefits` opcionales                                     | `PlantEcology` hace `benefits.length` sin guarda                                                         |
| `knowledge.watering.frequency`                                        | `string` (+ `amountMm`)                       | texto libre; `amountMm` no existe                                              | `QuickFacts` lo pinta tal cual (spec 011)                                                                |
| `knowledge.light.type`                                                | `string`                                      | texto libre (`RequiredShortText`)                                              | `QuickFacts` lo traduce con `tValue`: un valor desconocido se muestra tal cual y se reporta (spec 011)   |
| `knowledge.light.preference` / `rootSystem.type` / `resources[].type` | enums cerrados                                | texto libre (`RequiredShortText`)                                              | Un valor nuevo del backend se muestra como clave sin traducir                                            |
| `Metadata.createdAt/updatedAt`                                        | `Date`                                        | `string (date-time)`                                                           | Tipado incorrecto (llega string)                                                                         |
| `deletedAt`                                                           | `Date \| null`                                | `string \| null`                                                               | Ídem                                                                                                     |
| `phenology.flowering` / `harvest`                                     | requeridos                                    | requeridos en la respuesta, opcionales al crear                                | —                                                                                                        |
| `Family.extra.subfamilies`                                            | presente                                      | presente                                                                       | Se declara pero no se pinta                                                                              |

Alineado con el contrato: `traits.ecological` (`edible`, `toxic`, `toxicityNotes`, todas opcionales; una clave ausente es "sin dato"); `identity.family` (`PlantFamilyRef = string | FamilySummary`, tipado alineado con `PlantIdentityView`, feature 005); `status` (`PlantStatus = 'ACTIVE' | 'DELETED'`, sin `INACTIVE`, feature 007). Los listados usan tipos parciales que no son asignables a `Plant`: `PlantListItem` y `FamilyPlantItem` (feature 007).

### 6.3 Divergencias en las peticiones (consultas de listado)

| Parámetro enviado                                                                             | Contrato                                   | Riesgo                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filter[family][eq]=<valor>`                                                                  | `eq` debe ser `uuid`                       | En el listado solo se envía si el valor de la URL es un uuid (feature 003). Resuelto en ficha de familia (feature 005): `FamilyDetail` pasa el uuid `familyQuery.data?.id` a `useFamilyPlants`, que no lanza la petición sin uuid (`skipToken`), evitando enviar el slug de la ruta |
| `pagination[limit]=<limit de la URL>`                                                         | máximo 100                                 | Resuelto (feature 003): solo se envía 25, 50 o 100; cualquier otro valor de la URL se corrige a 25                                                                                                                                                                                  |
| `sort[<campo>]` desde `sortField`/`sortDirection`                                             | `name`, `scientificName`; `asc`, `desc`    | Resuelto (features 002 y 003): campos en `services/plantListQuery.ts` y sentidos en `services/listQuery.ts`; valores de la URL fuera de esas listas se ignoran                                                                                                                      |
| `filter[lightType][eq]` con `full_sun\|partial_shade`, `filter[rootSystem][eq]` con 6 valores | texto libre                                | Los filtros solo funcionan si los datos usan exactamente esos literales                                                                                                                                                                                                             |
| `getFamilyList` con `pagination[limit]=100`                                                   | máximo 100                                 | Resuelto (feature 008): pide la primera página y, en paralelo, el resto hasta `totalPages`; devuelve las familias concatenadas en orden. Si falla una página, falla el listado completo                                                                                             |
| `useFamilyPlants` sin paginación                                                              | 25 por defecto                             | La ficha de familia muestra como máximo 25 plantas, sin indicarlo (el enlace "ver todas" sí lleva al listado filtrado)                                                                                                                                                              |
| `filter[edible][eq]`, `filter[toxic][eq]` desde `edible`/`toxic` de la URL                    | `BooleanFieldFilter` (`'true'`, `'false'`) | Alineado (feature 004): claves de `PLANT_FILTER_QUERY_KEYS`; otros valores de la URL se ignoran. Una planta sin dato no coincide ni con `true` ni con `false`                                                                                                                       |

Los listados envían `fields[plants]` (feature 007) con selecciones de `services/plantListQuery.ts`: el listado de plantas pide `PLANT_LIST_FIELDS` (`identity,traits,image,status`; `traits` por los indicadores de `traits.ecological` e `image` por la imagen principal) y la ficha de familia `FAMILY_PLANTS_FIELDS` (`identity,status`). La ficha de planta sigue pidiendo la planta completa con `include=family`. La medición está en `specs/007-lightweight-list-requests/measurements.md`: la familia baja un 94,5 % y el listado un 82,6 %. `image` (`PlantImage`) es la imagen principal que calcula el back (el primer recurso `image` de `knowledge.resources`); es obligatoria porque toda planta tiene imagen, así que la tarjeta y `PlantHero` la pintan sin ramas. Si una planta guardada no tuviera imagen, las peticiones que piden `image` (o la planta completa) responden 500; la ficha de familia no se ve afectada.

El listado de familias envía `fields[families]=name,scientificName` (feature 008) con `FAMILY_LIST_FIELDS` de `services/familyListQuery.ts`: lo comparten el `FamilySelect` de `/plants` y `FamilyList` (`/families`), con una sola petición en caché. Devuelve `FamilyListItem[]` (`id` y `name` obligatorios, porque toda familia tiene nombre; `scientificName` opcional, como en `FamilyFieldset`); si falta `scientificName`, se pinta como cadena vacía. La ficha de familia sigue pidiendo la familia completa. La medición está en `specs/008-lightweight-family-list/measurements.md`: la respuesta baja un 95,7 % (161 336 B → 6 887 B).

`PlantStatusBadge` marca con «Borrada» las plantas `DELETED` en los dos listados, pero hoy no se ve en dev: el front no envía token, así que la API nunca le devuelve plantas borradas (deudas 24–26).

## 7. Dependencias externas

| Dependencia                    | Uso                                                                                                | Configuración                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **MiBancal API** (`agro-back`) | Única fuente de datos                                                                              | `VITE_API_URL` (prefijo concatenado a `/api/v1/...`) |
| **YouTube**                    | `<iframe>` embebido (`https://www.youtube.com/embed/{id}`) desde `knowledge.resources[type=video]` | Sin atributos `sandbox`, `allow` ni `loading="lazy"` |
| **URLs externas de imágenes**  | `<img src>` = primer `resources[type=image].url`                                                   | Sin `loading="lazy"` ni fallback                     |
| **Artículos externos**         | `<a target="_blank" rel="noopener noreferrer">`                                                    | —                                                    |
| **SonarCloud**                 | Análisis estático y cobertura (`vinjatovix_agro-front`)                                            | Secret `SONAR_TOKEN`                                 |
| **GitHub Actions**             | CI (ver 8.3)                                                                                       | —                                                    |
| **Railway**                    | Hosting y deploy del front                                                                         | `VITE_API_URL` por entorno, configurada a mano       |

No hay analítica, Sentry, feature flags, CDN de fuentes ni service worker. Las fuentes se sirven desde el propio origen (Fontsource).

## 8. Convenciones de código observadas

### 8.1 Código

- **Componentes**: `export default function X()` en la mayoría. Excepciones con export nombrado: `Loader`, `ErrorResponse`, `FamilyHero`, `PlantDetailStickyHeader` (este último como arrow function).
- **Props**: `interface Props` con todas las propiedades `readonly`.
- **CSS**: un `.css` junto a cada componente, importado desde él. Clases tipo BEM (`plant-filters__toggle--active`) y nombres de archivo en camelCase (`plantCard.css`). No hay CSS modules.
- **Textos**: todo pasa por `t('a.b.c')` con claves tipadas. La regla ESLint propia `local/no-hardcoded-ui-text` (`error`, spec 011, sobre `src/**/*.{ts,tsx}`) señala texto lingüístico (con alguna letra `\p{L}` tras quitar una lista cerrada de unidades: `mm`, `cm`, `m`, `km`, `mg`, `g`, `kg`, `ml`, `l`, `h`, `min`, `s`, `ha`, `°C`, `ºC`) en `JSXText`, en expresiones hijas de un elemento (literales, `quasis` de plantillas, ramas de ternarios, operandos de `&&`/`||`/`??` y de `+`, y lo envuelto en `as`, `satisfies` o `!`; no entra en llamadas, identificadores ni miembros) y en una lista cerrada de atributos (`aria-label`, `alt`, `title`, `placeholder`, `aria-description`, `aria-valuetext`, `aria-roledescription`) y props (`label`, `message`, `description`, `heading`, `text`). No tiene opciones ni lista de permitidos, y `npm run check:ui-text-bypass` (`scripts/checkUiTextRuleBypass.ts`, paso de CI tras Lint) falla si algún archivo de `src/` la menciona (directivas `eslint-disable*` o configuración en línea) o lleva una directiva `eslint-disable*` sin regla, que también la desactivaría. Limitaciones: un texto guardado en una constante y pintado después no se detecta, y tampoco las props de texto fuera de la lista (`labelAsc`/`labelDes` de `OrderSelector`, que hoy reciben «Az»/«Za» de `t()`); ambas se revisan en el PR. Tests en `tests/eslint-rules/` (`RuleTester`) y `tests/scripts/`.
- **Iconos**: Material Symbols Outlined compilados como catálogo estático en `src/shared/components/Icon/iconPaths.ts` a partir de `@material-symbols/svg-400`. El componente `<Icon />` implementa discriminación de accesibilidad (decorativo con `aria-hidden="true"` vs. semántico con `role="img"` y `aria-label`). Emojis eliminados al 100% de la UI y bloqueados en CI mediante el gate `npm run check:emoji`. El antiguo `iconsMap` queda eliminado definitivamente.
- **Imports**: rutas relativas (sin alias `@/`). Se usa `import type` (lo exige `verbatimModuleSyntax`).
- **Hooks de datos**: `queryKey` en forma de array. El listado usa la factoría `plantKeys.list(request)` (`src/shared/reactQuery/plantKeys.ts`) → `['plants', 'list', request]`, con la petición ya saneada, y el detalle `plantKeys.detail(id)` → `['plants', 'detail', id]`; las plantas de una familia usan `plantKeys.family(familyId)` → `['plants', 'family', familyId]`. Las familias usan `familyKeys` (`src/shared/reactQuery/familyKeys.ts`, feature 008): `familyKeys.list()` → `['families', 'list']`, compartida por `FamilySelect` y `FamilyList`, y `familyKeys.detail(idOrSlug)` → `['families', 'detail', idOrSlug]`, distinta para que la ficha nunca lea los datos parciales del listado.
- **`data-testid`** se usa ampliamente en componentes interactivos.
- **Formato**: Prettier con `printWidth: 80`, `singleQuote: true`, `semi: true`, `trailingComma: 'none'` y `arrowParens: 'always'`.
- **Commits**: Conventional Commits con scope por feature (`feat(plants): …`), validados por commitlint en local (husky) y en los PR. 42 commits en el historial.

### 8.2 Gates locales (husky)

- `pre-commit`: `lint-staged` (`eslint --fix` + `prettier --write` sobre ts/tsx; prettier sobre json/md/css).
- `commit-msg`: commitlint.
- `pre-push`: `check-circular` + `npm run test`.

### 8.3 CI/CD (`.github/workflows/`)

| Workflow             | Disparador                           | Pasos                                                                                                                                     |
| -------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`             | PR (todos) y push a `develop`/`main` | Matriz Node `^24.22.1`: `npm ci`, lint, check:ui-text-bypass, format:check, check:colors, typecheck, check-circular, test:coverage, build |
| `commitlint.yml`     | PR                                   | `wagoid/commitlint-github-action@v6`                                                                                                      |
| `sonarqube.yml`      | push a `main`/`develop` y PR         | test:coverage y SonarQube scan (actions fijadas por SHA)                                                                                  |
| `release-please.yml` | push a `main`                        | `release-please-action@v4`, `release-type: node` (changelog y tag). `version` sigue en `0.0.0`                                            |

**Colores literales** (feature 009): `npm run check:colors` ejecuta `scripts/checkColorLiterals.ts` con Node (type stripping, sin compilar) y recorre `src/**/*.{css,ts,tsx}` e `index.html`, excepto `src/styles/tokens.css`. Señala hex de 3/4/6/8 dígitos, `rgb()`/`rgba()`/`hsl()`/`hsla()` y los 148 nombres de color CSS: en CSS solo en valores de declaraciones (no en selectores, comentarios, cadenas ni `url()`); en TS/TSX recorre los literales de cadena y de plantilla con la API de `typescript` (ignora el texto JSX, los comentarios y las anclas de `href`/`to`/`src`), y los nombres solo cuando son el literal completo o el valor de un objeto `style`/`CSSProperties`; en `index.html`, los atributos `style`, los bloques `<style>` y `<meta name="theme-color">`. Imprime `ruta:línea:columna  literal` por `stderr` y sale con 1. Las reglas son puras (`scripts/colorLiterals.ts`, `scripts/colorCheckFiles.ts`) y tienen tests en `tests/scripts/`. El paso "Color literals" del CI va justo después de "Format check".

**Deploy**: en **Railway**, fuera de GitHub Actions; no hay ningún workflow ni archivo de configuración de deploy en el repo. Hay dos entornos:

- **dev**: se despliega automáticamente al mergear en `develop`.
- **prod**: existe pero todavía no tiene nada desplegado. **Se desplegará desde `main`** (confirmado), lo que encaja con `release-please`, que se ejecuta en push a `main`.

`VITE_API_URL` se configura **a mano** en las variables de cada entorno. Como Vite incrusta `import.meta.env` al compilar, cambiar una variable exige volver a construir.

Nota: `npm run typecheck` ejecuta `tsc --noEmit` (sin `-b`) contra el `tsconfig.json` raíz, que tiene `"files": []` y solo `references`. Sin `-b`, `tsc` no sigue las referencias, así que **ese paso no comprueba ningún archivo**. El chequeo de tipos real en CI ocurre en el paso `build` (`tsc -b`).

### 8.4 Configuración y secrets

- `.env` (sin versionar): `VITE_API_URL`. Es la única variable leída hoy (`src/services/api.ts`). No hay `.env.example`.
- Variable prevista (aún sin uso): `VITE_GOOGLE_CLIENT_ID`, que debe coincidir con el `GOOGLE_CLIENT_ID` del back. Es pública. Hoy no hay un valor real en ningún entorno (ver 11.2).
- Secrets de CI: `SONAR_TOKEN`. No hay feature flags.

## 9. Cobertura de tests por módulo (aproximada)

Ejecución local (2026-10-04): **27 ficheros, 148 tests, todos pasan**. Cobertura v8 global: **92,75 % statements / 83,96 % branches / 91 % funcs / 92,68 % lines**.

⚠️ Esa cifra **solo incluye los archivos que algún test importa**. Los archivos que nunca se importan no aparecen en el informe, así que el porcentaje real del repo es menor.

| Módulo                                                                         | Tests                     | Cobertura (aprox.)                                                                                                               | Calidad observada                                                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| app (router, queryClient, main)                                                | ninguno                   | 0 % (fuera del informe)                                                                                                          | —                                                                                                                                 |
| layout (`MainLayout`, `AuthLayout`)                                            | ninguno                   | 0 % (fuera del informe)                                                                                                          | —                                                                                                                                 |
| Home, auth, admin                                                              | ninguno                   | 0 % (fuera del informe)                                                                                                          | Placeholders                                                                                                                      |
| plants: `PlantsPage`, `PlantList`, `PlantCard`, `PlantDetail` y subcomponentes | 6 ficheros                | 85–100 % líneas, ramas 50–75 % en `QuickFacts`, `PlantCultivation`, `PlantEcology`, `PlantNotes`                                 | Tests de componente con RTL. `PlantList` se prueba contra `fetch` con el hook real (feature 003); `PlantsPage` mockea `usePlants` |
| plants: `usePlants`                                                            | 1                         | 100 % líneas                                                                                                                     | Mockea `plants.service`. Devuelve `{ query, request, …setters }`; la URL se sanea en `parsePlantListSearchParams`                 |
| plants: utils                                                                  | `getYoutubeEmbedUrl`      | alta                                                                                                                             | Unitarios puros                                                                                                                   |
| components/plants: `PlantFilters`, `usePlantFilters`, `useDebouncedCallback`   | 3                         | 89–93 %. **`plantFilter.utils` 0 %** (los type guards se mockean de forma indirecta). `SliderFilter` 50 %                        | Interacción con `user-event`                                                                                                      |
| families (páginas y hooks)                                                     | 5                         | `FamilyDetail` 87,5 %. Hooks cubiertos                                                                                           | Mockean services                                                                                                                  |
| services: `api.ts`                                                             | 1                         | 100 % líneas                                                                                                                     | Mockea `fetch`. Cubre errores JSON y no JSON                                                                                      |
| services: `plants.service.ts`                                                  | ninguno directo           | **0 %** (siempre se mockea)                                                                                                      | **La traducción a `filter[...]`/`sort[...]` no está probada**, que es justo donde está la divergencia con el contrato             |
| services: `families.service.ts`                                                | ninguno directo           | 50 %                                                                                                                             | —                                                                                                                                 |
| shared/api `QueryBuilder`                                                      | 1                         | 87,5 %                                                                                                                           | Unitario                                                                                                                          |
| shared/errors                                                                  | 2                         | 85–100 %                                                                                                                         | Unitario                                                                                                                          |
| shared/components                                                              | `Drawer`, `ErrorResponse` | `Pagination` 75 % (vía otros tests). `Badge`, `BodySection`, `Loader`, `LimitSelector` y `OrderSelector` solo de forma indirecta | —                                                                                                                                 |
| shared/hooks                                                                   | 3                         | alta                                                                                                                             | `useMediaQuery` mockea `matchMedia`                                                                                               |
| shared/utils                                                                   | 3 + pagination            | 95–100 %. `formatRange` sin test (y sin uso)                                                                                     | Unitarios puros                                                                                                                   |
| i18n                                                                           | `t`, `tValue`             | 100 %                                                                                                                            | Unitario                                                                                                                          |

Infraestructura de tests: `tests/test-utils/renderWithProviders.tsx` (QueryClient de test + `MemoryRouter`) y `createTestQueryClient` (`retry:false`, `gcTime:0`). Hay fixtures en `tests/fixtures/{plants,families}`. Usan la forma de `src/types`, no la del contrato; como el contrato es la fuente de verdad, **las fixtures están desactualizadas**. No hay MSW, tests E2E ni tests de contrato contra `openapi.yaml`.

Estado de lint: 0 errores, 0 avisos (`no-hardcoded-ui-text` en `error` solo sobre `src/`).

## 10. Deuda técnica y zonas de peligro

### Alta (puede romper en producción)

1. ~~**Orden del listado fuera de contrato**~~ (corregido en la feature 002, `fix(plants): use contract sort keys`): `getPlants` envía `sort[name]` o `sort[scientificName]`; las claves permitidas viven en `services/plantListQuery.ts` (feature 003).
2. **Tipos de dominio desincronizados con el contrato** (ver 6.2): `pruning.seasons`, `propagation.seasons` y `pollination.types` llegan con otra forma, por lo que hoy se pintan claves i18n crudas. Además hay campos opcionales tratados como obligatorios (`aliases`, `knowledge`, `ecology`), lo que puede provocar un `TypeError` en render. No hay validación en tiempo de ejecución (`apiFetch` hace `as T`).
3. ~~**Sin `errorElement` ni ErrorBoundary**~~ (corregido en la feature 010): los errores de pintado se contienen en tres niveles (ver 5) y los `throw` por parámetro de ruta de las fichas se eliminaron.
4. ~~**`FamilyList` ignora `error`**~~ (corregido en la feature 008): pinta `ErrorResponse` si la API falla y «No hay familias registradas.» si no hay familias.

### Media

5. ~~**Slug frente a id**~~ (corregido en la feature 005, `fix(families): load family plants by family id`): `FamilyDetail` carga la familia por slug y pasa el UUID resuelto (`familyQuery.data?.id`) a `useFamilyPlants`, que no se ejecuta hasta disponer de dicho UUID.
6. ~~**`limit` sin máximo**~~ (corregido en la feature 003): `parsePlantListSearchParams` solo admite los límites del selector (25, 50, 100).
7. ~~**El badge de familia en `PlantHero` muestra el UUID**~~ (corregido en la feature 005, `feat(plants): show family name in plant detail`): `getPlantById` consulta con `include=family` (cuya respuesta OpenAPI omite el `ETag`, documentado para cuando se implemente la pantalla de edición admin en la que se requerirá un `GET` completo sin `include`), `PlantHero` renderiza el nombre como enlace a `/families/<slug>` (o "Familia no disponible" atenuado si no se encuentra), y se eliminó el comentario `//TODO` de `useFamilyPlants.ts`.
8. **i18n** (resuelto en la spec 011): los meses salen de `common.months`, `Drawer` y `Pagination` usan `common.drawer.close` y `common.pagination.label`, y Datos rápidos (`QuickFacts`) usa `tValue` con los mismos grupos que el filtro (`plant.filters.lightTypeValues`, `plant.filters.lifeCycleValues`), pinta la frecuencia de riego tal cual y compone las horas con `plant.quick_facts.light_hours_value`.
9. **Acoplamiento inverso**: `PlantDetail/MonthChips` importa de `components/plants/PlantFilters`. (`FamilySelect` y `FamilyList` importan `useFamilies` de `shared/hooks`; el reexport de `pages/families/hooks/useFamilies.ts` se eliminó en la feature 008.)
10. **Duplicidad de estado de hemisferio**: en el listado vive en la URL (`?hemisphere`) y en el detalle en un `useState` local (no se comparte; al navegar vuelve a "north").
11. **`sowingMonth` singular**: la UI permite un solo mes aunque el contrato admite `hasAny` con varios.
12. **`useSliderFilter`** sincroniza estado en un `useEffect` con `eslint-disable react-hooks/set-state-in-effect`.
13. ~~**Convenciones de retorno de hooks inconsistentes**~~ (corregido en la feature 010: `useFamilies` y `useFamilyPlants` devuelven el `UseQueryResult`).
14. **`tsconfig.app.json` sin `strict`**, y el script `typecheck` no comprueba nada (`tsc --noEmit` sobre un `tsconfig` con `files: []`). Solo `build` (`tsc -b`) detecta errores de tipos. Ni `npm run check` ni el `pre-push` los detectan.

### Baja / higiene

15. **Código muerto**: `formatRange` (sin uso); ~20 entradas de `iconsMap` tras `/** */` sin uso; claves i18n sin uso (`app.welcome_message`, `common.save`, `common.cancel`, `common.not_found`, `plant.filters.aliases`, `plant.filters.light`, `plant.filters.strategicBenefits`); `useDrawer().toggle` sin uso; `react-query-devtools` instalado y sin montar; los tipos `Seasons` y `Range` son muy finos.
16. ~~**Typo en nombre de archivo**~~ (corregido): `shared/components/Badge/Badge.tsx` y `Badge.css`.
17. **`tValue` usa `as any`**: un valor desconocido devuelve la clave cruda en silencio.
18. **`BodySection`** genera `data-testid` a partir del título con emoji (`section-🌿 plantas`), lo que lo hace frágil.
19. **`Drawer`** sin foco atrapado ni `role="dialog"`/`aria-modal`. Los `<iframe>` de YouTube no tienen `loading="lazy"` ni `sandbox`.
20. **`loader.css`** tiene 474 líneas (animación decorativa), un tercio del CSS total.
21. **README** con una sola línea; `docs/` estaba vacío; no existe `.env.example`.
22. **`.tool-versions`** modificado localmente (Node 22.14.0 → 22.23.2) sin commitear.

### Riesgos que aparecerán al implementar auth (detectados al cruzar con las respuestas del back)

23. **`apiFetch` siempre hace `response.json()`** en respuestas OK, así que falla con respuestas sin cuerpo. Inventario confirmado por el back:

    | Endpoint                                 | Respuesta                                                     |
    | ---------------------------------------- | ------------------------------------------------------------- |
    | `POST /auth/register`                    | `201` sin cuerpo ni `content-type` (`res.status(201).send()`) |
    | `POST /plants`                           | `201` + `Plant` + `ETag`                                      |
    | `POST /families`                         | `201` + `Family`                                              |
    | `POST /beds`                             | `201` + `Bed`                                                 |
    | `DELETE /plants/:id`, `DELETE /beds/:id` | `204` sin cuerpo                                              |

    **Criterio acordado con el back**: `apiFetch` decide según la respuesta, no según el código de estado. Lee JSON solo si `status !== 204` y el `content-type` incluye `application/json`; en cualquier otro caso devuelve `undefined`. **No** basta con dejar de leer JSON en todos los 201, porque el resto de los 201 traen el recurso creado y el front lo necesita.

    **ETag en los 201 (confirmado)**: `POST /plants`, `POST /families` y `POST /beds` devuelven `ETag` (`setVersionETag`). El front puede usarlo como `If-Match` en un PATCH o DELETE justo después de crear, sin repetir el GET.

24. **Caché sin identidad**: las `queryKey` no incluyen al usuario ni su rol, y `QUERY_DEFAULTS.staleTime` es de 1 día. Un admin vería datos cacheados sin las plantas borradas (o al revés tras un logout) si no se invalida o se segmenta la caché.
25. **`apiFetch` sobrescribe `headers`**: `{ headers: {...}, ...options }` hace que unas `options.headers` (por ejemplo `Authorization` o `If-Match`) eliminen el `Content-Type`. Además envía `Content-Type: application/json` también en los GET.
26. **Token caducado en endpoints públicos → 401**: según el contrato actualizado, `GET /plants` y `GET /plants/{id}` responden 401 si el token está mal formado o caducado, aunque sean públicos. Si el front adjunta el token sin comprobar `exp`, una sesión caducada **rompe el catálogo público**. El front no debe enviar un token caducado y, ante un 401, debe limpiar la sesión y repetir la petición sin token o mandar al login, según la pantalla.

### Detectadas en la feature 008

27. **`QUERY_DEFAULTS` no es por recurso**: todos los hooks usan el mismo `staleTime`/`gcTime` (1 día / 7 días), en contra del principio V, que pide definirlos por recurso. Cambiarlo afecta a todos los recursos.
28. ~~**Paginación en un módulo de plantas**~~ (corregido en la feature 008): `PAGINATION_QUERY_KEYS`, `PAGINATION_LIMIT_MAX`, `SORT_DIRECTIONS`, `SortDirection` e `isSortDirection` viven en `services/listQuery.ts`, común a plantas y familias.

Marcadores encontrados: 0 `TODO`, 2 `eslint-disable` (`useSliderFilter.ts:9`, `tValue.ts:14`). No hay ningún `FIXME`, `HACK` ni `XXX`.

## 11. Pendientes y NEEDS-CLARIFICATION

**Estado a 2026-10-04: no queda ningún `[NEEDS-CLARIFICATION]` abierto.** Todo lo que estaba pendiente se ha resuelto con el propietario o con el equipo de back; lo que sigue es el registro de esas respuestas y decisiones. Lo único que queda fuera del front es configurar un `GOOGLE_CLIENT_ID` real en Google Cloud (ver 11.2).

### 11.1 Decisiones y contexto confirmados (2026-10-04)

**Por el propietario del front:**

- **Contrato**: `openapi.yaml` es la fuente de verdad actual. Por tanto, las divergencias de 6.2 y 6.3 son **bugs del front**: orden de plantas, `seasons[]` en poda y propagación, `pollination.types[]`, enums cerrados que el contrato define como texto libre, y opcionalidad de `aliases`, `knowledge` y `ecology`.
- **Deploy**: Railway; `VITE_API_URL` se configura a mano en cada entorno (ver 8.3).
- **Iconos**: los emojis de `iconsMap` se sustituyen por iconos.
- **Diseño**: se deja a elección del arquitecto. La decisión y los tokens están en `docs/design.md`.

**Por el equipo de backend:**

_Autenticación_

- JWT Bearer devuelto en el body (`{ token }`) por `POST /auth/login` y `/auth/google`. `/auth/register` responde `201` sin token (corregido en la segunda ronda, ver 11.2). No hay cookies, aunque el CORS tenga `credentials: true`.
- El front debe enviar `Authorization: Bearer <token>`.
- La caducidad la fija `JWT_DEFAULT_DURATION` (2h; leer `exp` del JWT, ver 11.2). `POST /auth/refresh` exige un token **todavía válido**; si ya caducó, hay que volver a hacer login.
- Payload del token: `id`, `email`, `username`, `roles[]` (`"admin"` o `"user"`). El front puede decodificarlo para mostrar u ocultar la interfaz de admin, pero **la autorización real la hace el backend** (middleware `isAdmin`).
- Almacenamiento recomendado: `sessionStorage` más una copia en memoria (sobrevive a F5 y desaparece al cerrar la pestaña). No usar `localStorage`. Renovar con `/auth/refresh` un poco antes de que caduque.

_Matriz de acceso_

| Pantalla / operación                     | Acceso                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Login, registro, Google, validar email   | Pública                                                                             |
| Listado y detalle de plantas             | Pública con auth opcional: **un admin autenticado ve también las plantas borradas** |
| Listado y detalle de familias            | Pública                                                                             |
| Bancales (todo)                          | Requiere auth                                                                       |
| Cambiar contraseña (`POST /auth/update`) | Requiere auth                                                                       |
| CRUD de catálogo                         | Requiere auth y rol `admin`                                                         |

_Admin_

- Plantas: `POST`, `PATCH /:id` y `DELETE /:id` son solo para admin.
- Familias: `POST` y `PATCH /:idOrSlug` son solo para admin. **No existe `DELETE` de familias** (previsto en la iteración 32 del roadmap del back).
- `PATCH` y `DELETE` exigen `If-Match` con el `ETag` del último GET. `ETag` ya es legible desde el navegador (está en `exposedHeaders`). Como el GET con `fields` o `include` **no** devuelve `ETag` (ver 6.1), el front debe hacer un GET completo antes de editar.
- El rol `collaborator` ya está disponible en el backend y habilitado como `ManageableRole` en la matriz de privilegios de `/admin`.

_Roadmap_

- **Bancales**: entran en el alcance; el CRUD completo ya está en el contrato. La colocación de plantas en un bancal y el motor espacial llegan en las fases 1 y 9–11 del back, así que el "diseñador de bancales" de Stitch aún no tiene API.
- **Enciclopedias** (fase 5, iteraciones 39–42): Plagas → `Anomaly` (plagas, enfermedades, trastornos, malas hierbas); Fertilizantes → `GardenInput` (abonos, remedios, bioestimulantes y calculadora de diluciones). El modelo está en `docs/spec/modules/knowledge.md` **del repo de back**. La lectura será pública y la escritura para admin. **Hoy no tienen endpoints**: el front debe ocultar esas pantallas o dejarlas tras un flag con datos de prueba, sin llamar a la API.

### 11.2 Huecos del contrato aclarados por el back (2026-10-04, segunda ronda)

Comportamiento real que **no está en `openapi.yaml`** y hay que tener en cuenta hasta que el contrato se actualice:

- **Plantas borradas**: con token `admin`, `GET /plants` devuelve plantas `ACTIVE` y `DELETED` **mezcladas**, que se distinguen por `status` y `deletedAt`; **no hay filtro por estado**. `GET /plants/{id}` de una planta `DELETED` responde 404 si no hay token admin. **Ya documentado en el contrato** (`security: [{}, bearerAuth]` y descripción de ambos GET).
- **Registro**: `POST /auth/register` responde `201` **sin token**; aquí el contrato es correcto. El `id` (uuid) lo genera el cliente. Flujo: **registro → login → token**. Hoy el login **no** exige el email validado (`LoginUserLocal` no lo comprueba); pasará a ser obligatorio en la **iteración 26** del roadmap del back.
- **Roles**: van dentro del JWT. Valores válidos: `"admin"` y `"user"`, en minúsculas. El back comprueba `roles.includes('admin')`. **Ya documentado en el contrato** (descripción de `securitySchemes.bearerAuth`).
- **Caducidad**: `JWT_DEFAULT_DURATION=2h` en todos los entornos. Recomendación del back: **no poner ese valor fijo en el front**, leer el `exp` del JWT y renovar entre 5 y 10 minutos antes de que caduque. Un token caducado no se puede renovar.
- **Google**: el front debe usar **el mismo `GOOGLE_CLIENT_ID` que el back** (el back solo acepta `idToken` emitidos para ese client ID). Es un valor público y puede ir en el `.env` del front (`VITE_GOOGLE_CLIENT_ID`). **Hoy todos los entornos tienen un valor de relleno, así que el login con Google no funcionará hasta que se configure un client ID real en Google Cloud.**

**Filtros de plantas (resuelto, tercera ronda)**: el back acepta exactamente los 11 filtros que declara el contrato; la validación está en `agro-back/src/apps/agroApi/controllers/Plants/requestSchemas.ts:348`. La afirmación anterior de que solo había 4 era errónea. Por tipo:

- Texto: `identity`, `lightType`, `rootSystem`.
- Identificador (uuid): `family`.
- Enumerado: `lifeCycle`, `sowingMethod` (`direct`/`starter`).
- Rango (`eq` = valor disponible, la planta coincide si su rango lo cubre): `spacingCm`, `soilPh`, `soilAvailableDepthCm`, `lightHoursMin`.
- Lista de meses: `sowingMonths` con `has` o `hasAny` (valores del 1 al 12).

Encaja con lo que envía el front (`plants.service.ts`). Siguen en pie dos matices ya descritos en 6.3: `lightType` y `rootSystem` son texto libre en el back, pero el front solo ofrece un conjunto fijo de literales; y la UI solo deja elegir un mes, aunque `hasAny` admite varios.

**Cuerpo del 201 de registro (resuelto)**: el back responde sin cuerpo y sin `content-type`, y **el contrato ya está corregido** (el `201` no tiene `content`). En el front se cubre con el criterio de `apiFetch` de la deuda 23.

Implicaciones para el front, derivadas de lo anterior (no son decisiones tomadas):

- La caché de React Query no tiene en cuenta la identidad: las `queryKey` de plantas no incluyen el usuario o el rol, y `staleTime` es de 1 día. Tras un login o logout de admin se servirían listados cacheados con o sin borradas (ver deuda 24).
- `apiFetch` no añade ninguna cabecera `Authorization` y su `...options` **reemplaza** el objeto `headers` completo, en vez de fusionarlo (ver deuda 25).

### 11.3 Decisiones del front (2026-10-04, tercera ronda)

- **Entornos**: Railway, con dev (despliegue al mergear en `develop`) y prod (vacío). Ver 8.3.
- **`openapi.yaml`**: se versiona en `agro-back` y al front se le entrega actualizado. **Decidido**: la copia se versiona en este repo en `contracts/openapi.yaml`, con un registro de entregas (fecha, origen y SHA-256) en `contracts/README.md`. No se edita en el front. Si se generan tipos a partir de él (openapi-typescript, por ejemplo) se decide en el plan de la spec de alineación con el contrato.
- **Idioma**: **solo castellano**, pensado para todo el público hispanohablante. No hay multi-idioma en el horizonte cercano; el contenido de las plantas no se traduce. Consecuencias:
  - Se mantiene el `t()` propio con una sola locale; no hace falta ninguna librería de i18n.
  - **Convención de datos (confirmada)**: en la BD las **claves** (valores de enumeraciones como `annual`, `full_sun`, `direct`, las claves de los métodos de propagación, las estaciones, `ACTIVE`…) están **en inglés**, y los **valores de texto libre** (descripciones, notas, buenas prácticas, nombres…) están **en castellano**. El front muestra siempre castellano: traduce las claves con el diccionario (`tValue`) y pinta el texto libre tal cual. Los meses llegan como números del 1 al 12 y es el front quien les pone nombre.
  - Los literales de la UI que estaban en inglés (meses, `"Close drawer"`, `"Pagination"`) ya están en castellano y salen del diccionario (spec 011).
  - Como el contrato define como texto libre campos que el front trata como enumeraciones (`lightType`, `rootSystem.type`, `pruning.type`…), una clave que no esté en el diccionario se ve sin traducir. Hoy `tValue` devuelve la clave en silencio.
  - Al dirigirse a todo el público hispanohablante, el selector de **hemisferio** gana peso: buena parte de ese público está en el hemisferio sur.
- **Iconos (delegado en el arquitecto)**: **Material Symbols Outlined**. Motivos: es la familia que usan los prototipos de Stitch, así que encaja con la referencia visual, y cubre mejor el dominio agrícola y botánico (`eco`, `potted_plant`, `grass`, `water_drop`, `compost`, `pest_control`…). Se carga como **SVG empaquetado, no como fuente web**, para no descargar la fuente completa ni ver un parpadeo de texto en lugar del icono. `iconsMap` pasa a ser un mapa de nombre de dominio a icono detrás de un componente `<Icon name=… />`, de modo que la sustitución quede en un solo sitio. El paquete y la forma concreta de importarlo se eligen en el plan de la spec.

### 11.4 Feature flags

Opciones valoradas:

| Opción                                                                                                     | A favor                                                                                                                       | En contra                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Variables de build por entorno** (`VITE_FEATURE_ENCYCLOPEDIAS=true` en Railway dev y `false` en prod) | Sin trabajo en el back. Encaja con la necesidad actual: ocultar pantallas sin API en prod y verlas en dev con datos de prueba | Cambiar un flag exige reconstruir; no permite flags por usuario                                                                              |
| **B. Colección de configuración en la BD**, servida por un endpoint del back                               | Se cambia en caliente; permitiría flags por rol o por usuario                                                                 | Requiere endpoint, contrato, permisos de admin y caché en el back; ese endpoint no existe hoy. Mientras carga hay que decidir qué se muestra |

**Recomendación: A ahora y B solo cuando aparezca una necesidad real de cambiar flags en caliente o por usuario.** Con solo dos entornos y un único caso de uso (las enciclopedias), B añade trabajo en dos repos sin ganar nada concreto hoy. Para que el paso a B no cueste, el front leería los flags siempre a través de un único módulo (`features.ts`, por ejemplo), de forma que solo cambiara el origen del dato.

**Decisión (confirmada): opción A**, variables `VITE_FEATURE_*` en el `.env` de cada entorno de Railway, leídas desde un único módulo del front.

---

## Anexo A: Referencia visual

La referencia visual (paleta, tipografía, forma, espaciado y distribución) y las decisiones de diseño e iconos están en **`docs/design.md`**.

Los prototipos de Stitch de los que sale esa referencia **no se versionan** (están en `.gitignore`). Por indicación del propietario, de ellos solo valen los colores y la distribución; **el contenido y los componentes no son correctos**. Incluían catálogo de plantas, ficha de planta, familias, login, registro, diseñador de bancales y enciclopedias de plagas y de fertilizantes. Las enciclopedias y el diseñador de bancales **todavía no tienen API** (ver 11.1).
