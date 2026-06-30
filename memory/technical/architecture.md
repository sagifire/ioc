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

Stage 7 async providers/resources baseline:

- Stage 7 implements async single-provider bindings through `bind().toAsyncFactory()` and
  `bind().toAsyncResource()`.
- Stage 7 does not implement async multi-provider contributions through `add()` and does
  not add `getAllAsync()` / `scope.getAllAsync()`.
- `runtime.getAsync()` and `runtime.tryGetAsync()` resolve sync providers and async
  single-provider bindings.
- `scope.getAsync()` resolves sync providers, async providers and scoped async
  providers/resources through the active scope.
- `ResolutionContext` exposes `getAsync()` and `tryGetAsync()` for provider factories.
- Async eager singleton providers/resources initialize during `freeze()` and are available
  through sync `get()` after runtime is ready.
- Async lazy providers/resources initialize on `getAsync()` and remain inaccessible
  through `get()` / `tryGet()`, even after initialization.
- Failed lazy async initialization is not cached by default; a later `getAsync()` may
  retry.
- Singleton/scoped in-flight lazy initialization is de-duplicated until it resolves or
  rejects.
- `runtime.dispose()` disposes initialized singleton resources and prevents further
  runtime resolution or scope creation.
- `scope.dispose()` disposes initialized scoped resources and prevents further scope
  resolution.
- Runtime disposal does not silently dispose live scopes or maintain a global scope
  registry.

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
runtime.dispose(): Promise<void>
```

Important rule: `get()` must never return `Promise`.

Factories receive a resolution context:

```ts
export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
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
- Async multi-provider resolution is not part of Stage 7 because no `getAllAsync()` API is
  defined yet.

Provider categories:

- Sync provider: initialized immediately or lazily, accessed via `get()`.
- Async eager provider: initialized during `freeze()` / `compose()`, accessed via `get()`
  after runtime is ready.
- Async lazy provider: initialized on first `getAsync()`, accessed only via `getAsync()`.

Failed lazy async initialization is not cached by default; the next `getAsync()` may retry.
Do not implement `cacheFailure()` unless a later task explicitly includes it.

Stage 7 lifecycle decisions:

- `toAsyncFactory()` defaults to transient lazy provider.
- Async factory providers may be `transient`, `singleton` or `scoped`.
- `eager()` is valid only for singleton async providers/resources.
- `toAsyncResource()` requires explicit `singleton()` or `scoped()` ownership.
- Async resources default to lazy initialization unless `eager()` is explicitly chosen.
- Scoped async providers/resources initialize lazily through `scope.getAsync()`.
- `get()` / `tryGet()` on async lazy provider/resource throws `AsyncProviderAccessError`.
- `tryGetAsync()` returns `undefined` only for truly missing single providers and does not
  suppress provider/resource/disposal errors.

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
- After disposal, runtime resolution and scope creation fail with `RuntimeDisposedError`.
- Runtime disposal owns singleton resources only and must not create hidden global
  ownership of live scopes.

Scope disposal:

- `scope.dispose()` disposes scoped resources.
- Disposal is idempotent.
- After disposal, scope resolution fails with `ScopeDisposedError`.
- Scopes created before runtime disposal cannot resolve after runtime disposal, but their
  own `scope.dispose()` remains valid and idempotent for initialized scoped resources.
- If a disposer fails, the failure must not be hidden. Stage 7 may reject disposal with the
  first disposer failure after best-effort cleanup of remaining initialized resources;
  aggregate diagnostic formatting belongs to Stage 8+.

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

`scope.getAsync()` starts with Stage 7 async providers/resources. `scope.getAllAsync()` is
not part of the current public API.

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

Stage 9 implementation order:

- module definition foundation;
- composer builder, bindings and static validation;
- module setup context and private providers;
- composed runtime and exported capability registry;
- inspection API.

Stage 9 public runtime visibility model:

- module setup may register private providers;
- declared `provides` metadata defines exported capabilities;
- `composer.bind()` satisfies required ports but does not automatically make a token a
  public runtime capability;
- composed runtime public resolution is capability-gated and must not expose module
  private providers;
- module-bound setup/provider contexts may resolve their own private providers, declared
  required ports and allowed public capabilities, but not another module's private
  providers.

Stage 9 validation model:

- module IDs must be unique;
- provided single tokens must be unique;
- required ports must be satisfied by declared provided capabilities or explicit composer
  bindings;
- invalid binding targets must fail validation;
- `composer.validate()` returns `DiagnosticReport`;
- `composer.compose()` validates and throws a typed diagnostics error when the graph is
  invalid.

Stage 9 did not implement module-level cycle detection, capability dependency edges or
binding dependency edges. These belong to Stage 10.

Stage 10 graph edge model:

- dependency edges are safe inspection metadata over explicit module declarations and
  composer bindings;
- capability dependency edge means a consumer module required port is satisfied by another
  module's declared provided capability;
- binding dependency edge means a consumer module required port is satisfied by an explicit
  composition-level binding;
- if a required port is satisfied by an explicit binding, the graph records a binding edge
  and does not also create a module-to-module capability edge for that required port;
- dependency edge metadata must include module IDs, token IDs and edge kind, but must not
  expose provider values, resource instances, scope-local values or private runtime
  internals;
- edge order must be deterministic and based on module/required port registration order.

Stage 10 cycle model:

- module cycles are detected over module-to-module capability dependency edges;
- binding edges represent application-level composition adapters and do not create
  module-level cycles by themselves;
- cycle diagnostics include a module ID path and token/capability path;
- `composer.validate()`, `composer.inspect().validation`, `composer.prepare()` and
  `composer.compose()` all surface module cycle diagnostics consistently;
- valid acyclic graphs compose successfully.

Stage 10 binding inference boundary:

- composer validation and inspection must not execute binding factories, module provider
  factories or async resources to infer hidden dependency edges;
- provider-level cycles discovered inside factories remain the responsibility of existing
  container/runtime diagnostics;
- if future stages need declarative binding-internal dependencies, they must add an
  explicit public API rather than hidden tracing.

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

Stage boundary:

- Stage 9 owns missing required ports, duplicate module IDs, duplicate provided single
  tokens, invalid bindings, private provider exposure and safe inspection.
- Stage 10 owns module-level cycles, capability dependency edges, binding dependency edges
  and cycle path diagnostics.
- Stage 10 binding dependency edges are static required-port -> composition-binding edges;
  binding factory internals are not inferred by executing user code during validation.

## Diagnostics

Diagnostic layer contains:

- `SagifireIocError`;
- typed error classes;
- `Diagnostic`;
- `DiagnosticReport`;
- `formatDiagnostics()`.

All common failure modes should produce typed errors with codes, useful details and readable
messages.

Stage 8 diagnostics baseline:

- Error code convention is `SAGIFIRE_IOC_<AREA>_<REASON>` in stable uppercase snake case.
- Existing Stage 3-7 public error code strings should be preserved unless a direct conflict
  is found.
- `SagifireIocError` is the shared base class for public IoC diagnostics errors.
- `SagifireIocError` exposes `code`, readable `message`, optional `details` and optional
  `cause`.
- Existing public typed errors from tokens, container, context, async access and disposal
  should extend `SagifireIocError` while preserving their concrete class names and
  `instanceof` behavior.
- Common Stage 3-7 failures covered by Stage 8 include invalid token IDs, missing
  providers, duplicate providers, single/multi-provider mismatches, provider cycles,
  frozen container mutation, invalid async lazy sync access, disposed runtime, invalid
  provider lifecycle, invalid scope, disposed scope and duplicate scope-local values.
- `details` should contain safe structured diagnostic data such as token IDs, token ID
  paths, expected/actual provider kinds, access methods, actions, lifecycle modes and
  scope reasons.
- `details` must not expose provider values, resource instances, scope-local values or
  private runtime internals.
- `Diagnostic` contains `code`, `severity`, `message` and optional `details`.
- `DiagnosticReport` contains `ok` and readonly diagnostics.
- `formatDiagnostics(report)` produces deterministic plain text output that is readable in
  logs and useful when pasted into Codex.
- Diagnostics formatting must stay runtime-agnostic: no Node-only APIs, terminal colors,
  `process`, `Buffer` or framework dependencies.
- Composer/module graph diagnostics are not part of Stage 8 because module composition
  starts in Stage 9. Duplicate module IDs, missing required ports, invalid bindings,
  private provider exposure and module cycles belong to composer stages.

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
