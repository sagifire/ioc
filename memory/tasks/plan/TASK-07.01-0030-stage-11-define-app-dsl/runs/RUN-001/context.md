# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/task.md`
- `memory/tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`defineApp()` should be the ergonomic application composition layer, but the canonical
graph behavior remains composer behavior.

## Relevant Technical Context

- `createComposer()`, `composer.use()`, `composer.bind()`, `composer.validate()`,
  `composer.inspect()`, `composer.getGraph()` and `composer.compose()` are already
  implemented.
- Stage 10 graph metadata and cycle diagnostics must remain visible for DSL-generated
  configuration.
- `TASK-07.01-0029` should define the module DSL API available to this run.

## Files / Modules to Inspect

- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/composer.test.ts`
- DSL tests added by `TASK-07.01-0029`
- `test/package-exports.test.ts`
- `docs/composer.md`
- `docs/modules.md`
- `packages/ioc/README.md`

## Known Risks

- Accidentally creating a second composer abstraction with subtly different semantics.
- Hiding graph validation behind auto-compose behavior.
- Making app DSL stateful globally.
- Building too much binding/adapt ergonomics before conversion semantics are stable.

## Assumptions

- Prefer a small app definition object with explicit conversion/compose methods over a
  global registry.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
