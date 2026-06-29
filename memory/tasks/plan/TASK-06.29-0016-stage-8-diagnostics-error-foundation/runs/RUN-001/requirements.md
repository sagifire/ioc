# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати diagnostics error foundation for Stage 8: `SagifireIocError`, stable error code
contract, type guard and migration of existing Stage 3-7 public typed errors.

## Clarified Requirements

- Implement only Stage 8 diagnostics error foundation behavior in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Do not change provider resolution, async access, scopes or disposal behavior.
- Add public `SagifireIocError`.
- Add public constructor/options type for `SagifireIocError`.
- Add public `isSagifireIocError()` or equivalent type guard.
- Make `SagifireIocError` expose `code`, readable `message`, optional `details` and
  optional `cause`.
- Use code convention `SAGIFIRE_IOC_<AREA>_<REASON>`.
- Preserve existing public code strings unless a direct conflict is found.
- Migrate existing public Stage 3-7 typed errors to extend `SagifireIocError`.
- Preserve existing concrete error class names and class-specific `instanceof` behavior.
- Add structured `details` to migrated errors.
- Keep diagnostics details safe: no provider values, resources, scope-local values or
  private runtime internals.
- Export diagnostics foundation from `@sagifire/ioc/diagnostics`.
- Keep existing root/token/container/context exports working.
- Add tests and type assertions for diagnostics foundation.
- Do not implement diagnostic reports or formatting in this run.

## Scope for This Run

- `packages/ioc/src/diagnostics.ts`.
- `packages/ioc/src/tokens.ts`.
- `packages/ioc/src/container.ts`.
- `packages/ioc/src/context.ts`.
- `packages/ioc/src/index.ts`.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public API documentation would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- `Diagnostic`.
- `DiagnosticReport`.
- `DiagnosticSeverity`.
- `formatDiagnostics()`.
- Diagnostic formatting or pretty printing.
- Composer/module graph diagnostics.
- Composer/modules/capabilities/required ports/bindings.
- DSL.
- Next.js adapter helpers.
- Testing package helpers.
- Runtime inspection API.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Planned Public API Baseline

```ts
export interface SagifireIocErrorOptions<TDetails = unknown> {
    readonly code: string
    readonly message: string
    readonly details?: TDetails
    readonly cause?: unknown
}

export class SagifireIocError<TDetails = unknown> extends Error {
    readonly code: string
    readonly details: TDetails | undefined
    override readonly cause: unknown | undefined
}

export function isSagifireIocError(error: unknown): error is SagifireIocError
```

Exact generic shape may vary if implementation finds a simpler public type, but it must
preserve the same semantic contract.

## Planned Migrated Errors

- `InvalidTokenIdError`
- `ProviderNotFoundError`
- `DuplicateProviderError`
- `ProviderKindMismatchError`
- `ProviderCycleError`
- `ContainerFrozenError`
- `AsyncProviderAccessError`
- `RuntimeDisposedError`
- `InvalidProviderLifecycleError`
- `InvalidScopeError`
- `ScopeDisposedError`
- `DuplicateScopeLocalValueError`

## Acceptance Criteria for This Run

- [ ] `SagifireIocError` is exported from `@sagifire/ioc/diagnostics`.
- [ ] `SagifireIocError` exposes `code`, `message`, optional `details` and optional
  `cause`.
- [ ] `SagifireIocError` preserves `instanceof Error`.
- [ ] `isSagifireIocError()` or equivalent type guard is exported.
- [ ] Existing public typed errors extend `SagifireIocError`.
- [ ] Existing public typed errors preserve class-specific `instanceof` behavior.
- [ ] Existing public error code strings are preserved or any deviation is documented.
- [ ] Migrated errors include safe structured details.
- [ ] Runtime behavior for tokens, container, scopes, async providers and disposal remains
  unchanged except for the error base class/details.
- [ ] Runtime tests cover foundation behavior.
- [ ] Type-level assertions cover foundation API.
- [ ] Package export smoke tests cover root and `./diagnostics` exports.
- [ ] Stage guard checks confirm reports/formatter, composer, DSL, adapters and testing
  helpers were not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
