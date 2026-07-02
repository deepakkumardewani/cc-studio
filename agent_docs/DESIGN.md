---
name: cc-studio
colors:
  # Light palette
  light:
    surface: "#fafaf9"
    surface-raised: "#ffffff"
    text: "#1c1917"
    text-muted: "#78716c"
    border-subtle: "#e7e5e4"
    accent: "#0d9488"
    accent-fg: "#ffffff"
    success: "#059669"
    danger: "#dc2626"
    ring: "#0d9488"
  # Dark palette
  dark:
    surface: "#1c1917"
    surface-raised: "#292524"
    text: "#fafaf9"
    text-muted: "#a8a29e"
    border-subtle: "#44403c"
    accent: "#2dd4bf"
    accent-fg: "#134e4a"
    success: "#34d399"
    danger: "#f87171"
    ring: "#2dd4bf"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "500"
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: "0"
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: "0"
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: "JetBrains Mono"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: "0"
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.625rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-margin: 32px
shadows:
  sm: "0 1px 2px 0 rgb(28 25 23 / 0.05)"
  md: "0 4px 6px -1px rgb(28 25 23 / 0.07), 0 2px 4px -2px rgb(28 25 23 / 0.05)"
  lg: "0 10px 15px -3px rgb(28 25 23 / 0.08), 0 4px 6px -4px rgb(28 25 23 / 0.05)"
components:
  card-standard:
    backgroundColor: "{colors.light.surface-raised}"
    textColor: "{colors.light.text}"
    borderColor: "{colors.light.border-subtle}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-gap}"
    shadow: "{shadows.sm}"
  button-primary:
    backgroundColor: "{colors.light.accent}"
    textColor: "{colors.light.accent-fg}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 0 16px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.light.text-muted}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 0 12px
  input-field:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.text}"
    borderColor: "{colors.light.border-subtle}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 0 12px
  nav-item-active:
    textColor: "{colors.light.text}"
    decorationColor: "{colors.light.accent}"
  theme-toggle:
    backgroundColor: transparent
    textColor: "{colors.light.text-muted}"
    rounded: "{rounded.lg}"
    size: 36px
---

## Brand & Style

cc-studio is a local developer tool for browsing Claude Code skills, plans, and settings. The visual identity should feel **warm, precise, and trustworthy** — like a well-organized workshop, not a marketing landing page. Users spend extended time reading markdown and editing config; the interface stays calm and legible while the **teal accent** (#0d9488 light / #2dd4bf dark) signals interactivity without the generic purple/indigo AI aesthetic.

Target audience: developers who value fast navigation and professional polish. Emotional response: focused confidence — the tool feels built by engineers, for engineers.

## Colors

**Accent hue: Teal** — chosen to differentiate from common AI-tool purple defaults while pairing naturally with the warm stone neutral base inherited from the prototype.

| Token            | Role                                            |
| ---------------- | ----------------------------------------------- |
| `surface`        | Page background — warm stone tint               |
| `surface-raised` | Cards, header, elevated panels                  |
| `text`           | Primary body and heading color                  |
| `text-muted`     | Secondary labels, descriptions, metadata        |
| `border-subtle`  | Dividers, card borders, input outlines          |
| `accent`         | Links, active nav, primary buttons, focus rings |
| `accent-fg`      | Text/icons on accent backgrounds                |
| `success`        | Save confirmations, positive states             |
| `danger`         | Errors, destructive feedback                    |
| `ring`           | Focus-visible outline color (matches accent)    |

Light mode uses stone-warm neutrals on `#fafaf9` with deep `#1c1917` text. Dark mode inverts to `#1c1917` surface with `#fafaf9` text; accent brightens to `#2dd4bf` for sufficient contrast on dark backgrounds.

## Typography

**Inter** (sans-serif) for all UI and prose — excellent readability at small sizes. **JetBrains Mono** for code blocks and JSON. Hierarchy:

- `display-lg` — page titles (one per route)
- `headline-lg` — section headings (category cards)
- `headline-md` — sub-section headings
- `body-lg` / `body-md` — body copy and form labels
- `label-sm` — uppercase metadata labels (e.g. "FILE", "SETTINGS")
- `code` — inline code and pre blocks

## Layout & Spacing

8px base unit. Container padding 24px (`px-6`). Card gap 16px. Section margin 32px between major blocks. Max content width 64rem (`max-w-5xl`) for comfortable reading.

## Elevation & Depth

Subtle shadows only — `shadow-sm` on cards, `shadow-md` on hover if needed later. Borders (`border-subtle`) do most hierarchy work. No heavy drop shadows or glassmorphism; depth comes from surface layering (surface → surface-raised).

## Shapes

Soft corners: `rounded-lg` (0.75rem) for buttons and inputs, `rounded-xl` (1rem) for cards. Pill badges use `rounded-full`. Consistent radius scale prevents the "AI rounded-2xl everywhere" look.

## Motion

Purposeful, fast transitions (150–200ms) for theme toggle icon crossfade, hover color shifts, and focus rings. All motion gated behind `@media (prefers-reduced-motion: reduce)` — instant state changes, no animation. No gratuitous entrance animations.

## Components

- **Cards** — `surface-raised` background, `border-subtle` border, `rounded-xl`, `shadow-sm`
- **Primary button** — `accent` fill, `accent-fg` text
- **Ghost button** — transparent, `text-muted`, hover to `text`
- **Nav links** — muted default, active uses `text` + accent underline
- **Theme toggle** — icon-only ghost button, sun/moon swap, `aria-pressed` for accessibility
