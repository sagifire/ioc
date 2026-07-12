# Roadmap

Roadmap починається з Project Memory bootstrap. Після Stage 1 усі implementation stages
плануються через окремі Project Memory tasks, fixation packages і людське рев'ю на рівні
задачі.

Stage 16-18 є human-directed extensions після історичного плану з `SPEC.md`.
Stage 17 взяв audited subset feature request для `0.0.2`, реалізував accepted scope через
phased tasks і завершив release handoff після human review. Actual npm publish лишається
окремою human-controlled workflow дією.

Stage 18 є research/decision gate, а не implementation stage.

## Джерела плану

- `SPEC.md`, sections 32-45: історичний staged implementation plan.
- `TASK-06.26-0002`: Stage 1 memory bootstrap.
- `TASK-07.02-0062`: планування Stage 16.
- `TASK-07.04-0070`: планування Stage 17.
- `TASK-07.04-0071`: audit feature request для Stage 17.
- `TASK-07.05-0072`: нормалізація мови memory documents і source path.
- `TASK-07.05-0073`: планування phased implementation для `0.0.2`.
- `TASK-07.05-0090`: version `0.0.2` release handoff.
- `TASK-07.12-0093`: Stage 18 formal research і decision gate для `0.0.3`.

## Завершені stages

### Stage 1: Project Memory bootstrap

- Статус: `done` після людського рев'ю.
- Scope: перенести `AGENTS.md` і `SPEC.md` у canonical Project Memory.
- Результат: створено Project Memory starter kit і правила роботи з пам'яттю.

### Stage 2: основа repository/build

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.26-0003-stage-2-implementation-planning`.
- Задача реалізації: `TASK-06.26-0004-stage-2-repository-build-foundation`.
- Результат: `pnpm` workspace, package structure, TypeScript, ESLint, Prettier, Vitest,
  build scripts, placeholder exports і docs skeleton без runtime/container logic.

### Stage 3: tokens

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.26-0005-stage-3-implementation-planning`.
- Задача реалізації: `TASK-06.26-0006-stage-3-tokens`.
- Результат: `Token<TValue>`, `token()`, `namespace()`, validation token ID, exports і
  type-level tests.

### Stage 4: синхронний single-provider container

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.29-0007-stage-4-implementation-planning`.
- Задача реалізації: `TASK-06.29-0008-stage-4-container-sync-providers`.
- Результат: `createContainer()`, `bind().toValue()`, `bind().toFactory()`,
  `bind().toClass()`, singleton/transient lifetimes, async-compatible `freeze()`,
  immutable runtime `get()` / `tryGet()`, duplicate token detection і provider cycle
  diagnostics.

### Stage 5: multi-provider container behavior

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.29-0009-stage-5-implementation-planning`.
- Задача реалізації: `TASK-06.29-0010-stage-5-multi-provider`.
- Результат: `add().toValue()`, `add().toFactory()`, `runtime.getAll()`,
  `ResolutionContext.getAll()`, deterministic order і strict single/multi validation.

### Stage 6: синхронні scopes

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.29-0011-stage-6-implementation-planning`.
- Задача реалізації: `TASK-06.29-0012-stage-6-scopes`.
- Результат: `runtime.createScope()`, `runtime.withScope()`, sync scope resolution,
  scoped lifetime, scope-local values і idempotent `scope.dispose()`.

### Stage 7: async providers/resources

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.29-0013-stage-7-implementation-planning`.
- Задача реалізації: `TASK-06.29-0014-stage-7-async-providers-resources`.
- Результат: async single-provider bindings, `getAsync()` / `tryGetAsync()`, async
  resources, runtime/scope disposal і retry policy для failed lazy initialization.

### Stage 8: diagnostics foundation

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.29-0015-stage-8-implementation-planning`.
- Задачі реалізації:
  - `TASK-06.29-0016-stage-8-diagnostics-error-foundation`;
  - `TASK-06.29-0017-stage-8-diagnostic-reports-formatting`.
- Результат: `SagifireIocError`, diagnostic reports, `formatDiagnostics()`, typed error
  migration і deterministic plain-text formatting.

### Stage 9: module definition і composer foundation

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.30-0018-stage-9-implementation-planning`.
- Задачі реалізації:
  - `TASK-06.30-0019-stage-9-module-definition-foundation`;
  - `TASK-06.30-0020-stage-9-composer-builder-bindings-validation`;
  - `TASK-06.30-0021-stage-9-module-setup-private-providers`;
  - `TASK-06.30-0022-stage-9-composed-runtime-capabilities`.
- Результат: `defineModule()`, `createComposer()`, module setup/private providers,
  composed runtime capability gating і safe inspection.

### Stage 10: module graph cycle detection

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-06.30-0024-stage-10-implementation-planning`.
- Задачі реалізації:
  - `TASK-06.30-0025-stage-10-dependency-edge-model`;
  - `TASK-06.30-0026-stage-10-module-cycle-diagnostics`;
  - `TASK-06.30-0027-stage-10-runtime-inspection-hardening`.
- Результат: dependency edge metadata, module cycle diagnostics і non-execution guards для
  inspection.

### Stage 11: DSL

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.01-0028-stage-11-implementation-planning`.
- Задачі реалізації:
  - `TASK-07.01-0029-stage-11-module-dsl-foundation`;
  - `TASK-07.01-0030-stage-11-app-dsl-compose`;
  - `TASK-07.01-0031-stage-11-dsl-bind-adapt-helpers`;
  - `TASK-07.01-0032-stage-11-dsl-hardening-docs`.
- Результат: `module()`, `defineApp()`, bind helper DSL і `adapt()` поверх existing object
  configuration API.

### Stage 12: testing package

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.01-0033-stage-12-implementation-planning`.
- Задачі реалізації:
  - `TASK-07.01-0034-stage-12-testing-package-foundation`;
  - `TASK-07.01-0035-stage-12-overrides-test-composer`;
  - `TASK-07.01-0036-stage-12-module-harness-fake-modules`;
  - `TASK-07.01-0037-stage-12-graph-diagnostic-assertions`;
  - `TASK-07.01-0038-stage-12-testing-hardening-docs`.
- Результат: isolated test runtime, overrides, test composer, fake modules, harnesses і
  graph/diagnostic assertions без mutation frozen runtime.

### Stage 13: Next.js adapter package

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.01-0039-stage-13-implementation-planning`.
- Задачі реалізації:
  - `TASK-07.01-0040-stage-13-next-runtime-foundation`;
  - `TASK-07.01-0041-stage-13-next-request-context`;
  - `TASK-07.01-0042-stage-13-route-handler-scope`;
  - `TASK-07.01-0043-stage-13-server-action-scope`;
  - `TASK-07.01-0044-stage-13-next-examples-hardening-docs`.
- Результат: cached runtime helper, explicit request/action context, route scope helper і
  server action scope helper.

### Stage 14: documentation і examples

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.02-0045-stage-14-implementation-planning`.
- Результат: root/package README, deep docs, migration guide і examples:
  `basic-node`, `module-composition`, `async-db-resource`, `testing-overrides`,
  `next-app-router`.

### Stage 15: release automation і repository governance readiness

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.02-0054-stage-15-implementation-planning`.
- Результат: Apache 2.0 governance artifacts, publish metadata, Changesets, CI quality
  gates, package dry-run validation, manual npm publish workflow з provenance support і
  final memory sync.
- Обмеження: actual npm publish не виконується без explicit human approval.

### Stage 16: pre-`0.0.1` stabilization

- Статус: `done` після людського рев'ю.
- Задача планування: `TASK-07.02-0062-stage-16-implementation-planning`.
- Результат: codebase audit перед `0.0.1`, closure of `C-001`, `H-001`, `H-002`, `M-001`,
  `L-001`, package versions fixed at `0.0.1`, changelog updates і final release handoff.

### Stage 17: audit feature request для `0.0.2`

- Статус: `done` після людського рев'ю.
- Джерело: human directive і feature request від 2026-07-04.
- Задача планування: `TASK-07.04-0070-stage-17-implementation-planning`.
- Research task: `TASK-07.04-0071-stage-17-feature-request-audit`.
- Canonical source file:
  - `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`.
- Висновок: пропозиції цінні, але не приймаються wholesale.
- Результат: `TASK-07.05-0073` зафіксувала phased implementation plan для `0.0.2`;
  implementation phases, full audit, stabilization handoff and release handoff завершені
  після human review.

### Stage 18: `0.0.3` feature portfolio research

- Статус: `done` після людського рев'ю.
- Source: `memory/sources/sagifire_ioc_0_0_3_market_research_uk.md`.
- Research task: `TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research`.
- Рішення:
  - graph export JSON/DOT/Mermaid — `accept` як перший bounded follow-up slice;
  - lifetime dependency validation — `design-first`;
  - async multi-providers — `design-first`.
- Guardrail: жоден кандидат не реалізовано Stage 18; follow-up tasks створюються лише
  після окремого human decision.

## Завершена maintenance task

- Задача: `TASK-07.05-0072-memory-language-source-path-normalization`.
- Статус: `done` після human review approval від 2026-07-05.
- Результат:
  - використовується `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`;
  - старий local source path прибраний;
  - general memory docs і Stage 17 artifacts приведені до української operational prose;
  - historical source snapshots не змінювалися.

## Реалізований scope `0.0.2`

- Задача: `TASK-07.05-0073-stage-17-0-0-2-implementation-planning`.
- Статус: `done` після human review approval від 2026-07-05.
- Purpose: зафіксувати accepted decisions і phased backlog для `0.0.2`.
- Release handoff: `TASK-07.05-0090-stage-17-version-0-0-2-release-handoff`.
- Release handoff status: `done` після human review approval; package versions and
  changelogs fixed at `0.0.2`; actual npm publish не виконувався.

### Accepted implementation decisions

- `cardinality` додається і в `provides`, і в `requires`.
- Default cardinality: `single`.
- `requires.kind` лишається dependency kind: `external | shared`.
- Multi dependency semantics:
  - `required: true` потребує мінімум один contributor/provider;
  - `required: false` дозволяє відсутність contributors;
  - valid `getAll(token)` для optional missing multi dependency повертає `[]`.
- Validation охоплює сукупну model: `provides`, `requires`, composer bindings і module
  setup registrations.
- Duplicate single capability produces `SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY`.
- Single/multi conflict produces `SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT`.
- Declared multi capability uses `add()`; declared single capability uses `bind()`.
- Composed runtime gating:
  - `get()` for multi token fails;
  - `getAll()` for single token fails.
- Multi contribution ordering:
  - module registration order;
  - registration order inside module `setup()`;
  - composition-root additions after modules if `composer.add()` is accepted;
  - composition-root registration order.
- Graph-aware adapter `using()` receives only declared source values, not `{ get }`.
- First adapter slice includes adapter graph visibility and source validation, but not
  adapter-aware cycle detection.
- Adapter-aware cycle detection must be implemented before `0.0.2` release handoff.
- Child scope inherits parent values, can override them and has its own scoped provider
  cache.
- `multiToken()` / `contributionToken()` helper API is additive type-level ergonomics only:
  runtime identity remains token ID based and ordinary `token()` remains valid for multi
  capabilities.
- DSL ergonomics for `0.0.2` are additive:
  - `add(token)` supports composition-root multi contributions;
  - `adapter(target).from(source).using(factory)` supports graph-aware adapter declarations;
  - existing `adapt(token, factory)` remains backward compatible and does not infer source
    edges.

### `0.0.2` implementation phases

1. Multi-capability declaration foundation:
   - `TASK-07.05-0074-stage-17-multi-capability-cardinality-model`;
   - `TASK-07.05-0075-stage-17-multi-capability-validation`.
2. Multi-capability runtime and inspection:
   - `TASK-07.05-0076-stage-17-multi-capability-runtime-gating`;
   - `TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics`;
   - `TASK-07.05-0089-stage-17-composer-add-multi-contributions`.
3. Graph-aware adapters:
   - `TASK-07.05-0078-stage-17-graph-aware-adapter-api`;
   - `TASK-07.05-0079-stage-17-adapter-source-validation-inspection`;
   - `TASK-07.05-0080-stage-17-adapter-cycle-diagnostics`.
4. Child / derived scopes:
   - `TASK-07.05-0081-stage-17-child-scope-lifecycle-model`;
   - `TASK-07.05-0082-stage-17-child-scope-runtime-semantics`.
5. Testing and API ergonomics:
   - `TASK-07.05-0083-stage-17-testing-helpers-new-primitives`;
   - `TASK-07.05-0084-stage-17-multitoken-contributiontoken-ergonomics`;
   - `TASK-07.05-0085-stage-17-dsl-ergonomics-hardening`.
6. Documentation and examples:
   - `TASK-07.05-0086-stage-17-0-0-2-docs-examples`.
7. Full audit and stabilization:
   - `TASK-07.05-0087-stage-17-0-0-2-full-audit`;
   - `TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff`.
8. Release handoff:
   - `TASK-07.05-0090-stage-17-version-0-0-2-release-handoff`.
