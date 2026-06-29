# TASK-06.29-0010: Stage 5 multi-provider

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 5 multi-provider у `@sagifire/ioc`: `add().toValue()`,
`add().toFactory()`, immutable runtime `getAll()`, factory context `getAll()` і strict
single vs multi-provider validation.

## Product Context

Stage 5 робить container придатним для contribution-style dependencies, де один token
представляє ordered collection providers. Container лишається low-level dependency
registration/resolution mechanism і не знає про modules, composer, Next.js або testing
overrides.

## Scope

- Додати `add<TValue>(token)` до `ContainerBuilder`.
- Реалізувати public types для Stage 5 multi-provider surface:
  `MultiBindingBuilder` або еквівалентний type, `runtime.getAll()`,
  `ResolutionContext.getAll()` і multi-provider-specific errors where useful.
- Реалізувати `add(token).toValue(value)`.
- Реалізувати `add(token).toFactory(factory)`.
- Реалізувати `.singleton()` і `.transient()` lifetime modifiers для multi-provider
  factory providers.
- Реалізувати default lifetimes: `add().toValue()` singleton, `add().toFactory()`
  transient.
- Зберегти `freeze()` як async-compatible API, що повертає `Promise<ContainerRuntime>`.
- Зберегти immutable runtime після `freeze()`.
- Реалізувати `runtime.getAll(token)` для multi-provider tokens.
- Реалізувати `ResolutionContext.getAll(token)` для sync factory providers.
- Повернути values у deterministic registration order.
- Повернути fresh `TValue[]` із `getAll()`; mutation returned array не має мутувати
  runtime state.
- Повернути empty array з `getAll(token)`, якщо token повністю не зареєстрований.
- Зробити `runtime.get(token)` invalid для multi-provider token навіть при одному provider.
- Зробити `runtime.getAll(token)` invalid для token, зареєстрованого через `bind()`.
- Заборонити змішування `bind()` і `add()` для одного token ID.
- Зберегти duplicate single-provider token detection для `bind()`.
- Підтримати provider-level cycle detection через `get()` і `getAll()`.
- Використовувати token `id` як canonical provider key; не покладатися на token object
  identity.
- Додати мінімальні multi-provider-specific typed errors із readable messages без full
  diagnostics layer.
- Експортувати Stage 5 container API з `@sagifire/ioc/container`.
- Експортувати Stage 5 container API з root `@sagifire/ioc`, якщо це не порушує
  tree-shaking boundary.
- Додати runtime tests для multi value/factory providers, registration order, missing
  `getAll()`, strict single/multi validation, lifetimes, cycles і immutability after
  freeze.
- Додати type-level assertions для `add()`, `runtime.getAll()` і
  `ResolutionContext.getAll()` через Vitest `expectTypeOf`.
- Оновити package export smoke tests для Stage 5 exports.

## Out of Scope

- Реалізовувати `add().toClass()`, якщо implementation review явно не змінить Stage 5
  public API baseline.
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

## Stage 5 API Decisions

- `bind(token)` є single-provider registration API.
- `add(token)` є multi-provider registration API.
- Для одного token ID не можна змішувати `bind()` і `add()`.
- `add()` можна викликати багато разів для одного token ID.
- Multi-provider values resolve у registration order.
- `getAll()` повертає public type `TValue[]`, не `readonly TValue[]`.
- Кожен `getAll()` call повертає fresh array, щоб mutation returned array не змінював
  runtime state.
- `getAll()` повертає empty array для повністю missing token.
- `getAll()` fails для token, зареєстрованого через `bind()`.
- `get()` fails для token, зареєстрованого через `add()`.
- `add().toValue()` є singleton by definition.
- `add().toFactory()` transient by default; `.singleton()` кешує provider result per
  frozen runtime, `.transient()` створює new value per collection resolution.
- `ResolutionContext` у Stage 5 включає тільки sync APIs: `get()`, `tryGet()` і
  `getAll()`.
- Minimal errors можуть мати stable local `code`, але не мають наслідувати
  `SagifireIocError` до Stage 8.

## Acceptance Criteria

- [x] `ContainerBuilder.add(token)` public method доступний з `@sagifire/ioc/container`.
- [x] Root `@sagifire/ioc` exports Stage 5 container API або task result пояснює, чому
  лише subpath export використано.
- [x] `add(token).toValue(value)` реєструє multi-provider value contribution.
- [x] `add(token).toFactory(factory)` реєструє multi-provider sync factory contribution.
- [x] Multiple `add()` registrations для одного token ID allowed.
- [x] Multi-provider values resolve у registration order.
- [x] `runtime.getAll(token)` повертає всі values для multi-provider token.
- [x] `runtime.getAll(token)` повертає empty array для missing token.
- [x] `runtime.getAll(token)` повертає fresh array per call.
- [x] `runtime.get(token)` fails with readable typed error для multi-provider token.
- [x] `runtime.getAll(token)` fails with readable typed error для single-provider token.
- [x] `bind()` після `add()` і `add()` після `bind()` для одного token ID fail with
  readable typed error.
- [x] Duplicate `bind()` для single-provider token still fails.
- [x] `add().toFactory()` transient by default.
- [x] `.singleton()` для multi-provider factory caches one value per provider per frozen
  runtime.
- [x] `.transient()` для multi-provider factory creates new values per collection
  resolution.
- [x] `ResolutionContext.getAll()` works in sync factories and preserves token value
  inference.
- [x] Provider cycles через `get()` і `getAll()` fail with readable typed error including
  token ID path.
- [x] Token IDs є canonical provider identity; різні token objects із тим самим `id`
  resolve same provider collection.
- [x] Stage 5 не реалізує scopes, async providers/resources, composer, DSL, diagnostics
  report/formatter, Next.js adapters або testing helpers.
- [x] Runtime tests покривають multi-provider behavior, strict validation, lifetimes,
  cycles, `getAll()` missing behavior і freeze immutability.
- [x] Type-level assertions покривають `add()`, `runtime.getAll()` і factory context
  `getAll()` inference.
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
  - Purpose: Початковий autonomous implementation run для Stage 5 multi-provider.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Stage 5 implementation починається тільки після task-level human review approval planning
task `TASK-06.29-0009-stage-5-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
