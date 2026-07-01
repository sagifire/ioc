# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 12 graph and diagnostic assertion helpers in `@sagifire/ioc-testing`.

## Clarified Requirements

- Use public graph and diagnostics data only.
- Keep assertion messages deterministic and readable.
- Do not mutate inputs.
- Keep helpers usable in Vitest.
- Do not change core graph/diagnostic semantics.
- Add runtime tests, type assertions and package export smoke updates where applicable.

## Scope for This Run

- `packages/ioc-testing/src/index.ts` and package-local helper modules if split.
- Tests under `packages/ioc-testing/test/` or existing workspace test conventions.
- `test/package-exports.test.ts` if public exports change.
- Minimal docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Next.js adapter assertions.
- Runtime private internals.
- Hidden dependency inference.
- Core graph or diagnostics changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Graph assertion helpers are implemented.
- [ ] Diagnostic assertion helpers are implemented.
- [ ] Assertion failures are readable and deterministic.
- [ ] Helpers do not mutate inputs.
- [ ] Runtime tests cover assertion behavior.
- [ ] Type assertions cover assertion helper inputs.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
