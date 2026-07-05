# Memory Rules

Starter Kit Version: 3.0
PDADM MVP Version: 0.3

Це головний файл правил роботи з `memory/`.

## Правило мови

Канонічна мова цієї Project Memory - українська.

- Усі канонічні файли пам'яті, wiki indexes, задачі, execution artifacts, knowledge packages і нотатки ведуться українською.
- Назви файлів, API, команди, цитати, зовнішні терміни й вихідні документи можна залишати мовою джерела.
- Якщо джерело не українською, для reusable knowledge треба додавати український короткий опис або інструкцію використання.

## Startup rules

1. Кожна агентська сесія повинна мати явну `Agent Role`.
2. На старті агент читає `memory/agent-start.md` і відповідний boot packet.
3. Після boot packet агент зупиняє startup reading і переходить до задачі.
4. Повний `pdadm-mvp-reglament` не читається на старті звичайної сесії без явної потреби.
5. Якщо роль не вказана, агент працює як `Agent Assistant` у режимі clarification і не змінює canonical memory або код без уточнення.
6. `Execution Mode` є властивістю задачі в `task.md`, а не режимом запуску сесії.
7. Якщо задача вказана, агент визначає workflow за `task.md`, task context і правилами регламенту.

## Task rules

1. Кожна задача має `task.md`.
2. Кожна задача має `Type` і `Execution Mode`.
3. Усі неархівні задачі живуть у `tasks/plan/`.
4. Статуси задач фіксуються в `task.md` і `memory/tasks/plan/progress.md`.
5. Допустимі статуси задачі: `backlog`, `active`, `review`, `blocked`, `canceled`, `done`.
6. `archive` не є статусом задачі, а лише фізичним місцем для задач, які більше не потрібні в операційній навігації.
7. Task folder не переноситься між `backlog`, `active`, `review`, `blocked`, `canceled` і `done`.
8. Агент не може самостійно переводити задачу в `done`.
9. Після завершення своєї роботи агент виконує self-review, переводить задачу в `review` і просить task-level human review decision.
10. `done` можливий тільки зі статусу `review` після явного human approval.
11. Погодження варіанта, проміжного рішення, плану або fixation proposal не є human review approval задачі.
12. Якщо робота припиняється без human review або без прийняття результату, задача переводиться в `canceled`, а не в `done`.
13. `autonomous-implementation` не починається без task folder і task run, крім явно дозволеної дрібної правки.
14. Кожен autonomous implementation run має власні `requirements.md`, `context.md`, `result.md`.
15. `autonomous-research` не завершується без `research/RSCH-*.md`.
16. Якщо research пропонує фіксацію в Project Memory, вона оформлюється через `fixations/FIX-*.md` і застосовується тільки після human approval.
17. `interactive-memory-update` не змінює Project Memory без `fixations/FIX-*.md` і self-review.
18. Старі run, research або fixation files не переписуються так, ніби попередньої спроби або проблеми не було.

## Domain rules

1. Поточний доменний стан фіксується в `domain/current/`.
2. Цільовий або бажаний доменний стан фіксується в `domain/target/`.
3. Поточний і цільовий стан не змішуються.
4. Декомпозицію доменних документів визначає людина разом з Agent Assistant.

## Wiki index rules

1. Кожна папка Project Memory повинна мати `index.md`.
2. `index.md` описує тільки прямі дочірні папки й файли.
3. Після створення, видалення, перейменування або зміни призначення файлу чи папки треба оновити відповідний `index.md`.
4. Якщо зміна зачіпає кілька рівнів, оновлюються всі релевантні індекси.
5. `index.md`, `package-index.md` і `tasks/plan/progress.md` використовують списки з wiki-посиланнями, а не таблиці.
6. Для дочірньої папки посилання веде на її `index.md`.
7. `index.md` і `tasks/plan/progress.md` не містять секцію `Notes`, локальні правила або agent notes.

## Knowledge rules

1. Перед задачами, де можуть знадобитися reusable knowledge, агент перевіряє `memory/knowledge/package-index.md`.
2. Knowledge package повинен мати `package.md`.
3. `knowledge/packages/pdadm-mvp-reglament/` є reference layer регламенту, а не startup layer.
4. Агент може створювати draft пакета, додавати приклади, уточнення й changelog notes.
5. Агент не повинен без явної інструкції масово переписувати core rules, змінювати статус пакета або видаляти приклади.

## Historical source reference rules

1. Історичні source reference snapshots живуть у `memory/sources/`.
2. Source snapshots не є operational source of truth після перенесення в canonical Project Memory.
3. Source snapshots не можна редагувати в реалізаційних, research або memory-update задачах.
4. Якщо source document потребує зміни, треба оновити canonical memory або створити новий source snapshot через окрему human-reviewed задачу.
5. `memory/sources/SPEC.md` є historical immutable snapshot початкового `SPEC.md`.
6. Для реалізації `@sagifire/ioc` використовувати canonical files у `memory/product/`, `memory/domain/` і `memory/technical/`, а не редагувати `memory/sources/SPEC.md`.

## Memory sync rules

Після autonomous implementation run у `result.md` треба зафіксувати:

- чи змінювалась product memory;
- чи змінювалась domain memory;
- чи змінювалась technical memory;
- чи змінювалась knowledge memory;
- чи оновлені task memory і wiki indexes;
- чи потрібно оновити `memory/state.md`;
- чи перевірено документи загального рівня;
- чи потрібна follow-up task.

Після autonomous research результат фіксується у `research/RSCH-*.md`.

Після interactive або research-driven memory fixation memory sync фіксується у `fixations/FIX-*.md`.

Документи загального рівня включають `state.md`, top-level `README.md` і `index.md`, загальні product/domain/technical документи, `knowledge/package-index.md`, relevant package indexes і `tasks/plan/progress.md`, якщо зміна впливає на задачі.

Для документів загального рівня агент фіксує один зі станів: `updated`, `not needed`, `proposed` або `blocked`.

Не можна подавати `result.md`, `RSCH-*` або `FIX-*` як review-ready, якщо вплив на документи загального рівня не перевірений.

## Заборонені дії для агентів

- Починати роботу без явної ролі.
- Продовжувати startup reading після boot packet без явної причини.
- Починати `autonomous-implementation` без task run.
- Закривати задачу як `done` без task-level human review approval.
- Вважати погодження проміжного рішення approval всієї задачі.
- Змінювати Project Memory у `interactive-memory-update` без fixation package.
- Застосовувати research-driven memory proposal без human approval.
- Подавати memory fixation як review-ready без upward consistency check.
- Змішувати `domain/current/` і `domain/target/`.
- Редагувати historical source reference snapshots у `memory/sources/` без окремої human-reviewed задачі на новий snapshot або source migration.
- Масово переписувати великі memory documents без явної інструкції.
- Ігнорувати out-of-scope обмеження задачі.
- Міняти структуру пам'яті без оновлення індексів.
