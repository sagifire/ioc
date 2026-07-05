# TASK-07.05-0085: DSL ergonomics hardening

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Оновити optional DSL після стабілізації object API так, щоб DSL лишався тонким шаром і не
приховував dependency graph.

## Phase

Phase 5: Testing and API ergonomics.

## Scope

- Add DSL support for accepted cardinality declarations if object API already stable.
- Decide whether graph-aware adapter DSL helper should be added now or deferred.
- Preserve existing DSL `adapt(token, factory)` behavior.
- If adding new adapter DSL shape, avoid naming confusion with existing helper and document
  migration path in task result.
- Ensure DSL compiles to object configuration and does not create separate graph model.
- Add type/runtime tests for DSL parity with object API.

## Out Of Scope

- Making DSL required.
- Replacing object API.
- Adding hidden graph inference or factory execution.
- Docs/examples full update; that belongs to `TASK-07.05-0086`.

## Acceptance Criteria

- [ ] DSL supports finalized `0.0.2` object API where accepted.
- [ ] Existing DSL users remain backward compatible.
- [ ] DSL does not hide dependency graph semantics.
- [ ] Object API remains fully usable without DSL.
- [ ] Tests cover parity and compatibility.

## Dependencies

- Depends on `TASK-07.05-0084`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
