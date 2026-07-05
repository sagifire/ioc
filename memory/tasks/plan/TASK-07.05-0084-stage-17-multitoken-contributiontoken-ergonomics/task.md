# TASK-07.05-0084: MultiToken / ContributionToken ergonomics

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Після стабілізації core cardinality semantics вирішити й реалізувати additive
`MultiToken` / `ContributionToken` helper API, якщо він реально покращує type-level
ergonomics без ускладнення ordinary `token()` use cases.

## Phase

Phase 5: Testing and API ergonomics.

## Scope

- Evaluate final core API after `TASK-07.05-0074` through `TASK-07.05-0083`.
- Decide whether to add:
  - `multiToken<T>()`;
  - `contributionToken<T>()`;
  - one of them;
  - or no helper if ordinary `token()` plus declaration cardinality is cleaner.
- If accepted, implement helpers additively.
- Preserve ordinary `token()` as fully usable for multi-capability use cases.
- Add type-level tests for accepted helper behavior.
- Avoid broad overload complexity that weakens JavaScript-friendly API.

## Out Of Scope

- Making `token()` unusable for multi capabilities.
- Breaking existing token identity semantics.
- Reworking core cardinality model.
- Adding runtime behavior that duplicates declaration metadata without clear benefit.

## Acceptance Criteria

- [x] Run result records explicit accept/defer/reject decision for helper API.
- [x] If implemented, helper is additive and backward compatible.
- [x] Ordinary `token()` still works for multi capabilities.
- [x] Type tests demonstrate intended compile-time signal.
- [x] Runtime identity remains token ID based and JavaScript-friendly.
- [x] API does not require decorators or metadata reflection.

## Dependencies

- Depends on `TASK-07.05-0083`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

- [RUN-001](runs/RUN-001/result.md)
