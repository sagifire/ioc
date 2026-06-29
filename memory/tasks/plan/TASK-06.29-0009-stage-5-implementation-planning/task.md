# TASK-06.29-0009: Stage 5 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 5 multi-provider після завершення Stage 4 і зафіксувати цей
план у Project Memory та окремій implementation task.

## Product Context

Stage 5 розширює Stage 4 sync container foundation підтримкою multi-provider tokens:
декілька provider registrations для одного token через `add()`, resolution усієї
колекції через `getAll()` і явна валідація межі між single-provider та multi-provider
tokens.

Цей етап має зберегти Stage 4 guarantees: immutable runtime після `freeze()`, sync
`get()`, token ID як canonical provider identity, provider cycle detection і відсутність
scopes, async providers/resources, composer, DSL, adapters або full diagnostics layer.

## Scope

- Перевести roadmap/state із завершеного Stage 4 до планування Stage 5.
- Уточнити Stage 5 scope, public API decisions, guardrails, acceptance criteria і testing
  strategy.
- Зафіксувати strict single/multi-provider model:
  - `bind(token)` лишається тільки для single-provider tokens;
  - `add(token)` використовується тільки для multi-provider tokens;
  - `get(token)` fails для multi-provider token;
  - `getAll(token)` targets multi-provider collections і fails для token, зареєстрованого
    через `bind()`;
  - `getAll(token)` повертає empty array для повністю missing token.
- Зафіксувати `getAll()` return-shape decision: public API лишається `TValue[]`, але
  runtime повертає fresh array у registration order, щоб mutation result array не мутував
  runtime state.
- Зафіксувати, що `ResolutionContext` у Stage 5 отримує sync `getAll()`.
- Зафіксувати lifetime semantics для multi-provider factory providers:
  `add().toValue()` singleton, `add().toFactory()` transient by default із
  `.singleton()` / `.transient()`.
- Визначити допустимі мінімальні multi-provider-specific typed errors без повного
  diagnostics layer Stage 8.
- Створити backlog implementation task для Stage 5 multi-provider.
- Підготувати `RUN-001` requirements/context/result placeholders для майбутнього
  autonomous implementation run.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/domain/open-questions.md`, `memory/technical/architecture.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати multi-provider у codebase під час planning task.
- Змінювати `packages/ioc/src/container.ts` або package exports під час planning task.
- Реалізовувати `add().toClass()` без окремого Stage 5 decision у implementation task.
- Реалізовувати scopes, scoped lifetime, scope-local values або disposal.
- Реалізовувати async providers, async resources, `getAsync()` або `tryGetAsync()`.
- Реалізовувати composer, modules, capabilities, required ports, bindings або graph
  inspection.
- Реалізовувати DSL, Next.js adapters або testing helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 4 у загальній пам'яті відображений як завершений після human confirmation.
- [x] Roadmap має актуальний Stage 5 focus і не просуває проект до Stage 6.
- [x] Stage 5 implementation task створена як backlog-задача.
- [x] Stage 5 implementation task має `RUN-001` requirements/context/result placeholders.
- [x] Stage 5 guardrails явно забороняють scopes/async/composer/DSL/adapters behavior.
- [x] Strict single/multi-provider validation model зафіксований.
- [x] `getAll()` return-shape decision зафіксований.
- [x] `ResolutionContext.getAll()` scope зафіксований.
- [x] Multi-provider lifetime semantics зафіксовані.
- [x] Minimal multi-provider-specific error approach не підміняє diagnostics Stage 8.
- [x] Type-level test approach для Stage 5 зафіксований.
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
- `memory/tasks/plan/TASK-06.29-0010-stage-5-multi-provider/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 5 implementation plan і створити implementation task.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком має бути запуск
`TASK-06.29-0010-stage-5-multi-provider` як autonomous implementation task.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-29
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, все добре, можеш завершувати задачу."

## Closure

Задача завершена після task-level human review approval.
