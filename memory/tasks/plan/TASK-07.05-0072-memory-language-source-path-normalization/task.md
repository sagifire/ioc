# TASK-07.05-0072: Нормалізація мови пам'яті й source path

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-05
Owner Role: Memory Maintenance Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Мета

Виправити невідповідність правилам Project Memory щодо української мови у загальних
документах пам'яті та двох останніх Stage 17 задачах, а також замінити старі посилання на
старий локальний download path новим canonical source path:

```text
memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md
```

## Контекст

Користувач переніс feature request file у Project Memory:

```text
memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md
```

Після Stage 17 у загальних документах і task artifacts лишились абсолютні локальні
download-посилання та змішані англомовно-українські формулювання.

## Scope

- Замінити старий абсолютний шлях feature request у загальних документах пам'яті й Stage
  17 task artifacts.
- Додати перенесений feature request file до `memory/sources/index.md`.
- Привести operational text у загальних документах пам'яті до української мови.
- Привести `TASK-07.04-0070` і `TASK-07.04-0071` task docs, worklog, fixation and research
  artifact до української мови там, де це не є API/source/status term.
- Оновити `memory/tasks/plan/index.md`, `memory/tasks/plan/progress.md` і `memory/state.md`
  для цієї maintenance task.

## Out Of Scope

- Редагувати вміст `memory/sources/SPEC.md`.
- Редагувати вміст `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`.
- Змінювати source code, package versions, changelogs, release workflows або package
  exports.
- Приймати будь-які `0.0.2` feature proposals як implementation scope.
- Масово переписувати історичні task artifacts поза двома останніми Stage 17 задачами.

## Acceptance Criteria

- [x] Старий локальний download path не лишається в `memory/`.
- [x] Новий шлях `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md` використовується
      в Stage 17 documents and general-level memory.
- [x] `memory/sources/index.md` містить перенесений feature request file.
- [x] Дві останні Stage 17 task folders приведені до української мови на operational text
      level.
- [x] General-level memory impact перевірений і зафіксований у `FIX-001`.
- [x] Задача переведена у `done` після explicit human review approval.

## Linked Memory

- `memory/state.md`
- `memory/README.md`
- `memory/index.md`
- `memory/agent-start.md`
- `memory/agents/rules.md`
- `memory/memory-rules.md`
- `memory/sources/index.md`
- `memory/product/vision.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/index.md`
- `memory/domain/glossary.md`
- `memory/domain/index.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/technical/specification-trace.md`
- `memory/technical/index.md`
- `memory/knowledge/package-index.md`
- `memory/tasks/plan/index.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.04-0070-stage-17-implementation-planning/`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Нормалізувати мову загальних документів пам'яті та Stage 17 artifacts і
    замінити source path.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-05
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

## Review History

- 2026-07-05: користувач повідомив, що в перелічених документах лишається забагато
  англомовних речень і задача в такому вигляді не може бути завершена.
- 2026-07-05: виконано rework для `memory/product/roadmap.md`,
  `memory/technical/architecture.md`, `memory/state.md`, `memory/technical/stack.md`,
  `memory/technical/testing.md`, `memory/technical/rules.md`,
  `TASK-07.04-0070/.../fixations/FIX-001.md` і
  `TASK-07.04-0071/.../research/RSCH-001.md`; задачу повернуто в `review`.
- 2026-07-05: після додаткового scan прибрано залишкові довгі англомовні prose fragments
  у перелічених review files; технічні identifiers, package names, API names і task IDs
  залишено як допустимі source/API terms.
- 2026-07-05: користувач підтвердив review і дозволив завершити задачу; статус змінено на
  `done`.

## Closure

Задача завершена після explicit human review approval на рівні задачі.
