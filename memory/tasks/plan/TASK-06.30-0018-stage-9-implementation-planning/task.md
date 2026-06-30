# TASK-06.30-0018: Stage 9 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 9 composer and modules після завершення Stage 8 diagnostics і
зафіксувати цей план у Project Memory та окремих implementation tasks.

## Product Context

Stage 9 є першим етапом module composition layer у core package `@sagifire/ioc`.

До Stage 9 вже реалізовано typed tokens, sync/async container providers, scopes,
resources/disposal and diagnostics foundation/report formatting. Composer має будуватися
поверх container/context без зворотної залежності: container не знає про modules, а
composer використовує container для побудови application graph.

Stage 9 має дати explicit object-configuration API для modules and composer, validation
для duplicate/missing/binding проблем, private module provider isolation, composed runtime
with exported capabilities and safe inspection. Stage 10 лишається окремим етапом для
module-level cycle detection and dependency-edge analysis.

## Scope

- Перевести Project Memory із завершеного Stage 8 до planning review для Stage 9.
- Розбити Stage 9 на невеликі implementation tasks:
  - module definition foundation;
  - composer builder, bindings and static validation;
  - module setup context and private providers;
  - composed runtime and capability registry;
  - inspection API.
- Зафіксувати Stage 9 public API baseline:
  - `defineModule()`;
  - `ModuleDefinition`;
  - `ModuleDependencyDefinition`;
  - `ModuleCapabilityDefinition`;
  - `ModuleSetupFunction`;
  - `ModuleSetupContext`;
  - `ModuleSetupResult`;
  - `createComposer()`;
  - `Composer`;
  - `composer.use()`;
  - `composer.bind()`;
  - `composer.validate()`;
  - `composer.compose()`;
  - `composer.inspect()`;
  - `composer.getGraph()`;
  - `runtime.inspect()` for composed runtimes.
- Зафіксувати isolation model:
  - module setup may register private providers;
  - module setup and module provider factories resolve only their own private providers,
    declared required ports and public/exported capabilities allowed by composition;
  - composed runtime exposes only declared exported capabilities;
  - composition bindings satisfy required ports but are not automatically public runtime
    capabilities.
- Зафіксувати validation model:
  - module IDs must be unique;
  - provided single tokens must be unique;
  - required ports must be satisfied by declared provided capabilities or explicit
    composer bindings;
  - bindings must target required ports or otherwise be rejected as invalid;
  - `composer.validate()` returns a `DiagnosticReport`;
  - `composer.compose()` validates and throws typed diagnostics error on invalid graph.
- Зафіксувати Stage 9 typed error baseline:
  - `InvalidModuleDefinitionError`;
  - `DuplicateModuleIdError`;
  - `DuplicateModuleCapabilityError`;
  - `MissingRequiredPortError`;
  - `InvalidComposerBindingError`;
  - `ComposerValidationError`;
  - `PrivateProviderAccessError` or equivalent boundary error if implementation needs it.
- Створити backlog implementation tasks for Stage 9.
- Підготувати `RUN-001` requirements/context/result placeholders для кожної implementation
  task.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/glossary.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 9 у codebase під час planning task.
- Змінювати `packages/ioc/src/*` або package exports під час planning task.
- Реалізовувати module-level cycle detection, capability dependency edge detection,
  binding dependency edge detection or cycle paths; це Stage 10.
- Реалізовувати DSL helpers `module()`, `defineApp()`, `adapt()` або DSL-to-object-config
  conversion; це Stage 11.
- Реалізовувати `@sagifire/ioc-testing` helpers, fake modules, module harnesses or graph
  assertions; це Stage 12.
- Реалізовувати Next.js adapters; це Stage 13.
- Додавати filesystem auto-discovery, decorators, `reflect-metadata`, global mutable
  container/service locator, Node-only APIs, Next.js or React into core.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 8 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 9 planning focus і не просуває project до Stage 10.
- [x] Stage 9 decomposed into small implementation tasks.
- [x] Stage 9 implementation tasks створені як backlog-задачі.
- [x] Кожна Stage 9 implementation task має `RUN-001` requirements/context/result
  placeholders.
- [x] Stage 9 public API baseline зафіксований.
- [x] Module isolation model зафіксований.
- [x] Composition binding visibility decision зафіксований.
- [x] Validation and diagnostics scope зафіксований.
- [x] Stage 9 guardrails явно забороняють Stage 10 cycle detection behavior.
- [x] Type-level and runtime test approach for Stage 9 зафіксований.
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
- `memory/tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/task.md`
- `memory/tasks/plan/TASK-06.30-0020-stage-9-composer-builder-bindings-validation/task.md`
- `memory/tasks/plan/TASK-06.30-0021-stage-9-module-setup-private-providers/task.md`
- `memory/tasks/plan/TASK-06.30-0022-stage-9-composed-runtime-capabilities/task.md`
- `memory/tasks/plan/TASK-06.30-0023-stage-9-inspection-api/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 9 implementation plan і створити implementation tasks.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком є запуск
`TASK-06.30-0019-stage-9-module-definition-foundation` як autonomous implementation task.

Implementation tasks `TASK-06.30-0020` through `TASK-06.30-0023` мають стартувати
послідовно після завершення попередньої Stage 9 task, якщо human review не змінить порядок.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-30
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу"

## Closure

Задача завершена після task-level human review approval.
