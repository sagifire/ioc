# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/task.md`
- `memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/runs/RUN-001/result.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 17 accepted explicit cardinality on `provides` and `requires`. This run makes the
model enforceable during composition validation, but leaves runtime `get()` / `getAll()`
surface gating and inspection provider details for later tasks.

## Files / Modules to Inspect

- Core package composer validation source.
- Core package module setup registration source.
- Core package diagnostics definitions and formatting tests.
- Existing composer unit tests.
- Existing DSL tests if object API changes affect DSL conversion.

## Known Risks

- Treating `requires.kind` as cardinality instead of keeping it as dependency kind.
- Only validating `provides` and missing composer bindings or setup registrations.
- Executing factories to infer graph/cardinality.
- Implementing runtime gating too early and crossing into Phase 2.
