# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-30

## Goal for This Run

Implement Stage 10 module graph dependency edge metadata in `@sagifire/ioc`.

## Clarified Requirements

- Implement only dependency edge metadata.
- Keep core runtime-agnostic and free of Node-only APIs, Next.js, React, decorators and
  `reflect-metadata`.
- Add public graph edge types or equivalent stable type shape.
- Add deterministic capability dependency edges and binding dependency edges to inspection
  graph output.
- Do not execute factories to infer hidden dependencies.
- Do not fail validation or composition because of module cycles in this run.
- Preserve tree-shaking friendly subpath exports.
- Add runtime tests, type assertions and package export smoke tests where applicable.

## Scope for This Run

- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API text becomes misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Module cycle detection.
- Cycle diagnostics.
- Running factories during validation for dependency inference.
- DSL, testing helpers and Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [x] Graph edge public shape is implemented.
- [x] Capability dependency edges are included in graph inspection.
- [x] Binding dependency edges are included in graph inspection.
- [x] Edge order is deterministic.
- [x] Binding priority over capability satisfaction is preserved.
- [x] Edge metadata is safe and private-value-free.
- [x] Stage guard checks confirm cycle validation is not implemented yet.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
