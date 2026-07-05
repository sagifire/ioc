# TASK-07.04-0070: Stage 17 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-04
Owner Role: Stage 17 Planning Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Мета

Запустити Stage 17 як етап підготовки `0.0.2` після стабілізації `0.0.1`: створити
окрему research-задачу для аудиту attached feature request і зафіксувати, що
implementation work не стартує до review результатів audit.

## Продуктовий контекст

Stage 16 зафіксував publishable package versions на `0.0.1` і завершив stabilization
handoff. Actual npm publish лишається окремою зовнішньою дією і потребує explicit human
approval та GitHub/npm settings.

Користувач надав feature request file:

```text
memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md
```

Файл пропонує для `0.0.2` multi-capabilities, graph-aware adapters, child/derived scopes,
MultiToken helper, inspection/diagnostics improvements, testing helpers і docs/examples.

## Scope

- Зафіксувати Stage 17 як human-directed audit stage для feature request після `0.0.1`.
- Створити окрему research task для аудиту attached `0.0.2` feature request.
- Виконати audit task у тому самому operating step і підготувати `RSCH-001.md`.
- Оновити `memory/state.md`, `memory/product/requirements.md`,
  `memory/product/roadmap.md`, `memory/technical/rules.md`,
  `memory/technical/definition-of-done.md`, `memory/technical/specification-trace.md`,
  `memory/tasks/plan/progress.md` і `memory/tasks/plan/index.md`.
- Зафіксувати planning memory change через `FIX-001`.
- Перевести planning and audit tasks у `review`, а не `done`.

## Out Of Scope

- Реалізовувати будь-які `0.0.2` runtime, composer, DSL, testing, Next або docs features.
- Приймати всі feature request proposals як canonical implementation requirements без
  audit review.
- Змінювати package versions, changelogs, release workflows або npm publish state.
- Створювати new immutable source snapshot у `memory/sources/`.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 17 існує в roadmap/state як feature-request audit stage.
- [x] Stage 17 has a separate research audit task.
- [x] Audit task references attached feature request і required canonical context.
- [x] Audit task produces `RSCH-001.md`.
- [x] Audit scope covers project goals, philosophy, architecture, implementation risks і
      conflicts з existing functionality.
- [x] Feature proposals не прийняті як canonical implementation scope до review.
- [x] Planning task has `FIX-001`.
- [x] `progress.md` and `tasks/plan/index.md` include Stage 17 tasks.
- [x] Planning and audit tasks moved to `review`, not `done`.

## Linked Memory

- `memory/state.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/definition-of-done.md`
- `memory/technical/specification-trace.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/task.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає. Окрема research task:

- [TASK-07.04-0071-stage-17-feature-request-audit](../TASK-07.04-0071-stage-17-feature-request-audit/index.md)

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати запуск Stage 17 і створити feature-request audit task.

## Додатковий контекст

Після review цієї planning task і audit task наступним кроком має бути human decision:

- які пропозиції приймаються як implementation candidates;
- які пропозиції треба розбити на окремі Stage 17 implementation tasks;
- які пропозиції треба відкласти або змінити перед implementation planning.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-04
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачі."

## Closure

Задача завершена після human review approval на рівні задачі.
