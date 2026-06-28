# TASK-06.26-0005: Stage 3 implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-06-28
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Спланувати реалізацію Stage 3 tokens після завершення Stage 2 і зафіксувати цей план у
Project Memory та окремій implementation task.

## Product Context

Stage 3 вводить першу runtime API surface core-пакета `@sagifire/ioc`: typed tokens,
namespace helper і token ID validation. Tokens є базовим identity mechanism для майбутніх
container, composer, capabilities, required ports і multi-provider stages, тому цей етап
має залишатися вузьким і не починати container або diagnostics architecture раніше їхніх
roadmap stages.

## Scope

- Перевести roadmap/state з завершеного Stage 2 до планування Stage 3.
- Уточнити Stage 3 scope, guardrails, acceptance criteria і testing strategy.
- Зафіксувати Stage 3 type-level test approach: Vitest `expectTypeOf` для token inference.
- Визначити допустимий мінімальний token validation behavior без повного diagnostics layer.
- Створити backlog implementation task для Stage 3 tokens.
- Підготувати `RUN-001` requirements/context/result placeholders для майбутнього
  autonomous implementation run.
- Оновити `memory/state.md`, `memory/product/roadmap.md`,
  `memory/technical/stack.md`, `memory/technical/rules.md`,
  `memory/technical/testing.md`, `memory/tasks/plan/progress.md` і релевантні `index.md`.
- Зафіксувати зміни через `FIX-001`.

## Out of Scope

- Реалізовувати tokens у codebase.
- Змінювати `packages/ioc/src/tokens.ts` або package exports під час planning task.
- Реалізовувати container, providers, lifetimes, scopes, async model або resources.
- Реалізовувати composer, modules, capabilities, required ports, bindings або DSL.
- Реалізовувати Next.js adapters або testing helpers.
- Реалізовувати повний diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Stage 2 у загальній пам'яті відображений як завершений після human review.
- [x] Roadmap має актуальний Stage 3 focus і не просуває проект до Stage 4.
- [x] Stage 3 implementation task створена як backlog-задача.
- [x] Stage 3 implementation task має `RUN-001` requirements/context/result placeholders.
- [x] Stage 3 guardrails явно забороняють container/composer/DSL/adapters behavior.
- [x] Token ID validation plan не підміняє повний diagnostics layer Stage 8.
- [x] Type-level test approach для Stage 3 зафіксований.
- [x] `state.md`, `progress.md` і релевантні `index.md` оновлені.
- [x] Planning task виконала self-review і переведена в `review`, а не `done`.
- [x] Task-level human review approval отримано перед переведенням у `done`.

## Linked Memory

- `memory/state.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.26-0006-stage-3-tokens/task.md`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати Stage 3 implementation plan і створити implementation task.
  - Result: approved by human review

## Additional Context

Наступним операційним кроком після review approval має бути запуск
`TASK-06.26-0006-stage-3-tokens` як autonomous implementation task.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-28
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю поточної задачі, зауважень немає, можеш її завершувати."

## Closure

Задача завершена після task-level human review approval.
