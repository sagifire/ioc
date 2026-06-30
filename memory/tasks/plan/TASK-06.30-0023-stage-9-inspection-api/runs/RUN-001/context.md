# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0023-stage-9-inspection-api/task.md`
- `memory/tasks/plan/TASK-06.30-0023-stage-9-inspection-api/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Technical Context

- Inspection must not expose provider values.
- `DiagnosticReport` already exists and can represent validation status.
- Stage 10 will add dependency edges and cycle detection. Do not pre-empt it here.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/*`
- `test/package-exports.test.ts`

## Known Risks

- Returning raw mutable internal maps/arrays.
- Exposing private provider values or resource instances.
- Making inspection depend on object insertion in a nondeterministic way.
- Accidentally implementing cycle detection or graph assertion helpers.

## Assumptions

- Inspection should prefer IDs, kinds and summaries over live objects.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
