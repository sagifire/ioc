# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0044-stage-13-next-examples-hardening-docs/task.md`
- `memory/tasks/plan/TASK-07.01-0044-stage-13-next-examples-hardening-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.01-0043-stage-13-server-action-scope/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

This is the final Stage 13 hardening task. It should make `@sagifire/ioc-next` usable and
documented enough for adapter workflows while leaving full project docs and full examples
suite to Stage 14.

## Relevant Technical Context

- Cached runtime helper should already exist from `TASK-07.01-0040`.
- Request context helper should already exist from `TASK-07.01-0041`.
- Route handler helper should already exist from `TASK-07.01-0042`.
- Server action helper should already exist from `TASK-07.01-0043`.
- Current docs may still contain placeholder text from Stage 2 or earlier Stage 13 tasks.

## Files / Modules to Inspect

- `packages/ioc-next/src/index.ts`
- `packages/ioc-next/test/`
- `packages/ioc-next/README.md`
- `docs/next-integration.md`
- `README.md`
- `test/package-exports.test.ts`
- `test/package-boundaries.test.ts`
- `packages/ioc/src/`
- `packages/ioc-testing/src/`
- `examples/` if created during this task.

## Known Risks

- Turning Stage 13 hardening into broad Stage 14 documentation work.
- Creating examples that hide business logic in framework files.
- Adding a physical Next app that requires dependency installation without user approval.
- Forgetting package boundary tests after adding public adapter exports.

## Assumptions

- Minimal examples/snippets are enough for Stage 13 unless the implementation can create a
  narrow physical example without new dependency/network requirements.
- If adding a real Next.js dependency or running a Next app requires network installation,
  ask for permission.
- If Stage 13 exposes structural helper types instead of importing Next types, examples can
  still show App Router usage as code snippets.
