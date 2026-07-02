# TASK-07.02-0064: Stage 16 critical fixes from audit

Status: backlog
Type: bugfix
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Закрити всі critical findings із Stage 16 codebase audit перед фіксацією version `0.0.1`.

## Product Context

Stage 16 audit має створити reviewable український report із findings. Ця task не
проводить повторний повний аудит; вона бере critical findings з audit report і виправляє
root causes, додаючи tests/verification для поведінкових змін.

## Scope

- Прочитати `TASK-07.02-0063` audit report.
- Скласти implementation checklist для всіх findings зі severity `critical`.
- Виправити root cause кожного critical finding.
- Додати або оновити tests для кожної поведінкової зміни.
- Запустити relevant verification commands, включно з `pnpm release:validate` if
  practical.
- У `RUN-001/result.md` зафіксувати closure mapping для кожного critical finding.
- За потреби створити follow-up tasks for non-critical findings, але не змішувати їх із
  critical closure без task-level потреби.

## Out of Scope

- Виправляти non-critical findings, якщо вони не блокують critical fix або final
  validation.
- Змінювати package versions/changelogs.
- Виконувати actual npm publish.
- Робити broad refactor без прямої прив'язки до critical finding.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Усі critical findings із audit report мають closure mapping.
- [ ] Кожен critical finding закритий code/docs/test fix або explicitly reclassified with
      rationale in task result.
- [ ] Поведінкові зміни покриті tests.
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` and release validation are
      run where practical or limitations are documented.
- [ ] Non-critical findings are not silently treated as closed.
- [ ] Package versions remain unchanged.

## Linked Memory

- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.02-0062-stage-16-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Autonomous implementation run for critical audit fixes.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
