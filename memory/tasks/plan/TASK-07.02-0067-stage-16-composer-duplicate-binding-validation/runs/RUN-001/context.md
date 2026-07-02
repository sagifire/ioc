# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0067-stage-16-composer-duplicate-binding-validation/task.md`
- `memory/tasks/plan/TASK-07.02-0067-stage-16-composer-duplicate-binding-validation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Composer validation is meant to be a reliable pre-compose graph check. The audit found a
false positive where duplicate explicit composer bindings pass `validate()` and fail later
through container-level duplicate provider detection.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/diagnostics.ts`
- composer tests under `packages/ioc/test`
- DSL tests under `packages/ioc/test`
- `docs/composer.md`
- `docs/diagnostics.md`

## Known Risks

- Duplicating container validation instead of adding composer-level diagnostics with useful
  context.
- Missing `composer.inspect().validation` while fixing only `compose()`.
- Missing DSL conversion path if duplicate app bindings are represented differently.
