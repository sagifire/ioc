# Technical Rules

Source trace:

- `AGENTS.md` sections `Архітектурні межі`, `Непорушні правила реалізації`,
  `Стиль коду`, `Робочий процес`.
- `SPEC.md` sections 7, 8 and 50.
- `memory/sources/SPEC.md` historical source snapshot.

## Architecture Boundaries

- `@sagifire/ioc` is the core package and must not import Next.js, React, Node-only APIs,
  `fs`, `path`, `process`, `Buffer`, decorators or `reflect-metadata`.
- `@sagifire/ioc-next` contains only Next.js App Router adapters/helpers and must not
  affect the core API.
- `@sagifire/ioc-testing` contains test utilities, overrides, fake modules, graph
  assertions and must not mutate frozen production runtime.
- Container does not know about modules.
- Context does not know about Next.js.
- Composer uses container/context to build application graph.
- DSL is an optional layer over explicit object-configuration API.
- Next.js adapter lives separately from core.
- `@sagifire/di-container` stays separate and must not be migrated into this package.

## Non-Negotiable Implementation Rules

- Do not add decorators as required API.
- Do not add `reflect-metadata`.
- Do not create a global mutable container or service locator.
- Do not import Next.js or React from `@sagifire/ioc`.
- Do not use Node-only APIs in `@sagifire/ioc`.
- Do not make `get()` return `Promise`.
- Do not mutate runtime after `freeze()` / `compose()`.
- Do not implement filesystem auto-discovery.
- Do not hide dependency graph behind DSL magic.
- Do not expose module private providers through runtime.
- Do not implement arbitrary runtime plugin marketplace.
- Avoid `any`; if unavoidable, the reason must be locally obvious.
- Keep errors typed, readable and diagnostic-friendly.
- Add tests with every behavior change.
- Keep package exports tree-shaking friendly.
- Keep object-configuration API fully usable without DSL.

## Core Design Principles

1. Explicit over magical.
2. Typed tokens over string service names.
3. Composition over auto-discovery.
4. Runtime immutability after compose/freeze.
5. Module isolation by default.
6. No hidden dependency access across module boundaries.
7. Async initialization is supported, but normal `get()` remains sync.
8. DSL is optional and built over explicit object configuration.
9. Diagnostics must be readable and actionable.
10. Core package must be independent from Next.js.

## Coding Style

- TypeScript.
- ESM.
- 4 spaces indent.
- Single quotes.
- No semicolons.
- No trailing commas.
- Avoid `any`.
- Explicitly handle `undefined`.
- Always use braces.
- Approximate print width: 100.

## Workflow Rules

- Implement staged work according to `memory/product/roadmap.md`.
- Do not skip to the next stage before current stage acceptance criteria are satisfied.
- Stage 2 creates only repository/build foundation and must not implement container logic.
- After changes, run relevant checks when available: build, tests, typecheck and lint.
- If dependencies are not installed or a command requires network access, ask for permission
  instead of bypassing it.
- Do not perform broad refactors without task-level need.
- Change only what the current task requires.

## Historical Source Reference Rules

- `memory/sources/SPEC.md` is a historical immutable source snapshot.
- Do not edit `memory/sources/SPEC.md` during implementation or ordinary memory-update tasks.
- If requirements change, update canonical Project Memory files.
- If a new source snapshot is needed, create it through a separate human-reviewed task.
- Root `SPEC.md` and `memory/sources/SPEC.md` are source references, not operational source
  of truth after `TASK-06.26-0002`.

## Stage Scope Guard

For implementation tasks, the task/run must state the roadmap stage. Any behavior outside
the stage is out of scope unless the user explicitly changes the task.

For Stage 2, allowed implementation scope is limited to workspace, package structure,
TypeScript, ESLint, Prettier, Vitest, build scripts, package export placeholders,
README/docs skeleton and CI-ready scripts.

For Stage 3, allowed implementation scope is limited to core token API:
`Token<TValue>`, `token()`, `namespace()`, token ID validation, root/subpath exports and
tests.

Stage 3 may introduce a minimal token-specific invalid ID error with a stable code and
readable message. It must not implement the full diagnostics layer, diagnostic reports or
diagnostic formatting.

For Stage 4, allowed implementation scope is limited to sync single-provider container
behavior: `createContainer()`, `bind().toValue()`, `bind().toFactory()`,
`bind().toClass()`, singleton/transient lifetimes, async-compatible `freeze()`,
immutable `runtime.get()` / `runtime.tryGet()`, duplicate single-provider token detection,
provider cycle detection, root/subpath exports and tests.

Stage 4 `toClass()` must stay explicit and no-magic: no decorators, no
`reflect-metadata`, no constructor parameter names and no constructor metadata. Use
`toFactory()` for classes that need dependencies.

Stage 4 may introduce minimal container-specific typed errors with stable local codes and
readable messages. It must not implement the full diagnostics layer, diagnostic reports or
diagnostic formatting.

For Stage 5, allowed implementation scope is limited to multi-provider container behavior:
`ContainerBuilder.add()`, `add().toValue()`, `add().toFactory()`, multi-provider factory
singleton/transient lifetimes, immutable `runtime.getAll()`, sync
`ResolutionContext.getAll()`, deterministic registration order, fresh `getAll()` result
arrays, strict single vs multi-provider validation, root/subpath exports and tests.

Stage 5 `getAll()` returns public type `TValue[]`, not `readonly TValue[]`, but each call
must return a fresh array so caller mutation cannot mutate runtime provider storage.

Stage 5 may introduce minimal multi-provider-specific typed errors with stable local codes
and readable messages. It must not implement the full diagnostics layer, diagnostic reports
or diagnostic formatting.

For Stage 6, allowed implementation scope is limited to sync scopes and scoped lifetime:
`runtime.createScope()`, `runtime.withScope()`, sync `Scope.get()` / `Scope.tryGet()` /
`Scope.getAll()`, `scope.dispose()`, `.scoped()` lifetime for sync factory/class
providers and multi-provider factory contributions, scope-local single values,
scope-local multi values, scope-bound factory resolution context, invalid scope usage
errors, root/subpath exports and tests.

Stage 6 scope-local precedence is explicit: scope-local single values override runtime
single-provider resolution for the same token ID inside that scope; scope-local multi
values extend runtime multi-provider collections in runtime-first, scope-local-after
order; single/multi token kind conflicts must fail instead of silently converting token
kind.

Stage 6 must not expose public mutable APIs for adding or replacing scope-local values after
scope creation.

Stage 6 may introduce minimal scope-specific typed errors with stable local codes and
readable messages. It must not implement the full diagnostics layer, diagnostic reports or
diagnostic formatting.

For Stage 7, allowed implementation scope is limited to async single-provider and resource
behavior: `bind().toAsyncFactory()`, `bind().toAsyncResource()`, valid async lifecycle/mode
helpers, `runtime.getAsync()`, `runtime.tryGetAsync()`, `scope.getAsync()`,
`ResolutionContext.getAsync()`, `ResolutionContext.tryGetAsync()`, `runtime.dispose()`,
async eager initialization during `freeze()`, async lazy initialization on `getAsync()`,
failed lazy initialization retry behavior, singleton/scoped in-flight initialization
de-duplication, singleton resource disposal, scoped resource disposal, disposed
runtime/scope errors, root/subpath exports and tests.

Stage 7 async support is single-provider only. It must not implement async multi-provider
contributions through `add()`, `getAllAsync()` or `scope.getAllAsync()` without a separate
roadmap decision.

Stage 7 must keep `get()` sync. Async lazy providers/resources must not be returned from
`get()` or `tryGet()`; invalid sync access must fail with readable typed
`AsyncProviderAccessError` or equivalent.

Stage 7 may introduce minimal async/disposal typed errors with stable local codes and
readable messages: `AsyncProviderAccessError`, `RuntimeDisposedError` and
`ScopeDisposedError` or equivalents. It must not implement the full diagnostics layer,
diagnostic reports or diagnostic formatting.

Stage 7 runtime disposal owns initialized singleton resources only. It must not add hidden
runtime-owned global/live scope registry or silently dispose live scopes.

For Stage 8, allowed implementation scope is limited to diagnostics behavior over the
already implemented Stage 3-7 core surface:

- diagnostics error foundation: `SagifireIocError`, constructor/options model, optional
  `details`, optional `cause`, type guard, stable public error code convention and
  migration of existing public token/container/context/async/scope errors to the shared
  base class;
- diagnostic reports and formatting: `DiagnosticSeverity`, `Diagnostic`,
  `DiagnosticReport`, `formatDiagnostics()` and a minimal typed-error-to-diagnostic bridge
  if needed.

Stage 8 error code convention is `SAGIFIRE_IOC_<AREA>_<REASON>`. Existing Stage 3-7 public
code strings must be preserved unless a direct conflict is found and documented in the run
result.

Stage 8 diagnostics details must be safe structured data. They may include token IDs,
token ID paths, expected/actual provider kinds, lifecycle modes, actions and scope reasons.
They must not expose provider values, resource instances, scope-local values or private
runtime internals.

Stage 8 must not change provider resolution semantics, async access semantics, scope
semantics or disposal ownership while migrating error classes.

Stage 8 must not implement composer/module graph diagnostics. Duplicate module IDs,
missing required ports, invalid bindings, private provider exposure, module cycles,
runtime inspection and graph validation start with composer stages.

Stage 8 formatting must not rely on Node-only APIs, terminal colors, `process`, `Buffer`,
Next.js, React, decorators or `reflect-metadata`.

## Stage 9 Composer Rules

Stage 9 starts composer/modules in `@sagifire/ioc`.

Stage 9 must preserve the architecture boundary:

- container does not import or know about composer/modules;
- composer uses container/context to build application graph;
- DSL remains optional and out of scope until Stage 11;
- Next.js and React remain outside core.

Stage 9 public runtime visibility:

- `composer.bind()` satisfies required ports but does not automatically expose tokens as
  public runtime capabilities;
- composed runtime exposes only declared exported capabilities;
- module private providers must not be public runtime-resolvable;
- module-bound setup/provider contexts must not resolve another module's private
  providers.

Stage 9 validation and diagnostics:

- use `SagifireIocError` and `DiagnosticReport` for composer validation failures;
- include safe structured details such as module IDs, token IDs, dependency kind and
  binding target;
- do not expose provider values, resource instances, scope-local values or private runtime
  internals.

Stage 9 must not implement module-level cycle detection, capability dependency edges,
binding dependency edges or cycle path diagnostics. These belong to Stage 10.

## Stage 10 Module Graph Rules

Stage 10 adds dependency-edge analysis and module cycle diagnostics to composer/module
graphs in `@sagifire/ioc`.

Stage 10 must preserve the architecture boundary:

- container does not import or know about composer/modules;
- dependency edges are composer graph metadata, not container behavior;
- DSL remains optional and out of scope until Stage 11;
- Next.js and React remain outside core.

Stage 10 graph edge rules:

- capability dependency edge represents required port consumer module -> provider module
  capability;
- binding dependency edge represents required port consumer module -> explicit composer
  binding;
- a binding-satisfied required port must not also create a module-to-module capability
  edge for the same required port;
- edge metadata must be deterministic and must not expose provider values, resource
  instances, scope-local values or private runtime internals.

Stage 10 cycle rules:

- module cycles are detected over module-to-module capability dependency edges;
- binding edges do not create module-level cycles by themselves;
- cycle diagnostics must include safe structured module ID path and token/capability path;
- valid acyclic graphs must still compose successfully.

Stage 10 validation must not execute binding factories, module provider factories or async
resources to infer hidden dependencies. Provider-level cycles inside factories remain
container/runtime diagnostics.

Stage 10 must not implement DSL helpers, `@sagifire/ioc-testing` graph assertions or
Next.js adapters.

DSL, testing helpers and adapters start only at their respective stages.
