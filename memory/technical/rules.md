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

Composer, DSL, diagnostics behavior and adapters start only at their respective stages.
