# TASK-06.26-0002: Project Memory bootstrap

Status: done
Type: memory-migration
Execution Mode: interactive-memory-update
Created: 2026-06-28
Owner Role: Product Lead Hat
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Goal

Перенести ключові project governance і specification документи в канонічну Project Memory
перед початком реалізації коду.

## Product Context

`@sagifire/ioc` має складну staged-специфікацію, package boundaries і набір непорушних
архітектурних правил. Project Memory має стати операційним джерелом правди для агентів і
людини, щоб кожний наступний етап реалізації перевірявся проти однакових правил.

## Scope

- Перенести з `AGENTS.md` у Project Memory:
  - архітектурні межі;
  - непорушні правила реалізації;
  - стиль коду;
  - робочий процес.
- Перенести `SPEC.md` у Project Memory як структурований контекст:
  - мету проекту;
  - package boundaries;
  - архітектурну модель;
  - runtime/build/package requirements;
  - staged implementation plan;
  - acceptance criteria;
  - testing requirements;
  - definition of done.
- Запропонувати і застосувати цільову структуру пам'яті для `SPEC.md`: overview-файли,
  technical docs, roadmap і, якщо доречно, окремий knowledge package.
- Оновити всі релевантні `index.md`, `state.md` і `tasks/plan/progress.md`.
- Зафіксувати зміни через `FIX-001` у цій задачі.

## Out of Scope

- Створення або зміна `pnpm` workspace.
- Реалізація Stage 2 repository/build foundation.
- Реалізація tokens, container, composer, DSL або adapters.
- Зміна публічного API.
- Приховане скорочення `SPEC.md` без явного збереження trace до джерела.

## Acceptance Criteria

- [x] Архітектурні межі з `AGENTS.md` перенесені в відповідний technical memory файл.
- [x] Непорушні правила реалізації з `AGENTS.md` перенесені в Project Memory.
- [x] Стиль коду з `AGENTS.md` перенесений у Project Memory.
- [x] Робочий процес з `AGENTS.md` перенесений у Project Memory.
- [x] `SPEC.md` перенесений у Project Memory структурно, з trace до root source.
- [x] Roadmap після перенесення узгоджений зі staged implementation plan.
- [x] State, progress і всі релевантні `index.md` оновлені.
- [x] У межах Stage 1 не створено implementation code або package foundation.

## Linked Memory

- `AGENTS.md`
- `SPEC.md`
- `memory/sources/SPEC.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/domain/glossary.md`
- `memory/knowledge/package-index.md`

## Runs

Немає. Для цієї задачі використано `interactive-memory-update` із fixation package
`FIX-001`.

## Research

Немає.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Summary: Перенесення `AGENTS.md` і `SPEC.md` у canonical Project Memory.

## Additional Context

Після завершення цієї задачі наступним етапом має бути Stage 2 repository/build foundation,
що відповідає `SPEC.md` section 32. Stage 2 не повинен реалізовувати container logic.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-06-28
Approval Scope: whole-task-review
Approval Source: Користувач повідомив, що зробив ревю задачі, попросив оновити
`AGENTS.md`, перенести `SPEC.md` у Project Memory як історичний source reference і явно
погодив завершення задачі.

## Closure

Задача завершена після task-level human review approval. Review-requested changes виконані:

- `AGENTS.md` оновлено під Project Memory 3.0 / PDADM MVP 0.3.
- `SPEC.md` скопійовано в `memory/sources/SPEC.md` як historical immutable source snapshot.
- Правило незмінності historical source snapshots зафіксовано в `memory/memory-rules.md`,
  `memory/agents/rules.md`, `memory/technical/rules.md` і
  `memory/technical/specification-trace.md`.
