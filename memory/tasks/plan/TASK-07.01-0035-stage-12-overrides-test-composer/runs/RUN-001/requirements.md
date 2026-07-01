# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 12 override declarations and test composer helper in `@sagifire/ioc-testing`.

## Clarified Requirements

- Build on the testing package foundation.
- Keep overrides explicit and token-typed.
- Apply overrides before runtime freeze or composer compose.
- Do not mutate frozen production runtime.
- Reuse existing composer validation and inspection.
- Fail duplicate overrides deterministically.
- Add runtime tests, type assertions and package export smoke updates where applicable.

## Scope for This Run

- `packages/ioc-testing/src/index.ts` and any package-local helper modules if the package
  structure is split.
- Tests under `packages/ioc-testing/test/` or existing workspace test conventions.
- `test/package-exports.test.ts` if public exports change.
- Minimal docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Fake modules.
- Module harness.
- Graph and diagnostic assertions.
- Runtime monkey-patching.
- Core runtime semantic changes.
- Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Override declarations are implemented.
- [ ] Overrides apply before `freeze()` / `compose()`.
- [ ] Duplicate overrides fail deterministically.
- [ ] Test composer helper creates fresh composer configuration per call.
- [ ] Existing composer validation and graph inspection remain visible.
- [ ] Runtime tests cover override behavior.
- [ ] Type assertions cover override inference.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
