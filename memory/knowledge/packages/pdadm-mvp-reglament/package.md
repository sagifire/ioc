# Knowledge Package: PDADM MVP Reglament

Status: draft
Version: 3.0
Scope: process
Reusable: true
Reglament Status: Draft

## Purpose

Надати агентам операційний регламент PDADM MVP 0.3 для роботи з Project Memory, задачами, knowledge packages і міграцією пам'яті між версіями.

Цей package є робочим шаром знань для агентів. Повний текст регламенту є reference layer, а не обов'язковий startup layer.

## When to Use

Використовувати цей пакет, коли потрібно:

- уточнити правила PDADM MVP 0.3;
- виконати або перевірити `memory-migration`;
- оновити Starter Kit;
- створити або змінити workflow, шаблони чи правила пам'яті;
- розібрати конфлікт або неясність між правилами;
- підготувати агенту інструкцію міграції з MVP 0.2 на MVP 0.3 або з попередньої підтримуваної версії.

## When Not to Use

- На старті звичайної сесії без явної потреби. Для старту читати `memory/agent-start.md`.
- Коли достатньо project-specific правил з `memory/memory-rules.md` або `memory/agents/rules.md`.
- Коли задача стосується конкретного продуктового рішення з `product/`.
- Коли задача стосується фактичного доменного стану з `domain/current/`.
- Коли користувач просить виконати конкретну задачу і task/run/fixation context уже достатній.

## Core Ideas

- Project Memory є центральним джерелом істини.
- Агент починає з `memory/agent-start.md`, boot packet і stop rule.
- Кожна задача має `Type` і task-level `Execution Mode`.
- Режим роботи сесії агент визначає динамічно за задачею, контекстом і правилами, а не через окремий `Mode` у стартовому prompt.
- `autonomous-implementation` використовує `RUN-*`, `requirements.md`, `context.md`, `result.md`.
- `autonomous-research` використовує `research/RSCH-*.md` і, якщо потрібно, `fixations/FIX-*.md` як memory proposal.
- `interactive-memory-update` використовує `worklog.md` і `fixations/FIX-*.md`.
- Неархівні задачі живуть у `memory/tasks/plan/`, а `memory/tasks/plan/progress.md` є операційним індексом.
- Domain Memory масштабується через `domain/current/` і `domain/target/`.
- Knowledge packages є шаром повторного використання знань.
- Wiki indexes підтримують навігацію в пам'яті через списки з wiki-посиланнями.

## Core Rules

- Не починати роботу без явної Agent Role.
- Не читати повний регламент на старті звичайної сесії без причини.
- Не починати `autonomous-implementation` без task folder і task run.
- Не запускати autonomous task run без `requirements.md` і `context.md`.
- Не завершувати research-задачу без `research/RSCH-*.md`.
- Не змінювати Project Memory у `interactive-memory-update` без `fixations/FIX-*.md` і self-review.
- Не подавати memory fixation або research result як review-ready без upward consistency check для документів загального рівня.
- Не переводити задачу в `done` без task-level human review approval зі статусу `review`.
- Не змішувати current і target state.
- Після autonomous run фіксувати memory sync у `result.md`.
- Після autonomous research фіксувати research result у `RSCH-*`.
- Після interactive або research-driven fixation фіксувати memory sync у `FIX-*.md`.
- Перед задачами зі спеціальними знаннями перевіряти `memory/knowledge/package-index.md`.
- При зміні структури пам'яті оновлювати відповідні `index.md`.

## Recommended Reading

- `mvp_one_to_one_0.3.md`
- `migrations/from-0.2-to-0.3.md`
- `migrations/from-0.1-to-0.3.md`, якщо проект мігрує з MVP 0.1
- `migrations/from-0.1-to-0.2.md` тільки як історичний або chain-only reference, не як фінальний target для Starter Kit 3.0

## Related Task Types

- docs
- knowledge
- memory-update
- memory-migration
- research
- chore
- refactor

## Related Packages

- Немає.
