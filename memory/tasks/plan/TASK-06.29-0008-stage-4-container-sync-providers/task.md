# TASK-06.29-0008: Stage 4 container sync providers

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 4 container sync providers у `@sagifire/ioc`: mutable container builder,
single-provider sync bindings, singleton/transient lifetimes, immutable runtime після
`freeze()`, sync `runtime.get()` / `runtime.tryGet()`, duplicate provider detection і
provider cycle detection.

## Product Context

Stage 4 перетворює Stage 3 tokens на executable dependency identity. Container лишається
low-level dependency registration/resolution mechanism і не знає про modules, composer,
Next.js або testing overrides.

## Scope

- Реалізувати `createContainer()` у `packages/ioc/src/container.ts`.
- Реалізувати public types для Stage 4 container surface:
  `ContainerBuilder`, `ContainerRuntime`, `ResolutionContext`, sync provider factory,
  class constructor і lifetime-related types where useful.
- Реалізувати `bind(token).toValue(value)`.
- Реалізувати `bind(token).toFactory(factory)`.
- Реалізувати `bind(token).toClass(ClassConstructor)`.
- Реалізувати `.singleton()` і `.transient()` lifetime modifiers для factory/class
  providers.
- Реалізувати default lifetimes: `toValue` singleton, `toFactory` transient,
  `toClass` transient.
- Реалізувати `freeze()` як async-compatible API, що повертає `Promise<ContainerRuntime>`.
- Заборонити configuration mutation після successful `freeze()`.
- Реалізувати immutable runtime API `runtime.get(token)` і `runtime.tryGet(token)`.
- Використовувати token `id` як canonical provider key; не покладатися на token object
  identity.
- Реалізувати duplicate single-provider token detection.
- Реалізувати provider-level cycle detection із readable token ID path.
- Додати мінімальні container-specific typed errors із readable messages без full
  diagnostics layer.
- Експортувати container API з `@sagifire/ioc/container`.
- Експортувати container API з root `@sagifire/ioc`, якщо це не порушує tree-shaking
  boundary.
- Додати runtime tests для value/factory/class providers, lifetimes, duplicate detection,
  cycle detection, missing providers, `tryGet()` і immutability після freeze.
- Додати type-level assertions для `runtime.get()`, `runtime.tryGet()` і factory context
  inference через Vitest `expectTypeOf`.
- Переконатися, що existing package export smoke tests лишаються зеленими.

## Out of Scope

- Реалізовувати multi-provider `add()` або `runtime.getAll()`.
- Реалізовувати scopes, scoped lifetime, scope-local values, `runtime.createScope()` або
  `runtime.withScope()`.
- Реалізовувати async provider APIs: `toAsyncFactory()`, `toAsyncResource()`,
  `runtime.getAsync()` або `runtime.tryGetAsync()`.
- Реалізовувати resources, disposal або `runtime.dispose()`.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Реалізовувати Next.js adapters або testing helpers.
- Додавати decorators, `reflect-metadata`, constructor parameter metadata, Node-only APIs,
  filesystem access або global mutable container.
- Змінювати `memory/sources/SPEC.md`.

## Stage 4 API Decisions

- `freeze()` має повертати `Promise<ContainerRuntime>`, навіть якщо Stage 4 реалізує лише
  sync providers.
- `ResolutionContext` у Stage 4 включає тільки sync APIs: `get()` і `tryGet()`.
- `toValue` завжди singleton.
- `toFactory` transient by default; `.singleton()` кешує одне значення на frozen runtime.
- `toClass` transient by default; `.singleton()` кешує один instance на frozen runtime.
- `toClass()` не виконує constructor dependency injection і не читає metadata.
- `toClass()` приймає no-argument constructor (`new () => TValue`); класи із залежностями
  wire-яться через `toFactory(({ get }) => new Service(get(DEP)))`.
- `tryGet()` повертає `undefined` тільки коли provider відсутній; cycle/provider failures
  не приглушуються.
- Minimal errors можуть мати stable local `code`, але не мають наслідувати
  `SagifireIocError` до Stage 8.

## Acceptance Criteria

- [x] `createContainer()` public function доступна з `@sagifire/ioc/container`.
- [x] Root `@sagifire/ioc` exports Stage 4 container API або task result пояснює, чому
  лише subpath export використано.
- [x] `bind(token).toValue(value)` реєструє sync singleton value provider.
- [x] `bind(token).toFactory(factory)` реєструє sync factory provider.
- [x] `bind(token).toClass(ClassConstructor)` реєструє no-argument class provider.
- [x] `toFactory()` і `toClass()` transient by default.
- [x] `.singleton()` повертає same instance/value per frozen runtime для factory/class.
- [x] `.transient()` повертає new value/instance per resolution для factory/class.
- [x] `freeze()` повертає `Promise<ContainerRuntime>` і freezes configuration.
- [x] Configuration mutation після successful `freeze()` fails with readable typed error.
- [x] Runtime не має mutation APIs.
- [x] `runtime.get(token)` повертає typed value для registered provider.
- [x] `runtime.get(token)` fails with readable typed error для missing provider.
- [x] `runtime.tryGet(token)` повертає typed value або `undefined` для missing provider.
- [x] Token IDs є canonical provider identity; різні token objects із тим самим `id`
  resolve the same provider.
- [x] Duplicate single-provider token registration fails with readable typed error.
- [x] Provider cycles fail with readable typed error including token ID path.
- [x] Factory `ResolutionContext.get()` і `tryGet()` preserve token value inference.
- [x] Stage 4 не реалізує multi-provider, scopes, async providers/resources, composer,
  DSL, diagnostics report/formatter, Next.js adapters або testing helpers.
- [x] Runtime tests покривають value/factory/class providers, lifetimes, duplicates,
  cycles, missing providers, `tryGet()` і freeze immutability.
- [x] Type-level assertions покривають runtime/factory context inference.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

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
  - Purpose: Початковий autonomous implementation run для Stage 4 container sync providers.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Stage 4 починається тільки після task-level human review approval planning task
`TASK-06.29-0007-stage-4-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
