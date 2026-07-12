# Деталізований звіт: Stage 18 lifetime dependency validation design

Status: completed
Type: design research
Related Task: `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md`
Related Run: `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/index.md`
Related Research: `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RSCH-001.md`
Created: 2026-07-12

## Мета

Визначити decision-ready semantic model explicit provider dependencies, за яким Sagifire
може виявляти доведене lifetime capture без decorators, source parsing, виконання factory
або неправдивої обіцянки повного static proof.

## Evidence

- Чинний `ResolutionContext` має `get*()`, але lookup не доводить, що повернений provider
  утримує отриманий instance.
- `BindingBuilder.toFactory()`, composer bindings і module setup приймають function, а
  provider records зберігають kind, lifetime та initialization без dependencies.
- `ModuleGraph` є normalized graph module/capability/binding edges; `RuntimeInspection`
  додає лише exported provider registration summaries.
- Private module providers адресуються internal tokens і навмисно не експортуються через
  runtime або inspection.
- Adapter `from(...).using(...)` уже має explicit source declaration і є прикладом
  graph-aware API без resolver inference.
- Runtime immutable після `freeze()` / `compose()`; child scope може змінити effective
  scoped values та має окремий cache.

## Semantic model

### Provider dependency declaration

Рекомендований object API додає optional другий argument до factory/resource registration:

```ts
interface ProviderDependencies {
    readonly dependencies: readonly ProviderDependency[]
}

type ProviderDependency =
    | {
          readonly token: Token<unknown>
          readonly access: 'instance'
          readonly cardinality?: 'single' | 'multi'
      }
    | {
          readonly token: Token<unknown>
          readonly access: 'deferred'
          readonly via: Token<unknown>
          readonly scope: 'caller'
          readonly cardinality?: 'single' | 'multi'
      }
```

Conceptual usage:

```ts
builder.toFactory(createService, {
    dependencies: [
        { token: requestContextToken, access: 'instance' },
        {
            token: repositoryToken,
            access: 'deferred',
            via: repositoryFactoryToken,
            scope: 'caller'
        }
    ]
})
```

Назви є proposed public API і стають contract лише після human approval та implementation
review. Metadata описує утримання результатом provider factory, а не порядок викликів
`context.get()`. Вона не інжектить arguments, не викликає factory і не замінює explicit
runtime resolution.

### Edge taxonomy

- `instance`: provider result прямо утримує resolved dependency instance щонайменше до
  завершення lifetime consumer provider.
- `deferred`: `token` ідентифікує ultimate dependency, `via` — реально утриманий
  factory/handle token, а `scope: 'caller'` вимагає explicit effective scope/context під
  час майбутнього виклику; ultimate instance не захоплюється під час створення consumer.
- ownership edge не є user-declared dependency access у першому slice. Він derivable з
  managed-resource registration і явно з'єднує resource з owner `runtime | scope`.
  Consumer dependency на такий resource лишається `instance` або `deferred`.
  Передача ownership consumer не підтримується: для неї потрібен окремий design creation,
  disposer, failure та transfer contract.

`cardinality` default — `single`; вона перевіряється проти registration contract.
Single declaration нормалізується в edge до concrete registration. Multi declaration
явно означає весь ordered provider set і нормалізується в окремий edge до кожної concrete
registration; registration index є частиною identity. Отже token metadata є declaration
selector, але validator/inspection працюють із concrete normalized edges.
Missing single target є invalid metadata. Empty multi є valid declared aggregate з нулем
concrete edges і не створює unsafe finding; coverage зберігає сам aggregate selector.
Scope-effective multi values/overrides розгортаються в їх deterministic effective order.

## Candidate API comparison

| Option | Shape | Переваги | Недоліки | Decision |
|---|---|---|---|---|
| A | `toFactory(factory, { dependencies })` | additive, metadata атомарна з registration, object API first | overloads треба провести через container/composer/module APIs | recommend |
| B | `toFactory({ useFactory, dependencies })` | єдиний descriptor легко розширювати | ламає звичний API shape або дублює overload, більше migration noise | defer |
| C | `toFactory(factory).dependsOn(...)` | fluent ergonomics | registration тимчасово неповна; змішує lifetime mutator і graph declaration | reject |
| D | module-level/provider-token registry | centralized graph | відриває metadata від concrete registration, погано працює з multi/private providers | reject |

DSL не визначає semantics: після стабілізації object API він може лише компілювати той
самий options object. Class providers без constructor injection є `not-applicable`, а не
магічно inferred.

## Lifetime і severity matrix

Базове правило: error можливий лише коли declared `instance` edge разом із derived
ownership edge доводить, що lifetime consumer довший за effective lifetime dependency
або owner. `deferred` не є capture.

| Consumer → dependency | `instance` | `deferred` | Derived ownership |
|---|---|---|---|
| singleton → singleton/value | safe | safe | none або runtime owner |
| singleton → scoped | error: proven unsafe capture | safe, якщо handle вимагає explicit active scope | scope owner робить capture unsafe |
| singleton → ordinary transient | warning: lifetime-sensitive capture, не proven leak | safe | none |
| singleton → singleton managed resource | safe borrow | safe | runtime owner; safe borrow |
| singleton → scoped managed resource | error: scope/resource capture | safe з explicit scope handle | error: scope уже owner |
| scoped → singleton | safe borrow | safe | runtime owner |
| scoped → scoped того самого effective scope | safe borrow | safe | same scope owner |
| scoped → ordinary transient | warning: lifetime-sensitive capture | safe | none |
| transient → singleton | safe borrow | safe | runtime owner, якщо resource |
| transient → scoped | warning: instance може escape scope через caller-retained transient | safe з explicit caller scope | scope owner підсилює warning |
| transient → ordinary transient | warning: lifetime ordering не доведений | safe | none |
| parent/singleton → child-scope value або override | runtime error before factory execution | safe через child-bound handle | error: child scope є owner |

Ordinary transient не має автоматичного disposal/owner boundary, а його result може
утримувати caller поза scope, у якому transient створено. Тому direct transient capture
не є доведеною помилкою, але transient→scoped і transient→transient потребують warning як
review signal. Managed resource severity визначається effective owner lifetime, а не лише
словом `resource`.

### Child scopes

Static composition перевіряє declared lifetimes основних registrations. Child-scope gate
виконується детерміновано під час `createScope()` після нормалізації inherited values та
local overrides, але до повернення scope користувачу і до будь-якої factory execution.
Validator розгортає всі declared edges проти effective registrations цього scope,
включно з nested-child overrides; unreachable edges не відкидаються, щоб результат не
залежав від resolution order.

Already-ready singleton не перевиконується: якщо його declared direct edge вимагав
scope-local dependency, основна static validation уже мала відхилити registration; новий
child override не ретроактивно змінює cached singleton. Якщо singleton ще не ready, він
так само не може bind-итися до child registration. Local values моделюються як
scope-owned effective registrations. Deferred handle мусить приймати explicit scope;
hidden current scope заборонений.

## Coverage contract

Coverage є machine-readable, не виводиться з відсутності diagnostics:

- provider: `not-applicable | declared | undeclared`;
- graph/runtime aggregate: `complete | partial | none`;
- validation evidence: `proven-unsafe | lifetime-sensitive | unknown`.

`complete` означає, що всі dependency-capable registrations у конкретній safe projection
мають declarations; private providers рахуються, хоча їх token IDs не показуються.
`undeclared` не є unsafe edge. За default policy він створює один deduplicated coverage
warning/summary, не error per lookup. Strict coverage може підвищити incomplete coverage до
warning gate, але ніколи не до unsafe-capture error.

Static validation працює на builder freeze/composer validate/prepare/compose до factory
execution. Runtime validation лише підставляє effective scope/override registrations у
declared edges. Runtime tracing, source parsing та factory execution не є evidence.

## Private-provider-safe identity

Private provider у diagnostic/inspection отримує structured identity:

```ts
{
    visibility: 'private',
    moduleId: 'orders',
    registrationIndex: 2
}
```

User-facing label: `private provider #2 in module "orders"`. Raw private token ID,
description, internal symbol або synthetic token не потрапляють у diagnostics/export.
Identity стабільна в межах semantic registration order та canonical snapshot. Public
providers зберігають token/module/registration identity. Це дозволяє correlation без
privacy leak.

## Diagnostics, inspection і graph export

Recommended diagnostic families:

- `SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE` — error, proven `instance` capture;
- `SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE` — warning, ordinary transient або інший
  review-sensitive edge;
- `SAGIFIRE_IOC_DEPENDENCY_METADATA_INCOMPLETE` — warning/summary, unknown coverage;
- `SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID` — error, missing target, cardinality,
  handle/target, missing/empty cardinality target або structurally invalid declaration.

Details містять safe consumer/dependency identities, access kind, effective lifetimes,
owner/scenario, evidence та remediation. Message не стверджує leak для unknown metadata.

Provider dependency edges розширюють normalized inspection graph або його provider
inspection projection; validator і graph export споживають цю саму normalized edge
структуру. `ModuleGraph` module edges не підміняють provider edges. Graph export включає
тільки safe identities та coverage summary, не private token IDs. JSON лишається canonical;
DOT/Mermaid лише візуалізують projection.

## Compatibility, adoption і migration

- Existing registrations продовжують працювати; behavior без metadata не змінюється.
- Перший implementation slice має бути warning-only для incomplete coverage і opt-in для
  enforcement, щоб additive API не став прихованим breaking compose gate.
- Unsafe capture error застосовується лише до explicitly declared edges після opt-in або
  окремого staged activation decision.
- Adoption: спочатку composition-root і high-risk singleton/scoped providers, потім module
  private providers; coverage summary показує прогрес.
- Metadata має передаватися без втрат через composer/module object APIs; DSL і testing
  helpers додаються після production semantics.

## Testing design

- compile-time fixtures для typed tokens, single/multi cardinality та options overloads;
- matrix tests для кожного рядка й access kind;
- no-execution tests: validate/inspect/export не запускають factories;
- scope-effective tests із child values/overrides та окремими caches;
- managed-resource ownership/disposal tests;
- private sentinel tests, що raw private IDs відсутні в diagnostic, JSON, DOT і Mermaid;
- coverage tests `complete/partial/none` і deduplicated unknown warning;
- parity tests: validator, inspection і export бачать ті самі normalized provider edges;
- compatibility tests: existing provider definitions мають незмінну resolution поведінку.

## Architecture pressure

Найбільші ризики — паралельна provider graph model у container/composer/export, metadata
drift між factory body і declaration та false confidence від слова `complete`.
Implementation має спочатку створити один internal normalized provider-edge foundation,
потім validation/inspection/export projections. Metadata є auditable declaration, не
runtime proof того, що factory body чесно її виконує.

## Decision-ready answers до approved FIX-003

1. Declaration: optional `toFactory(factory, { dependencies })` object metadata з
   `instance | deferred`, cardinality, а для deferred — окремими ultimate
   dependency `token`, retained handle `via` та `scope: 'caller'`.
2. Severity: singleton→scoped і parent→child direct capture — error; ordinary transient —
   warning; resource severity слідує derived runtime/scope owner lifetime; deferred — safe.
3. Private identity: structured module ID + private registration index без token ID.
4. Coverage: `complete | partial | none` окремо від evidence; undeclared edge є unknown,
   не unsafe.

## Recommendation

Approve design як основу phased implementation, але не реалізовувати одним великим slice.
Послідовність після окремого human approval:

1. normalized provider dependency metadata/edge foundation та safe identities;
2. static validation, coverage й typed diagnostics;
3. scope-effective validation, inspection/export integration;
4. testing helpers, DSL, docs і staged enforcement policy.

## Upward consistency disposition

| Area | Disposition | Rationale |
|---|---|---|
| `memory/domain/open-questions.md` | included у FIX-002 | lifetime questions отримали відповіді |
| `memory/technical/architecture.md` | included у FIX-001 | semantic model і graph boundary |
| `memory/technical/rules.md` | included у FIX-001 | evidence, severity, privacy guardrails |
| `memory/technical/testing.md` | included у FIX-001 | matrix/coverage/privacy gates |
| `memory/product/requirements.md` | included у FIX-002 | design-first gate може стати design-approved |
| `memory/product/roadmap.md` | included у FIX-002 | зафіксувати phased implementation eligibility |
| `memory/technical/specification-trace.md` | included у FIX-001 | trace approved design artifact |
| `memory/state.md` | included у FIX-002 | current design-gate state |
| indexes | not-needed | file/folder structure canonical memory не змінюється |

## Обмеження

Цей звіт не змінює runtime/public API, не застосовує FIX proposals і не створює
implementation tasks. Exact API names та enforcement default залишаються subject to
human-reviewed implementation contract.
