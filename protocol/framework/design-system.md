# Design System Standards

> Criterios visuales, de layout y de componentes.
> Aplica a todo proyecto con UI web (Tailwind CSS o similar).
>
> **Nota por proyecto:** Si tu proyecto tiene un Design Bible o
> guia visual especifica, este doc cubre tokens, tipografia y componentes.
> La guia del proyecto cubre estructura y navegacion.

---

## Principios

1. **Contenido antes que chrome** — el primer contenido util debe verse en el primer viewport
2. **Tokens, no valores** — todo color, spacing y radius sale de variables CSS o Tailwind
3. **Maximo 2 familias tipograficas por pantalla**
4. **Responsive por defecto** — no se acepta UI que solo funcione en desktop
5. **Light + dark** — todo componente nuevo debe funcionar en ambos temas

---

## Tokens

### Color

| Uso | Token | Anti-pattern |
|-----|-------|-------------|
| Accion principal | `var(--color-primary)` | ~~hardcoded hex~~ |
| Texto secundario | `var(--color-muted-foreground)` | ~~`text-gray-500`~~ |
| Error | `var(--color-error)` | ~~`text-red-500`~~ |
| Exito | `var(--color-success)` | ~~`text-green-500`~~ |
| Warning | `var(--color-warning)` | ~~`text-yellow-500`~~ |
| Info | `var(--color-info)` | ~~`text-blue-500`~~ |
| Bordes | `var(--color-border)` | ~~`border-gray-200`~~ |

**Regla:** Nunca hardcodear hex en componentes. Si necesitas un color nuevo, primero elevalo a token.

### Spacing

| Uso | Clase | Anti-pattern |
|-----|-------|-------------|
| Padding de contenido | `.p-content` | ~~`p-4`~~ ~~`p-6`~~ arbitrario |
| Padding de card | `.p-card` | ~~`p-3`~~ |
| Gap entre secciones | `.gap-section` | ~~`gap-8`~~ |
| Gap inline | `.gap-inline` | ~~`gap-2`~~ |
| Gap compacto | `.gap-tight` | ~~`gap-1`~~ |

### Estados interactivos

| Estado | Clase | Anti-pattern |
|--------|-------|-------------|
| Item seleccionado | `.item-selected` | ~~`bg-blue-100`~~ variantes ad-hoc |
| Item hover | `.item-hover` | ~~`hover:bg-gray-50`~~ |

---

## Tipografia

### Reglas

| Regla | Razon |
|-------|-------|
| Texto funcional nunca < 14px | Accesibilidad |
| `line-height` de lectura: 1.8-1.95 | Confort visual |
| Maximo 1 familia dominante por viewport | Jerarquia clara |
| No `uppercase + tracking` en bloques persistentes | Fatiga visual |

### Escala recomendada

| Nombre | Tamano/line-height |
|--------|-------------------|
| `ui-sm` | 14/20 |
| `ui-md` | 16/24 |
| `body` | 18/30 |
| `reading` | 20-25/38-48 |
| `title-sm` | 24/32 |
| `title-md` | 32/40 |
| `hero` | 40-56/44-64 |

---

## Layout

### Archetypes de pagina

| Archetype | Cuando | Patron |
|-----------|--------|--------|
| **Editorial** | Lectura, articulo | Columna estrecha centrada, max `75ch` |
| **Grid** | Biblioteca, catalogo | Grid responsive con cards |
| **Conversacional** | Chat | Columna centrada + sidebar opcional |
| **Dashboard** | Admin, consola | Full-width con tabla/filtros |
| **Foco** | Lector, editor inmersivo | Sin nav global, shell propio |

### Responsive breakpoints

| Breakpoint | Nombre | Comportamiento |
|-----------|--------|----------------|
| < 640px | Mobile | 1 columna, touch targets 44px min |
| 640-1024px | Tablet | Adaptar grid, colapsar sidebars |
| > 1024px | Desktop | Layout completo |

### Reglas de layout

| Regla | Razon |
|-------|-------|
| Longitud de linea de lectura: 60-75ch | Confort de lectura |
| Touch target minimo: 44px | Accesibilidad movil |
| Chrome antes del contenido: max 220px movil, 320px desktop | Contenido primero |
| Maximo 1 accion principal visible por superficie | Foco del usuario |
| Sidebar: colapsable en movil, nunca obligatorio | Responsive |

---

## Componentes

### Antes de crear un componente nuevo

1. Existe en la UI library del proyecto? -> **usar**
2. Existe un patron similar en otro componente? -> **reusar el patron**
3. Si es genuinamente nuevo -> crear con:
   - Props tipadas
   - Funciona en light + dark
   - Responsive
   - Sin hex hardcodeados

### Organizacion

| Tipo | Donde | Ejemplo |
|------|-------|---------|
| Primitiva UI | `components/ui/` | `button`, `input`, `dialog` |
| Componente de dominio | `components/` | `user-card`, `chat-message` |
| Componente de pagina | Junto a la pagina | `dashboard-page-client.tsx` |

### Promocion a primitivo compartido

Cuando un componente se usa en 2+ proyectos:

1. Extraer a un paquete compartido (`packages/ui/` en monorepos)
2. El componente original se reemplaza por un import del shared
3. El shared se gobierna por el design-system del framework, no por un proyecto especifico

**Regla:** Si dos proyectos tienen el mismo componente con ligeras diferencias, refactorizar a uno shared con props — no mantener dos versiones.

### Anti-patterns

- No crear variantes locales de botones si una variante puede subir a `ui/button`
- No mezclar `client` y `server` logic en el mismo archivo
- No crear componentes wrapper que solo pasan props (thin wrappers)
- No usar `any` en props — tipar explicitamente
- No mezclar 3+ tamanos de radius en la misma superficie

---

## Superficies y radios

### Superficies

| Nivel | Uso |
|-------|-----|
| `surface-1` | Canvas, fondos principales |
| `surface-2` | Cards, paneles elevados |
| `surface-3` | Estados destacados, agrupaciones internas |

### Sombras

Discretas. El producto no debe parecer marketing glossy ni admin panel agresivo.

- `shadow-surface-sm` — elevacion sutil
- `shadow-surface-md` — cards
- `shadow-surface-lg` — modales, sheets

---

## Contraste y accesibilidad

| Criterio | Minimo |
|----------|--------|
| Texto funcional | WCAG AA (4.5:1) |
| Texto grande (>18px bold) | WCAG AA (3:1) |
| Focus indicators | Visible en ambos temas |
| Labels de formulario | Siempre presentes (no solo placeholder) |

---

## Patrones recurrentes de UI

### Formulario

- Labels siempre visibles (no solo placeholder)
- Error inline debajo del campo, en `var(--color-error)`
- Boton primario a la derecha, secundario a la izquierda
- Validar al submit, no al blur (menos intrusivo)

### Tabla con filtros

- Filtros arriba, nunca en sidebar (en admin)
- Paginacion abajo con conteo
- Acciones por fila en menu contextual `[...]`
- Bulk actions: solo si hay checkbox de seleccion

### Modal de confirmacion

- Accion destructiva en `var(--color-destructive)`
- Describir consecuencia, no solo preguntar
- Cancelar siempre disponible y visible

### Estado vacio

- Icono sutil, no ilustracion pesada
- Texto que explica que hacer, no solo "vacio"
- CTA directa si hay accion posible

### Skeleton de carga

- Usar bloques animados que repliquen la forma del contenido real
- Nunca spinner global si se puede mostrar skeleton por zona
- La transicion skeleton -> contenido debe ser suave (no flash)

### Toast / notificacion

- Posicion: bottom-right (desktop), bottom-center (mobile)
- Auto-dismiss en 4s para info/success
- Persistente para errores (requiere dismiss manual)
- Maximo 1 toast visible a la vez
