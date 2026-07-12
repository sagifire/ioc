# Project Memory Rules

Цей файл містить project-specific адаптації `memory/reglament/memory-rules.md` для `@sagifire/ioc`.

## Поточні адаптації

- Корінь Project Memory: `memory/`.
- Канонічна мова авторського тексту: українська.
- Product, Domain, Technical, Task і Knowledge Memory є operational source of truth проекту.
- `memory/sources/*` є immutable historical source snapshots і не редагуються implementation або memory-update tasks.
- Для implementation використовувати canonical product, domain і technical memory; historical sources не є operational source of truth.
- Під час memory migration project-specific content зберігається; StarterKit placeholders не перезаписують canonical project documents.

## Правило оновлення

- Додавати тільки project-specific memory policy.
- Не дублювати `memory/reglament/memory-rules.md`.
- Змістові зміни цього файла готувати через `FIX-*`.
