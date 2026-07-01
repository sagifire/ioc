# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 13 request context helper and request-scoped value declarations in
`@sagifire/ioc-next`.

## Clarified Requirements

- Implement only request context helpers.
- Reuse existing core scope APIs; do not duplicate scope validation.
- Keep request context explicit and token-typed.
- Do not add hidden async-local current request access.
- Do not implement route handler or server action wrappers.
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

- Route handler helper.
- Server action helper.
- App Router example implementation.
- Hidden AsyncLocalStorage or implicit request context.
- Core scope semantic changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Request context helper is implemented.
- [ ] Explicit context entries convert to core scope options.
- [ ] Single and multi request-local values preserve token inference.
- [ ] Duplicate/conflict behavior is deterministic.
- [ ] Public API does not mutate context after creation.
- [ ] No hidden service locator behavior is introduced.
- [ ] Runtime tests cover helper behavior.
- [ ] Type assertions cover helper inference.
- [ ] Package export smoke tests cover new public exports where applicable.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
