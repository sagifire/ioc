# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0050-stage-14-basic-node-module-examples/task.md`
- `memory/tasks/plan/TASK-07.02-0050-stage-14-basic-node-module-examples/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Files / Modules to Inspect

- `examples/`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/composer.test.ts`
- `docs/container.md`
- `docs/modules.md`
- root `package.json`

## Known Risks

- Creating examples that only compile after publish instead of in workspace.
- Hiding module binding logic inside helper magic.
- Pulling in external dependencies for examples that can stay dependency-free.
