# Деталізований звіт: Stage 18 architecture pressure і residual-risk decisions

Status: completed
Type: architecture decision research
Related Task: [TASK-07.15-0111](../../tasks/plan/TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
Related Run: [RUN-001](../../tasks/plan/TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RUN-001/index.md)
Related Research: [RSCH-001](../../tasks/plan/TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RSCH-001.md)
Created: 2026-07-15

## Мета і межі

Мета — окремо класифікувати п'ять пунктів architecture pressure/residual risk із
TASK-0110, відділивши встановлені факти від inference і recommendation. Цей report не
реалізує remediation, не змінює runtime/public API, не створює derived tasks до approval,
не bump-ить version і не виконує publish/release workflow.

## Двосторонній trace inventory

| ID | TASK-0110 result | Formal audit | Цей report |
|---|---|---|---|
| `APR-001` | `Risks`: declarative metadata не доводить hidden factory-body lookups | `Architecture pressure і residual risks`, пункт 1 | окремий section `APR-001` |
| `APR-002` | `Self-review`: великі `container.ts`/`composer.ts` state machines; `Risks` predecessor results | formal audit, пункт 2 | окремий section `APR-002` |
| `APR-003` | `Risks`: sequential async collection latency | formal audit, пункт 3 | окремий section `APR-003` |
| `APR-004` | `Risks`: no-partial-results не rollback-ить arbitrary side effects | formal audit, пункт 4 | окремий section `APR-004` |
| `APR-005` | `Risks`: graph v2 opt-in; incompatible evolution потребує нової version | formal audit, пункт 5 | окремий section `APR-005` |

Жоден source item не об'єднано, не розділено або не пропущено. Взаємодії між пунктами
позначені як dependency, але рішення лишаються окремими.

## Метод і evidence

Прочитано TASK-0110 result/audit, approved TASK-0097/0098 designs, TASK-0099 planning,
TASK-0101/0103/0108 results, canonical architecture/rules/testing/DoD/requirements/roadmap
і поточний стан. Targeted source inspection охопила `container.ts`, `composer.ts`,
`provider-metadata.ts`, `lifetime-validation.ts`, `graph-export.ts`, відповідні tests і
public docs.

Focused regression-перевірка:

```text
7 test files passed
167/167 tests passed
```

Показники підтримуваності, обчислені через AST, є локальними вимірюваннями, а не
нормативними порогами якості:

| File/surface | Lines | Branch nodes | Function-like nodes | Найбільший hotspot |
|---|---:|---:|---:|---|
| `packages/ioc/src/container.ts` | 3198 | 219 | 169 | `createRuntime()`: ~1198 lines, 109 branch points |
| `packages/ioc/src/composer.ts` | 5709 | 322 | 329 | validation/setup logic distributed; largest measured helper 172 lines |

Історія Git поточного repository показує 14 commits, що торкалися `container.ts`, і 22
для `composer.ts`. Це доказ широкої поверхні змін, але не показник частоти дефектів.

### Відтворювані evidence anchors

Source trace для всіх п'яти пунктів:

- `memory/tasks/plan/TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/RUN-001/result.md`, sections `Self-review`, `Risks`;
- `memory/reports/audits/2026-07-15-stage-18-lifetime-shared-foundation-audit-handoff.md`,
  section `Architecture pressure і residual risks`.

| ID | Source/docs anchors | Test/evidence anchors |
|---|---|---|
| `APR-001` | `packages/ioc/src/provider-metadata.ts:286`; `packages/ioc/src/lifetime-validation.ts:68`; `docs/lifetime-validation.md:104` і `:146` | `packages/ioc/test/provider-metadata.test.ts:158` — `aggregates explicit declared and undeclared provider coverage`; `packages/ioc/test/lifetime-validation.test.ts:291` — `aggregates unknown coverage without classifying it as unsafe` |
| `APR-002` | `packages/ioc/src/container.ts:1637` — `createRuntime()`; `packages/ioc/src/composer.ts`; extracted foundations `provider-identity.ts`, `provider-metadata.ts`, `lifetime-validation.ts` | AST measurement у цьому report; `git log -- .../container.ts` і `.../composer.ts`; TASK-0110 full audit `387/387` |
| `APR-003` | `packages/ioc/src/container.ts:2369` — `resolveAllAsync()`; `docs/async-model.md:166` і `:207` | `packages/ioc/test/async-multi-provider.test.ts:242`, `:287`, `:330`; `packages/ioc/test/async-multi-resource.test.ts:478` |
| `APR-004` | `docs/async-model.md:207`; `docs/container.md:209`; `docs/testing.md:109`; `docs/migration-from-di-container.md:192` | `packages/ioc/test/async-multi-provider.test.ts:242`; `packages/ioc/test/async-multi-resource.test.ts:116`, `:174`, `:227`, `:288` |
| `APR-005` | `packages/ioc/src/graph-export.ts:25`, `:240`, `:708`; `docs/graph-export.md:46` і `:119` | `packages/ioc/test/graph-export.test.ts:18`, `:73`, `:86`, `:107`, `:268`, `:374`; `packages/ioc/test/scope-inspection-graph-v2.test.ts:441` |

Точна focused-команда:

```powershell
.\node_modules\.bin\vitest.cmd run packages/ioc/test/lifetime-validation.test.ts packages/ioc/test/provider-metadata.test.ts packages/ioc/test/async-multi-provider.test.ts packages/ioc/test/async-multi-resource.test.ts packages/ioc/test/graph-export.test.ts packages/ioc/test/scope-inspection-graph-v2.test.ts packages/ioc/test/composer.test.ts
```

## Єдина decision framework

### Класифікація тверджень

- `Fact` — прямо підтверджено чинними code/tests/docs або approved memory.
- `Inference` — логічний наслідок фактів, але не виміряний production outcome.
- `Recommendation` — запропоноване рішення, яке не є approved до human decision.

### Risk scales

- Severity: `S0` — наслідків немає, `S1` — локальна незручність, `S2` — істотний вплив
  на correctness/performance/maintainability, `S3` — порушення contract, privacy або
  широкого lifecycle.
- Likelihood: `L0` — evidence немає, `L1` — можливо/рідко, `L2` — вірогідно у звичайному
  використанні, `L3` — повторюється або безпосередньо спостерігається.
- Blast radius: `B0` — відсутній, `B1` — один provider/collection/consumer, `B2` — один
  application graph або клас споживачів public schema, `B3` — уся core/composer екосистема.

Оцінки описують наслідки, а не classification. Навіть висока теоретична severity може мати
classification `не потребує уваги`, якщо library не може володіти ризиком, а чинний
contract є explicit.

### Classification thresholds

1. `не потребує уваги`: чинний contract є навмисним, controls/docs/tests достатні,
   вимірюваної шкоди або pending decision немає, а monitoring trigger записаний.
2. `потрібне окреме глибоке дослідження для прийняття рішення`: material pressure існує,
   але safe remediation boundary/options неможливо вибрати з чинного evidence.
3. `виправити в 0.0.3`: bounded correctness/compatibility/governance gap треба закрити до
   майбутнього `0.0.3` version/release handoff.
4. `виправити після 0.0.3`: remediation виправдана, але чинні controls дозволяють
   відкласти її за explicit post-release boundary.

`не потребує уваги` не означає “ризик неможливий”; воно означає “новий task зараз не має
достатньої expected value”.

## Decision summary

| ID | Severity | Likelihood | Blast | Proposed classification | `0.0.3` impact |
|---|---|---|---|---|---|
| `APR-001` | `S2` | `L1` | `B2` | `не потребує уваги` | не блокує |
| `APR-002` | `S2` | `L3` pressure / unproven failure | `B3` | `потрібне окреме глибоке дослідження для прийняття рішення` | research не блокує |
| `APR-003` | `S2` potential | `L1` | `B1` | `не потребує уваги` | не блокує |
| `APR-004` | `S3` potential external effect | `L1` | `B2` | `не потребує уваги` | не блокує |
| `APR-005` | `S2` | `L2` після початку schema evolution | `B2` | `виправити в 0.0.3` | блокує майбутній release handoff |

## APR-001 — declarative metadata і declaration honesty

### Чинний contract і факти

- `provider-metadata.ts` нормалізує тільки supplied `dependencies`; undeclared provider
  отримує coverage `undeclared`, а не inferred edges.
- `lifetime-validation.ts` класифікує тільки normalized declared `instance` edges;
  incomplete coverage є `unknown`, не unsafe.
- `docs/lifetime-validation.md` прямо каже, що complete declaration coverage не доводить
  чесність factory body, а parsing/execution/tracing не виконуються.
- Tests за anchors вище доводять `partial/none` coverage і відсутність unsafe
  classification для unknown.

### Сценарії failure/use case

1. Factory декларує `dependencies: []`, але виконує hidden `context.get(scopedToken)` і
   утримує value у singleton. Static graph не побачить capture.
2. Declaration містить token, якого factory фактично не використовує. Graph завищує edge
   coverage, але runtime resolution не змінюється.
3. Refactor factory body без оновлення metadata створює drift, який ловиться лише review/
   behavior tests.

### Вплив

- Correctness: `S2` для конкретного application graph, якщо hidden capture справді є.
- Likelihood: `L1`; repository не містить evidence recurring incidents.
- Blast: `B2`; library-wide model не пошкоджується, але application graph може бути wrong.
- Compatibility/public API: runtime tracing або injection redesign були б breaking/complex.
- Privacy: tracing actual lookups може expose private runtime activity.
- Resource: direct hidden scoped-resource capture може пережити owner scope.

### Варіанти

| Option | Tradeoff | Cost | Decision |
|---|---|---:|---|
| Зберегти explicit declaration + coverage/review contract | чесна межа; не ловить dishonesty автоматично | немає | рекомендувати |
| Tracing runtime lookups і порівняння з declarations | temporal overhead, false positives, privacy/state complexity; lookup != retention | висока | відхилити |
| Source parsing/decorators/reflect metadata | суперечить no-magic/no-decorator rules; ненадійно для arbitrary JS | висока/breaking | відхилити |
| Generated/injected factory arguments | інша DI programming model і broad API migration | дуже висока | відхилити |

### Рекомендація

Запропонована classification: `не потребує уваги`.

Це фундаментальна honesty boundary declarative API, а не незакрита implementation defect.
Чинні docs, coverage semantics і review guidance не створюють false proof claim. Новий
task зараз або повторить чинний contract, або порушить architecture boundaries.

Residual monitoring trigger: відкрити окремий design/research, якщо є production incident
hidden capture, повторювані metadata-drift findings, запит на compiler/plugin support або
потреба enforcement beyond auditable declarations. Derived task зараз заборонена.

Dependencies/release: чинні coverage/docs/review controls уже implemented; зовнішньої
dependency немає. Пункт не змінює pre-release ordering і не блокує `0.0.3`.

## APR-002 — великі integration state machines

### Чинний contract і факти

- `container.ts` має 3198 lines; `createRuntime()` локально об'єднує resolution contexts,
  cycle frames, sync/async single/multi resolution, caches, resource ownership, scopes,
  inspection і disposal у ~1198-line closure.
- `composer.ts` має 5709 lines і 329 function-like nodes; responsibilities включають
  declarations, setup bridge, capability/cardinality validation, adapter sources,
  module graph, runtime wrappers та inspection.
- Shared provider identity, metadata normalization і lifetime evaluation вже винесені в
  `provider-identity.ts`, `provider-metadata.ts`, `lifetime-validation.ts`; audit не знайшов
  parallel graph/ownership workaround.
- 167 focused regressions і повний 387-test audit TASK-0110 пройшли. Evidence поточного
  failure немає, але change frequency і hotspot size є безпосередньо виміряним pressure.

### Сценарії failure/change risk

1. Зміна resolver precedence може непомітно розійтися між sync/async/scope/collection paths.
2. Disposal fix у nested closure може змінити cache/owner transition поза local review span.
3. Composer feature торкається declaration, setup, graph, validation і wrappers в одному file,
   збільшуючи review blast і merge collision.
4. Big-bang rewrite може зламати privacy, ordering або structural compatibility, навіть якщо
   line count зменшиться.

### Вплив

- Maintainability/change risk: `S2`, likelihood pressure `L3`, blast `B3`.
- Runtime correctness: unproven; не можна підміняти pressure дефектом.
- Compatibility/public API: refactor має бути internal і preserve exact behavior/types.
- Privacy/resource: decomposition mistakes можуть зачепити private sanitation й ledgers.
- Вартість: середня або висока; safe seams спочатку потребують characterization і
  dependency map.

### Варіанти

| Option | Tradeoff | Cost | Decision |
|---|---|---:|---|
| Лишити безстроково | immediate risk немає; pressure і review cost накопичуються | низька зараз/висока потім | не рекомендувати |
| Tactical helper extraction за line count | проста metric, але може збільшити parameter coupling і приховати state transitions | середня | відхилити без design |
| Дослідити state/ownership seams, потім запропонувати staged refactor | evidence-driven, зберігає behavior, показує go/no-go points | середня для research | рекомендувати |
| Переписати container/composer | найбільший semantic і regression blast | дуже висока | відхилити |

### Рекомендація

Запропонована classification:
`потрібне окреме глибоке дослідження для прийняття рішення`.

Доказів достатньо, щоб не відкидати pressure, але недостатньо, щоб вибрати extraction
boundary. Research не блокує `0.0.3`: чинний audit пройдено, open defect немає.

Похідний proposal `DTP-APR-002`:

- proposed package: `TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research`;
- type: research; initial state `backlog + prepared`;
- predecessor: approved/completed TASK-0111;
- scope: responsibility/state map, transition and ownership invariants, coupling/change
  hotspots, candidate seams, characterization-test gaps, options/cost/blast analysis;
- out of scope: production refactor, API change, version/release action;
- acceptance: decision-ready `no refactor | staged internal refactor` recommendation with
  bounded follow-up proposals, exact invariant preservation and independent audit;
- release boundary: explicit не блокує майбутній `0.0.3` handoff.

Правило finalization: створити рівно один validated task package лише тоді, коли
classification `APR-002` і цей proposal окремо approved.

Dependencies/release: research залежить лише від completed evidence package TASK-0111,
зберігає чинні audits як baseline і explicit не блокує `0.0.3`.

## APR-003 — sequential async collection latency

### Чинний contract і факти

- `resolveAllAsync()` очікує providers по одному в registration order, відстежує completed
  indexes і зупиняється на першій failure.
- Contract зберігає deterministic start/failure order, per-provider cache/retry і
  owner-ledger semantics; concurrency існує лише між окремими calls/providers, де
  singleton/scoped in-flight state deduplicates.
- Docs explicit фіксують sequential resolution. Tests за anchors вище покривають order,
  fail-fast, retry, concurrent calls і reverse actual acquisition disposal.
- Repository не має performance benchmark, latency budget, telemetry або user report, який
  доводить material sum-of-latencies у реальній collection.

### Сценарії

1. П'ять independent remote factories по 100 ms створюють ~500 ms sequential success latency.
2. Parallel start може зменшити success latency, але після однієї failure решта work може
   продовжитись і acquire resources.
3. Bounded concurrency додає питання scheduler configuration, selection кількох failures,
   cancellation і deterministic reporting.

### Вплив

- Потенційна performance severity — `S2`; observed likelihood — `L1`; blast — `B1` на collection.
- Ordering/API: result order може лишитися stable, але start/failure semantics зміняться.
- Resource: parallel acquisition змінює actual owner-ledger order і failure cleanup races.
- Privacy: direct impact низький; aggregate errors усе одно потребують safe identity.
- Compatibility: default parallelism був би behavioral change.

### Варіанти

| Option | Tradeoff | Cost | Decision |
|---|---|---:|---|
| Зберегти sequential | correctness/determinism передусім; additive latency | немає | рекомендувати зараз |
| Default `Promise.all` | найшвидший success; non-fail-fast work і nondeterministic перший error | середня/висока | відхилити |
| Settle-all aggregate | stable aggregate можливий, але запускає unnecessary work/resources | висока | відкласти |
| Opt-in bounded scheduler | configurable performance; новий cancellation/failure/disposal contract | висока для design | майбутній research за trigger |

### Рекомендація

Запропонована classification: `не потребує уваги`.

Без виміряної latency problem або requested workload окремий scheduler research був би
спекулятивним. Чинна sequential policy є навмисною, малою в implementation і сильною
щодо lifecycle determinism.

Residual monitoring trigger: відкрити dedicated performance/design task, коли representative
benchmark або user workload покаже collection p95/critical-path latency вище explicit
budget, або коли реальна integration потребуватиме independent remote contributions.
Тоді дослідити cancellation, failure aggregation, resource cleanup і per-collection opt-in.
Derived task зараз не створюється.

Dependencies/release: майбутня work спочатку потребує representative workload/latency evidence;
без нього немає scheduler decision dependency. Пункт не блокує `0.0.3`.

## APR-004 — no-partial-return і arbitrary side effects

### Чинний contract і факти

- Caller отримує full array або rejection; later contributions після failure не запускаються.
- Успішні singleton/scoped providers/resources лишаються cached і owned. Невдалі eager
  unpublished candidate resources очищує library; arbitrary factory effects не rollback-яться.
- Docs за anchors вище explicit відділяють return atomicity від transaction rollback.
- Library не знає inverse operations для network calls, database writes, messages, logs або
  caller-owned mutations.

### Сценарії

1. Перша factory надсилає message, друга fail-иться; array не повертається, message лишається.
2. Перша factory створює managed resource, друга fail-иться; resource лишається
   owner-managed для published runtime/scope або очищується для failed eager candidate.
3. Гіпотетичний rollback callback сам може fail-итися, бути non-idempotent або мати race із
   concurrent users cached provider.

### Вплив

- Potential external-effect severity `S3`, likelihood `L1`, blast `B2` application boundary.
- Public API: universal compensation потребувала б нового effect/transaction protocol.
- Resource: owned resources уже мають explicit lifecycle; arbitrary side effects — ні.
- Privacy: rollback envelopes could retain sensitive causes/state.
- Compatibility: implicit rollback would change user-observable behavior and may be unsafe.

### Варіанти

| Option | Tradeoff | Cost | Decision |
|---|---|---:|---|
| Зберегти explicit non-transactional contract | honest ownership boundary; user проектує idempotency/compensation | немає | рекомендувати |
| Спробувати implicit rollback | неможливо для arbitrary effects; ризик double compensation | необмежена | відхилити |
| Optional compensation/effect protocol | потенційно корисний для narrow domain, але це новий feature/model | висока | лише після demand/design |
| Обмежити factories side-effect-free code | неможливо enforce для JavaScript і надто обмежувально | breaking | відхилити |

### Рекомендація

Запропонована classification: `не потребує уваги`.

Ризик належить arbitrary user code, тоді як library уже володіє й закриває resource
lifecycle, який може змоделювати. Обіцянка ширшої гарантії вводила б в оману.

Residual monitoring trigger: відкрити separate design лише після concrete demand на typed
compensation protocol, repeated incidents через помилкові transactional expectations або
bounded new resource/effect primitive з explicit ownership і idempotency rules.
Derived task зараз не створюється.

Dependencies/release: майбутній design залежатиме від explicit compensation/effect contract,
а не чинного provider lifecycle. Пункт не блокує `0.0.3`.

## APR-005 — graph schema evolution policy

### Чинний contract і факти

- Code експортує closed v1/v2 document unions; v1 є default, v2 — opt-in. Serializer і обидва
  renderers відхиляють unknown schema/version envelopes.
- V1 frozen і покритий canonical/ordering tests. V2 додає provider graph fields.
- Public docs уже кажуть, що package version є independent, unknown optional fields можна
  ігнорувати, а removal/change field/type/meaning або unsafe enum expansion потребує new
  schema version.
- Canonical memory каже, що schema version separate і incompatible evolution потребує new
  version, але не визначає full version introduction/support/default-promotion gates.
- Current v3 proposal, migration matrix, old-version support/removal rule і required golden
  gate для кожної published schema відсутні.

### Сценарії

1. Enum v2 розширюється, й exhaustive consumer ламається, хоча producer називає зміну additive.
2. V3 додається, але renderer/serializer support для v1/v2 випадково видаляється.
3. Default змінюється з v1 на v2/v3 без explicit compatibility decision.
4. Removal support старої schema приховується у minor package change.

### Вплив

- Compatibility severity `S2`, likelihood `L2` once graph evolves, blast `B2` tooling/
  snapshot consumers.
- Public API: schema unions/options/constants і default behavior є public contracts.
- Privacy: кожна нова version зберігає safe projection rules.
- Resource: runtime resource effect незначний; maintenance cost зростає з кожною supported version.
- Вартість: low-to-medium policy/test hardening до release, вища після появи залежних від v2 consumers.

### Варіанти

| Option | Tradeoff | Cost | Decision |
|---|---|---:|---|
| Покладатися лише на чинний paragraph | мінімально, але lifecycle/removal/default gates неоднозначні | низька | недостатньо |
| Мутувати v2, доки вона opt-in | short-term convenience, руйнує schema identity | низька зараз/висока consumer cost | відхилити |
| Прийняти explicit evolution/support gates до `0.0.3` | bounded governance, freeze-ить contract і tests old versions | низька/середня | рекомендувати |
| Відкласти до першої v3 | уникає поточної work, але policy прийматиметься під change pressure | середня потім | відхилити |

### Рекомендація

Запропонована classification: `виправити в 0.0.3`.

Це не запит на implementation v3 або promotion v2 до default. Це bounded pre-release
contract hardening, щоб перший public opt-in v2 не постачався без lifecycle rules.
Виправлення має передувати будь-якому майбутньому `0.0.3` version/release handoff; сама TASK-0111
не виконує version або release action.

Похідний proposal `DTP-APR-005`:

- proposed package: `TASK-07.15-0113-stage-18-graph-schema-evolution-policy-0-0-3-stabilization`;
- type: stabilization/documentation implementation; initial state `backlog + prepared`;
- predecessors: approved/completed TASK-0111 and TASK-0110;
- scope: realize approved schema-evolution policy in public docs/types/tests, preserve v1/v2
  serialization/rendering, add per-version golden/unknown-version/default gates and a
  new-version checklist;
- out of scope: schema v3, default promotion, provider semantics, package version bump,
  changelog release entry, publish;
- acceptance: v1 default/bytes and v2 opt-in contract preserved; incompatible change rule,
  old-version support/removal decision and default-promotion gate documented; focused/full
  quality and independent audit pass;
- release boundary: required predecessor будь-якого майбутнього `0.0.3` version/release handoff.

Правило finalization: створити рівно один validated task package лише тоді, коли
classification `APR-005`, `DTP-APR-005` і conditional `FIX-001` окремо approved.

Dependencies/release: remediation залежить від completed TASK-0110, approved decisions
TASK-0111 і application `FIX-001`; вона передує будь-якому майбутньому `0.0.3` release handoff.

## Release sequencing

- `APR-001`, `APR-003`, `APR-004`: без task і без `0.0.3` blocker.
- `APR-002`: research backlog після TASK-0111; explicit не блокує `0.0.3`.
- `APR-005`: pre-release stabilization; має завершитися до будь-якого майбутнього `0.0.3`
  version/release handoff.
- TASK-0111 не створює version/changelog/publish artifacts і не робить whole-portfolio
  release-ready claim.

## Canonical memory impact

`FIX-001` є conditional і required лише якщо human approves
`APR-005 = виправити в 0.0.3`. Він пропонує exact technical schema-evolution rules без
implementation v3.

| Area | Disposition | Rationale |
|---|---|---|
| `memory/technical/architecture.md` | included у `FIX-001` | version lifecycle належить graph-export architecture |
| `memory/technical/rules.md` | included у `FIX-001` | compatibility/default/removal guardrails |
| `memory/technical/testing.md` | included у `FIX-001` | per-version golden і unknown/default gates |
| `memory/technical/specification-trace.md` | included у `FIX-001` | trace approved decision source |
| `memory/product/requirements.md` | not-needed | `REQ-GRAPH-EXPORT-001` уже вимагає versioned projection |
| `memory/product/roadmap.md` | not-needed до approval | derived task sequencing живе в approved task package/plan; release task немає |
| `memory/domain/*` | not-needed | no domain semantics change |
| `memory/state.md` | not-needed до finalization | lifecycle summary можна оновити під час створення approved derived task |
| indexes | included operationally | report/task indexes оновлено без recursive fixation |

До separate human approval жодна canonical change не застосовується.

## Derived-task registry

| Proposal | Parent | Classification | Creation gate | Count rule |
|---|---|---|---|---|
| `DTP-APR-002` / запропонована TASK-0112 | `APR-002` | deep research | схвалити classification + proposal | рівно один |
| `DTP-APR-005` / запропонована TASK-0113 | `APR-005` | fix in `0.0.3` | схвалити classification + proposal + required FIX | рівно один |

На момент review жодного task package немає. `One approved item -> one validated
backlog/prepared task`; items із classification `не потребує уваги` не створюють tasks.

## Recommendation package

Схвалити overall research result, а потім окремо вирішити кожен item:

1. `APR-001`: схвалити `не потребує уваги`.
2. `APR-002`: схвалити deep research і `DTP-APR-002`.
3. `APR-003`: схвалити `не потребує уваги`.
4. `APR-004`: схвалити `не потребує уваги`.
5. `APR-005`: схвалити `виправити в 0.0.3`, `DTP-APR-005` і `FIX-001`.

## Independent audit reconciliation

Незалежний auditor `/root/task_0111_independent_audit` спочатку повернув
`CHANGES REQUIRED`: P2 language gate, P2 evidence reproducibility, P3 run-index wording і
P3 exact insertion point `FIX-001`. Усі findings закрито:

- авторську prose report/result приведено до canonical української мови;
- додано exact TASK-0110 anchors, per-item source/docs/test anchors і focused command;
- run index синхронізовано з active lifecycle;
- `FIX-001` exact вказує insertion після complete async gates section у кінці файла.

Closure re-audit verdict: `PASS`; open P0/P1/P2/P3 findings: none. Auditor повторно
підтвердив п'ять unique classifications, DTP/FIX gates, відсутність TASK-0112/0113 і
валідність links.

## Обмеження

- Висновок про performance `APR-003` спирається на відсутність measured repository evidence,
  а не на claim, що всі workloads є швидкими.
- AST branch counts є comparison indicators, а не standardized cyclomatic complexity.
- External npm publish status і майбутній release task не впливають на classifications; їх не
  перевіряли й не змінювали.
