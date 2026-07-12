# Контекст виконання: RUN-002

Related Task: [TASK-07.12-0092](../task.md)
Prepared: 2026-07-12
Prepared By: Agent Executor
Previous Run: [RUN-001](../runs/RUN-001/index.md)

## Мета run

Підготувати й перевірити exact fixation міграції, пройти independent audit, отримати human approval і виконати finalization до PDADM MVP 0.5 / Starter Kit 5.0.

## Ефективні вимоги

- Виконати direct migration guide `0.4 -> 0.5` без втрати project-specific content.
- Не змінювати frozen historical task artifacts.
- Застосовувати canonical memory changes тільки через approved `FIX-001`.
- Зберегти user-owned target knowledge package changes.
- Використати `.tmp/memory_mvp_0_5_ref/` лише як reference і selective merge source.

## Обсяг

- Operational/project rules separation, startup/navigation/version markers.
- Active task model, templates, reports/index links і project policy routes.
- Knowledge navigation sync і minimal technical link sync.
- Migration task artifacts, verification, audit і review lifecycle.

## Поза обсягом

- Code, runtime, API, package/release behavior.
- Переписування completed/canceled/archived task artifacts.
- Заміна project Product/Domain/Technical content StarterKit placeholders.
- Historical source snapshots і historical reports.

## Критерії приймання

- [ ] Усі пункти verification checklist direct migration guide пройдені.
- [ ] `FIX-001` exact, audited і застосований лише після human approval.
- [ ] Усі project-specific правила збережені або мають явне disposition.
- [ ] Backup/rollback лишається доступним і перевіреним.
- [ ] Незалежний audit findings закриті до Review Request.

## Заплановані результати

- Імплементація: controlled structural cutover під час finalization.
- Формальні дослідження: none.
- Memory fixation: `FIX-001` required.

## Обов'язковий контекст задачі

- `memory/knowledge/packages/pdadm-mvp-reglament/migration-from-0.4-to-0.5.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/mvp_one_to_one_0.5.md`
- `memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/task.md`
- `memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/FIX-001.md`

## Вхідні файли та модулі

- `memory/**/*.md`
- `AGENTS.md`
- `.tmp/memory_mvp_0.5.ua.zip`
- `.tmp/memory_mvp_0_5_ref/`
- `.tmp/memory-before-mvp-0.5-migration-2026-07-12.zip`

## Обмеження

- Не застосовувати proposal до approval.
- Не виконувати global replacement у frozen history.
- При конфлікті project content із StarterKit зберігати project content і фіксувати рішення.

## Перевірки

- Version markers, active legacy references, task/template structure, index coverage, broken relative links, folder indexes, git diff scope, language gate й architecture pressure.

## Ризики

- Structural delete може втратити rules без classification check.
- StarterKit selective merge може затерти project-specific overview/state content.
- Active-reference scan може помилково включити frozen history; exclusions мають бути явними.

## Припущення

- Початкова команда користувача авторизує migration task, але не замінює окремий approval exact `FIX-001`, якого тоді ще не існувало.
- Попередні 91 tasks є frozen `done`; batch conversion не потрібна.

## Зміни від попереднього run

- Попередній run: legacy source-format `runs/RUN-001`.
- Причина нового run: target 0.5 вимагає universal root-level run і approved fixation.
- Змінені вимоги: canonical changes переходять у двоетапний fixation/finalization flow.
- Оновлений контекст: inventory, rollback і classification завершені.
- Очікуване виправлення: audited exact proposal і контрольований cutover.
