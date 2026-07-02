# State

Updated: 2026-07-02
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

Stage 10 implementation planning завершено після task-level human review approval:

- [TASK-06.30-0024-stage-10-implementation-planning](tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/index.md)

Stage 10 module graph cycle detection implementation заплановано як три послідовні
implementation задачі:

- [TASK-06.30-0025-stage-10-dependency-edge-model](tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/index.md)
- [TASK-06.30-0026-stage-10-module-cycle-diagnostics](tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/index.md)
- [TASK-06.30-0027-stage-10-runtime-inspection-hardening](tasks/plan/TASK-06.30-0027-stage-10-runtime-inspection-hardening/index.md)

Stage 10 planning зафіксував graph edge model, де capability dependency edges
відображають required port -> provided capability, binding dependency edges відображають
required port -> explicit composer binding, а module cycles detected over capability
dependency edges. `composer.validate()` не має виконувати binding factories для hidden
dependency inference.

Stage 10 dependency edge model implementation завершено після task-level human review
approval:

- [TASK-06.30-0025-stage-10-dependency-edge-model](tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/index.md)

RUN-001 реалізував public dependency edge types і deterministic `edges` metadata у
`ModuleGraph`, `ComposerInspection` і `RuntimeInspection` for capability dependency edges
and binding dependency edges. RUN-001 не реалізовував module cycle validation, cycle
diagnostics, DSL/adapters або testing helpers.

Stage 10 module cycle diagnostics implementation завершено після task-level human review
approval:

- [TASK-06.30-0026-stage-10-module-cycle-diagnostics](tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/index.md)

RUN-001 реалізував `ModuleCycleError`, `ModuleCycleErrorDetails`, cycle detection over
capability dependency edges, module/token path diagnostics, integration into
`composer.validate()`, `composer.inspect().validation`, `composer.prepare()` and
`composer.compose()`, plus runtime/type/export tests. RUN-001 не реалізовував DSL,
adapters, testing helpers або runtime inspection hardening task scope.

Stage 10 runtime inspection hardening implementation завершено після task-level human
review approval:

- [TASK-06.30-0027-stage-10-runtime-inspection-hardening](tasks/plan/TASK-06.30-0027-stage-10-runtime-inspection-hardening/index.md)

RUN-001 підсилив composed `runtime.inspect()` regression coverage for final Stage 10 graph
shape, runtime/composer edge parity, binding-edge semantics, non-execution of lazy
binding/provider/resource factories during validation/inspection, deterministic module
cycle path formatting, root/composer package export smoke tests and README sync. RUN-001 не
реалізовував DSL, adapters, testing helpers або new binding dependency declaration API.

Stage 10 module graph cycle detection завершено після task-level human review approval.

Stage 11 implementation planning завершено після task-level human review approval:

- [TASK-07.01-0028-stage-11-implementation-planning](tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/index.md)

Stage 11 DSL implementation заплановано як чотири послідовні implementation задачі:

- [TASK-07.01-0029-stage-11-module-dsl-foundation](tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/index.md)
- [TASK-07.01-0030-stage-11-define-app-dsl](tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/index.md)
- [TASK-07.01-0031-stage-11-bind-adapt-dsl](tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/index.md)
- [TASK-07.01-0032-stage-11-dsl-hardening-docs](tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/index.md)

Stage 11 planning зафіксував DSL як optional ergonomic layer over explicit
object-configuration/composer API. DSL має конвертуватися у наявні `defineModule()`,
`createComposer()`, `composer.use()` and `composer.bind()` semantics, зберігати graph
visibility and не додавати decorators, `reflect-metadata`, filesystem discovery, global
registries, testing helpers or Next.js adapters.

Stage 11 module DSL foundation implementation завершено після task-level human review
approval:

- [TASK-07.01-0029-stage-11-module-dsl-foundation](tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/index.md)

RUN-001 реалізував `module()` DSL over existing `defineModule()` semantics, object form
and id shorthand, root / `@sagifire/ioc/dsl` exports, runtime/type/package-export tests
and minimal public docs sync. RUN-001 не реалізовував `defineApp()`, `adapt()`,
composition-level bind helper DSL, testing helpers or Next.js adapters.

Stage 11 `defineApp()` DSL implementation завершено після task-level human review
approval:

- [TASK-07.01-0030-stage-11-define-app-dsl](tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/index.md)

RUN-001 реалізував `defineApp()` over existing composer semantics, fresh deterministic
conversion to `createComposer()`, `composer.use()` and `composer.bind()`, validation /
inspection / graph / prepare / compose delegation, minimal explicit app binding
declarations, root / `@sagifire/ioc/dsl` exports, runtime/type/package-export tests and
minimal public docs sync. RUN-001 не реалізовував `adapt()`, final bind helper DSL,
testing helpers or Next.js adapters.

Stage 11 bind/adapt DSL implementation завершено після task-level human review approval:

- [TASK-07.01-0031-stage-11-bind-adapt-dsl](tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/index.md)

RUN-001 реалізував `bind()` helper DSL declarations and `adapt()` over existing
`defineApp()` / `composer.bind()` semantics, root / `@sagifire/ioc/dsl` exports,
runtime/type/package-export tests and minimal public docs sync. RUN-001 не реалізовував
testing helpers, graph assertion helpers, Next.js adapters, hidden dependency inference or
changes to composer/runtime binding semantics.

Stage 11 DSL hardening/docs implementation завершено після task-level human review
approval:

- [TASK-07.01-0032-stage-11-dsl-hardening-docs](tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/index.md)

RUN-001 підсилив final DSL runtime/type/package-export coverage, додав DSL vs object API
validation/inspection/runtime graph parity regressions, перевірив explicit declaration /
no shared registry behavior, синхронізував minimal README/docs for optional DSL and object
API parity and verified build/test/typecheck/lint. RUN-001 не реалізовував testing
helpers, graph assertion helpers, Next.js adapters, decorators, `reflect-metadata`,
filesystem discovery, global registries, hidden dependency inference or changes to
composer/runtime binding semantics.

Stage 11 DSL завершено після approval фінальної hardening/docs task.

Stage 12 implementation planning завершено після task-level human review approval:

- [TASK-07.01-0033-stage-12-implementation-planning](tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/index.md)

Stage 12 `@sagifire/ioc-testing` implementation заплановано як п'ять послідовних
implementation задач:

- [TASK-07.01-0034-stage-12-testing-package-foundation](tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/index.md)
- [TASK-07.01-0035-stage-12-overrides-test-composer](tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/index.md)
- [TASK-07.01-0036-stage-12-module-harness-fake-modules](tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/index.md)
- [TASK-07.01-0037-stage-12-graph-diagnostic-assertions](tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/index.md)
- [TASK-07.01-0038-stage-12-testing-hardening-docs](tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/index.md)

Stage 12 planning зафіксував testing helper boundary: helpers live in
`@sagifire/ioc-testing`, create fresh test configuration/runtime instances, apply
overrides before `freeze()` / `compose()`, never mutate frozen runtime and use public graph
/ diagnostic data for assertions.

Stage 12 testing package foundation implementation завершено після task-level human
review approval:

- [TASK-07.01-0034-stage-12-testing-package-foundation](tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/index.md)

RUN-001 реалізував `createTestRuntime()` у `@sagifire/ioc-testing` як fresh
`createContainer()` / `freeze()` helper with explicit callback/options configuration,
runtime/type/export tests and minimal docs sync. RUN-001 не реалізовував overrides,
test composer, fake modules, module harnesses, graph/diagnostic assertions, Next.js
adapters або core runtime semantic changes.

Stage 12 overrides and test composer implementation завершено після task-level human review
approval:

- [TASK-07.01-0035-stage-12-overrides-test-composer](tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/index.md)

RUN-001 реалізував explicit `override(token)` declarations for value/factory/class/async
factory forms, `DuplicateTestOverrideError`, overrides support in `createTestRuntime()`,
fresh `createTestComposer()` over existing `createComposer()` semantics, runtime/type/export
tests and minimal docs sync. RUN-001 не реалізовував fake modules, module harnesses,
graph/diagnostic assertions, Next.js adapters або core runtime semantic changes.

Stage 12 module harness and fake modules implementation завершено після task-level human
review approval:

- [TASK-07.01-0036-stage-12-module-harness-fake-modules](tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/index.md)

RUN-001 реалізував `fakeModule()` as explicit `ModuleDefinition` helper,
`createModuleHarness()` over fresh `createTestComposer()` semantics, fake value/factory/
async-factory capabilities, support modules, explicit required-port overrides,
runtime/type/export tests and minimal docs sync. RUN-001 не реалізовував graph assertions,
diagnostic assertions, Next.js adapters, runtime monkey-patching або core
runtime/composer semantic changes.

Stage 12 graph and diagnostic assertions implementation завершено після task-level human
review approval:

- [TASK-07.01-0037-stage-12-graph-diagnostic-assertions](tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/index.md)

RUN-001 реалізував graph assertion helpers over public `ModuleGraph`,
`ComposerInspection` and `RuntimeInspection` data; diagnostic assertion helpers over
public `DiagnosticReport` and typed error-derived diagnostics; deterministic plain
`GraphAssertionError` / `DiagnosticAssertionError`; runtime/type/export tests and minimal
docs sync. RUN-001 не реалізовував Next.js adapter assertions, runtime monkey-patching,
private runtime internals access, hidden dependency inference або core graph/diagnostic
semantic changes.

Stage 12 testing hardening/docs implementation завершено після task-level human review
approval:

- [TASK-07.01-0038-stage-12-testing-hardening-docs](tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/index.md)

RUN-001 додав final integration/type/package-boundary coverage for the complete
`@sagifire/ioc-testing` helper surface, package export smoke hardening, source-level
boundary checks for core/testing/adapter separation and docs sync for isolated runtimes,
overrides, test composer, fake modules, module harnesses and graph/diagnostic assertions.
RUN-001 не реалізовував new testing helper families, Next.js adapters, Stage 14 examples,
release automation, runtime monkey-patching, filesystem discovery або core
runtime/composer semantic changes.

Stage 12 `@sagifire/ioc-testing` завершено після approval фінальної hardening/docs task.

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
- [TASK-06.30-0024-stage-10-implementation-planning](tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 10 module graph cycle detection implementation planning task.
- [TASK-06.30-0025-stage-10-dependency-edge-model](tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/index.md)
  - Status: done
  - Summary: Stage 10 dependency edge model implementation task.
- [TASK-06.30-0026-stage-10-module-cycle-diagnostics](tasks/plan/TASK-06.30-0026-stage-10-module-cycle-diagnostics/index.md)
  - Status: done
  - Summary: Stage 10 module cycle diagnostics implementation task.
- [TASK-06.30-0027-stage-10-runtime-inspection-hardening](tasks/plan/TASK-06.30-0027-stage-10-runtime-inspection-hardening/index.md)
  - Status: done
  - Summary: Stage 10 runtime inspection hardening implementation task.
- [TASK-07.01-0028-stage-11-implementation-planning](tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 11 DSL implementation planning task.
- [TASK-07.01-0029-stage-11-module-dsl-foundation](tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/index.md)
  - Status: done
  - Summary: Stage 11 module DSL foundation implementation task.
- [TASK-07.01-0030-stage-11-define-app-dsl](tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/index.md)
  - Status: done
  - Summary: Stage 11 `defineApp()` DSL implementation task.
- [TASK-07.01-0031-stage-11-bind-adapt-dsl](tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/index.md)
  - Status: done
  - Summary: Stage 11 bind helper DSL and `adapt()` implementation task.
- [TASK-07.01-0032-stage-11-dsl-hardening-docs](tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/index.md)
  - Status: done
  - Summary: Stage 11 DSL hardening, exports and docs implementation task.
- [TASK-07.01-0033-stage-12-implementation-planning](tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/index.md)
  - Status: done
  - Summary: Stage 12 `@sagifire/ioc-testing` implementation planning task.
- [TASK-07.01-0034-stage-12-testing-package-foundation](tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/index.md)
  - Status: done
  - Summary: Stage 12 testing package foundation implementation task.
- [TASK-07.01-0035-stage-12-overrides-test-composer](tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/index.md)
  - Status: done
  - Summary: Stage 12 overrides and test composer implementation task.
- [TASK-07.01-0036-stage-12-module-harness-fake-modules](tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/index.md)
  - Status: done
  - Summary: Stage 12 module harness and fake modules implementation task.
- [TASK-07.01-0037-stage-12-graph-diagnostic-assertions](tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/index.md)
  - Status: done
  - Summary: Stage 12 graph and diagnostic assertions implementation task.
- [TASK-07.01-0038-stage-12-testing-hardening-docs](tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/index.md)
  - Status: done
  - Summary: Stage 12 testing hardening, exports and docs implementation task.

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
- `TASK-06.30-0024-stage-10-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 10.
- `TASK-06.30-0024-stage-10-implementation-planning` завершена після task-level human
  review approval.
- Stage 10 implementation розбита на три implementation tasks: dependency edge model,
  module cycle diagnostics and runtime inspection hardening.
- Для Stage 10 прийнято graph edge model: capability dependency edge відображає required
  port consumer module -> provider module capability; binding dependency edge відображає
  required port consumer module -> explicit composition binding.
- Для Stage 10 прийнято, що binding-satisfied required port records a binding edge and
  does not also create a module-to-module capability edge for that required port.
- Для Stage 10 прийнято, що module cycles are detected over module-to-module capability
  dependency edges.
- Для Stage 10 прийнято, що `composer.validate()` не виконує binding factories, module
  provider factories або async resources для hidden dependency inference.
- `TASK-06.30-0025-stage-10-dependency-edge-model` RUN-001 виконаний агентом, переведений
  у `review` і approved після task-level human review.
- Stage 10 dependency edge model RUN-001 реалізував public edge types,
  `ModuleGraph.edges`, `ComposerInspection.edges`, `RuntimeInspection.edges`, deterministic
  capability dependency edges and binding dependency edges.
- Stage 10 dependency edge model RUN-001 не реалізовував module cycle validation, cycle
  diagnostics, DSL/adapters або testing helpers.
- `TASK-06.30-0025-stage-10-dependency-edge-model` завершена після task-level human
  review approval.
- `TASK-06.30-0026-stage-10-module-cycle-diagnostics` RUN-001 виконаний агентом і
  переведений у `review`.
- Stage 10 module cycle diagnostics RUN-001 реалізував `ModuleCycleError`,
  `ModuleCycleErrorDetails`, cycle detection over capability dependency edges and
  integration into `validate()` / `inspect().validation` / `prepare()` / `compose()`.
- `TASK-06.30-0026-stage-10-module-cycle-diagnostics` завершена після task-level human
  review approval.
- `TASK-06.30-0027-stage-10-runtime-inspection-hardening` RUN-001 виконаний агентом і
  переведений у `review`.
- Stage 10 runtime inspection hardening RUN-001 підсилив runtime/composer edge parity,
  binding-edge regression coverage, non-execution of lazy factories/resources during
  validation/inspection, deterministic module cycle path formatting and package export
  smoke tests.
- `TASK-06.30-0027-stage-10-runtime-inspection-hardening` завершена після task-level human
  review approval.
- Stage 10 module graph cycle detection завершено після approval фінальної runtime
  inspection hardening task.
- `TASK-07.01-0028-stage-11-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 11.
- `TASK-07.01-0028-stage-11-implementation-planning` завершена після task-level human
  review approval.
- Stage 11 implementation розбита на чотири implementation tasks: module DSL foundation,
  `defineApp()` DSL, bind/adapt DSL and DSL hardening/docs.
- Для Stage 11 прийнято, що DSL є optional ergonomic layer over explicit object
  configuration and composer APIs.
- Для Stage 11 прийнято, що `module()` має створювати module definitions compatible with
  `defineModule()` and `createComposer().use()`.
- Для Stage 11 прийнято, що `defineApp()` має конвертувати declarations to existing
  `createComposer()`, `composer.use()` and `composer.bind()` semantics.
- Для Stage 11 прийнято, що `adapt()` is explicit adapter code and validation/inspection
  must not execute adapter/binding factories to infer hidden dependencies.
- Stage 11 не реалізує `@sagifire/ioc-testing` helpers, graph assertions or Next.js
  adapters; це Stage 12+ scope.
- `TASK-07.01-0029-stage-11-module-dsl-foundation` RUN-001 виконаний агентом,
  переведений у `review` і approved після task-level human review.
- Stage 11 module DSL foundation RUN-001 реалізував `module()` as optional wrapper over
  `defineModule()`, зберіг explicit required ports/capabilities and composer inspection
  visibility.
- `TASK-07.01-0029-stage-11-module-dsl-foundation` завершена після task-level human
  review approval.
- `TASK-07.01-0030-stage-11-define-app-dsl` завершена після task-level human review
  approval.
- `TASK-07.01-0031-stage-11-bind-adapt-dsl` завершена після task-level human review
  approval.
- `TASK-07.01-0032-stage-11-dsl-hardening-docs` завершена після task-level human review
  approval.
- Stage 11 DSL завершено: `module()`, `defineApp()`, bind helper declarations and
  `adapt()` implemented as optional layer over object/composer APIs with inspection parity
  coverage and minimal docs sync.
- `TASK-07.01-0033-stage-12-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 12.
- `TASK-07.01-0033-stage-12-implementation-planning` завершена після task-level human
  review approval.
- Stage 12 implementation розбита на п'ять implementation tasks: testing package
  foundation, overrides/test composer, module harness/fake modules, graph/diagnostic
  assertions and testing hardening/docs.
- Для Stage 12 прийнято, що testing helpers live in `@sagifire/ioc-testing`; core package
  must not depend on testing helpers.
- Для Stage 12 прийнято, що test runtime/composer helpers create fresh configuration and
  apply overrides before `freeze()` / `compose()`.
- Для Stage 12 прийнято, що frozen `ContainerRuntime` and `ComposedRuntime` are never
  mutated by testing helpers.
- Для Stage 12 прийнято, що fake modules are explicit module definitions and graph
  assertions use public inspection/diagnostics data only.
- Stage 12 не реалізує Next.js adapters, route/action scopes, filesystem discovery,
  runtime monkey-patching or core semantic changes.
- `TASK-07.01-0034-stage-12-testing-package-foundation` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 12 testing package foundation RUN-001 реалізував `createTestRuntime()` as fresh
  `createContainer()` / `freeze()` helper in `@sagifire/ioc-testing` with explicit
  callback/options configuration, runtime/type/export tests and minimal docs sync.
- Stage 12 testing package foundation RUN-001 не реалізовував overrides, test composer,
  fake modules, module harnesses, graph/diagnostic assertions, Next.js adapters або core
  runtime semantic changes.
- `TASK-07.01-0035-stage-12-overrides-test-composer` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 12 overrides/test composer RUN-001 реалізував explicit token-typed override
  declarations, deterministic duplicate override error, container/runtime override support,
  fresh test composer helper, composer validation/inspection visibility, runtime/type/export
  tests and minimal docs sync.
- Stage 12 overrides/test composer RUN-001 не реалізовував fake modules, module harnesses,
  graph/diagnostic assertions, Next.js adapters або core runtime semantic changes.
- `TASK-07.01-0036-stage-12-module-harness-fake-modules` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 12 module harness/fake modules RUN-001 реалізував `fakeModule()`,
  `createModuleHarness()`, fake required ports through explicit overrides or fake modules,
  support modules, graph visibility through existing inspection APIs and private provider
  isolation coverage.
- Stage 12 module harness/fake modules RUN-001 не реалізовував graph assertions,
  diagnostic assertions, Next.js adapters, runtime monkey-patching або core semantic
  changes.
- `TASK-07.01-0037-stage-12-graph-diagnostic-assertions` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 12 graph/diagnostic assertions RUN-001 реалізував assertion helpers over public
  graph/diagnostic data with deterministic plain errors and export/docs coverage.
- `TASK-07.01-0038-stage-12-testing-hardening-docs` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 12 testing hardening/docs RUN-001 додав final integration/type/package-boundary
  regression coverage, final package export smoke coverage and docs sync for the complete
  `@sagifire/ioc-testing` helper surface.
- Stage 12 testing hardening/docs RUN-001 не реалізовував Next.js adapters, new testing
  helper families, filesystem discovery, runtime monkey-patching, release automation або
  core runtime/composer semantic changes.
- Stage 12 `@sagifire/ioc-testing` завершено після approval фінальної hardening/docs task.
- `TASK-07.01-0039-stage-13-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 13.
- Stage 13 implementation заплановано як п'ять послідовних implementation tasks:
  `TASK-07.01-0040-stage-13-next-runtime-foundation`,
  `TASK-07.01-0041-stage-13-next-request-context`,
  `TASK-07.01-0042-stage-13-route-handler-scope`,
  `TASK-07.01-0043-stage-13-server-action-scope` and
  `TASK-07.01-0044-stage-13-next-examples-hardening-docs`.
- Для Stage 13 прийнято, що Next adapter helpers live in `@sagifire/ioc-next`; core
  package must not depend on `@sagifire/ioc-next`, Next.js or React.
- Для Stage 13 прийнято, що cached runtime helper має adapter/application-level cache
  ownership, in-flight initialization de-duplication and no hidden core global container.
- Для Stage 13 прийнято, що request context is explicit token/value scope-local data, not
  hidden async-local current request access.
- Для Stage 13 прийнято, що route handler and server action helpers create one scope per
  invocation and dispose it on success and failure.
- Stage 13 не реалізує filesystem auto-discovery, route scanning, decorators,
  `reflect-metadata`, broad Stage 14 documentation/examples або Stage 15 release
  automation.
- `TASK-07.01-0039-stage-13-implementation-planning` завершена після task-level human
  review approval.
- `TASK-07.01-0040-stage-13-next-runtime-foundation` RUN-001 виконаний агентом,
  переведений у `review` і завершений після task-level human review approval.
- Stage 13 Next runtime foundation RUN-001 реалізував `createNextRuntime()` in
  `@sagifire/ioc-next` with instance-local runtime cache ownership, in-flight
  initialization de-duplication, retry after failed initialization, explicit `reset()`,
  runtime/type/export tests and minimal docs sync.
- Stage 13 Next runtime foundation RUN-001 не реалізовував request context helper, route
  handler scope helper, server action scope helper, App Router examples, filesystem
  discovery, route scanning, Next.js/React imports або core runtime/composer semantic
  changes.
- `TASK-07.01-0041-stage-13-next-request-context` RUN-001 виконаний агентом і завершений
  після task-level human review approval.
- Stage 13 Next request context RUN-001 реалізував `createNextRequestContext()`,
  `nextRequestValue()` and `nextRequestMultiValue()` in `@sagifire/ioc-next` with explicit
  token/value scope-local declarations, `toScopeOptions()` conversion to core
  `CreateScopeOptions`, runtime/type/export tests and minimal docs sync.
- Stage 13 Next request context RUN-001 не реалізовував route handler scope helper, server
  action scope helper, App Router examples, hidden AsyncLocalStorage/current-request
  access, filesystem discovery, route scanning, Next.js/React imports або core
  runtime/composer semantic changes.
- `TASK-07.01-0042-stage-13-route-handler-scope` RUN-001 виконаний агентом і завершений
  після task-level human review approval.
- Stage 13 route handler scope RUN-001 реалізував `withRouteScope()` in
  `@sagifire/ioc-next` with cached runtime helper integration, explicit request context
  conversion to core scope options, one scope per route invocation, explicit runtime /
  scope / request / route context callback data, success/failure disposal, runtime/type /
  export tests and minimal docs sync.
- Stage 13 route handler scope RUN-001 не реалізовував server action scope helper, full
  App Router examples, hidden current-request APIs, filesystem discovery, route scanning,
  Next.js/React imports або core runtime/composer semantic changes.
- `TASK-07.01-0043-stage-13-server-action-scope` RUN-001 виконаний агентом і завершений
  після task-level human review approval.
- Stage 13 server action scope RUN-001 реалізував `withServerActionScope()` in
  `@sagifire/ioc-next` with cached runtime helper integration, explicit operation context
  conversion to core scope options, one scope per action invocation, explicit runtime /
  scope / action context callback data, action argument/return inference,
  success/failure disposal, runtime/type/export tests and minimal docs sync.
- Stage 13 server action scope RUN-001 не реалізовував full App Router examples, hidden
  current-action/current-scope APIs, filesystem discovery, route/action scanning,
  Next.js/React imports або core runtime/composer semantic changes.
- `TASK-07.01-0044-stage-13-next-examples-hardening-docs` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 13 Next examples/hardening/docs RUN-001 додав final Next adapter hardening
  coverage, static package-boundary checks, no hidden discovery/current-context regression
  checks, minimal `examples/next-app-router` skeleton and docs sync for cached runtime,
  request context, route scope and server action scope.
- Stage 13 Next examples/hardening/docs RUN-001 не реалізовував broad Stage 14
  documentation/examples, release automation, Next.js/React dependency installation,
  filesystem auto-discovery, route/action scanning або core runtime/composer semantic
  changes.
- Stage 13 `@sagifire/ioc-next` завершено після approval фінальної examples/hardening/docs
  task.
- `TASK-07.02-0045-stage-14-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 14.
- Stage 14 documentation/examples implementation заплановано як вісім послідовних
  implementation tasks:
  `TASK-07.02-0046-stage-14-readme-package-docs`,
  `TASK-07.02-0047-stage-14-core-container-async-docs`,
  `TASK-07.02-0048-stage-14-composer-modules-diagnostics-docs`,
  `TASK-07.02-0049-stage-14-testing-next-docs`,
  `TASK-07.02-0050-stage-14-basic-node-module-examples`,
  `TASK-07.02-0051-stage-14-async-db-testing-examples`,
  `TASK-07.02-0052-stage-14-next-app-router-example-hardening` and
  `TASK-07.02-0053-stage-14-migration-final-docs-hardening`.
- Для Stage 14 прийнято, що documentation/examples describe implemented public API only
  and do not introduce new runtime behavior.
- Для Stage 14 прийнято, що examples keep dependency graph explicit, prefer object API
  first and show DSL only as optional convenience where useful.
- Для Stage 14 прийнято, що runnable/typechecked examples should be verified through
  existing workspace tooling where practical.
- Stage 14 не реалізує release automation, package versioning, publishing workflow,
  decorators, `reflect-metadata`, hidden discovery, service locator behavior or new
  runtime semantics.
- `TASK-07.02-0045-stage-14-implementation-planning` завершена після task-level human
  review approval.
- `TASK-07.02-0046-stage-14-readme-package-docs` RUN-001 виконаний агентом і завершений
  після task-level human review approval.
- Stage 14 README/package docs RUN-001 оновив product-oriented root README, package
  READMEs for `@sagifire/ioc`, `@sagifire/ioc-testing`, `@sagifire/ioc-next` and
  `docs/README.md` navigation. RUN-001 не змінював runtime behavior, public API, package
  versions, release automation або Stage 14 example applications.
- `TASK-07.02-0047-stage-14-core-container-async-docs` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 14 core/container/async docs RUN-001 переписав `docs/architecture.md`,
  `docs/container.md` and `docs/async-model.md` як durable user-facing guides for package
  boundaries, tokens, provider registration, lifetimes, scopes, scope-local values,
  sync/async resolution, async resources, retry behavior and disposal. RUN-001 не змінював
  runtime behavior, public API, package exports, examples або `memory/sources/SPEC.md`.
- `TASK-07.02-0048-stage-14-composer-modules-diagnostics-docs` RUN-001 виконаний агентом
  і завершений після task-level human review approval.
- Stage 14 composer/modules/diagnostics docs RUN-001 переписав `docs/composer.md`,
  `docs/modules.md` and `docs/diagnostics.md` як durable user-facing guides for composer
  lifecycle, module required-port ownership, capabilities, private provider isolation,
  graph inspection, typed diagnostics, formatting, module cycle diagnostics and diagnostic
  assertions. RUN-001 не змінював runtime behavior, public API, package exports, examples
  або `memory/sources/SPEC.md`.
- `TASK-07.02-0049-stage-14-testing-next-docs` RUN-001 виконаний агентом і завершений
  після task-level human review approval.
- Stage 14 testing/Next docs RUN-001 переписав `docs/testing.md` and
  `docs/next-integration.md` як durable workflow guides for isolated test runtimes,
  overrides, fake modules, module harnesses, graph/diagnostic assertions, cached Next
  runtime, explicit request/action context, route scopes, server action scopes and thin
  framework boundaries. RUN-001 не змінював runtime behavior, public API, package exports,
  examples, framework dependencies або `memory/sources/SPEC.md`.
- `TASK-07.02-0050-stage-14-basic-node-module-examples` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 14 basic-node/module-composition examples RUN-001 додав executable
  `examples/basic-node` and `examples/module-composition` with README commands, focused
  typecheck configs, runnable `.tmp` compile configs, root/docs navigation links and
  verification through build, typecheck, lint, unit tests and direct Node runs. RUN-001 не
  змінював runtime behavior, public API, package exports, external dependencies, release
  automation або `memory/sources/SPEC.md`.
- `TASK-07.02-0051-stage-14-async-db-testing-examples` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 14 async-db-resource/testing-overrides examples RUN-001 додав executable
  `examples/async-db-resource` and `examples/testing-overrides` with README commands,
  focused typecheck configs, runnable `.tmp` compile configs, root/docs/package README
  navigation links and verification through build, typecheck, lint, unit tests and direct
  Node runs. RUN-001 не змінював runtime behavior, public API, package exports, external
  dependencies, release automation або `memory/sources/SPEC.md`.
- `TASK-07.02-0052-stage-14-next-app-router-example-hardening` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 14 Next App Router example hardening RUN-001 перетворив
  `examples/next-app-router` з narrow skeleton на documentation-grade framework-boundary
  example with cached runtime, explicit request/action context, route scope, server action
  scope, focused typecheck config and direct Node run harness. RUN-001 не змінював runtime
  behavior, public API, package exports, external dependencies, release automation, full
  Next.js app setup або `memory/sources/SPEC.md`.
- `TASK-07.02-0053-stage-14-migration-final-docs-hardening` RUN-001 виконаний агентом і
  завершений після task-level human review approval.
- Stage 14 migration/final docs hardening RUN-001 переписав
  `docs/migration-from-di-container.md` from skeleton to a practical migration guide,
  прибрав stale Stage 14 placeholder copy з root/docs navigation, додав migration guide
  link у core package README, перевірив docs/example links, stale placeholder language,
  release automation claims and reran final workspace/example verification. RUN-001 не
  змінював runtime behavior, public API, package exports, external dependencies, release
  automation, examples behavior або `memory/sources/SPEC.md`.
- Stage 14 documentation/examples завершено після approval фінальної migration/final docs
  hardening task.
- `TASK-07.02-0054-stage-15-implementation-planning` створена як окрема
  interactive-memory-update задача для планування Stage 15.
- Stage 15 release automation and repository governance implementation заплановано як сім
  послідовних implementation tasks:
  `TASK-07.02-0055-stage-15-repository-governance-artifacts`,
  `TASK-07.02-0056-stage-15-package-publish-metadata`,
  `TASK-07.02-0057-stage-15-changesets-versioning-changelog`,
  `TASK-07.02-0058-stage-15-ci-quality-gates`,
  `TASK-07.02-0059-stage-15-pack-dry-run-validation`,
  `TASK-07.02-0060-stage-15-npm-publish-workflow-provenance` and
  `TASK-07.02-0061-stage-15-release-docs-final-hardening`.
- Для Stage 15 прийнято використовувати Apache License 2.0 для repository and publishable
  packages.
- Для Stage 15 прийнято захищати `@sagifire/ioc` як product mark through repository
  trademark guidance.
- Для Stage 15 прийнято використовувати GitHub Issues as primary ordinary
  contact/support channel.
- Stage 15 planning зафіксував guardrail: actual npm publish не виконується без explicit
  human approval, а secrets/tokens не створюються, не логуються і не комітяться.
- `TASK-07.02-0054-stage-15-implementation-planning` завершена після task-level human
  review approval.

## Current Risks

- Binding factory internals не мають static dependency metadata; Stage 10 dependency edge
  model фіксує static required-port -> binding edges only and keeps provider-level cycles
  inside factories under existing container diagnostics.
- Stage 15 implementation tasks ще не виконані; current repository still has placeholder
  release/governance artifacts until `TASK-07.02-0055` runs.
- Actual npm publishing will require explicit human approval and external GitHub/npm
  credentials/settings that cannot be created safely by repository file edits alone.
- Root `SPEC.md` лишається source reference і може дублювати canonical memory; для
  operational рішень використовувати `memory/product/`, `memory/domain/` і
  `memory/technical/`.
- `pnpm install` під час Stage 2 потребував network permission для першої інсталяції
  залежностей; фінальний synced `pnpm install` проходить без мережі.

## Next Steps

- Запустити `TASK-07.02-0055-stage-15-repository-governance-artifacts`.

## Open Questions

- Немає.
