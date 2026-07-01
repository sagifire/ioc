# TASK-07.01-0028: Stage 11 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-01
Owner Role: Project Memory Planning Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 11 DSL після завершення Stage 10 і зафіксувати цей план у
Project Memory та окремих implementation tasks.

## Product Context

Stage 10 завершив module graph cycle detection: composer graph now exposes dependency
edges, detects module cycles and keeps validation/inspection side-effect free.

Stage 11 має додати optional ergonomic DSL поверх уже реалізованого explicit
object-configuration API. DSL не має створювати нову приховану модель композиції: він
конвертує declarations у наявні `defineModule()`, `createComposer()`, `composer.use()`,
`composer.bind()`, validation, graph inspection and composed runtime behavior.

## Scope

- Перевести Project Memory із завершеного Stage 10 до planning review для Stage 11.
- Розбити Stage 11 на невеликі implementation tasks:
  - module DSL foundation;
  - `defineApp()` DSL and object-config conversion;
  - bind helper DSL and `adapt()`;
  - DSL hardening, exports and docs sync.
- Зафіксувати Stage 11 DSL model:
  - DSL is optional;
  - object-configuration API remains fully usable;
  - DSL declarations must convert to explicit module/composer configuration;
  - graph remains visible through existing inspection APIs.
- Зафіксувати Stage 11 guardrails:
  - no decorators or `reflect-metadata`;
  - no filesystem auto-discovery;
  - no global app/container registry;
  - no hidden dependency inference by executing factories during validation;
  - no testing helpers or Next.js adapters.
- Створити backlog implementation tasks for Stage 11.
- Підготувати `RUN-001` requirements/context/result placeholders для кожної implementation
  task.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/glossary.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 11 у codebase під час planning task.
- Змінювати `packages/ioc/src/*`, tests або package exports під час planning task.
- Реалізовувати `@sagifire/ioc-testing` helpers, fake modules, module harnesses or graph
  assertions; це Stage 12.
- Реалізовувати Next.js adapters; це Stage 13.
- Додавати decorators, `reflect-metadata`, constructor metadata, filesystem discovery,
  service locator або global mutable container/app registry.
- Міняти container/composer runtime semantics поза тим, що прямо потрібно для DSL
  conversion.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 10 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 11 planning focus і не просуває project до Stage 12.
- [x] Stage 11 decomposed into small implementation tasks.
- [x] Stage 11 implementation tasks створені як backlog-задачі.
- [x] Кожна Stage 11 implementation task має `RUN-001` requirements/context/result
  placeholders.
- [x] DSL model зафіксований як optional layer over explicit object configuration.
- [x] Object API preservation requirements зафіксовані.
- [x] DSL-to-object-config / composer conversion requirements зафіксовані.
- [x] Graph visibility and no-hidden-magic guardrails зафіксовані.
- [x] Stage 11 guardrails явно забороняють Stage 12+ behavior.
- [x] Type-level and runtime test approach for Stage 11 зафіксований.
- [x] `state.md`, `progress.md` і релевантні `index.md` оновлені.
- [x] Planning task виконала self-review і переведена в `review`, а не `done`.
- [x] Task-level human review approval отримано перед переведенням у `done`.

## Linked Memory

- `memory/state.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0029-stage-11-module-dsl-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/task.md`
- `memory/tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/task.md`
- `memory/tasks/plan/TASK-07.01-0032-stage-11-dsl-hardening-docs/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 11 implementation plan і створити implementation tasks.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після approval цієї planning task є запуск
`TASK-07.01-0029-stage-11-module-dsl-foundation` як autonomous implementation task.

Implementation tasks `TASK-07.01-0030`, `TASK-07.01-0031` і `TASK-07.01-0032` мають
стартувати послідовно після завершення попередньої Stage 11 task, якщо human review не
змінить порядок.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-01
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
