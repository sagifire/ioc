# RUN-001 Context

## Required Reading

- `memory/agent-start.md`
- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff/task.md`
- `memory/tasks/plan/TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.05-0087-stage-17-0-0-2-full-audit/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/definition-of-done.md`

## Audit Findings To Close

- `H-001`: `examples/next-app-router` direct Node run fails because `REQUEST_TAGS` is
  declared as default single while the example uses multi semantics through `context.add()`
  and `getAll()`.
- `L-001`: packed/export smoke checks do not explicitly exercise new `0.0.2` public
  helpers and diagnostics exports.

## Files / Modules To Inspect

- `examples/next-app-router/src/contact-requests.ts`
- `examples/next-app-router/README.md`
- `test/package-exports.test.ts`
- `scripts/pack-dry-run.mjs`
- package public export surfaces for `@sagifire/ioc`, `@sagifire/ioc-testing` and
  `@sagifire/ioc-next`

## Known Risks

- Fixing the example only at runtime while leaving docs/declarations semantically unclear.
- Adding smoke checks that use source paths instead of packed/public entrypoints.
- Performing versioning or publish work without explicit approval.
- Marking the task `done` before task-level human review approval.
