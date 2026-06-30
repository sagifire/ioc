# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/task.md`
- `memory/tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Technical Context

- The composed runtime should be a wrapper over internal container runtime, not a forked
  container implementation.
- Public resolution must be capability-gated.
- Resource disposal ownership should stay with the internal container runtime.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/lifecycle.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/test/*`

## Known Risks

- Reimplementing container behavior inside composer.
- Accidentally exposing private providers through public runtime methods.
- Losing async eager/lazy or resource disposal semantics.
- Allowing `get()` to return a Promise.
- Implementing Stage 10 cycle detection during runtime composition.

## Assumptions

- If a minimal internal extension is needed to preserve module boundaries, keep it local
  and document why the current container API was insufficient.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
