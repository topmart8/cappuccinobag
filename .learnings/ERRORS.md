# Errors

## [ERR-20260730-001] pnpm-ignored-native-builds

**Logged**: 2026-07-30T03:10:00+08:00
**Priority**: high
**Status**: resolved
**Area**: config

### Summary

The bundled pnpm refused every `pnpm run` because native dependency build scripts had not been explicitly approved.

### Error

```text
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: sharp@0.34.5, unrs-resolver@1.12.2
```

### Context

- Task attempted: run repository automation and tests
- Command/tool/API: bundled pnpm 11.9.0
- Inputs: package dependencies including Next.js and Sharp
- Environment: Codex desktop bundled Node.js 24 runtime on macOS

### Suspected Cause

The bundled pnpm enforces a supply-chain policy that requires an explicit `pnpm.onlyBuiltDependencies` project allowlist.

### Suggested Fix

Do not depend on `pnpm run` in this bundled environment. Use the installed local binaries with the bundled Node.js PATH. GitHub Actions use npm. Avoid adding an ignored `package.json#pnpm` setting.

### Metadata

- Reproducible: yes
- Related files: `package.json`
- Tags: pnpm, sharp, supply-chain, build

## [ERR-20260730-002] proxy-matcher-test-too-strict

**Logged**: 2026-07-30T03:16:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: tests

### Summary

An existing CRM test required the proxy matcher array to contain exactly two routes, so adding the protected SEO API route failed the otherwise-correct test.

### Error

```text
The input did not match the proxy matcher after /api/seo/:path* was added.
```

### Context

- Task attempted: run all repository tests
- Command/tool/API: Node test runner
- Inputs: `proxy.js` with `/api/seo/:path*`
- Environment: Node.js 24

### Suspected Cause

The assertion tested an exact implementation string instead of the expanded protected-route contract.

### Suggested Fix

Update the assertion to include the intentionally protected SEO API scope.

### Metadata

- Reproducible: yes
- Related files: `proxy.js`, `tests/crm.test.mjs`
- Tags: proxy, auth, tests, seo

## [ERR-20260730-003] react-effect-synchronous-state

**Logged**: 2026-07-30T03:20:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

Expanded linting found an existing synchronous state update inside the WhatsApp component effect.

### Error

```text
react-hooks/set-state-in-effect: Avoid calling setState() directly within an effect
```

### Context

- Task attempted: lint application, automation and shared components
- Command/tool/API: ESLint 9 with Next.js 16 core-web-vitals
- Inputs: `components/BrandWhatsAppButton.jsx`
- Environment: React 19.2.8

### Suspected Cause

The effect computed a DOM-dependent WhatsApp URL and synchronously placed it into React state.

### Suggested Fix

Keep the DOM-dependent calculation in the effect but update the anchor ref directly, avoiding an extra React render.

### Metadata

- Reproducible: yes
- Related files: `components/BrandWhatsAppButton.jsx`
- Tags: react, lint, effect, whatsapp

## [ERR-20260730-004] generic-keyword-page-mismatch

**Logged**: 2026-07-30T03:25:00+08:00
**Priority**: high
**Status**: resolved
**Area**: marketing

### Summary

The first keyword fixture mapped several product keywords to a cardholder page because generic commercial words dominated similarity.

### Error

```text
custom padel bag manufacturer -> /custom-cardholder-manufacturer/
```

### Context

- Task attempted: inspect the 10 generated test-keyword tasks
- Command/tool/API: local keyword pipeline
- Inputs: repository page inventory and high-intent manufacturing keywords
- Environment: deterministic draft generation

### Suspected Cause

Substring matching counted generic terms such as custom, bag and manufacturer, and returned the first passing page.

### Suggested Fix

Exclude generic commercial terms, tokenize URLs/titles/H1 exactly, require product-specific overlap and select the highest-scoring candidate.

### Metadata

- Reproducible: yes
- Related files: `automation/keywords/pipeline.js`, `tests/seo-automation.test.mjs`
- Tags: seo, keyword-map, cannibalization, relevance

## [ERR-20260730-005] final-gate-checker-false-positives

**Logged**: 2026-07-30T03:30:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary

Two ad-hoc final-gate checks failed because of a Ruby version mismatch and an over-broad auto-merge regex.

### Error

```text
Psych.load_file: unknown keyword aliases
Unsafe workflow action detected
```

### Context

- Task attempted: parse workflow YAML and detect unsafe workflow commands
- Command/tool/API: macOS Ruby 2.6 and a Node regex
- Inputs: seven workflow files with `CONTENT_AUTO_MERGE=false`
- Environment: macOS system Ruby

### Suspected Cause

Ruby 2.6 does not accept the newer `aliases:` keyword, and the regex matched the safe environment-variable name rather than an executable merge action.

### Suggested Fix

Use Ruby 2.6-compatible YAML parsing and search specifically for executable `git/gh merge`, auto-merge action keys, or `git push ... main`.

### Metadata

- Reproducible: yes
- Related files: `.github/workflows/*.yml`
- Tags: yaml, ruby, validation, false-positive

## [ERR-20260730-006] github-oauth-missing-workflow-scope

**Logged**: 2026-07-30T03:35:00+08:00
**Priority**: high
**Status**: pending
**Area**: infra

### Summary

GitHub rejected the feature-branch push because the HTTPS OAuth credential cannot modify workflow files.

### Error

```text
refusing to allow an OAuth App to create or update workflow `.github/workflows/analytics-review.yml` without `workflow` scope
```

### Context

- Task attempted: push `feature/cappuccino-seo-automation`
- Command/tool/API: `git push -u origin`
- Inputs: commit `93ba3ab` including seven approved workflow files
- Environment: HTTPS origin using an OAuth credential; GitHub CLI unavailable

### Suspected Cause

The cached OAuth application token has repository write access but lacks GitHub's workflow-update scope.

### Suggested Fix

Use an already-authorized SSH credential if available. Otherwise the user must refresh GitHub authorization with workflow permission before retrying.

### Metadata

- Reproducible: yes
- Related files: `.github/workflows/*.yml`
- Tags: github, oauth, workflow, push

## [ERR-20260730-007] github-cli-install-assumptions

**Logged**: 2026-07-30T22:45:53+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary

The GitHub CLI installation fallback failed because neither Homebrew nor a macOS tarball asset was available.

### Error

```text
zsh:1: command not found: brew
curl: (56) The requested URL returned error: 404
```

### Context

- Task attempted: install the missing GitHub CLI so the workflow-scope authorization can be refreshed
- Command/tool/API: Homebrew, then the official GitHub CLI release download
- Inputs: macOS arm64 environment and GitHub CLI v2.96.0
- Environment: Darwin arm64 with no Homebrew

### Suspected Cause

The environment does not include Homebrew, and current GitHub CLI macOS release assets are distributed as ZIP or PKG files rather than the assumed tarball.

### Suggested Fix

Inspect the official release asset list first, then install the macOS arm64 ZIP binary into a user-owned executable directory.

### Metadata

- Reproducible: yes
- Related files: `.learnings/ERRORS.md`
- Tags: github-cli, macos, homebrew, release-assets

## [ERR-20260731-008] github-device-code-network-timeout

**Logged**: 2026-07-31T00:40:25+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary

GitHub CLI timed out while requesting a fresh OAuth device code after the previous authorization request expired.

### Error

```text
Post "https://github.com/login/device/code": dial tcp 20.205.243.166:443: i/o timeout
```

### Context

- Task attempted: refresh the existing GitHub CLI token with the `workflow` scope
- Command/tool/API: `gh auth refresh -h github.com -s workflow`
- Inputs: authenticated `topmart8` GitHub CLI session
- Environment: macOS arm64 over the current network connection

### Suspected Cause

A transient network timeout occurred while connecting to GitHub's device-code endpoint.

### Suggested Fix

Retry the device-code request once; if it fails again, stop and wait for the network path to recover.

### Metadata

- Reproducible: unknown
- Related files: `.learnings/ERRORS.md`
- Tags: github, oauth, device-flow, network
