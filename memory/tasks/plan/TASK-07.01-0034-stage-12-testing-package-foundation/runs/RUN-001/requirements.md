# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 12 `@sagifire/ioc-testing` package foundation and isolated test runtime
helper.

## Clarified Requirements

- Implement only the first testing package foundation.
- Keep helpers in `@sagifire/ioc-testing`.
- Reuse `@sagifire/ioc` public APIs; do not duplicate core resolution logic.
- Create fresh configuration/runtime per helper call.
- Do not mutate frozen production runtime.
- Preserve tree-shaking friendly package exports.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc-testing/src/index.ts`.
- `packages/ioc-testing/README.md` if needed.
- Tests under `packages/ioc-testing/test/` or existing workspace test conventions.
- `test/package-exports.test.ts`.
- Minimal docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Override declarations.
- Test composer helper.
- Fake modules and module harnesses.
- Graph or diagnostic assertions.
- Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Testing package foundation is implemented.
- [ ] Isolated test runtime helper creates fresh runtime per call.
- [ ] Helper does not mutate existing frozen runtimes.
- [ ] Runtime tests cover helper behavior.
- [ ] Type assertions cover helper inference.
- [ ] Package export smoke tests cover `@sagifire/ioc-testing`.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
