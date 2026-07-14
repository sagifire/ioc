# @sagifire/ioc

Core package for typed dependency composition.

`@sagifire/ioc` contains the runtime-agnostic pieces: typed tokens, immutable container
runtimes, request/operation scopes, async providers/resources, module composition,
inspection, diagnostics, lifecycle types and the optional DSL. It does not import Next.js,
React, Node-only APIs, decorators or `reflect-metadata`.

This package is currently used from the workspace. The manifest is `0.0.2` and
`Apache-2.0` with npm publish metadata, Changesets versioning, package dry-run validation
and a manual npm publish workflow. Actual npm publishing remains gated by explicit human
approval and external GitHub/npm settings. This README describes the current `0.0.2`
manifest plus unreleased workspace additions; it is not a version or publish-readiness
claim.

## Imports

Root import:

```ts
import { createComposer, createContainer, defineModule, multiToken, token } from '@sagifire/ioc'
```

Tree-shaking-friendly subpath exports:

- `@sagifire/ioc/tokens`
- `@sagifire/ioc/container`
- `@sagifire/ioc/context`
- `@sagifire/ioc/composer`
- `@sagifire/ioc/dsl`
- `@sagifire/ioc/diagnostics`
- `@sagifire/ioc/graph-export`
- `@sagifire/ioc/lifecycle`

## Public Surface

- Tokens: `token()`, `multiToken()`, `contributionToken()`, `namespace()` and
  `Token<TValue>`.
- Container: `createContainer()`, `bind()`, `add()`, lifetimes, `freeze()`, `get()`,
  `tryGet()`, `getAll()`, `getAllAsync()`, `getAsync()`, `tryGetAsync()` and disposal.
- Scopes: `createScope()`, `withScope()`, scope-local values, scope-local multi-values,
  child scopes, `scope.get()`, `scope.tryGet()`, `scope.getAll()`, `scope.getAllAsync()`,
  `scope.getAsync()` and `scope.dispose()`.
- Async providers/resources: `toAsyncFactory()`, `toAsyncResource()`, explicit
  `getAsync()` / `getAllAsync()` access and runtime/scope disposal for initialized
  resources.
- Composer/modules: `defineModule()`, `createComposer()`, `use()`, `bind()`, `add()`,
  `adapt().from().using()`, `validate()`, `prepare()`, `compose()`, `inspect()`,
  `getGraph()` and composed runtime inspection.
- Diagnostics: `SagifireIocError`, `DiagnosticReport`, `diagnosticFromError()` and
  `formatDiagnostics()`.
- Graph export: versioned `createGraphExportDocument()` safe projection, deterministic
  `serializeGraphExport()` JSON and pure `renderGraphExportDot()` /
  `renderGraphExportMermaid()` text views.
- Lifetime validation: explicit `ProviderDependencyOptions`, opt-in `off | report | enforce`,
  coverage summaries, immutable provider inspection and `getLifetimeValidationReport()`.
- Optional DSL: `module()`, `defineApp()`, `bind()`, `add()`, `adapt()` and
  graph-aware `adapter()`.

Framework adapters are not part of the core API; they live in `@sagifire/ioc-next`.
Async multi-provider contributions and `getAllAsync()` are explicit core APIs.

`MultiToken<T>` and `ContributionToken<T>` are type-level helper markers over ordinary
token identity. Runtime enforcement still comes from module/composer cardinality
declarations and composed runtime `get()` / `getAll()` gating.

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

`get()` stays synchronous. A sync `toFactory()` must return a final sync value; factories
that return `Promise` belong behind `toAsyncFactory()` and are accessed through
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

composer
    .adapt(CONTACT_AUTH_READER)
    .from(AUTH_API)
    .using((auth) => {
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

`add(token).toAsyncFactory()` and `add(token).toAsyncResource()` preserve the object API
lifetime and eager/lazy choices one-to-one; the object API remains first-class.
All dependency-capable DSL factory/resource helpers also preserve the object API
`ProviderDependencyOptions` second argument. `defineApp({ options: { lifetimeValidation } })`
projects the composer policy without changing the default.

For graph-aware adapters in DSL, prefer:

```ts
import { adapter } from '@sagifire/ioc'

adapter(CONTACT_AUTH_READER)
    .from(AUTH_API)
    .using((auth) => createAuthReader(auth))
```

The older `adapt(token, factory)` helper remains supported for compatibility as a
factory-binding declaration with a resolver context. It does not infer adapter source
edges.

## Package Boundaries

- `@sagifire/ioc-testing` contains testing helpers and may depend on this package.
- `@sagifire/ioc-next` contains framework boundary helpers and may depend on this package.
- This core package must not depend on either package.

## Governance

- [License](LICENSE) - Apache License, Version 2.0.
- [Notices](NOTICE) - package notices and attribution.
- [Contributing](../../CONTRIBUTING.md) - contribution flow and GitHub Issues support
  channel.
- [Security](../../SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](../../TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.
- [Changelog](CHANGELOG.md) - package release history.
- [Release workflow](../../docs/release.md) - release PRs, validation, manual publish and
  provenance notes.

## More Documentation

- [Documentation map](../../docs/README.md)
- [Architecture](../../docs/architecture.md)
- [Container](../../docs/container.md)
- [Lifetime dependency validation](../../docs/lifetime-validation.md)
- [Async model](../../docs/async-model.md)
- [Async DB resource example](../../examples/async-db-resource/README.md)
- [Composer](../../docs/composer.md)
- [Graph export](../../docs/graph-export.md)
- [Modules](../../docs/modules.md)
- [Diagnostics](../../docs/diagnostics.md)
- [Migration from DI containers](../../docs/migration-from-di-container.md)
