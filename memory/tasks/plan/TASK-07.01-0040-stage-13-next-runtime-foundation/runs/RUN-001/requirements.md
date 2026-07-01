# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Implement Stage 13 `@sagifire/ioc-next` package foundation and cached runtime helper.

## Clarified Requirements

- Implement only the Next runtime foundation.
- Keep helpers in `@sagifire/ioc-next`.
- Reuse `@sagifire/ioc` public APIs; do not duplicate core resolution logic.
- Keep `@sagifire/ioc` free of Next.js, React and adapter imports.
- Cache runtime creation safely at adapter/application boundary.
- Deduplicate in-flight initialization.
- Avoid hidden package-level global mutable runtime registry.
- Preserve tree-shaking friendly package exports.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc-next/src/index.ts`.
- `packages/ioc-next/package.json` only if package-local scripts or dependency metadata
  need task-scoped adjustment.
- `packages/ioc-next/README.md` if needed.
- Tests under `packages/ioc-next/test/` or existing workspace test conventions.
- `test/package-exports.test.ts`.
- Minimal docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Request context helper.
- Route handler scope helper.
- Server action scope helper.
- App Router example implementation beyond minimal API docs.
- Next.js route/action integration tests.
- Filesystem discovery, route scanning or module discovery.
- Core runtime semantic changes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [x] Next runtime foundation is implemented.
- [x] Cached runtime helper reuses successful initialization.
- [x] Concurrent initialization is de-duplicated.
- [x] Failed initialization retry/cache policy is covered by tests.
- [x] Helper does not mutate existing frozen runtimes.
- [x] Core package has no Next.js/React/adapter imports.
- [x] Runtime tests cover helper behavior.
- [x] Type assertions cover helper inference.
- [x] Package export smoke tests cover `@sagifire/ioc-next`.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
