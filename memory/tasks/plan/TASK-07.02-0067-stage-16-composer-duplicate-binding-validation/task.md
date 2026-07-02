# TASK-07.02-0067: Stage 16 composer duplicate binding validation

Status: backlog
Type: bugfix
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Закрити audit finding `H-002` до фіксації version `0.0.1`: `composer.validate()` має
діагностувати duplicate composer bindings before `compose()` reaches lower-level
container duplicate provider errors.

## Product Context

Після review `TASK-07.02-0063` прийнято, що `H-002` має бути закритий до `0.0.1`. Version
handoff не стартує, доки duplicate binding validation не буде виправлена або явно
reclassified with rationale під час task-level review.

## Scope

- Прочитати audit finding `H-002` у `RSCH-001`.
- Додати duplicate binding validation у composer validation path.
- Визначити або розширити typed diagnostic-friendly error/diagnostic contract.
- Переконатися, що `composer.validate()`, `composer.inspect().validation`,
  `composer.prepare()` і `composer.compose()` мають послідовну поведінку.
- Покрити DSL `defineApp()` duplicate binding path, якщо він проходить через той самий
  composer config.
- Додати або оновити runtime/type tests.
- Запустити relevant verification commands where practical.
- У `RUN-001/result.md` зафіксувати closure mapping для `H-002`.

## Out of Scope

- Змінювати package versions/changelogs.
- Виконувати actual npm publish.
- Міняти container duplicate provider semantics поза потребою composer validation.
- Робити broad composer refactor без прямої прив'язки до `H-002`.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `H-002` має closure mapping у task result.
- [ ] `composer.validate()` reports duplicate composer bindings for the same token.
- [ ] `composer.inspect().validation` reports the same validation issue.
- [ ] `composer.prepare()` and `composer.compose()` fail through composer validation, not
      only through lower-level `DuplicateProviderError`.
- [ ] DSL/app duplicate binding path is covered or explicitly documented as not applicable.
- [ ] Behavior changes are covered by tests.
- [ ] Relevant verification commands run where practical or limitations documented.
- [ ] Package versions remain unchanged.

## Linked Memory

- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.02-0062-stage-16-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Autonomous implementation run for closing `H-002`.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
