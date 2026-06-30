# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/task.md`
- `memory/tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Technical Context

- Existing container `ResolutionContext` has no module boundary; composer must enforce
  module boundaries in composer-owned wrappers.
- Container must remain unaware of modules.
- Composition bindings satisfy required ports but are not public runtime capabilities by
  default.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/test/*`

## Known Risks

- Passing raw container resolution context to module provider factories and thereby
  bypassing module boundaries.
- Treating private providers as exported capabilities.
- Creating a global module registry.
- Mixing Stage 10 dependency-edge cycle analysis into this task.

## Assumptions

- If low-level container APIs make strict runtime boundary enforcement impossible without a
  targeted extension, document the architectural constraint and keep the extension scoped.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
