# TASK-07.02-0068: Stage 16 freeze failure retry policy

Status: done
Type: bugfix
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Закрити audit finding `M-001` до фіксації version `0.0.1`: failed eager async
initialization during `container.freeze()` має мати явну public policy і відповідну
реалізацію/tests/docs.

## Product Context

Після review `TASK-07.02-0063` прийнято, що `M-001` має бути закритий до `0.0.1`. Version
handoff не стартує, доки policy для failed `freeze()` не буде реалізована або явно
reclassified with rationale під час task-level review.

## Scope

- Прочитати audit finding `M-001` у `RSCH-001`.
- Прийняти явну policy для failed eager async initialization in `freeze()`:
  - retry після rejected `freeze()`; або
  - documented no-retry/terminal freeze attempt semantics.
- Виправити runtime behavior, якщо обрана policy потребує code change.
- Оновити docs для async/container behavior.
- Додати або оновити tests для eager async factory/resource failure path.
- Запустити relevant verification commands where practical.
- У `RUN-001/result.md` зафіксувати closure mapping для `M-001`.

## Out of Scope

- Змінювати package versions/changelogs.
- Виконувати actual npm publish.
- Міняти lazy async retry semantics, якщо це не потрібно для узгодження policy.
- Робити broad async/resource lifecycle refactor без прямої потреби.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `M-001` має closure mapping у task result.
- [x] Failed `freeze()` policy is explicit in runtime behavior and public docs.
- [x] If retry is supported, rejected `frozenRuntimePromise` handling allows a real retry
      without breaking immutability after successful freeze.
- [x] If retry is not supported, terminal failure semantics are documented and covered by
      tests. Not applicable: retry is supported and tested.
- [x] Eager async provider/resource failure path has focused tests.
- [x] Relevant verification commands run where practical or limitations documented.
- [x] Package versions remain unchanged.

## Linked Memory

- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.02-0062-stage-16-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for closing `M-001`.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
