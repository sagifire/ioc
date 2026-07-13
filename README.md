# @sagifire/ioc

`@sagifire/ioc` is a TypeScript-native, JavaScript-friendly toolkit for explicit
dependency composition. It gives applications typed tokens, immutable containers,
request/operation scopes, module composition, diagnostics, testing helpers and thin
Next.js App Router boundary helpers without decorators, `reflect-metadata` or filesystem
discovery.

This repository is currently a release-prepared workspace. Publishable package manifests
are fixed at version `0.0.2` and `Apache-2.0`, with Changesets, CI, package dry-run
validation and a manual npm publish workflow. Actual npm publishing remains gated by
explicit human approval and external GitHub/npm settings.
The package names and import paths below describe the implemented `0.0.2` public API in
this workspace.

## Packages

- [`@sagifire/ioc`](packages/ioc/README.md) - core tokens, container, scopes, composer,
  optional DSL, diagnostics and lifecycle types.
- [`@sagifire/ioc-testing`](packages/ioc-testing/README.md) - isolated test runtimes,
  overrides, fake modules, module harnesses and graph/diagnostic assertions.
- [`@sagifire/ioc-next`](packages/ioc-next/README.md) - App Router boundary helpers for
  cached runtimes, explicit request context, route scopes and server action scopes.

## Install Shape

The current package changelogs include `0.0.2` entries. After the human-approved npm
publish, the intended install shape is:

```sh
pnpm add @sagifire/ioc
pnpm add -D @sagifire/ioc-testing
pnpm add @sagifire/ioc-next
```

Inside this monorepo the packages are consumed through `workspace:*` dependencies.

## Quickstart

The smallest useful setup is a typed token plus a frozen container runtime:

```ts
import { createContainer, token } from '@sagifire/ioc'

interface Clock {
    now(): Date
}

const CLOCK = token<Clock>('app.clock')

const container = createContainer()

container.bind(CLOCK).toValue({
    now(): Date {
        return new Date()
    }
})

const runtime = await container.freeze()

try {
    const timestamp = runtime.get(CLOCK).now().toISOString()
} finally {
    await runtime.dispose()
}
```

`runtime.get()` is always synchronous. Async single providers/resources use explicit
`getAsync()` access, while mixed async multi collections use `getAllAsync()`. A sync
`toFactory()` must return a final sync value; Promise-producing factories belong behind
`toAsyncFactory()`.

## Module Composition

The object API is first-class. Modules declare what they require and provide, and the
application composer wires required ports explicitly:

```ts
import { createComposer, defineModule, formatDiagnostics, token } from '@sagifire/ioc'

interface AuthApi {
    requireUser(): string
}

interface AuthReader {
    currentUserId(): string
}

interface ContactRequestsApi {
    submit(): string
}

const AUTH_API = token<AuthApi>('auth.public-api')
const CONTACT_AUTH = token<AuthReader>('contact-requests.auth-reader')
const CONTACT_API = token<ContactRequestsApi>('contact-requests.public-api')

const authModule = defineModule({
    id: 'auth',
    provides: [{ token: AUTH_API, kind: 'public-api' }],
    setup(context) {
        context.bind(AUTH_API).toValue({
            requireUser(): string {
                return 'user-1'
            }
        })
    }
})

const contactRequestsModule = defineModule({
    id: 'contact-requests',
    requires: [{ token: CONTACT_AUTH }],
    provides: [{ token: CONTACT_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_API).toFactory(({ get }) => {
            const auth = get(CONTACT_AUTH)

            return {
                submit(): string {
                    return auth.currentUserId()
                }
            }
        })
    }
})

const composer = createComposer().use(authModule).use(contactRequestsModule)

composer
    .adapt(CONTACT_AUTH)
    .from(AUTH_API)
    .using((auth) => {
        return {
            currentUserId(): string {
                return auth.requireUser()
            }
        }
    })

const report = composer.validate()

if (!report.ok) {
    throw new Error(formatDiagnostics(report))
}

const app = await composer.compose()
const contactRequests = app.get(CONTACT_API)
```

Multi capabilities are explicit too: declare `cardinality: 'multi'` in `provides` or
`requires`, register providers with `add()` and resolve public multi capabilities with
`getAll()` / `getAllAsync()`. The composed runtime rejects `get()` for multi capabilities
and rejects either collection accessor for single capabilities.

The optional DSL (`module()`, `defineApp()`, `bind()`, `add()`, `adapt()` and `adapter()`)
is a convenience layer over the same composer behavior. Use
`adapter(target).from(source).using(factory)` when adapter source edges should be visible
in graph inspection; compatibility `adapt(token, factory)` remains a factory-binding
helper and does not infer source edges.

## Testing

Testing helpers create fresh configuration before `freeze()` or `compose()`. They do not
patch frozen production runtimes:

```ts
import { token } from '@sagifire/ioc'
import { createTestRuntime, override } from '@sagifire/ioc-testing'

const LOGGER = token<{ info(message: string): void }>('test.logger')

const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue({
            info(): void {}
        })
    ]
})
```

See [`packages/ioc-testing`](packages/ioc-testing/README.md) for test composers, fake
modules, module harnesses and graph/diagnostic assertions.

## Next.js Boundaries

`@sagifire/ioc-next` is intentionally thin. It creates and disposes one scope per route or
server action invocation and passes runtime, scope and context explicitly:

```ts
import { createNextRuntime, withRouteScope } from '@sagifire/ioc-next'

const appRuntime = createNextRuntime(() => composer.compose())

export function GET(request: Request, context: { params: { id: string } }) {
    return withRouteScope(
        appRuntime,
        {
            request,
            context
        },
        async ({ scope }) => {
            const api = scope.get(CONTACT_API)

            return api.submit()
        }
    )
}
```

The adapter package does not add route scanning, hidden current request access or business
logic inside framework handlers.

## Documentation

- [Documentation map](docs/README.md)
- [Architecture](docs/architecture.md)
- [Container](docs/container.md)
- [Async model](docs/async-model.md)
- [Composer](docs/composer.md)
- [Modules](docs/modules.md)
- [Diagnostics](docs/diagnostics.md)
- [Testing](docs/testing.md)
- [Next.js integration](docs/next-integration.md)
- [Migration from DI containers](docs/migration-from-di-container.md)
- [Release workflow](docs/release.md)

The guides and examples describe the current implemented API surface in this workspace.
Release automation is implemented through Changesets, CI, package dry-run validation and a
manual npm publish workflow. Actual npm publishing still requires explicit human approval
and external GitHub/npm settings.

## Examples

- [Basic Node](examples/basic-node/README.md) - tokens, container providers,
  multi-providers, scope-local values, child scope overlays and runtime disposal.
- [Module composition](examples/module-composition/README.md) - modules, capabilities,
  required ports, graph-aware adapters, multi contribution catalogs, validation,
  inspection and composed runtime resolution.
- [Async DB resource](examples/async-db-resource/README.md) - lazy async database resource,
  retry after failed initialization, scoped unit-of-work and disposal.
- [Testing overrides](examples/testing-overrides/README.md) - isolated test runtimes,
  sync/async multi overrides, fake modules, module harnesses and graph/diagnostic
  assertions.
- [Next App Router](examples/next-app-router/README.md) - cached runtime, explicit
  request/action context, route scopes and server action scopes for `@sagifire/ioc-next`.

## Governance

- [License](LICENSE) - Apache License, Version 2.0.
- [Notices](NOTICE) - project notices and attribution.
- [Contributing](CONTRIBUTING.md) - contribution flow and GitHub Issues support channel.
- [Security](SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.
- [Changelog](CHANGELOG.md) - release history and Changesets changelog notes.
- [Release workflow](docs/release.md) - release PRs, validation, manual publish and
  provenance notes.

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

## License

Apache License, Version 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
