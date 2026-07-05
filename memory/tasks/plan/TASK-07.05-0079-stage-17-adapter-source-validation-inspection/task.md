# TASK-07.05-0079: Adapter source validation and inspection

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Зробити graph-aware adapters observable and validated: target/source declarations мають
перевірятися без execution factories, а graph має показувати adapter-source edges.

## Phase

Phase 3: Graph-aware adapters.

## Scope

- Validate adapter target:
  - target token має бути required port / external dependency token;
  - arbitrary hidden target tokens are invalid.
- Validate adapter sources:
  - source token має бути public capability або explicit valid composition-level source;
  - source token must not be module-private provider;
  - first slice supports single source capabilities only;
  - multi source token without explicit future `fromAll()` support is invalid;
  - source must be provided by module or explicitly bound in composition.
- Add graph edge kind for adapter source.
- Expose adapter target, source tokens and source provider info through public inspection.
- Keep validation non-executing.
- Add diagnostic tests for missing, private, cardinality mismatch and invalid target cases.

## Diagnostic Codes

- `SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING`.
- `SAGIFIRE_IOC_ADAPTER_SOURCE_PRIVATE`.
- `SAGIFIRE_IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH`.
- `SAGIFIRE_IOC_ADAPTER_TARGET_INVALID`.

## Non-goal

Adapter-aware cycle detection is explicitly out of scope for this first adapter validation
slice. The graph edge must still be present so the next task can use it.

## Out Of Scope

- Adapter-aware cycle detection.
- Multi-source `fromAll()`.
- Deprecated warnings for low-level `bind().toFactory()`.
- DSL migration docs.

## Acceptance Criteria

- [ ] Adapter target validation catches invalid target tokens.
- [ ] Missing adapter source produces deterministic diagnostic.
- [ ] Private provider source is rejected.
- [ ] Multi source token is rejected in first slice unless explicit support is added.
- [ ] Adapter factory is not executed during validation or inspection.
- [ ] Graph inspection exposes adapter-source edges.
- [ ] Existing non-graph-aware bindings keep current behavior.

## Dependencies

- Depends on `TASK-07.05-0078`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
