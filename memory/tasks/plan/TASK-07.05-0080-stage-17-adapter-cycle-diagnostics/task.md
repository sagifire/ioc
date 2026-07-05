# TASK-07.05-0080: Adapter-aware cycle diagnostics

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Розширити module graph cycle diagnostics так, щоб cycle detection враховував
adapter-source edges, додані в першому adapter slice.

## Phase

Phase 3: Graph-aware adapters.

## Scope

- Define exact cycle graph semantics for:
  - capability edges;
  - binding edges;
  - adapter-source edges.
- Detect cycles that pass through adapter source relationships.
- Avoid over-rejecting valid composition-root adaptations.
- Add dedicated diagnostic details that show path, token IDs and edge kinds.
- Preserve deterministic cycle path order.
- Ensure validation still does not execute factories.

## Diagnostic Codes

- Reuse `SAGIFIRE_IOC_MODULE_CYCLE` with adapter edge details if sufficient; or
- Add `SAGIFIRE_IOC_ADAPTER_CYCLE` if a separate code gives clearer public behavior.

Concrete choice must be justified in run result.

## Out Of Scope

- Adding new adapter API surface.
- `fromAll()` or multi-source adapter support.
- Testing package helpers.
- Docs/examples expansion.

## Acceptance Criteria

- [ ] Adapter-source edges participate in cycle detection.
- [ ] Valid non-cyclic adapters continue to pass.
- [ ] Cycle diagnostics include adapter edge kinds.
- [ ] Diagnostics remain deterministic and readable.
- [ ] No factory execution is used for cycle detection.
- [ ] This task must be complete before `0.0.2` stabilization handoff.

## Dependencies

- Depends on `TASK-07.05-0079`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
