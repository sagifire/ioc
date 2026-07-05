# TASK-07.05-0081: Child scope lifecycle model

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Додати parent/child scope lifecycle model для explicit derived scopes without hidden
AsyncLocalStorage або global current scope.

## Phase

Phase 4: Child / derived scopes.

## Scope

- Add public child scope API:
  - `scope.createChildScope(options?)`;
  - `scope.withChildScope(options, callback)`.
- Define ownership policy:
  - disposing child does not dispose parent;
  - parent tracks active children locally;
  - parent disposal disposes active children in reverse creation order unless implementation
    review finds a stronger reason to reject parent disposal;
  - if policy changes, rationale must be recorded in run result.
- Ensure `withChildScope()` disposes child in `finally`.
- Reject child creation from disposed parent.
- Reject resolution from disposed child.
- Add disposal order and async failure-path tests.

## Out Of Scope

- Sharing parent scoped provider cache.
- Domain concepts such as transaction, tenant, preview or impersonation.
- Next.js-specific helpers.
- Documentation examples beyond minimal API reference.

## Acceptance Criteria

- [x] `createChildScope()` creates explicit child scope.
- [x] `withChildScope()` disposes child on success and failure.
- [x] Disposing child does not dispose parent.
- [x] Parent disposal handles active children according to documented policy.
- [x] Child creation from disposed parent fails with typed error.
- [x] Child resolution after disposal fails with typed error.
- [x] No global live scope registry is introduced.

## Dependencies

- Depends on `TASK-07.05-0080`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
