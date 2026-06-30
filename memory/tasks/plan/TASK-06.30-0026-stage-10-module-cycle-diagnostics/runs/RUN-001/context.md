# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/task.md`
- `memory/tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 10 acceptance requires module-level cycle detection, cycle path diagnostics and
successful composition for valid acyclic graphs.

## Relevant Technical Context

- Cycle detection must use graph metadata, not factory execution.
- Module cycles are based on capability dependency edges.
- Binding dependency edges represent composition adapters and do not create module-level
  cycles by themselves.
- `ComposerValidationError` already carries a `DiagnosticReport`.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/diagnostics.test.ts`
- `test/package-exports.test.ts`
- `docs/composer.md`
- `docs/modules.md`

## Known Risks

- Reporting duplicate cycle diagnostics for the same cycle in different rotations.
- Producing paths that are hard to read because module IDs and token IDs are not aligned.
- Treating binding edges as module edges and rejecting valid composition-adapter graphs.
- Wrapping provider-level cycle errors as module cycles.

## Assumptions

- Prefer deterministic, readable cycle paths over trying to enumerate every possible cycle
  in one report.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
