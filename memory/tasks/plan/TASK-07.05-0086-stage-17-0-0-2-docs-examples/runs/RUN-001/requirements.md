# RUN-001 Requirements

## Task

`TASK-07.05-0086-stage-17-0-0-2-docs-examples`

## Goal

Актуалізувати README, deep docs і examples під implemented `0.0.2` public API перед
final audit/stabilization phase.

## Functional Requirements

- Оновити root і package README files там, де змінився public API.
- Оновити composer/modules docs для:
  - `cardinality` у `provides` і `requires`;
  - multi dependency `required: true | false` semantics;
  - runtime `get()` / `getAll()` public surface rules;
  - graph-aware adapters and source declarations;
  - adapter-aware cycle diagnostics.
- Оновити container/context docs для child scopes, якщо public APIs були додані.
- Оновити testing docs для new helpers.
- Оновити Next docs тільки там, де thin adapter usage examples потребують згадки
  child scopes.
- Додати або оновити examples для:
  - multi contributions catalog;
  - graph-aware auth adapter;
  - child scope transaction/preview-style overlay без domain APIs у core.

## Constraints

- Документація має описувати тільки implemented public API.
- Не реалізовувати runtime features у межах docs task.
- Не додавати site-engine business APIs у core або Next package.
- Не виконувати actual release/publish work.
- `using()` у graph-aware adapter docs показувати без resolver context.
- Testing docs мають використовувати public helpers і не покладатися на private internals.
- Project Memory лишається українською; repository docs/examples лишаються англомовними.

## Verification

- Перевірити релевантні examples через existing scripts, якщо вони є.
- Запустити релевантні docs/example quality gates, а за практичної можливості broader
  repository checks.
