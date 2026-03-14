# Protocol Evolution — Autonomous Trend Discovery

> Applies the `program.template.md` pattern to keep the protocol itself current.
> Run this weekly (or on demand) to surface new patterns and propose protocol updates.
> Inspired by: karpathy/autoresearch — same loop, applied to meta-level improvement.

---

## Objective

Scan defined sources for new AI development patterns, security updates, and tooling changes.
Produce a structured diff proposal: what to add, update, or deprecate in the protocol.

---

## Primary metric

| Metric | Description | Target |
|---|---|---|
| `signal_quality` | Ratio of actionable proposals to total sources scanned | ≥ 0.3 (at least 1 in 3 sources yields something) |
| `protocol_freshness` | Days since last update to any protocol file | ≤ 30 days |

---

## Source watchlist

The agent ONLY scans these sources. Add new ones via PR.

```python
SOURCES = {
    "ai-coding-patterns": [
        "https://www.anthropic.com/news",           # Anthropic releases
        "https://simonwillison.net/",               # Simon Willison's blog
        "https://changelog.cursor.com/",            # Cursor changelog
    ],
    "security": [
        "https://owasp.org/blog/",                  # OWASP updates
        "https://github.com/advisories",            # GitHub Security Advisories
    ],
    "ui-patterns": [
        "https://www.radix-ui.com/primitives/docs/overview/releases",
        "https://ui.shadcn.com/docs/changelog",
    ],
    "agent-frameworks": [
        "https://python.langchain.com/docs/",
        "https://docs.pydantic.dev/latest/",
    ],
    "protocol-meta": [
        "https://github.com/anthropics/anthropic-cookbook",
        "https://github.com/e2b-dev/awesome-ai-agents",
    ],
}
```

The agent CANNOT modify:
- The evaluation sources (only humans add to the watchlist above)
- The protocol files directly — it proposes, humans approve
- The `SOURCES` dict without a PR

---

## Loop protocol

```
1. fetch_sources()
   - For each source: fetch recent content (last 7 days)
   - Skip if HTTP error or content unchanged since last run
   - Log: {source, fetched_at, content_hash}

2. extract_signals(content)
   - Look for: new patterns, deprecations, security advisories, tooling changes
   - Filter noise: marketing content, duplicates, already-covered topics
   - Score each signal: HIGH (breaking/important), MEDIUM (notable), LOW (minor)

3. map_to_protocol(signals)
   - For each HIGH/MEDIUM signal: identify which protocol file it affects
     - New agent behavior pattern → level-0-core/protocol.md or level-1-multi-agent/
     - Security update → level-2-production/skills/dev-security/
     - UI pattern → level-2-production/skills/dev-design/
     - New tool/adapter → level-1-multi-agent/adapters/
   - Generate a proposal: what to add/change/deprecate + 2-sentence rationale

4. write_proposals(proposals)
   - Append to: evolution/proposals.md (this directory)
   - Format: date, source, signal, affected file, proposed change, rationale
   - Do NOT edit protocol files directly

5. stop_condition()
   - All sources scanned, OR
   - 3 consecutive runs with 0 HIGH signals
   → Generate: evolution/weekly-report.md
```

---

## File structure

```
examples/protocol-evolution/
├── program.md                  ← this file (the loop definition)
├── evolution/
│   ├── proposals.md            ← pending proposals for human review
│   ├── applied.md              ← proposals that were approved and applied
│   └── weekly-report.md        ← generated summary per run
└── sources.last-run.json       ← content hashes to detect changes
```

---

## Proposal format

```markdown
## [DATE] — [SOURCE NAME]

**Signal:** [What was found — 1 sentence]
**Category:** ai-coding | security | ui-patterns | agent-frameworks | protocol-meta
**Severity:** HIGH / MEDIUM / LOW
**Affects:** [path/to/protocol/file.md]

**Proposed change:**
[Specific addition, modification, or deprecation — be concrete]

**Rationale:**
[Why this matters for the protocol — 1-2 sentences]

**Status:** pending | approved | rejected
```

---

## Time budget

- Max time per source: 2 minutes
- Max total runtime: 20 minutes
- If a source is unreachable 3 runs in a row: flag for removal from watchlist

---

## Human review gate

All proposals require human approval before being applied to the protocol.
The loop surfaces, proposes, and tracks. It does not commit.

Weekly cadence: run on Monday → human reviews on Wednesday → apply by Friday.
On-demand: `Run protocol evolution scan now` in any agent session.
