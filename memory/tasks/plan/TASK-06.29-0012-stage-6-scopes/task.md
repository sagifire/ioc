# TASK-06.29-0012: Stage 6 scopes

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 6 scopes у `@sagifire/ioc`: `runtime.createScope()`, sync scope
resolution APIs, scoped lifetime, scope-local values, idempotent `scope.dispose()`,
`runtime.withScope()` і strict validation for invalid scope usage.

## Product Context

Stage 6 робить container придатним для request/operation/task-local dependency context.
Scope є явною lifecycle boundary: він не мутує frozen runtime, не знає про Next.js,
не запускає async providers і не замінює explicit dependency injection в application API.

## Scope

- Додати public `Scope` type або equivalent.
- Додати `CreateScopeOptions` або equivalent explicit structure для scope-local single
  values and scope-local multi values.
- Додати `runtime.createScope(options?)`.
- Додати `runtime.withScope(callback)` і `runtime.withScope(options, callback)`.
- Додати sync `scope.get(token)`.
- Додати sync `scope.tryGet(token)`.
- Додати sync `scope.getAll(token)`.
- Додати `scope.dispose(): Promise<void>`.
- Зробити `scope.dispose()` idempotent.
- Зробити будь-яку sync resolution через disposed scope invalid.
- Розширити `ProviderLifetime` до `singleton | transient | scoped`.
- Додати `.scoped()` до `LifetimeBinding`.
- Підтримати scoped lifetime для sync single-provider `toFactory()` і `toClass()`.
- Підтримати scoped lifetime для multi-provider `toFactory()` contributions.
- Залишити `toValue()` singleton by definition.
- Зробити scoped provider cache per scope, not per runtime.
- Зробити runtime-level resolution of scoped providers invalid without active scope.
- Зробити scope-bound factory `ResolutionContext` capable of resolving scoped providers,
  scope-local values and scope-local multi values.
- Реалізувати scope-local single value precedence:
  local value overrides runtime single-provider resolution for same token ID within scope.
- Реалізувати scope-local multi value precedence:
  runtime multi-provider values resolve first, then scope-local multi values in declaration
  order.
- Заборонити silent single/multi conversion for scope locals:
  conflicting runtime/local token kind must fail with readable typed error.
- Заборонити duplicate scope-local single values for same token ID.
- Дозволити multiple scope-local multi values for same token ID.
- Зберегти `getAll()` fresh array behavior for scope-level multi resolution.
- Зберегти token `id` as canonical provider/scope-local identity.
- Підтримати provider cycle detection through scope-bound `get()` / `getAll()`.
- Додати мінімальні scope-specific typed errors із readable messages без full diagnostics
  layer.
- Експортувати Stage 6 context/scope API з `@sagifire/ioc/context`.
- Експортувати Stage 6 runtime/scope API з root `@sagifire/ioc` або пояснити в result,
  чому тільки subpath export використано.
- Оновити `@sagifire/ioc/container` exports only where needed for `ContainerRuntime`,
  `LifetimeBinding`, errors and related types.
- Додати runtime tests для scope creation, local values, scoped lifetimes, disposal,
  `withScope()`, strict conflicts, cycles and immutability after freeze.
- Додати type-level assertions для `runtime.createScope()`, `Scope.get()`,
  `Scope.tryGet()`, `Scope.getAll()`, scoped factory context inference and scope-local
  option helpers/types where practical.
- Оновити package export smoke tests для Stage 6 exports.

## Out of Scope

- Реалізовувати `scope.getAsync()`, `runtime.getAsync()` або `runtime.tryGetAsync()`.
- Реалізовувати `toAsyncFactory()`, `toAsyncResource()`, async eager/lazy providers або
  async resources.
- Реалізовувати `runtime.dispose()` або runtime resource disposal.
- Реалізовувати resource disposer ordering for scoped resources.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Реалізовувати Next.js adapters або testing helpers.
- Додавати mutable public API for adding/replacing scope-local values after scope
  creation.
- Додавати decorators, `reflect-metadata`, constructor parameter metadata, Node-only APIs,
  filesystem access або global mutable container.
- Змінювати `memory/sources/SPEC.md`.

## Stage 6 API Decisions

- Stage 6 реалізується однією task, бо active-scope resolution path є спільною причиною
  для `Scope`, scoped lifetime, scope-local values і `withScope()`.
- `Scope` є explicit boundary object and must be passed explicitly where needed.
- Context/scope APIs must not encourage arbitrary dependency lookup in business logic.
- Scope-local values are supplied at `createScope()` / `withScope()` time only.
- Scope-local single value overrides runtime single provider for the same token ID inside
  that scope.
- Scope-local multi values extend runtime multi-provider collections after runtime values.
- A token ID cannot be treated as both single and multi inside one scope.
- Runtime single registration plus local multi values for same token ID fails.
- Runtime multi registration plus local single value for same token ID fails.
- Local single and local multi entries for same token ID fail.
- Duplicate local single entries fail.
- Multiple local multi entries are allowed.
- `scope.get()` and `scope.tryGet()` fail for local/runtime multi-provider tokens.
- `scope.getAll()` fails for local/runtime single-provider tokens.
- Missing token with no local value follows Stage 5 behavior:
  `scope.get()` throws, `scope.tryGet()` returns `undefined`, `scope.getAll()` returns `[]`.
- `.scoped()` is supported on `LifetimeBinding`, so it applies to sync single factory/class
  providers and multi-provider factory contributions.
- `toValue()` remains singleton and does not receive a scoped variant.
- Scoped providers cannot be resolved through runtime-level `get()` / `tryGet()` /
  `getAll()` without active scope.
- `withScope()` always disposes the scope in `finally` and preserves callback result or
  failure.
- `scope.dispose()` returns `Promise<void>` for forward compatibility with Stage 7 resource
  disposal, even though Stage 6 only marks sync scope invalid.
- Minimal errors may have stable local `code`, but must not inherit from `SagifireIocError`
  before Stage 8.

## Acceptance Criteria

- [ ] `ContainerRuntime.createScope(options?)` public method is available.
- [ ] `ContainerRuntime.withScope(callback)` public method is available.
- [ ] `ContainerRuntime.withScope(options, callback)` public method is available.
- [ ] `Scope.get(token)` resolves scope-local single values and runtime single providers.
- [ ] `Scope.tryGet(token)` returns `undefined` only for truly missing single providers.
- [ ] `Scope.getAll(token)` resolves runtime multi-provider values plus scope-local multi
  values in documented order.
- [ ] `Scope.getAll(token)` returns fresh arrays and `[]` for truly missing collection.
- [ ] Scope-local single values override runtime single-provider values only inside that
  scope.
- [ ] Scope-local multi values extend runtime multi-provider collections after runtime
  values.
- [ ] Single/multi scope-local conflicts fail with readable typed error.
- [ ] Duplicate local single values fail.
- [ ] Multiple local multi values are allowed and preserve declaration order.
- [ ] `.scoped()` lifetime modifier is available for factory/class providers and
  multi-provider factory contributions.
- [ ] Scoped single provider creates one value per scope.
- [ ] Scoped multi-provider factory contribution creates one value per scope per provider.
- [ ] Transient and singleton lifetimes keep Stage 4/5 behavior.
- [ ] Runtime-level resolution of scoped providers fails with readable typed error.
- [ ] Scope-bound factory context can resolve scoped dependencies and scope-local values.
- [ ] Provider cycles through scope-bound `get()` and `getAll()` are detected.
- [ ] `scope.dispose()` is idempotent.
- [ ] Disposed scope cannot resolve values.
- [ ] `withScope()` disposes scope after sync callback, async callback and thrown/rejected
  callback.
- [ ] Token IDs are canonical scope-local/provider identity.
- [ ] Stage 6 does not implement async providers/resources, `getAsync()`, runtime
  disposal, composer, DSL, diagnostics report/formatter, Next.js adapters or testing
  helpers.
- [ ] Runtime tests cover Stage 6 behavior and Stage 5 regression cases affected by scopes.
- [ ] Type-level assertions cover Stage 6 scope API and scoped factory context inference.
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
  - Purpose: Початковий autonomous implementation run для Stage 6 scopes.
  - Result: Stage 6 scopes реалізовано й завершено після human review approval.

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Stage 6 implementation починається тільки після task-level human review approval planning
task `TASK-06.29-0011-stage-6-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
