# Технічні правила

Оновлено: 2026-07-06

## Джерела правил

- `AGENTS.md`.
- `memory/reglament/memory-rules.md`.
- `memory/reglament/agents.md`.
- `memory/project/memory-rules.md`.
- `memory/project/agents.md`.
- `memory/sources/SPEC.md` як historical source snapshot.
- Canonical product/domain/technical memory.
- Approved task fixations.

Якщо правила конфліктують, пріоритет має актуальна canonical Project Memory. Historical
source snapshots не редагуються під час implementation або memory-update tasks.

## Package boundaries

- `@sagifire/ioc` є core package.
- `@sagifire/ioc` не імпортує Next.js, React, Node-only APIs, testing helpers,
  decorators або `reflect-metadata`.
- `@sagifire/ioc-next` містить тільки Next.js App Router adapters/helpers.
- `@sagifire/ioc-testing` містить testing utilities, overrides, fake modules, graph
  assertions і diagnostic assertions.
- Container не знає про modules.
- Context не знає про Next.js.
- Composer використовує container/context для assembly application graph.
- DSL є optional layer поверх explicit object-configuration API.
- Next.js adapter живе поза core package.

## Непорушні заборони

- Не додавати decorators як required API.
- Не додавати `reflect-metadata`.
- Не створювати global mutable container.
- Не створювати service locator.
- Не імпортувати Next.js або React з `@sagifire/ioc`.
- Не використовувати `fs`, `path`, `process` або `Buffer` у core package.
- Не робити filesystem auto-discovery.
- Не приховувати dependency graph за DSL magic.
- Не експортувати private providers модулів через runtime.
- Не виконувати user factories для graph validation або inspection.
- Не реалізовувати довільний runtime marketplace для plugins.
- Не переносити site-engine business concepts у core package.

## Runtime rules

- `get()` завжди synchronous і ніколи не повертає `Promise`.
- Async providers/resources доступні через explicit async APIs.
- Runtime immutable після `freeze()` / `compose()`.
- Frozen runtime не мутується testing helpers.
- Scope disposal має бути idempotent.
- Runtime disposal не повинен приховано dispose live scopes без explicit policy.
- Errors мають бути typed, readable і diagnostic-friendly.
- Package exports мають лишатися tree-shaking friendly.
- Object-configuration API має лишатися fully usable без DSL.

## Product principles

1. Явність важливіша за магію.
2. Typed tokens важливіші за string service names.
3. Composition важливіша за auto-discovery.
4. Runtime immutable після build.
5. Module isolation увімкнена by default.
6. Framework adapters лишаються outside core.
7. Testing utilities не мутують production runtime.
8. DSL є optional і будується поверх explicit object configuration.
9. Diagnostics мають бути readable and actionable.
10. Core package незалежний від Next.js.

Ці principle names можуть лишатися англійськими як короткі design maxims; пояснення і
операційні правила в Project Memory мають бути українською.

## Code style

- TypeScript.
- ESM.
- 4 spaces indent.
- Single quotes.
- No semicolons.
- No trailing commas.
- Орієнтовний print width: 100.
- Уникати `any`.
- Явно обробляти `undefined`.
- Завжди використовувати braces.

## Правила роботи з source snapshots

- Root `SPEC.md` є historical source reference.
- `memory/sources/SPEC.md` є історичним незмінним source snapshot.
- `SPEC.md` і `memory/sources/SPEC.md` не є operational source of truth після
  `TASK-06.26-0002`.
- Якщо requirements змінюються, треба оновлювати canonical Project Memory files.
- Якщо потрібен new source snapshot, його треба створити через separate human-reviewed task.
- Implementation tasks не редагують historical source snapshots.

## Правила планування

- Реалізація йде staged roadmap.
- Не перескакувати на наступний stage без acceptance criteria поточного stage.
- Кожна behavior-changing implementation task має мати tests.
- Memory changes мають синхронізувати state, progress, relevant indexes і task artifacts.
- Interactive memory update лишається в `review`, доки human review не дозволить `done`.

## Architecture health guidance

Під час implementation, research, planning і design задач агент має перевіряти
architecture pressure: чи поточна архітектура підтримує задачу без workaround, дублювання,
крихких tests або неприродно широких змін.

Сигнали architecture pressure:

- нова фіча потребує обхідних шляхів або дублювання;
- зміна регулярно зачіпає надто багато модулів;
- поточні abstractions не відповідають доменній моделі;
- tests стають крихкими через архітектурну зв'язаність;
- ADR, architecture notes або technical rules не відповідають фактичному коду;
- користувач уникає refactor через страх щось зламати.

Якщо pressure істотний, агент не повинен приховувати його локальною правкою. Безпечний
шлях:

1. architecture audit у `memory/reports/audits/YYYY-MM-DD-architecture-health.md`;
2. `design` або `research` task для варіантів перебудови;
3. ADR або architecture proposal;
4. refactor task з малим scope;
5. incremental implementation;
6. self-review, independent audit і human review.

## Stage 2 rules

Stage 2 створює тільки foundation монорепозиторію:

- workspace;
- package structure;
- TypeScript;
- ESLint;
- Prettier;
- Vitest;
- build scripts;
- package export placeholders;
- README/docs skeleton;
- CI-ready scripts.

Stage 2 не реалізує container logic.

## Stage 3 rules

Stage 3 обмежений typed tokens і namespaces:

- `Token<TValue>`;
- `token()`;
- `namespace()`;
- token ID validation;
- public exports;
- type-level tests.

Container, provider registration, scopes, modules і diagnostics не входять у Stage 3.

## Stage 4 rules

Stage 4 обмежений sync single-provider container:

- `createContainer()`;
- `bind().toValue()`;
- `bind().toFactory()`;
- `bind().toClass()`;
- singleton/transient lifetimes;
- async-compatible `freeze()`;
- immutable runtime `get()` / `tryGet()`;
- duplicate token diagnostics;
- provider cycle diagnostics.

`toClass()` має лишатися explicit and no-magic: без decorators, `reflect-metadata`,
constructor parameter names і constructor metadata.

## Stage 5 rules

Stage 5 обмежений multi-provider container behavior:

- `add().toValue()`;
- `add().toFactory()`;
- `runtime.getAll()`;
- `ResolutionContext.getAll()`;
- deterministic provider order;
- strict single/multi validation.

`getAll()` повертає fresh array. Caller mutation не повинна мутувати runtime provider
storage.

## Stage 6 rules

Stage 6 обмежений sync scopes і scoped lifetime:

- `runtime.createScope()`;
- `runtime.withScope()`;
- `Scope.get()`;
- `Scope.tryGet()`;
- `Scope.getAll()`;
- `scope.dispose()`;
- scoped lifetime;
- scope-local values.

Single/multi token kind conflicts мають fail, а не silently convert token kind.

## Stage 7 rules

Stage 7 додає async providers/resources:

- `toAsyncFactory()`;
- `toAsyncResource()`;
- `getAsync()`;
- `tryGetAsync()`;
- async resource disposal;
- retry/cache policy для failed lazy initialization.

`get()` лишається synchronous. Runtime disposal володіє тільки initialized singleton
resources.
Stage 7 не додає hidden global/live scope registry.

## Stage 8 rules

Stage 8 додає diagnostics foundation:

- `SagifireIocError`;
- constructor/options model;
- optional cause;
- stable error code convention;
- diagnostic reports;
- `DiagnosticSeverity`;
- `Diagnostic`;
- `DiagnosticReport`;
- `formatDiagnostics()`;
- typed migration of Stage 3-7 errors.

Error code convention: `SAGIFIRE_IOC_<AREA>_<REASON>`. Public errors мають включати safe
details: token IDs, provider kinds, lifecycle modes, actions і scope reasons.

Stage 8 не реалізує composer/module graph diagnostics.

## Stage 9 rules

Stage 9 додає module definition і composer:

- `defineModule()`;
- `createComposer()`;
- module setup/private providers;
- required ports;
- public capabilities;
- bindings;
- composed runtime;
- safe inspection.

Architecture boundary:

- container не знає про modules;
- composer builds on container/context;
- private module providers не available through composed runtime;
- required ports належать consumer modules;
- public capabilities експортуються явно.

Stage 9 validation includes missing required ports, duplicate modules, duplicate public
capabilities, invalid bindings і private provider exposure. Cycle diagnostics належать
Stage 10.

## Stage 10 rules

Stage 10 додає dependency edge metadata і module cycle diagnostics:

- edge model;
- deterministic edge order;
- cycle path diagnostics;
- runtime inspection hardening.

Validation не виконує user factories. Binding dependency edges не треба виводити через
hidden runtime tracing. Provider-level cycles лишаються container/provider diagnostics.

## Stage 11 rules

Stage 11 додає DSL:

- `module()`;
- `defineApp()`;
- bind helper DSL;
- `adapt()`;
- docs/hardening.

DSL компілюється в existing object configuration. Object API не стає legacy або
unsupported.
DSL не створює другий runtime, container, composer або graph model.

## Stage 12 rules

Stage 12 додає testing package:

- isolated test runtime;
- overrides;
- test composer;
- fake modules;
- module harnesses;
- graph assertions;
- diagnostic assertions.

Testing package не мутує frozen production runtime, не читає private internals і не створює
global mutable runtime registry.

## Stage 13 rules

Stage 13 додає Next adapter package:

- cached runtime helper;
- request context helper;
- route handler scope helper;
- server action scope helper;
- examples/hardening docs.

Next package живе поза core. Helpers не повинні expose hidden current request/action service
locator APIs.

## Stage 14 rules

Stage 14 перетворює implemented Stage 3-13 behavior на public learning material:

- README files;
- deep docs;
- migration guide;
- examples;
- docs/example verification.

Docs мають описувати implemented public API only. Future behavior треба позначати явно або
винести в Project Memory tasks.

## Stage 15 rules

Stage 15 додає release automation і governance readiness:

- `LICENSE`;
- `NOTICE`;
- `CONTRIBUTING.md`;
- `SECURITY.md`;
- publish metadata;
- Changesets;
- CI quality gates;
- package dry-run validation;
- manual npm publish workflow;
- release docs;
- Project Memory sync.

Actual npm publish не виконується без explicit human approval. External repository/npm
settings не треба стверджувати як наявні без перевірки.

## Stage 16 rules

Stage 16 додає pre-`0.0.1` stabilization audit:

- codebase audit;
- critical/high/medium/low findings;
- required fixes;
- version handoff;
- changelog sync;
- release-status memory sync.

Critical findings мають бути fixed або явно reclassified with rationale. Broad refactors
без direct audit-finding scope не допускаються.

## Stage 17 rules

Stage 17 почався як audit/decision gate для `0.0.2` feature request і після
`TASK-07.05-0073` переходить у phased implementation backlog:

- source file: `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`;
- пропозиції не приймаються wholesale;
- audit визначив logical conflicts, architectural risks, accepted candidates і follow-up
  decomposition;
- implementation tasks створені після human decision і мають виконуватися послідовно.

### `0.0.2` cardinality rules

- `cardinality` додається і в `provides`, і в `requires`.
- Default cardinality is `single`.
- `requires.kind` лишається dependency kind: `external | shared`; його не можна
  перевикористовувати для single/multi semantics.
- Multi required dependency:
  - `required: true` потребує мінімум один contributor/provider;
  - `required: false` дозволяє відсутність contributors;
  - valid `getAll(token)` для optional missing multi dependency повертає `[]`.
- Single capability: один token може бути provided тільки одним module.
- Multi capability: один token може бути provided багатьма modules; кожен module є
  contributor.
- Один token не може бути single в одному declaration/registration місці й multi в іншому.
- Validation має враховувати `provides`, `requires`, composer bindings і module setup
  registrations.
- Declared multi capability має реєструватися через `add()`.
- Declared single capability має реєструватися через `bind()`.
- Duplicate single capability diagnostic: `SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY`.
- Cardinality conflict diagnostic: `SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT`.

### `0.0.2` runtime and inspection rules

- Composed runtime public surface enforces cardinality:
  - `get()` for multi token fails;
  - `getAll()` for single token fails.
- Runtime gating diagnostics stay in `SAGIFIRE_IOC_*`, with target meanings:
  - `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`;
  - `SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN`.
- Multi contribution order is deterministic:
  - effective composer module registration order;
  - registration order inside each module `setup()`;
  - composition-root additions after module contributions if `composer.add()` is accepted;
  - composition-root registration order.
- Multi-capability inspection must expose token, kind, cardinality, providers,
  registration kind and registration index without leaking private providers.

### `0.0.2` adapter rules

- Graph-aware adapters are additive API design and must not break existing object API,
  `bind().toFactory()` or DSL `adapt(token, factory)`.
- Graph-aware adapter `using()` receives only declared source values; it must not receive
  `{ get }`, `getAll()` or other generic resolver context.
- Adapter target token must be required port / external dependency token.
- Adapter source token must be public capability or explicit valid composition-level source.
- First adapter slice supports single source capabilities; multi source support requires
  explicit future design.
- Adapter factory is not executed during validation, inspection or graph inference.
- First adapter slice includes graph visibility and source validation, but not
  adapter-aware cycle detection.
- Adapter-aware cycle detection must be implemented before `0.0.2` stabilization handoff.

### `0.0.2` child scope rules

- Child scope inherits parent scope values.
- Child scope can override inherited values.
- Child scope has its own scoped provider cache.
- Child scope does not reuse parent scoped provider instances by default.
- Disposing child does not dispose parent.
- Parent/child disposal ownership must be explicit and tested, including async failure
  paths.

### `0.0.2` token ergonomics rules

- `multiToken<T>()` and `contributionToken<T>()` are additive helpers over existing token
  identity.
- `MultiToken<T>` and `ContributionToken<T>` are type-level markers, not runtime
  cardinality metadata.
- Runtime identity remains token ID based.
- Ordinary `token()` remains fully usable for multi capabilities.
- This slice does not add overload-based TypeScript rejection for `bind()` / `get()` usage
  with branded multi tokens; declaration validation and runtime cardinality gating remain
  the enforcement layer.

### `0.0.2` DSL ergonomics rules

- DSL cardinality declarations compile to the same `provides` / `requires` object
  configuration fields.
- `add(token)` DSL helper compiles to `composer.add(token)` for composition-root multi
  contributions.
- `adapter(target).from(source).using(factory)` DSL helper compiles to graph-aware
  `composer.adapt(target).from(source).using(factory)`.
- Existing DSL `adapt(token, factory)` remains backward-compatible and does not infer
  adapter-source graph edges.
- Adapter source edges in DSL must be declared explicitly; DSL must not inspect factory
  bodies or execute factories to infer graph dependencies.
- Object configuration API remains fully usable without DSL.

### `0.0.2` general guardrails

- diagnostic codes лишаються у namespace `SAGIFIRE_IOC_*`;
- `get()` лишається synchronous;
- no decorators;
- no `reflect-metadata`;
- no hidden current scope;
- no filesystem discovery;
- не додавати site-engine business APIs у core.
