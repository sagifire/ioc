# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Harden final Stage 13 `@sagifire/ioc-next` helper surface and add minimal Next.js App
Router examples/docs.

## Clarified Requirements

- Cover the complete Stage 13 Next adapter API with runtime tests and type assertions.
- Verify package exports and package boundaries.
- Document cached runtime, request context, route scope and server action scope.
- Add minimal examples/snippets for App Router boundary usage.
- Keep full Stage 14 documentation/example suite out of scope.
- Do not introduce filesystem auto-discovery, route scanning or hidden current context.
- Keep `@sagifire/ioc` free of Next.js, React and adapter imports.

## Scope for This Run

- `packages/ioc-next/src/index.ts` only if final export/hardening changes are needed.
- `packages/ioc-next/README.md`.
- `docs/next-integration.md`.
- Minimal `examples/next-app-router` files only if the implementation chooses a physical
  Stage 13 example skeleton.
- Tests under `packages/ioc-next/test/` or existing workspace test conventions.
- `test/package-exports.test.ts`.
- `test/package-boundaries.test.ts`.
- Task run result memory after implementation.

## Out of Scope for This Run

- Broad docs for container, composer, testing or diagnostics.
- Full examples suite beyond minimal Next adapter example/snippets.
- Release automation.
- Core runtime/composer semantic changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Final Next adapter runtime coverage is complete for Stage 13 scope.
- [ ] Final Next adapter type coverage is complete for Stage 13 scope.
- [ ] Package exports cover all public Next adapter helpers.
- [ ] Boundary checks confirm core package has no Next.js/React/adapter imports.
- [ ] Boundary checks confirm testing package does not expose Next adapter helpers.
- [ ] Next integration docs are updated.
- [ ] Minimal App Router examples/snippets are added.
- [ ] Examples keep business logic behind module public APIs.
- [ ] No hidden discovery/current-context behavior is introduced.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
