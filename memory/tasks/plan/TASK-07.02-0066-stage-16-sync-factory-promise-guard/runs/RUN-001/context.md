# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/task.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/product/requirements.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

`@sagifire/ioc` is JavaScript-friendly and documents `runtime.get()` as synchronous.
The audit found that JavaScript/untyped misuse can pass a Promise-returning factory to
sync `toFactory()` and receive a Promise from `runtime.get()`.

## Files / Modules to Inspect

- `packages/ioc/src/container.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- relevant container tests under `packages/ioc/test`
- `README.md`
- `docs/container.md`
- `docs/async-model.md`

## Known Risks

- Breaking legitimate token values that are themselves Promises.
- Adding a runtime guard only on one resolution path while leaving scoped or multi-provider
  paths inconsistent.
- Weakening the documented sync/async boundary instead of making the policy explicit.
