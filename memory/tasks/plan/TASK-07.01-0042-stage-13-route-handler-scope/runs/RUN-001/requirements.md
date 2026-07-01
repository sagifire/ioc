# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 13 route handler scope helper in `@sagifire/ioc-next`.

## Clarified Requirements

- Implement only route handler scope helper.
- Reuse cached runtime helper and request context helper.
- Create and dispose one core scope per route invocation.
- Pass runtime/scope/request/context explicitly to route callback.
- Do not add hidden current request APIs.
- Do not implement server action helper.
- Keep `@sagifire/ioc` free of Next.js, React and adapter imports.
- Add runtime tests, type assertions and docs sync where applicable.

## Scope for This Run

- `packages/ioc-next/src/index.ts`.
- `packages/ioc-next/README.md` if needed.
- Tests under `packages/ioc-next/test/` or existing workspace test conventions.
- `test/package-exports.test.ts` if the public export smoke test needs to cover the new
  helper.
- `docs/next-integration.md` if placeholder text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Server action helper.
- Full Next.js app example.
- Filesystem route scanning.
- Hidden current route/request context.
- Core runtime/scope semantic changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Route handler helper is implemented.
- [ ] One scope is created per route invocation.
- [ ] Request context values are visible inside route scope.
- [ ] Scope disposal happens on success and failure.
- [ ] Callback return type inference is preserved.
- [ ] Simulated route tests cover helper lifecycle.
- [ ] No hidden current request API is introduced.
- [ ] Type assertions cover callback inference.
- [ ] Package export smoke tests cover new public exports where applicable.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
