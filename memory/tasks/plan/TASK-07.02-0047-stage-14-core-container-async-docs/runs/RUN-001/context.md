# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0047-stage-14-core-container-async-docs/task.md`
- `memory/tasks/plan/TASK-07.02-0047-stage-14-core-container-async-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `docs/architecture.md`
- `docs/container.md`
- `docs/async-model.md`
- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/lifecycle.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/scope.test.ts`
- `packages/ioc/test/async-providers.test.ts`

## Known Risks

- Making `get()` sound async or optional.
- Omitting disposal ownership rules.
- Writing snippets that require Node-only APIs in core docs.
