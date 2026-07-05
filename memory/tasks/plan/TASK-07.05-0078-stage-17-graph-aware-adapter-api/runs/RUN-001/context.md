# RUN-001 Context

Task: `TASK-07.05-0078-stage-17-graph-aware-adapter-api`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`.
- `memory/technical/rules.md`.

## Рішення, які треба зберегти

- Graph-aware adapter API є additive object API.
- Adapter source dependencies мають бути declared explicitly через `.from(...)`.
- Adapter `using()` не має generic resolver context.
- User adapter factories не виконуються для validation, inspection або graph inference.
- Existing `bind().toFactory()` and DSL `adapt(token, factory)` не ламаються.

## Межі run

Цей run реалізує API shape and metadata storage, але не закриває повний adapter validation
and adapter-aware cycle detection. Наступні задачі Phase 3 мають додати source validation,
inspection visibility and cycles.
