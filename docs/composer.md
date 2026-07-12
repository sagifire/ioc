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
- Required-port single bindings registered with `composer.bind(token)`.
- Required-port adapter bindings registered with `composer.adapt(target).from(source)`.
- Composition-root multi contributions registered with `composer.add(token)`.
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

composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
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
3. `add(token)` records application-level multi contributions for a declared multi
   capability.
4. `adapt(target).from(source).using(factory)` records a graph-aware adapter binding for a
   required port.
5. `validate()` returns a `DiagnosticReport` for static graph problems.
6. `getGraph()` returns safe graph metadata without validation wrapper fields.
7. `inspect()` returns graph metadata plus the current validation report.
8. `prepare()` validates the graph, runs module `setup()` functions, verifies declared
   capabilities were registered, freezes the internal container and returns a preparation
   summary.
9. `compose()` performs the same preparation work and returns a capability-gated
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
- duplicate statically declared single capabilities;
- single/multi cardinality conflicts across declarations and registrations;
- missing required ports;
- required multi dependencies with no contributors;
- required-port/provider cardinality mismatches;
- declared capability registration mismatches, such as `provides` with
  `cardinality: 'multi'` registered through `bind()`;
- duplicate composer bindings for the same token;
- bindings for tokens that no module declared as a required port;
- invalid adapter targets or sources;
- module dependency cycles over capability and eligible adapter-source edges.

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

A normal factory binding can adapt another module's public capability, but the adapter
dependency is not inferred by executing the factory during validation. The graph records
only a static required-port-to-binding edge for the required token.

## Multi Contributions

Module capabilities and required ports default to `cardinality: 'single'`. Use
`cardinality: 'multi'` when a token represents a collection of contributors:

```ts
interface AdminItem {
    readonly label: string
}

const ADMIN_ITEMS = token<AdminItem>('app.admin-items')

const adminModule = defineModule({
    id: 'admin',
    provides: [
        {
            token: ADMIN_ITEMS,
            kind: 'admin-contribution',
            cardinality: 'multi'
        }
    ],
    setup(context) {
        context.add(ADMIN_ITEMS).toValue({
            label: 'Settings'
        })
    }
})

composer.add(ADMIN_ITEMS).toValue({
    label: 'Root shortcut'
})
```

Rules:

- declared multi capabilities must be registered with `add()`;
- declared single capabilities must be registered with `bind()`;
- required multi dependencies use `required: true` to require at least one contributor;
- required multi dependencies with `required: false` may be absent, and valid provider
  code that calls `getAll(token)` receives `[]`;
- module contributions resolve first in effective module registration order, then
  composition-root additions resolve after module contributions.

## Graph-Aware Adapters

Use `composer.adapt(target).from(source).using(factory)` when a required port is an adapter
over an explicitly declared source token:

```ts
composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using((auth) => {
        return {
            currentUserId(): string {
                return auth.requireUser()
            }
        }
    })
```

`using()` receives only the declared source value. It does not receive `{ get }`,
`getAll()` or a generic resolver context. This keeps the graph explicit: validation and
inspection can record both the required-port binding edge and the adapter-source edge
without executing the adapter factory.

Object sources are supported when an adapter needs more than one explicit source:

```ts
composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from({
        auth: AUTH_PUBLIC_API,
        permissions: PERMISSIONS_PUBLIC_API
    })
    .using(({ auth, permissions }) => createAuthReader(auth, permissions))
```

The first adapter slice supports single source capabilities and explicit composition-root
single sources. Multi source capabilities are rejected until a future design makes their
shape explicit.

Validation requires the adapter target to be a declared external required port. The source
must be a public single capability or an explicit composition-root single binding. Module
private providers are not valid adapter sources.

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
  kinds, cardinality, provider count and satisfaction status;
- `capabilities`: exported capability token IDs, owner module IDs, capability kinds,
  cardinality and public provider summaries;
- `bindings`: composition binding token IDs, provider summaries and adapter source
  metadata for graph-aware adapters;
- `edges`: dependency edges derived from explicit module declarations and bindings.

`inspect()` includes the same graph data and adds `validation`. `RuntimeInspection` from
`runtime.inspect()` also includes `providerRegistrations` for exported capabilities that
were actually registered during setup.

Inspection data does not expose provider values, resource instances, scope-local values,
private token IDs for module providers or other runtime internals.

## Graph Export JSON v1

`createGraphExportDocument()` creates a detached, immutable v1 projection from a public
`ModuleGraph`. A `ComposerInspection` or `RuntimeInspection` is also accepted because both
include the same public graph fields. Validation diagnostics and runtime provider summaries
are intentionally outside the graph document.

```ts
import { createGraphExportDocument, serializeGraphExport } from '@sagifire/ioc/graph-export'

const document = createGraphExportDocument(composer.getGraph())
const json = serializeGraphExport(document)
```

The envelope uses `schema: 'sagifire.ioc.graph'` and `schemaVersion: '1'`. Schema versions
are independent of npm package versions. Within v1, additive optional fields are compatible;
removing or changing the meaning or type of an existing field requires a new schema version.
Optional fields are omitted rather than emitted as `null`. Serialization rejects an unknown
schema name or version instead of silently relabeling it as v1.

The projection preserves every semantic array order from `ModuleGraph`, including module,
declaration, provider registration and edge order. It does not globally sort those arrays.
Arbitrary module metadata and descriptions are omitted from v1 so user-controlled values,
secrets and paths do not cross the default export boundary. Module and token IDs remain
lossless public graph identifiers; applications must treat declared IDs as public and must
not place secrets or environment-specific absolute paths in them.

`serializeGraphExport()` emits deterministic JSON with four-space indentation, LF line
endings and exactly one final newline. It performs no filesystem access, executes no
factories or resources and invokes no external renderer.

## Dependency Edges

There are three edge kinds:

- `capability`: a consumer module required port is satisfied by another module's declared
  capability.
- `binding`: a consumer module required port is satisfied by an explicit composer binding.
- `adapter-source`: a graph-aware adapter binding explicitly reads a declared source token.

If a required port is satisfied by a binding, the graph records a binding edge and does not
also create a capability edge for that same required port.

Cycle diagnostics traverse capability edges and adapter-source edges whose source provider
is a single module public capability. Binding edges and adapter-source edges backed by
composition-root sources do not create module-to-module cycles by themselves.

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
- `get()` / `tryGet()` / async single access fail for multi capabilities;
- `getAll()` fails for single capabilities;
- scopes and async access pass through the internal container while preserving the same
  public capability boundary.

## Optional DSL

The DSL is a declaration convenience over the same composer behavior:

```ts
import { adapter, defineApp, module } from '@sagifire/ioc/dsl'

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
        adapter(CONTACT_REQUESTS_AUTH_READER)
            .from(AUTH_PUBLIC_API)
            .using((auth) => {
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

The older DSL `adapt(token, factory)` helper remains supported as a compatibility
factory-binding helper. Use `adapter(target).from(source).using(factory)` when the adapter
source should be visible in graph inspection and adapter-aware cycle diagnostics.
