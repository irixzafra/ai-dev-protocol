# El Camino — Framework Unificado de Desarrollo

> **Version:** 1.0
> **Alcance:** Todo proyecto que adopte este protocolo.
> **Regla:** Identico en estructura entre proyectos. Solo difieren los comandos de build.

---

## Por que existe este framework

No estamos haciendo webs sueltas. Estamos construyendo **productos de software profesional.** El objetivo es que el usuario sienta una herramienta profesional, predecible y potente.

**El principio central: consistencia o muerte.** Si un usuario aprende una superficie, debe saber usar las 100 siguientes. Si un agente aprende a construir en un proyecto, debe saber construir en todos.

### Las 4 leyes innegociables

| # | Ley | En la practica |
|---|-----|----------------|
| 1 | **Docs or it didn't happen** | No se construye nada sin spec aprobada. Codigo sin spec = deuda inmediata. |
| 2 | **Eliminacion de redundancia** | `grep` antes de crear. Si ya existe, se reutiliza. Prohibido crear snowflakes. |
| 3 | **Validacion en cascada** | Definir -> Planear -> Construir -> Verificar -> Cerrar. Te saltas un paso, no llega a produccion. |
| 4 | **Anti-patterns como alarma** | Hex hardcodeado, `any`, >300 LOC, endpoint multi-modo, tabla sin `organization_id` -> se rechaza. |

### First Principles

| Principio | Aplicacion |
|-----------|-----------|
| Es estrictamente necesario? | Si no lo necesitas HOY, no existe |
| Ideal, no parches | Si lo existente no es ideal, se rehace |
| Menos codigo = mas valor | Cada linea justifica su existencia |
| Estandares industriales | Nunca reinventar lo que ya funciona |
| Ship beats perfect | Velocidad sobre perfeccion paralizante |
| Sprint 0 siempre | Auditar + limpiar antes de construir |
| Sin duplicados | Cada decision en exactamente UN lugar |

---

## Los 10 archivos del framework

| # | Archivo | Que gobierna |
|---|---------|-------------|
| 1 | `dev.protocol.md` | **El flujo:** 5 fases, 4 gates, 7 guardrails, specs, naming, PR criteria, mejora continua |
| 2 | `spec-template.md` | Template para specs de producto |
| 3 | `database.md` | Naming DB, migraciones, RLS, indices, queries |
| 4 | `design-system.md` | Tokens, tipografia, layout, responsive, patrones UI, accesibilidad |
| 5 | `api.md` | Contrato de respuesta, Zod, error codes, streaming, error handling, logging |
| 6 | `agents.md` | Skills, coordinacion multi-agente, creacion de skills |
| 7 | `testing.md` | Tipos de test, checklist PR, benchmarks, observabilidad |
| 8 | `backlog.md` | WORKBOARD, priorizacion P0/P1/P2, sprint lifecycle |
| 9 | `deployment.md` | Deploy, rollback, secrets, Docker, monitoreo, recuperacion |
| 10 | `governance.md` | **Control del proyecto para no-tecnicos:** spec obligatoria, diff gate, scope lock, senales de alarma, preguntas que el owner puede hacer |
| — | README.md | Este indice (vision + mapa) |

---

## El flujo en 30 segundos

```
  +----------+     +----------+     +----------+     +----------+     +----------+
  |  DEFINIR |---->| PLANEAR  |---->| CONSTRUIR|---->| VERIFICAR|---->|  CERRAR  |
  +----------+     +----------+     +----------+     +----------+     +----------+
    Spec 1pag       Plan mode        Codigo           4 gates          Leccion
```

| Talla | Fases |
|-------|-------|
| **NANO** (1-5 LOC) | Construir -> Verificar -> Cerrar |
| **MINI** (fix/mejora) | Definir -> Construir -> Verificar -> Cerrar |
| **FULL** (feature) | Todo el flujo |

### Gates

G1: type-check + build -> 0 errores -- G2: lint -> 0 warnings -- G3: 0 secrets -- G4: nada fuera del plan (FULL)

### Guardrails

R1: Scope cerrado -- R2: Max 300 LOC -- R3: Decision = MEMORY.md -- R4: MEMORY < 200 lineas -- R5: grep antes de crear -- R6: type-check cada 50-100 LOC -- R7: Commits atomicos (max 5 archivos)

---

## Specs — el contrato antes del codigo

```
Idea -> docs/specs/S{NNN}-titulo.md -> borrador -> aprobada -> en-progreso -> hecha -> archivada
```

**Regla absoluta:** No se toca una base de datos, no se crea una pagina, no se modifica un layout, no se conecta una API sin spec aprobada (MINI inline o FULL archivo). La spec es la puerta de entrada. Sin spec, no hay codigo.

---

## Mapa de archivos del proyecto

```
proyecto/
├── CLAUDE.md                      <- entry point AI
├── OWNER.md                       <- guia para el dueno (sin jerga)
├── dev.protocol.md                <- El Camino (primitivo)
├── dev.playbook.md                <- contexto del proyecto (especifico)
├── docs/
│   ├── framework/                 <- EL FRAMEWORK (9 docs, primitivo)
│   │   ├── README.md              <- este archivo
│   │   ├── spec-template.md       <- template de spec
│   │   ├── database.md            <- criterios DB
│   │   ├── design-system.md       <- visual + layout + patrones UI
│   │   ├── api.md                 <- API + error handling + logging
│   │   ├── agents.md              <- agentes y skills
│   │   ├── testing.md             <- QA, benchmarks, observabilidad
│   │   ├── backlog.md             <- sprints, priorizacion, tareas
│   │   └── deployment.md          <- deploy, rollback, ops
│   ├── specs/
│   │   └── S{NNN}-titulo.md       <- specs de producto
│   ├── ARCHITECTURE.md            <- arquitectura del sistema
│   └── _archive/                  <- docs historicos
├── planning/
│   ├── WORKBOARD.md               <- sprint
│   └── MEMORY.md                  <- decisiones + lecciones
└── app/ (o apps/)                 <- codigo
```

**Total framework: 10 archivos** (1 `dev.protocol.md` + 9 en `docs/framework/`)

---

## Primitivos vs especificos

| Primitivo (igual en todos los proyectos) | Especifico (por proyecto) |
|------------------------------------------|--------------------------|
| `dev.protocol.md` (solo comandos build) | `dev.playbook.md` |
| `docs/framework/*` (9 docs) | `docs/specs/*`, `docs/ARCHITECTURE.md` |
| — | `planning/*`, `CLAUDE.md` contexto |

---

## Aplicar a un proyecto

1. Copiar `dev.protocol.md` + `docs/framework/` (adaptar comandos build)
2. Crear/verificar `dev.playbook.md` (stack, rutas, convenciones, anti-patterns)
3. Actualizar `CLAUDE.md` para referenciar el protocolo
4. Crear `docs/specs/` si no existe
5. Verificar `planning/MEMORY.md` con secciones decisiones + lecciones
6. Auditar docs existentes: duplicacion -> absorber o archivar
