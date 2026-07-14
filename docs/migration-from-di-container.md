# Migration From DI Containers

This guide maps common dependency injection container patterns to `@sagifire/ioc`
concepts. It focuses on migration shape rather than package-by-package comparison.

`@sagifire/ioc` is intentionally explicit:

- dependencies are identified by typed tokens, not constructor metadata;
- providers are registered before `freeze()` or `compose()`;
- runtime objects are immutable after they are built;
- modules declare public capabilities and consumer-owned required ports;
- application composition owns cross-module bindings and framework boundaries.

## Concept Mapping

| Common DI container pattern                | `@sagifire/ioc` concept                                          |
| ------------------------------------------ | ---------------------------------------------------------------- |
| String, symbol or class service identifier | `Token<TValue>` created with `token()` or `namespace()`          |
| Container registration                     | `createContainer().bind(token)` or `add(token)`                  |
| Constructor auto-injection                 | Explicit `toFactory(({ get }) => ...)` or module setup wiring    |
| Singleton lifetime                         | `.singleton()` or `toValue()`                                    |
| Transient lifetime                         | `.transient()` or default `toFactory()` / `toClass()` lifetime   |
| Request-scoped lifetime                    | `.scoped()` plus `runtime.createScope()` / `withScope()`         |
| Multi injection / plugin lists             | `add(token)` plus `getAll()` / explicit `getAllAsync()`          |
| Async factory                              | `toAsyncFactory()` and explicit `getAsync()`                     |
| Managed async resource                     | `toAsyncResource()` with runtime or scope disposal               |
| Child/request container                    | Scope with explicit scope-local values                           |
| Module imports/exports                     | `defineModule()` with `requires` and `provides`                  |
| Cross-module adapter                       | `composer.adapt(requiredPort).from(source).using(...)`           |
| Bootstrap validation                       | `composer.validate()`, `formatDiagnostics()` and inspection      |
| Test override                              | `@sagifire/ioc-testing` override before `freeze()` / `compose()` |
| Web framework request boundary             | `@sagifire/ioc-next` route/action scope helpers                  |

## Start With Tokens

Many DI containers use class constructors, strings or symbols as service identifiers.
`@sagifire/ioc` uses stable token IDs with TypeScript value inference:

```ts
import { namespace } from '@sagifire/ioc'

interface Logger {
    info(message: string): void
}

interface UserRepository {
    findName(userId: string): string
}

const app = namespace('app')

export const LOGGER = app.token<Logger>('logger')
export const USER_REPOSITORY = app.token<UserRepository>('user-repository')
```

Migration rule: choose token IDs as stable public contracts. Do not generate tokens inside
request handlers, tests or factory bodies.

## Replace Auto-Injection With Explicit Factories

Decorator-based containers often infer constructor parameters. `@sagifire/ioc` does not
use decorators or `reflect-metadata`; dependencies are pulled explicitly inside provider
factories:

```ts
import { createContainer } from '@sagifire/ioc'

class SqlUserRepository implements UserRepository {
    constructor(private readonly logger: Logger) {}

    findName(userId: string): string {
        this.logger.info(`loading ${userId}`)

        return 'Ada'
    }
}

const container = createContainer()

container.bind(LOGGER).toValue(console)
container
    .bind(USER_REPOSITORY)
    .toFactory(({ get }) => {
        return new SqlUserRepository(get(LOGGER))
    })
    .singleton()

const runtime = await container.freeze()
const users = runtime.get(USER_REPOSITORY)
```

Use `toClass()` only for no-argument constructors. Classes with dependencies should be
wired through `toFactory()` so the dependency graph remains visible in code review.

## Migrate Lifetimes Deliberately

Container registrations split into immutable runtime behavior:

```ts
container.bind(LOGGER).toValue(console)

container
    .bind(USER_REPOSITORY)
    .toFactory(({ get }) => new SqlUserRepository(get(LOGGER)))
    .singleton()

container
    .bind(REQUEST_CACHE)
    .toFactory(() => new Map<string, unknown>())
    .scoped()
```

Use these rules when mapping lifetimes:

- `toValue()` is a singleton value.
- `toFactory()` and `toClass()` are transient unless changed with `.singleton()` or
  `.scoped()`.
- Scoped providers require an active scope and are unavailable through runtime-level
  `get()`.
- `runtime.get()` stays synchronous and never returns a `Promise`.

## Migrate Request Context To Scopes

If the old system used child containers or request containers, map that to explicit scopes:

```ts
const REQUEST_ID = app.token<string>('request-id')

await runtime.withScope(
    {
        values: [[REQUEST_ID, 'request-123']]
    },
    async (scope) => {
        const requestId = scope.get(REQUEST_ID)
        const users = scope.get(USER_REPOSITORY)

        users.findName(requestId)
    }
)
```

Scope-local values are declared when the scope is created. They are not mutable through the
public scope API after creation.

## Migrate Collections To Multi-Providers

For plugin arrays, event handlers or ordered contributions, use a collection token and
`add()`:

```ts
interface StartupHook {
    run(): void
}

const STARTUP_HOOKS = app.multiToken<StartupHook>('startup-hooks')

container.add(STARTUP_HOOKS).toValue({
    run(): void {
        console.log('metrics ready')
    }
})

container.add(STARTUP_HOOKS).toFactory(({ get }) => {
    const logger = get(LOGGER)

    return {
        run(): void {
            logger.info('users ready')
        }
    }
})

const hooks = runtime.getAll(STARTUP_HOOKS)
```

`bind()` and `add()` are strict modes for a token ID. A single-provider token cannot later
be read as a multi-provider collection, and a multi-provider token cannot be read with
`get()`.

If any contribution performs async initialization, register it explicitly and move the
collection call to `getAllAsync()`:

```ts
container
    .add(STARTUP_HOOKS)
    .toAsyncFactory(async () => loadRemoteStartupHook())
    .singleton()

const hooks = await runtime.getAllAsync(STARTUP_HOOKS)
```

Results still follow registration order. Resolution is sequential and stops on the first
failure; later contributions do not start. A failed call returns no partial array, but the
container does not undo arbitrary external side effects that earlier user factories may
already have performed. Successful singleton/scoped providers and resources remain with
their normal runtime/scope owner and are reused on retry.

## Migrate Async Providers And Resources

If initialization is asynchronous, keep the async boundary explicit:

```ts
interface DbConnection {
    query(sql: string): Promise<unknown[]>
    close(): Promise<void>
}

const DB = app.token<DbConnection>('db')

container
    .bind(DB)
    .toAsyncResource(async () => {
        const connection = await connectToDatabase()

        return {
            value: connection,
            dispose(): Promise<void> {
                return connection.close()
            }
        }
    })
    .singleton()
    .lazy()

const runtime = await container.freeze()
const db = await runtime.getAsync(DB)

await runtime.dispose()
```

Migration rules:

- Use `getAsync()` / `tryGetAsync()` for lazy async providers.
- Use `getAllAsync()` for collections containing lazy, transient or scoped async
  contributions; a warmed lazy cache never makes sync `getAll()` valid.
- Use eager singleton async providers only when startup should fail early.
- Use `toAsyncResource()` for values that need disposal.
- Use scoped async resources for per-request or per-operation ownership.
- Do not convert normal sync resolution into `Promise`-returning `get()`.

## Move Feature Boundaries Into Modules

Large applications usually need more than one container registration file. In
`@sagifire/ioc`, feature boundaries become modules:

```ts
import { createComposer, defineModule, formatDiagnostics } from '@sagifire/ioc'

interface AuthApi {
    currentUserId(): string
}

interface ContactAuthReader {
    currentUserId(): string
}

interface ContactRequestsApi {
    submitContact(message: string): string
}

const AUTH_API = app.token<AuthApi>('auth.public-api')
const CONTACT_AUTH_READER = app.token<ContactAuthReader>('contact.auth-reader')
const CONTACT_REQUESTS_API = app.token<ContactRequestsApi>('contact.public-api')

const authModule = defineModule({
    id: 'auth',
    provides: [{ token: AUTH_API, kind: 'public-api' }],
    setup(context) {
        context.bind(AUTH_API).toValue({
            currentUserId(): string {
                return 'user-1'
            }
        })
    }
})

const contactModule = defineModule({
    id: 'contact',
    requires: [{ token: CONTACT_AUTH_READER }],
    provides: [{ token: CONTACT_REQUESTS_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_REQUESTS_API).toFactory(({ get }) => {
            const auth = get(CONTACT_AUTH_READER)

            return {
                submitContact(message: string): string {
                    return `${auth.currentUserId()}:${message}`
                }
            }
        })
    }
})

const composer = createComposer().use(authModule).use(contactModule)

composer
    .adapt(CONTACT_AUTH_READER)
    .from(AUTH_API)
    .using((auth) => {
        return {
            currentUserId(): string {
                return auth.currentUserId()
            }
        }
    })

const report = composer.validate()

if (!report.ok) {
    throw new Error(formatDiagnostics(report))
}

const runtime = await composer.compose()
const contacts = runtime.get(CONTACT_REQUESTS_API)
```

The important migration shift is ownership:

- provider implementation details stay inside `setup()`;
- public capabilities are declared in `provides`;
- dependencies owned by the consumer module are declared in `requires`;
- application composition satisfies required ports through capabilities or explicit
  bindings;
- required-port bindings do not automatically become public runtime capabilities.

## Preserve Cross-Module Isolation

Avoid migrating old module imports as direct access to another module's private services.
If `contact` needs authentication data, it should own a `CONTACT_AUTH_READER` required port
and the application should adapt that port from `AUTH_API`.

This keeps feature modules reusable because they do not know which concrete module will
satisfy the port.

## Use Diagnostics During Migration

Run validation before composition while moving modules:

```ts
const inspection = composer.inspect()

if (!inspection.validation.ok) {
    console.error(formatDiagnostics(inspection.validation))
}

for (const edge of inspection.edges) {
    console.log(edge.edgeKind, edge.consumerModuleId, edge.requiredTokenId)
}
```

Diagnostics report duplicate module IDs, duplicate capabilities, missing required ports,
invalid bindings and module cycles. Inspection exposes safe graph metadata without
provider values, resource instances or private runtime internals.

## Keep Tests As Fresh Composition

If the old test suite patched a global container, move those patches to explicit
test-only configuration:

```ts
import { createTestComposer, override } from '@sagifire/ioc-testing'

const testComposer = createTestComposer({
    modules: [contactModule],
    overrides: [
        override(CONTACT_AUTH_READER).toValue({
            currentUserId(): string {
                return 'test-user'
            }
        })
    ]
})

const runtime = await testComposer.compose()
```

Testing rules:

- overrides apply before `freeze()` / `compose()`;
- frozen production runtimes are not patched;
- fake modules are explicit graph-visible modules;
- module harnesses test one module with support modules, fake modules or required-port
  overrides;
- graph and diagnostic assertions read public inspection/report data.

See [`docs/testing.md`](testing.md) and
[`examples/testing-overrides`](../examples/testing-overrides/README.md).

## Move Framework Boundaries Last

In web apps, migrate business modules first. Then make framework files thin adapters.
For Next.js App Router, `@sagifire/ioc-next` owns the boundary helpers:

```ts
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withRouteScope
} from '@sagifire/ioc-next'

const appRuntime = createNextRuntime(() => appComposer.compose())

export function GET(request: Request, context: { params: { id: string } }) {
    return withRouteScope(
        appRuntime,
        {
            request,
            context,
            requestContext: createNextRequestContext({
                values: [nextRequestValue(REQUEST_ID, context.params.id)]
            })
        },
        async ({ scope }) => {
            const api = scope.get(CONTACT_REQUESTS_API)

            return api.submitContact(context.params.id)
        }
    )
}
```

The helper creates one scope per route invocation and disposes it on success or failure.
It does not scan routes, discover modules or expose hidden current-request access.

## Migration Checklist

Before enabling lifetime enforcement, adopt explicit metadata in stages:

1. Start a representative composition root with `{ mode: 'report', coverage: 'summary' }`.
2. Review diagnostics and coverage; incomplete coverage is unknown evidence, not a proven leak.
3. Declare and correct high-risk singleton/scoped factories and resources first.
4. Review opt-in graph schema v2 for dependency/ownership edges and private-safe identities.
5. Keep report mode in CI, then enable `enforce` explicitly only for reviewed composition roots.

Declaration coverage does not prove that a factory body performs only the declared lookups. Keep
code review and behavior tests in the migration gate. See
[lifetime dependency validation](lifetime-validation.md) for the full matrix and adoption workflow.

1. Inventory existing service identifiers and create stable typed tokens.
2. Move constructor metadata wiring into explicit factories.
3. Register low-level providers with `bind()` and collection providers with `add()`.
4. Replace request child containers with explicit scopes and scope-local values.
5. Move async setup into `toAsyncFactory()` or `toAsyncResource()`.
6. Group feature boundaries with `defineModule()`.
7. Declare public APIs in `provides` and consumer-owned required ports in `requires`.
8. Move cross-module adapters to `composer.adapt().from().using()` when the source token is
   explicit.
9. Validate and inspect the graph before calling `compose()`.
10. Replace test-time patching with `@sagifire/ioc-testing` overrides, fake modules or
    harnesses.
11. Keep web framework handlers/actions as thin scope boundaries.
12. Dispose runtimes and scopes that own resources.

## What Not To Migrate

Do not carry over patterns that conflict with the core design:

- decorators or `reflect-metadata` as required runtime behavior;
- filesystem, route or module auto-discovery;
- mutable global containers;
- service locator calls hidden deep inside application code;
- direct access to another module's private providers;
- runtime patching after `freeze()` or `compose()`;
- making `get()` return a `Promise`;
- release or publishing automation. Packaging and release workflow are separate project
  work, not part of migration from DI container patterns.

## Related Guides

- [Architecture](architecture.md)
- [Container](container.md)
- [Lifetime dependency validation](lifetime-validation.md)
- [Async model](async-model.md)
- [Composer](composer.md)
- [Modules](modules.md)
- [Diagnostics](diagnostics.md)
- [Testing](testing.md)
- [Next.js integration](next-integration.md)
