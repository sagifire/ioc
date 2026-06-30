# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-30

## Goal for This Run

Implement Stage 10 module-level cycle detection and diagnostics in `@sagifire/ioc`.

## Clarified Requirements

- Build on dependency edge metadata from `TASK-06.30-0025`.
- Detect module cycles over capability dependency edges.
- Add typed diagnostics with module ID path and token/capability path.
- Integrate diagnostics into validate, inspect, prepare and compose paths.
- Keep valid acyclic graphs working.
- Do not execute factories to infer dependencies.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- DSL helpers.
- Testing helpers or graph assertion APIs.
- Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] `composer.validate()` detects module cycles.
- [ ] Cycle diagnostics include module and token paths.
- [ ] `prepare()` and `compose()` reject cyclic graphs through typed validation errors.
- [ ] Acyclic graphs compose successfully.
- [ ] Binding-satisfied required ports do not create false module cycles.
- [ ] Existing provider cycle diagnostics still handle provider-level cycles.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
