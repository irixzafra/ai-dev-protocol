# Plan Template — Output Format

Use this template for the actionable plan. Adapt sections as needed, but keep the structure.

## Pre-plan validation

Before writing any plan, answer these 3 questions:

1. **Milestone alignment:** ¿A qué milestone pertenece? ¿Es el milestone actual?
2. **Simplicity check:** ¿Se puede resolver con menos código? ¿Con configuración? ¿Modificando algo existente?
3. **Scope filter:** ¿Encaja en Skills / Specialists / Presets / Config? Si no → rechazar o replantear.

If any answer is "no" or "doesn't belong to current milestone", stop and communicate to the user before proceeding.

## Phase format

```markdown
### Fase 1: [Nombre] — [Qué valor entrega]

**Objetivo:** [1 frase de qué puede hacer el usuario al terminar esta fase]
**Milestone:** [M1/M2/M3] — [entregable específico que avanza]

#### Tarea 1.1: [Descripción concreta]
- **Archivos:** `path/to/file1.ts`, `path/to/file2.ts` (max 5)
- **Qué hace:** [Descripción técnica breve]
- **Criterio de aceptación:** [Qué se puede verificar — concreto, no "it works"]
- **Bloqueado por:** nada / Tarea X.Y
- **Complejidad:** [simple] / [moderate] / [complex]

#### Tarea 1.2: [Descripción concreta]
- **Archivos:** ...
- **Qué hace:** ...
- **Criterio de aceptación:** ...
- **Bloqueado por:** Tarea 1.1

⚠️ **Riesgo:** [Si aplica, qué podría complicar esta fase]

---

### Fase 2: [Nombre] — [Qué valor entrega]
...
```

## Sizing guide

Each task = roughly one commit (max 5 files):

| Tipo de tarea | Archivos típicos | Ejemplo |
|---|---|---|
| Nuevo schema + migración | 3 | schema.ts, index.ts, migration.sql |
| Nuevo engine | 3-4 | engine.ts, index.ts, types en contracts, test |
| Nueva página | 3-4 | page.tsx, componentes, layout si nuevo |
| Nueva API route | 2-3 | route.ts, engine method, types |
| Modificar engine existente | 2-3 | engine.ts, test, posible migration |
| UI component | 2-3 | component.tsx, posible story, export |
| Pura configuración | 1-2 | config file, seed update |

## Simplicity score

Rate every plan 1-5:

| Score | Meaning | Typical plan |
|---|---|---|
| 1 | Config-only | Change a seed, update a prompt, toggle a flag |
| 2 | Minor modification | Modify 1-2 existing files, no new files |
| 3 | Feature using existing patterns | 3-8 files, reuses existing engine/schema |
| 4 | New engine or schema | 8-15 files, new domain area |
| 5 | Architectural change | 15+ files, changes fundamental patterns |

**Target: most plans should be 1-3.** If you're consistently at 4-5, you're over-engineering.

## Dependency notation

```
Tarea 2.1 → blocked by 1.3
Tarea 2.2 → independent (can parallel)
Tarea 2.3 → blocked by 2.1 + 2.2
```

## What a good plan looks like

- **Fase 1** delivers something a user can see and use (even if limited)
- **Fase 2** adds the "real" functionality
- **Fase 3** polishes, optimizes, or extends
- Each phase has 3-6 tasks
- Total plan has 2-3 phases (max 3 — beyond that is fiction)
- Every task has a clear "done" state
- **Simplicity score is 1-3** for most plans
- **Every phase explicitly names which milestone entregable it advances**

## What a bad plan looks like

- More than 3 phases
- Phase 1 is "setup infrastructure"
- Tasks say "implement X" without acceptance criteria
- Creates new abstractions for one-time operations
- Builds for hypothetical future requirements
- Score 4-5 when a score 2-3 solution exists
- Doesn't reference which milestone it serves
