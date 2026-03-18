# Sistema de Movimiento: Interacción y Experiencia Sensorial

> El movimiento es el "pegamento" que une UI y UX. No es decorativo — orienta al usuario y confirma acciones.

---

## 1. Curvas de Animación (Easing Profiles)

> Nunca usar animaciones lineales. El movimiento en el mundo físico tiene inercia y fricción.

| Nombre | Curva | Uso |
|---|---|---|
| Emphasized Decelerate (Entradas) | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Modales y menús que aparecen — "aterriza suavemente" |
| Standard Accelerate (Salidas) | `cubic-bezier(0.3, 0.0, 0.8, 0.15)` | Cerrar elementos — "sale disparado con intención" |
| Legacy Standard (Movimientos internos) | `cubic-bezier(0.4, 0.0, 0.2, 1.0)` | Elementos que se mueven de A a B dentro de la pantalla |

---

## 2. Tiempos de Respuesta (Durations)

| Tipo | Duración | Uso |
|---|---|---|
| Micro-interacciones (Hover, clics) | 100–150ms | Casi instantáneo — no retrasar percepción de velocidad |
| Aparición de Menús/Pop-overs | 250ms | El ojo puede seguir el origen de la ventana |
| Movimientos de Paneles (Sidebar) | 350–450ms | Movimiento "majestuoso" para elementos de gran tamaño |

---

## 3. El "Feel" de la IA (Thinking & Streaming)

- **Streaming de Texto:** Las palabras aparecen con ligero fade-in individual (0–50ms) para flujo de lectura cinemático.
- **Glow Effect (Pensamiento):** Mientras la IA "piensa", borde del input o avatar pulsa suavemente con gradiente animado.
- **Cursor Activo:** Píldora azul que parpadea al final del texto generado. Al detenerse → fade-out de 200ms.

---

## 4. Feedback Háptico y Visual

- **Efecto Ripple:** Al presionar, onda de color translúcido `rgba(0,0,0,0.05)` desde el punto de presión.
- **Presión y Escala:** Al clic el botón reduce 2% (`scale(0.98)`) y recupera tamaño al soltar.
- **Háptico (Mobile):** Vibración suave de 10ms al confirmar acciones críticas (Enviar, Borrar).

---

## 5. Continuidad Espacial (Shared Element Transitions)

> Los elementos no deben "teletransportarse".

Transformación de Botón a Modal: el botón se expande físicamente hasta convertirse en el contenedor. El cerebro entiende el origen de la nueva información.

---

## 6. Coreografía de Elementos (Staggering)

Al mostrar listas de opciones:
- **Entrada en Cascada:** T+0, T+40ms, T+80ms...
- **Dirección:** Emergen desde abajo (`translateY(12px) → 0`) mientras opacidad sube de 0 a 1.

---

## 7. Skeleton Screens

- **Shimmer:** Gradiente que se desplaza de izquierda a derecha. Ciclo completo cada 1.5s.
- **Color:** `#F0F4F9` a `#E3E3E3`
- **Bordes:** Respetan exactamente el `border-radius` del elemento final.

---

## 8. Accesibilidad en el Movimiento (Reduced Motion)

> **OBLIGATORIO:** Si el usuario tiene activo "Reduce Motion" en su SO, todas las animaciones de escala y desplazamiento se convierten en simples fades (`opacity: 0 → 1`) de 200ms.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 200ms !important; transition-duration: 200ms !important; }
}
```

---

## 9. Transición entre Modos (Dark/Light)

Interpolación de color durante 500ms. No un cambio brusco — transición de opacidad del overlay de color para que el ojo se adapte gradualmente.
