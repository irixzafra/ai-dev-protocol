# Backlog & Sprint Standards

> Como se alimenta el backlog, como se prioriza, como se ejecuta un sprint,
> y como se cierra una tarea. Aplica a todos los proyectos.

---

## El WORKBOARD

`planning/WORKBOARD.md` es la **unica fuente de verdad** para el estado de ejecucion.

No hay Jira, no hay Linear, no hay Notion tasks duplicando esto. El WORKBOARD es el sitio.

---

## Estructura del WORKBOARD

```markdown
# WORKBOARD — {Proyecto}

## PROXIMA ACCION
[1-3 bullets: que se hace ahora mismo]

## Sprint {N} — {Titulo}
| # | Tarea | Prioridad | Estado | Spec |
|---|-------|-----------|--------|------|
| S{N}.01 | Descripcion | P0 | status | `S001` |

## Sprints cerrados
| Sprint | Resultado | Fecha |

## Futuro — sin fecha
| # | Tarea | Notas |
```

---

## Como entra una tarea al backlog

### Fuentes validas

| Fuente | Ejemplo | Quien la crea |
|--------|---------|---------------|
| Idea del owner | "Anadamos modo comparativo" | Owner la dicta, agente la formaliza |
| Bug detectado | "La traduccion falla en lotes > 10" | Agente o owner |
| Deuda tecnica | "Componente con navegacion residual" | Agente al cerrar sesion |
| Resultado de benchmark | "Degradacion de performance en search" | Benchmark runner |
| Auditoria | "259 items sin cobertura" | Skill de auditoria |

### Flujo de entrada

```
Fuente -> Es urgente (P0)?
           | si -> WORKBOARD directo + sprint activo
           | no -> "Futuro — sin fecha"
                    |
                    +-> En el proximo sprint planning, el owner prioriza
```

### Proceso de intake — de idea a tarea aprobada

Cuando el owner tiene una idea o quiere algo nuevo, el agente NO empieza a construir.
El agente hace un **intake estructurado** antes de que la idea entre al WORKBOARD.

**Paso 1 — Entender (el agente pregunta):**

| Pregunta | Por que |
|----------|---------|
| Que quieres que haga el usuario que hoy no puede? | Define el entregable funcional |
| Hay algo parecido ya? Que no te gusta de lo actual? | Evita duplicados y scope creep |
| Quien lo usa? (owner, beta tester, admin, todos) | Define el alcance |
| Es urgente o puede esperar al proximo sprint? | Define prioridad |
| Hay algo que NO quieres que se toque? | Previene danos colaterales |

El agente puede saltar preguntas obvias si la idea ya es clara.

**Paso 2 — Formalizar (el agente presenta):**

```markdown
## Propuesta: {Titulo}

**Entregable:** [1-2 frases de que cambia para el usuario]
**Talla:** NANO / MINI / FULL
**Prioridad sugerida:** P0 / P1 / P2
**Archivos que probablemente toca:** [lista]
**Que NO toca:** [exclusiones]
**Criterios de aceptacion:** [como sabe el owner que esta bien]
**Spec necesaria:** si (FULL) / inline (MINI) / no (NANO)
```

**Paso 3 — El owner aprueba o corrige:**

- "Aprobada" -> la tarea entra al WORKBOARD + se crea spec si es FULL
- "Corrige esto" -> el agente ajusta y vuelve a presentar
- "No, esto no" -> la idea se descarta o va a "Futuro — sin fecha"

**Paso 4 — Solo despues de aprobacion:**

- La tarea se anade al WORKBOARD con su # y prioridad
- Si es FULL -> se crea `docs/specs/S{NNN}-titulo.md`
- Si es MINI -> la spec queda inline en el briefing o commit
- Entonces y solo entonces puede entrar a un briefing

**Regla dura:** ningun agente construye una feature sin que el owner haya dicho "aprobada"
a la propuesta formalizada. Las tareas de la Cola Autonoma (`AUTO.*`) son la unica
excepcion porque son chores/fixes de bajo riesgo pre-aprobados por definicion.

### Cuando NO hace falta intake

| Caso | Por que se salta |
|------|-----------------|
| Bug en produccion (P0) | Se arregla y se documenta despues |
| Tarea AUTO.* de la cola autonoma | Pre-aprobada por definicion |
| NANO (1-5 lineas, fix obvio) | El commit message es la spec |
| El owner da un brief completo con todos los campos | Ya hizo el intake el mismo |

### Formato de una tarea

```
S{sprint}.{numero secuencial} — {Descripcion corta}
```

Ejemplo: `S7.10 — Modo comparativo entre entidades`

Campos de la fila:

| Campo | Valores |
|-------|---------|
| # | `S{N}.{NN}` |
| Tarea | Descripcion imperativa, <= 60 chars |
| Prioridad | `P0` (blocker) -- `P1` (importante) -- `P2` (deseable) |
| Estado | `pending` -- `in progress` -- `done` -- `blocked` |
| Spec | Link a `docs/specs/S{NNN}` si existe, o `—` si es NANO/MINI |

---

## Priorizacion

| Prioridad | Significado | Accion |
|-----------|-------------|--------|
| **P0** | Bloqueador. No se puede avanzar sin esto. | Se trabaja inmediatamente. Interrumpe lo que sea. |
| **P1** | Importante. Mueve el producto o la calidad significativamente. | Se trabaja en el sprint actual. |
| **P2** | Deseable. Mejora pero no bloquea nada. | Se trabaja si sobra tiempo o se promueve en el siguiente sprint. |

### Reglas de priorizacion

| Regla | Razon |
|-------|-------|
| **El owner decide la prioridad final** | Es el dueno del producto |
| **Max 3 P0 simultaneos** | Si todo es urgente, nada es urgente |
| **P2 no se promueve automaticamente** | Requiere decision explicita del owner |
| **Los bugs en produccion son P0 por defecto** | Hasta que el owner diga lo contrario |
| **La deuda tecnica nunca es P0** salvo que bloquee una feature P0 | No refactorizar por refactorizar |

---

## Sprint lifecycle

### 1. Apertura del sprint

- El owner define el objetivo del sprint (1 frase)
- Se seleccionan tareas del backlog con prioridad asignada
- Cada tarea FULL tiene spec creada o referenciada

### 2. Durante el sprint

- Cada tarea sigue el protocolo: DEFINIR -> PLANEAR -> CONSTRUIR -> VERIFICAR -> CERRAR
- El agente actualiza el estado en WORKBOARD al cambiar de fase
- Si una tarea se bloquea: cambiar a `blocked`, documentar blocker en la fila
- Si aparece trabajo no planificado P0: se anade al sprint, se comunica al owner

### 3. Cierre del sprint

Al cerrar un sprint:

1. Mover el bloque del sprint a "Sprints cerrados" con fecha y resultado
2. Las tareas no completadas:
   - Si siguen siendo relevantes -> mover al siguiente sprint
   - Si ya no son relevantes -> mover a "Futuro" o eliminar
3. Lecciones aprendidas -> `planning/MEMORY.md` section Lecciones
4. Decisiones tomadas -> `planning/MEMORY.md`

### 4. Sprint planning

Periodicidad: cuando el owner lo decide (no hay cadencia fija impuesta).

Inputs:
- "Futuro — sin fecha" del WORKBOARD
- Lecciones del sprint anterior
- Estado del producto (benchmarks, auditorias, feedback de usuarios)
- Prioridades de negocio

Output:
- Sprint nuevo con tareas priorizadas
- Specs creadas para tareas FULL

---

## Relacion spec <-> tarea

```
Tarea en WORKBOARD                    Spec en docs/specs/
S7.10 — Modo comparativo   --------  S001-modo-comparativo.md
         (referencia)                       (detalle)
```

| Talla | Necesita spec? | Donde vive el detalle? |
|-------|-----------------|------------------------|
| NANO | No | En el commit message |
| MINI | Inline | En el plan mode o en la fila del WORKBOARD |
| FULL | Si, archivo | `docs/specs/S{NNN}-titulo.md` |

---

## Cierre de una tarea

Una tarea se marca done cuando:

1. El codigo esta mergeado (o pusheado si es fast-track)
2. Los gates G1-G3 (y G4 si FULL) estan verdes
3. La spec pasa a estado `hecha`
4. El WORKBOARD refleja el cierre
5. Si hubo lecciones -> estan en MEMORY.md

**Una tarea NO se cierra si:**
- Hay warnings en lint
- La build falla
- Hay archivos fuera del scope
- La spec no tiene todos los criterios de aceptacion marcados

---

## Como briefear una tarea a un agente AI

### Contexto obligatorio (el agente DEBE leer antes de empezar)

1. `dev.protocol.md` — el flujo
2. `dev.playbook.md` — contexto del proyecto
3. `planning/MEMORY.md` — decisiones activas
4. `planning/WORKBOARD.md` — sprint actual
5. La spec de la tarea (si es FULL)

### Formato del brief

```markdown
## Tarea: S{N}.{NN} — {Titulo}

**Spec:** docs/specs/S{NNN}-titulo.md (o "inline" si es MINI)
**Talla:** NANO / MINI / FULL
**Prioridad:** P0 / P1 / P2

**Que hacer:**
[1-3 frases claras del entregable]

**Que NO hacer:**
[exclusiones explicitas — previene scope creep]

**Archivos que probablemente tocas:**
[lista de paths]

**Como verifico que esta bien:**
[criterios de aceptacion en lenguaje humano]
```

### Regla: el agente NO empieza sin brief

Si el owner no proporciono un brief formal, el agente DEBE crear uno basado en la conversacion y presentarlo para aprobacion ANTES de escribir codigo.

---

## Como el agente reporta progreso y entrega

### Durante la tarea — checkpoints

| Evento | El agente hace |
|--------|---------------|
| Empieza la tarea | Cambia estado en WORKBOARD a `in progress` |
| Cada 2h de trabajo | Muestra: que hizo, que falta, si hay bloqueos |
| Se bloquea | Cambia a `blocked` + documenta que lo bloquea en la fila |
| Descubre scope extra | Para y pregunta al owner: "esto no estaba en la spec, lo anado?" |

### Al terminar — formato de entrega

El agente presenta al owner:

```markdown
## Entrega: S{N}.{NN} — {Titulo}

**Archivos tocados:**
[output de `git diff --stat`]

**Gates:**
- G1 (compila): pass/fail
- G2 (lint): pass/fail
- G3 (secrets): pass/fail
- G4 (scope): pass/fail [solo FULL]

**Coincide con la spec:** si / no (explicar diferencias)

**Decisiones tomadas:** [si hubo]

**Leccion:** [si hubo]
```

El owner revisa la entrega. Si coincide con la spec y los gates estan verdes -> aprueba. Si no -> el agente corrige.

---

## Reglas de sprints activos

| Regla | Razon |
|-------|-------|
| **Un solo sprint activo** | Foco. No se trabaja en 4 sprints a la vez. |
| **Tareas completadas -> seccion "Completado"** dentro del sprint | No mezclar hechas con pendientes |
| **Sprint cerrado -> mover a "Sprints cerrados"** | El WORKBOARD solo muestra lo vivo |
| **Tareas pendientes de sprint cerrado -> mover al siguiente o a Futuro** | No dejar zombies |
| **Notas operativas largas -> MEMORY.md** | El WORKBOARD es estado, no diario |

---

## Anti-patterns del backlog

| Anti-pattern | Correccion |
|-------------|-----------|
| Tarea sin prioridad | Toda tarea tiene P0/P1/P2. Sin prioridad = no existe. |
| Tarea de 2 semanas | Dividir en subtareas de 1-3 dias max. |
| "Mejorar X" sin criterio de aceptacion | Reformular como "X hace Y verificable." |
| Sprint con 20 tareas | Max 8-10 tareas por sprint. Menos es mas. |
| Tarea bloqueada sin documentar por que | La fila debe decir que la bloquea. |
| Deuda tecnica que nunca se trabaja | Reservar 1-2 slots P2 por sprint para deuda. |
| 4 sprints abiertos a la vez | Un sprint activo. El resto cerrado o futuro. |
| Notas operativas en el WORKBOARD | WORKBOARD = estado. Notas -> MEMORY.md. |
| Agente empieza sin brief | Parar. Crear brief. Aprobar. Luego construir. |
| Agente entrega sin mostrar gates | Rechazar. Pedir formato de entrega. |
