# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 13 server action scope helper in `@sagifire/ioc-next`.

## Clarified Requirements

- Implement only server action scope helper.
- Reuse cached runtime helper and request/operation context helper.
- Create and dispose one core scope per action invocation.
- Pass runtime/scope/action context explicitly to action callback.
- Keep action helper separate from route-specific request/response behavior.
- Do not add hidden current scope APIs.
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

- Route handler behavior changes.
- Full Next.js app example.
- Filesystem route/action scanning.
- Hidden current action/current scope context.
- Core runtime/scope semantic changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Server action helper is implemented.
- [ ] One scope is created per action invocation.
- [ ] Action context values are visible inside action scope.
- [ ] Scope disposal happens on success and failure.
- [ ] Callback argument and return type inference are preserved.
- [ ] Simulated action tests cover helper lifecycle.
- [ ] Helper is independent from route request/response behavior.
- [ ] No hidden current action API is introduced.
- [ ] Type assertions cover callback inference.
- [ ] Package export smoke tests cover new public exports where applicable.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
