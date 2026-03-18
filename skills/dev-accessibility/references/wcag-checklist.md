# WCAG Quick Checklist for AI Agents

> Based on WCAG 2.1 AA — the standard required by EU accessibility law (EAA 2025) and most enterprise contracts.
> For each: what to check → how AI agents fail it → correct pattern.

---

## Perceivable

### 1.1 Text alternatives
**Check:** Every non-text element has a text alternative.
**How AI fails:** Generates `<img src="logo.png" />` without alt, or `<button><svg>...</svg></button>` without label.
**Pattern:** `<img alt="Company logo" />` or `<button aria-label="Close"><svg aria-hidden="true">...</svg></button>`

### 1.3 Adaptable
**Check:** Information, structure, and relationships are available without color or visual formatting.
**How AI fails:** Marks required fields only with a red asterisk. Error state communicated only by red border.
**Pattern:** `<label>Email <span aria-label="required">*</span></label>` + error message in text below the field.

### 1.4 Distinguishable
**Check:** Text contrast ratio ≥ 4.5:1 (normal text), ≥ 3:1 (large text / UI components).
**How AI fails:** Uses `text-gray-400` on white, or primary brand color with insufficient contrast.
**Pattern:** Check contrast before choosing. `text-gray-600` on white = 5.9:1 ✓. `text-gray-400` on white = 2.9:1 ✗.

---

## Operable

### 2.1 Keyboard accessible
**Check:** All functionality reachable and operable via keyboard.
**How AI fails:** Custom dropdowns, date pickers, and modals built without keyboard handling. `onClick` only, no `onKeyDown`.
**Pattern:** Buttons get `onClick` + `onKeyDown` for Enter/Space. Modals trap focus. Dropdowns close on Escape.

### 2.4 Navigable
**Check:** Users can skip repetitive content. Focus order is logical. Headings describe content.
**How AI fails:** No skip link, heading levels chosen for size not structure, focus order follows DOM not visual layout.
**Pattern:** `<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>` at top of page.

### 2.5 Input modalities
**Check:** Touch targets ≥ 44×44px. No hover-only interactions.
**How AI fails:** Icon buttons at 20×20px. Tooltips only visible on hover (inaccessible on touch + keyboard).
**Pattern:** `className="min-h-[44px] min-w-[44px]"` for any tappable element. Tooltip content also available on focus.

---

## Understandable

### 3.1 Readable
**Check:** Language of page declared. Unusual terms explained.
**How AI fails:** Omits `lang` attribute on `<html>`. Uses jargon in error messages.
**Pattern:** `<html lang="en">`. Error messages in plain language: "Enter a valid email address" not "Invalid input."

### 3.3 Input assistance
**Check:** Errors identified in text, described to user, suggestions provided.
**How AI fails:** Clears the invalid field on error. Shows only "Error" without describing what's wrong or how to fix it.
**Pattern:** Error message below the field, linked via `aria-describedby`. Field keeps the invalid value so user can correct it.

---

## Robust

### 4.1 Compatible
**Check:** HTML is valid. ARIA attributes used correctly. Name, role, value accessible for all UI components.
**How AI fails:** Nests `<div>` inside `<button>`. Applies `aria-expanded` to non-interactive elements. Uses deprecated ARIA roles.
**Pattern:** Validate HTML. Check that every interactive element has an accessible name (visible label or `aria-label`). Use established component libraries as base.
