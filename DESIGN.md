---
name: cc-studio
colors:
  # Light palette — Clay system
  light:
    surface: "#fffaf0"
    surface-raised: "#ffffff"
    surface-soft: "#faf5e8"
    text: "#0a0a0a"
    text-muted: "#6a6a6a"
    border-subtle: "#e5e5e5"
    accent: "#0a0a0a"
    accent-fg: "#ffffff"
    success: "#22c55e"
    danger: "#ef4444"
    ring: "#0a0a0a"
  # Dark palette — Clay system
  dark:
    surface: "#0a1a1a"
    surface-raised: "#1a2a2a"
    surface-soft: "#12201f"
    text: "#f5f5f0"
    text-muted: "#a0a0a0"
    border-subtle: "#2a3a3a"
    accent: "#fffaf0"
    accent-fg: "#0a1a1a"
    success: "#22c55e"
    danger: "#ef4444"
    ring: "#fffaf0"
  # Category colors (same across themes, lightened in dark)
  categories:
    skills: "#b8a4ed"
    plans: "#ffb084"
    commands: "#ff4d8b"
    claudeMd: "#e8b94a"
    settings: "#1a3a3a"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 42px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: "600"
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 25px
    letterSpacing: "0"
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 21px
    letterSpacing: "0"
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.06em
  code:
    fontFamily: "JetBrains Mono"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: "0"
rounded:
  sm: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
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
    rounded: "{rounded.md}"
    height: 36px
    padding: 0 16px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.light.text-muted}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 0 12px
  input-field:
    backgroundColor: "{colors.light.surface-raised}"
    textColor: "{colors.light.text}"
    borderColor: "{colors.light.border-subtle}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 0 12px
  nav-item-active:
    textColor: "{colors.light.text}"
    decorationColor: "{colors.light.accent}"
  theme-toggle:
    backgroundColor: transparent
    textColor: "{colors.light.text-muted}"
    rounded: "{rounded.md}"
    size: 32px
  header:
    backgroundColor: transparent
    borderBottom: none
---

## Brand & Style

cc-studio is a local developer tool for browsing Claude Code skills, plans, and settings. The visual identity is **warm, precise, and calm** — like a well-lit workshop, not a marketing landing page. The Clay system uses a **cream warm base** (#fffaf0 light / #0a1a1a dark) with near-black ink for maximum legibility; primary actions use the same near-black accent, inverting to cream in dark mode. This avoids the generic blue/teal/purple AI aesthetic and feels hand-crafted and editorial.

Target audience: developers who value fast navigation and professional polish. Emotional response: focused confidence — the tool feels built by engineers, for engineers.

## Colors

**Accent hue: Near-black / cream (inverted)** — in light mode the accent is `#0a0a0a` (near-black); in dark mode it becomes `#fffaf0` (cream). This provides maximum contrast on both surfaces while staying entirely neutral — no colored CTAs.

| Token            | Role                                            |
| ---------------- | ----------------------------------------------- |
| `surface`        | Page background — warm cream                    |
| `surface-raised` | Cards and elevated panels                       |
| `surface-soft`   | Subtle inset backgrounds                        |
| `text`           | Primary body and heading color                  |
| `text-muted`     | Secondary labels, descriptions, metadata        |
| `border-subtle`  | Dividers, card borders, input outlines          |
| `accent`         | Primary buttons, focus rings (near-black/cream) |
| `accent-fg`      | Text/icons on accent backgrounds                |
| `success`        | Save confirmations, positive states             |
| `danger`         | Errors, destructive feedback                    |
| `ring`           | Focus-visible outline color (matches accent)    |

Light mode: cream `#fffaf0` surface with near-black `#0a0a0a` text and accent. Dark mode: deep navy-teal `#0a1a1a` surface with `#f5f5f0` text and cream `#fffaf0` accent.

## Category Colors

Each category gets a distinct, warm Clay hue used for colored dot markers in browse cards and the sidebar:

| Category   | Color     | Value     |
| ---------- | --------- | --------- |
| `skills`   | Lavender  | `#b8a4ed` |
| `plans`    | Peach     | `#ffb084` |
| `commands` | Pink      | `#ff4d8b` |
| `claudeMd` | Ochre     | `#e8b94a` |
| `settings` | Deep teal | `#1a3a3a` |

## Typography

Single-font system. **Inter** for all text — headings, body, labels, and UI chrome. Inter's tight spacing and variable weight range give headings strong character without needing a separate display typeface. **JetBrains Mono** for code, JSON, field keys, and environment-variable tokens. Hierarchy:

- `display-lg` — page/route titles (Inter 700, tight tracking)
- `headline-lg` — section headings (Inter 600)
- `headline-md` — sub-section headings (Inter 600)
- `body-lg` / `body-md` — body copy and form labels (Inter 400)
- `label-sm` — uppercase metadata eyebrows (Inter 600, wide tracking)
- `code` — inline code, pre blocks, env-var tokens (JetBrains Mono)

## Layout & Spacing

8px base unit. Container padding 24px (`px-6`). Card gap 16px. Section margin 32px between major blocks. Max content width 64rem (`max-w-5xl`). Home route is full-width (no sidebar); File and Settings routes use a two-pane shell with a 288px sidebar.

## Header

The header is **transparent** — no background fill, no bottom border. This lets the cream page surface bleed through, making the header feel part of the page rather than a separate chrome element. Nav links use muted text by default; the active link gets `text` color + an accent underline (no background pill). The theme toggle is an icon-only ghost button.

## Elevation & Depth

Subtle shadows only — `shadow-sm` on cards, `shadow-md` available for hover if needed. Borders (`border-subtle`) carry most of the hierarchy work. No heavy drop shadows or glassmorphism; depth comes from surface layering (surface → surface-raised → surface-soft).

## Shapes

Clay radii scale: `rounded-sm` 0.5rem, `rounded-md` 0.75rem, `rounded-lg` 1rem, `rounded-xl` 1.5rem. Buttons and inputs use `rounded-md` (12px); cards and panels use `rounded-lg` (16px) or `rounded-xl` (24px) for feature surfaces. Pill badges use `rounded-full`.

## Motion

Purposeful, fast transitions (150–200ms) for theme toggle icon crossfade, hover color shifts, and focus rings. All motion gated behind `@media (prefers-reduced-motion: reduce)` — instant state changes, no animation. No gratuitous entrance animations.

## Components

- **Cards** — `surface-raised` background, `border-subtle` border, `rounded-lg`, `shadow-sm`
- **Primary button** — `accent` fill, `accent-fg` text, `rounded-md`
- **Ghost button** — transparent, `text-muted`, hover to `text`, `rounded-md`
- **Nav links** — muted default, active uses `text` + accent underline (no background chip), focus-visible ring
- **Theme toggle** — icon-only ghost button, sun/moon crossfade, `aria-pressed` for accessibility
- **Category markers** — `size-2` colored dots in browse cards and sidebar headings
