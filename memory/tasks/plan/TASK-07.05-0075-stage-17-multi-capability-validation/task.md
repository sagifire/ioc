# TASK-07.05-0075: Multi-capability validation

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Реалізувати validation rules для single/multi declaration model, включно з duplicate
single capabilities, cardinality conflicts, multi required-port satisfaction і mismatch
між declared cardinality та `bind()` / `add()` registrations.

## Phase

Phase 1: Multi-capability declaration foundation.

## Scope

- Static validation:
  - duplicate single capability token across modules -> error;
  - multiple multi capability declarations for same token -> valid if kind/cardinality
    compatible;
  - single/multi conflict for same token -> error;
  - required single port satisfied by multi capability -> error;
  - required multi port satisfied by single capability -> error;
  - required multi port with `required: true` needs at least one contributor/provider;
  - required multi port with `required: false` may have zero contributors.
- Post-setup validation:
  - declared multi capability must use `add()`;
  - declared single capability must use `bind()`;
  - setup registration mismatch produces dedicated `SAGIFIRE_IOC_*` diagnostic.
- Preserve deterministic validation order and readable formatted diagnostics.
- Add tests for mixed `provides`, `requires`, composer bindings and setup registrations.

## Diagnostic Codes

- `SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY`.
- `SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT`.
- `SAGIFIRE_IOC_REQUIRED_MULTI_CAPABILITY_MISSING`.
- `SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH`.
- `SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH`.

Concrete names may be adjusted during implementation if the same meaning is preserved and
the `SAGIFIRE_IOC_*` namespace remains stable.

## Out Of Scope

- Runtime public surface gating for `get()` / `getAll()`.
- Inspection provider list shape.
- Graph-aware adapter API.
- Adapter-aware cycle detection.
- Docs/examples expansion.

## Acceptance Criteria

- [ ] Duplicate single capability across modules fails with deterministic diagnostic.
- [ ] Multiple compatible multi providers for same token pass validation.
- [ ] Single/multi conflict fails across provides/requires/bindings/registrations where
      applicable.
- [ ] Required multi dependency with `required: true` fails when no contributor exists.
- [ ] Optional multi dependency with zero contributors is valid.
- [ ] Declared multi plus `bind()` fails after setup.
- [ ] Declared single plus `add()` fails after setup.
- [ ] Validation does not execute user factories for graph inference.
- [ ] Tests cover static and post-setup phases.

## Dependencies

- Depends on `TASK-07.05-0074`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
