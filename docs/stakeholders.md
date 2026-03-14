# Para Perfiles No Técnicos — Cómo Leer el Sistema

> Este documento es para Product Managers, founders, clientes y cualquier persona
> que quiera entender qué está haciendo el equipo (y sus agentes de IA)
> sin necesidad de abrir una terminal.

---

## El problema que resuelve esto

Un repositorio de GitHub lleno de archivos `.md` asusta a quien no es desarrollador.
Ramas, commits, terminología técnica — una barrera innecesaria.

La buena noticia: todo el protocolo está en Markdown plano.
Y el Markdown se puede exponer de tres formas visuales y amigables, sin escribir ni una línea de código.

---

## Vista 1 — Las tareas: GitHub Projects (tablero tipo Trello)

**Para:** seguir el progreso, aprobar trabajo, dar feedback.

GitHub Projects es el tablero Kanban gratuito que viene integrado en cualquier repositorio.

**Lo que ve el perfil no técnico:**

```
[ Backlog ]      [ Ready ]        [ In Progress ]   [ Done ]
─────────────    ──────────────   ───────────────   ──────────────
Añadir login     Validar pagos    Optimizar búsq.   Diseño home ✅
Onboarding       Emails automát.                    API usuarios ✅
```

- Puedes crear tarjetas, escribir comentarios en lenguaje natural, mover columnas.
- No necesitas saber programar para aprobar o rechazar una tarea.

**Lo que hace la IA por debajo:**

- Lee las tarjetas en "Ready"
- Implementa el código
- Mueve la tarjeta a "In Progress" y luego a "Done"
- Cierra la tarjeta con un enlace al cambio exacto que hizo

**Setup:** GitHub → tu repo → Projects → New Project → Board. Es un clic.

---

## Vista 2 — La documentación: GitHub Pages (web automática)

**Para:** leer el playbook del proyecto, entender las reglas, ver las decisiones tomadas.

GitHub Pages convierte automáticamente todos los archivos Markdown del repositorio
en una página web navegable — sin servidores, sin código, sin mantenimiento.

**Cómo activarlo:**

```
GitHub → Settings → Pages → Source: Deploy from branch → /docs → Save
```

**Resultado:** `https://tu-usuario.github.io/tu-repo/` — una web limpia con:
- El playbook del proyecto (stack, patrones, decisiones)
- Las reglas que siguen los agentes
- El historial de lecciones aprendidas
- Las especificaciones de cada funcionalidad

**Por qué es un "sistema vivo":** Cuando la IA actualiza el playbook a las 4AM,
la web se actualiza sola a las 4:01AM. El PM entra por la mañana y lee una documentación al día.

---

## Vista 3 — El diario: DEV_LOG.md (el periódico de la IA)

**Para:** entender qué pasó ayer sin revisar commits de Git.

`planning/dev-log.md` es el "daily standup" escrito por el agente al final de cada sesión.
Formato: fechas y 4 bullets por entrada, en lenguaje natural.

**Ejemplo real:**

```markdown
## 2026-03-15 02:34 — claude-sonnet

- **Completado:** Implementé el módulo de login con verificación por email
- **Decisiones temporales:** Usé un mock de la pasarela de pago (Stripe en sandbox) — prod pendiente
- **Bloqueos:** El envío de emails falla en staging — variables de entorno incorrectas, investigar
- **Siguiente:** Resolver el problema de emails antes de activar el onboarding real
```

Un PM o CEO puede leer esto con el café de la mañana y saber exactamente:
- Qué avanzó el sistema de noche
- Qué atajos tomó y por qué
- Dónde está bloqueado y qué necesita
- Cuál es el siguiente paso lógico

No hace falta leer código. No hace falta hablar con el desarrollador.

---

## Resumen — tres URLs, cero configuración extra

| Qué quieres ver | Dónde mirarlo |
|---|---|
| Progreso de tareas | `github.com/[org]/[repo]/projects` |
| Documentación del proyecto | `[org].github.io/[repo]/` (GitHub Pages) |
| Qué hizo la IA ayer | `planning/dev-log.md` (también visible en Pages) |

Las tres vistas se actualizan solas cuando la IA trabaja.
El humano solo necesita un browser.

---

## Para el equipo técnico — cómo mantener esto accesible

- **DEV_LOG.md:** el agente escribe una entrada al final de cada sesión (regla en `protocol.md`)
- **Playbook:** actualizar cuando cambia el stack o se toma una decisión importante
- **GitHub Projects:** usar etiquetas `auto` para tareas que el agente puede ejecutar solo, y `review` para las que requieren aprobación humana
- **GitHub Pages:** ningún mantenimiento — se actualiza con cada push
