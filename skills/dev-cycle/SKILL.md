---
name: dev-cycle
description: "Orchestrates the complete feature development lifecycle for the active project: structured intake, impact map, collision scan (detects duplicates and parallel conflicts before any code), worktree isolation, parallel build agents, adversarial audit (one agent builds, another actively tries to break it), 7-gate quality check, browser dogfooding as a real user, lesson capture, and skill auto-improvement. Persists state to .claude/cycles/[ID].yaml so any session resumes mid-cycle without losing progress. Works across Claude Code, Cursor, Windsurf, Codex, Gemini. NOT for standalone code review (use dev-qa), standalone browser testing (use dev-browser), architecture planning alone (use dev-architect), or trivial one-file fixes."
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Task
argument-hint: "[WORKBOARD-ID | description | resume ID | gate ID | dogfood ID | status | close ID | abandon ID]"
---

# dev-cycle — Feature Lifecycle sin Choques

## Context Loading

**First action in every session:** load the active project's `dev.playbook.md`.

| Playbook section | What this skill needs |
|---|---|
| Key paths | Where COORDINATION.md, WORKBOARD, MEMORY, and registries live |
| Development commands | Baseline commands for PLAN phase |
| Quality Contract | Phase 3 checklist for GATE phase |
| Patterns we follow | Build order and conventions |

> **Key coordination files (from playbook):** See `dev.playbook.md` → **Key paths** for the exact location of `.claude/COORDINATION.md`, `specs/systems/REGISTRY.md`, `specs/presets/REGISTRY.md`, and other cycle-critical files for the active project.

If `dev.playbook.md` doesn't exist in the project: stop and ask before proceeding.

> De idea a producción. Estado persistente. Revisión adversarial. Sin duplicados. Sin conflictos.
> **El agente que no aprende repite errores. LEARN es obligatorio en todo ciclo, siempre.**

```
INTAKE → PLAN → COLLISION → BUILD → AUDIT → GATE → DOGFOOD → LEARN → IMPROVE → CLOSE
```

**Referencias:** `${CLAUDE_SKILL_DIR}/references/protocols.md` — filosofía, mode selector, state file schema, collision/audit protocols, gate checklists (G3/G4/G5/G6), lesson examples, CLOSE commands, resume/status formats.

---

## Modos por tamaño de trabajo

Todos los trabajos pasan por dev-cycle. El modo determina qué fases son obligatorias.

| Trabajo | Modo | Fases obligatorias | LEARN | State file |
|---|---|---|---|---|
| Nueva feature, sistema, ADR | **FULL** | Todas (1-10) | Obligatorio | Sí |
| Bug fix, mejora pequeña, refactor | **MINI** | INTAKE → BUILD → GATE (G1+G2) → LEARN → CLOSE | Obligatorio | Sí |
| Grupo de fixes/mejoras relacionadas | **BATCH** | INTAKE → BUILD → GATE (G1+G2+G7) → LEARN → CLOSE | Obligatorio | Sí |
| Docs, copy, config, 1-5 líneas | **NANO** | BUILD → LEARN (inline) → CLOSE | Inline | No |
| Skill update | **META** | INTAKE → PLAN → BUILD → LEARN → CLOSE | Obligatorio | Sí |

**LEARN nunca se salta.** Sin LEARN = sin mejora. Si no hubo nada que aprender, escribe
`{ type: "pattern_success", description: "trabajo limpio", target: "—" }`.

### BATCH — Agrupación de fixes relacionados

Cuando hay N fixes/mejoras que comparten contexto (ej: "reparar todos los tests rotos",
"estandarizar empty states"), usar BATCH en vez de N ciclos MINI separados.

- **Un solo ciclo ID**, un solo commit (o pocos), un solo LEARN
- INTAKE lista todos los items del batch
- BUILD ejecuta todos secuencialmente o en paralelo
- GATE cubre el batch completo (G1+G2+G7)
- LEARN captura patrones transversales, no lecciones por item

### NANO — Sin ceremonia

NANO no crea state file ni actualiza WORKBOARD. El flujo completo:
1. Hacer el cambio
2. LEARN inline: una frase en el commit message o en `planning/LESSONS.md` si fue relevante
3. Commit y push

Si un trabajo "NANO" revela complejidad → promover a MINI y crear state file.

Selector de modo detallado → `references/protocols.md § 2`.

---

## Compatibilidad multi-IDE

| IDE | Paralelo | Browser | Ralph¹ | Estado |
|---|---|---|---|---|
| **Claude Code** | ✅ Task tool | ✅ Playwright MCP | ✅ plugin | ✅ state file |
| **Cursor** | ⚡ tabs manuales | ✅ si configurado | ❌ | ✅ state file |
| **Windsurf** | ⚡ tabs manuales | ✅ si configurado | ❌ | ✅ state file |
| **Codex/Gemini** | ⚡ sesiones | ⚡ si MCP | ❌ | ✅ state file |

¹ `ralph-loop` es un **plugin oficial de Claude Code**, no un skill local.
El estado del ciclo vive en `.claude/cycles/[ID].yaml` — visible para cualquier IDE o agente.

---

## Comandos

| Comando | Cuándo |
|---|---|
| `/dev-cycle [ID o descripción]` | Feature nueva — INTAKE si es nueva, PLAN si viene del WORKBOARD |
| `/dev-cycle resume [ID]` | Retomar donde quedó la sesión anterior |
| `/dev-cycle gate [ID]` | Entrar en GATE directamente (BUILD ya hecho) |
| `/dev-cycle dogfood [ID]` | Entrar en DOGFOOD directamente (GATE verde) |
| `/dev-cycle status` | Ver todos los ciclos activos y su estado |
| `/dev-cycle close [ID]` | Merge final — requiere GATE + DOGFOOD done |
| `/dev-cycle abandon [ID]` | Abandonar y limpiar — conserva state file como audit trail |

**Al iniciar cualquier comando:** verificar primero si hay un ciclo activo para esa feature:
```bash
ls .claude/cycles/ 2>/dev/null && cat .claude/cycles/[ID].yaml 2>/dev/null
```
Si existe → es un `resume`, no un start nuevo.

---

## State File — `.claude/cycles/[ID].yaml`

Escrito antes de cada transición de fase. Bootstrap: `mkdir -p .claude/cycles`.
Los state files se **commitean** en CLOSE — son parte del audit trail del proyecto.

**Excepción: NANO no crea state file.** El overhead supera el valor para cambios triviales.

Campos mínimos: `id`, `mode` (FULL/MINI/NANO/META), `phase`, `status`, `agent`,
`agent_heartbeat`, `lock.held_by`, `lock.expires_at`, `impact_map.files_modified`,
`phases.[FASE].state`, `phases.PLAN.doc_owner`.

Lock: si `expires_at` en el futuro → STOP. Expirado + agente muerto → robar + loguear.

Schema completo → `references/protocols.md § 3`.

---

## WORKBOARD — Tracking de fases

**Badge en la tabla de features:**
`—` · `INTAKE` · `PLAN` · `COLLISION` · `BUILD` · `AUDIT` · `GATE G3/7` · `DOGFOOD` · `LEARN` · `CLOSE` · `✅ [hash]` · `❌ abandoned`

---

## FASE 0 — INTAKE

Saltar si el ID viene del WORKBOARD con spec clara → ir directo a PLAN.

```
1. ¿Qué problema real resuelve? ¿Para quién?
2. ¿Criterio de done más simple posible?
3. ¿Feature nueva, fix, refactor, o skill update?
4. ¿Dependencias con features en vuelo?
```

Seleccionar modo usando la tabla arriba + árbol de decisión en `references/protocols.md § 2`.

Escribir `phases.INTAKE.mode_selected` y `phases.INTAKE.state: done`. Actualizar WORKBOARD badge `INTAKE`.

---

## FASE 1 — PLAN

```bash
git pull origin master && git status
pnpm tsc --noEmit 2>&1 | tail -3   # baseline
pnpm test 2>&1 | tail -3            # baseline
```

Leer: `.claude/COORDINATION.md` → `planning/WORKBOARD.md` → `planning/MEMORY.md`

**Visión amplia antes del detalle — OBLIGATORIO:**
1. ¿Existe ya algo similar en el codebase? (`Grep` + `Glob` activos)
2. ¿Qué patrón usa el código vecino? (leer 1-2 archivos similares)
3. ¿Cuál es la solución que no crea deuda? (no la más rápida)
4. ¿Qué puede romperse que no es obvio?

**Mapa de impacto (escribir en state file `impact_map`):**
```
Archivos nuevos / modificados / en riesgo (lista exacta)
Schema DB: sí/no — tablas
Contratos Zod: nuevos o modificados en packages/contracts/
Tests en riesgo: qué puede romperse
Paralelo con otros ciclos: sí/no + razón
```

**Doc-Owner Check — OBLIGATORIO en FULL, recomendado en MINI:**

Antes de planificar la implementación, identificar el hogar documental:

```
1. ¿Qué sistema o preset es owner de este cambio?
   → Buscar en specs/systems/REGISTRY.md y specs/presets/REGISTRY.md

2. ¿Qué pack hay que tocar?
   → Si el sistema existe: su carpeta en specs/systems/[sistema]/
   → Si es preset nuevo: specs/presets/[nombre]/
   → Si cruza sistemas: documentar en ambos con @canonical en uno

3. ¿Falta PDR / spec / contrato Zod?
   → Nueva ruta o API sin spec → STOP. Crear spec antes de BUILD.
   → Nueva tabla DB sin schema doc → STOP. Documentar en pack del sistema.

4. ¿Existe ya documentación equivalente en otro sitio?
   → grep -r "[término clave]" specs/ docs/
   → Si existe → consolidar, no crear segunda autoridad

5. ¿El trabajo tiene un home documental claro?
   → Si NO → resolver antes de pasar a BUILD.
```

Escribir `phases.PLAN.doc_owner: "[sistema/pack]"` o `"undefined — bloqueado"`.

**Reservar archivos en COORDINATION.md** (solo FULL/MINI con hotspots):
```
RESERVADO: [archivo] — ciclo [ID] — [agente] — hasta GATE
```

Usar `dev-architect` si hay decisión arquitectónica antes de implementar.
Presentar plan al usuario. Esperar confirmación. Escribir `phases.PLAN.state: done`.

---

## FASE 2 — COLLISION SCAN (FULL + MINI complejos)

**Antes de tocar un solo archivo.** Lanzar en paralelo (Claude Code):
```
Task(Explore): duplicate detection — Glob + Grep sobre packages/ui, packages/contracts, packages/core
Task(Explore): package conflicts — packages/ui/package.json vs paquetes candidatos
Task(Bash):    migration + hotspot — ls migrations, grep tabla objetivo, leer COORDINATION.md
```

**E — Component/Hook existence check:**
Before creating any new component or hook:
- `ls packages/ui/src/hooks/` + `ls packages/ui/src/components/`
- If found → reuse. If not but 2+ uses expected → create in `packages/ui`, not app-local.

Protocolo completo (A-F): `references/protocols.md § 4`.

**Contract-first check:** si la feature añade nueva API → ¿existe contrato Zod en `packages/contracts/src/`? Si NO → STOP.

**F — Documentation collision (FULL):**
```bash
grep -ri "[feature name]" specs/ docs/ planning/
```
¿Segunda autoridad? → STOP. ¿Spec histórica activa? → ❌ BLOCKED.

**Resultado esperado:**
```
COLLISION SCAN — [feature]
A-E: ✅/⚠️  F. Doc: ✅/⚠️/❌
Veredicto: ✅ CLEAN → BUILD / ❌ BLOCKED → resolver primero
```

Escribir `phases.COLLISION.state: done` + resultado. Bloqueante → `status: blocked`.

---

## FASE 3 — BUILD

**Worktree (solo FULL — MINI/NANO trabajan en master):**
```bash
[ -d ".worktrees/cycle-[ID]" ] || git worktree add .worktrees/cycle-[ID] -b cycle/[ID]
```

**Agentes paralelos** (solo FULL + archivos disjuntos):
```
Task(background, dev-builder): "[sub-tarea A — archivos: lista]"
Task(background, dev-builder): "[sub-tarea B — archivos: lista]"
```
Si hay dependencias → secuencial: Schema → Core/Actions → UI → Tests.

**Commits parciales:**
```bash
git add [archivos específicos]   # nunca git add .
git commit -m "feat([scope]): [desc] [WIP]"
```
Máx. 5 archivos/commit. Añadir hash a `phases.BUILD.commits`.

Si nueva UI: invocar `dev-design` antes de implementar componentes.

---

## FASE 4 — AUDIT ADVERSARIAL (FULL)

**Un agente construyó. Otro intenta romperlo activamente.**

```
Task(dev-qa, modo adversarial):
  Protocolo completo → references/protocols.md § 5
  Producir reporte con severidades HIGH / MEDIUM / LOW
```

Loop: HIGH → fix en worktree → commit WIP → re-audit (máx. 3 rondas).
Clean / solo MEDIUM-LOW → continuar a GATE.

Escribir `phases.AUDIT.verdict`. HIGH sin resolver tras 3 rondas → `status: blocked`.

---

## FASE 5 — GATE

**Gates por modo:**

| Gate | FULL | MINI | BATCH | NANO |
|---|---|---|---|---|
| G1 TypeScript | ✅ | ✅ | ✅ | skip |
| G2 Tests | ✅ | ✅ | ✅ | skip |
| G3 Browser | ✅ | si UI tocada | si UI tocada | skip |
| G4 Seguridad | ✅ | si API tocada | si API tocada | skip |
| G5 Docs | ✅ | skip | skip | skip |
| G6 Dead code | ✅ | skip | skip | skip |
| G7 Regresión | ✅ | ✅ | ✅ | skip |

**Resume inteligente:** leer `phases.GATE.gates`. Saltar los que tienen `passed: true`.
Imprimir: `"Resumiendo gate desde G[N] (G1..G[N-1] ya pasados)"`

**G1 — TypeScript:**
```bash
pnpm tsc --noEmit
```
✅ 0 errores | ❌ bloquea

**G2 — Tests:**
```bash
pnpm test
```
✅ 0 failures, 0 skips | ❌ bloquea

**G3 y G4 en paralelo (Claude Code):**
```
Task(background, dev-browser): flujos afectados — ver references/protocols.md § 6
Task(dev-qa seguridad): checklist — ver references/protocols.md § 7
```

**G5 — Docs (hard gate, FULL — bloquea si falla cualquier punto):**

Delegar a `dev-docs-governor` para revisión completa. Checklist mínimo:
```
□ La nueva documentación está en el pack correcto (specs/systems/ o specs/presets/)
□ No se creó segunda autoridad — hay exactamente UN doc canónico por concepto
□ Contenido absorbido clasificado como absorbed/historical o en delete queue
□ Nada nuevo quedó huérfano (referenciado desde un índice o con @canonical)
□ docs/INDEX.md actualizado si se añadió carpeta o archivo de nivel superior
□ Runtime refs re-ancladas: grep "@canonical" specs/architecture/ — ninguna → V02 activo
□ specs/presets/REGISTRY.md actualizado (si se tocaron presets)
□ specs/systems/REGISTRY.md actualizado (si se tocaron systems)
```
Nueva capacidad sin spec → **bloquea**. Spec obsoleta no actualizada → **bloquea**.
Solo ⚠️ (no bloquea): dead refs en docs secundarios, README orphans menores.

Checklist completo → `references/protocols.md § 8`.

**G6 — Dead code:** ver `references/protocols.md § 9`. No bloquea, warn.

**G7 — Regresión:**
```bash
pnpm test 2>&1 | grep -E "FAIL|Error" | head -20
```

**Reporte:**
```
| G1 TypeScript | ✅/❌ |   | G2 Tests      | ✅/❌ |
| G3 Browser    | ✅/⚠️/❌ | | G4 Seguridad  | ✅/❌ |
| G5 Docs       | ✅/⚠️/❌ | | G6 Dead code  | ✅/⚠️ |
| G7 Regresión  | ✅/❌ |
Veredicto: ✅ MERGE / ❌ BLOCKED — [lista bloqueantes]
```

Actualizar `phases.GATE.gates` en state file tras cada gate.

---

## FASE 6 — DOGFOOD (FULL + MINI con UI)

"Soy el usuario real intentando hacer X, sin mirar el código."

```
1. Login real (entry point del usuario, no deep link directo)
2. Completar la tarea que la feature resuelve
3. Registrar cada fricción o fallo
4. Edge cases del usuario: doble click, back, F5, viewport estrecho
5. Verificar loading / error / empty states
```

Finding HIGH → volver a BUILD. MEDIUM/LOW → registrar en `phases.DOGFOOD.findings`.

---

## FASE 7 — LEARN (SIEMPRE, SIN EXCEPCIÓN)

**Esta fase es el corazón del sistema. No se salta nunca, en ningún modo.**

### LEARN escala por modo

| Modo | Formato | Dónde |
|---|---|---|
| **NANO** | 1 frase en commit message o LESSONS.md si relevante | Inline |
| **MINI** | 1-3 bullet points en state file | `phases.LEARN.lessons` |
| **BATCH** | Patrones transversales del grupo (no por item) | `phases.LEARN.lessons` + LESSONS.md |
| **FULL** | Reflexión completa (5 preguntas) + YAML tipado | `phases.LEARN.lessons` + LESSONS.md |
| **META** | Qué mejoró, qué sobra, qué falta | `phases.LEARN.lessons` |

### Reflexión (FULL/META — simplificar para MINI/BATCH):
1. ¿Qué funcionó bien que no sabía antes?
2. ¿Qué fue más difícil de lo esperado?
3. ¿Qué haría diferente si repitiera?
4. ¿Hay un patrón nuevo que merece documentarse?
5. ¿Hay un área frágil que otros agentes deben saber?

**Tipos de lección** (usar en `phases.LEARN.lessons`):

| Tipo | Cuándo usar |
|---|---|
| `pattern_success` | Un patrón que funcionó y debería repetirse |
| `pattern_failure` | Un patrón que falló y debe evitarse |
| `fragile_area` | Zona frágil o sorprendente para otros agentes |
| `skill_candidate` | Lección generalizable que mejora un skill |
| `architectural_decision` | Decisión que debe quedar en MEMORY.md |
| `documentation_lesson` | Patrón documental: dónde vive qué, qué genera caos |

YAML examples completos → `references/protocols.md § 10`.

### LESSONS.md — Memoria externa persistente

Lecciones con valor duradero (no efímeras) van a `planning/LESSONS.md` además del state file.
Criterio: ¿otro agente en otra sesión cometería el mismo error? → LESSONS.md.
Ver formato en ese archivo.

Escribir `phases.LEARN.state: done`. Si hay `architectural_decision` → actualizar `planning/MEMORY.md` antes de continuar.

---

## FASE 8 — IMPROVE

**Para cada lesson `type: skill_candidate`:**
- Editar el skill en `target` con el Edit tool
- Si requiere skill nueva → usar `skill-creator` plugin
- Registrar en `phases.IMPROVE.skills_updated`

**Para cada lesson `type: fragile_area`:**
- Si afecta a `.claude/COORDINATION.md` → actualizar sección hotspots

**Para cada lesson `type: architectural_decision`:**
- Verificar que ya se actualizó `planning/MEMORY.md` en LEARN

**Para cada lesson `type: documentation_lesson`:**
- Si es patrón recurrente → editar `dev-cycle` SKILL.md en Doc-Owner Check o G5
- Si es específico de un sistema → añadir nota al pack de ese sistema
- Si afecta a runtimes → notificar a `dev-docs-governor`

**CLOSE gate:** Si hay `skill_candidate` sin procesar → CLOSE bloqueado.

Solo actualizar skills con lecciones generalizables, no casos ultra-específicos.

---

## FASE 9 — CLOSE

Pre-flight + comandos completos → `references/protocols.md § 11`.

Verificaciones mínimas:
- **FULL:** 7 gates `passed:true` + AUDIT clean + DOGFOOD clean + LEARN done + skill_candidates procesados
- **MINI/BATCH/META:** G1 + G2 + G7 `passed:true` + LEARN done
- **NANO:** LEARN inline done (no gates, no state file)

**FULL:** Crear PR con `gh pr create` → esperar aprobación de Irix (Gate 2). No merge directo.
**MINI/BATCH/NANO/META:** Push directo a master (fast-track — fix/chore/docs/test/perf).

---

## MODO: `resume [ID]`

Leer state file → adquirir lock → anunciar "Retomando [ID] en fase [phase] — modo [mode]".
Si GATE: imprimir gates completados, empezar en el primero pending.
Detalle → `references/protocols.md § 12`.

---

## MODO: `status`

Lista todos los ciclos en `.claude/cycles/`: activos (lock, fase, agente), cerrados 7 días, worktrees huérfanos.
Formato → `references/protocols.md § 13`.

---

## Reglas no negociables

| Regla | Por qué |
|---|---|
| LEARN siempre, aunque sean 2 líneas | Sin lecciones el sistema no mejora |
| Visión amplia ANTES del código | El atajo rápido es el más caro |
| State file antes de cada transición (excepto NANO) | Resume funciona si la sesión muere |
| Collision scan ANTES de BUILD (FULL) | No duplicamos, no chocamos |
| Audit adversarial ANTES de GATE (FULL) | Los tests automáticos no ven todo |
| 7 gates todos verdes antes de merge (FULL) | Un gate parcial es peor que ninguno |
| `git pull --rebase` antes del merge final | Evita push-over conflict |
| Confirmación explícita antes del merge | Irreversible |
| Nunca `git add .` | Secrets accidentales |
| Max 5 archivos/commit | DevOx atomicity |
| Spec antes de código en features materiales | Documentation Gate |
| No CLOSE si skill_candidate sin procesar | Lecciones generalizables deben capturarse |
| Doc-owner check ANTES de BUILD (FULL) | Sin home documental claro = caos garantizado |
| G5 bloquea si doc no está en el sitio correcto | El código sin docs coherentes está a medias |
| Rechazar atajos que crean deuda | El código limpio hoy es velocidad mañana |

---

## Routing de skills

| Fase | Principal | Apoyo |
|---|---|---|
| INTAKE | dev-cycle | dev-architect si hay ambigüedad |
| PLAN | dev-architect | dev-docs-governor (doc-owner check), dev-db si hay schema work |
| COLLISION | Explore agents × 3 paralelo | dev-docs-governor (F: doc collision), dev-backend si hay RLS/API |
| BUILD | dev-builder | ralph-loop (plugin), dev-db, dev-design |
| AUDIT | dev-qa adversarial | — |
| GATE G1-G2 | dev-qa | — |
| GATE G3 | dev-browser | — (paralelo con G4) |
| GATE G4 | dev-qa | dev-backend si hay RLS |
| GATE G5 | dev-docs-governor | — |
| DOGFOOD | dev-browser | dev-ux para análisis de fricción |
| LEARN+IMPROVE | dev-cycle | skill-creator (plugin) si skill nueva |
| CLOSE | dev-cycle | — |

---

## Archivos clave

| Archivo | Cuándo |
|---|---|
| `.claude/cycles/[ID].yaml` | Toda operación de resume |
| `planning/WORKBOARD.md` | INTAKE, PLAN, CLOSE |
| `planning/MEMORY.md` | PLAN, LEARN (architectural_decision), CLOSE |
| `.claude/COORDINATION.md` | PLAN (reservar), COLLISION (hotspots), CLOSE (liberar) |
| `packages/contracts/src/` | COLLISION — contratos existentes |
| `dev.context.yaml` | PLAN — stack, paths, constraints |

Stack: pnpm monorepo · Next.js 16 · Supabase · Vitest · Playwright MCP `localhost:3001` · branch `master` · push via PR or fast-track direct push

Playwright MCP config: `--browser chromium --headless --isolated --viewport-size 1280,800`
