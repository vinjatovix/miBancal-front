# Referencia de diseño

> Extraído el 2026-10-04 de los prototipos de Stitch ("Botanical Precision"). Los prototipos no se versionan en el repo.
> **Solo valen los colores, la tipografía y la distribución.** El contenido y los componentes de los prototipos **no son correctos** y no se usan como especificación funcional ni de datos.
> Paleta, tipografía, radios, espaciado, sombras y anillo de foco están definidos como custom properties en `src/styles/tokens.css` y aplicados en todas las pantallas existentes (feature 009). Fuera de ese archivo no hay colores literales.
> **Nota de gobernanza (FR-040)**: Los tokens Material 3 originales quedan marcados como **heredados** y conviven temporalmente con el nuevo sistema de diseño accesible hasta su retirada en T143. El nuevo sistema se basa en roles semánticos emparejados (con contraste WCAG 2.2 AAA garantizado) y primitivas de familia privadas.

## Sistema de diseño accesible (Spec 039)

### Familias de color (primitivas privadas)

Las variables `--palette-*` son privadas de `src/styles/tokens.css` y no se consumen directamente en componentes:

- `forest`: verde bosque (`--palette-forest-50` a `950`), acción principal, enlaces y foco.
- `sage`: verde salvia (`--palette-sage-50` a `900`), selección activa y confirmación de éxito.
- `earth`: ocres y tierras (`--palette-earth-50` a `600`), acentos cálidos y bancales.
- `harvest`: ámbar cosecha (`--palette-harvest-50` a `600`), advertencias y medidores.
- `clay`: terracota arcilla (`--palette-clay-50` a `990`), errores y acciones destructivas.
- `sky`: azul cielo (`--palette-sky-50` a `600`), mensajes informativos y roles de usuario.
- `neutral`: escala neutra cálida (`--palette-neutral-50` a `980`), superficies, texto y bordes.

### Roles semánticos (ambos temas)

| Rol                  | Claro     | Oscuro    | Uso                                                 |
| -------------------- | --------- | --------- | --------------------------------------------------- |
| `bg-page`            | `#f3f8f4` | `#0f1714` | Fondo de página y barra del navegador               |
| `bg-surface`         | `#ffffff` | `#16201b` | Tarjetas, cabecera, menús, diálogos, toasts, campos |
| `bg-sunken`          | `#e9f1eb` | `#121b17` | Listas, zonas agrupadas, carril de medidores        |
| `bg-hover`           | `#dfe9e2` | `#1f2b25` | Hover de filas, chips y botones planos              |
| `bg-inverse`         | `#1e2a24` | `#e2ebe5` | Fondos de tooltips e invertidos                     |
| `bg-scrim`           | `fg` 40%  | negro 65% | Velo de modales y cajones vía `color-mix`           |
| `fg`                 | `#13201a` | `#e2ebe5` | Texto principal (≥ 7:1)                             |
| `fg-muted`           | `#35443c` | `#b8c7be` | Texto secundario y auxiliar (≥ 7:1)                 |
| `fg-placeholder`     | `#55635b` | `#97a69d` | Placeholders en campos de formulario (≥ 4.5:1)      |
| `fg-link`            | `#1c5236` | `#9fd8b5` | Enlaces en texto y navegación (≥ 7:1)               |
| `fg-on-inverse`      | `#eef5f0` | `#14201a` | Texto sobre superficies invertidas (≥ 7:1)          |
| `border-decor`       | `#c4d0c7` | `#34443b` | Separadores y divisores decorativos                 |
| `border-control`     | `#62726a` | `#8a9b91` | Bordes de campos y controles (≥ 3:1)                |
| `border-strong`      | `#3f4e46` | `#aebdb4` | Bordes activos y destacados (≥ 3:1)                 |
| `focus`              | `#1f5038` | `#9fe0b8` | Anillo global de foco accesible (≥ 3:1)             |
| `action-bg`          | `#1f5038` | `#8fd0a9` | Fondo de acción principal                           |
| `action-bg-hover`    | `#163d2a` | `#a6dcbb` | Hover de acción principal                           |
| `action-bg-active`   | `#0e2c1e` | `#bde7cc` | Active de acción principal                          |
| `on-action`          | `#ffffff` | `#0a2116` | Texto e icono sobre acción principal (≥ 7:1)        |
| `secondary-fg`       | `#1f5038` | `#9fd8b5` | Texto de acción secundaria (≥ 7:1)                  |
| `secondary-border`   | `#1f5038` | `#8fd0a9` | Borde de acción secundaria (≥ 3:1)                  |
| `selected-bg`        | `#d2e8d8` | `#24402f` | Fondo de selección activa                           |
| `on-selected`        | `#10301e` | `#d4efdc` | Texto de selección activa (≥ 7:1)                   |
| `selected-indicator` | `#2c6a48` | `#8fd0a9` | Indicador visual de selección (≥ 3:1)               |
| `earth-bg`           | `#f5e8da` | `#3a2a1b` | Fondo tierra / acento cálido                        |
| `on-earth`           | `#4f2e10` | `#f3dcc3` | Texto sobre fondo tierra (≥ 7:1)                    |
| `earth-accent`       | `#8a5a2e` | `#d9a876` | Borde o icono sobre tierra (≥ 3:1)                  |
| `success-bg`         | `#ddf0e2` | `#183526` | Fondo de éxito                                      |
| `on-success`         | `#0f3d22` | `#c9ecd5` | Texto sobre fondo de éxito (≥ 7:1)                  |
| `success-icon`       | `#3a8657` | `#93e0ae` | Icono y borde de éxito (≥ 3:1)                      |
| `warning-bg`         | `#fcecc7` | `#3a2e10` | Fondo de aviso                                      |
| `on-warning`         | `#4a3200` | `#f8e2a8` | Texto sobre fondo de aviso (≥ 7:1)                  |
| `warning-icon`       | `#8a5b00` | `#e7b54a` | Icono y borde de aviso (≥ 3:1)                      |
| `error-bg`           | `#fbe3dc` | `#3d1d17` | Fondo de error                                      |
| `on-error`           | `#6e1a0c` | `#ffd9cf` | Texto sobre fondo de error (≥ 7:1)                  |
| `error-icon`         | `#8e2513` | `#e8806a` | Icono y borde de error (≥ 3:1)                      |
| `error-text`         | `#8c2412` | `#ffb3a3` | Texto de error inline junto a campo (≥ 7:1)         |
| `danger-bg`          | `#9e2c17` | `#ffab98` | Fondo de acción destructiva                         |
| `danger-bg-hover`    | `#82220f` | `#ffc2b3` | Hover destructivo                                   |
| `on-danger`          | `#ffffff` | `#3d0c03` | Texto sobre fondo destructivo (≥ 7:1)               |
| `info-bg`            | `#dcebf4` | `#132d3d` | Fondo informativo                                   |
| `on-info`            | `#0b3550` | `#cfe6f5` | Texto sobre fondo informativo (≥ 7:1)               |
| `info-icon`          | `#1d6390` | `#86c3ea` | Icono y borde informativo (≥ 3:1)                   |
| `disabled-bg`        | `#e4e9e6` | `#222c27` | Fondo de control deshabilitado                      |
| `on-disabled`        | `#56635c` | `#94a299` | Texto de control deshabilitado (≥ 4.5:1)            |
| `disabled-border`    | `#6c7a72` | `#6f8077` | Borde de control deshabilitado (≥ 3:1)              |

### Foco, objetivo táctil y movimiento

- **Foco global**: `--focus-ring-width: 2px`, `--focus-ring-offset: 2px`, `--focus-ring-color: var(--color-focus)`. En `:focus-visible`, outline de 2px sólido sin halos ni `box-shadow` difusos.
- **Objetivos táctiles**: `--target-min: 24px` en escritorio fino, adaptado a `44px` en dispositivos táctiles (`pointer: coarse`) o pantallas estrechas (`max-width: 768px`). `--target-min-fine: 24px`.
- **Movimiento**: `--motion-fade: 150ms`, `--motion-enter: 200ms`. Se anula o minimiza con `@media (prefers-reduced-motion: reduce)`.

## Decisiones

| Tema   | Decisión                                                                                                                                                                                                                                    | Motivo                                                                                                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paleta | Los tokens Material 3 de abajo (front-matter del `DESIGN.md` de Stitch, idénticos al `tailwind.config` de todos los prototipos)                                                                                                             | Es la paleta que realmente pintan los prototipos. Cada fondo tiene su color de texto emparejado (`on-*`), así que el contraste viene resuelto. Se traslada tal cual a custom properties. Los hex sueltos del texto del `DESIGN.md` (`#F9F8F5`, `#6C8A74`, `#D4A373`…) **no** se adoptan |
| Iconos | Iconos vectoriales SVG a todo color (Twemoji), empaquetados como glifos estáticos en `src/shared/components/Icon/iconPaths.tsx` a partir de `@twemoji/svg` y renderizados a través de `<Icon />`. Sustituye al antiguo `iconsMap` de texto. | Recupera la viveza, calidez y metáforas botánicas originales (ADN, calavera, maceta, gota de agua, etc.) garantizando renderizado vectorial nítido e idéntico en todas las plataformas y control de accesibilidad.                                                                      |
| Emojis | Se eliminan de la UI al 100%. Sin excepciones. Comprobado en CI con `npm run check:emoji`.                                                                                                                                                  | Decisión de diseño y accesibilidad: coherencia visual multiplataforma y ausencia de ruido en lectores de pantalla.                                                                                                                                                                      |

## Paleta (tokens)

| Token                       | Valor     | Token                        | Valor     |
| --------------------------- | --------- | ---------------------------- | --------- |
| `primary`                   | `#002718` | `on-primary`                 | `#ffffff` |
| `primary-container`         | `#133e2b` | `on-primary-container`       | `#bfedd2` |
| `primary-fixed`             | `#bfedd2` | `primary-fixed-dim`          | `#a3d1b6` |
| `on-primary-fixed`          | `#002113` | `on-primary-fixed-variant`   | `#254f3a` |
| `inverse-primary`           | `#a3d1b6` | `surface-tint`               | `#3d6751` |
| `secondary`                 | `#486551` | `on-secondary`               | `#ffffff` |
| `secondary-container`       | `#caebd1` | `on-secondary-container`     | `#4e6b56` |
| `secondary-fixed`           | `#caebd1` | `secondary-fixed-dim`        | `#aeceb6` |
| `on-secondary-fixed`        | `#042011` | `on-secondary-fixed-variant` | `#314d3a` |
| `tertiary`                  | `#341b00` | `on-tertiary`                | `#ffffff` |
| `tertiary-container`        | `#502f09` | `on-tertiary-container`      | `#c69667` |
| `tertiary-fixed`            | `#ffdcbd` | `tertiary-fixed-dim`         | `#f0bd8b` |
| `on-tertiary-fixed`         | `#2c1600` | `on-tertiary-fixed-variant`  | `#623f18` |
| `error`                     | `#ba1a1a` | `on-error`                   | `#ffffff` |
| `error-container`           | `#ffdad6` | `on-error-container`         | `#93000a` |
| `background`                | `#f3fbf6` | `on-background`              | `#151d1a` |
| `surface`                   | `#f3fbf6` | `on-surface`                 | `#151d1a` |
| `surface-dim`               | `#d3dcd7` | `surface-bright`             | `#f3fbf6` |
| `surface-container-lowest`  | `#ffffff` | `surface-container-low`      | `#edf6f1` |
| `surface-container`         | `#e7f0eb` | `surface-container-high`     | `#e2eae5` |
| `surface-container-highest` | `#dce4e0` | `surface-variant`            | `#dce4e0` |
| `on-surface-variant`        | `#414943` | `outline`                    | `#717973` |
| `outline-variant`           | `#c1c8c1` | `inverse-surface`            | `#2a322f` |
| `inverse-on-surface`        | `#eaf3ee` |                              |           |

Asignación por rol en el front:

- Fondo de página `background`; superficies (tarjetas, barra superior, drawer, sidebar, secciones) `surface-container-lowest`; fondos suaves (listas, badges) `surface-container-low`; hover `surface-container-high` o `elevation-1-hover` en tarjetas.
- Texto principal `on-surface`; etiquetas y texto secundario `on-surface-variant`; enlaces de acción `surface-tint`.
- Estados activos: `primary-container` + `on-primary-container` en página activa, hemisferio activo, meses activos y botón flotante de filtros; `secondary-container` + `on-secondary-container` en filtros activos, pestañas activas y badges de familia y nombre científico.
- Bordes `outline` en controles interactivos y `outline-variant` en superficies y separadores. Error: `error-container` + `on-error-container` con borde `error`. Deshabilitado: `opacity: 0.6`.
- `Loader` con la paleta: tierra `tertiary-container`, semillas `on-tertiary-fixed-variant`, sol y centro de la flor `tertiary-fixed-dim`, tallo `secondary`, hojas `surface-tint`, nube `surface-dim`, gotas `secondary-fixed-dim`, pétalos `tertiary-fixed`.

Equivalencias para quien lea el texto original de Stitch: el verde "Deep Forest Emerald" (`#133E2B`) es `primary-container`; el acento ocre se cubre con `tertiary-fixed-dim` (`#f0bd8b`).

Usos de referencia: `primary-container` para acciones principales, estado activo de navegación, toggles activos, página activa de la paginación y relleno de sliders; `secondary-container` para fondos suaves y filtros activos; `tertiary-fixed-dim` como acento puntual (avisos, siembra, fotoperiodo).

Todos los tokens están en `src/styles/tokens.css` como `--color-<token>`, con el valor de esta tabla. Es el único archivo del front con colores literales.

Derivados (colores de la paleta con transparencia, no colores nuevos): `--color-scrim` = `color-mix(in srgb, var(--color-on-surface) 40%, transparent)` para el overlay del drawer, y `--color-surface-translucent` = `color-mix(in srgb, var(--color-surface) 80%, transparent)` para la cabecera sticky de la ficha.

## Tipografía

| Estilo                | Familia                 | Tamaño / interlineado                 | Peso |
| --------------------- | ----------------------- | ------------------------------------- | ---- |
| `headline-xl`         | Newsreader              | 2.5rem / 3rem (móvil 2rem / 2.5rem)   | 500  |
| `headline-lg`         | Newsreader              | 1.75rem / 2.25rem                     | 500  |
| `headline-md`         | Newsreader              | 1.375rem / 1.75rem                    | 600  |
| `headline-sm`         | Newsreader              | 1.125rem / 1.5rem                     | 600  |
| `taxonomy-scientific` | Newsreader, **cursiva** | 0.875rem / 1.25rem, tracking 0.015em  | 400  |
| `body-lg`             | Manrope                 | 1rem / 1.5rem                         | 400  |
| `body-md`             | Manrope                 | 0.875rem / 1.375rem                   | 400  |
| `body-sm`             | Manrope                 | 0.75rem / 1.125rem                    | 400  |
| `label-lg`            | Manrope                 | 0.875rem / 1.25rem                    | 600  |
| `label-md`            | Manrope                 | 0.75rem / 1rem, tracking 0.025em      | 600  |
| `label-sm`            | Manrope                 | 0.6875rem / 0.875rem, tracking 0.05em | 700  |

Newsreader para titulares, nombres comunes destacados y nombres científicos (en cursiva). Manrope para toda la interfaz, etiquetas, meses, métricas e inputs.

Cada estilo es un token shorthand de `font` (`--type-<estilo>`, por ejemplo `--type-label-lg: 600 0.875rem/1.25rem var(--font-ui)`) más `--tracking-<estilo>` cuando tiene tracking; `headline-xl` cambia a su tamaño móvil con `max-width: 768px`. Las fuentes se sirven desde el propio origen con Fontsource (`@fontsource/manrope` y `@fontsource/newsreader`, solo subconjunto latin): Manrope 400/600/700 y Newsreader 500/600/400 cursiva/600 cursiva, con `font-display: swap` y fuentes de respaldo con métricas ajustadas (`src/styles/fonts.css`). Los nombres científicos usan el componente `ScientificName` (`taxonomy-scientific`, o la variante `title` que hereda el tamaño del titular).

## Forma, espaciado y elevación

- **Radios**: `sm` 0.125rem · `DEFAULT` 0.25rem (inputs, chips de mes, thumbs de slider) · `md` 0.375rem · `lg` 0.5rem (tarjetas, media, menús, botones) · `xl` 0.75rem (paneles de filtros, diálogos) · `full` 9999px (solo badges, etiquetas y toggles tipo pill).
- **Espaciado**: ritmo base de 8px. `space-xs` 0.25rem (solo huecos entre badges), `space-sm` 0.5rem, `space-md` 1rem, `space-lg` 1.5rem, `space-xl` 2.5rem. Gutter 1.25rem (escritorio 1.5rem). Margen lateral 1rem / tablet 2rem / escritorio 3rem.
- **Elevación** con planos tonales y sombras tintadas en verde, no con bordes gruesos:
  - Nivel 1 (tarjetas): `0 1px 3px rgba(19,62,43,0.04), 0 6px 16px rgba(19,62,43,0.03)`; hover `0 8px 24px rgba(19,62,43,0.08)`.
  - Nivel 2 (drawers, menús, modales): `0 12px 32px rgba(19,62,43,0.12)`.
  - Bordes finos de 1px con `outline-variant`.
- **Tokens**: `--radius-sm|default|md|lg|xl|full`, `--space-xs|sm|md|lg|xl`, `--gutter`, `--margin-inline` (1rem; 2rem desde 769px) y `--margin-inline-desktop` (3rem, definido sin conectar porque el front aún no tiene el breakpoint de 1200px), `--elevation-1`, `--elevation-1-hover` y `--elevation-2`.
- **Foco**: anillo común de 2px `primary` con separación de 2px en `:focus-visible` (`src/index.css`), sin estilos de foco propios por componente.

## Distribución

| Breakpoint           | Layout                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| Escritorio (≥1200px) | Sidebar de filtros sticky de 320px más un grid de 3–4 tarjetas por fila |
| Tablet (768–1199px)  | Filtros en drawer o sheet; grid de 2–3 tarjetas                         |
| Móvil (<768px)       | Una columna; barra o botón flotante para abrir filtros y orden          |

Coincidencias con el front actual: el `Drawer` ya mide 320px por defecto y `PlantsPage` ya cambia de layout a 768px. El front actual no tiene el breakpoint de 1200px.

- **Barra superior**: sticky (`position: sticky; top: 0; z-index: 1000;`), altura fijada mediante `--app-header-height: 64px`, superficie blanca con borde inferior fino; navegación con subrayado de 2px en el elemento activo.
- **Scroll y arquitectura de layout**: scroll vertical único a nivel de `window` del navegador en toda la aplicación (`.app-shell` con `min-height: 100dvh; display: flex; flex-direction: column;`). En `.app-content`, padding estándar de `var(--space-lg)`.
- **Catálogo de plantas**: maquetación fluida `.plants-layout` sin recorte de altura que compensa el padding exterior con margen negativo. Sidebar de escritorio (`.plants-sidebar`) sticky (`top: var(--app-header-height); height: calc(100dvh - var(--app-header-height)); overflow-y: auto;`) con scroll interno exclusivo cuando la altura de los filtros supera el viewport; columna principal `.plants-main` (`<section>`) integrada en el scroll nativo del documento con su propio padding. En móvil (<768px), layout en bloque con apertura de filtros mediante Drawer y bloqueo de scroll en el `body`.
- **Restauración y reinicio de scroll**: `<ScrollRestoration />` en `MainLayout` para restaurar coordenadas en navegación histórica (`POP`), complementado con `useCatalogScrollReset` en el catálogo para reiniciar el scroll a la parte superior (`0, 0`) al cambiar página, filtros, orden o límite de página.
- **Tarjeta de planta**: imagen con proporción 4:3 o 1:1, nombre común en Newsreader y nombre científico como badge en cursiva.
- **Paginación**: página activa en pill con `primary-container`; el resto, texto plano con hover suave.
