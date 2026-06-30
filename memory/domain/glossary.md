# Glossary

| Term | Meaning |
|---|---|
| `@sagifire/ioc` | Core runtime-agnostic package for typed tokens, container, context scopes, composer, DSL and diagnostics. |
| `@sagifire/ioc-next` | Next.js App Router adapter package that integrates composed runtime and request/operation scopes at framework boundaries. |
| `@sagifire/ioc-testing` | Testing package for isolated test runtimes, overrides, fake modules, module harnesses and graph assertions. |
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
| DSL | Optional ergonomic configuration layer over explicit object-configuration API. |
| Diagnostic | Structured error or report that explains validation or runtime failure with actionable details. |
| Inspection API | Runtime/composer API that exposes safe graph metadata without exposing private provider values. |
| Runtime target | Environment where core can run, including Node.js, browser, Edge-compatible and Workers-compatible environments where possible. |
