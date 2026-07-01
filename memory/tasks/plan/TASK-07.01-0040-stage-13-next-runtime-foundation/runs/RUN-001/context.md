# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 13 starts `@sagifire/ioc-next`. The first task should make the package useful
without starting request/route/action helper APIs too early.

## Relevant Technical Context

- `packages/ioc-next/src/index.ts` is currently a placeholder.
- `@sagifire/ioc-next` already depends on `@sagifire/ioc`.
- `@sagifire/ioc-next` package export already exists.
- Core runtime/composer/app APIs are implemented and should be reused.
- `@sagifire/ioc` must not import Next.js, React or `@sagifire/ioc-next`.

## Files / Modules to Inspect

- `packages/ioc-next/src/index.ts`
- `packages/ioc-next/package.json`
- `packages/ioc-next/README.md`
- `packages/ioc/src/index.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/dsl.ts`
- `test/package-exports.test.ts`
- `test/package-boundaries.test.ts`
- `docs/next-integration.md`
- `README.md`

## Known Risks

- Accidentally creating a package-level service locator instead of an explicit cached
  runtime accessor.
- Adding a hard Next.js dependency before the API actually needs one.
- Mutating an existing frozen runtime to support adapter behavior.
- Allowing a failed in-flight initialization to poison all later calls.

## Assumptions

- Prefer the smallest stable API that preserves explicit runtime creation and cache
  ownership.
- If exact helper naming is awkward during implementation, keep `createNextRuntime()` as
  the primary exported name unless there is a concrete reason to document otherwise.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
