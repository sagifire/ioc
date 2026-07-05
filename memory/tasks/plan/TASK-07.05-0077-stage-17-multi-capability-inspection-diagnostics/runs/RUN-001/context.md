# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/task.md`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/runs/RUN-001/result.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 17 already added declaration-level cardinality, validation and composed runtime gating.
This run makes the same model inspectable through public graph/runtime surfaces without adding
new runtime resolution semantics.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/diagnostics.test.ts`

## Known Risks

- Accidentally leaking private module providers or private token IDs in runtime inspection.
- Using declaration order that differs from actual runtime multi-provider registration order.
- Treating composition-root `composer.add()` as implemented even though it is a follow-up task.
- Executing user factories during graph validation, graph creation or inspection.
- Breaking existing public inspection type assertions and snapshot-like tests.
