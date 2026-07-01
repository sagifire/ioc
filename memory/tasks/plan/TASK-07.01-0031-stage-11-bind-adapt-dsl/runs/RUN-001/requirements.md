# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 11 bind helper DSL and `adapt()` for explicit composition adapters.

## Clarified Requirements

- Implement bind/adapt DSL only after app DSL conversion is available.
- Compile bind/adapt declarations to existing composer binding semantics.
- Keep adapter dependencies explicit in user code.
- Do not execute binding/adapter factories during validation or inspection.
- Preserve deterministic binding dependency edges and graph visibility.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc/src/dsl.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Testing helpers and graph assertion helpers.
- Next.js adapters.
- New hidden dependency inference model.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Bind helper DSL is implemented.
- [ ] `adapt()` is implemented.
- [ ] Bind/adapt declarations convert to composer bindings.
- [ ] Adapter type inference is covered.
- [ ] Validation/inspection remain side-effect free.
- [ ] Runtime graph behavior is tested.
- [ ] Package export smoke tests cover bind/adapt API.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
