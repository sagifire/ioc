# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-30

## Goal for This Run

Implement `composer.compose()` and the composed runtime capability registry.

## Clarified Requirements

- Build on approved module setup/private provider behavior.
- Public runtime exposes only declared exported capabilities.
- Required-port bindings do not become public capabilities by default.
- Existing container APIs should be reused, not duplicated.
- Preserve scope, async and disposal semantics.
- Use typed diagnostics for invalid composed graphs.

## Scope for This Run

- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/index.ts` if exports change.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts` if public exports change.
- Task run result memory after implementation.

## Out of Scope for This Run

- Inspection APIs.
- Module cycle detection and dependency-edge analysis.
- DSL, testing helpers and Next.js adapters.

## Acceptance Criteria for This Run

- [ ] Compose returns a usable immutable runtime.
- [ ] Exported capabilities resolve.
- [ ] Private providers and required-port-only bindings are hidden from public runtime.
- [ ] Scopes, async resolution and disposal behavior pass through correctly.
- [ ] Invalid graphs fail with typed diagnostics.
- [ ] Tests and type assertions cover composed runtime behavior.
- [ ] Stage guard checks confirm out-of-scope behavior was not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
