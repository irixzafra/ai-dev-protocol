# dev-cycle — Reference Protocols
_Leer cuando la fase activa requiere el detalle completo. SKILL.md contiene el esqueleto operativo; este archivo contiene los protocolos completos, schemas, y ejemplos._

## Table of Contents
1. [Filosofía: El Desarrollador que Aprende](#1-filosofía)
2. [Mode Selector: Decision Tree](#2-mode-selector)
3. [State File: Full Schema](#3-state-file-schema)
4. [Collision Scan: Commands](#4-collision-scan)
5. [Adversarial Audit Protocol](#5-adversarial-audit)
6. [G3: Browser Testing Protocol](#6-g3-browser)
7. [G4: Security Checklist](#7-g4-security)
8. [G5: Documentation Gate](#8-g5-docs)
9. [G6: Dead Code Scan](#9-g6-dead-code)
10. [Lesson Types: YAML Examples](#10-lesson-types)
11. [CLOSE: Pre-flight + Commands](#11-close)
12. [Mode: resume](#12-mode-resume)
13. [Mode: status](#13-mode-status)

---

## 1. Filosofía

dev-cycle no es solo un pipeline de entrega. Es un sistema de aprendizaje continuo.

Cada tarea — grande, pequeña, fix de un bug, cambio de copy — es una oportunidad para
hacerlo mejor la próxima vez. El desarrollador experto no solo entrega código: observa
patrones, identifica qué funciona, qué es frágil, y actualiza sus herramientas mentales.
LEARN + IMPROVE son el corazón del ciclo, no el cierre.

### Visión amplia antes del código (obligatorio en PLAN)

Antes de tocar una línea de código:
1. **Entender el sistema completo** — no solo el archivo a modificar
2. **Buscar soluciones existentes** — ¿ya existe algo similar? ¿hay un patrón?
3. **Evaluar el impacto lateral** — ¿qué puede romperse? ¿qué depende de esto?
4. **Rechazar atajos que ensucian** — si la solución rápida crea deuda, no se toma

El atajo correcto es la solución limpia.

---

## 2. Mode Selector

```
¿Nueva capacidad material (ruta, feature, sistema, preset, ADR)?
  → FULL

¿Bug fix, mejora, refactor, cleanup?
  → MINI (si toca ≤5 archivos)
  → FULL (si toca arquitectura o >5 archivos)

¿Grupo de fixes/mejoras relacionadas (ej: "reparar todos los tests", "estandarizar empty states")?
  → BATCH (un ciclo, un LEARN transversal, no N ciclos separados)

¿Docs, copy, config, comentarios, 1-5 líneas obvias?
  → NANO (sin state file — BUILD → commit con LEARN inline)

¿Actualizar un skill en ~/.claude/skills/?
  → META
```

**Si NANO o MINI:** anotar qué fases se saltan y por qué.
Ejemplo: `"COLLISION: skipped — bug fix en 1 archivo, sin riesgo de duplicado"`

**Promoción:** Si un NANO revela complejidad inesperada → promover a MINI (crear state file).
Si un MINI toca >5 archivos o requiere decisión arquitectónica → promover a FULL.

---

## 3. State File Schema

```yaml
version: 1
id: "M2.SRF.06"
mode: "FULL"           # FULL | MINI | NANO | META
phase: "GATE"
entry_phase: "INTAKE"
status: "in_progress"  # in_progress | blocked | done | abandoned

agent: "claude-code"
agent_heartbeat: "2026-03-11T11:42:00Z"

worktree:
  branch: "master"     # o cycle/[ID] si usa worktree
  path: "."

impact_map:
  files_new: []
  files_modified: []
  files_at_risk: []

phases:
  INTAKE:    { state: done, mode_selected: "FULL" }
  PLAN:      { state: done, doc_owner: "specs/systems/knowledge/" }
  COLLISION: { state: done, result: "clean" }
  BUILD:     { state: done, commits: [] }
  AUDIT:     { state: done, verdict: "clean" }
  GATE:
    state: in_progress
    gates:
      G1_typescript: { state: done,        passed: true  }
      G2_tests:      { state: done,        passed: true  }
      G3_browser:    { state: in_progress, passed: null  }
      G4_security:   { state: not_started, passed: null  }
      G5_docs:       { state: not_started, passed: null  }
      G6_dead_code:  { state: not_started, passed: null  }
      G7_regression: { state: not_started, passed: null  }
  DOGFOOD:   { state: not_started, findings: [] }
  LEARN:     { state: not_started, lessons: [] }
  IMPROVE:   { state: not_started, skills_updated: [] }
  CLOSE:     { state: not_started, merge_commit: null }

lock:
  held_by: "claude-code"
  expires_at: "2026-03-11T11:52:00Z"  # TTL 10 min, renovar en cada operación
```

**Lock protocol:**
```
1. No existe → crear, escribir lock
2. expires_at en el futuro → STOP ("Bloqueado por [held_by]. Usa /dev-cycle status.")
3. expires_at expirado + agente muerto → robar lock + loguear
```

---

## 4. Collision Scan

Lanzar en paralelo (3 Tasks en Claude Code):

### A — Duplicate detection

```bash
# ¿Componente UI con nombre similar ya existe?
find packages/ui/src/components -name "*.tsx" | xargs grep -l "[NombreComponente]" 2>/dev/null
find apps/platform/app -name "*.tsx" | xargs grep -l "[NombreComponente]" 2>/dev/null

# ¿Engine o lógica similar en core?
grep -r "function [nombreFuncion]\|const [nombreFuncion]" packages/core/

# ¿Schema Zod similar ya existe en contracts?
grep -r "[NombreSchema]Schema\|[NombreSchema]Type" packages/contracts/src/
```

### B — Package deduplication

```bash
# packages/ui es SSOT para paquetes UI compartidos
cat packages/ui/package.json | python3 -c "import sys,json; d=json.load(sys.stdin); [print(k) for k in {**d.get('dependencies',{}), **d.get('devDependencies',{})}]"

# Si el paquete ya está en packages/ui → usar @repo/ui, no añadir a apps/platform
```

### C — Migration conflict check

```bash
ls -t packages/db/migrations/ | head -10
grep -l "[tabla-objetivo]" packages/db/migrations/*.sql 2>/dev/null | head -5
```

### D — Hotspot check

```bash
grep -A10 "hotspot\|RESERVADO" .claude/COORDINATION.md
```

### E — Component/hook existence

```bash
ls packages/ui/src/hooks/ | grep -i "[feature]"
ls packages/ui/src/components/ | grep -i "[feature]"
```

### F — Documentation collision (FULL)

```bash
grep -ri "[feature name]" specs/ docs/ planning/
```
- ¿Hay otro doc diciendo lo mismo? → consolidar antes de BUILD
- ¿Creando segunda autoridad? → STOP
- ¿Código cuelga de spec histórica (V02, archive)? → ❌ BLOCKED

### Contract-first check

Si la feature añade nueva API pública → verificar `packages/contracts/src/`.
Si no existe el contrato → STOP. Crear contrato antes de implementar.

### Expected output

```
COLLISION SCAN — [feature]
A. Duplicados:  ✅ clean / ⚠️ [detalle]
B. Paquetes:    ✅ clean / ⚠️ [ya en packages/ui]
C. Migrations:  ✅ clean / ⚠️ [conflicto]
D. Hotspots:    ✅ clean / ⚠️ [hotspot activo]
E. Components:  ✅ clean / ⚠️ [ya existe en packages/ui]
F. Doc:         ✅ clean / ⚠️ [segunda autoridad] / ❌ [spec histórica activa]
Veredicto: ✅ CLEAN → BUILD / ❌ BLOCKED → resolver primero
```

---

## 5. Adversarial Audit Protocol

El auditor lee **todo** el código nuevo de la feature e intenta romperlo activamente:

```
LÓGICA
□ ¿La función hace lo que el spec dice que debe hacer?
□ ¿Qué pasa con inputs null / undefined / array vacío?
□ ¿Qué pasa si la llamada de red falla a mitad?
□ ¿Hay race conditions (setState tras unmount, fetches paralelos sin cancelación)?

TIPOS
□ ¿Hay `any` implícito que el compilador acepta pero es semánticamente incorrecto?
□ ¿Narrowing correcto (el runtime puede recibir algo que los tipos no contemplan)?
□ ¿Los genéricos tienen constraints suficientes?

AUTH / TENANCY
□ Cada server action verifica org_id / ownership antes de mutar datos
□ RLS habilitado en tablas nuevas
□ Sin bypass de RLS (createServiceClient solo donde es intencional y documentado)
□ ¿Puede un usuario ver/modificar datos de otro org? → HIGH severity

CONTRATOS
□ ¿El output cumple el schema Zod declarado?
□ ¿Los errores se devuelven en formato AppResponse<T>?
□ ¿Hay campos opcionales que el consumidor asume como obligatorios?

COBERTURA DE TESTS
□ ¿Los tests cubren el error path, no solo el happy path?
□ ¿Hay casos edge mencionados en la spec sin test?
□ ¿Los mocks son realistas?

COHERENCIA CON MEMORY.md
□ ¿El código contradice alguna decisión activa en planning/MEMORY.md?
□ ¿Implementa algo que MEMORY.md marca como "diferido" o "fuera de scope"?
```

**Severidad:**

| Nivel | Consecuencia |
|---|---|
| HIGH | Bloquea GATE. Fix + re-audit obligatorio. Máx. 3 rondas. |
| MEDIUM | Documenta en state file. No bloquea. |
| LOW | Registra en LEARN como fragile_area. |

---

## 6. G3: Browser Testing Protocol

**Dev server must be running:** `http://localhost:3001`
**Playwright MCP:** `--browser chromium --headless --isolated --viewport-size 1280,800`

Lanzar como `Task(background, dev-browser)`.

**Flujos mínimos por área** (correr solo los afectados por la feature):

| Área | Flujo | Verificar |
|---|---|---|
| Data | Crear registro → editar campo → guardar | Persistencia tras reload |
| Knowledge | Crear doc → editar título → DnD árbol → exportar | .md descargado |
| Variables | `@mention` → `{{live_value}}` → writeback | Estados: stale / deleted / unauthorized |
| Agents | Fleet view → proposal → aprobar/rechazar | Estado en DB |
| Inbox | Ver threads → responder → marcar leído | Badge unread actualizado |
| Auth | Login → dashboard → settings → logout | Session cleared |

**Por cada flujo:**
```
1. browser_navigate → URL de entrada real (no deep link)
2. browser_snapshot → verificar estado inicial esperado
3. Por cada paso: snapshot → act (click/type/press) → snapshot (verificar resultado)
4. browser_console_messages → cero errores JS críticos
5. browser_network_requests → cero 500/401 inesperados
```

**Umbrales:**
- ✅ Flujo completa sin fricción
- ⚠️ Fricción menor (label confuso, animación rota) — documentar, no bloquea
- ❌ Bloqueante crítico (acción falla, dato no persiste) — bloquea merge

---

## 7. G4: Security Checklist

```
INPUTS
□ Inputs de usuario sanitizados antes de queries o mutaciones
□ Sin interpolación directa en SQL/PostgREST (nunca `${userValue}` en queries)
□ Sin XSS en rendering de user content (Tiptap HTML, innerHTML, dangerouslySetInnerHTML)

AUTH / TENANCY
□ Server Actions validan org_id / ownership antes de mutar datos del tenant
□ RLS habilitado en tablas nuevas (verificar: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = '[schema]')
□ Sin bypass de RLS (createServiceClient solo donde es intencional y documentado)

SECRETS
□ Sin NEXT_PUBLIC_ prefix en variables que deben ser server-only
□ Sin credenciales hardcodeadas (tokens, passwords, connection strings)
□ Sin secrets expuestos en API responses o logs

TIPOS
□ Sin @ts-ignore sin justificación documentada
□ Sin `as any` que encubra un problema de tipado real
```

**Si hay duda en cualquier punto → tratar como HIGH + escalar a dev-backend.**

---

## 8. G5: Documentation Gate

```
□ ¿Es nueva capacidad material?
    → spec obligatoria en specs/systems/[sistema]/ o specs/presets/[preset]/
    → si no existe: STOP — crear spec primero

□ ¿La nueva documentación está en el pack correcto?
    → No en docs/ ad-hoc si pertenece a un sistema

□ ¿No se creó segunda autoridad?
    → exactamente UN doc canónico por concepto

□ ¿Nada nuevo quedó huérfano?
    → Referenciado desde índice o desde otro doc con @canonical

□ ¿docs/INDEX.md actualizado?
    → Si se añadió nueva carpeta o archivo de nivel superior

□ ¿Runtime refs re-ancladas?
    → grep "@canonical" specs/architecture/ — ninguna apunta a V02 activo

□ ¿specs/presets/REGISTRY.md actualizado?
    → Si se tocaron specs/presets/

□ ¿specs/systems/REGISTRY.md actualizado?
    → Si se tocaron specs/systems/

□ ¿Modifica un ADR activo? → actualizar el ADR antes de merge
□ ¿Hubo decisión arquitectónica? → añadir entrada en planning/MEMORY.md
```

**Bloquea:** nueva capacidad sin spec, spec obsoleta no actualizada, segunda autoridad.
**No bloquea (⚠️):** dead refs en docs secundarios, README orphans menores.

---

## 9. G6: Dead Code Scan

No bloquea GATE. Genera warnings que van a LEARN como `fragile_area`.

```bash
# En archivos modificados por la feature
grep -n "console\.log" [archivos]
grep -n "TODO\|FIXME\|HACK" [archivos]
grep -n "@ts-ignore" [archivos]

# TypeScript unused declarations
pnpm tsc --noEmit 2>&1 | grep "TS6133"

# Exports sin consumidores
grep -r "from.*[modified-file-name]" apps/ packages/ | grep -v "__tests__" | grep -v "index.ts"
```

```
□ Sin console.log de debug
□ Sin TODO sin ticket asociado
□ Sin código comentado sin justificación
□ Sin archivos creados que no son importados por nadie
□ Sin exports nuevos sin consumidores en el monorepo
```

---

## 10. Lesson Types: YAML Examples

```yaml
lessons:
  # Un patrón que funcionó y debería repetirse
  - type: "pattern_success"
    description: "navigator.clipboard.writeText() + timeout reset — zero-dep y confiable"
    target: "packages/ui"

  # Un patrón que falló y debe evitarse
  - type: "pattern_failure"
    description: "no usar React.memo con props de función — re-renders igual"
    target: "packages/ui"

  # Zona frágil o sorprendente para otros agentes
  - type: "fragile_area"
    description: "concurrent commits: verificar git diff HEAD antes de add/commit"
    target: "dev-cycle"

  # Lección generalizable que mejora un skill
  - type: "skill_candidate"
    description: "datetime-local input requiere formato sin 'Z' final"
    target: "dev-builder"

  # Decisión que debe quedar en MEMORY.md
  - type: "architectural_decision"
    description: "data management legacy no resuelve your data engine — requiere migración dedicada"
    target: "planning/MEMORY.md"

  # Patrón documental: dónde vive qué, qué genera caos
  - type: "documentation_lesson"
    description: "features 'preset config' siempre tocan specs/presets/ + REGISTRY"
    target: "dev-cycle"
    # Ejemplos útiles:
    # "este runtime deja @canonical obsoletos — verificar en G5"
    # "este cluster tiende a dual authority — grep antes de documentar"
```

**Si no hay nada que aprender:**
```yaml
- type: "pattern_success"
  description: "trabajo limpio — sin nuevos patrones, sin sorpresas, sin deuda"
  target: "—"
```

---

## 11. CLOSE: Pre-flight + Commands

**Pre-flight (antes de cualquier acción):**
```
□ Modo FULL: 7 gates passed:true + AUDIT clean + DOGFOOD clean
□ Modo MINI/NANO/META: G1 + G2 + G7 passed:true
□ LEARN state:done — mínimo 1 lección
□ IMPROVE: skill_candidates procesados
□ MEMORY.md actualizado si hubo architectural_decision
□ Sin uncommitted changes
```

### FULL — Abrir PR (Gate 2: Irix aprueba el merge)

```bash
# Commit final en la feature branch
git add [archivos específicos]
git commit -m "$(cat <<'EOF'
feat(scope): descripción concisa, inglés, imperativo

Co-Authored-By: claude-sonnet-4-6 <noreply@anthropic.com>
EOF
)"

# Push de la feature branch y abrir PR
git push origin cycle/[ID]
gh pr create \
  --title "feat([scope]): [descripción]" \
  --body "$(cat <<'EOF'
## Spec
specs/active/[ID].md

## Audit sign-off
specs/active/[ID]-audit-sign-off.md

## Gate 1
- TypeScript: ✅
- Build: ✅
- Tests: ✅
- Secrets: ✅

## Cambios
[resumen breve del diff]
EOF
)"

# → Irix aprueba el PR en GitHub (Gate 2)
# → Tras merge: limpiar worktree
git worktree remove .worktrees/cycle-[ID]
git branch -d cycle/[ID]

# Registrar cierre (fast-track: chore)
git pull origin master
git add planning/WORKBOARD.md .claude/COORDINATION.md .claude/cycles/[ID].yaml
git commit -m "docs(workboard): close cycle [ID]"
git push origin master
```

### MINI / NANO / META — Direct push (fast-track)

```bash
# Commit final (tipo fix/chore/docs/test/perf — nunca feat/refactor aquí)
git add [archivos específicos]
git commit -m "$(cat <<'EOF'
fix(scope): descripción concisa, inglés, imperativo

Co-Authored-By: claude-sonnet-4-6 <noreply@anthropic.com>
EOF
)"

git pull --rebase origin master
git push origin master  # hook permite fix/chore/docs/test/perf directo

# Registrar cierre
git add planning/WORKBOARD.md .claude/cycles/[ID].yaml
git commit -m "docs(workboard): close cycle [ID]"
git push origin master
```

---

## 12. Mode: resume

```
1. Leer .claude/cycles/[ID].yaml
2. Adquirir lock (renovar si ya es nuestro, robar si expirado)
3. Anunciar: "Retomando [ID] en fase [phase] — modo [mode]"
4. Si GATE: imprimir gates completados, empezar en el primero pending
5. Si BUILD: retomar el worktree existente (si FULL)
6. Continuar con el contexto del state file
```

---

## 13. Mode: status

```
dev-cycle STATUS — [fecha]

Activos:
  [ID]  [FASE]  [MODO]  [agente]  [tiempo]  lock:[live|expired]

Cerrados (últimos 7 días):
  [ID]  DONE ✅  [hash]  [modo]  [fecha]

Worktrees sin ciclo activo (limpiar):
  .worktrees/cycle-[ID]  → git worktree remove + git branch -d
```
