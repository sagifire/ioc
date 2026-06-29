# TASK-06.29-0015: Stage 8 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 8 diagnostics після завершення Stage 7 і зафіксувати цей
план у Project Memory та окремих implementation tasks.

## Product Context

Stage 8 має перетворити локальні typed errors, додані у Stages 3-7, на узгоджений
diagnostics layer: спільну базову помилку, stable error codes, structured details,
diagnostic reports і readable formatting for humans and Codex.

Stage 8 не має починати composer/module graph behavior. Graph-aware module diagnostics,
missing required ports, duplicate module IDs and module cycle reports починаються разом із
composer у Stage 9+.

## Scope

- Перевести roadmap/state із завершеного Stage 7 до planning review для Stage 8.
- Зафіксувати Stage 8 decomposition на дві implementation tasks:
  - diagnostics error foundation;
  - diagnostic reports and formatting.
- Зафіксувати error code naming convention:
  - public code strings use `SAGIFIRE_IOC_<AREA>_<REASON>`;
  - code strings are stable public diagnostics surface;
  - existing Stage 3-7 code strings are preserved unless a direct conflict is found.
- Зафіксувати Stage 8 public API baseline:
  - `SagifireIocError`;
  - `SagifireIocErrorOptions` or equivalent constructor options;
  - `isSagifireIocError(error)` or equivalent type guard;
  - existing public typed errors migrated to extend `SagifireIocError`;
  - `Diagnostic`;
  - `DiagnosticReport`;
  - `DiagnosticSeverity`;
  - `formatDiagnostics(report)`;
  - optional small conversion helper such as `diagnosticFromError(error)` if the
    implementation needs a stable bridge from typed errors to reports.
- Зафіксувати typed error migration scope for existing common failure modes:
  - `InvalidTokenIdError`;
  - `ProviderNotFoundError`;
  - `DuplicateProviderError`;
  - `ProviderKindMismatchError`;
  - `ProviderCycleError`;
  - `ContainerFrozenError`;
  - `AsyncProviderAccessError`;
  - `RuntimeDisposedError`;
  - `InvalidProviderLifecycleError`;
  - `InvalidScopeError`;
  - `ScopeDisposedError`;
  - `DuplicateScopeLocalValueError`.
- Зафіксувати report/formatter scope:
  - deterministic report shape;
  - readable multi-diagnostic output;
  - useful rendering of details such as token IDs, token paths, expected/actual provider
    kinds, actions and invalid lifecycle reasons;
  - no terminal color dependencies or Node-only formatting APIs.
- Створити backlog implementation tasks for Stage 8.
- Підготувати `RUN-001` requirements/context/result placeholders для кожної implementation
  task.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/open-questions.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати Stage 8 у codebase під час planning task.
- Змінювати `packages/ioc/src/*` або package exports під час planning task.
- Реалізовувати composer, modules, capabilities, required ports, bindings, module graph
  validation or inspection APIs.
- Реалізовувати composer/module-specific diagnostics such as duplicate module IDs, missing
  required ports or module dependency cycles before Stage 9.
- Реалізовувати DSL, Next.js adapters або testing helpers.
- Додавати terminal color dependencies, Node-only formatting APIs або framework-specific
  diagnostics behavior у core.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 7 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 8 planning focus і не просуває проект до Stage 9.
- [x] Stage 8 decomposed into small implementation tasks.
- [x] Stage 8 implementation tasks створені як backlog-задачі.
- [x] Кожна Stage 8 implementation task має `RUN-001` requirements/context/result
  placeholders.
- [x] Error code naming convention зафіксований.
- [x] Existing Stage 3-7 code preservation decision зафіксований.
- [x] `SagifireIocError` foundation scope зафіксований.
- [x] Existing typed error migration scope зафіксований.
- [x] `Diagnostic` / `DiagnosticReport` / `formatDiagnostics()` scope зафіксований.
- [x] Stage 8 guardrails явно забороняють composer/module graph diagnostics behavior.
- [x] Type-level and runtime test approach for Stage 8 зафіксований.
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
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/task.md`
- `memory/tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 8 implementation plan і створити implementation tasks.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після human review цієї planning task має бути запуск
`TASK-06.29-0016-stage-8-diagnostics-error-foundation` як autonomous implementation task.

`TASK-06.29-0017-stage-8-diagnostic-reports-formatting` має стартувати після завершення
error foundation task, щоб formatter спирався на стабільну модель typed errors.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-29
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
