# Composer

The composer turns explicit module definitions and application-level bindings into an
immutable composed runtime.

Use it when dependencies are bigger than a single container file and you want the graph to
stay inspectable: modules declare what they provide, modules declare what they require, and
the application composition decides how required ports are satisfied.

## Imports

The root package exports the composer API:

```ts
import {
    ComposerValidationError,
    createComposer,
    defineModule,
    formatDiagnostics,
    token
} from '@sagifire/ioc'
```

For narrower imports, use the composer and diagnostics subpaths:

```ts
import { ComposerValidationError, createComposer, defineModule } from '@sagifire/ioc/composer'
import { formatDiagnostics } from '@sagifire/ioc/diagnostics'
import { token } from '@sagifire/ioc/tokens'
```

## Composition Model

A composed application has three visible pieces:

- Modules registered with `composer.use(moduleDefinition)`.
- Required-port bindings registered with `composer.bind(token)`.
- Public capabilities declared by module `provides` metadata and registered during module
  setup.

Required ports are owned by the consumer module. A module that needs authentication should
declare its own `CONTACT_REQUESTS_AUTH_READER` port instead of reaching directly into the
auth module. The application composition can then bind that required port to an adapter
over `AUTH_PUBLIC_API`.

```ts
interface AuthApi {
    requireUser(): string
}

interface AuthReader {
    currentUserId(): string
}

interface ContactRequestsApi {
    submit(subject: string): string
}

const AUTH_PUBLIC_API = token<AuthApi>('app.auth.public-api')
const CONTACT_REQUESTS_AUTH_READER = token<AuthReader>('app.contact-requests.auth-reader')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>('app.contact-requests.public-api')

const authModule = defineModule({
    id: 'auth',
    provides: [
        {
            token: AUTH_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(AUTH_PUBLIC_API).toValue({
            requireUser(): string {
                return 'user-1'
            }
        })
    }
})

const contactRequestsModule = defineModule({
    id: 'contact-requests',
    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER,
            description: 'Auth reader owned by contact requests'
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)

            return {
                submit(subject): string {
                    return `${auth.currentUserId()}:${subject}`
                }
            }
        })
    }
})

const composer = createComposer().use(authModule).use(contactRequestsModule)

composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory(({ get }) => {
    const auth = get(AUTH_PUBLIC_API)

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

const runtime = await composer.compose()
const contactRequests = runtime.get(CONTACT_REQUESTS_PUBLIC_API)
```

`CONTACT_REQUESTS_AUTH_READER` satisfies the contact requests module, but it is not a
public runtime capability. The composed runtime exposes declared capabilities such as
`CONTACT_REQUESTS_PUBLIC_API`, not every token that happened to be bound during
composition.

## Lifecycle

Composer operations are intentionally separated:

1. `use(moduleDefinition)` records a module definition and returns the same composer.
2. `bind(token)` records an application-level binding for a required port.
3. `validate()` returns a `DiagnosticReport` for static graph problems.
4. `getGraph()` returns safe graph metadata without validation wrapper fields.
5. `inspect()` returns graph metadata plus the current validation report.
6. `prepare()` validates the graph, runs module `setup()` functions, verifies declared
   capabilities were registered, freezes the internal container and returns a preparation
   summary.
7. `compose()` performs the same preparation work and returns a capability-gated
   `ComposedRuntime`.

`validate()`, `getGraph()` and `inspect()` do not execute user binding factories, module
provider factories or async resources to infer hidden dependencies. They read explicit
module metadata and explicit composer bindings only.

`prepare()` and `compose()` do execute module `setup()` functions because setup is where
providers are registered. They also freeze the internal container, so eager async
providers/resources registered by modules can initialize during that phase.

## Validation

`composer.validate()` returns a `DiagnosticReport`:

```ts
const report = composer.validate()

if (!report.ok) {
    console.error(formatDiagnostics(report))
}
```

Representative composer diagnostics include:

- duplicate module IDs;
- duplicate statically declared provided capabilities;
- missing required ports;
- bindings for tokens that no module declared as a required port;
- module dependency cycles over capability dependency edges.

`prepare()` and `compose()` call the same validation path. If the report is not ok, they
throw `ComposerValidationError`, and the error exposes the failed `report`.

```ts
try {
    await composer.compose()
} catch (error) {
    if (error instanceof ComposerValidationError) {
        console.error(formatDiagnostics(error.report))
    }
}
```

## Bindings

`composer.bind(token)` supports composition-level single-provider bindings:

```ts
composer.bind(CONTACT_REQUESTS_AUTH_READER).toValue(authReader)
composer
    .bind(CONTACT_REQUESTS_AUTH_READER)
    .toFactory(({ get }) => createAuthReader(get(AUTH_PUBLIC_API)))
composer.bind(CONTACT_REQUESTS_AUTH_READER).toClass(AuthReaderAdapter)
composer.bind(CONTACT_REQUESTS_AUTH_READER).toAsyncFactory(async ({ getAsync }) => {
    const auth = await getAsync(AUTH_PUBLIC_API)

    return createAuthReader(auth)
})
```

Bindings are for required ports. A binding is valid only when at least one registered
module declares that token in `requires`. Binding a random token is reported as an invalid
composer binding.

A binding can adapt another module's public capability, but the adapter dependency is not
inferred by executing the factory during validation. The graph records a static
required-port-to-binding edge for the required token.

## Inspection

`composer.getGraph()` and `composer.inspect()` expose deterministic metadata:

```ts
const graph = composer.getGraph()

for (const edge of graph.edges) {
    console.log(edge.edgeKind, edge.consumerModuleId, edge.requiredTokenId)
}
```

The graph contains:

- `modules`: module IDs, optional versions, safe metadata summaries and token ID lists;
- `requiredPorts`: required-port token IDs, owner module IDs, required flags, dependency
  kinds and satisfaction status;
- `capabilities`: exported capability token IDs, owner module IDs and capability kinds;
- `bindings`: composition binding token IDs and provider summaries;
- `edges`: dependency edges derived from explicit module declarations and bindings.

`inspect()` includes the same graph data and adds `validation`. `RuntimeInspection` from
`runtime.inspect()` also includes `providerRegistrations` for exported capabilities that
were actually registered during setup.

Inspection data does not expose provider values, resource instances, scope-local values,
private token IDs for module providers or other runtime internals.

## Dependency Edges

There are two edge kinds:

- `capability`: a consumer module required port is satisfied by another module's declared
  capability.
- `binding`: a consumer module required port is satisfied by an explicit composer binding.

If a required port is satisfied by a binding, the graph records a binding edge and does not
also create a capability edge for that same required port. This matters for cycles:
module-level cycle diagnostics are detected over capability edges only. Binding edges are
application composition adapters and do not create module cycles by themselves.

## Composed Runtime

`compose()` returns a `ComposedRuntime` with the core runtime shape:

```ts
const runtime = await composer.compose()

const api = runtime.get(CONTACT_REQUESTS_PUBLIC_API)
const scopedResult = await runtime.withScope(async (scope) => {
    return scope.get(CONTACT_REQUESTS_PUBLIC_API).submit('hello')
})

await runtime.dispose()
```

The runtime is immutable and capability-gated:

- declared and registered exported capabilities are public;
- module-private providers are hidden;
- required-port-only bindings are hidden unless a module also declared them as a provided
  capability;
- scopes and async access pass through the internal container while preserving the same
  public capability boundary.

## Optional DSL

The DSL is a declaration convenience over the same composer behavior:

```ts
import { adapt, defineApp, module } from '@sagifire/ioc/dsl'

const contactRequestsModule = module('contact-requests', {
    requires: [{ token: CONTACT_REQUESTS_AUTH_READER }],
    provides: [{ token: CONTACT_REQUESTS_PUBLIC_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)

            return {
                submit(subject): string {
                    return `${auth.currentUserId()}:${subject}`
                }
            }
        })
    }
})

const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapt(CONTACT_REQUESTS_AUTH_READER, ({ get }) => {
            const auth = get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
    ]
})

const runtime = await app.compose()
```

`defineApp()` creates fresh composer configurations internally. Its `validate()`,
`inspect()`, `getGraph()`, `prepare()` and `compose()` methods delegate to the existing
composer model. The DSL does not add decorators, `reflect-metadata`, filesystem
discovery, global registries or hidden dependency inference.
