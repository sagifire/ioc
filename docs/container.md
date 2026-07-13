# Container

The container is the low-level dependency registry in `@sagifire/ioc`. Use it directly for
small applications, infrastructure wiring or focused tests. Use the composer when you need
module declarations, required ports, public capabilities and graph validation.

The container has two phases:

- configuration phase: create a container and register providers;
- runtime phase: call `freeze()` and resolve from the immutable runtime.

`freeze()` is async, but normal resolution stays sync. `get()` does not initialize lazy
async providers or turn sync resolution into a `Promise`.

## Tokens

Every dependency is addressed by a typed token.

```ts
import { namespace, token } from '@sagifire/ioc'

interface Logger {
    log(message: string): void
}

const LOGGER = token<Logger>('docs.logger')

const app = namespace('docs.app')
const REQUEST_ID = app.token<string>('request-id')
```

Token IDs are the runtime identity. Two token objects with the same ID resolve the same
provider. Declare tokens at stable boundaries instead of creating them dynamically inside
request handlers.

For collection contracts, `multiToken<T>()`, `contributionToken<T>()` and their namespace
variants are type-level naming helpers over the same token identity model. They do not add
runtime cardinality metadata to token objects. Container registration still enforces
single/multi behavior through `bind()` vs `add()`, and composed runtimes enforce
cardinality from module/composer declarations.

## Single Providers With `bind()`

`bind(token)` registers one provider for a token ID.

```ts
import { createContainer, token } from '@sagifire/ioc'

interface Logger {
    log(message: string): void
}

interface UserRepository {
    findName(id: string): string | undefined
}

const LOGGER = token<Logger>('docs.logger')
const USER_REPOSITORY = token<UserRepository>('docs.user-repository')

const container = createContainer()

container.bind(LOGGER).toValue({
    log(message) {
        console.log(message)
    }
})

container.bind(USER_REPOSITORY).toFactory(({ get }) => {
    const logger = get(LOGGER)

    return {
        findName(id) {
            logger.log(`find user ${id}`)

            return id === '1' ? 'Ada' : undefined
        }
    }
})

const runtime = await container.freeze()
const repository = runtime.get(USER_REPOSITORY)
```

Supported sync provider forms:

- `toValue(value)` stores a singleton value.
- `toFactory(factory)` calls a factory with a typed `ResolutionContext`.
- `toClass(ClassConstructor)` creates a no-argument class instance.

`toFactory()` must return the final sync value. If a JavaScript caller or type escape makes
a sync factory return a `Promise` or thenable, resolution throws `SyncFactoryPromiseError`.
Use `toAsyncFactory()` and `getAsync()` for Promise-producing factories.

`toValue()` stores the exact value you pass. If that value is intentionally a `Promise`,
the runtime returns that same value; this is ordinary sync value storage, not async provider
resolution.

`toClass()` does not read constructor metadata. Classes with dependencies should be wired
through `toFactory()`.

## Lifetimes

Factory and class providers are transient by default. Use lifetime modifiers before
`freeze()`.

```ts
container.bind(CACHE).toFactory(createCache).singleton()
container.bind(HANDLER).toFactory(createHandler).transient()
container.bind(REQUEST_STATE).toFactory(createRequestState).scoped()
```

Lifetimes:

- `singleton()` creates one value per frozen runtime.
- `transient()` creates a new value for each resolution.
- `scoped()` creates one value per active scope.

`toValue()` is already a singleton value and has no lifetime modifier.

Runtime-level resolution of a scoped provider fails because there is no active scope:

```ts
const runtime = await container.freeze()

runtime.get(REQUEST_STATE) // throws InvalidScopeError
```

Resolve scoped providers through `scope.get()` or `scope.getAsync()`.

## Sync Resolution

The runtime exposes sync single-provider APIs:

```ts
const logger = runtime.get(LOGGER)
const maybeLogger = runtime.tryGet(LOGGER)
```

`get()` throws when a single provider is missing. `tryGet()` returns `undefined` only when
the provider is missing; it does not suppress provider failures.

Provider factories receive the same typed sync APIs:

```ts
container.bind(USER_REPOSITORY).toFactory((context) => {
    const logger = context.get(LOGGER)
    const optionalCache = context.tryGet(CACHE)

    return createUserRepository(logger, optionalCache)
})
```

Provider-level cycles are detected during resolution and reported with a readable token ID
path.

## Multi-Providers With `add()`

Use `add(token)` for ordered collections of contributions.

```ts
interface Plugin {
    readonly name: string
    run(): void
}

const PLUGINS = token<Plugin>('docs.plugins')

container.add(PLUGINS).toValue({
    name: 'core',
    run() {}
})

container.add(PLUGINS).toFactory(() => ({
    name: 'feature',
    run() {}
}))

container
    .add(PLUGINS)
    .toAsyncFactory(async () => loadPlugin('remote-feature'))
    .singleton()

const runtime = await container.freeze()
const plugins = await runtime.getAllAsync(PLUGINS)
```

Multi-provider rules:

- `getAll(token)` returns contributions in registration order.
- `getAll(token)` returns an empty array for an unregistered multi token.
- each `getAll()` call returns a fresh array;
- `bind()` and `add()` cannot be mixed for the same token ID;
- `get()` and `tryGet()` fail for multi-provider tokens;
- `getAll()` fails for tokens registered through `bind()`;
- `add()` supports `toValue()`, `toFactory()`, `toAsyncFactory()` and
  `toAsyncResource()` contributions;
- `add().toFactory()` contributions also fail with `SyncFactoryPromiseError` if they return
  a `Promise` or thenable.

Sync and async factory contributions are transient by default and support `singleton()`,
`transient()` and `scoped()`. Async resource contributions require explicit
`singleton()` or `scoped()` ownership; transient resources are unsupported.

`getAllAsync()` resolves mixed sync/async contributions sequentially in registration order
and returns a fresh array only after every contribution succeeds. `getAll()` stays
synchronous: it can read sync contributions and eager singleton async contributions after
successful `freeze()`, but it rejects lazy, transient or scoped async contributions before
executing the collection. Lazy cache warm-up does not change this contract.

No-partial-results means array return atomicity, not transaction rollback of arbitrary
factory side effects. See the complete
[sync/async lifetime and scope truth table](async-model.md#syncasync-lifetime-and-scope-truth-table).

## Scopes

Scopes model request, operation or task-local resolution. They are explicit objects, not
hidden current-context globals.

```ts
import { scopeMultiValue, scopeValue } from '@sagifire/ioc'

const REQUEST_ID = token<string>('docs.request-id')
const AUDIT_TAGS = token<string>('docs.audit-tags')

const scope = runtime.createScope({
    values: [scopeValue(REQUEST_ID, 'request-1')],
    multiValues: [scopeMultiValue(AUDIT_TAGS, 'http'), [AUDIT_TAGS, 'public-api']]
})

const requestId = scope.get(REQUEST_ID)
const auditTags = scope.getAll(AUDIT_TAGS)

await scope.dispose()
```

Scope-local rules:

- local single values override runtime single providers for the same token ID;
- local multi values extend runtime multi providers after runtime contributions;
- duplicate local single values fail deterministically;
- local single and multi values cannot be mixed for the same token ID;
- local values cannot silently convert a runtime single provider into a multi provider, or
  the reverse.

`scopeValue()` and `scopeMultiValue()` are typed helpers. Tuple entries such as
`[REQUEST_ID, 'request-1']` are also supported.

### Child Scopes

Scopes can create explicit child scopes with `scope.createChildScope(options?)` or
`scope.withChildScope(options?, callback)`.

Lifecycle rules:

- child scopes are explicit objects; there is no hidden current scope;
- disposing a child scope does not dispose its parent;
- disposing a parent scope disposes active child scopes in reverse creation order, then
  disposes the parent's own scoped resources;
- `withChildScope()` disposes the child scope after success and failure;
- creating a child from a disposed parent fails with `ScopeDisposedError`.

Value and cache rules:

- child scopes inherit parent scope-local single values;
- child single values shadow inherited parent values for the same token ID;
- child scope-local multi values append after runtime multi providers and inherited parent
  multi values;
- child local values cannot change an inherited token between single and multi kind;
- child scopes have their own scoped provider cache and do not reuse the parent's scoped
  provider instances by default.

```ts
const parent = runtime.createScope({
    values: [[REQUEST_ID, 'request-1']],
    multiValues: [[AUDIT_TAGS, 'http']]
})

const preview = parent.createChildScope({
    values: [[REQUEST_ID, 'preview-1']],
    multiValues: [[AUDIT_TAGS, 'preview']]
})

preview.get(REQUEST_ID) // "preview-1"
parent.get(REQUEST_ID) // "request-1"
preview.getAll(AUDIT_TAGS) // runtime tags, then "http", then "preview"
```

Use child scopes for transaction, impersonation or preview overlays where a nested
operation needs a few token overrides but must not mutate the parent scope.

## Scope-Bound Factories

When a provider is resolved through a scope, its factory context is also scope-bound.

```ts
interface RequestService {
    readonly requestId: string
}

const REQUEST_SERVICE = token<RequestService>('docs.request-service')

container.bind(REQUEST_SERVICE).toFactory(({ get }) => ({
    requestId: get(REQUEST_ID)
}))

const runtime = await container.freeze()
const scope = runtime.createScope({
    values: [[REQUEST_ID, 'request-1']]
})

const service = scope.get(REQUEST_SERVICE)
```

This lets factories see scope-local values and scoped providers only when resolution
happens through an active scope.

## `withScope()`

`withScope()` creates a scope, passes it to the callback and disposes it after the callback
settles.

```ts
const name = await runtime.withScope(
    {
        values: [[REQUEST_ID, 'request-1']]
    },
    async (scope) => {
        const service = scope.get(REQUEST_SERVICE)

        return service.requestId
    }
)
```

The scope is disposed on success and failure. The callback receives the scope explicitly;
there is no hidden ambient scope lookup.

## Immutability And Errors

After a successful `freeze()`:

- the runtime is frozen and exposes no registration APIs;
- late `bind()` or `add()` calls fail;
- captured binding builders cannot register late providers or change lifetimes;
- runtime disposal prevents further resolution and scope creation.

If eager async initialization fails during `freeze()`, no runtime is produced. The rejected
attempt is not cached: a later `freeze()` retries from a fresh runtime snapshot, and the
builder is mutable again until a `freeze()` succeeds. Singleton resources initialized by a
failed eager attempt are disposed before the rejected `freeze()` settles.

Common typed errors include:

- `ProviderNotFoundError` for missing required single providers;
- `DuplicateProviderError` for duplicate single-provider registrations;
- `ProviderKindMismatchError` for single/multi misuse;
- `ProviderCycleError` for provider-level dependency cycles;
- `ContainerFrozenError` for mutation after `freeze()`;
- `SyncFactoryPromiseError` for sync factories that return a `Promise` or thenable;
- `InvalidScopeError` and `ScopeDisposedError` for invalid scope usage;
- `RuntimeDisposedError` for resolving after runtime disposal.

See [Diagnostics](diagnostics.md) for diagnostic reports and formatting.

## Async Boundary

Async single providers/resources are registered on `bind()`, and async collection
contributions are registered on `add()`, with `toAsyncFactory()` and `toAsyncResource()`.
They use explicit `getAsync()` / `getAllAsync()` access unless every relevant async
provider is an eager singleton initialized during `freeze()`.

Use [Async model](async-model.md) for `getAsync()`, eager/lazy initialization, resources,
disposal and retry behavior.
