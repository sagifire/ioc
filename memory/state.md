# Стан проекту

Оновлено: 2026-07-05
Starter Kit Version: 3.0
PDADM MVP Version: 0.3

## Поточний фокус

Project Memory є операційним джерелом істини для `@sagifire/ioc`. Кореневий `SPEC.md` і
`memory/sources/SPEC.md` лишаються історичними джерелами, але реалізаційні рішення треба
брати з canonical product/domain/technical memory.

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
phased implementation planning task для `0.0.2`.

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

## Остання implementation task

Остання implementation task:

```text
memory/tasks/plan/TASK-07.05-0079-stage-17-adapter-source-validation-inspection/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- adapter target validation вимагає external required port target і дає
  `SAGIFIRE_IOC_ADAPTER_TARGET_INVALID`;
- adapter source validation додає diagnostics
  `SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING`,
  `SAGIFIRE_IOC_ADAPTER_SOURCE_PRIVATE` і
  `SAGIFIRE_IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH`;
- single public capability and explicit composition-root binding sources підтримані;
- multi source token лишається rejected у першому slice;
- `composer.getGraph()`, `composer.inspect()` і `runtime.inspect()` показують
  `adapter-source` edges and source provider metadata;
- `@sagifire/ioc-testing` graph assertions підтримують `adapter-source` edge expectations;
- повні quality gates пройшли.

## Попередня implementation task

Попередня implementation task:

```text
memory/tasks/plan/TASK-07.05-0078-stage-17-graph-aware-adapter-api/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- `Composer.adapt(target).from(source).using(factory)` додано як additive graph-aware
  adapter object API;
- single token source and object source forms підтримані з TypeScript inference;
- `using()` отримує тільки resolved source value/object, без resolver context;
- adapter source metadata доступна через binding metadata без factory execution;
- existing `composer.bind().toFactory()` and DSL `adapt(token, factory)` лишилися
  backward compatible;
- повні quality gates пройшли.

## Передпопередня implementation task

Передпопередня implementation task зі статусом `done` після human review:

```text
memory/tasks/plan/TASK-07.05-0089-stage-17-composer-add-multi-contributions/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- `Composer.add(token)` додає explicit composition-root multi contributions для declared
  public `multi` capabilities;
- root contributions реєструються після module `setup()` contributions і резолвляться через
  `runtime.getAll(token)` у deterministic order;
- invalid root additions мають typed diagnostics
  `SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING` і
  `SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT`;
- public inspection показує `source: 'module' | 'composition-root'` для capability providers
  і runtime provider registrations;
- `runtime.get(token)` для public multi token лишається gated через
  `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`.

## Поточні ризики

- Adapter-aware cycles і lifecycle child-scope-и лишаються ризиковими точками `0.0.2`.
- `0.0.1` зафіксований у локальній пам'яті як stabilization handoff; фактичний npm publish
  не треба стверджувати без окремої перевірки.
- Security process readiness не дорівнює наявності npm security contact; перед запитом
  sensitive vulnerability details потрібне зовнішнє підтвердження.
- `MultiToken` / `ContributionToken` винесено в окрему ergonomics task після стабілізації
  core cardinality behavior.

## Наступні кроки

1. Стартувати `TASK-07.05-0080-stage-17-adapter-cycle-diagnostics`.
2. Виконувати `0.0.2` phases послідовно: adapters, child scopes, testing/ergonomics,
   docs/examples, full audit, stabilization handoff.

## Відкриті питання

- Чи потрібен окремий release-status verification task перед роботою над `0.0.2`?
