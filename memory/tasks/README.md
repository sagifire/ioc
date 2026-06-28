# Task Memory

Задачі є частиною Project Memory і основним джерелом істини для виконання робіт.

## Statuses

- `backlog`
- `active`
- `review`
- `blocked`
- `canceled`
- `done`

`archive` не є статусом задачі. Це фізична папка для задач, які більше не потрібні в операційній навігації.

## Task Folder

Усі неархівні задачі живуть у `tasks/plan/`.

```text
tasks/plan/TASK-MM.YY-NNNN-short-name/
  index.md
  task.md
  runs/                  # для autonomous-implementation
  research/              # для autonomous-research
  worklog.md             # для interactive-memory-update
  fixations/             # для interactive-memory-update або research-driven memory proposal
  closure.md
```

## Rules

- Task folder не переноситься між `backlog`, `active`, `review`, `blocked`, `canceled` і `done`.
- Статус задачі змінюється в `task.md` і `tasks/plan/progress.md`.
- Агент не переводить задачу в `done` самостійно.
- Після завершення роботи агент виконує self-review і переводить задачу в `review`.
- `done` можливий тільки зі статусу `review` після явного task-level human review approval.
- Якщо робота припиняється без прийнятого review, задача переходить у `canceled`.
- Не починати `autonomous-implementation` без task folder і task run.
- Кожен autonomous run має власні `requirements.md`, `context.md`, `result.md`.
- Для `autonomous-research` потрібен `research/RSCH-*.md`.
- Research-driven memory proposal оформлюється через `fixations/FIX-*.md` і не застосовується без human approval.
- Для `interactive-memory-update` перед змінами Project Memory потрібен `fixations/FIX-*.md` із self-review.
- Попередні runs і fixations не переписуються для приховування помилок або змін вимог.
- Після autonomous run треба виконати memory sync і зафіксувати його в `result.md`.
- Після autonomous research треба зафіксувати результат у `RSCH-*`.
- Після interactive або research-driven fixation треба виконати memory sync і зафіксувати його в `FIX-*.md`.
- Перед review треба перевірити вплив на документи загального рівня.
