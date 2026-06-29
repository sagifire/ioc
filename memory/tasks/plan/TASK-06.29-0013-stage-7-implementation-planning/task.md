# TASK-06.29-0013: Stage 7 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 7 async providers and resources після завершення Stage 6 і
зафіксувати цей план у Project Memory та окремій implementation task.

## Product Context

Stage 7 додає explicit async resolution і lifecycle-managed resources до вже реалізованого
sync container, multi-provider and scope foundation. Цей етап має підтримати async eager
providers/resources, async lazy providers/resources, `runtime.getAsync()`,
`runtime.tryGetAsync()`, `scope.getAsync()`, runtime disposal і scoped resource disposal.

Stage 7 не має зламати ключову гарантію продукту: `get()` лишається синхронним і ніколи
не повертає `Promise`. Async lazy values доступні тільки через explicit async API.

## Scope

- Перевести roadmap/state із завершеного Stage 6 до planning review для Stage 7.
- Уточнити Stage 7 scope, public API decisions, guardrails, acceptance criteria and
  testing strategy.
- Зафіксувати, що Stage 7 реалізація йде однією implementation task, бо async provider
  access, initialization mode, resource ownership, disposal and disposed-runtime/scope
  guards мають спільну lifecycle model.
- Зафіксувати planned public API baseline:
  - `bind(token).toAsyncFactory(factory)`;
  - `bind(token).toAsyncResource(factory)`;
  - async binding lifecycle helpers for `singleton()`, `transient()`, `scoped()`,
    `eager()` and `lazy()` where the combination is valid;
  - `runtime.getAsync(token)`;
  - `runtime.tryGetAsync(token)`;
  - `runtime.dispose()`;
  - `scope.getAsync(token)`;
  - `ResolutionContext.getAsync(token)` and `ResolutionContext.tryGetAsync(token)`;
  - `Resource<TValue>` or equivalent public resource contract;
  - minimal typed errors: `AsyncProviderAccessError`, `RuntimeDisposedError` and
    `ScopeDisposedError`.
- Зафіксувати single-provider async scope for Stage 7:
  - Stage 7 adds async single-provider bindings through `bind()`;
  - Stage 7 does not add async multi-provider contributions through `add()`;
  - Stage 7 does not add `getAllAsync()` / `scope.getAllAsync()`.
- Зафіксувати lifecycle decisions:
  - `toAsyncFactory()` defaults to transient lazy provider;
  - async factory providers may be `transient`, `singleton` or `scoped`;
  - eager async factory initialization is valid only for singleton providers;
  - `toAsyncResource()` requires explicit `singleton()` or `scoped()` ownership;
  - async resources default to lazy initialization unless `eager()` is explicitly chosen;
  - eager async resources are valid only for singleton resources and initialize during
    `freeze()`;
  - scoped async providers/resources initialize lazily through `scope.getAsync()`;
  - runtime-level resolution of scoped async providers remains invalid without active
    scope.
- Зафіксувати access decisions:
  - sync providers are valid through `getAsync()` / `tryGetAsync()` as resolved Promises;
  - async eager singleton providers/resources are available through `get()` after
    `freeze()`;
  - async lazy providers/resources are available only through `getAsync()`;
  - `get()` / `tryGet()` on async lazy provider/resource throws `AsyncProviderAccessError`;
  - failed lazy async initialization is not cached by default;
  - in-flight singleton/scoped lazy initialization is de-duplicated until it resolves or
    rejects.
- Зафіксувати disposal decisions:
  - `runtime.dispose()` disposes initialized singleton resources in reverse initialization
    order where possible;
  - `scope.dispose()` disposes initialized scoped resources in reverse initialization
    order where possible;
  - disposal is idempotent;
  - after runtime disposal, runtime resolution and scope creation fail with
    `RuntimeDisposedError`;
  - after scope disposal, scope resolution fails with `ScopeDisposedError`;
  - runtime disposal does not silently own or dispose live scopes; scopes remain explicit
    lifecycle boundaries and must be disposed by `scope.dispose()` / `withScope()`.
- Створити backlog implementation task для Stage 7 async providers/resources.
- Підготувати `RUN-001` requirements/context/result placeholders для майбутнього
  autonomous implementation run.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/technical/architecture.md`, `memory/technical/stack.md`,
  `memory/technical/rules.md`, `memory/technical/testing.md`,
  `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 7 у codebase під час planning task.
- Змінювати `packages/ioc/src/*` або package exports під час planning task.
- Реалізовувати async multi-provider contributions або `getAllAsync()` APIs.
- Реалізовувати `cacheFailure()` для failed lazy async initialization.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL, Next.js adapters або testing helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Додавати global mutable container, global provider registry або runtime-owned global
  scope registry.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 6 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 7 planning focus і не просуває проект до Stage 8.
- [x] Stage 7 implementation task створена як backlog-задача.
- [x] Stage 7 implementation task має `RUN-001` requirements/context/result placeholders.
- [x] Stage 7 guardrails явно забороняють composer/DSL/adapters/diagnostics behavior.
- [x] Async lazy/eager access model зафіксований без порушення sync `get()` contract.
- [x] Runtime and scope disposal ownership model зафіксований.
- [x] `toAsyncFactory()` lifetime/mode decisions зафіксовані.
- [x] `toAsyncResource()` ownership/mode decisions зафіксовані.
- [x] Failed lazy initialization retry behavior зафіксований.
- [x] Stage 7 decision щодо відсутності async multi-provider / `getAllAsync()` зафіксований.
- [x] Minimal async/disposal error approach не підміняє diagnostics Stage 8.
- [x] Type-level test approach для Stage 7 зафіксований.
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
- `memory/tasks/plan/TASK-06.29-0014-stage-7-async-providers-resources/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 7 implementation plan і створити implementation task.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після human review цієї planning task має бути запуск
`TASK-06.29-0014-stage-7-async-providers-resources` як autonomous implementation task.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-29
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу"

## Closure

Задача завершена після task-level human review approval.
