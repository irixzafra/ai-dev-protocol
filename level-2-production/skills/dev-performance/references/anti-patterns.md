# Performance Anti-Patterns

> Patterns AI agents produce by default that work in development but fail at scale.
> For each: name → symptom → root cause → correct alternative.

---

## 1. Waterfall requests

**Symptom:** Page loads in 3 sequential steps. Each step awaits the previous: fetch user → fetch user's org → fetch org's projects.
**Root cause:** Agent writes async code naturally sequentially.
**Fix:** Identify what can be fetched in parallel. `Promise.all([fetchUser(), fetchOrg(), fetchProjects()])`. Or fetch everything in one server-side query.

---

## 2. Unvirtualized long lists

**Symptom:** Table renders all 5000 rows. Page takes 8 seconds to load. Scrolling is janky.
**Root cause:** Agent renders the full dataset returned by the API.
**Fix:** Pagination (server-side, not client-side filtering of all data) or virtual scrolling (only render visible rows). Never render >100 rows without one of these.

---

## 3. Missing memoization on expensive computations

**Symptom:** A sort or filter runs on every render, even when the input hasn't changed. Dashboard recalculates on every keystroke elsewhere.
**Root cause:** Agent computes inline without considering render frequency.
**Fix:** `useMemo` for expensive derivations. `useCallback` for stable function references. But: profile first — premature memoization adds complexity for no gain.

---

## 4. Over-memoization

**Symptom:** Every function and value is wrapped in `useCallback`/`useMemo`. Code is unreadable. Performance is identical.
**Root cause:** Agent adds memoization "to be safe" after reading that it improves performance.
**Fix:** Memoize only when: (a) the computation is measurably expensive, or (b) referential stability is required (e.g., dependency of another hook or effect). Simple values don't need it.

---

## 5. No image optimization

**Symptom:** Full-size 4MB product images loaded on a card that displays them at 200×200px. Page weight: 40MB.
**Root cause:** Agent uses `<img src={product.imageUrl} />` directly.
**Fix:** Serve resized images (CDN transforms or next/image). Specify `width` and `height`. Use `loading="lazy"` for off-screen images. Use WebP.

---

## 6. Polling instead of subscriptions

**Symptom:** Dashboard refreshes every 5 seconds with a full API call to check for updates.
**Root cause:** Agent implements the simplest real-time pattern.
**Fix:** WebSockets or SSE for truly real-time data. If polling is unavoidable, implement exponential backoff and stop polling when the tab is backgrounded.

---

## 7. Client-side filtering of server data

**Symptom:** API returns all 10,000 records. Client filters them with `.filter()`. Search input triggers this on every keystroke.
**Root cause:** Agent implements filtering where it's easiest to write — in the component.
**Fix:** Push filtering, sorting, and pagination to the server. The client should only receive the rows it displays.

---

## 8. Synchronous operations in render

**Symptom:** `JSON.parse()`, regex on large strings, or date formatting runs inside render or on every item in a `.map()`.
**Root cause:** Agent computes inline for simplicity.
**Fix:** Compute outside the render loop. For data from the server, transform it at the boundary (API layer or server component), not in the render.

---

## 9. No cache headers on static assets

**Symptom:** JS bundles, fonts, and images are re-downloaded on every visit. Repeat users have the same load time as first-time users.
**Root cause:** Agent doesn't configure the server — it only writes the application code.
**Fix:** Set `Cache-Control: public, max-age=31536000, immutable` on content-addressed assets (files with hash in filename). Set short or no-cache on HTML.

---

## 10. Bundle size ignored

**Symptom:** `import _ from 'lodash'` for one utility. Full icon library imported for 3 icons. First load JS: 2MB.
**Root cause:** Agent imports the easiest thing, not the smallest.
**Fix:** Named imports for tree-shaking. Check bundle size before adding a new dependency (`bundlephobia.com`). For icons: import individual files, not the full library.
