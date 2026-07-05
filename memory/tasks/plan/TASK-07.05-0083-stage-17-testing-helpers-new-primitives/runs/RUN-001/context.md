# RUN-001 Context

Task: `TASK-07.05-0083-stage-17-testing-helpers-new-primitives`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/tasks/plan/TASK-07.05-0082-stage-17-child-scope-runtime-semantics/runs/RUN-001/result.md`.
- `memory/technical/rules.md`.
- `memory/technical/testing.md`.

## Рішення, які треба зберегти

- Testing package не мутує frozen production runtime.
- Helpers читають public inspection output only.
- Multi-capability inspection exposes providers/contributors through public graph shape.
- Adapter source graph visibility is public inspection behavior.
- Child scope assertions мають працювати через public `createChildScope`, `withChildScope`,
  `get`, `getAll` and disposal APIs, not private state.
- Object configuration API лишається first-class path.

## Межі run

Цей run додає testing helpers and tests only. Він не додає `MultiToken` /
`ContributionToken`, не розширює Next.js adapter і не переписує core graph internals.
