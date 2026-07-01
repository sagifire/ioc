# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 11 `module()` DSL foundation in `@sagifire/ioc`.

## Clarified Requirements

- Implement only module-level DSL foundation.
- Keep DSL optional; object configuration with `defineModule()` must remain fully usable.
- Keep core runtime-agnostic and free of Node-only APIs, Next.js, React, decorators and
  `reflect-metadata`.
- Reuse existing module definition validation and composer compatibility.
- Preserve graph visibility: required ports and capabilities must remain explicit.
- Preserve tree-shaking friendly subpath exports.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc/src/dsl.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- `defineApp()`.
- `adapt()`.
- Composition-level bind helper DSL.
- Testing helpers and Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Module DSL entrypoint is implemented.
- [ ] DSL output works with existing composer APIs.
- [ ] Required ports and capabilities remain explicit.
- [ ] Object API remains fully usable without DSL.
- [ ] Runtime tests cover conversion and validation.
- [ ] Type assertions cover DSL inference.
- [ ] Package export smoke tests cover `@sagifire/ioc/dsl`.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
