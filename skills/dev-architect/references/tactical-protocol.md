# Modo Táctico — Intake → Plan Ejecutable

Usar cuando el usuario tiene una idea, una página, un bug o una mejora concreta y quiere convertirlo en trabajo ejecutable.

---

## Paso 1 — Intake

Capturar con preguntas directas al usuario:

| Dimensión | Pregunta clave |
|---|---|
| Problema real | ¿Qué no funciona o no existe? |
| Usuario real | ¿Quién lo necesita y cuándo? |
| Flujo | ¿Qué pasos sigue el usuario hoy? |
| Estados | ¿Qué pasa si está vacío? ¿Si falla? ¿Si funciona? |
| Permisos | ¿Quién puede ver/hacer/configurar esto? |
| Scope mínimo | ¿Cuál es la versión más pequeña que resuelve el problema? |
| Fuera de scope | ¿Qué NO hacemos en esta entrega? |
| Reutilizable | ¿Qué ya existe que podamos usar? |

**No diseñar hasta tener esto claro.** Si falta alguna dimensión, preguntar antes de avanzar.

## Paso 2 — Clasificación

Clasificar la petición antes de planificar:

| Tipo | Implicación |
|---|---|
| `local` | Contenido a una surface, bajo riesgo |
| `family-level` | Afecta a familia Workbench o Data |
| `shared primitive` | Subir el listón — afecta a todo el producto |
| `naming cleanup` | Coordinar con docs-governor |
| `backend/runtime` | No venderlo como "solo un fix de UI" |
| `dataset/integración externa` | No venderlo como "solo un fix de app" |
| `docs/ADR` | Si es caro de revertir, documentar antes de implementar |

## Paso 3 — Reuse audit + Descomposición de reutilización

**Antes de proponer cualquier código nuevo, completar esta tabla:**

| Qué se necesita | ¿Ya existe? | Destino correcto | Quién más se beneficia |
|---|---|---|---|
| [componente/engine] | Sí / No / Parcial | packages/ui · packages/core · packages/contracts · apps/features/views | [otras features o presets] |

**Código custom necesario: [número] LOC**
Si > 0 LOC: justificar por qué no puede ser una primitiva o config declarativa.

**Regla de destino (the active project):**
- UI presentacional → `packages/ui/src/components/domain/{vertical}/`
- Lógica de negocio / server actions → `packages/core/{feature}/`
- Tipos / schemas → `packages/contracts/`
- Pantallas de ruta (platform-specific) → `apps/platform/features/{feature}/views/`
- `features/*/ui/` NO es un destino permanente — es transitional hacia packages/

**Verificar con el código real:**

```bash
# Buscar primitive/pattern existente (destinos correctos)
grep -r "ComponentName" packages/ui/src/components/domain/ packages/ui/src/components/composites/
# Buscar hooks reutilizables
grep -r "use[A-Z]" packages/ui/src/hooks/ packages/core/
# Verificar barrel export
grep -r "export.*from" packages/ui/src/index.ts packages/contracts/src/index.ts
```

Decidir:
- **Extender** → el primitive existe pero le falta una prop o variante
- **Limpiar** → el primitive existe pero tiene deuda que dificulta el reuse
- **Crear** → justificar que nada existente sirve (gate de `dev-design/references/project-private-product.md`)

No aceptar: duplicación, cuarto dialecto visual, nuevo componente sin caso reutilizable, `features/*/ui/` como destino permanente.

## Paso 4 — Plan ejecutable

Generar el plan usando `references/plan-template.md` como formato de output.

El plan debe tener:
- máximo 3 fases
- tasks pequeñas (1 commit ≈ max 5 archivos)
- criterio de done verificable
- agente asignado
- scope exacto
- dependencias
- simplicity score 1-3 (si es 4-5, replantear)

**Si el plan no cabe en 3 fases, no está listo** — dividir o reducir scope.

## Paso 5 — Handoff operacional

El output útil no es un ensayo. Es una task card:

```markdown
### Task: [nombre]
- **Agente:** [skill]
- **Archivos reservados:** [paths]
- **Qué hacer:** [descripción concreta, no ambigua]
- **Criterio de done:** [verificable — no "it works"]
- **Guardrails:** [qué no tocar, qué no cambiar]
- **Verificación:** [comando, test, o browser QA]
- **Bloqueado por:** [nada / otra task]
```

Si la tarea toca UI visible de producto privado: el handoff debe incluir nota para que el builder invoque `dev-design` en the active project private product mode.
