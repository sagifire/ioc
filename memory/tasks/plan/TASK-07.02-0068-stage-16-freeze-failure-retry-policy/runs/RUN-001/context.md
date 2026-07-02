# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0068-stage-16-freeze-failure-retry-policy/task.md`
- `memory/tasks/plan/TASK-07.02-0068-stage-16-freeze-failure-retry-policy/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/product/requirements.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 7 established async provider/resource behavior and lazy async retry semantics. The
audit found that a failed eager async initialization during `freeze()` caches the rejected
promise and does not retry, while public policy for that case is not explicit enough.

## Files / Modules to Inspect

- `packages/ioc/src/container.ts`
- async provider/resource tests under `packages/ioc/test`
- `docs/container.md`
- `docs/async-model.md`
- `README.md` if it states freeze/async behavior.

## Known Risks

- Allowing retry after a failed `freeze()` in a way that mutates a successfully frozen
  runtime.
- Documenting no-retry semantics without tests that lock the policy.
- Accidentally changing lazy async retry behavior while touching eager initialization.
