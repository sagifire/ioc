# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-01

## Goal for This Run

Complete Stage 11 DSL hardening, export coverage and minimal docs sync.

## Clarified Requirements

- Harden the final DSL after module/app/bind/adapt tasks are implemented.
- Keep object API fully usable and documented.
- Verify package exports and tree-shaking-friendly boundaries.
- Verify DSL-generated graph parity with object API configuration.
- Keep testing helpers and Next.js adapters out of scope.
- Add runtime tests, type assertions, export smoke tests and docs sync where needed.

## Scope for This Run

- `packages/ioc/src/dsl.ts`.
- `packages/ioc/src/index.ts` if root export is appropriate.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- `docs/architecture.md`.
- `docs/composer.md`.
- `docs/modules.md`.
- `packages/ioc/README.md`.
- Root `README.md` if stale Stage 11 status text exists.
- Task run result memory after implementation.

## Out of Scope for This Run

- Testing helpers and graph assertion helpers.
- Next.js adapters and examples.
- Broad Stage 14 documentation/examples.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] Final DSL export surface is verified.
- [ ] Runtime parity tests cover DSL vs object API graph behavior.
- [ ] Type assertions cover final DSL API.
- [ ] Docs explain optional DSL and object API parity.
- [ ] Stage 11 overall acceptance is satisfied.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
