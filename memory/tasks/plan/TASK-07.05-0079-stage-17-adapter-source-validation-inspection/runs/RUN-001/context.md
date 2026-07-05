# RUN-001 Context

Task: `TASK-07.05-0079-stage-17-adapter-source-validation-inspection`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/tasks/plan/TASK-07.05-0078-stage-17-graph-aware-adapter-api/runs/RUN-001/result.md`.
- `memory/technical/rules.md`.

## Рішення, які треба зберегти

- Graph-aware adapter API лишається additive object API.
- Adapter `using()` не отримує generic resolver context.
- Adapter factory не виконується для validation, inspection або graph inference.
- Перший adapter validation slice підтримує single source capabilities only.
- Adapter-aware cycle detection не входить у цей run, але graph edge має бути доступний для
  наступної задачі.

## Межі run

Цей run додає source/target validation and inspection visibility for graph-aware adapters.
Він не змінює existing non-graph-aware factory bindings and does not implement `fromAll()`.
