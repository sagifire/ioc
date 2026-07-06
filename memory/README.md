# Project Memory

Starter Kit Version: 4.0
PDADM MVP Version: 0.4

Це Project Memory для `@sagifire/ioc`.

Project Memory є operational source of truth для продуктового контексту, доменної моделі,
технічних рішень, задач, reusable knowledge packages і правил роботи агентів.

## Призначення

Project Memory є центральним джерелом істини для:

- продуктового контексту;
- доменної моделі;
- технічних рішень;
- задач і execution artifacts;
- research reports, audit reports і periodic reports;
- reusable knowledge packages;
- правил роботи людини й агентів.

## Як почати людині

1. Прочитати `memory/human-start.md`, якщо регламент ще не знайомий.
2. Подивитися `memory/state.md`, щоб зрозуміти поточний фокус проекту.
3. Якщо треба змінити код, пам'ять або документи проекту, спочатку створити або уточнити
   задачу в `memory/tasks/plan/`.
4. Після роботи агента переглянути self-review, risks, follow-up tasks і явно прийняти,
   відхилити або повернути результат на доопрацювання.

## Як почати агенту

1. Агент починає з `memory/agent-start.md`.
2. Якщо роль або задача не задані, агент працює як `Agent Assistant` у режимі
   `Methodology Navigator`.
3. Перед змінами пам'яті читати `memory/memory-rules.md`.
4. Для задач використовувати `memory/tasks/plan/` і `memory/tasks/plan/progress.md`.
5. Для reusable знань перевіряти `memory/knowledge/package-index.md`, якщо задача цього
   потребує.
6. Для `autonomous-research` створювати task-local `research/RSCH-*.md` і деталізований
   звіт у `memory/reports/research/`.
7. При зміні структури пам'яті оновлювати відповідні `index.md`.
8. Перед завершенням роботи агента виконувати self-review і передавати задачу в `review`,
   а не в `done`.
9. Перед фіксацією змін у пам'ять перевіряти вплив на документи загального рівня.

## Головні точки входу

- `memory/human-start.md` - короткий старт для людини, яка ще не знає регламент.
- `memory/agent-start.md` - startup protocol для агентів.
- `memory/memory-rules.md` - правила роботи з пам'яттю.
- `memory/state.md` - короткий актуальний стан проекту.
- `memory/tasks/plan/progress.md` - операційний індекс задач.
- `memory/reports/` - periodic reports, research reports і audit reports.
- `memory/knowledge/` - reusable knowledge packages.
- `memory/agents/` - правила, workflows і prompts для агентів.
