# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/task.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 17 implementation planning accepted cardinality as an explicit declaration-level model
for `0.0.2`, while separating it from dependency kind, runtime gating and token ergonomics.
This run is only the Phase 1 foundation.

## Files / Modules to Inspect

- Core package module definition source.
- Core package composer validation source if module declarations are validated there.
- Core package public export barrels.
- Existing module definition unit tests.
- Existing type test setup.

## Known Risks

- Accidentally overloading `requires.kind` with cardinality semantics.
- Implementing runtime gating too early and crossing into later Stage 17 tasks.
- Adding validation in only one declaration path and leaving object API / DSL inconsistent.
- Exposing types through a non-tree-shaking-friendly barrel pattern.
