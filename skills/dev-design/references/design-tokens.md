# Design Tokens

Document all tokens explicitly before writing code.

## Typography

Use fonts defined in `globals.css` or `tailwind.config`. Do not hardcode font families here — the project's configuration is the source of truth.

```
Display:  bold, 64-96px, tracking -0.03em
Heading:  semibold, 32-48px
Body:     regular, 16-18px, leading 1.65
Mono:     monospace family from config
Scale:    ratio 1.25 (minor third)
```

Avoid overly generic display fonts (Roboto, Open Sans). Prefer distinctive sans-serif families for display.

## Design Tokens (all, not just color)

```css
/* Colors — HSL, light + dark */
--color-bg:        H S% L%;
--color-bg-2:      H S% L%;   /* elevated surface */
--color-fg:        H S% L%;
--color-muted:     H S% L%;   /* secondary text */
--color-dimmed:    H S% L%;   /* tertiary text */
--color-accent:    H S% L%;   /* 1 dominant brand color */
--color-accent-2:  H S% L%;   /* optional secondary */
--color-border:    H S% L%;

/* Spacing — 4px grid, 8px comfortable base */
--space-1: 4px;  --space-2: 8px;  --space-3: 16px;
--space-4: 24px; --space-5: 48px; --space-6: 96px; --space-7: 192px;

/* Radii */
--radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px; --radius-full: 9999px;

/* Animations */
--duration-fast: 150ms; --duration-base: 300ms; --duration-slow: 600ms;
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);

/* Shadows */
--shadow-sm:   0 1px 3px hsl(var(--color-bg) / 0.3);
--shadow-glow: 0 0 40px hsl(var(--color-accent) / 0.15);
```

## Dark/light automatic support

- `next-themes` with `ThemeProvider` in layout root
- Separate tokens for `:root` (light) and `.dark`
- Smooth transition: `transition: color 300ms, background 300ms`

## Animations (only transform + opacity)

```
- Stagger reveals on scroll (Framer Motion viewport)
- Hover states with depth (scale + subtle glow)
- Micro-interactions with purpose (never decorative)
- prefers-reduced-motion: ALWAYS respected
- Visible "Reduce Motion" option in navbar/footer
- <motion.div> with motionSafe check before any complex animation
```
