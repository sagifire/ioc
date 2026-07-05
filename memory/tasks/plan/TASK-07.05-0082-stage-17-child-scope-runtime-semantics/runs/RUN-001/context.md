# RUN-001 Context

Task: `TASK-07.05-0082-stage-17-child-scope-runtime-semantics`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/tasks/plan/TASK-07.05-0081-stage-17-child-scope-lifecycle-model/runs/RUN-001/result.md`.
- `memory/technical/rules.md`.

## Рішення, які треба зберегти

- Child scopes are explicit derived scopes.
- No hidden `AsyncLocalStorage`, global live scope registry or current scope API.
- Child disposal does not dispose parent.
- Parent owns active children locally and disposes them in reverse creation order.
- Child scope inherits parent scope values and can override them locally.
- Child scope has its own scoped provider cache and does not reuse parent scoped provider
  instances by default.

## Межі run

Цей run реалізує runtime resolution semantics only. Він не додає domain-specific scope
concepts, Next.js helpers, testing package helpers або docs/examples expansion.
