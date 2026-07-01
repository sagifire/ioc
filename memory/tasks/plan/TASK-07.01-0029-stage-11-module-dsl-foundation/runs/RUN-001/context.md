# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 11 starts DSL. The first task must make module declarations more ergonomic while
preserving explicit graph metadata and object API usability.

## Relevant Technical Context

- `packages/ioc/src/dsl.ts` is currently a Stage 2 placeholder.
- `@sagifire/ioc/dsl` subpath export already exists.
- `defineModule()` is the existing canonical module object API.
- Composer validation, inspection and module graph behavior already exist and should be
  reused.

## Files / Modules to Inspect

- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/composer.test.ts`
- `test/package-exports.test.ts`
- `docs/composer.md`
- `docs/modules.md`
- `packages/ioc/README.md`

## Known Risks

- Creating a second module model instead of a thin layer over `defineModule()`.
- Hiding required ports/capabilities behind DSL shorthand.
- Weakening type inference for module setup context.
- Accidentally adding Stage 11 app-level DSL before module DSL is stable.

## Assumptions

- If the exact `module()` builder shape is awkward during implementation, prefer the
  smallest stable API that converts cleanly to `defineModule()`.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
