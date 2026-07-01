# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Finalize Stage 12 `@sagifire/ioc-testing` hardening, exports and docs.

## Clarified Requirements

- Harden final testing helper surface.
- Verify package exports and package boundaries.
- Update docs for testing workflows.
- Do not implement Stage 13 Next.js adapters.
- Do not change core runtime/composer semantics.
- Run build/test/typecheck/lint.

## Scope for This Run

- `packages/ioc-testing/src/*`.
- `packages/ioc-testing/README.md`.
- `docs/testing.md`.
- `README.md` and minimal adjacent docs if needed.
- Tests under `packages/ioc-testing/test/`.
- `test/package-exports.test.ts`.
- Task run result memory after implementation.

## Out of Scope for This Run

- New helper families beyond planned Stage 12 surface.
- Next.js adapters and examples.
- Full Stage 14 documentation/examples.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Final testing API has integration regression tests.
- [ ] Package export smoke tests cover final testing API.
- [ ] Type assertions cover final helper inference.
- [ ] Docs describe testing workflows and immutability boundaries.
- [ ] Boundary checks confirm core does not import testing package.
- [ ] Boundary checks confirm testing package does not implement Next.js adapters.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
