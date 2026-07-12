# Project Agent Rules

Цей файл містить project-specific адаптації `memory/reglament/agents.md` для `@sagifire/ioc`.

## Поточні адаптації

- Для документів Project Memory використовувати UTF-8 за замовчуванням.
- Перед active run прочитати root `AGENTS.md`; architecture, package, implementation, testing і code-style boundaries у ньому обов'язкові.
- Реалізовувати staged roadmap послідовно й не переходити до наступної стадії без acceptance criteria поточної.
- Не робити широкі refactor або зміни поза task scope.
- Після code changes запускати релевантні build, test, typecheck і lint checks, якщо вони доступні.
- Якщо потрібна мережева інсталяція залежностей, запросити дозвіл, а не обходити обмеження.

## Правило оновлення

- Додавати тільки правила, специфічні для `@sagifire/ioc`.
- Не дублювати operational rules або technical architecture body.
- Змістові зміни цього файла готувати через `FIX-*`.
