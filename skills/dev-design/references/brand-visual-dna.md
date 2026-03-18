# Master UI: ADN Visual y Design Tokens

> Documento de intención de diseño para the active project. Basado en Material Design 3 (Material You) y estética de "Lujo Silencioso" digital: alta legibilidad, formas orgánicas, paleta cromática que reduce el estrés visual.

---

## 1. Sistema de Color (Semantic Color System)

Sistema de Roles de Color — permite armonía perfecta en cualquier modo (claro/oscuro).

### Superficies y Contenedores

| Token | Valor | Uso |
|---|---|---|
| Surface (Base) | `#F8F9FA` | Fondo general. Limpieza y amplitud. |
| Surface Bright | `#FFFFFF` | Área de trabajo (Canvas). Diferencia "hacer" de "navegar". |
| Surface Container Low | `#F0F4F9` | Sidebar y campos de entrada. Separación visual suave sin líneas. |

### Tipografía y Contraste

| Token | Valor | Uso |
|---|---|---|
| On-Surface (Primario) | `#1F1F1F` | Texto principal. Nunca negro puro (evita parpadeo en OLED). |
| On-Surface Variant (Secundario) | `#474747` | Descripciones, placeholders, iconos desactivados. |
| Primary (Brand) | `#1A73E8` | Reservado exclusivamente para la intención principal del usuario. |

---

## 2. Geometría y Estética Orgánica (The "Rounded" Philosophy)

> El cerebro humano asocia formas redondeadas con seguridad y comodidad.

| Nivel | Valor | Uso |
|---|---|---|
| Extra Large | 28px | Paneles y áreas principales de la interfaz |
| Medium | 16px | Botones de acción y chips — elementos que se "tocan" o clickean |
| Full Rounded (Píldora) | 100px | Inputs de texto y botones de alta jerarquía |

---

## 3. Sistema de Espaciado (8pt Grid System)

> Todo el layout debe ser divisible por 8 para garantizar ritmo visual matemático pero fluido.

**Escala:** `4px (XS)` · `8px (S)` · `16px (M)` · `24px (L)` · `32px (XL)` · `48px (XXL)`

**Safe Zones:** El contenido central nunca toca los bordes — margen mínimo de seguridad `24px` en desktop.

---

## 4. Elevación y Profundidad (Shadows & Z-Index)

| Nivel | Superficie | Shadow |
|---|---|---|
| 0 (Fondo) | Sidebar y Background | ninguna |
| 1 (Contenedor) | Tarjetas de chat | `none` |
| 2 (Interacción) | Pop-overs y menús | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` |
| 3 (Crítico) | Modales | `0 20px 25px -5px rgba(0,0,0,0.1)` |

---

## 5. Tipografía de Alta Precisión

| Elemento | Tamaño | Line-height | Tracking | Weight |
|---|---|---|---|---|
| Body Text | 16px | 1.6 | normal | 400 |
| Headline | 22–28px | 1.2–1.25 | -0.01em | 500 (Medium) |

**Fuente:** Inter (preferida) o Google Sans.

> Body: 16px, line-height 1.6 — vital para que respuestas largas de IA no se sientan densas.
> Headline: weight 500 (no semibold/600), tracking moderado -0.01em.
