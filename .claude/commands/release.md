---
description: Release claude-desk to npm (check, test, build, pack, publish)
---

Run the **claude-desk** npm release for this monorepo. Do **not** invent a separate release shell script — execute the steps below directly.

`/release` means **ship to npm**: validate, build, then `npm publish` from **`apps/cli` only**. Ask once for confirmation before the publish step if the user has not already clearly asked to publish.

## Preconditions

1. Confirm package identity from `apps/cli/package.json`:
   - `name` is `claude-desk`
   - `bin["claude-desk"]` is `./dist/bin.mjs`
   - `version` is not `0.0.0` (use a real semver, e.g. `0.1.0`)
   - package is not `private`
   - runtime `dependencies` are only: `hono`, `@hono/node-server`, `open`, `citty`
2. Sync license for the published tarball:
   - Canonical file: repo-root `LICENSE`
   - Copy it to `apps/cli/LICENSE` (npm `files` must include it)
3. Confirm `npm whoami` works. If not logged in, stop and tell the user to run `npm login`.
4. Remind (do not block): after publish, smoke with `npx claude-desk@latest` on a clean machine.

## Gate (must all pass, in order)

Run from the repo root. Prefer short-output commands; fix failures before continuing.

> [!IMPORTANT]
> Always run the **root** `bun run build` before publish. `apps/cli` `prepublishOnly` builds the CLI only — it does **not** rebuild the web SPA. Skipping the root build can publish a stale or missing `web/` tree.

1. **Format / lint / types**

   ```bash
   bunx vp check
   ```

   If formatting fails, run `bunx vp check --fix`, then re-run `bunx vp check`.

2. **Tests**

   ```bash
   bunx vp test
   ```

3. **Production build** (schema → web → CLI + SPA copy into `apps/cli/web`)

   ```bash
   bun run build
   ```

4. **Pack dry-run** (sanity-check the tarball before upload)

   ```bash
   cd apps/cli && npm pack --dry-run
   ```

   Verify tarball includes `dist/`, `web/`, `README.md`, `LICENSE`, and bin `claude-desk`.

## Publish

After the gate is green, publish **only** from `apps/cli`:

```bash
cd apps/cli && npm publish --access public
```

### Do not publish

- Root workspace (`private: true` / `cc-studio-workspace`)
- `apps/web` or `packages/schema` alone
- Source without a successful root `bun run build` in this run

## Post-publish

1. Tag and push (ask before pushing if not already authorized by the user for this release):

   ```bash
   git tag v<version> && git push --tags
   ```

2. Remind the user to smoke-test:

   ```bash
   npx claude-desk@latest --keep-alive
   ```

   Expect: browser opens to home; deep link / settings edit works; Ctrl+C exits.

## Output

Report a short checklist:

- [ ] package identity + runtime deps
- [ ] LICENSE synced
- [ ] `npm whoami`
- [ ] `vp check`
- [ ] `vp test`
- [ ] `bun run build`
- [ ] `npm pack --dry-run`
- [ ] `npm publish` (from `apps/cli`)
- [ ] tag reminder / smoke reminder

End with:

```text
Published claude-desk@<version>
Next: git tag v<version> && git push --tags
Smoke: npx claude-desk@latest --keep-alive
```

## Rules

- Never skip a failing step.
- Never use `--no-verify` / force publish flags.
- Never publish the root workspace, `apps/web`, or `packages/schema`.
- Do not commit or push unless the user explicitly asks (tags: ask unless this `/release` run already includes ship authorization).
