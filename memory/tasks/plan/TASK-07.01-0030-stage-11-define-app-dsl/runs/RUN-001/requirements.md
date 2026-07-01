# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 11 `defineApp()` DSL and deterministic conversion to composer
configuration.

## Clarified Requirements

- Implement app-level DSL only after module DSL foundation is available.
- Keep app DSL optional and object API fully usable.
- Convert DSL declarations to existing composer APIs instead of creating a new runtime.
- Preserve graph visibility and diagnostics.
- Do not add global app registries, filesystem discovery, framework imports, decorators or
  `reflect-metadata`.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc/src/dsl.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Final bind helper DSL and `adapt()`.
- Testing helpers and Next.js adapters.
- Changing composer/runtime semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [x] App DSL entrypoint is implemented.
- [x] DSL converts to existing composer configuration.
- [x] Validation, inspection and compose behavior match composer semantics.
- [x] DSL/object API parity tests pass.
- [x] Type assertions cover app DSL inference.
- [x] Package export smoke tests cover app DSL API.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
