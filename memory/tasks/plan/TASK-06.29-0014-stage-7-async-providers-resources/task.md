# TASK-06.29-0014: Stage 7 async providers and resources

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 7 async providers and resources у `@sagifire/ioc`: async single-provider
bindings, eager/lazy async resolution, explicit `getAsync()` APIs, runtime disposal,
async resource disposal and disposed runtime/scope errors.

## Product Context

Stage 7 робить container придатним для залежностей із async initialization and explicit
resource lifecycle. При цьому normal dependency resolution лишається sync: `get()` не
повертає `Promise`, async lazy values доступні тільки через `getAsync()`, а frozen runtime
залишається immutable після `freeze()`.

Stage 7 спирається на Stage 6 scopes: scoped async providers/resources мають жити в scope
boundary and be disposed by `scope.dispose()` / `withScope()`.

## Scope

- Додати single-provider `bind(token).toAsyncFactory(factory)`.
- Додати single-provider `bind(token).toAsyncResource(factory)`.
- Додати public `Resource<TValue>` або equivalent lifecycle contract.
- Додати async binding lifecycle/mode helpers for valid combinations of `singleton()`,
  `transient()`, `scoped()`, `eager()` and `lazy()`.
- Зробити `toAsyncFactory()` transient lazy by default.
- Підтримати `toAsyncFactory().singleton()` and `toAsyncFactory().scoped()`.
- Підтримати eager async factory initialization only for singleton providers.
- Зробити `toAsyncResource()` require explicit `singleton()` or `scoped()` ownership.
- Зробити async resources lazy by default unless `eager()` is explicitly chosen.
- Підтримати eager async resource initialization only for singleton resources.
- Додати `runtime.getAsync(token)`.
- Додати `runtime.tryGetAsync(token)`.
- Додати `scope.getAsync(token)`.
- Додати `ResolutionContext.getAsync(token)` and `ResolutionContext.tryGetAsync(token)`.
- Зробити sync providers resolvable through `getAsync()` / `tryGetAsync()`.
- Зробити async eager singleton providers/resources initialized during `freeze()`.
- Зробити async eager singleton providers/resources available through `get()` after
  `freeze()`.
- Зробити async lazy providers/resources initialized on first `getAsync()`.
- Зробити `get()` / `tryGet()` on async lazy provider/resource throw
  `AsyncProviderAccessError`.
- Зробити failed lazy async initialization not cached by default.
- De-duplicate in-flight singleton/scoped lazy initialization and clear it on rejection.
- Підтримати async provider cycle detection through `get()` / `getAsync()` and mixed
  sync/async dependency paths.
- Додати `runtime.dispose()`.
- Зробити `runtime.dispose()` dispose initialized singleton resources in reverse
  initialization order where possible.
- Зробити `scope.dispose()` dispose initialized scoped resources in reverse initialization
  order where possible.
- Зберегти idempotent disposal for runtime and scopes.
- Зробити runtime resolution and scope creation after `runtime.dispose()` fail with
  `RuntimeDisposedError`.
- Зробити scope resolution after `scope.dispose()` fail with `ScopeDisposedError`.
- Зберегти `withScope()` automatic scope disposal for async resources.
- Додати minimal typed errors with readable messages and local stable codes:
  `AsyncProviderAccessError`, `RuntimeDisposedError`, `ScopeDisposedError`.
- Експортувати lifecycle/resource API через `@sagifire/ioc/lifecycle` where appropriate.
- Експортувати Stage 7 runtime/context API з root `@sagifire/ioc` або пояснити в result,
  чому тільки subpath export використано.
- Оновити `@sagifire/ioc/container` and `@sagifire/ioc/context` exports where needed.
- Додати runtime tests for async factory/resource behavior, lazy/eager access, retry,
  disposal, scopes, cycles and Stage 4-6 regressions affected by async support.
- Додати type-level assertions for async factory/resource binding, `runtime.getAsync()`,
  `runtime.tryGetAsync()`, `scope.getAsync()` and async factory context inference.
- Оновити package export smoke tests for Stage 7 exports.

## Out of Scope

- Реалізовувати async multi-provider contributions through `add()`.
- Реалізовувати `getAllAsync()` або `scope.getAllAsync()`.
- Реалізовувати `scope.tryGetAsync()` unless the run identifies a concrete public API
  consistency blocker and documents it before implementation.
- Реалізовувати `cacheFailure()` або failure caching policy beyond the default retry
  behavior.
- Реалізовувати runtime-owned global/live scope registry.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Реалізовувати Next.js adapters або testing helpers.
- Додавати decorators, `reflect-metadata`, constructor parameter metadata, Node-only APIs,
  filesystem access або global mutable container.
- Змінювати `memory/sources/SPEC.md`.

## Stage 7 API Decisions

- Stage 7 async providers/resources are single-provider bindings only.
- Stage 7 does not define async collection resolution because current canonical API has no
  `getAllAsync()` contract.
- Sync `get()` remains sync and never returns `Promise`.
- Async eager singleton providers/resources initialize during `freeze()`.
- Async eager singleton providers/resources can be read through sync `get()` after
  `freeze()` and through `getAsync()`.
- Async lazy providers/resources are accessed only through `getAsync()`.
- `get()` and `tryGet()` on async lazy provider/resource throw `AsyncProviderAccessError`
  even if the value was already initialized by `getAsync()`.
- `tryGetAsync()` returns `undefined` only for truly missing single providers and does not
  suppress provider/resource/disposal errors.
- `toAsyncFactory()` defaults to transient lazy.
- Async factory providers may be `transient`, `singleton` or `scoped`.
- `eager()` is valid only for singleton async providers/resources.
- `toAsyncResource()` requires explicit singleton or scoped ownership.
- Runtime disposal owns initialized singleton resources only.
- Scope disposal owns initialized scoped resources only.
- Runtime disposal does not silently dispose live scopes or maintain a global scope
  registry.
- Existing scopes created before runtime disposal cannot resolve after runtime disposal,
  but `scope.dispose()` remains valid and idempotent for their initialized scoped
  resources.
- Disposer failures must not be hidden; if full aggregate diagnostics are too large for
  Stage 7, disposal may reject with the first disposer failure after best-effort cleanup of
  remaining initialized resources.
- Minimal Stage 7 errors may have stable local `code`, but must not inherit from
  `SagifireIocError` before Stage 8.

## Acceptance Criteria

- [ ] `BindingBuilder.toAsyncFactory()` public method is available for single-provider
  tokens.
- [ ] `BindingBuilder.toAsyncResource()` public method is available for single-provider
  tokens.
- [ ] `Resource<TValue>` or equivalent public resource contract is exported.
- [ ] `runtime.getAsync(token)` public method is available.
- [ ] `runtime.tryGetAsync(token)` public method is available.
- [ ] `scope.getAsync(token)` public method is available.
- [ ] `ResolutionContext.getAsync()` and `ResolutionContext.tryGetAsync()` are available
  to async provider factories.
- [ ] Sync providers resolve through `getAsync()` / `tryGetAsync()`.
- [ ] Async eager singleton provider initializes during `freeze()`.
- [ ] Async eager singleton provider is available through `get()` after `freeze()`.
- [ ] Async lazy provider initializes on `getAsync()`.
- [ ] `get()` and `tryGet()` on async lazy provider throw `AsyncProviderAccessError`.
- [ ] Failed lazy async initialization is not cached by default and later `getAsync()` can
  retry.
- [ ] In-flight singleton/scoped lazy initialization is de-duplicated.
- [ ] Async factory lifetimes work for transient, singleton and scoped providers.
- [ ] `toAsyncResource()` requires explicit singleton or scoped ownership.
- [ ] Singleton async resource disposer runs during `runtime.dispose()`.
- [ ] Scoped async resource disposer runs during `scope.dispose()` / `withScope()`.
- [ ] Runtime and scope disposal are idempotent.
- [ ] Disposers run in reverse initialization order where possible.
- [ ] Runtime resolution and scope creation after `runtime.dispose()` fail with
  `RuntimeDisposedError`.
- [ ] Scope resolution after `scope.dispose()` fails with `ScopeDisposedError`.
- [ ] Runtime disposal does not create hidden global live-scope ownership.
- [ ] Async provider cycles through `get()` / `getAsync()` are detected with token ID path.
- [ ] Stage 7 does not implement async multi-provider, `getAllAsync()`, composer, DSL,
  diagnostics report/formatter, Next.js adapters or testing helpers.
- [ ] Runtime tests cover Stage 7 behavior and Stage 4-6 regression cases affected by async
  providers/resources.
- [ ] Type-level assertions cover Stage 7 async API and async factory context inference.
- [ ] Package export smoke tests cover Stage 7 exports.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для Stage 7 async providers/resources.
  - Result: Stage 7 async providers/resources реалізовано й завершено після human review approval.

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Stage 7 implementation починається тільки після task-level human review approval planning
task `TASK-06.29-0013-stage-7-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
