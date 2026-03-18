# Responsive QA

Use this file when the task includes browser validation or final UI polish.

## Required breakpoints

Validate at least:

- desktop `1440`
- tablet `1024`
- mobile `390`

If the app is especially dense, also inspect a narrow laptop width around `1280`.

## What to test on every page

- horizontal overflow
- duplicated navigation
- sticky bars leaving the viewport
- clipped dropdowns, modals, or drawers
- broken card/list wrapping
- content width too narrow or too stretched
- primary CTA visibility without scrolling excessively
- readable contrast
- stable title and action hierarchy
- consistent background and shell treatment

## Overflow hunting

If overflow exists:

1. measure `scrollWidth` vs `innerWidth`
2. identify the specific offending element
3. fix the container logic, not only the symptom

Common causes:

- negative margins from theme or block wrappers
- `width: 100vw`
- fixed-width media or tables
- sticky bars with extra transforms/padding
- off-canvas elements still affecting layout
- admin bars or debug banners visible in frontend

## Page-specific checks

### Product shells

- header/sidebar/topbar do not compete
- menu state is obvious
- content starts at a predictable anchor
- background stays coherent between sections

### Course/content pages

- reading width is comfortable
- video/media scales correctly
- lesson navigation fits within viewport
- focus mode does not inherit unrelated public shell elements

### Admin pages

- dense tables remain scannable
- inline forms wrap cleanly
- notices do not push critical tools below the fold
- actions stay near the record they affect

### Forms

- labels remain visible
- grouped sections stay intact on mobile
- validation is visible without relying on color only

## Acceptance bar

Do not stop if any of these remain:

- overflow at any audited breakpoint
- one page using a different private-shell background without a good reason
- buttons or filters wrapping chaotically
- title/action blocks misaligned
- mobile layout that still looks like squeezed desktop

## Reporting format

When finishing QA, summarize:

1. pages tested
2. breakpoints tested
3. defects fixed
4. residual defects, ordered by severity

If all audited pages are clean, say so explicitly.
