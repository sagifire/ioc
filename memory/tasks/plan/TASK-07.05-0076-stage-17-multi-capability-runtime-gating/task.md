# TASK-07.05-0076: Multi-capability runtime gating

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Зробити multi-capability semantics частиною composed runtime public surface: multi tokens
мають бути доступні через `getAll()`, single tokens через `get()`, а misuse має падати
typed errors.

## Phase

Phase 2: Multi-capability runtime and inspection.

## Scope

- Expose public multi capabilities through `ComposedRuntime.getAll()`.
- Block `ComposedRuntime.get()` for public multi tokens.
- Block `ComposedRuntime.getAll()` for public single tokens.
- Preserve container-level strict single/multi behavior while adding composed runtime public
  boundary awareness.
- Implement optional missing multi dependency behavior: `getAll(token)` returns `[]` where
  dependency is optional and no contributors exist.
- Preserve deterministic contribution order:
  - module registration order;
  - registration order inside module `setup()`;
  - composition-root additions after modules, if `composer.add()` is accepted in this task;
  - composition-root registration order.
- Decide whether `composer.add(token)` belongs in this task. If accepted, make it explicit,
  ordered and public-boundary-aware.

## Diagnostic Codes

- `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`.
- `SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN`.

Concrete names may be adjusted during implementation if the same meaning is preserved and
the `SAGIFIRE_IOC_*` namespace remains stable.

## Out Of Scope

- Inspection provider node shape.
- Graph-aware adapter API.
- `MultiToken` / `ContributionToken`.
- DSL helper changes unless needed for object API parity.

## Acceptance Criteria

- [ ] Public multi capability resolves through `runtime.getAll(token)`.
- [ ] `runtime.get(token)` for multi capability fails with typed error.
- [ ] `runtime.getAll(token)` for single capability fails with typed error.
- [ ] Multi contribution order is deterministic and tested.
- [ ] Optional missing multi dependency returns `[]` through valid access path.
- [ ] Module-private multi providers are not exposed through composed runtime.
- [ ] Existing single capability behavior remains backward compatible.

## Dependencies

- Depends on `TASK-07.05-0075`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
