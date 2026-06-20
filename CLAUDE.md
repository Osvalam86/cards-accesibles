# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install   # instala dependencias (requiere pnpm v10+)
pnpm dev       # levanta Vite en localhost:5173
pnpm build     # build de producción
pnpm preview   # previsualiza el build
```

> **Nota pnpm:** el paquete `@parcel/watcher` tiene su build script aprobado en `pnpm-workspace.yaml`. Si aparece `ERR_PNPM_IGNORED_BUILDS`, verificar que `allowBuilds['@parcel/watcher']: true` esté presente en ese archivo.

## Estructura del proyecto

Proyecto de práctica: el mismo componente de card de artículo accesible implementado con tres enfoques CSS distintos. No hay JS de aplicación — cada página es estática y su única entrada es la importación de estilos.

```
├── index.html          # landing con navegación entre los 3 ejemplos
├── bem.html            # ejemplo BEM
├── bemit.html          # ejemplo BEMIT
├── tailwind.html       # ejemplo Tailwind CSS
├── public/
│   └── placeholder.svg # imagen de placeholder 16:9 con patrón hatch
└── src/
    ├── shared.css      # animación de entrada compartida (page-enter en <main>)
    ├── index/
    │   └── styles.css  # estilos de la landing (index.html)
    ├── bem/
    │   └── card.scss   # estilos BEM — bloques: .demo, .card
    ├── bemit/
    │   └── card.scss   # estilos BEMIT — capas: o-, c-, u-, is-
    └── tailwind/
        └── styles.css  # solo: @import "tailwindcss"
```

## Arquitectura CSS

### BEM (`src/bem/card.scss`)
Clases planas sin namespaces. Dos bloques: `.demo` (wrapper de página) y `.card` (componente). Los elementos usan `&__elemento` anidado en SCSS.

### BEMIT (`src/bemit/card.scss`)
Extiende BEM con namespaces de capa siguiendo el Triángulo Invertido:
- `o-` Objects: solo layout, sin apariencia (`o-wrapper`, `o-grid`)
- `c-` Components: UI con estilo (`c-card`, `c-page-header`)
- `u-` Utilities: helpers de una sola responsabilidad (`u-visually-hidden`)
- `is-` States: estado temporal (parte de la convención BEMIT; sin instancia activa en el ejemplo actual)

### Tailwind (`src/tailwind/styles.css`)
Solo `@import "tailwindcss"`. Todo el estilo va en clases de utilidad directamente en el HTML. El stretched link usa `before:absolute before:inset-0` como utilidades sobre el enlace del título; el foco del `article` se gestiona con `:has()` desde `styles.css`.

### Tokens de color (custom properties, dos capas)

`bem/card.scss`, `bemit/card.scss` e `index/styles.css` definen sus colores como CSS custom properties en `:root`, en **dos capas**. Tailwind no participa: sus tokens viven en el framework.

- **Primitivos** — el inventario crudo de la paleta. Se nombran por **familia de color literal + escala numérica** (`--blue-600`, `--gray-100`, `--cream-50`), donde el número va de claro (50) a oscuro (900). Nunca llevan rol (`primary`, `secondary`) — eso acoplaría intención a la capa más cruda.
- **Semánticos** — el rol/uso, apuntan a un primitivo vía `var()` (`--c-accent: var(--blue-600)`, `--c-text`, `--c-bg-card`). Todo el CSS de componentes consume **solo** semánticos.

Para cambiar de color o tematizar (claro/oscuro, marca alterna) se redefine **solo la capa semántica** en un scope; los primitivos y los componentes no se tocan. Sass queda reservado al anidamiento (`&__elemento`); no hay variables `$` de color.

## Accesibilidad — patrón de card

Estructura accesible compartida por los 3 ejemplos (patrón **stretched link**, no un `<a>` que envuelva la card):
- `<article>` como raíz semántica, con `position: relative`
- El enlace del título vive dentro del `<h2>`; su `::before` con `inset: 0` estira el área clickeable a toda la card
- Dos enlaces por card → dos tab stops: la **categoría** (tag) y el **título**. El tag lleva `position: relative; z-index: 2` para seguir siendo clickeable sobre el `::before` (`z-index: 1`)
- Imagen decorativa: `<div class="...__media">` + `<img alt="">` (alt vacío; el título ya describe el contenido). No se usa `<figure>`
- `<time datetime="YYYY-MM-DD">` para fecha machine-readable
- `:focus-visible` visible en cada card, con tratamiento propio por página: ring negro (BEM), outline naranja de marca (BEMIT), outline cian vía `:has()` (Tailwind). El outline azul `#2563eb` de 3px es el de la landing (`index.html`)

## Vite multi-page

En **dev** (`pnpm dev`) Vite sirve cualquier `.html` de la raíz por su ruta. Pero en **build** (`pnpm build`) solo `index.html` es entrada por defecto: las páginas extra deben declararse en `build.rollupOptions.input` (en `vite.config.js` están las 4: `index`, `bem`, `bemit`, `tailwind`). Sin eso, las páginas funcionan en local pero dan 404 en producción. El plugin `@tailwindcss/vite` procesa solo el `styles.css` de Tailwind; los SCSS de BEM y BEMIT los maneja el paquete `sass` sin configuración adicional.
