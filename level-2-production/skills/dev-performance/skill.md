# Skill: dev-performance

> Use when building features that involve data fetching, rendering, or computation at scale.
> AI agents produce code that works on small datasets and fails at 10x load.
> This skill prevents the most common performance regressions.

## When to activate

- Building data-heavy pages (lists, tables, dashboards)
- Adding data fetching (API calls, DB queries, subscriptions)
- Writing React components that re-render frequently
- Implementing search, filtering, or sorting
- Any feature with a "this might be slow" feeling

## References to load

| File | Use when |
|---|---|
| `references/anti-patterns.md` | Reviewing or generating any performance-sensitive code |
| `your-project/playbook.md` | For stack-specific patterns (ORM, caching layer, CDN config) |

## Core rules

1. **Measure before optimizing** — add profiling before adding complexity. Don't guess.
2. **Network round-trips are the bottleneck** — minimize them. Batch. Cache. Prefetch only what you know you'll need.
3. **Never block the main thread** — heavy computation goes in a worker or is deferred. Perceived performance matters as much as actual.
4. **Lists must be paginated or virtualized** — rendering 1000 rows in a table is a bug, not a feature.
5. **Images must be sized and lazy-loaded** — no `<img>` without `width`, `height`, and `loading="lazy"` (unless above-the-fold).
6. **Caching is architecture, not an afterthought** — define cache strategy (TTL, invalidation) before implementing the data fetch.
