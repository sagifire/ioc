# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-30

## Goal for This Run

Implement Stage 9 module definition object API foundation in `@sagifire/ioc`.

## Clarified Requirements

- Implement only module definition foundation.
- Keep core runtime-agnostic and free of Node-only APIs, Next.js, React, decorators and
  `reflect-metadata`.
- Add `defineModule()` and public module definition types.
- Normalize dependency defaults.
- Add typed diagnostics for invalid module definitions.
- Preserve tree-shaking friendly subpath exports.
- Add runtime tests, type assertions and package export smoke tests.
- Do not implement composer runtime or graph validation beyond local module definition
  validation.

## Scope for This Run

- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- `createComposer()`.
- Composer builder, bindings, validation, compose and inspection APIs.
- Module setup execution.
- Private provider isolation.
- Runtime capability registry.
- Module cycle detection.
- DSL, testing helpers and Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] `defineModule()` is exported.
- [ ] Module definition types are exported.
- [ ] Dependency default normalization is implemented.
- [ ] Invalid/ambiguous module definitions produce typed diagnostics.
- [ ] Returned definitions are immutable.
- [ ] Tests and type assertions cover the public API.
- [ ] Stage guard checks confirm out-of-scope APIs were not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
