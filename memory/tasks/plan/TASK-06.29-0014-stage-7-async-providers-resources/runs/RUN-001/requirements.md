# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати Stage 7 async providers and resources у core package `@sagifire/ioc`: async
single-provider bindings, explicit async resolution, eager/lazy initialization, runtime
and scoped resource disposal, and minimal async/disposal typed errors.

## Clarified Requirements

- Implement only Stage 7 async providers/resources behavior in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Do not create global mutable container state, global provider registry or runtime-owned
  global scope registry.
- Keep frozen runtime immutable after `freeze()`.
- Keep `runtime.get()` synchronous and never return `Promise`.
- Add `bind(token).toAsyncFactory(factory)` for single-provider tokens.
- Add `bind(token).toAsyncResource(factory)` for single-provider tokens.
- Do not add async multi-provider contributions or `getAllAsync()`.
- Add `runtime.getAsync(token)`.
- Add `runtime.tryGetAsync(token)`.
- Add `scope.getAsync(token)`.
- Add `ResolutionContext.getAsync(token)` and `ResolutionContext.tryGetAsync(token)`.
- Make sync providers resolvable through async APIs.
- Make async eager singleton providers/resources initialize during `freeze()`.
- Make async eager singleton providers/resources available through sync `get()` after
  `freeze()`.
- Make async lazy providers/resources initialize on `getAsync()` and remain inaccessible
  through `get()` / `tryGet()`.
- Make failed lazy async initialization not cached by default.
- De-duplicate in-flight singleton/scoped lazy initialization and clear it on rejection.
- Make `toAsyncFactory()` transient lazy by default.
- Allow async factory providers to be transient, singleton or scoped.
- Make eager async factory/resource initialization valid only for singleton providers.
- Make `toAsyncResource()` require explicit singleton or scoped ownership.
- Make async resources lazy by default unless `eager()` is explicitly chosen.
- Make scoped async providers/resources initialize through `scope.getAsync()`.
- Keep runtime-level resolution of scoped providers invalid without active scope.
- Add `runtime.dispose()`.
- Make runtime disposal dispose initialized singleton resources in reverse initialization
  order where possible.
- Make scope disposal dispose initialized scoped resources in reverse initialization order
  where possible.
- Keep runtime and scope disposal idempotent.
- After runtime disposal, runtime resolution and scope creation must fail with
  `RuntimeDisposedError`.
- After scope disposal, scope resolution must fail with `ScopeDisposedError`.
- Runtime disposal must not silently dispose live scopes.
- Add minimal typed errors with readable messages and local stable codes:
  `AsyncProviderAccessError`, `RuntimeDisposedError`, `ScopeDisposedError`.
- Do not implement full diagnostics types, reports or formatting.

## Scope for This Run

- `packages/ioc/src/container.ts`.
- `packages/ioc/src/context.ts`.
- `packages/ioc/src/lifecycle.ts`.
- `packages/ioc/src/index.ts` if root re-export is needed.
- Container/context/lifecycle tests under `packages/ioc/test/`.
- Existing package export smoke tests if expectations need to account for new exports.
- Minimal docs or README adjustment only if public exports would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Async multi-provider contributions.
- `getAllAsync()` and `scope.getAllAsync()`.
- `scope.tryGetAsync()` unless a concrete public API consistency blocker is documented.
- `cacheFailure()` or cached failed initialization policy.
- Runtime-owned live scope registry.
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
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
    dispose(): Promise<void>
}

export interface Scope {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    dispose(): Promise<void>
}

export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
}

export interface Resource<TValue> {
    readonly value: TValue
    readonly dispose?: () => void | Promise<void>
}
```

The exact builder interface for `toAsyncFactory()` / `toAsyncResource()` may use separate
types instead of overloading existing `LifetimeBinding` if that keeps invalid
lifetime/mode combinations clearer. The run result must document any deviation from this
baseline.

## Planned Error Baseline

- Invalid sync access to async lazy provider/resource: `AsyncProviderAccessError`.
- Runtime resolution or scope creation after runtime disposal: `RuntimeDisposedError`.
- Scope resolution after scope disposal: `ScopeDisposedError`.
- Scoped provider/resource resolved without active scope: existing `InvalidScopeError` or
  equivalent.
- Provider-level cycle through async or mixed sync/async path: existing
  `ProviderCycleError` or equivalent with token ID path.

Error messages must be readable and include token IDs where relevant. Full diagnostic
reports, formatter and `SagifireIocError` remain Stage 8.

## Acceptance Criteria for This Run

- [ ] `bind().toAsyncFactory()` is exported for single-provider tokens.
- [ ] `bind().toAsyncResource()` is exported for single-provider tokens.
- [ ] `Resource<TValue>` or equivalent lifecycle type is exported.
- [ ] `runtime.getAsync()` and `runtime.tryGetAsync()` are exported.
- [ ] `scope.getAsync()` is exported.
- [ ] `ResolutionContext.getAsync()` and `ResolutionContext.tryGetAsync()` are available
  to provider factories.
- [ ] Sync providers resolve through async APIs.
- [ ] Async eager singleton provider/resource initializes during `freeze()`.
- [ ] Async eager singleton provider/resource is available through `get()`.
- [ ] Async lazy provider/resource initializes on `getAsync()`.
- [ ] `get()` / `tryGet()` on async lazy provider/resource throws
  `AsyncProviderAccessError`.
- [ ] Failed lazy async initialization is not cached and can be retried.
- [ ] In-flight singleton/scoped lazy initialization is de-duplicated.
- [ ] Async factory lifetimes work for transient, singleton and scoped providers.
- [ ] Async resources require explicit singleton or scoped ownership.
- [ ] Runtime disposal disposes singleton resources.
- [ ] Scope disposal disposes scoped resources.
- [ ] Runtime and scope disposal are idempotent.
- [ ] Disposed runtime and disposed scope errors are typed and readable.
- [ ] Async provider/resource cycles are detected.
- [ ] Type-level assertions cover Stage 7 API.
- [ ] Package export smoke tests cover Stage 7 exports.
- [ ] Stage guard checks confirm async multi-provider, `getAllAsync`, composer, DSL,
  diagnostics report/formatter, Next.js adapters and testing helpers were not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
