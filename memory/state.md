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

Остання завершена implementation task:

```text
memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- public multi capabilities резолвляться через `ComposedRuntime.getAll(token)`;
- public single capabilities продовжують резолвитись через `ComposedRuntime.get(token)`;
- `get()` / `tryGet()` / async single-value access для public multi token падає typed
  `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`;
- `getAll()` для public single token падає typed
  `SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN`;
- optional missing multi dependency повертає `[]` через valid module provider context access;
- module-private multi providers не експортуються через composed runtime;
- `composer.add()` не вводився в цьому run.

## Попередня implementation task

Попередня implementation task зі статусом `done` після human review:

```text
memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/
```

Статус задачі: `done` після human review approval від 2026-07-05.

Результат RUN-001:

- додано static validation для duplicate single capability, compatible multi contributors,
  single/multi declaration conflicts, required-port cardinality mismatch і missing required
  multi contributors;
- додано post-setup validation для declared `multi` + `bind()` і declared `single` + `add()`;
- compatible multi contributors для одного token проходять compose і зберігають deterministic
  provider order;
- runtime `get()` / `getAll()` gating не реалізовувався в цій task.

## Поточні ризики

- Public inspection for multi-capability provider shape, graph-aware adapter source validation,
  adapter-aware cycles і lifecycle child-scope-и лишаються ризиковими точками `0.0.2`.
- `0.0.1` зафіксований у локальній пам'яті як stabilization handoff; фактичний npm publish
  не треба стверджувати без окремої перевірки.
- Security process readiness не дорівнює наявності npm security contact; перед запитом
  sensitive vulnerability details потрібне зовнішнє підтвердження.
- `composer.add()` для composition-root multi contributions заплановано окремою задачею
  після inspection/provider identity model.
- `MultiToken` / `ContributionToken` винесено в окрему ergonomics task після стабілізації
  core cardinality behavior.

## Наступні кроки

1. Стартувати `TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics`.
2. Після `TASK-07.05-0077` виконати
   `TASK-07.05-0089-stage-17-composer-add-multi-contributions`.
3. Виконувати `0.0.2` phases послідовно: multi-capabilities, adapters, child scopes,
   testing/ergonomics, docs/examples, full audit, stabilization handoff.

## Відкриті питання

- Чи потрібен окремий release-status verification task перед роботою над `0.0.2`?
