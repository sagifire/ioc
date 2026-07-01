# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0043-stage-13-server-action-scope/task.md`
- `memory/tasks/plan/TASK-07.01-0043-stage-13-server-action-scope/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Server action integration is an operation boundary. It should reuse the same runtime and
scope lifecycle model as route handlers without pretending server actions have a route
request/response shape.

## Relevant Technical Context

- Cached runtime helper should already exist from `TASK-07.01-0040`.
- Request/context helper should already exist from `TASK-07.01-0041`.
- Route handler helper should already exist from `TASK-07.01-0042`, but this task should
  keep action semantics separate.
- Core `runtime.createScope()` / `scope.dispose()` own scope lifecycle.

## Files / Modules to Inspect

- `packages/ioc-next/src/index.ts`
- `packages/ioc-next/test/`
- `packages/ioc-next/README.md`
- `docs/next-integration.md`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/composer.ts`
- `test/package-exports.test.ts`
- `test/package-boundaries.test.ts`

## Known Risks

- Overloading route helper semantics for server actions and losing action argument
  inference.
- Leaking a scope when action callback throws.
- Adding implicit global action context.
- Creating docs that imply business logic belongs inside server actions.

## Assumptions

- The helper should accept explicit operation context values and return a function or
  wrapper suitable for server action style callbacks.
- Prefer structural action callback types unless a concrete Next.js type import is
  necessary and documented.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
