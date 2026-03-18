# Modo Estratégico — Protocolo completo

Usar cuando el usuario pide: "qué hacemos ahora", "cómo estamos", "qué falta", "organiza a los agentes", "qué merece la pena".

---

## Paso 1 — Leer el estado real

Leer, en este orden:
1. `planning/ROADMAP.md`
2. `planning/WORKBOARD.md`
3. `planning/MEMORY.md`
4. `.claude/COORDINATION.md`
5. `planning/OPENBOX_CORE_SCOPE.md`

Verificar salud mínima:
```bash
pnpm tsc --noEmit
pnpm test
git log --oneline -15
git status --short
```

## Paso 2 — Cuestionamiento radical

Responder, sin retórica:
1. ¿Estamos construyendo lo correcto para el milestone actual?
2. ¿Qué podemos eliminar en vez de construir?
3. ¿Qué solución mínima podría resolver esto hoy?
4. ¿Qué suposición del roadmap o de MEMORY ya no es verdad?
5. ¿Qué parte del problema es código y qué parte es dataset/integración/ops?

## Paso 3 — Diagnóstico

Siempre devolver:
- milestone actual
- porcentaje real del milestone
- bloqueadores concretos del siguiente paso
- deuda acumulada
- estado de agentes
- conflictos o trabajo duplicado

## Paso 4 — Priorización

Prioridad absoluta:
- experiencia rota
- typecheck/tests rotos
- seguridad
- bloqueo del siguiente milestone

Alta:
- gate de beta/dogfooding
- dataset real
- deuda que degrada rápido

Diferir:
- features futuras
- optimizaciones sin métrica
- "podríamos también…"

## Paso 5 — Orquestación

No repartir trabajo "por ganas", sino por ownership real:

- **1 writer por hotspot**
- auditors en paralelo sí, writers en paralelo solo si no pisan archivos ni primitiva compartida
- si un diff local coincide con un punch list aprobado, se puede transferir ownership explícito a un único builder

Para cada task, definir:
- agente
- scope exacto
- archivos reservados
- criterio de done
- tipo de lane (`UI`, `UX`, `backend`, `dataset`, `ops`, `docs`)
- dependencia o desbloqueo previo

Coordinación viva y reservas de hotspots → `.claude/COORDINATION.md`

## Paso 6 — Output al usuario

Siempre responder con:
1. dónde estamos
2. qué está bloqueando
3. qué hacemos ahora
4. qué NO hacemos ahora
5. qué agente debe moverse

Lenguaje simple. Sin jerga innecesaria.

## Paso 7 — SSOT

Si cambia la verdad del repo, actualizar:
- `WORKBOARD.md`
- `MEMORY.md`
- `.claude/COORDINATION.md`
- `ROADMAP.md` si cambia la fase real

No hacerlo por rutina. Solo cuando cambia la verdad.
