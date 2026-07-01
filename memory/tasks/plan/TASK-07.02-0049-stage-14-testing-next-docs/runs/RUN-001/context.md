# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0049-stage-14-testing-next-docs/task.md`
- `memory/tasks/plan/TASK-07.02-0049-stage-14-testing-next-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `docs/testing.md`
- `docs/next-integration.md`
- `packages/ioc-testing/src/index.ts`
- `packages/ioc-next/src/index.ts`
- `packages/ioc-testing/test/`
- `packages/ioc-next/test/`
- `examples/next-app-router/README.md`

## Known Risks

- Suggesting mutation of frozen production runtimes in tests.
- Creating hidden current request/action semantics in docs.
- Making Next.js dependency installation mandatory for simulated examples.
