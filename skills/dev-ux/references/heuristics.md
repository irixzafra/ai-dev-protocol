# Framework de Heurísticas UX — 70+ Checks Granulares

## Cómo usar este framework

No evaluar todo de golpe. Seguir este orden:
1. Escoger la categoría relevante (navegación para sidebar, formularios para forms, etc.)
2. Pasar cada check: ✅ pass / ❌ fail / ⚠️ parcial / N/A
3. Para cada fail, etiquetar: gulf type (execution/evaluation) + error type (slip/mistake)
4. Registrar severidad × frecuencia

---

## 1. Navegación y arquitectura de información (15 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| N1 | ¿El usuario identifica su ubicación en <3s? (breadcrumb, item activo, título) | Siempre | Evaluation gulf |
| N2 | ¿El item activo en la navegación es visualmente distinto? | Siempre | Evaluation gulf |
| N3 | ¿Hay <8 items en cada nivel de navegación? | 5-7 | Cognitive overload |
| N4 | ¿La profundidad de navegación es ≤3 niveles? | ≤3 | Execution gulf |
| N5 | ¿La tarea más común se completa en ≤3 clics? | ≤3 | Execution gulf |
| N6 | ¿Los labels de navegación son orientados a tarea (no técnicos)? | Siempre | Mistake |
| N7 | ¿Hay búsqueda global accesible desde cada página? | Siempre | Execution gulf |
| N8 | ¿Hay páginas huérfanas (solo accesibles por URL)? | 0 | Execution gulf |
| N9 | ¿Hay callejones sin salida (sin siguiente acción clara)? | 0 | Evaluation gulf |
| N10 | ¿La navegación es consistente entre secciones? | >90% | Mistake |
| N11 | ¿Items relacionados están agrupados? | Siempre | Cognitive overload |
| N12 | ¿El mobile nav funciona con thumb reach? | Siempre | Execution gulf |
| N13 | ¿Touch targets son ≥44x44px en mobile? | Siempre | Slip |
| N14 | ¿Hay camino de retorno consistente desde cada página? | Siempre | Execution gulf |
| N15 | ¿Los breadcrumbs reflejan la ruta real del usuario? | Siempre | Evaluation gulf |

---

## 2. Formularios e inputs (12 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| F1 | ¿El formulario tiene <8 campos visibles antes de agrupar? | <8 | Cognitive overload |
| F2 | ¿Los campos tienen labels claros (no solo placeholders)? | Siempre | Mistake |
| F3 | ¿Hay validación inline (no solo al submit)? | En blur | Slip prevention |
| F4 | ¿Los errores son específicos y accionables? | Siempre | Evaluation gulf |
| F5 | ¿Los campos con formato tienen hints visibles? (fecha, teléfono) | Siempre | Slip prevention |
| F6 | ¿Los campos required están marcados? | Siempre | Mistake |
| F7 | ¿Campos relacionados están agrupados con separación visual? | Siempre | Cognitive overload |
| F8 | ¿Multi-step forms guardan progreso? | Siempre | Execution gulf |
| F9 | ¿Dropdowns con >10 opciones tienen búsqueda? | >10 | Execution gulf |
| F10 | ¿Acciones destructivas (borrar, reset) son visualmente distintas? | Siempre | Slip prevention |
| F11 | ¿El tab order sigue el orden visual? | Siempre | Execution gulf |
| F12 | ¿Los errores son visibles sin scroll? | Siempre | Evaluation gulf |

---

## 3. Feedback y estado del sistema (10 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| S1 | ¿Toda acción del usuario produce feedback visible? | Siempre | Evaluation gulf |
| S2 | ¿Operaciones >1s muestran loading state? | Siempre | Evaluation gulf |
| S3 | ¿Operaciones largas muestran progreso (no solo spinner)? | >3s | Evaluation gulf |
| S4 | ¿Hay confirmación visual tras guardar/enviar? | Siempre | Evaluation gulf |
| S5 | ¿Los estados de error son distintos de los vacíos? | Siempre | Mistake |
| S6 | ¿Toasts auto-dismiss en 3-5s? | 3-5s | Slip |
| S7 | ¿Los elementos disabled explican por qué están disabled? | Siempre | Evaluation gulf |
| S8 | ¿Cambios real-time se reflejan sin refresh? | Cuando aplique | Evaluation gulf |
| S9 | ¿El feedback aparece CERCA de donde ocurrió la acción? | Siempre | Evaluation gulf |
| S10 | ¿Las confirmaciones destructivas usan loss framing? ("Perderás X" no "¿Eliminar?") | Siempre | Slip prevention |

---

## 4. Estados vacíos y errores (8 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| E1 | ¿Toda vista data-dependent tiene empty state diseñado? | 100% | Evaluation gulf |
| E2 | ¿Los empty states incluyen CTA? (qué hacer ahora) | Siempre | Execution gulf |
| E3 | ¿Las páginas de error (404, 500) están branded y son útiles? | Siempre | Evaluation gulf |
| E4 | ¿Los errores sugieren acción de recovery? | Siempre | Evaluation gulf |
| E5 | ¿Los errores están en lenguaje humano (no códigos)? | Siempre | Mistake |
| E6 | ¿Búsqueda sin resultados ofrece alternativas? | Siempre | Execution gulf |
| E7 | ¿Errores de conexión se manejan gracefully? | Siempre | Evaluation gulf |
| E8 | ¿Timeouts ofrecen retry? | Siempre | Execution gulf |

---

## 5. Accesibilidad funcional (10 checks)

(Nota: auditoría WCAG completa → /dev-design con references/accessibility.md)

| # | Check | Target | Fail = |
|---|---|---|---|
| A1 | ¿Contraste texto cumple AA? (4.5:1 normal, 3:1 grande) | Siempre | Execution gulf |
| A2 | ¿Toda funcionalidad accesible por teclado? | Siempre | Execution gulf |
| A3 | ¿Focus indicators visibles? | Siempre | Evaluation gulf |
| A4 | ¿Imágenes tienen alt text significativo? | Siempre | Evaluation gulf |
| A5 | ¿Elementos interactivos tienen labels ARIA? | Siempre | Execution gulf |
| A6 | ¿El contenido funciona sin color como único indicador? | Siempre | Evaluation gulf |
| A7 | ¿Texto soporta zoom 200% sin romper layout? | Siempre | Execution gulf |
| A8 | ¿Animaciones respetan prefers-reduced-motion? | Siempre | Slip |
| A9 | ¿Target size ≥24px (WCAG 2.2)? | ≥24px | Slip |
| A10 | ¿Tab order es lógico? | Siempre | Execution gulf |

---

## 6. Carga cognitiva (8 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| C1 | ¿Hay <7 opciones primarias en cada punto de decisión? | <7 | Cognitive overload |
| C2 | ¿Hay jerarquía visual clara en cada página? | Siempre | Cognitive overload |
| C3 | ¿Acciones están priorizadas? (primario, secundario, terciario) | Siempre | Cognitive overload |
| C4 | ¿Features complejas usan progressive disclosure? | Siempre | Cognitive overload |
| C5 | ¿Hay defaults inteligentes para opciones comunes? | Cuando aplique | Execution gulf |
| C6 | ¿Info se muestra solo cuando es contextualmente relevante? | Siempre | Cognitive overload |
| C7 | ¿La terminología es consistente en toda la app? | Siempre | Mistake |
| C8 | ¿Peso visual es proporcional a importancia funcional? | Siempre | Mistake |

---

## 7. Onboarding y learnability (7 checks)

| # | Check | Target | Fail = |
|---|---|---|---|
| O1 | ¿Un usuario nuevo completa tareas core sin docs? | Siempre | Execution gulf |
| O2 | ¿El onboarding es progresivo (no muro de tutoriales)? | Siempre | Cognitive overload |
| O3 | ¿Features complejas se descubren via hints contextuales? | Siempre | Execution gulf |
| O4 | ¿El onboarding se puede saltar y revisitar? | Siempre | Execution gulf |
| O5 | ¿Empty states se usan como momentos de onboarding? | Siempre | Execution gulf |
| O6 | ¿Tooltips explican funcionalidad no obvia? | Siempre | Execution gulf |
| O7 | ¿Hay help contextual cerca de interacciones complejas? | Siempre | Execution gulf |

**Total: 70 checks**

---

## 8. Psicología de interacción (referencia rápida)

Leyes que cambian cómo proponemos soluciones:

### Peak-End Rule
Los usuarios juzgan una experiencia por su momento más intenso y por cómo termina. Invertir en pantallas de éxito/completado. Una confirmación bien diseñada vale más que 10 micro-mejoras.

### Loss Aversion
Las personas sienten las pérdidas ~2x más que las ganancias. En confirmaciones destructivas: "Perderás 12 archivos y 3 meses de historial" pesa más que "¿Estás seguro?".

### Inattentional Blindness
El feedback debe aparecer CERCA del punto de acción. Un toast en la esquina opuesta de la pantalla se ignora. Feedback inline > toast > modal.

### Ley de Jakob
Los usuarios pasan la mayoría de su tiempo en OTRAS apps. Esperan que tu app funcione como las que ya conocen. No reinventar patrones estándar sin buena razón.

### Serial Position Effect
Los usuarios recuerdan mejor el primer y último item de una lista. Poner lo más importante al principio y al final de la navegación. Lo del medio se pierde.

### Doherty Threshold
Cuando el sistema responde en <400ms, el usuario entra en "flow". Cualquier operación perceptible >400ms necesita feedback visual.

---

## 9. Severidad × Frecuencia

No todos los problemas importan igual. Usar esta matriz para priorizar:

| Severidad | Definición |
|---|---|
| **Crítico** | Usuario no puede completar la tarea. Abandona. |
| **Alto** | Usuario se detiene completamente. Debe buscar activamente cómo resolver. |
| **Medio** | Usuario se interrumpe brevemente pero continúa. |

| Frecuencia | Definición |
|---|---|
| **Todos** | Afecta al 100% de usuarios |
| **Muchos** | Afecta a >50% |
| **Algunos** | Afecta a <50% |

**Importancia resultante:**

| | Todos | Muchos | Algunos |
|---|---|---|---|
| Crítico | ESENCIAL (-15) | ESENCIAL (-12) | IMPACTANTE (-8) |
| Alto | ESENCIAL (-8) | IMPACTANTE (-6) | IMPACTANTE (-4) |
| Medio | IMPACTANTE (-3) | DETALLE (-2) | DETALLE (-1) |

Los puntos entre paréntesis se restan del UX Score (base 100).

---

## 10. Bugs de implementación UX comunes

Problemas técnicos que afectan directamente la experiencia:

- **`100vh` en mobile**: la barra del navegador lo rompe. Usar `dvh` o `min-h-[100dvh]`
- **Sin `overscroll-behavior: contain`**: el pull-to-refresh accidental cierra modals/drawers
- **Sin `touch-action: manipulation`**: 300ms tap delay en mobile
- **Líneas de texto >75 caracteres**: fatiga visual. Usar `max-w-prose` o equivalente
- **Inputs sin `autocomplete`**: el navegador no puede autorellenar. Añadir `autocomplete="email"`, etc.
- **Inputs sin `inputmode`**: teclado incorrecto en mobile. Usar `inputmode="numeric"` para números
- **Scroll horizontal en mobile**: contenido que se sale del viewport
- **Z-index wars**: modals/tooltips que aparecen debajo de otros elementos
- **Contenido que salta (CLS)**: reservar espacio para imágenes y contenido async
- **Botón de password sin toggle**: frustración innecesaria en forms de auth
