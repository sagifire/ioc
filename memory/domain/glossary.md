# Glossary

| Term | Meaning |
|---|---|
| `@sagifire/ioc` | Core runtime-agnostic package for typed tokens, container, context scopes, composer, DSL and diagnostics. |
| `@sagifire/ioc-next` | Next.js App Router adapter package that integrates composed runtime and request/operation scopes at framework boundaries. |
| `@sagifire/ioc-testing` | Testing package for isolated test runtimes, overrides, fake modules, module harnesses and graph assertions. |
| Next adapter | Framework-boundary helpers in `@sagifire/ioc-next` that connect Next.js App Router handlers/actions to existing core runtime and scope APIs. |
| Cached runtime helper | Adapter/application-level helper that creates runtime once, deduplicates in-flight initialization and reuses the runtime without creating a core global container. |
| Next request context | Explicit token/value context for request or operation data that can be converted to core scope-local values. |
| Route handler scope helper | Next adapter helper that creates one scope for a route handler invocation and disposes it after success or failure. |
| Server action scope helper | Next adapter helper that creates one scope for a server action invocation and disposes it after success or failure. |
| Framework boundary | Entry point where framework code calls application modules, such as a Next.js route handler or server action. |
| Token | Typed dependency identity object with stable runtime `id`; object identity is not required for matching. |
| Token namespace | Helper that creates stable prefixed token IDs, for example `contact-requests.public-api`. |
| Provider | Registration that knows how to produce a token value through value, factory, class, async factory or async resource binding. |
| Single provider token | Token registered through `bind(token)` where exactly one provider is expected. |
| Multi-provider token | Token registered through `add(token)` where multiple providers are collected through `getAll()`. |
| Container | Low-level dependency registration and resolution mechanism. It does not know about modules or Next.js. |
| Container builder | Mutable configuration phase API used before `freeze()`. |
| Runtime | Frozen immutable container/composer output used for dependency resolution and inspection. |
| Freeze | Transition from mutable container configuration to immutable runtime. |
| Scope | Request, operation or task-local resolution context with scoped values and scoped resources. |
| Scoped value | Value available inside a scope, usually request/operation-specific context. |
| Scoped provider | Provider lifetime that creates one instance per scope and cannot be resolved without active scope. |
| Resource | Value with optional dispose callback, usually used for async or lifecycle-managed dependencies. |
| Composer | Higher-level module composition layer that uses container/context to build application graph. |
| Module definition | Explicit object definition of a module, its ID, required ports, provided capabilities and setup logic. |
| Module private provider | Provider registered by a module for its own implementation and not exposed through composed runtime public capability access. |
| Capability | Public API or contribution intentionally exported by a module. |
| Capability registry | Composer-owned registry of declared exported capabilities that gates what composed runtime exposes publicly. |
| Required port | Dependency contract owned by the consumer module and satisfied by another module or explicit binding. |
| Binding | Composition-level adapter that connects required ports to providers or public APIs. |
| Module graph | Inspectable graph of modules, capabilities, required ports, bindings and dependency edges. |
| Dependency edge | Safe graph metadata that explains how a required port is satisfied without exposing provider values or private runtime internals. |
| Capability dependency edge | Module graph edge from a consumer module required port to another module's provided capability. |
| Binding dependency edge | Module graph edge from a consumer module required port to an explicit composition-level binding. |
| Module cycle | Directed cycle between modules through capability dependency edges; diagnostics include module ID path and token/capability path. |
| DSL | Optional ergonomic configuration layer over explicit object-configuration API; it must not hide the dependency graph or replace the object API. |
| Module DSL | `module()`-style ergonomic declaration for module definitions that remains compatible with `defineModule()` and composer APIs. |
| App DSL | `defineApp()`-style ergonomic application composition layer that converts to explicit composer configuration. |
| Bind helper DSL | Ergonomic declaration layer for composition-level bindings that compiles to existing `composer.bind()` semantics. |
| `adapt()` | Explicit adapter helper for satisfying consumer-owned required ports through composition bindings without hidden dependency inference. |
| Testing runtime | Fresh runtime created for tests from isolated configuration; it must not mutate production runtime. |
| Test composer | Testing helper that builds a fresh composer configuration with modules, bindings and overrides before composition. |
| Override | Explicit test-only token binding applied before `freeze()` or `compose()`; it is not a patch to a frozen runtime. |
| Fake module | Explicit test module definition used to provide fake capabilities or ports while remaining visible in module graph inspection. |
| Module harness | Testing helper that composes one module under test with fake required ports or support modules. |
| Graph assertion | Testing helper that checks public module graph or inspection data with readable deterministic failure messages. |
| Diagnostic assertion | Testing helper that checks public diagnostics reports or typed diagnostic data with readable deterministic failure messages. |
| Diagnostic | Structured error or report that explains validation or runtime failure with actionable details. |
| Inspection API | Runtime/composer API that exposes safe graph metadata without exposing private provider values. |
| Runtime target | Environment where core can run, including Node.js, browser, Edge-compatible and Workers-compatible environments where possible. |
