# TASK-07.06-0091: Memory MVP 0.4 migration

Status: done
Type: memory-migration
Execution Mode: autonomous-implementation
Created: 2026-07-06
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Мігрувати існуючу Project Memory `@sagifire/ioc` з PDADM MVP 0.3 / Starter Kit 3.0 на PDADM MVP 0.4 / Starter Kit 4.0 без втрати project-specific змісту.

## Продуктовий контекст

Project Memory є operational source of truth для продуктового, доменного, технічного і task context бібліотеки `@sagifire/ioc`. Регламент MVP 0.4 додає task boundary rule, Methodology Navigator, reports structure, one-line indexes, посилений self-review і architecture health guidance.

## Обсяг

- Оновити version markers до `Starter Kit Version: 4.0` і `PDADM MVP Version: 0.4`.
- Оновити starter-level rules, workflows, prompts, human/agent start entrypoints і templates.
- Додати reports structure для `reports/research/` і `reports/audits/`.
- Перевести актуальні starter-level indexes, `knowledge/package-index.md` і `tasks/plan/progress.md` на one-line format.
- Синхронізувати `knowledge/packages/pdadm-mvp-reglament/` package index/version з MVP 0.4.
- Додати architecture health guidance у technical memory без зміни продуктового runtime scope.
- Оновити `AGENTS.md` version marker.
- Зафіксувати результат міграції в `RUN-001/result.md`.

## Поза обсягом

- Переписування завершених task folders, `RUN-*`, `RSCH-*`, `FIX-*`, `result.md` або historical task artifacts заради нового формату.
- Зміна коду бібліотеки або runtime behavior.
- Редагування `memory/sources/*` historical source snapshots.
- Масова зміна product/domain/technical змісту, який описує фактичний стан `@sagifire/ioc`.
- Розпаковування Starter Kit поверх існуючої `memory/`.

## Критерії приймання

- [x] Version markers показують Starter Kit 4.0 / PDADM MVP 0.4.
- [x] `knowledge/package-index.md` вказує `pdadm-mvp-reglament` version 4.0.
- [x] `mvp_one_to_one_0.4.md` і `migrations/from-0.3-to-0.4.md` доступні через package indexes.
- [x] `reports/research/index.md` і `reports/audits/index.md` існують.
- [x] Starter-level `index.md`, `knowledge/package-index.md` і `tasks/plan/progress.md` використовують one-line entries.
- [x] Task template містить `planning` і `design`.
- [x] `autonomous-research` вимагає `reports/research/**`.
- [x] Self-review templates мають independent audit fields і деталізовані питання.
- [x] Prompts і rules містять Methodology Navigator, task boundary, language gate і architecture pressure guidance.
- [x] Завершені task folders не редагувались без окремої причини.
- [x] Project-specific product/domain/technical зміст не втрачено.

## Пов'язана пам'ять

- `memory/knowledge/packages/pdadm-mvp-reglament/package.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/migrations/from-0.3-to-0.4.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/mvp_one_to_one_0.4.md`
- `.tmp/memory_mvp_0.4.ua.zip`
- `AGENTS.md`

## Прогони

- [RUN-001](runs/RUN-001/index.md) - approved - Міграція з MVP 0.3 на MVP 0.4; знахідки аудиту закриті, human review approval отримано.

## Дослідження

Немає.

## Фіксації

Немає. Memory sync для migration run фіксується у `runs/RUN-001/result.md`.
