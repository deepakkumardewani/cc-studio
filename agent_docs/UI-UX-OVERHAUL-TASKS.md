# Tasks: cc-studio UI/UX Overhaul

> Phase 3 (TASKS) for the UI/UX epic. Derived from
> [UI-UX-OVERHAUL-PLAN.md](./UI-UX-OVERHAUL-PLAN.md).
> Rules: each task ≤ 5 files, has explicit acceptance + verify steps, and is a
> vertical slice where possible. **All commands use `bun` / `bunx`.**
> Execute one task at a time; do not start the next until the current one's
> verify passes. Visual checks use the **agent-browser** skill in **both** themes.

Legend: ☐ todo · 🔶 checkpoint (human review gate)

---

## Phase 0 — Foundation (design system → tokens + theme)

### T0.0 — Author DESIGN.md (source of truth) via /create-design-md

- ☑ **Impl** · ☑ **Test**
- **Files:** `agent_docs/DESIGN.md` (or repo root `DESIGN.md`)
- **Do:** Run the **/create-design-md** skill to author the project's design
  system: brand/visual identity, style direction, **light + dark** color palettes,
  accent hue, typography/font pairing, spacing + radius + shadow scales, and
  component/interaction conventions. Every later design decision — tokens,
  components, motion — must trace back to this file. Resolves Open Question 1
  (accent hue).
- **Acceptance:** `DESIGN.md` exists and specifies concrete values for colors
  (light + dark), typography, spacing/radius/shadow, and motion principles;
  the accent hue is chosen and recorded.
- **Verify:** File reviewed and approved by the user; token names in it match what
  T0.1 will implement.
- **Scope:** S · **Deps:** None

### T0.1 — Design-token system (light + dark)

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/index.css`, `apps/web/tailwind`/`vite.config.ts` (if theme config needed)
- **Do:** Translate `DESIGN.md` into semantic CSS-variable tokens via Tailwind v4
  `@theme` — surface, surface-raised, text, text-muted, border-subtle, accent,
  accent-fg, success, danger, ring, plus radius/shadow scales. Provide light
  values on `:root` and dark overrides under `.dark`. Add a base layer (body
  bg/text, focus-visible ring, reduced-motion reset). Values come from DESIGN.md.
- **Acceptance:** Tokens match `DESIGN.md` and resolve in both `:root` and `.dark`;
  no visual regression on current pages when `.dark` is absent.
- **Verify:** `bunx vp check` green; toggling `.dark` on `<html>` in devtools flips
  base colors; screenshot both.
- **Scope:** S · **Deps:** T0.0

### T0.2 — ThemeProvider + theme toggle

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/lib/theme.tsx` (provider + `useTheme`), `apps/web/src/main.tsx`, `apps/web/src/components/ThemeToggle.tsx`
- **Do:** `ThemeProvider` reads `localStorage` → falls back to
  `prefers-color-scheme`; sets/removes `.dark` on `<html>`; exposes
  `{ theme, setTheme, toggle }`. `ThemeToggle` button (sun/moon icon) wired to it,
  accessible (`aria-pressed`/label). Mount provider in `main.tsx`.
- **Acceptance:** Toggle switches themes and persists across reload; respects
  system default on first visit; no FOUC flash of wrong theme.
- **Verify:** `bunx vp check` green; reload keeps chosen theme; system change
  respected when unset. Component test: toggle updates `document.documentElement`.
- **Scope:** S · **Deps:** T0.1

### T0.3 — Migrate existing shell to tokens

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/routes/Layout.tsx`, `apps/web/src/routes/List.tsx`, `apps/web/src/routes/File.tsx`
- **Do:** Replace hardcoded `stone-*`/`white`/`bg-*` with semantic token classes
  across the current shell and pages (mechanical, no layout change yet). Add the
  `ThemeToggle` to the header. Grep to confirm no stray hardcoded colors remain.
- **Acceptance:** Existing pages render identically in light and correctly in dark;
  no raw `stone-`/`white` color utilities remain in migrated files.
- **Verify:** `bunx vp check` + `bunx vp test` green; agent-browser: Home, a file
  page, Settings all legible in both themes.
- **Scope:** M · **Deps:** T0.1, T0.2

### 🔶 Checkpoint 0 — ☑ Complete

`DESIGN.md` approved; tokens match it; toggle flips the whole existing app
light↔dark; no hardcoded-color regressions; `bunx vp check` green.
**Stop for review** (confirm DESIGN.md + overall vibe).

---

## Phase A — Navigation (file-tree sidebar + shell)

### T A.1 — `buildTree` util (flat paths → nested tree)

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/lib/tree.ts`, `apps/web/src/lib/tree.test.ts`
- **Do:** Pure function turning a `TreeCategory`'s flat `files[]` (slash-delimited
  `name`) into a nested `{ folders, files }` structure per category, sorted
  folders-first then alpha. Preserve the routing href for each leaf.
- **Acceptance:** Nested paths group into folders; single files stay at root;
  empty category yields empty tree; hrefs match current routing.
- **Verify:** `bunx vp test apps/web` — unit tests cover flat, deeply-nested, and
  empty inputs.
- **Scope:** S · **Deps:** None

### T A.2 — `FileTree` component (collapsible, icons, a11y)

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/components/FileTree.tsx`, `apps/web/src/components/FileTree.test.tsx`
- **Do:** Render the `buildTree` output: collapsible folders (chevron + folder
  icon), file leaves (file icon), single click on a leaf navigates, active file
  highlighted. `role="tree"`/`treeitem`, keyboard expand/collapse, remembers open
  folders. Category headings group the five surfaces.
- **Acceptance:** Folders expand/collapse on click; file click routes to that
  file; active item highlighted; keyboard operable.
- **Verify:** `bunx vp test` — folder toggles, leaf click fires navigation; agent-browser:
  expand/collapse + open a nested skill.
- **Scope:** M · **Deps:** T A.1, T0.1

### T A.3 — Two-pane shell + landing state

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/routes/Layout.tsx`, `apps/web/src/routes/List.tsx`
- **Do:** Restructure `Layout` into header + persistent sidebar (`FileTree`, fed
  by `fetchTree`) + content `<Outlet/>`. Repurpose `List` as the `/` landing pane
  (welcome/overview + counts) since browsing now lives in the sidebar. Keep
  Home/Settings nav + theme toggle in header.
- **Acceptance:** Sidebar always visible with the full tree; `/` shows a landing
  pane; existing deep links (`/:category/*`) still load in the content pane.
- **Verify:** `bunx vp check` + `bunx vp test` green; agent-browser: navigate several
  skills via sidebar; deep-link a file directly.
- **Scope:** M · **Deps:** T A.2

### 🔶 Checkpoint A — ☑ Complete

Sidebar groups every category into folders/files with icons; single click opens;
active highlighting; deep links intact; keyboard-navigable. **Stop for review.**

---

## Phase B — File reading (frontmatter fix + themed prose)

### T B.1 — Frontmatter parser util

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/lib/frontmatter.ts`, `apps/web/src/lib/frontmatter.test.ts`
- **Do:** `parseFrontmatter(raw)` → `{ data: Record<string,string>, body: string }`.
  Detects a leading `---` fence, extracts simple `key: value` pairs, returns the
  remaining markdown as `body`. No-op (empty `data`, original `body`) when no fence.
- **Acceptance:** SKILL.md frontmatter parsed into keyed data with clean body;
  files without frontmatter (CLAUDE.md, plans, settings.json) pass through unchanged.
- **Verify:** `bunx vp test apps/web` — with-frontmatter and without-frontmatter cases.
- **Scope:** S · **Deps:** None

### T B.2 — `SkillHeader` + File page wiring

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/components/SkillHeader.tsx`, `apps/web/src/routes/File.tsx`
- **Do:** `File` parses frontmatter; when present, render `SkillHeader`
  (name→title, description→lead paragraph, `user-invocable`/`argument-hint`→chips)
  and pass only `body` to `MarkdownView`. Restyle the file card with tokens; keep
  a themed "Back to list" affordance.
- **Acceptance:** colorize/SKILL.md shows a proper title + description + chips
  (no stray `<hr>`, no one-line bold blob); non-skill files render as before.
- **Verify:** `bunx vp check` green; agent-browser: colorize SKILL.md renders header
  correctly; CLAUDE.md still renders normally.
- **Scope:** M · **Deps:** T B.1

### T B.3 — Dark-aware MarkdownView + code

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/components/MarkdownView.tsx`, `apps/web/src/lib/markdown.ts`, `apps/web/src/components/MarkdownView.test.tsx`
- **Do:** Migrate prose element styles to tokens (headings, p, lists, tables,
  blockquote, links, inline code). Load `github-dark` alongside `github-light` in
  Shiki and pick by active theme (or dual-theme CSS-vars); keep the fallback `<pre>`.
- **Acceptance:** Markdown + syntax-highlighted code are readable in light **and**
  dark; tables/task-lists/blockquotes styled consistently.
- **Verify:** `bunx vp test` (existing MarkdownView test still passes + code-block
  renders); agent-browser: a code-heavy file (CLAUDE.md) in both themes.
- **Scope:** M · **Deps:** T B.2, T0.1

### 🔶 Checkpoint B — ☑ Complete

SKILL.md shows title/description/chips (bug #5 fixed); prose + code readable in
both themes. **Stop for review.**

---

## Phase C — Settings (grouped, navigable)

### T C.1 — Add `group` to schema field metadata

- ☑ **Impl** · ☑ **Test**
- **Files:** `packages/schema/src/metadata.ts`, `packages/schema/src/index.test.ts`
- **Do:** Add a `group` label to each field's metadata (e.g. General, Permissions,
  Hooks, Status Line, Plugins & Marketplaces, MCP Servers, Auth & Env, Advanced).
  Export the ordered group list. Every key must map to exactly one group.
- **Acceptance:** Every schema field has a `group`; group order exported; no key
  ungrouped.
- **Verify:** `bunx vp test packages/schema` — assert every metadata entry has a
  known `group`.
- **Scope:** S · **Deps:** None

### T C.2 — Grouped Settings layout (sticky left section-nav)

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/routes/Settings.tsx`, `apps/web/src/components/SettingsForm.tsx`
- **Do:** Group fields by `group`; render a sticky left sub-nav of section names
  (scroll-to / active-section highlight) with sections on the right, each a short
  screen. Preserve react-hook-form + save flow across the grouped layout.
- **Acceptance:** Left nav lists sections; clicking scrolls to / activates a
  section; every key still present under its group; page no longer a single long scroll.
- **Verify:** `bunx vp check` + `bunx vp test` green; agent-browser: click through
  sections; confirm all keys reachable.
- **Scope:** M · **Deps:** T C.1, T0.3

### T C.3 — Theme + polish field renderers

- ☑ **Impl** · ☑ **Test**
- **Files:** `apps/web/src/components/field-renderers.tsx`, `apps/web/src/components/field-renderers.test.tsx`
- **Do:** Migrate every renderer (toggle, select, input, array, etc.) to tokens;
  consistent labels/description/error styling; correct focus states in both themes.
- **Acceptance:** Each control themed in light + dark; correct control per type
  preserved; inline errors legible; save/edit unaffected.
- **Verify:** `bunx vp test` (existing renderer tests pass); agent-browser: edit a
  value + save in dark mode.
- **Scope:** M · **Deps:** T C.2

### 🔶 Checkpoint C — ☑ Complete

Settings has a section nav; each section is a short screen; every key present;
edit + save works. (Bug #6 addressed.) **Stop for review.**

---

## Phase D — Delight & harden

### T D.1 — Micro-interactions pass

- ☐ **Impl** · ☐ **Test**
- **Files:** `apps/web/src/index.css`, `FileTree.tsx`, `ThemeToggle.tsx`, `List.tsx`/cards, `field-renderers.tsx` (transitions only)
- **Do:** Add purposeful transitions — tree expand/collapse, hover/active on
  tree items + cards + buttons, theme-toggle icon crossfade, focus-visible rings,
  loading skeletons for tree/file/settings fetches, save-success feedback. Run the
  **micro-interactions** skill for guidance. All motion gated by
  `prefers-reduced-motion`.
- **Acceptance:** Interactions feel responsive; no janky/gratuitous motion;
  everything still fully usable with reduced-motion enabled.
- **Verify:** `bunx vp check` green; agent-browser: hover/expand/toggle feel smooth;
  with OS reduce-motion, animations are suppressed but states still change.
- **Scope:** M · **Deps:** Phases A–C complete

### T D.2 — Responsive + accessibility audit

- ☐ **Impl** · ☐ **Test**
- **Files:** `Layout.tsx` (responsive sidebar/drawer), plus targeted fixes surfaced by the audit
- **Do:** Make the sidebar collapse to a drawer/toggle on small screens; verify
  content reflows. Run the **audit** skill: contrast (both themes), focus order,
  ARIA on tree/toggle/nav, tap targets. Fix P0/P1 findings.
- **Acceptance:** Usable from mobile width up; no P0/P1 a11y issues; tree + toggle
  keyboard + screen-reader operable.
- **Verify:** `bunx vp check` + `bunx vp test` green; agent-browser at mobile +
  desktop widths in both themes; audit report shows no P0/P1.
- **Scope:** M · **Deps:** T D.1

### 🔶 Checkpoint D — Release gate

All five success criteria pass (themed light+dark toggle · tree sidebar
navigation · skill-header bug fixed · settings grouped/navigable · tasteful
reduced-motion-safe micro-interactions); responsive to mobile; `bunx vp check` +
`bunx vp test` green; visual verification captured in both themes.
**Stop for final review.**

---

## Command Reference

| Action            | Command                              |
| ----------------- | ------------------------------------ |
| Install           | `bun install`                        |
| Dev (web + cli)   | `bun run dev`                        |
| Type + lint + fmt | `bunx vp check` (`--fix` to autofix) |
| Test              | `bunx vp test`                       |
| Visual check      | agent-browser skill (both themes)    |
