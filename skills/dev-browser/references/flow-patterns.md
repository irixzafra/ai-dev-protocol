# Flow Patterns — Common User Flow Testing Recipes

## 1. Authentication Flows

### Login (email + password)

```
1. browser_navigate → login page
2. browser_snapshot → find email input, password input, submit button
3. browser_click → email input ref
4. browser_type → test email
5. browser_click → password input ref
6. browser_type → test password
7. browser_click → submit button ref
8. browser_snapshot → verify redirect to dashboard/home
```

**What to check:**
- Does wrong password show a clear error? (not just "invalid credentials")
- Does the error disappear when user starts typing again?
- Is there a "forgot password" link?
- Does the form preserve the email on error?
- Is the password field actually `type="password"`?
- Does Enter key submit the form?

### Signup (registration)

```
1. browser_navigate → signup page (or find signup link from login)
2. browser_snapshot → catalog all required fields
3. browser_fill_form → fill all fields with test data
4. browser_click → submit
5. browser_snapshot → verify next step (verification, onboarding, dashboard)
```

**What to check:**
- Field validation: try empty fields, invalid email, short password
- Does password have requirements? Are they shown BEFORE submission?
- Is there duplicate email detection?
- Does it preserve field values on validation error?
- GDPR: is there a consent checkbox?
- What happens after signup? (email verification? direct login? onboarding?)

### OAuth / Social Login

```
1. browser_snapshot → find social login buttons (Google, GitHub, etc.)
2. browser_click → social login button
3. browser_snapshot → verify redirect to OAuth provider
4. (OAuth happens externally — note if popup or redirect)
5. browser_snapshot → verify return to app with logged-in state
```

**What to check:**
- Does the button clearly identify the provider?
- Is it a redirect or popup? (popups can be blocked)
- What happens if the user denies permission?
- Is there a loading state during OAuth?

### Logout

```
1. browser_snapshot → find logout button/link (often in user menu)
2. browser_click → user avatar/menu
3. browser_snapshot → find logout option
4. browser_click → logout
5. browser_snapshot → verify redirect to login/home
6. browser_navigate → try accessing a protected page
7. browser_snapshot → verify redirect to login (not 403 page)
```

---

## 2. Form Patterns

### Simple Contact Form

```
1. browser_snapshot → catalog fields
2. browser_fill_form → name, email, message
3. browser_click → submit
4. browser_snapshot → verify success message
```

**Verification checklist:**
- [ ] Success message visible without scrolling
- [ ] Form resets or shows confirmation
- [ ] No duplicate submission on double-click
- [ ] Required field validation works
- [ ] Email format validation works

### Multi-Step Wizard

```
1. browser_snapshot → Step 1 fields
2. Fill Step 1 fields
3. browser_click → "Next" / "Continue"
4. browser_snapshot → verify Step 2 loaded, step indicator updated
5. Fill Step 2 fields
6. browser_click → "Next"
7. ... repeat for all steps
8. browser_snapshot → verify summary/confirmation step
9. browser_click → final submit
10. browser_snapshot → verify completion
```

**What to check:**
- Can user go back to previous steps?
- Are previous step values preserved?
- Is there a step indicator?
- What happens if user refreshes mid-wizard?
- Can user skip to a specific step?

### File Upload

```
1. browser_snapshot → find file input
2. browser_file_upload → select file(s)
3. browser_snapshot → verify file appears in preview/list
4. browser_click → submit/upload button
5. browser_wait_for → upload completion indicator
6. browser_snapshot → verify success
```

**What to check:**
- File type restrictions (does it reject invalid types?)
- File size limit (what happens with large files?)
- Multiple file upload support
- Progress indicator during upload
- Can user remove a file before submission?

### Search + Filter

```
1. browser_snapshot → find search input
2. browser_click → search input ref
3. browser_type → search query
4. browser_press_key "Enter" (or wait for auto-search)
5. browser_snapshot → verify results appear
6. browser_snapshot → find filter controls
7. browser_click → a filter option
8. browser_snapshot → verify results updated
```

**What to check:**
- Search results relevance
- "No results" state — is there a message? Suggestions?
- Do filters combine correctly?
- Can filters be cleared?
- Does URL update with search/filter state? (shareable?)

---

## 3. Navigation Patterns

### Primary Navigation

```
1. browser_snapshot → catalog all nav items
2. For each nav item:
   a. browser_click → nav item ref
   b. browser_snapshot → verify correct page loaded
   c. browser_snapshot → verify active nav state
3. Test nav on mobile:
   a. browser_resize → 375x812
   b. browser_snapshot → find hamburger/menu toggle
   c. browser_click → toggle
   d. browser_snapshot → verify menu opens
   e. browser_click → a nav item
   f. browser_snapshot → verify menu closes + page loads
```

### Breadcrumbs

```
1. Navigate deep into the site (3+ levels)
2. browser_snapshot → verify breadcrumb trail is correct
3. browser_click → a middle breadcrumb
4. browser_snapshot → verify correct page + breadcrumb updates
```

### Pagination

```
1. browser_snapshot → find pagination controls
2. browser_click → page 2
3. browser_snapshot → verify new content loaded, page indicator updated
4. browser_click → "Previous"
5. browser_snapshot → verify return to page 1
6. browser_click → last page
7. browser_snapshot → verify correct content
```

---

## 4. E-commerce Patterns

### Add to Cart

```
1. browser_navigate → product page
2. browser_snapshot → find "Add to Cart" button
3. browser_click → add to cart
4. browser_snapshot → verify cart indicator updated (count, animation)
5. browser_navigate → cart page
6. browser_snapshot → verify product in cart with correct details
```

### Checkout Flow

```
1. From cart → browser_click "Checkout"
2. browser_snapshot → shipping info form
3. browser_fill_form → address details
4. browser_click → continue to payment
5. browser_snapshot → payment form
6. (payment is usually sandboxed — note what's testable)
7. browser_snapshot → order summary/confirmation
```

---

## 5. CRUD Patterns

### Create

```
1. browser_snapshot → find "Create" / "New" / "+" button
2. browser_click → create button
3. browser_snapshot → verify form/modal appears
4. browser_fill_form → required fields
5. browser_click → save/submit
6. browser_snapshot → verify item appears in list
```

### Read (Detail View)

```
1. browser_snapshot → find item in list
2. browser_click → item (or detail link)
3. browser_snapshot → verify detail page loads with correct data
4. browser_navigate_back → verify return to list
```

### Update

```
1. browser_snapshot → find edit button for an item
2. browser_click → edit
3. browser_snapshot → verify form pre-filled with current values
4. Modify a field
5. browser_click → save
6. browser_snapshot → verify changes persisted
```

### Delete

```
1. browser_snapshot → find delete button
2. browser_click → delete
3. browser_snapshot → verify confirmation dialog (MUST have one)
4. browser_click → confirm delete
5. browser_snapshot → verify item removed from list
6. Verify: is there an undo option?
```

---

## 6. Error State Testing

### Network Error Simulation

```
1. browser_evaluate → window.fetch = () => Promise.reject(new Error('Network'))
2. Trigger an action that makes an API call
3. browser_snapshot → verify error handling (message, retry button)
```

### Validation Errors

```
1. Submit form with empty required fields
2. browser_snapshot → verify inline errors appear on each field
3. Submit form with invalid data (wrong email format, etc.)
4. browser_snapshot → verify specific error messages
5. Fix one field, submit again
6. browser_snapshot → verify only remaining errors shown
```

### 404 / Not Found

```
1. browser_navigate → /nonexistent-page-xyz
2. browser_snapshot → verify 404 page exists, is branded, has navigation home
```

---

## 7. Accessibility Flow Testing

### Keyboard Navigation

```
1. browser_press_key "Tab" → move through interactive elements
2. browser_snapshot → verify focus indicator visible
3. browser_press_key "Tab" (repeat) → verify logical tab order
4. browser_press_key "Enter" → activate focused element
5. browser_snapshot → verify action executed
6. browser_press_key "Escape" → close modals/dropdowns
```

### Screen Reader Simulation

ARIA snapshots already show what a screen reader would announce:
```
1. browser_snapshot → check that:
   - All buttons have labels
   - Images have alt text
   - Form inputs have associated labels
   - Headings create a logical hierarchy
   - ARIA roles are correct
```

---

## Test Data Conventions

When testing requires data, use these patterns:

| Field | Test Value |
|---|---|
| Name | "Test User" |
| Email | "test@example.com" |
| Phone | "+34 600 000 000" |
| Password | "TestPass123!" |
| Address | "Calle Test 123, Madrid" |
| Credit Card | "4242 4242 4242 4242" (Stripe test) |
| Expiry | "12/28" |
| CVV | "123" |

Never use real credentials. If the flow requires real auth, ask the user for test credentials first.
