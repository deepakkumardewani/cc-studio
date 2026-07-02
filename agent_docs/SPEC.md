# Spec: Claude Config Tool (working name — see Open Questions)

> Phase 1 (SPECIFY) of spec-driven-development. Gated: PLAN and TASKS come **after** you review and approve this. Nothing gets built until this is signed off.

---

## Objective

A local, browser-rendered tool for reading and lightly editing the config a developer authors under `~/.claude`.

Today, viewing skills / plans / commands / `CLAUDE.md` means `cat`-ing files in the terminal — slow and unreadable. Editing `settings.json` means hunting valid keys in the Claude Code docs and hand-typing JSON. This tool fixes both.

**What it does**

1. **Reads** the five author-owned config types as beautiful, navigable markdown in the browser:
   - `~/.claude/skills`
   - `~/.claude/plans`
   - `~/.claude/commands`
   - `~/.claude/CLAUDE.md`
   - `~/.claude/settings.json` (rendered as a structured view, also editable — see below)
2. **Edits `settings.json` only**, through a schema-driven form (dropdowns, toggles, typed inputs, inline descriptions) that generates valid JSON and saves it back to disk. No key-hunting, no manual JSON.

**Who it's for**

- Primary: the author (daily reading; occasional settings edits).
- Secondary: open-source developers who live in `~/.claude` and feel the same friction. Distributed via `npx`.

**Why now**

Terminal reading is unreadable; hand-editing `settings.json` requires memorizing Claude Code's settings docs.

**What success looks like** — see Success Criteria.

---

## Tech Stack

Decided. Rationale kept to the non-obvious choices.

| Layer                        | Choice                                                                     | Why                                                                                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Toolchain**                | **Vite+ (`vp`)**                                                           | One tool = build (Vite 8/Rolldown) + test (Vitest) + lint (Oxlint) + format (Oxfmt) + library bundling (tsdown) + **monorepo task runner** (`vp run`). Collapses ~10 config files into one `vite.config.ts`. Scaffolded via the local `/viteplus` skill (see Project Structure). |
| **Package manager**          | **pnpm**                                                                   | Vite+ default; native workspace support for the monorepo.                                                                                                                                                                                                                        |
| **Monorepo**                 | **Vite+ workspace**                                                        | `vp create` scaffolds a monorepo with apps inside it. Shared schema package is the reason a monorepo beats two repos.                                                                                                                                                            |
| **Frontend**                 | **React 18 + TypeScript** (Vite+ SPA, no meta-framework)                   | Author's muscle memory. Next/Remix are overkill and awkward to ship inside a CLI.                                                                                                                                                                                                |
| **Styling**                  | **Tailwind CSS v4**                                                        | Muscle memory; first-class in Vite 8.                                                                                                                                                                                                                                            |
| **Routing**                  | **React Router**                                                           | Deep-linkable URLs per file (`/skills/:name`), so a specific skill is shareable/bookmarkable.                                                                                                                                                                                    |
| **Markdown**                 | **react-markdown + remark-gfm + Shiki**                                    | GFM gives tables/checklists/task-lists (skills use these). Shiki gives VS Code-grade syntax highlighting for code blocks inside skills/commands.                                                                                                                                 |
| **Settings form**            | **react-hook-form + zod resolver**, fields generated by walking the schema | Validation + state for free; schema-driven means new Claude Code settings appear in the form automatically without hand-editing field code.                                                                                                                                      |
| **Config schema**            | **Zod** (shared package)                                                   | Single source of truth: the form renders from it, the server validates writes against it. Authored from the live Claude Code settings docs.                                                                                                                                      |
| **Backend**                  | **Hono + TypeScript**                                                      | Tiny, fast, modern. Trivially embeddable later in a Tauri Mac app. Serves the built SPA as static files **and** exposes the scoped file API — one process, one command.                                                                                                          |
| **Static serving**           | **@hono/node-server** + `serveStatic`                                      | Serves `web/dist` (built once at publish time, never at runtime).                                                                                                                                                                                                                |
| **Browser launch**           | **`open`**                                                                 | Opens the localhost URL on startup.                                                                                                                                                                                                                                              |
| **CLI args**                 | **citty**                                                                  | Lightweight, modern arg parsing for `--port` / `--keep-alive`. Plain `process.argv` is an acceptable fallback.                                                                                                                                                                   |
| **Runtime deps (published)** | `hono`, `@hono/node-server`, `open`, `citty`                               | Everything else (React, Vite+, Tailwind, markdown libs) is compiled into `web/dist` and lives in **devDependencies**, keeping the `npx` download small.                                                                                                                          |
| **Distribution (MVP)**       | **npm**, run via `npx <tool>`                                              | Audience already has Node (Claude Code runs on it). One-shot by default: start server → open browser → exit on close. `--keep-alive` for the always-on crowd.                                                                                                                    |

**Explicitly deferred (not MVP):** Rust single-binary backend (v2 distribution + a real Rust learning project); Tauri Mac app (reuses the same frontend); live markdown reload.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (localhost)                                      │
│  React SPA: markdown reader + schema-driven settings form │
└───────────────┬──────────────────────────────────────────┘
                │  HTTP (localhost only)
┌───────────────▼──────────────────────────────────────────┐
│  Hono server (the npm bin)                                │
│  • serves web/dist (static, pre-built)                    │
│  • GET  /api/tree            → curated list of 5 types    │
│  • GET  /api/file            → raw markdown for a file    │
│  • GET  /api/settings        → parsed settings.json       │
│  • GET  /api/settings/schema → schema metadata for form   │
│  • PUT  /api/settings        → validate (zod) → write+bak │
└───────────────┬──────────────────────────────────────────┘
                │  scoped fs access (NEVER escapes ~/.claude)
┌───────────────▼──────────────────────────────────────────┐
│  ~/.claude/  (skills, plans, commands, CLAUDE.md,         │
│               settings.json)                               │
└───────────────────────────────────────────────────────────┘
```

**Hard rule:** every file path is resolved and asserted to live within `~/.claude`, and only the five known categories are reachable. No path traversal, no access to `cache`/`daemon`/`sessions`/`logs`/`db`. Reads are read-only; **the only writable target is `settings.json`.**

---

## Project Structure

> **Bootstrap instruction:** Scaffold the monorepo using the local **`/viteplus` skill** in `~/.claude/skills`. Do not hand-roll the Vite+ workspace, config, or package wiring — run the `/viteplus` skill to generate the project, then layer the structure below onto it.

```
<tool-name>/
├── vite.config.ts             → single Vite+ config (build, test, lint, fmt) [from /viteplus skill]
├── pnpm-workspace.yaml         → workspace + Vite+ overrides
├── package.json                → root; scripts delegate to vp
├── apps/
│   ├── web/                    → React SPA (the reader + settings form)
│   │   ├── src/
│   │   │   ├── routes/         → React Router views (list, file, settings)
│   │   │   ├── components/     → MarkdownView, FileTree, SettingsForm, field renderers
│   │   │   ├── lib/            → api client, markdown config (remark/shiki)
│   │   │   └── main.tsx
│   │   └── index.html
│   └── cli/                    → Hono server + bin (the published package)
│       ├── src/
│       │   ├── server.ts       → Hono app: static serving + /api routes
│       │   ├── routes/         → tree, file, settings handlers
│       │   ├── fs/             → scoped, traversal-safe file access for ~/.claude
│       │   └── bin.ts          → citty CLI: start server, open browser, exit-on-close
│       └── package.json        → name, bin, runtime deps only
├── packages/
│   └── schema/                 → shared Zod settings schema + metadata
│       └── src/index.ts        → source of truth for the settings form + write validation
└── docs/
    └── intent/                 → confirmed intent (from interview)
```

---

## Commands

> All via Vite+. The `/viteplus` skill sets these up; the table is the contract they must satisfy.

```
Scaffold:   (run the /viteplus skill once)
Install:    vp install
Dev:        vp dev          # runs web SPA + Hono server together (via vp run)
Type+lint+fmt: vp check     # vp check --fix to autofix
Test:       vp test
Build:      vp build        # builds web/dist, then bundles cli (tsdown) for publish
Run (local prod): npx <tool>            # one-shot: serve + open browser + exit on close
Run (persistent): npx <tool> --keep-alive
```

---

## Code Style

TypeScript throughout, strict. Oxfmt defaults (Prettier-compatible). One representative snippet — the scoped file access that all reads/writes go through:

```ts
// apps/cli/src/fs/scoped.ts
import { resolve, sep } from "node:path";
import { homedir } from "node:os";

const ROOT = resolve(homedir(), ".claude");

const CATEGORIES = {
  skills: resolve(ROOT, "skills"),
  plans: resolve(ROOT, "plans"),
  commands: resolve(ROOT, "commands"),
  claudeMd: resolve(ROOT, "CLAUDE.md"),
  settings: resolve(ROOT, "settings.json"),
} as const;

type Category = keyof typeof CATEGORIES;

/** Resolve a request to an absolute path, or throw if it escapes ~/.claude. */
export function safePath(category: Category, relative = ""): string {
  const base = CATEGORIES[category];
  const target = resolve(base, relative);
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error("path escapes category root");
  }
  return target;
}
```

Conventions: named exports over default (except React route components); `node:` protocol for builtins; no `any` (use `unknown` + narrowing); colocate component + its styles; API responses typed end-to-end via the shared schema package where applicable.

---

## Testing Strategy

Vitest (bundled in Vite+), run with `vp test`.

- **`packages/schema`** — unit tests: schema accepts valid `settings.json` shapes, rejects invalid ones (wrong type, unknown key handling), round-trips known-good configs.
- **`apps/cli`** — unit tests on `fs/scoped.ts`: path-traversal attempts throw; the five categories resolve; nothing outside `~/.claude` is reachable. Handler tests on `/api/*` against a temp fake `~/.claude` fixture dir.
- **`apps/web`** — component tests: MarkdownView renders GFM + code blocks; SettingsForm reflects schema (a toggle for a boolean key, a select for an enum key) and surfaces validation errors.
- **Coverage target:** the `fs/` scoping layer and the schema validation are the safety-critical surfaces → aim for ~100% there. UI components: pragmatic, not exhaustive.

---

## Boundaries

**Always**

- Resolve every path through the scoped accessor; assert it stays within `~/.claude`.
- Back up `settings.json` to `settings.json.bak` before every write; write atomically (temp file + rename).
- Validate against the Zod schema before writing.
- Keep the server bound to localhost.

**Ask first**

- Adding any runtime dependency (keep the `npx` footprint small).
- Making anything other than `settings.json` writable.
- Adding live-reload / file watching (deferred from MVP).
- Changing the published package name or bin.

**Never**

- Read or expose `cache`, `daemon`, `debug`, `downloads`, `file-history`, `jobs`, `paste-cache`, `sessions`, `shell-snapshots`, logs, or `*.db`.
- Write to skills / plans / commands / `CLAUDE.md` (read-only in MVP).
- Bind to `0.0.0.0` or any non-loopback interface.
- Run a build step on the user's machine at runtime (SPA is pre-built at publish time).
- Put file contents or paths in URL query strings beyond the minimal category + filename needed for routing.

---

## Success Criteria

Specific, testable:

1. `npx <tool>` starts in **< 1s** (no build on the critical path), opens the browser to a localhost page listing the five config types.
2. Clicking any skill / plan / command / `CLAUDE.md` renders it as styled markdown with working GFM tables, task lists, and syntax-highlighted code blocks — readable without scrolling through terminal noise.
3. Each file has a **deep-linkable URL** (e.g. `/skills/interview-me`) that loads that file directly.
4. The settings view shows **every** Claude Code setting from the schema with its name, description, and an appropriate control (toggle / select / input).
5. Editing a setting via the form and saving:
   - writes valid JSON to `~/.claude/settings.json`,
   - first creates/refreshes `settings.json.bak`,
   - rejects invalid values **before** writing (form shows the error),
   - never corrupts an existing valid file.
6. No request can read or write any path outside `~/.claude`, proven by a passing traversal test.
7. Closing the browser/terminal (default mode) shuts the server down cleanly; `--keep-alive` keeps it running for repeated visits.
8. The published package installs and runs on a clean machine with only Node present (no global Vite+ required by the end user).

---

## Open Questions

1. **Name.** Working title only. Note: using "claude" in the npm package name is a possible Anthropic trademark concern for an open-source release — worth picking a distinct name. Candidates to react to: `dotclaude`, `claudine`, `cc-studio`, `clade`, `forge`. Your call.
2. **Live markdown reload** — confirmed out of MVP. Want it in v1 after all? (cheap: chokidar + SSE)
3. **Settings form generator** — custom schema-walker (max control) vs. a helper like `@autoform/react` (faster, less control). Spec currently assumes **custom**.
4. **Shiki vs rehype-highlight** for code blocks — spec assumes Shiki (heavier bundle, better fidelity). Acceptable, or optimize bundle size with rehype-highlight?
5. **Vite+ is alpha.** Pinning matters (e.g. `vitest` override). The `/viteplus` skill presumably handles pins — confirm it pins versions so the scaffold is reproducible.

---

## Next Phases (gated — not started)

- **PLAN** — component/dependency order, what's built first, parallelizable vs. sequential, verification checkpoints.
- **TASKS** — discrete tasks, each ≤5 files, with acceptance + verify steps.
- **IMPLEMENT** — one task at a time.

→ Review this spec. **Yes / refine?** On approval I'll produce the PLAN.
