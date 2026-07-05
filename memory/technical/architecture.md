# Архітектура

Оновлено: 2026-07-05

## Джерела

- `AGENTS.md` architecture boundaries.
- `memory/product/vision.md`.
- `memory/product/requirements.md`.
- `memory/domain/glossary.md`.
- `memory/technical/rules.md`.
- Approved task fixations through Stage 17.

## Загальний опис

`@sagifire/ioc` є модульним IoC and composition kernel для TypeScript applications.
Архітектура відділяє низькорівневий dependency resolution від вищорівневої module
composition та framework adapters.

Основні шари:

```text
tokens
  typed identity, namespaces, metadata

container
  providers, lifetimes, sync/async resolution

context
  scopes, request/operation local values, scoped resources

composer
  module graph, module scopes, capabilities, required ports, bindings

dsl
  ergonomic configurators over object-configuration API

diagnostics
  typed errors, validation reports, readable formatting

testing package
  overrides, fake modules, test runtime, graph assertions

next package
  Next.js App Router helpers and adapters
```

## Core package

`@sagifire/ioc` містить:

- typed tokens і namespaces;
- container;
- runtime;
- scopes;
- module definitions;
- composer;
- diagnostics;
- object-configuration API;
- DSL.

`@sagifire/ioc` не містить:

- Next.js або React imports;
- Node-only APIs;
- decorators;
- `reflect-metadata`;
- filesystem discovery;
- global singleton container;
- service locator;
- testing helpers.

## Adapter packages

`@sagifire/ioc-next` є окремим Next.js integration package. Він містить:

- Next.js App Router runtime helpers;
- explicit request/action context helpers;
- route handler scope helpers;
- server action scope helpers;
- cached runtime helpers;
- examples для page/action/route integration.

Next package не змінює core package і не приховує current request/action scope у глобальному
стані.

## Testing package

`@sagifire/ioc-testing` містить:

- isolated test runtime;
- overrides;
- test composer;
- fake modules;
- module harnesses;
- dependency graph assertions;
- diagnostic assertions.

Testing package працює через public API і не мутує frozen production runtime.

## Architecture boundaries

- Container не знає про modules.
- Context не знає про Next.js.
- Composer використовує container/context для збирання application graph.
- Modules явно оголошують public capabilities і required ports.
- Private module providers не доступні через composed runtime.
- DSL працює поверх explicit object-configuration API.
- Object-configuration API лишається first-class.
- Next.js adapter живе поза core.
- Testing helpers створюють isolated test runtime/configuration.

## Token model

Tokens є primary identity mechanism для dependencies, capabilities, public APIs, required
ports і multi-provider collections.

Conceptual shape:

```ts
export interface Token<TValue> {
    readonly id: string
    readonly description?: string
}

export function token<TValue>(
    id: string,
    options?: {
        readonly description?: string
    }
): Token<TValue>
```

Namespaces створюють stable prefixed IDs:

```ts
const contactRequests = namespace('contact-requests')

export const CONTACT_REQUESTS_PUBLIC_API =
    contactRequests.token<ContactRequestsPublicApi>('public-api')
```

Token rules:

- token ID є canonical runtime identity;
- token object identity не є required for matching;
- token ID має бути unique within composed runtime;
- tokens не треба створювати dynamically inside request handlers or use cases;
- token metadata має бути safe for diagnostics.

## Container

Container надає typed registration and resolution для dependencies. Він має дві фази:

- configuration phase: mutable registration;
- runtime phase: frozen/immutable resolution.

Typical usage:

```ts
const container = createContainer()

container.bind(LOGGER).toValue(logger)
container.bind(DB).toFactory(({ get }) => createDbClient())
container.bind(USER_REPOSITORY).toClass(UserRepository).singleton()

const runtime = await container.freeze()
const logger = runtime.get(LOGGER)
```

Provider binding support:

- `bind(token).toValue(value)`;
- `bind(token).toFactory(factory)`;
- `bind(token).toClass(ClassConstructor)`;
- `bind(token).toAsyncFactory(factory)`;
- `bind(token).toAsyncResource(factory)`.

Multi-provider support:

- `bind(token)` призначений для single-provider tokens;
- `add(token)` призначений для multi-provider tokens;
- `get(token)` resolves single-provider tokens і fails for multi-provider tokens;
- `getAll(token)` resolves multi-provider collections;
- `getAll(token)` повертає empty array, якщо token не має provider registration.

Container rules:

- `freeze()` повертає `Promise<ContainerRuntime>`.
- Runtime immutable після `freeze()`.
- `get()` synchronous.
- Async providers доступні через `getAsync()` / `tryGetAsync()`.
- `toValue()` є singleton by definition.
- `toFactory()` є transient by default і може бути singleton/scoped where supported.
- `toClass()` не використовує decorators або metadata.
- `getAll()` повертає fresh array у registration order.
- Single/multi registration modes є strict для token ID.

## Lifetimes

Supported lifetimes:

- `singleton`: один instance на frozen runtime;
- `transient`: новий instance на resolution;
- `scoped`: один instance на scope.

Lifetime rules:

- `toValue()` завжди singleton.
- `toFactory()` default transient.
- `toClass()` default transient.
- `toAsyncFactory()` default transient.
- `toAsyncResource()` requires explicit singleton або scoped ownership.
- Scoped providers потребують active scope.

## Resolution context

Factories отримують resolution context:

```ts
type ResolutionContext = {
    get: <TValue>(token: Token<TValue>) => TValue
    tryGet: <TValue>(token: Token<TValue>) => TValue | undefined
    getAll: <TValue>(token: Token<TValue>) => readonly TValue[]
    getAsync: <TValue>(token: Token<TValue>) => Promise<TValue>
    tryGetAsync: <TValue>(token: Token<TValue>) => Promise<TValue | undefined>
}
```

Context rules:

- context is explicit;
- context не є global service locator;
- provider cycles мають diagnostic-friendly error;
- async providers/resources не доступні через sync `get()`;
- sync providers можуть resolve через async APIs after runtime is ready.

## Disposal

Runtime disposal:

- `runtime.dispose()` disposes initialized singleton resources;
- disposal idempotent;
- disposers викликаються у safe reverse initialization order where practical;
- runtime disposal не dispose live scopes мовчки, якщо немає explicit policy.

Scope disposal:

- `scope.dispose()` disposes scoped resources;
- disposal idempotent;
- disposing scope prevents new resolution through that scope;
- runtime-owned singleton resources лишаються owned by runtime.

## Scopes

Scopes представляють request, operation або task-local resolution context.

Scope APIs:

- `runtime.createScope()`;
- `runtime.withScope(callback)`;
- `scope.get(token)`;
- `scope.tryGet(token)`;
- `scope.getAll(token)`;
- `scope.dispose()`.

`runtime.withScope()` має створювати scope, передавати його user code і автоматично
викликати dispose. Context не повинен ставати service locator. Application APIs мають
отримувати scope/context explicitly where needed.

Scope-local values:

- local single value + runtime single provider: local value перемагає inside scope;
- local multi values + runtime multi providers: runtime values first, then local values;
- local single value + runtime multi provider: invalid;
- local multi values + runtime single provider: invalid;
- local single and local multi entries для same token ID: invalid;
- duplicate local single values для same token ID: invalid;
- multiple local multi values для same token ID: valid.

## Composer

Composer будує application graph з explicit modules and bindings.

Responsibilities:

- collect modules;
- реєструвати private providers;
- validate required ports;
- bind required ports to public capabilities або adapters;
- compose container runtime;
- expose safe graph inspection.

Modules явно описують, what they provide and require. Required ports належать consumer
modules. Public capabilities експортуються explicitly. Private module providers не доступні через
composed runtime.

Composer APIs include:

- `defineModule()`;
- `createComposer()`;
- `composer.use(module)`;
- `composer.bind(requiredPort).to(capability)`;
- `composer.compose()`;
- `composedRuntime.get(capabilityToken)`;
- `composedRuntime.inspect()`.

Validation includes:

- duplicate module IDs;
- duplicate single public capabilities;
- missing required ports;
- invalid binding targets;
- private provider exposure;
- module cycles;
- capability visibility rules.

## Module graph

Graph metadata має бути deterministic і safe for diagnostics.

Graph nodes:

- modules;
- capabilities;
- required ports;
- bindings;
- adapter sources where supported.

Graph edges:

- required port to provider module;
- module dependency edge;
- binding edge;
- adapter source edge where supported.

Inspection rules:

- expose module IDs, token IDs, capability metadata і required-port metadata;
- не expose provider values;
- не expose private runtime internals;
- не execute factories під час validation або inspection.

## Diagnostics

Diagnostics мають include useful token IDs, module IDs і cycle paths.

Rules:

- error code convention: `SAGIFIRE_IOC_<AREA>_<REASON>`;
- `SagifireIocError` is shared base class for public IoC diagnostics errors;
- errors carry safe structured details;
- `DiagnosticReport` contains `ok` and readonly diagnostics;
- `formatDiagnostics()` produces deterministic plain text;
- formatting is runtime-agnostic: no Node-only APIs, terminal colors, `process`, `Buffer`
  або framework dependencies.

Diagnostics categories:

- token validation;
- provider registration;
- provider resolution;
- lifecycle/disposal;
- scope errors;
- module validation;
- binding validation;
- graph cycles;
- private provider exposure;
- safe inspection.

## DSL

DSL надає ergonomic configurators:

- `module()`;
- `defineApp()`;
- bind helper DSL;
- `add()` helper DSL for composition-root multi contributions;
- `adapt(token, factory)` compatibility helper;
- `adapter(target).from(source).using(factory)` graph-aware adapter helper.

DSL rules:

- DSL compiles to object-configuration API;
- object configuration remains fully usable;
- DSL не створює second runtime/container/composer model;
- DSL не приховує dependency graph;
- graph-aware DSL adapters require explicit source declarations;
- compatibility `adapt(token, factory)` не інферить adapter-source graph edges;
- DSL не виконує filesystem discovery;
- DSL не робить object API legacy.

## Next.js integration

`@sagifire/ioc-next` integrates at framework boundaries:

- cached runtime accessor;
- request context helper;
- route handler scope helper;
- server action scope helper;
- page integration examples.

Rules:

- package owns all Next.js App Router adapter helpers;
- core package does not import Next.js or React;
- cached runtime initialization should deduplicate in-flight creation;
- request/action helpers manage scope disposal on success and failure;
- helpers не expose hidden current request/action service locator APIs.

## Testing architecture

Testing helpers support:

- isolated runtime;
- overrides;
- fake modules;
- module harness;
- graph assertions;
- diagnostic assertions.

Overrides apply before compose і ніколи не мутують frozen production runtime.

Testing package boundaries:

- no dependency from core to testing package;
- no mutation of production runtime;
- no hidden access to private provider values;
- no global mutable runtime registry.

## Documentation architecture

Stage 14 перетворює completed Stage 3-13 behavior на public learning material.

Documentation responsibilities:

- explain tokens;
- explain container and scopes;
- explain modules/composer;
- explain diagnostics;
- explain DSL;
- explain testing helpers;
- explain Next.js integration;
- provide migration guide.

Examples responsibilities:

- `examples/basic-node` demonstrates minimal container usage;
- `examples/module-composition` demonstrates module boundaries;
- `examples/async-db-resource` demonstrates async resources and disposal;
- `examples/testing-overrides` demonstrates testing package helpers;
- `examples/next-app-router` демонструє framework-boundary usage для Next adapter.

Docs мають описувати тільки implemented public API. Якщо docs потребують future ideas, їх
треба clearly mark as future work або винести в Project Memory tasks.

## Stage 17 extension points

Stage 17 audit identified possible `0.0.2` extensions:

- required-port cardinality semantics;
- first-class multi-capability contributor metadata;
- graph-aware adapter object API;
- adapter source graph edges;
- adapter-aware cycle diagnostics;
- child/derived scopes;
- additive `MultiToken` / `ContributionToken` type-level ergonomics;
- testing helpers for new graph concepts;
- docs/examples hardening.

Guardrails:

- do not reuse `requires.kind` in a way that conflicts with current dependency kind;
- keep diagnostic code namespace `SAGIFIRE_IOC_*`;
- add object API first for graph-aware adapters;
- preserve existing DSL `adapt()` behavior unless migration is explicitly planned;
- decide parent/child scope disposal policy before implementation;
- do not implement site-engine business APIs in core;
- do not add hidden current scope or AsyncLocalStorage service locator;
- keep multi/contribution token helpers as token-ID-based ergonomic markers, not a second
  runtime cardinality model;
- preserve `get()` as synchronous.
