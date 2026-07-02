# TASK-07.02-0066: Stage 16 sync factory Promise guard

Status: done
Type: bugfix
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Закрити audit finding `H-001` до фіксації version `0.0.1`: `runtime.get()` не має
непомітно повертати Promise з sync `toFactory()` у JavaScript/untyped misuse path без
явної продуктово-технічної політики.

## Product Context

Після review `TASK-07.02-0063` прийнято, що `H-001` має бути закритий до `0.0.1`. Це
окрема pre-`0.0.1` blocker task; version handoff не стартує, доки ця задача не буде
завершена або явно reclassified with rationale під час task-level review.

## Scope

- Прочитати audit finding `H-001` у `RSCH-001`.
- Прийняти явну політику для thenable/Promise result із sync `toFactory()`.
- Виправити root cause згідно з обраною політикою:
  - runtime guard із typed diagnostic-friendly error; або
  - явно задокументована і review-approved policy, якщо guard відхиляється.
- Додати або оновити runtime/type tests для обраної поведінки.
- Оновити docs тільки там, де це потрібно для public sync/async contract.
- Запустити relevant verification commands where practical.
- У `RUN-001/result.md` зафіксувати closure mapping для `H-001`.

## Out of Scope

- Змінювати package versions/changelogs.
- Виконувати actual npm publish.
- Міняти async provider API поза межами sync factory Promise policy.
- Ламати легітимний `toValue()` для token value, який сам є Promise, без окремого
  обґрунтованого API-рішення.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `H-001` має closure mapping у task result.
- [x] Public policy для sync `toFactory()` returning Promise зафіксована в коді/tests/docs
      або явно reclassified with rationale.
- [x] Якщо обрано runtime guard, `runtime.get()` і пов'язані sync resolution paths не
      повертають Promise із sync factory misuse, а кидають typed diagnostic-friendly error.
- [x] Поведінка покрита focused runtime tests, включно з JavaScript/untyped-like misuse.
- [x] Sync/async contract у public docs не суперечить фактичній поведінці.
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
  - Purpose: Autonomous implementation run for closing `H-001`.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
