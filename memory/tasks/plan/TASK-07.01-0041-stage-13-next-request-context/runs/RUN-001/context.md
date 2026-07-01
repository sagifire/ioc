# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/task.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Request context is the explicit bridge between framework request/action data and core
scope-local values. It should make later route/action helpers small instead of forcing
them to invent separate scope input formats.

## Relevant Technical Context

- `runtime.createScope()` and `runtime.withScope()` already support scope-local values.
- Core exposes `scopeValue()` and `scopeMultiValue()` helpers.
- Stage 13 planning forbids hidden request service locators and filesystem discovery.
- `@sagifire/ioc-next` may use `@sagifire/ioc` public APIs, but core must not import
  adapter APIs.

## Files / Modules to Inspect

- `packages/ioc-next/src/index.ts`
- `packages/ioc-next/test/`
- `packages/ioc/src/scope.ts` or equivalent scope implementation file
- `packages/ioc/src/container.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc-next/README.md`
- `docs/next-integration.md`
- `test/package-exports.test.ts`

## Known Risks

- Duplicating scope-local validation in adapter code instead of delegating to core.
- Introducing implicit current request state that turns the adapter into a service locator.
- Overfitting the API to one Next.js request type before route/action helpers exist.

## Assumptions

- The helper should accept explicit token/value declarations and produce scope options or
  an object consumed by later route/action helpers.
- If a hard Next.js type import becomes necessary, document why it is required and keep it
  outside `@sagifire/ioc`.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
