# Технічне завдання: `@sagifire/ioc` modular IoC / composition kernel

## 1. Мета проєкту

Потрібно реалізувати TypeScript-native, JavaScript-friendly бібліотеку `@sagifire/ioc` для побудови модульних TypeScript-додатків із контрольованою композицією залежностей, IoC-контейнером, контекстними scopes, module composer, typed tokens, capabilities, required ports, diagnostics та DSL-конфігураторами.

Проєкт має бути реалізований як `pnpm` монорепозиторій, у якому живуть і релізяться пов’язані пакети:

```txt
@sagifire/ioc
@sagifire/ioc-next
@sagifire/ioc-testing
```

`@sagifire/ioc` має бути generic runtime-agnostic бібліотекою і не повинен залежати від Next.js, React, Node-specific API або decorators.

`@sagifire/ioc-next` має містити адаптери й helper-и для Next.js App Router.

`@sagifire/ioc-testing` має містити тестові утиліти, override helpers, module test harness та graph assertions.

Проєкт не є MVP. Потрібно реалізувати повноцінну бібліотеку, але поетапно, безпечно, із release gates, тестами, документацією та стабільними API-контрактами на кожному етапі.

---

## 2. Основна архітектурна ідея

Бібліотека має складатись із кількох логічних шарів:

```txt
tokens
    typed tokens, namespaces, metadata

container
    IoC container, providers, lifetimes, sync/async resolution

context
    scoped containers, request/operation scopes, scoped resources

composer
    module graph, module scopes, capabilities, required ports, bindings

dsl
    ergonomic configurators поверх object-configuration API

diagnostics
    typed errors, graph-aware validation reports, readable error formatting

testing
    overrides, fake modules, test runtime, graph assertions

next
    Next.js App Router helpers and adapters
```

Головне правило:

```txt
Container не знає про modules.
Context не знає про Next.js.
Composer використовує container/context для збірки application graph.
DSL працює поверх explicit object-configuration API.
Next.js adapter живе окремо від core.
```

---

## 3. Package boundaries

### 3.1. `@sagifire/ioc`

Core package.

Містить:

```txt
tokens
container
context
composer
dsl
diagnostics
core types
```

Не містить:

```txt
Next.js imports
React imports
Node-only APIs
filesystem access
process.env access
decorators as required API
reflect-metadata
global singleton container
```

### 3.2. `@sagifire/ioc-next`

Next.js integration package.

Містить:

```txt
Next.js App Router runtime helpers
request context helpers
server action helpers
route handler helpers
runtime singleton / cached runtime helpers
examples for page/action/route integration
```

Може залежати від:

```txt
@sagifire/ioc
next
react, only if truly needed
```

Не повинен впливати на core API.

### 3.3. `@sagifire/ioc-testing`

Testing package.

Містить:

```txt
test composer
test runtime factory
override helpers
fake module helpers
dependency graph assertions
diagnostic assertions
test scope helpers
```

Може залежати від:

```txt
@sagifire/ioc
```

Не повинен мутувати production runtime. Override-и мають створювати нову isolated runtime/configuration, а не змінювати вже frozen runtime.

---

## 4. Monorepo structure

Репозиторій має бути організований як `pnpm` workspace.

Рекомендована структура:

```txt
/
    package.json
    pnpm-workspace.yaml
    pnpm-lock.yaml
    tsconfig.base.json
    tsconfig.json
    eslint.config.js
    prettier.config.js
    vitest.config.ts
    README.md
    LICENSE
    NOTICE
    CHANGELOG.md

    packages/
        ioc/
            package.json
            tsconfig.json
            src/
                index.ts

                tokens/
                    index.ts
                    Token.ts
                    createToken.ts
                    namespace.ts

                container/
                    index.ts
                    Container.ts
                    ContainerBuilder.ts
                    ProviderDefinition.ts
                    ProviderRegistry.ts
                    ProviderResolver.ts
                    ProviderLifetime.ts
                    ProviderScope.ts
                    createContainer.ts

                context/
                    index.ts
                    Scope.ts
                    ContextScope.ts
                    ScopeRegistry.ts
                    createScope.ts

                composer/
                    index.ts
                    ModuleDefinition.ts
                    ModuleCapability.ts
                    ModuleDependency.ts
                    ModuleBinding.ts
                    Composer.ts
                    Runtime.ts
                    ModuleGraph.ts
                    GraphValidator.ts
                    createComposer.ts
                    defineModule.ts

                dsl/
                    index.ts
                    defineApp.ts
                    module.ts
                    bind.ts
                    adapt.ts

                diagnostics/
                    index.ts
                    errors.ts
                    Diagnostic.ts
                    DiagnosticReport.ts
                    formatDiagnostics.ts

                lifecycle/
                    index.ts
                    Disposable.ts
                    Resource.ts

            test/
                tokens/
                container/
                context/
                composer/
                diagnostics/
                dsl/

        ioc-next/
            package.json
            tsconfig.json
            src/
                index.ts
                getRuntime.ts
                createNextRuntime.ts
                createNextRequestContext.ts
                withRouteScope.ts
                withServerActionScope.ts

            test/

        ioc-testing/
            package.json
            tsconfig.json
            src/
                index.ts
                createTestRuntime.ts
                createTestComposer.ts
                override.ts
                fakeModule.ts
                graphAssertions.ts

            test/

    examples/
        next-app-router/
            package.json
            src/
                app/
                app-kernel/
                modules/

        basic-node/
            package.json
            src/

    docs/
        architecture.md
        container.md
        async-model.md
        composer.md
        modules.md
        next-integration.md
        testing.md
        diagnostics.md
        migration-from-di-container.md
```

---

## 5. Runtime targets

Core package `@sagifire/ioc` має бути runtime-agnostic.

Підтримувані runtime targets:

```txt
Node.js
Browser
Edge-compatible environments
Workers-compatible environments where possible
```

Core package не повинен використовувати:

```txt
fs
path
process
Buffer
global mutable registry
Next.js APIs
React APIs
```

Якщо для окремої функціональності потрібні platform-specific API, вони мають бути винесені в окремий adapter package.

---

## 6. Build and packaging requirements

### 6.1. Package manager

Використовувати:

```txt
pnpm
```

### 6.2. Module format

Пакети мають бути ESM-first.

`package.json` для пакетів має містити:

```json
{
    "type": "module",
    "sideEffects": false
}
```

### 6.3. TypeScript

Використовувати TypeScript.

Обов’язково генерувати:

```txt
JavaScript output
.d.ts type declarations
source maps, якщо це не створює проблем для package size
```

### 6.4. Subpath exports

`@sagifire/ioc` має підтримувати subpath exports.

Приклад:

```json
{
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        },
        "./tokens": {
            "types": "./dist/tokens/index.d.ts",
            "import": "./dist/tokens/index.js"
        },
        "./container": {
            "types": "./dist/container/index.d.ts",
            "import": "./dist/container/index.js"
        },
        "./context": {
            "types": "./dist/context/index.d.ts",
            "import": "./dist/context/index.js"
        },
        "./composer": {
            "types": "./dist/composer/index.d.ts",
            "import": "./dist/composer/index.js"
        },
        "./dsl": {
            "types": "./dist/dsl/index.d.ts",
            "import": "./dist/dsl/index.js"
        },
        "./diagnostics": {
            "types": "./dist/diagnostics/index.d.ts",
            "import": "./dist/diagnostics/index.js"
        },
        "./lifecycle": {
            "types": "./dist/lifecycle/index.d.ts",
            "import": "./dist/lifecycle/index.js"
        }
    }
}
```

Головний entrypoint не повинен імпортувати важкі або optional частини без потреби. Архітектура має бути tree-shaking friendly.

---

## 7. Coding style

Код має відповідати таким правилам:

```txt
TypeScript
ESM
4 spaces indent
single quotes
no semicolons
trailing commas disabled
avoid any
explicit undefined handling
braces always
print width around 100
```

Заборонено:

```txt
decorators as required API
reflect-metadata
global service locator
implicit auto-wiring by parameter names
runtime magic based on class constructor metadata
```

---

## 8. Core design principles

Бібліотека має відповідати таким принципам:

```txt
1. Explicit over magical.
2. Typed tokens over string service names.
3. Composition over auto-discovery.
4. Runtime immutability after compose/freeze.
5. Module isolation by default.
6. No hidden dependency access across module boundaries.
7. Async initialization is supported, but normal get() remains sync.
8. DSL is optional and built over explicit object configuration.
9. Diagnostics must be readable and actionable.
10. Core package must be independent from Next.js.
```

---

# Part I. `@sagifire/ioc`

---

## 9. Tokens

### 9.1. Goal

Tokens are the primary identity mechanism for dependencies, capabilities, public APIs, required ports and multi-provider collections.

### 9.2. Base token contract

Implement:

```ts
export interface Token<TValue> {
    readonly id: string
    readonly description?: string
    readonly __type?: TValue
}
```

The `__type` field is phantom type metadata and must not be used at runtime.

### 9.3. Token creation

Implement:

```ts
export function token<TValue>(
    id: string,
    options?: {
        readonly description?: string
    }
): Token<TValue>
```

Example:

```ts
export const LOGGER = token<Logger>('logger')
export const DB = token<Database>('db')
```

### 9.4. Namespaces

Implement token namespaces:

```ts
export function namespace(idPrefix: string): TokenNamespace
```

Expected usage:

```ts
const contactRequests = namespace('contact-requests')

export const CONTACT_REQUESTS_PUBLIC_API =
    contactRequests.token<ContactRequestsPublicApi>('public-api')

export const CONTACT_REQUESTS_AUTH_READER =
    contactRequests.token<ContactRequestsAuthReader>('auth-reader')
```

Expected token ids:

```txt
contact-requests.public-api
contact-requests.auth-reader
```

### 9.5. Token rules

Requirements:

```txt
Token id must be stable.
Token id must be unique within a composed runtime.
Token object identity must not be required for matching.
Token id is the canonical runtime identity.
Tokens must not be created dynamically inside request handlers or use cases.
```

---

## 10. Container

### 10.1. Goal

The container provides typed dependency registration and resolution.

The container itself must not know anything about modules, Next.js, admin contributions or application-specific concepts.

### 10.2. Container lifecycle

The container has two phases:

```txt
Configuration phase:
    mutable
    providers can be registered

Runtime phase:
    frozen/immutable
    providers cannot be added, removed or replaced
```

### 10.3. Basic API

Implement:

```ts
export function createContainer(): ContainerBuilder
```

Required API shape:

```ts
const container = createContainer()

container.bind(LOGGER).toValue(logger)
container.bind(DB).toFactory(({ get }) => createDbClient())
container.bind(USER_REPOSITORY).toClass(UserRepository).singleton()

const runtime = await container.freeze()

const logger = runtime.get(LOGGER)
```

### 10.4. Provider binding

Support:

```ts
bind(token).toValue(value)
bind(token).toFactory(factory)
bind(token).toClass(ClassConstructor)
bind(token).toAsyncFactory(factory)
bind(token).toAsyncResource(factory)
```

### 10.5. Multi-provider binding

Support first-class multi-provider registration:

```ts
container.add(ADMIN_CONTRIBUTION).toValue(authAdminContribution)
container.add(ADMIN_CONTRIBUTION).toValue(contactRequestsAdminContribution)

const contributions = runtime.getAll(ADMIN_CONTRIBUTION)
```

Rules:

```txt
bind(token) is for single provider tokens.
add(token) is for multi-provider tokens.
get(token) must fail if token has multiple providers.
getAll(token) returns all providers for a token.
getAll(token) returns empty array if token has no providers.
```

### 10.6. Lifetimes

Support:

```txt
singleton
transient
scoped
```

Semantics:

```txt
singleton:
    one instance per frozen runtime

transient:
    new instance per resolution

scoped:
    one instance per scope
```

Default lifetime:

```txt
singleton for toValue
transient or singleton for factories must be explicitly decided in implementation and documented
```

Recommended default:

```txt
toValue:
    singleton

toFactory:
    transient by default

toClass:
    transient by default

toAsyncFactory:
    transient by default unless singleton() is specified

toAsyncResource:
    singleton or scoped must be explicit
```

### 10.7. Resolution API

Runtime must expose:

```ts
runtime.get<TValue>(token: Token<TValue>): TValue

runtime.tryGet<TValue>(token: Token<TValue>): TValue | undefined

runtime.getAll<TValue>(token: Token<TValue>): TValue[]

runtime.getAsync<TValue>(token: Token<TValue>): Promise<TValue>

runtime.tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
```

Important rule:

```txt
get() must never return Promise.
```

If a token is bound to lazy async provider and user calls `get()`, throw a typed diagnostic error with clear message.

### 10.8. Resolution context

Factories receive a resolution context:

```ts
export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
}
```

### 10.9. Cycle detection

Detect provider-level cycles.

Example:

```txt
A -> B -> C -> A
```

Must throw `CircularDependencyError`.

Error must include:

```txt
cycle path
token ids
provider type if possible
```

### 10.10. Invalid scope detection

If a scoped provider is resolved without active scope, throw `InvalidScopeError`.

---

## 11. Async model

### 11.1. Core rule

The library supports async initialization, but does not make normal dependency resolution async by default.

Main rules:

```txt
compose()/freeze() is async.
get() is sync and never returns Promise.
getAsync() is explicit.
Async eager providers initialize during compose/freeze.
Async eager providers are available through get() after compose/freeze.
Async lazy providers are available only through getAsync().
Async resources can have dispose callbacks.
```

### 11.2. Provider types

Support three provider categories:

```txt
Sync provider:
    initialized immediately or lazily
    accessed via get()

Async eager provider:
    initialized during freeze/compose
    accessed via get() after runtime is ready

Async lazy provider:
    initialized on first getAsync()
    accessed only via getAsync()
```

Table:

```txt
Provider type        Init moment          Access API
----------------------------------------------------
sync                 immediate/lazy        get()
async eager          freeze/compose        get()
async lazy           first getAsync()      getAsync()
```

### 11.3. Async eager resource

Required usage:

```ts
container
    .bind(DB)
    .toAsyncResource(async () => {
        const db = await connectDb()

        return {
            value: db,
            dispose: async () => {
                await db.close()
            }
        }
    })
    .singleton()
    .eager()
```

After freeze:

```ts
const runtime = await container.freeze()
const db = runtime.get(DB)
```

### 11.4. Async lazy provider

Required usage:

```ts
container
    .bind(EXTERNAL_SCHEMA)
    .toAsyncFactory(async () => {
        return loadExternalSchema()
    })
    .singleton()
    .lazy()
```

Access:

```ts
const schema = await runtime.getAsync(EXTERNAL_SCHEMA)
```

Invalid access:

```ts
runtime.get(EXTERNAL_SCHEMA)
```

Must throw clear error:

```txt
Token "external.schema" is async-lazy.
Use runtime.getAsync(EXTERNAL_SCHEMA), or mark provider as eager.
```

### 11.5. Failed lazy async initialization

Default behavior:

```txt
failed lazy async initialization is not cached
next getAsync() may retry initialization
```

Optional future extension:

```txt
cacheFailure()
```

Do not implement `cacheFailure()` unless explicitly included in the stage scope.

---

## 12. Resources and disposal

### 12.1. Disposable resource contract

Implement a resource model:

```ts
export interface Resource<TValue> {
    readonly value: TValue
    readonly dispose?: () => void | Promise<void>
}
```

### 12.2. Runtime disposal

Runtime must support:

```ts
await runtime.dispose()
```

Rules:

```txt
dispose() disposes initialized singleton resources.
dispose() must be idempotent.
dispose() must call disposers in safe reverse initialization order when possible.
After dispose(), get()/getAsync() must fail with RuntimeDisposedError.
```

### 12.3. Scope disposal

Scopes must support:

```ts
await scope.dispose()
```

Rules:

```txt
scope.dispose() disposes scoped resources.
scope.dispose() must be idempotent.
After scope.dispose(), scope.get()/scope.getAsync() must fail with ScopeDisposedError.
```

---

## 13. Context and scopes

### 13.1. Goal

Context scopes support request-specific, operation-specific, tenant-specific or transaction-specific dependencies.

### 13.2. Scope API

Runtime must support:

```ts
const scope = runtime.createScope()
```

Scope must expose:

```ts
scope.get<TValue>(token: Token<TValue>): TValue
scope.tryGet<TValue>(token: Token<TValue>): TValue | undefined
scope.getAll<TValue>(token: Token<TValue>): TValue[]
scope.getAsync<TValue>(token: Token<TValue>): Promise<TValue>
scope.dispose(): Promise<void>
```

### 13.3. Scoped values

Support registering scope-local values:

```ts
const scope = runtime.createScope({
    values: [
        [REQUEST_ID, requestId],
        [CURRENT_USER, currentUser],
        [LOCALE, locale]
    ]
})
```

Alternative object API is allowed if type-safe enough.

### 13.4. withScope helper

Runtime should support:

```ts
await runtime.withScope(async scope => {
    const service = scope.get(SERVICE)

    return service.doSomething()
})
```

`withScope` must automatically dispose scope after callback.

### 13.5. Context is not a service locator

Do not encourage application layer to resolve arbitrary dependencies from context.

Recommended application style:

```ts
publicApi.method(ctx, input)
```

Not recommended:

```ts
useCase.execute(input, scope)
```

The scope exists for runtime/composition boundaries, not as a replacement for explicit dependencies.

---

## 14. Composer

### 14.1. Goal

Composer assembles application modules, validates dependency graph, creates module scopes, binds required ports, collects capabilities and returns immutable runtime.

### 14.2. Basic API

Required usage:

```ts
const composer = createComposer()

composer.use(authModule)
composer.use(contactRequestsModule)

composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory(({ runtime }) => {
    const auth = runtime.get(AUTH_PUBLIC_API)

    return {
        getCurrentUser: ctx => auth.getCurrentUser(ctx),
        requirePermission: (ctx, permission) => {
            return auth.requirePermission(ctx, permission)
        }
    }
})

const runtime = await composer.compose()
```

### 14.3. Module definition

Implement object-configuration API:

```ts
export interface ModuleDefinition {
    readonly id: string
    readonly version?: string
    readonly requires?: readonly ModuleDependencyDefinition[]
    readonly provides?: readonly ModuleCapabilityDefinition[]
    readonly setup: ModuleSetupFunction
}
```

Generic version is allowed:

```ts
export interface ModuleDefinition<TMetadata = unknown> {
    readonly id: string
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires?: readonly ModuleDependencyDefinition[]
    readonly provides?: readonly ModuleCapabilityDefinition[]
    readonly setup: ModuleSetupFunction
}
```

### 14.4. Module dependency definition

```ts
export interface ModuleDependencyDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly required?: boolean
    readonly kind?: 'external' | 'shared'
    readonly description?: string
}
```

Default:

```txt
required = true
kind = external
```

### 14.5. Module capability definition

```ts
export interface ModuleCapabilityDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly kind:
        | 'public-api'
        | 'admin-contribution'
        | 'event-publisher'
        | 'event-subscriber'
        | 'shared-service'
        | 'custom'
    readonly description?: string
}
```

### 14.6. Module setup context

```ts
export interface ModuleSetupContext {
    readonly moduleId: string

    bind<TValue>(token: Token<TValue>): ProviderBindingBuilder<TValue>
    add<TValue>(token: Token<TValue>): MultiProviderBindingBuilder<TValue>

    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined

    getAll<TValue>(token: Token<TValue>): TValue[]
}
```

Async setup may be supported:

```ts
type ModuleSetupFunction =
    (context: ModuleSetupContext) => void | ModuleSetupResult | Promise<void | ModuleSetupResult>
```

### 14.7. Module setup result

Modules may return metadata/contributions:

```ts
export interface ModuleSetupResult {
    readonly capabilities?: readonly unknown[]
    readonly metadata?: unknown
}
```

If possible, prefer explicit token-based capabilities over untyped setup result.

### 14.8. Module isolation

Rules:

```txt
Each module gets a private module scope.
A module may bind its own internal providers.
A module may export declared capabilities.
A module may resolve its own required ports.
A module must not resolve internal providers of another module.
Runtime exposes only exported capabilities.
Composer can see the full graph.
Module setup cannot access composer after composition.
```

### 14.9. Required ports

Consumer module owns required port.

Example:

```ts
export const CONTACT_REQUESTS_AUTH_READER =
    token<ContactRequestsAuthReader>('contact-requests.auth-reader')
```

Provider module owns its public API.

Example:

```ts
export const AUTH_PUBLIC_API =
    token<AuthPublicApi>('auth.public-api')
```

Composition binding adapts provider API to consumer required port:

```ts
composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory(({ runtime }) => {
    const auth = runtime.get(AUTH_PUBLIC_API)

    return {
        getCurrentUser: ctx => auth.getCurrentUser(ctx),
        requirePermission: (ctx, permission) => {
            return auth.requirePermission(ctx, permission)
        }
    }
})
```

### 14.10. Runtime API

Composed runtime must expose:

```ts
runtime.get<TValue>(token: Token<TValue>): TValue
runtime.tryGet<TValue>(token: Token<TValue>): TValue | undefined
runtime.getAll<TValue>(token: Token<TValue>): TValue[]
runtime.getAsync<TValue>(token: Token<TValue>): Promise<TValue>
runtime.createScope(input?: CreateScopeInput): Scope
runtime.withScope<TValue>(callback: (scope: Scope) => Promise<TValue> | TValue): Promise<TValue>
runtime.inspect(): RuntimeInspection
runtime.dispose(): Promise<void>
```

---

## 15. Bindings

### 15.1. Goal

Bindings connect required ports to public APIs, adapters or shared services.

### 15.2. Binding API

Support:

```ts
composer.bind(TOKEN).toValue(value)
composer.bind(TOKEN).toFactory(factory)
composer.bind(TOKEN).toClass(ClassConstructor)
composer.bind(TOKEN).toAsyncFactory(factory)
```

Binding factory context:

```ts
export interface BindingFactoryContext {
    readonly runtime: Runtime
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
}
```

### 15.3. Adapter helper

Support ergonomic adapter DSL:

```ts
composer.adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using(auth => ({
        getCurrentUser: ctx => auth.getCurrentUser(ctx),
        requirePermission: (ctx, permission) => {
            return auth.requirePermission(ctx, permission)
        }
    }))
```

This helper may live in `dsl` if it is not needed in low-level composer API.

---

## 16. Dependency graph validation

Composer must validate:

```txt
duplicate module id
duplicate single-provider token
invalid duplicate provides
missing required dependency
provider-level cycles
module dependency cycles
invalid scope usage
invalid sync access to async lazy provider
invalid binding target
```

### 16.1. Missing dependency

Error must include:

```txt
missing token id
requiring module id
dependency kind
whether dependency is required
possible fix suggestions
```

### 16.2. Duplicate token

Error must include:

```txt
token id
all modules/providers that provide it
whether token was registered via bind() or add()
```

### 16.3. Cycle errors

Error must include path:

```txt
auth.public-api -> contact-requests.auth-reader -> auth.public-api
```

### 16.4. Validation API

Composer should support explicit validation before compose:

```ts
const report = composer.validate()

if (!report.ok) {
    throw new ComposerValidationError(report)
}
```

`compose()` must also validate.

---

## 17. Diagnostics

### 17.1. Typed errors

Implement typed errors:

```txt
SagifireIocError
DuplicateTokenError
DuplicateModuleIdError
MissingDependencyError
CircularDependencyError
InvalidScopeError
RuntimeDisposedError
ScopeDisposedError
ProviderResolutionError
AsyncProviderAccessError
ComposerValidationError
```

Each error must include:

```ts
readonly code: string
readonly message: string
readonly details?: unknown
readonly cause?: unknown
```

### 17.2. Diagnostic report

Implement:

```ts
export interface Diagnostic {
    readonly code: string
    readonly severity: 'error' | 'warning' | 'info'
    readonly message: string
    readonly details?: unknown
}

export interface DiagnosticReport {
    readonly ok: boolean
    readonly diagnostics: readonly Diagnostic[]
}
```

### 17.3. Formatting

Implement:

```ts
formatDiagnostics(report: DiagnosticReport): string
```

Messages must be readable for humans and useful for Codex.

Bad:

```txt
Cannot resolve dependency
```

Good:

```txt
Cannot resolve token "contact-requests.auth-reader".

Required by module:
    contact-requests

Declared in:
    contact-requests.requires

Possible fixes:
    - bind CONTACT_REQUESTS_AUTH_READER in composer
    - adapt AUTH_PUBLIC_API to CONTACT_REQUESTS_AUTH_READER
    - mark dependency as optional
```

---

## 18. DSL

### 18.1. Goal

DSL provides ergonomic syntax over explicit object configuration.

DSL must not replace the object API.

### 18.2. Module DSL

Support:

```ts
export const authModule = module('auth')
    .version('1.0.0')
    .provides(AUTH_PUBLIC_API, {
        kind: 'public-api'
    })
    .setup(({ bind }) => {
        bind(AUTH_PUBLIC_API).toFactory(createAuthPublicApi).singleton()
    })
```

The DSL must internally produce a normal `ModuleDefinition`.

### 18.3. App DSL

Support:

```ts
const runtime = await defineApp()
    .modules([
        authModule,
        contactRequestsModule
    ])
    .bindings([
        adapt(CONTACT_REQUESTS_AUTH_READER)
            .from(AUTH_PUBLIC_API)
            .using(auth => ({
                getCurrentUser: ctx => auth.getCurrentUser(ctx),
                requirePermission: (ctx, permission) => {
                    return auth.requirePermission(ctx, permission)
                }
            }))
    ])
    .compose()
```

### 18.4. DSL restrictions

DSL must not:

```txt
use decorators
use reflect-metadata
perform filesystem auto-discovery
hide dependency graph
depend on Next.js
require custom build plugin
```

---

## 19. Inspection API

Runtime/composer should expose inspection data useful for debugging, documentation and AI agents.

Implement:

```ts
runtime.inspect()
composer.inspect()
composer.getGraph()
```

Inspection data should include:

```txt
registered modules
provided capabilities
required dependencies
bindings
provider lifetimes
multi-provider tokens
dependency edges
diagnostic status
```

Do not expose actual private provider values unless explicitly safe.

---

# Part II. `@sagifire/ioc-next`

---

## 20. Goal

`@sagifire/ioc-next` integrates `@sagifire/ioc` with Next.js App Router.

It must keep Next.js as delivery layer and avoid putting business logic into routes, pages or server actions.

---

## 21. Runtime helper

Support cached runtime creation:

```ts
let runtimePromise: Promise<Runtime> | undefined

export function getRuntime(): Promise<Runtime> {
    if (!runtimePromise) {
        runtimePromise = createAppRuntime()
    }

    return runtimePromise
}
```

Provide a generic helper:

```ts
createNextRuntime(options)
```

Expected usage:

```ts
export const getAppRuntime = createNextRuntime({
    createRuntime: async () => {
        return createComposer()
            .use(authModule)
            .use(contactRequestsModule)
            .compose()
    }
})
```

---

## 22. Request context helper

Implement:

```ts
createNextRequestContext(input: {
    readonly runtime: Runtime
    readonly request?: Request
    readonly values?: readonly ScopeValueEntry[]
}): Promise<NextRequestContext>
```

The helper should create request/operation scope with common values:

```txt
request id
headers, if provided
cookies, if provided and supported safely
locale, if provided
current user, if provided by user callback
logger, if provided
```

Core package must not know these concepts. They live only in `ioc-next` or userland.

---

## 23. Route handler helper

Support:

```ts
export async function POST(request: Request) {
    return withRouteScope(request, async ({ runtime, scope }) => {
        const api = runtime.get(CONTACT_REQUESTS_PUBLIC_API)

        const body = await request.json()
        const result = await api.submit(scope, body)

        return Response.json(result)
    })
}
```

The exact API can differ, but must preserve the rule:

```txt
await runtime at boundary
create scope at boundary
call public API from module
do not put business logic in route handler
dispose scope after handler
```

---

## 24. Server Action helper

Support:

```ts
'use server'

export async function submitContactRequestAction(formData: FormData) {
    return withServerActionScope(async ({ runtime, scope }) => {
        const api = runtime.get(CONTACT_REQUESTS_PUBLIC_API)

        return api.submit(scope, {
            name: String(formData.get('name') ?? ''),
            email: String(formData.get('email') ?? ''),
            message: String(formData.get('message') ?? '')
        })
    })
}
```

---

## 25. Page integration

Expected style:

```tsx
export default async function Page() {
    const runtime = await getAppRuntime()

    return runtime.withScope(async scope => {
        const contactRequests = runtime.get(CONTACT_REQUESTS_PUBLIC_API)

        const result = await contactRequests.list(scope, {
            limit: 50
        })

        return <ContactRequestsAdminView items={result.items} />
    })
}
```

The helper must not require runtime route generation.

Next.js routes remain static App Router files.

---

# Part III. `@sagifire/ioc-testing`

---

## 26. Goal

Testing package provides safe ways to test modules, containers, bindings and composed runtimes.

It must not mutate frozen production runtime.

---

## 27. Test runtime

Support:

```ts
const testRuntime = await createTestRuntime({
    modules: [
        authModule,
        contactRequestsModule
    ],
    overrides: overrides => {
        overrides.bind(DB).toValue(fakeDb)
        overrides.bind(CLOCK).toValue(fakeClock)
        overrides.bind(CONTACT_REQUESTS_AUTH_READER).toValue(fakeAuthReader)
    }
})
```

Rules:

```txt
Overrides apply before compose.
Overrides create isolated test runtime.
Frozen runtime is never mutated.
```

---

## 28. Module test harness

Support testing one module with fake required ports:

```ts
const harness = await createModuleTestHarness(contactRequestsModule, {
    requiredPorts: required => {
        required.bind(CONTACT_REQUESTS_AUTH_READER).toValue(fakeAuthReader)
    },
    shared: {
        db: fakeDb,
        logger: fakeLogger
    }
})

const api = harness.runtime.get(CONTACT_REQUESTS_PUBLIC_API)
```

---

## 29. Graph assertions

Provide helpers:

```ts
expectGraph(runtime)
    .toProvide(CONTACT_REQUESTS_PUBLIC_API)
    .toRequire(CONTACT_REQUESTS_AUTH_READER)
    .not.toHaveCycles()
```

Exact API may differ, but the testing package must make dependency graph tests readable.

---

# Part IV. Reference architecture example

---

## 30. Example module: auth

Example token:

```ts
export interface AuthPublicApi {
    getCurrentUser(ctx: RequestContext): Promise<CurrentUser | null>

    requirePermission(
        ctx: RequestContext,
        permission: string
    ): Promise<void>
}

export const AUTH_PUBLIC_API = token<AuthPublicApi>('auth.public-api')
```

Example module:

```ts
export const authModule = defineModule({
    id: 'auth',
    version: '1.0.0',

    provides: [
        {
            token: AUTH_PUBLIC_API,
            kind: 'public-api'
        }
    ],

    setup({ bind }) {
        bind(AUTH_PUBLIC_API)
            .toFactory(() => {
                return createAuthPublicApi()
            })
            .singleton()
    }
})
```

---

## 31. Example module: contact-requests

Required port:

```ts
export interface ContactRequestsAuthReader {
    getCurrentUser(ctx: RequestContext): Promise<CurrentUser | null>

    requirePermission(
        ctx: RequestContext,
        permission: string
    ): Promise<void>
}

export const CONTACT_REQUESTS_AUTH_READER =
    token<ContactRequestsAuthReader>('contact-requests.auth-reader')
```

Public API:

```ts
export interface ContactRequestsPublicApi {
    submit(
        ctx: RequestContext,
        input: SubmitContactRequestInput
    ): Promise<SubmitContactRequestResult>

    list(
        ctx: RequestContext,
        query: ListContactRequestsQuery
    ): Promise<ListContactRequestsResult>
}

export const CONTACT_REQUESTS_PUBLIC_API =
    token<ContactRequestsPublicApi>('contact-requests.public-api')
```

Module:

```ts
export const contactRequestsModule = defineModule({
    id: 'contact-requests',
    version: '1.0.0',

    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER,
            required: true,
            kind: 'external'
        }
    ],

    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],

    setup({ bind, get }) {
        bind(CONTACT_REQUESTS_PUBLIC_API)
            .toFactory(() => {
                const authReader = get(CONTACT_REQUESTS_AUTH_READER)

                return createContactRequestsPublicApi({
                    authReader
                })
            })
            .singleton()
    }
})
```

Composition:

```ts
const runtime = await createComposer()
    .use(authModule)
    .use(contactRequestsModule)
    .bind(CONTACT_REQUESTS_AUTH_READER)
    .toFactory(({ runtime }) => {
        const auth = runtime.get(AUTH_PUBLIC_API)

        return {
            getCurrentUser: ctx => auth.getCurrentUser(ctx),
            requirePermission: (ctx, permission) => {
                return auth.requirePermission(ctx, permission)
            }
        }
    })
    .compose()
```

If chained `.bind().toFactory().compose()` is too difficult ergonomically, use explicit composer variable:

```ts
const composer = createComposer()

composer.use(authModule)
composer.use(contactRequestsModule)

composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory(({ runtime }) => {
    const auth = runtime.get(AUTH_PUBLIC_API)

    return {
        getCurrentUser: ctx => auth.getCurrentUser(ctx),
        requirePermission: (ctx, permission) => {
            return auth.requirePermission(ctx, permission)
        }
    }
})

const runtime = await composer.compose()
```

---

# Part V. Implementation stages

---

## 32. Stage 1: Repository and build foundation

Implement:

```txt
pnpm workspace
package structure
TypeScript config
ESLint config
Prettier config
Vitest config
tsup or equivalent build
package exports
CI scripts
basic README
```

Acceptance criteria:

```txt
pnpm install works
pnpm build works
pnpm test works
all packages build independently
all package exports resolve correctly
types are generated
tree-shaking friendly sideEffects=false is configured
```

---

## 33. Stage 2: Tokens

Implement:

```txt
Token<T>
token()
namespace()
token id validation
token namespace tests
```

Acceptance criteria:

```txt
typed tokens infer TValue
namespace creates stable prefixed ids
token id is runtime identity
invalid token ids are rejected or diagnosed
```

---

## 34. Stage 3: Container sync providers

Implement:

```txt
createContainer()
bind().toValue()
bind().toFactory()
bind().toClass()
singleton
transient
freeze()
runtime.get()
runtime.tryGet()
provider cycle detection
duplicate token detection
```

Acceptance criteria:

```txt
sync providers resolve correctly
singleton returns same instance
transient returns new instance
duplicate single-provider token fails
provider cycles fail with readable error
runtime is immutable after freeze
```

---

## 35. Stage 4: Multi-provider

Implement:

```txt
add().toValue()
add().toFactory()
runtime.getAll()
single vs multi provider validation
```

Acceptance criteria:

```txt
multiple providers can be registered for same token via add()
getAll() returns all values
get() fails for multi-provider token
bind() duplicate still fails
```

---

## 36. Stage 5: Scopes

Implement:

```txt
runtime.createScope()
scope.get()
scope.tryGet()
scope.getAll()
scoped lifetime
scope-local values
scope.dispose()
runtime.withScope()
InvalidScopeError
```

Acceptance criteria:

```txt
scoped provider has one instance per scope
scoped provider cannot be resolved without scope
scope-local values override or extend runtime values according to documented rules
disposed scope cannot resolve values
withScope disposes scope automatically
```

---

## 37. Stage 6: Async providers and resources

Implement:

```txt
toAsyncFactory()
toAsyncResource()
eager()
lazy()
runtime.getAsync()
scope.getAsync()
runtime.dispose()
async resource disposal
AsyncProviderAccessError
RuntimeDisposedError
ScopeDisposedError
```

Acceptance criteria:

```txt
async eager provider initializes during freeze()
async eager provider is available via get()
async lazy provider initializes on getAsync()
get() on async lazy provider throws clear error
failed lazy async initialization is not cached by default
runtime.dispose() disposes singleton resources
scope.dispose() disposes scoped resources
dispose is idempotent
```

---

## 38. Stage 7: Diagnostics

Implement:

```txt
SagifireIocError
typed error classes
Diagnostic
DiagnosticReport
formatDiagnostics()
detailed error messages
```

Acceptance criteria:

```txt
all common failure modes produce typed errors
errors include codes
errors include useful details
formatDiagnostics() produces readable output
diagnostics are useful for humans and Codex
```

---

## 39. Stage 8: Composer and modules

Implement:

```txt
defineModule()
createComposer()
composer.use()
composer.bind()
composer.compose()
module private scopes
requires/provides metadata
runtime capability registry
module graph
composer.validate()
composer.inspect()
runtime.inspect()
```

Acceptance criteria:

```txt
multiple modules can be composed
module ids are unique
provided single tokens are unique
missing required ports fail validation
bindings can satisfy required ports
runtime exposes exported capabilities
module internals are not exposed through runtime
inspection returns useful module graph
```

---

## 40. Stage 9: Module graph cycle detection

Implement:

```txt
module dependency graph
module cycle detection
capability dependency edges
binding dependency edges
```

Acceptance criteria:

```txt
module-level cycles are detected
cycle path is included in diagnostics
valid acyclic graphs compose successfully
```

---

## 41. Stage 10: DSL

Implement:

```txt
module()
defineApp()
adapt()
bind helper DSL
DSL to object config conversion
```

Acceptance criteria:

```txt
DSL creates valid ModuleDefinition
DSL creates valid app composition
DSL does not require decorators
DSL does not hide graph from inspection
object API remains fully usable without DSL
```

---

## 42. Stage 11: `@sagifire/ioc-testing`

Implement:

```txt
createTestRuntime()
createTestComposer()
override helpers
createModuleTestHarness()
fakeModule()
graph assertion helpers
```

Acceptance criteria:

```txt
test runtime can override providers before compose
frozen runtime is never mutated
single module can be tested with fake required ports
graph assertions are readable
testing helpers work with Vitest
```

---

## 43. Stage 12: `@sagifire/ioc-next`

Implement:

```txt
createNextRuntime()
cached runtime helper
createNextRequestContext()
withRouteScope()
withServerActionScope()
Next.js examples
```

Acceptance criteria:

```txt
Next adapter depends on @sagifire/ioc
core does not depend on Next.js
runtime can be cached safely
route handlers can create/dispose request scope
server actions can create/dispose operation scope
examples work in Next.js App Router
```

---

## 44. Stage 13: Documentation and examples

Implement docs:

```txt
README.md
architecture.md
container.md
async-model.md
composer.md
modules.md
next-integration.md
testing.md
diagnostics.md
migration-from-di-container.md
```

Examples:

```txt
basic-node
next-app-router
module-composition
async-db-resource
testing-overrides
```

Acceptance criteria:

```txt
public API is documented
async model is clearly explained
module isolation is clearly explained
Next.js integration is demonstrated
testing workflow is demonstrated
```

---

## 45. Stage 14: Release automation

Implement:

```txt
changesets or equivalent release workflow
package versioning
changelog generation
GitHub Actions CI
npm publish workflow
provenance support if applicable
```

Acceptance criteria:

```txt
packages can be versioned independently or together according to chosen release strategy
CI runs tests/build/typecheck
release artifacts are valid
npm package exports work after publish dry-run
```

---

# Part VI. Testing requirements

---

## 46. Unit tests

Cover:

```txt
tokens
namespaces
provider registration
provider resolution
lifetimes
scopes
async providers
resources
disposal
diagnostics
DSL config conversion
```

---

## 47. Integration tests

Cover:

```txt
container + scope
container + async resources
composer + modules
composer + bindings
module isolation
runtime inspection
testing overrides
Next adapter with simulated route/action flow
```

---

## 48. Type tests

Add type-level tests where practical.

Cover:

```txt
token type inference
runtime.get() return type
runtime.getAsync() return type
factory context get() inference
module public API token inference
DSL inference
```

Recommended tools:

```txt
tsd
expect-type
vitest type assertions
```

Exact tool may be chosen during implementation.

---

## 49. Tree-shaking tests

Verify:

```txt
importing @sagifire/ioc/tokens does not include composer
importing @sagifire/ioc/container does not include next adapter
core package does not import Next.js
ioc-next is separate
sideEffects=false is valid
```

---

# Part VII. Codex rules

---

## 50. Rules for Codex implementation

Codex must follow these rules:

```txt
1. Do not add decorators as required API.
2. Do not add reflect-metadata.
3. Do not add global mutable container.
4. Do not import Next.js from @sagifire/ioc.
5. Do not import React from @sagifire/ioc.
6. Do not use Node-only APIs in @sagifire/ioc.
7. Do not make get() return Promise.
8. Do not mutate runtime after freeze/compose.
9. Do not implement filesystem auto-discovery.
10. Do not hide dependency graph behind DSL magic.
11. Do not expose module private providers through runtime.
12. Do not implement arbitrary runtime plugin marketplace.
13. Do not use any unless unavoidable and justified.
14. Keep errors typed and readable.
15. Add tests with every behavior change.
16. Keep package exports tree-shaking friendly.
17. Keep object-configuration API usable without DSL.
18. Keep @sagifire/di-container separate; do not migrate it into this package.
```

---

# Part VIII. Definition of done

---

## 51. Project-level definition of done

The project is considered complete when:

```txt
@sagifire/ioc implements:
    typed tokens
    namespaces
    container
    sync providers
    async eager providers
    async lazy providers
    resources and disposal
    singleton/transient/scoped lifetimes
    scopes
    multi-provider
    composer
    modules
    capabilities
    required ports
    bindings
    graph validation
    diagnostics
    runtime inspection
    DSL

@sagifire/ioc-next implements:
    Next.js runtime helper
    request context helper
    route scope helper
    server action scope helper
    App Router examples

@sagifire/ioc-testing implements:
    test runtime
    test composer
    overrides
    module harness
    graph assertions

Repository provides:
    pnpm monorepo
    build scripts
    tests
    type tests
    CI
    package exports
    documentation
    examples
    release workflow
```

---

## 52. Architectural definition of done

The architecture is considered valid when:

```txt
Core package is independent from Next.js.
Runtime is immutable after compose/freeze.
get() is always synchronous.
async initialization is supported safely.
Modules cannot access internals of other modules.
Required ports are owned by consumer modules.
Public APIs/capabilities are exported explicitly.
Bindings connect required ports to providers/adapters.
Dependency graph can be inspected and validated.
Diagnostics explain problems clearly.
DSL remains optional.
Testing overrides do not mutate production runtime.
```

---

## 53. Safety definition of done

The implementation is considered safe when:

```txt
Every stage has tests.
Every stage has clear acceptance criteria.
Public API changes are intentional.
Errors are typed and documented.
Resources are disposed correctly.
No global runtime state exists in core.
No package boundary is violated.
No hidden framework-specific dependency leaks into core.
```

---

## 54. Recommended first implementation command for Codex

Start by creating repository foundation only:

```txt
Implement Stage 1 only.

Create pnpm monorepo for:
- packages/ioc
- packages/ioc-next
- packages/ioc-testing

Add:
- TypeScript config
- ESLint config
- Prettier config
- Vitest config
- build scripts
- package exports placeholders
- README skeleton
- docs skeleton
- CI-ready npm scripts

Do not implement container logic yet.
Do not add Next.js dependency to @sagifire/ioc.
Do not add decorators or reflect-metadata.
```

After Stage 1 is complete and tested, continue with Stage 2.
