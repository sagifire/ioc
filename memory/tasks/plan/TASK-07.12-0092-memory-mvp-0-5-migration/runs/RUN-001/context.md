# Пакет контексту: RUN-001

## Обов'язкове читання

- `memory/agent-start.md`
- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/knowledge/package-index.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/package.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/migration-from-0.4-to-0.5.md`
- `memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/task.md`
- `memory/tasks/plan/TASK-07.12-0092-memory-mvp-0-5-migration/runs/RUN-001/requirements.md`

## Релевантний контекст

Project Memory є operational source of truth для `@sagifire/ioc`. Міграція process model не змінює продуктову, доменну чи runtime архітектуру бібліотеки.

## Reference і rollback

- StarterKit reference: `.tmp/memory_mvp_0.5.ua.zip`.
- Verified rollback: `.tmp/memory-before-mvp-0.5-migration-2026-07-12.zip`.
- Backup verification: 661 archive entries; `memory/product/vision.md` присутній; archive size 913186 bytes.

## Відомі ризики

- Механічне копіювання StarterKit може стерти project-specific content.
- Видалення legacy rules до класифікації може втратити project adaptations.
- Global replacement `Execution Mode` пошкодить frozen history.
- Зміна старих task artifacts порушить audit trail.

## Припущення

- User-owned changes у `pdadm-mvp-reglament` є authoritative target knowledge package і мають бути збережені.
- Усі попередні 91 task folders мають статус `done`; незавершених legacy tasks до цієї migration task немає.
