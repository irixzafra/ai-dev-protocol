# Arquitectura de UX: Lógica, Flujos y Agrupación Semántica

> Diseño de alto nivel: no tener menos opciones, sino agruparlas con inteligencia para que el usuario sienta control sin fatiga de decisión.

---

## 1. Principio de Agrupación Semántica (Semantic Chunking)

Organizamos la interfaz en "bloques de intención":

| Bloque | Posición | Metáfora |
|---|---|---|
| Navegación | Izquierda | Historial y acceso a herramientas — la "memoria" del usuario |
| Creación | Centro | El prompt y área de chat — el "presente" |
| Edición | Derecha/Canvas | Donde el contenido toma forma final — el "futuro" del trabajo |

---

## 2. Revelación Progresiva (Complexity on Demand)

> Para que la interfaz sea "apetecible", no mostramos todas las herramientas a la vez.

- **Default View:** Limpieza absoluta. Solo el prompt y botones de inicio rápido.
- **Contextual Trigger:** Opciones de edición (copiar, editar, regenerar) solo aparecen en hover sobre un mensaje específico o al seleccionar texto.
- **Over-flow Menus:** Configuraciones avanzadas agrupadas en menús de 3 puntos o iconos de engranaje.

---

## 3. Lógica de Paneles y Modales (The Overlay Strategy)

- **Sidebars Colapsables:** Panel izquierdo puede ocultarse completamente. Reajuste suave con animación 300ms.
- **Pop-overs Inteligentes:** Los menús de herramientas abren siempre en dirección que no obstruya el contenido principal.
- **Light Dismiss:** Cualquier menú o modal se cierra con clic fuera. El usuario nunca se siente "atrapado".

---

## 4. Gestión de Estados del Sistema

| Estado | Patrón |
|---|---|
| Empty State | No dejar la pantalla vacía. Mostrar "Píldoras de Sugerencia" con iconos coloridos que inviten a la acción. |
| Loading State | Skeleton screens animados — silueta del texto que se va a recibir. Evita ansiedad de espera. |
| Success Feedback | Toast en esquina inferior, desaparece tras 2s. |

---

## 5. Accesibilidad Cognitiva

- **Aesthetic-Usability Effect:** Balance entre espacios blancos y elementos visuales. Un diseño "bonito" se percibe como más fácil de usar.
- **Filtros de Búsqueda:** En historial, agrupar por "Hoy", "Ayer", "Últimos 7 días". Facilita el escaneo visual rápido.
