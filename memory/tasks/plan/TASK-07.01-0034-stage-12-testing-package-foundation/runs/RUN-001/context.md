# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 12 starts `@sagifire/ioc-testing`. The first task should make the package useful
without starting override/composer/harness assertion APIs too early.

## Relevant Technical Context

- `packages/ioc-testing/src/index.ts` is currently a placeholder.
- `@sagifire/ioc-testing` already depends on `@sagifire/ioc`.
- `@sagifire/ioc-testing` package export already exists.
- Core container runtime APIs are implemented and should be reused.

## Files / Modules to Inspect

- `packages/ioc-testing/src/index.ts`
- `packages/ioc-testing/package.json`
- `packages/ioc-testing/README.md`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/index.ts`
- `test/package-exports.test.ts`
- `docs/testing.md`
- `README.md`

## Known Risks

- Accidentally implementing override semantics before the foundation API is stable.
- Creating a second container runtime instead of wrapping core public APIs.
- Mutating an existing frozen runtime to support test behavior.

## Assumptions

- If exact helper naming is awkward during implementation, prefer the smallest stable API
  that preserves isolation and document the naming decision in `result.md`.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
