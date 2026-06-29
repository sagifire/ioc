# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати Stage 5 multi-provider у core package `@sagifire/ioc`: `add()`, sync
multi-provider value/factory registrations, `runtime.getAll()`, `ResolutionContext.getAll()`,
strict single/multi-provider validation і tests.

## Clarified Requirements

- Implement only Stage 5 multi-provider behavior in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Use token `id` as canonical provider identity; do not rely on token object identity.
- Do not create global mutable container state or global provider registry.
- Keep `runtime.get()` synchronous and never implement hidden async resolution.
- Keep `freeze()` returning `Promise<ContainerRuntime>`.
- Add sync `runtime.getAll()` and sync `ResolutionContext.getAll()`.
- Keep strict single/multi-provider separation:
  `bind()` for single provider, `add()` for multi provider.
- Do not allow `bind()` and `add()` to mix for the same token ID.
- Make `get()` fail for multi-provider tokens.
- Make `getAll()` fail for single-provider tokens.
- Make `getAll()` return empty array for completely missing tokens.
- Make `getAll()` return fresh `TValue[]` in registration order.
- Implement `add().toValue()` as singleton contribution.
- Implement `add().toFactory()` as transient by default with `.singleton()` /
  `.transient()` modifiers.
- Add minimal multi-provider-specific typed errors with readable messages and local stable
  codes where useful.
- Do not implement full diagnostics types, reports or formatting.

## Scope for This Run

- `packages/ioc/src/container.ts`.
- `packages/ioc/src/index.ts` if root re-export is needed.
- Container tests under `packages/ioc/test/`.
- Existing package export smoke tests if expectations need to account for new exports.
- Minimal docs or README adjustment only if public exports would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- `add().toClass()`.
- Context/scopes and scoped lifetime.
- Async providers/resources/disposal.
- Composer/modules/capabilities/required ports/bindings.
- DSL.
- Full diagnostics layer.
- Next.js adapter helpers.
- Testing package helpers.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Planned Public API Baseline

```ts
export interface ContainerBuilder {
    bind<TValue>(token: Token<TValue>): BindingBuilder<TValue>
    add<TValue>(token: Token<TValue>): MultiBindingBuilder<TValue>
    freeze(): Promise<ContainerRuntime>
}

export interface MultiBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding
}

export interface ContainerRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
}

export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
}
```

Implementation may adjust exact type names only if the result remains clearer and the task
result documents the reason.

## Planned Error Baseline

- Duplicate `bind()` for same token ID: existing `DuplicateProviderError` or equivalent.
- Incompatible `bind()` / `add()` registration for same token ID:
  `ProviderKindMismatchError` or equivalent.
- `get()` for multi-provider token: `ProviderKindMismatchError`,
  `MultiProviderResolutionError` or equivalent.
- `getAll()` for single-provider token: `ProviderKindMismatchError`,
  `SingleProviderCollectionError` or equivalent.
- Provider-level cycle through `get()` / `getAll()`: existing `ProviderCycleError` or
  equivalent with token ID path.

Error messages must be readable and include token IDs where relevant. Full diagnostic
reports, formatter and `SagifireIocError` remain Stage 8.

## Acceptance Criteria for This Run

- [x] `ContainerBuilder.add(token)` public method is exported from
  `@sagifire/ioc/container`.
- [x] Root `@sagifire/ioc` exports Stage 5 container API or the run documents why only the
  subpath export is used.
- [x] `add(token).toValue(value)` registers a multi-provider value contribution.
- [x] `add(token).toFactory(factory)` registers a multi-provider sync factory contribution.
- [x] Multiple `add()` registrations for the same token ID are allowed.
- [x] Multi-provider values resolve in registration order.
- [x] `runtime.getAll(token)` returns all values for multi-provider tokens.
- [x] `runtime.getAll(token)` returns an empty array for missing tokens.
- [x] `runtime.getAll(token)` returns a fresh array per call.
- [x] `runtime.get(token)` fails for multi-provider tokens.
- [x] `runtime.getAll(token)` fails for single-provider tokens.
- [x] `bind()` after `add()` and `add()` after `bind()` for the same token ID fail.
- [x] Duplicate single-provider `bind()` still fails.
- [x] `add().toFactory()` is transient by default.
- [x] `.singleton()` caches one multi-provider factory value per provider per frozen
  runtime.
- [x] `.transient()` creates new multi-provider factory values per collection resolution.
- [x] `ResolutionContext.getAll()` works and preserves token value inference.
- [x] Provider cycles through `get()` and `getAll()` are detected.
- [x] Same token ID from different token objects resolves the same provider collection.
- [x] Runtime tests cover all Stage 5 behavior.
- [x] Type-level assertions cover `add()`, `getAll()` and factory context inference.
- [x] Scope guard checks confirm Stage 6+ APIs were not implemented.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
