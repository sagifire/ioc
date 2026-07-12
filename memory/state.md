# Стан проекту

Оновлено: 2026-07-12
Starter Kit Version: 5.0
PDADM MVP Version: 0.5

## Міграція пам'яті

Поточна migration task:

`memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/`

Current Run: `RUN-002`
Fixation: applied `FIX-001`
Phase: completed

## Поточний фокус

Project Memory є операційним джерелом істини для `@sagifire/ioc`. Кореневий `SPEC.md` і
`memory/sources/SPEC.md` лишаються історичними джерелами, але реалізаційні рішення треба
брати з canonical product/domain/technical memory.

Project Memory мігрована на PDADM MVP 0.4 / Starter Kit 4.0 через окрему migration task:

```text
memory/tasks/plan/TASK-07.06-0091-memory-mvp-0-4-migration/
```

Статус задачі: `done` після human review approval від 2026-07-06. Первинне review
повернуло міграцію на доопрацювання, знахідки аудиту закриті в RUN-001 remediation.

Stage 1-16 завершені після людського рев'ю на рівні задачі:

- Stage 1 переніс `AGENTS.md` і `SPEC.md` у Project Memory.
- Stage 2 створив основу монорепозиторію та збірки без логіки container.
- Stage 3 реалізував typed tokens.
- Stage 4 реалізував синхронну основу single-provider container.
- Stage 5 реалізував multi-provider поведінку container.
- Stage 6 реалізував синхронні scope-и.
- Stage 7 додав async providers/resources і кероване звільнення ресурсів.
- Stage 8 додав typed diagnostics і форматування звітів.
- Stage 9 додав module definition, composer і composed runtime capabilities.
- Stage 10 додав metadata dependency edges і diagnostics для module cycles.
- Stage 11 додав DSL поверх object-configuration API.
- Stage 12 додав `@sagifire/ioc-testing`.
- Stage 13 додав `@sagifire/ioc-next`.
- Stage 14 додав README, deep docs і приклади.
- Stage 15 підготував release automation і repository governance.
- Stage 16 закрив pre-`0.0.1` stabilization audit і зафіксував handoff.

Stage 17 завершив audit feature request для `0.0.2` після людського рев'ю на рівні задачі.
Джерело feature request зберігається в Project Memory:

```text
memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md
```

Результат Stage 17 audit: пропозиції не прийняті суцільно. Після human decision створено
phased implementation planning task для `0.0.2`; implementation backlog, docs/examples,
full audit, stabilization handoff, follow-up `composer.add()` task і release/version
handoff task для `0.0.2` завершені після людського рев'ю.

Stage 18 завершив research/decision gate для `0.0.3` feature portfolio після людського
рев'ю. Graph export JSON/DOT/Mermaid прийнято як bounded implementation candidate;
async multi-providers і lifetime dependency validation мають статус `design-first` та не
вважаються прийнятими до реалізації без окремих design decisions.

`TASK-07.12-0097` завершила lifetime dependency validation design gate: explicit
provider metadata, edge/severity matrix, coverage contract і private-safe identity
design-approved. Runtime/public API ще не реалізовано; implementation tasks потребують
окремого human decision.

Research source:

`memory/sources/sagifire_ioc_0_0_3_market_research_uk.md`

Research task:

`memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/`

## Остання planning task

Поточна задача:

```text
memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Мета:

- зафіксувати accepted decisions щодо `0.0.2`;
- розкласти implementation на phased backlog tasks;
- зробити docs/examples передостанньою фазою;
- зробити full audit and stabilization останньою фазою;
- не змінювати runtime/code/package behavior під час planning.

## Остання research task

Остання research task:

```text
memory/tasks/plan/TASK-07.05-0087-stage-17-0-0-2-full-audit/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RSCH-001:

- критичних знахідок немає;
- знайдено `H-001`: `examples/next-app-router` компілюється, але direct Node run падає з
  `SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH`, бо `REQUEST_TAGS`
  лишився single declaration while example uses multi semantics;
- знайдено `L-001`: packed/export smoke checks не покривають явно нові `0.0.2` helper
  exports;
- `pnpm release:validate` проходить;
- stabilization handoff `TASK-07.05-0088` закрив `H-001` і `L-001` після human review
  approval.

## Остання release task

Остання release task:

```text
memory/tasks/plan/TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- publishable package manifests для `@sagifire/ioc`, `@sagifire/ioc-next` і
  `@sagifire/ioc-testing` зафіксовано at `0.0.2`;
- package changelogs, root changelog, README/package README і `docs/release.md`
  синхронізовано з release-prepared state;
- Project Memory синхронізовано з `0.0.2` release handoff;
- `pnpm release:validate` проходить після approved network access для dependency restore і
  повторно без escalation після memory sync;
- actual npm publish не виконувався.

## Остання implementation task

Остання implementation task:

```text
memory/tasks/plan/TASK-07.05-0089-stage-17-composer-add-multi-contributions/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- додано explicit composition-root `composer.add(token)` API для public multi
  contributions;
- root contributions реєструються після module `setup()` contributions і резолвляться
  через `runtime.getAll(token)` у deterministic order;
- validation додає typed diagnostics `SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING` і
  `SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT`;
- public inspection має source-aware provider identity для module і composition-root
  providers;
- full quality gates пройшли, human review approval отримано.

## Попередня implementation task

Попередня implementation task:

```text
memory/tasks/plan/TASK-07.05-0086-stage-17-0-0-2-docs-examples/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- README, package README, deep docs і examples актуалізовано під implemented `0.0.2`
  public API;
- composer/modules docs описують cardinality, optional/required multi semantics,
  `composer.add()`, graph-aware adapters, adapter-source edges і runtime cardinality
  gating;
- container/Next docs описують child-scope overlays і separate scoped provider cache;
- testing docs/package README перевірено на використання public helpers без private
  internals;
- `examples/module-composition` показує graph-aware auth adapter, multi contribution
  catalog і optional empty multi dependency;
- `examples/basic-node` показує child scope preview overlay;
- focused examples checks і full quality gates пройшли;
- human review approval отримано, задачу завершено.

## Попередня implementation task

Попередня implementation task:

```text
memory/tasks/plan/TASK-07.05-0085-stage-17-dsl-ergonomics-hardening/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- DSL `module()` покрито explicit cardinality declarations для finalized `0.0.2` object
  API;
- додано `add(token)` DSL helper для composition-root multi contributions;
- додано graph-aware `adapter(target).from(source).using(factory)` DSL helper;
- existing `adapt(token, factory)` збережено як backward-compatible context-factory binding
  helper без inferred source edges;
- `defineApp()` компілює new DSL declarations у existing composer object API без separate
  graph model;
- parity/compatibility tests додано;
- full quality gates пройшли;
- human review approval отримано, задачу завершено.

## Попередня implementation task

Попередня implementation task:

```text
memory/tasks/plan/TASK-07.05-0084-stage-17-multitoken-contributiontoken-ergonomics/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- прийнято additive `MultiToken` / `ContributionToken` helper API як type-level marker
  поверх existing token identity;
- додано `multiToken<T>()`, `contributionToken<T>()`, `MultiToken<T>` і
  `ContributionToken<T>`;
- додано namespaced variants `namespace(id).multiToken<T>()` і
  `namespace(id).contributionToken<T>()`;
- runtime token shape лишається `id` + optional `description`, без runtime cardinality
  metadata;
- ordinary `token()` лишається fully usable для multi capabilities;
- overload-based TypeScript rejection для `bind(multiToken)` / `get(multiToken)` не додано;
- full quality gates пройшли;
- human review approval отримано, задачу завершено.

## Передпопередня implementation task

Передпопередня implementation task:

```text
memory/tasks/plan/TASK-07.05-0083-stage-17-testing-helpers-new-primitives/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- додано `@sagifire/ioc-testing` helpers для multi capability assertions,
  contributor/provider assertions і adapter-source edge assertions;
- додано `multiOverride()` для append/replace test multi contributions before
  `freeze()` / `compose()`;
- `fakeModule()` підтримує declared multi capabilities через public `context.add()` для
  value/factory providers;
- додано child scope assertion helpers через public scope APIs;
- minimal testing docs sync виконано;
- full quality gates пройшли;
- human review approval отримано, задачу завершено.

## Раніша implementation task

Раніша implementation task:

```text
memory/tasks/plan/TASK-07.05-0082-stage-17-child-scope-runtime-semantics/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- child scope resolution успадковує parent scope-local single values;
- child same-kind single values shadow inherited parent values;
- child scope-local multi values append after inherited parent multi values and after
  runtime multi-provider values;
- child creation rejects inherited single/multi kind conflicts with typed
  `ProviderKindMismatchError`;
- child scoped provider cache лишається separate from parent scoped cache;
- parent scoped provider instances are not reused by child by default;
- factories resolved through child scope see child values and overrides;
- full quality gates пройшли;
- human review approval отримано, задачу завершено.

## Попередня adapter implementation task

Попередня adapter implementation task зі статусом `done` після human review:

```text
memory/tasks/plan/TASK-07.05-0080-stage-17-adapter-cycle-diagnostics/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- adapter-source edges беруть участь у module cycle detection, коли source provider є
  single module public capability;
- binding edges і composition-root adapter sources не створюють module-to-module cycle
  traversal;
- cycle diagnostics лишаються `SAGIFIRE_IOC_MODULE_CYCLE` з deterministic
  `moduleIdPath`, `tokenIdPath` і `edgeKinds`, включно з `adapter-source`;
- validation не виконує adapter factories або module setup для static cycle rejection;
- повні quality gates пройшли.

## Поточні ризики

- `0.0.2` зафіксований у repository files як release-prepared state; фактичний npm publish
  не треба стверджувати без окремої зовнішньої перевірки.
- Security process readiness не дорівнює наявності npm security contact; перед запитом
  sensitive vulnerability details потрібне зовнішнє підтвердження.
- `MultiToken` / `ContributionToken` прийнято як type-level helper only; docs/examples
  мають явно не обіцяти compile-time rejection для `bind()` / `get()`.
- DSL має два adapter helper paths: compatibility `adapt(token, factory)` без source-edge
  inference і graph-aware `adapter(target).from(source).using(factory)` з explicit source
  edges.
- Actual npm publish для `0.0.2` не виконувався під час release handoff task; publish
  лишається human-controlled workflow action.

## Наступні кроки

1. Виконати `TASK-07.12-0094` як graph export v1 foundation; `0095` і `0096` активувати
   послідовно після human-approved completion попередньої graph task.
2. Після окремого human decision створити bounded phased lifetime implementation tasks;
   `TASK-07.12-0098` лишається окремим async multi-provider design gate.
3. Actual npm publish `0.0.2` лишається human-controlled external action.

## Відкриті питання

- Чи виконано фактичний npm publish для `0.0.2`, треба підтверджувати зовнішньо після
  human-controlled release workflow.
