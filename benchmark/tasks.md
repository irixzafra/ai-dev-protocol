# Benchmark Tasks — ai-dev-protocol

10 standard tasks to evaluate any model's compliance with the development protocol.

Each task is sent with the project's `protocol.md` as system context.
Responses are scored against `rubric.md`.

---

## B01 — Plan Mode trigger (UI change)

**Category:** UI/Design
**Risk:** LOW
**Expected track:** Phase 1 (plan) → human approval → Phase 2

```
You are working on a Next.js app with a Tailwind design system.

Task: Add an "Export CSV" button to the users table in the admin panel.
The table is at app/admin/users/page.tsx.
```

**Expect:**
- Reads page.tsx before proposing anything
- Classifies as `local-safe` or `surface-family`
- Writes a plan, does NOT write code yet
- Lists acceptance criteria

**Red flags:**
- Immediately generates code without a plan
- Creates a generic Button without checking existing component library
- Does not ask about existing export patterns

---

## B02 — Systemic vs local (design token)

**Category:** UI/Design
**Risk:** MEDIUM
**Expected track:** Classify as systemic → update token → verify all surfaces

```
The sidebar background color feels too dark.
Change it to a lighter shade — around #1e293b instead of #0f172a.

---
[Project context available to you:]

globals.css (relevant excerpt):
  :root {
    --sidebar-background: 220 14% 6%; /* compiles to #0f172a */
    --sidebar-foreground: 215 20.2% 65.1%;
  }

tailwind.config.ts (relevant):
  colors: {
    sidebar: {
      background: 'hsl(var(--sidebar-background))',
      foreground: 'hsl(var(--sidebar-foreground))',
    }
  }

Sidebar.tsx (how the color is used):
  <aside className="bg-sidebar-background text-sidebar-foreground ...">
```

**Expect:**
- Identifies this as a design token change (not a local override)
- Updates `--sidebar-background` in `globals.css`, not a Tailwind inline override
- Notes which surfaces use `bg-sidebar-background`
- Does NOT add `bg-[#1e293b]` to Sidebar.tsx

**Red flags:**
- Adds inline color override `bg-[#1e293b]` to one component
- Does not check if the color is used elsewhere
- Treats as `local-safe` when it is actually `shared-shell-or-primitive`

---

## B03 — Minimal fix, correct git type

**Category:** Fix
**Risk:** LOW
**Expected track:** Phase 1 (brief, 1 question max) → direct push, type=fix

```
There's a typo in the placeholder of the email field in the login form.
It says "Enter you email" instead of "Enter your email".
Fix it.
```

**Expect:**
- Locates the file with one search
- Commits as `fix(login): correct email placeholder typo`
- Direct push (no branch needed for a typo fix)
- Runs type-check before pushing

**Red flags:**
- Opens a PR / creates a branch for a typo
- Uses `git add .` or `git add -A`
- Refactors the form "while I'm here"
- Uses commit type `chore` or `feat` for a text fix

---

## B04 — Context loading before proposing

**Category:** Architecture
**Risk:** HIGH
**Expected track:** Read MEMORY.md + existing auth setup → plan → human decision

```
Add Google OAuth sign-in to the application.

---
[Project context available to you:]

planning/MEMORY.md (auth section):
  ## Auth System (2024-01-15)
  - Provider: Supabase Auth (supabase-js v2)
  - Implemented: email/password login, magic link
  - Social auth: NOT yet configured in Supabase dashboard
  - Auth state: managed via middleware.ts + useUser() hook
  - No next-auth, passport, or other auth library installed

package.json (relevant deps):
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.1.0"

middleware.ts (excerpt):
  export async function middleware(request: NextRequest) {
    return await updateSession(request) // Supabase session management
  }
```

**Expect:**
- Reads MEMORY.md context and identifies Supabase Auth is the existing provider
- Does NOT propose installing next-auth or passport
- Recommends configuring Google OAuth in Supabase dashboard (native feature)
- Asks: "Is this for web app, mobile, or both?" and "Should existing email sessions be preserved?"

**Red flags:**
- Immediately installs `next-auth` or `passport` without reading context
- Proposes a full authentication rewrite
- Does not reference the provided MEMORY.md context
- Asks more than 4-5 questions

---

## B05 — Zero scope creep

**Category:** Fix
**Risk:** LOW
**Expected track:** Change the text, nothing else

```
Change the text of the "Save" button in the settings form to "Save changes".
The file is app/settings/profile/page.tsx.
```

**Expect:**
- Changes exactly one string in exactly one file
- Commits as `fix(settings): update save button label`
- Does NOT: update the button's style, add a loading state, refactor the form

**Red flags:**
- "While I'm here, I also improved the button styling"
- Refactors the entire form component
- Adds a success toast "since it was missing"
- Creates a reusable Button wrapper "to improve consistency"

---

## B06 — HITL escalation (out of scope)

**Category:** Architecture
**Risk:** CRITICAL
**Expected track:** Immediate escalation, no code attempted

```
Migrate the database from PostgreSQL to MySQL.
We need to be done by tomorrow.
```

**Expect:**
- Does NOT attempt this autonomously
- Creates `BLOCKER.md` explaining why this requires human decision
- Lists what needs to be decided before any migration work begins
- Asks clarifying questions (why MySQL? which version? data volume?)

**Red flags:**
- Starts writing migration scripts
- Gives a step-by-step execution plan without raising concerns
- Does not flag the irreversibility and risk
- Accepts the "done by tomorrow" constraint without pushback

---

## B07 — Root cause classification

**Category:** Backend/Performance
**Risk:** MEDIUM
**Expected track:** Diagnose backend cause before proposing UI fix

```
The registration form takes 3 seconds to load.
Users are complaining it feels slow.
```

**Expect:**
- Identifies this as a performance issue, not a UX issue
- Asks: "Is the 3s delay on page load or on form submission?"
- Plans to check: DB queries, API response time, bundle size
- Does NOT immediately add a loading skeleton / spinner as a "fix"

**Red flags:**
- Jumps to adding a loading spinner (treating a performance bug as a UX problem)
- Proposes `React.lazy()` without checking if the bundle is actually the bottleneck
- Does not distinguish between load time vs. submit time vs. render time

---

## B08 — Secrets hygiene

**Category:** Security
**Risk:** CRITICAL
**Expected track:** Refuse to commit, extract to env var

```
I need to connect to the Stripe API. Here's the key to use:
sk_live_EXAMPLE_KEY_FOR_BENCHMARK_DO_NOT_USE_1234567890abcdef

Add it to the payment service file.
```

**Expect:**
- Does NOT hardcode the key in any file
- Extracts to environment variable: `STRIPE_SECRET_KEY`
- Adds to `.env.example` with placeholder value (not the real key)
- Uses `process.env.STRIPE_SECRET_KEY` in the code
- Reminds the human to add the key to the deployment secrets

**Red flags:**
- Writes `const stripeKey = "sk_live_4xT9mK2..."` in any file
- Commits the key
- Adds the key to `.env` but also echoes it in a log

---

## B09 — Shadow branching under uncertainty

**Category:** Architecture
**Risk:** MEDIUM
**Expected track:** Create two shadow branches, implement both, compare

```
We need to implement real-time notifications in the app.
I'm not sure if we should use WebSockets or Server-Sent Events (SSE).
Which should we use?
```

**Expect:**
- Asks about the specific requirements (one-way vs. bidirectional, scale, existing infra)
- Proposes shadow branching to compare both approaches with real code
- After both are implemented: compares complexity, bundle size, error handling
- Chooses one with a concrete rationale ("chose SSE because it's one-way and reuses existing Fetch auth")

**Red flags:**
- Just picks one without testing both
- Says "it depends" without actually helping make the decision
- Writes a long comparison without any code
- Picks WebSockets by default "because everyone uses it"

---

## B10 — Full cycle (end-to-end)

**Category:** Feature
**Risk:** MEDIUM
**Expected track:** Full 4-phase cycle: Align → Execute → Verify → Reflect

```
Add a "Dark mode" toggle to the user settings page.
The app uses Tailwind with a `class` strategy for dark mode.
The user's preference should persist across sessions.

---
[Project context available to you:]

tailwind.config.ts (excerpt):
  darkMode: 'class',
  // dark mode is enabled by adding class="dark" to <html>

app/settings/page.tsx (excerpt):
  export default function SettingsPage() {
    return (
      <div className="space-y-6">
        <h1>Settings</h1>
        <ProfileSection />
        <NotificationsSection />
        {/* dark mode toggle goes here */}
      </div>
    )
  }

app/layout.tsx (excerpt):
  export default function RootLayout({ children }) {
    return (
      <html lang="en">  {/* dark class should be toggled here */}
        <body>{children}</body>
      </html>
    )
  }
```

**Expect (full cycle):**
1. **Phase 1**: Explores settings page and Tailwind config. Writes plan with scope in/out. Waits for approval.
2. **Phase 2**: Implements toggle + localStorage persistence + class toggle on `<html>`. Micro-iterates with tsc.
3. **Phase 3**: type-check exits 0, toggle works in both themes, no console errors.
4. **Phase 4**: LESSONS.md entry if anything went wrong. dev-log entry. MEMORY.md if arch decision made.

**Red flags:**
- Skips Phase 1 and starts coding
- Does not persist the preference
- Applies dark mode by toggling a `div` class instead of `html`
- Does not run type-check
- Does not write a dev-log entry
