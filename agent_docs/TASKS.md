# Tasks: Claude Config Tool (cc-studio)

> Phase 3 (TASKS) of spec-driven development. Derived from [PLAN.md](./PLAN.md) and [SPEC.md](./SPEC.md).
> Rules: each task ≤ 5 files, has explicit acceptance + verify steps, and is a
> vertical slice where possible. **All commands use `bun` / `bunx` (never npm/pnpm/npx).**
> Execute one task at a time; do not start the next until the current one's verify passes.

Legend: ☐ todo · 🔶 checkpoint (human review gate)

---

## Phase 0 — Scaffold

### T0.1 — Scaffold Vite+ monorepo via /viteplus skill ✅

- [x] **Impl** · [x] **Test**
- **Files:** `vite.config.ts`, root `package.json`, `.gitignore`, `tsconfig.json` (generated)
- **Do:** Run the `/viteplus` skill to scaffold a Vite+ workspace named `cc-studio`
  with a React 18 + TS SPA app and shared-package support. Confirm Vite+ versions are pinned.
- **Acceptance:** ✅ Monorepo skeleton exists; single `vite.config.ts` drives build/test/lint/fmt.
- **Verify:** ✅ `bun install` completes clean; `bunx vp --version` prints a pinned version (`vp v0.2.1`).

### T0.2 — Convert toolchain to bun + three-package skeleton ✅

- [x] **Impl** · [x] **Test**
- **Files:** root `package.json` (bun workspaces), `apps/web/package.json`,
  `apps/cli/package.json`, `packages/schema/package.json`
- **Do:** Replace any pnpm workspace config with bun workspaces in root `package.json`
  (`"workspaces": ["apps/*", "packages/*"]`). Create empty `apps/web`, `apps/cli`,
  `packages/schema` packages. Root scripts delegate to `vp` (`"dev": "vp dev"`, etc.).
- **Acceptance:** ✅ `bun install` links all three workspaces; no pnpm/npm lockfiles remain.
- **Verify:** ✅ `bun install` clean; `bun pm ls` shows the 3 workspace packages; `bunx vp check` runs.

### 🔶 Checkpoint 0 ✅

✅ `bun install` clean · ✅ `bun run dev` boots web + cli together · ✅ `bunx vp check` green.
**Stop for review.**

---

## Phase 1 — Slice A: read a file end-to-end

### T1.1 — Scoped, traversal-safe fs accessor (security keystone) ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/cli/src/fs/scoped.ts`, `apps/cli/src/fs/scoped.test.ts`
- **Do:** Implement `safePath(category, relative)` per SPEC snippet (5 categories,
  resolve + assert stays within `~/.claude`). Add `listCategory` and `readFileText`
  helpers that route through `safePath`. No writes here.
- **Acceptance:** ✅ Only the 5 categories reachable; any `..` / absolute escape throws;
  `cache`/`sessions`/`*.db` etc. are unreachable.
- **Verify:** ✅ `bunx vp test apps/cli` — traversal attempts throw, 5 categories resolve, ~100% coverage on `scoped.ts`.

### T1.2 — Tree + file read API ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/cli/src/server.ts`, `apps/cli/src/routes/tree.ts`,
  `apps/cli/src/routes/file.ts`, `apps/cli/src/routes/tree.test.ts`
- **Do:** Hono app bound to localhost. `GET /api/tree` → curated list of the 5 types;
  `GET /api/file?category=&name=` → raw markdown via `fs/scoped`. Read-only.
- **Acceptance:** ✅ Endpoints return correct shapes; invalid category/path → 400/403, never a stack trace.
- **Verify:** ✅ Handler tests against a temp fake `~/.claude` fixture pass; manual `bun run dev` + hitting `/api/tree` returns the 5 types.

### T1.3 — Web shell, router, API client ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/web/src/main.tsx`, `apps/web/src/routes/Layout.tsx`,
  `apps/web/src/routes/List.tsx`, `apps/web/src/lib/api.ts`, `apps/web/index.html`
- **Do:** React Router with routes: `/` (list of 5 types), `/:category/:name` (file).
  Typed API client hitting `/api/tree` + `/api/file`. Tailwind v4 wired.
- **Acceptance:** ✅ Home lists the 5 config types from the live API; nav renders.
- **Verify:** ✅ `bun run dev`; browser home shows the 5 types; links route correctly.

### T1.4 — MarkdownView + file route (GFM + Shiki) ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/web/src/components/MarkdownView.tsx`,
  `apps/web/src/lib/markdown.ts`, `apps/web/src/routes/File.tsx`,
  `apps/web/src/components/MarkdownView.test.tsx`
- **Do:** react-markdown + remark-gfm + Shiki. `File.tsx` fetches by
  category+name and renders. Deep-linkable `/skills/:name`.
- **Acceptance:** ✅ Clicking a skill renders styled markdown with working GFM tables,
  task lists, and syntax-highlighted code blocks.
- **Verify:** ✅ Component test renders GFM table + code block; deep link `/skills/<name>` loads directly in browser.

### 🔶 Checkpoint 1 ✅

✅ Lists 5 types · ✅ renders a skill as GFM markdown · ✅ deep link works · ✅ traversal test green.
**Stop for review.** (SPEC Success Criteria 2, 3, 6)

---

## Phase 2 — Slice B: view settings

### T2.1 — Shared Zod settings schema + field metadata ✅

- [x] **Impl** · [x] **Test**
- **Files:** `packages/schema/src/index.ts`, `packages/schema/src/metadata.ts`,
  `packages/schema/src/index.test.ts`
- **Do:** Author Zod schema for Claude Code `settings.json` from the live settings docs.
  Attach per-field metadata (label, description, control type: toggle/select/input, enum options).
- **Acceptance:** ✅ Schema accepts known-good configs, rejects wrong types/invalid values, round-trips.
- **Verify:** ✅ `bunx vp test packages/schema` — valid accepted, invalid rejected, round-trip stable.

### T2.2 — Settings read API ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/cli/src/routes/settings.ts`, `apps/cli/src/routes/settings.test.ts`
- **Do:** `GET /api/settings` (parsed current settings.json via `fs/scoped`) and
  `GET /api/settings/schema` (schema metadata for the form). Depends on `packages/schema`.
- **Acceptance:** ✅ Returns parsed settings + schema metadata; missing file → sensible empty default.
- **Verify:** ✅ Handler tests against fake `~/.claude` fixture; `/api/settings/schema` lists every key.

### T2.3 — Settings view route (read-only) ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/web/src/routes/Settings.tsx`,
  `apps/web/src/components/field-renderers.tsx`
- **Do:** Fetch schema + values; render every setting with name, description, and the
  appropriate control (toggle/select/input) in read-only display mode.
- **Acceptance:** ✅ Every schema key shown with its control and description.
- **Verify:** ✅ `bun run dev` → `/settings` shows all keys; component test: boolean→toggle, enum→select.

### 🔶 Checkpoint 2 ✅

✅ Settings view shows **every** setting with name, description, control. (SPEC Success Criterion 4)
**Stop for review.**

---

## Phase 3 — Slice C: edit settings safely

### T3.1 — Settings form (react-hook-form + zod resolver) ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/web/src/components/SettingsForm.tsx`,
  `apps/web/src/routes/Settings.tsx` (upgrade to editable),
  `apps/web/src/components/SettingsForm.test.tsx`
- **Do:** Walk schema to generate fields; react-hook-form + zodResolver for
  state + validation; surface field-level errors inline; submit → `PUT /api/settings`.
- **Acceptance:** ✅ Form reflects schema; invalid input shows inline error and blocks submit.
- **Verify:** ✅ Component test: enum→select, boolean→toggle, invalid value surfaces error.

### T3.2 — Settings write API (validate → backup → atomic write) ✅

- [x] **Impl** · [x] **Test**
- **Files:** `apps/cli/src/routes/settings.ts` (add PUT),
  `apps/cli/src/fs/writeSettings.ts`, `apps/cli/src/fs/writeSettings.test.ts`
- **Do:** `PUT /api/settings` → zod-validate → write `settings.json.bak` → atomic
  write (temp file + rename) to `settings.json`. Only `settings.json` is writable.
- **Acceptance:** ✅ Valid write succeeds + refreshes `.bak`; invalid rejected **before** any write;
  a valid file is never corrupted; nothing else writable.
- **Verify:** ✅ Tests: invalid → 400 + no disk change; valid → `.bak` created then file updated
  atomically; traversal/other-target write attempts throw.

### 🔶 Checkpoint 3 ✅

✅ Edit + save writes valid JSON · refreshes `.bak` · rejects invalid pre-write · never corrupts. (SPEC Success Criterion 5)
**Stop for review.**

---

## Phase 4 — Slice D: ship

### T4.1 — CLI bin (citty): start, open browser, lifecycle

- **Files:** `apps/cli/src/bin.ts`, `apps/cli/src/static.ts`, `apps/cli/package.json` (bin field)
- **Do:** citty CLI with `--port` / `--keep-alive`. Serve `web/dist` via
  `@hono/node-server` + `serveStatic`. Open localhost URL with `open`. Default:
  exit-on-browser-close; `--keep-alive` stays running.
- **Acceptance:** `bunx vp build` then running the bin serves the SPA and opens the browser.
- **Verify:** Local run opens browser to the list page; closing → clean shutdown; `--keep-alive` persists.

### T4.2 — Build pipeline + clean-machine smoke test

- **Files:** root `package.json` (build script), `apps/cli/package.json`
  (files/prepublish), `apps/cli/tsdown.config.ts`
- **Do:** `bunx vp build` builds `web/dist` then bundles cli via tsdown. Ensure only
  runtime deps (`hono`, `@hono/node-server`, `open`, `citty`) are dependencies; the
  rest devDependencies. Verify published footprint.
- **Acceptance:** Package installs + runs on a clean machine with only Node/bun; no runtime build step.
- **Verify:** `bunx vp build` succeeds; `bun pack` tarball; install in a clean temp dir and `bunx <tool>`
  cold-starts in **< 1s** and opens the browser.

### 🔶 Checkpoint 4 — Release gate

All 8 SPEC Success Criteria pass (cold-start <1s, deep links, full settings view,
safe writes, traversal-proof, lifecycle, clean-machine install).
**Stop for final review + resolve package name (Open Question 1).**

---

## Command Reference (bun)

| Action            | Command                                      |
| ----------------- | -------------------------------------------- |
| Install           | `bun install`                                |
| Dev (web + cli)   | `bun run dev`                                |
| Type + lint + fmt | `bunx vp check` (`--fix` to autofix)         |
| Test              | `bunx vp test`                               |
| Build             | `bunx vp build`                              |
| Run local prod    | `bunx cc-studio` (`--keep-alive` to persist) |
