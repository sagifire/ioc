# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/task.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Route handler integration is a framework boundary. Business logic should remain in
modules/public APIs; route helpers should create scope, resolve public API and dispose
scope around handler execution.

## Relevant Technical Context

- Cached runtime helper should already exist from `TASK-07.01-0040`.
- Request context helper should already exist from `TASK-07.01-0041`.
- Core `runtime.createScope()` / `scope.dispose()` own scope lifecycle.
- Tests can simulate route handler invocation with Web `Request` / `Response` objects or
  structural request-like values.

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

- Leaking a scope when handler throws.
- Hiding route dependencies in a current-scope service locator.
- Hard-coding Next.js runtime types before the tests need them.
- Putting business logic into examples instead of showing boundary integration.

## Assumptions

- Prefer structural request/route context types unless a concrete Next.js type import is
  necessary and documented.
- The helper should remain small and compose the Stage 13 runtime/context helpers.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
