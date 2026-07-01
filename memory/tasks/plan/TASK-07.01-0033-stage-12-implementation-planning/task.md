# TASK-07.01-0033: Stage 12 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-01
Owner Role: Project Memory Planning Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 12 `@sagifire/ioc-testing` після завершення Stage 11 і
зафіксувати цей план у Project Memory та окремих implementation tasks.

## Product Context

Stage 11 завершив optional DSL layer: `module()`, `defineApp()`, bind helper declarations
and `adapt()` now work over existing object/composer semantics with inspection parity.

Stage 12 переносить фокус у package `@sagifire/ioc-testing`. Testing helpers мають
полегшити ізольоване тестування контейнерів, module composition, overrides, fake modules,
module harnesses and graph/diagnostic assertions. Вони не повинні змінювати core runtime,
мутувати frozen production runtime або приховувати dependency graph.

## Scope

- Перевести Project Memory із завершеного Stage 11 до planning review для Stage 12.
- Розбити Stage 12 на невеликі implementation tasks:
  - testing package foundation and isolated test runtime;
  - overrides and test composer;
  - module harness and fake modules;
  - graph and diagnostic assertions;
  - testing package hardening, exports and docs.
- Зафіксувати Stage 12 testing model:
  - helpers live in `@sagifire/ioc-testing`;
  - package may depend on `@sagifire/ioc`;
  - helpers create isolated configuration/runtime instances;
  - overrides apply before `freeze()` / `compose()`;
  - frozen production runtime is never mutated.
- Зафіксувати Stage 12 guardrails:
  - no monkey-patching of core runtime or private internals;
  - no hidden dependency discovery;
  - no Next.js adapters;
  - no decorators, `reflect-metadata` or filesystem auto-discovery.
- Створити backlog implementation tasks for Stage 12.
- Підготувати `RUN-001` requirements/context/result placeholders для кожної implementation
  task.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/glossary.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 12 у codebase під час planning task.
- Змінювати `packages/ioc-testing/src/*`, tests або package exports під час planning task.
- Змінювати `@sagifire/ioc` core API без окремої implementation task.
- Реалізовувати Next.js adapters; це Stage 13.
- Реалізовувати Stage 14 documentation/examples або Stage 15 release automation.
- Додавати decorators, `reflect-metadata`, constructor metadata, filesystem discovery,
  service locator або global mutable runtime registry.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 11 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 12 planning focus і не просуває project до Stage 13.
- [x] Stage 12 decomposed into small implementation tasks.
- [x] Stage 12 implementation tasks створені як backlog-задачі.
- [x] Кожна Stage 12 implementation task має `RUN-001` requirements/context/result
  placeholders.
- [x] Testing package isolation model зафіксований.
- [x] Override-before-compose/freeze model зафіксований.
- [x] Frozen runtime immutability guardrail зафіксований.
- [x] Module harness, fake module and graph assertion boundaries зафіксовані.
- [x] Stage 12 guardrails явно забороняють Stage 13+ behavior.
- [x] Type-level and runtime test approach for Stage 12 зафіксований.
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
- `memory/tasks/plan/TASK-07.01-0034-stage-12-testing-package-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/task.md`
- `memory/tasks/plan/TASK-07.01-0036-stage-12-module-harness-fake-modules/task.md`
- `memory/tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/task.md`
- `memory/tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 12 implementation plan і створити implementation tasks.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після approval цієї planning task є запуск
`TASK-07.01-0034-stage-12-testing-package-foundation` як autonomous implementation task.

Implementation tasks `TASK-07.01-0035` through `TASK-07.01-0038` мають стартувати
послідовно після завершення попередньої Stage 12 task, якщо human review не змінить
порядок.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-01
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю задачі, можеш завершувати."

## Closure

Задача завершена після task-level human review approval.
