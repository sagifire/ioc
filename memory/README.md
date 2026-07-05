# Project Memory

Starter Kit Version: 3.0
PDADM MVP Version: 0.3

Це стартова Project Memory для нового або вже існуючого проекту.

Цей Starter Kit не описує Product Driven AI Development Methodology як продукт вашого проекту. Усі стартові product/domain/technical файли є placeholders і мають бути адаптовані під реальний проект.

## Призначення

Project Memory є центральним джерелом істини для:

- продуктового контексту;
- доменної моделі;
- технічних рішень;
- задач і execution artifacts;
- reusable knowledge packages;
- правил роботи людини й агентів.

## Як починати роботу

1. Агент починає з `memory/agent-start.md`.
2. Людина або агент оновлює `memory/state.md`, коли змінюється поточний фокус.
3. Перед змінами пам'яті читати `memory/memory-rules.md`.
4. Для задач використовувати `memory/tasks/plan/` і `memory/tasks/plan/progress.md`.
5. Для reusable знань перевіряти `memory/knowledge/package-index.md`, якщо задача цього потребує.
6. При зміні структури пам'яті оновлювати відповідні `index.md`.
7. Перед завершенням роботи агента виконувати self-review і передавати задачу в `review`, а не в `done`.
8. Перед фіксацією змін у пам'ять перевіряти вплив на документи загального рівня.

## Головні точки входу

- `memory/agent-start.md` - startup protocol для агентів.
- `memory/memory-rules.md` - правила роботи з пам'яттю.
- `memory/state.md` - короткий актуальний стан проекту.
- `memory/tasks/plan/progress.md` - операційний індекс задач.
- `memory/knowledge/` - reusable knowledge packages.
- `memory/agents/` - правила, workflows і prompts для агентів.
