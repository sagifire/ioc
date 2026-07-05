# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/task.md`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/runs/RUN-001/result.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 17 accepted explicit capability cardinality and static/post-setup validation in
previous tasks. This run makes cardinality visible at the composed runtime public boundary
without changing container-level strict single/multi behavior.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/composer.test.ts`
- Existing DSL tests if object API behavior requires parity checks.

## Known Risks

- Accidentally exposing module-private multi providers through `ComposedRuntime.getAll()`.
- Duplicating container-level kind checks instead of adding public-boundary awareness.
- Introducing `composer.add()` too early and widening the public API more than this task
  requires.
- Executing user factories during validation, graph inference or inspection.
- Breaking existing single capability `runtime.get()` behavior.
