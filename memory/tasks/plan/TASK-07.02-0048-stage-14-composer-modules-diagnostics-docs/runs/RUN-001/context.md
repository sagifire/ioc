# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0048-stage-14-composer-modules-diagnostics-docs/task.md`
- `memory/tasks/plan/TASK-07.02-0048-stage-14-composer-modules-diagnostics-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `docs/composer.md`
- `docs/modules.md`
- `docs/diagnostics.md`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/dsl.test.ts`
- `packages/ioc/test/diagnostics.test.ts`

## Known Risks

- Blurring required ports and public capabilities.
- Making DSL look like the only supported path.
- Exposing private provider internals in docs examples.
