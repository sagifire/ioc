# Пакет контексту: RUN-001

## Обов'язкове читання

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/knowledge/package-index.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/package.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/migrations/from-0.3-to-0.4.md`
- `memory/tasks/plan/TASK-07.06-0091-memory-mvp-0-4-migration/task.md`
- `memory/tasks/plan/TASK-07.06-0091-memory-mvp-0-4-migration/runs/RUN-001/requirements.md`

## Релевантний продуктовий контекст

Project Memory є operational source of truth для `@sagifire/ioc`; міграція регламенту не має змінювати API, roadmap scope або release state бібліотеки.

## Релевантний доменний контекст

Домен бібліотеки не змінюється. Нові регламентні поняття MVP 0.4 належать process memory, а не runtime domain `@sagifire/ioc`, якщо окремо не буде вирішено інакше.

## Релевантний технічний контекст

Міграція має додати architecture health guidance як процесну перевірку для future implementation/research/design work, але не змінювати поточні package boundaries чи staged implementation rules.

## Релевантні пакети знань

- `memory/knowledge/packages/pdadm-mvp-reglament/`

## Файли або модулі для перевірки

- `.tmp/memory_mvp_0.4.ua.zip`
- `.tmp/memory_mvp_0_4_ref/`
- `memory/**/*.md`
- `AGENTS.md`

## Відомі ризики

- Ретроактивне переписування completed task artifacts може пошкодити audit trail.
- Механічне копіювання starter files може стерти project-specific зміст, якщо застосувати його до product/domain/technical/task history.
- Не всі old task-local `index.md` можна й треба приводити до MVP 0.4 формату в межах цієї міграції.

## Припущення

- Користувач уже оновив `pdadm-mvp-reglament` package до MVP 0.4.
- `.tmp/memory_mvp_0.4.ua.zip` містить Starter Kit MVP 0.4 і може використовуватись як reference.
