# Async Model

Async support in `@sagifire/ioc` is explicit. The container can initialize async providers
and resources, but it does not make normal dependency access async by default.

The central rule is unchanged:

```text
get() is synchronous: it does not initialize lazy async providers or turn sync resolution
into Promise-based access.
```

Use `getAsync()` when a token may be backed by a lazy async provider or resource.

## API Summary

Async APIs are available on the immutable runtime, scopes and provider factory context:

```ts
const value = await runtime.getAsync(TOKEN)
const maybeValue = await runtime.tryGetAsync(TOKEN)

const scope = runtime.createScope()
const scopedValue = await scope.getAsync(SCOPED_TOKEN)
```

`tryGetAsync()` returns `undefined` only for a truly missing single provider. It does not
hide provider errors, lifecycle errors or disposal errors.

There is no `getAllAsync()` or async multi-provider contribution API in the current core
surface. Multi-providers use sync `add().toValue()` and `add().toFactory()`.

## Sync Providers Through Async APIs

`getAsync()` can resolve ordinary sync providers. This is useful when a higher-level
factory wants a uniform async code path.

```ts
container.bind(LOGGER).toValue(logger)

const runtime = await container.freeze()

const loggerFromAsyncApi = await runtime.getAsync(LOGGER)
```

Sync providers are still available through `get()`.

This does not convert `toFactory()` into an async provider API. A sync factory must return
the final sync value; if it returns a `Promise` or thenable, `get()`, `tryGet()`,
`getAsync()`, scoped resolution and `getAll()` fail with `SyncFactoryPromiseError`. Use
`toAsyncFactory()` for Promise-producing factories.

`toValue()` remains exact value storage. If an application intentionally stores a
`Promise` as a value, `get()` returns that value unchanged; it still has not performed async
provider initialization.

## Eager Async Providers

An eager async provider initializes during `freeze()`. Because `freeze()` awaits that work,
the resolved runtime can expose the value through sync `get()`.

```ts
interface Config {
    readonly apiBaseUrl: string
}

const CONFIG = token<Config>('docs.config')

container
    .bind(CONFIG)
    .toAsyncFactory(async () => ({
        apiBaseUrl: 'https://example.invalid'
    }))
    .singleton()
    .eager()

const runtime = await container.freeze()

const config = runtime.get(CONFIG)
```

`eager()` is valid only for singleton async providers and singleton async resources. It is
not valid for transient or scoped async providers.

## Lazy Async Providers

Async factories are lazy by default. A lazy async provider initializes on the first
`getAsync()` call.

```ts
interface UserDirectory {
    findName(id: string): Promise<string | undefined>
}

const USER_DIRECTORY = token<UserDirectory>('docs.user-directory')

container.bind(USER_DIRECTORY).toAsyncFactory(async ({ getAsync }) => {
    const config = await getAsync(CONFIG)

    return createUserDirectory(config)
})

const runtime = await container.freeze()

const directory = await runtime.getAsync(USER_DIRECTORY)
```

Lazy async providers stay behind the async API. Calling `runtime.get(USER_DIRECTORY)` or
`runtime.tryGet(USER_DIRECTORY)` throws `AsyncProviderAccessError`, even after the provider
has initialized through `getAsync()`.

Async factory lifetimes:

- default: transient lazy provider;
- `singleton()`: one initialized value per runtime;
- `scoped()`: one initialized value per scope;
- `eager()`: singleton-only initialization during `freeze()`;
- `lazy()`: explicit lazy mode.

Singleton and scoped lazy initialization is de-duplicated while it is in flight. Concurrent
requests for the same singleton provider share one pending initialization. Concurrent
requests for the same scoped provider share one pending initialization within that scope.

## Retry Behavior

Failed lazy async initialization is not cached.

```ts
let attempts = 0

container
    .bind(CONFIG)
    .toAsyncFactory(async () => {
        attempts += 1

        if (attempts === 1) {
            throw new Error('temporary configuration failure')
        }

        return {
            apiBaseUrl: 'https://example.invalid'
        }
    })
    .singleton()

const runtime = await container.freeze()

await runtime.getAsync(CONFIG) // rejects
const config = await runtime.getAsync(CONFIG) // retries and resolves
```

After a singleton provider resolves successfully, later `getAsync()` calls return the
cached value. Transient async providers run again for each resolution.

## Async Resources

Use `toAsyncResource()` when initialization also creates cleanup work.

```ts
interface Database {
    query(sql: string): Promise<readonly unknown[]>
    close(): Promise<void>
}

const DATABASE = token<Database>('docs.database')

container
    .bind(DATABASE)
    .toAsyncResource(async () => {
        const database = await connectDatabase()

        return {
            value: database,
            dispose() {
                return database.close()
            }
        }
    })
    .singleton()
```

Resource ownership must be explicit:

- `singleton()` resources are owned by the runtime;
- `scoped()` resources are owned by the scope that initialized them;
- transient async resources are not supported;
- missing resource ownership fails during `freeze()`.

Async resources are lazy by default unless `eager()` is explicitly chosen on a singleton
resource.

## Scoped Async Providers And Resources

Scoped async providers and resources must be resolved through an active scope.

```ts
interface UnitOfWork {
    readonly requestId: string
    commit(): Promise<void>
}

const REQUEST_ID = token<string>('docs.request-id')
const UNIT_OF_WORK = token<UnitOfWork>('docs.unit-of-work')

container
    .bind(UNIT_OF_WORK)
    .toAsyncResource(async ({ getAsync }) => {
        const requestId = await getAsync(REQUEST_ID)
        const unit = await beginUnitOfWork(requestId)

        return {
            value: unit,
            dispose() {
                return unit.commit()
            }
        }
    })
    .scoped()

const runtime = await container.freeze()

await runtime.withScope(
    {
        values: [[REQUEST_ID, 'request-1']]
    },
    async (scope) => {
        const unit = await scope.getAsync(UNIT_OF_WORK)

        await unit.commit()
    }
)
```

Resolving a scoped async provider through `runtime.getAsync()` fails with
`InvalidScopeError` because the runtime has no active scope.

## Disposal

`runtime.dispose()` disposes initialized singleton resources and prevents further runtime
resolution or scope creation.

```ts
const runtime = await container.freeze()
const database = await runtime.getAsync(DATABASE)

await database.query('select 1')
await runtime.dispose()
```

Runtime disposal rules:

- disposal is idempotent;
- initialized singleton resources are disposed in reverse initialization order where
  possible;
- uninitialized lazy singleton resources are not created just to dispose them;
- after disposal, `get()`, `tryGet()`, `getAsync()`, `tryGetAsync()` and `createScope()`
  fail with `RuntimeDisposedError`;
- runtime disposal does not maintain a hidden registry of live scopes and does not
  automatically dispose scoped resources.

`scope.dispose()` disposes initialized scoped resources and prevents further scope
resolution.

```ts
const scope = runtime.createScope({
    values: [[REQUEST_ID, 'request-1']]
})

await scope.getAsync(UNIT_OF_WORK)
await scope.dispose()
```

Scope disposal rules:

- disposal is idempotent;
- initialized scoped resources are disposed in reverse initialization order where possible;
- after disposal, `scope.get()`, `scope.tryGet()`, `scope.getAll()` and `scope.getAsync()`
  fail with `ScopeDisposedError`;
- a scope created before runtime disposal cannot resolve after runtime disposal, but
  `scope.dispose()` remains valid for cleanup of already initialized scoped resources.

If a disposer fails, disposal rejects after best-effort cleanup of the remaining initialized
resources. The error is not hidden.

## Factory Context

Async factories receive the same `ResolutionContext` as sync factories, with both sync and
async accessors:

```ts
container.bind(USER_DIRECTORY).toAsyncFactory(async (context) => {
    const logger = context.get(LOGGER)
    const config = await context.getAsync(CONFIG)
    const maybeCache = await context.tryGetAsync(CACHE)

    return createUserDirectory(config, logger, maybeCache)
})
```

The context is scope-bound when the provider is resolved through a scope. That means
`context.getAsync(REQUEST_ID)` can see scope-local values only in scoped resolution.

## Runnable Example

See [`examples/async-db-resource`](../examples/async-db-resource/README.md) for a complete
workspace example with an in-memory database resource, retry after failed lazy
initialization, scoped unit-of-work disposal and runtime disposal. It uses no external
database server.

## Sync/Async Boundary Checklist

- Use `get()` only for sync providers and eager singleton async providers.
- Use `getAsync()` for lazy async providers and async resources.
- Use `toAsyncFactory()` for factories that return a `Promise`; sync `toFactory()` results
  must not be `Promise` or thenable values.
- Do not document or build code that expects `get()` to perform async provider resolution.
- Do not use async multi-provider collections; no `getAllAsync()` exists.
- Do not hide request or operation scope in a global current-context API.
- Always dispose runtimes and scopes that own initialized resources.
