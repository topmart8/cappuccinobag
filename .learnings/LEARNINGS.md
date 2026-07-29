# Environment notes

- The desktop shell did not expose `node`, `npm` or `gh` on its default PATH.
- Codex workspace dependencies provide Node.js 24 and pnpm 11; prepend the bundled Node directory when running project commands locally.
- The repository had no package lockfile and ignores pnpm lockfiles. GitHub Actions therefore use `npm install` rather than `npm ci`.
- The repository does not commit `.vercel/project.json`; Preview linkage must be verified through the GitHub/Vercel integration.

## [LRN-20260730-001] bundled-pnpm-run-policy

**Logged**: 2026-07-30T03:12:00+08:00
**Priority**: high
**Status**: resolved
**Area**: tests

### Summary

The bundled pnpm may run a dependency policy check before package scripts and fail even when `node_modules` is installed.

### Details

pnpm 11 ignored `package.json#pnpm.onlyBuiltDependencies` and requested interactive native-build approval. Direct local binaries and the bundled Node.js runtime remain deterministic and do not weaken the global policy.

### Rule for Future Runs

In this workspace, install once, then use bundled Node.js plus `node_modules/.bin` for tests, lint and build. Do not add a global allow-all build setting.

### Metadata

- Source: error
- Related files: `package.json`, `.learnings/ERRORS.md`
- Tags: pnpm, tests, native-builds
