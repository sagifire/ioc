# TASK-06.29-0011: Stage 6 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 6 scopes після завершення Stage 5 і зафіксувати цей план у
Project Memory та окремій implementation task.

## Product Context

Stage 6 додає request/operation/task-local scopes поверх вже реалізованого sync
container foundation. Scope має давати явну boundary API для per-scope values,
scoped lifetime і deterministic disposal, але не має перетворювати runtime на mutable
service locator або приховано запускати async resolution.

Stage 6 має зберегти Stage 5 guarantees: immutable runtime після `freeze()`, sync
`get()` / `tryGet()` / `getAll()`, strict single/multi-provider model, provider cycle
detection, token ID як canonical identity і відсутність async providers/resources,
composer, DSL, adapters або full diagnostics layer.

## Scope

- Перевести roadmap/state із завершеного Stage 5 до планування Stage 6.
- Уточнити Stage 6 scope, public API decisions, guardrails, acceptance criteria і testing
  strategy.
- Зафіксувати, що Stage 6 реалізація йде однією implementation task, бо `Scope`,
  scoped lifetime, scope-local values і `withScope()` мають спільну resolution model.
- Зафіксувати planned public API baseline:
  - `runtime.createScope(options?)`;
  - `runtime.withScope(callback)` і `runtime.withScope(options, callback)`;
  - `Scope.get()`, `Scope.tryGet()`, `Scope.getAll()` і `Scope.dispose()`;
  - `CreateScopeOptions` або еквівалент для scope-local single values і multi values;
  - `.scoped()` lifetime modifier для sync factory/class providers і multi-provider
    factory contributions;
  - minimal scope-specific typed errors, насамперед `InvalidScopeError` або equivalent.
- Закрити Stage 6 open question про scope-local precedence:
  - scope-local single values override runtime single-provider resolution for the same
    token ID inside that scope;
  - scope-local multi values extend runtime multi-provider collections in
    runtime-first, scope-local-after order;
  - single/multi kind conflicts fail instead of silently converting token kind;
  - duplicate scope-local single values fail;
  - multiple scope-local multi values are allowed and preserve declaration order.
- Зафіксувати, що scope-local values задаються під час `createScope()` / `withScope()` і
  не мутуються через public scope API після створення scope.
- Зафіксувати, що `scope.dispose()` є idempotent і після disposal будь-яка sync scope
  resolution fails with readable typed error.
- Зафіксувати, що Stage 6 не додає `scope.getAsync()`, `runtime.getAsync()`,
  `runtime.dispose()` або resource disposal; це лишається Stage 7.
- Створити backlog implementation task для Stage 6 scopes.
- Підготувати `RUN-001` requirements/context/result placeholders для майбутнього
  autonomous implementation run.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/open-questions.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати scopes у codebase під час planning task.
- Змінювати `packages/ioc/src/container.ts`, `packages/ioc/src/context.ts` або package
  exports під час planning task.
- Реалізовувати async providers, async resources, `getAsync()`, `tryGetAsync()`,
  async lazy/eager behavior або runtime resource disposal.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL, Next.js adapters або testing helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Додавати mutable scope registration API після створення scope.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 5 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 6 focus і не просуває проект до Stage 7.
- [x] Stage 6 implementation task створена як backlog-задача.
- [x] Stage 6 implementation task має `RUN-001` requirements/context/result placeholders.
- [x] Stage 6 guardrails явно забороняють async/composer/DSL/adapters behavior.
- [x] Scope-local precedence decision зафіксований і Stage 6 open question закрито.
- [x] Scoped lifetime scope зафіксований для sync factory/class providers і
  multi-provider factory contributions.
- [x] `Scope` sync API baseline зафіксований без `getAsync()`.
- [x] `withScope()` disposal semantics зафіксовані.
- [x] Minimal scope-specific error approach не підміняє diagnostics Stage 8.
- [x] Type-level test approach для Stage 6 зафіксований.
- [x] `state.md`, `progress.md` і релевантні `index.md` оновлені.
- [x] Planning task виконала self-review і переведена в `review`, а не `done`.
- [x] Task-level human review approval отримано перед переведенням у `done`.

## Linked Memory

- `memory/state.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/domain/open-questions.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0012-stage-6-scopes/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 6 implementation plan і створити implementation task.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком має бути запуск
`TASK-06.29-0012-stage-6-scopes` як autonomous implementation task.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-29
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, все добре, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
