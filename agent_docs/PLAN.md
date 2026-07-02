# Plan: Claude Config Tool (cc-studio)

> Phase 2 (PLAN) of spec-driven development. Derived from [SPEC.md](./SPEC.md).
> Companion task breakdown: [TASKS.md](./TASKS.md).

---

## Deviations from SPEC (approved by user)

- **Package manager: bun, not pnpm.** All install/run commands use `bun` / `bunx`.
  Bun workspaces replace pnpm workspaces. `npx <tool>` → `bunx <tool>`.
- Vite+ (`vp`) remains the toolchain; it is invoked via `bunx vp <cmd>` or
  `bun run <script>` (package.json scripts delegate to `vp`).

| Concern              | SPEC                                | This plan                             |
| -------------------- | ----------------------------------- | ------------------------------------- |
| Install              | `vp install` / `pnpm`               | `bun install`                         |
| Workspace            | `pnpm-workspace.yaml`               | bun workspaces in root `package.json` |
| Dev                  | `vp dev`                            | `bun run dev` → `vp dev`              |
| Check / test / build | `vp check` / `vp test` / `vp build` | `bunx vp check` / `test` / `build`    |
| Run published tool   | `npx <tool>`                        | `bunx <tool>`                         |

---

## Dependency Graph

```
packages/schema  ─────────────┐  (Zod settings schema: source of truth)
   ▲            ▲              │
   │            │              ▼
apps/cli        │        apps/web
 ├ fs/scoped ◄──┘ (safety-critical foundation)
 ├ routes/tree,file  ◄──────── web reader routes (consume API)
 ├ routes/settings (read+write, validates via schema)
 │                        ◄──── web settings form (renders from schema)
 └ bin.ts (citty)  ─────────── serves web/dist + starts everything
```

**Build order rationale**

1. **Scaffold first** — nothing exists until the Vite+ monorepo is generated.
2. **`fs/scoped` is the keystone** — every read/write flows through it and it is
   the security boundary. Build + fully test it before any route touches disk.
3. **`packages/schema` gates the settings half** — both the form and write
   validation render from it, so it precedes settings API and settings UI.
4. **Read path before write path** — reading is read-only and lower-risk; it
   proves the client/server/markdown pipeline before we introduce disk writes.
5. **`bin.ts` last** — it only wires together already-verified pieces.

---

## Vertical Slices (each task = one complete path, not a horizontal layer)

Work is sliced so every task delivers a user-observable capability end-to-end
(disk → API → browser), rather than "all backend then all frontend".

- **Slice A — See a file in the browser.** scoped fs → tree+file API → web
  shell → markdown reader route. Delivers: click a skill, read it rendered.
- **Slice B — See settings.** schema package → settings read API → settings
  view route. Delivers: every setting shown with its control (read-only).
- **Slice C — Edit a setting.** settings form (react-hook-form + zod) → write
  API (validate → backup → atomic write). Delivers: change + save, safely.
- **Slice D — Ship it.** citty bin (open browser, exit-on-close, keep-alive) →
  build pipeline → clean-machine smoke test.

---

## Phases & Checkpoints

### Phase 0 — Scaffold (Slice pre-req)

Run the `/viteplus` skill to generate the monorepo; convert to bun; create the
three-package skeleton (`apps/web`, `apps/cli`, `packages/schema`).
**Checkpoint 0:** `bun install` clean, `bunx vp dev` boots web + cli, `bunx vp check` green.

### Phase 1 — Slice A: read a file end-to-end

`fs/scoped` (fully tested) → `/api/tree` + `/api/file` → web shell + router →
MarkdownView (react-markdown + remark-gfm + Shiki) → list & file routes.
**Checkpoint 1:** Browser lists the 5 config types; clicking a skill renders it
as styled GFM markdown; deep link `/skills/:name` loads directly; traversal test passes.

### Phase 2 — Slice B: view settings

`packages/schema` (Zod + field metadata, unit-tested) → `/api/settings` +
`/api/settings/schema` → settings route rendering every key read-only.
**Checkpoint 2:** Settings view shows every schema key with name, description, control.

### Phase 3 — Slice C: edit settings safely

SettingsForm (react-hook-form + zod resolver, schema-walked fields) →
`PUT /api/settings` (zod validate → `.bak` → atomic temp+rename write).
**Checkpoint 3:** Edit + save writes valid JSON, refreshes `.bak`, rejects invalid
before writing, never corrupts a valid file. Write-path tests green.

### Phase 4 — Slice D: ship

`bin.ts` (citty: `--port`, `--keep-alive`, open browser, exit-on-close) →
`bunx vp build` (web/dist + tsdown cli bundle) → clean-machine `bunx <tool>` smoke test.
**Checkpoint 4 (release gate):** All 8 SPEC Success Criteria pass, incl.
`bunx <tool>` cold-start < 1s and clean-machine run with only Node/bun present.

---

## Verification Strategy (per SPEC Testing Strategy)

- `packages/schema`: unit tests — accepts valid shapes, rejects invalid, round-trips.
- `apps/cli`: `fs/scoped` ~100% (traversal throws, 5 categories resolve, nothing
  outside `~/.claude` reachable); `/api/*` handler tests against a temp fake `~/.claude`.
- `apps/web`: component tests — MarkdownView (GFM + code blocks), SettingsForm
  (boolean→toggle, enum→select, validation errors surfaced).
- Safety-critical surfaces (`fs/`, schema validation) gate every checkpoint.

---

## Open Questions carried from SPEC (resolve before/at the relevant phase)

1. **Package name** (`cc-studio` working title) — needed before Phase 4 publish.
2. Live reload — confirmed out of MVP.
3. Settings form generator — plan assumes **custom schema-walker**.
4. Code highlighting — plan assumes **Shiki**.
5. Vite+ is alpha — `/viteplus` skill must pin versions for reproducibility.

→ Review this plan. On approval, execute TASKS.md one task at a time.
