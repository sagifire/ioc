# Тестування

Оновлено: 2026-07-05

## Роль документа

Цей документ описує очікувані перевірки для `@sagifire/ioc`, `@sagifire/ioc-testing` і
`@sagifire/ioc-next`. Кожна поведінкова зміна має супроводжуватися tests, а кожна зміна
public type contract має мати type-level coverage там, де це practical.

## Загальні правила

- Runtime behavior перевіряється через Vitest.
- Type inference перевіряється через `expectTypeOf`.
- Tests мають перевіряти public API, а не private internals.
- Diagnostics tests мають перевіряти stable public codes, structured details і readable
  messages.
- Snapshot-like assertions дозволені тільки там, де output intentional і deterministic.
- Не можна виконувати user factories лише для graph validation або inspection.
- Testing helpers не повинні мутувати frozen production runtime.

## Базові команди

Релевантні команди залежать від stage і наявних scripts:

```text
pnpm test
pnpm build
pnpm lint
pnpm typecheck
```

Якщо dependencies не встановлені або команда потребує network access, агент має попросити
дозвіл перед installation.

## Stage 2

Stage 2 перевіряє workspace/build foundation:

- package structure;
- TypeScript compile setup;
- ESLint і Prettier setup;
- Vitest setup;
- package export placeholders;
- CI-ready scripts.

Container runtime behavior не тестується, бо Stage 2 не реалізує container logic.

## Stage 3

Stage 3 tests мають покривати:

- `token()` creation;
- token ID validation;
- namespace prefixing;
- duplicate-safe token identity by ID;
- public exports;
- type inference для token value type.

Type-level assertions мають підтвердити, що `Token<TValue>` переносить `TValue` у public
API без widening до `unknown` або `any`.

## Stage 4

Stage 4 tests мають покривати sync single-provider container:

- `bind().toValue()`;
- `bind().toFactory()`;
- `bind().toClass()`;
- singleton і transient lifetimes;
- immutable runtime after `freeze()`;
- `runtime.get()` і `runtime.tryGet()`;
- duplicate token registration;
- missing provider behavior;
- provider cycle diagnostics;
- root/subpath exports.

Type-level assertions мають перевіряти inference для `runtime.get()`, `runtime.tryGet()` і
factory context.

## Stage 5

Stage 5 tests мають покривати multi-provider behavior:

- `add().toValue()`;
- `add().toFactory()`;
- `runtime.getAll()`;
- `ResolutionContext.getAll()`;
- deterministic registration order;
- fresh array return;
- strict single/multi mismatch diagnostics;
- empty array для missing multi-provider token.

Type-level assertions мають перевіряти inference для multi-provider collections.

## Stage 6

Stage 6 tests мають покривати sync scopes:

- `runtime.createScope()`;
- `runtime.withScope()`;
- `Scope.get()`;
- `Scope.tryGet()`;
- `Scope.getAll()`;
- scoped lifetime;
- scope-local values;
- idempotent `scope.dispose()`;
- disposed scope diagnostics;
- конфлікти single/multi у scope-local values.

Tests мають перевіряти, що scope-local values не мутують runtime provider storage.

## Stage 7

Stage 7 tests мають покривати async providers/resources:

- `toAsyncFactory()`;
- `toAsyncResource()`;
- `getAsync()` і `tryGetAsync()`;
- sync `get()` rejection for async providers;
- async resource initialization;
- retry/cache policy після failed lazy initialization;
- runtime disposal;
- scope disposal;
- reverse disposal order where practical;
- mixed sync/async provider cycles.

Type-level assertions мають перевіряти async factory context і async access methods.

## Stage 8

Stage 8 tests мають покривати diagnostics foundation:

- `SagifireIocError`;
- public error code convention `SAGIFIRE_IOC_*`;
- diagnostic severity;
- diagnostic report shape;
- `formatDiagnostics()`;
- deterministic plain-text output;
- migration of Stage 3-7 errors to typed diagnostics;
- generic handling of unknown errors.

Formatting tests мають бути runtime-agnostic: без terminal colors, Node-only APIs або
framework assumptions.

## Stage 9

Stage 9 tests мають покривати module definition і composer:

- `defineModule()`;
- module IDs;
- provided capabilities;
- required ports;
- private providers;
- setup context;
- composer bindings;
- invalid binding targets;
- duplicate module IDs;
- duplicate public capabilities;
- missing required ports;
- composed runtime capability gating;
- safe inspection.

Type-level assertions мають перевіряти module setup context, binding factory context і
composed runtime token inference.

## Stage 10

Stage 10 tests мають покривати graph metadata і module cycle diagnostics:

- dependency edge metadata;
- deterministic edge order;
- valid acyclic graph composition;
- direct module cycles;
- indirect module cycles;
- cycle path diagnostics;
- safe graph inspection;
- відсутність виконання factories під час validation.

Provider-level cycles inside factories мають лишатися container/provider diagnostics і
виникати лише під час actual resolution.

## Stage 11

Stage 11 tests мають покривати DSL:

- `module()`;
- `defineApp()`;
- bind helper DSL;
- `adapt()` helper;
- parity with object-configuration API;
- invalid DSL configuration diagnostics;
- збереження object API як first-class path.

Type-level assertions мають перевіряти module DSL inference і app DSL composed runtime
inference.

## Stage 12

Stage 12 tests мають покривати testing package:

- isolated test runtime;
- overrides;
- test composer;
- fake modules;
- module harnesses;
- graph assertions;
- diagnostic assertions;
- validation failure readability;
- no mutation of frozen runtime.

Testing helpers мають читати тільки public inspection data і застосовувати overrides before
compose/freeze.

## Stage 13

Stage 13 tests мають покривати Next adapter package:

- cached runtime helper;
- request context helper;
- route handler scope helper;
- server action scope helper;
- initialization deduplication;
- scope disposal on success and failure;
- package boundary checks.

Full running Next.js app не потрібен, якщо helper tests, examples і boundary checks дають
достатню впевненість для stage scope.

## Stage 14

Stage 14 verification має покривати docs і examples:

- README snippets against implemented public API where practical;
- deep docs snippets where practical;
- examples build/test path where available;
- absence of undocumented dependencies;
- відсутність тверджень про future APIs як already implemented behavior.

Examples мають вибирати найменший достатній шлях перевірки. Якщо full framework app
занадто важкий для stage, треба зафіксувати rationale in task result.

## Stage 15

Stage 15 verification має покривати release automation і governance readiness:

- license artifacts;
- package metadata;
- Changesets scripts;
- changelog;
- CI quality gates;
- package pack/dry-run validation;
- manual publish workflow.

Actual npm publish не виконується без explicit human approval.

## Stage 16

Stage 16 audit має записувати inspected scope і commands that were run. Critical fixes мають
додавати або оновлювати tests для кожної behavior-changing fix. Non-critical findings не
можна мовчки рахувати closed; потрібен fix або explicit reclassification з rationale.

## Stage 17

Stage 17 audit не змінює runtime behavior. Якщо human review схвалить implementation tasks,
tests мають покривати:

- required-port cardinality semantics;
- multi-capability contributor order;
- post-setup `bind()` / `add()` mismatch validation;
- adapter source validation;
- adapter-aware graph edges;
- adapter-aware cycle diagnostics, якщо вони входять у scope;
- child scope lifecycle policy;
- testing helpers через public inspection only;
- object API parity with DSL.

`get()` має лишатися synchronous і ніколи не повертати `Promise`.
## Lifetime dependency validation gates

- Compile-time tests покривають typed dependency options і single/multi cardinality.
- Behavioral matrix покриває singleton, scoped, ordinary transient, managed resources,
  deferred/derived ownership edges та child-scope effective overrides.
- Validation/inspection/export tests доводять, що user factories не виконуються.
- Coverage fixtures перевіряють `complete | partial | none` і відмінність unknown від
  proven unsafe capture.
- Privacy sentinel tests доводять відсутність private token IDs у diagnostics, JSON, DOT і
  Mermaid.
- Parity tests доводять одну normalized provider-edge foundation для validation,
  inspection і export.
- Existing providers без metadata зберігають resolution behavior; incomplete coverage
  лишається additive diagnostic/adoption concern.

## Async multi-provider design gates

- Truth-table tests покривають empty, sync-only, eager-only, lazy-only, mixed та scoped
  collections для sync і explicit async access.
- Preflight tests доводять precedence lifecycle/access → cardinality/local-kind → scope
  eligibility → sync eligibility → execution і відсутність earlier transient execution
  для declarative blocker.
- Ordering tests відділяють registration order від completion order і перевіряють module,
  composition-root, parent-local та child-local contributions.
- Sequential failure tests перевіряють first failure identity, preserved cause, відсутність
  partial array і відсутність запуску later contributions.
- Retry/concurrency tests покривають per-provider singleton/scoped in-flight deduplication,
  failed cache reset, successful cache reuse та transient reexecution без collection cache.
- Eager freeze tests покривають multi initialization, retry і cleanup unpublished
  runtime-owned resources.
- Cycle tests покривають collection/provider frames, re-entrant self-collection до sibling
  execution та valid ordinary siblings одного token.
- Privacy sentinel tests покривають async collection і eager-freeze failures private
  providers без raw internal/original token ID, включно з cause.
- Privacy collision fixture має дві private collections одного module з contribution
  index `0` і перевіряє різні stable private collection ordinals.
- Resource slice tests покривають runtime/scope ownership, lazy partial failure без
  rollback owner state, reverse actual ledger disposal, dispose-during-pending та
  concurrent collection/direct resolution exactly-once behavior без brittle global order.
- Inspection/export tests перевіряють provider kind/lifetime/initialization/index і
  відсутність mutable readiness/private state.
- Composer, module setup, testing helpers і DSL мають parity з object API; async resource
  helpers не з'являються до production resource slice.
