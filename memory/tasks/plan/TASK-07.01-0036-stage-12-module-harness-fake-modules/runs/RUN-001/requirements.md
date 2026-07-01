# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 12 fake module helpers and module harness in `@sagifire/ioc-testing`.

## Clarified Requirements

- Build on testing package foundation and test composer helpers.
- Keep fake modules explicit and inspectable.
- Compose one module under test with fake required ports or support modules.
- Preserve module private provider isolation.
- Do not add hidden fixture discovery.
- Add runtime tests, type assertions and package export smoke updates where applicable.

## Scope for This Run

- `packages/ioc-testing/src/index.ts` and package-local helper modules if split.
- Tests under `packages/ioc-testing/test/` or existing workspace test conventions.
- `test/package-exports.test.ts` if public exports change.
- Minimal docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Graph assertion helpers.
- Diagnostic assertion helpers.
- Next.js adapters.
- Core composer/runtime semantic changes.
- Filesystem auto-discovery.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Fake module helper is implemented.
- [ ] Module harness composes a single module with fake required ports.
- [ ] Harness preserves private provider isolation.
- [ ] Harness graph remains inspectable.
- [ ] Runtime tests cover fake modules and harness behavior.
- [ ] Type assertions cover fake module/harness inference.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
