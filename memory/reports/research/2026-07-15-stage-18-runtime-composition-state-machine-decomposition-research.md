# Дослідження декомпозиції runtime/composition state machines

Related Task: [TASK-07.15-0112](../../tasks/plan/TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research/task.md)
Related Run: [RUN-001](../../tasks/plan/TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research/RUN-001/index.md)
Related Research: [RSCH-001](../../tasks/plan/TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research/RSCH-001.md)
Created: 2026-07-15
Status: completed
Type: research
Agent Role: Architecture Research Agent

## Висновок

Рекомендація: **`no refactor` зараз**, із чіткими monitoring triggers і збереженим
bounded staged option на випадок появи сильніших доказів.

Це не заперечує `APR-002`: `container.ts` містить виміряний 1198-line runtime closure з
69 вкладеними function-like nodes і 121 decision site за визначенням цього дослідження.
Але evidence не досягає порогу безпечної structural extraction:

- поточна історія охоплює лише початкову staged-реалізацію 2026-06-28..2026-07-14 і сильно
  спотворює churn;
- TASK-0110 не знайшов behavioral defect або parallel identity/graph/ownership model;
- `composer.ts` великий, але його integration flow уже розкладений на top-level helpers;
- найцінніші container seams мають високу state/ownership coupling, а найчистіші composer
  seams переважно переміщують pure code і не зменшують runtime state-machine risk;
- characterization gaps охоплюють error precedence, повторні build-и й ownership boundary
  `prepare()`, тому extraction до їх закриття створить непотрібний regression blast.

Big-bang rewrite відхилено. Якщо monitoring trigger спрацює, першим кроком має бути окрема
characterization-only task; production extraction дозволена лише після її go-gate.
Дослідження не блокує `0.0.3` і не авторизує implementation, version або publish.

## Trace і межі

| Evidence | Двосторонній trace |
|---|---|
| `APR-002` | TASK-0111 task/result/RSCH/report → TASK-0112 task/context → цей report |
| `DTP-APR-002` | approved TASK-0111 finalization → prepared/active TASK-0112 |
| TASK-0110 | result architecture-pressure section і formal audit → baseline та invariants тут |
| Baseline source | `container.ts` SHA-256 `db83040c...02a67`; `composer.ts` `bbcebd5a...c92449` |

Analyzed source/history revision: `013586ce344fbe2c1cbe9538d4b40f872302ed9e`.

Production code, public API/types, package exports, versions, changelog і release workflow не
змінювалися. Historical source snapshots не читалися й не змінювалися.

## Метод

1. Звірено canonical architecture/rules/testing/definition of done і approved TASK-0110/0111.
2. Побудовано source-anchored responsibility, transition та ownership maps.
3. Запущено read-only TypeScript AST measurement через task-local
   `RUN-001/source-metrics.mjs`.
4. Виміряно file history через `git rev-list`, `git log --numstat` і shared-commit перетин.
5. Зіставлено transitions із 11 focused test files і запущено baseline: 240/240 tests.
6. Candidate seams оцінено за cohesion, state/parameter coupling, dependency direction,
   parallel-model risk, testability, compatibility та blast radius.

## Відтворювані метрики

Tool assumptions: Node `v24.17.0`, TypeScript `5.9.3`, Git `2.40.1.windows.1`, Vitest
`4.1.9`. Команди виконувалися з `D:\work\ioc`.

```powershell
node memory/tasks/plan/TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research/RUN-001/source-metrics.mjs packages/ioc/src/container.ts packages/ioc/src/composer.ts
```

AST metric визначає decision site як `if`, ternary, loop, non-default `case`, `catch` або
логічний `&& | || | ??`. Це comparison indicator, не standardized cyclomatic complexity.
Function-like count включає declarations/expressions/arrows/method bodies, але не interface
signatures. Subtree count включає вкладені function bodies. Coupling profile рахує unique
relative import fan-out і кількість function bodies усередині обраного hotspot, які прямо
посилаються хоча б на один tracked canonical state/input identifier; identifier shadowing він
не розрізняє, тому це bounded indicator shared-state fan-out, а не semantic coupling score.

| Surface | Lines | Decision sites | Function-like bodies | Найбільший semantic hotspot |
|---|---:|---:|---:|---|
| `container.ts` | 3198 | 219 | 169 | `createRuntime()`, lines 1637-2834: 1198 lines, 121 subtree decisions, 69 nested functions |
| `composer.ts` | 5709 | 322 | 329 | `createLiveModuleSetupContext()`, lines 2756-2927: 172 lines, 13 nested functions |

Відтворювані coupling indicators:

| Hotspot | Relative import fan-out | Bodies in subtree | Bodies coupled to tracked state | Per-identifier body fan-out |
|---|---:|---:|---:|---|
| `container.ts:createRuntime` | 7 | 70 | 16 | registrations 9; runtimeState 7; graph snapshot 4; validation options 3; validation report 2 |
| `composer.ts:createLiveModuleSetupContext` | 6 | 14 | 7 | module definition 6; access 3; active context 3; container 2; each counter/map 2 |

Container import fan-out: context, diagnostics, lifecycle, lifetime validation, provider identity,
provider metadata, tokens. Composer fan-out: container, diagnostics, lifetime validation, provider
identity, provider metadata, tokens. Import fan-out не означає architectural violation: обидва files
залежать у правильному напрямі, а tracked state fan-out не враховує dynamic semantics або вагу
окремого reference. Він лише робить qualitative state-coupling observation відтворюваним.

History commands:

```powershell
git -c safe.directory=D:/work/ioc rev-list HEAD -- packages/ioc/src/container.ts
git -c safe.directory=D:/work/ioc log --format= --numstat -- packages/ioc/src/container.ts
git -c safe.directory=D:/work/ioc rev-list HEAD -- packages/ioc/src/composer.ts
git -c safe.directory=D:/work/ioc log --format= --numstat -- packages/ioc/src/composer.ts
git -c safe.directory=D:/work/ioc log --format='%h|%ad|%s' --date=short --numstat -- packages/ioc/src/container.ts
git -c safe.directory=D:/work/ioc log --format='%h|%ad|%s' --date=short --numstat -- packages/ioc/src/composer.ts
```

Exact aggregation and shared-intersection command:

```powershell
$revision='013586ce344fbe2c1cbe9538d4b40f872302ed9e'
$paths=@('packages/ioc/src/container.ts','packages/ioc/src/composer.ts')
foreach($path in $paths){$commits=@(git -c safe.directory=D:/work/ioc rev-list $revision -- $path);$rows=@(git -c safe.directory=D:/work/ioc log $revision --format= --numstat -- $path)|Where-Object{$_ -match '^\d+\s+\d+\s+'};$added=0;$deleted=0;foreach($row in $rows){$parts=$row -split '\s+';$added += [int]$parts[0];$deleted += [int]$parts[1]};[pscustomobject]@{path=$path;commits=$commits.Count;added=$added;deleted=$deleted;churn=$added+$deleted}}
$container=@(git -c safe.directory=D:/work/ioc rev-list $revision -- packages/ioc/src/container.ts)
$composer=@(git -c safe.directory=D:/work/ioc rev-list $revision -- packages/ioc/src/composer.ts)
$shared=@($container|Where-Object{$composer -contains $_})
[pscustomobject]@{container=$container.Count;composer=$composer.Count;shared=$shared.Count}
```

| File | Commits | Added | Deleted | Aggregate churn | Shared commits |
|---|---:|---:|---:|---:|---:|
| `container.ts` | 14 | 3519 | 321 | 3840 | 7 |
| `composer.ts` | 22 | 5988 | 279 | 6267 | 7 |

Limitations: additions включають initial file growth; commits можуть містити formatting або
staged feature delivery; churn не вимірює defect frequency, review time чи user impact. Тому
line/branch/churn metrics доводять pressure, але не самодостатню потребу refactor.

## Responsibility map: container

| Source anchor | Responsibility | Inputs/outputs | State/ownership | Boundary |
|---|---|---|---|---|
| 1-786 | Public contracts, typed errors, private-safe cycle frames | tokens/options → builders/runtime errors | immutable diagnostic data | imports context/diagnostics/lifetime/identity/metadata; no modules |
| 787-939 | Canonical provider/cache/runtime/scope records | normalized registration → mutable cache/owner records | provider cache, runtime and scope ledgers | one model reused by sync/async/scope/resource paths |
| 941-1635 | Configuration builders and cloning | `bind/add` → registration map; `freeze` → candidate clone | builder owns mutable registrations until successful freeze | failed freeze resets builder, successful freeze seals it |
| 1637-1828 | Runtime construction, validation and guards | cloned registrations/options → candidate state/contexts | candidate owns runtime state and graph snapshot | lifetime gate before publication |
| 1830-2451 | Sync/async single/multi resolution | token, stack, optional scope → value/array/error | singleton cache on provider; scoped cache on scope | exact precedence and diagnostic identity are observable |
| 2453-2834 | Resource disposal, scope tree and public runtime facade | owner ledgers/scopes → disposal/runtime | runtime owns singleton ledger; scope owns scoped ledger/children | eager failure cleans unpublished candidate |
| 2836-2922 | Provider lifecycle validation and eager traversal | registrations → validation/eager initialization | uses candidate cache/ledger through resolver callback | deterministic registration traversal |
| 2924-3198 | Scope-effective normalization/inspection and lookup | local/inherited values → effective snapshot/state | new scope owns local maps/cache/ledger | validation occurs before child publication/factory execution |

Dependency direction is correct: `container` depends on generic context, diagnostics, lifecycle,
tokens and shared provider foundations; it does not import `composer` or modules.

## Responsibility map: composer

| Source anchor | Responsibility | Inputs/outputs | State/ownership | Boundary |
|---|---|---|---|---|
| 44-1330 | Public module/composer/runtime types and typed diagnostics | public configuration/errors | immutable public contracts | exported API surface |
| 1331-1532 | Internal binding, access and registration records | declarations → normalized internal records | mutable registration metadata during build | one composition access model |
| 1546-1834 | Module/composer entry points and configuration builders | module/bind/add/adapt calls → arrays | composer owns mutable arrays; each operation snapshots | validation/inspection do not execute factories |
| 1836-2649 | Inspection, graph and provider-summary projection | snapshots/access → frozen safe graph | no provider values/readiness | pure projection over canonical models |
| 1954-2051 | `prepare/compose` orchestration | snapshots/options → prepared summary/runtime | each build owns container/access/setup contexts | pre-setup gate → setup → post-setup gate → freeze → activate |
| 2651-3490 | Container bridging, module setup, private identity and contexts | bindings/modules → container registrations | build-local private token maps, indexes, active context | composer uses container; container stays module-unaware |
| 3487-3753 | Capability-gated runtime/scope facades | public token → mapped container token/delegation | frozen facade; no second runtime state | privacy/cardinality before container access |
| 3755-4781 | Static validation, diagnostics and cycle traversal | immutable snapshots → ordered report | pure local collections | diagnostic order and no-factory-execution invariant |
| 4799-5192 | Private token mapping, provider recording, prepared summary | module/token/registration → safe access metadata | build-local canonical identity allocation | raw private IDs stay inside mapped tokens |
| 5211-5709 | Module normalization and JavaScript input validation | unknown input → frozen module or typed error | no runtime state | object API remains first-class |

`composer.ts` має велику surface area, але не аналогічний 1000-line closure: orchestration
`buildCompositionRuntime()` має 70 lines і делегує десяти named helpers. Основний mutable state
concentrated у `CompositionAccessModel` і `createLiveModuleSetupContext()`.

## State-transition map

### Container configuration і publication

```text
mutable builder
  -- freeze() --> frozen-pending(candidate clone)
      -- validation/eager success --> published frozen runtime
      -- failure + cleanup success --> mutable builder (retry allowed)
      -- failure + cleanup failure --> mutable builder + typed combined error
published runtime -- dispose() --> disposed-pending --> disposed
```

Повторний `freeze()` під час pending/success повертає guarded promise. Після failure guard
очищає promise і `isFrozen`; candidate registrations/cache/ledger не публікуються.

### Provider cache і resolution

```text
empty -- async start --> pending -- success --> ready
                           |-- failure --> empty(singleton) / absent(scoped)
ready -- sync/async access --> ready
transient -- each access --> execute, no retained cache
```

Sync single precedence: active lifecycle → scope-local kind/value → registration kind → provider
cycle → scoped eligibility → async eligibility → cache → execution → cache commit.

Async single додає per-provider pending deduplication, reset on failure і resource registration
до cache commit. Singleton factory resolution receives no scope; scoped/transient receives
effective scope.

Sync multi precedence: active lifecycle → local kind → registration kind → scoped eligibility →
collection cycle → all-provider sync preflight → ordered execution → runtime values then locals.
Async multi виконує те саме без sync preflight, потім sequential fail-fast resolution; later
contributions не запускаються, partial array не повертається, successful owner state не rollback-иться.

### Scope і ownership

```text
scope candidate -- normalize/inherit/validate --> published active scope
active parent -- create child success --> child appended to parent ledger
active scope -- dispose --> mark disposed
  --> reverse child disposal --> await pending resources
  --> reverse own resource ledger --> clear cache/remove from parent --> disposed
```

Runtime не володіє live root scopes. Parent володіє child disposal ordering; child disposal не
dispose-ить parent. Runtime shutdown не забирає scope ledger, але late scoped acquisition лишається
в effective scope і завершується typed failure.

Failure transition для runtime/scope disposal є окремим observable contract: owner позначається
`disposed` до await, ledger очищується до best-effort reverse disposer loop, а first call може
reject-нути після спроби всіх disposers. `disposePromise` після settlement очищується; owner
лишається disposed, тому наступний `dispose()` resolve-иться без повторного disposer execution.
Scope disposal після reverse child failures усе одно чекає власні pending resources і пробує own
ledger; перший reverse-child error має precedence над later parent-ledger error.

### Composition

```text
mutable composer config
  -- validate/inspect/getGraph --> immutable snapshots, no setup/factory execution
  -- prepare/compose --> snapshots
      --> pre-setup validation
      --> new container + access model
      --> root single bindings
      --> sequential module setup (resolution inactive)
      --> root multi bindings
      --> registration/adapter validation
      --> container.freeze()
      --> activate module resolution contexts
      --> prepared summary OR frozen composed facade
```

Failure до activation не публікує composed runtime. `prepare()` навмисно проходить той самий
freeze path і може initialize eager resources, але повертає лише summary; tests не фіксують
disposal ownership цього discarded internal runtime. Це characterization/design gap, а не
автоматично доведений defect у межах цієї задачі.

Pre-setup, post-setup і freeze failure відкидають build-local access/setup contexts; activation
відбувається лише після successful freeze. Лише eager-freeze failure входить до container-owned
candidate cleanup path. Повторна `prepare/compose` operation створює fresh snapshots, container,
access model і setup contexts та повторно запускає setup.

## Непорушні invariants

- `get()`/`tryGet()`/`getAll()` лишаються sync; warmed lazy async cache не змінює declaration.
- Runtime/facades frozen; builder/config snapshots не протікають у published runtime.
- Registration, module, contribution і owner-ledger acquisition order не змінюються.
- Error precedence, public codes/details/cause і private sanitation не змінюються.
- Provider identity має одну canonical key/collection coordinate; extraction не створює side model.
- Singleton cache/ledger належить candidate/runtime; scoped cache/ledger — exact scope.
- Collection не отримує cache, pending promise, owner або disposer.
- Failed eager candidate cleanup завершується до builder retry; lazy partial success зберігається.
- No-partial-return не означає rollback user side effects.
- Scope validation відбувається до publication; child додається лише після успішного gate.
- Composer не дає container знання про modules і не виконує factories під час inspection/validation.
- Raw private token/provider/cause/value/cache/disposer data не виходять назовні.

## Test trace і characterization gaps

Focused baseline:

```powershell
.\node_modules\.bin\vitest.cmd run packages/ioc/test/container.test.ts packages/ioc/test/scope.test.ts packages/ioc/test/async-providers.test.ts packages/ioc/test/async-multi-provider.test.ts packages/ioc/test/async-multi-resource.test.ts packages/ioc/test/composer.test.ts packages/ioc/test/async-multi-composer.test.ts packages/ioc/test/lifetime-validation.test.ts packages/ioc/test/provider-metadata.test.ts packages/ioc/test/scope-inspection-graph-v2.test.ts packages/ioc/test/graph-export.test.ts
```

Result: 11 files, 240/240 tests passed.

| Transition group | Existing anchors | Coverage | Material pre-refactor gap/proposal |
|---|---|---|---|
| builder/freeze/retry | `container.test.ts:551`; `async-providers.test.ts:100`; `async-multi-resource.test.ts:116` | strong | add concurrent `freeze()` promise identity + mutation rejection + one candidate execution |
| sync single/multi/cycles | `container.test.ts:46-545`; `scope.test.ts:64-483` | strong | table lifecycle-vs-kind-vs-missing precedence across runtime/scope/context APIs |
| async cache/retry/dedup | `async-providers.test.ts:140-268`; `async-multi-provider.test.ts:287-513` | strong | add failed runtime-dispose second-call test: first rejects after best-effort cleanup, second resolves without reexecution; failed scope case already pinned at `scope.test.ts:681-682` і `async-multi-resource.test.ts:469-475` |
| async multi ordering/failure | `async-multi-provider.test.ts:74-804` | strong | add mixed failure precedence matrix for disposed scope/runtime + cycle + blocker |
| resources/ownership/disposal | `async-multi-resource.test.ts:91-613` | strong | add callback-error + disposal-error precedence for `withScope/withChildScope` |
| scope tree/effective graph | `scope.test.ts:508-753`; `scope-inspection-graph-v2.test.ts:20-331` | strong | add multiple child/parent disposer failures and exact first-error selection |
| composer static validation/graph | `composer.test.ts:591-2224`; graph-export tests | strong | golden ordered diagnostic report across all appenders before validation extraction |
| setup/private identity | `composer.test.ts:2234-2737`; `async-multi-composer.test.ts:289-641` | strong | add failed-build retry/context freshness and stable private index allocation |
| repeated prepare/compose snapshots | sparse; `composer.test.ts:2311`, `:2730` | partial | characterize repeated calls, config mutation between calls і setup re-execution |
| `prepare()` eager resource ownership | docs `composer.md:150-162`; no exact test | gap | separate human decision: preserve-and-test current non-exposed owner behavior or correct it in a behavior task before refactor |
| composed gating/inspection | `composer.test.ts:3123-4105`, `:4253-4996`; scope graph tests | strong | add inspection identity across repeated compose calls if build extraction proceeds |

Green baseline без цих tests не доводить exact preservation для structural work.

## Candidate seams

| Seam | Cohesion | State/parameter coupling | Direction/cycle risk | Duplication risk | Testability/compatibility | Blast | Decision |
|---|---|---|---|---|---|---|---|
| C1 container resolution guards/preflight | high | medium; stack/identity/runtime/scope inputs | preserves container-only direction | low if canonical frames reused | good after precedence matrix | medium | conditional proof seam |
| C2 cache + async initialization transitions | high | high; provider record, scope cache, owner ledger, resolver context | no import cycle, but callback threading likely | high if singleton/scoped paths split | good only after state transition tests | high | no-go now |
| C3 resource owner ledger/disposal | high | high; runtime/scope differ by child ownership and cleanup phase | shared helper possible without composer | parallel owner abstraction risk | strong current tests plus listed gaps | high | no-go now |
| C4 scope tree/runtime facade | high | high; at least state, registrations, graph, validation, resolver callbacks | extraction can create bidirectional runtime/scope dependency | medium/high | public semantics broad | high | no-go now |
| C5 whole `createRuntime` engine | apparent high | extreme; 69 nested functions over shared state | likely central dependency hub | very high | rollback difficult | extreme | reject |
| P1 composer static validation cluster | high | low; immutable module/binding snapshots | clean leaf/internal direction | low with shared internal model | strong; needs golden diagnostic order | medium | best future seam, but does not solve runtime hotspot alone |
| P2 composer graph/inspection projection | high | low/medium; many public metadata types | clean leaf direction | low if canonical graph reused | strong privacy/order tests | medium | conditional after P1 |
| P3 composition build/access session | high | high; container, private maps, provider indexes, activation | central integration hub | high parallel access-model risk | gaps on repeated builds/prepare ownership | high | no-go now |
| P4 move public types/errors only | syntactic | low | low | low | high | low | reject as line-count-only |

Наразі жоден candidate не поєднує material state-machine risk reduction, low coupling і complete
characterization. P1 технічно чистий, але сам по собі є організацією файла, а не evidence-driven
декомпозицією risky runtime ownership machine.

## Варіанти

| Option | Cost | Sequence/go-gates | Rollback | Residual risk | Decision |
|---|---:|---|---|---|---|
| No refactor + monitoring | low | record triggers; no production task | n/a | hotspot remains, but no induced compatibility risk | recommend |
| Bounded staged internal refactor | medium/high | characterization task → P1/C1 proof → one seam per task; stop on coupling/order drift | revert each isolated extraction; no schema/data migration | state threading or cosmetic split may fail to improve maintainability | retain as conditional option |
| Big-bang rewrite | very high | requires broad parallel replacement and one-time cutover | poor; huge diff and semantic merge | privacy, error order, cache/owner drift | reject |

Conditional staged gates:

1. Characterization gaps relevant to selected seam closed without changing behavior.
2. One canonical provider/access/owner model; no parallel cache, graph, identity або scope state.
3. Extracted module dependency graph acyclic and direction unchanged.
4. Public DTS/API/export diff empty; focused/full regressions green.
5. Diagnostic order/details/cause/privacy and serialization fixtures unchanged.
6. Slice can be reverted independently and does not require simultaneous container+composer rewrite.
7. Stop if extraction increases explicit state owners/callback bundle or forces more than one
   compatibility shim.

## Exact-behavior preservation matrix

| Contract | Required evidence before/after any extraction |
|---|---|
| Public API/types/exports | API/DTS diff empty; packed/type consumer smoke unchanged |
| Sync boundary | all sync accessors never return Promise; lazy warmed async remains blocked |
| Immutability/publication | runtime/facades frozen; failed candidate never published; scope validates before publication |
| Ordering | registrations, module setup, contributions, locals and actual owner ledger unchanged |
| Diagnostics/precedence | error type/code/details/message/cause and first-error choice unchanged |
| Privacy | private raw IDs/values/causes/readiness/ledgers absent from all outward surfaces |
| Cache/in-flight/retry | singleton/scoped empty-pending-ready transitions and failed reset unchanged |
| Ownership/disposal | exact runtime/scope owner, pending wait, reverse acquisition, idempotency unchanged |
| Failure atomicity | no partial arrays; successful lazy owner state retained; eager candidate cleaned |
| Composer isolation | container module-unaware; access gates and setup activation unchanged |
| Validation/inspection | no user factory execution; one normalized graph; deterministic frozen output |
| Object API/DSL | object API first-class; DSL continues to delegate without second model |

## Рекомендація та evidence threshold

`no refactor` означає не «ніколи», а «поточні докази не покривають induced risk».
Перегляд рішення потрібен, якщо спрацює хоча б один trigger:

- два незалежні future changes або fixes протягом трьох релевантних задач кожен змушені
  одночасно змінювати щонайменше три mapped responsibility clusters;
- підтверджений defect або regression пов'язаний з cache/ownership/error-precedence drift;
- review/merge evidence показує повторні конфлікти саме в `createRuntime` або build/access path;
- нова feature не може бути реалізована без дублювання identity/graph/owner state;
- bounded spike доводить seam з acyclic dependencies, одним state owner і меншим coupling.

За відсутності trigger monitoring відбувається в task self-review/architecture-pressure section;
окремий постійний monitor або release gate не створюється.

## Пропозиції продовження

| ID | Status | Recommendation | Bounded contract | Creation gate |
|---|---|---|---|---|
| `FUP-0112-A` | proposed-optional | не створювати зараз; activate only on monitoring trigger | characterization-only task для exact gaps обраного seam; production source не змінюється | окреме human approval task result + proposal |
| `FUP-0112-B` | proposed-optional | не створювати зараз; залежить від successful A | рівно один extraction seam, P1 або C1, не обидва; довести coupling reduction, API/behavior parity і independent rollback | окреме human approval після A go-gate |

Негайна implementation task не пропонується; task packages для A/B не створено.

## Memory impact і upward consistency

- Task/run/RSCH/report/index lifecycle: `included` як operational updates.
- Product requirements/roadmap/state: `not-needed`; recommendation не змінює behavior, release
  sequencing або staged roadmap.
- Domain: `not-needed`; domain model не змінено.
- Technical architecture/rules/testing/definition of done: `not-needed`; чинні architecture-health,
  testing і preservation rules уже покривають рішення.
- ADR/knowledge packages: `not-needed`; новий architecture decision або reusable package не прийнято.
- `FIX-*`: none. Exact canonical proposal відсутній і нічого не застосовано.
- Release `0.0.3`: `not-needed`; task явно non-blocking.

## Обмеження

- AST metrics залежать від локального syntactic definition і не вимірюють semantic difficulty.
- Git history коротка та dominated initial delivery; defect/review-time data відсутні.
- Tests доводять observed repository behavior, але gaps вище не дозволяють повну preservation claim.
- `prepare()` ownership observation не перекласифіковано як defect без окремого product/behavior decision.
- Рекомендація не оцінює майбутній workload поза approved Stage 18 scope.

## Самоперевірка та незалежний аудит

Self-review підтвердив scope, двосторонній trace, відтворюваність метрик, повноту transition/
ownership maps, coverage gaps, preservation matrix, upward consistency та non-blocking release
boundary. Language gate, UTF-8, локальні wiki links, lint, formatting і `git diff --check`
пройдено; production code не змінено.

Незалежний аудитор `/root/task_0112_independent_audit` спочатку повернув `CHANGES REQUIRED`:

- метрикам бракувало відтворюваного shared-state coupling profile і pinned history aggregation;
- failure maps не фіксували exact retry/disposal/fresh-build semantics;
- lifecycle metadata та follow-up registry мали schema/status drift.

Після reconciliation script і report узгоджено з exact output, history прив'язано до revision,
failure maps і test anchors уточнено, а PDADM 0.5 metadata/registry вирівняно. Closure verdict:
`PASS`; open P0/P1/P2/P3 findings: none.
