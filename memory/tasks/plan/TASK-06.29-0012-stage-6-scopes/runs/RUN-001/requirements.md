# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати Stage 6 scopes у core package `@sagifire/ioc`: sync scope resolution APIs,
scoped lifetime, scope-local values, scope disposal, `withScope()` and invalid scope usage
errors.

## Clarified Requirements

- Implement only Stage 6 scopes behavior in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Do not create global mutable container state or global provider registry.
- Keep frozen runtime immutable after `freeze()`.
- Keep `runtime.get()` synchronous and never implement hidden async resolution.
- Keep `freeze()` returning `Promise<ContainerRuntime>`.
- Add `runtime.createScope(options?)`.
- Add `runtime.withScope(callback)` and `runtime.withScope(options, callback)`.
- Add `Scope.get()`, `Scope.tryGet()`, `Scope.getAll()` and `Scope.dispose()`.
- Do not add `Scope.getAsync()` or runtime async resolution APIs in Stage 6.
- Add `.scoped()` to `LifetimeBinding`.
- Support scoped lifetime for sync single-provider factory/class providers.
- Support scoped lifetime for sync multi-provider factory contributions.
- Keep `toValue()` singleton by definition.
- Cache scoped provider values per scope, not per runtime.
- Make runtime-level resolution of scoped providers fail without active scope.
- Make scope-bound factory contexts resolve through the active scope.
- Support scope-local single values and scope-local multi values at scope creation time.
- Do not expose mutable public APIs for changing scope-local values after scope creation.
- Use token `id` as canonical identity for provider and scope-local matching.
- Preserve strict single/multi-provider model inside scopes.
- Make scope-local single values override runtime single-provider resolution for same
  token ID inside that scope.
- Make scope-local multi values extend runtime multi-provider collections after runtime
  values.
- Fail on single/multi local/runtime conflicts.
- Make duplicate local single values fail.
- Allow multiple local multi values and preserve declaration order.
- Make `scope.dispose()` idempotent and make disposed scope resolution fail.
- Make `withScope()` dispose the scope in `finally`.
- Add minimal scope-specific typed errors with readable messages and local stable codes
  where useful.
- Do not implement full diagnostics types, reports or formatting.

## Scope for This Run

- `packages/ioc/src/container.ts`.
- `packages/ioc/src/context.ts`.
- `packages/ioc/src/index.ts` if root re-export is needed.
- Container/context tests under `packages/ioc/test/`.
- Existing package export smoke tests if expectations need to account for new exports.
- Minimal docs or README adjustment only if public exports would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- `scope.getAsync()`, `runtime.getAsync()` and `runtime.tryGetAsync()`.
- Async providers/resources/disposal.
- Runtime disposal.
- Resource disposer ordering.
- Composer/modules/capabilities/required ports/bindings.
- DSL.
- Full diagnostics layer.
- Next.js adapter helpers.
- Testing package helpers.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Planned Public API Baseline

```ts
export interface ContainerRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    createScope(options?: CreateScopeOptions): Scope
    withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    withScope<TValue>(
        options: CreateScopeOptions,
        callback: ScopeCallback<TValue>
    ): Promise<TValue>
}

export interface Scope {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    dispose(): Promise<void>
}

export interface LifetimeBinding {
    singleton(): void
    transient(): void
    scoped(): void
}

export type ScopeCallback<TValue> = (scope: Scope) => TValue | Promise<TValue>
```

`CreateScopeOptions` exact shape may use tuple entries, object entries or helper functions
if the implementation keeps token/value pairing explicit and type-safe enough for public
API use. The run result must document any deviation from this baseline.

## Planned Error Baseline

- Scoped provider resolved without active scope: `InvalidScopeError` or equivalent.
- Disposed scope resolution: `InvalidScopeError` or equivalent with disposed-scope detail.
- Invalid scope-local single/multi conflict: `InvalidScopeError`,
  `ProviderKindMismatchError` or clearer equivalent.
- Provider-level cycle through scope-bound `get()` / `getAll()`: existing
  `ProviderCycleError` or equivalent with token ID path.

Error messages must be readable and include token IDs where relevant. Full diagnostic
reports, formatter and `SagifireIocError` remain Stage 8.

## Acceptance Criteria for This Run

- [ ] `ContainerRuntime.createScope(options?)` public method is exported.
- [ ] `ContainerRuntime.withScope()` public overloads are exported.
- [ ] `Scope` sync API is exported from `@sagifire/ioc/context`.
- [ ] Root `@sagifire/ioc` exports Stage 6 context API or the run documents why only the
  subpath export is used.
- [ ] Scope-local single values override runtime single providers for same token ID inside
  one scope only.
- [ ] Scope-local multi values extend runtime multi-provider values in documented order.
- [ ] Single/multi conflicts fail.
- [ ] Duplicate local single values fail.
- [ ] Multiple local multi values are allowed.
- [ ] Scoped single provider creates one value per scope.
- [ ] Scoped multi-provider factory contribution creates one value per scope.
- [ ] Runtime-level resolution of scoped provider fails.
- [ ] Scope-bound factory context resolves scoped dependencies and local values.
- [ ] Provider cycles through scopes are detected.
- [ ] `scope.dispose()` is idempotent.
- [ ] Disposed scope cannot resolve values.
- [ ] `withScope()` disposes scope after success and failure.
- [ ] Type-level assertions cover Stage 6 API.
- [ ] Scope guard checks confirm Stage 7+ APIs were not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
