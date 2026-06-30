# State

Updated: 2026-06-30
Starter Kit Version: 3.0
PDADM MVP Version: 0.3

## Current Focus

Stage 1 Project Memory bootstrap для `@sagifire/ioc` завершено після task-level human
review approval.

Project Memory тепер містить canonical контекст для:

- product vision і requirements;
- staged roadmap;
- domain glossary і open questions;
- technical architecture, stack, implementation rules, testing requirements і definition
  of done;
- trace mapping від root source documents до canonical memory;
- historical immutable source snapshot `memory/sources/SPEC.md`.

Stage 2 repository/build foundation завершено після task-level human review approval:

- [TASK-06.26-0004-stage-2-repository-build-foundation](tasks/plan/TASK-06.26-0004-stage-2-repository-build-foundation/index.md)

Stage 2 agent run створив monorepo/package/build foundation і не реалізовував container
logic або будь-яку Stage 3+ runtime behavior.

Stage 3 implementation planning завершено після task-level human review approval:

- [TASK-06.26-0005-stage-3-implementation-planning](tasks/plan/TASK-06.26-0005-stage-3-implementation-planning/index.md)

Stage 3 tokens implementation завершено після task-level human review approval:

- [TASK-06.26-0006-stage-3-tokens](tasks/plan/TASK-06.26-0006-stage-3-tokens/index.md)

RUN-001 реалізував тільки core token API: `Token<TValue>`, `token()`, `namespace()`,
token ID validation, public exports і tests. Container/composer/DSL/diagnostics framework
behavior не реалізовувався.

Stage 4 implementation planning завершено після task-level human review approval:

- [TASK-06.29-0007-stage-4-implementation-planning](tasks/plan/TASK-06.29-0007-stage-4-implementation-planning/index.md)

Stage 4 container sync providers implementation завершено після task-level human review
approval:

- [TASK-06.29-0008-stage-4-container-sync-providers](tasks/plan/TASK-06.29-0008-stage-4-container-sync-providers/index.md)

RUN-001 реалізував тільки sync single-provider container foundation:
`createContainer()`, `bind().toValue()`, `bind().toFactory()`, `bind().toClass()`,
singleton/transient lifetimes, async-compatible `freeze()`, immutable runtime
`get()` / `tryGet()`, duplicate token detection і provider cycle detection.

Stage 4 не реалізовував multi-provider, scopes, async providers/resources, composer, DSL,
diagnostics framework, Next.js adapters або testing helpers.

Stage 5 implementation planning завершено після task-level human review approval:

- [TASK-06.29-0009-stage-5-implementation-planning](tasks/plan/TASK-06.29-0009-stage-5-implementation-planning/index.md)

Stage 5 multi-provider implementation завершено після task-level human review approval:

- [TASK-06.29-0010-stage-5-multi-provider](tasks/plan/TASK-06.29-0010-stage-5-multi-provider/index.md)

RUN-001 реалізував тільки multi-provider container behavior: `add().toValue()`,
`add().toFactory()`, `runtime.getAll()`, `ResolutionContext.getAll()`, deterministic
registration order, strict single/multi-provider validation і tests. Stage 5 не
реалізовував scopes, async providers/resources, composer, DSL, diagnostics framework,
Next.js adapters або testing helpers.

Stage 6 implementation planning завершено після task-level human review approval:

- [TASK-06.29-0011-stage-6-implementation-planning](tasks/plan/TASK-06.29-0011-stage-6-implementation-planning/index.md)

Stage 6 scopes implementation завершено після task-level human review approval:

- [TASK-06.29-0012-stage-6-scopes](tasks/plan/TASK-06.29-0012-stage-6-scopes/index.md)

RUN-001 реалізував sync scopes behavior: `runtime.createScope()`, `runtime.withScope()`,
sync `Scope.get()` / `Scope.tryGet()` / `Scope.getAll()`, scoped lifetime,
scope-local values, idempotent `scope.dispose()`, scope-bound factory context and invalid
scope usage errors. Stage 6 не реалізував async providers/resources, `getAsync()`,
runtime disposal, composer, DSL, diagnostics framework, Next.js adapters або testing
helpers.

Stage 7 implementation planning завершено після task-level human review approval:

- [TASK-06.29-0013-stage-7-implementation-planning](tasks/plan/TASK-06.29-0013-stage-7-implementation-planning/index.md)

Stage 7 async providers/resources implementation завершено після task-level human review
approval:

- [TASK-06.29-0014-stage-7-async-providers-resources](tasks/plan/TASK-06.29-0014-stage-7-async-providers-resources/index.md)

RUN-001 реалізував async single-provider bindings through `bind()`,
`runtime.getAsync()` / `runtime.tryGetAsync()`, `scope.getAsync()`, async eager/lazy
initialization, singleton/scoped resource disposal, `runtime.dispose()`, minimal
async/disposal typed errors and Stage 7 tests. Stage 7 не реалізовував async
multi-provider contributions або `getAllAsync()`.

Stage 8 implementation planning завершено після task-level human review approval:

- [TASK-06.29-0015-stage-8-implementation-planning](tasks/plan/TASK-06.29-0015-stage-8-implementation-planning/index.md)

Stage 8 diagnostics implementation заплановано як дві implementation-задачі:

- [TASK-06.29-0016-stage-8-diagnostics-error-foundation](tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/index.md)
- [TASK-06.29-0017-stage-8-diagnostic-reports-formatting](tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/index.md)

Stage 8 planning зафіксував error code naming convention
`SAGIFIRE_IOC_<AREA>_<REASON>`, preservation of existing Stage 3-7 code strings,
`SagifireIocError` foundation first, and diagnostic report/formatter implementation as a
separate follow-up task.

Stage 8 diagnostics error foundation implementation завершено після task-level human
review approval:

- [TASK-06.29-0016-stage-8-diagnostics-error-foundation](tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/index.md)

RUN-001 реалізував `SagifireIocError`, `SagifireIocErrorOptions`,
`isSagifireIocError()`, root / `@sagifire/ioc/diagnostics` exports і migration existing
Stage 3-7 public typed errors to shared diagnostics foundation with safe structured
`details`. RUN-001 не реалізовував diagnostic reports, `formatDiagnostics()`,
composer/module diagnostics, DSL, adapters або testing helpers.

Stage 8 diagnostic reports and formatting implementation завершено після task-level human
review approval:

- [TASK-06.29-0017-stage-8-diagnostic-reports-formatting](tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/index.md)

RUN-001 реалізував `DiagnosticSeverity`, `Diagnostic`, `DiagnosticReport`,
`formatDiagnostics()`, `diagnosticFromError()`, root / `@sagifire/ioc/diagnostics`
exports, deterministic plain-text formatting, generic unknown-error conversion and tests.
Stage 8 diagnostics scope завершено; composer/module graph diagnostics лишаються Stage 9+
scope.

Stage 9 implementation planning завершено після task-level human review approval:

- [TASK-06.30-0018-stage-9-implementation-planning](tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/index.md)

Stage 9 composer/modules implementation заплановано як п'ять послідовних implementation
задач:

- [TASK-06.30-0019-stage-9-module-definition-foundation](tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/index.md)
- [TASK-06.30-0020-stage-9-composer-builder-bindings-validation](tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/index.md)
- [TASK-06.30-0021-stage-9-module-setup-private-providers](tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/index.md)
- [TASK-06.30-0022-stage-9-composed-runtime-capabilities](tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/index.md)
- [TASK-06.30-0023-stage-9-inspection-api](tasks/plan/TASK-06.30-0023-stage-9-inspection-api/index.md)

Stage 9 planning зафіксував explicit object-configuration API first, private module
provider isolation, composition bindings that satisfy required ports without automatically
becoming public runtime capabilities, composed runtime capability gating and safe
inspection. Module-level cycle detection, capability dependency edges and binding
dependency edges залишаються Stage 10 scope.

Stage 9 module definition foundation implementation завершено після task-level human review
approval:

- [TASK-06.30-0019-stage-9-module-definition-foundation](tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/index.md)

RUN-001 реалізував `defineModule()`, module definition public types, dependency default
normalization, local duplicate requires/provides validation, typed module definition errors,
immutability and package export coverage. Composer runtime behavior, setup execution,
private providers, composed runtime, inspection API, DSL, adapters and Stage 10 cycle /
dependency-edge detection не реалізовувались.

Stage 9 composer builder, bindings and static validation implementation завершено після
task-level human review approval:

- [TASK-06.30-0020-stage-9-composer-builder-bindings-validation](tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/index.md)

RUN-001 реалізував `createComposer()`, `composer.use()`, `composer.bind()`,
composition binding metadata, static `composer.validate()` reports, duplicate module ID
diagnostics, duplicate provided capability diagnostics, missing required port diagnostics,
invalid binding target diagnostics, typed composer validation errors and tests. RUN-001 не
реалізовував module setup execution, private providers, `composer.compose()`, composed
runtime, inspection API, DSL/adapters або Stage 10 cycle/dependency-edge detection.

Stage 9 module setup and private providers implementation завершено після task-level human
review approval:

- [TASK-06.30-0021-stage-9-module-setup-private-providers](tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/index.md)

RUN-001 реалізував `composer.prepare()`, module setup execution, module setup
`bind()` / `add()` registration, module-private provider token isolation, exported
provider registration metadata, module-bound provider factory contexts,
`PrivateProviderAccessError`, `MissingModuleProviderError` and tests. RUN-001 не
реалізовував final `composer.compose()` runtime wrapper, public runtime capability
`get()` / `tryGet()` gating, inspection API, DSL/adapters або Stage 10
cycle/dependency-edge detection.

Stage 9 composed runtime and capabilities implementation завершено після task-level human
review approval:

- [TASK-06.30-0022-stage-9-composed-runtime-capabilities](tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/index.md)

RUN-001 реалізував `composer.compose()`, immutable `ComposedRuntime` wrapper, public
runtime capability gating for exported capabilities, hiding required-port-only bindings and
module private providers, scoped public runtime wrapping, async/resource/disposal
pass-through through the internal container runtime and tests. RUN-001 не реалізовував
inspection API, DSL/adapters, testing helpers або Stage 10 cycle/dependency-edge detection.

Stage 9 inspection API implementation завершено після task-level human review approval:

- [TASK-06.30-0023-stage-9-inspection-api](tasks/plan/TASK-06.30-0023-stage-9-inspection-api/index.md)

RUN-001 реалізував `composer.inspect()`, `composer.getGraph()`, composed
`runtime.inspect()`, public inspection types, deterministic safe module graph metadata,
exported provider registration summaries, root / `@sagifire/ioc/composer` type exports,
tests and docs sync. RUN-001 не реалізовував Stage 10 module cycle detection, capability
dependency edges, binding dependency edges, DSL/adapters або testing helpers.

## Active Tasks

Немає задач у статусі `active`.

Задачі в `review`:

Немає.

Неархівні tasks:

- [TASK-06.26-0001-initial-implementation-planning](tasks/plan/TASK-06.26-0001-initial-implementation-planning/index.md)
  - Status: done
  - Summary: Початкове планування етапів реалізації проекту.
- [TASK-06.26-0002-project-memory-bootstrap](tasks/plan/TASK-06.26-0002-project-memory-bootstrap/index.md)
  - Status: done
  - Summary: Stage 1 перенесення `AGENTS.md` і `SPEC.md` у Project Memory.
- [TASK-06.26-0003-stage-2-implementation-planning](tasks/plan/TASK-06.26-0003-stage-2-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 2 implementation planning.
- [TASK-06.26-0004-stage-2-repository-build-foundation](tasks/plan/TASK-06.26-0004-stage-2-repository-build-foundation/index.md)
  - Status: done
  - Summary: Stage 2 repository/build foundation implementation task.
- [TASK-06.26-0005-stage-3-implementation-planning](tasks/plan/TASK-06.26-0005-stage-3-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 3 implementation planning.
- [TASK-06.26-0006-stage-3-tokens](tasks/plan/TASK-06.26-0006-stage-3-tokens/index.md)
  - Status: done
  - Summary: Stage 3 tokens implementation task.
- [TASK-06.29-0007-stage-4-implementation-planning](tasks/plan/TASK-06.29-0007-stage-4-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 4 implementation planning.
- [TASK-06.29-0008-stage-4-container-sync-providers](tasks/plan/TASK-06.29-0008-stage-4-container-sync-providers/index.md)
  - Status: done
  - Summary: Stage 4 container sync providers implementation task.
- [TASK-06.29-0009-stage-5-implementation-planning](tasks/plan/TASK-06.29-0009-stage-5-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 5 implementation planning.
- [TASK-06.29-0010-stage-5-multi-provider](tasks/plan/TASK-06.29-0010-stage-5-multi-provider/index.md)
  - Status: done
  - Summary: Stage 5 multi-provider implementation task.
- [TASK-06.29-0011-stage-6-implementation-planning](tasks/plan/TASK-06.29-0011-stage-6-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 6 implementation planning.
- [TASK-06.29-0012-stage-6-scopes](tasks/plan/TASK-06.29-0012-stage-6-scopes/index.md)
  - Status: done
  - Summary: Stage 6 scopes implementation task.
- [TASK-06.29-0013-stage-7-implementation-planning](tasks/plan/TASK-06.29-0013-stage-7-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 7 implementation planning.
- [TASK-06.29-0014-stage-7-async-providers-resources](tasks/plan/TASK-06.29-0014-stage-7-async-providers-resources/index.md)
  - Status: done
  - Summary: Stage 7 async providers/resources implementation task.
- [TASK-06.29-0015-stage-8-implementation-planning](tasks/plan/TASK-06.29-0015-stage-8-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 8 diagnostics implementation planning task.
- [TASK-06.29-0016-stage-8-diagnostics-error-foundation](tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/index.md)
  - Status: done
  - Summary: Stage 8 diagnostics error foundation implementation task.
- [TASK-06.29-0017-stage-8-diagnostic-reports-formatting](tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/index.md)
  - Status: done
  - Summary: Stage 8 diagnostic reports and formatting implementation task.
- [TASK-06.30-0018-stage-9-implementation-planning](tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 9 composer/modules implementation planning task.
- [TASK-06.30-0019-stage-9-module-definition-foundation](tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/index.md)
  - Status: done
  - Summary: Stage 9 module definition foundation implementation task.
- [TASK-06.30-0020-stage-9-composer-builder-bindings-validation](tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/index.md)
  - Status: done
  - Summary: Stage 9 composer builder, bindings and static validation implementation task.
- [TASK-06.30-0021-stage-9-module-setup-private-providers](tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/index.md)
  - Status: done
  - Summary: Stage 9 module setup and private providers implementation task.
- [TASK-06.30-0022-stage-9-composed-runtime-capabilities](tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/index.md)
  - Status: done
  - Summary: Stage 9 composed runtime and capabilities implementation task.
- [TASK-06.30-0023-stage-9-inspection-api](tasks/plan/TASK-06.30-0023-stage-9-inspection-api/index.md)
  - Status: done
  - Summary: Stage 9 inspection API implementation task.

## Recent Decisions

- Використовувати `memory/` як кореневу папку Project Memory.
- Канонічна мова пам'яті - українська.
- Агентський startup entrypoint: `agent-start.md`.
- Регламент PDADM MVP 0.3 доступний як knowledge package `knowledge/packages/pdadm-mvp-reglament/`.
- Перший project roadmap етап має бути memory bootstrap перед створенням монорепозиторію.
- `SPEC.md` Stage 1 Repository and build foundation стає Stage 2 у project roadmap.
- `TASK-06.26-0001-initial-implementation-planning` завершена після task-level human review approval.
- `TASK-06.26-0002-project-memory-bootstrap` завершена після task-level human review approval.
- `SPEC.md` перенесений структурно в Project Memory без створення окремого reusable
  knowledge package, бо це project-specific specification.
- `memory/sources/SPEC.md` є historical immutable source snapshot і не редагується під час
  реалізаційних або ordinary memory-update задач.
- `AGENTS.md` оновлено під фактичну Project Memory 3.0 / PDADM MVP 0.3.
- Для Stage 2 build tool використано `tsup`; майбутня заміна допустима тільки після
  конкретного implementation blocker і memory sync.
- Stage 2 implementation зафіксована окремою backlog-задачею `TASK-06.26-0004`.
- `TASK-06.26-0003-stage-2-implementation-planning` завершена після task-level human
  review approval.
- `TASK-06.26-0004-stage-2-repository-build-foundation` завершена після task-level human
  review approval.
- `TASK-06.26-0005-stage-3-implementation-planning` завершена після task-level human
  review approval.
- `TASK-06.26-0006-stage-3-tokens` створена як backlog implementation task.
- Для Stage 3 token type-level assertions planned approach - Vitest `expectTypeOf`.
- Stage 3 може додати мінімальний token-specific invalid ID error, але не реалізує full
  diagnostics layer до Stage 8.
- `TASK-06.26-0006-stage-3-tokens` RUN-001 виконаний агентом і переведений у `review`.
- `TASK-06.26-0006-stage-3-tokens` завершена після task-level human review approval.
- `TASK-06.29-0007-stage-4-implementation-planning` завершена після task-level human
  review approval.
- Stage 4 implementation зафіксована окремою backlog-задачею
  `TASK-06.29-0008-stage-4-container-sync-providers`.
- Для Stage 4 `freeze()` планується як async-compatible API:
  `Promise<ContainerRuntime>`, навіть якщо Stage 4 реалізує лише sync providers.
- Для Stage 4 default lifetimes: `toValue` - singleton, `toFactory` і `toClass` -
  transient.
- Stage 4 `toClass()` не використовує decorators, `reflect-metadata` або constructor
  metadata; підтримується no-argument constructor, а залежності wire-яться через
  `toFactory()`.
- Stage 4 може додати мінімальні container-specific typed errors, але не реалізує full
  diagnostics layer до Stage 8.
- `TASK-06.29-0008-stage-4-container-sync-providers` RUN-001 виконаний агентом і
  переведений у `review`.
- `TASK-06.29-0008-stage-4-container-sync-providers` завершена після task-level human
  review approval.
- `TASK-06.29-0009-stage-5-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 5.
- `TASK-06.29-0009-stage-5-implementation-planning` завершена після task-level human
  review approval.
- Stage 5 implementation зафіксована окремою backlog-задачею
  `TASK-06.29-0010-stage-5-multi-provider`.
- Для Stage 5 прийнято strict single/multi-provider model: `bind()` і `add()` не
  змішуються для одного token ID, `get()` fails для multi-provider token, `getAll()` fails
  для single-provider token, а missing token дає empty array.
- Для Stage 5 `getAll()` повертає public type `TValue[]`, але кожен call повертає fresh
  array у registration order.
- Stage 5 додає sync `ResolutionContext.getAll()` для factory providers.
- Stage 5 `add().toFactory()` transient by default і підтримує `.singleton()` /
  `.transient()`.
- `TASK-06.29-0010-stage-5-multi-provider` RUN-001 виконаний агентом і переведений у
  `review`.
- `TASK-06.29-0010-stage-5-multi-provider` завершена після task-level human review
  approval.
- `TASK-06.29-0011-stage-6-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 6.
- `TASK-06.29-0011-stage-6-implementation-planning` завершена після task-level human
  review approval.
- Stage 6 implementation зафіксована окремою backlog-задачею
  `TASK-06.29-0012-stage-6-scopes`.
- Stage 6 буде реалізовуватись однією implementation task, бо `Scope`, scoped lifetime,
  scope-local values і `withScope()` мають спільну active-scope resolution model.
- Для Stage 6 прийнято scope-local precedence model: single values override runtime
  single-provider resolution inside scope; multi values extend runtime multi-provider
  collections after runtime values; single/multi conflicts fail.
- Stage 6 scope-local values задаються під час `createScope()` / `withScope()` і не
  мутуються через public scope API після створення scope.
- Stage 6 додає `.scoped()` для sync factory/class providers і multi-provider factory
  contributions; `toValue()` лишається singleton.
- Stage 6 не додає `getAsync()`, async providers/resources або runtime disposal.
- `TASK-06.29-0012-stage-6-scopes` RUN-001 виконаний агентом, переведений у `review`
  і approved після task-level human review.
- Stage 6 реалізував `Scope`, `CreateScopeOptions`, scope-local values, `.scoped()`,
  `createScope()`, `withScope()` і мінімальні scope-specific typed errors без full
  diagnostics layer.
- `TASK-06.29-0012-stage-6-scopes` завершена після task-level human review approval.
- `TASK-06.29-0013-stage-7-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 7.
- Stage 7 implementation була зафіксована окремою backlog-задачею
  `TASK-06.29-0014-stage-7-async-providers-resources`.
- Stage 7 реалізована однією implementation task, бо async provider access,
  lazy/eager initialization, resource ownership and disposal мають спільну lifecycle
  model.
- Для Stage 7 прийнято single-provider async scope: `bind().toAsyncFactory()` і
  `bind().toAsyncResource()` додані для single-provider tokens; async multi-provider
  contributions and `getAllAsync()` не входять до Stage 7.
- Для Stage 7 `toAsyncFactory()` реалізовано як transient lazy by default; async factory
  providers можуть бути `transient`, `singleton` або `scoped`; eager initialization valid
  only for singleton providers.
- Для Stage 7 `toAsyncResource()` requires explicit `singleton()` або `scoped()`
  ownership; resources are lazy by default unless `eager()` is explicitly chosen.
- Runtime disposal owns initialized singleton resources; scope disposal owns initialized
  scoped resources; runtime disposal не створює hidden live-scope registry.
- `TASK-06.29-0013-stage-7-implementation-planning` завершена після task-level human
  review approval.
- `TASK-06.29-0014-stage-7-async-providers-resources` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 7 RUN-001 реалізував async single-provider `toAsyncFactory()` /
  `toAsyncResource()`, `getAsync()` / `tryGetAsync()`, `scope.getAsync()`, async
  eager/lazy initialization, singleton/scoped resource disposal and runtime disposal.
- Stage 7 RUN-001 не реалізовував async multi-provider contributions, `getAllAsync()`,
  composer, DSL, diagnostics framework, Next.js adapters або testing helpers.
- `TASK-06.29-0014-stage-7-async-providers-resources` завершена після task-level human
  review approval.
- `TASK-06.29-0015-stage-8-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 8.
- Stage 8 diagnostics implementation розбита на дві implementation-задачі:
  `TASK-06.29-0016-stage-8-diagnostics-error-foundation` і
  `TASK-06.29-0017-stage-8-diagnostic-reports-formatting`.
- Для Stage 8 прийнято error code naming convention:
  `SAGIFIRE_IOC_<AREA>_<REASON>`.
- Для Stage 8 прийнято зберігати existing Stage 3-7 public error code strings, якщо
  implementation не знайде прямий конфлікт.
- Stage 8 спершу має реалізувати `SagifireIocError`, options/details/cause, type guard і
  migration of existing typed errors; diagnostic reports and `formatDiagnostics()` мають
  іти після цього окремою task.
- Stage 8 не реалізує composer/module graph diagnostics; duplicate module IDs, missing
  required ports, invalid bindings, private provider exposure and module cycles лишаються
  Stage 9+ scope.
- `TASK-06.29-0015-stage-8-implementation-planning` завершена після task-level human
  review approval.
- `TASK-06.29-0016-stage-8-diagnostics-error-foundation` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 8 RUN-001 реалізував `SagifireIocError`, `SagifireIocErrorOptions`,
  `isSagifireIocError()`, safe structured `details` for existing Stage 3-7 public typed
  errors and root / `@sagifire/ioc/diagnostics` exports.
- Stage 8 RUN-001 preserved existing Stage 3-7 public error code strings and did not
  implement diagnostic reports/formatting.
- `TASK-06.29-0016-stage-8-diagnostics-error-foundation` завершена після task-level human
  review approval.
- `TASK-06.29-0017-stage-8-diagnostic-reports-formatting` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 8 reports/formatting RUN-001 реалізував `Diagnostic`, `DiagnosticReport`,
  `DiagnosticSeverity`, `formatDiagnostics()` і `diagnosticFromError()` without composer,
  DSL, adapters або testing helpers.
- `TASK-06.29-0017-stage-8-diagnostic-reports-formatting` завершена після task-level human
  review approval.
- `TASK-06.30-0018-stage-9-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 9.
- Stage 9 implementation розбита на п'ять implementation tasks: module definition
  foundation, composer builder/bindings/static validation, module setup and private
  providers, composed runtime capabilities, inspection API.
- Для Stage 9 прийнято explicit object-configuration API first; DSL helpers лишаються
  Stage 11.
- Для Stage 9 прийнято, що `composer.bind()` satisfies required ports but does not
  automatically expose the token as a public runtime capability.
- Для Stage 9 прийнято, що public composed runtime exposes only declared exported
  capabilities; module private providers must not be public runtime-resolvable.
- Stage 9 не реалізує module-level cycle detection, capability dependency edges or binding
  dependency edges; це Stage 10 scope.
- `TASK-06.30-0018-stage-9-implementation-planning` завершена після task-level human
  review approval.
- `TASK-06.30-0019-stage-9-module-definition-foundation` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 9 RUN-001 реалізував тільки module definition foundation:
  `defineModule()`, module definition types, default normalization, local duplicate
  requires/provides validation, typed errors, immutability and export coverage.
- Stage 9 RUN-001 не реалізовував `createComposer()`, composer builder/bindings,
  validation reports, setup execution, private providers, composed runtime, inspection API,
  DSL, adapters або Stage 10 cycle/dependency-edge detection.
- `TASK-06.30-0020-stage-9-composer-builder-bindings-validation` RUN-001 виконаний
  агентом, переведений у `review` і approved після task-level human review.
- Stage 9 composer builder RUN-001 реалізував `createComposer()`, `composer.use()`,
  composition-level `composer.bind()` for value/factory/class/async factory metadata,
  static `composer.validate()` and typed diagnostics for duplicate module IDs, duplicate
  capabilities, missing required ports and invalid binding targets.
- Stage 9 composer builder RUN-001 не реалізовував module setup execution, private
  providers, `composer.compose()`, composed runtime, inspection API, DSL/adapters або Stage
  10 cycle/dependency-edge detection.
- `TASK-06.30-0020-stage-9-composer-builder-bindings-validation` завершена після
  task-level human review approval.
- `TASK-06.30-0021-stage-9-module-setup-private-providers` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 9 module setup RUN-001 реалізував `composer.prepare()`, setup execution,
  module-private provider token isolation, exported provider registration metadata,
  module-bound provider factory contexts, `PrivateProviderAccessError` and
  `MissingModuleProviderError`.
- Stage 9 module setup RUN-001 не реалізовував final `composer.compose()` runtime wrapper,
  public runtime capability gating, inspection API, DSL/adapters або Stage 10
  cycle/dependency-edge detection.
- `TASK-06.30-0021-stage-9-module-setup-private-providers` завершена після task-level
  human review approval.
- `TASK-06.30-0022-stage-9-composed-runtime-capabilities` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 9 composed runtime RUN-001 реалізував `composer.compose()`, immutable
  `ComposedRuntime`, public capability gating, hidden required-port-only bindings, hidden
  module private providers, scoped public runtime wrapping, async/resource/disposal
  pass-through and tests.
- Stage 9 composed runtime RUN-001 не реалізовував inspection API, DSL/adapters, testing
  helpers або Stage 10 cycle/dependency-edge detection.
- `TASK-06.30-0022-stage-9-composed-runtime-capabilities` завершена після task-level
  human review approval.
- `TASK-06.30-0023-stage-9-inspection-api` RUN-001 виконаний агентом і переведений у
  `review` і approved після task-level human review.
- Stage 9 inspection API RUN-001 реалізував `composer.inspect()`, `composer.getGraph()`,
  composed `runtime.inspect()`, public inspection types, safe deterministic graph metadata
  and exported provider registration summaries.
- Stage 9 inspection API RUN-001 не реалізовував Stage 10 module cycle detection,
  capability dependency edges, binding dependency edges, DSL/adapters або testing helpers.
- `TASK-06.30-0023-stage-9-inspection-api` завершена після task-level human review
  approval.

## Current Risks

- DSL, Next.js adapters і testing helpers залишаються out of scope до відповідних roadmap
  stages.
- Module-level cycle detection and dependency-edge analysis залишаються out of scope до
  Stage 10, навіть після початку Stage 9 composer work.
- Root `SPEC.md` лишається source reference і може дублювати canonical memory; для
  operational рішень використовувати `memory/product/`, `memory/domain/` і
  `memory/technical/`.
- `pnpm install` під час Stage 2 потребував network permission для першої інсталяції
  залежностей; фінальний synced `pnpm install` проходить без мережі.

## Next Steps

- Перейти до Stage 10 module graph cycle detection planning/implementation за roadmap.

## Open Questions

- Для Stage 14 треба обрати остаточний інструмент type-level tests, якщо Vitest
  `expectTypeOf` стане недостатнім для складніших public API inference contracts.
