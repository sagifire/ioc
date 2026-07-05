# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0089-stage-17-composer-add-multi-contributions/task.md`
- `memory/tasks/plan/TASK-07.05-0089-stage-17-composer-add-multi-contributions/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/task.md`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/runs/RUN-001/result.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 17 already introduced public capability cardinality, validation, runtime gating and
inspection metadata. This run adds the explicit composition-root contribution API that was
intentionally deferred until provider identity and inspection shape were stable.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/diagnostics.test.ts`
- type-level test files discovered in the repository.

## Known Risks

- Accidentally allowing `composer.add()` for required-only or private tokens because the
  container can technically register any token.
- Breaking public single-vs-multi runtime gating that was stabilized in previous tasks.
- Assigning registration indices differently between graph inspection and actual
  `getAll()` resolution order.
- Executing provider factories during validation, graph creation or inspection.
- Introducing DSL or adapter changes outside this task's scope.
