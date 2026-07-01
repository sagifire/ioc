# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0052-stage-14-next-app-router-example-hardening/task.md`
- `memory/tasks/plan/TASK-07.02-0052-stage-14-next-app-router-example-hardening/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `examples/next-app-router/`
- `packages/ioc-next/src/index.ts`
- `packages/ioc-next/test/`
- `docs/next-integration.md`
- `test/package-boundaries.test.ts`

## Known Risks

- Turning the example into a partial real Next app that cannot be verified locally.
- Putting business logic in route/action files.
- Introducing hidden route scanning or request-local service locator semantics.
