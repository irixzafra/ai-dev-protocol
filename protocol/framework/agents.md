# Agent & AI Standards

> Criterios para trabajo con agentes AI, coordinacion multi-agente y creacion de skills.
> Aplica a todo proyecto que use Claude Code, Codex, Gemini u otros agentes.

---

## Skills disponibles y cuando usarlos

### Skills de flujo (mapean a fases del protocolo)

| Skill | Fase | Cuando invocarlo |
|-------|------|-----------------|
| `dev-architect` | DEFINIR | Intake de ideas, clasificacion, diseno de spec |
| `dev-builder` | CONSTRUIR | Implementar una spec ya aprobada |
| `dev-qa` | VERIFICAR | Gates, revision de codigo, readiness |
| `dev-cycle` | Todo el flujo | Feature completa que necesita orquestacion end-to-end |

### Skills de dominio (se invocan dentro de cualquier fase)

| Skill | Dominio | Cuando |
|-------|---------|--------|
| `dev-db` | Base de datos | Schema, migraciones, RLS, queries |
| `dev-design` | Visual | Tokens, tipografia, color, layout de componentes |
| `dev-ux` | Experiencia | Auditoria de flujos, navegacion, friccion |
| `dev-debug` | Debugging | Algo roto, error en runtime, test que falla |
| `dev-browser` | Testing | Validar flujos reales con Playwright |
| `dev-docs-governor` | Documentacion | Auditoria, limpieza, coherencia de docs |
| `dev-backend` | Backend | Auth, RLS, connectivity, monitoring |

### Skills de infraestructura

| Skill | Cuando |
|-------|--------|
| `dev-maintain-server` | Health check del servidor |
| `dev-maintain-db` | Health check de la base de datos |
| `dev-maintain-security` | Auditoria de firewall, TLS, SSH |
| `dev-update` | Actualizar dependencias |

Adapta esta lista a los skills reales de tu proyecto. Los nombres son sugerencias.

---

## Coordinacion multi-agente

### Regla principal

**Un solo agente escribe un archivo a la vez.** Dos agentes escribiendo el mismo archivo = conflicto garantizado.

### Antes de empezar trabajo

```bash
git pull                              # sincronizar
git log --oneline -10                 # ver que hicieron otros
```

### Prevencion de colisiones

| Regla | Como |
|-------|------|
| No tocar archivos que otro agente este modificando | Revisar commits recientes |
| Un writer por shared primitive | Si dos necesitan el mismo componente, uno espera |
| Dejar rastro al cerrar | MEMORY.md + WORKBOARD.md actualizados |

### Si encuentras cambios inesperados

1. Leer los cambios — entender que hizo el otro agente
2. Si hay colision: **parar** y documentar en MEMORY.md
3. **Nunca** sobreescribir o revertir trabajo de otro agente sin confirmacion del owner

---

## Creacion de skills nuevos

### Cuando crear un skill

- Hay un patron de trabajo que se repite en 3+ sesiones
- El skill tiene un dominio claro (no es un "cajon de sastre")
- El skill puede describirse en 1-2 frases

### Cuando NO crear un skill

- Para una tarea puntual (usar el agente directamente)
- Si ya existe un skill que cubre el caso (revisar lista arriba)
- Si el skill seria demasiado generico ("dev-helper")

### Estructura de un skill

| Campo | Proposito |
|-------|-----------|
| `name` | `kebab-case`, descriptivo |
| `description` | 1-2 frases: que hace + cuando se invoca + cuando NO |
| `trigger words` | En la description: "Use when...", "NOT for..." |
| `tools` | Solo los que necesita — no dar acceso a todo |

### Naming de skills

```
{dominio}-{accion}
```

| Ejemplo | Dominio | Accion |
|---------|---------|--------|
| `dev-builder` | dev | builder |
| `content-ingest` | content | ingest |
| `dev-maintain-server` | dev-maintain | server |

### Reglas

| Regla | Razon |
|-------|-------|
| No duplicar funcionalidad entre skills | Confusion de routing |
| Description debe incluir "NOT for..." | Evitar invocaciones erroneas |
| Un skill no debe hacer mas de 1 cosa principal | Single responsibility |

---

## Modelos y routing

| Tarea | Modelo recomendado |
|-------|-------------------|
| Planificacion, arquitectura, specs | Claude Opus (contexto largo) |
| Implementacion de codigo | Claude Opus o Sonnet |
| Tareas rapidas, busquedas | Claude Haiku |
| Generacion de texto en producto | OpenRouter -> modelo apropiado al caso |
| Embeddings | Modelo de embeddings apropiado (nomic, text-embedding-3, etc.) |

---

## Anti-patterns

- **No invocar skills para tareas triviales** — si es un grep + edit, hazlo directo
- **No crear skills duplicados** — auditar primero
- **No ignorar el trabajo de otros agentes** — siempre leer commits recientes
- **No sobreescribir MEMORY.md sin leerlo** — es acumulativo, no se reemplaza
- **No usar agentes para explorar sin objetivo** — definir que se busca antes de lanzar subagentes
