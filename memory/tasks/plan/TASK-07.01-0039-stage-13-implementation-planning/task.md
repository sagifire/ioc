# TASK-07.01-0039: Stage 13 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-01
Owner Role: Project Memory Planning Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 13 `@sagifire/ioc-next` після завершення Stage 12 і
зафіксувати цей план у Project Memory та окремих implementation tasks.

## Product Context

Stage 12 завершив `@sagifire/ioc-testing`: isolated test runtimes, overrides, test
composer, fake modules, module harnesses and graph/diagnostic assertions are implemented in
the testing package without mutating frozen runtime.

Stage 13 переносить фокус у `@sagifire/ioc-next`. Next adapter має інтегрувати composed
runtime and request/operation scopes at Next.js App Router boundaries while keeping
`@sagifire/ioc` core framework-agnostic.

## Scope

- Перевести Project Memory із завершеного Stage 12 до planning review для Stage 13.
- Розбити Stage 13 на невеликі implementation tasks:
  - Next package foundation and cached runtime helper;
  - request context helper and request-scoped values;
  - route handler scope helper;
  - server action scope helper;
  - Next examples, hardening, exports and docs.
- Зафіксувати Stage 13 Next adapter model:
  - helpers live in `@sagifire/ioc-next`;
  - package may depend on `@sagifire/ioc`;
  - Next.js and React dependencies stay outside `@sagifire/ioc` core;
  - runtime creation is cached safely at framework boundary;
  - request/action/route helpers create scopes and dispose them after handler execution;
  - request context is explicit scope-local data, not a global service locator.
- Зафіксувати Stage 13 guardrails:
  - no imports from Next.js or React in `@sagifire/ioc`;
  - no mutation of frozen `ContainerRuntime` or `ComposedRuntime`;
  - no hidden global mutable container in adapter package;
  - no filesystem auto-discovery, route scanning or magic module discovery;
  - no business logic in route/action/page examples.
- Створити backlog implementation tasks for Stage 13.
- Підготувати `RUN-001` requirements/context/result placeholders для кожної implementation
  task.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/glossary.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 13 у codebase під час planning task.
- Змінювати `packages/ioc-next/src/*`, tests або package exports під час planning task.
- Змінювати `@sagifire/ioc` core API без окремої implementation task.
- Змінювати `@sagifire/ioc-testing` helper surface.
- Реалізовувати Stage 14 documentation/examples beyond minimal Stage 13 adapter examples.
- Реалізовувати Stage 15 release automation.
- Додавати decorators, `reflect-metadata`, constructor metadata, filesystem discovery,
  service locator або core global mutable runtime registry.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 12 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 13 planning focus і не просуває project до Stage 14.
- [x] Stage 13 decomposed into small implementation tasks.
- [x] Stage 13 implementation tasks створені як backlog-задачі.
- [x] Кожна Stage 13 implementation task має `RUN-001` requirements/context/result
  placeholders.
- [x] Next adapter package boundary зафіксований.
- [x] Runtime cache helper model зафіксований.
- [x] Request/route/action scope disposal model зафіксований.
- [x] Stage 13 guardrails явно забороняють core Next.js/React imports and hidden discovery.
- [x] Type-level and runtime test approach for Stage 13 зафіксований.
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
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/task.md`
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/task.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/task.md`
- `memory/tasks/plan/TASK-07.01-0043-stage-13-server-action-scope/task.md`
- `memory/tasks/plan/TASK-07.01-0044-stage-13-next-examples-hardening-docs/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 13 implementation plan і створити implementation tasks.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після approval цієї planning task є запуск
`TASK-07.01-0040-stage-13-next-runtime-foundation` як autonomous implementation task.

Implementation tasks `TASK-07.01-0041` through `TASK-07.01-0044` мають стартувати
послідовно після завершення попередньої Stage 13 task, якщо human review не змінить
порядок.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-01
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
