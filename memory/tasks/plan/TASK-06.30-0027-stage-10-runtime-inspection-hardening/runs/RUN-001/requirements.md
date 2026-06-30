# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-30

## Goal for This Run

Complete Stage 10 by hardening composed runtime inspection, binding-edge semantics and
public docs/tests.

## Clarified Requirements

- Build on dependency edges from `TASK-06.30-0025` and cycle diagnostics from
  `TASK-06.30-0026`.
- Ensure `runtime.inspect()` exposes final Stage 10 graph shape for valid acyclic graphs.
- Ensure binding edges are represented and do not create false module cycles.
- Ensure validation and inspection do not execute binding factories.
- Keep provider-level cycles as container diagnostics.
- Replace Stage 9 no-edge/no-cycle guard tests with Stage 10 assertions.
- Update docs and package export smoke tests where needed.

## Scope for This Run

- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- `README.md`, `packages/ioc/README.md`, `docs/composer.md` and `docs/modules.md` if
  current text is misleading after Stage 10.
- Task run result memory after implementation.

## Out of Scope for This Run

- New binding dependency declaration API unless prior run documented a blocker and memory
  was synced first.
- DSL helpers.
- Testing helpers or graph assertion APIs.
- Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Runtime inspection includes dependency edges.
- [ ] Binding edges do not create false module cycles.
- [ ] Validation/inspection do not execute binding factories.
- [ ] Provider-level cycles remain provider/container diagnostics.
- [ ] Stage 10 public docs/tests are synchronized.
- [ ] Stage 10 overall roadmap acceptance is satisfied.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
