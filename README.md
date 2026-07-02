# @sagifire/ioc

`@sagifire/ioc` is a TypeScript-native, JavaScript-friendly toolkit for explicit
dependency composition. It gives applications typed tokens, immutable containers,
request/operation scopes, module composition, diagnostics, testing helpers and thin
Next.js App Router boundary helpers without decorators, `reflect-metadata` or filesystem
discovery.

This repository is currently a development workspace. Package manifests use version
`0.0.0` and `Apache-2.0`, and release automation is not implemented yet. The package names
and import paths below describe the implemented public API in this workspace.

## Packages

- [`@sagifire/ioc`](packages/ioc/README.md) - core tokens, container, scopes, composer,
  optional DSL, diagnostics and lifecycle types.
- [`@sagifire/ioc-testing`](packages/ioc-testing/README.md) - isolated test runtimes,
  overrides, fake modules, module harnesses and graph/diagnostic assertions.
- [`@sagifire/ioc-next`](packages/ioc-next/README.md) - App Router boundary helpers for
  cached runtimes, explicit request context, route scopes and server action scopes.

## Install Shape

The packages are not published from this repository yet. When release packaging is added,
the intended install shape is:

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

`runtime.get()` is always synchronous. Async providers and resources use explicit
`getAsync()` access.

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

composer.bind(CONTACT_AUTH).toFactory(({ get }) => {
    const auth = get(AUTH_API)

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

The optional DSL (`module()`, `defineApp()`, `bind()` and `adapt()`) is a convenience layer
over the same composer behavior. It does not create a global registry or hide graph edges.

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

The guides and examples describe the current implemented API surface in this workspace.
Release packaging remains separate future work.

## Examples

- [Basic Node](examples/basic-node/README.md) - tokens, container providers,
  multi-providers, scope-local values and runtime disposal.
- [Module composition](examples/module-composition/README.md) - modules, capabilities,
  required ports, explicit binding adapters, validation, inspection and composed runtime
  resolution.
- [Async DB resource](examples/async-db-resource/README.md) - lazy async database resource,
  retry after failed initialization, scoped unit-of-work and disposal.
- [Testing overrides](examples/testing-overrides/README.md) - isolated test runtimes,
  composer overrides, fake modules, module harnesses and graph/diagnostic assertions.
- [Next App Router](examples/next-app-router/README.md) - cached runtime, explicit
  request/action context, route scopes and server action scopes for `@sagifire/ioc-next`.

## Governance

- [License](LICENSE) - Apache License, Version 2.0.
- [Notices](NOTICE) - project notices and attribution.
- [Contributing](CONTRIBUTING.md) - contribution flow and GitHub Issues support channel.
- [Security](SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.

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
