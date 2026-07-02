# @sagifire/ioc

Core package for typed dependency composition.

`@sagifire/ioc` contains the runtime-agnostic pieces: typed tokens, immutable container
runtimes, request/operation scopes, async providers/resources, module composition,
inspection, diagnostics, lifecycle types and the optional DSL. It does not import Next.js,
React, Node-only APIs, decorators or `reflect-metadata`.

This package is currently used from the workspace. The manifest is `0.0.0` and
`UNLICENSED`; release packaging and publishing are not implemented yet.

## Imports

Root import:

```ts
import { createComposer, createContainer, defineModule, token } from '@sagifire/ioc'
```

Tree-shaking-friendly subpath exports:

- `@sagifire/ioc/tokens`
- `@sagifire/ioc/container`
- `@sagifire/ioc/context`
- `@sagifire/ioc/composer`
- `@sagifire/ioc/dsl`
- `@sagifire/ioc/diagnostics`
- `@sagifire/ioc/lifecycle`

## Public Surface

- Tokens: `token()`, `namespace()` and `Token<TValue>`.
- Container: `createContainer()`, `bind()`, `add()`, lifetimes, `freeze()`, `get()`,
  `tryGet()`, `getAll()`, `getAsync()`, `tryGetAsync()` and disposal.
- Scopes: `createScope()`, `withScope()`, scope-local values, scope-local multi-values,
  `scope.get()`, `scope.tryGet()`, `scope.getAll()`, `scope.getAsync()` and
  `scope.dispose()`.
- Async resources: `toAsyncFactory()`, `toAsyncResource()`, explicit `getAsync()` access
  and runtime/scope disposal for initialized resources.
- Composer/modules: `defineModule()`, `createComposer()`, `use()`, `bind()`, `validate()`,
  `prepare()`, `compose()`, `inspect()`, `getGraph()` and composed runtime inspection.
- Diagnostics: `SagifireIocError`, `DiagnosticReport`, `diagnosticFromError()` and
  `formatDiagnostics()`.
- Optional DSL: `module()`, `defineApp()`, `bind()` declarations and `adapt()`.

Async multi-provider contributions, `getAllAsync()` and framework adapters are not part of
the current core API.

## Container Quickstart

```ts
import { createContainer, token } from '@sagifire/ioc'

interface Logger {
    info(message: string): void
}

const LOGGER = token<Logger>('app.logger')

const container = createContainer()

container.bind(LOGGER).toValue({
    info(message): void {
        console.log(message)
    }
})

const runtime = await container.freeze()

runtime.get(LOGGER).info('ready')
await runtime.dispose()
```

`get()` stays synchronous. Lazy async providers and resources are accessed through
`getAsync()`:

```ts
const SETTINGS = token<{ readonly region: string }>('app.settings')

const asyncContainer = createContainer()

asyncContainer
    .bind(SETTINGS)
    .toAsyncFactory(async () => {
        return {
            region: 'eu-central-1'
        }
    })
    .singleton()

const asyncRuntime = await asyncContainer.freeze()
const settings = await asyncRuntime.getAsync(SETTINGS)
```

## Modules And Composer

Modules declare public capabilities and required ports explicitly:

```ts
const contactRequestsModule = defineModule({
    id: 'contact-requests',
    requires: [{ token: CONTACT_AUTH_READER }],
    provides: [{ token: CONTACT_REQUESTS_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_REQUESTS_API).toFactory(({ get }) => {
            const auth = get(CONTACT_AUTH_READER)

            return createContactRequestsApi(auth)
        })
    }
})
```

Application composition wires modules and required-port adapters:

```ts
const composer = createComposer().use(authModule).use(contactRequestsModule)

composer.bind(CONTACT_AUTH_READER).toFactory(({ get }) => {
    const auth = get(AUTH_API)

    return {
        currentUserId(): string {
            return auth.requireUser()
        }
    }
})

const report = composer.validate()
const runtime = await composer.compose()
```

The composed runtime exposes declared capabilities only. Module-private providers and
required-port-only bindings are not public runtime capabilities.

## Optional DSL

The DSL is ergonomic syntax over the same object/composer behavior:

```ts
import { adapt, defineApp } from '@sagifire/ioc'

const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapt(CONTACT_AUTH_READER, ({ get }) => {
            const auth = get(AUTH_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
    ]
})
```

DSL declarations convert to a fresh composer configuration. They do not add decorators,
constructor metadata, filesystem discovery, global registries or hidden dependency
inference.

## Package Boundaries

- `@sagifire/ioc-testing` contains testing helpers and may depend on this package.
- `@sagifire/ioc-next` contains framework boundary helpers and may depend on this package.
- This core package must not depend on either package.

## More Documentation

- [Documentation map](../../docs/README.md)
- [Architecture](../../docs/architecture.md)
- [Container](../../docs/container.md)
- [Async model](../../docs/async-model.md)
- [Async DB resource example](../../examples/async-db-resource/README.md)
- [Composer](../../docs/composer.md)
- [Modules](../../docs/modules.md)
- [Diagnostics](../../docs/diagnostics.md)
