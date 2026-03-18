# Dogfooding Readiness

> Referenced by `SKILL.md` Phase 1b and Phase 7.
> Determines whether the active project is ready for internal beta/dogfooding use.

Quality in the active project is not only "tests green". Before calling something ready for dogfooding, separate what is a code problem, what is a dataset problem, and what is an external provisioning problem.

## Readiness Matrix

Evaluate all four dimensions. Each must have explicit evidence.

| Dimension | Status | Evidence |
|---|---|---|
| Runtime (type-check + build + tests) | pass/fail | exit codes from `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` |
| Browser journeys | pass/fail | dev-browser results (ARIA snapshot or screenshot) |
| Dataset (real data present) | pass/fail | SQL counts against Supabase |
| Integration (external services) | pass/fail | connectivity checks |

## Runtime Readiness

Standard checks — same as Phase 1:

1. `pnpm tsc --noEmit` — 0 errors
2. `pnpm test` — 0 failures, 0 skips
3. `pnpm build` — completes without errors

If any fails, verdict is `bloqueado` until fixed.

## Browser Journeys

**Delegate to `dev-browser`** with the dev URL (`http://localhost:3001`) and the flow list below. Do not duplicate browser automation logic — pass the specification and receive PASS/FAIL with evidence.

### Core journeys for the active project

1. **Login** — test credentials -> verify dashboard loads
2. **Sidebar navigation** — each main section renders without error
3. **Knowledge** — create doc -> edit -> save -> verify tree update
4. **Databases** — view tables -> open records (if your data engine connected)
5. **Inbox** — load threads (if data present)
6. **Settings** — change a preference -> verify persistence
7. **Feature-specific** — any journey specific to the feature under review

### Per journey, record:

| Journey | Result | Evidence |
|---|---|---|
| Login | PASS / FAIL | ARIA snapshot or screenshot |
| Sidebar nav | PASS / FAIL | ARIA snapshot or screenshot |
| Knowledge | PASS / FAIL | ARIA snapshot or screenshot |
| ... | ... | ... |

If any core journey FAILs -> verdict is `bloqueado` for that dimension.

## Dataset Readiness

Connect to Supabase (`supabase.your-domain.com`) and verify minimum viable data exists.

| Domain | Table(s) | Minimum | Query |
|---|---|---|---|
| Auth | iam.members | >= 2 users | `SELECT count(*) FROM iam.members WHERE status='active'` |
| Org | iam.organizations | >= 1 org | `SELECT count(*) FROM iam.organizations WHERE lifecycle_status='active'` |
| Knowledge | cms.knowledge_documents | >= 5 docs | `SELECT count(*) FROM cms.knowledge_documents WHERE content_json IS NOT NULL` |
| data management entities | data_mgmt.entities | >= 3 entities | `SELECT count(*) FROM data_mgmt.entities` |
| data management records | data_mgmt.records | >= 10 records | `SELECT count(*) FROM data_mgmt.records` |

### Dataset verdict rules

- All domains meet minimum -> dataset dimension is `pass`
- Any domain empty -> verdict is `cerrado con riesgos` with dataset risk documented
- All domains empty -> verdict is `bloqueado` (nothing to dogfood)

## Integration Readiness

Check external service connectivity:

| Service | Check | Expected |
|---|---|---|
| Supabase Auth | `curl -s https://supabase.your-domain.com/auth/v1/health` | `200` |
| Supabase REST | `curl -s https://supabase.your-domain.com/rest/v1/` | `200` or `401` (means running) |
| your data engine | Check if configured in env vars | Connection or explicit skip |
| your agent runtime | `curl -s http://localhost:YOUR_AGENT_PORT/health` (from your-server) | `200` |
| Stripe | Check `STRIPE_WEBHOOK_SECRET` exists in env | Present or explicitly skipped |

If a service is not needed for the feature under review, mark as "N/A" rather than "FAIL".

## Risk Description Template

For every identified risk, document it using this structure:

| Campo | Valor |
|---|---|
| Area | [runtime / browser / dataset / integration] |
| Descripcion | [que puede fallar] |
| Severidad | [LOW / MEDIUM / HIGH] |
| Probabilidad | [baja / media / alta] |
| Mitigacion | [que se puede hacer] |
| Owner | [quien lo resuelve] |

## Risk Escalation Rules

- 3+ MEDIUM risks -> verdict is `cerrado con riesgos`
- 1+ HIGH risk with mitigation -> verdict is `cerrado con riesgos`
- 1+ HIGH risk without mitigation -> verdict is `bloqueado`
- Any dimension fully blocked -> verdict is `bloqueado`

## Dogfooding Close-Out (Phase 7)

When the user wants to move from implementation into real use, the QA close-out must answer:

1. **What is actually ready to use now?** — list features with green runtime + browser evidence
2. **What still depends on real data?** — list features that work in code but have no dataset
3. **What still depends on external provisioning?** — list integrations not yet connected
4. **What moves to bugfix queue vs what moves to dogfooding observation?** — classify remaining issues

### Final recommendation (exactly one)

| Recommendation | When to use |
|---|---|
| **Start dogfooding now** | All dimensions pass, zero or only LOW risks |
| **Start with cautions** | Dimensions pass but MEDIUM risks exist — document what to watch |
| **Do not start yet** | Any dimension blocked or HIGH risk without mitigation |

### Close-out report

```
## Dogfooding Close-Out — [feature/milestone]

### Readiness matrix
| Dimension | Status | Evidence |
|---|---|---|
| Runtime | pass/fail | [exit codes] |
| Browser journeys | pass/fail | [dev-browser results] |
| Dataset | pass/fail | [SQL counts] |
| Integration | pass/fail | [connectivity checks] |

### Risks
[Risk description table for each identified risk]

### Verdict: cerrado / cerrado con riesgos / bloqueado

### Recommendation: start now / start with cautions / do not start yet

### Next actions
- [action items if any]
```

## Verdict Application

Always use the SSOT verdict from SKILL.md:

| Status | Meaning |
|---|---|
| **cerrado** | Listo. Se puede hacer merge/ship. |
| **cerrado con riesgos** | Listo con riesgos conocidos y documentados. |
| **bloqueado** | No se puede avanzar. |
