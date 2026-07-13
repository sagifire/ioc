# Деталізований звіт: Stage 18 async multi-provider semantics design

Status: completed
Type: design research
Related Task: `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md`
Related Run: `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/index.md`
Related Research: `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RSCH-001.md`
Created: 2026-07-13

## Мета

Визначити decision-ready async multi-provider semantics до implementation: sync boundary,
mixed eager/lazy behavior, порядок, concurrency, failure/retry, ownership/disposal,
scopes, composer, testing, DSL та inspection. Назва public explicit async collection API
не є вхідним припущенням і не фіксується цим design.

## Класифікація тверджень

- **Evidence** — прямо підтверджено чинним кодом або approved canonical memory.
- **Inference** — наслідок чинної моделі, який ще не є implemented contract.
- **Recommendation** — target semantics, що потребує human approval і окремих
  implementation tasks.

## Evidence: чинна модель

- `MultiBindingBuilder` підтримує лише `toValue()` і sync `toFactory()`.
- `getAll()` є sync на container runtime, scope, resolution context і composed runtime та
  повертає fresh array у registration order.
- Async single providers мають lazy/eager initialization, singleton/transient/scoped
  lifetime, per-provider cache, singleton/scoped in-flight deduplication і retry після
  failed initialization.
- Sync `get()` уже може читати eager singleton async provider після успішного `freeze()`,
  але не lazy async provider навіть після його попереднього async resolution.
- `freeze()` ініціалізує eager async single providers послідовно; multi registrations
  зараз явно пропускаються.
- Async resources мають лише runtime-owned singleton або scope-owned scoped lifetime;
  transient ownership заборонений.
- Failed eager `freeze()` звільняє вже створені singleton resources і дозволяє нову
  freeze attempt; lazy failure очищає лише failed provider cache.
- Scope multi order: runtime contributions, inherited ancestor local values, current child
  local values.
- Composer multi order: module registration order, order усередині module setup,
  composition-root contributions після module contributions, root registration order.
- Inspection уже має provider kind, lifetime, initialization та registration index, але
  не показує mutable cache readiness.
- Testing multi overrides і fake multi providers навмисно підтримують лише values/sync
  factories, бо production async multi semantics ще немає.

## Design invariants

1. `getAll()` лишається sync і ніколи не повертає `Promise`.
2. Explicit async collection access є окремою operation з semantic shape
   `Token<T> -> Promise<T[]>`; exact public name відкладається до implementation contract.
3. Collection завжди повертає fresh array або не повертає array взагалі.
4. Semantic registration order не залежить від completion order.
5. Cache, in-flight state, retry, lifetime, ownership і disposer належать provider
   contribution, не collection.
6. Collection не є transaction: library не обіцяє rollback arbitrary user factory side
   effects.
7. Object-configuration API визначає production semantics до DSL/testing ergonomics.

## Рекомендована модель

### Contribution identity і resolution frames

Кожен contribution має concrete identity щонайменше `tokenId + registrationIndex`.
Composer/inspection додає safe source identity: module ID або composition-root, provider
kind і registration kind. Core container registration може використовувати public token
ID; module-private multi registration отримує окрему safe collection identity `moduleId +
privateCollectionOrdinal` і contribution identity додає `contributionIndex` ще до
resolution. Stable private collection ordinal призначається normalized module setup order,
не містить raw token ID і відрізняє дві private collections того самого module. Raw
internal/private token ID не потрапляє у message, details або cause outward error.

Contribution identity використовується для cache, in-flight deduplication, failure
attribution та inspection, але cycle model додатково має typed operation frames:

- `collection(tokenId)` для active collection resolution;
- `provider(tokenId, registrationIndex)` для concrete contribution resolution.

Re-entrant access до тієї самої active collection fail-ить на collection frame до запуску
будь-якого nested sibling. Звичайні siblings не є cycles; concrete provider frame виявляє
self-await/re-entry. Cycle diagnostic показує sanitized collection/provider path із
private collection ordinal/contribution index або public token/index. Container не
отримує module knowledge: composer передає safe
diagnostic identity через internal registration bridge, а не перекладає вже leaked raw
error post factum.

### Sync `getAll()` boundary

Після lifecycle/access та cardinality/local-kind validation, але перед виконанням
будь-якого runtime contribution, `getAll()` робить declarative collection preflight:

1. scope eligibility для всіх scoped contributions;
2. sync eligibility для всіх async contributions.

Missing active scope має precedence над async-access blocker; blockers одного класу
стабілізуються per-token contribution index. Static lifecycle validation уже завершена до
runtime access. Factory failures, dependency failures та інші dynamic errors не можуть
бути preflight-овані й не отримують transactional atomicity guarantee.

Sync-eligible contributions:

- value provider;
- sync factory/class contribution;
- async factory/resource contribution, якщо він declared `singleton + eager` і successful
  `freeze()` уже зробив його ready.

Async-required contributions:

- lazy async singleton незалежно від mutable cache state;
- transient async contribution;
- scoped async contribution;
- будь-який async contribution, який не завершив eager freeze.

Якщо знайдено missing scope або хоча б один async-required contribution, `getAll()` кидає
typed readable error до запуску sync transient factories. Details містять safe collection
identity і blocking registration indexes з provider kind/lifetime/initialization. Отже
поведінка не залежить від того, чи хтось раніше випадково прогрів lazy cache.

Це узгоджується з single-provider rule: eager singleton async provider доступний sync
після freeze, lazy async provider — ні навіть після async resolution.

### Explicit async collection resolution

Explicit async accessor:

- проходить contributions послідовно в per-token registration order;
- sync contribution резолвить sync шляхом;
- async contribution резолвить чинним async provider шляхом;
- додає scope-local sync values після runtime contributions у чинному ancestor-to-child
  order;
- для missing valid multi token повертає fresh empty array;
- повертає array тільки після success усіх contributions.

Collection не має власного promise cache. Два concurrent collection calls є двома calls;
singleton/scoped contributions дедуплікуються per-provider, transient contributions
виконуються per-call.

## Truth table

| Contributions | `getAll()` після freeze | Explicit async accessor | Примітка |
|---|---|---|---|
| none | `[]` | resolved `[]` | fresh arrays |
| values/sync factories | success | success | однаковий order |
| sync + eager singleton async | success | success | eager ready є freeze invariant |
| лише eager singleton async | success | success | no readiness race після freeze |
| sync + lazy singleton async | typed preflight failure | success/reject per provider | lazy cache state не змінює sync contract |
| eager + lazy async | typed preflight failure | success/reject per provider | mixed initialization visible in inspection |
| transient async | typed preflight failure | new execution per call | no collection cache |
| scoped async без scope | typed scope/access failure | typed scope failure | як single provider |
| scoped async у scope | typed preflight failure | per-scope cache | lazy only |
| runtime + parent/child local sync values | залежить від runtime providers | success/reject; locals appended | runtime, ancestors, child |

## Candidate options: sync boundary

| Option | Семантика | Переваги | Ризики | Decision |
|---|---|---|---|---|
| A | будь-який async contributor назавжди забороняє `getAll()` | найпростіша token-level rule | eager втрачає чинну single-provider цінність; створює async taint | reject |
| B | `getAll()` читає будь-який async provider, якщо cache зараз ready | максимальна зручність | temporal API; lazy warm-up змінює behavior; race/inspection ambiguity | reject |
| C | preflight за declared execution/lifetime/initialization | стабільно, сумісно з eager single, no partial execution on access mismatch | потрібен collection preflight і contribution details | recommend |

## Candidate options: concurrency і failure

| Option | Cost | Determinism/ownership | Failure model | Decision |
|---|---|---|---|---|
| Sequential fail-fast | latency є сумою до failure/success | deterministic start/failure order у межах call | перша failure в registration order | recommend first contract |
| Full parallel + `Promise.all` | найнижча success latency | completion-order disposer race; work триває після rejection | first observed, не semantic first | reject default |
| Full parallel + settle-all aggregate | чекає всі results | можна стабілізувати report, але запускає зайву роботу/resources | aggregate, no fail-fast | defer |
| Configurable/bounded parallelism | потенційний performance control | новий scheduler/public policy, складні tests | залежить від option | defer окремий design |

Sequential policy свідомо оптимізує correctness і maintainability, не throughput. Вона не
виключає future opt-in concurrency, але future policy має окремо визначити cancellation,
deterministic disposer ledger, multiple failures і compatibility.

## Failure semantics

### No partial results

No-partial-results означає return atomicity: caller отримує весь ordered array або
rejection/throw. Це не означає rollback довільних user side effects.

Після failure:

- наступні contributions у поточному sequential call не запускаються;
- уже створені singleton/scoped provider values зберігають власний cache/owner;
- transient values не кешуються і можуть бути створені знову під час retry;
- collection не зберігає incomplete array або failed collection state.

### Diagnostic envelope

Contribution failure має typed wrapper із preserved `cause` та safe details:

- public token ID або private-safe module/collection-ordinal identity;
- contribution registration index;
- provider kind, lifetime, initialization;
- phase `eager-freeze | async-collection`;
- safe composer source identity; private module diagnostics не містять raw token ID;
- completed contribution indexes до failure;
- remediation hint.

Exact error class/code names визначає implementation task, але namespace лишається
`SAGIFIRE_IOC_*`. Public-token wrapper зберігає original cause. Private registration не
може expose internal IoC cause, що містить raw token; preferred boundary — створювати core
error одразу з registration-time safe diagnostic identity. Якщо translation неминучий,
outward cause теж має бути sanitized.

Aggregate error не потрібен у sequential contract. Cleanup failure під час rejected eager
freeze не замінює primary initialization failure; усі disposers все одно викликаються.
Оскільки чинний public diagnostics channel не має secondary-error transport, видимість
cleanup failure лишається explicit residual risk для resource implementation slice.

## Retry і concurrent calls

### Per-provider state

- Failed singleton async provider: pending cache очищається; наступний async collection
  call retry-ить цей provider.
- Failed scoped async provider: pending entry видаляється лише з effective scope cache.
- Successful singleton/scoped providers до later failure лишаються ready й reuse-яться.
- Transient async provider виконується заново на кожному call.
- Concurrent calls reuse лише singleton/scoped in-flight provider promise; opaque
  collection promise не створюється.

### Collection retry

Collection retry — звичайний новий async resolution call. Він повторно проходить повний
registration order, reuse-ить ready per-provider caches та reexecutes transient providers.
Немає collection retry counter, poison state або collection-level invalidation.

### Freeze retry

Failed eager multi contribution відхиляє весь candidate runtime. Builder freeze retry
створює новий runtime attempt: eager factories виконуються знову, а resources попередньої
attempt уже звільнені. Це відрізняється від lazy collection retry, де published owner
лишається live.

## Resource ownership і disposal

### Target ownership matrix

| Contribution | Owner | Initialization | Success disposal | Lazy partial failure |
|---|---|---|---|---|
| singleton async resource | runtime | eager або lazy | reverse actual runtime-ledger acquisition order | лишається runtime-owned |
| scoped async resource | effective scope | lazy | reverse actual scope-ledger acquisition order | лишається scope-owned |
| transient async resource | none | unsupported | n/a | registration rejected |
| async factory value | provider lifetime cache або caller | eager/lazy за rules | no automatic disposer | no rollback |
| scope-local sync value | external caller | already available | container не dispose-ить | unchanged |

Collection не стає owner і не отримує disposer list.

### Eager partial failure

Eager multi initialization конкретної collection відбувається sequentially у її per-token
contribution order. Global freeze traversal між різними tokens є deterministic
implementation order, але не новий public semantic order. Якщо later contribution fails,
candidate runtime не публікується; усі runtime-owned resources, створені цією freeze
attempt, dispose-яться у reverse actual owner-ledger acquisition order. Async factory
values без disposer просто відкидаються разом із candidate runtime.

### Lazy partial failure

Published runtime/scope не rollback-иться. Успішний singleton/scoped resource до later
failure вже належить runtime/scope і може одночасно бути shared іншим resolution call.
Автоматичне disposal під час collection failure порушило б owner contract. Resource
лишається ready та dispose-иться тільки owner lifecycle.

Якщо owner dispose-иться, поки resource initialization pending, provider завершує
creation, негайно dispose-ить value та відхиляє resolution згідно з чинною single-provider
semantics.

### Phasing decision

Перший implementation slice після окремого approval підтримує async factory
contributions, але не async resource contributions. Resource API додається наступним
slice після behavioral foundation і мусить реалізувати саме описану owner model. Це
bounded sequencing, а не незакрите semantic question.

## Scopes і scope-local values

- Scoped async contributions можуть бути лише lazy і потребують explicit active scope.
- Кожен child scope має окремий provider cache; parent scoped instance не reuse-иться.
- Runtime providers резолвляться першими; parent local multi values передують child local
  multi values.
- Scope-local contributions у цьому design лишаються sync values. Async local factories,
  local resource ownership і local eager state не додаються.
- Sync `getAll()` preflight перевіряє runtime provider set до resolution; local sync values
  не можуть зробити async-required runtime set sync-доступним.
- Explicit async accessor додає local sync values лише після success усіх runtime
  contributions, тому failure не повертає local-only partial array.

## Composer і modules

- Async є provider execution kind, а `multi` — cardinality; друга cardinality model не
  створюється.
- Core container `add()`, module setup `add()` і composition-root `composer.add()` мають
  передавати однакові provider options/lifetime/initialization semantics.
- Module contributions зберігають module/setup order; composition-root contributions
  лишаються після них.
- Composed runtime, composed scope, module resolution context і composer binding context
  отримують той самий explicit async collection boundary після object API stabilization.
- Cardinality gating: explicit async collection accessor дозволений лише для public multi
  capability; single capability отримує existing-style typed mismatch.
- Private providers доступні лише через module context і не експортуються runtime.

## Inspection і graph export

Inspection показує declarative, а не mutable state:

- provider kind `value | factory | class | async-factory | async-resource`;
- lifetime;
- initialization `eager | lazy` для async;
- registration index і safe source identity;
- cardinality `multi`.

`pending | ready | failed` cache state не експортується: він time-dependent, може
розкривати runtime activity і робити snapshots nondeterministic. Mixed/eager/lazy
семантика виводиться з ordered provider summaries. За потреби inspection може мати derived
stable collection classification `sync-eligible | async-required`, але не дублювати
provider source of truth.

Graph export використовує ту саму safe inspection projection. Provider values, resource
state та private token IDs не додаються.

## Testing package і DSL

### Testing

Після production object API:

- multi override contributions можуть append/replace async factories з тими самими
  lifetime/initialization options;
- fake multi modules можуть використовувати async factories тільки через production
  module `add()` semantics;
- async resources додаються до helpers лише після production resource slice;
- replace/append нормалізуються before freeze/compose і не мутують frozen runtime;
- testing package не отримує alternative concurrency або rollback behavior.
- privacy sentinels перевіряють async collection/eager-freeze failures private providers,
  включно з outward cause, без raw internal/original token ID.
- privacy/collision fixture має дві private collections одного module з contribution
  index `0` і перевіряє різні stable collection ordinals.
- concurrent collection/direct resource tests перевіряють exactly-once ownership і reverse
  actual ledger disposal без brittle global registration-order expectation.

### DSL

DSL додає async multi declarations лише після object API stabilization і компілює їх
один-в-один. DSL не інферить eager/lazy, ownership або dependencies з factory body й не
визначає назву async collection accessor.

## Compatibility і migration

- Existing sync `add()` і `getAll()` behavior не змінюється для collections без async
  contributions.
- Async contributions є additive opt-in.
- Collection з eager singleton async contributions стає sync-readable лише після
  successful freeze; це відповідає existing eager single behavior.
- Lazy async collection завжди потребує explicit async accessor, навіть після warm-up.
- No partial array, collection cache або implicit Promise union додається.
- Docs потребують truth table, ordering/failure examples і чітке пояснення, що no partial
  result не є transaction rollback.

## Architecture pressure

Основні pressure points:

1. Token-only provider cycle stack недостатній для кількох contributions одного token;
   потрібні окремі collection/provider frames і private-safe contribution identity без
   module knowledge у container.
2. `getAll()` потребує scope/sync eligibility preflight окремо від execution, інакше
   declarative access mismatch може запустити earlier sync transients.
3. Eager initializer зараз пропускає multi registrations; resource ledger має зберегти
   exactly-once owner behavior без хибної global registration-order обіцянки.
4. Surface проходить через container, scope, resolution context, composer wrappers,
   module setup, inspection, testing і DSL; mechanical one-shot change матиме великий
   blast radius.

Це обґрунтовує phased implementation, а не workaround у поточному sync loop.

## Candidate recommendation

Рекомендується approve semantic design і лише потім окремо погодити phased planning:

1. contribution identity, async multi provider records, sync preflight і typed failure
   foundation;
2. explicit async collection accessor у container/runtime/scope/context із sequential
   resolution, cache/retry та focused tests;
3. composer/module/cardinality/inspection integration;
4. async resource contribution ownership/disposal slice;
5. testing helpers, DSL, docs/examples і final audit.

Exact public accessor name/signature spelling, error class names і task decomposition не є
approved implementation scope цього report.

## Decision-ready відповіді до approved FIX-003

| Питання | Відповідь |
|---|---|
| Чи читає `getAll()` eager-ready async collection? | Так, лише declared eager singleton contributions після successful freeze і після full preflight; lazy warm cache не змінює contract. |
| Чи входять resources у first slice і хто owner після partial failure? | Target semantics визначено, але resource API не входить у first slice. Runtime/scope лишаються owners; lazy partial failure не rollback-ить успішні resources, eager failed freeze dispose-ить candidate resources. |
| Concurrency, failure, retry, rollback? | Sequential fail-fast у registration order; typed contribution cause; per-provider retry/cache; no collection rollback/cache; no partial arrays. |
| Mixed/eager/lazy/scope-local/order в inspection/testing? | Ordered declarative provider summaries; no mutable readiness export; locals sync-only і appended runtime→ancestors→child; testing mirrors production after stabilization. |

## Upward consistency disposition

| Area | Disposition | Rationale |
|---|---|---|
| `memory/technical/architecture.md` | included у FIX-001 | collection/lifecycle model |
| `memory/technical/rules.md` | included у FIX-001 | sync boundary, order, failure, ownership guardrails |
| `memory/technical/testing.md` | included у FIX-001 | truth table, retry, disposal, parity gates |
| `memory/technical/specification-trace.md` | included у FIX-001 | trace reviewed design |
| `memory/domain/open-questions.md` | included у FIX-002 | async questions отримали dispositions |
| `memory/product/requirements.md` | included у FIX-002 | `design-first` може стати `design-approved` |
| `memory/product/roadmap.md` | included у FIX-002 | phased eligibility, не implementation approval |
| `memory/state.md` | included у FIX-002 | current Stage 18 design gate |
| indexes | not-needed | canonical folder/file structure не змінюється |

## Обмеження і residual risks

- Sequential resolution може бути повільним для independent remote contributions;
  concurrency потребує окремого design.
- Cleanup failures під час failed eager rollback не мають окремого public secondary-error
  channel у чинній моделі.
- Arbitrary factory side effects не rollback-яться.
- Exact public names, overloads і implementation tasks потребують наступного human-reviewed
  contract.

Цей report не змінює runtime/public API, не застосовує FIX proposals і не створює
implementation tasks.
