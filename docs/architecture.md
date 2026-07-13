# Architecture

`@sagifire/ioc` is a TypeScript-native IoC and composition toolkit built around explicit
tokens, immutable runtimes and inspectable dependency graphs.

The core package is runtime-agnostic. It does not assume Node.js, a browser, Next.js,
React, decorators, `reflect-metadata`, filesystem discovery or a global mutable
container. Application code decides where to create the runtime, where to create request or
operation scopes and which public APIs are exposed.

## Package Boundaries

The workspace is split by responsibility:

- `@sagifire/ioc` is the core package. It contains tokens, the container, scopes, composer,
  optional DSL, lifecycle/resource types and diagnostics.
- `@sagifire/ioc-testing` contains test-only helpers: isolated runtimes, overrides, fake
  modules, module harnesses and graph/diagnostic assertions. It never mutates frozen
  production runtimes.
- `@sagifire/ioc-next` contains Next.js App Router boundary helpers. It depends on the
  core package; the core package does not depend on Next.js or React.

The directional rule is simple:

```text
application/framework boundary
    @sagifire/ioc-next
        @sagifire/ioc composer and optional DSL
            @sagifire/ioc container and scopes
                tokens, lifecycle resources and diagnostics

tests
    @sagifire/ioc-testing
        @sagifire/ioc public APIs
```

Core layers are intentionally independent:

- Tokens identify dependencies by stable IDs.
- Container registers and resolves providers.
- Context/scopes add request or operation-local resolution state.
- Composer builds module graphs over the container and scopes.
- DSL is an optional declaration layer over the composer/object APIs.
- Diagnostics expose typed errors, reports and plain text formatting.

The container does not know about modules. Context does not know about Next.js. Testing and
Next helpers sit outside the core runtime.

## Runtime Model

The runtime has a mutable configuration phase and an immutable runtime phase.

```ts
import { createContainer, token } from '@sagifire/ioc'

interface Logger {
    log(message: string): void
}

const LOGGER = token<Logger>('app.logger')

const container = createContainer()

container.bind(LOGGER).toValue({
    log(message) {
        console.log(message)
    }
})

const runtime = await container.freeze()
const logger = runtime.get(LOGGER)
```

After `freeze()`, providers cannot be added, removed or replaced. `freeze()` is async so
eager async providers and resources can initialize before the runtime is returned.

`get()` remains synchronous and never returns a `Promise`. Async single providers use
explicit `getAsync()` access; mixed multi-provider collections use `getAllAsync()`.

For larger applications, the composer adds module declarations, required ports,
capabilities, validation and inspection on top of the same core runtime model. See
[Composer](composer.md) and [Modules](modules.md).

## Tokens

Tokens are the only public identity mechanism for dependency resolution. Token object
identity is not required; the token ID is canonical.

```ts
import { namespace } from '@sagifire/ioc'

const auth = namespace('auth')

export interface AuthPublicApi {
    currentUserId(): string
}

export const AUTH_PUBLIC_API = auth.token<AuthPublicApi>('public-api')
```

Token IDs should be stable and declared at module boundaries, not generated inside request
handlers or use cases. The phantom token type gives `runtime.get(AUTH_PUBLIC_API)` the
`AuthPublicApi` return type without runtime metadata.

## Container And Scopes

The container is the low-level provider registry:

- `bind(token)` registers one provider for a token.
- `add(token)` registers multi-provider contributions.
- `toValue()`, `toFactory()` and `toClass()` register sync providers.
- `toAsyncFactory()` and `toAsyncResource()` register async single providers or async
  multi contributions through the selected `bind()` / `add()` cardinality.
- `singleton()`, `transient()` and `scoped()` control provider lifetime where supported.

Scopes represent request, operation or task-local state:

```ts
import { createContainer, scopeValue, token } from '@sagifire/ioc'

const REQUEST_ID = token<string>('request.id')

const runtime = await createContainer().freeze()
const scope = runtime.createScope({
    values: [scopeValue(REQUEST_ID, 'request-1')]
})

const requestId = scope.get(REQUEST_ID)

await scope.dispose()
```

Scope-local single values override runtime single providers for that scope. Scope-local
multi values extend runtime multi-provider collections after runtime contributions.
Scopes can also create explicit child scopes; parent scope disposal owns active children in
reverse creation order, while child disposal does not dispose the parent. Child scopes
inherit parent values, can override selected tokens and keep a separate scoped provider
cache.

For details, see [Container](container.md) and [Async model](async-model.md).

## Composer And Modules

Modules describe application graph structure explicitly:

- what a module provides as public capabilities;
- what it requires through consumer-owned required ports;
- which private providers are available only inside that module;
- how application composition satisfies required ports through explicit bindings.

The composer validates this graph before creating a composed runtime. It also exposes safe
inspection metadata: modules, capabilities, required ports, bindings, dependency edges and
diagnostics. It does not execute provider factories, binding factories or async resources
to infer hidden dependency edges.

That boundary keeps the graph visible and avoids service locator behavior.

## DSL Boundary

The DSL is optional. It does not replace the object APIs and does not create a second graph
model.

```ts
import { adapter, createComposer, defineApp } from '@sagifire/ioc'

const composer = createComposer().use(authModule).use(contactRequestsModule)

composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using((auth) => {
        return {
            currentUserId() {
                return auth.currentUserId()
            }
        }
    })

const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapter(CONTACT_REQUESTS_AUTH_READER)
            .from(AUTH_PUBLIC_API)
            .using((auth) => {
                return {
                    currentUserId() {
                        return auth.currentUserId()
                    }
                }
            })
    ]
})
```

Both paths stay explicit and inspectable. The DSL must not use decorators,
`reflect-metadata`, constructor metadata, filesystem discovery, global registries or hidden
dependency inference.

The compatibility `adapt(token, factory)` DSL helper remains available for older
factory-binding declarations, but it does not infer adapter source edges. Use
`adapter(target).from(source).using(factory)` when source edges must be visible in graph
inspection and cycle diagnostics.

## Diagnostics

Core failures use typed errors that extend `SagifireIocError`. Diagnostics carry stable
codes, readable messages and safe structured details such as token IDs, module IDs,
lifecycle modes and dependency paths.

Diagnostic formatting is runtime-agnostic: no terminal colors, `process`, `Buffer`,
Node-only APIs or framework dependencies. See [Diagnostics](diagnostics.md).

## Framework Boundaries

Framework adapters should live at application boundaries:

1. Initialize or retrieve a runtime at the boundary.
2. Create one scope for a request, route handler, server action or operation.
3. Add explicit scope-local values such as request IDs or user context.
4. Resolve a public module API.
5. Dispose the scope on success and failure.

The Next.js package follows this model with cached runtime, request context, route scope
and server action helpers. See [Next.js integration](next-integration.md).

## Design Rules

- No decorators or `reflect-metadata` are required.
- No filesystem auto-discovery or route scanning is performed by the core package.
- No global mutable container is created by the core package.
- `get()` is always sync.
- `getAsync()` is explicit.
- Runtimes are immutable after `freeze()` or `compose()`.
- Module private providers are not exported through composed runtimes.
- Testing helpers create fresh configuration and do not patch frozen runtimes.
