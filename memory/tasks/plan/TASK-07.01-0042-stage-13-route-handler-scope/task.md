# TASK-07.01-0042: Stage 13 route handler scope

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати третю частину Stage 13: route handler scope helper for Next.js App Router
style request handlers.

## Product Context

After cached runtime and request context helpers exist, route handlers need a small
boundary adapter that creates one scope per invocation, passes explicit runtime/scope data
to application code and disposes the scope reliably.

## Scope

- Implement `withRouteScope()`, `createRouteHandler()` or an equivalent route handler
  scope helper in `packages/ioc-next/src/index.ts`.
- Integrate with the Stage 13 cached runtime helper.
- Integrate with the Stage 13 request context helper for explicit request-local values.
- Create one core scope per route invocation.
- Pass runtime, scope, request and route context explicitly to the user callback.
- Dispose the scope in a `finally` path on successful and failed handler execution.
- Preserve handler return type inference for `Response` or response-like values.
- Keep the helper usable in simulated route handler tests without requiring a running
  Next.js application.
- Add package-local runtime tests for successful route execution, failure disposal,
  scoped value visibility, async callback behavior and no leaked scope use after disposal.
- Add Vitest `expectTypeOf` assertions for route helper callback inference.
- Update minimal package README/docs only if public API text would otherwise be
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing server action scope helper.
- Implementing full Next.js application examples beyond minimal route helper API text.
- Adding filesystem route scanning or auto-wrapping route modules.
- Adding hidden global current scope or request context APIs.
- Adding Next.js or React imports to `@sagifire/ioc`.
- Changing core scope or runtime disposal semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Route handler scope helper is implemented in `@sagifire/ioc-next`.
- [ ] Helper obtains runtime through the Stage 13 cached runtime helper.
- [ ] Helper creates exactly one scope per route invocation.
- [ ] Request context values are visible inside the route scope.
- [ ] Runtime and scope are passed explicitly to the callback.
- [ ] Scope is disposed after successful route execution.
- [ ] Scope is disposed after failed route execution.
- [ ] Handler return type inference is preserved.
- [ ] Helper can be tested with simulated request/route context without a running Next app.
- [ ] No filesystem route scanning or hidden current request API is introduced.
- [ ] Core package does not import Next.js, React or `@sagifire/ioc-next`.
- [ ] Runtime tests cover route helper lifecycle.
- [ ] Type-level assertions cover callback inference.
- [ ] Stage 13 task does not implement server action helper.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

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

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для route handler scope helper.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval і завершення
`TASK-07.01-0041-stage-13-next-request-context`, якщо користувач явно не змінить
операційний порядок.
