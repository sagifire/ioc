# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/task.md`
- `memory/tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

This is the final Stage 11 task. Its job is to make the DSL coherent and reviewable, not to
start Stage 12 testing helpers or Stage 13 adapters.

## Relevant Technical Context

- Previous Stage 11 tasks should have implemented `module()`, `defineApp()`, bind helper
  DSL and `adapt()`.
- DSL must remain a conversion layer over explicit object/composer APIs.
- Existing inspection APIs are the source of truth for graph visibility.

## Files / Modules to Inspect

- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- DSL tests added by previous Stage 11 tasks
- `packages/ioc/test/composer.test.ts`
- `test/package-exports.test.ts`
- `docs/architecture.md`
- `docs/composer.md`
- `docs/modules.md`
- `packages/ioc/README.md`
- `README.md`

## Known Risks

- Treating docs sync as broad Stage 14 documentation.
- Leaving root or subpath exports inconsistent.
- Missing inspection parity between DSL and object API examples.
- Accidentally adding testing helpers or Next.js adapter behavior.

## Assumptions

- Keep docs minimal and accurate for Stage 11; comprehensive examples remain Stage 14.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
