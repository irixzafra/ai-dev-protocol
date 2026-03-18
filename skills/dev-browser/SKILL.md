---
name: dev-browser
description: "Real browser automation for user flow emulation and functional testing. Navigates sites like a real user: clicks, fills forms, follows links, completes multi-step flows, tests auth, validates navigation. Uses Playwright MCP tools with ARIA snapshots for deterministic interaction. Use when testing user flows, filling forms in a browser, reproducing bugs by navigating, validating that a signup/login/checkout works end-to-end, checking what happens when a user clicks X, or any task that requires actually using a website. NOT for visual design review — use dev-design for that. NOT for UX heuristic audits — use dev-ux for that."
user-invocable: true
argument-hint: "[url, flow to test, or 'explore']"
---

# dev-browser — user flow emulation + functional testing

> Navigate like a real user. Click, type, fill, submit, verify.
> ARIA snapshots first, screenshots second. Actions over observations.

## References

| File | When to read |
|---|---|
| `${CLAUDE_SKILL_DIR}/references/flow-patterns.md` | When executing auth flows, multi-step forms, navigation testing, or e2e scenarios |
| `${CLAUDE_SKILL_DIR}/references/exploration.md` | When doing systematic site exploration or mapping all reachable pages |

---

## MCP Server Configuration (multi-agent safe)

**SSOT:** `.mcp.json` at repo root. Flags already configured:

| Flag | Why |
|---|---|
| `--browser chromium` | Playwright's bundled Chromium — never conflicts with system Chrome |
| `--headless` | No visible window — multiple agents/developers test simultaneously |
| `--isolated` | Each MCP connection gets its own in-memory profile (no cookie/session bleed) |
| `--viewport-size 1280,800` | Consistent viewport across all agents |

This means:
- **No `SingletonLock` conflicts** — headless Chromium instances are fully independent
- **No interference with Irix's Chrome** — uses a separate binary
- **Parallel agents work** — 3 agents can test 3 different flows at the same time
- **Deterministic** — same viewport, same empty profile, every time

Dev URL: `http://localhost:3001`.

---

## Architecture: MCP Playwright Tools

This skill uses the Playwright MCP server tools — no `js_repl`, no local Playwright install needed. The tools are available as deferred MCP tools and must be loaded via ToolSearch before first use.

### Core Tools (load always)

| Tool | Purpose | When |
|---|---|---|
| `browser_navigate` | Go to a URL | Starting point of any flow |
| `browser_snapshot` | ARIA accessibility tree snapshot | Primary way to "see" the page — shows all interactive elements with refs |
| `browser_click` | Click an element by ref | Every click interaction |
| `browser_type` | Type text into focused element | Text input after clicking a field |
| `browser_press_key` | Keyboard actions (Enter, Tab, Escape) | Submit forms, navigate, dismiss |
| `browser_select_option` | Choose from dropdowns | Select/combobox interactions |
| `browser_fill_form` | Fill entire forms at once | Fast form completion |
| `browser_take_screenshot` | Visual evidence | Only when ARIA snapshot isn't enough |

### Secondary Tools (load when needed)

| Tool | Purpose |
|---|---|
| `browser_wait_for` | Wait for elements to appear/disappear |
| `browser_evaluate` | Run JavaScript in page context |
| `browser_file_upload` | File input interactions |
| `browser_handle_dialog` | Accept/dismiss alerts and confirms |
| `browser_navigate_back` | Browser back button |
| `browser_hover` | Hover states and menus |
| `browser_drag` | Drag and drop interactions |
| `browser_console_messages` | Debug JS errors |
| `browser_network_requests` | Debug API calls |
| `browser_tabs` | Multi-tab flows |
| `browser_resize` | Responsive breakpoint testing |
| `browser_close` | Close browser when done |

### Loading Tools

Before any browser interaction, load the core tools:

```
ToolSearch: "+playwright navigate snapshot click type"
ToolSearch: "+playwright press_key select fill_form screenshot"
```

Load secondary tools only when the flow requires them.

---

## ARIA Snapshots: Primary Interaction Model

**ARIA snapshots are the preferred way to understand page state.** They return a structured accessibility tree showing every interactive element with a `ref` identifier for deterministic clicking/typing.

Why ARIA over screenshots:
- **Deterministic**: ref-based clicking never misses. No coordinate guessing.
- **Structured**: see all buttons, links, inputs, headings in a tree.
- **Fast**: no image processing overhead.
- **Reliable**: works identically across viewport sizes.

Use screenshots only when:
- Verifying visual layout/styling (not interaction)
- Debugging why an ARIA element doesn't match expectations
- Providing visual evidence to the user

### Reading an ARIA Snapshot

```yaml
- heading "Dashboard" [level=1]
- navigation "Main"
  - link "Home" [ref=s1e3]
  - link "Settings" [ref=s1e4]
- main
  - button "Create New" [ref=s1e7]
  - table
    - row
      - cell "Project Alpha"
      - cell - button "Edit" [ref=s1e12]
```

- `[ref=s1eN]` = clickable reference. Use with `browser_click`.
- Elements without `ref` are informational (headings, text).
- The tree structure shows nesting (nav > links, table > rows > cells).

### Interaction Pattern

```
1. browser_snapshot → read the page state
2. Identify the target element by its ref
3. browser_click ref=s1e7 → click it
4. browser_snapshot → verify the result
```

This snapshot-act-verify loop is the core of all user emulation.

---

## Core Workflow

### 1. Start a session

```
browser_navigate → target URL
browser_snapshot → understand initial state
```

For local dev: use `http://localhost:3000` or `http://127.0.0.1:3000`.
For production: use the actual URL.

### 2. Navigate like a user

Every interaction follows the same loop:

```
SNAPSHOT → understand what's on screen
DECIDE  → what would a real user do next?
ACT     → click / type / select / press key
SNAPSHOT → verify the result
```

Rules:
- **Never skip the verification snapshot.** A click without verification is a click you don't know worked.
- **Use refs, not coordinates.** ARIA refs are deterministic.
- **One action at a time.** Don't chain 5 clicks without checking intermediate states.
- **Read the page like a user.** What heading do they see? What buttons are available? What's the primary CTA?

### 3. Fill forms

For simple forms, use `browser_fill_form` with field-value pairs.
For complex forms (conditional fields, multi-step), fill field by field:

```
browser_click → focus the input (by ref)
browser_type → enter the value
browser_press_key "Tab" → move to next field
```

Always verify after submission:
- Did a success message appear?
- Did the URL change?
- Did the form reset or show errors?

### 4. Complete flows end-to-end

A "flow" = a sequence of pages/states a user goes through to achieve a goal.

Examples: signup → email verification → onboarding → dashboard.
Login → dashboard → create item → verify item appears.

For each flow:
1. Define the goal (what the user is trying to do)
2. Start from the realistic entry point (not a deep link)
3. Navigate step by step using snapshot-act-verify
4. Note every friction point, error, or unexpected behavior
5. Verify the final state matches the expected outcome

Read `${CLAUDE_SKILL_DIR}/references/flow-patterns.md` for specific patterns (auth, forms, navigation, wizards).

### 5. Report findings

After testing, report:
- **What worked**: flows that completed successfully
- **What broke**: errors, dead ends, unexpected behavior
- **What's confusing**: unclear labels, missing feedback, ambiguous next steps
- **Evidence**: which page/state showed the issue (include snapshot excerpts)

---

## Error Recovery

When something goes wrong during navigation:

| Problem | Recovery |
|---|---|
| Click did nothing | `browser_snapshot` to check if page changed. Element may have been covered or disabled. |
| Page didn't load | `browser_wait_for` the expected element. Check `browser_console_messages` for errors. |
| Form submission failed | `browser_snapshot` to read error messages. Check `browser_network_requests` for API failures. |
| Dialog appeared | `browser_handle_dialog` to accept or dismiss. |
| Unexpected redirect | `browser_snapshot` to read new page. Note the redirect in findings. |
| Element not in snapshot | Page may need scrolling. Try `browser_press_key "PageDown"` then re-snapshot. Or use `browser_evaluate` to check if element exists but is off-screen. |
| Timeout | Retry once. If still fails, note as a real performance issue. |

### Debug Sequence

When stuck:

```
1. browser_snapshot → what's actually on the page?
2. browser_console_messages → any JS errors?
3. browser_network_requests → any failed API calls?
4. browser_take_screenshot → does the visual match the ARIA tree?
5. browser_evaluate → check DOM state directly
```

---

## Testing Modes

### Quick Flow Test
Test a single specific flow (login, signup, checkout). Fast, targeted.

```
1. Navigate to start
2. Execute the flow step by step
3. Verify the end state
4. Report pass/fail with evidence
```

### Exploration
Systematically discover all reachable pages and interactions. Read `${CLAUDE_SKILL_DIR}/references/exploration.md`.

```
1. Start at homepage/entry
2. Map all navigation elements
3. Visit each link/page
4. Catalog forms, buttons, interactive elements
5. Test key interactions on each page
6. Build a site map with findings
```

### Regression Check
Re-test a previously working flow after code changes.

```
1. Execute the known flow
2. Compare behavior to expected
3. Flag any differences
4. Focus on the changed areas
```

### Responsive Test
Test flows across viewport sizes.

```
1. browser_resize to target viewport (e.g., 375x812 for mobile)
2. Re-run the core flow
3. browser_snapshot at each step to check layout adaptation
4. Note any broken interactions or missing elements
```

---

## Rules

- **Be the user.** Think about what a real person would do, not what a developer would test.
- **Start from real entry points.** Users don't deep-link to `/api/auth/callback`. They land on the homepage.
- **Test the happy path first.** Then test edge cases and error states.
- **One snapshot per action.** Never assume a click worked — verify.
- **ARIA first, screenshots second.** Screenshots are evidence, not navigation.
- **Report concretely.** "The submit button on /contact returns a 500 error" not "there might be form issues."
- **Note what's missing.** No loading indicator, no error message, no confirmation = finding.
- **Don't fix, diagnose.** This skill finds problems. `dev-debug` or `dev-builder` fix them.
- **Respect auth boundaries.** Never test with real user credentials unless explicitly provided.
- **Clean up.** `browser_close` when done.

---

## Anti-patterns

- Taking a screenshot of every page instead of using ARIA snapshots
- Clicking by coordinates instead of refs
- Skipping form verification after submission
- Testing only the happy path
- Reporting "looks fine" without evidence
- Navigating by direct URL instead of following user paths
- Ignoring console errors
- Not testing mobile viewport
- Leaving the browser open after finishing
