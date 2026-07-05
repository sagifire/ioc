# TASK-07.05-0082: Child scope runtime semantics

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Реалізувати child scope resolution semantics: inherited values, overrides, multi-value merge
and separate scoped provider cache.

## Phase

Phase 4: Child / derived scopes.

## Scope

- Child scope inherits parent scope-local single values unless overridden.
- Child scope inherits parent scope-local multi values and appends child multi values after
  parent values.
- Child scope can override values through `CreateScopeOptions` equivalent.
- Child scope has its own scoped provider cache.
- Child scope must not reuse parent scoped provider instances by default.
- Factories resolved through child scope see child values and overrides.
- Add regression tests for transaction/preview/impersonation-like overrides without adding
  those domain concepts to core.

## Rationale

Reusing parent scoped instances can accidentally keep services that already captured old
values such as `DB_SESSION`, `CURRENT_USER`, `TENANT_ID`, `LOCALE` or `PREVIEW_MODE`.

## Out Of Scope

- Domain-specific UnitOfWork, transaction, preview, tenant or impersonation APIs.
- Next.js-specific lifecycle helpers.
- Testing package helpers.
- Docs/examples expansion.

## Acceptance Criteria

- [x] Child scope resolves inherited parent values.
- [x] Child overrides shadow parent values.
- [x] Child multi values append after parent multi values.
- [x] Child scoped provider cache is separate from parent cache.
- [x] Parent scoped provider instances are not reused by child by default.
- [x] Async disposal and resource behavior remain deterministic.
- [x] Existing scope behavior remains backward compatible.

## Dependencies

- Depends on `TASK-07.05-0081`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
