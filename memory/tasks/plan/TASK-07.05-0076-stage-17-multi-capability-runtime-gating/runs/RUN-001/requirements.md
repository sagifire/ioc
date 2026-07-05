# Run Requirements: RUN-001

Status: completed
Agent Role: Implementation Agent
Execution Mode: autonomous-implementation
Created: 2026-07-05

## Goal for This Run

Реалізувати Phase 2 composed runtime public cardinality gating: public multi capabilities
мають резолвитись через `runtime.getAll(token)`, public single capabilities через
`runtime.get(token)`, а неправильний access path має падати typed errors.

## Clarified Requirements

- Public `multi` capability resolves through `ComposedRuntime.getAll(token)`.
- Public `multi` capability access through `ComposedRuntime.get(token)` fails with typed
  diagnostic-friendly error.
- Public `single` capability access through `ComposedRuntime.getAll(token)` fails with
  typed diagnostic-friendly error.
- Optional missing `multi` dependency returns `[]` only through valid `getAll(token)` path.
- Module-private multi providers remain inaccessible through composed runtime public access.
- Existing single capability behavior remains backward compatible.
- Multi contribution order remains deterministic by module registration order and setup
  registration order.
- `composer.add()` is not introduced in this run unless implementation proves it is needed
  for the acceptance criteria.

## Scope for This Run

- Core composed runtime public `get()` / `getAll()` gating.
- Dedicated `SAGIFIRE_IOC_*` diagnostics for public cardinality misuse.
- Focused Vitest coverage for runtime public behavior and regressions.
- Task result memory and status handoff to review.

## Out of Scope for This Run

- Public inspection provider node shape.
- Graph-aware adapter API.
- Adapter source validation or adapter-aware cycle diagnostics.
- `MultiToken` / `ContributionToken` ergonomics.
- DSL helper changes unless object API parity requires them.
- Documentation/examples expansion beyond task memory.

## Acceptance Criteria for This Run

- [x] Public multi capability resolves through `runtime.getAll(token)`.
- [x] `runtime.get(token)` for multi capability fails with typed error.
- [x] `runtime.getAll(token)` for single capability fails with typed error.
- [x] Multi contribution order is deterministic and tested.
- [x] Optional missing multi dependency returns `[]` through valid access path.
- [x] Module-private multi providers are not exposed through composed runtime.
- [x] Existing single capability behavior remains backward compatible.

## Changes from Previous Run

Не застосовується для RUN-001.
