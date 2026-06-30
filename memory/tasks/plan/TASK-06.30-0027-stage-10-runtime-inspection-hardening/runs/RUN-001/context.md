# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0027-stage-10-runtime-inspection-hardening/task.md`
- `memory/tasks/plan/TASK-06.30-0027-stage-10-runtime-inspection-hardening/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

This is the final Stage 10 hardening task. It should leave module graph edges, cycle
diagnostics, validation and inspection consistent enough for Stage 11 DSL to build on top
without hiding the graph.

## Relevant Technical Context

- Runtime inspection must stay safe: no provider values, resource instances, scope-local
  values or private runtime internals.
- Binding factories must not run during validation or inspection.
- Existing container provider cycle detection remains responsible for provider-level
  cycles.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/diagnostics.test.ts`
- `test/package-exports.test.ts`
- `README.md`
- `packages/ioc/README.md`
- `docs/composer.md`
- `docs/modules.md`

## Known Risks

- Leaving stale Stage 9 docs that say Stage 10 is still planned after it is implemented.
- Making runtime inspection diverge from composer graph semantics.
- Accidentally triggering binding/provider factories during validation tests.
- Treating provider-level cycles as module cycles and losing more precise diagnostics.

## Assumptions

- Documentation updates should be minimal because comprehensive docs remain Stage 14.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
