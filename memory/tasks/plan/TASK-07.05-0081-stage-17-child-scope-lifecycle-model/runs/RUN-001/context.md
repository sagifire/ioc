# RUN-001 Context

Task: `TASK-07.05-0081-stage-17-child-scope-lifecycle-model`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/technical/rules.md`.

## Рішення, які треба зберегти

- Child scopes are explicit derived scopes.
- No hidden `AsyncLocalStorage`, global live scope registry or current scope API.
- Child disposal does not dispose parent.
- Parent owns active children locally and disposes them in reverse creation order.
- Child scope runtime value inheritance and scoped cache isolation are intentionally
  deferred to `TASK-07.05-0082`.

## Межі run

Цей run додає lifecycle ownership API and disposal behavior only. Він не реалізує child
scope value inheritance, overrides, multi-value merge semantics, Next.js helpers або
documentation examples.
