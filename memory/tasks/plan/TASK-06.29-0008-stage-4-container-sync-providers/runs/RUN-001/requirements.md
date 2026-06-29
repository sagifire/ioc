# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати Stage 4 container sync providers у core package `@sagifire/ioc`:
`createContainer()`, sync single-provider bindings, singleton/transient lifetimes,
`freeze()`, immutable runtime `get()` / `tryGet()`, duplicate token detection і provider
cycle detection.

## Clarified Requirements

- Implement only Stage 4 sync container behavior in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Use token `id` as canonical provider identity; do not rely on token object identity.
- Do not create global mutable container state or global provider registry.
- Keep `runtime.get()` synchronous and never implement hidden async resolution.
- Make `freeze()` return `Promise<ContainerRuntime>` for future async eager compatibility.
- Keep `ResolutionContext` Stage 4 surface sync-only: `get()` and `tryGet()`.
- Implement `toClass()` as no-argument class construction only; use `toFactory()` for
  classes with dependencies.
- Use default lifetimes from architecture: `toValue` singleton, `toFactory` transient,
  `toClass` transient.
- Add minimal container-specific typed errors with readable messages and local stable
  codes where useful.
- Do not implement full diagnostics types, reports or formatting.

## Scope for This Run

- `packages/ioc/src/container.ts`.
- `packages/ioc/src/index.ts` if root re-export is needed.
- Container tests under `packages/ioc/test/` or another existing Vitest include.
- Existing package export smoke tests if expectations need to account for new exports.
- Minimal docs or README adjustment only if public exports would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Multi-provider `add()` / `getAll()`.
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
export function createContainer(): ContainerBuilder

export interface ContainerBuilder {
    bind<TValue>(token: Token<TValue>): BindingBuilder<TValue>
    freeze(): Promise<ContainerRuntime>
}

export interface BindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding
    toClass(classConstructor: ClassConstructor<TValue>): LifetimeBinding
}

export interface LifetimeBinding {
    singleton(): void
    transient(): void
}

export interface ContainerRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
}

export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
}

export type SyncProviderFactory<TValue> = (context: ResolutionContext) => TValue
export type ClassConstructor<TValue> = new () => TValue
```

Implementation may adjust exact type names only if the result remains clearer and the task
result documents the reason.

## Planned Error Baseline

- Missing `get()` provider: `ProviderNotFoundError` or equivalent.
- Duplicate `bind()` for same token ID: `DuplicateProviderError` or equivalent.
- Provider-level cycle: `ProviderCycleError` or equivalent with token ID path.
- Mutation after successful `freeze()`: `ContainerFrozenError` or equivalent.

Error messages must be readable and include token IDs where relevant. Full diagnostic
reports, formatter and `SagifireIocError` remain Stage 8.

## Acceptance Criteria for This Run

- [x] `createContainer()` public function is exported from `@sagifire/ioc/container`.
- [x] Root `@sagifire/ioc` exports Stage 4 container API or the run documents why only the
  subpath export is used.
- [x] `bind(token).toValue(value)` resolves via `runtime.get(token)`.
- [x] Value providers return the same value for each resolution.
- [x] `bind(token).toFactory(factory)` resolves through sync factory context.
- [x] `bind(token).toClass(ClassConstructor)` creates no-argument class instances.
- [x] Factory/class providers are transient by default.
- [x] `.singleton()` caches factory/class provider result per frozen runtime.
- [x] `.transient()` creates a new factory/class provider result per resolution.
- [x] `freeze()` returns `Promise<ContainerRuntime>`.
- [x] Registering providers after successful `freeze()` fails.
- [x] Runtime has no provider mutation API.
- [x] `runtime.get()` throws readable typed error for missing provider.
- [x] `runtime.tryGet()` returns `undefined` for missing provider.
- [x] `tryGet()` still throws for provider cycles or provider execution failures.
- [x] Same token ID from different token objects resolves the same provider.
- [x] Duplicate single-provider token registration fails.
- [x] Provider cycles are detected with readable token ID path.
- [x] Runtime tests cover all Stage 4 behavior.
- [x] Type-level assertions cover `runtime.get()`, `tryGet()` and factory context inference.
- [x] Scope guard checks confirm no Stage 5+ API was implemented.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
