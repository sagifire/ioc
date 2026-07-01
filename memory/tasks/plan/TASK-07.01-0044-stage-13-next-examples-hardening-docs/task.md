# TASK-07.01-0044: Stage 13 Next examples hardening docs

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Завершити Stage 13: harden final `@sagifire/ioc-next` public API, exports, boundary tests
and minimal Next.js App Router examples/docs.

## Product Context

After runtime, request context, route handler and server action helpers exist, Stage 13
needs final coverage and docs that show how to use the adapter at framework boundaries
without implying broader Stage 14 documentation/example suite is complete.

## Scope

- Harden runtime and type coverage for the complete `@sagifire/ioc-next` helper surface.
- Verify package exports for `@sagifire/ioc-next` and root workspace tests.
- Verify package boundary:
  - `@sagifire/ioc` does not import Next.js, React or `@sagifire/ioc-next`;
  - `@sagifire/ioc-testing` does not expose Next adapter helpers;
  - Next adapter helpers stay in `@sagifire/ioc-next`.
- Add or update minimal package README/docs for:
  - cached runtime helper;
  - request context helper;
  - route handler scope helper;
  - server action scope helper.
- Add minimal App Router examples/snippets showing framework-boundary integration and
  scope disposal.
- If a physical `examples/next-app-router` skeleton is created, keep it narrowly scoped to
  Stage 13 adapter usage and avoid turning it into the full Stage 14 example suite.
- Verify docs/examples do not put business logic in route/action handlers.
- Add regression tests for no hidden global runtime registry, no filesystem auto-discovery
  and no hidden current request/action service locator.
- Update run result memory after implementation.

## Out of Scope

- Broad Stage 14 documentation for all packages.
- Full examples suite (`basic-node`, `module-composition`, `async-db-resource`,
  `testing-overrides`) beyond the minimal Next adapter example/snippets.
- Stage 15 release automation.
- Adding filesystem auto-discovery, route scanning or module discovery.
- Adding decorators, `reflect-metadata` or constructor metadata.
- Changing `@sagifire/ioc` core runtime/composer semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Final `@sagifire/ioc-next` helper surface has runtime coverage.
- [x] Final `@sagifire/ioc-next` helper surface has type-level coverage.
- [x] Package export smoke tests cover all public Next adapter helpers.
- [x] Boundary tests confirm core does not import Next.js, React or adapter package.
- [x] Boundary tests confirm testing package does not expose Next adapter helpers.
- [x] Docs explain cached runtime helper, request context, route scope and server action
  scope.
- [x] Minimal App Router examples/snippets demonstrate framework-boundary integration.
- [x] Examples keep business logic behind module public APIs, not inside route/action
  handlers.
- [x] No filesystem auto-discovery, route scanning or hidden current request/action API is
  introduced.
- [x] Stage 13 task does not implement broad Stage 14 docs/examples or release automation.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/task.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/task.md`
- `memory/tasks/plan/TASK-07.01-0043-stage-13-server-action-scope/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для Next examples, hardening,
    exports and docs.
  - Result: approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval і завершення
`TASK-07.01-0043-stage-13-server-action-scope`, якщо користувач явно не змінить
операційний порядок.
