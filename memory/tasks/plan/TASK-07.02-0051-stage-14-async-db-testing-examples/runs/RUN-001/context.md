# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0051-stage-14-async-db-testing-examples/task.md`
- `memory/tasks/plan/TASK-07.02-0051-stage-14-async-db-testing-examples/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `examples/`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/lifecycle.ts`
- `packages/ioc-testing/src/index.ts`
- `packages/ioc/test/async-providers.test.ts`
- `packages/ioc-testing/test/`
- `docs/async-model.md`
- `docs/testing.md`

## Known Risks

- Making the async example depend on an unavailable real database.
- Testing examples that replace public capabilities by patching runtimes.
- Overfitting examples to Vitest internals instead of public testing helpers.
