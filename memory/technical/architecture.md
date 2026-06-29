# Architecture

Source trace:

- `SPEC.md` sections 1-3 and 8-31.
- `AGENTS.md` architecture boundaries.

## Overview

`@sagifire/ioc` is a modular IoC and composition kernel for TypeScript applications.

The architecture separates low-level dependency resolution from higher-level module
composition and framework adapters:

```text
tokens
    typed tokens, namespaces, metadata

container
    IoC container, providers, lifetimes, sync/async resolution

context
    scoped containers, request/operation scopes, scoped resources

composer
    module graph, module scopes, capabilities, required ports, bindings

dsl
    ergonomic configurators over object-configuration API

diagnostics
    typed errors, graph-aware validation reports, readable error formatting

testing
    overrides, fake modules, test runtime, graph assertions

next
    Next.js App Router helpers and adapters
```

## Package Boundaries

### `@sagifire/ioc`

Core package.

Contains:

- tokens
- container
- context
- composer
- DSL
- diagnostics
- core types
- lifecycle/resource abstractions

Does not contain:

- Next.js imports
- React imports
- Node-only APIs
- filesystem access
- `process.env` access
- decorators as required API
- `reflect-metadata`
- global singleton container

### `@sagifire/ioc-next`

Next.js integration package.

Contains:

- Next.js App Router runtime helpers
- request context helpers
- server action helpers
- route handler helpers
- runtime singleton / cached runtime helpers
- examples for page/action/route integration

May depend on:

- `@sagifire/ioc`
- `next`
- `react`, only if truly needed

Must not affect core API.

### `@sagifire/ioc-testing`

Testing package.

Contains:

- test composer
- test runtime factory
- override helpers
- fake module helpers
- dependency graph assertions
- diagnostic assertions
- test scope helpers

May depend on:

- `@sagifire/ioc`

Must not mutate production runtime. Overrides create a new isolated runtime/configuration.

## Directional Rules

- Container does not know about modules.
- Context does not know about Next.js.
- Composer uses container/context to build application graph.
- DSL works over explicit object-configuration API.
- Next.js adapter lives outside core.
- Testing helpers produce isolated test runtime/configuration.

## Tokens

Tokens are the primary identity mechanism for dependencies, capabilities, public APIs,
required ports and multi-provider collections.

Base contract:

```ts
export interface Token<TValue> {
    readonly id: string
    readonly description?: string
    readonly __type?: TValue
}
```

The `__type` field is phantom type metadata and must not be used at runtime.

Token creation:

```ts
export function token<TValue>(
    id: string,
    options?: {
        readonly description?: string
    }
): Token<TValue>
```

Token namespaces create stable prefixed IDs:

```ts
const contactRequests = namespace('contact-requests')

export const CONTACT_REQUESTS_PUBLIC_API =
    contactRequests.token<ContactRequestsPublicApi>('public-api')
```

Token rules:

- Token ID must be stable.
- Token ID must be unique within a composed runtime.
- Token object identity must not be required for matching.
- Token ID is canonical runtime identity.
- Tokens must not be created dynamically inside request handlers or use cases.

## Container

The container provides typed dependency registration and resolution. It has two phases:

- Configuration phase: mutable, providers can be registered.
- Runtime phase: frozen/immutable, providers cannot be added, removed or replaced.

Required API shape:

```ts
const container = createContainer()

container.bind(LOGGER).toValue(logger)
container.bind(DB).toFactory(({ get }) => createDbClient())
container.bind(USER_REPOSITORY).toClass(UserRepository).singleton()

const runtime = await container.freeze()

const logger = runtime.get(LOGGER)
```

Provider binding support:

- `bind(token).toValue(value)`
- `bind(token).toFactory(factory)`
- `bind(token).toClass(ClassConstructor)`
- `bind(token).toAsyncFactory(factory)`
- `bind(token).toAsyncResource(factory)`

Multi-provider support:

- `bind(token)` is for single provider tokens.
- `add(token)` is for multi-provider tokens.
- `get(token)` resolves single-provider tokens and fails for multi-provider tokens.
- `getAll(token)` resolves multi-provider collections.
- `getAll(token)` returns an empty array if token has no provider registration.

Stage 5 multi-provider baseline:

- Stage 5 implements `add().toValue()`, `add().toFactory()`, `runtime.getAll()` and
  `ResolutionContext.getAll()`.
- Single-provider and multi-provider registrations are strict modes for a token ID:
  `bind()` and `add()` must not be mixed for the same token ID.
- `get()` fails for a multi-provider token even if only one provider was registered.
- `getAll()` fails for a token registered through `bind()`.
- `getAll()` returns an empty array for a token with no provider registration.
- `getAll()` returns a fresh `TValue[]` in registration order; mutating the returned array
  does not mutate runtime provider storage.
- `add().toValue()` is singleton by definition.
- `add().toFactory()` is transient by default and supports `.singleton()` /
  `.transient()`.

Stage 6 scopes baseline:

- Stage 6 implements `runtime.createScope()`, `runtime.withScope()`, sync `Scope.get()`,
  `Scope.tryGet()`, `Scope.getAll()`, `scope.dispose()` and scoped lifetime for sync
  providers.
- Stage 6 extends `LifetimeBinding` with `.scoped()`.
- `.scoped()` applies to sync single-provider `toFactory()` / `toClass()` and
  multi-provider `toFactory()` contributions.
- `toValue()` remains singleton by definition and does not get a scoped variant.
- Scoped providers create one value per scope and cannot be resolved through runtime-level
  APIs without active scope.
- Factory `ResolutionContext` is scope-bound when the provider is resolved through a
  `Scope`, so scoped dependencies and scope-local values are visible only through active
  scope resolution.
- Scope-local values are supplied when creating the scope and are not mutable through public
  scope APIs after scope creation.
- Scope-local single values override runtime single-provider resolution for the same token
  ID within that scope.
- Scope-local multi values extend runtime multi-provider collections in runtime-first,
  scope-local-after order.
- Single/multi kind conflicts fail; scope-local values must not silently convert token kind.
- `scope.dispose()` is idempotent. After disposal, sync scope resolution fails with a
  readable typed error.
- Stage 6 does not implement `getAsync()`, async providers/resources, runtime disposal or
  resource disposal.

Lifetimes:

- `singleton` - one instance per frozen runtime.
- `transient` - new instance per resolution.
- `scoped` - one instance per scope.

Recommended defaults:

- `toValue`: singleton.
- `toFactory`: transient by default.
- `toClass`: transient by default.
- `toAsyncFactory`: transient by default unless `singleton()` is specified.
- `toAsyncResource`: singleton or scoped must be explicit.

Stage 4 sync container baseline:

- Stage 4 implements only single-provider sync bindings.
- `freeze()` uses the async-compatible public contract:
  `Promise<ContainerRuntime>`, even before async providers exist.
- Stage 4 `ResolutionContext` exposes only `get()` and `tryGet()`.
- `toValue` is singleton by definition.
- `toFactory` is transient by default and can be changed with `.singleton()` or
  `.transient()`.
- `toClass` is transient by default and can be changed with `.singleton()` or
  `.transient()`.
- `toClass()` accepts no-argument class constructors only (`new () => TValue`).
- Classes with dependencies must be wired explicitly through `toFactory(({ get }) => ...)`.
- `toClass()` must not use decorators, `reflect-metadata`, constructor parameter names or
  constructor metadata.
- Multi-provider, scopes, async providers/resources and disposal start only at later
  roadmap stages.

Runtime resolution API:

```ts
runtime.get<TValue>(token: Token<TValue>): TValue
runtime.tryGet<TValue>(token: Token<TValue>): TValue | undefined
runtime.getAll<TValue>(token: Token<TValue>): TValue[]
runtime.createScope(options?: CreateScopeOptions): Scope
runtime.withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
runtime.withScope<TValue>(
    options: CreateScopeOptions,
    callback: ScopeCallback<TValue>
): Promise<TValue>
runtime.getAsync<TValue>(token: Token<TValue>): Promise<TValue>
runtime.tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
```

Important rule: `get()` must never return `Promise`.

Factories receive a resolution context:

```ts
export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
}
```

The container must detect provider-level cycles such as `A -> B -> C -> A` and report
cycle path, token IDs and provider type when possible.

Resolving scoped providers without active scope must throw `InvalidScopeError`.

## Async Model

The library supports async initialization, but does not make normal dependency resolution
async by default.

Rules:

- `compose()` / `freeze()` is async.
- `get()` is sync and never returns `Promise`.
- `getAsync()` is explicit.
- Async eager providers initialize during compose/freeze.
- Async eager providers are available through `get()` after compose/freeze.
- Async lazy providers are available only through `getAsync()`.
- Async resources can have dispose callbacks.

Provider categories:

- Sync provider: initialized immediately or lazily, accessed via `get()`.
- Async eager provider: initialized during `freeze()` / `compose()`, accessed via `get()`
  after runtime is ready.
- Async lazy provider: initialized on first `getAsync()`, accessed only via `getAsync()`.

Failed lazy async initialization is not cached by default; the next `getAsync()` may retry.
Do not implement `cacheFailure()` unless a later task explicitly includes it.

## Resources And Disposal

Resource contract:

```ts
export interface Resource<TValue> {
    readonly value: TValue
    readonly dispose?: () => void | Promise<void>
}
```

Runtime disposal:

- `runtime.dispose()` disposes initialized singleton resources.
- Disposal is idempotent.
- Disposers are called in safe reverse initialization order when possible.
- After disposal, `get()` / `getAsync()` fail with `RuntimeDisposedError`.

Scope disposal:

- `scope.dispose()` disposes scoped resources.
- Disposal is idempotent.
- After disposal, scope resolution fails with `ScopeDisposedError`.

## Context And Scopes

Scopes represent request, operation or task-local resolution context.

Long-term scope APIs include:

- `scope.get()`
- `scope.tryGet()`
- `scope.getAll()`
- `scope.getAsync()`
- `scope.dispose()`

`runtime.withScope()` must create a scope, pass it to user code and dispose it automatically.

Context must not become a service locator. Application APIs should receive scope/context
explicitly where needed.

Stage 6 implements the sync subset:

```ts
const scope = runtime.createScope({
    values: [
        [REQUEST_ID, requestId]
    ],
    multiValues: [
        [REQUEST_HANDLERS, requestHandler]
    ]
})

const value = scope.get(SOME_TOKEN)
const values = scope.getAll(SOME_COLLECTION)

await scope.dispose()
```

`CreateScopeOptions` exact shape may use tuple entries, object entries or helper functions,
but it must preserve explicit token/value pairing and avoid filesystem or framework
discovery.

Stage 6 precedence rules:

- local single value + runtime single provider: local value wins inside that scope;
- local multi values + runtime multi providers: runtime values resolve first, then local
  values in declaration order;
- local single value + runtime multi provider: invalid;
- local multi values + runtime single provider: invalid;
- local single and local multi entries for same token ID: invalid;
- duplicate local single values for same token ID: invalid;
- multiple local multi values for same token ID: valid.

Stage 6 sync scope APIs:

- `scope.get()`
- `scope.tryGet()`
- `scope.getAll()`
- `scope.dispose()`

`scope.getAsync()` starts with Stage 7 async providers/resources.

## Composer And Modules

Composer builds application graph from explicit modules and bindings.

Responsibilities:

- register modules;
- validate module IDs;
- validate provided capabilities;
- validate required ports;
- apply explicit bindings;
- compose immutable runtime;
- expose safe graph inspection.

Modules declare what they provide and require. Required ports are owned by consumer
modules. Public APIs/capabilities are exported explicitly. Private module providers are not
available through runtime.

Composer APIs include:

- `defineModule()`
- `createComposer()`
- `composer.use()`
- `composer.bind()`
- `composer.compose()`
- `composer.validate()`
- `composer.inspect()`
- `runtime.inspect()`

## Bindings

Bindings connect required ports to actual providers or adapters.

Expected use:

- module `contact-requests` owns `CONTACT_REQUESTS_AUTH_READER` as a required port;
- module `auth` provides `AUTH_PUBLIC_API`;
- application composition binds the required port to an adapter over `AUTH_PUBLIC_API`.

This preserves module isolation and prevents modules from directly reaching into each
other's internals.

## Dependency Graph Validation

Validation must detect:

- missing required dependencies;
- duplicate provided single tokens;
- provider cycles;
- module-level cycles;
- invalid bindings;
- private provider exposure.

Diagnostics must include useful token IDs, module IDs and cycle paths.

## Diagnostics

Diagnostic layer contains:

- `SagifireIocError`;
- typed error classes;
- `Diagnostic`;
- `DiagnosticReport`;
- `formatDiagnostics()`.

All common failure modes should produce typed errors with codes, useful details and readable
messages.

## DSL

DSL provides ergonomic configurators:

- `module()`
- `defineApp()`
- `adapt()`
- bind helper DSL

Restrictions:

- no decorators required;
- no constructor metadata magic;
- no hidden graph;
- object configuration API remains fully usable.

## Inspection API

Inspection should expose safe metadata:

- modules;
- capabilities;
- required dependencies;
- bindings;
- provider lifetimes;
- multi-provider tokens;
- dependency edges;
- diagnostic status.

Do not expose actual private provider values unless explicitly safe.

## Next.js Adapter

`@sagifire/ioc-next` integrates at framework boundaries:

- cached runtime helper through `createNextRuntime()`;
- request context helper through `createNextRequestContext()`;
- route handler scope helper;
- server action scope helper;
- page integration examples.

The core pattern:

- await runtime at boundary;
- create scope at boundary;
- call public API from module;
- keep business logic out of route/page/action;
- dispose scope after handler/action.

## Testing Package

`@sagifire/ioc-testing` provides:

- isolated test runtime factory;
- test composer;
- override helpers;
- fake modules;
- module test harness;
- graph assertions;
- diagnostic assertions.

Overrides apply before compose and never mutate frozen production runtime.

## Reference Architecture Example

The canonical example uses two modules:

- `auth` provides `AUTH_PUBLIC_API`.
- `contact-requests` owns `CONTACT_REQUESTS_AUTH_READER` as required port and provides
  `CONTACT_REQUESTS_PUBLIC_API`.

Composition binds `CONTACT_REQUESTS_AUTH_READER` to an adapter over `AUTH_PUBLIC_API`.
This demonstrates consumer-owned required ports, explicit bindings and module isolation.
