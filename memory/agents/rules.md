# Agent Rules

1. Не починати роботу без визначеної `Agent Role`.
2. На старті сесії читати `memory/agent-start.md` і відповідний boot packet.
3. Зупиняти startup reading після boot packet, якщо немає явної причини читати глибше.
4. Не читати повний `pdadm-mvp-reglament` на старті звичайної сесії без потреби.
5. Якщо роль не вказана, перейти в `Agent Assistant` / `clarification`.
6. Якщо задача вказана, читати `task.md` і визначати workflow за task-level `Execution Mode`, а не за session mode.
7. Агент не може самостійно переводити задачу в `done`.
8. Після завершення своєї роботи агент виконує self-review, переводить задачу в `review` і пропонує людині перевірити результат.
9. Переводити задачу в `done` можна тільки зі статусу `review` і тільки після явного task-level human approval.
10. Погодження варіанта, проміжного рішення, плану або дозволу продовжити роботу не є human review approval задачі.
11. Якщо відповідь користувача на review-запит двозначна, уточнювати її перед зміною статусу на `done`.
12. Якщо робота припиняється без human review або без прийняття результату, задача переводиться в `canceled`, а не в `done`.
13. Для задач `autonomous-implementation` читати `task.md`, run `requirements.md`, run `context.md`.
14. Для задач `autonomous-research` читати `task.md`, `research/RSCH-*.md`, релевантну пам'ять і `memory/knowledge/package-index.md`, якщо дослідження може потребувати reusable knowledge.
15. Для задач `interactive-memory-update` вести `worklog.md` і створювати `fixations/FIX-*.md` перед змінами Project Memory.
16. Не виходити за scope.
17. Не змінювати out-of-scope файли без явної потреби й фіксації причини.
18. Не змішувати current і target state.
19. Оновлювати `result.md` після виконання autonomous implementation run.
20. Оновлювати `research/RSCH-*.md` після autonomous research.
21. Оновлювати `FIX-*.md` після interactive або research-driven fixation.
22. Перевіряти потребу в memory sync.
23. Перед пропозицією або застосуванням змін у Project Memory виконувати upward consistency check для документів загального рівня.
24. У `result.md`, `research/RSCH-*.md` або `fixations/FIX-*.md` фіксувати стан документів загального рівня як `updated`, `not needed`, `proposed` або `blocked`.
25. Не подавати memory fixation або research result як review-ready, якщо вплив на документи загального рівня не перевірений.
26. Оновлювати `index.md` при зміні структури пам'яті.
27. В `index.md`, `package-index.md` і `tasks/plan/progress.md` використовувати списки з wiki-посиланнями, а не таблиці.
28. Не додавати локальні правила або секцію `Notes` в `index.md` чи `tasks/plan/progress.md`; правила мають бути в централізованих rules-файлах або knowledge packages.
29. Перевіряти `memory/knowledge/package-index.md`, якщо задача може потребувати reusable knowledge.
30. Не переписувати великі memory documents без явної інструкції.
31. Не редагувати historical source reference snapshots у `memory/sources/` без окремої human-reviewed задачі на новий snapshot або source migration.
32. Для реалізації `@sagifire/ioc` використовувати canonical Project Memory files, а не `memory/sources/SPEC.md` як operational source of truth.
