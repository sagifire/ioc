# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/task.md`
- `memory/tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Module harnesses are for isolated module testing. They should make fake ports ergonomic
without bypassing composer validation or module visibility rules.

## Relevant Technical Context

- Modules are explicit `ModuleDefinition` values.
- Private providers are hidden by composed runtime.
- Required ports are consumer-owned and can be satisfied through capabilities or explicit
  bindings.
- Existing `composer.inspect()` / `runtime.inspect()` should remain the graph source.

## Files / Modules to Inspect

- `packages/ioc-testing/src/index.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/dsl.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/dsl.test.ts`
- `docs/testing.md`
- `docs/modules.md`

## Known Risks

- Building fake modules that are not real module definitions.
- Exposing module private providers through harness convenience APIs.
- Hiding required ports behind implicit fixture lookup.

## Assumptions

- Prefer helper output that can be inspected as normal composer graph metadata.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
