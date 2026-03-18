# Documentation Landscape — Reference

_Read this file on every invocation. It is the governor's map of the territory._

## SSOT Chain (mandatory reading order)

| # | File | Role | Authority |
|---|---|---|---|
| 1 | `dev.context.yaml` | Machine-readable project map | SSOT #1 |
| 2 | `planning/OPENBOX_CORE_SCOPE.md` | Core scope, keep/freeze/archive rules | Scope gate |
| 3 | `planning/WORKBOARD.md` | Current sprint/milestone board | Execution state |
| 4 | `planning/MEMORY.md` | Presidential decisions, session state | Decision log |
| 5 | `specs/architecture/ARCHITECTURE-V2.md` | Arquitectura finalista (stack, primitivas, categorías) | Architecture SSOT |
| 6 | `specs/architecture/AGENT-SYSTEM.md` | Agent model: Director, system, custom, context/memory | Domain SSOT |
| 7 | `specs/architecture/NAVIGATION.md` | Sidebar, tabs, roles, route inventory | Domain SSOT |
| 8 | `specs/architecture/SYSTEM.md` | Technical layers, runtime, integration surface | Domain SSOT |
| 9 | `specs/architecture/DOMAIN.md` | Business model: PlayBook, People, Data, Knowledge, Pages, Agents, Communication | Domain SSOT |

Everything outside this chain is supporting detail or historical reference.

## Global context lookup order

Before deciding where a document belongs, resolve ownership in this order:

1. SSOT chain above
2. `docs/INDEX.md`
3. `specs/INDEX.md`
4. `specs/systems/REGISTRY.md`
5. `specs/presets/REGISTRY.md`
6. owning folder `README.md` / `INDEX.md`
7. relevant ADR or system/preset pack

This order exists to prevent:

- duplicating a concept that already has an owner
- moving a doc into the wrong subtree
- deleting a supporting note whose real owner lives elsewhere
- creating a second pseudo-home because the local directory looked empty

## Fast Entry Path (cold start)

1. `README.md` → 2. `docs/INDEX.md` → 3. `ARCHITECTURE-V2.md` → 4. `WORKBOARD.md`

If something essential cannot be understood from those four, it is in the wrong place.

## ADR System

### Active ADR chain (ADR-024 to ADR-036)

| ADR | Domain | One-liner |
|---|---|---|
| ADR-024 | Runtime | the active project is not the runtime |
| ADR-025 | Runtime | Enterprise layer on community runtime |
| ADR-026 | Agent | Agent Control Plane: agents, skills, automations |
| ADR-027 | Agent | Context documents & memory system |
| ADR-028 | Data | your data engine as business data engine |
| ADR-029 | Comm | Communication system boundary |
| ADR-030 | Content | Knowledge vs Pages boundary |
| ADR-031 | Presets | Preset system & tenant provisioning |
| ADR-032 | AI | the active project AI Operating Model |
| ADR-033 | Product | Two primary work surfaces |
| ADR-034 | Data | Data work surface |
| ADR-035 | Knowledge | Knowledge work surface |
| ADR-036 | Content refs | Inline content references |

### ADR vs Spec — editorial rule

> **ADR = por qué y quién posee qué**
> **Spec = cómo funciona y cómo se implementa**

| Goes to ADR | Goes to Spec |
|---|---|
| Ownership boundaries between systems | Shape of entities |
| Platform/engine choices (your data engine, your agent runtime) | Functional contracts of a surface |
| Multi-tenant & security boundaries | Concrete UI/product flows |
| Decisions expensive to reverse | Feature versioning (Saved Views v1) |
| Decisions that survive multiple milestones | Implementation sequences |

### ADR vs Spec vs Contract vs Planning

| Level | Purpose | Lives in |
|---|---|---|
| ADR | Why + who owns what | `specs/decisions/` |
| Spec | How it works + how to implement | `specs/architecture/` |
| Contract | Schemas, interfaces, typed payloads, invariants | Code + spec |
| Planning | Execution state, navigation, pointers | `planning/` |

**Never let planning docs become architecture.**

## Planning Directory Governance

`planning/` is governed by exactly 7 canonical active files + `sessions/`.
Historical compatibility stubs may still exist in the same directory during the
cleanup, but they do **not** count as active planning authority.

1. `MEMORY.md`
2. `WORKBOARD.md`
3. `OPENBOX_CORE_SCOPE.md`
4. `ROADMAP.md`
5. `DECISIONS.md`
6. `IDEAS.md`
7. `DOCUMENTATION_CLEANUP_PROGRAM.md`
8. `sessions/` (daily logs)

Historical compatibility stubs currently tolerated in `planning/`:

- none currently versioned in the active repo tree

**NEVER create new active files in planning/.**

## Hotspot Map

These locations accumulate drift and require proactive attention:

| Location | Risk | What to check |
|---|---|---|
| `specs/decisions/` | ADR chain coherence | No gaps, no contradictions, all active ADRs in README.md |
| `specs/architecture/` | Competing authority | ARCHITECTURE-V2.md governs globally; satellite specs must point cleanly to `systems/` packs where appropriate. |
| `planning/MEMORY.md` | Stale decisions | Every entry reflects current reality |
| `planning/WORKBOARD.md` | Zombie tasks | Tasks match actual sprint |
| `planning/DECISIONS.md` | Duplicate authority | Must not compete with specs/decisions/README.md |
| `docs/INDEX.md` | Broken links, stale entries | Every link resolves, every entry is active |
| `specs/INDEX.md` | Same | Same |
| `docs/technical/` and `docs/audit/` | Silent debris | Supporting docs must be surfaced by an owning README or root index, not hidden by folder depth |
| `docs/manuals/` and `docs/strategy/` | Hidden historical authority | Historical vaults need an owning README and explicit non-SSOT framing on their leaves |
| `README.md` | Drift from ARCHITECTURE-V2 | Must reflect current product thesis |
| `specs/architecture/INTELLIGENCE_EXTRACTION.md` | Unbounded growth | ~1400 lines. Only add if value is genuinely orphaned |
| `specs/platform_core/` | Historical material leaking into active | Must be clearly labeled historical/supporting |
| `specs/compliance/` and `specs/architecture/adrs/` | Silent historical islands | If preserved, they must have an owning README and be surfaced from `specs/INDEX.md` |
| `docs/constitution/` | Degraded role | Not the active entrypoint. Only UI_STYLE_GUIDE.md is still canonical |
| `packages/contracts/`, `packages/db/schema/`, `packages/core/`, `apps/platform/*/README.md` | Ghost documentary refs in code | Headers/comments often keep deleted specs or historical leaves alive as pseudo-authority |

## Cleanup Program Status

Source: `planning/DOCUMENTATION_CLEANUP_PROGRAM.md`

### Workstreams

| ID | Name | Objective | Status |
|---|---|---|---|
| W1 | SSOT Core | No doubt about which docs govern | stable |
| W2 | ADR System | Small, domain-grouped, no duplicates | stable (sweep finalized cf43eed1) |
| W3 | Active Specs | Every active domain has a clear spec | in progress |
| W4 | Historical Isolation | Old material available but not polluting | in progress |
| W5 | Public Entry Points | Any dev/agent knows how to enter | stable (entrypoints aligned c315c55e) |

### Pending tasks (from the cleanup program)

- [ ] Repo-wide markdown link audit beyond the active chain to catch historical/supporting breakage early
- [ ] Repo-wide runtime/header ref audit beyond `.md` files (`@spec`, `@canonical`, `@see`, README headers, local-only paths)
- [ ] Final residual sweep of supporting docs that still feel invisible or misleading from the entrypoint indices
- [ ] Final inventory: active / supporting / historical / archive-candidate
- [ ] Remove irrelevant historical from active indices
- [ ] Delete historical stubs that only duplicate git history

### KPIs

| KPI | Target |
|---|---|
| Every active doc has owner and clear role | 100% |
| Zero conflicts between main SSOTs | 100% |
| Every historical ADR classified | 100% |
| Every active spec linked from indices | 100% |
| Every deep subtree labeled | 100% |

## Governance Files (intentionally redundant)

`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `QWEN.md` contain overlapping governance entrypoints. This is intentional — each IDE/agent reads "its" file. Local-only helper rules may also exist under `.claude/`, but they are not part of the public repo inventory.

## Active Documentation Files (complete inventory)

These files exist in the repo and are actively maintained. Use this as a checklist for V4 (orphan detection):

**Root:** `README.md`, `BRAIN.md`, `CHANGELOG.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `QWEN.md`

**docs/:** `INDEX.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `DEV_CHECKLIST.md`, `DATA_PAGE_PATTERN.md`, `DEPLOYMENT.md`, `SECURITY.md`, `api/README.md`, `api/ENDPOINTS.md`, `technical/README.md`, `technical/DB_AUDIT.md`, `technical/ENGINE_AUDIT.md`, `technical/ROUTE_AUDIT.md`, `technical/ENTITY_FIELDS_ANALYSIS.md`, `technical/FIELD_MANAGEMENT_SAP_STYLE.md`, `technical/FORMULARIOS_VACIOS_FIX.md`, `technical/QUICK_FIX_EMPTY_FORMS.md`, `technical/productivity-module.md`, `audit/README.md`, `audit/automation-engine-S2.08.md`, `manuals/README.md`, `constitution/INDEX.md`, `constitution/UI_STYLE_GUIDE.md`, `constitution/ARCHITECTURE.md`, `constitution/MANIFESTO.md`

**specs/architecture/:** `ARCHITECTURE-V2.md`, `ARCHITECTURE.md`, `SYSTEM.md`, `DOMAIN.md`, `AGENT-SYSTEM.md`, `NAVIGATION.md`, `COMMUNICATION-SYSTEM.md`, `KNOWLEDGE-WORKSURFACE.md`, `CONTENT-REFERENCES.md`, `DATA-SYSTEM.md`, `BRIDGE-API.md`, `SAVED-VIEWS-V1.md`, `BASEROW-AI-INTEGRATION.md`, `PLAYBOOK-KNOWLEDGE-INTEGRATION.md`, `INBOX-PRODUCTION-READINESS.md`, `TWO_WORK_SURFACES_PROGRAM.md`, `SURFACE_TRILOGY_EXECUTION_PACK.md`, `SURFACE_TRILOGY_SPRINT_RUNBOOK.md`, `INTELLIGENCE_EXTRACTION.md`, `DOCS-ALIGNMENT-BACKLOG.md`, `DOCUMENTATION_MIGRATION_TRACKER.md`, `DOCUMENTATION_DELETE_CANDIDATES.md`

Historical-supporting architecture leaves intentionally exposed in indices:

- `UI_PATTERNS.md`
- `architecture/adrs/README.md`

**specs/decisions/:** `README.md`, ADR-024 through ADR-036

**specs/compliance/:** `README.md`, `GDPR_CCPA_CHECKLIST.md`

**specs/systems/:** `REGISTRY.md` plus active packs for `playbook`, `people`, `identity`, `agents`, `communication`, `data`, `knowledge`, `pages`, `billing`, `integration`, `admin-config`, `analytics`

**specs/presets/:** `REGISTRY.md` plus active packs for `crm`, `ats`, `lms`, `legal-docs`, `inventory`, `marketing`, `productivity`, `verification`

**planning/ (active):** `MEMORY.md`, `WORKBOARD.md`, `OPENBOX_CORE_SCOPE.md`, `ROADMAP.md`, `DECISIONS.md`, `IDEAS.md`, `DOCUMENTATION_CLEANUP_PROGRAM.md`, `sessions/`

**planning/ (historical compatibility stubs):** none currently versioned

**.claude/:** `COORDINATION.md` is versioned. `.claude/rules/*` may exist locally but are not part of the repo inventory unless explicitly tracked.

Historical compatibility note:

- `specs/architecture/TWO_WORK_SURFACES_PROGRAM.md` survives as a historical-supporting compatibility leaf, not as an active program plan.
