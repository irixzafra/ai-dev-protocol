# Systematic Site Exploration

## When to use

When the goal is not to test a specific flow, but to discover everything the site offers and map it. This is the "explore the app and tell me what you find" mode.

---

## Method: Breadth-First Page Discovery

### Phase 1: Map the navigation

```
1. browser_navigate → homepage / entry URL
2. browser_snapshot → catalog ALL navigation elements:
   - Main nav / sidebar items
   - Footer links
   - Header actions (login, signup, search)
   - CTAs on the page
3. Record every unique link destination
```

Output a navigation inventory:

```
Navigation Map:
├── Header
│   ├── Logo → / (home)
│   ├── Products → /products
│   ├── Pricing → /pricing
│   ├── Blog → /blog
│   ├── Login → /auth/login
│   └── Sign Up → /auth/signup
├── Footer
│   ├── About → /about
│   ├── Contact → /contact
│   ├── Privacy → /privacy
│   └── Terms → /terms
└── Page CTAs
    ├── "Get Started" → /auth/signup
    └── "Book Demo" → /demo
```

### Phase 2: Visit each page (breadth-first)

For each unique URL discovered:

```
1. browser_click → link to page (navigate as user, not by URL)
2. browser_snapshot → catalog:
   - Page title / main heading
   - Interactive elements (buttons, forms, links)
   - New links not yet visited
   - Page type (list, detail, form, static content)
3. Add any new links to the queue
4. browser_navigate_back or click nav to return
```

### Phase 3: Test interactions per page

On each page, interact with:

```
- Buttons → click, verify action
- Forms → fill one field, check validation
- Dropdowns → open, check options
- Modals/dialogs → trigger, verify open/close
- Tabs → click each, verify content changes
- Accordions → expand/collapse
- Search → type a query, check results
```

### Phase 4: Test state transitions

```
- Logged out → logged in (if auth exists)
- Empty state → with data
- Light mode → dark mode (if toggle exists)
- Desktop → mobile (browser_resize)
```

---

## Exploration Report Format

```markdown
# Site Exploration Report — [URL]

## Summary
- **Pages discovered**: N
- **Interactive elements**: N
- **Forms found**: N
- **Dead ends**: N
- **Errors found**: N

## Site Map

[Navigation tree from Phase 1]

## Page Inventory

### / (Homepage)
- **Type**: Landing page
- **Elements**: hero, 3 feature cards, CTA, testimonials
- **Links to**: /products, /pricing, /signup
- **Status**: OK

### /products
- **Type**: List page
- **Elements**: product grid (12 items), filters, search, pagination
- **Links to**: /products/:id (detail pages)
- **Status**: OK — filter works, search returns results

### /auth/login
- **Type**: Auth form
- **Elements**: email, password, submit, forgot password link, social login
- **Status**: Form submits, error shows on wrong credentials

## Findings

### Issues
1. **[Page]**: [description of problem]
2. **[Page]**: [description of problem]

### Missing
1. No 404 page (shows blank)
2. No loading states on /products
3. No empty state when search returns 0 results

### Good
1. Navigation consistent across all pages
2. All forms have proper validation
3. Mobile nav works correctly
```

---

## Exploration Heuristics

Rules for deciding what to investigate further:

| Signal | Action |
|---|---|
| Page has a form | Test submit with empty + valid data |
| Page has a list | Check pagination, filtering, empty state |
| Page has tabs | Click each tab, verify content |
| Element has hover state | browser_hover, verify tooltip/menu |
| Button says "Delete" / "Remove" | Click, verify confirmation dialog |
| Input exists | Type something, check validation |
| URL has parameters | Try modifying them |
| Page loads slowly | Note as performance issue |
| Console has errors | Note with error text |
| Element is not in ARIA snapshot but visible in screenshot | Accessibility issue — missing labels |

---

## Depth Limits

To avoid infinite exploration:

- **Max pages**: 30 per session (unless user asks for more)
- **Max depth**: 4 clicks from homepage
- **Max forms**: test top 5 most important, note others
- **Time box**: if exploration is taking too long, report what you have and ask if user wants to continue
- **Loops**: if you visit the same page twice, stop following that branch
- **External links**: note but don't follow (different domain)
- **Auth-gated pages**: note as "requires login" unless credentials are provided
