# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/task.md`
- `memory/tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Technical Context

- `composer.validate()` is allowed to be static and synchronous at this stage.
- Composition binding values are configuration data and must not be exposed in diagnostics.
- `composer.bind()` satisfies required ports but does not make tokens public runtime
  capabilities.
- Compose-time validation that needs setup execution belongs to later Stage 9 tasks.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/*`
- `test/package-exports.test.ts`

## Known Risks

- Treating every binding token as public capability.
- Making validation depend on module setup execution too early.
- Exposing actual values in diagnostics or inspection-like data.
- Implementing cycle detection before Stage 10.

## Assumptions

- If previous task adjusts the module definition API, follow the approved result and
  document adaptation in this run.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
