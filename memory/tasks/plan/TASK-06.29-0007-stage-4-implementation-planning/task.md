# TASK-06.29-0007: Stage 4 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 4 container sync providers після завершення Stage 3 і
зафіксувати цей план у Project Memory та окремій implementation task.

## Product Context

Stage 4 відкриває перший container/runtime шар `@sagifire/ioc`: mutable configuration
container, immutable runtime після `freeze()`, single-provider sync bindings, singleton і
transient lifetimes, sync resolution через `get()` / `tryGet()`, duplicate token detection
і provider cycle detection.

Цей етап має використати Stage 3 token IDs як canonical runtime identity і не заходити в
multi-provider, scopes, async providers, resources, composer, DSL або full diagnostics
layer.

## Scope

- Перевести roadmap/state із завершеного Stage 3 до планування Stage 4.
- Уточнити Stage 4 scope, public API decisions, guardrails, acceptance criteria і testing
  strategy.
- Зафіксувати, що `freeze()` лишається async-compatible API (`Promise<ContainerRuntime>`)
  навіть для sync-only Stage 4.
- Зафіксувати default lifetimes: `toValue` - singleton, `toFactory` і `toClass` -
  transient by default.
- Зафіксувати Stage 4 `toClass()` semantics без decorators/reflect-metadata:
  no-argument constructor only; constructor dependencies мають явно створюватися через
  `toFactory()`.
- Визначити допустимі мінімальні container-specific typed errors без повного diagnostics
  layer Stage 8.
- Створити backlog implementation task для Stage 4 container sync providers.
- Підготувати `RUN-001` requirements/context/result placeholders для майбутнього
  autonomous implementation run.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/technical/architecture.md`, `memory/technical/stack.md`,
  `memory/technical/rules.md`, `memory/technical/testing.md`,
  `memory/domain/open-questions.md`, `memory/tasks/plan/progress.md` і релевантні
  `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати container у codebase.
- Змінювати `packages/ioc/src/container.ts` або package exports під час planning task.
- Реалізовувати multi-provider `add()` / `getAll()`.
- Реалізовувати scopes, scoped lifetime, scope-local values або disposal.
- Реалізовувати async providers, async resources, `getAsync()` або `tryGetAsync()`.
- Реалізовувати composer, modules, capabilities, required ports, bindings або DSL.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Змінювати `@sagifire/ioc-next` або `@sagifire/ioc-testing`.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 3 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 4 focus і не просуває проект до Stage 5.
- [x] Stage 4 implementation task створена як backlog-задача.
- [x] Stage 4 implementation task має `RUN-001` requirements/context/result placeholders.
- [x] Stage 4 guardrails явно забороняють multi-provider/scopes/async/composer/DSL/adapters
  behavior.
- [x] `freeze()` async-compatible API decision зафіксований.
- [x] Default lifetimes для Stage 4 зафіксовані.
- [x] `toClass()` no-magic semantics зафіксована.
- [x] Minimal container-specific error approach не підміняє diagnostics Stage 8.
- [x] Type-level test approach для Stage 4 зафіксований.
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
- `memory/tasks/plan/TASK-06.29-0008-stage-4-container-sync-providers/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 4 implementation plan і створити implementation task.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком має бути запуск
`TASK-06.29-0008-stage-4-container-sync-providers` як autonomous implementation task.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-29
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, все добре, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
